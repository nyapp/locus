import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "locus";
const devOriginsFromEnv = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const defaultAllowedDevOrigins = ["100.64.1.114", "100.64.1.34"];

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repoName}` : "",
  },
  allowedDevOrigins: isProd
    ? undefined
    : [...new Set([...defaultAllowedDevOrigins, ...devOriginsFromEnv])],
};

export default nextConfig;
