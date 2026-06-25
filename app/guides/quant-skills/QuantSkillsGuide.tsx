"use client";

const TableOfContents = [
  "Overview",
  "The Quant Skill Taxonomy (25 Skills)",
  "Layer 0 — Data Infrastructure & Embedded KB",
  "Layer 1 — Regime Classification",
  "Layer 2 — Gamma Exposure & Options Flow",
  "Layer 3 — Liquidity & Price Structure",
  "Layer 4 — Options Pricing & Greeks",
  "Layer 5 — Trade Strategy Generation",
  "Layer 6 — Institutional Flow & Portfolio Tools",
  "Layer 7 — Daily Operations",
  "Layer 8 — Governance & Risk Management",
  "Suggested Morning Workflow",
];

const Taxonomy = [
  {
    group: "Embedded KB",
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/5",
    skills: [
      {
        name: "/embedded-quant-sources",
        layer: "Layer 0",
        desc: "Vetted quant KB: 12 TA strategies with entry/exit rules, 100 indicators, complete 35-row IPA pattern table (v3.0) with SVP confluence, and 21-scenario hedge-fund options playbook with Greeks. Auto-selects relevant reference files by prompt context.",
      },
    ],
  },
  {
    group: "Quant",
    color: "text-yellow-400",
    borderColor: "border-yellow-500/30",
    bgColor: "bg-yellow-500/5",
    skills: [
      { name: "/market-data",               layer: "Layer 0", desc: "Polygon, Alpha Vantage, Tradier, Yahoo Finance unified market data layer." },
      { name: "/quant-data-infrastructure", layer: "Layer 0", desc: "Premarket gap analysis (vs ATR), volume conviction scoring, caching TTL guide, async WebSocket pipeline." },
      { name: "/quant-volatility-regimes",  layer: "Layer 1", desc: "HMM-Viterbi regime classifier (Low-Vol → Crisis). Path stability score + sizing guidance." },
      { name: "/vix-regime",                layer: "Layer 1", desc: "VIX term-structure regime classifier with SPX backtest." },
      { name: "/gamma-exposure",            layer: "Layer 2", desc: "Dealer gamma exposure heatmap across the next 5 expiries." },
      { name: "/quant-gamma-exposure",      layer: "Layer 2", desc: "Dealer GEX profile: gamma walls, flow imbalance score, max pain pinning confluence." },
      { name: "/callwall-monitor",          layer: "Layer 2", desc: "Call wall detection across MAG-7 with regime overlays." },
      { name: "/dealer-flow",               layer: "Layer 2", desc: "Unusual options activity and dealer positioning analysis." },
      { name: "/ipa-compendium",            layer: "Layer 3", desc: "35-pattern reference — QM/QML, FVG, BOS, OB, SMC methodology." },
      { name: "/quant-liquidity-detection", layer: "Layer 3", desc: "ICT/SMC liquidity pool map: Equal Highs/Lows, order flow confirmation, IPA pattern cross-reference." },
      { name: "/quant-pricing-greeks",      layer: "Layer 4", desc: "American option Greeks via 200-step binomial CRR: Delta, Gamma, Theta, Vega + Vanna/Charm flip zones." },
      { name: "/quant-tsla-institutional-flow", layer: "Layer 6", desc: "TSLA 4-layer confluence: dark pool activity, VWAP regime, GEX layer, wick analysis. Composite conviction score." },
      { name: "/quant-backtesting",         layer: "Layer 5", desc: "Signal fusion conviction score (5-factor weighted). Walk-forward validation + vectorbt 0DTE skeleton." },
      { name: "/morning-brief",             layer: "Layer 7", desc: "Daily Bloomberg-style briefing with MAG-7 pre-market and ticker setups." },
      { name: "/tsla-putwall",              layer: "Layer 8", desc: "TSLA put wall sentinel with morning briefing hooks." },
    ],
  },
  {
    group: "SPY / SPX",
    color: "text-red-400",
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/5",
    skills: [
      { name: "/spy-market-analysis",        layer: "Layer 1", desc: "SPY/SPX regime + macro overlay (7 proxies) + sector rotation table (8 ETFs) relative to SPY." },
      { name: "/spy-options-flow",           layer: "Layer 2", desc: "SPX options flow: gamma walls, max pain, OPEX pinning multipliers (1.4× monthly, 1.0× weekly)." },
      { name: "/spy-trade-strategy",         layer: "Layer 5", desc: "SPY/SPX trade ideas: bull put / bear call spreads, max pain co-priority, SPX compliance bundled, risk params." },
      { name: "/spy-portfolio-tools",        layer: "Layer 6", desc: "Multi-ticker dashboard with adaptive beta, portfolio stress test (−5/10/20%, VIX spike), sizing context." },
      { name: "/spy-quant-skills-inventory", layer: "Layer 8", desc: "SPX governance layer: 10-item checklist, SPX vs TSLA parameter diff table, cross-playbook workflow." },
    ],
  },
  {
    group: "TSLA",
    color: "text-rose-400",
    borderColor: "border-rose-500/30",
    bgColor: "bg-rose-500/5",
    skills: [
      { name: "/tsla-daily-analysis",         layer: "Layer 7", desc: "TSLA morning snapshot: spot, EMAs, pivot levels, ATM IV, options chain summary, sentiment score, catalyst watch." },
      { name: "/tsla-gamma-walls-scanner",    layer: "Layer 8", desc: "Credit spread compliance gate: validates proposed strikes vs gamma walls (≥1.5× EM buffer). TSLA Playbook v1.0." },
      { name: "/tsla-trade-strategy",         layer: "Layer 5", desc: "TSLA trade ideas with auto gamma wall scanner hook. Bull put / bear call credit spreads + playbook risk params." },
      { name: "/tsla-quant-skills-inventory", layer: "Layer 8", desc: "TSLA governance layer: 10-item pre-trade checklist, non-negotiable risk params, TSLA skill ecosystem map." },
    ],
  },
];

