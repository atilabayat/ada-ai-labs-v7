// Runs during Vercel build only. Copies the committed dev.db to /tmp,
// applies any pending schema changes (Linux Prisma binary adds missing
// columns the Windows binary missed), then copies it back so NFT bundles
// the schema-correct db for Lambda cold-start copies.
import fs from "fs";
import { execSync } from "child_process";

if (!process.env.VERCEL) {
  console.log("[vercel-db] skipping (not on Vercel)");
  process.exit(0);
}

const src = "prisma/dev.db";
const tmp = "/tmp/ada-build.db";

if (!fs.existsSync(src)) {
  console.error(`[vercel-db] ERROR: ${src} not found`);
  process.exit(1);
}

fs.copyFileSync(src, tmp);
console.log(`[vercel-db] copied ${src} → ${tmp} (${fs.statSync(tmp).size}b)`);

execSync("npx prisma db push --skip-generate", {
  env: { ...process.env, DATABASE_URL: `file:${tmp}` },
  stdio: "inherit",
});

fs.copyFileSync(tmp, src);
console.log(`[vercel-db] schema-synced db written back to ${src} (${fs.statSync(src).size}b)`);
