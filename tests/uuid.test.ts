import { afterEach, describe, expect, it, vi } from "vitest";

import { randomUUID } from "@/lib/uuid";

/**
 * The fallback path is the whole point of this module, and it is the path that
 * never runs in CI — the test environment and `localhost` are both secure
 * contexts, so `crypto.randomUUID` is always there. Without deliberately
 * removing it, these tests would pass while the fallback was broken, which is
 * exactly how the bug reached a browser in the first place.
 */

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Hide `crypto.randomUUID` the way an insecure context does: undefined. */
function withoutRandomUUID<T>(body: () => T): T {
  const original = Object.getOwnPropertyDescriptor(globalThis.crypto, "randomUUID");
  Object.defineProperty(globalThis.crypto, "randomUUID", {
    value: undefined,
    configurable: true,
    writable: true,
  });
  try {
    return body();
  } finally {
    if (original) Object.defineProperty(globalThis.crypto, "randomUUID", original);
    else delete (globalThis.crypto as { randomUUID?: unknown }).randomUUID;
  }
}

afterEach(() => vi.restoreAllMocks());

describe("randomUUID", () => {
  it("uses the native implementation when it exists", () => {
    const native = vi.spyOn(globalThis.crypto, "randomUUID");
    expect(randomUUID()).toMatch(V4);
    expect(native).toHaveBeenCalledOnce();
  });

  it("still returns a well-formed v4 UUID in an insecure context", () => {
    // Serving over plain HTTP from anything other than localhost — an IP
    // address, a LAN hostname, a staging box — takes `randomUUID` away.
    withoutRandomUUID(() => {
      expect(randomUUID()).toMatch(V4);
    });
  });

  it("does not repeat itself", () => {
    // A repeated cart session id hands one basket to two visitors; a repeated
    // idempotency key makes a genuine second order return the first.
    withoutRandomUUID(() => {
      const seen = new Set(Array.from({ length: 1000 }, () => randomUUID()));
      expect(seen.size).toBe(1000);
    });
  });

  it("draws from the CSPRNG, not Math.random", () => {
    const entropy = vi.spyOn(globalThis.crypto, "getRandomValues");
    const insecure = vi.spyOn(Math, "random");

    withoutRandomUUID(() => randomUUID());

    expect(entropy).toHaveBeenCalled();
    expect(insecure).not.toHaveBeenCalled();
  });

  it("throws rather than issue a guessable id with no entropy source", () => {
    // Predictable output here is a basket-hijacking hole, so an environment
    // this broken has to fail loudly instead of degrading quietly.
    withoutRandomUUID(() => {
      const entropy = vi
        .spyOn(globalThis.crypto, "getRandomValues")
        .mockImplementation(() => {
          throw new Error("should not be reached");
        });
      Object.defineProperty(globalThis.crypto, "getRandomValues", {
        value: undefined,
        configurable: true,
        writable: true,
      });

      expect(() => randomUUID()).toThrow(/random source/i);

      entropy.mockRestore();
    });
  });
});
