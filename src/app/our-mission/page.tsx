"use client";

import { useEffect } from "react";

/** Legacy URL — content lives on /about#mission */
export default function OurMissionRedirect() {
  useEffect(() => {
    window.location.replace("/about#mission");
  }, []);

  return (
    <main className="min-h-[40vh] flex items-center justify-center px-6">
      <p className="text-sm text-gray-500">
        Redirecting to{" "}
        <a href="/about#mission" className="text-[#0077A8] font-semibold hover:underline">
          About Us — Our Mission
        </a>
        …
      </p>
    </main>
  );
}
