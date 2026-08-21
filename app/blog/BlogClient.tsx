"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search, ArrowRight, Clock, ChevronRight,
  Bird, Beef, Fish, Wheat, Sprout, LayoutDashboard,
  TrendingUp, Leaf, Cpu, FlaskConical,
  type LucideIcon,
} from "lucide-react";
import { BLOG_CATEGORIES, BLOG_GUIDE_SECTIONS, type FallbackBlogPost } from "@/lib/data/blog";
import type { BlogPost as ApiBlogPost } from "@/lib/api/blog";

/**
 * The card shape this page renders.
 *
 * Kept as the fallback file's shape rather than the API's, because the whole
 * layout below was written against it and rewriting 450 lines of presentation
 * to chase a field rename would be change for its own sake. The page maps API
 * posts into it once, at the top, which is the only place the two shapes have
 * to agree.
 */
type BlogPost = FallbackBlogPost;

/** One mapping, so the rest of the file never has to know where a post came from. */
function fromApi(post: ApiBlogPost): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.body,
    category: post.category_label,
    author: post.author_name,
    authorRole: post.author_role,
    authorInitials: post.author_name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join(""),
    date: post.published_at,
    readTime: `${post.read_minutes} min read`,
    image: post.cover_image,
    featured: post.is_featured,
    popular: post.is_featured,
  };
}

/* ─── icon map ─── */
const ICON_MAP: Record<string, LucideIcon> = {
  Bird, Beef, Fish, Wheat, Sprout, LayoutDashboard,
  TrendingUp, Leaf, Cpu, FlaskConical,
};

/* ─── author avatar ─── */
function AuthorAvatar({ initials }: { initials: string }) {
  return (
    <span className="inline-flex w-7 h-7 rounded-full bg-primary items-center justify-center text-white text-[10px] font-bold shrink-0">
      {initials}
    </span>
  );
}

/* ─── category pill ─── */
function CategoryPill({ name }: { name: string }) {
  return (
    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-white">
      {name}
    </span>
  );
}

/* ─── article card ─── */
function ArticleCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-white border border-gray-100 hover:border-edge hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden shrink-0">
        <Image
          src={post.image} alt={post.title} fill
          sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 left-3">
          <CategoryPill name={post.category} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-bold text-ink leading-tight mb-2 group-hover:text-primary transition-colors duration-200">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed font-sans mb-4 flex-1 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <AuthorAvatar initials={post.authorInitials} />
            <div>
              <p className="text-[11px] font-semibold text-gray-700 leading-none">{post.author}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{post.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-sans">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </div>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-200"
        >
          Read More <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  );
}

