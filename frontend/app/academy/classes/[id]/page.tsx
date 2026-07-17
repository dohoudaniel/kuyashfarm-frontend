import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ACADEMY_CLASSES } from "@/lib/data/academy";
import { ClassDetailClient } from "./ClassDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cls = ACADEMY_CLASSES.find((c) => c.id === Number(id));

  if (!cls) {
    return { title: "Class Not Found | Kuyash Academy" };
  }

  return {
    title: `${cls.title} | Kuyash Academy`,
    description: cls.description,
    openGraph: {
      title: `${cls.title} | Kuyash Academy`,
      description: cls.description,
      images: [{ url: cls.image }],
    },
  };
}

export async function generateStaticParams() {
  return ACADEMY_CLASSES.map((cls) => ({ id: String(cls.id) }));
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cls = ACADEMY_CLASSES.find((c) => c.id === Number(id));

  if (!cls) notFound();

  return <ClassDetailClient cls={cls} />;
}
