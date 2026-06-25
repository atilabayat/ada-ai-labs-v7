/**
 * Creates the Portfolio User Guide wiki as a System User Guide.
 * Run: node scripts/add-portfolio-guide.mjs
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const htmlContent = `
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
`;

const tocItems = [
  { anchorId: "navigation", name: "Getting to Portfolio",                sub: false, sortOrder: 0  },
  { anchorId: "book",       name: "Book Overview",                       sub: false, sortOrder: 1  },
  { anchorId: "layout",     name: "Dashboard Layout — 6 Panels",         sub: false, sortOrder: 2  },
  { anchorId: "exposure",   name: "① Exposure Summary",                  sub: false, sortOrder: 3  },
  { anchorId: "greeks",     name: "② Portfolio Greeks",                  sub: false, sortOrder: 4  },
  { anchorId: "sectors",    name: "③ Sector Exposure",                   sub: false, sortOrder: 5  },
  { anchorId: "var",        name: "④ Value at Risk (VaR)",               sub: false, sortOrder: 6  },
  { anchorId: "scenario",   name: "⑤ Scenario & Stress Testing",         sub: false, sortOrder: 7  },
  { anchorId: "blotter",    name: "⑥ Positions Blotter",                 sub: false, sortOrder: 8  },
  { anchorId: "betas",      name: "Beta Reference Dictionary",           sub: false, sortOrder: 9  },
  { anchorId: "data",       name: "Data Sources & Refresh",              sub: false, sortOrder: 10 },
  { anchorId: "workflow",   name: "Daily Workflow",                      sub: false, sortOrder: 11 },
  { anchorId: "roadmap",    name: "Roadmap — Upcoming Features",         sub: false, sortOrder: 12 },
  { anchorId: "glossary",   name: "Glossary",                            sub: false, sortOrder: 13 },
];

async function main() {
  const slug = "portfolio-user-guide";

  const existing = await prisma.wiki.findUnique({ where: { slug } });
  if (existing) {
    await prisma.wiki.update({
      where: { slug },
      data: {
        title:    "Portfolio — User Guide",
        banner:   "system",
        env:      "live",
        content:  htmlContent,
        lede:     "A complete walkthrough of the Portfolio workbench — exposure summary, portfolio Greeks, sector concentration, parametric VaR/ES, scenario & stress testing, and the positions blotter.",
        cardDesc: "Master the 6-panel portfolio workbench: gross/net/leverage, Black-Scholes Greeks, sector exposure, parametric VaR, spot/vol/rate stress testing, and full positions blotter.",
        cardStat1: "6 panels",
        cardStat2: "22 positions",
        cardStat3: "3 overlays",
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
      title:      "Portfolio — User Guide",
      titleEm:    null,
      lede:       "A complete walkthrough of the Portfolio workbench — exposure summary, portfolio Greeks, sector concentration, parametric VaR/ES, scenario & stress testing, and the positions blotter.",
      banner:     "system",
      crumb:      "Market Floor / Wikis / Portfolio",
      pages:      14,
      updated:    new Date().toISOString().slice(0, 10),
      version:    "1.0.0",
      visibility: "internal",
      env:        "live",
      content:    htmlContent,
      cardDesc:   "Master the 6-panel portfolio workbench: gross/net/leverage, Black-Scholes Greeks, sector exposure, parametric VaR, spot/vol/rate stress testing, and full positions blotter.",
      cardStat1:  "6 panels",
      cardStat2:  "22 positions",
      cardStat3:  "3 overlays",
      sortOrder,
      toc: { create: tocItems },
    },
  });

  console.log("✓ Created wiki:", slug);
  console.log("✓ Banner: system | Env: live");
  console.log("✓ TOC items:", tocItems.length);
  console.log("\n✅  Portfolio User Guide is live in System User Guides.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
