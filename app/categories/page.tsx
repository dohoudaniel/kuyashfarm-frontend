/**
 * Category listing.
 *
 * A Server Component reading the live catalogue. It previously mapped over a
 * `FARM_CATEGORIES` constant, so the categories a customer saw were whatever
 * was hardcoded in the bundle at build time — deactivate a category in the
 * back office and the shop kept advertising it.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { fetchCategoriesPublic } from "@/lib/api/catalogue";

export const metadata: Metadata = {
  title: "Shop by category",
  description:
    "Fresh vegetables, fruits, poultry, dairy, grains and fish from Kuyash Farms.",
};

export default async function CategoriesPage() {
  const categories = await fetchCategoriesPublic();

  return (
    <>
      <main className="min-h-screen bg-linear-to-b from-white via-green-50/30 to-white pt-24 pb-16">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-green-600/30 bg-green-50 px-6 py-2">
              <Sparkles className="h-4 w-4 text-green-600" />
              <span className="font-sans text-sm font-medium text-green-700">
                Premium farm products
              </span>
            </div>

            <h1 className="mb-6 font-serif text-5xl font-bold leading-tight md:text-6xl">
              <span className="block bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Visit our farm
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-sans text-lg text-gray-600 md:text-xl">
              Fresh, sustainable produce from our integrated farm.
            </p>
          </div>

          {categories.length === 0 ? (
            <p className="py-16 text-center text-gray-600">
              Our catalogue is being updated. Please check back shortly.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop/${category.slug}`}
                  className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                >
                  <div className="relative h-80 overflow-hidden rounded-3xl bg-gray-100 shadow-lg transition-shadow duration-500 hover:shadow-2xl">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-linear-to-br from-green-100 to-emerald-50">
                        <span className="font-serif text-3xl text-green-700">{category.name}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h2 className="font-serif text-2xl font-bold">{category.name}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-white/85">
                        {category.description}
                      </p>
                      <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
                        {category.product_count}{" "}
                        {category.product_count === 1 ? "product" : "products"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
