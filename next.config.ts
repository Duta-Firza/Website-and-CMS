import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-hosted on a GCP VM: emit a minimal `.next/standalone` bundle so the VM
  // runs `node server.js` without an on-box `next build` (avoids OOM on small
  // instances). CI builds this and rsyncs it over — see deploy/README.md.
  //
  // Vercel (the `development` deploy) is INCOMPATIBLE with standalone — it
  // produces symlinked node_modules that break Vercel's serverless packaging
  // ("invalid deployment package for a Serverless Function"). Vercel sets
  // VERCEL=1 at build time, so disable standalone there and let Vercel package
  // the app its own way.
  output: process.env.VERCEL ? undefined : "standalone",
  // File tracing can miss native binaries loaded via dynamic import. sharp
  // (image compression + next/image) and ffmpeg-static (video compression in
  // src/lib/storage/compress.ts) must be force-included or uploads fail at
  // runtime. `/*` targets every route (see next output config docs).
  outputFileTracingIncludes: {
    "/*": ["node_modules/sharp/**/*", "node_modules/ffmpeg-static/**/*"],
  },
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
