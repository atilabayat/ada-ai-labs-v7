import { PageInner, PageHead } from "@/components/ui";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Command { label: string; code: string; }
interface UseCase {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  maintains: string[];
  commands: Command[];
}

// ── Data ──────────────────────────────────────────────────────────────────────
const USE_CASES: UseCase[] = [
  {
    id: "engineering",
    num: 1,
    title: "Software Engineering Living Architecture Wiki",
    subtitle: "One of the strongest practical uses",
    accent: "text-accent-teal",
    accentBg: "bg-[rgba(20,184,166,0.06)]",
    accentBorder: "border-[rgba(20,184,166,0.2)]",
    maintains: [
      "Architecture docs, APIs, and service dependency maps",
      "Engineering decisions and their historical rationale",
      "Bug patterns, postmortems, and recurring failure modes",
      "Technical debt inventory and scaling bottlenecks",
    ],
    commands: [
      {
        label: "Explain a system",
        code: `Explain the payment processing system.

Include:
- data flow
- service dependencies
- historical incidents
- technical debt
- scaling bottlenecks`,
      },
      {
        label: "Analyze recurring incidents",
        code: `Analyze all incidents related to:
- Redis failures
- queue overload
- database deadlocks

Find:
- recurring root causes
- missing safeguards
- likely future failure points`,
      },
      {
        label: "Update wiki after deployment",
        code: `Update architecture wiki after latest deployment.

Generate:
- changed services
- new API dependencies
- migration risks
- rollback procedures`,
      },
    ],
  },
  {
    id: "research",
    num: 2,
    title: "AI Research Scientist Wiki",
    subtitle: "Closest to Karpathy's own example",
    accent: "text-accent",
    accentBg: "bg-[rgba(77,141,255,0.06)]",
    accentBorder: "border-[rgba(77,141,255,0.2)]",
    maintains: [
      "Stores papers, experiments, architectures, and benchmark results",
      "Tracks scaling laws and model comparisons over time",
      "Surfaces contradictions across conflicting research findings",
      "Synthesizes evolving consensus on open questions",
    ],
    commands: [
      {
        label: "Summarize transformer efficiency landscape",
        code: `Summarize all transformer efficiency techniques.

Compare:
- FlashAttention
- Mamba
- RWKV
- linear attention
- MoE systems

Generate:
- taxonomy
- tradeoff matrix
- compute scaling implications
- likely future directions`,
      },
      {
        label: "Find contradictions in reasoning research",
        code: `Find contradictions across papers discussing:
- reasoning emergence
- chain-of-thought
- test-time compute scaling

Identify:
- unresolved questions
- strongest empirical evidence
- replication weaknesses`,
      },
      {
        label: "Create new wiki page",
        code: `Create a new wiki page:
"Practical Agent Memory Architectures"

Synthesize:
- MemGPT
- LLM Wiki
- RAG
- hierarchical memory
- vector DB limitations

Generate:
- diagrams
- implementation notes
- production recommendations`,
      },
    ],
  },
  {
    id: "geopolitical",
    num: 3,
    title: "Geopolitical / Intelligence Analysis Wiki",
    subtitle: "Where LLM Wikis become extremely powerful",
    accent: "text-accent-rose",
    accentBg: "bg-[rgba(239,68,68,0.06)]",
    accentBorder: "border-[rgba(239,68,68,0.2)]",
    maintains: [
      "Actors, alliances, and evolving relationship networks",
      "Military movements and historical signaling patterns",
      "Sanctions, economic dependencies, and commodity flows",
      "Competing analyst narratives and their contradictions",
    ],
    commands: [
      {
        label: "Escalation probability analysis",
        code: `Analyze escalation probability in Taiwan.

Compare:
- military logistics
- semiconductor dependencies
- naval positioning
- historical signaling patterns

Generate:
- scenario tree
- confidence weighting
- trigger conditions`,
      },
      {
        label: "Track structural regime changes",
        code: `Track evolving relationships between:
- BRICS
- USD reserve status
- commodity flows
- energy corridors

Identify:
- structural regime changes
- contradictions in analyst narratives`,
      },
    ],
  },
  {
    id: "medical",
    num: 4,
    title: "Medical / Scientific Knowledge Wiki",
    subtitle: "Literature synthesis and evolving hypothesis tracking",
    accent: "text-accent-violet",
    accentBg: "bg-[rgba(139,92,246,0.06)]",
    accentBorder: "border-[rgba(139,92,246,0.2)]",
    maintains: [
      "Literature synthesis across clinical and preclinical evidence",
      "Clinical trial aggregation with evidence quality grading",
      "Evolving hypothesis tracking with contradiction flagging",
      "Separation of strong, weak, and speculative mechanisms",
    ],
    commands: [
      {
        label: "Summarize evidence by strength",
        code: `Summarize all evidence regarding:
- GLP-1 agonists
- cardiovascular outcomes
- neuroprotection
- obesity rebound effects

Separate:
- strong evidence
- weak evidence
- speculative mechanisms`,
      },
      {
        label: "Cluster contradictory findings",
        code: `Identify contradictory findings in Alzheimer's research.

Cluster by:
- amyloid hypothesis
- tau pathology
- inflammation
- metabolic dysfunction`,
      },
    ],
  },
  {
    id: "second-brain",
    num: 5,
    title: 'Personal "Second Brain" Executive System',
    subtitle: "The broad consumer form",
    accent: "text-accent-amber",
    accentBg: "bg-[rgba(245,158,11,0.06)]",
    accentBorder: "border-[rgba(245,158,11,0.2)]",
    maintains: [
      "Notes, meetings, and emails in a unified knowledge base",
      "Projects, goals, and long-horizon commitments",
      "Research threads and unresolved decisions",
      "Strategic drift detection across time",
    ],
    commands: [
      {
        label: "90-day note review",
        code: `Review all notes from the last 90 days.

Identify:
- recurring priorities
- unresolved decisions
- abandoned projects
- strategic drift`,
      },
      {
        label: "Generate weekly executive briefing",
        code: `Generate weekly executive briefing.

Include:
- open commitments
- active projects
- risks
- opportunities
- important follow-ups`,
      },
    ],
  },
];

