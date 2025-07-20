import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  transpilePackages: ['preline'],
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.('.svg'),
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      }
    );

    if (fileLoaderRule) {
        fileLoaderRule.exclude = /\.svg$/i;
    }

    // Ignore .ts files in preline/src to fix Preline/Next.js error
    config.module.rules.push({
      test: /\.ts$/,
      include: /node_modules[\\/]preline[\\/]src/,
      use: 'ignore-loader',
    });

    return config;
  },
};

export default nextConfig;
