import { PrismaClient } from "@prisma/client";

// Remove anything the e2e suite created so runs are idempotent and leave no
// residue: wikis titled "E2E Publish …" (+ child rows) and builds prompted
// "E2E build check …".
export default async function globalTeardown() {
  const prisma = new PrismaClient();
  try {
    const wikis = await prisma.wiki.findMany({
      where: { title: { startsWith: "E2E Publish " } },
      select: { slug: true },
    });
    for (const w of wikis) {
      await prisma.wikiSource.deleteMany({ where: { wikiSlug: w.slug } });
      await prisma.wikiTocItem.deleteMany({ where: { wikiSlug: w.slug } });
      await prisma.wikiPage.deleteMany({ where: { wikiSlug: w.slug } });
      await prisma.wikiRelated.deleteMany({ where: { wikiSlug: w.slug } });
      await prisma.wiki.delete({ where: { slug: w.slug } });
    }

    const builds = await prisma.build.deleteMany({
      where: { prompt: { startsWith: "E2E build check" } },
    });

    if (wikis.length || builds.count) {
      console.log(`[e2e teardown] removed ${wikis.length} wiki(s), ${builds.count} build(s)`);
    }
  } catch (e) {
    console.warn("[e2e teardown] cleanup failed (non-fatal):", (e as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}
