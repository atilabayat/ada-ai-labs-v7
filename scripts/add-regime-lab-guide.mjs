/**
 * Creates the Regime Lab User Guide wiki and tags it as a System User Guide.
 * Run: node scripts/add-regime-lab-guide.mjs
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ── HTML body ─────────────────────────────────────────────────────────────────

const htmlContent = `
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
`;

// ── TOC items ─────────────────────────────────────────────────────────────────

const tocItems = [
  { anchorId: "navigation",    name: "Getting to Regime Lab",      sub: false, sortOrder: 0 },
  { anchorId: "layout",        name: "Dashboard Layout — 6 Panels", sub: false, sortOrder: 1 },
  { anchorId: "vol-regime",    name: "① Volatility Regime Radar",  sub: false, sortOrder: 2 },
  { anchorId: "vrp",           name: "② Vol Risk Premium",          sub: false, sortOrder: 3 },
  { anchorId: "cross-asset",   name: "③ Cross-Asset Risk",          sub: false, sortOrder: 4 },
  { anchorId: "tail-risk",     name: "④ Tail Risk & Skew",          sub: false, sortOrder: 5 },
  { anchorId: "rates",         name: "⑤ Rates & Curve",             sub: false, sortOrder: 6 },
  { anchorId: "trend-regime",  name: "⑥ Trend Regime Watchlist",   sub: false, sortOrder: 7 },
  { anchorId: "data",          name: "Data Sources",                sub: false, sortOrder: 8 },
  { anchorId: "colors",        name: "Color Key",                   sub: false, sortOrder: 9 },
  { anchorId: "workflow",      name: "Pre-Session Workflow",        sub: false, sortOrder: 10 },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const slug = "regime-lab-user-guide";

  // Check for existing entry
  const existing = await prisma.wiki.findUnique({ where: { slug } });
  if (existing) {
    await prisma.wiki.update({
      where: { slug },
      data: {
        title:   "Regime Lab — User Guide",
        banner:  "system",
        env:     "live",
        content: htmlContent,
        lede:    "A complete walkthrough of the Regime Lab macro and volatility workbench — vol regime classification, risk premium, cross-asset sentiment, tail risk, rates curve, and trend regime across your watchlist.",
        cardDesc: "Master the six-panel macro dashboard: volatility regime radar, vol risk premium, cross-asset risk, tail risk & skew, rates & curve, and trend regime watchlist.",
        cardStat1: "6 panels",
        cardStat2: "18 symbols",
        cardStat3: "Live regime",
        updated: new Date().toISOString().slice(0, 10),
      },
    });
    // Rebuild TOC
    await prisma.wikiTocItem.deleteMany({ where: { wikiSlug: slug } });
    await prisma.wikiTocItem.createMany({ data: tocItems.map((t) => ({ ...t, wikiSlug: slug })) });
    console.log("✓ Updated existing wiki:", slug);
    return;
  }

  const sortOrder = (await prisma.wiki.count()) + 1;

  await prisma.wiki.create({
    data: {
      slug,
      title:      "Regime Lab — User Guide",
      titleEm:    null,
      lede:       "A complete walkthrough of the Regime Lab macro and volatility workbench — vol regime classification, risk premium, cross-asset sentiment, tail risk, rates curve, and trend regime across your watchlist.",
      banner:     "system",
      crumb:      "Market Floor / Wikis / Regime Lab",
      pages:      11,
      updated:    new Date().toISOString().slice(0, 10),
      version:    "1.0.0",
      visibility: "internal",
      env:        "live",
      content:    htmlContent,
      cardDesc:   "Master the six-panel macro dashboard: volatility regime radar, vol risk premium, cross-asset risk, tail risk & skew, rates & curve, and trend regime watchlist.",
      cardStat1:  "6 panels",
      cardStat2:  "18 symbols",
      cardStat3:  "Live regime",
      sortOrder,
      toc: {
        create: tocItems.map((t) => ({ ...t, wikiSlug: undefined, ...t })),
      },
    },
  });

  console.log("✓ Created wiki:", slug);
  console.log("✓ Banner: system | Env: live");
  console.log("✓ TOC items:", tocItems.length);
  console.log("\n✅  Regime Lab User Guide is live in System User Guides.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
