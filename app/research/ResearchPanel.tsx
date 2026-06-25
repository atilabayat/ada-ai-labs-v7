"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SecLabel } from "@/components/ui";
import ExportMenu from "@/components/ExportMenu";
import { useWorkspace } from "@/lib/store";
import {
  runDeepResearch, saveResearchSession, deleteResearchSession,
  publishResearchToWiki, pushResearchToKnowledgeGraph, getPublishableWikis,
} from "@/lib/actions";
import type { SavedResearchSession } from "@/lib/actions";
import type { DeepResearchResult } from "@/lib/types";

// ── Static source definitions ─────────────────────────────────────────────────

const SOURCE_DEFS = [
  { ic: "A", name: "Academic",   badgeCls: "text-accent-violet bg-[rgba(167,139,250,0.1)]" },
  { ic: "I", name: "Industry",   badgeCls: "text-accent-amber  bg-[rgba(245,158,11,0.1)]"  },
  { ic: "F", name: "Financial",  badgeCls: "text-accent-teal   bg-[rgba(20,184,166,0.1)]"  },
  { ic: "G", name: "Government", badgeCls: "text-accent        bg-[rgba(77,141,255,0.1)]"  },
  { ic: "T", name: "Technical",  badgeCls: "text-accent-hot    bg-[rgba(255,122,61,0.1)]"  },
] as const;

type Category = typeof SOURCE_DEFS[number]["name"];

