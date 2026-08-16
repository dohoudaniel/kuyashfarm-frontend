/**
 * Application-wide constants and configuration
 */

export const SITE_CONFIG = {
  name: "Kuyash Farms",
  tagline: "Farming for a future",
  description:
    "Cultivating a sustainable future through innovative agriculture and empowering rural communities.",
} as const;

/**
 * Social accounts, and only the ones that exist.
 *
 * The footer rendered four icons — Instagram, Facebook, YouTube, WhatsApp —
 * every one of them `href="#"`. A link that goes nowhere is worse than an
 * absent one: it is a promise the site does not keep, and the visitor who
 * clicks it has learnt something about how carefully the rest was built.
 *
 * Fill an entry in and its icon appears. Leave it empty and it does not.
 */
export const SOCIAL_LINKS: { instagram?: string; facebook?: string; youtube?: string; whatsapp?: string } =
  {
    // instagram: "https://instagram.com/kuyashfarm",
    // facebook: "https://facebook.com/kuyashfarm",
    // youtube: "https://youtube.com/@kuyashfarm",
    // whatsapp: "https://wa.me/234XXXXXXXXXX",
  };

export const STATS = [
  { value: "5000+", label: "Farmers Connected" },
  { value: "90%", label: "Yield Improvement" },
  { value: "50+", label: "Agriculture Experts" },
  { value: "98%", label: "Positive Impact" },
] as const;

export const SERVICES = [
  {
    id: 1,
    title: "Crop & Vegetable Production",
    description: "Growing premium-quality crops and fresh vegetables using sustainable farming methods.",
    slug: "crop-vegetable-production",
  },
  {
    id: 2,
    title: "Livestock & Poultry Farming",
    description: "Raising healthy cattle, sheep, and poultry with modern animal husbandry practices.",
    slug: "livestock-poultry-farming",
  },
  {
    id: 3,
    title: "Fish Farming",
    description: "Sustainable aquaculture systems producing fresh, quality fish.",
    slug: "fish-farming",
  },
  {
    id: 4,
    title: "Palm Oil Production",
    description: "Cultivating oil palm plantations for high-quality palm oil production.",
    slug: "palm-oil-production",
  },
  {
    id: 5,
    title: "Food Processing & Packaging",
    description: "Processing and packaging farm products to deliver fresh, quality food to customers.",
    slug: "food-processing-packaging",
  },
  {
    id: 6,
    title: "Agricultural E-Commerce",
    description: "Connecting farmers and consumers through innovative digital marketplace solutions.",
    slug: "agricultural-ecommerce",
  },
] as const;

export const GOALS = [
  {
    id: 1,
    value: "2B",
    label: "Liters of water conserved annually through smart irrigation",
  },
  {
    id: 2,
    value: "2B",
    label: "Collaborate on policy 2 billion liters of water annually through efficient water-saving practices",
  },
  {
    id: 3,
    value: "100M",
    label: "People impacted through sustainable farming, supporting livelihoods globally",
  },
] as const;

/**
 * Primary navigation.
 *
 * **Shop comes first**, and its absence was the real defect here. This is an
 * e-commerce site with server-side pricing, wholesale tiers and a stock
 * ledger, and the primary navigation did not link to any of it — a customer
 * arriving on the homepage had no route to the products except the hero
 * button. It was the navigation of a brochure.
 *
 * **Two entries pointed at nothing.** `#projects` had no matching section and
 * never had; `#blog` lost its section when three invented articles linking to
 * `href="#"` were deleted. Both scrolled nowhere, silently — an anchor with no
 * target does not error, it simply does not move.
 *
 * Anything added here must resolve. An entry beginning `#` needs a section
 * with that `id` on the homepage; anything else must be a real route.
 * `tests/navigation.test.tsx` fails the build otherwise.
 */
export const NAV_LINKS = [
  { label: "Shop", href: "/categories" },
  { label: "Wholesale", href: "/become-wholesaler" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Academy", href: "/academy" },
] as const;

// FARM_CATEGORIES and PRODUCTS lived here. Both are gone: the catalogue is now
// served from the database via /api/v1/categories/ and /api/v1/products/.
//
// Keeping a copy in the bundle meant the shop advertised whatever was hardcoded
// at build time — deactivate a product in the back office and the storefront
// kept selling it, at whatever price the constant said. The bulk tiers here
// were also the source of the pricing bug in audit §3.7.

export const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Case Studies", href: "#" },
    { label: "Reviews", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Team", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  services: [
    { label: "Soil Enrichment", href: "#" },
    { label: "Water Management", href: "#" },
    { label: "Crop Consultation", href: "#" },
    { label: "Organic Farming", href: "#" },
  ],
  innovations: [
    { label: "Smart Irrigation", href: "#" },
    { label: "Precision Agriculture", href: "#" },
    { label: "Sustainable Practices", href: "#" },
    { label: "AI Solutions", href: "#" },
  ],
  successStories: [
    { label: "Farmer Testimonials", href: "#" },
    { label: "Community Impact", href: "#" },
    { label: "Case Studies", href: "#" },
    { label: "Research Papers", href: "#" },
  ],
} as const;
