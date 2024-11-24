/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@repo/ui", "@ahiochat/chatbot"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};