const COMMAND_PATTERN = `[OBJECTIVE]

Analyze / Compare / Synthesize / Track / Forecast / Compile

[DATA SOURCES]

Use:
- wiki pages
- raw documents
- historical archives
- linked concepts

[OUTPUT FORMAT]

Generate:
- thesis
- matrix
- taxonomy
- state machine
- probability tree
- execution plan
- contradictions
- causal graph

[MEMORY OPERATION]

Then:
- update wiki
- revise assumptions
- add backlinks
- flag uncertainty
- preserve conflicting evidence`;

// ── Components ────────────────────────────────────────────────────────────────
function CommandBlock({ cmd }: { cmd: Command }) {
  return (
    <div className="rounded-[8px] border border-line bg-bg-0 overflow-hidden">
      <div className="border-b border-line px-4 py-[7px]">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">{cmd.label}</span>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[11px] leading-relaxed text-[#cbd5e1] whitespace-pre-wrap">
        <code>{cmd.code}</code>
      </pre>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SourcesWikiPage() {
  return (
    <PageInner>
      <PageHead
        tag="Research · Reference"
        tone="violet"
        title="Sources for"
        em="Wiki Architecture."
        sub={"Karpathy's LLM Wiki framework — 5 use cases showing how the system acts as institutional memory, not just retrieval. Includes the universal command pattern and the key insight distinguishing LLM Wiki from RAG."}
      />

      {/* RAG vs LLM Wiki contrast */}
      <section className="mb-10">
        <h2 className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
          The key insight — LLM Wiki vs RAG
        </h2>
        <div className="grid grid-cols-[1fr_1fr] gap-3 max-[600px]:grid-cols-1">
          <div className="rounded-[10px] border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] p-5">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.14em] text-accent-rose">
              Normal RAG — forgets
            </div>
            <pre className="font-mono text-[12px] leading-loose text-ink-2 whitespace-pre-wrap">
              <code>{`Question\n→ retrieve chunks\n→ answer\n→ forget`}</code>
            </pre>
          </div>
          <div className="rounded-[10px] border border-[rgba(20,184,166,0.2)] bg-[rgba(20,184,166,0.04)] p-5">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.14em] text-accent-teal">
              LLM Wiki — compounds
            </div>
            <pre className="font-mono text-[12px] leading-loose text-ink-2 whitespace-pre-wrap">
              <code>{`New information\n→ synthesized into persistent knowledge\n→ connected to prior knowledge\n→ recursively improved over time`}</code>
            </pre>
          </div>
        </div>
        <div className="mt-3 rounded-[10px] border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.04)] px-5 py-4">
          <p className="font-mono text-[11px] text-[#c4b5fd] leading-relaxed">
            Advanced users treat it as a{" "}
            <span className="font-semibold text-accent-violet">compounding intelligence system</span>
            {" "}— not merely retrieval. The wiki deepens with every session rather than answering and forgetting.
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
          <div className={`mb-5 rounded-[10px] border ${uc.accentBorder} ${uc.accentBg} px-5 py-4`}>
            <div className={`font-mono text-[10px] uppercase tracking-[0.14em] ${uc.accent}`}>
              Use Case {uc.num}
            </div>
            <h2 className={`mt-1 font-display text-[18px] font-semibold ${uc.accent}`}>{uc.title}</h2>
            <p className="mt-[3px] font-mono text-[11px] text-ink-3">{uc.subtitle}</p>
            <ul className="mt-3 space-y-[5px]">
              {uc.maintains.map((m) => (
                <li key={m} className="flex items-start gap-2 font-mono text-[11px] text-ink-2">
                  <span className={`mt-[2px] flex-shrink-0 ${uc.accent}`}>·</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">Example commands</div>
          <div className="flex flex-col gap-3">
            {uc.commands.map((cmd) => (
              <CommandBlock key={cmd.label} cmd={cmd} />
            ))}
          </div>
        </section>
      ))}

      {/* Universal command pattern */}
      <section className="mb-10">
        <h2 className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
          The most effective command pattern
        </h2>
        <div className="rounded-[10px] border border-[rgba(77,141,255,0.2)] bg-[rgba(77,141,255,0.04)] p-5">
          <p className="mb-4 font-mono text-[11px] text-ink-3">
            The strongest users structure every prompt with these four blocks — applicable across all five use cases above.
          </p>
          <div className="rounded-[8px] border border-line bg-bg-0 overflow-hidden">
            <div className="border-b border-line px-4 py-[7px]">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">Universal pattern</span>
            </div>
            <pre className="overflow-x-auto px-4 py-3 font-mono text-[11px] leading-relaxed text-[#93c5fd] whitespace-pre-wrap">
              <code>{COMMAND_PATTERN}</code>
            </pre>
          </div>
        </div>
      </section>

      <p className="font-mono text-[10px] text-ink-3">
        Source: Andrej Karpathy · LLM Wiki system · June 2026
      </p>
    </PageInner>
  );
}
