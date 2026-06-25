"use client";

const TableOfContents = [
  "What This Guide Covers",
  "The Complete Skill Taxonomy (60 Skills)",
  "Knowledge Engineering Pipeline",
  "Advanced Skill Stacking Architectures",
  "Humanities Research Workflows",
  "Quant Research Workflows",
  "LLM Council & Multi-Model Synthesis",
  "Wiki as Living Knowledge Base",
  "NotebookLM Deep Integration",
  "Multi-Session Research Continuity",
  "Cross-Domain Synthesis Patterns",
  "Advanced Prompt Patterns",
];

const SkillGroups = [
  {
    group: "Research",
    color: "text-blue-400",
    skills: [
      { name: "/web-search", desc: "Real-time web search with source ranking and citation extraction" },
      { name: "/deep-research", desc: "Multi-source research across academic, industry, financial, and government feeds" },
      { name: "/academic-search", desc: "arXiv, SSRN, PubMed, and Google Scholar with abstract extraction" },
      { name: "/literature-review", desc: "Structured literature reviews with citation networks and provenance tracking" },
      { name: "/news-monitor", desc: "Continuous news monitoring with topic clustering and sentiment scoring" },
      { name: "/sec-filings", desc: "10-K, 10-Q, 8-K filing search and section-level extraction" },
    ],
  },
  {
    group: "Knowledge Engineering",
    color: "text-emerald-400",
    skills: [
      { name: "/concept-extractor", desc: "Extract atomic concepts with definitions, importance ratings, and relationships" },
      { name: "/claim-extractor", desc: "Extract claims with evidence, citation, and confidence scores" },
      { name: "/relationship-mapper", desc: "Map directed relationships: influences, supports, contradicts, extends, depends_on" },
      { name: "/taxonomy-builder", desc: "Build hierarchical domain classifications: domain → categories → subcategories → concepts" },
      { name: "/citation-network-builder", desc: "Build stratified citation networks from primary sources through contemporary frontier" },
      { name: "/controversy-mapper", desc: "Structure scholarly disagreements into navigable controversy matrices" },
      { name: "/council-synthesizer", desc: "Synthesize multiple AI/expert perspectives into consensus maps with disagreement matrices" },
      { name: "/multi-resolution-summarizer", desc: "Generate four abstraction levels: Flash (25w) → Executive → Instructional → Scholarly" },
      { name: "/curriculum-designer", desc: "Convert structured domain knowledge into learning pathways (Stage 0–4)" },
      { name: "/knowledge-gap-detector", desc: "Audit knowledge bases for missing concepts, scholars, and traditions" },
    ],
  },
  {
    group: "Humanities Research",
    color: "text-purple-400",
    skills: [
      { name: "/intellectual-genealogy", desc: "Trace lineage of ideas across influences, contemporaries, and successors" },
      { name: "/scholarly-disagreement", desc: "Surface competing interpretations — 3–5 positions with claims, evidence, scholars" },
      { name: "/coverage-audit", desc: "Audit for completeness gaps: missing authors, schools, thematic dimensions" },
      { name: "/evidence-hierarchy", desc: "Classify and score sources across 5 levels: Primary → Peer-Reviewed → Monographs → Reference → Web" },
      { name: "/knowledge-base-compiler", desc: "Transform research into reusable KB: concepts, entities, claims, relationships, JSON/YAML export" },
    ],
  },
  {
    group: "Knowledge",
    color: "text-cyan-400",
    skills: [
      { name: "/wiki-builder", desc: "Karpathy-style research wikis with sources.md and provenance" },
      { name: "/knowledge-graph", desc: "Entity extraction and relationship graph construction" },
      { name: "/llm-council", desc: "Multi-model deliberation via Fireworks AI with Chairman synthesis" },
      { name: "/notebooklm", desc: "NotebookLM browser automation for Studio outputs" },
      { name: "/survey-paper", desc: "Single-file HTML survey papers via Kimi K2.6" },
      { name: "/lesson-generator", desc: "Course-style lesson plans with objectives, flashcards, quizzes" },
      { name: "/flash-brief", desc: "One-page landscape flash briefs with per-ticker setup snapshots" },
    ],
  },
  {
    group: "Development",
    color: "text-orange-400",
    skills: [
      { name: "/dashboard-builder", desc: "Bloomberg-style dashboards with live data binding" },
      { name: "/react-generator", desc: "React component scaffolding with shadcn/ui and Tailwind" },
      { name: "/frontend-design", desc: "Production-grade UI with distinctive aesthetics" },
      { name: "/pdf-builder", desc: "Institutional PDF reports with navy/dark-red format" },
      { name: "/docx-builder", desc: "Word documents with footers, page numbers, table styling" },
      { name: "/xlsx-builder", desc: "Excel workbooks with multi-sheet, formulas, color coding" },
      { name: "/vercel-deploy", desc: "One-click Vercel deployment with serverless API proxy" },
    ],
  },
  {
    group: "Quant",
    color: "text-yellow-400",
    skills: [
      { name: "/gamma-exposure", desc: "Dealer gamma exposure heatmap across next 5 expiries" },
      { name: "/quant-gamma-exposure", desc: "GEX profile: gamma walls, flow imbalance score, max pain pinning confluence" },
      { name: "/quant-volatility-regimes", desc: "HMM-Viterbi regime classifier (Low-Vol → Crisis) with path stability score" },
      { name: "/quant-pricing-greeks", desc: "American option Greeks via 200-step binomial CRR: Δ, Γ, Θ, V + Vanna/Charm flip zones" },
      { name: "/quant-liquidity-detection", desc: "ICT/SMC liquidity pool map: Equal Highs/Lows, order flow confirmation" },
      { name: "/quant-tsla-institutional-flow", desc: "TSLA 4-layer confluence: dark pool activity, VWAP regime, GEX layer, wick analysis" },
      { name: "/quant-backtesting", desc: "Signal fusion conviction score (5-factor weighted), walk-forward validation + vectorbt" },
      { name: "/quant-data-infrastructure", desc: "Premarket gap analysis vs ATR, volume conviction scoring, async WebSocket pipeline" },
      { name: "/market-data", desc: "Polygon, Alpha Vantage, Tradier, Yahoo unified market data layer" },
      { name: "/callwall-monitor", desc: "Call wall detection across MAG-7 with regime overlays" },
      { name: "/dealer-flow", desc: "Unusual options activity and dealer positioning analysis" },
      { name: "/vix-regime", desc: "VIX term-structure regime classifier with SPX backtest" },
      { name: "/ipa-compendium", desc: "35-pattern reference — QM/QML, FVG, BOS, OB, SMC methodology" },
      { name: "/morning-brief", desc: "Daily Bloomberg-style briefing with MAG-7 pre-market and ticker setups" },
      { name: "/flash-brief", desc: "One-page landscape flash briefs with per-ticker setup snapshots" },
      { name: "/embedded-quant-sources", desc: "Vetted quant KB: 12 TA strategies, 100 indicators, complete IPA pattern table v3.0, 21-scenario options playbook" },
    ],
  },
  {
    group: "SPY / SPX",
    color: "text-red-400",
    skills: [
      { name: "/spy-market-analysis", desc: "SPY/SPX regime + macro overlay (7 proxies) + sector rotation table (8 ETFs)" },
      { name: "/spy-options-flow", desc: "SPX options flow: gamma walls, max pain, OPEX pinning multipliers" },
      { name: "/spy-portfolio-tools", desc: "Multi-ticker dashboard with adaptive beta, portfolio stress test, sizing context" },
      { name: "/spy-trade-strategy", desc: "SPY/SPX trade ideas: bull put / bear call spreads, max pain co-priority" },
      { name: "/spy-quant-skills-inventory", desc: "SPX governance layer: 10-item checklist, SPX vs TSLA parameter diff table" },
    ],
  },
  {
    group: "TSLA",
    color: "text-rose-400",
    skills: [
      { name: "/tsla-daily-analysis", desc: "TSLA morning snapshot: spot, EMAs, pivots, ATM IV, options chain, sentiment" },
      { name: "/tsla-gamma-walls-scanner", desc: "Credit spread compliance gate: validates proposed strikes vs gamma walls (≥1.5× EM buffer)" },
      { name: "/tsla-trade-strategy", desc: "TSLA trade ideas with auto gamma wall scanner hook; bull put / bear call spreads" },
      { name: "/tsla-putwall", desc: "TSLA put wall sentinel with morning briefing hooks" },
      { name: "/tsla-quant-skills-inventory", desc: "TSLA governance layer: 10-item pre-trade checklist, non-negotiable risk params" },
    ],
  },
];

