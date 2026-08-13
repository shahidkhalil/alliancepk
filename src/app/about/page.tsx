import type { Metadata } from "next";
import PageWrapper from "@/components/PageWrapper";
import FAQ from "@/components/FAQ";
import AboutContact from "@/components/AboutContact";
import AboutHero from "@/components/AboutHero";
import AboutBody from "@/components/AboutBody";

export const metadata: Metadata = {
  title: "About Alliance Tech | AI & Growth Agency for Healthcare Clinics",
  description:
    "Alliance Tech is the AI and growth partner for US healthcare clinics — helping practices get more patients with automation, websites, SEO, and marketing.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <PageWrapper>
      <AboutHero />
      <AboutBody />
      <AboutContact />
      <FAQ />
    </PageWrapper>
  );
}
