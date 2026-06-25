"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/store";
import { PageInner, PageHead, Panel } from "@/components/ui";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DashboardBuild {
  id: string;
  prompt: string;
  status: "queued" | "streaming" | "done" | "failed" | "cancelled";
  skills: string[];
  createdAt: string; // ISO string (serialised from Date)
}

export interface DashboardWiki {
  slug: string;
  title: string;
  updated: string;
}

export interface DashboardStats {
  liveApps: number;
  wikiCount: number;
  skillCount: number;
  totalBuilds: number;
  activeBuilds: number; // queued + streaming right now
}

interface Props {
  stats: DashboardStats;
  recentBuilds: DashboardBuild[];
  recentWikis: DashboardWiki[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_TONE: Record<DashboardBuild["status"], { dot: string; label: string }> = {
  queued:    { dot: "bg-accent",            label: "text-accent" },
  streaming: { dot: "bg-accent-amber",      label: "text-accent-amber" },
  done:      { dot: "bg-accent-teal",       label: "text-accent-teal" },
  failed:    { dot: "bg-accent-rose",       label: "text-accent-rose" },
  cancelled: { dot: "bg-[#555]",            label: "text-ink-3" },
};

function titleFromPrompt(s: string, max = 52): string {
  const line = s.split("\n").find((l) => l.trim()) ?? "Untitled build";
  return line.length > max ? line.slice(0, max) + "…" : line;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Returns an array of 7 daily build counts, oldest-first (Mon → Sun relative to today). */
function buildsByDay(builds: DashboardBuild[]): number[] {
  const now = Date.now();
  return Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(now - (6 - i) * 86_400_000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const s = dayStart.getTime();
    const e = dayEnd.getTime();
    return builds.filter((b) => {
      const t = new Date(b.createdAt).getTime();
      return t >= s && t <= e;
    }).length;
  });
}

function deltaLabel(current: number, prior: number): { text: string; color: string } {
  if (prior === 0)
    return current > 0
      ? { text: "↗ new this week", color: "text-accent" }
      : { text: "→ no change", color: "text-ink-3" };
  if (current > prior) {
    const pct = Math.round(((current - prior) / prior) * 100);
    return { text: `↗ +${pct}%`, color: "text-accent" };
  }
  if (current < prior) {
    const pct = Math.round(((prior - current) / prior) * 100);
    return { text: `↘ −${pct}%`, color: "text-accent-amber" };
  }
  return { text: "→ same", color: "text-ink-3" };
}

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// ── Stub activity data (design-preserved; real build events are prepended) ────

const STUB_ACTIVITY: { dot: string; text: React.ReactNode; time: string }[] = [
  {
    dot: "bg-accent-teal",
    text: <><span className="font-medium text-ink-0">Morning Intelligence Briefing</span> sent to atila.bayat@gmail.com</>,
    time: "07:02 EST",
  },
  {
    dot: "bg-accent",
    text: <><span className="font-medium text-ink-0">TSLA Put Wall Sentinel</span> detected new wall at $420</>,
    time: "15m ago",
  },
  {
    dot: "bg-accent-amber",
    text: <><span className="font-medium text-ink-0">IPA Compendium v3.0</span> promoted dev → staging</>,
    time: "1h ago",
  },
  {
    dot: "bg-accent-rose",
    text: <><span className="font-medium text-ink-0">Self-Improving Agents Wiki</span> 3 new pages added</>,
    time: "2h ago",
  },
  {
    dot: "bg-accent",
    text: <><span className="font-medium text-ink-0">Deep Research</span> session on VIX regime classification finished</>,
    time: "3h ago",
  },
  {
    dot: "bg-accent-teal",
    text: <><span className="font-medium text-ink-0">Knowledge Graph</span> indexed 142 new entities</>,
    time: "5h ago",
  },
  {
    dot: "bg-accent",
    text: <><span className="font-medium text-ink-0">Peirce Lattice Diagram</span> deployed to production</>,
    time: "yesterday",
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function DashboardClient({ stats, recentBuilds, recentWikis }: Props) {
  const router        = useRouter();
  const setCurrentBuild = useWorkspace((s) => s.setCurrentBuild);

  // ── Derived chart data ─────────────────────────────────────────────────────
  const bars    = buildsByDay(recentBuilds);
  const maxBar  = Math.max(...bars, 1);
  const total7d = bars.reduce((s, n) => s + n, 0);

  // Compare against the prior 7-day window inside the 20 builds we fetched
  const now = Date.now();
  const prior7d = recentBuilds.filter((b) => {
    const t = new Date(b.createdAt).getTime();
    return t >= now - 14 * 86_400_000 && t < now - 7 * 86_400_000;
  }).length;
  const delta = deltaLabel(total7d, prior7d);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const STATS = [
    {
      label:  "Active Projects",
      value:  String(stats.activeBuilds),
      delta:  stats.activeBuilds > 0 ? "running now" : "none running",
      accent: "bg-accent",
    },
    {
      label:  "Applications Live",
      value:  String(stats.liveApps),
      delta:  stats.liveApps > 0 ? "all healthy" : "none deployed",
      accent: "bg-accent-teal",
    },
    {
      label:  "Research Sessions",
      value:  String(stats.totalBuilds),
      delta:  `${total7d} this week`,
      accent: "bg-accent-amber",
    },
    {
      label:  "Wiki Pages",
      value:  String(stats.wikiCount),
      delta:  stats.wikiCount > 0 ? "in knowledge base" : "none yet",
      accent: "bg-accent-rose",
    },
    {
      label:  "Skills Available",
      value:  String(stats.skillCount),
      delta:  "ready to stack",
      accent: "bg-accent-violet",
    },
  ];

  // ── Live activity events derived from real recent builds ───────────────────
  // Build events appear at the top of the feed; stubs appear below as history.
  const buildEvents = recentBuilds.slice(0, 4).map((b) => ({
    id:     b.id,
    prompt: b.prompt,
    dot:    STATUS_TONE[b.status].dot,
    label:  STATUS_TONE[b.status].label,
    status: b.status,
    time:   timeAgo(b.createdAt),
  }));

  const wikiEvents = recentWikis.slice(0, 2).map((w) => ({
    slug:  w.slug,
    title: w.title,
    time:  w.updated,
  }));

  // ── Navigation helper ──────────────────────────────────────────────────────
  const openBuild = (id: string, prompt: string) => {
    setCurrentBuild(id, prompt);
    router.push("/builder");
  };

  return (
    <PageInner>
      <PageHead
        tag="Workspace Status · live"
        tone="teal"
        title="Research"
        em="operations."
        sub="Workspace activity, compounding artifacts, and system health across all environments."
      />

      {/* ── Stats row ── */}
      <div className="mb-9 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-[10px] border border-line bg-bg-1 px-[18px] py-4"
          >
            <span className={`absolute left-0 top-0 h-[2px] w-full opacity-50 ${s.accent}`} />
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
              {s.label}
            </div>
            <div className="mb-[6px] font-display text-[32px] font-medium leading-none tracking-tight">
              {s.value}
            </div>
            <div className="font-mono text-[10px] text-accent-teal">{s.delta}</div>
          </div>
        ))}
      </div>

      {/* ── Main 2-col grid ── */}
      <div className="mb-7 grid grid-cols-[2fr_1fr] gap-5 max-[1100px]:grid-cols-1">

        {/* ── LEFT: Activity Feed ── */}
        <Panel>
          <div className="mb-[14px] flex items-center justify-between">
            <div className="font-display text-[18px] font-medium">Activity Feed</div>
            <Link
              href="/builder"
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent transition hover:text-ink-0"
            >
              View All →
            </Link>
          </div>

          {/* Real build events — clickable, navigates to builder */}
          {buildEvents.length > 0 && (
            <>
              {buildEvents.map((e) => (
                <button
                  key={e.id}
                  onClick={() => openBuild(e.id, e.prompt)}
                  className="flex w-full items-center gap-3 border-b border-line py-[10px] text-left text-[13px] transition hover:bg-[rgba(77,141,255,0.05)] last:border-0"
                >
                  <span
                    className={`h-2 w-2 flex-shrink-0 rounded-full shadow-[0_0_8px_currentColor] ${e.dot} ${
                      e.status === "streaming" || e.status === "queued" ? "animate-pulse" : ""
                    }`}
                  />
                  <span className="flex-1 text-ink-1">
                    <span className="font-medium text-ink-0">{titleFromPrompt(e.prompt, 48)}</span>
                    {" — "}{e.status}
                  </span>
                  <span className="font-mono text-[10px] text-ink-3">{e.time}</span>
                  <span className="font-mono text-[10px] text-accent opacity-0 transition group-hover:opacity-100">→</span>
                </button>
              ))}

              {/* Subtle divider before stub history */}
              <div className="my-[10px] flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">
                <span className="h-px flex-1 bg-line" />
                <span>earlier · sample</span>
                <span className="h-px flex-1 bg-line" />
              </div>
            </>
          )}

          {/* Wiki events — link to wiki page */}
          {wikiEvents.map((w) => (
            <Link
              key={w.slug}
              href={`/wikis/${w.slug}`}
              className="flex items-center gap-3 border-b border-line py-[10px] text-[13px] transition hover:bg-[rgba(167,139,250,0.05)] last:border-0"
            >
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent-violet shadow-[0_0_8px_currentColor]" />
              <span className="flex-1 text-ink-1">
                <span className="font-medium text-ink-0">{w.title}</span> wiki updated
              </span>
              <span className="font-mono text-[10px] text-ink-3">{w.time}</span>
            </Link>
          ))}

          {/* Preserved stub activity (historical / example content) */}
          {STUB_ACTIVITY.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-line py-[10px] text-[13px] last:border-0"
            >
              <span className={`h-2 w-2 flex-shrink-0 rounded-full shadow-[0_0_8px_currentColor] ${a.dot}`} />
              <span className="flex-1 text-ink-1">{a.text}</span>
              <span className="font-mono text-[10px] text-ink-3">{a.time}</span>
            </div>
          ))}
        </Panel>