const AdvancedStacks = [
  {
    name: "Intellectual History Synthesis",
    domain: "Humanities",
    color: "border-purple-500/30 bg-purple-500/5",
    labelColor: "text-purple-400",
    skills: ["/academic-search", "/intellectual-genealogy", "/scholarly-disagreement", "/evidence-hierarchy", "/coverage-audit"],
    output: "Comprehensive intellectual history with genealogical maps, competing interpretations, and source hierarchy",
    prompt: "Trace the intellectual genealogy of [concept/movement], surface scholarly disagreements, and audit coverage gaps across the major schools.",
  },
  {
    name: "Knowledge Base Construction Pipeline",
    domain: "Knowledge Engineering",
    color: "border-emerald-500/30 bg-emerald-500/5",
    labelColor: "text-emerald-400",
    skills: ["/deep-research", "/concept-extractor", "/claim-extractor", "/relationship-mapper", "/knowledge-base-compiler"],
    output: "Structured, exportable knowledge base with atomic concepts, evidenced claims, and directed relationship graph",
    prompt: "Build a comprehensive knowledge base on [domain]: extract all key concepts and claims, map their relationships, and compile for wiki/RAG export.",
  },
  {
    name: "Domain Taxonomy Construction",
    domain: "Knowledge Engineering",
    color: "border-cyan-500/30 bg-cyan-500/5",
    labelColor: "text-cyan-400",
    skills: ["/taxonomy-builder", "/curriculum-designer", "/knowledge-gap-detector", "/wiki-builder"],
    output: "Hierarchical domain taxonomy with learning pathways and gap audit, published to a structured wiki",
    prompt: "Build a complete taxonomy of [domain], design a learning progression from prerequisites to research frontier, and audit for missing concepts.",
  },
  {
    name: "Quant Intelligence Brief",
    domain: "Quant",
    color: "border-yellow-500/30 bg-yellow-500/5",
    labelColor: "text-yellow-400",
    skills: ["/quant-volatility-regimes", "/gamma-exposure", "/quant-liquidity-detection", "/spy-market-analysis", "/morning-brief"],
    output: "Institutional-grade market brief: regime classification, GEX landscape, liquidity map, sector rotation, formatted briefing",
    prompt: "Full quant intelligence brief for [ticker/market]: classify vol regime, map gamma walls, detect liquidity pools, and overlay macro regime.",
  },
  {
    name: "Options Strategy Validation",
    domain: "Quant",
    color: "border-orange-500/30 bg-orange-500/5",
    labelColor: "text-orange-400",
    skills: ["/tsla-daily-analysis", "/tsla-gamma-walls-scanner", "/quant-pricing-greeks", "/embedded-quant-sources", "/tsla-trade-strategy"],
    output: "Fully validated trade idea: entry/exit levels, gamma wall compliance, Greeks analysis, playbook alignment",
    prompt: "Validate a [bull put / bear call] spread for [date/strike]: run gamma wall compliance, price the Greeks, check the IPA playbook, then generate a trade setup.",
  },
  {
    name: "Citation Network & Controversy Map",
    domain: "Knowledge Engineering",
    color: "border-blue-500/30 bg-blue-500/5",
    labelColor: "text-blue-400",
    skills: ["/citation-network-builder", "/controversy-mapper", "/council-synthesizer", "/survey-paper"],
    output: "Stratified citation network, structured controversy matrix, multi-model synthesis, and published survey paper",
    prompt: "Map the citation network around [topic], structure the scholarly controversies, synthesize via LLM council, and publish as a survey paper.",
  },
];

