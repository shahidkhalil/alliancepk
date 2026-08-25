"use client";

import { useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";

/** Stagger between siblings in a card grid. */
export const STAGGER_MS = 0;

/** Viewport trigger — once per card, as the grid enters the screen. */
export const VIEWPORT_ONCE = { once: true, amount: 0.12 } as const;

export const EASE_OUT = [0, 0, 0.2, 1] as const;

export const cardEntranceHidden = { opacity: 1, y: 0 };
export const cardEntranceVisible = { opacity: 1, y: 0 };

export function staggerDelay(index: number, step = STAGGER_MS) {
  return index * step;
}

export function cardEntranceTransition(delay = 0, reduced = false): Transition {
  return { duration: 0 };
}

/** Static card states. */
export const cardHoverLiftVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: 0, scale: 1 },
  tap: { y: 0, scale: 1 },
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
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0 },
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
      initial: cardEntranceVisible,
      whileInView: cardEntranceVisible,
      viewport: VIEWPORT_ONCE,
      transition: { duration: 0 },
    }),

    /** For menus / above-the-fold grids — animate on mount instead of scroll. */
    entranceAnimate: (delay = 0) => ({
      initial: cardEntranceVisible,
      animate: cardEntranceVisible,
      transition: { duration: 0 },
    }),

    hoverProps: (_enabled = true) => ({}),

    iconMicro: (_filled = false) => ({}),

    expandTransition: (): Transition =>
      reducedMotion ? { duration: 0 } : { duration: 0.25, ease: EASE_OUT },
  };
}
