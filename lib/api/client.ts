/**
 * HTTP client for the Kuyash Farms API.
 *
 * Rewritten because the previous version could never have worked. It called
 * `/auth/login` while the API serves `/auth/login/`, and Django cannot redirect
 * a POST to add a slash without discarding the body — so every authenticated
 * request returned 500. It also read `data.accessToken` while the server sends
 * `access_token`, so the token was always `undefined`.
 *
 * Three deliberate choices:
 *
 * 1. **The access token lives in memory, not localStorage.** localStorage is
 *    readable by any script on the origin, so an XSS could previously steal a
 *    token that outlives the page. Now the only long-lived credential is the
 *    refresh token, which sits in an HttpOnly cookie JavaScript cannot read.
 *    The cost is one `/auth/refresh/` round-trip on page load; the benefit is
 *    that a stolen token dies with the tab.
 *
 * 2. **Refreshes are single-flight.** Ten parallel requests hitting 401 at once
 *    trigger one refresh, not ten. Without this, concurrent refreshes race and
 *    rotation blacklists the winner's token — signing the user out at random.
 *
 * 3. **Trailing slashes are enforced.** A missing slash is a 500, not a 404, so
 *    it is easy to misdiagnose. The client normalises rather than trusting
 *    every call site to remember.
 */

import type { ApiEnvelope } from "./types";

/**
 * Where the API lives.
 *
 * There is deliberately no production fallback. A silent default to localhost
 * means a misconfigured deployment builds and boots happily, then fails on the
 * first request in front of a customer — with a browser console error nobody
 * is watching. Failing at build time instead turns a silent outage into a
 * loud, obvious misconfiguration.
 *
 * Development keeps the convenience default, because there the localhost guess
 * is almost always right and the cost of being wrong is a page refresh.
 */
function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configured) {
    /**
     * `0.0.0.0` is a *bind* address, never a destination.
     *
     * It means "listen on every interface" to a server — `make run` uses it for
     * exactly that reason — and it is a natural thing to copy into here after
     * reading it in the backend's startup banner. But no client can connect to
     * it: it is not routable, and a browser given it simply fails.
     *
     * Caught explicitly because the symptom is so misleading. The Content
     * Security Policy is built from this same value at build time, so the
     * browser blocks the request at the CSP layer first and reports
     * "Refused to connect ... violates the document's Content Security Policy"
     * — which reads as a policy bug, sends you into next.config.ts, and says
     * nothing about the address being unusable. Better to refuse it here, by
     * name, with the fix in the message.
     */
    try {
      if (new URL(configured).hostname === "0.0.0.0") {
        throw new Error(
          "NEXT_PUBLIC_API_URL is set to 0.0.0.0, which is a bind address and " +
            "cannot be connected to. Use the address the browser should reach " +
            "the API on — http://localhost:8000/api/v1, or this machine's IP " +
            "(`hostname -I`) when the browser is on another host, as under WSL. " +
            "The server may still *bind* 0.0.0.0; that is a separate setting.",
        );
      }
    } catch (error) {
      // Rethrow our own diagnosis; a malformed URL falls through to the
      // existing behaviour rather than being reported as this problem.
      if (error instanceof Error && error.message.includes("bind address")) throw error;
    }

    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. It must be defined at build time — " +
        "Next.js inlines NEXT_PUBLIC_* variables, so setting it only at runtime " +
        "has no effect.",
    );
  }

  return "http://localhost:8000/api/v1";
}

const API_BASE_URL = resolveApiBaseUrl();

/** A request that reached the server and came back with an error envelope. */
/**
 * Response header carrying the unread-notification count.
 *
 * Must be listed in the API's `CORS_EXPOSE_HEADERS` or the browser hides it
 * from JavaScript on any cross-origin deployment — the server sends it, curl
 * sees it, and only the real frontend does not.
 */
const UNREAD_HEADER = "X-Unread-Notifications";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /** First message for a field, for rendering next to an input. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }
}

/** The request never reached the server. Worth distinguishing when retrying. */
export class NetworkError extends Error {
  constructor(message = "Could not reach the server. Check your connection.") {
    super(message);
    this.name = "NetworkError";
  }
}

type Json = Record<string, unknown> | unknown[] | null;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: Json;
  /** Extra headers, e.g. Idempotency-Key. */
  headers?: Record<string, string>;
  /** Skip the 401-refresh-retry. Used by the refresh call itself. */
  skipRefresh?: boolean;
}

