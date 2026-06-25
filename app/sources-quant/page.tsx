import { PageInner, PageHead } from "@/components/ui";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Command {
  label: string;
  code: string;
}
interface UseCase {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  summary: string[];
  structure?: { root: string; branches: string[] }[];
  commands: Command[];
}

// ── Data ──────────────────────────────────────────────────────────────────────
const USE_CASES: UseCase[] = [
  {
    id: "quant",
    num: 1,
    title: "Institutional Quant Research Wiki",
    subtitle: "Closest to ADA AI Labs workflow",
    accent: "text-accent-teal",
    accentBg: "bg-[rgba(20,184,166,0.06)]",
    accentBorder: "border-[rgba(20,184,166,0.2)]",
    summary: [
      "Reads options flow and compiles recurring patterns",
      "Updates dealer positioning pages from live data",
      "Links TSLA gamma behavior to historical episodes",
      'Maintains evolving "market state" summaries',
    ],
    structure: [
      {
        root: "/wiki",
        branches: ["macro", "flows", "dealer-positioning", "gamma", "volatility", "tsla", "spx", "signal-engine"],
      },
      {
        root: "/raw",
        branches: ["options-flow", "earnings", "sec-filings", "twitter", "news"],
      },
    ],
    commands: [
      {
        label: "Build thesis",
        code: `Analyze current TSLA market structure.

Compare:
- current gamma profile
- call wall positioning
- dealer exposure
- IV term structure
- QQQ beta coupling

against:
- Jan 2024 squeeze
- Aug 2025 breakout
- NVDA sympathy periods

Generate:
- probabilistic scenarios
- liquidity map
- acceleration triggers
- invalidation levels`,
      },
      {
        label: "Compile persistent intelligence",
        code: `Ingest today's:
- unusual options flow
- dark pool prints
- Elon tweets
- analyst upgrades
- premarket movement

Update:
- TSLA state machine
- dealer positioning page
- gamma acceleration model
- call wall archive

Highlight contradictions against prior thesis.`,
      },
      {
        label: "Cross-domain synthesis",
        code: `Find recurring relationships between:
- 0DTE call buying
- VIX compression
- QQQ momentum
- TSLA retail flow

Generate:
- causal graph
- confidence scores
- likely next regime transition`,
      },
    ],
  },
  {
    id: "vc",
    num: 2,
    title: "Venture Capital / Startup Intelligence Wiki",
    subtitle: "Popular emerging use case",
    accent: "text-accent-violet",
    accentBg: "bg-[rgba(139,92,246,0.06)]",
    accentBorder: "border-[rgba(139,92,246,0.2)]",
    summary: [
      "Continuously tracks startups, founders, and market shifts",
      "Monitors funding rounds and product launches in real time",
      "Builds competitive landscape maps by category",
      "Cross-references hiring velocity with open-source momentum",
    ],
    commands: [
      {
        label: "AI coding agent landscape analysis",
        code: `Build landscape analysis for AI coding agents.

Compare:
- Cursor
- Windsurf
- Devin
- Claude Code
- OpenAI Codex

Rank by:
- moat durability
- inference economics
- enterprise defensibility
- developer adoption`,
      },
      {
        label: "Identify beneficiaries of emerging infra trends",
        code: `Identify startups likely to benefit from:
- local inference
- memory systems
- AI agents
- knowledge compilation

Cross-reference:
- funding trends
- hiring velocity
- open-source momentum`,
      },
    ],
  },
];

const CORE_IDEAS = [
  {
    icon: "◈",
    title: "Evolving Markdown Wiki",
    desc: "Instead of repeatedly retrieving raw documents (classic RAG), the AI continuously compiles knowledge into an evolving wiki with summaries, backlinks, concept pages, contradictions, and synthesized insights.",
  },
  {
    icon: "◉",
    title: "Institutional Memory Engine",
    desc: "The system accumulates context over time — not just answering questions but building a persistent, structured knowledge base that deepens with every session.",
  },
  {
    icon: "▲",
    title: "Research Operating System",
    desc: "Operates less like a chatbot and more like a quant intelligence terminal or continuously evolving analyst notebook — connected to live data and historical patterns simultaneously.",
  },
  {
    icon: "◆",
    title: "Contradiction Detection",
    desc: "Actively surfaces conflicts between new data and prior theses — an analyst layer that flags when the market or evidence has moved against a standing position.",
  },
];

