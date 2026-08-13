import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Alliance Tech",
  description:
    "Book a free clinic growth audit. We'll review your online presence and show you where you're losing patients.",
  alternates: { canonical: "/about" },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
