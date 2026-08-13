"use client";

import { useEffect } from "react";

/** Legacy URL — contact form lives on /about#contact */
export default function ContactRedirect() {
  useEffect(() => {
    window.location.replace("/about#contact");
  }, []);

  return (
    <main className="min-h-[40vh] flex items-center justify-center px-6">
      <p className="text-sm text-gray-500">
        Redirecting to{" "}
        <a href="/about#contact" className="text-[#0077A8] font-semibold hover:underline">
          About Us — Contact
        </a>
        …
      </p>
    </main>
  );
}
