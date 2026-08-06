/**
 * Product detail.
 *
 * A route the prototype never had — products were terminal cards with nowhere
 * to click through to, which is a meaningful gap for a shop that wants to be
 * found. Server-rendered, so the description and price are in the HTML.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailClient } from "@/components/shop/ProductDetailClient";
import { fetchProductPublic } from "@/lib/api/catalogue";
import { ApiError } from "@/lib/api/client";

interface PageProps {
  params: Promise<{ category: string; product: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product: slug } = await params;
  try {
    const product = await fetchProductPublic(slug);
    return {
      title: `${product.name} — Kuyash Integrated Farm`,
      description: product.description || product.long_description.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.primary_image ? [product.primary_image] : undefined,
      },
    };
  } catch {
    return { title: "Product — Kuyash Integrated Farm" };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { category, product: slug } = await params;

  let product;
  try {
    product = await fetchProductPublic(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <main className="min-h-screen bg-white pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ProductDetailClient initialProduct={product} categorySlug={category} />
        </div>
      </main>
    </>
  );
}
