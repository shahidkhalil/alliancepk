"use client";

import { ReactNode, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Extra layered orbs/grid behind content */
  atmosphere?: boolean;
  /** Parallax travel in px for glow layer */
  intensity?: number;
  id?: string;
};

/**
 * Soft scroll-parallax shell for marketing sections.
 * Keeps children interactive; atmosphere layers are decorative only.
 */
export default function ParallaxSection({
  children,
  className = "",
  atmosphere = true,
  intensity = 28,
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const glowY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [intensity, -intensity]
  );
  const gridY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-intensity * 0.35, intensity * 0.35]
  );
  const fade = useTransform(
    scrollYProgress,
    [0, 0.18, 0.82, 1],
    reduceMotion ? [1, 1, 1, 1] : [0.88, 1, 1, 0.92]
  );

  return (
    <section ref={ref} id={id} className={`relative overflow-hidden ${className}`}>
      {atmosphere && (
        <>
          <motion.div
            aria-hidden
            style={{ y: glowY }}
            className="parallax-glow pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#00B4D8]/15 blur-3xl"
          />
          <motion.div
            aria-hidden
            style={{ y: glowY }}
            className="parallax-glow pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#0077A8]/12 blur-3xl"
          />
          <motion.div
            aria-hidden
            style={{ y: gridY, opacity: 0.35 }}
            className="parallax-grid pointer-events-none absolute inset-0"
          />
        </>
      )}
      <motion.div style={{ opacity: fade }} className="relative z-[1]">
        {children}
      </motion.div>
    </section>
  );
}
