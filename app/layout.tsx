/**
 * Root layout.
 *
 * Mounts the font variables and `ClientProviders` exactly once. Every other
 * route renders inside this, so a provider added anywhere else would be a
 * second, competing instance.
 */

import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { apiReachable, fetchPublic } from "@/lib/api/client";
import type { StoreConfig } from "@/lib/api/types";
import { ClientProviders } from "@/components/providers/ClientProviders";

/**
 * Display face.
 *
 * Fraunces replaces Playfair Display, which is the default "premium" pairing
 * on generated landing pages and was doing every job at every size with
 * default tracking. Fraunces is warmer and slightly irregular — it reads as a
 * food brand rather than a fashion house — and being variable it can be tuned
 * rather than merely chosen.
 *
 * `SOFT` and `WONK` are what make it not-Playfair. Soft rounds the terminals;
 * wonk lets a few letterforms lean. Both are dialled low: enough character to
 * be recognisable, not so much that it becomes a novelty face nobody can read
 * at 14px.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Where absolute URLs in metadata resolve from.
 *
 * Without `metadataBase`, every Open Graph image URL is relative — and a
 * relative image is no image at all to Facebook, WhatsApp or Twitter, which
 * fetch it from their own servers with no idea what your origin is. Next warns
 * about this at build time in a line nobody reads.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kuyashfarms.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kuyash Farms — Fresh Nigerian produce, delivered",
    // Page titles become "Shop — Kuyash Farms" without every page
    // having to repeat the suffix and eventually getting it wrong.
    template: "%s — Kuyash Farms",
  },
  description:
    "Farm-fresh produce from our own 40-acre farm, delivered across Nigeria. Wholesale and distributor pricing available, plus practical agricultural training at Kuyash Farms Academy.",
  applicationName: "Kuyash Farms",
  keywords: [
    "Nigerian farm produce",
    "fresh vegetables Lagos",
    "wholesale produce Nigeria",
    "agricultural training Nigeria",
    "farm to table Nigeria",
  ],
  authors: [{ name: "Kuyash Farms" }],

  /**
   * The share card.
   *
   * There was none. Pasting a link into WhatsApp — which is how most commerce
   * in Nigeria actually spreads — rendered a bare grey URL, and a bare URL
   * from an unknown domain is a link people do not tap. This is the cheapest
   * credibility the site can buy.
   */
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: "Kuyash Farms",
    title: "Kuyash Farms — Fresh Nigerian produce, delivered",
    description:
      "Farm-fresh produce from our own 40-acre farm, delivered across Nigeria. Wholesale pricing and practical agricultural training.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kuyash Farms",
    description:
      "Farm-fresh produce from our own 40-acre farm, delivered across Nigeria.",
  },

  manifest: "/manifest.webmanifest",

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/**
 * Store settings, fetched once per revalidation window on the server.
 *
 * The footer's contact details come from here rather than from literals in the
 * component. Doing it in the layout means one cached server fetch for the whole
 * site instead of a request from every visitor's browser, and the values are in
 * the HTML on first paint rather than appearing a moment later.
 *
 * `offlineFallback` keeps the build working when the API is unreachable — CI
 * builds with `NEXT_PRERENDER_OFFLINE=1` and no backend — and an outage in
 * production degrades the footer to fewer lines rather than taking the page
 * down. Stale contact details would be worse than absent ones: a phone number
 * nobody answers is a promise the business does not keep.
 */
async function storeConfig(): Promise<StoreConfig | null> {
  try {
    return await fetchPublic<StoreConfig>("/config/", {
      revalidate: 300,
      offlineFallback: null as unknown as StoreConfig,
    });
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Both on the server, in parallel. `storeConfig` degrades to null when the
  // API is unreachable, so a null config is *almost* the same signal — but not
  // quite: a deployment could have no SiteSetting row at all, which is a
  // healthy API returning nothing. Asking /health/ separately keeps "the API
  // is down" distinct from "there is no configuration yet", and only the first
  // deserves a banner.
  const [config, reachable] = await Promise.all([storeConfig(), apiReachable()]);

  return (
    // `data-scroll-behavior="smooth"` tells the router that the smooth
    // scrolling declared in `globals.css` is deliberate, so it can suppress it
    // during a route change. Without it a navigation *animates* the jump to
    // the top of the new page — on a long page that is a visible scroll
    // through content the visitor never asked to see, reading as the page
    // loading twice. In-page anchors keep their smooth scroll, which is the
    // part that was wanted.
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${fraunces.variable} ${inter.variable} antialiased`}
      >
        <ClientProviders>
          {/* Header and footer live here, not in each page. Mounted inside a
              page they remount on every navigation, which made the Navbar
              refetch the cart on every page view. */}
          <SiteChrome config={config} apiDown={!reachable}>
            {children}
          </SiteChrome>
        </ClientProviders>
      </body>
    </html>
  );
}
