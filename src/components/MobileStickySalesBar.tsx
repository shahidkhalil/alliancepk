"use client";

import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { useForm } from "@/context/FormContext";
import { SALES_TEL_HREF } from "@/lib/siteContact";
import { trackPhoneClick } from "@/lib/analytics";

const HIDDEN_PREFIXES = ["/admin"];

/**
 * Mobile-only closer for the US market: Call (or request a call) + Book strategy call.
 * Free audit stays on pages; this bar prioritizes phone / booked conversations.
 */
export default function MobileStickySalesBar() {
  const pathname = usePathname() || "";
  const { openForm, isOpen } = useForm();

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p)) || isOpen) return null;

  return (
    <>
      <div
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        role="navigation"
        aria-label="Quick contact"
      >
        <div className="flex gap-2 max-w-lg mx-auto">
          {SALES_TEL_HREF ? (
            <a
              href={SALES_TEL_HREF}
              onClick={() => trackPhoneClick("mobile_sticky")}
              data-analytics-label="phone_click"
              data-analytics-location="mobile_sticky"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-[#00283C]/20 text-[#00283C] text-xs font-black"
            >
              <Phone className="w-3.5 h-3.5" aria-hidden />
              Call
            </a>
          ) : (
            <button
              type="button"
              onClick={openForm}
              data-analytics-label="request_callback"
              data-analytics-location="mobile_sticky"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-[#00283C]/20 text-[#00283C] text-xs font-black"
            >
              <Phone className="w-3.5 h-3.5" aria-hidden />
              Request a Call
            </button>
          )}
          <button
            type="button"
            onClick={openForm}
            data-analytics-label="book_consultation"
            data-analytics-location="mobile_sticky"
            className="flex-1 py-3 rounded-xl bg-[#00283C] text-white text-xs font-black"
          >
            Book Strategy Call
          </button>
        </div>
      </div>
      {/* Spacer so content isn't covered on mobile */}
      <div className="h-[4.5rem] lg:hidden" aria-hidden />
    </>
  );
}