        {/* ── RIGHT column ── */}
        <div className="flex flex-col gap-5">

          {/* Builds · 7d chart */}
          <Panel>
            <div className="mb-[14px] flex items-center justify-between">
              <div className="font-display text-[18px] font-medium">Builds · 7d</div>
              <div className={`font-mono text-[10px] ${delta.color}`}>{delta.text}</div>
            </div>

            {/* Bar chart — heights proportional to max daily count */}
            <div className="flex h-20 items-end gap-1">
              {bars.map((count, i) => {
                const pct = count > 0 ? Math.max((count / maxBar) * 100, 8) : 2;
                return (
                  <div
                    key={i}
                    className="group relative flex-1 rounded-t-sm bg-gradient-to-t from-[rgba(77,141,255,0.3)] to-accent transition hover:from-[rgba(77,141,255,0.5)] hover:to-[rgba(120,170,255,1)]"
                    style={{ height: `${pct}%` }}
                  >
                    {count > 0 && (
                      <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-bg-3 px-1 py-[2px] font-mono text-[9px] text-ink-0 opacity-0 shadow-md transition group-hover:opacity-100">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-[6px] flex justify-between font-mono text-[9px] text-ink-3">
              {DAY_LABELS.map((d) => <span key={d}>{d}</span>)}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="font-mono text-[10px] text-ink-3">
                {total7d} build{total7d !== 1 ? "s" : ""} this week
              </span>
              <Link
                href="/builder"
                className="font-mono text-[10px] uppercase tracking-[0.08em] text-accent transition hover:text-ink-0"
              >
                View All →
              </Link>
            </div>
          </Panel>

          {/* ── Recent Builds — fully interactive ── */}
          <Panel>
            <div className="mb-[12px] flex items-center justify-between">
              <div className="font-display text-[15px] font-medium">Recent Builds</div>
              <Link
                href="/builder"
                className="font-mono text-[10px] uppercase tracking-[0.08em] text-accent transition hover:text-ink-0"
              >
                Open Builder →
              </Link>
            </div>

            {recentBuilds.length === 0 ? (
              <div className="rounded-[8px] border border-dashed border-line py-5 text-center">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                  No builds yet
                </div>
                <Link
                  href="/builder"
                  className="font-mono text-[11px] text-accent underline transition hover:text-ink-0"
                >
                  Start your first build →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-px">
                {recentBuilds.slice(0, 6).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => openBuild(b.id, b.prompt)}
                    title={b.prompt}
                    className="group flex w-full items-center gap-[10px] rounded-[6px] px-[10px] py-[9px] text-left transition hover:bg-[rgba(77,141,255,0.07)]"
                  >
                    {/* Status dot */}
                    <span
                      className={`h-[7px] w-[7px] flex-shrink-0 rounded-full ${STATUS_TONE[b.status].dot} ${
                        b.status === "streaming" || b.status === "queued" ? "animate-pulse" : ""
                      }`}
                    />

                    {/* Prompt title */}
                    <span className="flex-1 truncate text-[12px] text-ink-1 group-hover:text-ink-0">
                      {titleFromPrompt(b.prompt, 36)}
                    </span>

                    {/* Status label */}
                    <span className={`flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.08em] ${STATUS_TONE[b.status].label}`}>
                      {b.status}
                    </span>

                    {/* Time */}
                    <span className="flex-shrink-0 font-mono text-[9px] text-ink-3">
                      {timeAgo(b.createdAt)}
                    </span>

                    {/* Arrow — shown on hover */}
                    <span className="flex-shrink-0 font-mono text-[10px] text-accent opacity-0 transition group-hover:opacity-100">
                      →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Panel>

          {/* System Status */}
          <Panel>
            <div className="mb-[12px] font-display text-[15px] font-medium">System Status</div>

            {/* Static infrastructure (stub) */}
            {[
              { name: "Orchestrator", dot: "bg-accent-teal", status: "OPERATIONAL", color: "text-accent-teal" },
              { name: "Database",     dot: "bg-accent-teal", status: "14ms",         color: "text-accent-teal" },
              { name: "Qdrant",       dot: "bg-accent-amber", status: "WARMING",     color: "text-accent-amber" },
            ].map((s) => (
              <div key={s.name} className="mb-2 flex items-center gap-2 text-[12px] text-ink-1">
                <span className={`h-[6px] w-[6px] rounded-full ${s.dot}`} />
                {s.name}
                <span className={`ml-auto font-mono text-[10px] ${s.color}`}>{s.status}</span>
              </div>
            ))}

            {/* Dynamic: agent / build count from real data */}
            <div className="mb-0 flex items-center gap-2 text-[12px] text-ink-1">
              <span
                className={`h-[6px] w-[6px] rounded-full ${
                  stats.activeBuilds > 0 ? "bg-accent-teal animate-pulse" : "bg-[#555]"
                }`}
              />
              Agents
              <span
                className={`ml-auto font-mono text-[10px] ${
                  stats.activeBuilds > 0 ? "text-accent-teal" : "text-ink-3"
                }`}
              >
                {stats.activeBuilds > 0 ? `${stats.activeBuilds} ACTIVE` : "IDLE"}
              </span>
            </div>

            {/* Footer link to builder */}
            <div className="mt-4 border-t border-line pt-3">
              <Link
                href="/builder"
                className="flex items-center justify-between font-mono text-[10px] text-ink-3 transition hover:text-ink-0"
              >
                <span>Open Builder workspace</span>
                <span className="text-accent">→</span>
              </Link>
            </div>
          </Panel>

        </div>
      </div>
    </PageInner>
  );
}
