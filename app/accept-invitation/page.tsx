/**
 * Accepting a back-office invitation.
 *
 * Deliberately outside `/admin`: that section is behind a guard requiring
 * back-office access, and an invitee has none yet — often no account at all.
 */

import type { Metadata } from "next";
import { Suspense } from "react";

import AcceptInvitationClient from "./AcceptInvitationClient";

export const metadata: Metadata = {
  title: "Accept your invitation — Kuyash Integrated Farm",
  robots: { index: false, follow: false },
};

export default function AcceptInvitationPage() {
  return (
    <Suspense>
      <AcceptInvitationClient />
    </Suspense>
  );
}
