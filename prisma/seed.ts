import { PrismaClient } from "@prisma/client";
import { SEED_APPS } from "./seed-data/apps";
import { SEED_WIKIS, SEED_WIKI_CARDS } from "./seed-data/wikis";
import { SEED_WIKIS_INTEL, SEED_WIKI_CARDS_INTEL } from "./seed-data/wikis-intel";
import { SEED_WIKIS_RECOVERED, SEED_WIKI_CARDS_RECOVERED } from "./seed-data/wikis-recovered";
import { SEED_SKILLS } from "./seed-data/skills";
import { SEED_KNOWLEDGE_NODES, SEED_KNOWLEDGE_EDGES } from "./seed-data/knowledge";
import { SEED_NAV } from "./seed-data/nav";

const prisma = new PrismaClient();

async function seedApps() {
  console.log("→ seeding apps");
  // Non-destructive: upsert seed apps by id, never delete. This preserves
  // user-created apps (imported dashboards, artifacts) AND, on existing seed
  // rows, preserves user-controlled fields — `html`/`markdown` (imported
  // interactive artifacts), `env` (dev/staging/live promotions), and
  // `sortOrder` (manual ordering). Only seed-managed metadata is refreshed.
  const entries = Object.values(SEED_APPS);
  for (let i = 0; i < entries.length; i++) {
    const app = entries[i];
    const seedMeta = {
      name: app.name,
      cat: app.cat,
      icon: app.icon,
      color: app.color,
      url: app.url,
      type: app.type,
      desc: app.desc,
      region: app.runtime.region,
      uptime: app.runtime.uptime,
      latency: app.runtime.latency,
      requests: app.runtime.requests,
      errors: app.runtime.errors,
      log: JSON.stringify(app.log),
    };
    await prisma.app.upsert({
      where: { id: app.id },
      // create: full seed defaults (incl. env + sortOrder) for a fresh install
      create: { id: app.id, env: app.env, sortOrder: i, ...seedMeta },
      // update: refresh seed metadata only; do NOT touch html/markdown/env/sortOrder
      update: seedMeta,
    });
  }
  console.log(`  · upserted ${entries.length} apps (user apps & artifacts preserved)`);
}

async function seedWikis() {
  console.log("→ seeding wikis");

  const allCards = [...SEED_WIKI_CARDS, ...SEED_WIKI_CARDS_INTEL, ...SEED_WIKI_CARDS_RECOVERED];
  const cardBySlug = new Map(allCards.map((c) => [c.slug, c]));

  const allWikis = { ...SEED_WIKIS, ...SEED_WIKIS_INTEL, ...SEED_WIKIS_RECOVERED };
  const slugs = Object.keys(allWikis);

  // Capture user-set env (dev/staging/live promotions) before the wipe so the
  // re-insert can restore them. The reader's content/relations are seed-owned
  // and refreshed, but the pipeline status is user-controlled — same
  // non-destructive intent as seedApps/seedNav.
  const existing = await prisma.wiki.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, env: true },
  });
  const envBySlug = new Map(existing.map((e) => [e.slug, e.env]));

  // Delete only the slugs we own — preserves user-created wikis.
  await prisma.wiki.deleteMany({ where: { slug: { in: slugs } } });

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const w = allWikis[slug];
    const card = cardBySlug.get(slug);
    if (!card) {
      console.warn(`  ! no card metadata for ${slug}`);
      continue;
    }

    await prisma.wiki.create({
      data: {
        slug,
        title: w.title,
        titleEm: w.titleEm ?? null,
        lede: w.lede,
        banner: w.banner,
        crumb: w.crumb,
        pages: w.pages,
        updated: w.updated,
        version: w.version,
        visibility: w.visibility,
        env: envBySlug.get(slug) ?? "dev", // preserve prior promotion; default dev on first seed
        content: w.content,
        cardDesc: card.desc,
        cardStat1: card.stats[0],
        cardStat2: card.stats[1],
        cardStat3: card.stats[2],
        sortOrder: i,
        sources: {
          create: w.sources.map((s, idx) => ({
            title: s.title,
            meta: s.meta,
            sortOrder: idx,
          })),
        },
        related: {
          create: w.related.map((r, idx) => ({
            name: r.name,
            ic: r.ic,
            sortOrder: idx,
          })),
        },
        toc: {
          create: w.toc.map((t, idx) => ({
            anchorId: t.id,
            name: t.name,
            sub: !!t.sub,
            sortOrder: idx,
          })),
        },
        pageList: {
          create: w.pageList.map((p, idx) => ({
            pageId: p.id,
            name: p.name,
            current: !!p.current,
            sortOrder: idx,
          })),
        },
      },
    });
    console.log(`  · ${slug}  (${w.toc.length} toc · ${w.sources.length} sources · ${w.content.length}b)`);
  }
  console.log(`  · inserted ${slugs.length} wikis`);
}

