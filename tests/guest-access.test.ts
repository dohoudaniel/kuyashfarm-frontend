/**
 * Guest ownership across the Paystack round-trip.
 *
 * A guest who pays leaves the site and comes back on a fresh page load with no
 * session. The API refuses to show an order to an anonymous caller unless they
 * supply the email it was placed with — order numbers are guessable — so
 * without this the customer lands on a 403 for their own receipt seconds after
 * being charged.
 *
 * The assertions that matter here are the negative ones: this must hand back
 * an email *only* for the exact order it was stored against, or it becomes a
 * way to attach one person's address to another person's order number.
 */

import { describe, expect, it } from "vitest";

import {
  forgetGuestOrder,
  guestEmailFor,
  recallGuestOrder,
  rememberGuestOrder,
} from "@/lib/api/guest-order";
import { registrationEmailFor, rememberRegistration } from "@/lib/api/guest-registration";

describe("guest order", () => {
  it("hands back the email for the order it was stored against", () => {
    rememberGuestOrder("KF-2026-0042", "buyer@example.com");
    expect(guestEmailFor("KF-2026-0042")).toBe("buyer@example.com");
  });

  it("hands back nothing for a different order number", () => {
    rememberGuestOrder("KF-2026-0042", "buyer@example.com");
    expect(guestEmailFor("KF-2026-0043")).toBeUndefined();
  });

  it("hands back nothing when nothing was stored", () => {
    expect(guestEmailFor("KF-2026-0042")).toBeUndefined();
    expect(recallGuestOrder()).toBeNull();
  });

  it("keeps only the most recent order", () => {
    rememberGuestOrder("KF-2026-0042", "first@example.com");
    rememberGuestOrder("KF-2026-0099", "second@example.com");
    expect(guestEmailFor("KF-2026-0042")).toBeUndefined();
    expect(guestEmailFor("KF-2026-0099")).toBe("second@example.com");
  });

  it("forgets on request", () => {
    rememberGuestOrder("KF-2026-0042", "buyer@example.com");
    forgetGuestOrder();
    expect(recallGuestOrder()).toBeNull();
  });

  it("survives corrupt storage rather than throwing into a render", () => {
    window.sessionStorage.setItem("kuyash_guest_order", "{not json");
    expect(recallGuestOrder()).toBeNull();
    expect(guestEmailFor("KF-2026-0042")).toBeUndefined();
  });

  it("rejects a stored value of the wrong shape", () => {
    window.sessionStorage.setItem("kuyash_guest_order", JSON.stringify({ order_number: 42 }));
    expect(recallGuestOrder()).toBeNull();
  });

  it("uses sessionStorage, so it dies with the tab", () => {
    rememberGuestOrder("KF-2026-0042", "buyer@example.com");
    expect(window.sessionStorage.getItem("kuyash_guest_order")).toBeTruthy();
    // An email left in localStorage would outlive the visit on a shared machine.
    expect(window.localStorage.getItem("kuyash_guest_order")).toBeNull();
  });
});

describe("guest academy booking", () => {
  it("matches on the exact reference only", () => {
    rememberRegistration("KFA-260728-VSG4", "adaeze@example.com");
    expect(registrationEmailFor("KFA-260728-VSG4")).toBe("adaeze@example.com");
    expect(registrationEmailFor("KFA-260728-AAAA")).toBeUndefined();
  });

  it("returns nothing on corrupt storage", () => {
    window.sessionStorage.setItem("kuyash_guest_registration", "]]not json[[");
    expect(registrationEmailFor("KFA-260728-VSG4")).toBeUndefined();
  });
});
