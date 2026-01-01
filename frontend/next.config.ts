import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only treat these file extensions as pages under the legacy `pages/` router.
  // This avoids conflicts with any leftover `pages/*.js` files while using the
  // `app/` router (app directory lives in `src/app/`).
  pageExtensions: ["tsx", "ts", "jsx"],
};

export default nextConfig;
