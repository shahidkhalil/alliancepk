"use client";
import { useEffect } from "react";
import PageWrapper from "@/components/PageWrapper";
import { trackEvent } from "@/lib/analytics";

export default function NotFound() {
  useEffect(() => {
    trackEvent("error", {
      error_type: "404",
      page: window.location.pathname,
      fatal: false,
    });
  }, []);

  return (
    <PageWrapper>
      <section className="service-hero relative overflow-hidden text-center">
        <div aria-hidden className="service-hero-atmosphere absolute inset-0" />
        <div aria-hidden className="service-hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-lg px-6 pb-24 pt-40">
          <p className="service-hero-badge mb-5 inline-flex">404</p>
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
            This page took a wrong turn
          </h1>
          <p className="mb-8 text-[#a8c6d3]">
            The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on track.
          </p>
          <a href="/" className="service-hero-cta inline-flex">
            Back to Home
          </a>
        </div>
      </section>
    </PageWrapper>
  );
}
