"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/store";
import { createBuild } from "@/lib/actions";
import LiveBuildPanel from "@/components/LiveBuildPanel";

// ─── Domain templates ────────────────────────────────────────────────────────

type Domain = "research" | "quant" | "knowledge" | "dev";
type Depth  = "overview" | "standard" | "deep";

const DOMAIN_SECTIONS: Record<Domain, string[]> = {
  research:  ["Overview", "Historical Context", "Key Frameworks", "Current State", "Critical Analysis", "Further Reading"],
  quant:     ["Overview", "Mathematical Basis", "Empirical Evidence", "Implementation", "Risk Considerations", "Backtesting Notes"],
  knowledge: ["Overview", "Conceptual Framework", "Key Entities", "Relationships & Applications", "Open Questions", "References"],
  dev:       ["Overview", "Architecture", "Implementation Guide", "API Reference", "Examples & Code", "Deployment"],
};

const DOMAIN_LABELS: Record<Domain, string> = {
  research:  "Research",
  quant:     "Quant",
  knowledge: "Knowledge",
  dev:       "Development",
};

const DEPTH_LABELS: Record<Depth, { label: string; note: string }> = {
  overview: { label: "Overview",  note: "~800 words · 4 sections" },
  standard: { label: "Standard",  note: "~2 000 words · 6 sections" },
  deep:     { label: "Deep dive", note: "~4 000 words · 8 sections" },
};

