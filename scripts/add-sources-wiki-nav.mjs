/**
 * Inserts "Sources for Wiki Architecture" at the top of the Research nav section
 * (sortOrder 0), shifting all existing items down by 1.
 *
 * Run: node scripts/add-sources-wiki-nav.mjs
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.navItem.updateMany({
    where: { sectionId: "research", sortOrder: { gte: 0 } },
    data:  { sortOrder: { increment: 1 } },
  });

  await prisma.navItem.create({
    data: {
      label:     "Sources for Wiki Architecture",
      route:     "/sources-wiki",
      icon:      "⊗",
      sectionId: "research",
      sortOrder: 0,
    },
  });

  const items = await prisma.navItem.findMany({
    where:   { sectionId: "research" },
    orderBy: { sortOrder: "asc" },
  });
  console.log("✓ Research nav order:");
  items.forEach((i) => console.log(`  [${i.sortOrder}] ${i.label}  →  ${i.route}`));
  console.log("\n✅  Nav item inserted successfully.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
