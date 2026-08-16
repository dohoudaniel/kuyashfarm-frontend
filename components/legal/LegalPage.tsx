/**
 * Shared shell for the three legal pages.
 *
 * These exist because the footer linked to Privacy Policy, Terms and Cookie
 * Policy with `href="#"` on a site that takes card payments, stores delivery
 * addresses and sets cookies. Under the NDPR a dead privacy link is not a
 * cosmetic gap.
 *
 * **What these documents are.** They describe, accurately, what this system
 * actually does — which data it collects, which third parties see it, what the
 * cookies are for. That is documentation of the software, and it is
 * verifiable against the code.
 *
 * **What they are not.** They are not legal advice and have not been reviewed
 * by a lawyer. The banner says so on the page rather than in a comment nobody
 * reads, because a policy that looks authoritative and has not been checked is
 * more dangerous than an obviously unfinished one.
 */

import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white pb-24 pt-28">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="font-serif text-4xl font-bold text-ink md:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-gray-500">Last updated {updated}</p>

        <div
          role="note"
          className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <strong className="font-semibold">Awaiting legal review.</strong> This page describes
          accurately how the Kuyash Farms platform handles your information, and it is
          published so nothing here is hidden. It has not yet been reviewed by a qualified lawyer
          against the Nigeria Data Protection Act. If you need a binding assurance before sharing
          information with us, please contact us first.
        </div>

        <div className="legal mt-10 space-y-8 text-gray-700">{children}</div>
      </div>
    </main>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-serif text-2xl font-bold text-ink">{heading}</h2>
      <div className="space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}
