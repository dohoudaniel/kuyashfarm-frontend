"use client";

import Link from "next/link";

/**
 * Site footer: navigation, contact details and social links.
 *
 * The wholesale and distributor links live here rather than in the main nav,
 * because they are for a minority of visitors who go looking.
 */
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import { SITE_CONFIG, SOCIAL_LINKS } from "@/lib/constants";
import type { StoreConfig } from "@/lib/api/types";

/**
 * Contact details, from the back office rather than from this file.
 *
 * All four of these were literals here — an address, a phone number, an email
 * and opening hours the business could not change without a developer and a
 * deploy. The phone number was also a *different* number from `support_phone`
 * in the store settings, so the site advertised one and the back office
 * believed another, with nothing to reconcile them. That is the failure the
 * `/config/` endpoint already exists to prevent: the free-shipping threshold
 * once read N80,000 at checkout and N200,000 in the chatbot for exactly this
 * reason.
 *
 * `config` arrives as a prop from the root layout, which is a Server
 * Component, so this costs no client request and no round trip on first paint.
 * It is nullable because an API outage must not take the footer down — a
 * missing line is better than a broken page, and better than a stale
 * hardcoded one that contradicts the shop.
 */
function contactLines(config: StoreConfig | null) {
  if (!config) return [];

  return [
    { icon: MapPin, text: config.address },
    { icon: Phone, text: config.support_phone },
    { icon: Mail, text: config.support_email },
    { icon: Clock, text: config.opening_hours },
    // An empty setting renders nothing rather than an icon beside a blank.
  ].filter((line) => Boolean(line.text));
}

export function Footer({ config = null }: { config?: StoreConfig | null }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080f0a] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 lg:px-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 xl:gap-12">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2d5f3f]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-white"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8M12 12c0-5 5-9 10-8-1 5-5 9-10 8" />
                </svg>
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-white">
                {SITE_CONFIG.name}
              </span>
            </div>
            <p className="mb-6 font-sans text-sm leading-relaxed text-white/50">
              Cultivating a sustainable future through innovative agriculture and empowering rural communities across Africa.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {/* Only accounts that exist. Every one of these was `href="#"`
                  — four icons promising a presence the business does not have,
                  and a visitor who clicks one learns something about how
                  carefully the rest of the site was built. Fill in
                  SOCIAL_LINKS and the icon appears. */}
              {(
                [
                  { icon: Instagram, label: "Instagram", href: SOCIAL_LINKS.instagram },
                  { icon: Facebook, label: "Facebook", href: SOCIAL_LINKS.facebook },
                  { icon: Youtube, label: "YouTube", href: SOCIAL_LINKS.youtube },
                  { icon: MessageCircle, label: "WhatsApp", href: SOCIAL_LINKS.whatsapp },
                ] as const
              )
                .filter((link): link is typeof link & { href: string } => Boolean(link.href))
                .map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all duration-200 hover:border-accent hover:text-accent"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <h4 className="mb-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                // "Blog & News" pointed at `#blog`, a section deleted along
                // with three invented articles. It survived the nav clean-up
                // because that only touched NAV_LINKS — the footer keeps its
                // own list, which is exactly how a dead link outlives the
                // thing that killed it. "Shop" was missing here too.
                { label: "Shop", href: "/categories" },
                { label: "About", href: "#about" },
                { label: "Our Services", href: "#services" },
                { label: "Kuyash Farms Academy", href: "/academy" },
                { label: "Wholesale Pricing", href: "/become-wholesaler" },
                { label: "Become a Distributor", href: "/become-distributor" },
                { label: "My orders", href: "/orders" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group inline-flex min-h-11 items-center gap-1.5 py-1.5 font-sans text-sm text-white/50 transition-colors duration-200 hover:text-white"
                  >
                    <span className="h-px w-0 bg-[#6b9d7a] transition-all duration-200 group-hover:w-3" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Services */}
          <div>
            <h4 className="mb-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Our Services
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Crop & Vegetable Production", href: "/services/crop-vegetable-production" },
                { label: "Livestock & Poultry", href: "/services/livestock-poultry-farming" },
                { label: "Fish Farming", href: "/services/fish-farming" },
                { label: "Palm Oil Production", href: "/services/palm-oil-production" },
                { label: "Food Processing", href: "/services/food-processing-packaging" },
                { label: "Agricultural E-Commerce", href: "/services/agricultural-ecommerce" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group inline-flex min-h-11 items-center gap-1.5 py-1.5 font-sans text-sm text-white/50 transition-colors duration-200 hover:text-white"
                  >
                    <span className="h-px w-0 bg-[#6b9d7a] transition-all duration-200 group-hover:w-3" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h4 className="mb-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Contact
            </h4>
            <ul className="space-y-4">
                {contactLines(config).map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="font-sans text-sm leading-snug text-white/50">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="h-px bg-white/8" />
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-sans text-xs text-white/30">
            © {currentYear} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {/* These were `href="#"`. A shop that takes card payments and
                collects addresses cannot have a Privacy Policy link that goes
                nowhere — under the NDPR that is not a cosmetic gap. The pages
                exist now and describe what this system actually does. */}
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms & Conditions", href: "/terms" },
              { label: "Cookie Policy", href: "/cookies" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex min-h-11 items-center font-sans text-xs text-white/30 transition-colors duration-200 hover:text-accent"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
