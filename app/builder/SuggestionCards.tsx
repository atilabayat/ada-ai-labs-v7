"use client";

import { useWorkspace } from "@/lib/store";

interface Suggestion {
  c: string;
  ic: string;
  text: string;
  /** Skills to pre-stack in the composer when this suggestion is chosen. */
  skills: string[];
}

const SUGGESTIONS: Suggestion[] = [
  // Quant
  {
    c: "quant", ic: "▲",
    text: "TSLA dealer positioning dashboard with put / call walls",
    skills: ["tsla-putwall", "gamma-exposure", "vix-regime"],
  },
  {
    c: "quant", ic: "∿",
    text: "VIX regime classifier — SPX 3-year backtest",
    skills: ["vix-regime", "market-data", "gamma-exposure"],
  },
  // Dev
  {
    c: "dev", ic: "⊞",
    text: "Morning briefing dashboard — Bloomberg-style",
    skills: ["morning-brief", "dashboard-builder"],
  },
  // Research
  {
    c: "research", ic: "⟢",
    text: "Deep research: self-improving agents (2025 breakthroughs)",
    skills: ["deep-research", "academic-search"],
  },
  {
    c: "research", ic: "⟡",
    text: "Academic review: Peircean semiotics & lattice theory",
    skills: ["deep-research", "literature-review", "wiki-builder"],
  },
  {
    c: "research", ic: "◈",
    text: "Audit a humanities paper for coverage gaps and source quality",
    skills: ["coverage-audit", "evidence-hierarchy"],
  },
  {
    c: "research", ic: "⇄",
    text: "Map scholarly disagreements on a contested philosophical topic",
    skills: ["scholarly-disagreement", "intellectual-genealogy"],
  },
  {
    c: "research", ic: "⊛",
    text: "Compile research into a reusable knowledge base for RAG / wikis",
    skills: ["knowledge-base-compiler", "wiki-builder"],
  },
  // Knowledge Engineering
  {
    c: "wiki", ic: "▤",
    text: "Extract concepts and map relationships from a research document",
    skills: ["concept-extractor", "relationship-mapper", "wiki-builder"],
  },
  {
    c: "wiki", ic: "⊹",
    text: "Build a curriculum from domain knowledge — 5 learning stages",
    skills: ["curriculum-designer", "taxonomy-builder", "multi-resolution-summarizer"],
  },
  {
    c: "wiki", ic: "⋈",
    text: "Synthesize expert perspectives into consensus map with disagreement matrix",
    skills: ["council-synthesizer", "controversy-mapper"],
  },
];

const iconTone: Record<string, string> = {
  quant:    "bg-[rgba(245,183,72,0.1)] text-accent-amber",
  wiki:     "bg-[rgba(255,86,119,0.1)] text-accent-rose",
  dev:      "bg-[rgba(45,212,191,0.1)] text-accent-teal",
  research: "bg-[rgba(77,141,255,0.1)] text-accent",
};

export default function SuggestionCards() {
  const primeComposer = useWorkspace((s) => s.primeComposer);

  return (
    <div className="mb-9 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2">
      {SUGGESTIONS.map((s) => (
        <button
          key={s.text}
          onClick={() => primeComposer(s.text, s.skills)}
          className="group flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-bg-1 px-[14px] py-3 text-left transition-all hover:-translate-y-px hover:border-line-strong hover:bg-bg-2 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
        >
          <div className={`mt-[1px] grid h-7 w-7 flex-shrink-0 place-items-center rounded-md font-mono text-[13px] ${iconTone[s.c]}`}>
            {s.ic}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-[6px] text-[12px] leading-snug text-ink-1 group-hover:text-ink-0">
              {s.text}
            </div>
            <div className="flex flex-wrap gap-[5px]">
              {s.skills.map((id) => (
                <span
                  key={id}
                  className="rounded-[3px] border border-line bg-bg-0 px-[6px] py-px font-mono text-[9px] uppercase tracking-[0.08em] text-ink-3"
                >
                  /{id}
                </span>
              ))}
            </div>
          </div>
          <span className="mt-[3px] flex-shrink-0 font-mono text-[11px] text-ink-3 opacity-0 transition-opacity group-hover:opacity-100">
            ↗
          </span>
        </button>
      ))}
    </div>
  );
}
