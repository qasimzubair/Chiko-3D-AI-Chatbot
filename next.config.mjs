/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress cross-origin warnings in development
  devIndicators: {
    buildActivity: false
  }
};

export default nextConfig;
