/**
 * Inserts "Gamma Exposure Heatmaps" into the Quant Lab nav section at sortOrder 3
 * (immediately below "Call Wall Put Wall System" at sortOrder 2).
 * Shifts S/R Profiles (3→4), Dashboards (4→5), Bloomberg Terminal (5→6).
 *
 * Run: node scripts/add-gex-heatmap-nav.mjs
 * Safe to re-run — removes any stale entry before inserting.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const sectionId = "quant";
  const route     = "/gex-heatmap";
  const label     = "Gamma Exposure Heatmaps";
  const insertAt  = 3;  // just below Call Wall Put Wall System (sortOrder 2)

  const section = await prisma.navSection.findUnique({ where: { id: sectionId } });
  if (!section) {
    console.error("Quant Lab section not found. Run the seed first.");
    process.exit(1);
  }

  // Remove stale duplicate entry
  await prisma.navItem.deleteMany({ where: { sectionId, route } });

  // Shift S/R Profiles, Dashboards, Bloomberg Terminal up by 1
  await prisma.navItem.updateMany({
    where: { sectionId, sortOrder: { gte: insertAt } },
    data:  { sortOrder: { increment: 1 } },
  });

  await prisma.navItem.create({
    data: { sectionId, label, route, icon: "γ", sortOrder: insertAt },
  });

  console.log(`✓ Inserted "${label}" at sortOrder ${insertAt} in Quant Lab`);

  const items = await prisma.navItem.findMany({
    where:   { sectionId },
    orderBy: { sortOrder: "asc" },
  });
  console.log("\nQuant Lab nav order:");
  items.forEach((i) => console.log(`  ${i.sortOrder}  ${i.icon}  ${i.label}  →  ${i.route}`));
  console.log("\n✅  Gamma Exposure Heatmaps is live in the Quant Lab sidebar.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
