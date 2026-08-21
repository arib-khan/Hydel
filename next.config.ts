/** @type {import('next').NextConfig} */
const nextConfig = {
  plugins: ["@tailwindcss/postcss"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hydel.co.in',
        pathname: '/**', // allows all images under hydel.in
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // product images uploaded through the admin panel
      },
    ],
  },
};

module.exports = nextConfig;
