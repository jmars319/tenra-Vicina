import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), "../..")
  },
  transpilePackages: [
    "@rally/api-contracts",
    "@rally/auth",
    "@rally/config",
    "@rally/domain",
    "@rally/geo",
    "@rally/privacy",
    "@rally/realtime",
    "@rally/shared-types",
    "@rally/ui",
    "@rally/validation"
  ]
};

export default nextConfig;
