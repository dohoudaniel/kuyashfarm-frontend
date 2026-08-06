import { ImageResponse } from "next/og";

/**
 * The icon iOS uses when somebody adds the shop to their home screen.
 *
 * Without one, Safari screenshots the page and uses that — which on a slow
 * connection means a screenshot of a half-loaded page becomes the app icon.
 */
export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a3d2b 0%, #2d5f3f 100%)",
          color: "#e8d5a3",
          fontSize: 104,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
        }}
      >
        K
      </div>
    ),
    size,
  );
}
