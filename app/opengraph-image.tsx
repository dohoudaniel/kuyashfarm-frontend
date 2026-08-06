import { ImageResponse } from "next/og";

/**
 * The share card, generated rather than hand-drawn.
 *
 * There was no Open Graph image at all, so pasting a Kuyash link into WhatsApp
 * — the channel most Nigerian commerce actually travels through — produced a
 * bare grey URL from an unfamiliar domain. That is a link people do not tap.
 *
 * Generated at build time from the brand palette instead of shipping a static
 * PNG, so it cannot fall out of step with the colours, and there is no binary
 * asset to redraw by hand when the wording changes.
 *
 * **This is Satori, not a browser.** It renders a deliberate subset of CSS and
 * two rules bite here:
 *
 *  * any element with more than one child needs an explicit `display` — the
 *    build *fails* otherwise, which is how the first version of this file
 *    broke the build rather than quietly shipping a bad image;
 *  * `<br />` counts as a child, so multi-line text is separate rows.
 *
 * Colours are written out because CSS custom properties do not exist here.
 * They are the values from `app/globals.css`.
 */
export const runtime = "nodejs";
export const alt = "Kuyash Integrated Farm — fresh Nigerian produce, delivered";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRIMARY_DARK = "#1a3d2b";
const WHEAT = "#e8d5a3";
const EDGE = "#c6dece";
const ACCENT = "#6b9d7a";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, #2d5f3f 100%)`,
          padding: 72,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: WHEAT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: PRIMARY_DARK,
              fontWeight: 700,
              marginRight: 18,
            }}
          >
            K
          </div>
          <div style={{ display: "flex", fontSize: 26, color: EDGE, letterSpacing: 2 }}>
            KUYASH INTEGRATED FARM
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Two rows rather than one string containing a <br />, which Satori
              counts as an additional child. */}
          <div style={{ display: "flex", fontSize: 76, color: "#ffffff", fontWeight: 700 }}>
            Fresh Nigerian produce,
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              color: "#ffffff",
              fontWeight: 700,
              marginBottom: 22,
            }}
          >
            delivered.
          </div>
          <div style={{ display: "flex", fontSize: 30, color: EDGE }}>
            From our own 40-acre farm. Retail, wholesale and distributor pricing.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: ACCENT }}>
          <div style={{ display: "flex", marginRight: 28 }}>Shop</div>
          <div style={{ display: "flex", marginRight: 28 }}>Wholesale</div>
          <div style={{ display: "flex" }}>Kuyash Farm Academy</div>
        </div>
      </div>
    ),
    size,
  );
}
