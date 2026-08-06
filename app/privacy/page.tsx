import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Kuyash Integrated Farm",
  description:
    "What information Kuyash Integrated Farm collects, why, who else sees it, and how to have it removed.",
};

/**
 * Everything here is checked against the code rather than adapted from a
 * template, because a privacy policy that describes a different system is
 * worse than none — it is a false statement about what happens to somebody's
 * data. Each claim below corresponds to something real:
 *
 *  * the account fields are `accounts.User`
 *  * the address fields are `orders.Order.shipping_address`
 *  * "we never see your card" is `orders/paystack.py` — Paystack hosts the
 *    payment page and the API only ever receives a signed webhook
 *  * the tokens paragraph is `lib/api/client.ts` — access token in memory,
 *    refresh token in an HttpOnly cookie
 */
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="6 August 2026">
      <LegalSection heading="Who we are">
        <p>
          Kuyash Integrated Farm operates this website, sells farm produce through it, and runs
          the Kuyash Farm Academy. When this page says &ldquo;we&rdquo;, it means that business.
        </p>
      </LegalSection>

      <LegalSection heading="What we collect, and why">
        <p>
          <strong>When you create an account:</strong> your name, email address and password. The
          password is stored only as an Argon2 hash — we cannot read it, and nobody at the farm can
          tell you what it is.
        </p>
        <p>
          <strong>When you place an order:</strong> the delivery address, recipient name and phone
          number you give us, plus what you ordered. We need these to deliver to you, and we keep
          them so you can see your own order history.
        </p>
        <p>
          <strong>When you apply for a wholesale or distributor account:</strong> your business
          name and address, CAC number, tax identification number and any documents you upload. We
          use these to verify the business is real before granting trade pricing.
        </p>
        <p>
          <strong>When you book an academy class:</strong> your name, email and phone number, so we
          can hold your seat and tell you if a date changes.
        </p>
        <p>
          <strong>When you subscribe to the newsletter:</strong> your email address, and which page
          you subscribed from.
        </p>
      </LegalSection>

      <LegalSection heading="Your card details never reach us">
        <p>
          Payments are handled entirely by Paystack. When you pay, you are on Paystack&rsquo;s own
          page, and your card number is never sent to our servers and never stored by us. We
          receive only a signed confirmation from Paystack saying whether the payment succeeded,
          for how much, and against which order.
        </p>
      </LegalSection>

      <LegalSection heading="Who else sees your information">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Paystack</strong> — payment processing. They receive your email address and the
            amount, and they handle the card details we never see.
          </li>
          <li>
            <strong>Supabase</strong> — hosts our database and the photographs uploaded to the
            site.
          </li>
          <li>
            <strong>Resend</strong> — sends our transactional email: order confirmations,
            verification links, password resets.
          </li>
          <li>
            <strong>Google</strong> — only if you choose &ldquo;Continue with Google&rdquo;, in
            which case Google tells us your name, email address and whether that address is
            verified.
          </li>
        </ul>
        <p>
          We do not sell your information, and we do not share it with advertisers. There is no
          advertising or analytics tracking on this site.
        </p>
      </LegalSection>

      <LegalSection heading="How your session is kept">
        <p>
          When you sign in, the token that identifies you is held in your browser&rsquo;s memory
          only — it is never written to local storage, so it disappears when you close the tab. A
          second, longer-lived token is stored in a cookie your browser will not let JavaScript
          read. This is deliberate: it means a script injected into a page cannot steal your
          session.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Order and payment records are kept as long as the business is required to keep financial
          records. Account details are kept until you ask us to delete the account. Newsletter
          subscriptions are kept until you unsubscribe, which every newsletter email links to.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You may ask us for a copy of what we hold about you, ask us to correct it, or ask us to
          delete it. You can change your own name, email address and saved delivery addresses at
          any time from your profile. For anything else, contact us and we will act within thirty
          days.
        </p>
        <p>
          Deleting an account does not delete completed orders, because we are required to keep
          financial records — but they are dissociated from your login.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Write to us about anything on this page and we will answer. If you are not satisfied with
          our response, you may complain to the Nigeria Data Protection Commission.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
