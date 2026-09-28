import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const NEON_PRODUCTION_DATABASE_URL =
  "postgresql://neondb_owner:npg_J1i6YyUImWaC@ep-nameless-firefly-ayv71j3q.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || NEON_PRODUCTION_DATABASE_URL;
  process.env.DATABASE_URL = dbUrl;

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Always preserve prisma on globalThis to avoid connection exhaustion in serverless environments
globalForPrisma.prisma = prisma;