const DOMAIN_COLOR: Record<Domain, string> = {
  research:  "text-accent border-accent bg-[rgba(77,141,255,0.08)]",
  quant:     "text-accent-amber border-accent-amber bg-[rgba(245,183,72,0.08)]",
  knowledge: "text-accent-violet border-accent-violet bg-[rgba(167,139,250,0.08)]",
  dev:       "text-accent-teal border-accent-teal bg-[rgba(45,212,191,0.08)]",
};

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepDots({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      {([1, 2, 3] as const).map((n) => (
        <div key={n} className="flex items-center gap-3">
          <div className={`grid h-7 w-7 place-items-center rounded-full border font-mono text-[11px] transition-colors ${
            n === step
              ? "border-accent bg-[rgba(77,141,255,0.15)] text-accent"
              : n < step
              ? "border-accent-teal bg-[rgba(45,212,191,0.12)] text-accent-teal"
              : "border-line bg-bg-1 text-ink-3"
          }`}>
            {n < step ? "✓" : n}
          </div>
          <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${n === step ? "text-ink-1" : "text-ink-3"}`}>
            {n === 1 ? "Topic" : n === 2 ? "Sources" : "Structure"}
          </span>
          {n < 3 && <span className="h-px w-6 bg-line" />}
        </div>
      ))}
    </div>
  );
}

// ─── Section list row ────────────────────────────────────────────────────────

function SectionRow({
  value, index, total,
  onChange, onRemove, onMove,
}: {
  value: string; index: number; total: number;
  onChange: (v: string) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 flex-shrink-0 text-right font-mono text-[10px] text-ink-3">{index + 1}.</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-md border border-line bg-bg-0 px-3 py-[7px] font-body text-[13px] text-ink-0 outline-none transition-colors focus:border-accent-violet"
      />
      <div className="flex gap-[2px]">
        <button disabled={index === 0}        onClick={() => onMove(-1)} className="grid h-6 w-6 place-items-center rounded font-mono text-[10px] text-ink-3 transition-colors hover:bg-bg-3 hover:text-ink-1 disabled:opacity-30">↑</button>
        <button disabled={index === total - 1} onClick={() => onMove(1)}  className="grid h-6 w-6 place-items-center rounded font-mono text-[10px] text-ink-3 transition-colors hover:bg-bg-3 hover:text-ink-1 disabled:opacity-30">↓</button>
        <button onClick={onRemove} className="grid h-6 w-6 place-items-center rounded font-mono text-[10px] text-ink-3 transition-colors hover:bg-[rgba(255,86,119,0.1)] hover:text-accent-rose">×</button>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface Source { url: string; note: string }

export default function WikiWizard() {
  const router = useRouter();
  const env            = useWorkspace((s) => s.env);
  const setCurrentBuild = useWorkspace((s) => s.setCurrentBuild);
  const currentBuildId  = useWorkspace((s) => s.currentBuildId);
  const showToast      = useWorkspace((s) => s.showToast);

  // ── Step 1: Topic ──
  const [title,   setTitle]   = useState("");
  const [desc,    setDesc]    = useState("");
  const [domain,  setDomain]  = useState<Domain>("research");
  const [depth,   setDepth]   = useState<Depth>("standard");

  // ── Step 2: Sources ──
  const [sources, setSources] = useState<Source[]>([{ url: "", note: "" }]);

  // ── Step 3: Structure ──
  const [sections, setSections] = useState<string[]>(DOMAIN_SECTIONS.research);
  const [sectionsInitedFor, setSectionsInitedFor] = useState<Domain>("research");

  // ── Navigation ──
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [launching, setLaunching] = useState(false);

  // Auto-refresh sections when domain changes (only if user hasn't edited)
  const handleDomainChange = (d: Domain) => {
    setDomain(d);
    if (sections.join() === DOMAIN_SECTIONS[sectionsInitedFor].join()) {
      setSections(DOMAIN_SECTIONS[d]);
      setSectionsInitedFor(d);
    }
  };

  // ── Source helpers ──
  const addSource = () => setSources((s) => [...s, { url: "", note: "" }]);
  const removeSource = (i: number) => setSources((s) => s.filter((_, j) => j !== i));
  const updateSource = (i: number, field: keyof Source, val: string) =>
    setSources((s) => s.map((src, j) => j === i ? { ...src, [field]: val } : src));

  // ── Section helpers ──
  const addSection    = () => setSections((s) => [...s, ""]);
  const removeSection = (i: number) => setSections((s) => s.filter((_, j) => j !== i));
  const updateSection = (i: number, v: string) => setSections((s) => s.map((sec, j) => j === i ? v : sec));
  const moveSection   = (i: number, dir: -1 | 1) => {
    setSections((s) => {
      const next = [...s];
      const j = i + dir;
      if (j < 0 || j >= next.length) return next;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  // ── Generate ──
  const handleGenerate = async () => {
    if (!title.trim() || launching) return;

    const validSources = sources.filter((s) => s.url.trim().length > 0);
    const validSections = sections.filter((s) => s.trim().length > 0);

    const depthNote: Record<Depth, string> = {
      overview: "Be concise — high-level overview, ~800 words total.",
      standard: "Standard depth — ~2,000 words with clear section analysis.",
      deep:     "Deep dive — ~4,000 words, comprehensive, include nuance and edge cases.",
    };

    const prompt = [
      `Create a comprehensive research wiki titled "${title}".`,
      "",
      `## Topic`,
      desc.trim() || title,
      "",
      `## Domain`,
      `${DOMAIN_LABELS[domain]} · ${DEPTH_LABELS[depth].label} depth`,
      "",
      depthNote[depth],
      "",
      ...(validSources.length > 0 ? [
        `## Sources`,
        ...validSources.map((s) => `- ${s.url}${s.note ? ` (${s.note})` : ""}`),
        "",
      ] : []),
      `## Requested Structure`,
      ...validSections.map((s, i) => `${i + 1}. ${s}`),
      "",
      "Generate each section with substance. Use markdown ## headings for each section, include tables and analysis where relevant.",
    ].join("\n");

    setLaunching(true);
    const result = await createBuild(prompt, ["wiki-builder", "deep-research"], env);
    if (result.ok) {
      setCurrentBuild(result.id);
      showToast("Wiki generation started · watch the live panel below");
    } else {
      showToast(`Failed to start: ${result.error}`);
      setLaunching(false);
    }
  };

  // Show only the live panel once generation has started
  if (currentBuildId && launching) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">Generating</div>
            <div className="mt-1 text-[18px] font-medium text-ink-0">{title}</div>
          </div>
          <button
            onClick={() => { setLaunching(false); setCurrentBuild(null); }}
            className="rounded-md border border-line-strong px-3 py-[6px] font-mono text-[10px] uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-accent hover:text-ink-0"
          >
            ← Back to wizard
          </button>
        </div>
        <LiveBuildPanel />
      </div>
    );
  }

  return (
    <div className="max-w-[720px]">
      <StepDots step={step} />

      {/* ── Step 1: Topic ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
              Wiki Title <span className="text-accent-rose">*</span>
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. IPA Pattern Compendium, Self-Improving Agents, TSLA Ticker Intelligence"
              className="w-full rounded-[10px] border border-line bg-bg-1 px-4 py-[11px] font-body text-[15px] text-ink-0 outline-none transition-colors placeholder:italic placeholder:text-ink-3 focus:border-accent-violet"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
              Topic Description
            </label>
            <textarea
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What should this wiki cover? What's the core question or concept it should answer? Any specific angle or constraints?"
              className="w-full resize-none rounded-[10px] border border-line bg-bg-1 px-4 py-[11px] font-body text-[14px] leading-relaxed text-ink-0 outline-none transition-colors placeholder:italic placeholder:text-ink-3 focus:border-accent-violet"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">Domain</label>
            <div className="flex flex-wrap gap-2">
              {(["research", "quant", "knowledge", "dev"] as Domain[]).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDomainChange(d)}
                  className={`rounded-md border px-4 py-[7px] font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
                    domain === d ? DOMAIN_COLOR[d] : "border-line text-ink-2 hover:border-line-strong hover:text-ink-1"
                  }`}
                >
                  {DOMAIN_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">Depth</label>
            <div className="flex flex-wrap gap-2">
              {(["overview", "standard", "deep"] as Depth[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`rounded-md border px-4 py-[7px] transition-colors ${
                    depth === d
                      ? "border-accent bg-[rgba(77,141,255,0.1)] font-mono text-[11px] uppercase tracking-[0.1em] text-accent"
                      : "border-line font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2 hover:border-line-strong hover:text-ink-1"
                  }`}
                >
                  {DEPTH_LABELS[d].label}
                  <span className="ml-2 text-ink-3">{DEPTH_LABELS[d].note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              disabled={!title.trim()}
              className="rounded-full bg-gradient-to-br from-accent-violet to-accent px-6 py-[10px] font-mono text-[11px] uppercase tracking-[0.1em] text-white shadow-[0_4px_20px_rgba(167,139,250,0.3)] transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next · Sources →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Sources ── */}
      {step === 2 && (
        <div className="space-y-5">
          <p className="text-[13px] leading-relaxed text-ink-2">
            Add URLs, paper titles, or notes that the wiki-builder should draw from. Leave empty to let the builder search autonomously.
          </p>

          <div className="space-y-3">
            {sources.map((src, i) => (
              <div key={i} className="rounded-[10px] border border-line bg-bg-1 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">Source {i + 1}</span>
                  {sources.length > 1 && (
                    <button onClick={() => removeSource(i)} className="ml-auto font-mono text-[10px] text-ink-3 transition-colors hover:text-accent-rose">
                      remove
                    </button>
                  )}
                </div>
                <input
                  value={src.url}
                  onChange={(e) => updateSource(i, "url", e.target.value)}
                  placeholder="https://arxiv.org/abs/... or paper title or keyword"
                  className="mb-2 w-full rounded-md border border-line bg-bg-0 px-3 py-[7px] font-body text-[13px] text-ink-0 outline-none transition-colors placeholder:text-ink-3 focus:border-accent"
                />
                <input
                  value={src.note}
                  onChange={(e) => updateSource(i, "note", e.target.value)}
                  placeholder="Optional note: what to extract from this source"
                  className="w-full rounded-md border border-line bg-bg-0 px-3 py-[7px] font-body text-[12px] text-ink-1 outline-none transition-colors placeholder:text-ink-3 focus:border-accent"
                />
              </div>
            ))}
          </div>

          {sources.length < 6 && (
            <button
              onClick={addSource}
              className="flex items-center gap-2 rounded-md border border-dashed border-line px-4 py-[8px] font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2 transition-colors hover:border-line-strong hover:text-ink-1"
            >
              + Add source
            </button>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="rounded-full border border-line px-5 py-[9px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2 transition-colors hover:border-line-strong hover:text-ink-1">
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="rounded-full bg-gradient-to-br from-accent-violet to-accent px-6 py-[10px] font-mono text-[11px] uppercase tracking-[0.1em] text-white shadow-[0_4px_20px_rgba(167,139,250,0.3)] transition-all hover:-translate-y-px"
            >
              Next · Structure →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Structure ── */}
      {step === 3 && (
        <div className="space-y-5">
          <p className="text-[13px] leading-relaxed text-ink-2">
            Review and edit the proposed structure. The builder will generate each section in order.
          </p>

          {/* Summary card */}
          <div className="rounded-[10px] border border-line-strong bg-bg-2 px-4 py-3">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">Wiki brief</div>
            <div className="text-[14px] font-medium text-ink-0">{title}</div>
            <div className="mt-1 flex gap-3 font-mono text-[10px] text-ink-3">
              <span className={`rounded-[3px] px-2 py-px ${DOMAIN_COLOR[domain]}`}>{DOMAIN_LABELS[domain]}</span>
              <span>{DEPTH_LABELS[depth].label}</span>
              <span>{sources.filter((s) => s.url.trim()).length} source{sources.filter((s) => s.url.trim()).length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Section list */}
          <div className="space-y-2">
            {sections.map((sec, i) => (
              <SectionRow
                key={i}
                index={i}
                total={sections.length}
                value={sec}
                onChange={(v) => updateSection(i, v)}
                onRemove={() => removeSection(i)}
                onMove={(dir) => moveSection(i, dir)}
              />
            ))}
          </div>

          {sections.length < 10 && (
            <button
              onClick={addSection}
              className="flex items-center gap-2 rounded-md border border-dashed border-line px-4 py-[8px] font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2 transition-colors hover:border-line-strong hover:text-ink-1"
            >
              + Add section
            </button>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)} className="rounded-full border border-line px-5 py-[9px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2 transition-colors hover:border-line-strong hover:text-ink-1">
              ← Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={launching || sections.filter((s) => s.trim()).length === 0}
              className="flex items-center gap-[8px] rounded-full bg-gradient-to-br from-accent-violet to-accent px-7 py-[10px] font-mono text-[11px] uppercase tracking-[0.1em] text-white shadow-[0_4px_20px_rgba(167,139,250,0.3)] transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            >
              {launching ? (
                <><span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Starting…</>
              ) : (
                <>▸ Generate Wiki</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
