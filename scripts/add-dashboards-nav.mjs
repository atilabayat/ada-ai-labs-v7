/**
 * Inserts "Dashboards" into the Quant Lab nav section between
 * "Support and Resistance Profiles" (sortOrder 3) and "Bloomberg Terminal" (sortOrder 4).
 * Run: node scripts/add-dashboards-nav.mjs
 * Safe to re-run — removes any stale duplicate before inserting.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const sectionId = "quant";
  const route     = "/dashboards";
  const label     = "Dashboards";

  const section = await prisma.navSection.findUnique({ where: { id: sectionId } });
  if (!section) {
    console.error("Quant Lab section not found. Run the seed first.");
    process.exit(1);
  }

  // Remove stale duplicate
  await prisma.navItem.deleteMany({ where: { sectionId, route } });

  // Insert after S/R Profiles (sortOrder 3), before Bloomberg Terminal (sortOrder 4)
  const insertAt = 4;

  // Shift Bloomberg Terminal and anything above it to make room
  await prisma.navItem.updateMany({
    where: { sectionId, sortOrder: { gte: insertAt } },
    data:  { sortOrder: { increment: 1 } },
  });

  await prisma.navItem.create({
    data: { sectionId, label, route, icon: "▦", sortOrder: insertAt },
  });

  console.log(`✓ Inserted "${label}" at sortOrder ${insertAt} in Quant Lab`);

  const items = await prisma.navItem.findMany({
    where:   { sectionId },
    orderBy: { sortOrder: "asc" },
  });
  console.log("\nQuant Lab nav order:");
  items.forEach(i => console.log(`  ${i.sortOrder}  ${i.icon}  ${i.label}  →  ${i.route}`));
  console.log("\n✅  Dashboards tab is live in the Quant Lab sidebar.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
