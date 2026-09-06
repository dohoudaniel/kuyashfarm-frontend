/**
 * Sign in.
 *
 * A thin server wrapper so the client component can use `useSearchParams` —
 * for `?next=` and for the `?code=` Google sends back. Without the Suspense
 * boundary Next refuses to build the route, because reading search params
 * opts it out of static rendering.
 */

import type { Metadata } from "next";
import { Suspense } from "react";

import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
