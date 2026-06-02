import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // GCS bucket public media (uncomment & fill once bucket is provisioned)
      // { protocol: "https", hostname: "storage.googleapis.com", pathname: "/<bucket>/**" },
      // add dutafirza.com
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
