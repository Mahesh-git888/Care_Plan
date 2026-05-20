import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `pg` uses dynamic requires that Next's bundler should not try to inline.
  // Keep it external so it's loaded at runtime in the Node.js server.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
