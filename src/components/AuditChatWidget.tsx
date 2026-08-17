"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, ClipboardCheck } from "lucide-react";
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
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;
    const t = setTimeout(() => setShowNudge(true), 12000);
    const dismiss = () => setShowNudge(false);
    window.addEventListener("scroll", dismiss, { once: true, passive: true });
    const autoHide = window.setTimeout(dismiss, 8000);
    return () => {
      clearTimeout(t);
      clearTimeout(autoHide);
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
          className={`light-island fixed bottom-[5.5rem] left-3 right-3 z-[60] flex max-h-[min(560px,calc(100vh-7.5rem))] flex-col overflow-hidden rounded-2xl border border-[#0077A8]/15 bg-white shadow-2xl transition-all duration-200 sm:bottom-24 sm:left-auto sm:right-6 sm:w-full sm:max-w-[380px] ${
            open ? "translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-4 opacity-0"
          }`}
        >
          <div className="flex flex-shrink-0 items-center justify-between bg-[#00283C] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#0077A8]/40 text-[#00B4D8]">
                <ClipboardCheck className="h-4 w-4" strokeWidth={2} />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#00283C] bg-[#00B4D8]" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-white">Alliance Audit Bot</p>
                <p className="text-[11px] leading-tight text-white/70">Free AI website audit · online</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Minimize chat"
            >
              <X className="h-4 h-4" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <AuditChat heightClass="" />
          </div>
        </div>
      )}

      {showNudge && !open && (
        <button
          type="button"
          onClick={openChat}
          aria-label="Open free website audit chat"
          className="fixed bottom-24 right-6 z-[59] hidden max-w-[220px] rounded-2xl rounded-br-sm border border-[#00B4D8]/20 bg-white/95 px-4 py-3 text-left shadow-xl backdrop-blur-sm lg:block"
        >
          <p className="mb-0.5 text-xs font-bold text-[#00283C]">Free website audit</p>
          <p className="text-xs leading-snug text-[#00283C]/60">
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
        className="fixed bottom-5 right-4 z-[60] group sm:right-6"
        aria-label={open ? "Close free website audit chat" : "Open free website audit chat"}
      >
        {open ? (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00283C] text-white shadow-xl transition-transform hover:scale-105 sm:h-16 sm:w-16">
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
        ) : (
          <span
            className="relative flex max-sm:h-14 max-sm:w-14 max-sm:items-center max-sm:justify-center max-sm:p-0 items-center gap-2.5 rounded-full py-2.5 pl-2.5 pr-4 shadow-2xl transition-transform hover:scale-105 sm:gap-3 sm:py-3 sm:pl-3 sm:pr-5"
            style={{ background: "linear-gradient(135deg, #00283C, #0077A8)" }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-[#7DD3EA] max-sm:h-full max-sm:w-full sm:h-11 sm:w-11"
              aria-hidden="true"
            >
              <ClipboardCheck className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-extrabold text-white">Free Website Audit</span>
              <span className="block text-[11px] text-white/80">AI checkup in 30 sec</span>
            </span>
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00B4D8] opacity-60" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-[#00B4D8]" />
            </span>
          </span>
        )}
      </button>
    </>
  );
}
