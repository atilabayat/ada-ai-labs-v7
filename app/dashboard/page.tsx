// Always serve fresh data — never a stale cached render.
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import DashboardClient, {
  DashboardBuild,
  DashboardStats,
  DashboardWiki,
} from "./DashboardClient";

export default async function DashboardPage() {
  // ── Parallel data fetch ──────────────────────────────────────────────────
  const [liveApps, wikiCount, skillCount, totalBuilds, rawBuilds, rawWikis] =
    await Promise.all([
      prisma.app.count({ where: { env: "live" } }),
      prisma.wiki.count(),
      prisma.skill.count(),
      prisma.build.count(),
      prisma.build.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          prompt: true,
          status: true,
          skills: true,
          createdAt: true,
        },
      }),
      prisma.wiki.findMany({
        take: 4,
        select: { slug: true, title: true, updated: true },
      }),
    ]);

  // Builds currently in-flight (queued or streaming)
  const activeBuilds = rawBuilds.filter(
    (b) => b.status === "queued" || b.status === "streaming"
  ).length;

  // Serialise for the client component (Dates → ISO strings, JSON → parsed)
  const recentBuilds: DashboardBuild[] = rawBuilds.map((b) => ({
    id:        b.id,
    prompt:    b.prompt,
    status:    b.status as DashboardBuild["status"],
    skills:    JSON.parse(b.skills) as string[],
    createdAt: b.createdAt.toISOString(),
  }));

  const recentWikis: DashboardWiki[] = rawWikis.map((w) => ({
    slug:    w.slug,
    title:   w.title,
    updated: w.updated,
  }));

  const stats: DashboardStats = {
    liveApps,
    wikiCount,
    skillCount,
    totalBuilds,
    activeBuilds,
  };

  return (
    <DashboardClient
      stats={stats}
      recentBuilds={recentBuilds}
      recentWikis={recentWikis}
    />
  );
}
