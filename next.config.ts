import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["mysql2", "basic-ftp"],
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      {
        source: "/policies/replacement",
        destination: "/policies/return-refund",
        permanent: true,
      },
      {
        source: "/catalog",
        destination: "/shop",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "www.aikvis.com", pathname: "/_next/image/**" },
      { protocol: "https", hostname: "asset.svarnibeauty.com" },
    ],
  },
};

export default nextConfig;
