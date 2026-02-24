import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.REPO_NAME || '';

const nextConfig: NextConfig = {
  transpilePackages: ['recharts'],
  output: 'export',
  ...(isGitHubPages && repoName ? {
    basePath: `/${repoName}/dashboard`,
    assetPrefix: `/${repoName}/dashboard`,
  } : {
    basePath: '/dashboard',
  }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
