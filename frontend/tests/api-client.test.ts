/**
 * The API client.
 *
 * These test the three things that actually broke in production before, not
 * the happy path:
 *
 *  1. **Trailing slashes.** Django's APPEND_SLASH cannot redirect a request
 *     that carries a body, so a POST to `/auth/login` (no slash) 500s. Every
 *     auth call failed this way until it was found by hand.
 *  2. **Envelope unwrapping.** The server always answers
 *     `{success, message, data, errors}`. Returning the envelope instead of
 *     `data` silently hands components the wrong object.
 *  3. **Single-flight refresh.** Refresh tokens rotate and blacklist on use,
 *     so two concurrent refreshes invalidate each other and sign the user out
 *     at random. This is the bug that is impossible to reproduce by hand.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient, ApiError, NetworkError } from "@/lib/api/client";

function envelope(data: unknown, message = "OK") {
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true, message, data, errors: [] }),
  } as unknown as Response;
}

function failure(status: number, message: string, errors: unknown[] = []) {
  return {
    ok: false,
    status,
    json: async () => ({ success: false, message, data: null, errors }),
  } as unknown as Response;
}

describe("URL building", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: ApiClient;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(envelope({}));
    vi.stubGlobal("fetch", fetchMock);
    client = new ApiClient("http://api.test/api/v1");
  });

  it("appends the trailing slash Django requires", async () => {
    await client.post("/auth/login", { email: "a@b.co" });
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/api/v1/auth/login/");
  });

  it("leaves an existing trailing slash alone", async () => {
    await client.get("/auth/me/");
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/api/v1/auth/me/");
  });

  it("puts the slash before the query string, not after it", async () => {
    await client.get("/orders/KF-1?email=buyer%40example.com");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://api.test/api/v1/orders/KF-1/?email=buyer%40example.com",
    );
  });

  it("sends credentials so the HttpOnly refresh cookie travels", async () => {
    await client.get("/auth/me/");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: "include" });
  });
});

describe("response handling", () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient("http://api.test/api/v1");
  });

  it("returns data, not the envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(envelope({ id: "7", email: "a@b.co" })));
    await expect(client.get("/auth/me/")).resolves.toEqual({ id: "7", email: "a@b.co" });
  });

  it("raises ApiError carrying the server's message and status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(failure(400, "Validation failed")));
    await expect(client.post("/auth/register/", {})).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Validation failed",
    });
  });

  it("collects per-field errors so forms can render them inline", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        failure(400, "Validation failed", [
          { field: "email", messages: ["Already registered."] },
          { field: "password", messages: ["Too short.", "Too common."] },
        ]),
      ),
    );

    await expect(client.post("/auth/register/", {})).rejects.toSatisfy((error: unknown) => {
      const apiError = error as ApiError;
      expect(apiError.fieldError("email")).toBe("Already registered.");
      expect(apiError.fieldErrors.password).toHaveLength(2);
      return true;
    });
  });

  it("distinguishes an unreachable server from a rejected request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("failed to fetch")));
    await expect(client.get("/auth/me/")).rejects.toBeInstanceOf(NetworkError);
  });

  it("treats 204 as an empty success rather than unreadable JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => {
          throw new Error("no body");
        },
      } as unknown as Response),
    );
    await expect(client.delete("/auth/addresses/1/")).resolves.toBeUndefined();
  });
});

describe("token refresh", () => {
  it("replays the original request once after a successful refresh", async () => {
    const fetchMock = vi
      .fn()
      // The original call is rejected: the access token has expired.
      .mockResolvedValueOnce(failure(401, "Token expired"))
      .mockResolvedValueOnce(envelope({ access_token: "fresh-token" }))
      .mockResolvedValueOnce(envelope({ id: "7" }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new ApiClient("http://api.test/api/v1");
    await expect(client.get("/auth/me/")).resolves.toEqual({ id: "7" });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe("http://api.test/api/v1/auth/refresh/");
    // The replay carries the new token.
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe("Bearer fresh-token");
  });

  it("does not retry forever when the refresh itself fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(failure(401, "Token expired"));
    vi.stubGlobal("fetch", fetchMock);

    const client = new ApiClient("http://api.test/api/v1");
    const onUnauthenticated = vi.fn();
    client.setUnauthenticatedHandler(onUnauthenticated);

    await expect(client.get("/auth/me/")).rejects.toMatchObject({ status: 401 });
    expect(onUnauthenticated).toHaveBeenCalledOnce();
    // Original + refresh attempt. Not an infinite loop.
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("refreshes once for concurrent 401s, not once per request", async () => {
    // This is the regression that matters: refresh tokens rotate and blacklist
    // on use, so a second concurrent refresh invalidates the first and logs
    // the user out unpredictably.
    let refreshCalls = 0;
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith("/auth/refresh/")) {
        refreshCalls += 1;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return envelope({ access_token: "fresh-token" });
      }
      // Every first-attempt call 401s; the replay carries a token and succeeds.
      return refreshCalls > 0 ? envelope({ ok: true }) : failure(401, "Token expired");
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new ApiClient("http://api.test/api/v1");
    await Promise.all([
      client.get("/orders/"),
      client.get("/cart/"),
      client.get("/auth/me/"),
    ]);

    expect(refreshCalls).toBe(1);
  });
});
