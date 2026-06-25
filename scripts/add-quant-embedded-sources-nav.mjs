/**
 * Inserts "Quant Embedded Sources" nav item into the Skills section,
 * immediately after Skill Library.
 * Run: node scripts/add-quant-embedded-sources-nav.mjs
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const sectionId = "skills";
  const route     = "/quant-embedded-sources";

  // Check section exists
  const section = await prisma.navSection.findUnique({ where: { id: sectionId } });
  if (!section) {
    console.error("Skills section not found in DB. Run the seed first.");
    process.exit(1);
  }

  // Remove any stale duplicate
  await prisma.navItem.deleteMany({ where: { sectionId, route } });

  // Find Skill Library's sortOrder to insert just after it
  const skillLib = await prisma.navItem.findFirst({
    where: { sectionId, route: "/skills" },
  });
  const insertAt = (skillLib?.sortOrder ?? 0) + 1;

  // Shift items at insertAt and above
  await prisma.navItem.updateMany({
    where: { sectionId, sortOrder: { gte: insertAt } },
    data: { sortOrder: { increment: 1 } },
  });

  // Insert the new item
  await prisma.navItem.create({
    data: {
      sectionId,
      label:     "Quant Embedded Sources",
      route,
      icon:      "⊘",
      sortOrder: insertAt,
    },
  });

  console.log(`✓ Inserted "Quant Embedded Sources" at sortOrder ${insertAt} in Skills section`);
  console.log("\n✅  Quant Embedded Sources tab is live in the Skills section sidebar.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
