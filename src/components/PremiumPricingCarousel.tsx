"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { ServicePricing } from "@/lib/pricingData";
import { usePackageOrder } from "@/context/PackageOrderContext";

const PREVIEW_COUNT = 4;
const SPRING = { type: "spring" as const, stiffness: 180, damping: 22, mass: 0.9 };
const PRIMARY = "#31AABE";
const REDUCED_SPRING = { type: "tween" as const, duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

function parsePriceParts(price: string): { prefix: string; value: number; suffix: string } {
  const match = String(price || "").match(/^([^0-9]*)([\d,]+)(.*)$/);
  if (!match) return { prefix: price || "", value: 0, suffix: "" };
  return {
    prefix: match[1] || "",
    value: parseInt(match[2].replace(/,/g, ""), 10) || 0,
    suffix: match[3] || "",
  };
}

function formatThousands(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function AnimatedPrice({ price, active }: { price: string; active: boolean }) {
  const { prefix, value, suffix } = useMemo(() => parsePriceParts(price), [price]);
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 120, damping: 20, mass: 0.8 });
  const display = useTransform(spring, (v) => `${prefix}${formatThousands(v)}${suffix}`);
  const [text, setText] = useState(`${prefix}${formatThousands(value)}${suffix}`);

  useEffect(() => {
    if (!active) {
      mv.set(value);
      setText(`${prefix}${formatThousands(value)}${suffix}`);
      return;
    }
    const controls = animate(mv, value, { duration: 0.75, ease: [0.22, 1, 0.36, 1] });
    const unsub = display.on("change", setText);
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, active, prefix, suffix, mv, display]);

  return (
    <span className="tabular-nums" aria-label={price}>
      {text}
    </span>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className="mt-[3px] flex-shrink-0 w-[17px] h-[17px] rounded-full flex items-center justify-center"
        style={{ background: `${PRIMARY}22` }}
      >
        <Check className="w-2.5 h-2.5" style={{ color: PRIMARY }} strokeWidth={3} />
      </span>
      <span className="text-sm leading-snug text-[#64748B]">{text}</span>
    </li>
  );
}

