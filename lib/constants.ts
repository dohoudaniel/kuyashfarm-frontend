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


/**
 * Primary navigation — the frontend redesign's set, with every link resolving.
 *
 * Matches main's header so the two branches read as one product. One
 * correction was necessary rather than optional: on main, `#projects`,
 * `#services` and `#about` all point at nothing, because the sections that
 * carried those ids (Services, Mission, Blog) are not on its new homepage.
 * Here they are mapped onto the sections that carry the equivalent content —
 * Services to what we grow, About Us to the origin story, Projects to the
 * Kuyash Model — so the header works rather than merely looking right.
 *
 * `tests/navigation.test.tsx` reads the filesystem and fails the build if any
 * entry points at a section or route that does not exist.
 *
 * Shop is the one addition to main's set. Main has no link to the catalogue,
 * which is defensible on a brochure site and not on this one — the basket, the
 * checkout and the whole trade-pricing system sit behind it.
 */
export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  // Second, and deliberately so. This is an e-commerce site and the shop was
  // previously reachable only from the hero's call to action and the basket
  // icon — a customer who scrolled past the hero had no route to the products
  // at all.
  { label: "Shop", href: "/categories" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "About Us", href: "#about" },
  { label: "Blog", href: "/blog" },
  { label: "Academy", href: "/academy" },
] as const;

// FARM_CATEGORIES and PRODUCTS lived here. Both are gone: the catalogue is now
// served from the database via /api/v1/categories/ and /api/v1/products/.
//
// Keeping a copy in the bundle meant the shop advertised whatever was hardcoded
// at build time — deactivate a product in the back office and the storefront
// kept selling it, at whatever price the constant said. The bulk tiers here
// were also the source of the pricing bug in audit §3.7.

