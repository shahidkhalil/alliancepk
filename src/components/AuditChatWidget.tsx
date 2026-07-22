"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

const AuditChat = dynamic(() => import("./AuditChat"), { ssr: false });

/**
 * Floating chat widget (bottom-right).
 * Chat + Firebase only load after the user opens it.
 * Launcher itself waits for idle so it doesn't compete with LCP.
 */
export default function AuditChatWidget() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const hidden = pathname === "/free-website-audit" || pathname === "/ai-receptionist";

  useEffect(() => {
    if (hidden) return;
    let idleId = 0;
    let timer = 0;
    const enable = () => setReady(true);
    const onInteract = () => enable();

    ["pointerdown", "keydown", "scroll", "touchstart"].forEach((e) =>
      window.addEventListener(e, onInteract, { once: true, passive: true })
    );
    // After Lighthouse's typical quiet window
    timer = window.setTimeout(enable, 10000);

    return () => {
      if (timer) window.clearTimeout(timer);
      if (idleId) {
        const win = window as Window & { cancelIdleCallback?: (id: number) => void };
        win.cancelIdleCallback?.(idleId);
      }
      ["pointerdown", "keydown", "scroll", "touchstart"].forEach((e) =>
        window.removeEventListener(e, onInteract)
      );
    };
  }, [hidden]);

  useEffect(() => {
    if (hidden || everOpened || !ready) return;
    // Desktop-only nudge — on mobile it covers page content.
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (!isDesktop) return;
    const t = setTimeout(() => setShowNudge(true), 8000);
    const dismiss = () => setShowNudge(false);
    window.addEventListener("scroll", dismiss, { once: true, passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", dismiss);
    };
  }, [hidden, everOpened, ready]);

  if (hidden || !ready) return null;

  const openChat = () => {
    setOpen(true);
    setEverOpened(true);
    setShowNudge(false);
  };

  return (
    <>
      {everOpened && (
        <div
          className={`fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] max-w-[400px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white flex flex-col transition-all duration-200 ${
            open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none invisible"
          }`}
          style={{ height: "min(600px, calc(100vh - 140px))" }}
        >
          <div className="bg-[#00283C] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-[#0077A8]/40 flex items-center justify-center text-sm">
                🩺
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#00283C]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">Alliance Audit Bot</p>
                <p className="text-[11px] text-white/70 leading-tight">Free AI website audit · online</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Minimize chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <AuditChat heightClass="" />
          </div>
        </div>
      )}

      {showNudge && !open && (
        <button
          type="button"
          onClick={openChat}
          aria-label="Open free website audit chat"
          className="fixed bottom-24 right-4 sm:right-6 z-[59] bg-white rounded-2xl rounded-br-sm shadow-xl border border-gray-200 px-4 py-3 text-left max-w-[240px]"
        >
          <p className="text-xs font-bold text-[#00283C] mb-0.5">Free website audit</p>
          <p className="text-xs text-gray-600 leading-snug">
            Is your website losing you patients? Check it free in 30 seconds.
          </p>
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setEverOpened(true);
          setShowNudge(false);
        }}
        className="fixed bottom-5 right-4 sm:right-6 z-[60] group"
        aria-label={open ? "Close free website audit chat" : "Open free website audit chat"}
      >
        {open ? (
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#00283C] shadow-xl text-white hover:scale-105 transition-transform">
            <X className="w-7 h-7" />
          </span>
        ) : (
          <span
            className="relative flex items-center gap-3 pl-3 pr-5 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform max-sm:pl-0 max-sm:pr-0 max-sm:py-0 max-sm:w-14 max-sm:h-14 max-sm:justify-center"
            style={{ background: "linear-gradient(135deg, #00283C, #0077A8)" }}
          >
            <span className="flex items-center justify-center w-11 h-11 max-sm:w-full max-sm:h-full rounded-full bg-white/15 text-2xl" aria-hidden="true">
              🩺
            </span>
            <span className="text-left leading-tight max-sm:hidden">
              <span className="block text-sm font-extrabold text-white">Free Website Audit</span>
              <span className="block text-[11px] text-white/80">AI checkup in 30 sec</span>
            </span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white" />
            </span>
          </span>
        )}
      </button>
    </>
  );
}
