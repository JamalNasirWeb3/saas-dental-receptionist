import type { NextConfig } from "next";

const BACKEND = "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/session", destination: `${BACKEND}/session` },
      { source: "/chat", destination: `${BACKEND}/chat` },
      { source: "/transcribe", destination: `${BACKEND}/transcribe` },
      { source: "/api/appointments", destination: `${BACKEND}/api/appointments` },
      {
        source: "/api/appointments/:id/cancel",
        destination: `${BACKEND}/api/appointments/:id/cancel`,
      },
      {
        source: "/api/admin/change-password",
        destination: `${BACKEND}/api/admin/change-password`,
      },
      { source: "/api/settings", destination: `${BACKEND}/api/settings` },
    ];
  },
};

export default nextConfig;
