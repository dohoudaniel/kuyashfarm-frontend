import type { MetadataRoute } from "next";

/**
 * The web app manifest.
 *
 * Makes the shop installable on Android, which matters here more than it would
 * elsewhere: most customers are on Android phones, and an installed shop is
 * one tap from the home screen rather than a URL somebody has to remember.
 *
 * `theme_color` is the brand green, so the phone's status bar matches the site
 * instead of flashing white on every navigation.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kuyash Integrated Farm",
    short_name: "Kuyash Farm",
    description:
      "Farm-fresh Nigerian produce delivered, with wholesale pricing and agricultural training.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#2d5f3f",
    orientation: "portrait",
    categories: ["shopping", "food", "education"],
    icons: [{ src: "/apple-icon", sizes: "180x180", type: "image/png" }],
  };
}
