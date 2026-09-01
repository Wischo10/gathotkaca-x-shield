/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Never expose server env vars to the client. Only NEXT_PUBLIC_* vars are
  // ever bundled into client code by Next.js — we deliberately define none
  // for credentials/API keys/URLs used in this project.
};
module.exports = nextConfig;
