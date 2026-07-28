import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import Image from "next/image";

/**
 * Blog Section - Preview cards with images and excerpts
 */
export function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Sustainable Agriculture",
      excerpt:
        "Exploring innovative techniques that are reshaping modern farming practices.",
      image:
        "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2074",
      category: "Sustainability",
      date: "March 15, 2024",
    },
    {
      id: 2,
      title: "Water Conservation in Modern Farming",
      excerpt:
        "How smart irrigation systems are helping farmers save water and increase yields.",
      image:
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070",
      category: "Technology",
      date: "March 10, 2024",
    },
    {
      id: 3,
      title: "Organic Farming: A Growing Trend",
      excerpt:
        "Why more farmers are switching to organic methods and what it means for the future.",
      image:
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2070",
      category: "Organic",
      date: "March 5, 2024",
    },
  ];

  return (
    <Section id="blog" className="bg-[#faf8f5]">
      <Container>
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="mb-4 font-sans text-sm uppercase tracking-wider text-gray-500">
            Insights & Innovation
          </p>
          <h2 className="mx-auto max-w-3xl font-serif text-3xl font-bold leading-tight text-[#2d5f3f] md:text-4xl lg:text-5xl">
            Blog is a vibrant space where farming meets innovation
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-sans text-base text-gray-600 md:text-lg">
            Experience beauty redefined by effortless elegance in every
            application.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-lg bg-white shadow-md transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-white/90 px-3 py-1 font-sans text-xs font-medium text-[#2d5f3f] backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="mb-2 font-sans text-xs text-gray-500">
                  {post.date}
                </p>
                <h3 className="mb-3 font-serif text-xl font-bold text-[#2d5f3f] transition-colors group-hover:text-[#4a7c59]">
                  {post.title}
                </h3>
                <p className="mb-4 font-sans text-sm leading-relaxed text-gray-600">
                  {post.excerpt}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center font-sans text-sm font-medium text-[#2d5f3f] transition-all group-hover:translate-x-2"
                >
                  Read More
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
