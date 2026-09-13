import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdf-parse",
    "@napi-rs/canvas",
    "pdfjs-dist",
    "@browserbasehq/stagehand",
    "@browserbasehq/sdk",
  ],
};

export default nextConfig;