// Exported so tests can construct an isolated instance; application code
// should use the `apiClient` singleton below, never a second client.
export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshInFlight: Promise<boolean> | null = null;
  private onUnauthenticated: (() => void) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Called with the unread-notification count whenever a response carries one.
   * Set by the notification bell; a plain callback rather than a store import
   * because `lib/api` must not depend on React.
   */
  onUnreadCount?: (count: number) => void;

  /** Lets AuthContext clear its state when a refresh finally fails. */
  setUnauthenticatedHandler(handler: (() => void) | null): void {
    this.onUnauthenticated = handler;
  }

  /**
   * Django serves every route with a trailing slash. Without one a POST hits
   * APPEND_SLASH, which cannot redirect a body-carrying request and 500s.
   */
  private buildUrl(path: string): string {
    const [pathname, query] = path.split("?");
    const normalised = pathname.endsWith("/") ? pathname : `${pathname}/`;
    return `${this.baseUrl}${normalised}${query ? `?${query}` : ""}`;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, skipRefresh = false } = options;

    const requestHeaders: Record<string, string> = { ...headers };
    if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
    if (this.accessToken) requestHeaders["Authorization"] = `Bearer ${this.accessToken}`;

    let response: Response;
    try {
      response = await fetch(this.buildUrl(path), {
        method,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
        // Sends the HttpOnly refresh cookie. Required for /auth/refresh/.
        credentials: "include",
      });
    } catch {
      throw new NetworkError();
    }

    this.readUnreadCount(response);

    if (response.status === 401 && !skipRefresh) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(path, { ...options, skipRefresh: true });
      }
      this.accessToken = null;
      this.onUnauthenticated?.();
    }

    return this.unwrap<T>(response);
  }

  /**
   * Pick the unread-notification count off any authenticated response.
   *
   * The bell used to poll for this every thirty seconds. At 5,000 concurrent
   * users that is 167 requests a second against a backend that serves 8 at a
   * time — about 40% of total capacity spent on a number that is almost always
   * zero. It now rides along on requests the app already makes, so the badge
   * costs nothing and updates as the user navigates, which is when they look
   * at it anyway.
   *
   * Absent header means "no news", not "zero": an anonymous response never
   * carries one, and neither does a response the middleware could not compute.
   * Overwriting the count with 0 in those cases would blank a badge that is
   * legitimately lit.
   */
  private readUnreadCount(response: Response): void {
    // Guarded rather than assumed. This method's entire contract is that it is
    // free and invisible — it must never be the reason a request fails. A
    // response without readable headers simply carries no news.
    const raw = response.headers?.get?.(UNREAD_HEADER);
    if (raw === null || raw === undefined) return;

    const value = Number.parseInt(raw, 10);
    if (Number.isNaN(value) || value < 0) return;

    this.onUnreadCount?.(value);
  }

  private async unwrap<T>(response: Response): Promise<T> {
    if (response.status === 204) return undefined as T;

    let envelope: ApiEnvelope<T>;
    try {
      envelope = (await response.json()) as ApiEnvelope<T>;
    } catch {
      throw new ApiError(
        response.ok
          ? "The server returned an unreadable response."
          : `Request failed (${response.status}).`,
        response.status,
      );
    }

    if (!response.ok || envelope.success === false) {
      throw new ApiError(
        envelope.message || `Request failed (${response.status}).`,
        response.status,
        collectFieldErrors(envelope),
      );
    }

    return envelope.data;
  }

  /**
   * Exchange the refresh cookie for a new access token.
   *
   * Single-flight: concurrent callers await the same promise. Rotation
   * blacklists a refresh token on use, so two simultaneous refreshes would
   * invalidate each other and sign the user out unpredictably.
   */
  private refreshAccessToken(): Promise<boolean> {
    if (this.refreshInFlight) return this.refreshInFlight;

    // Nothing to exchange. The server sets a readable `kuyash_session` cookie
    // beside the HttpOnly refresh cookie precisely so this can be known
    // without asking; its absence means an attempt would be a guaranteed 401.
    // Skipping it is the difference between an anonymous page load costing two
    // round trips and costing none.
    if (!hasSessionHint()) {
      this.accessToken = null;
      return Promise.resolve(false);
    }

    this.refreshInFlight = (async () => {
      try {
        const data = await this.request<{ access_token: string }>("/auth/refresh/", {
          method: "POST",
          skipRefresh: true,
        });
        this.accessToken = data.access_token;
        return true;
      } catch {
        this.accessToken = null;
        return false;
      } finally {
        // Cleared on the next tick so every awaiting caller sees the same
        // result before a fresh refresh can begin.
        setTimeout(() => {
          this.refreshInFlight = null;
        }, 0);
      }
    })();

    return this.refreshInFlight;
  }

  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: Json, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  patch<T>(
    path: string,
    body?: Json,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  /**
   * POST a file upload.
   *
   * Kept apart from `post` because multipart cannot go through the JSON path:
   * `JSON.stringify(formData)` yields `{}`, and setting `Content-Type`
   * ourselves omits the boundary the browser generates, so the server sees an
   * unparseable body. It still refreshes on 401 like every other call.
   */
  async postForm<T>(path: string, body: FormData, retrying = false): Promise<T> {
    const headers: Record<string, string> = {};
    if (this.accessToken) headers["Authorization"] = `Bearer ${this.accessToken}`;

    let response: Response;
    try {
      response = await fetch(this.buildUrl(path), {
        method: "POST",
        headers,
        body,
        credentials: "include",
      });
    } catch {
      throw new NetworkError();
    }

    if (response.status === 401 && !retrying) {
      if (await this.refreshAccessToken()) {
        return this.postForm<T>(path, body, true);
      }
      this.accessToken = null;
      this.onUnauthenticated?.();
    }

    return this.unwrap<T>(response);
  }
}