// ── Components ────────────────────────────────────────────────────────────────

function CommandBlock({ cmd }: { cmd: Command }) {
  return (
    <div className="rounded-[8px] border border-line bg-bg-0 overflow-hidden">
      <div className="flex items-center border-b border-line px-4 py-[7px]">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">{cmd.label}</span>
      </div>
      <pre className="px-4 py-3 font-mono text-[11px] leading-relaxed text-[#cbd5e1] whitespace-pre-wrap">
        <code>{cmd.code}</code>
      </pre>
    </div>
  );
}

function StructureTree({ structure }: { structure: NonNullable<UseCase["structure"]> }) {
  return (
    <div className="mb-5 rounded-[8px] border border-line bg-bg-0 px-4 py-3">
      <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">Wiki structure</div>
      <div className="flex flex-wrap gap-6">
        {structure.map((tree) => (
          <div key={tree.root} className="font-mono text-[11px] leading-relaxed">
            <div className="text-accent-teal font-medium">{tree.root}/</div>
            {tree.branches.map((b) => (
              <div key={b} className="text-ink-3 pl-4">
                <span className="text-ink-3 opacity-50">└─ </span>
                <span className="text-ink-2">{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SourcesQuantPage() {
  return (
    <PageInner>
      <PageHead
        tag="Quant Lab · Reference"
        tone="teal"
        title="Sources for"
        em="Quants Research."
        sub={"Andrej Karpathy's \"LLM Wiki\" framework applied to institutional quant research — 2 high-quality use cases showing how advanced users operate evolving AI knowledge systems as research operating systems."}
      />

      {/* Core Ideas */}
      <section className="mb-10">
        <h2 className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">Core ideas — Karpathy LLM Wiki System</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          {CORE_IDEAS.map((idea) => (
            <div key={idea.title} className="rounded-[10px] border border-line bg-bg-1 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-[14px] text-accent-teal">{idea.icon}</span>
                <span className="font-semibold text-[13px] text-ink-0">{idea.title}</span>
              </div>
              <p className="font-mono text-[11px] text-ink-3 leading-relaxed">{idea.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[10px] border border-[rgba(20,184,166,0.2)] bg-[rgba(20,184,166,0.04)] px-5 py-4">
          <p className="font-mono text-[11px] text-accent-teal leading-relaxed">
            <span className="font-semibold">Key insight:</span>{" "}
            The most effective systems behave less like "chatbots" and more like research operating systems,
            institutional memory engines, quant intelligence terminals, or continuously evolving analyst notebooks.
          </p>
          <a
            href="https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-mono text-[10px] text-accent opacity-70 hover:opacity-100 transition-opacity"
          >
            Original Karpathy gist →
          </a>
        </div>
      </section>

      {/* Use Cases */}
      {USE_CASES.map((uc) => (
        <section key={uc.id} id={uc.id} className="mb-12">
          {/* Section header */}
          <div className={`mb-5 rounded-[10px] border ${uc.accentBorder} ${uc.accentBg} px-5 py-4`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${uc.accent}`}>
                    Use Case {uc.num}
                  </span>
                  {uc.num === 1 && (
                    <span className="rounded-[3px] bg-[rgba(20,184,166,0.12)] px-[6px] py-[2px] font-mono text-[9px] text-accent-teal">
                      closest to ADA workflow
                    </span>
                  )}
                </div>
                <h2 className={`mt-1 font-display text-[18px] font-semibold ${uc.accent}`}>{uc.title}</h2>
              </div>
            </div>

            {/* What the AI does */}
            <ul className="mt-3 space-y-[5px]">
              {uc.summary.map((s) => (
                <li key={s} className="flex items-start gap-2 font-mono text-[11px] text-ink-2">
                  <span className={`mt-[2px] flex-shrink-0 ${uc.accent}`}>·</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Wiki structure (quant only) */}
          {uc.structure && <StructureTree structure={uc.structure} />}

          {/* Commands */}
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
            Example commands
          </div>
          <div className="flex flex-col gap-3">
            {uc.commands.map((cmd) => (
              <CommandBlock key={cmd.label} cmd={cmd} />
            ))}
          </div>
        </section>
      ))}

      <p className="font-mono text-[10px] text-ink-3">
        Source: Andrej Karpathy · "LLM Wiki" system · June 2026
      </p>
    </PageInner>
  );
}
