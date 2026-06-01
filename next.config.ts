import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // GCS bucket public media (uncomment & fill once bucket is provisioned)
      // { protocol: "https", hostname: "storage.googleapis.com", pathname: "/<bucket>/**" },
    ],
  },
  experimental: {
    // Cache Components new in Next.js 16 — enable when we have data fetching to cache.
    // cacheComponents: true,
  },
};

export default withNextIntl(nextConfig);
