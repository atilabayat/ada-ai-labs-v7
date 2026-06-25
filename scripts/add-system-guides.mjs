/**
 * One-shot DB migration:
 *  1. Add "System User Guides" nav item under the "Skills" section
 *  2. Tag both user-guide wikis as banner="system", env="live"
 *
 * Run:  node scripts/add-system-guides.mjs
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // ── 1. Nav item ────────────────────────────────────────────────────────────
  // Find the Skills nav section
  const skillsSection = await prisma.navSection.findFirst({
    where: { id: "skills" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  if (!skillsSection) {
    console.error("❌  navSection 'skills' not found in DB. Run the nav seed first.");
    process.exit(1);
  }

  // Check whether the item already exists
  const existing = skillsSection.items.find(
    (i) => i.route === "/wikis?section=system"
  );

  if (existing) {
    console.log("✓  Nav item already exists:", existing.label);
  } else {
    const maxOrder = skillsSection.items.reduce(
      (max, i) => Math.max(max, i.sortOrder ?? 0),
      0
    );
    const created = await prisma.navItem.create({
      data: {
        label:     "System User Guides",
        route:     "/wikis?section=system",
        icon:      "📋",
        sectionId: skillsSection.id,
        sortOrder: maxOrder + 1,
      },
    });
    console.log("✓  Created nav item:", created.label, "→", created.route);
  }

  // ── 2. Tag guide wikis ─────────────────────────────────────────────────────
  const guideSlugs = [
    "call-wall-put-wall-system-guide",
    "deep-research-sessions-guide",
  ];

  for (const slug of guideSlugs) {
    const wiki = await prisma.wiki.findUnique({ where: { slug } });
    if (!wiki) {
      console.warn(`⚠  Wiki not found: ${slug} — skipping`);
      continue;
    }
    await prisma.wiki.update({
      where: { slug },
      data:  { banner: "system", env: "live" },
    });
    console.log(`✓  Tagged wiki as system/live: ${slug}`);
  }

  console.log("\n✅  Done. Reload /wikis to see the System User Guides section.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
