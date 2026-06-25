import { Skill } from "../../lib/types";

export const SEED_SKILLS: Skill[] = [
  // Research
  { id: "deep-research", name: "/deep-research", cat: "research", group: "Research", desc: "Multi-source institutional research across academic, industry, financial, and government feeds.", uses: 142, ver: "2.1.0" },
  { id: "web-search", name: "/web-search", cat: "research", group: "Research", desc: "Real-time web search with source ranking and citation extraction.", uses: 894, ver: "1.4.2" },
  { id: "literature-review", name: "/literature-review", cat: "research", group: "Research", desc: "Structured literature reviews with citation networks and provenance tracking.", uses: 38, ver: "1.0.0" },
  { id: "academic-search", name: "/academic-search", cat: "research", group: "Research", desc: "arXiv, SSRN, PubMed, and Google Scholar with abstract extraction.", uses: 67, ver: "1.2.0" },
  { id: "news-monitor", name: "/news-monitor", cat: "research", group: "Research", desc: "Continuous news monitoring with topic clustering and sentiment scoring.", uses: 124, ver: "1.1.0" },
  { id: "sec-filings", name: "/sec-filings", cat: "research", group: "Research", desc: "10-K, 10-Q, 8-K filing search and section-level extraction.", uses: 29, ver: "1.0.0" },

  // Quant
  { id: "tsla-putwall", name: "/tsla-putwall", cat: "quant", group: "Quant", desc: "TSLA put wall sentinel with morning briefing hooks.", uses: 318, ver: "3.0.0" },
  { id: "callwall-monitor", name: "/callwall-monitor", cat: "quant", group: "Quant", desc: "Call wall detection across MAG-7 with regime overlays.", uses: 184, ver: "2.4.0" },
  { id: "gamma-exposure", name: "/gamma-exposure", cat: "quant", group: "Quant", desc: "Dealer gamma exposure heatmap across the next 5 expiries.", uses: 92, ver: "1.8.0" },
  { id: "dealer-flow", name: "/dealer-flow", cat: "quant", group: "Quant", desc: "Unusual options activity and dealer positioning analysis.", uses: 76, ver: "1.3.0" },
  { id: "vix-regime", name: "/vix-regime", cat: "quant", group: "Quant", desc: "VIX term-structure regime classifier with SPX backtest.", uses: 24, ver: "0.9.0" },
  { id: "ipa-compendium", name: "/ipa-compendium", cat: "quant", group: "Quant", desc: "35-pattern reference — QM/QML, FVG, BOS, OB, SMC methodology.", uses: 412, ver: "3.0.0" },
  { id: "embedded-quant-sources", name: "/embedded-quant-sources", cat: "quant", group: "Embedded KB", desc: "Vetted quant KB: 12 TA strategies with entry/exit rules, 100 indicators, complete 35-row IPA pattern table (v3.0) with SVP confluence, and 21-scenario hedge-fund options playbook with Greeks. Auto-selects relevant reference files by prompt context.", uses: 0, ver: "1.1" },
  { id: "market-data", name: "/market-data", cat: "quant", group: "Quant", desc: "Polygon, Alpha Vantage, Tradier, Yahoo unified market data layer.", uses: 287, ver: "2.1.0" },
  { id: "morning-brief", name: "/morning-brief", cat: "quant", group: "Quant", desc: "Daily Bloomberg-style briefing with MAG-7 pre-market and ticker setups.", uses: 156, ver: "4.2.0" },

  // Quant v2 — 16 new skills
  { id: "quant-gamma-exposure",          name: "/quant-gamma-exposure",          cat: "quant", group: "Quant", desc: "Dealer GEX profile: gamma walls, flow imbalance score, max pain pinning confluence.",                                   uses: 0, ver: "1.0.0" },
  { id: "quant-volatility-regimes",      name: "/quant-volatility-regimes",      cat: "quant", group: "Quant", desc: "HMM-Viterbi regime classifier (Low-Vol → Crisis). Path stability score + sizing guidance.",                           uses: 0, ver: "1.0.0" },
  { id: "quant-pricing-greeks",          name: "/quant-pricing-greeks",          cat: "quant", group: "Quant", desc: "American option Greeks via 200-step binomial CRR: Delta, Gamma, Theta, Vega + Vanna/Charm flip zones.",               uses: 0, ver: "1.0.0" },
  { id: "quant-data-infrastructure",     name: "/quant-data-infrastructure",     cat: "quant", group: "Quant", desc: "Premarket gap analysis (vs ATR), volume conviction scoring, caching TTL guide, async WebSocket pipeline.",             uses: 0, ver: "1.0.0" },
  { id: "quant-liquidity-detection",     name: "/quant-liquidity-detection",     cat: "quant", group: "Quant", desc: "ICT/SMC liquidity pool map: Equal Highs/Lows, order flow confirmation, IPA pattern cross-reference.",                 uses: 0, ver: "1.0.0" },
  { id: "quant-backtesting",             name: "/quant-backtesting",             cat: "quant", group: "Quant", desc: "Signal fusion conviction score (5-factor weighted). Walk-forward validation + vectorbt 0DTE skeleton.",               uses: 0, ver: "1.0.0" },
  { id: "quant-tsla-institutional-flow", name: "/quant-tsla-institutional-flow", cat: "quant", group: "Quant", desc: "TSLA 4-layer confluence: dark pool activity, VWAP regime, GEX layer, wick analysis. Composite conviction score.",     uses: 0, ver: "1.0.0" },
  { id: "tsla-daily-analysis",           name: "/tsla-daily-analysis",           cat: "quant", group: "TSLA", desc: "TSLA morning snapshot: spot, EMAs, pivot levels, ATM IV, options chain summary, sentiment score, catalyst watch.",     uses: 0, ver: "1.0.0" },
  { id: "tsla-gamma-walls-scanner",      name: "/tsla-gamma-walls-scanner",      cat: "quant", group: "TSLA", desc: "Credit spread compliance gate: validates proposed strikes vs gamma walls (≥1.5× EM buffer). TSLA Playbook v1.0.",      uses: 0, ver: "1.1.0" },
  { id: "tsla-trade-strategy",           name: "/tsla-trade-strategy",           cat: "quant", group: "TSLA", desc: "TSLA trade ideas with auto gamma wall scanner hook. Bull put / bear call credit spreads + playbook risk params.",       uses: 0, ver: "1.0.0" },
  { id: "tsla-quant-skills-inventory",   name: "/tsla-quant-skills-inventory",   cat: "quant", group: "TSLA", desc: "TSLA governance layer: 10-item pre-trade checklist, non-negotiable risk params, TSLA skill ecosystem map.",            uses: 0, ver: "1.1.0" },
  { id: "spy-market-analysis",           name: "/spy-market-analysis",           cat: "quant", group: "SPY",  desc: "SPY/SPX regime + macro overlay (7 proxies) + sector rotation table (8 ETFs) relative to SPY.",                        uses: 0, ver: "1.0.0" },
  { id: "spy-options-flow",              name: "/spy-options-flow",              cat: "quant", group: "SPY",  desc: "SPX options flow: gamma walls, max pain, OPEX pinning multipliers (1.4× monthly, 1.0× weekly).",                      uses: 0, ver: "1.0.0" },
  { id: "spy-portfolio-tools",           name: "/spy-portfolio-tools",           cat: "quant", group: "SPY",  desc: "Multi-ticker dashboard with adaptive beta, portfolio stress test (−5/10/20%, VIX spike), sizing context.",             uses: 0, ver: "1.0.0" },
  { id: "spy-quant-skills-inventory",    name: "/spy-quant-skills-inventory",    cat: "quant", group: "SPY",  desc: "SPX governance layer: 10-item checklist, SPX vs TSLA parameter diff table, cross-playbook workflow.",                  uses: 0, ver: "1.1.0" },
  { id: "spy-trade-strategy",            name: "/spy-trade-strategy",            cat: "quant", group: "SPY",  desc: "SPY/SPX trade ideas: bull put / bear call spreads, max pain co-priority, SPX compliance bundled, risk params.",        uses: 0, ver: "1.0.0" },

  // Dev
  { id: "frontend-design", name: "/frontend-design", cat: "dev", group: "Development", desc: "Production-grade UI design with distinctive aesthetics.", uses: 412, ver: "2.3.0" },
  { id: "dashboard-builder", name: "/dashboard-builder", cat: "dev", group: "Development", desc: "Bloomberg-style dashboards with live data binding.", uses: 89, ver: "1.5.0" },
  { id: "react-generator", name: "/react-generator", cat: "dev", group: "Development", desc: "React component scaffolding with shadcn/ui and Tailwind.", uses: 167, ver: "2.0.0" },
  { id: "pdf-builder", name: "/pdf-builder", cat: "dev", group: "Development", desc: "Institutional PDF reports with navy/dark-red format.", uses: 234, ver: "2.2.0" },
  { id: "docx-builder", name: "/docx-builder", cat: "dev", group: "Development", desc: "Word documents with footers, page numbers, table styling.", uses: 178, ver: "1.6.0" },
  { id: "xlsx-builder", name: "/xlsx-builder", cat: "dev", group: "Development", desc: "Excel workbooks with multi-sheet, formulas, color coding.", uses: 142, ver: "1.8.0" },
  { id: "vercel-deploy", name: "/vercel-deploy", cat: "dev", group: "Development", desc: "One-click Vercel deployment with serverless API proxy.", uses: 34, ver: "1.0.0" },

  // Knowledge
  { id: "wiki-builder", name: "/wiki-builder", cat: "knowledge", group: "Knowledge", desc: "Karpathy-style research wikis with sources.md and provenance.", uses: 87, ver: "2.0.0" },
  { id: "knowledge-graph", name: "/knowledge-graph", cat: "knowledge", group: "Knowledge", desc: "Entity extraction and relationship graph construction.", uses: 56, ver: "1.4.0" },
  { id: "lesson-generator", name: "/lesson-generator", cat: "knowledge", group: "Knowledge", desc: "Course-style lesson plans with objectives, flashcards, quizzes.", uses: 41, ver: "1.2.0" },
  { id: "flash-brief", name: "/flash-brief", cat: "knowledge", group: "Knowledge", desc: "One-page landscape flash briefs with per-ticker setup snapshots.", uses: 96, ver: "1.7.0" },
  { id: "survey-paper", name: "/survey-paper", cat: "knowledge", group: "Knowledge", desc: "Single-file HTML survey papers via Kimi K2.6.", uses: 18, ver: "1.0.0" },
  { id: "llm-council", name: "/llm-council", cat: "knowledge", group: "Knowledge", desc: "Multi-model deliberation via Fireworks AI with Chairman synthesis.", uses: 23, ver: "1.1.0" },
  { id: "notebooklm", name: "/notebooklm", cat: "knowledge", group: "Knowledge", desc: "NotebookLM browser automation for Studio outputs.", uses: 12, ver: "1.0.0" },

  // Humanities Deep Research v2 — 5 analytical research skills
  { id: "coverage-audit",          name: "/coverage-audit",          cat: "research", group: "Humanities Research", desc: "Audit a humanities report for completeness gaps: missing authors, schools of thought, and thematic dimensions. Returns Coverage Score (0–100) + structured gap report.",              uses: 0, ver: "1.0.0" },
  { id: "scholarly-disagreement",  name: "/scholarly-disagreement",  cat: "research", group: "Humanities Research", desc: "Surface competing scholarly interpretations on any topic. Maps 3–5 positions with claims, evidence, and scholars. Returns Interpretation Map + Disagreement Matrix.",               uses: 0, ver: "1.0.0" },
  { id: "intellectual-genealogy",  name: "/intellectual-genealogy",  cat: "research", group: "Humanities Research", desc: "Trace the lineage of ideas across influences, contemporaries, and successors. Returns genealogical map with textual connections and family resemblances.",                           uses: 0, ver: "1.0.0" },
  { id: "evidence-hierarchy",      name: "/evidence-hierarchy",      cat: "research", group: "Humanities Research", desc: "Classify and score sources across 5 levels: Primary → Peer-Reviewed → Monographs → Reference → Web. Returns Reliability Score (0–100) + weakness report.",                      uses: 0, ver: "1.0.0" },
  { id: "knowledge-base-compiler", name: "/knowledge-base-compiler", cat: "research", group: "Humanities Research", desc: "Transform finished research into a reusable knowledge base: concepts, entities, claims, relationships, and JSON/YAML export for wikis, RAG pipelines, or knowledge graphs.",     uses: 0, ver: "1.0.0" },

  // Knowledge Engineering v2 — 10 humanities research skills
  { id: "concept-extractor",           name: "/concept-extractor",           cat: "knowledge", group: "Knowledge Engineering", desc: "Extract atomic concepts from research documents with definitions, importance ratings, and relationships.",                              uses: 0, ver: "1.0.0" },
  { id: "relationship-mapper",         name: "/relationship-mapper",         cat: "knowledge", group: "Knowledge Engineering", desc: "Map directed relationships between concepts: influences, supports, contradicts, extends, depends_on, analogous_to.",                   uses: 0, ver: "1.0.0" },
  { id: "claim-extractor",             name: "/claim-extractor",             cat: "knowledge", group: "Knowledge Engineering", desc: "Extract claims from scholarly sources with evidence, citation, and confidence scores.",                                                uses: 0, ver: "1.0.0" },
  { id: "controversy-mapper",          name: "/controversy-mapper",          cat: "knowledge", group: "Knowledge Engineering", desc: "Structure scholarly disagreements — positions, scholars, arguments — into a navigable controversy matrix.",                           uses: 0, ver: "1.0.0" },
  { id: "taxonomy-builder",            name: "/taxonomy-builder",            cat: "knowledge", group: "Knowledge Engineering", desc: "Build hierarchical classification systems for knowledge domains: domain → categories → subcategories → concepts.",                    uses: 0, ver: "1.0.0" },
  { id: "knowledge-gap-detector",      name: "/knowledge-gap-detector",      cat: "knowledge", group: "Knowledge Engineering", desc: "Audit knowledge bases for missing concepts, scholars, and traditions with priority gap scores.",                                     uses: 0, ver: "1.0.0" },
  { id: "citation-network-builder",    name: "/citation-network-builder",    cat: "knowledge", group: "Knowledge Engineering", desc: "Build stratified citation networks — primary sources → commentators → schools → contemporary frontier.",                             uses: 0, ver: "1.0.0" },
  { id: "multi-resolution-summarizer", name: "/multi-resolution-summarizer", cat: "knowledge", group: "Knowledge Engineering", desc: "Generate four abstraction levels simultaneously: Flash (25w) → Executive → Instructional → Scholarly from one source.",            uses: 0, ver: "1.0.0" },
  { id: "curriculum-designer",         name: "/curriculum-designer",         cat: "knowledge", group: "Knowledge Engineering", desc: "Convert structured domain knowledge into learning pathways from Stage 0 prerequisites through Stage 4 research frontier.",           uses: 0, ver: "1.0.0" },
  { id: "council-synthesizer",         name: "/council-synthesizer",         cat: "knowledge", group: "Knowledge Engineering", desc: "Synthesize multiple AI/expert perspectives into consensus maps with disagreement matrices and confidence scores.",                    uses: 0, ver: "1.0.0" },
];
