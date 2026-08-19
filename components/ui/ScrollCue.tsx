"use client";

/**
 * The "there is more below" cue at the bottom of the hero.
 *
 * **What it replaces.** A rounded rectangle with a pulsing dot inside it — the
 * mouse-with-a-scroll-wheel icon that appears on a very large number of
 * generated landing pages. It is one of the most recognisable template tells
 * on the web, and it depicts a device most of this shop's customers are not
 * holding: on a phone there is no mouse and no wheel, so the metaphor is not
 * merely generic, it is wrong.
 *
 * **What this is instead.** A seed falling into a furrow. The vertical hairline
 * is the furrow — it echoes the irrigation channel running down through the
 * hero photograph — and the wheat-coloured dot is a seed dropping into it and
 * settling. It says "downward" without borrowing anybody else's hardware, and
 * it belongs to a farm rather than to a template.
 *
 * **It is a button, not a decoration.** The original was an inert `div`: it
 * told you to scroll and would not do it. This scrolls one viewport on tap or
 * Enter, which matters most on the phone where the gesture it describes is the
 * least convenient thing about a full-bleed hero. It also gives the mark a
 * real 44px target, where the old one was unfocusable and untappable.
 *
 * **The fall is a CSS animation** (`.seed-fall` in `globals.css`), not a
 * JavaScript one. An infinite decorative loop is what CSS animations are for,
 * and the global `prefers-reduced-motion` block neutralises it with no hook
 * and no branch here. The framer version of this was subtly broken in a way
 * that only a frame-by-frame capture revealed: it settled on its last keyframe
 * at opacity 0 and never looped, so the seed was in the DOM, the right size
 * and the right colour, and invisible on every frame.
 */

import { useReducedMotion } from "framer-motion";

/** How tall the furrow is, in pixels. The keyframes travel this far. */
const FURROW = 40;

export function ScrollCue({ label = "See what we grow" }: { label?: string }) {
  const reduced = useReducedMotion();

  function scrollOn() {
    window.scrollTo({
      top: window.innerHeight,
      // Honour the same preference the animation does — a smooth-scrolled jump
      // is sustained movement too.
      behavior: reduced ? "auto" : "smooth",
    });
  }

  return (
    <button
      type="button"
      onClick={scrollOn}
      aria-label={label}
      // A faint scrim, for the same reason the hero's buttons carry one: this
      // sits over a photograph whose bottom-centre happens to be sunlit water,
      // and a 2px mark there competes with the highlights whatever colour it
      // is. Subtle enough to read as shade on the image rather than as a
      // control pasted on top of it.
      className="absolute bottom-8 left-1/2 z-10 flex min-h-11 min-w-11 -translate-x-1/2 flex-col items-center justify-end rounded-full bg-black/20 px-3 pb-2 backdrop-blur-[2px] transition-colors hover:bg-black/30"
    >
      {/*
        A wrapper wide enough for the seed, with the furrow drawn inside it.

        The seed was originally a child of the furrow, which is 2px wide and
        clipped its overflow — so an 8px dot was trimmed to a 2px sliver. They
        are siblings now: the furrow sets the visual, the wrapper sets the
        space, and nothing clips anything.
      */}
      <span aria-hidden="true" className="relative block" style={{ height: FURROW, width: 10 }}>
        {/* The furrow, fading in from the top so it reads as a channel
            receding rather than a line that simply stops. */}
        <span className="absolute left-1/2 top-0 block h-full w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-white/60 to-white/90" />

        {/* The seed. `left-1/2` with the centring handled inside the keyframes,
            because a CSS animation on `transform` replaces any transform set
            in a class — a `-translate-x-1/2` utility here would be overwritten
            the moment the animation started, and the seed would sit 4px right
            of the furrow. */}
        <span className="seed-fall absolute left-1/2 top-0 block h-2 w-2 rounded-full bg-wheat shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
      </span>
    </button>
  );
}