/* ══════════════════════════════════════════════
   MAIN CLIENT
══════════════════════════════════════════════ */
export function BlogClient({
  posts: apiPosts,
  live,
}: {
  posts: ApiBlogPost[];
  /** False when the fallback articles were used because the API was down. */
  live: boolean;
}) {
  const BLOG_POSTS = useMemo(() => apiPosts.map(fromApi), [apiPosts]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const featuredPost = BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0];
  const popularPosts = BLOG_POSTS.filter(p => p.popular && !p.featured).slice(0, 5);
  const latestPosts = BLOG_POSTS.filter(p => !p.featured);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: BLOG_POSTS.length };
    BLOG_POSTS.forEach(p => {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    return counts;
  }, [BLOG_POSTS]);

  const filteredPosts = useMemo(() => {
    return latestPosts.filter(p => {
      const matchesSearch = search.trim() === "" ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, latestPosts]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await new Promise(r => setTimeout(r, 600));
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-cream">

      {/*
        Said out loud when the API could not be reached and these are the
        fallback articles. Passing stale content off as current is the one
        thing worse than the outage itself — a reader has no way to tell, and
        a date from months ago on a "latest" page reads as abandonment.
      */}
      {!live && (
        <p
          role="status"
          className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-900"
        >
          Showing recent articles. Live updates are briefly unavailable.
        </p>
      )}

      {/* ══ HERO ══ */}
      <section className="relative bg-ink overflow-hidden">
        {/* background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070"
            alt="Farm field"
            fill
            // Genuinely full-bleed, so 100vw is the honest answer rather than
            // the default this would fall back to.
            sizes="100vw"
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/80 to-transparent" />
        </div>

        {/* subtle grid */}
        <div className="absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }} />

        <div className="relative z-10 max-w-7xl 2xl:max-w-[1536px] mx-auto px-6 md:px-12 lg:px-16 py-24 md:py-32">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4"
          >
            Practical Knowledge for Modern Agriculture
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif font-bold text-white leading-[1.05] max-w-2xl mb-5"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            Knowledge that{" "}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, var(--accent-green) 0%, var(--wheat) 100%)" }}>
              grows
            </span>{" "}
            with farmers.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/55 font-sans leading-relaxed max-w-xl mb-10"
            style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)" }}
          >
            Research, practical guides and field-tested insights to help you farm better, smarter and sustainably.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative max-w-lg"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles, guides, research..."
              className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/15 backdrop-blur-md text-white placeholder:text-white/35 rounded-xl text-sm font-sans outline-none focus:border-accent focus:bg-white/15 transition-all duration-200"
            />
          </motion.div>
        </div>
      </section>

      {/* ══ MAIN BODY ══ */}
      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-6 md:px-12 lg:px-16 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* FEATURED ARTICLE */}
            {!search && activeCategory === "All" && (
              <section className="mb-14">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary mb-5 font-mono">
                  Featured Article
                </p>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="group grid grid-cols-1 md:grid-cols-2 gap-0 bg-white border border-gray-100 hover:border-edge hover:shadow-xl rounded-2xl overflow-hidden transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-64 md:h-full min-h-[280px] overflow-hidden">
                    <Image
                      src={featuredPost.image} alt={featuredPost.title} fill
                      sizes="(max-width:768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col justify-center">
                    <CategoryPill name={featuredPost.category} />
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink leading-tight mt-4 mb-3 group-hover:text-primary transition-colors duration-200">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed font-sans mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mb-6">
                      <AuthorAvatar initials={featuredPost.authorInitials} />
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{featuredPost.author}</p>
                        <p className="text-[10px] text-gray-500">{featuredPost.date} · {featuredPost.readTime}</p>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-secondary transition-colors duration-200 self-start"
                    >
                      Read Article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
              </section>
            )}

            {/* LATEST ARTICLES */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary font-mono">
                  {search || activeCategory !== "All" ? "Search Results" : "Latest Articles"}
                </p>
              </div>

              <AnimatePresence mode="popLayout">
                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredPosts.map((post, i) => (
                      <ArticleCard key={post.id} post={post} index={i} />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-16 bg-white rounded-2xl border border-gray-100"
                  >
                    <p className="font-serif text-lg font-bold text-gray-900 mb-2">No articles found</p>
                    <p className="text-sm text-gray-500 font-sans">Try a different search term or category.</p>
                    <button onClick={() => { setSearch(""); setActiveCategory("All"); }}
                      className="mt-5 text-sm font-semibold text-primary border border-edge px-4 py-2 rounded-full hover:bg-mist transition-colors">
                      Clear filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* GUIDE SECTIONS — 3 uniform cards */}
            {!search && activeCategory === "All" && (
              <section className="mt-14">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {BLOG_GUIDE_SECTIONS.map((section) => (
                    <div key={section.title}
                      className="group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-edge hover:shadow-lg transition-all duration-300 bg-white">
                      {/* Image */}
                      <div className="relative h-36 overflow-hidden">
                        <Image src={section.image} alt={section.title} fill
                          sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-ink/25" />
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
                      </div>
                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-serif font-bold text-ink text-sm mb-2">{section.title}</h3>
                        <p className="text-xs text-gray-500 font-sans leading-relaxed mb-4">{section.description}</p>
                        <Link href={section.href}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-edge px-3 py-1.5 rounded-full hover:bg-mist transition-colors">
                          {section.cta} <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="space-y-8 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">

            {/* BROWSE CATEGORIES */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary font-mono">
                  Browse Categories
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                <button
                  onClick={() => setActiveCategory("All")}
                  className={`w-full flex items-center justify-between px-5 py-3 text-sm font-sans transition-colors duration-150 ${activeCategory === "All" ? "bg-mist text-primary font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <span className="flex items-center gap-3">
                    <Leaf className="w-4 h-4 text-accent" />
                    All Articles
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeCategory === "All" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                    {categoryCounts["All"]}
                  </span>
                </button>
                {BLOG_CATEGORIES.map(cat => {
                  const Icon = ICON_MAP[cat.icon] ?? Leaf;
                  const isActive = activeCategory === cat.name;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => setActiveCategory(isActive ? "All" : cat.name)}
                      className={`w-full flex items-center justify-between px-5 py-3 text-sm font-sans transition-colors duration-150 ${isActive ? "bg-mist text-primary font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-accent"}`} />
                        {cat.name}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                        {categoryCounts[cat.name] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STAY INFORMED */}
            <div className="bg-ink rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
                  backgroundSize: "32px 32px",
                }} />
              <div className="relative z-10">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-3">
                  Stay Informed
                </p>
                <p className="font-serif font-bold text-white text-base leading-snug mb-2">
                  Get the latest agricultural insights.
                </p>
                <p className="text-white/45 text-xs font-sans leading-relaxed mb-5">
                  Subscribe to get the latest agricultural insights and practical guides.
                </p>
                {subscribed ? (
                  <div className="bg-primary/30 border border-primary/50 rounded-xl px-4 py-3 text-center">
                    <p className="text-white font-semibold text-sm">You&apos;re subscribed!</p>
                    <p className="text-white/50 text-xs mt-0.5">Look out for your first email.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-2.5">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/60 rounded-xl px-4 py-3 text-sm font-sans outline-none focus:border-accent transition-all"
                    />
                    <button type="submit"
                      className="w-full bg-primary hover:bg-secondary text-white font-semibold text-sm py-3 rounded-xl transition-colors duration-200">
                      Subscribe
                    </button>
                    <p className="text-white/25 text-[10px] font-sans text-center">No spam. Unsubscribe anytime.</p>
                  </form>
                )}
              </div>
            </div>

            {/* POPULAR ARTICLES */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary font-mono">
                  Popular Articles
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {popularPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}
                    className="group flex items-start gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                      <Image src={post.image} alt={post.title} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1">
                        {post.title}
                      </p>
                      <p className="text-[10px] text-gray-500 font-sans">{post.date}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary shrink-0 mt-1 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
