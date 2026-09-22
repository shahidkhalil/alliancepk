"use client";

import { usePathname } from "next/navigation";
import { Phone, ArrowRight } from "lucide-react";
import { useForm } from "@/context/FormContext";
import { usePackageOrder } from "@/context/PackageOrderContext";
import { SALES_TEL_HREF } from "@/lib/siteContact";
import { trackPhoneClick } from "@/lib/analytics";

const HIDDEN_PREFIXES = ["/admin", "/ai-receptionist"];

/**
 * Mobile-only closer: Call + Book.
 * On /pricing, Book opens the package request for the plan currently in view.
 */
export default function MobileStickySalesBar() {
  const pathname = usePathname() || "";
  const { openForm, isOpen } = useForm();
  const { focused, openOrder, selection } = usePackageOrder();

  const onPricing = pathname.startsWith("/pricing");
  const canBookPlan = onPricing && Boolean(focused);

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p)) || isOpen || selection) return null;

  return (
    <>
      <div
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md px-3 sm:px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-w-full overflow-x-clip"
        role="navigation"
        aria-label="Quick contact"
      >
        <div className="flex gap-2 max-w-lg mx-auto w-full min-w-0">
          {SALES_TEL_HREF ? (
            <a
              href={SALES_TEL_HREF}
              onClick={() => trackPhoneClick("mobile_sticky")}
              data-analytics-label="phone_click"
              data-analytics-location="mobile_sticky"
              className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-[#00283C]/20 text-[#00283C] text-xs font-black"
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
          {canBookPlan && focused ? (
            <button
              type="button"
              onClick={() => openOrder(focused)}
              data-analytics-label="book_selected_package"
              data-analytics-location="mobile_sticky_pricing"
              className="flex-[1.35] min-w-0 py-3 rounded-xl bg-[#00283C] text-white text-xs font-black px-2 flex flex-col items-center justify-center leading-tight"
            >
              <span className="inline-flex items-center gap-1">
                Book {focused.packageName}
                <ArrowRight className="w-3 h-3" aria-hidden />
              </span>
              <span className="text-[10px] font-semibold text-white/70 mt-0.5 truncate max-w-full">
                {focused.price}
                {focused.period ? ` · ${focused.period.replace(/^\//, "").trim()}` : ""}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openForm}
              data-analytics-label="book_consultation"
              data-analytics-location="mobile_sticky"
              className="flex-1 min-w-0 py-3 rounded-xl bg-[#00283C] text-white text-xs font-black px-1"
            >
              Book Strategy Call
            </button>
          )}
        </div>
      </div>
      {/* Spacer so content isn't covered on mobile */}
      <div className={`lg:hidden ${canBookPlan ? "h-[5.25rem]" : "h-[4.5rem]"}`} aria-hidden />
    </>
  );
}