const Layers = [
  {
    id: "layer0",
    label: "Layer 0",
    title: "Data Infrastructure & Embedded Knowledge Base",
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/5",
    tagline: "Always run first. Sets the data and knowledge context for every layer above.",
    skills: [
      {
        name: "/embedded-quant-sources",
        what: "The vetted quant knowledge base. Loads 12 tested TA strategies with explicit entry/exit rules, a library of 100 indicators, the complete 35-row IPA pattern table (v3.0) with SVP confluence levels, and a 21-scenario hedge-fund options playbook covering common situations with full Greeks guidance.",
        when: "Include in every build that involves trade strategy, pattern recognition, or options positioning. It auto-selects the relevant reference files based on your prompt — you don't need to specify which files to load.",
        tip: "Reference it explicitly in your prompt: \"check the IPA compendium for pattern match\" or \"cross-reference the options playbook for this scenario\" to steer which sections it pulls.",
      },
      {
        name: "/market-data",
        what: "Unified market data layer across Polygon, Alpha Vantage, Tradier (options), and Yahoo Finance (spot, fallback). Returns prices, options chains, volume, and OHLCV history in a normalized format.",
        when: "Whenever you need live or recent price data as input to analysis. Most other skills call this implicitly — but invoke it explicitly when you want to specify a custom date range or pull multi-ticker data.",
        tip: "For index data use ^SPX or ^XSP (not SPY or SPX without the caret) to get correct spot pricing.",
      },
      {
        name: "/quant-data-infrastructure",
        what: "Premarket gap analysis measured against the ticker's ATR, volume conviction scoring (how today's volume compares to recent average), a caching TTL guide to avoid stale data, and an async WebSocket pipeline for real-time streaming setups.",
        when: "Morning pre-market work, before any intraday analysis. Establishes whether the open is likely to be gap-and-go, gap-and-fade, or flat — which changes the entire day's strategy.",
        tip: "Pair with /morning-brief to get both the data infrastructure view and the formatted Bloomberg-style briefing in one build.",
      },
    ],
  },
  {
    id: "layer1",
    label: "Layer 1",
    title: "Regime Classification",
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/5",
    tagline: "Classify before you trade. Regime determines strategy selection and position sizing.",
    skills: [
      {
        name: "/quant-volatility-regimes",
        what: "Uses a Hidden Markov Model with Viterbi decoding to classify the current market into one of four regimes: Low-Vol Trend, Moderate-Vol Chop, High-Vol Expansion, or Crisis. Returns a path stability score (how likely the current regime is to persist) and explicit position sizing guidance per regime.",
        when: "Before any options trade. Regime classification is the single most important context for strategy selection: a Low-Vol Trend regime favors premium selling; a Crisis regime demands defined-risk structures only.",
        tip: "The path stability score is underused. A low stability score (< 0.5) means regime transition is likely — size down and prefer shorter-duration trades regardless of the regime label.",
      },
      {
        name: "/vix-regime",
        what: "Classifies the VIX term structure (spot VIX vs VX futures) to identify contango (normal, low fear) vs. backwardation (elevated fear, potential vol spike). Includes an SPX historical backtest for each regime state.",
        when: "Run alongside /quant-volatility-regimes for a two-dimensional regime view. VIX term structure often leads the HMM regime by 1–2 sessions.",
        tip: "Backwardation in VIX term structure during a Low-Vol HMM regime is a warning sign — the vol surface is pricing in fear that the regime classifier hasn't caught yet. Treat as a transition signal.",
      },
      {
        name: "/spy-market-analysis",
        what: "SPY/SPX regime analysis with a macro overlay across 7 market proxies (DXY, TLT, HYG, GLD, IWM, QQQ, VIX) and a sector rotation table for 8 ETFs (XLF, XLE, XLK, XLV, XLI, XLU, XLB, XLC) relative to SPY.",
        when: "Before any index trade or when gauging broad market context for individual names. The sector rotation table shows money flow direction — crucial for understanding whether a stock move is sector-driven or idiosyncratic.",
        tip: "The 7 proxy overlay is most valuable at extremes. When 5+ proxies align directionally, the regime signal is high-conviction. 3–4 aligned is moderate; below 3 is noise.",
      },
    ],
  },
  {
    id: "layer2",
    label: "Layer 2",
    title: "Gamma Exposure & Options Flow",
    color: "text-green-400",
    borderColor: "border-green-500/30",
    bgColor: "bg-green-500/5",
    tagline: "Map the structural forces that constrain price movement before placing a trade.",
    skills: [
      {
        name: "/gamma-exposure",
        what: "Dealer gamma exposure (GEX) heatmap across the next 5 expiries. Shows where dealers are long gamma (acts as a price magnet, suppresses moves) vs. short gamma (amplifies moves). Highlights the zero-gamma line — the price level where dealer hedging flips from stabilizing to destabilizing.",
        when: "Before selecting strikes for a credit spread or vertical. The gamma wall nearest to your short strike is a hard constraint: placing a short strike inside a major wall dramatically reduces the probability of a breach.",
        tip: "The zero-gamma line is more important than max pain for intraday tape reading. Price approaching the zero-gamma line from below (dealers flipping short gamma) often precedes acceleration.",
      },
      {
        name: "/quant-gamma-exposure",
        what: "Full GEX profile with gamma walls quantified by size, flow imbalance score (net call vs. put gamma), and max pain pinning analysis including projected pinning strength. More granular than /gamma-exposure — intended for strike selection rather than regime context.",
        when: "Strike selection for credit spreads. The flow imbalance score tells you whether the current gamma landscape is bullish (call gamma dominates, dealers hedge by buying) or bearish (put gamma dominates, dealers hedge by selling).",
        tip: "Use /gamma-exposure for a quick regime-level view; use /quant-gamma-exposure when you need precise strike validation data.",
      },
      {
        name: "/callwall-monitor",
        what: "Call wall detection across MAG-7 (AAPL, MSFT, NVDA, AMZN, GOOGL, META, TSLA) with vol regime overlays. Identifies call walls — strike levels with unusually large open call interest that act as resistance due to dealer delta hedging.",
        when: "MAG-7 names specifically. Call walls are dynamic resistance levels that can shift after large options rolls — monitor them in real time during OPEX weeks.",
        tip: "A call wall that holds through three consecutive sessions has strong dealer commitment behind it. A call wall that breaks (price closes above) on high volume is a breakout signal.",
      },
      {
        name: "/dealer-flow",
        what: "Unusual options activity scanner: identifies deviations from normal volume/OI ratios, large prints relative to open interest, and asymmetric positioning in calls vs. puts. Classifies prints as likely institutional (block trades, sweep orders) vs. retail.",
        when: "Identifying smart money positioning before earnings, catalysts, or unusual market moves. Dealer flow often leads price by 1–3 sessions.",
        tip: "Unusual put buying on a quiet tape (low VIX, small move) is a higher-signal event than unusual call buying during a rally — fear is harder to fake than greed.",
      },
      {
        name: "/spy-options-flow",
        what: "SPX/SPY-specific options flow: gamma walls at index level, max pain calculation, and OPEX pinning multipliers (1.4× for monthly OPEX, 1.0× for weekly). Shows where the index is likely to pin into expiry.",
        when: "OPEX weeks (especially monthly) for index trading. The 1.4× monthly OPEX multiplier means max pain has significantly stronger gravitational pull than any other week.",
        tip: "Track max pain movement intraday on OPEX Fridays. If max pain migrates up or down rapidly, it signals large hedging flows that will drag price.",
      },
    ],
  },
  {
    id: "layer3",
    label: "Layer 3",
    title: "Liquidity & Price Structure",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-500/5",
    tagline: "Identify where stop runs and order flow turn-arounds are likely to occur.",
    skills: [
      {
        name: "/quant-liquidity-detection",
        what: "ICT/SMC liquidity pool map: locates Equal Highs and Equal Lows (clustered stops), Buy-Side and Sell-Side Liquidity levels, and order flow confirmation signals. Cross-references IPA patterns for confluence.",
        when: "Entry timing and stop placement. Liquidity pools are where institutional orders sit — price frequently sweeps these levels before reversing, creating high-probability entry setups.",
        tip: "The most reliable setups occur when a liquidity sweep (stop run above Equal Highs or below Equal Lows) happens simultaneously with a GEX gamma wall at the same level. Two structural reasons for a reversal compound the probability.",
      },
      {
        name: "/ipa-compendium",
        what: "Complete 35-pattern Institutional Price Action reference: QM (Quasimodo), QML (Quasimodo Left), FVG (Fair Value Gap), BOS (Break of Structure), CHOCH (Change of Character), OB (Order Block), and 29 others. Each pattern includes entry, stop, and target rules, plus SVP (Structure-Volume-Price) confluence scoring.",
        when: "Pattern identification after a liquidity sweep, or when price is approaching a key GEX level and you want to understand what pattern might form at that level.",
        tip: "The SVP confluence score (1–3) is the most actionable output. A score of 3 means all three dimensions — price structure, volume profile, and price action pattern — confirm the setup. Don't take a trade with SVP score below 2.",
      },
    ],
  },
  {
    id: "layer4",
    label: "Layer 4",
    title: "Options Pricing & Greeks",
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/5",
    tagline: "Price your strikes precisely before committing. Know the Greeks, Vanna, and Charm before entry.",
    skills: [
      {
        name: "/quant-pricing-greeks",
        what: "American option Greeks calculated via a 200-step binomial CRR (Cox-Ross-Rubinstein) tree. Returns Delta, Gamma, Theta, Vega, Rho for any strike/expiry, plus second-order Greeks: Vanna (DeltaVega sensitivity — how Delta changes with vol) and Charm (Delta decay — how Delta changes with time). Identifies Vanna and Charm flip zones — price levels where these second-order forces reverse direction.",
        when: "Before finalizing strike selection for any spread. Understand the full risk profile of the position, not just Delta. Vanna and Charm flip zones are where the position's risk profile changes character — plan around them.",
        tip: "Vanna is particularly important for 0DTE and 1DTE trades. A large Vanna means your position's Delta is highly sensitive to vol changes — in a vol spike, you can find yourself with a much larger effective Delta than you expected. Size down for high-Vanna positions.",
      },
    ],
  },
  {
    id: "layer5",
    label: "Layer 5",
    title: "Trade Strategy Generation",
    color: "text-orange-400",
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-500/5",
    tagline: "Generate trade ideas grounded in all the layers above. Strategy without context is speculation.",
    skills: [
      {
        name: "/tsla-trade-strategy",
        what: "TSLA trade ideas: bull put and bear call credit spreads with auto-integrated gamma wall scanner hook. Outputs specific strikes, expiries, premium targets, and risk parameters drawn from the TSLA Playbook v1.0. Automatically validates proposed strikes against current gamma walls.",
        when: "TSLA directional or neutral trades. The auto gamma wall scanner integration means the output already includes compliance validation — no separate step needed for basic compliance.",
        tip: "Always specify whether you're targeting a weekly or monthly expiry in your prompt. The gamma wall landscape changes significantly between them, and the scanner uses different buffer thresholds.",
      },
      {
        name: "/spy-trade-strategy",
        what: "SPY/SPX trade ideas: bull put and bear call credit spreads with max pain co-priority (strikes chosen relative to both gamma walls and max pain simultaneously). SPX compliance rules are bundled — index-specific adjustments applied automatically.",
        when: "Index credit spreads. The max pain co-priority is what differentiates this from just using GEX data — it combines two independent structural forces (gamma walls + max pain) to find strikes that satisfy both constraints.",
        tip: "SPX (cash-settled, European exercise) and SPY (American exercise) have different risk profiles for short spreads even at equivalent notional values. Use SPX for larger size; SPY for finer strike selection and liquidity at low-dollar-width spreads.",
      },
      {
        name: "/quant-backtesting",
        what: "Signal fusion conviction score: a 5-factor weighted score that combines trend (EMA alignment), momentum (RSI/MACD), vol regime, GEX positioning, and liquidity confluence into a single 0–100 conviction number. Also includes a walk-forward validation framework and a vectorbt 0DTE trade skeleton for backtesting intraday strategies.",
        when: "Validating a trade thesis before sizing up. A conviction score above 70 across all 5 factors is the threshold for full-size; 50–70 warrants half-size; below 50 is paper-trade-only territory.",
        tip: "The 5-factor score is most valuable as a tie-breaker when two setups compete for capital. It makes the selection process systematic rather than intuitive.",
      },
    ],
  },
  {
    id: "layer6",
    label: "Layer 6",
    title: "Institutional Flow & Portfolio Tools",
    color: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    bgColor: "bg-indigo-500/5",
    tagline: "Understand what large players are doing, and stress-test your portfolio against adverse scenarios.",
    skills: [
      {
        name: "/quant-tsla-institutional-flow",
        what: "TSLA-specific 4-layer confluence analysis: dark pool activity (off-exchange prints vs. lit exchange ratio), VWAP regime (is price above or below VWAP and how far), GEX layer (current gamma wall map for TSLA), and wick analysis (supply/demand imbalances shown by candle wicks). Outputs a composite conviction score.",
        when: "TSLA catalyst events, earnings run-ups, or any session where TSLA is showing unusual options activity. The dark pool ratio is the most distinctive layer — institutional accumulation or distribution often shows up there before the tape moves.",
        tip: "The composite conviction score is directional but not trade-sized. A high score tells you which way smart money leans; the Layer 4 Greeks and Layer 5 strategy skills determine the actual structure.",
      },
      {
        name: "/spy-portfolio-tools",
        what: "Multi-ticker dashboard with adaptive beta weighting, a portfolio stress test across three decline scenarios (−5%, −10%, −20%) and a VIX spike scenario, plus position sizing context relative to portfolio beta and concentration limits.",
        when: "Portfolio-level risk management, not just single-trade analysis. Before adding a new position, run the stress test to see what the portfolio looks like if the new trade is added into each scenario.",
        tip: "The VIX spike scenario is often the most revealing — many portfolios that look fine under a −10% slow grind get destroyed by a rapid vol expansion. This scenario catches that.",
      },
    ],
  },
  {
    id: "layer7",
    label: "Layer 7",
    title: "Daily Operations",
    color: "text-teal-400",
    borderColor: "border-teal-500/30",
    bgColor: "bg-teal-500/5",
    tagline: "Start every session with structured intelligence, not raw price feeds.",
    skills: [
      {
        name: "/morning-brief",
        what: "Daily Bloomberg-style briefing: MAG-7 pre-market snapshots (price, % change, IV rank, key levels), macro summary (futures, VIX, DXY, bond yields), and a structured setup section for each ticker with entry zone, gamma wall context, and catalyst watch.",
        when: "The first skill to run every trading day, ideally 30–60 minutes before open. Sets the cognitive frame for the session.",
        tip: "The 'catalyst watch' section of the brief is easily overlooked but often the most important. A ticker with a scheduled catalyst (earnings, FDA date, FOMC) warrants a completely different strategy from one trading on pure technicals.",
      },
      {
        name: "/tsla-daily-analysis",
        what: "TSLA-specific morning snapshot: current spot price, EMA stack (8/21/50/200), pivot levels (daily, weekly), ATM implied volatility, options chain summary (most active strikes, put/call ratio), sentiment score, and catalyst watch. More granular than /morning-brief for TSLA specifically.",
        when: "Any session where TSLA is a primary focus. Run after /morning-brief to go deeper on the TSLA setup.",
        tip: "The EMA stack is the quickest regime read for TSLA intraday. Price above all four EMAs in ascending order is a clean trend; any inversion (e.g. price below 8-EMA but above 21-EMA) signals chop or transition.",
      },
    ],
  },
  {
    id: "layer8",
    label: "Layer 8",
    title: "Governance & Risk Management",
    color: "text-red-400",
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/5",
    tagline: "Non-negotiable. Run governance before any live execution. Compliance gates exist for a reason.",
    skills: [
      {
        name: "/tsla-gamma-walls-scanner",
        what: "TSLA credit spread compliance gate. For any proposed spread, validates that the short strike maintains a minimum 1.5× Expected Move (EM) buffer from the nearest gamma wall. If the proposed strikes fail, it outputs compliant alternatives. Based on TSLA Playbook v1.0.",
        when: "Before every TSLA credit spread entry. This is a hard gate — a spread that fails gamma wall compliance should not be entered regardless of how good the setup looks on other dimensions.",
        tip: "Run this after /tsla-trade-strategy (which auto-integrates it) but also independently when you're adjusting strikes from the strategy output. The scanner is fast and free to run — there is no reason to skip it.",
      },
      {
        name: "/tsla-quant-skills-inventory",
        what: "TSLA pre-trade governance: 10-item checklist covering regime, GEX, liquidity, Greeks, sizing, catalyst, account risk, portfolio concentration, entry timing, and exit plan. Also includes the TSLA skill ecosystem map (which skill to use for which question) and non-negotiable risk parameters.",
        when: "End of trade preparation — after all analysis is complete, before execution. The checklist is the final gate.",
        tip: "The non-negotiable risk parameters section is the most important part. Max loss per trade, max daily loss, max portfolio concentration in TSLA — these are hard limits defined in the playbook, not suggestions.",
      },
      {
        name: "/spy-quant-skills-inventory",
        what: "SPX/SPY pre-trade governance: 10-item checklist equivalent to the TSLA version but calibrated for index trading. Includes the SPX vs TSLA parameter diff table (different EM buffers, different sizing rules, different IV rank thresholds) and a cross-playbook workflow for sessions where both TSLA and SPX positions are active.",
        when: "Before any SPX/SPY credit spread entry. The cross-playbook workflow section is particularly useful when both playbooks are active simultaneously — it prevents over-correlation and portfolio-level risk breaches.",
        tip: "The SPX vs TSLA parameter diff table is worth memorizing. The most common mistake is applying TSLA's more aggressive parameters to SPX positions — the diff table makes the contrast explicit.",
      },
      {
        name: "/tsla-putwall",
        what: "TSLA put wall sentinel: monitors the current put wall level (the strike with the largest put open interest), flags when price approaches or breaches it, and integrates with morning briefing hooks to update the alert level each session.",
        when: "Any session where you hold or are considering a short-put or bull-put spread on TSLA. The put wall is a key support level — price often bounces from it but when it breaks, it breaks hard.",
        tip: "The morning briefing hook means /tsla-putwall auto-updates its reference level. Check whether the put wall has migrated since your last session — large OI rolls can shift it by $5–10 overnight.",
      },
    ],
  },
];

