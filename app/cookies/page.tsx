import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "The three things this site stores in your browser, and what each one is for.",
};

/**
 * Short, because the honest answer is short.
 *
 * Checked against the code: `lib/api/client.ts` (the refresh cookie),
 * `lib/api/cart.ts` (`kuyash-cart-storage` and the guest session id), and
 * `lib/api/guest-registration.ts` / `guest-order.ts` (sessionStorage). There is
 * no analytics or advertising script anywhere in the codebase, so there is no
 * consent banner — because there is nothing to consent to.
 */
export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updated="6 August 2026">
      <LegalSection heading="We do not track you">
        <p>
          There is no advertising, no analytics and no third-party tracking script on this site.
          That is why you have not been shown a consent banner: there is nothing to consent to.
          Everything stored in your browser is listed below, and every item is needed for the site
          to work.
        </p>
      </LegalSection>

      <LegalSection heading="What is stored, and why">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong>A sign-in cookie.</strong> Set when you sign in, so you stay signed in between
            visits. Your browser will not let JavaScript read it, and it is cleared when you sign
            out.
          </li>
          <li>
            <strong>A basket identifier.</strong> Lets you fill a basket without an account. It
            identifies a basket, not a person, and holds no personal detail.
          </li>
          <li>
            <strong>A copy of your basket.</strong> So the basket paints instantly instead of
            appearing a moment after the page. The real basket lives on our server; this is a cache
            of it.
          </li>
          <li>
            <strong>A guest order or booking reference.</strong> Stored only for the current tab,
            and only if you checked out or booked without an account, so that returning from the
            payment page can show you your own order. It is gone when you close the tab.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Clearing them">
        <p>
          You can clear all of it from your browser&rsquo;s settings at any time. Doing so signs you
          out and empties your basket; nothing else is lost, because everything else lives on our
          server rather than in your browser.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