function GlassPricingCard({
  pkg,
  service,
  active,
  reduceMotion,
  onHeightChange,
  flat = false,
}: {
  pkg: ServicePricing["packages"][number];
  service: ServicePricing;
  active: boolean;
  reduceMotion: boolean;
  onHeightChange?: (h: number) => void;
  /** Desktop grid: no 3D tilt / cover-flow inactive styling */
  flat?: boolean;
}) {
  const { openOrder } = usePackageOrder();
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const smoothX = useSpring(tiltX, { stiffness: 200, damping: 20 });
  const smoothY = useSpring(tiltY, { stiffness: 200, damping: 20 });

  const preview = pkg.features.slice(0, PREVIEW_COUNT);
  const rest = pkg.features.slice(PREVIEW_COUNT);
  const hasMore = rest.length > 0;
  const lit = flat || active;
  const allowTilt = !flat && active && !reduceMotion;

  useEffect(() => {
    if (!active && !flat) setExpanded(false);
  }, [active, flat]);

  useEffect(() => {
    if (!active || flat || !cardRef.current || !onHeightChange) return;
    const el = cardRef.current;
    const report = () => onHeightChange(el.getBoundingClientRect().height);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, expanded, onHeightChange, pkg.name, flat]);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!allowTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(Math.max(-6, Math.min(6, py * -12)));
    tiltY.set(Math.max(-6, Math.min(6, px * 12)));
  };

  const onLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={
        flat
          ? undefined
          : {
              rotateX: allowTilt ? smoothX : 0,
              rotateY: allowTilt ? smoothY : 0,
              transformStyle: "preserve-3d",
            }
      }
      whileHover={flat && !reduceMotion ? { y: -8 } : undefined}
      transition={flat ? { type: "spring", stiffness: 320, damping: 24 } : undefined}
      className={`relative w-full rounded-[1.35rem] overflow-hidden will-change-transform h-full ${
        flat && pkg.popular ? "lg:-mt-2 lg:mb-2" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute -inset-2 rounded-[1.5rem] -z-10"
        style={{
          boxShadow: lit
            ? pkg.popular && flat
              ? `0 36px 64px -22px rgba(15,23,42,0.22), 0 16px 32px -12px rgba(49,170,190,0.35)`
              : `0 30px 60px -20px rgba(15,23,42,0.18), 0 12px 28px -12px rgba(49,170,190,0.28)`
            : `0 16px 40px -24px rgba(15,23,42,0.12)`,
        }}
      />

      <div
        className="relative flex flex-col rounded-[1.35rem] border backdrop-blur-xl h-full"
        style={{
          background: pkg.popular && flat
            ? "linear-gradient(165deg, #ffffff 0%, #F0FAFC 55%, #E8F7FB 100%)"
            : "linear-gradient(165deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)",
          borderColor: "rgba(255,255,255,0.15)",
          boxShadow: lit
            ? pkg.popular && flat
              ? `inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1.5px ${PRIMARY}, 0 0 48px rgba(49,170,190,0.18)`
              : `inset 0 1px 0 rgba(255,255,255,0.85), 0 0 0 1px rgba(49,170,190,0.18), 0 0 40px rgba(49,170,190,0.12)`
            : `inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 1px rgba(15,23,42,0.06)`,
        }}
      >
        {!flat && active && !reduceMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[1.35rem]"
          >
            <motion.div
              className="absolute top-0 bottom-0 w-1/3 -skew-x-12"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              }}
              initial={{ left: "-40%", opacity: 0 }}
              animate={{ left: ["-40%", "120%"], opacity: [0, 0.7, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 4.6, ease: "easeInOut" }}
            />
          </motion.div>
        )}

        {pkg.popular && (
          <div
            className="text-white text-[10px] font-black tracking-[0.18em] text-center py-2 uppercase"
            style={{ background: PRIMARY }}
          >
            Most Popular
          </div>
        )}

        <div className="p-6 sm:p-7 flex flex-col flex-1 relative z-[1]">
          <p
            className="text-[11px] font-black uppercase tracking-[0.14em] mb-4"
            style={{ color: PRIMARY }}
          >
            {pkg.name}
          </p>

          <div className="mb-4">
            <div className="text-4xl sm:text-[2.75rem] font-black tracking-tight leading-none text-[#0F172A]">
              <AnimatedPrice price={pkg.price} active={lit} />
            </div>
            <div className="text-xs font-semibold mt-1.5 uppercase tracking-wider text-[#64748B]">
              {pkg.period}
            </div>
            {pkg.savings && (
              <span
                className="inline-block mt-3 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${PRIMARY}18`, color: PRIMARY }}
              >
                {pkg.savings}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed mb-6 text-[#64748B]">{pkg.description}</p>

          <button
            type="button"
            onClick={() =>
              openOrder({
                serviceId: service.id,
                serviceName: service.name,
                packageName: pkg.name,
                price: pkg.price,
                period: pkg.period,
              })
            }
            className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white transition-opacity hover:opacity-90"
            style={{
              background: pkg.popular && flat
                ? `linear-gradient(135deg, ${PRIMARY}, #1F8FA3)`
                : flat
                  ? "#0F172A"
                  : `linear-gradient(135deg, ${PRIMARY}, #2499AD)`,
              boxShadow: pkg.popular || !flat ? `0 10px 24px -8px ${PRIMARY}88` : "0 8px 20px -10px rgba(15,23,42,0.35)",
            }}
          >
            {pkg.cta} <ArrowRight className="w-4 h-4" />
          </button>

          <div className="my-5 h-px bg-slate-100" />

          <div
            className={
              !flat && expanded
                ? "max-h-[220px] sm:max-h-[260px] overflow-y-auto overscroll-contain pr-1"
                : ""
            }
          >
            <ul className="space-y-2.5">
              {preview.map((f) => (
                <FeatureRow key={f} text={f} />
              ))}
            </ul>

            {hasMore && (
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.ul
                    key="rest"
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.22 }}
                    className="overflow-hidden space-y-2.5 mt-2.5"
                  >
                    {rest.map((f) => (
                      <FeatureRow key={f} text={f} />
                    ))}
                    {pkg.addOns && pkg.addOns.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-300">
                          Optional Add-ons
                        </p>
                        {pkg.addOns.map((a) => (
                          <p key={a} className="text-xs leading-relaxed text-[#64748B]">
                            + {a}
                          </p>
                        ))}
                      </div>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            )}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-1.5 text-xs font-bold transition-colors mt-auto pt-2"
              style={{ color: PRIMARY }}
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-250 ${expanded ? "rotate-180" : ""}`}
              />
              {expanded
                ? "Show less"
                : `Show ${rest.length} more feature${rest.length > 1 ? "s" : ""}`}
            </button>
          )}

          {!hasMore && pkg.addOns && pkg.addOns.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 mt-auto">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-300">
                Optional Add-ons
              </p>
              {pkg.addOns.map((a) => (
                <p key={a} className="text-xs leading-relaxed text-[#64748B]">
                  + {a}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function cardMotion(offset: number, reduceMotion: boolean) {
  const abs = Math.abs(offset);
  if (abs > 1.5) {
    return {
      x: offset * (reduceMotion ? 40 : 280),
      rotateY: reduceMotion ? 0 : offset > 0 ? 28 : -28,
      scale: reduceMotion ? 0.96 : 0.86,
      opacity: 0,
      z: reduceMotion ? 0 : -180,
      filter: reduceMotion ? "blur(0px)" : "blur(6px)",
      zIndex: 0,
    };
  }
  if (offset === 0) {
    return {
      x: 0,
      rotateY: 0,
      scale: 1,
      opacity: 1,
      z: 0,
      filter: "blur(0px)",
      zIndex: 30,
    };
  }
  const dir = offset > 0 ? 1 : -1;
  return {
      // Side cards peek with smaller offset so they don't blow past narrow phones
      x: dir * (reduceMotion ? 28 : 140),
      rotateY: reduceMotion ? 0 : dir * 14,
    scale: reduceMotion ? 0.96 : 0.9,
    opacity: reduceMotion ? 0.35 : 0.4,
    z: reduceMotion ? 0 : -120,
    filter: reduceMotion ? "blur(0px)" : "blur(4px)",
    zIndex: 10 - abs,
  };
}

function DesktopPricingGrid({ service }: { service: ServicePricing }) {
  const packages = service.packages;
  const single = service.fixedPrice || packages.length === 1;
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div className="relative w-full">
      {/* Soft ambient backdrop — flat, not 3D */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-8 bottom-8 rounded-[2rem] opacity-70"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${PRIMARY}18 0%, transparent 70%)`,
        }}
      />

      <div
        className={
          single
            ? "relative max-w-md mx-auto"
            : "relative grid grid-cols-3 gap-5 xl:gap-6 items-stretch"
        }
      >
        {packages.map((pkg, i) => (
          <motion.div
            key={`${service.id}-${pkg.name}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full ${pkg.popular && !single ? "z-[1]" : ""}`}
          >
            <GlassPricingCard
              pkg={pkg}
              service={service}
              active
              reduceMotion={reduceMotion}
              flat
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MobileCoverFlow({ service }: { service: ServicePricing }) {
  const packages = service.packages;
  const popularIdx = packages.findIndex((p) => p.popular);
  const [active, setActive] = useState(popularIdx >= 0 ? popularIdx : 0);
  const [stageH, setStageH] = useState(520);
  const count = packages.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelLock = useRef(0);
  const reduceMotion = usePrefersReducedMotion();
  const spring = reduceMotion ? REDUCED_SPRING : SPRING;

  useEffect(() => {
    const idx = packages.findIndex((p) => p.popular);
    setActive(idx >= 0 ? idx : 0);
  }, [service.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onActiveHeight = useCallback((h: number) => {
    setStageH(Math.max(420, Math.ceil(h + 48)));
  }, []);

  const go = useCallback(
    (next: number) => {
      if (count <= 1) return;
      if (next < 0 || next >= count) return;
      setActive(next);
    },
    [count]
  );

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (count <= 1) return;
    const threshold = 70;
    const velocity = info.velocity.x;
    if (info.offset.x < -threshold || velocity < -450) go(active + 1);
    else if (info.offset.x > threshold || velocity > 450) go(active - 1);
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el || count <= 1) return;
    const handler = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 20) return;
      const now = Date.now();
      if (now - wheelLock.current < 420) return;
      wheelLock.current = now;
      e.preventDefault();
      if (delta > 0) go(active + 1);
      else go(active - 1);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [active, count, go]);

  return (
    <div className="relative w-full max-w-full select-none overflow-x-clip">
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[78%] max-w-lg aspect-square rounded-full"
          style={{
            background: `radial-gradient(circle, ${PRIMARY}33 0%, ${PRIMARY}14 35%, transparent 70%)`,
            filter: "blur(10px)",
          }}
          animate={{ opacity: [0.4, 0.72, 0.4], scale: [0.92, 1.06, 0.92] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div
        ref={stageRef}
        className="relative mx-auto w-full max-w-3xl overflow-x-clip transition-[height] duration-300 ease-out"
        style={{
          perspective: reduceMotion ? undefined : "1800px",
          perspectiveOrigin: "50% 42%",
          height: stageH,
        }}
      >
        <div
          className="absolute inset-0 flex items-start justify-center pt-3 sm:pt-4"
          style={{ transformStyle: reduceMotion ? undefined : "preserve-3d" }}
        >
          {packages.map((pkg, i) => {
            const offset = i - active;
            const m = cardMotion(offset, reduceMotion);
            const isActive = offset === 0;

            return (
              <motion.div
                key={`${service.id}-${pkg.name}`}
                className={`absolute w-[min(100%,380px)] px-3 sm:px-0 ${
                  isActive ? "cursor-grab active:cursor-grabbing touch-none" : "cursor-pointer"
                }`}
                style={{
                  transformStyle: reduceMotion ? undefined : "preserve-3d",
                  zIndex: m.zIndex,
                  willChange: "transform, opacity, filter",
                }}
                initial={false}
                animate={{
                  x: m.x,
                  rotateY: m.rotateY,
                  scale: m.scale,
                  opacity: m.opacity,
                  z: m.z,
                  filter: m.filter,
                  y: isActive && !reduceMotion ? [0, -8, 0] : 0,
                }}
                transition={{
                  x: spring,
                  rotateY: spring,
                  scale: spring,
                  opacity: spring,
                  z: spring,
                  filter: { duration: reduceMotion ? 0 : 0.35 },
                  y:
                    isActive && !reduceMotion
                      ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.25 },
                }}
                drag={count > 1 && isActive ? "x" : false}
                dragConstraints={{ left: -160, right: 160 }}
                dragElastic={0.22}
                dragMomentum={false}
                onDragEnd={onDragEnd}
                onClick={() => {
                  if (!isActive) go(i);
                }}
              >
                <GlassPricingCard
                  pkg={pkg}
                  service={service}
                  active={isActive}
                  reduceMotion={reduceMotion}
                  onHeightChange={isActive ? onActiveHeight : undefined}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {count > 1 && (
        <div className="relative z-20 mt-3 flex flex-col items-center gap-3">
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              type="button"
              aria-label="Previous plan"
              onClick={() => go(Math.max(0, active - 1))}
              disabled={active === 0}
              className="w-11 h-11 rounded-full border border-slate-200 bg-white/90 backdrop-blur flex items-center justify-center text-[#0F172A] shadow-sm hover:border-[#31AABE]/50 hover:text-[#31AABE] transition-colors disabled:opacity-35 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-2 min-w-[140px] sm:min-w-[200px]">
              <div className="flex items-center gap-2" role="tablist" aria-label="Pricing plans">
                {packages.map((pkg, i) => {
                  const on = i === active;
                  return (
                    <button
                      key={pkg.name}
                      type="button"
                      role="tab"
                      aria-label={`Show ${pkg.name}`}
                      aria-selected={on}
                      onClick={() => go(i)}
                      className="h-2 rounded-full"
                      style={{
                        width: on ? 28 : 8,
                        background: on ? PRIMARY : "#CBD5E1",
                        transition: reduceMotion
                          ? "none"
                          : "width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.25s",
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap max-w-[260px] sm:max-w-none">
                {packages.map((pkg, i) => {
                  const on = i === active;
                  return (
                    <button
                      key={`label-${pkg.name}`}
                      type="button"
                      onClick={() => go(i)}
                      className={`px-2 py-0.5 text-[11px] sm:text-xs font-semibold rounded-md transition-colors ${
                        on ? "" : "text-[#94A3B8] hover:text-[#64748B]"
                      }`}
                      style={on ? { color: PRIMARY } : undefined}
                    >
                      {pkg.name}
                      {pkg.popular ? <span className="sr-only"> (most popular)</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              aria-label="Next plan"
              onClick={() => go(Math.min(count - 1, active + 1))}
              disabled={active >= count - 1}
              className="w-11 h-11 rounded-full border border-slate-200 bg-white/90 backdrop-blur flex items-center justify-center text-[#0F172A] shadow-sm hover:border-[#31AABE]/50 hover:text-[#31AABE] transition-colors disabled:opacity-35 disabled:pointer-events-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Mobile: 3D cover-flow. Desktop (lg+): flat side-by-side compare grid. */
export default function PremiumPricingCarousel({ service }: { service: ServicePricing }) {
  return (
    <>
      <div className="lg:hidden">
        <MobileCoverFlow service={service} />
      </div>
      <div className="hidden lg:block">
        <DesktopPricingGrid service={service} />
      </div>
    </>
  );
}
