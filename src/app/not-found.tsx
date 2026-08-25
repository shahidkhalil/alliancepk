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
      <section className="pt-40 pb-24 bg-white text-center">
        <div className="max-w-lg mx-auto px-6">
          <p className="text-sm font-bold tracking-widest text-[#00B4D8] mb-4">404</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mb-4">
            This page took a wrong turn
          </h1>
          <p className="text-gray-500 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on track.
          </p>
          <a href="/" className="btn-dark px-6 py-3 text-sm inline-block">
            Back to Home
          </a>
        </div>
      </section>
    </PageWrapper>
  );
}
