/**
 * Root layout.
 *
 * Mounts the font variables and `ClientProviders` exactly once. Every other
 * route renders inside this, so a provider added anywhere else would be a
 * second, competing instance.
 */

import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ClientProviders } from "@/components/providers/ClientProviders";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased`}
      >
        <ClientProviders>
          {/* Header and footer live here, not in each page. Mounted inside a
              page they remount on every navigation, which made the Navbar
              refetch the cart on every page view. */}
          <SiteChrome>{children}</SiteChrome>
        </ClientProviders>
      </body>
    </html>
  );
}
