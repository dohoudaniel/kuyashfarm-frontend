import { Metadata } from "next";
import { BlogClient } from "./BlogClient";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Blog — Kuyash Integrated Farm",
  description:
    "Research, practical guides and field-tested insights to help you farm better, smarter and sustainably.",
  openGraph: {
    title: "Kuyash Agriculture Journal",
    description: "Practical knowledge for modern Nigerian agriculture.",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <BlogClient />
      <Footer />
    </>
  );
}
