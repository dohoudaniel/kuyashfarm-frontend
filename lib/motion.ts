/**
 * The motion vocabulary. Everything animated uses these.
 *
 * There were 158 `transition-*` classes in this codebase and exactly **two**
 * `ease-*` specifications, so 156 of them ran on the browser's default timing
 * function. That is most of why the interface felt cheap: real objects
 * accelerate and settle with weight, and linear motion reads as machinery.
 *
 * **Restrained on purpose.** This is a shop people use weekly. Motion you
 * *watch* becomes motion you resent by the tenth visit, so durations are short
 * and distances small — the aim is that a customer feels the interface
 * responding without ever waiting for it. Nothing here bounces except the one
 * place where a bounce carries meaning (see `pop`).
 *
 * Mirrors the CSS custom properties in `app/globals.css`, so a component
 * animating in JavaScript and one animating in Tailwind agree. If you change a
 * number here, change it there.
 */

/** Milliseconds. Anything longer than `slow` needs a reason. */
export const DURATION = {
  /** Colour, opacity, small state flips. Below the threshold of noticing. */
  quick: 0.12,
  /** The default. Drawers, reveals, anything that moves a short distance. */
  base: 0.22,
  /** Larger surfaces: a full-width panel, a modal. */
  slow: 0.4,
} as const;

export const EASE = {
  /** Decelerating. Things entering the screen or settling into place. */
  out: [0.22, 1, 0.36, 1] as const,
  /** Symmetric. Things moving between two known positions. */
  inOut: [0.4, 0, 0.2, 1] as const,
  /** Slight overshoot. Only where the overshoot means something. */
  back: [0.34, 1.4, 0.64, 1] as const,
};



/**
 * The one deliberate overshoot: a count that has just changed.
 *
 * A number incrementing is easy to miss, and the cart badge is the *only*
 * confirmation a customer gets that the thing they tapped worked. The bounce
 * is doing a job here rather than decorating.
 */
export const pop = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.28, 1],
    transition: { duration: 0.32, ease: EASE.back },
  },
};

/** Shared `whileInView` config: animate once, slightly before fully on screen. */
export const inView = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-60px" },
} as const;

/** Press feedback. Small — a button that squashes 10% feels like a toy. */
export const tap = { scale: 0.97 } as const;

/** Hover lift for cards. 2px reads as "raised"; 8px reads as "flying". */
export const lift = {
  y: -2,
  transition: { duration: DURATION.quick, ease: EASE.out },
} as const;
