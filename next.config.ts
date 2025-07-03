/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hydel.in',
        pathname: '/**', // allows all images under hydel.in
      },
    ],
  },
};

module.exports = nextConfig;