const MorningWorkflow = [
  { step: "1", skill: "/morning-brief", label: "Session Brief", desc: "MAG-7 pre-market, macro summary, catalyst watch. Sets the frame for the day." },
  { step: "2", skill: "/quant-data-infrastructure", label: "Gap Analysis", desc: "Premarket gap vs ATR, volume conviction. Is today gap-and-go or fade?" },
  { step: "3", skill: "/quant-volatility-regimes + /vix-regime", label: "Regime", desc: "HMM vol regime + VIX term structure. Determines strategy type and sizing." },
  { step: "4", skill: "/embedded-quant-sources", label: "Load KB", desc: "Load the vetted playbook, IPA table, and indicator library for the session." },
  { step: "5", skill: "/spy-market-analysis", label: "Index Context", desc: "SPX macro overlay and sector rotation — is the tape risk-on or risk-off?" },
  { step: "6", skill: "/gamma-exposure", label: "GEX Map", desc: "Dealer gamma walls for the week. Where is price likely to pin or accelerate?" },
  { step: "7", skill: "/tsla-daily-analysis", label: "TSLA Setup", desc: "TSLA-specific: EMA stack, pivots, ATM IV, put/call ratio, sentiment." },
  { step: "8", skill: "/tsla-putwall", label: "Put Wall Level", desc: "Update the TSLA put wall alert level for the session." },
  { step: "9", skill: "/spy-options-flow or /dealer-flow", label: "Flow Check", desc: "SPX options flow (OPEX weeks) or dealer flow (unusual activity days)." },
  { step: "10", skill: "/tsla-quant-skills-inventory or /spy-quant-skills-inventory", label: "Governance", desc: "Run the pre-trade checklist before any position entry." },
];

