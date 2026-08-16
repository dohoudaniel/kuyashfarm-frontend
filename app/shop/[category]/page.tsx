/**
 * Product listing.
 *
 * A Server Component. The previous version was a Client Component that called
 * `getAllProducts()` — which read `localStorage` — during render. Because this
 * route is server-rendered, that threw `ReferenceError: localStorage is not
 * defined` on every request. The page still returned 200, but the HTML
 * contained no products at all: invisible to search engines, to link previews,
 * and to anyone whose JavaScript was slow (audit §3.4).
 *
 * Prices rendered here are retail, because the server has no session. Signed-in
 * customers see their own pricing after hydration, via `ProductGrid`.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/shop/ProductGrid";
import { fetchCategoryPublic, fetchProductsPublic } from "@/lib/api/catalogue";
import { ApiError } from "@/lib/api/client";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;

  try {
    const category = await fetchCategoryPublic(slug);
    return {
      title: `${category.name} — Kuyash Farms`,
      description: category.description,
      openGraph: {
        title: `${category.name} — Kuyash Farms`,
        description: category.description,
        images: category.image ? [category.image] : undefined,
      },
    };
  } catch {
    return { title: "Shop" };
  }
}

export default async function ShopPage({ params }: PageProps) {
  const { category: slug } = await params;

  let category;
  let products;
  try {
    [category, products] = await Promise.all([
      fetchCategoryPublic(slug),
      fetchProductsPublic({ category: slug, page_size: 60 }),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <main className="min-h-screen bg-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200 pb-6 pt-8">
            <h1 className="font-serif text-3xl font-bold text-gray-900 md:text-4xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-2 max-w-2xl text-gray-600">{category.description}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {products.count} {products.count === 1 ? "product" : "products"}
            </p>
          </div>

          {/* Rendered into the HTML above; ProductGrid re-fetches after
              hydration so a signed-in customer sees their own prices. */}
          <ProductGrid
            initialProducts={products.results}
            categorySlug={slug}
            categoryName={category.name}
          />
        </div>
      </main>
    </>
  );
}
