import { WikiDef } from "../../lib/types";
import { SeedWikiCard } from "./wikis";

export const SEED_WIKIS_RECOVERED: Record<string, WikiDef> = {
  "call-wall-put-wall-system-guide": {
    title: "Call Wall / Put Wall",
    titleEm: "System.",
    lede: "A complete walkthrough of the ADA AI Labs gamma exposure dashboard — ticker selection, metric cards, S/R ladder, GEX heatmap, and a step-by-step trading workflow.",
    banner: "system",
    crumb: "Quant Lab / Wikis / Call Wall & Put Wall System",
    pages: 1,
    updated: "Jun 2026",
    version: "1.0.0",
    visibility: "internal",
    toc: [
      { id: "overview",    name: "Overview" },
      { id: "navigation",  name: "Getting to the Dashboard" },
      { id: "tickers",     name: "Ticker Selection" },
      { id: "metrics",     name: "Metric Cards" },
      { id: "sr-ladder",   name: "S/R Ladder" },
      { id: "gex",         name: "GEX Heatmap" },
      { id: "gamma-table", name: "Gamma by Strike" },
      { id: "workflow",    name: "Trading Workflow" },
      { id: "reading",     name: "Reading the Output" },
    ],
    sources: [
      { title: "Polygon.io",  meta: "Options chains & OI data" },
      { title: "ADA AI Labs", meta: "GEX calculations & dashboard logic" },
      { title: "CBOE",        meta: "SPX gamma reference" },
    ],
    related: [
      { name: "Options Flow User Guide",      ic: "BarChart2" },
      { name: "Regime Lab User Guide",        ic: "Activity" },
      { name: "Portfolio User Guide",         ic: "Briefcase" },
    ],
    pageList: [{ id: "main", name: "Call Wall / Put Wall System", current: true }],
    content: `<div class="wiki-banner-hero" data-c="quant"></div>
<div class="wiki-crumb">
  <span>Quant Lab</span><span class="sep">/</span>
  <span>Wikis</span><span class="sep">/</span>
  <span class="ent">Call Wall / Put Wall System</span>
</div>
<h1 class="wiki-h1">Call Wall / Put Wall <em>System.</em></h1>
<div class="wiki-lede">A complete walkthrough of the ADA AI Labs gamma exposure dashboard &mdash; ticker selection, metric cards, S/R ladder, GEX heatmap, and a step-by-step trading workflow.</div>
<div class="wiki-meta-row"><span class="mr"><span class="v">June 2026</span></span><span class="mr"><span class="v">v1.0</span></span><span class="mr"><span class="v">Internal</span></span></div>

<nav class="toc-rail">
  <a class="toc" href="#overview">Overview</a>
  <a class="toc" href="#navigation">Getting to the Dashboard</a>
  <a class="toc" href="#tickers">Ticker Selection</a>
  <a class="toc" href="#metrics">Metric Cards</a>
  <a class="toc" href="#sr-ladder">S/R Ladder</a>
  <a class="toc" href="#gex">GEX Heatmap</a>
  <a class="toc" href="#gamma-table">Gamma by Strike</a>
  <a class="toc" href="#workflow">Trading Workflow</a>
  <a class="toc" href="#reading">Reading the Output</a>
</nav>

<h2 id="overview">Overview</h2>
<p>The Call Wall / Put Wall System visualises where options dealers have concentrated gamma exposure for a given ticker. Dealers who have sold large blocks of calls or puts must delta-hedge continuously &mdash; and that mechanical buying or selling creates price magnets called <strong>gamma walls</strong>. Understanding these walls tells you where price is likely to stall, reverse, or accelerate.</p>
<div class="callout insight">
  <p><strong>Gamma regime:</strong> When net dealer GEX is positive (dealers long gamma), markets tend to mean-revert. When negative (dealers short gamma), small moves can self-reinforce into large directional moves. The dashboard shows your current GEX regime at a glance.</p>
</div>

<h2 id="navigation">Getting to the Dashboard</h2>
<ol>
  <li>Open <strong>Quant Lab</strong> from the sidebar.</li>
  <li>Click the <strong>Put Wall</strong> card in the app grid, or navigate to <a class="ref" href="/quant?view=walls">/quant?view=walls</a>.</li>
  <li>Select a ticker from the dropdown (default: TSLA).</li>
  <li>Click <strong>Refresh</strong> to pull the current options chain.</li>
</ol>

<h2 id="tickers">Ticker Selection</h2>
<p>The dashboard supports five core tickers: <strong>TSLA, NVDA, SPY, QQQ, AAPL</strong>. Each ticker pulls its full options chain from Polygon.io on demand. The call wall and put wall levels update every time you click Refresh.</p>
<div class="callout"><strong>SPY / QQQ note:</strong> SPX/NDX options have much higher notional GEX than single-name equity options. SPY walls tend to be more durable price magnets due to the larger institutional hedging activity.</div>

<h2 id="metrics">Metric Cards</h2>
<p>Four summary cards appear above the visualisations and update on every Refresh.</p>
<table class="wiki-table-wrap"><table class="wiki-table">
  <thead><tr><th>Card</th><th>What it shows</th><th>How to read it</th></tr></thead>
  <tbody>
    <tr><td>Call Wall</td><td>Strike with highest call OI</td><td>Price magnet above spot; dealer resistance zone</td></tr>
    <tr><td>Put Wall</td><td>Strike with highest put OI</td><td>Price magnet below spot; dealer support zone</td></tr>
    <tr><td>Net GEX</td><td>Sum of gamma x OI x spot^2 x 0.01</td><td>Positive = mean-reversion regime; Negative = trending regime</td></tr>
    <tr><td>Zero-Gamma Level</td><td>Strike where net gamma flips sign</td><td>Price above zero-gamma = positive regime; below = negative</td></tr>
  </tbody>
</table></table>

<h2 id="sr-ladder">S/R Ladder</h2>
<p>The S/R ladder is a ranked list of support and resistance levels derived from open interest concentrations. It shows the top three call walls and top three put walls sorted by gamma-weighted OI.</p>

<h2 id="gex">GEX Heatmap</h2>
<p>The GEX heatmap displays dealer gamma exposure (in dollars) across all strikes for the nearest monthly expiry. Red bars indicate negative gamma; teal bars indicate positive gamma.</p>
<ul>
  <li><strong>Tall teal bar</strong> = dealers long gamma here; price gravitates back toward this level.</li>
  <li><strong>Tall red bar</strong> = dealers short gamma here; crossing this level can trigger accelerating moves.</li>
  <li><strong>Zero-gamma crossover</strong> = the strike where net flips; the most important level on the heatmap.</li>
</ul>

<h2 id="gamma-table">Gamma by Strike</h2>
<p>The sortable gamma table shows every strike with columns for: Strike, Call OI, Put OI, Net GEX ($M), and Call/Put ratio. Use it to find strikes with asymmetric positioning.</p>

<h2 id="workflow">Trading Workflow</h2>
<p>A five-step read before entering a directional trade:</p>
<ol>
  <li><strong>Identify the GEX regime.</strong> Positive (mean-reverting) or negative (trending)? Adjust profit target and stop accordingly.</li>
  <li><strong>Locate the call wall and put wall.</strong> These are your nearest target levels and key S/R.</li>
  <li><strong>Find the zero-gamma level.</strong> Is spot above or below it? Crossing zero-gamma is a regime-change event.</li>
  <li><strong>Check the S/R ladder.</strong> Are there OI concentrations within your expected trade range?</li>
  <li><strong>Cross-reference with Options Flow.</strong> Is institutional flow supporting or fading your bias?</li>
</ol>

<h2 id="reading">Reading the Output</h2>
<div class="callout insight"><p><strong>Positive GEX + Price near Put Wall:</strong> Dealers will buy as price falls toward the put wall, creating a mechanical support bid.</p></div>
<div class="callout insight"><p><strong>Negative GEX + Price crossing zero-gamma:</strong> Dealers amplify the move. This is when momentum strategies outperform and mean-reversion fails.</p></div>
<p>When spot is between call wall and put wall in a positive GEX regime, the market is range-bound. When Net GEX flips negative, that range is likely to break.</p>`,
  },

  "deep-research-sessions-guide": {
    title: "Deep Research —",
    titleEm: "Sessions Guide.",
    lede: "How to launch, read, and manage Institutional Research sessions for fresh, de-duplicated results across academic, financial, industry, government, and technical sources.",
    banner: "system",
    crumb: "Research / Wikis / Deep Research Sessions Guide",
    pages: 1,
    updated: "Jun 2026",
    version: "1.0.0",
    visibility: "internal",
    toc: [
      { id: "what-is",   name: "What Deep Research Is" },
      { id: "layout",    name: "Page Layout" },
      { id: "sources",   name: "Source Types" },
      { id: "start",     name: "Starting a New Session" },
      { id: "feed",      name: "Reading the Research Feed" },
      { id: "filtering", name: "Filtering by Source" },
      { id: "managing",  name: "Managing Sessions" },
      { id: "dedup",     name: "How De-duplication Works" },
      { id: "workflow",  name: "Recommended Research Workflow" },
      { id: "tips",      name: "Tips for Better Sessions" },
    ],
    sources: [
      { title: "ADA AI Labs",      meta: "Research pipeline orchestration" },
      { title: "Brave Search",     meta: "Primary web index" },
      { title: "Tavily",           meta: "AI answer synthesis layer" },
      { title: "Exa",              meta: "Neural / semantic search" },
      { title: "Semantic Scholar", meta: "Academic paper index" },
      { title: "CORE Open Access", meta: "Full-text academic papers" },
    ],
    related: [
      { name: "Mathematical Logic",    ic: "Binary" },
      { name: "Self-Improving Agents", ic: "Zap" },
    ],
    pageList: [{ id: "main", name: "Deep Research Sessions Guide", current: true }],
    content: `<div class="wiki-banner-hero" data-c="research"></div>
<div class="wiki-crumb">
  <span>Research</span><span class="sep">/</span>
  <span>Wikis</span><span class="sep">/</span>
  <span class="ent">Deep Research Sessions Guide</span>
</div>
<h1 class="wiki-h1">Deep Research &mdash; <em>Sessions Guide.</em></h1>
<div class="wiki-lede">How to launch, read, and manage Institutional Research sessions for fresh, de-duplicated results across academic, financial, industry, government, and technical sources.</div>
<div class="wiki-meta-row"><span class="mr"><span class="v">June 2026</span></span><span class="mr"><span class="v">v1.0</span></span><span class="mr"><span class="v">Public</span></span></div>

<nav class="toc-rail">
  <a class="toc" href="#what-is">What Deep Research Is</a>
  <a class="toc" href="#layout">Page Layout</a>
  <a class="toc" href="#sources">Source Types</a>
  <a class="toc" href="#start">Starting a New Session</a>
  <a class="toc" href="#feed">Reading the Research Feed</a>
  <a class="toc" href="#filtering">Filtering by Source</a>
  <a class="toc" href="#managing">Managing Sessions</a>
  <a class="toc" href="#dedup">How De-duplication Works</a>
  <a class="toc" href="#workflow">Recommended Research Workflow</a>
  <a class="toc" href="#tips">Tips for Better Sessions</a>
</nav>

<h2 id="workflow">Recommended Research Workflow</h2>
<p>Here is an efficient workflow for building a knowledge base on a new topic:</p>
<ol>
  <li><strong>Start broad.</strong> Create a session with all 5 source categories and a high-level topic (e.g. <em>"large language model reasoning"</em>). This gives you a landscape view across academic, industry, and regulatory perspectives.</li>
  <li><strong>Scan the feed, filter by source.</strong> Click <strong>Academic</strong> to read the papers. Click <strong>Financial</strong> to check analyst reports. Use the <span style="color:#4dd9ac"> new</span> badges to work through only what just arrived.</li>
  <li><strong>Drill deeper.</strong> Start a second, narrower session based on what you found (e.g. <em>"chain-of-thought prompting benchmarks SWE-Bench 2025"</em>). Choose only the categories most relevant  Academic + Technical for this example.</li>
  <li><strong>Cross-reference sources.</strong> When the same concept appears in both an arXiv paper (Academic) <em>and</em> a financial report (Financial), that's a signal the topic has crossed from research into commercial relevance.</li>
  <li><strong>Preserve what matters.</strong> Click any result title to open the original source. For findings you want to keep permanently, use the Prompt Composer with the <code>/deep-research</code> and <code>/wiki-builder</code> skills to synthesise a full research wiki from multiple sessions.</li>
  <li><strong>Clean up the sidebar.</strong> Once you've read a session's results, click <strong>clear done</strong> to keep the sidebar uncluttered. The feed results stay  only the session cards are removed.</li>
</ol>

<h2 id="tips">Tips for Better Sessions</h2>
<ul>
  <li><strong>Use quotes for exact phrases.</strong> The topic text is passed directly to each search backend. Quoting terms like <em>"zero-day vulnerability"</em> or <em>"Fed funds rate"</em> improves precision on all backends.</li>
  <li><strong>Add a year for recent results.</strong> Appending <em>2024</em> or <em>2025</em> to your topic biases results toward recent publications  especially useful on arXiv and Tavily where older content otherwise surfaces.</li>
  <li><strong>Academic-only for foundational research.</strong> When you want theory and methodology over news, deselect all categories except Academic. You'll get up to 5 arXiv papers ranked by relevance with full abstracts.</li>
  <li><strong>Financial + Industry for market intelligence.</strong> This combination pulls both analyst commentary (Tavily finance) and official filings (SEC EDGAR)  the best pair for competitive research on public companies.</li>
  <li><strong>Government for regulatory research.</strong> For topics involving FDA approvals, EPA rulings, NIH grants, or NIST standards, select only Government to avoid being flooded by news coverage of the same event.</li>
  <li><strong>Retry errors immediately.</strong> If a session shows  error, start a new session with the same topic. Most errors are transient API timeouts  a retry succeeds on the first attempt the vast majority of the time.</li>
  <li><strong>Sessions reset on page refresh.</strong> The Research Feed is in-memory. If you plan a long research session, keep the tab open. Use the wiki builder to persist your findings before closing.</li>
</ul>
Master the Deep Research Engine  sessions, source filters, de-duplication, and a step-by-step workflow for building institutional knowledge.5 source typesLive parallel fetchDe-duplicateds. When all sources finish, the session card updates to <span style="color:#4dd9ac"> done</span> and shows the total source count.</li>
</ol>

<h2 id="reading-feed">Reading the Research Feed</h2>
<p>Each result card in the feed contains:</p>
<ul>
  <li><strong>Title</strong>  clickable link opens the original source in a new tab</li>
  <li><strong>Badge</strong>  identifies the exact source (e.g. <code>arXiv 2506.04287</code>, <code>reuters.com</code>, <code>SEC 10-K</code>)</li>
  <li><strong>Date</strong>  publication or retrieval date formatted as Month YYYY</li>
  <li><strong>Organisation</strong>  author(s), institution, or domain name</li>
  <li><span style="color:#4dd9ac"><strong> new</strong></span>  appears only on results added by the <em>current browser session</em>. Results present before you started are not tagged. Use this to instantly find what each session discovered.</li>
  <li><strong>Excerpt</strong>  up to 300 characters of abstract, summary, or page content</li>
</ul>
<p>The feed is always sorted newest-session-first within the page. Seed examples from previous research are shown at the bottom, below your live results.</p>

<h2 id="filtering">Filtering by Source</h2>
<p>Click any source button in the left sidebar to filter the feed to that category only. The button highlights in blue and a pill appears in the feed header showing the active filter.</p>
<ul>
  <li>Click multiple source buttons to combine filters (e.g. Academic + Financial).</li>
  <li>Click a pill in the feed header to remove that filter.</li>
  <li>Click <strong>clear filter</strong> (below the source buttons) to show all results.</li>
</ul>
<p>Filtering is instant and non-destructive  no results are deleted, you are just changing your view.</p>

<h2 id="session-management">Managing Sessions</h2>
<p>The Sessions panel (below the source buttons in the sidebar) tracks every session started this browser session:</p>
<ul>
  <li><span style="color:#f5b748"><strong>Amber border + "running"</strong></span>  session is actively fetching. The progress bar pulses while sources are queried.</li>
  <li><span style="color:#4dd9ac"><strong> done</strong></span>  session completed. The source count shows how many new items were found.</li>
  <li><span style="color:#ff6b7a"><strong> error</strong></span>  session failed (usually a network or API error). Start a new session with the same topic to retry.</li>
  <li><strong> button</strong>  dismisses a completed or errored session from the sidebar. Your feed results are kept.</li>
  <li><strong>clear done</strong> link (top-right of Sessions heading)  dismisses all completed and errored sessions at once.</li>
</ul>
<p><strong>Important:</strong> Sessions are in-memory only. If you navigate away from the page or refresh, the session list resets. Your feed results from the seed data will still be there, but live results from this browser session will be gone. Use <strong>Save as Wiki</strong> or the Prompt Composer to preserve important research permanently.</p>

<h2 id="deduplication">How De-duplication Works</h2>
<p>Every result has a canonical ID constructed from its source type and URL or paper ID:</p>
<ul>
  <li>Academic papers: <code>arxiv-{paper-id}</code> (e.g. <code>arxiv-2506.04287</code>)</li>
  <li>Industry/Financial/Government/Technical: <code>{category}-{url-hash}</code></li>
</ul>
<p>Before adding any result to the feed, the engine checks whether that ID already exists. If it does, the result is silently dropped. This means:</p>
<ul>
  <li>Running two sessions on the <em>same topic</em> back-to-back will not double-up the same papers  the second session finds them already present and skips them.</li>
  <li>Running sessions on <em>related but different topics</em> (e.g. "agentic AI" then "AI agent benchmarks") may return some overlapping papers. De-duplication will catch exact matches but not thematically similar papers with different IDs.</li>
</ul>
<p>Additionally, the system blocks you from creating a second session on <em>identic="sep">/</span>
  <span class="ent">Deep Research  Sessions Guide</span>
</div>
<h1 class="wiki-h1">Deep Research <em>Sessions.</em></h1>
<div class="wiki-lede">How to launch, read, and manage Institutional Research sessions  and get consistently fresh, de-duplicated results across academic, financial, industry, government, and technical sources.</div>

<h2 id="overview">What Deep Research Is</h2>
<p>The <strong>Deep Research Engine</strong> (at <code>/research</code>) is ADA AI Labs' multi-source research aggregator. A single session fans out in parallel across up to five institutional source types  pulling live arXiv preprints, Tavily web intelligence, SEC filings, government publications, and technical documentation  then streams them into a unified Research Feed.</p>
<p>Every result is de-duplicated by canonical ID so the same paper or article never appears twice, even across multiple sessions on related topics. Results are tagged <span style="color:#4dd9ac"><strong> new</strong></span> when they arrive so you can instantly spot fresh discoveries.</p>

<h2 id="layout">Page Layout</h2>
<p>The page is split into two columns:</p>
<table class="wiki-table">
  <tr><th>Column</th><th>What it contains</th></tr>
  <tr><td><strong>Left sidebar</strong></td><td>Source filter buttons (Academic, Industry, Financial, Government, Technical) + the Sessions panel below them</td></tr>
  <tr><td><strong>Right panel</strong></td><td>The Research Feed  all results, newest first, with active filter pills at the top and the <strong>+ New Session</strong> button</td></tr>
</table>

<h2 id="source-types">Source Types</h2>
<p>Five source categories are available. Each maps to a specific live data backend:</p>
<table class="wiki-table">
  <tr><th>Badge</th><th>Name</th><th>What it searches</th></tr>
  <tr><td><span style="color:#a78bfa"><strong>A</strong></span></td><td>Academic</td><td>arXiv preprint server  peer-reviewed and pre-print papers, returns up to 5 results per session ranked by relevance</td></tr>
  <tr><td><span style="color:#f5b748"><strong>I</strong></span></td><td>Industry</td><td>Tavily deep web search scoped to industry analysis, market trends, and company reports  up to 4 results</td></tr>
  <tr><td><span style="color:#4dd9ac"><strong>F</strong></span></td><td>Financial</td><td>Tavily finance-topic search plus SEC EDGAR filings (10-K, 10-Q, 8-K)  up to 5 combined results</td></tr>
  <tr><td><span style="color:#4d8dff"><strong>G</strong></span></td><td>Government</td><td>Tavily search scoped to .gov, FDA, NIH, EPA, and regulatory agency publications  up to 3 results</td></tr>
  <tr><td><span style="color:#ff7a3d"><strong>T</strong></span></td><td>Technical</td><td>Tavily technical documentation search (GitHub, Stack Overflow, official docs)  up to 4 results</td></tr>
</table>
<p>You can select any combination when creating a session. All selected categories run <em>in parallel</em>, so a 5-category session takes roughly the same time as a 1-category session.</p>

<h2 id="starting-session">Starting a New Session</h2>
<ol>
  <li>Click the <strong>+ New Session</strong> button (top-right of the Research Feed header).</li>
  <li>The <strong>New Research Session</strong> modal opens. Type your research topic in the text field  be specific. Examples:
    <ul>
      <li><em>"Self-improving AI agents curriculum generation"</em>  precise, returns focused arXiv papers</li>
      <li><em>"VIX term structure regime classification 2024"</em>  scoped to financial analysis and SSRN</li>
      <li><em>"CRISPR base editing therapeutics FDA approval"</em>  cross-sources: Academic + Government + Financial</li>
    </ul>
  </li>
  <li>Select the source categories you want. All five are checked by default  uncheck any you don't need to speed up the query or focus the results.</li>
  <li>Press <strong>Start Research</strong> (or hit Enter). The modal closes and a session card appears in the sidebar with an amber "running" indicator.</li>
  <li>Results stream into the feed as each source complete> Steep</span>
    <span class="badge b-elevated"> Flat</span>
    <span class="badge b-stress"> Inverted</span>
  </div>
  <p>Status is derived from the <strong>10y  3m slope</strong> (in basis points):</p>
  <table class="ref">
    <tr><th>Status</th><th>10y  3m Slope</th><th>Macro signal</th></tr>
    <tr><td>Steep</td><td>Positive / widening</td><td>Growth expectations rising; risk-on backdrop typically supportive</td></tr>
    <tr><td>Flat</td><td>Near zero</td><td>Uncertainty; often precedes inversion or inflection</td></tr>
    <tr><td>Inverted</td><td>Negative (3m &gt; 10y)</td><td>Historically precedes recession; tightening financial conditions</td></tr>
  </table>

  <h3 class="panel-title">Yield Tenors Tracked</h3>
  <div class="sym-row">
    <span class="sym">^IRX  3-Month</span>
    <span class="sym">^FVX  5-Year</span>
    <span class="sym">^TNX  10-Year</span>
    <span class="sym">^TYX  30-Year</span>
    <span class="sym">DX-Y.NYB  DXY</span>
  </div>

  <div class="callout"><strong>Why DXY matters:</strong> A strengthening dollar (DXY rising) typically tightens global liquidity and weighs on risk assets, commodities, and EM equities. Cross-reference with Panel  for confirmation.</div>


  <!--  PANEL 6  -->
  `,
  },

  "portfolio-user-guide": {
    title: "Portfolio —",
    titleEm: "User Guide.",
    lede: "A complete walkthrough of the Portfolio workbench — exposure summary, portfolio Greeks, sector concentration, parametric VaR/ES, scenario & stress testing, and the positions blotter.",
    banner: "system",
    crumb: "Market Floor / Wikis / Portfolio",
    pages: 14,
    updated: "Jun 2026",
    version: "1.0.0",
    visibility: "internal",
    toc: [
      { id: "navigation", name: "Getting to Portfolio" },
      { id: "book",       name: "Book Overview" },
      { id: "layout",     name: "Dashboard Layout — 6 Panels" },
      { id: "exposure",   name: "① Exposure Summary" },
      { id: "greeks",     name: "② Portfolio Greeks" },
      { id: "sectors",    name: "③ Sector Exposure" },
      { id: "var",        name: "④ Value at Risk (VaR)" },
      { id: "scenario",   name: "⑤ Scenario & Stress Testing" },
      { id: "blotter",    name: "⑥ Positions Blotter" },
      { id: "betas",      name: "Beta Reference Dictionary" },
      { id: "data",       name: "Data Sources & Refresh" },
      { id: "workflow",   name: "Daily Workflow" },
      { id: "roadmap",    name: "Roadmap — Upcoming Features" },
      { id: "glossary",   name: "Glossary" },
    ],
    sources: [
      { title: "Polygon.io",  meta: "Live equity & option quotes" },
      { title: "ADA AI Labs", meta: "Risk engine & blotter logic" },
    ],
    related: [
      { name: "Options Flow User Guide",      ic: "BarChart2" },
      { name: "Regime Lab User Guide",        ic: "Activity" },
      { name: "Call Wall / Put Wall System",  ic: "TrendingUp" },
    ],
    pageList: [{ id: "main", name: "Portfolio User Guide", current: true }],
    content: `
<style>
  .guide{max-width:880px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0;line-height:1.7;}
  h1.page{font-size:2rem;font-weight:700;margin:0 0 6px;color:#f8fafc;}
  .sub{color:#94a3b8;font-size:.95rem;margin-bottom:2rem;}
  h2.sec{font-size:1.25rem;font-weight:600;color:#f1f5f9;margin:2.5rem 0 .75rem;padding-bottom:.4rem;border-bottom:1px solid rgba(255,255,255,.08);}
  h3.pt{font-size:1rem;font-weight:600;color:#cbd5e1;margin:1.5rem 0 .5rem;}
  p{margin:.5rem 0 1rem;color:#cbd5e1;}
  .intro-box{background:linear-gradient(135deg,rgba(77,141,255,.1),rgba(139,92,246,.07));border:1px solid rgba(77,141,255,.25);border-radius:10px;padding:1.25rem 1.5rem;margin-bottom:2rem;}
  .intro-box p{margin:0;color:#93c5fd;}
  .panel-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin:1rem 0 1.5rem;}
  @media(max-width:700px){.panel-grid{grid-template-columns:1fr 1fr;}}
  @media(max-width:440px){.panel-grid{grid-template-columns:1fr;}}
  .panel-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1rem 1.25rem;}
  .panel-card .label{font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;margin-bottom:.4rem;}
  .panel-card .name{font-size:.9rem;font-weight:600;color:#e2e8f0;margin-bottom:.3rem;}
  .panel-card .desc{font-size:.8rem;color:#94a3b8;line-height:1.5;}
  table.ref{width:100%;border-collapse:collapse;font-size:.82rem;margin:1rem 0 1.5rem;}
  table.ref th{text-align:left;padding:.5rem .75rem;font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:#64748b;border-bottom:1px solid rgba(255,255,255,.08);}
  table.ref td{padding:.55rem .75rem;border-bottom:1px solid rgba(255,255,255,.05);color:#cbd5e1;vertical-align:top;}
  table.ref tr:last-child td{border-bottom:0;}
  table.ref td:first-child{color:#e2e8f0;font-weight:500;white-space:nowrap;}
  .callout{background:rgba(77,141,255,.07);border-left:3px solid #4d8dff;border-radius:0 8px 8px 0;padding:.85rem 1.1rem;margin:1rem 0 1.5rem;font-size:.85rem;color:#93c5fd;}
  .callout strong{color:#60a5fa;}
  .tip{background:rgba(20,184,166,.06);border:1px solid rgba(20,184,166,.18);border-radius:8px;padding:.75rem 1rem;margin:.75rem 0 1.25rem;font-size:.83rem;color:#5eead4;}
  .tip strong{color:#2dd4bf;}
  .warn{background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.18);border-radius:8px;padding:.75rem 1rem;margin:.75rem 0 1.25rem;font-size:.83rem;color:#fcd34d;}
  .warn strong{color:#fbbf24;}
  .future{background:rgba(139,92,246,.07);border:1px solid rgba(139,92,246,.2);border-radius:8px;padding:.75rem 1rem;margin:.75rem 0 1.25rem;font-size:.83rem;color:#c4b5fd;}
  .future strong{color:#a78bfa;}
  .metric-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin:1rem 0 1.5rem;}
  @media(max-width:600px){.metric-grid{grid-template-columns:1fr 1fr;}}
  .metric-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:.85rem 1rem;}
  .metric-card .mname{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:.3rem;}
  .metric-card .mval{font-size:.88rem;color:#e2e8f0;line-height:1.5;}
  .step-list{counter-reset:steps;list-style:none;padding:0;margin:1rem 0 1.5rem;}
  .step-list li{counter-increment:steps;display:flex;gap:.85rem;margin-bottom:.85rem;align-items:flex-start;}
  .step-list li::before{content:counter(steps);display:flex;align-items:center;justify-content:center;flex-shrink:0;width:1.6rem;height:1.6rem;border-radius:50%;background:rgba(77,141,255,.15);border:1px solid rgba(77,141,255,.35);color:#60a5fa;font-size:.75rem;font-weight:700;margin-top:.15rem;}
  .step-list li .text{color:#cbd5e1;font-size:.9rem;line-height:1.6;}
  .step-list li .text strong{color:#e2e8f0;}
  .badge{display:inline-flex;align-items:center;gap:.3rem;padding:.18rem .65rem;border-radius:999px;font-size:.7rem;font-weight:700;}
  .b-long{background:rgba(20,184,166,.15);color:#2dd4bf;border:1px solid rgba(20,184,166,.3);}
  .b-short{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3);}
  .b-overlay{background:rgba(245,158,11,.12);color:#fbbf24;border:1px solid rgba(245,158,11,.25);}
  .b-etf{background:rgba(139,92,246,.12);color:#c4b5fd;border:1px solid rgba(139,92,246,.25);}
  .b-bond{background:rgba(77,141,255,.12);color:#60a5fa;border:1px solid rgba(77,141,255,.25);}
  .sym-row{display:flex;flex-wrap:wrap;gap:.4rem;margin:.5rem 0 1rem;}
  .sym{padding:.25rem .7rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:5px;font-family:monospace;font-size:.78rem;color:#e2e8f0;font-weight:600;}
  .sym.long{border-color:rgba(20,184,166,.3);color:#2dd4bf;background:rgba(20,184,166,.07);}
  .sym.short{border-color:rgba(239,68,68,.3);color:#f87171;background:rgba(239,68,68,.07);}
  .sym.overlay{border-color:rgba(245,158,11,.3);color:#fbbf24;background:rgba(245,158,11,.06);}
  .sym.bond{border-color:rgba(77,141,255,.3);color:#60a5fa;background:rgba(77,141,255,.06);}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1rem 0 1.5rem;}
  @media(max-width:560px){.two-col{grid-template-columns:1fr;}}
  .def-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:.85rem 1rem;}
  .def-box .dt{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:.3rem;}
  .def-box .dd{font-size:.83rem;color:#94a3b8;line-height:1.5;}
  .def-box .dd strong{color:#cbd5e1;}
  code{background:rgba(255,255,255,.06);padding:.1rem .4rem;border-radius:4px;font-family:monospace;font-size:.79rem;color:#94a3b8;}
  .shock-grid{display:grid;grid-template-columns:repeat(9,1fr);gap:3px;margin:1rem 0 1.5rem;}
  @media(max-width:600px){.shock-grid{grid-template-columns:repeat(5,1fr);}}
  .shock-cell{border-radius:5px;padding:.4rem .2rem;text-align:center;font-size:.65rem;font-weight:600;line-height:1.3;}
  .shock-dn{background:rgba(239,68,68,.18);color:#fca5a5;border:1px solid rgba(239,68,68,.25);}
  .shock-0{background:rgba(255,255,255,.06);color:#94a3b8;border:1px solid rgba(255,255,255,.1);}
  .shock-up{background:rgba(20,184,166,.15);color:#5eead4;border:1px solid rgba(20,184,166,.22);}
  .greek-row{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin:1rem 0 1.5rem;}
  @media(max-width:580px){.greek-row{grid-template-columns:1fr 1fr;}}
  .greek-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:.85rem 1rem;}
  .greek-card .gname{font-size:.95rem;font-weight:700;color:#e2e8f0;margin-bottom:.25rem;}
  .greek-card .gsym{font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-bottom:.5rem;}
  .greek-card .gdesc{font-size:.78rem;color:#94a3b8;line-height:1.5;}
  .roadmap-item{display:flex;gap:.85rem;align-items:flex-start;padding:.75rem 1rem;background:rgba(139,92,246,.05);border:1px solid rgba(139,92,246,.15);border-radius:8px;margin:.5rem 0;}
  .roadmap-item .ri-icon{font-size:1rem;flex-shrink:0;margin-top:.1rem;}
  .roadmap-item .ri-body .ri-title{font-size:.88rem;font-weight:600;color:#c4b5fd;}
  .roadmap-item .ri-body .ri-desc{font-size:.8rem;color:#7c6fcd;line-height:1.5;margin-top:.15rem;}
</style>

<div class="guide">

  <h1 class="page">Portfolio — User Guide</h1>
  <p class="sub">Market Floor · ADA AI Labs · Multi-Asset PM Workbench</p>

  <div class="intro-box">
    <p>The Portfolio tab is a live multi-asset portfolio management workbench. It aggregates your equity longs, tactical shorts, fixed income, ETF overlays, and option hedges into a single real-time view — giving you exposure summaries, portfolio Greeks, sector concentration, parametric risk (VaR/ES), stress-testing, and a full positions blotter, all from live market data.</p>
  </div>


  <!-- ═══════════════════ NAVIGATION ═══════════════════ -->
  <h2 class="sec" id="navigation">Getting to Portfolio</h2>
  <ol class="step-list">
    <li><span class="text">Open <strong>Market Floor</strong> from the sidebar.</span></li>
    <li><span class="text">Click the <strong>Portfolio</strong> tab in the horizontal tab bar at the top of the dashboard.</span></li>
    <li><span class="text">The system loads live quotes for all positions, 1-year SPY history (for realized vol), and Black-Scholes Greeks for each option overlay simultaneously. A timestamp appears in the top-right corner when loading is complete.</span></li>
    <li><span class="text">Click <strong>↺ Refresh</strong> any time to pull fresh quotes.</span></li>
  </ol>

  <div class="tip"><strong>Load time:</strong> The initial load runs three parallel API calls (quotes, SPY history, option chain Greeks). Expect 2–4 seconds on first open. Subsequent refreshes are faster because the history is cached.</div>


  <!-- ═══════════════════ BOOK OVERVIEW ═══════════════════ -->
  <h2 class="sec" id="book">Book Overview</h2>
  <p>The portfolio tracks a representative multi-asset book across four sleeve types. All live prices are pulled from <code>/api/market</code>; positions and cost bases are defined in the book configuration.</p>

  <div class="two-col">
    <div>
      <h3 class="pt">Core Longs</h3>
      <div class="sym-row">
        <span class="sym long">NVDA</span><span class="sym long">MSFT</span><span class="sym long">AAPL</span>
        <span class="sym long">AMZN</span><span class="sym long">GOOGL</span><span class="sym long">META</span>
        <span class="sym long">LLY</span><span class="sym long">GE</span><span class="sym long">GS</span>
        <span class="sym long">PLTR</span><span class="sym long">AMD</span><span class="sym long">ACN</span>
        <span class="sym long">QQQ</span><span class="sym long">VGT</span>
      </div>
    </div>
    <div>
      <h3 class="pt">Tactical Shorts</h3>
      <div class="sym-row">
        <span class="sym short">TSLA</span><span class="sym short">KSS</span><span class="sym short">AAL</span>
        <span class="sym short">SBUX</span><span class="sym short">AA</span><span class="sym short">SPXU</span>
      </div>
      <h3 class="pt" style="margin-top:1.25rem;">Fixed Income</h3>
      <div class="sym-row">
        <span class="sym bond">PTY</span><span class="sym bond">BND</span>
      </div>
    </div>
  </div>

  <h3 class="pt">Option Overlays</h3>
  <p>Three option overlays are tracked for portfolio-level Greek aggregation:</p>
  <table class="ref">
    <tr><th>Underlying</th><th>Type</th><th>Strike Moneyness</th><th>Purpose</th></tr>
    <tr><td>SPY</td><td>Put</td><td>95% of spot</td><td>Index downside protection (macro hedge)</td></tr>
    <tr><td>QQQ</td><td>Put</td><td>95% of spot</td><td>Tech downside protection</td></tr>
    <tr><td>NVDA</td><td>Call</td><td>105% of spot</td><td>Upside convexity on core long</td></tr>
  </table>

  <div class="warn"><strong>Book configuration:</strong> The positions, quantities, average costs, and overlays are defined in the book configuration. Adding tickers, adjusting sizes, or importing a live book is a feature currently being built — see the Roadmap section at the end of this guide.</div>


  <!-- ═══════════════════ PANEL MAP ═══════════════════ -->
  <h2 class="sec" id="layout">Dashboard Layout — Six Panels</h2>

  <div class="panel-grid">
    <div class="panel-card">
      <div class="label">Panel ①</div>
      <div class="name">Exposure Summary</div>
      <div class="desc">Gross/net/leverage, NAV, Day P&L, beta-weighted SPX delta, long/short gauge.</div>
    </div>
    <div class="panel-card">
      <div class="label">Panel ②</div>
      <div class="name">Portfolio Greeks</div>
      <div class="desc">Aggregate Black-Scholes Delta, Gamma, Vega, and Theta across all option overlays.</div>
    </div>
    <div class="panel-card">
      <div class="label">Panel ③</div>
      <div class="name">Sector Exposure</div>
      <div class="desc">Net and gross MV by GICS sector. Bidirectional bars show long/short tilt per sector.</div>
    </div>
    <div class="panel-card">
      <div class="label">Panel ④</div>
      <div class="name">Value at Risk</div>
      <div class="desc">Parametric VaR 95%, VaR 99%, ES 97.5% via factor model. Top-6 risk contributors.</div>
    </div>
    <div class="panel-card">
      <div class="label">Panel ⑤</div>
      <div class="name">Scenario & Stress</div>
      <div class="desc">Spot shock grid (±10%), vol shock P&L, rate shock P&L on bond sleeve.</div>
    </div>
    <div class="panel-card">
      <div class="label">Panel ⑥</div>
      <div class="name">Positions Blotter</div>
      <div class="desc">Full position table — qty, price, MV, weight, beta, Day P&L, Unrealized P&L.</div>
    </div>
  </div>


  <!-- ═══════════════════ PANEL 1 ═══════════════════ -->
  <h2 class="sec" id="exposure">① Exposure Summary</h2>
  <p>The topmost panel is the command-level portfolio read. Six metric cards tell you where the book stands right now.</p>

  <div class="metric-grid">
    <div class="metric-card">
      <div class="mname">Gross</div>
      <div class="mval">Sum of <strong>all</strong> absolute position market values — your total notional foot on the street, both sides.</div>
    </div>
    <div class="metric-card">
      <div class="mname">Net</div>
      <div class="mval">Longs + Shorts (algebraic). <span style="color:#2dd4bf">Teal</span> = net long; <span style="color:#f87171">Rose</span> = net short. Tells you directional lean.</div>
    </div>
    <div class="metric-card">
      <div class="mname">Leverage</div>
      <div class="mval">Gross ÷ NAV. E.g., 1.8× means you have $1.80 of gross exposure per dollar of net asset value.</div>
    </div>
    <div class="metric-card">
      <div class="mname">Net / NAV %</div>
      <div class="mval">Net MV as a percentage of NAV. Your effective long/short bias expressed as a percentage of the fund.</div>
    </div>
    <div class="metric-card">
      <div class="mname">Day P&L</div>
      <div class="mval">Intraday profit/loss since the previous close. Aggregated across all positions: <code>qty × (price − prevClose)</code>.</div>
    </div>
    <div class="metric-card">
      <div class="mname">β-Wtd Δ ($SPX)</div>
      <div class="mval">SPX-equivalent dollar exposure. Your effective market sensitivity after applying each position's beta, including option deltas.</div>
    </div>
  </div>

  <h3 class="pt">Long/Short Gauge</h3>
  <p>A horizontal bar below the metric cards shows the gross split: <span style="color:#2dd4bf">teal (left)</span> = long-side % of gross, <span style="color:#f87171">rose (right)</span> = short-side % of gross. Currency labels flank each side. This is the fastest visual check for long/short balance.</p>

  <h3 class="pt">How NAV is Calculated</h3>
  <p><code>NAV = Cash + Net MV + Option Market Value</code></p>
  <p>Option MV is the mark-to-market value of all three overlays computed as <code>qty × 100 × lastPrice</code> for each contract.</p>

  <div class="callout"><strong>Beta-Weighted Delta explained:</strong> A $10M position in NVDA (beta 1.75) contributes $17.5M of SPX-equivalent exposure — more than a $10M position in MSFT (beta 0.95). This metric normalizes the entire portfolio to a single number: how many dollars of SPX futures exposure is this book synthetically equivalent to?</div>


  <!-- ═══════════════════ PANEL 2 ═══════════════════ -->
  <h2 class="sec" id="greeks">② Portfolio Greeks</h2>
  <p>This panel aggregates Black-Scholes Greeks across all option overlays. It shows whether the option sleeve is additive or offsetting to the equity book, and the net vega/theta profile of the overlay positions.</p>

  <div class="greek-row">
    <div class="greek-card">
      <div class="gname">Δ Net Delta</div>
      <div class="gsym">$ / 1% SPX move</div>
      <div class="gdesc">Total dollar sensitivity to a 1% parallel market move. Includes both equity positions and option deltas from all overlays.</div>
    </div>
    <div class="greek-card">
      <div class="gname">Γ Net Gamma</div>
      <div class="gsym">$ / 1% SPX² move</div>
      <div class="gdesc">How delta itself changes per 1% move. <span style="color:#2dd4bf">Positive</span> = long convexity (profits accelerate in big moves). <span style="color:#f87171">Negative</span> = short convexity.</div>
    </div>
    <div class="greek-card">
      <div class="gname">V Net Vega</div>
      <div class="gsym">$ / +1 vol point</div>
      <div class="gdesc">P&L if implied vol rises by 1 point (not percent) across all overlay contracts. Positive = vol tailwind; negative = vol headwind.</div>
    </div>
    <div class="greek-card">
      <div class="gname">Θ Net Theta</div>
      <div class="gsym">$ / calendar day</div>
      <div class="gdesc">P&L from one day of time passage, all else equal. <span style="color:#f87171">Negative</span> (typical for long hedges) = paying time premium. <span style="color:#2dd4bf">Positive</span> = collecting it.</div>
    </div>
  </div>

  <p>Each Greek is color-coded: <span style="color:#2dd4bf">teal</span> = positive; <span style="color:#f87171">rose</span> = negative. The panel also shows the loading status for each overlay (e.g., "Greeks: 3/3 loaded").</p>

  <h3 class="pt">How Greeks are Computed</h3>
  <table class="ref">
    <tr><th>Greek</th><th>Formula Source</th><th>Aggregation</th></tr>
    <tr><td>Delta</td><td>Black-Scholes N(d1) for calls; N(d1)−1 for puts</td><td>Equity: 1.0/share × price. Option: qty × 100 × Δ_BS</td></tr>
    <tr><td>Gamma</td><td>pdf(d1) / (S · σ · √T)</td><td>Σ(qty × 100 × Γ × S² × 0.01) — dollar gamma per 1% move</td></tr>
    <tr><td>Vega</td><td>S · pdf(d1) · √T / 100</td><td>Σ(qty × 100 × Vega) — dollars per vol point</td></tr>
    <tr><td>Theta</td><td>Standard B-S theta / 365</td><td>Σ(qty × 100 × Θ) — dollars per calendar day</td></tr>
  </table>

  <p>Greeks are fetched live: for each overlay underlying, the system calls <code>/api/market?type=options&amp;symbol=SYM&amp;limit=60</code>, finds the strike nearest to the target moneyness (95% for puts, 105% for calls), and reads the pre-computed Greeks from that contract.</p>

  <div class="tip"><strong>Reading the Theta/Vega pair:</strong> Negative theta + positive vega is the classic long-hedge profile — you're paying daily premium for protection that pays out in volatility spikes. If both are near zero, the overlays are nearly at expiry or very far out of the money. A portfolio running large negative theta should be reviewed for upcoming expiries.</div>


  <!-- ═══════════════════ PANEL 3 ═══════════════════ -->
  <h2 class="sec" id="sectors">③ Sector Exposure</h2>
  <p>This panel breaks the portfolio down into GICS-style sector buckets and shows net and gross MV per sector. Use it to identify where concentration risk lives and whether your hedges are in the same sectors as your longs.</p>

  <h3 class="pt">Sector Definitions</h3>
  <table class="ref">
    <tr><th>Sector</th><th>Current Positions</th></tr>
    <tr><td>Technology</td><td>NVDA, MSFT, AAPL, AMD, SMCI, IBM, ACN (long); VGT (ETF)</td></tr>
    <tr><td>Comm Svcs</td><td>GOOGL, META, DJT, PLTR (long)</td></tr>
    <tr><td>Cons Disc</td><td>AMZN, TSLA, TGT, SBUX, KSS, GM (various)</td></tr>
    <tr><td>Health Care</td><td>LLY, MRNA</td></tr>
    <tr><td>Industrials</td><td>GE, GD, TT, BAH, ALLE, AAL</td></tr>
    <tr><td>Financials</td><td>GS, RKT</td></tr>
    <tr><td>Materials</td><td>AA, BP</td></tr>
    <tr><td>Energy</td><td>BP</td></tr>
    <tr><td>Index ETF</td><td>SPY, QQQ, DIA, VT</td></tr>
    <tr><td>Fixed Income</td><td>BND, PTY</td></tr>
  </table>

  <h3 class="pt">Bidirectional Sector Bars</h3>
  <p>Each sector row shows a bar pivoted at center — bars extending <span style="color:#2dd4bf">right (teal)</span> indicate net long exposure; bars extending <span style="color:#f87171">left (rose)</span> indicate net short. The bar width is proportional to gross MV in that sector. The net MV dollar value appears on the right.</p>

  <div class="callout"><strong>Sector hedge check:</strong> If Technology and Cons Disc show large teal bars but your shorts are in Industrials and Materials, the short book is not hedging your sector concentration — it's a cross-sector bet. Verify intentionality. If you're short TSLA (Cons Disc) while long AMZN (also Cons Disc), the bars will show partial netting within that sector.</div>


  <!-- ═══════════════════ PANEL 4 ═══════════════════ -->
  <h2 class="sec" id="var">④ Value at Risk (VaR)</h2>
  <p>The VaR panel uses a parametric factor model to estimate the maximum expected loss over one trading day at three confidence levels. All numbers are dollar-denominated.</p>

  <h3 class="pt">Factor Model Methodology</h3>
  <ol class="step-list">
    <li><span class="text"><strong>Realized SPY vol</strong> is computed from 1-year daily closes using a 20-day rolling standard deviation of log returns, then annualized: <code>σ_SPY_annual = stdev(log-returns[0..19]) × √252</code>. Fallback: 16% if history is unavailable.</span></li>
    <li><span class="text"><strong>Systematic daily $vol</strong> is the beta-weighted exposure times the daily market move: <code>|β-wtd delta| × (σ_SPY / 100 / √252)</code>.</span></li>
    <li><span class="text"><strong>Idiosyncratic daily $vol</strong> is the sum of squared position idio vols, then square-rooted: <code>√Σ[ (|MV| × sector_idio / 100 / √252)² ]</code>. Sector idio vols range from 7% (Fixed Income) to 42% (Materials).</span></li>
    <li><span class="text"><strong>Portfolio daily $vol</strong> combines systematic + idiosyncratic orthogonally: <code>√(systematic² + idiosyncratic²)</code>.</span></li>
    <li><span class="text"><strong>VaR / ES</strong> is the z-score multiple of portfolio daily vol.</span></li>
  </ol>

  <h3 class="pt">Risk Metrics</h3>
  <table class="ref">
    <tr><th>Metric</th><th>Z-Score</th><th>Interpretation</th></tr>
    <tr><td>VaR 95%</td><td>1.645×</td><td>5th-percentile loss: expect to lose <em>at least this much</em> 1 day in 20 under normal markets</td></tr>
    <tr><td>VaR 99%</td><td>2.326×</td><td>1st-percentile loss: expect to lose at least this much 1 day in 100</td></tr>
    <tr><td>ES 97.5%</td><td>2.062×</td><td>Expected Shortfall: the <em>average</em> loss in the worst 2.5% of days — a better tail-risk measure than VaR alone</td></tr>
  </table>

  <p>Each card also shows the metric as a <strong>% of NAV</strong>. The portfolio daily vol is displayed as context (e.g., "Daily σ: $2.1M").</p>

  <h3 class="pt">Top Risk Contributors</h3>
  <p>A bar chart shows the 6 positions with the largest standalone daily dollar vol: <code>|MV| × √[ (β × market_daily)² + (idio/100/√252)² ]</code>. These are the positions most responsible for the total portfolio VaR — useful for sizing decisions and risk reduction.</p>

  <div class="warn"><strong>Model limitations:</strong> This is a parametric (normal-distribution) model. It underestimates tail risk during market dislocations, correlation spikes, or gap events (e.g., earnings surprises, macro shocks). Use the Scenario & Stress panel for non-normal stress testing. ES 97.5% is the most conservative metric shown and is preferred for risk limit monitoring.</div>


  <!-- ═══════════════════ PANEL 5 ═══════════════════ -->
  <h2 class="sec" id="scenario">⑤ Scenario &amp; Stress Testing</h2>
  <p>Three distinct shock dimensions let you stress the portfolio beyond normal VaR assumptions. Each scenario produces a dollar P&L estimate using the current live prices and live Greeks.</p>

  <h3 class="pt">Spot Shock Grid (Equity)</h3>
  <p>A 9-cell heatmap of market-wide moves, from −10% to +10% in 2.5% increments:</p>

  <div class="shock-grid">
    <div class="shock-cell shock-dn">−10%</div>
    <div class="shock-cell shock-dn">−7.5%</div>
    <div class="shock-cell shock-dn">−5%</div>
    <div class="shock-cell shock-dn">−2.5%</div>
    <div class="shock-cell shock-0">0%</div>
    <div class="shock-cell shock-up">+2.5%</div>
    <div class="shock-cell shock-up">+5%</div>
    <div class="shock-cell shock-up">+7.5%</div>
    <div class="shock-cell shock-up">+10%</div>
  </div>

  <p>Per shock, the system calculates:</p>
  <ul style="color:#cbd5e1;font-size:.88rem;padding-left:1.25rem;margin:.5rem 0 1rem;">
    <li><strong>Equity P&L:</strong> <code>Σ(position MV × beta × shock%)</code> — each position's contribution scaled by its SPX beta</li>
    <li><strong>Option P&L:</strong> <code>Σ(delta × ΔS + 0.5 × gamma × ΔS²)</code> — first and second-order option response, where ΔS is the dollar move in the underlying (beta-adjusted)</li>
    <li><strong>Total P&L:</strong> Equity + Option, color-coded: <span style="color:#2dd4bf">teal</span> = gain, <span style="color:#f87171">rose</span> = loss, intensity proportional to magnitude</li>
  </ul>

  <div class="tip"><strong>Reading the grid:</strong> If the −5% cell shows a smaller loss than expected, your puts are doing their job (positive option P&L partially offsetting equity losses). If the +10% cell shows a smaller gain than pure equity, the put overlays are dragging (you're paying for protection that isn't needed in an up move). The gamma term in the option P&L reflects convexity — large moves produce disproportionate gains from long puts.</div>

  <h3 class="pt">Implied Vol Shocks</h3>
  <p>Five parallel-shift scenarios on the entire vol surface:</p>
  <table class="ref">
    <tr><th>Shock</th><th>P&L Formula</th><th>Use Case</th></tr>
    <tr><td>−5 vol pts</td><td><code>netVega × (−5)</code></td><td>Vol crush after event (earnings, FOMC)</td></tr>
    <tr><td>−2 vol pts</td><td><code>netVega × (−2)</code></td><td>Mild vol contraction</td></tr>
    <tr><td>+2 vol pts</td><td><code>netVega × (+2)</code></td><td>Minor vol expansion</td></tr>
    <tr><td>+5 vol pts</td><td><code>netVega × (+5)</code></td><td>Risk-off / moderate volatility spike</td></tr>
    <tr><td>+10 vol pts</td><td><code>netVega × (+10)</code></td><td>Volatility shock (VIX spike event)</td></tr>
  </table>

  <p>Positive net vega means you benefit from vol expansion (own the options). Negative net vega means vol spikes hurt. Check this against your overlay positions — if you own SPY and QQQ puts (long vol), positive vol shock rows should show teal.</p>

  <h3 class="pt">Rate Shocks (Bond Sleeve)</h3>
  <p>Three parallel yield-curve shift scenarios applied to the fixed-income and rate-sensitive positions only (BND, PTY, SPXU):</p>
  <table class="ref">
    <tr><th>Shock</th><th>P&L Formula</th><th>Context</th></tr>
    <tr><td>+25 bp</td><td><code>−Σ(MV × duration × 0.0025)</code></td><td>Single Fed hike (typical tightening increment)</td></tr>
    <tr><td>+50 bp</td><td><code>−Σ(MV × duration × 0.0050)</code></td><td>Aggressive hike or hawkish surprise</td></tr>
    <tr><td>+100 bp</td><td><code>−Σ(MV × duration × 0.0100)</code></td><td>Taper tantrum / rapid tightening cycle</td></tr>
  </table>

  <p>Bond durations used in the model: BND = 6.0 years, PTY = 6.5 years. SPXU has no rate sensitivity (duration = 0). Rate shocks <em>do not</em> affect equity positions in this model — add a dedicated macro stress test for cross-asset rate/equity correlation.</p>


  <!-- ═══════════════════ PANEL 6 ═══════════════════ -->
  <h2 class="sec" id="blotter">⑥ Positions Blotter</h2>
  <p>The full position-level table, sorted by absolute market value (largest first). This is the authoritative single-position view — every number derives from live prices and the book configuration.</p>

  <table class="ref">
    <tr><th>Column</th><th>Type</th><th>Description</th></tr>
    <tr><td>Symbol</td><td>String</td><td>Ticker. <span style="color:#2dd4bf">Teal</span> if long; <span style="color:#f87171">rose</span> if short.</td></tr>
    <tr><td>Sector</td><td>String</td><td>GICS-style sector assignment (see Sector map above)</td></tr>
    <tr><td>Qty</td><td>Integer</td><td>Share count. Negative (−) for shorts.</td></tr>
    <tr><td>Price</td><td>Currency</td><td>Live last price from <code>/api/market</code></td></tr>
    <tr><td>Mkt Value</td><td>Currency</td><td><code>qty × price</code>. Rose if negative (short).</td></tr>
    <tr><td>Wt %</td><td>Percent</td><td><code>|MV| / grossMV × 100</code> — this position's share of total notional</td></tr>
    <tr><td>β</td><td>Decimal</td><td>Beta vs SPX from the reference dictionary. Negative for inverse ETFs (SPXU = −3.0).</td></tr>
    <tr><td>Day P&L</td><td>Currency</td><td><code>qty × (price − prevClose)</code> — intraday gain/loss since last close</td></tr>
    <tr><td>Unreal P&L</td><td>Currency</td><td><code>qty × (price − avgCost)</code> — open mark-to-market gain/loss vs cost basis</td></tr>
  </table>

  <div class="tip"><strong>Sorting:</strong> Positions are sorted by |MV| descending — your largest contributors appear at the top. This is intentional; a concentration check is faster when the largest names are first.</div>

  <div class="callout"><strong>Short positions:</strong> Short positions have negative qty and negative MV but show <em>positive Unrealized P&L</em> when the price has fallen below your short entry. A short in KSS at $17 with a current price of $14 shows +$24,000 unrealized P&L (−8,000 qty × ($14 − $17)).</div>


  <!-- ═══════════════════ BETA REFERENCE ═══════════════════ -->
  <h2 class="sec" id="betas">Beta Reference Dictionary</h2>
  <p>All beta values are pre-loaded in the system's reference dictionary and used across Exposure, VaR, and Scenario calculations. These are reference betas against SPX.</p>

  <table class="ref">
    <tr><th>Symbol</th><th>Beta</th><th>Category</th><th>Symbol</th><th>Beta</th><th>Category</th></tr>
    <tr><td>NVDA</td><td>1.75</td><td>Semiconductor</td><td>TSLA</td><td>2.00</td><td>Auto/EV</td></tr>
    <tr><td>AMD</td><td>1.80</td><td>Semiconductor</td><td>PLTR</td><td>2.60</td><td>Software/AI</td></tr>
    <tr><td>SMCI</td><td>1.90</td><td>Hardware</td><td>AMZN</td><td>1.30</td><td>Cons Disc / Cloud</td></tr>
    <tr><td>META</td><td>1.30</td><td>Social/Ads</td><td>GOOGL</td><td>1.05</td><td>Search/Cloud</td></tr>
    <tr><td>MSFT</td><td>0.95</td><td>Enterprise</td><td>AAPL</td><td>1.20</td><td>Consumer</td></tr>
    <tr><td>GS</td><td>1.30</td><td>Financials</td><td>RKT</td><td>2.20</td><td>Financials</td></tr>
    <tr><td>AA</td><td>2.10</td><td>Materials</td><td>KSS</td><td>1.70</td><td>Retail</td></tr>
    <tr><td>AAL</td><td>1.50</td><td>Industrials</td><td>SBUX</td><td>0.95</td><td>Cons Disc</td></tr>
    <tr><td>LLY</td><td>0.45</td><td>Healthcare</td><td>GE</td><td>1.10</td><td>Industrials</td></tr>
    <tr><td>QQQ</td><td>1.10</td><td>Index ETF</td><td>SPY</td><td>1.00</td><td>Index ETF</td></tr>
    <tr><td>DIA</td><td>0.95</td><td>Index ETF</td><td>VGT</td><td>1.15</td><td>Sector ETF</td></tr>
    <tr><td>SPXU</td><td>−3.00</td><td>Inverse ETF</td><td>BND</td><td>0.05</td><td>Fixed Income</td></tr>
    <tr><td>PTY</td><td>0.60</td><td>Fixed Income</td><td>VT</td><td>0.90</td><td>Global ETF</td></tr>
    <tr><td>ACN</td><td>1.10</td><td>IT Services</td><td>IBM</td><td>0.90</td><td>Enterprise</td></tr>
  </table>

  <p>When you add a new ticker that is not in this dictionary, the system will use a fallback beta. The beta reference will be expanded as new positions are added.</p>


  <!-- ═══════════════════ DATA FLOW ═══════════════════ -->
  <h2 class="sec" id="data">Data Sources &amp; Refresh</h2>

  <table class="ref">
    <tr><th>Data</th><th>Endpoint</th><th>Refresh Cadence</th></tr>
    <tr><td>Live quotes (all positions)</td><td><code>/api/market?type=quotes&amp;symbols=...</code></td><td>On load + manual ↺ Refresh</td></tr>
    <tr><td>SPY 1-year daily history</td><td><code>/api/market?type=history&amp;symbol=SPY&amp;range=1y</code></td><td>On load (cached per session)</td></tr>
    <tr><td>Option chain + Greeks (overlays)</td><td><code>/api/market?type=options&amp;symbol=SYM&amp;limit=60</code></td><td>On load (one call per overlay)</td></tr>
  </table>

  <p>All three calls run in parallel on mount. The timestamp shown in the header reflects the last successful fetch. There is currently no auto-refresh interval — click Refresh to pull new data.</p>

  <div class="tip"><strong>Quote timestamps:</strong> Quotes from the API reflect the market state at the time of the request. During market hours this is effectively real-time (seconds delayed). After hours, prevClose and price may match (no intraday move to show), and Day P&L will be zero or reflect after-hours data depending on the data provider.</div>


  <!-- ═══════════════════ WORKFLOW ═══════════════════ -->
  <h2 class="sec" id="workflow">Daily Workflow — Recommended Read Sequence</h2>

  <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:1.25rem 1.5rem;margin:1rem 0 1.5rem;">
    <h4 style="font-size:.78rem;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin:0 0 1rem;">Morning Open — 10 minutes</h4>
    <ol class="step-list">
      <li><span class="text"><strong>Refresh</strong> to pull overnight closes and any pre-market moves.</span></li>
      <li><span class="text">Check <strong>Exposure Summary</strong> — confirm leverage, Net/NAV %, and Day P&L are within expected bounds. Has beta-weighted delta moved significantly from yesterday?</span></li>
      <li><span class="text">Scan <strong>Portfolio Greeks</strong> — is theta drain in line with expectations? Any overlay approaching expiry that needs rolling?</span></li>
      <li><span class="text">Review <strong>Sector Exposure</strong> — did any overnight moves cause sector concentration to drift? Large gap moves in a single name can shift sector weights materially.</span></li>
      <li><span class="text">Run a <strong>−5% spot shock</strong> (Scenario panel) — what is today's tail exposure? Compare to yesterday's VaR. A significant change means the book has rotated.</span></li>
    </ol>
  </div>

  <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:1.25rem 1.5rem;margin:1rem 0 1.5rem;">
    <h4 style="font-size:.78rem;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin:0 0 1rem;">Pre-Trade Check — 5 minutes</h4>
    <ol class="step-list">
      <li><span class="text">Before adding or removing a position, check the <strong>Positions Blotter</strong> — where does the new name rank by weight? Is this adding or reducing sector concentration?</span></li>
      <li><span class="text">Check the <strong>Beta Reference</strong> — does the new name increase or decrease beta-weighted delta? If you're already running high SPX-equivalent exposure, adding a high-beta long amplifies the risk.</span></li>
      <li><span class="text">Re-run the <strong>Scenario Grid</strong> mentally: a new long in a 2.0-beta name adds 2× equity sensitivity per dollar invested. The option overlays remain unchanged unless you update them.</span></li>
    </ol>
  </div>


  <!-- ═══════════════════ ROADMAP ═══════════════════ -->
  <h2 class="sec" id="roadmap">Roadmap — Upcoming Features</h2>
  <p>The following enhancements are planned for the Portfolio tab. This guide will be updated as each feature ships.</p>

  <div class="roadmap-item">
    <div class="ri-icon">＋</div>
    <div class="ri-body">
      <div class="ri-title">Add / Remove Tickers</div>
      <div class="ri-desc">An inline form for adding new positions to the book — symbol, quantity, average cost, sector classification, and beta override. Positions will persist across sessions. Remove via a blotter action row.</div>
    </div>
  </div>

  <div class="roadmap-item">
    <div class="ri-icon">↑</div>
    <div class="ri-body">
      <div class="ri-title">Expanded Beta Dictionary</div>
      <div class="ri-desc">As new tickers are added, the beta reference dictionary will grow. Betas will be either sourced from a 252-day regression against SPX or set manually per position. A custom-beta override input is planned.</div>
    </div>
  </div>

  <div class="roadmap-item">
    <div class="ri-icon">⇅</div>
    <div class="ri-body">
      <div class="ri-title">Import / Export (CSV &amp; JSON)</div>
      <div class="ri-desc">Import a live book from a CSV file (symbol, qty, avgCost) or export the current blotter to CSV/JSON for reconciliation with a prime broker or risk system.</div>
    </div>
  </div>

  <div class="roadmap-item">
    <div class="ri-icon">◎</div>
    <div class="ri-body">
      <div class="ri-title">Auto-Refresh</div>
      <div class="ri-desc">A configurable auto-refresh interval (e.g., every 30s or 60s during market hours) so live quotes and P&L stay current without manual clicks.</div>
    </div>
  </div>

  <div class="roadmap-item">
    <div class="ri-icon">📊</div>
    <div class="ri-body">
      <div class="ri-title">Historical P&L Chart</div>
      <div class="ri-desc">A time-series chart of daily portfolio P&L and NAV, reconstructed from daily closes and the book configuration. Enables drawdown analysis and Sharpe ratio estimation.</div>
    </div>
  </div>

  <div class="roadmap-item">
    <div class="ri-icon">⚙</div>
    <div class="ri-body">
      <div class="ri-title">Option Overlay Manager</div>
      <div class="ri-desc">Add, remove, and edit option overlays (any underlying, any strike/expiry) directly from the Portfolio tab. Currently the three overlays are fixed in the book configuration.</div>
    </div>
  </div>


  <!-- ═══════════════════ GLOSSARY ═══════════════════ -->
  <h2 class="sec" id="glossary">Glossary</h2>
  <div class="two-col">
    <div class="def-box"><div class="dt">NAV</div><div class="dd">Net Asset Value: Cash + Net MV of all equity positions + Mark-to-market value of option overlays.</div></div>
    <div class="def-box"><div class="dt">Gross MV</div><div class="dd">Sum of <strong>absolute</strong> market values for all positions — the total notional book size regardless of direction.</div></div>
    <div class="def-box"><div class="dt">Net MV</div><div class="dd">Algebraic sum: longs + shorts. Positive = net long book; negative = net short book.</div></div>
    <div class="def-box"><div class="dt">Leverage</div><div class="dd">Gross MV ÷ NAV. 1.8× means $1.80 of gross exposure per $1.00 of net assets.</div></div>
    <div class="def-box"><div class="dt">Beta-Wtd Delta</div><div class="dd">The SPX-equivalent dollar exposure of the entire book, accounting for each position's market sensitivity (beta) and option delta.</div></div>
    <div class="def-box"><div class="dt">Unrealized P&L</div><div class="dd">Open mark-to-market: <code>qty × (current price − avg cost)</code>. Positive for longs if price has risen; positive for shorts if price has fallen.</div></div>
    <div class="def-box"><div class="dt">VaR 95%</div><div class="dd">The 1-day loss threshold exceeded on only 5% of trading days under normal market conditions (1.645σ).</div></div>
    <div class="def-box"><div class="dt">ES (Expected Shortfall)</div><div class="dd">The average loss in the worst 2.5% of days — a better tail-risk measure than VaR because it captures the severity of extreme losses, not just their probability.</div></div>
    <div class="def-box"><div class="dt">Parametric VaR</div><div class="dd">VaR computed via the normal distribution assumption. Fast and transparent but underestimates fat-tail events. Supplement with scenario analysis for stress testing.</div></div>
    <div class="def-box"><div class="dt">Idiosyncratic Vol</div><div class="dd">The volatility of a position unexplained by the market factor (its residual or stock-specific risk). Used in the VaR factor model alongside systematic (beta × market) vol.</div></div>
    <div class="def-box"><div class="dt">Gamma (portfolio)</div><div class="dd">How the portfolio's dollar delta changes per 1% market move. Positive gamma = the book benefits more from large moves than it loses (long convexity from option hedges).</div></div>
    <div class="def-box"><div class="dt">Duration</div><div class="dd">The price sensitivity of a bond or bond ETF to a 1% change in yield. Used in rate shock calculations: a 6-year duration bond loses ~6% of market value if yields rise 1%.</div></div>
  </div>

</div>
`,
  },

  "options-flow-user-guide": {
    title: "Options Flow —",
    titleEm: "User Guide.",
    lede: "A complete walkthrough of the Options Flow workbench — net premium flow, cross-ticker sentiment, dealer gamma profile, IV term structure, unusual activity detection, and OI wall analysis.",
    banner: "system",
    crumb: "Market Floor / Wikis / Options Flow",
    pages: 13,
    updated: "Jun 2026",
    version: "1.0.0",
    visibility: "internal",
    toc: [
      { id: "navigation",    name: "Getting to Options Flow" },
      { id: "tickers",       name: "Available Tickers" },
      { id: "layout",        name: "Dashboard Layout — 6 Panels" },
      { id: "net-flow",      name: "① Net Premium Flow" },
      { id: "cross-ticker",  name: "② Cross-Ticker Sentiment Matrix" },
      { id: "gamma",         name: "③ Dealer Gamma Profile" },
      { id: "term-structure", name: "④ IV Term Structure" },
      { id: "unusual",       name: "⑤ Unusual Activity" },
      { id: "oi-walls",      name: "⑥ Expiry Concentration & OI Walls" },
      { id: "fields",        name: "Contract Data Fields" },
      { id: "colors",        name: "Color Key" },
      { id: "glossary",      name: "Glossary" },
      { id: "workflow",      name: "Pre-Trade Workflow" },
    ],
    sources: [
      { title: "Polygon.io",  meta: "Options chains, OI, IV data" },
      { title: "ADA AI Labs", meta: "Flow aggregation & sentiment engine" },
    ],
    related: [
      { name: "Portfolio User Guide",         ic: "Briefcase" },
      { name: "Regime Lab User Guide",        ic: "Activity" },
      { name: "Call Wall / Put Wall System",  ic: "TrendingUp" },
    ],
    pageList: [{ id: "main", name: "Options Flow User Guide", current: true }],
    content: `
<style>
  .guide{max-width:860px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0;line-height:1.7;}
  h1.page{font-size:2rem;font-weight:700;margin:0 0 6px;color:#f8fafc;}
  .sub{color:#94a3b8;font-size:.95rem;margin-bottom:2rem;}
  h2.sec{font-size:1.25rem;font-weight:600;color:#f1f5f9;margin:2.5rem 0 .75rem;padding-bottom:.4rem;border-bottom:1px solid rgba(255,255,255,.08);}
  h3.panel-title{font-size:1rem;font-weight:600;color:#cbd5e1;margin:1.5rem 0 .5rem;}
  p{margin:.5rem 0 1rem;color:#cbd5e1;}
  .intro-box{background:linear-gradient(135deg,rgba(245,158,11,.1),rgba(251,191,36,.06));border:1px solid rgba(245,158,11,.25);border-radius:10px;padding:1.25rem 1.5rem;margin-bottom:2rem;}
  .intro-box p{margin:0;color:#fcd34d;}
  .panel-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin:1rem 0 1.5rem;}
  @media(max-width:700px){.panel-grid{grid-template-columns:1fr 1fr;}}
  @media(max-width:440px){.panel-grid{grid-template-columns:1fr;}}
  .panel-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1rem 1.25rem;}
  .panel-card .label{font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;margin-bottom:.4rem;}
  .panel-card .name{font-size:.9rem;font-weight:600;color:#e2e8f0;margin-bottom:.3rem;}
  .panel-card .desc{font-size:.8rem;color:#94a3b8;line-height:1.5;}
  .badge-row{display:flex;flex-wrap:wrap;gap:.5rem;margin:.75rem 0 1rem;}
  .badge{display:inline-flex;align-items:center;gap:.35rem;padding:.2rem .75rem;border-radius:999px;font-size:.7rem;font-weight:700;letter-spacing:.08em;}
  .b-bull{background:rgba(20,184,166,.15);color:#2dd4bf;border:1px solid rgba(20,184,166,.3);}
  .b-lbull{background:rgba(20,184,166,.08);color:#5eead4;border:1px solid rgba(20,184,166,.2);}
  .b-bal{background:rgba(77,141,255,.15);color:#60a5fa;border:1px solid rgba(77,141,255,.3);}
  .b-lbear{background:rgba(239,68,68,.08);color:#fca5a5;border:1px solid rgba(239,68,68,.2);}
  .b-bear{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3);}
  .b-sweep{background:rgba(245,158,11,.15);color:#fbbf24;border:1px solid rgba(245,158,11,.3);}
  .b-aggr{background:rgba(245,158,11,.1);color:#fcd34d;border:1px solid rgba(245,158,11,.2);}
  .b-block{background:rgba(255,255,255,.08);color:#94a3b8;border:1px solid rgba(255,255,255,.12);}
  .b-call{background:rgba(20,184,166,.12);color:#2dd4bf;border:1px solid rgba(20,184,166,.25);}
  .b-put{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.25);}
  .b-contango{background:rgba(20,184,166,.12);color:#2dd4bf;border:1px solid rgba(20,184,166,.25);}
  .b-back{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.25);}
  .b-flat{background:rgba(255,255,255,.08);color:#94a3b8;border:1px solid rgba(255,255,255,.12);}
  table.ref{width:100%;border-collapse:collapse;font-size:.82rem;margin:1rem 0 1.5rem;}
  table.ref th{text-align:left;padding:.5rem .75rem;font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:#64748b;border-bottom:1px solid rgba(255,255,255,.08);}
  table.ref td{padding:.55rem .75rem;border-bottom:1px solid rgba(255,255,255,.05);color:#cbd5e1;vertical-align:top;}
  table.ref tr:last-child td{border-bottom:0;}
  table.ref td:first-child{color:#e2e8f0;font-weight:500;white-space:nowrap;}
  .callout{background:rgba(245,158,11,.07);border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:.85rem 1.1rem;margin:1rem 0 1.5rem;font-size:.85rem;color:#fcd34d;}
  .callout strong{color:#fbbf24;}
  .tip{background:rgba(20,184,166,.06);border:1px solid rgba(20,184,166,.18);border-radius:8px;padding:.75rem 1rem;margin:.75rem 0 1.25rem;font-size:.83rem;color:#5eead4;}
  .tip strong{color:#2dd4bf;}
  .warn{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.18);border-radius:8px;padding:.75rem 1rem;margin:.75rem 0 1.25rem;font-size:.83rem;color:#fca5a5;}
  .warn strong{color:#f87171;}
  .step-list{counter-reset:steps;list-style:none;padding:0;margin:1rem 0 1.5rem;}
  .step-list li{counter-increment:steps;display:flex;gap:.85rem;margin-bottom:.85rem;align-items:flex-start;}
  .step-list li::before{content:counter(steps);display:flex;align-items:center;justify-content:center;flex-shrink:0;width:1.6rem;height:1.6rem;border-radius:50%;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.35);color:#fbbf24;font-size:.75rem;font-weight:700;margin-top:.15rem;}
  .step-list li .text{color:#cbd5e1;font-size:.9rem;line-height:1.6;}
  .step-list li .text strong{color:#e2e8f0;}
  .color-key{display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem;margin:1rem 0 1.5rem;}
  @media(max-width:500px){.color-key{grid-template-columns:1fr;}}
  .ck-item{display:flex;align-items:center;gap:.6rem;padding:.5rem .85rem;border-radius:7px;font-size:.8rem;}
  .ck-teal{background:rgba(20,184,166,.08);border:1px solid rgba(20,184,166,.2);}
  .ck-rose{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);}
  .ck-amber{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);}
  .ck-blue{background:rgba(77,141,255,.08);border:1px solid rgba(77,141,255,.2);}
  .ck-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
  .dot-teal{background:#2dd4bf;}.dot-rose{background:#f87171;}.dot-amber{background:#fbbf24;}.dot-blue{background:#60a5fa;}
  .sym-row{display:flex;flex-wrap:wrap;gap:.4rem;margin:.5rem 0 1rem;}
  .sym{padding:.25rem .7rem;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:5px;font-family:monospace;font-size:.8rem;color:#fbbf24;font-weight:600;}
  .workflow-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.25rem 1.5rem;margin:1rem 0 1.5rem;}
  .workflow-box h4{font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin:0 0 .85rem;}
  code{background:rgba(255,255,255,.06);padding:.1rem .4rem;border-radius:4px;font-family:monospace;font-size:.8rem;color:#94a3b8;}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1rem 0 1.5rem;}
  @media(max-width:560px){.two-col{grid-template-columns:1fr;}}
  .def-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:.85rem 1rem;}
  .def-box .dt{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:.3rem;}
  .def-box .dd{font-size:.83rem;color:#94a3b8;line-height:1.5;}
  .def-box .dd strong{color:#cbd5e1;}
</style>

<div class="guide">

  <h1 class="page">Options Flow — User Guide</h1>
  <p class="sub">Market Floor · ADA AI Labs · Senior Options PM Workbench</p>

  <div class="intro-box">
    <p>Options Flow is a six-panel workbench that surfaces directional premium flow, institutional sweep activity, dealer gamma positioning, implied volatility term structure, and open-interest concentration — all for five core tickers updated on demand. It is designed for a senior options portfolio manager who needs to read institutional intent before sizing a position.</p>
  </div>


  <!-- ═══════════════════ NAVIGATION ═══════════════════ -->
  <h2 class="sec" id="navigation">Getting to Options Flow</h2>
  <ol class="step-list">
    <li><span class="text">Open <strong>Market Floor</strong> from the sidebar.</span></li>
    <li><span class="text">Click the <strong>Options Flow</strong> tab in the horizontal tab bar.</span></li>
    <li><span class="text">Select a ticker from the five symbol buttons at the top of the dashboard. The selected symbol is highlighted in amber.</span></li>
    <li><span class="text">All six panels refresh automatically when you switch tickers. Click <strong>↺ Refresh</strong> any time to pull new live data.</span></li>
  </ol>

  <div class="tip"><strong>Deep-link:</strong> Append <code>?tab=options</code> to the Market Floor URL to land directly on this tab.</div>


  <!-- ═══════════════════ TICKERS ═══════════════════ -->
  <h2 class="sec" id="tickers">Available Tickers</h2>
  <p>Options Flow tracks five equity options chains simultaneously. The <strong>selected ticker</strong> drives panels ①③④⑤⑥. The cross-ticker matrix (panel ②) always shows all five.</p>
  <div class="sym-row">
    <span class="sym">TSLA</span>
    <span class="sym">NVDA</span>
    <span class="sym">SPY</span>
    <span class="sym">QQQ</span>
    <span class="sym">AAPL</span>
  </div>
  <p>Data is pulled from <code>/api/market?type=options&amp;symbol={sym}&amp;limit=60</code>, which returns the top 60 contracts by volume and the live spot price.</p>


  <!-- ═══════════════════ PANEL MAP ═══════════════════ -->
  <h2 class="sec" id="layout">Dashboard Layout — Six Panels</h2>

  <div class="panel-grid">
    <div class="panel-card">
      <div class="label">Panel ①</div>
      <div class="name">Net Premium Flow</div>
      <div class="desc">Dollar premium by side (calls vs puts), bull/bear gauge, sentiment badge, top-6 flow table.</div>
    </div>
    <div class="panel-card">
      <div class="label">Panel ②</div>
      <div class="name">Cross-Ticker Sentiment</div>
      <div class="desc">Put/call vol ratio and call-premium % for all 5 tickers in a heat-mapped matrix.</div>
    </div>
    <div class="panel-card">
      <div class="label">Panel ③</div>
      <div class="name">Dealer Gamma Profile</div>
      <div class="desc">Net dealer GEX per strike, call wall, put wall, zero-gamma flip point.</div>
    </div>
    <div class="panel-card">
      <div class="label">Panel ④</div>
      <div class="name">IV Term Structure</div>
      <div class="desc">ATM implied vol across up to 6 expiry dates with contango/backwardation shape classification.</div>
    </div>
    <div class="panel-card">
      <div class="label">Panel ⑤</div>
      <div class="name">Unusual Activity</div>
      <div class="desc">Contracts where volume ≥ open interest — sorted by Vol/OI ratio with Sweep / Aggr. / Block badges.</div>
    </div>
    <div class="panel-card">
      <div class="label">Panel ⑥</div>
      <div class="name">Expiry Concentration &amp; OI Walls</div>
      <div class="desc">Volume concentration by expiration date, plus the largest open-interest strikes.</div>
    </div>
  </div>


  <!-- ═══════════════════ PANEL 1 ═══════════════════ -->
  <h2 class="sec" id="net-flow">① Net Premium Flow</h2>
  <p>This is the primary directional read. It aggregates all premium dollars traded on the selected symbol and answers: <em>are institutions spending more money on upside (calls) or downside (puts)?</em></p>

  <h3 class="panel-title">Bull / Bear Gauge</h3>
  <p>A horizontal bar split between teal (call premium %) on the left and rose (put premium %) on the right. The balance of the two bars is the most immediate visual signal.</p>

  <h3 class="panel-title">Sentiment Badge</h3>
  <div class="badge-row">
    <span class="badge b-bull">Bullish Flow</span>
    <span class="badge b-lbull">Lean Bullish</span>
    <span class="badge b-bal">Balanced</span>
    <span class="badge b-lbear">Lean Bearish</span>
    <span class="badge b-bear">Bearish Flow</span>
  </div>
  <table class="ref">
    <tr><th>Badge</th><th>Call Premium %</th><th>Interpretation</th></tr>
    <tr><td>Bullish Flow</td><td>≥ 62 %</td><td>Strongly skewed call spending — institutions buying upside aggressively</td></tr>
    <tr><td>Lean Bullish</td><td>55 – 61 %</td><td>Moderate call premium bias — mild directional lean up</td></tr>
    <tr><td>Balanced</td><td>45 – 54 %</td><td>No clear directional bias; market-neutral or hedged flow</td></tr>
    <tr><td>Lean Bearish</td><td>38 – 44 %</td><td>Moderate put premium bias — mild directional lean down</td></tr>
    <tr><td>Bearish Flow</td><td>≤ 37 %</td><td>Strongly skewed put spending — institutions buying downside protection or speculating lower</td></tr>
  </table>

  <h3 class="panel-title">Top Flow Table</h3>
  <p>The six largest-premium contracts across the entire chain. Each row shows:</p>
  <table class="ref">
    <tr><th>Column</th><th>Description</th></tr>
    <tr><td>Side</td><td><span style="color:#2dd4bf">Call</span> (teal) or <span style="color:#f87171">Put</span> (rose) badge</td></tr>
    <tr><td>Strike</td><td>Strike price of the contract (e.g., $450)</td></tr>
    <tr><td>Expiry</td><td>Expiration date (e.g., 2024-12-20)</td></tr>
    <tr><td>Premium</td><td>Total dollars traded on this contract (last price × volume × 100). Formatted as $B / $M / $K.</td></tr>
    <tr><td>Vol/OI</td><td>Volume ÷ open interest. <span style="color:#fbbf24">Amber</span> when ≥ 1.0 — signals new positioning (see Panel ⑤).</td></tr>
    <tr><td>IV</td><td>Implied volatility of this specific contract (e.g., 45.2 %)</td></tr>
  </table>

  <div class="callout"><strong>Reading the top flow table:</strong> A large-premium call in the top-6 with a Vol/OI ≥ 1.0 and a near-term expiry is a classic institutional sweep. A large-premium put with far-dated expiry is more likely a portfolio hedge than a directional bet.</div>


  <!-- ═══════════════════ PANEL 2 ═══════════════════ -->
  <h2 class="sec" id="cross-ticker">② Cross-Ticker Sentiment Matrix</h2>
  <p>The matrix shows the same directional metrics for <em>all five tickers simultaneously</em> — giving you a macro picture of where institutional money is flowing across the watchlist.</p>

  <h3 class="panel-title">Matrix Columns</h3>
  <table class="ref">
    <tr><th>Column</th><th>Description</th></tr>
    <tr><td>Ticker</td><td>Symbol button — click to switch the active selection for all other panels</td></tr>
    <tr><td>P/C Ratio</td><td>Put volume ÷ call volume. Displayed as "2.1×"</td></tr>
    <tr><td>Bull %</td><td>Call premium as a % of total premium for this ticker</td></tr>
  </table>

  <h3 class="panel-title">Heat Map Color Rules</h3>
  <table class="ref">
    <tr><th>P/C Vol Ratio</th><th>Color</th><th>Sentiment</th></tr>
    <tr><td>≤ 0.60</td><td style="color:#2dd4bf">Strong Teal</td><td>Strongly bullish — call volume dominates heavily</td></tr>
    <tr><td>0.61 – 0.85</td><td style="color:#5eead4">Light Teal</td><td>Mildly bullish</td></tr>
    <tr><td>0.86 – 1.15</td><td style="color:#60a5fa">Blue</td><td>Balanced / neutral</td></tr>
    <tr><td>1.16 – 1.50</td><td style="color:#fca5a5">Light Rose</td><td>Mildly bearish</td></tr>
    <tr><td>&gt; 1.50</td><td style="color:#f87171">Strong Rose</td><td>Strongly bearish — put volume dominates</td></tr>
    <tr><td>—</td><td style="color:#475569">Gray</td><td>No data / loading</td></tr>
  </table>

  <p>Below the matrix, a market-wide P/C line shows the aggregate put/call ratio with reference points: <em>&lt;0.7 = greedy, &gt;1.0 = fearful</em>.</p>

  <div class="tip"><strong>Divergence signal:</strong> When SPY and QQQ show Balanced or Bearish while individual names (TSLA, NVDA) show Bullish Flow, the market is hedging index exposure while still rotating into growth names. This is a common late-cycle setup.</div>


  <!-- ═══════════════════ PANEL 3 ═══════════════════ -->
  <h2 class="sec" id="gamma">③ Dealer Gamma Profile</h2>
  <p>This panel shows how much gamma dealers are carrying at each strike. Dealer gamma determines magnetic price behavior near key levels — understanding it helps you predict where the underlying will pin or accelerate.</p>

  <h3 class="panel-title">Key Metrics</h3>
  <table class="ref">
    <tr><th>Metric</th><th>Description</th></tr>
    <tr><td>Net GEX / 1%</td><td>Net dollar gamma dealers must hedge per 1 % move in the underlying. <span style="color:#2dd4bf">Teal (positive)</span> = call-wall environment; <span style="color:#f87171">Rose (negative)</span> = put-wall environment.</td></tr>
    <tr><td>Zero Gamma</td><td>The strike where cumulative dealer gamma crosses zero. Below this level the market accelerates; above it, it tends to mean-revert.</td></tr>
    <tr><td>Call Wall</td><td>Strike with the highest positive gamma — acts as a <em>resistance ceiling</em>. Dealers sell into rallies near this level to stay delta-neutral.</td></tr>
    <tr><td>Put Wall</td><td>Strike with the highest negative gamma — acts as a <em>support floor</em>. Dealers buy into dips near this level.</td></tr>
  </table>

  <h3 class="panel-title">Gamma Ladder</h3>
  <p>Up to 9 strikes nearest the spot price are shown as horizontal bars — teal bars extending right for positive (call) gamma, rose bars extending left for negative (put) gamma. The strike nearest spot is highlighted in amber.</p>

  <div class="callout"><strong>How to use GEX:</strong> When price is trading <em>above</em> zero-gamma, dealer hedging is stabilising (mean-reversion regime). When price trades <em>below</em> zero-gamma, dealers are de-stabilising (trend / gap regime). The Call Wall is where upside moves typically stall; the Put Wall is where downside moves typically find support.</div>

  <div class="tip"><strong>Data quality note:</strong> When live Black-Scholes Greeks are available from the API, GEX is shown in dollar-gamma ($). When unavailable, the panel falls back to net OI imbalance (thousands of contracts). The subtitle indicates which mode is active.</div>


  <!-- ═══════════════════ PANEL 4 ═══════════════════ -->
  <h2 class="sec" id="term-structure">④ IV Term Structure</h2>
  <p>This panel shows the at-the-money implied volatility for up to six expiration dates, revealing whether the vol surface is in contango (calm) or backwardation (stress).</p>

  <h3 class="panel-title">Per-Expiry Row</h3>
  <table class="ref">
    <tr><th>Column</th><th>Description</th></tr>
    <tr><td>Expiry</td><td>Expiration date</td></tr>
    <tr><td>DTE</td><td>Days to expiration (e.g., "45d")</td></tr>
    <tr><td>ATM IV %</td><td>Implied volatility at the at-the-money strike for this expiry</td></tr>
    <tr><td>Bar</td><td>Width proportional to this expiry's IV relative to the highest IV in the term</td></tr>
  </table>

  <h3 class="panel-title">Term Shape Classification</h3>
  <div class="badge-row">
    <span class="badge b-contango">Contango</span>
    <span class="badge b-back">Backwardation</span>
    <span class="badge b-flat">Flat</span>
  </div>
  <table class="ref">
    <tr><th>Shape</th><th>Condition</th><th>Implication</th></tr>
    <tr><td>Contango</td><td>Far-dated IV &gt; near-dated IV by &gt;1 pt</td><td>Normal / calm structure. Short-vol premium-selling strategies carry positively. Calendar spreads (sell near, buy far) have negative carry.</td></tr>
    <tr><td>Backwardation</td><td>Near-dated IV &gt; far-dated IV by &gt;1 pt</td><td>Stress / event-driven. The market is pricing in near-term risk. Near-term long vol is supported; premium sellers beware.</td></tr>
    <tr><td>Flat</td><td>Difference ≤ 1 pt</td><td>Transition or low-conviction. No strong term-structure edge.</td></tr>
  </table>

  <p>VIX and VVIX spot levels are shown below the term chart for quick cross-reference with the Regime Lab.</p>


  <!-- ═══════════════════ PANEL 5 ═══════════════════ -->
  <h2 class="sec" id="unusual">⑤ Unusual Activity</h2>
  <p>This panel isolates contracts where <strong>trading volume exceeds open interest</strong> — the clearest signal of <em>new</em> institutional positioning rather than existing position management.</p>

  <h3 class="panel-title">Detection Logic</h3>
  <p>A contract is flagged as unusual when its <strong>Vol/OI ratio ≥ 1.0</strong>. The panel shows the top 7 by ratio, sorted highest first.</p>

  <h3 class="panel-title">Activity Badges</h3>
  <div class="badge-row">
    <span class="badge b-sweep">Sweep</span>
    <span class="badge b-aggr">Aggr.</span>
    <span class="badge b-block">Block</span>
  </div>
  <table class="ref">
    <tr><th>Badge</th><th>Vol/OI Threshold</th><th>What it means</th></tr>
    <tr><td>Sweep</td><td>≥ 3.0×</td><td>Volume is 3× or more the existing open interest. Likely a large institutional sweep executing across multiple strikes or venues in a single session. Urgency is high.</td></tr>
    <tr><td>Aggr.</td><td>≥ 1.8×</td><td>Aggressive multi-level accumulation. Institutional buyer/seller working a position over the session. Less urgent than a sweep but still a meaningful signal.</td></tr>
    <tr><td>Block</td><td>≥ 1.0×</td><td>Volume equals or slightly exceeds OI. Standard elevated-positioning print — new money entering this strike/expiry. Monitor for follow-through.</td></tr>
  </table>

  <h3 class="panel-title">Row Columns</h3>
  <table class="ref">
    <tr><th>Column</th><th>Description</th></tr>
    <tr><td>Side</td><td>Call (teal) or Put (rose) badge</td></tr>
    <tr><td>Strike</td><td>Strike price</td></tr>
    <tr><td>Expiry</td><td>Expiration date</td></tr>
    <tr><td>Ratio</td><td>Vol/OI ratio displayed in amber (e.g., "4.2×")</td></tr>
    <tr><td>Badge</td><td>Sweep / Aggr. / Block classification</td></tr>
  </table>

  <div class="callout"><strong>Context matters:</strong> A Sweep on a call with a near-dated expiry and an out-of-the-money strike is a high-conviction directional bet. The same Sweep on a put with a long-dated, deep-in-the-money strike is more likely a portfolio hedge. Cross-reference with Panel ① to see whether the sweep is consistent with the overall premium flow direction.</div>

  <div class="warn"><strong>False positives:</strong> On the first day after a new expiry is listed, all volume is "new" relative to zero OI, making Vol/OI ratios artificially high. Use the expiry date and DTE context to filter these out.</div>


  <!-- ═══════════════════ PANEL 6 ═══════════════════ -->
  <h2 class="sec" id="oi-walls">⑥ Expiry Concentration &amp; OI Walls</h2>
  <p>This panel answers two structural questions: <em>where is the market focused by expiration date?</em> and <em>where is the heaviest open interest sitting by strike?</em></p>

  <div class="two-col">
    <div>
      <h3 class="panel-title">Volume by Expiry (Left)</h3>
      <p>Top 6 expiration dates ranked by volume. An amber gradient bar shows the relative weight. The most active expiry is typically where institutional positioning is concentrated — and where gamma pinning is most likely near expiration.</p>
    </div>
    <div>
      <h3 class="panel-title">Largest OI Strikes (Right)</h3>
      <p>Top 6 strikes ranked by total open interest (call OI + put OI). Strikes within ±1 % of the current spot price are highlighted in amber — these are the key levels for the current session.</p>
    </div>
  </div>

  <table class="ref">
    <tr><th>OI Wall Column</th><th>Description</th></tr>
    <tr><td>Strike</td><td>Strike price. <span style="color:#fbbf24">Amber</span> if within ±1 % of spot.</td></tr>
    <tr><td>Call OI</td><td>Open interest on the call side (teal text)</td></tr>
    <tr><td>Put OI</td><td>Open interest on the put side (rose text)</td></tr>
    <tr><td>Total</td><td>Call + put OI. <span style="color:#2dd4bf">Teal</span> if call-heavy; <span style="color:#f87171">Rose</span> if put-heavy.</td></tr>
  </table>

  <div class="tip"><strong>Pinning:</strong> Strikes with very large total OI near the current spot price tend to act as magnets as expiration approaches. Market makers hedge by buying dips and selling rallies near these strikes, which compresses realized volatility and pins price. This effect is strongest in the 1–2 days before expiration.</div>


  <!-- ═══════════════════ DATA FIELDS ═══════════════════ -->
  <h2 class="sec" id="fields">Contract Data Fields</h2>
  <p>Each row in the options chain carries the following fields, used across panels:</p>
  <table class="ref">
    <tr><th>Field</th><th>Description</th></tr>
    <tr><td>otype</td><td>"call" or "put"</td></tr>
    <tr><td>strike</td><td>Strike price in dollars</td></tr>
    <tr><td>expiry</td><td>Expiration date string</td></tr>
    <tr><td>volume</td><td>Contracts traded in the session</td></tr>
    <tr><td>oi</td><td>Open interest (total outstanding contracts)</td></tr>
    <tr><td>ratio</td><td>Vol/OI as a string (e.g., "2.3×"), or "—" if not unusual</td></tr>
    <tr><td>iv</td><td>Implied volatility for this specific contract (e.g., "45.2%")</td></tr>
    <tr><td>lastPx</td><td>Last traded price per contract</td></tr>
    <tr><td>itm</td><td>True if the contract is currently in-the-money</td></tr>
    <tr><td>delta / gamma / vega / theta</td><td>Black-Scholes Greeks (when available from the API)</td></tr>
    <tr><td>gex</td><td>Dollar-gamma exposure for this contract (when Greeks available)</td></tr>
  </table>


  <!-- ═══════════════════ COLOR KEY ═══════════════════ -->
  <h2 class="sec" id="colors">Color Key</h2>
  <div class="color-key">
    <div class="ck-item ck-teal"><div class="ck-dot dot-teal"></div><span style="color:#2dd4bf;font-size:.82rem;font-weight:600;">Teal</span><span style="color:#94a3b8;font-size:.8rem;margin-left:.3rem;">— Calls / bullish / call-wall / positive GEX</span></div>
    <div class="ck-item ck-rose"><div class="ck-dot dot-rose"></div><span style="color:#f87171;font-size:.82rem;font-weight:600;">Rose</span><span style="color:#94a3b8;font-size:.8rem;margin-left:.3rem;">— Puts / bearish / put-wall / negative GEX</span></div>
    <div class="ck-item ck-amber"><div class="ck-dot dot-amber"></div><span style="color:#fbbf24;font-size:.82rem;font-weight:600;">Amber</span><span style="color:#94a3b8;font-size:.8rem;margin-left:.3rem;">— Active selection / Vol/OI ratio / near-spot strikes</span></div>
    <div class="ck-item ck-blue"><div class="ck-dot dot-blue"></div><span style="color:#60a5fa;font-size:.82rem;font-weight:600;">Blue</span><span style="color:#94a3b8;font-size:.8rem;margin-left:.3rem;">— Balanced / neutral / IV bars</span></div>
  </div>


  <!-- ═══════════════════ GLOSSARY ═══════════════════ -->
  <h2 class="sec" id="glossary">Glossary</h2>
  <div class="two-col">
    <div class="def-box"><div class="dt">Premium</div><div class="dd">Option price × volume × 100 (contract multiplier). Represents actual dollars spent in the market.</div></div>
    <div class="def-box"><div class="dt">Open Interest (OI)</div><div class="dd">Total number of outstanding contracts that have not been settled. High OI = significant accumulated positioning.</div></div>
    <div class="def-box"><div class="dt">Vol/OI Ratio</div><div class="dd"><strong>&gt;1.0</strong> = new money entering (new positioning). <strong>&lt;1.0</strong> = closing/rolling existing positions or low activity.</div></div>
    <div class="def-box"><div class="dt">Sweep</div><div class="dd">Vol/OI ≥ 3×. Large, urgent institutional execution — often a single block print or aggressive multi-venue fill.</div></div>
    <div class="def-box"><div class="dt">Dealer Gamma (GEX)</div><div class="dd">Dollar gamma dealers must hedge per 1% underlying move. Positive = dealers short gamma (calls dominate); Negative = long gamma (puts dominate).</div></div>
    <div class="def-box"><div class="dt">Zero-Gamma Strike</div><div class="dd">The price level where cumulative dealer gamma flips from positive to negative. Below it: trending/gapping regime. Above it: mean-reverting regime.</div></div>
    <div class="def-box"><div class="dt">ATM IV</div><div class="dd">Implied volatility at the at-the-money strike — the cleanest read on what the market is pricing as forward realised vol for that expiry.</div></div>
    <div class="def-box"><div class="dt">Gamma Pinning</div><div class="dd">Price is drawn toward high-OI strikes near expiration as dealers hedge, compressing movement around that level.</div></div>
    <div class="def-box"><div class="dt">Contango</div><div class="desc">Far-dated IV higher than near-dated IV. Normal market structure. Favors premium-selling strategies.</div></div>
    <div class="def-box"><div class="dt">Backwardation</div><div class="dd">Near-dated IV higher than far-dated IV. Stress or event-risk structure. Favors long near-term vol.</div></div>
  </div>


  <!-- ═══════════════════ WORKFLOW ═══════════════════ -->
  <h2 class="sec" id="workflow">Pre-Trade Workflow</h2>
  <p>A recommended read sequence before entering an options position:</p>

  <div class="workflow-box">
    <h4>Options Flow Read — 5 minutes</h4>
    <ol class="step-list">
      <li><span class="text"><strong>Select your ticker</strong> and click Refresh to pull fresh chain data.</span></li>
      <li><span class="text">Read the <strong>Sentiment Badge</strong> (Panel ①). Bullish or Bearish? Is the premium flow aligned with your thesis?</span></li>
      <li><span class="text">Scan the <strong>Top Flow table</strong> (Panel ①). Are the largest prints in near-term calls, far-dated puts, or mixed? Near-term sweeps = directional urgency. Far-dated puts = portfolio hedging, not a directional bet.</span></li>
      <li><span class="text">Check the <strong>Cross-Ticker Matrix</strong> (Panel ②). If SPY and QQQ are RISK-OFF while your name is Bullish, the individual name is fighting the tape — size smaller.</span></li>
      <li><span class="text">Find the <strong>Call Wall and Put Wall</strong> (Panel ③). These are your key levels. Use them as targets and stop guides for the session.</span></li>
      <li><span class="text">Check <strong>Term Shape</strong> (Panel ④). Backwardation = near-term risk is priced; buying short-dated options is expensive. Contango = selling premium has a positive carry edge.</span></li>
      <li><span class="text">Review <strong>Unusual Activity</strong> (Panel ⑤). Any Sweeps consistent with your directional view? A sweep on the same side as your thesis is confirmation. A sweep on the opposite side is a warning.</span></li>
      <li><span class="text">Note the <strong>expiry concentration</strong> and <strong>OI wall near spot</strong> (Panel ⑥). Are you fighting a large OI pin? Is the nearest expiry the most active, or is it a longer-dated cycle?</span></li>
    </ol>
  </div>

  <div class="callout"><strong>Conviction filter:</strong> The highest-conviction setup is when all of ①, ②, ③, and ⑤ agree on direction. If Premium Flow, Cross-Ticker, GEX, and Unusual Activity all point the same way — that is institutional consensus. Any one signal is noise; three or four in alignment is meaningful.</div>

</div>
`,
  },

  "regime-lab-user-guide": {
    title: "Regime Lab —",
    titleEm: "User Guide.",
    lede: "A complete walkthrough of the Regime Lab macro and volatility workbench — vol regime classification, risk premium, cross-asset sentiment, tail risk, rates curve, and trend regime across your watchlist.",
    banner: "system",
    crumb: "Market Floor / Wikis / Regime Lab",
    pages: 11,
    updated: "Jun 2026",
    version: "1.0.0",
    visibility: "internal",
    toc: [
      { id: "navigation",   name: "Getting to Regime Lab" },
      { id: "layout",       name: "Dashboard Layout — 6 Panels" },
      { id: "vol-regime",   name: "① Volatility Regime Radar" },
      { id: "vrp",          name: "② Vol Risk Premium" },
      { id: "cross-asset",  name: "③ Cross-Asset Risk" },
      { id: "tail-risk",    name: "④ Tail Risk & Skew" },
      { id: "rates",        name: "⑤ Rates & Curve" },
      { id: "trend-regime", name: "⑥ Trend Regime Watchlist" },
      { id: "data",         name: "Data Sources" },
      { id: "colors",       name: "Color Key" },
      { id: "workflow",     name: "Pre-Session Workflow" },
    ],
    sources: [
      { title: "Polygon.io",  meta: "VIX, SKEW, VVIX, yield tickers" },
      { title: "CBOE",        meta: "VIX9D, VIX3M, VVIX, SKEW indices" },
      { title: "ADA AI Labs", meta: "Regime classification engine" },
    ],
    related: [
      { name: "Options Flow User Guide",      ic: "BarChart2" },
      { name: "Portfolio User Guide",         ic: "Briefcase" },
      { name: "Call Wall / Put Wall System",  ic: "TrendingUp" },
    ],
    pageList: [{ id: "main", name: "Regime Lab User Guide", current: true }],
    content: `
<style>
  .guide{max-width:860px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0;line-height:1.7;}
  h1.page{font-size:2rem;font-weight:700;margin:0 0 6px;color:#f8fafc;}
  .sub{color:#94a3b8;font-size:.95rem;margin-bottom:2rem;}
  h2.sec{font-size:1.25rem;font-weight:600;color:#f1f5f9;margin:2.5rem 0 .75rem;padding-bottom:.4rem;border-bottom:1px solid rgba(255,255,255,.08);}
  h3.panel-title{font-size:1rem;font-weight:600;color:#cbd5e1;margin:1.5rem 0 .5rem;}
  p{margin:.5rem 0 1rem;color:#cbd5e1;}
  .intro-box{background:linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.08));border:1px solid rgba(139,92,246,.25);border-radius:10px;padding:1.25rem 1.5rem;margin-bottom:2rem;}
  .intro-box p{margin:0;color:#c4b5fd;}
  .panel-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1rem 0 1.5rem;}
  @media(max-width:640px){.panel-grid{grid-template-columns:1fr;}}
  .panel-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1rem 1.25rem;}
  .panel-card .label{font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;margin-bottom:.4rem;}
  .panel-card .name{font-size:.95rem;font-weight:600;color:#e2e8f0;margin-bottom:.3rem;}
  .panel-card .desc{font-size:.8rem;color:#94a3b8;line-height:1.5;}
  .badge-row{display:flex;flex-wrap:wrap;gap:.5rem;margin:.75rem 0 1rem;}
  .badge{display:inline-flex;align-items:center;gap:.4rem;padding:.2rem .75rem;border-radius:999px;font-size:.7rem;font-weight:700;letter-spacing:.08em;}
  .b-stress{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3);}
  .b-elevated{background:rgba(245,158,11,.15);color:#fbbf24;border:1px solid rgba(245,158,11,.3);}
  .b-normal{background:rgba(59,130,246,.15);color:#60a5fa;border:1px solid rgba(59,130,246,.3);}
  .b-lowvol{background:rgba(20,184,166,.15);color:#2dd4bf;border:1px solid rgba(20,184,166,.3);}
  .b-riskon{background:rgba(20,184,166,.15);color:#2dd4bf;border:1px solid rgba(20,184,166,.3);}
  .b-riskoff{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3);}
  .b-mixed{background:rgba(245,158,11,.15);color:#fbbf24;border:1px solid rgba(245,158,11,.3);}
  .b-up{background:rgba(20,184,166,.15);color:#2dd4bf;border:1px solid rgba(20,184,166,.3);}
  .b-down{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3);}
  .b-trans{background:rgba(245,158,11,.15);color:#fbbf24;border:1px solid rgba(245,158,11,.3);}
  table.ref{width:100%;border-collapse:collapse;font-size:.82rem;margin:1rem 0 1.5rem;}
  table.ref th{text-align:left;padding:.5rem .75rem;font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:#64748b;border-bottom:1px solid rgba(255,255,255,.08);}
  table.ref td{padding:.55rem .75rem;border-bottom:1px solid rgba(255,255,255,.05);color:#cbd5e1;vertical-align:top;}
  table.ref tr:last-child td{border-bottom:0;}
  table.ref td:first-child{color:#e2e8f0;font-weight:500;white-space:nowrap;}
  .callout{background:rgba(99,102,241,.08);border-left:3px solid #818cf8;border-radius:0 8px 8px 0;padding:.85rem 1.1rem;margin:1rem 0 1.5rem;font-size:.85rem;color:#a5b4fc;}
  .callout strong{color:#c4b5fd;}
  .step-list{counter-reset:steps;list-style:none;padding:0;margin:1rem 0 1.5rem;}
  .step-list li{counter-increment:steps;display:flex;gap:.85rem;margin-bottom:.85rem;align-items:flex-start;}
  .step-list li::before{content:counter(steps);display:flex;align-items:center;justify-content:center;flex-shrink:0;width:1.6rem;height:1.6rem;border-radius:50%;background:rgba(139,92,246,.2);border:1px solid rgba(139,92,246,.4);color:#c4b5fd;font-size:.75rem;font-weight:700;margin-top:.15rem;}
  .step-list li .text{color:#cbd5e1;font-size:.9rem;line-height:1.6;}
  .step-list li .text strong{color:#e2e8f0;}
  .color-key{display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem;margin:1rem 0 1.5rem;}
  @media(max-width:500px){.color-key{grid-template-columns:1fr;}}
  .ck-item{display:flex;align-items:center;gap:.6rem;padding:.5rem .85rem;border-radius:7px;font-size:.8rem;}
  .ck-teal{background:rgba(20,184,166,.08);border:1px solid rgba(20,184,166,.2);}
  .ck-rose{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);}
  .ck-amber{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);}
  .ck-blue{background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);}
  .ck-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
  .dot-teal{background:#2dd4bf;}
  .dot-rose{background:#f87171;}
  .dot-amber{background:#fbbf24;}
  .dot-blue{background:#60a5fa;}
  .sym-row{display:flex;flex-wrap:wrap;gap:.4rem;margin:.5rem 0 1rem;}
  .sym{padding:.2rem .6rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:5px;font-family:monospace;font-size:.75rem;color:#94a3b8;}
  .workflow-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.25rem 1.5rem;margin:1rem 0 1.5rem;}
  .workflow-box h4{font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin:0 0 .85rem;}
  .tip{background:rgba(20,184,166,.06);border:1px solid rgba(20,184,166,.18);border-radius:8px;padding:.75rem 1rem;margin:.75rem 0 1.25rem;font-size:.83rem;color:#5eead4;}
  .tip strong{color:#2dd4bf;}
  .warn{background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.18);border-radius:8px;padding:.75rem 1rem;margin:.75rem 0 1.25rem;font-size:.83rem;color:#fcd34d;}
  .warn strong{color:#fbbf24;}
</style>

<div class="guide">

  <h1 class="page">Regime Lab — User Guide</h1>
  <p class="sub">Market Floor · ADA AI Labs · Macro &amp; Volatility Workbench</p>

  <div class="intro-box">
    <p>Regime Lab is a six-panel macro and volatility dashboard that frames the backdrop a senior portfolio manager sizes into. It synthesises the volatility complex, cross-asset sentiment, tail-risk signals, the rates curve, and trend structure across your core watchlist into a single, scannable snapshot — updated on demand.</p>
  </div>


  <!-- ═══════════════════ NAVIGATION ═══════════════════ -->
  <h2 class="sec" id="navigation">Getting to Regime Lab</h2>
  <ol class="step-list">
    <li><span class="text">Open the <strong>Market Floor</strong> system from the sidebar or the Applications launcher.</span></li>
    <li><span class="text">Click the <strong>Regime Lab</strong> tab in the horizontal tab bar at the top of the page.</span></li>
    <li><span class="text">The dashboard loads immediately. A data-fetch stamp at the top right shows the time of the last successful data pull and how many seconds ago it occurred.</span></li>
    <li><span class="text">Click the <strong>↺ Refresh</strong> button any time to re-fetch live quotes and rebuild the 1-year history for all calculations.</span></li>
  </ol>

  <div class="tip"><strong>Deep-link:</strong> Navigate directly to Regime Lab with <code>?tab=regime</code> appended to the Market Floor URL.</div>


  <!-- ═══════════════════ PANEL MAP ═══════════════════ -->
  <h2 class="sec" id="layout">Dashboard Layout — Six Panels</h2>
  <p>The dashboard is arranged in three rows. Each panel is independent and updates from the same data fetch.</p>

  <div class="panel-grid">
    <div class="panel-card">
      <div class="label">Row 1 · Left</div>
      <div class="name">① Volatility Regime Radar</div>
      <div class="desc">VIX term structure, VVIX, regime classification (STRESS / ELEVATED / NORMAL / LOW VOL), and a contextual trading playbook.</div>
    </div>
    <div class="panel-card">
      <div class="label">Row 1 · Right</div>
      <div class="name">② Vol Risk Premium</div>
      <div class="desc">Implied vol minus realised vol. Tells you whether options are rich (sell premium) or cheap (own vol).</div>
    </div>
    <div class="panel-card">
      <div class="label">Row 2 · Left</div>
      <div class="name">③ Cross-Asset Risk</div>
      <div class="desc">7-asset risk-on / risk-off sentiment tape synthesised into a single RISK-ON, RISK-OFF, or MIXED badge.</div>
    </div>
    <div class="panel-card">
      <div class="label">Row 2 · Centre</div>
      <div class="name">④ Tail Risk &amp; Skew</div>
      <div class="desc">CBOE SKEW index, VVIX, and put/call ratio — the crash-hedging demand gauge.</div>
    </div>
    <div class="panel-card">
      <div class="label">Row 2 · Right</div>
      <div class="name">⑤ Rates &amp; Curve</div>
      <div class="desc">4 Treasury yields (3m, 5y, 10y, 30y) and DXY. Curve status: Steep, Flat, or Inverted.</div>
    </div>
    <div class="panel-card">
      <div class="label">Row 3 · Full Width</div>
      <div class="name">⑥ Trend Regime · Watchlist</div>
      <div class="desc">Price vs 50/200-day MA plus 52-week range position for TSLA, NVDA, SPY, QQQ, AAPL, AMZN, F.</div>
    </div>
  </div>


  <!-- ═══════════════════ PANEL 1 ═══════════════════ -->
  <h2 class="sec" id="vol-regime">① Volatility Regime Radar</h2>
  <p>This is the primary classification panel. It determines the overall volatility regime which drives the Playbook callout at the bottom of the panel.</p>

  <h3 class="panel-title">VIX Term Bars</h3>
  <p>Three horizontal gradient bars display the absolute level of each VIX tenor:</p>
  <table class="ref">
    <tr><th>Ticker</th><th>What it measures</th></tr>
    <tr><td>VIX9D</td><td>9-day implied vol — the very near-term options market's fear gauge</td></tr>
    <tr><td>VIX</td><td>30-day implied vol — the canonical "fear index" for S&amp;P 500</td></tr>
    <tr><td>VIX3M</td><td>3-month implied vol — the longer-dated vol horizon</td></tr>
  </table>

  <h3 class="panel-title">Regime Classification Badges</h3>
  <p>Regime is determined by VIX level and the VIX3M/VIX ratio:</p>
  <div class="badge-row">
    <span class="badge b-stress">● STRESS</span>
    <span class="badge b-elevated">● ELEVATED</span>
    <span class="badge b-normal">● NORMAL</span>
    <span class="badge b-lowvol">● LOW VOL · CONTANGO</span>
  </div>
  <table class="ref">
    <tr><th>Badge</th><th>Trigger Condition</th></tr>
    <tr><td>STRESS</td><td>VIX ≥ 30 <em>or</em> term structure in backwardation (VIX3M &lt; VIX)</td></tr>
    <tr><td>ELEVATED</td><td>VIX ≥ 20</td></tr>
    <tr><td>NORMAL</td><td>VIX ≥ 15</td></tr>
    <tr><td>LOW VOL · CONTANGO</td><td>VIX &lt; 15 and structure in normal contango</td></tr>
  </table>

  <h3 class="panel-title">Term Structure Grid</h3>
  <table class="ref">
    <tr><th>Metric</th><th>Interpretation</th></tr>
    <tr><td>VIX3M / VIX ratio</td><td>&gt;1.0 = contango (calm); &lt;1.0 = backwardation (stress)</td></tr>
    <tr><td>VVIX</td><td>Vol-of-vol; elevated VVIX (&gt;100) means the VIX itself is unstable</td></tr>
    <tr><td>Structure label</td><td>Contango ↑ or Backwardation ↓</td></tr>
  </table>

  <h3 class="panel-title">The Playbook Callout</h3>
  <p>Below the grid, a highlighted callout gives a regime-specific strategy directive:</p>
  <table class="ref">
    <tr><th>Regime</th><th>Playbook guidance</th></tr>
    <tr><td>STRESS</td><td>De-risk · own convexity · vol spikes self-reinforce</td></tr>
    <tr><td>ELEVATED</td><td>Reduce risk · hedge deltas · avoid naked short-vol</td></tr>
    <tr><td>NORMAL</td><td>Balanced posture · monitor VIX for breakout above 20</td></tr>
    <tr><td>LOW VOL · CONTANGO</td><td>Carry / short-vol tailwind · sell premium</td></tr>
  </table>

  <div class="callout"><strong>Tip:</strong> The playbook is directional guidance, not a signal. Always cross-reference with panels ③ (cross-asset sentiment) and ⑥ (trend regime) before sizing.</div>


  <!-- ═══════════════════ PANEL 2 ═══════════════════ -->
  <h2 class="sec" id="vrp">② Vol Risk Premium (VRP)</h2>
  <p>VRP = Implied Volatility (VIX) − Realised Volatility (20-day). A positive number means implied vol is expensive relative to what the market has actually delivered; a negative number means the market realised more vol than was priced in.</p>

  <table class="ref">
    <tr><th>VRP Reading</th><th>Label</th><th>Implication</th></tr>
    <tr><td>≥ 5</td><td>Rich — sell premium</td><td>Options are expensive; premium-selling strategies (covered calls, cash-secured puts, spreads) have positive carry.</td></tr>
    <tr><td>0 – 5</td><td>Fair value</td><td>Implied and realised vol are roughly aligned. Neither a strong buy nor sell signal for vol.</td></tr>
    <tr><td>≤ 0</td><td>Cheap — own vol</td><td>Realised vol has exceeded implied; buying options or adding convexity is relatively cheap.</td></tr>
  </table>

  <h3 class="panel-title">Supporting Metrics</h3>
  <table class="ref">
    <tr><th>Metric</th><th>Source</th><th>Use</th></tr>
    <tr><td>Implied (VIX)</td><td>CBOE VIX index</td><td>The market's 30-day forward vol forecast</td></tr>
    <tr><td>Realised 20d</td><td>Annualised σ of log-returns, 20-day window</td><td>What SPY actually delivered over the past month</td></tr>
    <tr><td>Realised 10d</td><td>Annualised σ of log-returns, 10-day window</td><td>Most-recent 2-week vol momentum</td></tr>
  </table>

  <div class="callout"><strong>Cross-reference:</strong> VRP is most actionable when paired with Panel ① regime. A <strong>STRESS + cheap VRP</strong> combination is the highest-risk scenario; a <strong>LOW VOL + rich VRP</strong> is the classic premium-selling setup.</div>


  <!-- ═══════════════════ PANEL 3 ═══════════════════ -->
  <h2 class="sec" id="cross-asset">③ Cross-Asset Risk</h2>
  <p>This panel reads the macro sentiment tape by scoring 7 assets split between risk-on and risk-off baskets.</p>

  <h3 class="panel-title">Asset Classification</h3>
  <table class="ref">
    <tr><th>Asset</th><th>Ticker</th><th>Basket</th></tr>
    <tr><td>S&amp;P 500 ETF</td><td>SPY</td><td>Risk-On</td></tr>
    <tr><td>High Yield Credit</td><td>HYG</td><td>Risk-On</td></tr>
    <tr><td>Crude Oil</td><td>USO</td><td>Risk-On</td></tr>
    <tr><td>Bitcoin</td><td>BTC-USD</td><td>Risk-On</td></tr>
    <tr><td>20-Year Treasuries</td><td>TLT</td><td>Risk-Off</td></tr>
    <tr><td>Gold</td><td>GLD</td><td>Risk-Off</td></tr>
    <tr><td>US Dollar Index</td><td>UUP</td><td>Risk-Off</td></tr>
  </table>

  <h3 class="panel-title">Sentiment Badge</h3>
  <div class="badge-row">
    <span class="badge b-riskon">● RISK-ON</span>
    <span class="badge b-riskoff">● RISK-OFF</span>
    <span class="badge b-mixed">● MIXED</span>
  </div>
  <p>Each asset's 1-day % change is normalised and scored. Risk-on assets moving up <em>and</em> risk-off assets moving down = RISK-ON. The inverse = RISK-OFF. Divergent signals = MIXED.</p>

  <div class="tip"><strong>Context:</strong> MIXED readings are common during macro transitions. Watch HYG (credit) and TLT (rates) — when they diverge from SPY, a regime shift is often in progress.</div>


  <!-- ═══════════════════ PANEL 4 ═══════════════════ -->
  <h2 class="sec" id="tail-risk">④ Tail Risk &amp; Skew</h2>
  <p>This panel measures the market's demand for crash protection, independent of overall vol level.</p>

  <h3 class="panel-title">CBOE SKEW Index</h3>
  <p>SKEW measures the implied probability of outlier moves (2–3 standard deviation events) derived from S&amp;P 500 options. It is distinct from VIX — VIX measures average vol; SKEW measures tail demand specifically.</p>
  <table class="ref">
    <tr><th>SKEW Level</th><th>Reading</th><th>Implication</th></tr>
    <tr><td>&gt; 145</td><td>High tail demand</td><td>Institutions are paying up for crash protection; smart money sees downside risk</td></tr>
    <tr><td>135 – 145</td><td>Elevated</td><td>Tail hedging is active; watch for potential macro catalyst</td></tr>
    <tr><td>&lt; 125</td><td>Complacent</td><td>Little demand for tail protection; market is not pricing in fat-tail risk</td></tr>
  </table>

  <h3 class="panel-title">Supporting Metrics</h3>
  <table class="ref">
    <tr><th>Metric</th><th>Interpretation</th></tr>
    <tr><td>VVIX</td><td>&gt;100 = crisis-level uncertainty in the VIX itself (vol-of-vol is spiking)</td></tr>
    <tr><td>Put/Call Ratio</td><td>≥ 1.0 = bearish hedging dominant; &lt; 0.7 = complacency / greedy positioning</td></tr>
    <tr><td>VIX (spot)</td><td>Context check for the SKEW reading; high SKEW + low VIX = stealth hedging</td></tr>
  </table>

  <div class="warn"><strong>Key insight:</strong> High SKEW combined with low VIX is a stealth-hedging signal — institutions are quietly buying crash protection without bidding up near-term vol. This is often a precursor to a volatility event.</div>


  <!-- ═══════════════════ PANEL 5 ═══════════════════ -->
  <h2 class="sec" id="rates">⑤ Rates &amp; Curve</h2>
  <p>The rates panel tracks the US Treasury yield curve and the US Dollar. Curve shape is one of the most reliable long-lead macro indicators.</p>

  <h3 class="panel-title">Curve Status Badge</h3>
  <div class="badge-row">
    <span class="badge b-lowvol">● Steep</span>
    <span class="badge b-elevated">● Flat</span>
    <span class="badge b-stress">● Inverted</span>
  </div>
  <p>Status is derived from the <strong>10y − 3m slope</strong> (in basis points):</p>
  <table class="ref">
    <tr><th>Status</th><th>10y − 3m Slope</th><th>Macro signal</th></tr>
    <tr><td>Steep</td><td>Positive / widening</td><td>Growth expectations rising; risk-on backdrop typically supportive</td></tr>
    <tr><td>Flat</td><td>Near zero</td><td>Uncertainty; often precedes inversion or inflection</td></tr>
    <tr><td>Inverted</td><td>Negative (3m &gt; 10y)</td><td>Historically precedes recession; tightening financial conditions</td></tr>
  </table>

  <h3 class="panel-title">Yield Tenors Tracked</h3>
  <div class="sym-row">
    <span class="sym">^IRX — 3-Month</span>
    <span class="sym">^FVX — 5-Year</span>
    <span class="sym">^TNX — 10-Year</span>
    <span class="sym">^TYX — 30-Year</span>
    <span class="sym">DX-Y.NYB — DXY</span>
  </div>

  <div class="callout"><strong>Why DXY matters:</strong> A strengthening dollar (DXY rising) typically tightens global liquidity and weighs on risk assets, commodities, and EM equities. Cross-reference with Panel ③ for confirmation.</div>


  <!-- ═══════════════════ PANEL 6 ═══════════════════ -->
  <h2 class="sec" id="trend-regime">⑥ Trend Regime · Watchlist</h2>
  <p>The full-width bottom panel classifies each watchlist symbol into a trend regime using moving average crossovers and 52-week range position.</p>

  <h3 class="panel-title">Watchlist Symbols</h3>
  <div class="sym-row">
    <span class="sym">TSLA</span>
    <span class="sym">NVDA</span>
    <span class="sym">SPY</span>
    <span class="sym">QQQ</span>
    <span class="sym">AAPL</span>
    <span class="sym">AMZN</span>
    <span class="sym">F</span>
  </div>

  <h3 class="panel-title">Table Columns</h3>
  <table class="ref">
    <tr><th>Column</th><th>What it shows</th></tr>
    <tr><td>Last</td><td>Most recent price (live quote or prior close)</td></tr>
    <tr><td>50d MA</td><td>50-day simple moving average. <span style="color:#2dd4bf">Teal</span> = price is above; <span style="color:#f87171">Rose</span> = price is below.</td></tr>
    <tr><td>200d MA</td><td>200-day simple moving average. Same colour coding as 50d.</td></tr>
    <tr><td>52-wk Range</td><td>Visual bar showing where the current price sits within the 52-week high/low range. The amber tick marks the current position.</td></tr>
    <tr><td>Regime</td><td>Trend classification label (see below).</td></tr>
  </table>

  <h3 class="panel-title">Trend Regime Labels</h3>
  <div class="badge-row">
    <span class="badge b-up">● Uptrend</span>
    <span class="badge b-down">● Downtrend</span>
    <span class="badge b-trans">● Transition</span>
  </div>
  <table class="ref">
    <tr><th>Label</th><th>Condition</th><th>Implication</th></tr>
    <tr><td>Uptrend</td><td>Last &gt; 50d MA <em>and</em> 50d MA &gt; 200d MA</td><td>Full bullish alignment — trend following has positive carry</td></tr>
    <tr><td>Downtrend</td><td>Last &lt; 50d MA <em>and</em> 50d MA &lt; 200d MA</td><td>Full bearish alignment — avoid long entries; short setups valid</td></tr>
    <tr><td>Transition</td><td>Mixed — some conditions met, not all</td><td>Regime is changing; size cautiously, wait for confirmation</td></tr>
  </table>

  <div class="tip"><strong>Reading the 52-week bar:</strong> A price sitting in the upper quarter of its 52-week range in an Uptrend regime is a high-conviction setup. A price near 52-week lows in a Downtrend signals continuation risk.</div>


  <!-- ═══════════════════ DATA & SYMBOLS ═══════════════════ -->
  <h2 class="sec" id="data">Data Sources</h2>
  <p>All data is fetched from the <code>/api/market</code> endpoint, which queries market data providers. Two fetch types are used:</p>
  <table class="ref">
    <tr><th>Fetch Type</th><th>Symbols</th><th>Used for</th></tr>
    <tr><td>Live Quotes</td><td>^VIX9D, ^VIX, ^VIX3M, ^VVIX, ^SKEW, ^PCALL, ^IRX, ^FVX, ^TNX, ^TYX, DX-Y.NYB, SPY, TLT, GLD, UUP, HYG, USO, BTC-USD</td><td>All 6 panels (real-time levels)</td></tr>
    <tr><td>1-Year History</td><td>TSLA, NVDA, SPY, QQQ, AAPL, AMZN, F</td><td>Panel ⑥ 50d/200d MA and 52-wk range; Panel ② realised vol</td></tr>
  </table>

  <div class="warn"><strong>Note on realised vol calculations:</strong> The 20-day and 10-day realised vol figures in Panel ② are derived from 1-year SPY closing prices fetched at load time. They update each time you click Refresh — they are <em>not</em> streaming values.</div>


  <!-- ═══════════════════ COLOR KEY ═══════════════════ -->
  <h2 class="sec" id="colors">Color Key</h2>
  <div class="color-key">
    <div class="ck-item ck-teal"><div class="ck-dot dot-teal"></div><span style="color:#2dd4bf;font-size:.82rem;font-weight:600;">Teal</span><span style="color:#94a3b8;font-size:.8rem;margin-left:.25rem;">— Bullish / calm / contango / above MA</span></div>
    <div class="ck-item ck-rose"><div class="ck-dot dot-rose"></div><span style="color:#f87171;font-size:.82rem;font-weight:600;">Rose</span><span style="color:#94a3b8;font-size:.8rem;margin-left:.25rem;">— Bearish / stress / backwardation / below MA</span></div>
    <div class="ck-item ck-amber"><div class="ck-dot dot-amber"></div><span style="color:#fbbf24;font-size:.82rem;font-weight:600;">Amber</span><span style="color:#94a3b8;font-size:.8rem;margin-left:.25rem;">— Caution / elevated / transitional / mixed</span></div>
    <div class="ck-item ck-blue"><div class="ck-dot dot-blue"></div><span style="color:#60a5fa;font-size:.82rem;font-weight:600;">Blue</span><span style="color:#94a3b8;font-size:.8rem;margin-left:.25rem;">— Neutral / normal / fair value</span></div>
  </div>


  <!-- ═══════════════════ WORKFLOW ═══════════════════ -->
  <h2 class="sec" id="workflow">Pre-Session Workflow</h2>
  <p>A recommended order for reading Regime Lab before a trading session:</p>

  <div class="workflow-box">
    <h4>Morning Regime Read — 5 minutes</h4>
    <ol class="step-list">
      <li><span class="text"><strong>Refresh</strong> the dashboard to pull fresh quotes and recalculate realised vol.</span></li>
      <li><span class="text">Read the <strong>Volatility Regime badge</strong> (Panel ①). This sets the top-level context: is it a risk-taking environment or a de-risk one? Note the Playbook callout.</span></li>
      <li><span class="text">Check <strong>Vol Risk Premium</strong> (Panel ②). Is premium rich (sell) or cheap (own)? A &gt;5 VRP + LOW VOL regime = ideal short-vol setup.</span></li>
      <li><span class="text">Scan <strong>Cross-Asset Risk</strong> (Panel ③). RISK-ON or RISK-OFF? MIXED signals mean caution — macro is not in consensus.</span></li>
      <li><span class="text">Glance at <strong>Tail Risk &amp; Skew</strong> (Panel ④). High SKEW (&gt;145) + low VIX = stealth hedging. Watch for a vol event even if the surface looks calm.</span></li>
      <li><span class="text">Check the <strong>Curve Status</strong> (Panel ⑤). Inverted curve = risk-off macro backdrop regardless of equity price action.</span></li>
      <li><span class="text">Run down the <strong>Trend Regime table</strong> (Panel ⑥). Note which of your names are in Uptrend vs Downtrend vs Transition — size accordingly.</span></li>
    </ol>
  </div>

  <div class="callout"><strong>Synthesis rule:</strong> If Panels ①, ③, and ⑤ all point in the same direction (all risk-on or all risk-off), treat it as a high-conviction macro signal. Divergence between any two panels warrants reduced sizing and more selective entry.</div>

</div>
`,
  },
};

