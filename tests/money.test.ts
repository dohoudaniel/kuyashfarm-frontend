/**
 * Money formatting.
 *
 * The API sends money as exact decimal strings ("7500.00") precisely because a
 * float cannot represent ₦0.10. `formatPrice` is display-only and must never
 * become a place where arithmetic creeps in — these tests pin the string
 * contract and the failure behaviour.
 */

import { describe, expect, it } from "vitest";

import { formatPrice } from "@/lib/utils";

/** Intl inserts a non-breaking space; comparing raw strings is brittle. */
function normalise(value: string): string {
  return value.replace(/ /g, " ");
}

describe("formatPrice", () => {
  it("formats a decimal string from the API without losing precision", () => {
    expect(normalise(formatPrice("7500.00"))).toContain("7,500.00");
    expect(normalise(formatPrice("375000.50"))).toContain("375,000.50");
  });

  it("accepts a number as well as a string", () => {
    expect(normalise(formatPrice(25000))).toContain("25,000.00");
  });

  it("always shows two decimal places", () => {
    expect(normalise(formatPrice("100"))).toContain("100.00");
  });

  it("renders in Naira", () => {
    expect(formatPrice("1000.00")).toMatch(/₦|NGN/);
  });

  it("shows a dash rather than NaN when handed nonsense", () => {
    // A component rendering "₦NaN" next to a Buy button is worse than a dash.
    expect(formatPrice("not a number")).toBe("—");
  });

  it("handles zero, which free academy classes rely on", () => {
    expect(normalise(formatPrice("0.00"))).toContain("0.00");
  });
});
