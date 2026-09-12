// Alias Vercel Neon (Marketplace) auto-injected Postgres env vars to
// DATABASE_URL as early as possible so `prisma generate` at build time and
// any build-time DB access resolve the connection string that Prisma reads
// from schema.prisma. Mirrors the same fallback in src/lib/db.ts.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
