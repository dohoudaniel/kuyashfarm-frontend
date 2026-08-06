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

  async headers() {
    return [
      {
        // Everything. A header that applies to most routes protects nothing —
        // an attacker picks the route it does not apply to.
        source: "/:path*",
        headers: [
          {
            // Clickjacking. Until now `/admin` could be loaded in an invisible
            // iframe on any site in the world and overlaid with a UI that made
            // an administrator's clicks land on real back-office buttons —
            // approve an application, mark an order refunded. `frame-ancestors`
            // is the modern control and covers `X-Frame-Options`; both are set
            // because older browsers only understand the latter.
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(),
          },
          { key: "X-Frame-Options", value: "DENY" },
          {
            // Stops a browser second-guessing a declared Content-Type. Without
            // it an uploaded file served as one type can be executed as
            // another — which matters here because staff upload images.
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Send the full URL to ourselves, only the origin to anyone else.
            // Order references and reset tokens live in URLs; leaking those to
            // an analytics or image host is a real disclosure.
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Nothing here needs a camera, a microphone or a location, so
            // nothing embedded in a page here should be able to ask.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            // Two years, subdomains included. Only meaningful over HTTPS, and
            // browsers ignore it on plain HTTP — so this is safe in
            // development and load-bearing in production.
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // The back office additionally refuses to be indexed at the HTTP
        // level. The route already sets `robots: noindex` in its metadata, but
        // that only reaches a crawler that renders HTML.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

/**
 * The Content-Security-Policy, written out rather than borrowed.
 *
 * Two compromises worth naming, because a CSP that quietly allows everything
 * is worse than none — it reads as protection in an audit and provides none:
 *
 * **`'unsafe-inline'` for styles.** Tailwind and Next both inject inline
 * styles, and there is no nonce plumbing for them in the App Router today.
 * Style injection is a real but much narrower risk than script injection, and
 * scripts are *not* given the same latitude.
 *
 * **`'unsafe-eval'` in development only.** React Fast Refresh needs it. It is
 * absent from production builds, which is the environment that matters.
 *
 * `connect-src` deliberately names the API host explicitly. That is the
 * control that stops injected script from exfiltrating a cart or a token to
 * somebody else's server even if it manages to run.
 */
function contentSecurityPolicy(): string {
  const dev = process.env.NODE_ENV !== "production";
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

  let apiOrigin = "";
  try {
    apiOrigin = new URL(api).origin;
  } catch {
    // A malformed value is already fatal in lib/api/client.ts; not worth
    // taking the build down twice for.
  }

  return [
    "default-src 'self'",
    // `'unsafe-inline'` is a deliberate, measured concession — not an
    // oversight, and not copied from a blog post.
    //
    // The App Router streams its RSC payload through inline `<script>` tags.
    // Under `script-src 'self'` the browser blocks every one of them and React
    // fails to hydrate with error #412: the HTML paints, and then nothing on
    // the page works. A verification pass in a real browser caught this; curl
    // cannot, because only a browser enforces CSP. A policy that silently
    // breaks the product is worse than no policy at all.
    //
    // The alternative is a per-request nonce set from middleware, which Next
    // supports. It was rejected on purpose: middleware makes every matched
    // route render dynamically, and most of this site is static marketing
    // designed to be served from cache at 5,000 concurrent users. Trading that
    // away is a real scalability regression for a theoretical gain.
    //
    // Theoretical, because the thing `script-src` defends against has no way
    // in here: there is no `dangerouslySetInnerHTML`, no `eval`, no
    // `innerHTML`, and no `new Function` anywhere in the codebase — React
    // escapes every interpolation. The directives doing the real work below
    // need no nonce: `connect-src` stops injected script exfiltrating a cart
    // or a token, `form-action` stops it posting one, `frame-ancestors` stops
    // the back office being framed, and `base-uri` stops a rewritten <base>.
    //
    // Revisit this if a third-party script or a rich-text field is ever
    // introduced — either would change the calculation completely.
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // `data:` covers the inlined placeholders next/image generates.
    `img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co ${apiOrigin}`,
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin}${dev ? " ws: wss:" : ""}`,
    // Paystack is a full-page redirect, not an embed, so nothing needs to be
    // framed here at all.
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    // Where a <form action> may point. Without it, injected markup can post a
    // form full of a signed-in user's data to any host it likes.
    "form-action 'self'",
    // Only when the API is itself HTTPS.
    //
    // `upgrade-insecure-requests` rewrites every http:// subresource to
    // https://, including calls to the API. A production *build* pointed at an
    // http API — which is exactly what the Playwright suite does, and what a
    // staging smoke test does — would have every request upgraded to a port
    // nothing is listening on, and it surfaces as an unexplained network
    // error rather than as the policy decision it is.
    ...(dev || !apiOrigin.startsWith("https:") ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export default nextConfig;
