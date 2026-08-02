/**
 * One class, by slug.
 *
 * Slug-keyed rather than id-keyed: the route used to take a numeric id that
 * matched nothing in the API, so a class added in the admin was unreachable.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { fetchClassesPublic, fetchClassPublic } from "@/lib/api/academy";
import { ClassDetailClient } from "./ClassDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Classes are read from the API, not from `lib/data/academy.ts`.
 *
 * The prototype rendered this page from a hardcoded array keyed by a numeric
 * id, which meant a class added through the admin was unreachable and the
 * "8 seats left" badge was a string in the source that never moved.
 */
async function load(slug: string) {
  try {
    return await fetchClassPublic(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cls = await load(slug);

  if (!cls) return { title: "Class not found | Kuyash Academy" };

  return {
    title: `${cls.title} | Kuyash Academy`,
    description: cls.description,
    openGraph: {
      title: `${cls.title} | Kuyash Academy`,
      description: cls.description,
      images: cls.image ? [{ url: cls.image }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  // Best-effort: if the API is unreachable at build time the route still works,
  // it just renders on demand instead of being prebuilt.
  try {
    const classes = await fetchClassesPublic();
    return classes.map((cls) => ({ slug: cls.slug }));
  } catch {
    return [];
  }
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cls = await load(slug);

  if (!cls) notFound();

  return <ClassDetailClient cls={cls} />;
}
