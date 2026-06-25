"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KGEdge, KGNode } from "@/lib/queries";
import { AppDef } from "@/lib/types";
import { useWorkspace } from "@/lib/store";

// ─── Curated node metadata ───────────────────────────────────────────────────

interface NodeMeta {
  desc: string;
  wikis: string[];   // wiki slugs
  apps: string[];    // app ids
  skills: string[];  // skill ids
}

const NODE_META: Record<string, NodeMeta> = {
  tsla: {
    desc: "TSLA is the primary equity on the quant floor. Dealer positioning, gamma walls, the morning briefing, and pattern-compendium setups all converge here.",
    wikis: ["tsla-ticker-intelligence"],
    apps:  ["tsla-putwall", "call-wall"],
    skills: ["tsla-putwall", "callwall-monitor", "gamma-exposure", "vix-regime"],
  },
  ipa: {
    desc: "The IPA (Institutional Pattern Architecture) compendium — 35 patterns from Ross Cameron, Minervini, SMC/ICT, and ReadTheMarket, with empirical win rates.",
    wikis: ["ipa-pattern-compendium"],
    apps:  ["ipa-compendium"],
    skills: ["ipa-compendium"],
  },
  fvg: {
    desc: "Fair Value Gaps are imbalance zones where price moved too fast for full two-way participation, leaving unfilled institutional orders that attract future price.",
    wikis: ["ipa-pattern-compendium", "market-regime-memory"],
    apps:  [],
    skills: ["ipa-compendium", "market-data"],
  },
  put: {
    desc: "The put wall — the strike with the largest aggregate put open interest. Dealers short gamma below here are forced to buy as spot approaches, creating a gravitational floor.",
    wikis: ["tsla-ticker-intelligence", "market-regime-memory"],
    apps:  ["tsla-putwall"],
    skills: ["tsla-putwall", "gamma-exposure"],
  },
  call: {
    desc: "The call wall — the largest call OI strike. Dealers must sell as spot approaches, creating a resistance ceiling that defines the gamma compression range.",
    wikis: ["tsla-ticker-intelligence"],
    apps:  ["call-wall"],
    skills: ["callwall-monitor", "gamma-exposure"],
  },
  gamma: {
    desc: "Dealer Gamma Exposure (GEX) — aggregate signed gamma across all options expirations. Positive GEX damps moves; negative GEX accelerates them. Zero-GEX level is the tipping point.",
    wikis: ["market-regime-memory"],
    apps:  ["tsla-putwall", "call-wall"],
    skills: ["gamma-exposure", "dealer-flow", "vix-regime"],
  },
  "qm-qml": {
    desc: "Quick Move (QM) and Quick Move with Liquidity sweep (QML) — the core IPA reversal setups. QML adds a fakeout beyond liquidity before the real move, offering a refined entry.",
    wikis: ["ipa-pattern-compendium"],
    apps:  [],
    skills: ["ipa-compendium", "tsla-putwall"],
  },
  smc: {
    desc: "Smart Money Concepts — order blocks, breaker blocks, and FVGs as used by institutional traders. Source: ICT / Inner Circle Trader methodology integrated into the IPA compendium.",
    wikis: ["ipa-pattern-compendium"],
    apps:  [],
    skills: ["ipa-compendium", "dealer-flow"],
  },
  spy: {
    desc: "S&P 500 ETF — the primary macro context for all equity setups. SPY gamma walls define market-wide dealer hedging levels; SPY regime (above/below key MAs) gates whether TSLA long or short bias is warranted.",
    wikis: ["market-regime-memory"],
    apps:  [],
    skills: ["market-data", "vix-regime"],
  },
  vix: {
    desc: "CBOE Volatility Index — market 30-day implied vol. VIX > 20 signals elevated fear; > 30 marks a regime shift. High VIX expands options premiums and widens put/call wall ranges, making GEX levels less sticky.",
    wikis: ["market-regime-memory"],
    apps:  [],
    skills: ["vix-regime", "gamma-exposure"],
  },
  gex: {
    desc: "GEX Zero-Flip — the price level where dealer gamma crosses from positive (dampening) to negative (amplifying). Below the flip, dealers are short gamma and must chase moves in both directions, accelerating intraday swings.",
    wikis: ["market-regime-memory"],
    apps:  ["tsla-putwall"],
    skills: ["gamma-exposure", "dealer-flow"],
  },
  ob: {
    desc: "Order Block — the last opposing candle before a strong impulse move, representing resting institutional supply or demand. Price returns to fill the unexecuted orders before continuing in the impulse direction.",
    wikis: ["ipa-pattern-compendium"],
    apps:  [],
    skills: ["ipa-compendium"],
  },
  bos: {
    desc: "Break of Structure (BOS) — price breaking beyond the most recent swing high (bullish BOS) or swing low (bearish BOS), confirming trend continuation. Used to validate Order Block entries and filter counter-trend noise.",
    wikis: ["ipa-pattern-compendium"],
    apps:  [],
    skills: ["ipa-compendium"],
  },
  choch: {
    desc: "Change of Character (CHoCH) — the first BOS in the opposite direction of the prevailing trend, signaling a potential reversal. A CHoCH followed by an Order Block retest is the IPA core reversal entry sequence.",
    wikis: ["ipa-pattern-compendium"],
    apps:  [],
    skills: ["ipa-compendium"],
  },
  sweep: {
    desc: "Liquidity Sweep — price deliberately takes out a cluster of stop-losses (equal highs/lows, previous day H/L) to generate order flow before reversing. The sweep + displacement model underlies QML and most IPA reversal setups.",
    wikis: ["ipa-pattern-compendium"],
    apps:  [],
    skills: ["ipa-compendium", "tsla-putwall"],
  },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  nodes: KGNode[];
  edges: KGEdge[];
  legend: { color: string; label: string }[];
  appsMap: Record<string, AppDef>;
  wikiTitlesMap: Record<string, string>;
}