export default function QuantSkillsGuide() {
  return (
    <div className="prose prose-invert max-w-none">

      {/* Table of Contents */}
      <div className="mb-8 rounded-[10px] border border-line bg-bg-2 p-6">
        <h2 className="mb-4 text-[20px] font-semibold text-ink-0">Table of Contents</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {TableOfContents.map((item, idx) => (
            <div key={item} className="font-mono text-[12px] text-accent py-1">
              {idx + 1}. {item}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-12">

        {/* 1. OVERVIEW */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">1.</span> Overview
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              ADA AI Labs ships <strong>25 quant skills</strong> across four instrument-specific groups: a shared Embedded Knowledge Base, a core Quant layer, SPY/SPX-specific tools, and TSLA-specific tools. Together they form a complete intelligence stack — from raw market data to regime classification, options analytics, trade strategy generation, and pre-trade governance.
            </p>
            <p>
              This guide organizes those 25 skills into <strong>nine operational layers</strong>. The layers are not a strict execution sequence (you won't use all of them every session), but they reflect the logical dependency order: data before regime, regime before gamma, gamma before strategy, strategy before governance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {[
                { label: "25", sub: "total quant skills", color: "text-yellow-400" },
                { label: "9", sub: "operational layers", color: "text-blue-400" },
                { label: "3", sub: "instrument groups (Core / SPY / TSLA)", color: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-[8px] border border-line bg-bg-1 p-4 text-center">
                  <p className={`text-[32px] font-bold font-mono ${s.color}`}>{s.label}</p>
                  <p className="text-[11px] text-ink-3 font-mono uppercase tracking-wider mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[8px] border border-accent/20 bg-accent/5 p-4">
              <p className="font-mono text-[11px] text-accent uppercase tracking-wider mb-2">How to Use This Guide</p>
              <p className="text-[13px] text-ink-2">
                Section 2 gives the full skill taxonomy at a glance. Sections 3–11 cover each layer in depth with "what it does," "when to use it," and "key tips." Section 12 is a ready-to-use morning workflow that sequences all layers into a single daily routine.
              </p>
            </div>
          </div>
        </section>

        {/* 2. TAXONOMY */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">2.</span> The Quant Skill Taxonomy (25 Skills)
          </h3>
          <div className="space-y-6 text-[14px] leading-relaxed text-ink-1">
            {Taxonomy.map((group) => (
              <div key={group.group}>
                <h4 className={`mb-3 text-[13px] font-semibold font-mono uppercase tracking-wider ${group.color}`}>
                  {group.group} ({group.skills.length} {group.skills.length === 1 ? "skill" : "skills"})
                </h4>
                <div className={`rounded-[8px] border p-4 space-y-2 ${group.borderColor} ${group.bgColor}`}>
                  {group.skills.map((skill) => (
                    <div key={skill.name} className="flex gap-3 items-start">
                      <code className={`shrink-0 font-mono text-[11px] ${group.color} bg-bg-1 px-2 py-0.5 rounded`}>
                        {skill.name}
                      </code>
                      <span className={`shrink-0 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${group.borderColor} ${group.color} opacity-70`}>
                        {skill.layer}
                      </span>
                      <span className="text-[12px] text-ink-2 leading-relaxed">{skill.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LAYERS 0–8 */}
        {Layers.map((layer, idx) => (
          <section key={layer.id} className="rounded-[10px] border border-line bg-bg-2 p-6">
            <h3 className="mb-1 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
              <span className="text-accent">{idx + 3}.</span>
              <span className={`font-mono text-[12px] px-2 py-0.5 rounded border ${layer.borderColor} ${layer.color}`}>{layer.label}</span>
              <span>{layer.title}</span>
            </h3>
            <p className={`mb-5 text-[12px] font-mono ${layer.color} opacity-80`}>{layer.tagline}</p>

            <div className="space-y-6">
              {layer.skills.map((skill) => (
                <div key={skill.name} className={`rounded-[8px] border p-4 ${layer.borderColor} ${layer.bgColor}`}>
                  <code className={`font-mono text-[13px] font-semibold ${layer.color}`}>{skill.name}</code>
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-3">
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-3 w-[40px] pt-0.5">What</span>
                      <p className="text-[13px] text-ink-2">{skill.what}</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-3 w-[40px] pt-0.5">When</span>
                      <p className="text-[13px] text-ink-2">{skill.when}</p>
                    </div>
                    <div className="flex gap-3">
                      <span className={`shrink-0 font-mono text-[10px] uppercase tracking-wider w-[40px] pt-0.5 ${layer.color}`}>Tip</span>
                      <p className="text-[13px] text-ink-1">{skill.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* 12. MORNING WORKFLOW */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">12.</span> Suggested Morning Workflow
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              This 10-step sequence covers an efficient pre-market and open preparation routine. Steps 1–5 establish context; steps 6–9 perform analysis; step 10 is the mandatory governance gate before any execution.
            </p>
            <div className="mt-4 space-y-2">
              {MorningWorkflow.map((item) => (
                <div key={item.step} className="flex gap-3 items-start rounded-[8px] border border-line bg-bg-1 p-3">
                  <span className="shrink-0 font-mono text-[12px] text-accent font-bold w-6">{item.step}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[12px] font-semibold text-ink-0">{item.label}</span>
                      <code className="font-mono text-[10px] text-accent/70 bg-bg-2 px-2 py-0.5 rounded">{item.skill}</code>
                    </div>
                    <p className="text-[12px] text-ink-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[8px] border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="font-mono text-[11px] text-yellow-400 uppercase tracking-wider mb-2">One-Shot Morning Build</p>
              <p className="text-[13px] text-ink-2 mb-3">
                You can run steps 1–4 as a single Prompt Composer build for maximum speed:
              </p>
              <pre className="text-[12px] text-ink-2 whitespace-pre-wrap leading-relaxed">{`Stack: /morning-brief, /quant-data-infrastructure, /quant-volatility-regimes,
       /embedded-quant-sources, /spy-market-analysis

Prompt: "Full pre-market intelligence brief for today's session.
1. Bloomberg morning brief across MAG-7 with catalyst watch.
2. Premarket gap analysis vs ATR for TSLA and SPY — is the open
   likely gap-and-go or fade?
3. Classify current vol regime (HMM + VIX term structure) and state
   the sizing guidance for the regime.
4. Load the IPA pattern compendium and options playbook.
5. SPX macro overlay with sector rotation — is the tape risk-on?

Output a structured briefing I can act on before 9:30 AM."`}</pre>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
