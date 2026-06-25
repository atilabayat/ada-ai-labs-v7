/**
 * Inserts "Sources for Quants Research" at the top of the Quant Lab nav section
 * (sortOrder 0), shifting all existing items down by 1.
 *
 * Run: node scripts/add-sources-quant-nav.mjs
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Shift Market Floor (0→1), Call Wall (1→2), Bloomberg (2→3)
  await prisma.navItem.updateMany({
    where: { sectionId: "quant", sortOrder: { gte: 0 } },
    data:  { sortOrder: { increment: 1 } },
  });

  // Insert the new item at the top
  await prisma.navItem.create({
    data: {
      label:     "Sources for Quants Research",
      route:     "/sources-quant",
      icon:      "⊕",
      sectionId: "quant",
      sortOrder: 0,
    },
  });

  // Verify
  const items = await prisma.navItem.findMany({
    where:   { sectionId: "quant" },
    orderBy: { sortOrder: "asc" },
  });
  console.log("✓ Quant Lab nav order:");
  items.forEach((i) => console.log(`  [${i.sortOrder}] ${i.label}  →  ${i.route}`));
  console.log("\n✅  Nav item inserted successfully.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
