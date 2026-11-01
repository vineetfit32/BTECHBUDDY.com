import type { NextConfig } from "next";

type RemotePattern = Exclude<NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number], URL>;

const ownHosts: RemotePattern[] = [process.env.NEXT_PUBLIC_APP_URL, ...(process.env.ASSET_HOSTS ?? "").split(",")]
  .map((value) => value?.trim())
  .filter((value): value is string => Boolean(value))
  .flatMap((value) => {
    try {
      const url = new URL(value.includes("://") ? value : `https://${value}`);
      return [{ protocol: url.protocol === "http:" ? "http" : "https", hostname: url.hostname, port: url.port || undefined }];
    } catch {
      return [];
    }
  });

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), display-capture=(self), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  serverExternalPackages: ["ffmpeg-static", "ffprobe-static"],
  images: {
    remotePatterns: ownHosts,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