export const SEED_WIKI_CARDS_RECOVERED: SeedWikiCard[] = [
  {
    slug: "call-wall-put-wall-system-guide",
    title: "Call Wall / Put Wall System Guide",
    banner: "quant",
    desc: "Gamma exposure dashboard: call wall, put wall, S/R ladder, GEX heatmap, and trading workflow for TSLA, NVDA, SPY, QQQ, AAPL.",
    stats: ["5 tickers", "GEX heatmap", "S/R ladder"],
  },
  {
    slug: "deep-research-sessions-guide",
    title: "Deep Research Sessions Guide",
    banner: "research",
    desc: "How to run Institutional Research sessions: source types, de-duplication logic, feed filters, and the recommended multi-angle research workflow.",
    stats: ["10 sections", "6 sources", "De-dup logic"],
  },
  {
    slug: "portfolio-user-guide",
    title: "Portfolio User Guide",
    banner: "research",
    desc: "Master the 6-panel portfolio workbench: gross/net/leverage, Black-Scholes Greeks, sector exposure, parametric VaR, spot/vol/rate stress testing, and full positions blotter.",
    stats: ["6 panels", "22 positions", "3 overlays"],
  },
  {
    slug: "options-flow-user-guide",
    title: "Options Flow User Guide",
    banner: "research",
    desc: "Master the six-panel options workbench: premium flow direction, cross-ticker sentiment, dealer GEX, IV term structure, sweep/block detection, and expiry concentration.",
    stats: ["6 panels", "5 tickers", "Sweep detect"],
  },
  {
    slug: "regime-lab-user-guide",
    title: "Regime Lab User Guide",
    banner: "research",
    desc: "Master the six-panel macro dashboard: volatility regime radar, vol risk premium, cross-asset risk, tail risk & skew, rates & curve, and trend regime watchlist.",
    stats: ["6 panels", "18 symbols", "Live regime"],
  },
];
