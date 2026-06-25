import "server-only";
import { cache } from "react";
import { prisma } from "./db";
import { search } from "./embeddings";
import {
  AppDef,
  AppType,
  Env,
  NavItemDef,
  NavSectionDef,
  Skill,
  WikiCard,
  WikiDef,
} from "./types";

// ─── Apps ──────────────────────────────────────────────────────────────────

function rowToApp(r: {
  id: string; name: string; cat: string; icon: string; color: string;
  env: string; url: string; type: string; desc: string;
  region: string; uptime: string; latency: string; requests: string; errors: string;
  log: string; html?: string | null; markdown?: string | null;
}): AppDef {
  return {
    id: r.id,
    name: r.name,
    cat: r.cat,
    icon: r.icon,
    color: r.color as AppDef["color"],
    env: r.env as Env,
    url: r.url,
    type: r.type as AppType,
    desc: r.desc,
    runtime: {
      region: r.region,
      uptime: r.uptime,
      latency: r.latency,
      requests: r.requests,
      errors: r.errors,
    },
    log: JSON.parse(r.log) as [string, string, string][],
    ...(r.html      ? { html: r.html }         : {}),
    ...(r.markdown  ? { markdown: r.markdown } : {}),
  };
}

export const getAllApps = cache(async (): Promise<AppDef[]> => {
  const rows = await prisma.app.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(rowToApp);
});

export const getApp = cache(async (id: string): Promise<AppDef | null> => {
  const row = await prisma.app.findUnique({ where: { id } });
  return row ? rowToApp(row) : null;
});

/** Map of id → app (used by the client store hydration). */
export const getAppsMap = cache(async (): Promise<Record<string, AppDef>> => {
  const apps = await getAllApps();
  return Object.fromEntries(apps.map((a) => [a.id, a]));
});

// ─── Wikis ─────────────────────────────────────────────────────────────────

export const getAllWikiCards = cache(async (): Promise<WikiCard[]> => {
  const rows = await prisma.wiki.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true, title: true, banner: true, env: true,
      cardDesc: true, cardStat1: true, cardStat2: true, cardStat3: true,
    },
  });
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    desc: r.cardDesc,
    banner: r.banner as WikiCard["banner"],
    env: (r.env ?? "dev") as Env,
    stats: [r.cardStat1, r.cardStat2, r.cardStat3],
  }));
});

export const getAllWikiSlugs = cache(async (): Promise<string[]> => {
  const rows = await prisma.wiki.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
});

/** Map of "Display Title" → slug, used by cross-wiki [Name] refs in the reader. */
export const getWikiSlugMap = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.wiki.findMany({ select: { slug: true, title: true } });
  return Object.fromEntries(rows.map((r) => [r.title, r.slug]));
});

/** Map of slug → title for breadcrumbs and the TopBar. */
export const getWikiTitlesMap = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.wiki.findMany({ select: { slug: true, title: true } });
  return Object.fromEntries(rows.map((r) => [r.slug, r.title]));
});

