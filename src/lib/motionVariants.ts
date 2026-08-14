"use client";

import { useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";

/** Stagger between siblings in a card grid. */
export const STAGGER_MS = 0.06;

/** Viewport trigger — once per card, as the grid enters the screen. */
export const VIEWPORT_ONCE = { once: true, amount: 0.12 } as const;

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const cardEntranceHidden = { opacity: 0, y: 22 };
export const cardEntranceVisible = { opacity: 1, y: 0 };

export function staggerDelay(index: number, step = STAGGER_MS) {
  return index * step;
}

export function cardEntranceTransition(delay = 0, reduced = false): Transition {
  if (reduced) return { duration: 0 };
  return { duration: 0.55, delay, ease: EASE_OUT };
}

/** Soft lift on hover — transform only for performance. */
export const cardHoverLiftVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01 },
  tap: { y: -1, scale: 0.995 },
};

export const cardHoverNoneVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: 0, scale: 1 },
  tap: { y: 0, scale: 1 },
};

export function staggerContainerVariants(reduced = false): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduced ? 0 : STAGGER_MS },
    },
  };
}

export function staggerItemVariants(reduced = false): Variants {
  return {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduced
        ? { duration: 0 }
        : { duration: 0.5, ease: EASE_OUT },
    },
  };
}

/** Shared hook — respects prefers-reduced-motion via Framer Motion. */
export function useCardMotion() {
  const reducedMotion = useReducedMotion() ?? false;

  return {
    reducedMotion,
    viewport: VIEWPORT_ONCE,
    staggerDelay,
    containerVariants: staggerContainerVariants(reducedMotion),
    itemVariants: staggerItemVariants(reducedMotion),

    entrance: (delay = 0) => ({
      initial: reducedMotion ? cardEntranceVisible : cardEntranceHidden,
      whileInView: cardEntranceVisible,
      viewport: VIEWPORT_ONCE,
      transition: cardEntranceTransition(delay, reducedMotion),
    }),

    /** For menus / above-the-fold grids — animate on mount instead of scroll. */
    entranceAnimate: (delay = 0) => ({
      initial: reducedMotion ? cardEntranceVisible : cardEntranceHidden,
      animate: cardEntranceVisible,
      transition: cardEntranceTransition(delay, reducedMotion),
    }),

    hoverProps: (enabled = true) =>
      !enabled || reducedMotion
        ? {}
        : {
            initial: "rest" as const,
            whileHover: "hover" as const,
            whileTap: "tap" as const,
            variants: cardHoverLiftVariants,
            transition: { duration: 0.28, ease: EASE_OUT },
          },

    iconMicro: (_filled = false) =>
      reducedMotion
        ? {}
        : {
            whileHover: { scale: 1.06, rotate: -2 },
            transition: { duration: 0.25, ease: EASE_OUT },
          },

    expandTransition: (): Transition =>
      reducedMotion ? { duration: 0 } : { duration: 0.28, ease: EASE_OUT },
  };
}
