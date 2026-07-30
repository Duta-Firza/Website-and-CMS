import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Vercel builds the `development` deploy and sets VERCEL=1. Two VM-only settings
// below must be OFF on Vercel because both surface pnpm's symlinked node_modules
// store in Vercel's serverless package and fail with "invalid deployment package
// for a Serverless Function ... files in symlinked directories":
//   - output: "standalone"        → emits a bundle with symlinked node_modules.
//   - outputFileTracingIncludes   → forces node_modules/sharp & ffmpeg-static
//                                    (symlinks into .pnpm) into every trace.
// Both exist purely for the self-hosted VM build (see deploy/README.md); Vercel
// packages the app its own way and provides sharp natively, so we skip them.
const isVercel = !!process.env.VERCEL;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isVercel
    ? {}
    : {
        // Self-hosted VM: minimal `.next/standalone` bundle so the VM runs
        // `node server.js` without an on-box `next build` (avoids OOM). CI
        // builds this and rsyncs it over.
        output: "standalone" as const,
        // Force-trace native binaries loaded via dynamic import in
        // src/lib/storage/compress.ts, else image/video uploads fail at runtime.
        outputFileTracingIncludes: {
          "/*": ["node_modules/sharp/**/*", "node_modules/ffmpeg-static/**/*"],
        },
      }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: `/${process.env.GCS_BUCKET || "duta-firza-media"}/**`,
      },
      { protocol: "https", hostname: "dutafirza.com", pathname: "/**" },
    ],
  },
  experimental: {
    // Cache Components new in Next.js 16 — enable when we have data fetching to cache.
    // cacheComponents: true,
  },
  // Permanent (301) redirects for routes restructured under section parents.
  // Keeps external links + SEO equity flowing to the new locations.
  async redirects() {
    const moves = [
      { from: "leadership", to: "about/leadership" },
      { from: "history", to: "about/history" },
      { from: "business", to: "about/business" },
      { from: "credentials", to: "about/credentials" },
      { from: "partners", to: "solutions/trading/partners" },
      { from: "newsroom", to: "investor-relations/publications/newsroom" },
      { from: "company-profile", to: "investor-relations/publications/company-profile" },
      { from: "careers", to: "contact/careers" },
    ];
    return moves.flatMap(({ from, to }) => [
      {
        source: `/id/${from}`,
        destination: `/id/${to}`,
        permanent: true,
      },
      {
        source: `/en/${from}`,
        destination: `/en/${to}`,
        permanent: true,
      },
    ]);
  },
};

export default withNextIntl(nextConfig);
