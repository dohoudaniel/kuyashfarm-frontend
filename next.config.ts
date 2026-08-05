import type { NextConfig } from "next";

/**
 * Where `next/image` is allowed to load from.
 *
 * Anything not listed is blocked, and the failure mode is a broken image with
 * an error only in the server log — so a photograph uploaded through the back
 * office would appear to upload fine and then simply not render, with nothing
 * on the page saying why.
 *
 * The API's own host has to be here because uploaded product photographs are
 * served from it: from Supabase Storage in production, and from Django's
 * `/media/` in development, which is a *different origin* to the Next dev
 * server. Deriving it from `NEXT_PUBLIC_API_URL` keeps the two in step,
 * including under WSL where that value is the VM's IP rather than localhost.
 */
function apiImagePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

  try {
    const api = new URL(configured);
    return [
      {
        protocol: api.protocol.replace(":", "") as "http" | "https",
        hostname: api.hostname,
        port: api.port,
        pathname: "/**",
      },
    ];
  } catch {
    // A malformed value must not take the build down over image config;
    // `resolveApiBaseUrl` in lib/api/client.ts already fails loudly for it.
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(apiImagePatterns() ?? []),
      // Supabase Storage, when product media is served straight from the
      // bucket rather than proxied through Django.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      // Marketing photography on the static pages. These are hotlinked
      // placeholders of somebody else's farm and want replacing with real
      // photographs — but removing the pattern before the images exist breaks
      // every marketing section at once.
      { protocol: "https", hostname: "images.unsplash.com", port: "", pathname: "/**" },
    ],
  },
};

export default nextConfig;
