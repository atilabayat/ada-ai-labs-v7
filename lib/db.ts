import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// On Vercel the deployed filesystem is read-only; SQLite needs write access
// even for reads (WAL journal). At build time, scripts/vercel-build-db.mjs
// applies schema migrations and copies the result back to prisma/dev.db so
// the NFT bundle has the correct schema. At runtime cold starts, we copy the
// bundled db to /tmp on first use.
function resolveDbUrl(): string {
  if (!process.env.VERCEL) return process.env.DATABASE_URL ?? "file:./prisma/dev.db";

  const tmpPath = "/tmp/ada-dev.db";
  if (!fs.existsSync(tmpPath)) {
    const candidates = [
      path.resolve(process.cwd(), "prisma/dev.db"),
      path.resolve(__dirname, "../prisma/dev.db"),
      path.resolve(__dirname, "../../prisma/dev.db"),
    ];
    for (const src of candidates) {
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, tmpPath);
        break;
      }
    }
  }
  return `file:${tmpPath}`;
}

const dbUrl = resolveDbUrl();
if (process.env.VERCEL) process.env.DATABASE_URL = dbUrl;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
