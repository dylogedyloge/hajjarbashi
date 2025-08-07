import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.hajjardevs.ir',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.10.106',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.10.6',
        pathname: '/**',
      },
    ],
    // Add better error handling for production
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Increase timeout for image optimization
    minimumCacheTTL: 60,
  },
  // Add experimental features for better image handling
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            typescript: true,
            icon: true,
          },
        },
      ],
    });
    return config;
  },
};

export default withNextIntl(nextConfig);
