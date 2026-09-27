import type { NextConfig } from "next";

const apiOrigin = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  transpilePackages: ["@nina/ui", "@nina/contracts", "@nina/exercise-engine"],
  agentRules: false,
  async rewrites() {
    return [{ source: "/v1/:path*", destination: `${apiOrigin}/v1/:path*` }];
  },
};

export default nextConfig;
