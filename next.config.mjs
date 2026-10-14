/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.CATCH_STATIC_EXPORT === "1" ? { output: "export", trailingSlash: true } : {}),
};

export default nextConfig;
