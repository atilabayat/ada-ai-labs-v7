/**
 * Adds the "Gamma Exposure Heatmaps User Guide" to the System User Guides area
 * (/wikis?section=system). System guides are wikis with banner="system".
 *
 * Written for small- and mid-tier fund end users: how to read the heatmap and
 * fold it into a real trading/risk workflow. Matches the existing guide pattern
 * (Call Wall / Put Wall, Options Flow, Regime Lab).
 *
 * Accurate to the deployed /gex-heatmap page: data is Yahoo Finance options +
 * Black-Scholes gamma (via /api/market?type=gexmap), 8 tickers, nearest 5
 * expiries, strikes within +/-100 of spot.
 *
 * Run: node scripts/add-gex-heatmap-user-guide.mjs   (safe to re-run)
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SLUG = "gamma-exposure-heatmaps-user-guide";

const SOURCES = [
  { title: "Yahoo Finance", meta: "Options chains, open interest & spot", sortOrder: 0 },
  { title: "ADA AI Labs",   meta: "Black-Scholes gamma + Net GEX engine",  sortOrder: 1 },
  { title: "CBOE",          meta: "Index options / SPX gamma reference",   sortOrder: 2 },
];

const TOC = [
  { anchorId: "overview",    name: "Overview",                       sub: false, sortOrder: 0 },
  { anchorId: "why",         name: "Why It Matters for a Fund Desk",  sub: false, sortOrder: 1 },
  { anchorId: "navigation",  name: "Getting to the Heatmap",          sub: false, sortOrder: 2 },
  { anchorId: "universe",    name: "The Ticker Universe",             sub: false, sortOrder: 3 },
  { anchorId: "reading",     name: "Reading the Heatmap",             sub: false, sortOrder: 4 },
  { anchorId: "metrics",     name: "The Four Summary Metrics",        sub: false, sortOrder: 5 },
  { anchorId: "method",      name: "Data & Method",                   sub: false, sortOrder: 6 },
  { anchorId: "workflows",   name: "Fund Workflows",                  sub: false, sortOrder: 7 },
  { anchorId: "regime",      name: "Trading the Gamma Regime",        sub: true,  sortOrder: 8 },
  { anchorId: "hedging",     name: "Hedging & Overlay Decisions",     sub: true,  sortOrder: 9 },
  { anchorId: "expiry",      name: "Expiry & OPEX Planning",          sub: true,  sortOrder: 10 },
  { anchorId: "limits",      name: "Limitations & Best Practice",     sub: false, sortOrder: 11 },
  { anchorId: "cheatsheet",  name: "Quick-Reference Cheat Sheet",     sub: false, sortOrder: 12 },
];

const RELATED = [
  { name: "Call Wall / Put Wall System Guide", ic: "BarChart2", sortOrder: 0 },
  { name: "Options Flow User Guide",           ic: "Activity",  sortOrder: 1 },
  { name: "Regime Lab User Guide",             ic: "Briefcase", sortOrder: 2 },
];

const PAGELIST = [
  { pageId: "main", name: "Gamma Exposure Heatmaps", current: true, sortOrder: 0 },
];

// HTML body — system-guide conventions: wiki-banner-hero(data-c), wiki-crumb,
// wiki-h1(+em), wiki-lede, wiki-meta-row, nav.toc-rail, h2[id], callout /
// callout insight, ol/ul, a.ref for internal links, wiki-table-wrap+wiki-table.
// NOTE: no backticks and no "$" + "{" sequences in this string (template literal).
const CONTENT = `<div class="wiki-banner-hero" data-c="quant"></div>
<div class="wiki-crumb">
  <span>Quant Lab</span><span class="sep">/</span>
  <span>Wikis</span><span class="sep">/</span>
  <span class="ent">Gamma Exposure Heatmaps</span>
</div>
<h1 class="wiki-h1">Gamma Exposure <em>Heatmaps.</em></h1>
<div class="wiki-lede">A practical guide for small- and mid-tier fund desks: how to read the per-strike, per-expiry Net GEX heatmap and fold dealer-gamma positioning into entry timing, risk sizing, and hedging decisions &mdash; without a dedicated volatility team.</div>
<div class="wiki-meta-row"><span class="mr"><span class="v">June 2026</span></span><span class="mr"><span class="v">v1.0</span></span><span class="mr"><span class="v">Internal</span></span></div>

<nav class="toc-rail">
  <a class="toc" href="#overview">Overview</a>
  <a class="toc" href="#why">Why It Matters for a Fund Desk</a>
  <a class="toc" href="#navigation">Getting to the Heatmap</a>
  <a class="toc" href="#universe">The Ticker Universe</a>
  <a class="toc" href="#reading">Reading the Heatmap</a>
  <a class="toc" href="#metrics">The Four Summary Metrics</a>
  <a class="toc" href="#method">Data &amp; Method</a>
  <a class="toc" href="#workflows">Fund Workflows</a>
  <a class="toc" href="#limits">Limitations &amp; Best Practice</a>
  <a class="toc" href="#cheatsheet">Quick-Reference Cheat Sheet</a>
</nav>

<h2 id="overview">Overview</h2>
<p>The Gamma Exposure (GEX) Heatmap shows <strong>where options dealers are positioned in gamma</strong>, strike by strike and expiry by expiry, for a chosen underlying. Dealers who are short options must delta-hedge continuously; that mechanical hedging buys dips and sells rips when dealers are <em>long gamma</em>, and does the opposite &mdash; selling weakness, buying strength &mdash; when they are <em>short gamma</em>. The heatmap turns that invisible positioning into a colour-coded grid you can read in seconds.</p>
<div class="callout insight">
  <p><strong>The one-sentence version:</strong> green cells mark price levels that act like magnets and dampeners (dealers stabilise), red cells mark levels where moves can accelerate (dealers amplify), and the yellow row is where the underlying is trading right now.</p>
</div>

<h2 id="why">Why It Matters for a Fund Desk</h2>
<p>Large multi-strategy funds pay six figures a year for dealer-gamma analytics from SpotGamma, Tier1Alpha, or a sell-side desk. A small- or mid-tier fund usually cannot &mdash; yet the same positioning drives the intraday tape it has to trade against. This page gives a desk three things it normally lacks:</p>
<ul>
  <li><strong>A regime read.</strong> Is today a mean-reverting (positive-gamma) tape where fading extremes pays, or a trending (negative-gamma) tape where stops must be wider and momentum wins?</li>
  <li><strong>Structural levels.</strong> The call wall, put wall, and zero-gamma flip are objective, dealer-driven support and resistance &mdash; not drawn-by-hand trendlines.</li>
  <li><strong>A hedging clock.</strong> Knowing when the market is structurally fragile (short gamma below zero-gamma) tells a small book when cheap protection is worth carrying.</li>
</ul>

<h2 id="navigation">Getting to the Heatmap</h2>
<ol>
  <li>Open <strong>Quant Lab</strong> from the sidebar.</li>
  <li>Click <strong>Gamma Exposure Heatmaps</strong>, or navigate to <a class="ref" href="/gex-heatmap">/gex-heatmap</a>.</li>
  <li>The page auto-loads <strong>TSLA</strong> on arrival. Pick any ticker chip to switch.</li>
  <li>Click <strong>&#8635; Refresh</strong> to pull the current session. The timestamp stamp shows how fresh the data is and pulses green when under 90 seconds old.</li>
</ol>

<h2 id="universe">The Ticker Universe</h2>
<p>Eight symbols are wired in, matching the Call Wall / Put Wall system: <strong>TSLA, NVDA, SPY, XSP, SPX, QQQ, AAPL, PLTR</strong>. For a fund, the split matters:</p>
<div class="wiki-table-wrap"><table class="wiki-table">
  <thead><tr><th>Group</th><th>Symbols</th><th>Why a desk watches it</th></tr></thead>
  <tbody>
    <tr><td>Broad index</td><td>SPX, XSP, SPY, QQQ</td><td>Highest notional gamma; the walls are durable and move the whole book's beta. Start here for portfolio-level risk.</td></tr>
    <tr><td>High-beta single names</td><td>TSLA, NVDA, PLTR</td><td>Large, retail-heavy options flow; walls pin hard into expiry and break violently when they fail.</td></tr>
    <tr><td>Mega-cap anchor</td><td>AAPL</td><td>Liquid, lower-vol single name; useful as a control read against the index.</td></tr>
  </tbody>
</table></div>
<div class="callout"><strong>SPX vs SPY vs XSP:</strong> SPX is the full-size index, XSP is the mini (1/10th), SPY is the ETF. SPX/XSP carry the cleanest dealer-gamma signal because they are cash-settled and institutionally hedged. The page routes XSP and SPX to their index option chains automatically.</div>

<h2 id="reading">Reading the Heatmap</h2>
<p>The grid is laid out the way a trader thinks about an option chain:</p>
<ul>
  <li><strong>Rows = strikes</strong>, highest at the top, descending downward.</li>
  <li><strong>Columns = the nearest five expiries</strong>, plus a <strong>Total</strong> column aggregating net gamma across them.</li>
  <li><strong>Cell colour = signed Net GEX.</strong> Teal/green is positive gamma; red is negative gamma. Intensity scales with magnitude, so the boldest cells are the biggest dealer positions.</li>
  <li><strong>The yellow row</strong> is the strike nearest the live underlying price &mdash; your "you are here" marker.</li>
</ul>
<div class="callout insight">
  <p><strong>How to scan it in five seconds:</strong> find the yellow row, then look up and down. A thick band of green above and below spot means price is boxed in (stable). A wall of red just beyond a nearby strike means that level, once crossed, is where the move accelerates.</p>
</div>

<h2 id="metrics">The Four Summary Metrics</h2>
<p>Four chips sit above the grid and update on every Refresh.</p>
<div class="wiki-table-wrap"><table class="wiki-table">
  <thead><tr><th>Metric</th><th>What it is</th><th>How to use it</th></tr></thead>
  <tbody>
    <tr><td>Call Wall</td><td>Strike with the most positive net gamma</td><td>Overhead magnet / resistance. Rallies often stall here in a positive-gamma tape.</td></tr>
    <tr><td>Put Wall</td><td>Strike with the most negative net gamma</td><td>Downside magnet / support. Selloffs often slow into it as dealers buy.</td></tr>
    <tr><td>Zero Gamma</td><td>Strike where cumulative net gamma flips sign</td><td>The regime line. Above it the tape stabilises; below it, it gets fragile. The single most important level on the page.</td></tr>
    <tr><td>Net GEX</td><td>Sum of dollar-gamma across the grid</td><td>Positive &rarr; mean-reverting market. Negative &rarr; trending, gap-prone market.</td></tr>
  </tbody>
</table></div>

<h2 id="method">Data &amp; Method</h2>
<p>Transparency matters when you are sizing risk off a number, so here is exactly how the grid is built:</p>
<ul>
  <li><strong>Source:</strong> live option chains and spot from Yahoo Finance, pulled on demand per ticker.</li>
  <li><strong>Greeks:</strong> gamma is computed per contract with Black-Scholes from the contract's implied volatility, time to expiry, and spot (risk-free rate approximately 4.3 percent). No greeks are taken on faith from the feed.</li>
  <li><strong>Dollar gamma:</strong> per strike-expiry, Net GEX equals gamma times open interest times 100 times spot squared times 0.01 &mdash; dealer dollar-gamma per one-percent move.</li>
  <li><strong>Sign convention:</strong> calls positive, puts negative &mdash; the standard public-data assumption that dealers are short calls and long puts versus retail. This is a <em>convention</em>, not observed dealer inventory.</li>
  <li><strong>Scope:</strong> the nearest five expirations; strikes within roughly +/-100 points of spot to keep the grid legible.</li>
</ul>
<div class="callout"><strong>What this is not:</strong> it is a modelled estimate of dealer positioning from public OI, not a window into any dealer's actual book. Treat it as a high-quality proxy, not ground truth.</div>

<h2 id="workflows">Fund Workflows</h2>
<p>The point of the heatmap is not to admire it &mdash; it is to change a decision. Three workflows a small desk can adopt immediately.</p>

<h3 id="regime">Trading the Gamma Regime</h3>
<ol>
  <li><strong>Read Net GEX and zero-gamma first.</strong> Is spot above or below the zero-gamma strike?</li>
  <li><strong>Positive regime (spot above zero-gamma):</strong> expect range-bound, mean-reverting action between the put wall and call wall. Fade extremes, sell premium, take profit into the walls, keep stops tight.</li>
  <li><strong>Negative regime (spot below zero-gamma):</strong> expect trending, gap-prone action. Widen stops, respect momentum, reduce short-premium exposure, and do not fade strength.</li>
  <li><strong>Size to the regime, not just the signal.</strong> The same chart pattern deserves smaller size and wider stops in a negative-gamma tape.</li>
</ol>
<div class="callout insight"><p><strong>Positive GEX + price near the put wall:</strong> dealers buy as price falls into the wall &mdash; a mechanical support bid. A favourable spot for defined-risk longs.</p></div>
<div class="callout insight"><p><strong>Negative GEX + price crossing zero-gamma to the downside:</strong> dealers amplify the move. Momentum outperforms and mean-reversion fails &mdash; the classic air-pocket setup.</p></div>

<h3 id="hedging">Hedging &amp; Overlay Decisions</h3>
<p>For a book that cannot run a permanent options overlay, the heatmap is a timing tool for <em>when</em> protection is worth its cost:</p>
<ul>
  <li>When the index (SPX/SPY) flips to <strong>negative Net GEX</strong> and spot sits below zero-gamma, the market is structurally fragile &mdash; the highest-value window to carry cheap downside protection on portfolio beta.</li>
  <li>When the index is in a <strong>deep positive-gamma</strong> regime, realised volatility is being suppressed; protection is cheap-feeling but usually unnecessary, and short-premium overlays have a tailwind.</li>
  <li>Use the <strong>put wall</strong> as a natural strike anchor for protective puts &mdash; it is where dealer hedging already concentrates support.</li>
</ul>

<h3 id="expiry">Expiry &amp; OPEX Planning</h3>
<ul>
  <li><strong>Pinning:</strong> into monthly OPEX, large positive-gamma strikes (especially in SPX and the high-beta names) act as pins. Expect price to gravitate toward the nearest heavy green strike on expiry morning.</li>
  <li><strong>Post-OPEX instability:</strong> once that gamma rolls off, the stabilising force disappears. A book that was calm into Friday can trend hard the following week &mdash; check whether the heatmap thins out in the front expiry.</li>
  <li>Use the per-expiry columns to see <em>which</em> expiry carries the gamma, not just the aggregate Total.</li>
</ul>

<h2 id="limits">Limitations &amp; Best Practice</h2>
<ul>
  <li><strong>Convention risk.</strong> The calls-plus / puts-minus sign assumption breaks for names with heavy call-overwriting or unusual dealer positioning. Sanity-check single names against actual flow.</li>
  <li><strong>OI is stale by a day.</strong> Open interest updates overnight; intraday the grid reflects yesterday's positioning plus today's spot/IV. It is a structural map, not a tick-by-tick feed.</li>
  <li><strong>Refresh discipline.</strong> The page does not auto-poll. Click Refresh at the open, mid-session, and before sizing any trade off the levels.</li>
  <li><strong>Cross-reference, never trade in isolation.</strong> Confirm the gamma read against the <a class="ref" href="/quant?view=walls">Call Wall / Put Wall System</a> and live <a class="ref" href="/quant?view=options">Options Flow</a> before acting.</li>
</ul>

<h2 id="cheatsheet">Quick-Reference Cheat Sheet</h2>
<div class="wiki-table-wrap"><table class="wiki-table">
  <thead><tr><th>You see&hellip;</th><th>It means&hellip;</th><th>Desk action</th></tr></thead>
  <tbody>
    <tr><td>Net GEX positive, spot above zero-gamma</td><td>Mean-reverting regime</td><td>Fade extremes, sell premium, target the walls, tight stops</td></tr>
    <tr><td>Net GEX negative, spot below zero-gamma</td><td>Trending / fragile regime</td><td>Respect momentum, widen stops, carry protection, cut short-vol</td></tr>
    <tr><td>Thick green band around the yellow row</td><td>Price boxed in by dealer gamma</td><td>Range-trade between walls; expect compression</td></tr>
    <tr><td>Red wall just beyond a nearby strike</td><td>Acceleration zone if crossed</td><td>Treat that strike as a breakout trigger, not S/R</td></tr>
    <tr><td>Spot pinned to a heavy green strike into OPEX</td><td>Gamma pin</td><td>Expect mean-reversion to the pin; plan for post-OPEX release</td></tr>
  </tbody>
</table></div>
<div class="callout insight"><p><strong>Golden rule for a small desk:</strong> let Net GEX set your style (revert vs trend), let zero-gamma set your bias line, and let the walls set your targets. Everything else is confirmation.</p></div>`;

async function main() {
  const fields = {
    title:      "Gamma Exposure Heatmaps User Guide",
    titleEm:    "User Guide.",
    lede:       "How a small- or mid-tier fund desk reads the Net GEX heatmap and folds dealer-gamma positioning into entry timing, risk sizing, and hedging.",
    banner:     "system",
    crumb:      "Quant Lab / Wikis / Gamma Exposure Heatmaps",
    pages:      1,
    updated:    "June 2026",
    version:    "1.0.0",
    visibility: "internal",
    env:        "live",
    content:    CONTENT,
    cardDesc:   "Read the per-strike, per-expiry Net GEX heatmap and turn dealer-gamma positioning into regime reads, structural levels, and hedging timing — written for small/mid funds.",
    cardStat1:  "8 tickers",
    cardStat2:  "GEX heatmap",
    cardStat3:  "Fund workflows",
  };

  await prisma.wiki.upsert({
    where:  { slug: SLUG },
    update: fields,
    create: { slug: SLUG, sortOrder: 17, ...fields },
  });

  // Replace child rows (idempotent).
  await prisma.wikiSource.deleteMany({ where: { wikiSlug: SLUG } });
  await prisma.wikiTocItem.deleteMany({ where: { wikiSlug: SLUG } });
  await prisma.wikiRelated.deleteMany({ where: { wikiSlug: SLUG } });
  await prisma.wikiPage.deleteMany({ where: { wikiSlug: SLUG } });

  await prisma.wikiSource.createMany({ data: SOURCES.map((s) => ({ ...s, wikiSlug: SLUG })) });
  await prisma.wikiTocItem.createMany({ data: TOC.map((t) => ({ ...t, wikiSlug: SLUG })) });
  await prisma.wikiRelated.createMany({ data: RELATED.map((r) => ({ ...r, wikiSlug: SLUG })) });
  await prisma.wikiPage.createMany({ data: PAGELIST.map((p) => ({ ...p, wikiSlug: SLUG })) });

  const w = await prisma.wiki.findUnique({
    where:   { slug: SLUG },
    include: { sources: true, toc: true, related: true, pageList: true },
  });
  console.log("✓ User Guide added:", w.title);
  console.log("  slug:      ", w.slug);
  console.log("  banner:    ", w.banner, "(→ shows in System User Guides)");
  console.log("  env:       ", w.env, "| visibility:", w.visibility, "| sortOrder:", w.sortOrder);
  console.log("  content:   ", w.content.length, "bytes");
  console.log("  toc/sources/related/pages:", w.toc.length, "/", w.sources.length, "/", w.related.length, "/", w.pageList.length);
  console.log("\n✅  Live at /wikis/" + SLUG + "  ·  listed under /wikis?section=system");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
