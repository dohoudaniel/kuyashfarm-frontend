"use client";

/**
 * The header and footer, mounted once for the whole application.
 *
 * **Why this exists.** `<Navbar />` and `<Footer />` used to be imported and
 * rendered by twenty-four individual pages. In the App Router a component
 * inside a page unmounts and remounts on every client-side navigation, so:
 *
 *  * `Navbar`'s `useEffect` called `loadCart()` **on every page view**. Browse
 *    six products and the app makes six identical cart requests, none of which
 *    can return anything new.
 *  * The scroll-position state reset, so the header's scrolled styling flashed
 *    back to its top-of-page appearance on each navigation.
 *  * The whole header re-animated in, which is the subtle jankiness that reads
 *    as "this site is slow" without anybody being able to point at what.
 *
 * A layout persists across navigations within its subtree. Mounting the chrome
 * here means one cart request per session rather than one per page, and the
 * header simply stays put — which is what a header is supposed to do.
 *
 * **Why a client component rather than route groups.** Route groups
 * (`(marketing)` / `(app)`) are the more idiomatic answer and were rejected:
 * they mean physically moving twenty-four route directories, which breaks
 * every relative import and every `loading.tsx`/`error.tsx` sibling in one
 * commit. This achieves the same result and can be read in one screen.
 */

import { usePathname } from "next/navigation";

import { Suspense } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RouteProgress } from "@/components/layout/RouteProgress";
import { PageTransition } from "@/components/layout/PageTransition";
import { ApiStatusBanner } from "@/components/layout/ApiStatusBanner";
import type { StoreConfig } from "@/lib/api/types";

/**
 * Sections that bring their own chrome.
 *
 * The back office has `AdminShell` — its own sidebar and header — and the
 * driver screen is a single-purpose view used one-handed at a gate. Rendering
 * a storefront header over either would be worse than untidy: on the driver's
 * phone it costs vertical space that the delivery buttons need.
 */
const BARE = ["/admin", "/driver"];

export function SiteChrome({
  children,
  config = null,
  apiDown = false,
}: {
  children: React.ReactNode;
  /**
   * Store settings, fetched once by the root layout on the server.
   *
   * Passed down rather than fetched here: this component is a Client
   * Component (it reads `usePathname`), so fetching would mean a request from
   * every visitor's browser on every page load for a value that changes
   * perhaps monthly.
   */
  config?: StoreConfig | null;
  /**
   * Whether the API answered while the server rendered this page.
   *
   * Passed down rather than probed here for the same reason `config` is: this
   * is a Client Component, and asking from the browser would mean a request
   * per visitor per page load for something the server already knows.
   */
  apiDown?: boolean;
}) {
  const pathname = usePathname();
  const bare = BARE.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  // The progress bar rides above *everything*, including the back office and
  // the driver screen — those navigate too, and the reason for it (no feedback
  // between tap and paint) applies there just as much.
  //
  // `Suspense` because `RouteProgress` reads `useSearchParams`, which opts the
  // whole subtree into client rendering without a boundary — and that would
  // turn every static marketing page dynamic.
  const chrome = (
    <>
      <Suspense fallback={null}>
        <RouteProgress />
      </Suspense>
      {/* Above the navbar and inside the bare shells too: the back office and
          the driver screen are *more* affected by a missing API than the
          marketing pages, not less — every screen there is data. */}
      <ApiStatusBanner initiallyDown={Boolean(apiDown)} />
    </>
  );

  if (bare) {
    return (
      <>
        {chrome}
        {children}
      </>
    );
  }

  return (
    <>
      {chrome}
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer config={config} />
    </>
  );
}
