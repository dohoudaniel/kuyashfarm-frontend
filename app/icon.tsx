import { ImageResponse } from "next/og";

/**
 * The browser-tab icon.
 *
 * Replaces `app/favicon.ico`, which was the one `create-next-app` ships — so
 * every tab, bookmark and history entry for this shop carried Vercel's mark
 * rather than the farm's. It was the last piece of starter-template branding
 * left in the project, and the most visible: it sits in front of the customer
 * on every page.
 *
 * **A monogram rather than the wordmark.** The brand mark is the words "Kuyash
 * Integrated Farm" set in Playfair Display; at 16×16 that is a grey smear. The
 * "K" is the same letterform in the same serif on the same green, which is the
 * most of the identity that survives at this size.
 *
 * Generated rather than drawn, for the same reason as the Open Graph card: the
 * colours stay tied to the palette, and there is no binary asset to redraw by
 * hand. Built at build time in production, so the per-request cost visible in
 * `next dev` is a development artefact.
 *
 * Rendered by Satori, not a browser — see `app/opengraph-image.tsx` for the
 * constraints that implies. Colours are the literal values from
 * `app/globals.css`, because CSS custom properties do not exist here.
 */
export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // --primary-green. Flat rather than the gradient used at larger
          // sizes: a gradient across 32 pixels reads as muddiness, not depth.
          background: "#2d5f3f",
          // --wheat. The highest-contrast pair in the palette, which is what
          // decides whether the glyph is legible in a crowded tab strip.
          color: "#e8d5a3",
          // Sized against cap height, not against the box.
          //
          // A serif's capitals occupy roughly 0.7em, so a 30px font in a 32px
          // square drew a 21px letter floating in dead space — which at 16px
          // reads as a green tile with a smudge on it. 34 puts the cap at
          // about 24px of 32, which fills the square without clipping the
          // K's right arm.
          //
          // Satori has no bold cut of the fallback serif, so weight cannot
          // carry legibility here. Size has to.
          fontSize: 34,
          fontFamily: "Georgia, serif",
          lineHeight: 1,
        }}
      >
        K
      </div>
    ),
    size,
  );
}
