import Link from "next/link";
import { PageInner, PageHead } from "@/components/ui";
import { prisma } from "@/lib/db";
import { BANNER_GRADIENTS } from "@/lib/data/wikis";
import WikiCard from "./WikiCard";
import EnvSync from "@/components/EnvSync";
import type { Env } from "@/lib/types";
import type { WikiCard as WikiCardType } from "@/lib/types";

const VALID_ENVS: Env[] = ["dev", "staging", "live"];

const ENV_META: Record<Env, { label: string; icon: string; color: string; desc: string }> = {
  dev:     { label: "Development", icon: "⬡", color: "text-accent",       desc: "Work in progress — visible only to you" },
  staging: { label: "Staging",     icon: "◈", color: "text-accent-amber",  desc: "Under review — ready to be verified" },
  live:    { label: "Production",  icon: "●", color: "text-accent-teal",   desc: "Published — live in the knowledge base" },
};

export default async function WikisPage({
  searchParams,
}: {
  searchParams: Promise<{ env?: string; section?: string }>;
}) {
  const params = await searchParams;
  const filterSection = params.section ?? null; // "system" → system-only view
  const filterEnv = !filterSection && VALID_ENVS.includes(params.env as Env)
    ? (params.env as Env)
    : null;

  // When section=system, fetch only system-tagged wikis
  const rows = await prisma.wiki.findMany({
    orderBy: { sortOrder: "asc" },
    where: filterSection === "system"
      ? { banner: "system" }
      : filterEnv
        ? { env: filterEnv }
        : undefined,
    select: {
      slug: true, title: true, banner: true, env: true,
      cardDesc: true, cardStat1: true, cardStat2: true, cardStat3: true,
      updated: true,
    },
  });

  // Pipeline counts (always from full DB, regardless of filter)
  const counts = await prisma.wiki.groupBy({
    by: ["env"],
    _count: { _all: true },
  });
  const byEnv: Record<string, number> = Object.fromEntries(
    counts.map((c) => [c.env, c._count._all])
  );
  const total = await prisma.wiki.count();

  const wikis: WikiCardType[] = rows.map((r) => ({
    slug:   r.slug,
    title:  r.title,
    desc:   r.cardDesc,
    banner: r.banner as WikiCardType["banner"],
    env:    ((r.env ?? "dev") as Env),
    stats:  [r.cardStat1, r.cardStat2, r.cardStat3],
  }));

  // "Recently published" = updated within last 7 days AND in the current filter
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = rows.filter((w) => {
    try { return new Date(w.updated) >= sevenDaysAgo; } catch { return false; }
  });

  // System User Guides — banner="system", always shown as a pinned section
  const systemWikis  = wikis.filter((w) => w.banner === "system");

  // Group by env for pipeline view (only when showing all; exclude system wikis from pipeline groups)
  const nonSystemWikis = wikis.filter((w) => w.banner !== "system");
  const devWikis     = nonSystemWikis.filter((w) => w.env === "dev");
  const stagingWikis = nonSystemWikis.filter((w) => w.env === "staging");
  const liveWikis    = nonSystemWikis.filter((w) => w.env === "live");

  // ── Dedicated System User Guides view ────────────────────────────────────
  if (filterSection === "system") {
    return (
      <PageInner>
        <PageHead
          tag="Platform Documentation"
          tone="rose"
          title="System User"
          em="Guides."
          sub="Official user guides and session guides for every feature in ADA AI Labs. Reserved for platform documentation only."
        />
        <div className="mb-6 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">
            {rows.length} guide{rows.length !== 1 ? "s" : ""}
          </span>
          <Link
            href="/wikis"
            className="font-mono text-[10px] text-ink-3 underline underline-offset-2 transition hover:text-ink-1"
          >
            ← All wikis
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-[10px] border border-line bg-bg-1 px-6 py-14 text-center">
            <div className="mb-2 font-display text-[15px] text-ink-2">No guides published yet</div>
            <div className="font-mono text-[11px] text-ink-3">
              Use the "Add to System Guides" action on any wiki to publish it here.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[14px]">
            {wikis.map((w) => <WikiCard key={w.slug} w={w} />)}
          </div>
        )}
      </PageInner>
    );
  }

  return (
    <PageInner>
      {/* Sync the title-bar env switch with the active filter */}
      <EnvSync env={filterEnv} />
      <PageHead
        tag="Karpathy-Style Wiki System"
        tone="rose"
        title="Compounding"
        em="knowledge."
        sub="Persistent, versioned, cross-referenced wikis. Promote drafts from Development → Staging → Production as they mature."
      />

      {/* ── Header bar ── */}
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">
          {total} wiki{total !== 1 ? "s" : ""} total
        </span>
        <Link
          href="/wikis/new"
          className="flex items-center gap-[8px] rounded-full border border-[rgba(167,139,250,0.4)] bg-[rgba(167,139,250,0.06)] px-[18px] py-[8px] font-mono text-[10px] uppercase tracking-[0.1em] text-accent-violet transition-all hover:-translate-y-px hover:border-accent-violet hover:bg-[rgba(167,139,250,0.12)]"
        >
          <span>▤</span> New Wiki
        </Link>
      </div>

      {/* ── Pipeline banner ── */}
      <div className="mb-7 grid grid-cols-3 gap-3 rounded-[12px] border border-line bg-bg-1 p-4">
        {VALID_ENVS.map((env, i) => {
          const meta  = ENV_META[env];
          const count = byEnv[env] ?? 0;
          const isActive = filterEnv === env;
          return (
            <Link
              key={env}
              href={isActive ? "/wikis" : `/wikis?env=${env}`}
              className={`relative flex flex-col gap-1 rounded-[8px] border px-4 py-3 transition-all hover:-translate-y-px ${
                isActive
                  ? "border-line-strong bg-bg-3"
                  : "border-line bg-bg-2 hover:border-line-strong hover:bg-bg-3"
              }`}
            >
              {/* Stage connector arrow */}
              {i > 0 && (
                <span className="absolute -left-[10px] top-1/2 -translate-y-1/2 font-mono text-[14px] text-ink-3">→</span>
              )}
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[9px] uppercase tracking-[0.15em] ${meta.color}`}>
                  {meta.icon} {meta.label}
                </span>
                <span className={`rounded-full border px-[7px] py-[2px] font-mono text-[11px] font-medium ${
                  env === "live"    ? "border-[rgba(20,184,166,0.3)] text-accent-teal" :
                  env === "staging" ? "border-[rgba(245,158,11,0.3)] text-accent-amber" :
                                     "border-[rgba(77,141,255,0.3)] text-accent"
                }`}>
                  {count}
                </span>
              </div>
              <p className="font-mono text-[10px] text-ink-3">{meta.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* ── Filter tabs ── */}
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/wikis"
          className={`rounded-full px-4 py-[6px] font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
            !filterEnv ? "bg-bg-3 text-ink-0" : "text-ink-3 hover:text-ink-1"
          }`}
        >
          All ({total})
        </Link>
        {VALID_ENVS.map((env) => (
          <Link
            key={env}
            href={filterEnv === env ? "/wikis" : `/wikis?env=${env}`}
            className={`rounded-full px-4 py-[6px] font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
              filterEnv === env
                ? env === "live"    ? "bg-[rgba(20,184,166,0.15)] text-accent-teal"
                : env === "staging" ? "bg-[rgba(245,158,11,0.15)] text-accent-amber"
                                    : "bg-[rgba(77,141,255,0.15)] text-accent"
                : "text-ink-3 hover:text-ink-1"
            }`}
          >
            {ENV_META[env].label} ({byEnv[env] ?? 0})
          </Link>
        ))}
      </div>

      {/* ── System User Guides (pinned, always visible when any exist) ── */}
      {systemWikis.length > 0 && (
        <section className="mb-10">
          <div
            className="mb-4 flex items-center gap-3 rounded-[10px] border border-[rgba(122,167,232,0.2)] px-4 py-3"
            style={{ background: "linear-gradient(135deg, rgba(26,42,74,0.6), rgba(42,58,106,0.4))" }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#7ba7e8]">
              📋 System User Guides
            </span>
            <span className="h-px flex-1 bg-[rgba(122,167,232,0.15)]" />
            <span className="font-mono text-[10px] text-[#7ba7e8] opacity-60">
              {systemWikis.length} guide{systemWikis.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[14px]">
            {systemWikis.map((w) => <WikiCard key={w.slug} w={w} />)}
          </div>
        </section>
      )}

      {/* ── Recently Published (only when showing all or dev) ── */}
      {!filterEnv && recent.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent-teal">
              📖 Recently Published
            </span>
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[10px] text-ink-3">{recent.length} new this week</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[14px]">
            {recent.map((w) => {
              const card = wikis.find((x) => x.slug === w.slug)!;
              return <WikiCard key={w.slug} w={card} />;
            })}
          </div>
        </section>
      )}

      {/* ── Filtered view (single env tab active) ── */}
      {filterEnv && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className={`font-mono text-[10px] uppercase tracking-[0.15em] ${ENV_META[filterEnv].color}`}>
              {ENV_META[filterEnv].icon} {ENV_META[filterEnv].label}
            </span>
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[10px] text-ink-3">{wikis.length} wiki{wikis.length !== 1 ? "s" : ""}</span>
          </div>
          {wikis.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[14px]">
              {wikis.map((w) => <WikiCard key={w.slug} w={w} />)}
            </div>
          ) : (
            <p className="font-mono text-[12px] text-ink-3">No {ENV_META[filterEnv].label.toLowerCase()} wikis yet.</p>
          )}
        </section>
      )}

      {/* ── Pipeline-grouped view (no filter active) ── */}
      {!filterEnv && (
        <>
          {devWikis.length > 0 && (
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
                  ⬡ Development
                </span>
                <span className="h-px flex-1 bg-line" />
                <span className="font-mono text-[10px] text-ink-3">{devWikis.length}</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[14px]">
                {devWikis.filter(w => {
                  try { return new Date(w.stats[2] || "0") < sevenDaysAgo; } catch { return true; }
                }).map((w) => <WikiCard key={w.slug} w={w} />)}
              </div>
            </section>
          )}

          {stagingWikis.length > 0 && (
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent-amber">
                  ◈ Staging
                </span>
                <span className="h-px flex-1 bg-line" />
                <span className="font-mono text-[10px] text-ink-3">{stagingWikis.length}</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[14px]">
                {stagingWikis.map((w) => <WikiCard key={w.slug} w={w} />)}
              </div>
            </section>
          )}

          {liveWikis.length > 0 && (
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent-teal">
                  ● Production · Live
                </span>
                <span className="h-px flex-1 bg-line" />
                <span className="font-mono text-[10px] text-ink-3">{liveWikis.length}</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[14px]">
                {liveWikis.map((w) => <WikiCard key={w.slug} w={w} />)}
              </div>
            </section>
          )}
        </>
      )}

      {wikis.length === 0 && !filterEnv && total === 0 && (
        <p className="font-mono text-[12px] text-ink-3">No wikis yet. Build one in the builder and publish it.</p>
      )}
    </PageInner>
  );
}
