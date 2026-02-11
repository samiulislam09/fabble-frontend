/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    APP_API_URL: process.env.APP_API_URL,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
