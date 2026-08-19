export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  author: string;
  authorRole: string;
  authorInitials: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  popular?: boolean;
}

export interface BlogCategory {
  name: string;
  icon: string;
  count: number;
  slug: string;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  { name: "Poultry Farming",         icon: "Bird",       count: 24, slug: "poultry-farming" },
  { name: "Livestock",               icon: "Beef",       count: 18, slug: "livestock" },
  { name: "Crop Production",         icon: "Wheat",      count: 22, slug: "crop-production" },
  { name: "Fisheries & Aquaculture", icon: "Fish",       count: 16, slug: "fisheries-aquaculture" },
  { name: "Soil & Plant Science",    icon: "Sprout",     count: 15, slug: "soil-plant-science" },
  { name: "Farm Management",         icon: "LayoutDashboard", count: 20, slug: "farm-management" },
  { name: "Agribusiness",            icon: "TrendingUp", count: 14, slug: "agribusiness" },
  { name: "Sustainable Agriculture", icon: "Leaf",       count: 17, slug: "sustainable-agriculture" },
  { name: "Agricultural Technology", icon: "Cpu",        count: 13, slug: "agricultural-technology" },
  { name: "Research & Insights",     icon: "FlaskConical", count: 12, slug: "research-insights" },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "7-proven-ways-to-improve-egg-production-naturally",
    title: "7 Proven Ways to Improve Egg Production Naturally",
    excerpt: "Increase egg production and quality using natural, practical and cost-effective strategies that every poultry farmer can apply.",
    category: "Poultry Farming",
    author: "Kuyash Research Team",
    authorRole: "Research Division",
    authorInitials: "KR",
    date: "Aug 8, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1600",
    featured: true,
    popular: true,
  },
  {
    id: "2",
    slug: "nutrition-management-for-healthy-growth-in-cattle",
    title: "Nutrition Management for Healthy Growth in Cattle",
    excerpt: "Good nutrition is the foundation of productive and healthy livestock. Learn how to balance feed for maximum growth and profit.",
    category: "Livestock",
    author: "Alhaji Musa Garba",
    authorRole: "Livestock Specialist",
    authorInitials: "MG",
    date: "Aug 6, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1600",
    popular: false,
  },
  {
    id: "3",
    slug: "best-planting-practices-for-higher-crop-yield",
    title: "Best Planting Practices for Higher Crop Yield",
    excerpt: "Planting methods, spacing, and timing can significantly affect your harvest. Here's what modern agronomists recommend.",
    category: "Crop Production",
    author: "Dr. Chukwuemeka Obi",
    authorRole: "Head of Crop Science",
    authorInitials: "CO",
    date: "Aug 5, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1600",
    popular: false,
  },
  {
    id: "4",
    slug: "feeding-strategies-for-fast-and-healthy-fish-growth",
    title: "Feeding Strategies for Fast and Healthy Fish Growth",
    excerpt: "The right feed, at the right time, in the right amount makes all the difference in your aquaculture operation.",
    category: "Fisheries & Aquaculture",
    author: "Mrs. Ngozi Eze",
    authorRole: "Aquaculture Expert",
    authorInitials: "NE",
    date: "Aug 3, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=1600",
    popular: false,
  },
  {
    id: "5",
    slug: "improve-soil-fertility-naturally-and-sustainably",
    title: "Improve Soil Fertility Naturally and Sustainably",
    excerpt: "Healthy soil leads to healthy crops. Discover natural ways to restore and maintain soil fertility without synthetic inputs.",
    category: "Soil & Plant Science",
    author: "Dr. Chukwuemeka Obi",
    authorRole: "Head of Crop Science",
    authorInitials: "CO",
    date: "Aug 1, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1600",
    popular: false,
  },
  {
    id: "6",
    slug: "how-to-prevent-common-poultry-diseases",
    title: "How to Prevent Common Poultry Diseases",
    excerpt: "Disease prevention is cheaper than treatment. Here are the essential biosecurity measures every poultry farmer needs.",
    category: "Poultry Farming",
    author: "Kuyash Research Team",
    authorRole: "Research Division",
    authorInitials: "KR",
    date: "Jul 25, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=800",
    popular: true,
  },
  {
    id: "7",
    slug: "understanding-soil-ph-and-crop-productivity",
    title: "Understanding Soil pH and Crop Productivity",
    excerpt: "Soil pH directly impacts nutrient availability. Learn how to test, interpret, and adjust your soil pH for maximum yield.",
    category: "Soil & Plant Science",
    author: "Dr. Chukwuemeka Obi",
    authorRole: "Head of Crop Science",
    authorInitials: "CO",
    date: "Jul 20, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800",
    popular: true,
  },
  {
    id: "8",
    slug: "top-5-water-quality-management-practices",
    title: "Top 5 Water Quality Management Practices",
    excerpt: "Water quality is the single most important factor in fish farming. These five practices will keep your pond healthy.",
    category: "Fisheries & Aquaculture",
    author: "Mrs. Ngozi Eze",
    authorRole: "Aquaculture Expert",
    authorInitials: "NE",
    date: "Jul 18, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=800",
    popular: true,
  },
  {
    id: "9",
    slug: "the-role-of-mechanization-in-modern-farming",
    title: "The Role of Mechanization in Modern Farming",
    excerpt: "Mechanization reduces labour costs and boosts productivity. Here's how Nigerian farmers are embracing it.",
    category: "Agricultural Technology",
    author: "Kuyash Research Team",
    authorRole: "Research Division",
    authorInitials: "KR",
    date: "Jul 15, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800",
    popular: true,
  },
  {
    id: "10",
    slug: "how-to-start-a-profitable-vegetable-farm",
    title: "How to Start a Profitable Vegetable Farm",
    excerpt: "Vegetable farming can generate consistent income year-round. This guide walks you through everything from site selection to market.",
    category: "Crop Production",
    author: "Mr. Tunde Adeyemi",
    authorRole: "Agribusiness Consultant",
    authorInitials: "TA",
    date: "Jul 10, 2026",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=800",
    popular: true,
  },
];

export const BLOG_GUIDE_SECTIONS = [
  {
    title: "Farmer's Guides",
    description: "Step-by-step practical guides to help you solve common farming challenges.",
    cta: "Explore Guides",
    href: "/blog?category=farm-management",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=600",
  },
  {
    title: "Research & Insights",
    description: "Evidence-based research and insights to help you make better farming decisions.",
    cta: "Explore Insights",
    href: "/blog?category=research-insights",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=600",
  },
  {
    title: "Farm Management",
    description: "Tools, tips and strategies to help you run an efficient and profitable farm.",
    cta: "Learn More",
    href: "/blog?category=farm-management",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=600",
  },
];
