import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const isGhPages = process.env.DEPLOY_TARGET === "ghpages";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isGhPages
    ? {
        output: "export",
        basePath: "/geoexplorer",
        images: { unoptimized: true },
      }
    : {}),
  turbopack: {
    root: dirname,
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