const CAT_BADGE: Record<Category, string> = {
  Academic:   "text-accent-violet bg-[rgba(167,139,250,0.1)]",
  Industry:   "text-accent-amber  bg-[rgba(245,158,11,0.1)]",
  Financial:  "text-accent-teal   bg-[rgba(20,184,166,0.1)]",
  Government: "text-accent        bg-[rgba(77,141,255,0.1)]",
  Technical:  "text-accent-hot    bg-[rgba(255,122,61,0.1)]",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface FeedItem extends DeepResearchResult {
  isNew?: boolean;
}

interface Session {
  id:          string;
  title:       string;
  status:      "running" | "finished" | "error";
  sourceCount: number;
  categories:  string[];
}

// ── Seed data (kept as examples per design intent) ────────────────────────────

const SEED_FEED: FeedItem[] = [
  {
    id:       "seed-1",
    title:    "Self-Challenging Agents: Continuous Self-Improvement via Curriculum Generation",
    badge:    "arXiv 2506.04287",
    date:     "June 2025",
    org:      "Anthropic & Stanford",
    body:     "Self-improving agents are AI systems capable of autonomously enhancing their own performance with minimal external supervision. Benchmark results show 2-3× performance gains on SWE-Bench (20% → 50%).",
    category: "Academic",
    url:      "https://arxiv.org/abs/2506.04287",
  },
  {
    id:       "seed-2",
    title:    "Darwin Gödel Machine: Self-Modifying Code Agents via Evolutionary Search",
    badge:    "arXiv 2505.21156",
    date:     "May 2025",
    org:      "Sakana AI",
    body:     "Introduces evolutionary search over self-modifying code agents. Polyglot benchmark improved from 14.2% to 30.7% across iterations of unsupervised self-modification.",
    category: "Academic",
    url:      "https://arxiv.org/abs/2505.21156",
  },
  {
    id:       "seed-3",
    title:    "Metacognitive Learning Frameworks for Autonomous Reasoning Systems",
    badge:    "arXiv 2504.18923",
    date:     "April 2025",
    org:      "DeepMind",
    body:     "Proposes a metacognition layer enabling agents to reflect on their own reasoning, generate improvement proposals, and validate them via empirical evaluation cycles.",
    category: "Academic",
    url:      "https://arxiv.org/abs/2504.18923",
  },
  {
    id:       "seed-4",
    title:    "VIX Term Structure as a Regime Indicator: A Three-Year Backtest",
    badge:    "SSRN 4892341",
    date:     "March 2025",
    org:      "NYU Stern",
    body:     "Empirical evaluation of VIX term-structure signals for regime classification across the 2022-2024 SPX cycle, showing a 1.4 Sharpe improvement over a long-only baseline.",
    category: "Financial",
    url:      "https://ssrn.com/abstract=4892341",
  },
];

// Sessions start empty — they are created by the user via "+ New Session".
// Seed sessions were removed because they re-appeared on every page load,
// caused the "running" stub to never resolve, and poisoned the stale-closure
// de-duplication so real results appeared as duplicates.

// Source document counts from seed (would come from DB in a production system)
const SOURCE_COUNTS: Record<string, number> = {
  Academic:   428,
  Industry:   312,
  Financial:  186,
  Government: 94,
  Technical:  221,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResearchPanel({ savedSessions = [] }: { savedSessions?: SavedResearchSession[] }) {
  // ── Core state ─────────────────────────────────────────────────────────────
  const [activeSources, setActiveSources] = useState<Set<Category>>(new Set());
  const [sessions,      setSessions]      = useState<Session[]>([]);
  const [feed,          setFeed]          = useState<FeedItem[]>(SEED_FEED);

  // ── Session Log state ──────────────────────────────────────────────────────
  const [activeTab,       setActiveTab]       = useState<"feed" | "log">("feed");
  const [logSessions,     setLogSessions]     = useState<SavedResearchSession[]>(savedSessions);
  const [expandedLog,     setExpandedLog]     = useState<string | null>(null);
  const [deletingId,      setDeletingId]      = useState<string | null>(null);
  const [logTransPending, startLogTransition] = useTransition();

  // Count live sources per category (seed + results)
  const catCounts = SOURCE_DEFS.reduce<Record<string, number>>((acc, s) => {
    acc[s.name] = (SOURCE_COUNTS[s.name] ?? 0) + feed.filter(f => f.category === s.name && f.isNew).length;
    return acc;
  }, {});

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modalOpen,  setModalOpen]  = useState(false);
  const [modalTopic, setModalTopic] = useState("");
  const [modalCats,  setModalCats]  = useState<Set<Category>>(
    new Set(SOURCE_DEFS.map((s) => s.name))
  );

  // ── Research transition ────────────────────────────────────────────────────
  const [researchPending, startResearch] = useTransition();
  const topicRef = useRef<HTMLInputElement>(null);

  // ── Curate → Publish → Graph ────────────────────────────────────────────────
  const router    = useRouter();
  const showToast = useWorkspace((s) => s.showToast);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [publishOpen,    setPublishOpen]    = useState(false);
  const [publishMode,    setPublishMode]    = useState<"new" | "append">("new");
  const [publishTitle,   setPublishTitle]   = useState("");
  const [synthesize,     setSynthesize]     = useState(true);
  const [pushGraph,      setPushGraph]      = useState(false);
  const [appendTarget,   setAppendTarget]   = useState("");
  const [wikiList,       setWikiList]       = useState<{ slug: string; title: string; banner: string }[]>([]);
  const [publishResult,  setPublishResult]  = useState<{ slug: string; appended: boolean; graphNodes?: number } | null>(null);
  const [publishPending, startPublish]      = useTransition();

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const selectedResults = (): FeedItem[] => feed.filter((f) => selected.has(f.id));
  const defaultTitle = () => logSessions[0]?.topic || sessions[0]?.title || "Curated Research";

  const openPublish = () => {
    if (selected.size === 0) return;
    setPublishMode("new");
    setPublishTitle(defaultTitle());
    setSynthesize(true);
    setPushGraph(false);
    setAppendTarget("");
    setPublishResult(null);
    setPublishOpen(true);
    getPublishableWikis().then(setWikiList).catch(() => setWikiList([]));
  };

  const handlePublish = () => {
    const results = selectedResults();
    if (results.length === 0) return;
    if (publishMode === "append" && !appendTarget) { showToast("Choose a wiki to append to"); return; }
    const topic = publishTitle.trim() || defaultTitle();

    startPublish(async () => {
      const res = await publishResearchToWiki({
        topic,
        results,
        mode:       publishMode,
        targetSlug: publishMode === "append" ? appendTarget : undefined,
        synthesize,
        title:      topic,
      });
      if (!res.ok) { showToast(`Publish failed: ${res.error}`); return; }

      let graphNodes: number | undefined;
      if (pushGraph) {
        const g = await pushResearchToKnowledgeGraph(topic, results);
        if (g.ok) graphNodes = g.nodes;
      }
      setPublishResult({ slug: res.slug, appended: res.appended, graphNodes });
      showToast(res.appended ? "Appended to wiki" : "Wiki published");
      setSelected(new Set());
    });
  };

  // Build an export document (HTML) from the current selection — fed to ExportMenu.
  const buildExportContent = () => {
    const results = selectedResults();
    const title = publishTitle.trim() || defaultTitle();
    const esc = (s: string) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const body = results.map((r) => {
      const head = r.url ? `<a href="${esc(r.url)}">${esc(r.title)}</a>` : esc(r.title);
      return `<section style="margin:0 0 18px"><h3 style="margin:0 0 4px">${head}</h3>` +
        `<div style="font:12px monospace;color:#667">${esc(r.org)} · ${esc(r.badge)} · ${esc(r.date)} · ${esc(r.category)}</div>` +
        `<p style="margin:6px 0 0">${esc(r.body)}</p></section>`;
    }).join("\n");
    return {
      title:    `Research — ${title}`,
      html:     `<h1>${esc(title)}</h1><p><em>${results.length} curated sources</em></p>\n${body}`,
      filename: `research-${title}`,
    };
  };

  // ── Side-effects ───────────────────────────────────────────────────────────

  // Close modal on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  // Auto-focus topic input when modal opens
  useEffect(() => {
    if (modalOpen) {
      const t = setTimeout(() => topicRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [modalOpen]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleSource = (name: Category) => {
    setActiveSources((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else                next.add(name);
      return next;
    });
  };

  const toggleModalCat = (cat: Category) => {
    setModalCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else               next.add(cat);
      return next;
    });
  };

  const openModal = () => {
    setModalTopic("");
    setModalCats(new Set(SOURCE_DEFS.map((s) => s.name)));
    setModalOpen(true);
  };

  const dismissSession = (id: string) =>
    setSessions((prev) => prev.filter((s) => s.id !== id));

  const clearCompleted = () =>
    setSessions((prev) => prev.filter((s) => s.status === "running"));

  const handleStartResearch = () => {
    if (!modalTopic.trim() || modalCats.size === 0) return;

    const topic = modalTopic.trim();
    const cats  = Array.from(modalCats);

    // Guard: don't create a duplicate session for an already-running topic
    const alreadyRunning = sessions.some(
      (s) => s.title.toLowerCase() === topic.toLowerCase() && s.status === "running"
    );
    if (alreadyRunning) { setModalOpen(false); return; }

    const sessionId = `session-${Date.now()}`;

    // Optimistic session entry
    setSessions((prev) => [
      { id: sessionId, title: topic, status: "running", sourceCount: 0, categories: cats },
      ...prev,
    ]);
    setModalOpen(false);

    startResearch(async () => {
      const result = await runDeepResearch(topic, cats);
      if (result.ok) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, status: "finished", sourceCount: result.results.length }
              : s
          )
        );
        // FIX: use functional setFeed so de-duplication always sees current state,
        // not a stale closure captured when the session was created. This was the
        // root cause of duplicate feed items across multiple sessions.
        setFeed((prev) => {
          const existingIds = new Set(prev.map((f) => f.id));
          const fresh = result.results
            .filter((r) => !existingIds.has(r.id))
            .map((r) => ({ ...r, isNew: true }));
          return [...fresh, ...prev];
        });
        // Persist to session log
        saveResearchSession(sessionId, topic, cats, "finished", result.results).then((res) => {
          if (res.ok) {
            const saved: SavedResearchSession = {
              id: sessionId, topic, categories: cats, status: "finished",
              results: result.results, resultCount: result.results.length,
              createdAt: new Date().toISOString(),
            };
            setLogSessions((prev) => [saved, ...prev]);
          }
        });
      } else {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, status: "error" } : s
          )
        );
        saveResearchSession(sessionId, topic, cats, "error", []);
      }
    });
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredFeed =
    activeSources.size === 0
      ? feed
      : feed.filter((item) => activeSources.has(item.category as Category));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="grid grid-cols-[280px_1fr] gap-5 max-[900px]:grid-cols-1">

        {/* ── Left sidebar ── */}
        <div>
          <SecLabel>Sources</SecLabel>

          {SOURCE_DEFS.map((s) => {
            const isActive = activeSources.has(s.name);
            return (
              <button
                key={s.name}
                onClick={() => toggleSource(s.name)}
                className={`mb-[6px] flex w-full cursor-pointer items-center gap-[10px] rounded-lg border px-3 py-[10px] text-[13px] transition-all hover:-translate-y-px ${
                  isActive
                    ? "border-accent bg-[rgba(77,141,255,0.07)] shadow-[0_0_0_1px_rgba(77,141,255,0.18)]"
                    : "border-line bg-bg-1 hover:border-line-strong hover:bg-bg-2"
                }`}
              >
                {/* Icon */}
                <div
                  className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-[5px] font-mono text-[10px] font-bold transition-colors ${
                    isActive ? "bg-[rgba(77,141,255,0.18)] text-accent" : "bg-bg-3 text-ink-2"
                  }`}
                >
                  {s.ic}
                </div>

                {/* Label */}
                <div className={`flex-1 text-left ${isActive ? "text-ink-0" : "text-ink-1"}`}>
                  {s.name}
                </div>

                {/* Count */}
                <div className="font-mono text-[9px] text-ink-3">
                  {catCounts[s.name] ?? SOURCE_COUNTS[s.name]}
                </div>

                {/* Active checkmark */}
                {isActive && (
                  <span className="text-[11px] text-accent">✓</span>
                )}
              </button>
            );
          })}

          {/* Clear filter */}
          {activeSources.size > 0 && (
            <button
              onClick={() => setActiveSources(new Set())}
              className="mt-1 font-mono text-[10px] text-ink-3 underline underline-offset-2 transition hover:text-ink-1"
            >
              clear filter
            </button>
          )}

          {/* ── Active Sessions ── */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <SecLabel>Sessions</SecLabel>
              {sessions.some((s) => s.status !== "running") && (
                <button
                  onClick={clearCompleted}
                  className="font-mono text-[9px] text-ink-3 underline underline-offset-2 transition hover:text-ink-1"
                >
                  clear done
                </button>
              )}
            </div>

            {sessions.length === 0 && (
              <p className="font-mono text-[11px] text-ink-3">No sessions yet. Click + New Session to start.</p>
            )}

            {sessions.map((session) => {
              const isRunning = session.status === "running";
              const isError   = session.status === "error";
              const isDone    = session.status === "finished";
              return (
                <div
                  key={session.id}
                  className={`mb-[6px] rounded-lg border p-3 text-[12px] transition-all ${
                    isRunning
                      ? "border-accent-amber bg-[rgba(245,158,11,0.04)]"
                      : isError
                      ? "border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.04)]"
                      : "border-line bg-bg-1"
                  }`}
                >
                  <div className="mb-[3px] flex items-center justify-between gap-2">
                    <span className="flex-1 truncate font-medium text-ink-0">{session.title}</span>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {isRunning && (
                        <span className="flex items-center gap-1 font-mono text-[9px] uppercase text-accent-amber">
                          <span className="inline-block h-[7px] w-[7px] animate-spin rounded-full border border-accent-amber border-t-transparent" />
                          running
                        </span>
                      )}
                      {isDone && (
                        <span className="font-mono text-[9px] uppercase text-accent-teal">✓ done</span>
                      )}
                      {isError && (
                        <span className="font-mono text-[9px] uppercase text-accent-rose">✗ error</span>
                      )}
                      {!isRunning && (
                        <button
                          onClick={() => dismissSession(session.id)}
                          title="Dismiss session"
                          className="grid h-[18px] w-[18px] place-items-center rounded-full border border-line text-[9px] text-ink-3 transition hover:border-line-strong hover:text-ink-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="font-mono text-[10px] text-ink-3">
                    {isRunning
                      ? "searching across sources…"
                      : `${session.sourceCount} source${session.sourceCount !== 1 ? "s" : ""} found`}
                  </div>

                  {/* Progress bar (running) */}
                  {isRunning && (
                    <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-bg-3">
                      <div
                        className="h-full rounded-full bg-accent-amber"
                        style={{
                          width: "65%",
                          animation: "pulse 1.4s ease-in-out infinite",
                        }}
                      />
                    </div>
                  )}

                  {/* Category chips */}
                  {session.categories.length > 0 && !isRunning && (
                    <div className="mt-2 flex flex-wrap gap-[4px]">
                      {session.categories.map((c) => (
                        <span
                          key={c}
                          className={`rounded-[3px] px-[5px] py-[1px] font-mono text-[8px] uppercase tracking-[0.06em] ${CAT_BADGE[c as Category] ?? "text-ink-3 bg-bg-3"}`}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Research Feed + Session Log ── */}
        <div className="rounded-[10px] border border-line bg-bg-1 px-6 py-5">
          {/* Panel header with tabs */}
          <div className="mb-[14px] flex flex-wrap items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-[2px] rounded-[8px] border border-line bg-bg-2 p-[3px]">
              <button
                onClick={() => setActiveTab("feed")}
                className={`rounded-[6px] px-[14px] py-[5px] font-mono text-[10px] uppercase tracking-[0.1em] transition-all ${activeTab === "feed" ? "bg-bg-1 text-ink-0 shadow-sm" : "text-ink-3 hover:text-ink-1"}`}
              >
                Live Feed
              </button>
              <button
                onClick={() => setActiveTab("log")}
                className={`flex items-center gap-[6px] rounded-[6px] px-[14px] py-[5px] font-mono text-[10px] uppercase tracking-[0.1em] transition-all ${activeTab === "log" ? "bg-bg-1 text-ink-0 shadow-sm" : "text-ink-3 hover:text-ink-1"}`}
              >
                Session Log
                {logSessions.length > 0 && (
                  <span className="rounded-full bg-accent px-[6px] py-[1px] text-[8px] text-white">{logSessions.length}</span>
                )}
              </button>
            </div>

            {/* Active filter pills (feed tab only) */}
            <div className="flex flex-wrap items-center gap-2">
              {activeTab === "feed" && activeSources.size > 0 && (
                <div className="flex flex-wrap gap-[5px]">
                  {Array.from(activeSources).map((s) => (
                    <span
                      key={s}
                      className={`cursor-pointer rounded-full px-[9px] py-[2px] font-mono text-[9px] uppercase tracking-[0.08em] transition hover:opacity-70 ${CAT_BADGE[s]}`}
                      onClick={() => toggleSource(s)}
                    >
                      {s} ×
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={openModal}
                className="flex-shrink-0 rounded-[7px] border border-[rgba(77,141,255,0.35)] bg-[rgba(77,141,255,0.06)] px-[16px] py-[7px] font-mono text-[10px] uppercase tracking-[0.1em] text-accent transition-all hover:-translate-y-px hover:border-accent hover:bg-[rgba(77,141,255,0.12)] hover:shadow-[0_4px_12px_rgba(77,141,255,0.2)]"
              >
                + New Session
              </button>
            </div>
          </div>

          {/* ── Live Feed tab ── */}
          {activeTab === "feed" && (
            <>
              {/* Selection action bar — curate → publish → export */}
              {selected.size > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[8px] border border-[rgba(167,139,250,0.4)] bg-[rgba(167,139,250,0.06)] px-4 py-[10px]">
                  <span className="font-mono text-[11px] text-accent-violet">★ {selected.size} selected</span>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="font-mono text-[10px] text-ink-3 underline underline-offset-2 transition hover:text-ink-1"
                  >
                    clear
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <ExportMenu
                      getContent={buildExportContent}
                      triggerLabel="↗ Export"
                      triggerClassName="rounded-[7px] border border-line px-[14px] py-[6px] font-mono text-[10px] uppercase tracking-[0.1em] text-ink-1 transition hover:border-accent hover:text-accent"
                    />
                    <button
                      onClick={openPublish}
                      className="rounded-[7px] border border-[rgba(167,139,250,0.5)] bg-[rgba(167,139,250,0.1)] px-[16px] py-[6px] font-mono text-[10px] uppercase tracking-[0.1em] text-accent-violet transition hover:-translate-y-px hover:border-accent-violet hover:bg-[rgba(167,139,250,0.18)]"
                    >
                      ▤ Publish to Wiki
                    </button>
                  </div>
                </div>
              )}
              {researchPending && (
                <div className="mb-4 flex items-center gap-3 rounded-[8px] border border-accent-amber bg-[rgba(245,158,11,0.06)] px-4 py-3">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent-amber border-t-transparent" />
                  <span className="font-mono text-[11px] text-accent-amber">
                    Querying academic papers, web sources &amp; SEC filings…
                  </span>
                </div>
              )}
              {filteredFeed.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="mb-2 font-display text-[15px] text-ink-2">No results in this filter</div>
                  <div className="font-mono text-[11px] text-ink-3">
                    Start a new session to pull live data for this source category.
                  </div>
                </div>
              ) : (
                filteredFeed.map((f) => (
                  <div
                    key={f.id}
                    className={`relative border-b border-line py-[14px] pr-9 last:border-0 ${f.isNew ? "animate-[fadeSlideIn_0.35s_ease]" : ""} ${selected.has(f.id) ? "bg-[rgba(167,139,250,0.05)]" : ""}`}
                  >
                    {/* Curate toggle */}
                    <button
                      onClick={() => toggleSelect(f.id)}
                      title={selected.has(f.id) ? "Remove from selection" : "Add to selection"}
                      className={`absolute right-0 top-[14px] grid h-[24px] w-[24px] place-items-center rounded-md border text-[12px] transition ${
                        selected.has(f.id)
                          ? "border-accent-violet bg-[rgba(167,139,250,0.15)] text-accent-violet"
                          : "border-line text-ink-3 hover:border-accent-violet hover:text-accent-violet"
                      }`}
                    >
                      {selected.has(f.id) ? "★" : "☆"}
                    </button>
                    <h5 className="mb-[6px] font-display text-[15px] font-medium text-ink-0">
                      {f.url ? (
                        <a href={f.url} target="_blank" rel="noopener noreferrer"
                          className="transition-colors hover:text-accent hover:underline">
                          {f.title}
                        </a>
                      ) : f.title}
                    </h5>
                    <div className="mb-2 flex flex-wrap items-center gap-3 font-mono text-[10px] text-ink-3">
                      <span className={`rounded-[3px] px-[7px] py-[2px] ${CAT_BADGE[f.category as Category] ?? "bg-[rgba(167,139,250,0.1)] text-accent-violet"}`}>
                        {f.badge}
                      </span>
                      <span>{f.date}</span>
                      <span>{f.org}</span>
                      {f.isNew && (
                        <span className="flex items-center gap-[4px] text-accent-teal">
                          <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent-teal shadow-[0_0_6px_rgba(20,184,166,0.6)]" />
                          new
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] leading-relaxed text-ink-1">{f.body}</p>
                  </div>
                ))
              )}
            </>
          )}

          {/* ── Session Log tab ── */}
          {activeTab === "log" && (
            <>
              {logSessions.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="mb-2 font-display text-[15px] text-ink-2">No saved sessions yet</div>
                  <div className="font-mono text-[11px] text-ink-3">
                    Run a research session — results are automatically saved here for future review.
                  </div>
                </div>
              ) : (
                <div className="space-y-[10px]">
                  {logSessions.map((s) => {
                    const isExpanded = expandedLog === s.id;
                    const date = new Date(s.createdAt);
                    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <div key={s.id} className="overflow-hidden rounded-[8px] border border-line bg-bg-2">
                        {/* Session header row */}
                        <div
                          className="flex cursor-pointer items-center gap-3 px-4 py-[11px] hover:bg-bg-3"
                          onClick={() => setExpandedLog(isExpanded ? null : s.id)}
                        >
                          <span className={`flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.08em] ${s.status === "finished" ? "text-accent-teal" : "text-accent-rose"}`}>
                            {s.status === "finished" ? "✓" : "✗"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-medium text-ink-0">{s.topic}</div>
                            <div className="mt-[2px] flex flex-wrap items-center gap-2 font-mono text-[9px] text-ink-3">
                              <span>{dateStr} · {timeStr}</span>
                              <span>·</span>
                              <span>{s.resultCount} result{s.resultCount !== 1 ? "s" : ""}</span>
                              {s.categories.map((c) => (
                                <span key={c} className={`rounded-[3px] px-[5px] py-[1px] ${CAT_BADGE[c as Category] ?? "text-ink-3 bg-bg-3"}`}>{c}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Load this session's results into the live feed and switch tabs
                                setFeed((prev) => {
                                  const existingIds = new Set(prev.map((f) => f.id));
                                  const fresh = s.results.filter((r) => !existingIds.has(r.id)).map((r) => ({ ...r, isNew: true }));
                                  return [...fresh, ...prev];
                                });
                                setActiveTab("feed");
                              }}
                              className="rounded-[5px] border border-line px-[8px] py-[3px] font-mono text-[9px] uppercase tracking-[0.06em] text-ink-2 transition hover:border-accent hover:text-accent"
                            >
                              Load
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (deletingId === s.id) return;
                                setDeletingId(s.id);
                                startLogTransition(async () => {
                                  await deleteResearchSession(s.id);
                                  setLogSessions((prev) => prev.filter((x) => x.id !== s.id));
                                  if (expandedLog === s.id) setExpandedLog(null);
                                  setDeletingId(null);
                                });
                              }}
                              disabled={deletingId === s.id}
                              className="grid h-[22px] w-[22px] place-items-center rounded-full border border-line text-[9px] text-ink-3 transition hover:border-accent-rose hover:text-accent-rose disabled:opacity-40"
                              title="Delete session"
                            >
                              {deletingId === s.id ? "…" : "✕"}
                            </button>
                            <span className={`text-[10px] text-ink-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}>▾</span>
                          </div>
                        </div>

                        {/* Expanded results */}
                        {isExpanded && s.results.length > 0 && (
                          <div className="border-t border-line px-4 pb-4 pt-3">
                            {s.results.map((r) => (
                              <div key={r.id} className="border-b border-line py-[11px] last:border-0">
                                <h5 className="mb-[5px] text-[14px] font-medium text-ink-0">
                                  {r.url ? (
                                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                                      className="transition-colors hover:text-accent hover:underline">
                                      {r.title}
                                    </a>
                                  ) : r.title}
                                </h5>
                                <div className="mb-[6px] flex flex-wrap items-center gap-2 font-mono text-[9px] text-ink-3">
                                  <span className={`rounded-[3px] px-[6px] py-[1px] ${CAT_BADGE[r.category as Category] ?? "bg-[rgba(167,139,250,0.1)] text-accent-violet"}`}>
                                    {r.badge}
                                  </span>
                                  <span>{r.date}</span>
                                  <span>{r.org}</span>
                                </div>
                                <p className="text-[12px] leading-relaxed text-ink-2">{r.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {isExpanded && s.results.length === 0 && (
                          <div className="border-t border-line px-4 py-4 font-mono text-[11px] text-ink-3">
                            No results were saved for this session.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── New Session Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center bg-[rgba(0,0,0,0.65)] backdrop-blur-[4px]"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            className="relative mx-4 w-full max-w-[520px] rounded-[16px] border border-line-strong bg-bg-1 shadow-[0_40px_100px_rgba(0,0,0,0.75)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-line px-6 py-5">
              <div>
                <div className="font-display text-[18px] font-medium text-ink-0">New Research Session</div>
                <div className="mt-[3px] font-mono text-[10px] text-ink-3">
                  Query academic papers, web intelligence &amp; SEC filings in parallel
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="ml-4 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border border-line text-[12px] text-ink-2 transition hover:border-line-strong hover:text-ink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5">
              {/* Topic input */}
              <div className="mb-5">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                  Research Topic
                </div>
                <input
                  ref={topicRef}
                  value={modalTopic}
                  onChange={(e) => setModalTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && modalTopic.trim() && modalCats.size > 0) handleStartResearch();
                  }}
                  placeholder="e.g. Self-improving AI agents, VIX regime signals, CRISPR therapeutics…"
                  className="w-full rounded-[8px] border border-line bg-bg-2 px-4 py-[10px] text-[13px] text-ink-0 placeholder-ink-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-[rgba(77,141,255,0.25)]"
                />
              </div>

              {/* Source categories */}
              <div className="mb-6">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                  Source Categories
                </div>
                <div className="grid grid-cols-3 gap-2 max-[440px]:grid-cols-2">
                  {SOURCE_DEFS.map((s) => {
                    const checked = modalCats.has(s.name);
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => toggleModalCat(s.name)}
                        className={`flex items-center gap-2 rounded-[8px] border px-3 py-[9px] text-[12px] transition-all ${
                          checked
                            ? "border-accent bg-[rgba(77,141,255,0.08)] text-ink-0 shadow-[0_0_0_1px_rgba(77,141,255,0.2)]"
                            : "border-line bg-bg-2 text-ink-2 hover:border-line-strong hover:bg-bg-3 hover:text-ink-1"
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-[4px] border text-[9px] font-bold transition-colors ${
                            checked
                              ? "border-accent bg-accent text-white"
                              : "border-line-strong bg-bg-3 text-ink-3"
                          }`}
                        >
                          {checked ? "✓" : s.ic}
                        </div>
                        {s.name}
                      </button>
                    );
                  })}
                </div>
                {modalCats.size === 0 && (
                  <p className="mt-2 font-mono text-[10px] text-accent-rose">
                    Select at least one source category.
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={!modalTopic.trim() || modalCats.size === 0}
                  onClick={handleStartResearch}
                  className="flex flex-1 items-center justify-center gap-[8px] rounded-[9px] bg-gradient-to-br from-accent to-accent-hot px-5 py-[11px] font-mono text-[11px] uppercase tracking-[0.1em] text-white shadow-[0_4px_20px_rgba(77,141,255,0.25)] transition hover:shadow-[0_6px_24px_rgba(77,141,255,0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  <span className="text-[13px]">⬡</span>
                  Start Research
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-[9px] border border-line px-6 py-[11px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2 transition hover:border-line-strong hover:text-ink-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Publish to Wiki Modal ── */}
      {publishOpen && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center bg-[rgba(0,0,0,0.65)] backdrop-blur-[4px]"
          onClick={(e) => { if (e.target === e.currentTarget) setPublishOpen(false); }}
        >
          <div
            className="relative mx-4 w-full max-w-[540px] rounded-[16px] border border-line-strong bg-bg-1 shadow-[0_40px_100px_rgba(0,0,0,0.75)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-line px-6 py-5">
              <div>
                <div className="font-display text-[18px] font-medium text-ink-0">Publish to Wiki</div>
                <div className="mt-[3px] font-mono text-[10px] text-ink-3">
                  {selected.size} curated source{selected.size !== 1 ? "s" : ""} → durable knowledge
                </div>
              </div>
              <button
                onClick={() => setPublishOpen(false)}
                className="ml-4 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border border-line text-[12px] text-ink-2 transition hover:border-line-strong hover:text-ink-0"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {publishResult ? (
                <div className="py-4 text-center">
                  <div className="mb-2 text-[30px] text-accent-teal">✓</div>
                  <div className="mb-1 font-display text-[16px] text-ink-0">
                    {publishResult.appended ? "Appended to wiki" : "Wiki published"}
                  </div>
                  <div className="mb-5 font-mono text-[11px] text-ink-3">
                    /wikis/{publishResult.slug}
                    {publishResult.graphNodes ? ` · ${publishResult.graphNodes} graph node${publishResult.graphNodes !== 1 ? "s" : ""} added` : ""}
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => { setPublishOpen(false); router.push(`/wikis/${publishResult.slug}`); }}
                      className="rounded-[9px] bg-gradient-to-br from-accent-violet to-accent px-5 py-[10px] font-mono text-[11px] uppercase tracking-[0.1em] text-white shadow-[0_4px_20px_rgba(167,139,250,0.3)] transition hover:shadow-[0_6px_24px_rgba(167,139,250,0.45)]"
                    >
                      Open wiki ↗
                    </button>
                    <button
                      onClick={() => setPublishOpen(false)}
                      className="rounded-[9px] border border-line px-6 py-[10px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2 transition hover:border-line-strong hover:text-ink-0"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mode toggle */}
                  <div className="mb-5 flex gap-[2px] rounded-[8px] border border-line bg-bg-2 p-[3px]">
                    {(["new", "append"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPublishMode(m)}
                        className={`flex-1 rounded-[6px] px-3 py-[7px] font-mono text-[10px] uppercase tracking-[0.08em] transition ${
                          publishMode === m ? "bg-bg-1 text-ink-0 shadow-sm" : "text-ink-3 hover:text-ink-1"
                        }`}
                      >
                        {m === "new" ? "New wiki" : "Append to existing"}
                      </button>
                    ))}
                  </div>

                  {publishMode === "new" ? (
                    <div className="mb-5">
                      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">Wiki Title</div>
                      <input
                        value={publishTitle}
                        onChange={(e) => setPublishTitle(e.target.value)}
                        placeholder="Title for the new research wiki…"
                        className="w-full rounded-[8px] border border-line bg-bg-2 px-4 py-[10px] text-[13px] text-ink-0 placeholder-ink-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-[rgba(77,141,255,0.25)]"
                      />
                    </div>
                  ) : (
                    <div className="mb-5">
                      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">Target Wiki</div>
                      <select
                        value={appendTarget}
                        onChange={(e) => setAppendTarget(e.target.value)}
                        className="w-full rounded-[8px] border border-line bg-bg-2 px-4 py-[10px] text-[13px] text-ink-0 outline-none transition focus:border-accent"
                      >
                        <option value="">Select a wiki…</option>
                        {wikiList.map((w) => (
                          <option key={w.slug} value={w.slug}>{w.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Options */}
                  <div className="mb-6 space-y-2">
                    {[
                      { on: synthesize, set: () => setSynthesize((v) => !v),
                        title: "Synthesize narrative",
                        sub: "Orchestrator writes a cited article (via /wiki-builder). Off → structured source list." },
                      { on: pushGraph, set: () => setPushGraph((v) => !v),
                        title: "Push entities to Knowledge Graph",
                        sub: "Adds a topic node + source-org nodes to the /knowledge graph." },
                    ].map((opt) => (
                      <button
                        key={opt.title}
                        type="button"
                        onClick={opt.set}
                        className={`flex w-full items-center gap-3 rounded-[8px] border px-3 py-[10px] text-left transition ${
                          opt.on
                            ? "border-accent bg-[rgba(77,141,255,0.06)]"
                            : "border-line bg-bg-2 hover:border-line-strong"
                        }`}
                      >
                        <div className={`grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-[4px] border text-[9px] font-bold transition-colors ${
                          opt.on ? "border-accent bg-accent text-white" : "border-line-strong bg-bg-3 text-ink-3"
                        }`}>
                          {opt.on ? "✓" : ""}
                        </div>
                        <div>
                          <div className="text-[12px] text-ink-0">{opt.title}</div>
                          <div className="font-mono text-[9px] text-ink-3">{opt.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={
                        publishPending ||
                        (publishMode === "append" && !appendTarget) ||
                        (publishMode === "new" && !publishTitle.trim())
                      }
                      onClick={handlePublish}
                      className="flex flex-1 items-center justify-center gap-[8px] rounded-[9px] bg-gradient-to-br from-accent-violet to-accent px-5 py-[11px] font-mono text-[11px] uppercase tracking-[0.1em] text-white shadow-[0_4px_20px_rgba(167,139,250,0.25)] transition hover:shadow-[0_6px_24px_rgba(167,139,250,0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    >
                      {publishPending ? (
                        <>
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Publishing…
                        </>
                      ) : (
                        <>▤ {publishMode === "append" ? "Append to Wiki" : "Publish Wiki"}</>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublishOpen(false)}
                      className="rounded-[9px] border border-line px-6 py-[11px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2 transition hover:border-line-strong hover:text-ink-0"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