function collectFieldErrors(envelope: ApiEnvelope<unknown>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const entry of envelope.errors ?? []) {
    if (typeof entry?.field === "string" && Array.isArray(entry.messages)) {
      result[entry.field] = entry.messages.map(String);
    }
  }
  return result;
}

export const apiClient = new ApiClient(API_BASE_URL);

/**
 * Fetch public data from a Server Component.
 *
 * Deliberately separate from `apiClient`: that singleton holds a token in
 * module scope, and on the server module scope is shared across every
 * concurrent request. Using it for user data would leak one visitor's session
 * into another visitor's page. This helper sends no credentials and is for
 * public data only.
 */
export async function fetchPublic<T>(
  path: string,
  init?: { revalidate?: number; tags?: string[]; offlineFallback?: T },
): Promise<T> {
  const base = API_BASE_URL.replace(/\/$/, "");
  const [pathname, query] = path.split("?");
  const normalised = pathname.endsWith("/") ? pathname : `${pathname}/`;

  let response: Response;
  try {
    response = await fetch(`${base}${normalised}${query ? `?${query}` : ""}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: init?.revalidate ?? 60, tags: init?.tags },
    });
  } catch (error) {
    // CI builds the app with no API reachable, to check that it compiles and
    // renders — not to check the data. `NEXT_PRERENDER_OFFLINE` lets those
    // pages prerender empty instead of failing the build.
    //
    // It is deliberately narrow: it applies only when the caller supplied a
    // fallback, only when the request could not be made at all, and only when
    // the variable is set — which it never is in a real deployment, where an
    // unreachable API *should* stop the release rather than quietly shipping an
    // empty shop.
    if (process.env.NEXT_PRERENDER_OFFLINE && init && "offlineFallback" in init) {
      return init.offlineFallback as T;
    }
    throw error;
  }

  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status}).`, response.status);
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

export default apiClient;

/**
 * Does this browser hold a session worth trying to restore?
 *
 * Reads `kuyash_session`, the readable companion the server sets beside the
 * HttpOnly refresh cookie. It contains the literal "1" — no token, no
 * identity, no claim — so this answers exactly one question: is a refresh
 * attempt worth a round trip?
 *
 * **It is a hint, never a decision.** Nothing is authorised on the strength of
 * it. A forged one costs an attacker a wasted 401; a missing one costs a
 * signed-in user nothing, because any subsequent 401 from a real request still
 * triggers the normal refresh path. Treating it as proof of anything would be
 * the mistake — HttpOnly exists so that script cannot hold credentials, and
 * this deliberately holds none.
 *
 * Server-side it returns false: `document` does not exist, and a Server
 * Component has no business restoring anybody's session anyway.
 */
export function hasSessionHint(): boolean {
  if (typeof document === "undefined") return false;

  // Matched on a cookie boundary rather than with `includes`, so a cookie
  // merely *ending* in the name — `other_kuyash_session` — cannot satisfy it.
  return /(?:^|;\s*)kuyash_session=1(?:;|$)/.test(document.cookie);
}