export const getWiki = cache(async (slug: string): Promise<WikiDef | null> => {
  const row = await prisma.wiki.findUnique({
    where: { slug },
    include: {
      sources: { orderBy: { sortOrder: "asc" } },
      related: { orderBy: { sortOrder: "asc" } },
      toc: { orderBy: { sortOrder: "asc" } },
      pageList: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!row) return null;
  return {
    slug: row.slug,
    title: row.title,
    titleEm: row.titleEm ?? undefined,
    lede: row.lede,
    banner: row.banner as WikiDef["banner"],
    crumb: row.crumb,
    pages: row.pages,
    updated: row.updated,
    version: row.version,
    visibility: row.visibility,
    env: ((row as any).env ?? "dev") as Env,
    content: row.content,
    sources: row.sources.map((s) => ({ title: s.title, meta: s.meta })),
    related: row.related.map((r) => ({ name: r.name, ic: r.ic })),
    toc: row.toc.map((t) => ({ id: t.anchorId, name: t.name, sub: t.sub })),
    pageList: row.pageList.map((p) => ({ id: p.pageId, name: p.name, current: p.current })),
  };
});

// ─── Mutations ─────────────────────────────────────────────────────────────

export async function promoteAppDb(id: string, env: Env): Promise<void> {
  await prisma.app.update({ where: { id }, data: { env } });
}

// ─── Builds ────────────────────────────────────────────────────────────────

export interface BuildRow {
  id: string;
  prompt: string;
  skills: string[];
  env: Env;
  status: "queued" | "streaming" | "done" | "failed" | "cancelled";
  output: string;
  error: string | null;
  /** Slug of the wiki this build was published as, or null if unpublished / deleted. */
  promotedWikiSlug: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function rowToBuild(r: {
  id: string; prompt: string; skills: string; env: string; status: string;
  output: string; error: string | null;
  promotedWikiSlug?: string | null;
  createdAt: Date; updatedAt: Date;
}): BuildRow {
  return {
    id: r.id,
    prompt: r.prompt,
    skills: JSON.parse(r.skills) as string[],
    env: r.env as Env,
    status: r.status as BuildRow["status"],
    output: r.output,
    error: r.error,
    promotedWikiSlug: r.promotedWikiSlug ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export const getRecentBuilds = cache(async (limit = 8): Promise<BuildRow[]> => {
  const rows = await prisma.build.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(rowToBuild);
});

export const getBuild = cache(async (id: string): Promise<BuildRow | null> => {
  const r = await prisma.build.findUnique({ where: { id } });
  return r ? rowToBuild(r) : null;
});

// ─── Skills ────────────────────────────────────────────────────────────────

export const getAllSkills = cache(async (): Promise<Skill[]> => {
  const rows = await prisma.skill.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    cat: r.cat as Skill["cat"],
    group: r.group,
    desc: r.desc,
    uses: r.uses,
    ver: r.ver,
  }));
});

export interface SkillTab {
  id: string;
  label: string;
  count: number;
}

export const getSkillTabs = cache(async (): Promise<SkillTab[]> => {
  const rows = await prisma.skill.findMany({ select: { cat: true } });
  const total = rows.length;
  const byCat: Record<string, number> = {};
  for (const r of rows) byCat[r.cat] = (byCat[r.cat] ?? 0) + 1;
  return [
    { id: "all", label: "All", count: total },
    { id: "research", label: "Research", count: byCat["research"] ?? 0 },
    { id: "quant", label: "Quant", count: byCat["quant"] ?? 0 },
    { id: "dev", label: "Development", count: byCat["dev"] ?? 0 },
    { id: "knowledge", label: "Knowledge", count: byCat["knowledge"] ?? 0 },
  ];
});

// ─── Knowledge graph ───────────────────────────────────────────────────────

export interface KGNode {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  fontSize: number;
  category: string;
  highlight: boolean;
}

export interface KGEdge {
  fromId: string;
  toId: string;
  opacity: number;
}

export interface KnowledgeGraph {
  nodes: KGNode[];
  edges: KGEdge[];
  legend: { color: string; label: string }[];
  stats: { entities: number; edges: number; embeddings: string };
}

export const getKnowledgeGraph = cache(async (): Promise<KnowledgeGraph> => {
  const [nodes, edges] = await Promise.all([
    prisma.knowledgeNode.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.knowledgeEdge.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  // Derive legend from distinct (category, color) pairs preserving sort order.
  const seen = new Set<string>();
  const legend: { color: string; label: string }[] = [];
  for (const n of nodes) {
    const key = `${n.category}|${n.color}`;
    if (seen.has(key)) continue;
    seen.add(key);
    legend.push({ color: n.color, label: n.category });
  }

  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      label: n.label,
      x: n.x,
      y: n.y,
      radius: n.radius,
      color: n.color,
      fontSize: n.fontSize,
      category: n.category,
      highlight: n.highlight,
    })),
    edges: edges.map((e) => ({ fromId: e.fromId, toId: e.toId, opacity: e.opacity })),
    legend,
    stats: {
      entities: nodes.length,
      edges: edges.length,
      embeddings: "28k", // stays static; tied to qdrant index size, not DB
    },
  };
});

// ─── Semantic search ───────────────────────────────────────────────────────

