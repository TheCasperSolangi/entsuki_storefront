/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
        {
        protocol: "https",
        hostname: "loremflickr.com",
      },
       {
        protocol: "https",
        hostname: "d1csarkz8obe9u.cloudfront.net",
      },
       {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "storage.entsuki.com"
      },
      {
        protocol: "https",
        hostname: "storage.entsuki.com"
      }
    ],
  },
};

export default nextConfig;
