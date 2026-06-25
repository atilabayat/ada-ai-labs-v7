/**
 * Inserts "Support and Resistance Profiles" into the Quant Lab nav section,
 * between "Call Wall Put Wall System" and "Bloomberg Terminal".
 * Run: node scripts/add-sr-profiles-nav.mjs
 * Safe to re-run — removes any stale duplicate before inserting.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const sectionId = "quant";
  const route     = "/sr-profiles";
  const label     = "Support and Resistance Profiles";

  const section = await prisma.navSection.findUnique({ where: { id: sectionId } });
  if (!section) {
    console.error("Quant Lab section not found. Run the seed first.");
    process.exit(1);
  }

  // Remove stale duplicate
  await prisma.navItem.deleteMany({ where: { sectionId, route } });

  // Insert after "Call Wall Put Wall System"
  const callWall = await prisma.navItem.findFirst({
    where: { sectionId, route: "/quant?view=walls" },
  });
  const insertAt = (callWall?.sortOrder ?? 2) + 1;

  // Shift items at insertAt and above to make room
  await prisma.navItem.updateMany({
    where: { sectionId, sortOrder: { gte: insertAt } },
    data:  { sortOrder: { increment: 1 } },
  });

  await prisma.navItem.create({
    data: { sectionId, label, route, icon: "≡", sortOrder: insertAt },
  });

  console.log(`✓ Inserted "${label}" at sortOrder ${insertAt} in Quant Lab`);

  // Confirm final order
  const items = await prisma.navItem.findMany({
    where:   { sectionId },
    orderBy: { sortOrder: "asc" },
  });
  console.log("\nQuant Lab nav order:");
  items.forEach(i => console.log(`  ${i.sortOrder}  ${i.icon}  ${i.label}  →  ${i.route}`));
  console.log("\n✅  S/R Profiles tab is live in the Quant Lab sidebar.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