export async function searchKnowledge(query: string, limit: number = 8) {
  try {
    // Search across three collections in parallel
    const [wikiResults, skillResults, buildResults] = await Promise.all([
      search("wikis", query, Math.ceil(limit / 3)),
      search("skills", query, Math.ceil(limit / 3)),
      search("builds", query, Math.ceil(limit / 3)),
    ]);

    // Combine and rank by score
    const combined = [
      ...wikiResults.map((r) => ({
        type: "wiki",
        ...r,
      })),
      ...skillResults.map((r) => ({
        type: "skill",
        ...r,
      })),
      ...buildResults.map((r) => ({
        type: "build",
        ...r,
      })),
    ];

    combined.sort((a, b) => b.score - a.score);

    // Hydrate with DB data
    const enriched = await Promise.all(
      combined.slice(0, limit).map(async (result) => {
        if (result.type === "wiki") {
          // Qdrant payload stores slug as "id"
          const wiki = await prisma.wiki.findUnique({
            where: { slug: result.payload.id as string },
            select: { title: true, slug: true, lede: true, updated: true },
          });
          return { ...result, data: wiki };
        } else if (result.type === "skill") {
          const skill = await prisma.skill.findUnique({
            where: { id: result.payload.id as string },
            select: { name: true, id: true, desc: true, cat: true },
          });
          return { ...result, data: skill };
        } else {
          const build = await prisma.build.findUnique({
            where: { id: result.payload.id as string },
            select: { id: true, prompt: true, status: true, createdAt: true },
          });
          return { ...result, data: build };
        }
      })
    );

    return enriched;
  } catch (error) {
    console.error("Knowledge search error:", error);
    throw error;
  }
}

/**
 * Get related wikis/skills/builds for a given knowledge node
 */
export async function getRelatedKnowledge(nodeId: string) {
  try {
    // Get all edges connected to this node (schema uses fromId/toId)
    const edges = await prisma.knowledgeEdge.findMany({
      where: {
        OR: [
          { fromId: nodeId },
          { toId: nodeId },
        ],
      },
    });

    const relatedNodeIds = edges.flatMap((e) =>
      e.fromId === nodeId ? [e.toId] : [e.fromId]
    );

    // Get the nodes
    const nodes = await prisma.knowledgeNode.findMany({
      where: { id: { in: relatedNodeIds } },
    });

    // Map each node to its associated wikis/skills
    const relatedContent = await Promise.all(
      nodes.map(async (node) => {
        // Find wikis whose slug matches the node label (best-effort)
        const wikis = await prisma.wiki.findMany({
          where: { slug: { contains: node.label.toLowerCase().replace(/\s+/g, "-") } },
          select: { title: true, slug: true },
          take: 3,
        });

        // Find skills in the same category (schema field is `cat`)
        const skills = await prisma.skill.findMany({
          where: { cat: node.category },
          select: { name: true, id: true },
          take: 3,
        });

        return {
          node: node.label,
          wikis,
          skills,
        };
      })
    );

    return relatedContent;
  } catch (error) {
    console.error("Related knowledge error:", error);
    throw error;
  }
}

// ─── Nav (with dynamic badges) ─────────────────────────────────────────────

/**
 * Badge text is computed at query time for a small allow-list of routes whose
 * count varies (applications, wikis, skills). For any other item the stored
 * `badgeText` is used verbatim — null produces no badge.
 */
async function computeBadgeText(route: string): Promise<string | null> {
  if (route === "/applications") {
    const n = await prisma.app.count({ where: { env: "live" } });
    return `${n} LIVE`;
  }
  if (route === "/wikis") {
    const n = await prisma.wiki.count();
    return `${n}`;
  }
  if (route === "/skills") {
    const n = await prisma.skill.count();
    return `${n}`;
  }
  return null;
}

export const getNav = cache(async (): Promise<NavSectionDef[]> => {
  const sections = await prisma.navSection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  const result: NavSectionDef[] = [];
  for (const sec of sections) {
    const items: NavItemDef[] = [];
    for (const it of sec.items) {
      // If a dynamic badge applies, compute it. Otherwise use stored text (if any).
      const dynamic = it.badgeKind ? await computeBadgeText(it.route) : null;
      const badge = it.badgeText ?? dynamic ?? undefined;
      items.push({
        label: it.label,
        route: it.route,
        icon: it.icon,
        ...(badge ? { badge } : {}),
        ...(it.badgeKind ? { badgeKind: it.badgeKind as NavItemDef["badgeKind"] } : {}),
      });
    }
    result.push({ title: sec.title, items });
  }
  return result;
});
