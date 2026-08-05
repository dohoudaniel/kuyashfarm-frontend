/**
 * A v4 UUID that works outside a secure context.
 *
 * `crypto.randomUUID` is only exposed to secure contexts — HTTPS, or a page
 * served from `localhost`. Everywhere else it is simply not defined, and
 * calling it throws `crypto.randomUUID is not a function`.
 *
 * That is not a hypothetical: any deployment reached by IP or hostname over
 * plain HTTP hits it. It bit us on WSL2, where broken localhost forwarding
 * forces the dev server to be reached at `http://<vm-ip>:3000` — `localhost`
 * is a secure context but the identical page at `172.30.80.221` is not. It
 * would bite the same way on a staging box served over HTTP, or a phone
 * testing against a laptop's LAN address. The failure surfaces at the worst
 * moment, too: both callers run on *user action*, so the page renders
 * perfectly and then Add to cart and Place order break.
 *
 * `crypto.getRandomValues`, unlike `randomUUID` and `crypto.subtle`, **is**
 * available in insecure contexts, so the fallback is a real CSPRNG rather than
 * a downgrade. That matters — neither caller can tolerate guessable output:
 *
 * - the cart session id is the only thing authorising access to an anonymous
 *   basket, so a predictable one lets a stranger read and edit it;
 * - the idempotency key is what distinguishes a retry from a new order, so a
 *   collision makes a genuine second order silently return the first.
 *
 * `Math.random` would satisfy both call sites and quietly reintroduce exactly
 * those two holes, which is why there is no last-resort branch here. If
 * `getRandomValues` is missing the environment is too old to trust, and
 * failing loudly beats issuing predictable identifiers.
 */
export function randomUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
    throw new Error(
      "No cryptographic random source available. Refusing to fall back to " +
        "Math.random, which would make cart session ids and idempotency keys " +
        "predictable.",
    );
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // RFC 9562 §5.4: pin the version to 4 and the variant to the OSF layout, so
  // the result is a well-formed v4 UUID rather than 16 arbitrary bytes.
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}
