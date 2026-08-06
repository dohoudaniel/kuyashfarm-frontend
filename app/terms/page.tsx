import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions — Kuyash Integrated Farm",
  description:
    "The terms you agree to when ordering from Kuyash Integrated Farm or booking an academy class.",
};

/**
 * Describes the rules the software already enforces, so the page and the
 * system cannot drift apart. Each clause is checkable:
 *
 *  * server-side pricing is `catalog.services.price_for`
 *  * "an order is an offer until we confirm it" is the PENDING -> CONFIRMED
 *    transition in `orders.services`
 *  * stock reservation is the `StockMovement` reserve-then-commit ledger
 *  * trade pricing on approval only is `applications.services.approve`
 *  * seats held without payment is `RegistrationStatus.PENDING_PAYMENT`
 */
export default function TermsPage() {
  return (
    <LegalPage title="Terms &amp; Conditions" updated="6 August 2026">
      <LegalSection heading="Ordering">
        <p>
          Placing an order is an offer to buy. The order is not accepted until we confirm it, which
          happens when your payment is confirmed or, for cash on delivery, when we accept the order
          for despatch. Until then we may decline it — for example if an item is no longer
          available.
        </p>
        <p>
          When you place an order we hold the stock for you immediately, before payment. If you do
          not complete payment, that hold is released after a short period and the items return to
          general sale.
        </p>
      </LegalSection>

      <LegalSection heading="Prices">
        <p>
          All prices are in Nigerian Naira and are set by us at the time you order. The price you
          pay is calculated on our server when you check out, not in your browser — so the total
          shown at checkout is the total charged.
        </p>
        <p>
          Wholesale and distributor pricing applies only to accounts we have approved for it.
          Submitting an application does not entitle you to trade prices; approval does.
        </p>
      </LegalSection>

      <LegalSection heading="Delivery">
        <p>
          We deliver with our own fleet. Delivery charges are shown before you pay and depend on
          the delivery state and the order value. We will give you a delivery window rather than a
          guaranteed time.
        </p>
        <p>
          Please check produce on delivery. If something is damaged or wrong, tell us within 24
          hours and we will replace or refund it.
        </p>
      </LegalSection>

      <LegalSection heading="Fresh produce and returns">
        <p>
          Perishable goods cannot be returned once accepted in good condition, which is normal for
          fresh food. This does not affect your right to a refund for goods that arrive damaged,
          spoiled, or not as described.
        </p>
        <p>
          Refunds are returned to the payment method used. Where a refund is agreed for goods that
          were not returned to us — spoiled produce, for instance — we do not ask you to send them
          back.
        </p>
      </LegalSection>

      <LegalSection heading="Academy bookings">
        <p>
          Booking a class holds a seat for you. Some classes are free and confirm immediately;
          paid classes hold your seat pending payment, which may be settled online or on arrival.
        </p>
        <p>
          If we cancel or reschedule a class we will tell you and refund in full if you cannot make
          the new date.
        </p>
      </LegalSection>

      <LegalSection heading="Your account">
        <p>
          Keep your password to yourself and tell us if you think somebody else has it. You are
          responsible for what happens under your account. We may suspend an account being used
          fraudulently.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          We may change these terms. The terms that apply to your order are the ones published when
          you placed it, and the date at the top of this page tells you when it last changed.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
