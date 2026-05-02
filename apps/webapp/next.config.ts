import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), "../..")
  },
  transpilePackages: [
    "@vicina/api-contracts",
    "@vicina/auth",
    "@vicina/config",
    "@vicina/domain",
    "@vicina/geo",
    "@vicina/privacy",
    "@vicina/realtime",
    "@vicina/shared-types",
    "@vicina/ui",
    "@vicina/validation"
  ]
};

export default nextConfig;