export default function PromptComposerAdvancedGuide() {
  return (
    <div className="prose prose-invert max-w-none">
      {/* Table of Contents */}
      <div className="mb-8 rounded-[10px] border border-line bg-bg-2 p-6">
        <h2 className="mb-4 text-[20px] font-semibold text-ink-0">Table of Contents</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {TableOfContents.map((item, idx) => (
            <div
              key={item}
              className="font-mono text-[12px] text-accent py-1"
            >
              {idx + 1}. {item}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-12">

        {/* 1. WHAT THIS GUIDE COVERS */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">1.</span> What This Guide Covers
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              This is the advanced complement to the <em>Prompt Composer &amp; Orchestration</em> guide. Where that guide introduces skill stacking and the mechanics of the Prompt Composer interface, this guide assumes fluency with those basics and focuses on:
            </p>
            <ul className="list-disc list-inside space-y-2 text-ink-2 ml-2">
              <li>The complete 60-skill taxonomy and how each group interlocks</li>
              <li>Sophisticated multi-stage stacks for knowledge engineering, humanities research, and quant work</li>
              <li>The <strong>Knowledge Engineering</strong> group — the most powerful and least-used skill set in the system</li>
              <li>LLM Council workflows for multi-model synthesis and adversarial verification</li>
              <li>Wiki architecture: from one-off research to persistent, structured knowledge bases</li>
              <li>Deep NotebookLM integration patterns across a large notebook library</li>
              <li>Strategies for maintaining research continuity across multiple sessions</li>
            </ul>
            <div className="mt-4 rounded-[8px] border border-accent/20 bg-accent/5 p-4">
              <p className="font-mono text-[11px] text-accent uppercase tracking-wider mb-2">Prerequisite</p>
              <p className="text-[13px] text-ink-2">
                Read the <em>Prompt Composer &amp; Orchestration</em> guide first. This guide uses the same UI patterns but does not re-explain them.
              </p>
            </div>
          </div>
        </section>

        {/* 2. COMPLETE SKILL TAXONOMY */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">2.</span> The Complete Skill Taxonomy (60 Skills)
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              ADA AI Labs currently ships <strong>60 skills</strong> across 8 functional groups. Understanding each group's purpose is essential for composing effective multi-stack workflows — skills within a group are designed to chain naturally; skills across groups unlock cross-domain synthesis.
            </p>
            <div className="space-y-6 mt-4">
              {SkillGroups.map((group) => (
                <div key={group.group}>
                  <h4 className={`mb-3 text-[13px] font-semibold font-mono uppercase tracking-wider ${group.color}`}>
                    {group.group} ({group.skills.length} skills)
                  </h4>
                  <div className="space-y-2">
                    {group.skills.map((skill) => (
                      <div key={skill.name} className="flex gap-3 items-start">
                        <code className={`shrink-0 font-mono text-[11px] ${group.color} bg-bg-1 px-2 py-0.5 rounded`}>
                          {skill.name}
                        </code>
                        <span className="text-[12px] text-ink-2 leading-relaxed">{skill.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. KNOWLEDGE ENGINEERING PIPELINE */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">3.</span> Knowledge Engineering Pipeline
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              The <strong>Knowledge Engineering</strong> group is the backbone of structured research synthesis. Its 10 skills form a complete pipeline from raw source text to exportable, machine-readable knowledge structures.
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-[8px] border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider mb-3">Pipeline Stages</p>
                <div className="space-y-3">
                  {[
                    { stage: "Stage 1 — Extract", skills: "/concept-extractor + /claim-extractor", desc: "Pull atomic units from source text: discrete concepts (with definitions and importance scores) and discrete claims (with evidence and confidence scores)." },
                    { stage: "Stage 2 — Map", skills: "/relationship-mapper + /citation-network-builder", desc: "Connect the extracted units: directed semantic relationships between concepts, and a stratified citation graph from primary sources through the contemporary frontier." },
                    { stage: "Stage 3 — Structure", skills: "/taxonomy-builder + /controversy-mapper", desc: "Impose hierarchy: build a domain classification system, then surface where scholars disagree and why." },
                    { stage: "Stage 4 — Synthesize", skills: "/council-synthesizer + /multi-resolution-summarizer", desc: "Generate consensus from competing perspectives and produce summaries at four abstraction levels simultaneously." },
                    { stage: "Stage 5 — Audit & Publish", skills: "/knowledge-gap-detector + /curriculum-designer", desc: "Identify what's missing in the knowledge base, then design a learning progression from prerequisites to research frontier." },
                  ].map((item) => (
                    <div key={item.stage} className="flex gap-3">
                      <div className="shrink-0 w-[160px]">
                        <p className="text-[11px] font-semibold text-emerald-400">{item.stage}</p>
                        <code className="text-[10px] text-emerald-300/70">{item.skills}</code>
                      </div>
                      <p className="text-[12px] text-ink-2">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[8px] border border-line bg-bg-1 p-4">
                <p className="font-mono text-[11px] text-accent uppercase tracking-wider mb-2">Full Pipeline Example Prompt</p>
                <pre className="text-[12px] text-ink-2 whitespace-pre-wrap leading-relaxed">{`Stack: /concept-extractor, /claim-extractor, /relationship-mapper,
       /taxonomy-builder, /controversy-mapper, /knowledge-gap-detector

Prompt: "Build a complete structured knowledge base on the Frankfurt School's
critical theory: extract all major concepts and claims, map their relationships,
build a domain taxonomy, structure the internal controversies (Adorno vs. Habermas
on emancipation), and identify gaps versus the contemporary reception."`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ADVANCED SKILL STACKING ARCHITECTURES */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">4.</span> Advanced Skill Stacking Architectures
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              These are six validated multi-skill stacks for research-intensive use cases. Each is designed so that the output of earlier skills in the stack feeds directly into later ones via Claude's synthesis layer.
            </p>
            <div className="space-y-4 mt-4">
              {AdvancedStacks.map((stack) => (
                <div key={stack.name} className={`rounded-[8px] border p-4 ${stack.color}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={`text-[13px] font-semibold ${stack.labelColor}`}>{stack.name}</p>
                      <p className="font-mono text-[10px] text-ink-3 uppercase tracking-wider mt-0.5">{stack.domain}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[55%]">
                      {stack.skills.map((s) => (
                        <code key={s} className={`font-mono text-[10px] ${stack.labelColor} bg-bg-1 px-1.5 py-0.5 rounded`}>{s}</code>
                      ))}
                    </div>
                  </div>
                  <p className="text-[12px] text-ink-2 mb-2"><strong className="text-ink-1">Output:</strong> {stack.output}</p>
                  <div className="rounded-[6px] bg-bg-1 p-3">
                    <p className="font-mono text-[10px] text-accent uppercase tracking-wider mb-1">Example Prompt</p>
                    <p className="text-[12px] text-ink-2 italic">{stack.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. HUMANITIES RESEARCH WORKFLOWS */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">5.</span> Humanities Research Workflows
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              The Humanities Research group (5 skills) is designed to work in close coordination with the Knowledge Engineering group. Used together, they produce the kind of multi-layered analysis that normally requires weeks of archival and analytical work.
            </p>

            <div className="space-y-4 mt-2">
              <div>
                <h4 className="text-[13px] font-semibold text-purple-400 mb-2">Intellectual History Workflow</h4>
                <p className="text-[13px] text-ink-2">
                  The standard sequence for an intellectual history inquiry. Each step refines the picture established by the previous one.
                </p>
                <div className="mt-3 rounded-[8px] border border-purple-500/20 bg-purple-500/5 p-4 space-y-2">
                  {[
                    ["1", "/intellectual-genealogy", "Map the idea's lineage: who influenced whom, what texts were decisive, what family resemblances exist across movements"],
                    ["2", "/scholarly-disagreement", "Surface where scholars disagree: 3–5 positions with their strongest evidence and named proponents"],
                    ["3", "/evidence-hierarchy", "Classify the sources underlying each position on the 5-level reliability scale"],
                    ["4", "/coverage-audit", "Identify missing authors, schools, or thematic dimensions that reduce the Coverage Score below 80"],
                    ["5", "/knowledge-base-compiler", "Compile the full picture into a structured KB with JSON/YAML export for wiki or RAG pipeline ingestion"],
                  ].map(([n, skill, desc]) => (
                    <div key={n} className="flex gap-3">
                      <span className="shrink-0 text-purple-400 font-mono text-[11px] w-4">{n}.</span>
                      <code className="shrink-0 font-mono text-[11px] text-purple-300 bg-bg-1 px-2 py-0.5 rounded h-fit">{skill}</code>
                      <span className="text-[12px] text-ink-2">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[13px] font-semibold text-purple-400 mb-2">Key Metrics to Track</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { metric: "Coverage Score", source: "/coverage-audit", desc: "0–100. Below 80 means the audit found missing schools, authors, or dimensions. Feed gaps back into /deep-research." },
                    { metric: "Reliability Score", source: "/evidence-hierarchy", desc: "0–100. Weighted by source tier. A low score on a contested claim is a red flag; prioritize those claims for primary source verification." },
                    { metric: "Disagreement Matrix", source: "/scholarly-disagreement", desc: "Positions × Evidence table. High disagreement on a claim means don't synthesize it — present the controversy as-is." },
                  ].map((item) => (
                    <div key={item.metric} className="rounded-[8px] border border-purple-500/20 bg-bg-1 p-3">
                      <p className="text-[12px] font-semibold text-purple-300">{item.metric}</p>
                      <p className="font-mono text-[10px] text-ink-3 mt-0.5">{item.source}</p>
                      <p className="text-[11px] text-ink-2 mt-2">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. QUANT RESEARCH WORKFLOWS */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">6.</span> Quant Research Workflows
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              The Quant group has the highest density of interconnected skills in the system — 16 skills that form a layered intelligence stack, from raw data infrastructure through options analytics to trade strategy generation. The key to using them effectively is understanding which layer each skill occupies.
            </p>

            <div className="rounded-[8px] border border-yellow-500/20 bg-yellow-500/5 p-4 mt-3">
              <p className="font-mono text-[11px] text-yellow-400 uppercase tracking-wider mb-3">The Quant Intelligence Stack</p>
              <div className="space-y-2">
                {[
                  { layer: "Layer 0 — Data Infrastructure", skills: "/market-data, /quant-data-infrastructure, /embedded-quant-sources", desc: "The foundation. Always run first. Sets price context, premarket gaps, async data pipelines, and loads the vetted KB (100 indicators, 35 IPA patterns, 21-scenario playbook)." },
                  { layer: "Layer 1 — Regime Classification", skills: "/quant-volatility-regimes, /vix-regime, /spy-market-analysis", desc: "Classify the current regime before any trade analysis. HMM-Viterbi vol regime + VIX term structure + SPX macro overlay. Regime determines position sizing and strategy selection." },
                  { layer: "Layer 2 — Gamma & Flow Map", skills: "/gamma-exposure, /quant-gamma-exposure, /callwall-monitor, /dealer-flow, /spy-options-flow", desc: "Map the options landscape: gamma walls, dealer positioning, call walls, unusual flow, max pain. This is the structural context that constrains price movement." },
                  { layer: "Layer 3 — Liquidity & Execution", skills: "/quant-liquidity-detection, /quant-tsla-institutional-flow, /quant-pricing-greeks", desc: "Identify liquidity pools and entry precision: Equal Highs/Lows, order flow confirmation, binomial Greeks for the specific strikes under consideration." },
                  { layer: "Layer 4 — Strategy Generation", skills: "/tsla-trade-strategy, /spy-trade-strategy, /quant-backtesting", desc: "Generate and validate trade ideas. Auto-integrates gamma wall scanner for TSLA. Walk-forward validation + vectorbt backtest skeleton." },
                  { layer: "Layer 5 — Governance", skills: "/tsla-quant-skills-inventory, /spy-quant-skills-inventory, /tsla-gamma-walls-scanner", desc: "10-item pre-trade checklists, non-negotiable risk params, credit spread compliance gates. Never skip governance before live execution." },
                ].map((item) => (
                  <div key={item.layer} className="flex gap-3 py-2 border-b border-yellow-500/10 last:border-0">
                    <div className="shrink-0 w-[180px]">
                      <p className="text-[11px] font-semibold text-yellow-400">{item.layer}</p>
                      <p className="font-mono text-[10px] text-yellow-300/60 mt-0.5">{item.skills}</p>
                    </div>
                    <p className="text-[12px] text-ink-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[8px] border border-line bg-bg-1 p-4 mt-3">
              <p className="font-mono text-[11px] text-accent uppercase tracking-wider mb-2">Full Morning Workflow (TSLA)</p>
              <pre className="text-[12px] text-ink-2 whitespace-pre-wrap leading-relaxed">{`Stack: /tsla-daily-analysis, /quant-volatility-regimes, /gamma-exposure,
       /embedded-quant-sources, /tsla-quant-skills-inventory

Prompt: "Full morning intelligence brief for TSLA. Classify the vol regime,
map all gamma walls for the current week, load the IPA pattern compendium for
pattern identification, then run the pre-trade checklist. Conclude with a
summary of the structural setup and whether conditions meet playbook thresholds."`}</pre>
            </div>
          </div>
        </section>

        {/* 7. LLM COUNCIL */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">7.</span> LLM Council &amp; Multi-Model Synthesis
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              <code className="text-cyan-400 bg-bg-1 px-2 py-0.5 rounded text-[12px]">/llm-council</code> runs multi-model deliberation via Fireworks AI (Qwen, DeepSeek, Llama, Mistral, and others) and then synthesizes the results via a Chairman model (Claude). It is the system's primary tool for adversarial verification and perspective diversity.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="rounded-[8px] border border-cyan-500/20 bg-cyan-500/5 p-4">
                <p className="text-[12px] font-semibold text-cyan-400 mb-2">When to Use /llm-council</p>
                <ul className="space-y-1.5 text-[12px] text-ink-2">
                  <li>• High-stakes interpretive claims that need adversarial verification</li>
                  <li>• Contested scholarly questions where model diversity catches blind spots</li>
                  <li>• Synthesizing sources that pull in genuinely different directions</li>
                  <li>• Generating research hypotheses (council provides richer candidate space)</li>
                  <li>• Producing a "Disagreement Matrix" before committing to a position</li>
                </ul>
              </div>
              <div className="rounded-[8px] border border-cyan-500/20 bg-cyan-500/5 p-4">
                <p className="text-[12px] font-semibold text-cyan-400 mb-2">Pairing with /council-synthesizer</p>
                <p className="text-[12px] text-ink-2">
                  For knowledge engineering workflows, pair <code className="text-cyan-300 text-[11px]">/llm-council</code> (which runs live multi-model deliberation) with <code className="text-cyan-300 text-[11px]">/council-synthesizer</code> (which structures the synthesis output as a navigable consensus map with disagreement matrices and confidence scores). Use /llm-council to generate perspectives; /council-synthesizer to formalize the result into a re-usable structured artifact.
                </p>
              </div>
            </div>

            <div className="rounded-[8px] border border-line bg-bg-1 p-4">
              <p className="font-mono text-[11px] text-accent uppercase tracking-wider mb-2">Example: Adversarial Claim Verification</p>
              <pre className="text-[12px] text-ink-2 whitespace-pre-wrap leading-relaxed">{`Stack: /claim-extractor, /llm-council, /council-synthesizer

Prompt: "Extract the central claims from [source/topic]. Then convene the
LLM Council to deliberate on each claim: one model defends it, one attacks it,
one contextualizes it historically. Synthesize the council output into a
consensus map with confidence scores and a disagreement matrix."`}</pre>
            </div>
          </div>
        </section>

        {/* 8. WIKI AS LIVING KNOWLEDGE BASE */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">8.</span> Wiki as Living Knowledge Base
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              ADA AI Labs' wiki system is not a static document store — it is a structured, queryable knowledge base backed by the Prisma database. Each wiki you create via <code className="text-cyan-400 bg-bg-1 px-2 py-0.5 rounded text-[12px]">/wiki-builder</code> persists across sessions and can serve as a source for future research builds.
            </p>

            <div className="space-y-3 mt-2">
              <div className="rounded-[8px] border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider mb-3">Recommended Wiki Architecture</p>
                <div className="space-y-2">
                  {[
                    { type: "Domain Wikis", desc: "One wiki per research domain (e.g. \"Frankfurt School Critical Theory\", \"Options Market Microstructure\"). These are the canonical reference documents — built once, refined over time." },
                    { type: "Session Research Wikis", desc: "Created during active research builds. More exploratory. Use /knowledge-base-compiler to promote the best of these into the relevant Domain Wiki." },
                    { type: "Concept Atlases", desc: "Built with /taxonomy-builder + /wiki-builder. Maps a domain's entire concept space with cross-references. Ideal for onboarding into a new field or preparing a literature review." },
                    { type: "Controversy Archives", desc: "Built with /controversy-mapper + /wiki-builder. Preserves the scholarly disagreement landscape at a point in time — useful for tracking how debates evolve over sessions." },
                  ].map((item) => (
                    <div key={item.type} className="flex gap-3">
                      <span className="shrink-0 text-[12px] font-semibold text-emerald-300 w-[160px]">{item.type}</span>
                      <span className="text-[12px] text-ink-2">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[8px] border border-line bg-bg-1 p-4">
                <p className="font-mono text-[11px] text-accent uppercase tracking-wider mb-2">KB Compiler → Wiki Pipeline</p>
                <pre className="text-[12px] text-ink-2 whitespace-pre-wrap leading-relaxed">{`Stack: /deep-research, /concept-extractor, /relationship-mapper,
       /knowledge-base-compiler, /wiki-builder

Prompt: "Research [domain] comprehensively, extract and map all key concepts
and their relationships, compile into a structured knowledge base with JSON
export, then publish as a Karpathy-style wiki with sources.md and full provenance.
This wiki should function as a living reference document, not a one-time report."`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* 9. NOTEBOOKLM DEEP INTEGRATION */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">9.</span> NotebookLM Deep Integration
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              <code className="text-cyan-400 bg-bg-1 px-2 py-0.5 rounded text-[12px]">/notebooklm</code> provides browser automation for NotebookLM Studio outputs, enabling the ADA system to interface with your notebook library. The key integration pattern is treating NotebookLM notebooks as long-form source corpora that feed back into the research pipeline.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="space-y-3">
                <div className="rounded-[8px] border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="text-[12px] font-semibold text-cyan-400 mb-2">Notebook → Research Pipeline</p>
                  <ol className="space-y-1.5 text-[12px] text-ink-2 list-decimal list-inside">
                    <li>Source material lives in NotebookLM notebooks (PDFs, articles, reports)</li>
                    <li>Use <code className="text-cyan-300 text-[11px]">/notebooklm</code> to generate a Studio deep-dive on the target topic</li>
                    <li>Feed Studio output into <code className="text-cyan-300 text-[11px]">/claim-extractor</code> + <code className="text-cyan-300 text-[11px]">/concept-extractor</code></li>
                    <li>Map extracted structure with <code className="text-cyan-300 text-[11px]">/relationship-mapper</code></li>
                    <li>Publish to wiki with <code className="text-cyan-300 text-[11px]">/wiki-builder</code></li>
                  </ol>
                </div>
                <div className="rounded-[8px] border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="text-[12px] font-semibold text-cyan-400 mb-2">When NotebookLM Outperforms Web Search</p>
                  <ul className="space-y-1.5 text-[12px] text-ink-2">
                    <li>• Your corpus contains documents not indexed by web search (unpublished papers, proprietary reports, field notes)</li>
                    <li>• You need cross-document synthesis across a curated set of sources (not the open web)</li>
                    <li>• You want to ask comparative questions across your own accumulated research</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-[8px] border border-line bg-bg-1 p-4">
                <p className="font-mono text-[11px] text-accent uppercase tracking-wider mb-2">Hybrid Stack: Notebook + Web</p>
                <pre className="text-[12px] text-ink-2 whitespace-pre-wrap leading-relaxed">{`Stack: /notebooklm, /academic-search,
       /literature-review, /knowledge-gap-detector

Prompt: "Open the [notebook name] notebook, run a Studio
deep-dive on [topic]. In parallel, search recent academic
literature for the same topic. Compare the notebook's
coverage against the live literature, then run a gap
audit to identify what new scholarship is not yet in
the notebook."`}</pre>
                <p className="text-[11px] text-ink-3 mt-2">This pattern keeps your NotebookLM library current and identifies exactly what new material to add.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 10. MULTI-SESSION RESEARCH CONTINUITY */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">10.</span> Multi-Session Research Continuity
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              Long-form research projects span many sessions. The ADA system's wiki and knowledge base infrastructure is designed to maintain continuity across them. Here is the recommended architecture for a research program that spans weeks or months.
            </p>
            <div className="space-y-3 mt-2">
              <div className="rounded-[8px] border border-line bg-bg-1 p-4">
                <p className="font-mono text-[11px] text-accent uppercase tracking-wider mb-3">Three-Layer Continuity Structure</p>
                <div className="space-y-4">
                  {[
                    {
                      layer: "Anchor Wiki",
                      desc: "One permanent wiki per research domain. Never deleted. Updated by running /knowledge-base-compiler on new session findings and merging with the existing wiki. This is the single source of truth.",
                      skill: "/wiki-builder + /knowledge-base-compiler",
                    },
                    {
                      layer: "Session Wikis",
                      desc: "Created per research session. Exploratory, lower editorial bar. After each session, review session wikis and promote strong findings to the Anchor Wiki. Delete or archive weak ones.",
                      skill: "/wiki-builder",
                    },
                    {
                      layer: "Gap Register",
                      desc: "A persistent wiki that only contains /knowledge-gap-detector outputs from successive sessions. Tracks what the research program still needs to resolve. Each session should open by reviewing this register.",
                      skill: "/knowledge-gap-detector",
                    },
                  ].map((item) => (
                    <div key={item.layer} className="flex gap-4 items-start">
                      <div className="shrink-0 w-[140px]">
                        <p className="text-[12px] font-semibold text-accent">{item.layer}</p>
                        <code className="text-[10px] text-accent/60">{item.skill}</code>
                      </div>
                      <p className="text-[12px] text-ink-2">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. CROSS-DOMAIN SYNTHESIS */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">11.</span> Cross-Domain Synthesis Patterns
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              Some of the most powerful stacks cross group boundaries — pairing humanities research tools with quant analytics, or knowledge engineering tools with development tools to produce machine-readable and human-readable outputs simultaneously.
            </p>
            <div className="space-y-4 mt-2">
              {[
                {
                  name: "Intellectual History → Quant Narrative",
                  desc: "Trace how a theoretical framework (e.g. efficient market hypothesis, reflexivity theory) developed historically, then use quant skills to test its empirical predictions in current market data.",
                  stack: "/intellectual-genealogy + /scholarly-disagreement + /market-data + /quant-volatility-regimes",
                  color: "border-indigo-500/30 text-indigo-400",
                },
                {
                  name: "KB Compiler → Dashboard",
                  desc: "Build a structured knowledge base on a domain, then render its key data points as a Bloomberg-style dashboard for at-a-glance reference.",
                  stack: "/knowledge-base-compiler + /dashboard-builder",
                  color: "border-orange-500/30 text-orange-400",
                },
                {
                  name: "Survey Paper → Curriculum",
                  desc: "Generate a comprehensive survey paper on a research frontier, then automatically convert it into a staged learning curriculum from prerequisites through advanced topics.",
                  stack: "/survey-paper + /curriculum-designer + /lesson-generator",
                  color: "border-purple-500/30 text-purple-400",
                },
                {
                  name: "Controversy Map → LLM Council Deliberation",
                  desc: "Extract the scholarly controversy structure on a topic, then reconstitute it as an LLM Council deliberation where each model argues one of the identified positions.",
                  stack: "/controversy-mapper + /llm-council + /council-synthesizer",
                  color: "border-cyan-500/30 text-cyan-400",
                },
              ].map((item) => (
                <div key={item.name} className={`rounded-[8px] border p-4 ${item.color.split(" ")[0]} bg-bg-1`}>
                  <p className={`text-[13px] font-semibold ${item.color.split(" ")[1]} mb-1`}>{item.name}</p>
                  <p className="text-[12px] text-ink-2 mb-2">{item.desc}</p>
                  <code className="text-[11px] text-ink-3">{item.stack}</code>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12. ADVANCED PROMPT PATTERNS */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">12.</span> Advanced Prompt Patterns
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              Beyond skill selection, the quality of the orchestrating prompt determines whether the synthesis layer produces shallow aggregation or genuine analytical integration. These patterns consistently produce the strongest outputs.
            </p>
            <div className="space-y-4 mt-2">
              {[
                {
                  name: "Specify the Output Schema",
                  desc: "Tell the synthesis layer exactly what structure you want: \"Output: (1) executive summary, (2) claim table with confidence scores, (3) gap list, (4) recommended next skills.\" Structured output prompts produce outputs you can directly feed into the next session.",
                  tag: "Structure",
                },
                {
                  name: "Give the Skills a Common Question",
                  desc: "Frame your prompt as a single investigative question that every selected skill should try to answer from its own angle. \"From your data source, what does this tell us about [central question]?\" The synthesis layer then integrates answers rather than concatenating reports.",
                  tag: "Integration",
                },
                {
                  name: "Name the Endpoint Artifact",
                  desc: "Specify what you're building: \"The output of this build should be a draft wiki on X\" or \"produce a validated trade setup I can act on.\" When the model knows the terminal artifact, it makes better synthesis decisions along the way.",
                  tag: "Artifact",
                },
                {
                  name: "Instruct on Conflict Resolution",
                  desc: "When skills may return contradictory data, tell the orchestrator how to handle it: \"When sources conflict, present both positions with provenance rather than resolving to one\" or \"prefer the most recent primary source.\" Without this, the model tends to silently pick one source.",
                  tag: "Conflicts",
                },
                {
                  name: "Separate Exploration from Commitment",
                  desc: "In exploratory builds (mapping a new domain), prompt: \"Surface all significant positions without adjudicating between them.\" In synthesis builds (preparing a final artifact), prompt: \"Make a defensible claim supported by the weight of evidence.\" The same stack behaves very differently depending on this framing.",
                  tag: "Posture",
                },
              ].map((item) => (
                <div key={item.name} className="flex gap-4 items-start border-b border-line pb-4 last:border-0 last:pb-0">
                  <span className="shrink-0 font-mono text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded mt-0.5">{item.tag}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink-0 mb-1">{item.name}</p>
                    <p className="text-[13px] text-ink-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[8px] border border-accent/20 bg-accent/5 p-5">
              <p className="font-mono text-[11px] text-accent uppercase tracking-wider mb-3">Putting It Together: A Full Advanced Build</p>
              <pre className="text-[12px] text-ink-2 whitespace-pre-wrap leading-relaxed">{`Stack: /academic-search, /intellectual-genealogy, /concept-extractor,
       /controversy-mapper, /llm-council, /knowledge-gap-detector, /wiki-builder

Prompt: "Investigate the philosophical foundations of complexity theory in
social science, from Prigogine's dissipative structures through Luhmann's
systems theory to contemporary applications in political economy.

For each skill, answer: how does this evidence bear on the question 'Is
complexity theory a genuine theoretical advance or a redescription of
existing structuralist frameworks?'

Surface competing scholarly positions without adjudicating. Where evidence
conflicts, present both with provenance.

Output schema:
(1) Intellectual genealogy diagram (textual)
(2) Core concepts extracted, with definitions and relationships
(3) Controversy matrix: 3-4 positions × strongest evidence
(4) LLM Council synthesis with confidence scores
(5) Coverage gaps with recommended follow-up skills
(6) Published wiki with full sources.md

This wiki should function as a living reference document for ongoing work."`}</pre>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