async function seedSkills() {
  console.log("→ seeding skills");
  // Non-destructive: upsert by id, never delete. Preserves user-created skills
  // and, on existing seed rows, the live `uses` counter and `sortOrder`.
  for (let i = 0; i < SEED_SKILLS.length; i++) {
    const s = SEED_SKILLS[i];
    const seedMeta = { name: s.name, cat: s.cat, group: s.group, desc: s.desc, ver: s.ver };
    await prisma.skill.upsert({
      where: { id: s.id },
      create: { id: s.id, uses: s.uses, sortOrder: i, ...seedMeta },
      update: seedMeta, // preserve uses + sortOrder
    });
  }
  console.log(`  · upserted ${SEED_SKILLS.length} skills (user skills & use-counts preserved)`);
}

async function seedKnowledge() {
  console.log("→ seeding knowledge graph");
  // Non-destructive: upsert seed nodes by id; never delete (preserves
  // user-added nodes). Edges have an autoincrement id, so we key them by their
  // natural (fromId,toId) pair and only create the ones that don't exist yet —
  // user-added edges and seed edges both survive without duplication.
  for (let i = 0; i < SEED_KNOWLEDGE_NODES.length; i++) {
    const n = SEED_KNOWLEDGE_NODES[i];
    const { id, ...rest } = n;
    await prisma.knowledgeNode.upsert({
      where: { id },
      create: { id, ...rest, sortOrder: i },
      update: { ...rest, sortOrder: i },
    });
  }
  let createdEdges = 0;
  for (let i = 0; i < SEED_KNOWLEDGE_EDGES.length; i++) {
    const e = SEED_KNOWLEDGE_EDGES[i];
    const exists = await prisma.knowledgeEdge.findFirst({
      where: { fromId: e.fromId, toId: e.toId },
      select: { id: true },
    });
    if (!exists) {
      await prisma.knowledgeEdge.create({ data: { ...e, sortOrder: i } });
      createdEdges++;
    }
  }
  console.log(`  · upserted ${SEED_KNOWLEDGE_NODES.length} nodes · added ${createdEdges} new edges (user graph preserved)`);
}

async function seedNav() {
  console.log("→ seeding nav");
  // Non-destructive: upsert sections by id and items by their natural
  // (sectionId, route) key; never delete. This is the function that previously
  // wiped user-added sidebar tabs (Dashboards, System User Guides, AI Daily
  // Intelligence, …). Those have routes not present in SEED_NAV, so they are
  // now left untouched. Existing seed items keep their user-set sortOrder.
  let created = 0;
  for (let s = 0; s < SEED_NAV.length; s++) {
    const sec = SEED_NAV[s];
    await prisma.navSection.upsert({
      where: { id: sec.id },
      create: { id: sec.id, title: sec.title, sortOrder: s },
      update: { title: sec.title }, // preserve section sortOrder
    });
    for (let i = 0; i < sec.items.length; i++) {
      const it = sec.items[i];
      const meta = {
        label: it.label,
        icon: it.icon,
        badgeKind: it.badgeKind ?? null,
        badgeText: it.badgeText ?? null,
      };
      const existing = await prisma.navItem.findFirst({
        where: { sectionId: sec.id, route: it.route },
        select: { id: true },
      });
      if (existing) {
        await prisma.navItem.update({ where: { id: existing.id }, data: meta }); // preserve sortOrder
      } else {
        await prisma.navItem.create({
          data: { sectionId: sec.id, route: it.route, sortOrder: i, ...meta },
        });
        created++;
      }
    }
  }
  console.log(`  · upserted ${SEED_NAV.length} sections · added ${created} new items (user tabs preserved)`);
}

async function main() {
  console.log("ADA AI Labs — seed");
  console.log("────────────────────");
  await seedApps();
  await seedWikis();
  await seedSkills();
  await seedKnowledge();
  await seedNav();
  console.log("\n✓ seed complete");
}

main()
  .catch((err) => {
    console.error("seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
