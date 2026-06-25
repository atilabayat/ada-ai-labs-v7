/**
 * Creates the Options Flow User Guide wiki and tags it as a System User Guide.
 * Run: node scripts/add-options-flow-guide.mjs
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const htmlContent = `
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
`;

const tocItems = [
  { anchorId: "navigation",    name: "Getting to Options Flow",            sub: false, sortOrder: 0  },
  { anchorId: "tickers",       name: "Available Tickers",                  sub: false, sortOrder: 1  },
  { anchorId: "layout",        name: "Dashboard Layout — 6 Panels",        sub: false, sortOrder: 2  },
  { anchorId: "net-flow",      name: "① Net Premium Flow",                 sub: false, sortOrder: 3  },
  { anchorId: "cross-ticker",  name: "② Cross-Ticker Sentiment Matrix",    sub: false, sortOrder: 4  },
  { anchorId: "gamma",         name: "③ Dealer Gamma Profile",             sub: false, sortOrder: 5  },
  { anchorId: "term-structure",name: "④ IV Term Structure",                sub: false, sortOrder: 6  },
  { anchorId: "unusual",       name: "⑤ Unusual Activity",                 sub: false, sortOrder: 7  },
  { anchorId: "oi-walls",      name: "⑥ Expiry Concentration & OI Walls",  sub: false, sortOrder: 8  },
  { anchorId: "fields",        name: "Contract Data Fields",               sub: false, sortOrder: 9  },
  { anchorId: "colors",        name: "Color Key",                          sub: false, sortOrder: 10 },
  { anchorId: "glossary",      name: "Glossary",                           sub: false, sortOrder: 11 },
  { anchorId: "workflow",      name: "Pre-Trade Workflow",                 sub: false, sortOrder: 12 },
];

async function main() {
  const slug = "options-flow-user-guide";

  const existing = await prisma.wiki.findUnique({ where: { slug } });
  if (existing) {
    await prisma.wiki.update({
      where: { slug },
      data: {
        title:    "Options Flow — User Guide",
        banner:   "system",
        env:      "live",
        content:  htmlContent,
        lede:     "A complete walkthrough of the Options Flow workbench — net premium flow, cross-ticker sentiment, dealer gamma profile, IV term structure, unusual activity detection, and OI wall analysis.",
        cardDesc: "Master the six-panel options workbench: premium flow direction, cross-ticker sentiment, dealer GEX, IV term structure, sweep/block detection, and expiry concentration.",
        cardStat1: "6 panels",
        cardStat2: "5 tickers",
        cardStat3: "Sweep detect",
        updated:  new Date().toISOString().slice(0, 10),
      },
    });
    await prisma.wikiTocItem.deleteMany({ where: { wikiSlug: slug } });
    await prisma.wikiTocItem.createMany({ data: tocItems.map((t) => ({ ...t, wikiSlug: slug })) });
    console.log("✓ Updated existing wiki:", slug);
    return;
  }

  const sortOrder = (await prisma.wiki.count()) + 1;

  await prisma.wiki.create({
    data: {
      slug,
      title:      "Options Flow — User Guide",
      titleEm:    null,
      lede:       "A complete walkthrough of the Options Flow workbench — net premium flow, cross-ticker sentiment, dealer gamma profile, IV term structure, unusual activity detection, and OI wall analysis.",
      banner:     "system",
      crumb:      "Market Floor / Wikis / Options Flow",
      pages:      13,
      updated:    new Date().toISOString().slice(0, 10),
      version:    "1.0.0",
      visibility: "internal",
      env:        "live",
      content:    htmlContent,
      cardDesc:   "Master the six-panel options workbench: premium flow direction, cross-ticker sentiment, dealer GEX, IV term structure, sweep/block detection, and expiry concentration.",
      cardStat1:  "6 panels",
      cardStat2:  "5 tickers",
      cardStat3:  "Sweep detect",
      sortOrder,
      toc: { create: tocItems },
    },
  });

  console.log("✓ Created wiki:", slug);
  console.log("✓ Banner: system | Env: live");
  console.log("✓ TOC items:", tocItems.length);
  console.log("\n✅  Options Flow User Guide is live in System User Guides.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
