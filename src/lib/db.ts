import { PrismaClient } from "@prisma/client";

// Vercel's Neon (Marketplace) integration injects POSTGRES_* env vars —
// commonly POSTGRES_PRISMA_URL (pooled, safe for Prisma) and POSTGRES_URL,
// but not DATABASE_URL, which is what Prisma reads via schema.prisma. Alias
// them here BEFORE constructing PrismaClient so a fresh Vercel + Neon setup
// works with zero manual env wiring.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
