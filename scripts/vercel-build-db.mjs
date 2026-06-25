// Runs during Vercel build only. Re-seeds the database from scratch.
// This ensures Vercel always has fresh 60-skill data regardless of what's
// committed to git. The seed runs in /tmp; prisma/dev.db is overwritten
// with the seeded result for bundling.
import fs from "fs";
import { execSync } from "child_process";

if (!process.env.VERCEL) {
  console.log("[vercel-db] skipping (not on Vercel)");
  process.exit(0);
}

const src = "prisma/dev.db";
const tmp = "/tmp/ada-seed.db";

// Delete and re-create from scratch
if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
if (fs.existsSync(src)) fs.unlinkSync(src);

console.log("[vercel-db] regenerating database from seed (Vercel build)");

// Run db push to create schema
execSync("npx prisma db push --skip-generate", {
  env: { ...process.env, DATABASE_URL: `file:${tmp}` },
  stdio: "inherit",
});

// Run seed to populate data
execSync("tsx prisma/seed.ts", {
  env: { ...process.env, DATABASE_URL: `file:${tmp}` },
  stdio: "inherit",
});

// Copy seeded db back to prisma/dev.db for bundling
fs.copyFileSync(tmp, src);
console.log(`[vercel-db] seeded db written to ${src} (${fs.statSync(src).size}b)`);
