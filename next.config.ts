/** @type {import('next').NextConfig} */
const nextConfig = {
  // firebase-admin pulls in jwks-rsa -> jose, which ships as pure ESM. When
  // Turbopack/webpack tries to bundle that dependency chain into a
  // CommonJS server bundle (as happens on Vercel's production build), it
  // fails with `ERR_REQUIRE_ESM` at runtime even though `next dev` works
  // fine locally (dev doesn't bundle the same way). Marking firebase-admin
  // as an external package tells Next.js to skip bundling it and load it
  // natively via Node's own require/import at runtime instead, which
  // avoids the broken rewrite entirely. This is the documented fix for
  // this exact class of issue:
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages
  serverExternalPackages: ['firebase-admin'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hydel.in',
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