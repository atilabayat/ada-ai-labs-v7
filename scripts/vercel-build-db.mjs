// Runs during Vercel build only. Validates schema on the committed dev.db.
// The dev.db bundled by NFT is the source of truth (contains all seeded +
// user wikis, 60 skills). We only validate schema; don't modify data.
import fs from "fs";
import { execSync } from "child_process";

if (!process.env.VERCEL) {
  console.log("[vercel-db] skipping (not on Vercel)");
  process.exit(0);
}

const src = "prisma/dev.db";
const tmp = "/tmp/ada-validate.db";

if (!fs.existsSync(src)) {
  console.error(`[vercel-db] ERROR: ${src} not found`);
  process.exit(1);
}

// Copy committed dev.db to temp for schema validation only
fs.copyFileSync(src, tmp);
console.log(`[vercel-db] validating schema on committed db (${fs.statSync(src).size}b)`);

execSync("npx prisma db push --skip-generate", {
  env: { ...process.env, DATABASE_URL: `file:${tmp}` },
  stdio: "inherit",
});

console.log(`[vercel-db] schema validated; committed ${src} bundled unchanged`);
