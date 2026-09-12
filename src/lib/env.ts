// Alias Vercel Neon Storage env vars (POSTGRES_*) to the names our app uses.
// Vercel's Neon Marketplace integration injects POSTGRES_URL, POSTGRES_PRISMA_URL,
// and POSTGRES_URL_NON_POOLING, but Prisma is configured to read DATABASE_URL.
// This module must be imported before any Prisma client is instantiated.

if (!process.env.DATABASE_URL) {
  const fallback =
    process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
  if (fallback) {
    process.env.DATABASE_URL = fallback;
  }
}

if (!process.env.DATABASE_URL_DIRECT) {
  const directFallback =
    process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (directFallback) {
    process.env.DATABASE_URL_DIRECT = directFallback;
  }
}

export {};
