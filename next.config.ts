import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/**
 * This app lives inside a larger MERN workspace that has its own lockfile, so
 * Next would otherwise infer the parent directory as the project root. Pinning
 * it keeps module resolution and output tracing scoped to this project.
 */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * The Sanity project id is public by design (it ships in the Studio bundle), so
 * reading it here to scope the image CDN pattern is safe. When it is unset the
 * site runs in "local content" mode and no remote images are allowed at all.
 */
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    // The site and the Studio are separate root layouts, so there is no single layout
    // to compose a 404 from. This renders our own page for URLs that match no route.
    globalNotFound: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // AVIF first, WebP fallback. Browsers negotiate via the Accept header.
    formats: ["image/avif", "image/webp"],
    // Only these qualities may be requested (Next 16 requires an allow-list).
    qualities: [60, 75, 85],
    // Explicit, project-scoped remote host. Nothing from homes.com / MLS CDNs is
    // allowed: those photos are not cleared for reuse (see docs/ASSETS.md).
    remotePatterns: sanityProjectId
      ? [
          {
            protocol: "https",
            hostname: "cdn.sanity.io",
            pathname: `/images/${sanityProjectId}/**`,
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Allows the Presentation tool (Studio) to preview the site in an
          // iframe, while still preventing third-party framing.
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://*.sanity.studio",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
