import type { Metadata } from "next";
import { Suspense } from "react";

import UsersClient from "./UsersClient";

export const metadata: Metadata = {
  title: "Users",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  // `useSearchParams` in the client component needs a Suspense boundary, or
  // the whole route opts into dynamic rendering. The analytics page links
  // here with `?search=`, which is what makes that hook worth having.
  return (
    <Suspense fallback={null}>
      <UsersClient />
    </Suspense>
  );
}
