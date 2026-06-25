/**
 * Inserts "Reference Source API 1" and "Reference Source API 2" into the
 * Workspace nav section, between AI Builder (sortOrder 0) and Dashboard.
 *
 * Run: node scripts/add-reference-api-nav.mjs
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Shift Dashboard (1→3) and Applications (2→4) to make room for two new items
  await prisma.navItem.updateMany({
    where: { sectionId: "workspace", sortOrder: { gte: 1 } },
    data:  { sortOrder: { increment: 2 } },
  });

  // Insert the two new items
  await prisma.navItem.createMany({
    data: [
      {
        label:     "Reference Source API 1",
        route:     "/reference-api-1",
        icon:      "⊟",
        sectionId: "workspace",
        sortOrder: 1,
      },
      {
        label:     "Reference Source API 2",
        route:     "/reference-api-2",
        icon:      "⊠",
        sectionId: "workspace",
        sortOrder: 2,
      },
    ],
  });

  // Verify final order
  const items = await prisma.navItem.findMany({
    where:   { sectionId: "workspace" },
    orderBy: { sortOrder: "asc" },
  });
  console.log("✓ Workspace nav order:");
  items.forEach((i) => console.log(`  [${i.sortOrder}] ${i.label}  →  ${i.route}`));
  console.log("\n✅  Nav items inserted successfully.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