// ─── Panel section helpers ───────────────────────────────────────────────────

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
      {children}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KnowledgeGraph({ nodes, edges, legend, appsMap, wikiTitlesMap }: Props) {
  const router = useRouter();
  const openLaunch  = useWorkspace((s) => s.openLaunch);
  const primeComposer = useWorkspace((s) => s.primeComposer);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const selectedNode = selectedId ? nodeById.get(selectedId) ?? null : null;
  const meta = selectedId ? (NODE_META[selectedId] ?? null) : null;

  // Compute neighbors from edges (undirected)
  const neighbors = useMemo(() => {
    if (!selectedId) return [] as KGNode[];
    return edges
      .filter((e) => e.fromId === selectedId || e.toId === selectedId)
      .map((e) => nodeById.get(e.fromId === selectedId ? e.toId : e.fromId))
      .filter((n): n is KGNode => n !== undefined);
  }, [selectedId, edges, nodeById]);

  const handleNodeClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="relative h-[560px] overflow-hidden rounded-[12px] border border-line bg-bg-1">

      {/* ── Legend ── */}
      <div className="absolute left-4 top-4 z-10 rounded-lg border border-line bg-[rgba(15,22,38,0.85)] px-[14px] py-3 backdrop-blur-md">
        {legend.map((x) => (
          <div key={x.label} className="mb-1 flex items-center gap-2 font-mono text-[10px] text-ink-1 last:mb-0">
            <span className="h-[10px] w-[10px] flex-shrink-0 rounded-full" style={{ background: x.color }} />
            {x.label}
          </div>
        ))}
      </div>

      {/* ── Hint ── */}
      {!selectedId && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-10 font-mono text-[10px] text-ink-3">
          click a node to drill in
        </div>
      )}

      {/* ── SVG graph ── */}
      <svg
        viewBox="0 0 1000 560"
        className="h-full w-full"
        onClick={() => setSelectedId(null)}
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4d8dff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4d8dff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="selectGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Edges — dim unrelated edges when a node is selected */}
        {edges.map((e, i) => {
          const from = nodeById.get(e.fromId);
          const to   = nodeById.get(e.toId);
          if (!from || !to) return null;
          const isRelated = selectedId
            ? e.fromId === selectedId || e.toId === selectedId
            : true;
          return (
            <line
              key={i}
              x1={from.x} y1={from.y}
              x2={to.x}   y2={to.y}
              stroke={`rgba(120,150,220,${isRelated ? (selectedId ? 0.45 : e.opacity) : 0.04})`}
              strokeWidth={isRelated && selectedId ? 1.5 : 1}
              style={{ transition: "stroke 0.2s, stroke-opacity 0.2s" }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const isSelected  = n.id === selectedId;
          const isNeighbour = selectedId
            ? neighbors.some((nb) => nb.id === n.id)
            : false;
          const isDimmed = selectedId && !isSelected && !isNeighbour;

          return (
            <g
              key={n.id}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleNodeClick(n.id); }}
              style={{ opacity: isDimmed ? 0.25 : 1, transition: "opacity 0.2s" }}
            >
              {/* Selection halo */}
              {isSelected && <circle cx={n.x} cy={n.y} r={n.radius + 18} fill="url(#selectGlow)" />}
              {/* Highlight glow (TSLA) */}
              {n.highlight && !isSelected && <circle cx={n.x} cy={n.y} r={40} fill="url(#nodeGlow)" />}
              {/* Ring */}
              <circle
                cx={n.x} cy={n.y}
                r={n.radius}
                fill={isSelected ? "color-mix(in srgb, var(--bg-1) 95%, var(--accent) 5%)" : "var(--bg-1)"}
                stroke={n.color}
                strokeWidth={isSelected ? 2.5 : 2}
              />
              {/* Label */}
              <text
                x={n.x} y={n.y + 4}
                textAnchor="middle"
                fill={n.color}
                fontFamily="monospace"
                fontSize={isSelected ? n.fontSize + 1 : n.fontSize}
                fontWeight={isSelected || n.highlight ? 700 : 400}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── Drill-in panel ── */}
      {selectedNode && meta && (
        <div
          className="absolute right-0 top-0 h-full w-[280px] overflow-y-auto border-l border-line bg-[rgba(10,15,28,0.94)] backdrop-blur-xl"
          style={{ animation: "slideInRight 0.18s ease-out" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-[10px] w-[10px] flex-shrink-0 rounded-full"
                  style={{ background: selectedNode.color }}
                />
                <span className="font-mono text-[13px] font-semibold text-ink-0">{selectedNode.label}</span>
              </div>
              <div className="mt-[2px] font-mono text-[9px] uppercase tracking-[0.15em] text-ink-3">
                {selectedNode.category}
              </div>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="mt-[2px] flex-shrink-0 rounded-md border border-line-strong px-[7px] py-px font-mono text-[10px] text-ink-2 transition-colors hover:border-accent hover:text-ink-0"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 p-4">
            {/* Description */}
            <p className="text-[11.5px] leading-relaxed text-ink-2">{meta.desc}</p>

            {/* Connected nodes */}
            {neighbors.length > 0 && (
              <div>
                <SectionHead>Connected · {neighbors.length}</SectionHead>
                <div className="space-y-[6px]">
                  {neighbors.map((nb) => (
                    <button
                      key={nb.id}
                      onClick={() => setSelectedId(nb.id)}
                      className="flex w-full items-center gap-2 rounded-md border border-line px-[10px] py-[6px] text-left transition-colors hover:border-line-strong hover:bg-[rgba(255,255,255,0.03)]"
                    >
                      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: nb.color }} />
                      <span className="text-[11px] text-ink-1">{nb.label}</span>
                      <span className="ml-auto font-mono text-[9px] text-ink-3">{nb.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related wikis */}
            {meta.wikis.length > 0 && (
              <div>
                <SectionHead>Wikis</SectionHead>
                <div className="space-y-[6px]">
                  {meta.wikis.map((slug) => {
                    const title = wikiTitlesMap[slug] ?? slug;
                    return (
                      <Link
                        key={slug}
                        href={`/wikis/${slug}`}
                        className="flex items-center gap-2 rounded-md border border-line bg-[rgba(255,86,119,0.04)] px-[10px] py-[7px] transition-colors hover:border-accent-rose hover:bg-[rgba(255,86,119,0.08)]"
                      >
                        <span className="font-mono text-[11px] text-accent-rose">▤</span>
                        <span className="flex-1 text-[11px] text-ink-1">{title}</span>
                        <span className="font-mono text-[9px] text-ink-3">→</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related apps */}
            {meta.apps.length > 0 && (
              <div>
                <SectionHead>Applications</SectionHead>
                <div className="space-y-[6px]">
                  {meta.apps.map((appId) => {
                    const app = appsMap[appId];
                    if (!app) return null;
                    return (
                      <button
                        key={appId}
                        onClick={() => openLaunch(appId)}
                        className="flex w-full items-center gap-2 rounded-md border border-line bg-[rgba(245,183,72,0.04)] px-[10px] py-[7px] text-left transition-colors hover:border-accent-amber hover:bg-[rgba(245,183,72,0.08)]"
                      >
                        <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded bg-[rgba(245,183,72,0.12)] font-mono text-[10px] font-bold text-accent-amber">
                          {app.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11px] text-ink-1">{app.name}</div>
                          <div className="font-mono text-[9px] text-ink-3">{app.env}</div>
                        </div>
                        <span className="font-mono text-[9px] text-ink-3">⊞</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related skills */}
            {meta.skills.length > 0 && (
              <div>
                <SectionHead>Skills</SectionHead>
                <div className="flex flex-wrap gap-[5px]">
                  {meta.skills.map((id) => (
                    <button
                      key={id}
                      onClick={() => {
                        primeComposer("", meta.skills);
                        router.push("/builder");
                      }}
                      title="Stack all skills + go to builder"
                      className="rounded-[3px] border border-line bg-bg-0 px-[8px] py-[3px] font-mono text-[9px] uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-accent-teal hover:text-accent-teal"
                    >
                      /{id}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    primeComposer("", meta.skills);
                    router.push("/builder");
                  }}
                  className="mt-2 w-full rounded-md border border-dashed border-accent-teal bg-[rgba(45,212,191,0.04)] py-[7px] font-mono text-[9px] uppercase tracking-[0.12em] text-accent-teal transition-colors hover:bg-[rgba(45,212,191,0.1)]"
                >
                  ↗ Stack all · open builder
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-in keyframe */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
