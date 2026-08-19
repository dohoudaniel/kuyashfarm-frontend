"use client";

import { MapPin, Phone, Mail, Leaf } from "lucide-react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Services", href: "/services/crop-vegetable-production" },
  { label: "Kuyash Academy", href: "/academy" },
  { label: "Blog & News", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

const BUSINESSES = [
  { label: "Crop & Vegetable Production", href: "/services/crop-vegetable-production" },
  { label: "Livestock & Poultry", href: "/services/livestock-poultry-farming" },
  { label: "Fish Farming", href: "/services/fish-farming" },
  { label: "Palm Oil Production", href: "/services/palm-oil-production" },
  { label: "Food Processing", href: "/services/food-processing-packaging" },
  { label: "Agricultural E-Commerce", href: "/services/agricultural-ecommerce" },
];

const RESOURCES = [
  { label: "Become a Distributor", href: "/become-distributor" },
  { label: "Wholesale Enquiry", href: "/shop/all" },
  { label: "Investor Relations", href: "/contact" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "Facebook",
    href: "#",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "YouTube",
    href: "#",
    path: "M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z",
  },
  {
    label: "WhatsApp",
    href: "#",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080f0a] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-20 pb-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#2d5f3f] flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif text-base font-bold tracking-tight text-white">
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="text-white/40 font-sans text-xs leading-relaxed mb-6 max-w-[220px]">
              Nigeria&apos;s premier integrated farm — cultivating food, community and the future of agriculture.
            </p>
            <div className="flex items-center gap-2.5 mb-8">
              {SOCIALS.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 hover:border-[#6b9d7a] hover:text-[#6b9d7a] transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                    <path d={path} />
                  </svg>
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
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 font-sans text-sm text-white/45 hover:text-white transition-colors duration-200"
                  >
                    <span className="h-px w-0 bg-[#6b9d7a] transition-all duration-200 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Our Businesses */}
          <div>
            <h4 className="mb-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Our Businesses
            </h4>
            <ul className="space-y-3">
              {BUSINESSES.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 font-sans text-sm text-white/45 hover:text-white transition-colors duration-200"
                  >
                    <span className="h-px w-0 bg-[#6b9d7a] transition-all duration-200 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact + Resources */}
          <div>
            <h4 className="mb-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Contact
            </h4>
            <ul className="space-y-3.5 mb-8">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6b9d7a]" />
                <span className="font-sans text-sm leading-snug text-white/45">
                  Iwo Road, Ibadan, Oyo State, Nigeria
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#6b9d7a]" />
                <a href="tel:+2348000000000" className="font-sans text-sm text-white/45 hover:text-white transition-colors duration-200">
                  +234 800 000 0000
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#6b9d7a]" />
                <a href="mailto:hello@kuyashfarm.com" className="font-sans text-sm text-white/45 hover:text-white transition-colors duration-200">
                  hello@kuyashfarm.com
                </a>
              </li>
            </ul>

            <h4 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {RESOURCES.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/45 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="h-px bg-white/6" />
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-white/25">
            © {currentYear} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="font-sans text-xs text-white/20">
            Designed &amp; built with care in Nigeria.
          </p>
        </div>
      </div>
    </footer>
  );
}
