import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Mission | Alliance Tech",
  description:
    "Why Alliance Tech exists: closing the digital infrastructure gap holding back skilled dental and aesthetic clinics across the United States.",
  alternates: { canonical: "/about" },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
