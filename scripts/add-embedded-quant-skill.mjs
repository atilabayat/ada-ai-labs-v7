/**
 * Registers the embedded-quant-sources skill in the ADA AI Labs skill library.
 * Run: node scripts/add-embedded-quant-skill.mjs
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const id = "embedded-quant-sources";

  const existing = await prisma.skill.findUnique({ where: { id } });

  const data = {
    name:      "/embedded-quant-sources",
    cat:       "quant",
    group:     "Embedded KB",
    desc:      "Vetted quant KB: 12 TA strategies with entry/exit rules, 100 indicators, complete 35-row IPA pattern table (v3.0) with SVP confluence, and 21-scenario hedge-fund options playbook with Greeks. Auto-selects relevant reference files by prompt context.",
    uses:      0,
    ver:       "1.1",
    sortOrder: (await prisma.skill.count()) + 1,
  };

  if (existing) {
    await prisma.skill.update({ where: { id }, data });
    console.log("✓ Updated skill:", id);
  } else {
    await prisma.skill.create({ data: { id, ...data } });
    console.log("✓ Created skill:", id);
  }

  console.log("\n✅  /embedded-quant-sources is live in the Skill Library (Embedded KB · quant).");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
