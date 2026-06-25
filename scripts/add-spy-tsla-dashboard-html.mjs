/**
 * Registers the Unified SPY + TSLA Dashboard as a "dashboard" type App.
 * Run: node scripts/add-spy-tsla-dashboard-html.mjs
 * Safe to re-run — uses upsert.
 *
 * v2: replaced CDN React/Babel/Tailwind with self-contained vanilla HTML/CSS/JS.
 * Zero external dependencies. Demo data from original DEMO_PAYLOADS.
 * 600ms simulated load, then full dashboard renders.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>SPY + TSLA Unified Dashboard</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#090c13;color:#f4f4f5;min-height:100vh;padding:20px;overflow-y:auto}
.w{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:18px}
.card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:20px;box-shadow:0 20px 40px rgba(0,0,0,.2)}
.cd{background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:14px}
.ci{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.lbl{font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:#71717a}
.pill{display:inline-flex;border-radius:999px;padding:3px 12px;font-size:11px;font-weight:500;border:1px solid}
.sky-p{color:#7dd3fc;background:rgba(125,211,252,.1);border-color:rgba(125,211,252,.2)}
.em-p{color:#6ee7b7;background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.2)}
.am-p{color:#fcd34d;background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.2)}
.ro-p{color:#fda4af;background:rgba(251,113,133,.1);border-color:rgba(251,113,133,.2)}
.zn-p{color:#a1a1aa;background:rgba(0,0,0,.2);border-color:rgba(255,255,255,.1)}
.dm-p{color:#a1a1aa;background:rgba(0,0,0,.35);border-color:rgba(255,255,255,.12)}
.sky-c{background:linear-gradient(135deg,rgba(125,211,252,.18),rgba(56,189,248,.04));border-color:rgba(125,211,252,.25)}
.em-c{background:linear-gradient(135deg,rgba(52,211,153,.2),rgba(16,185,129,.04));border-color:rgba(52,211,153,.25)}
.chart{position:relative;height:200px;overflow:hidden;border-radius:18px;border:1px solid rgba(255,255,255,.1);background:#0b0f17;margin-bottom:14px}
.go{position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px);background-size:32px 32px}
.ll{position:absolute;left:0;right:0;border-top:1px dashed rgba(255,255,255,.2)}
.lt{position:absolute;top:-9px;left:8px;background:#0b0f17;padding:0 5px;font-size:10px;color:#a1a1aa;white-space:nowrap}
.ts{font-size:13px;line-height:1.6;color:#a1a1aa}
.score-n{font-size:48px;font-weight:600;margin:8px 0 4px}
.row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
/* loading */
#loading{display:flex;align-items:center;justify-content:center;height:80vh;flex-direction:column;gap:16px;color:#a1a1aa}
.spinner{width:28px;height:28px;border:2px solid rgba(255,255,255,.1);border-top-color:#4d8dff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
#app{display:none}
</style>
</head>
<body>
<div id="loading">
  <div class="spinner"></div>
  <div style="font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:.14em">Loading dual score engine&hellip;</div>
</div>

<div class="w" id="app">

<!-- ── Header ───────────────────────────────────────────── -->
<div class="card">
  <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:4px">
    <span class="pill zn-p">Unified Market Dashboard</span>
    <span class="pill em-p">Dual Scoring Active</span>
    <span class="pill am-p">Divergence Monitoring Enabled</span>
    <span class="pill dm-p">Demo Mode</span>
  </div>
  <div style="font-size:36px;font-weight:600;letter-spacing:-.02em;margin:12px 0 8px">SPY + TSLA Terminal</div>
  <p class="ts" style="max-width:640px">Dual scoring engine with gamma analysis, divergence detection, and real-time regime classification.</p>
  <p style="font-size:12px;color:#71717a;margin-top:8px" id="updated">Loading&hellip;</p>
  <div class="g2" style="margin-top:16px;max-width:580px">
    <div class="cd">
      <div class="lbl">Market Regime</div>
      <div style="font-size:17px;font-weight:600;margin:7px 0 5px">Bullish TSLA Divergence</div>
      <p class="ts">TSLA is materially stronger than SPY, suggesting single-name momentum and gamma are leading broad market confirmation.</p>
    </div>
    <div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);border-radius:18px;padding:14px">
      <div class="lbl" style="color:#fcd34d">Score Spread</div>
      <div style="font-size:36px;font-weight:600;margin:8px 0 4px">9</div>
      <p style="font-size:13px;color:#f4f4f5">Bullish TSLA Divergence</p>
    </div>
  </div>
</div>

<!-- ── Ticker Panels ─────────────────────────────────────── -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">

  <!-- SPY -->
  <div class="card sky-c">
    <span class="pill sky-p">Bullish Control</span>
    <div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px;margin:12px 0">
      <div style="font-size:34px;font-weight:600">SPY</div>
      <div style="font-size:26px;font-weight:600">$542.15</div>
      <span class="pill sky-p">+2.35 (+0.44%)</span>
    </div>
    <div class="g2" style="margin-bottom:14px">
      <div class="cd"><div class="lbl">Macro</div><div style="font-size:17px;font-weight:600;margin-top:5px">22/35</div></div>
      <div class="cd"><div class="lbl">Technical</div><div style="font-size:17px;font-weight:600;margin-top:5px">17/25</div></div>
      <div class="cd"><div class="lbl">Gamma</div><div style="font-size:17px;font-weight:600;margin-top:5px">16/25</div></div>
      <div class="cd"><div class="lbl">Volatility</div><div style="font-size:17px;font-weight:600;margin-top:5px">7/15</div></div>
    </div>
    <div class="cd" style="text-align:center;margin-bottom:14px;padding:18px">
      <div class="lbl">Signal Score</div>
      <div class="score-n" style="color:#7dd3fc">62</div>
      <div style="font-size:13px;color:#a1a1aa">Bullish Control</div>
    </div>
    <div class="chart">
      <div class="go"></div>
      <div class="ll" style="top:18%"><span class="lt">Institutional Resistance &bull; $548.00</span></div>
      <div class="ll" style="top:34%"><span class="lt">50SMA Battleground &bull; $541.20</span></div>
      <div class="ll" style="top:50%"><span class="lt">200SMA Structural &bull; $498.50</span></div>
      <div class="ll" style="top:66%"><span class="lt">Gap Truth Zone &bull; $535.00</span></div>
      <div class="ll" style="top:82%"><span class="lt">Institutional Support &bull; $527.00</span></div>
      <svg viewBox="0 0 800 200" style="position:absolute;inset:0;width:100%;height:100%">
        <defs>
          <linearGradient id="sl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#93c5fd"/></linearGradient>
          <linearGradient id="sa" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(96,165,250,.25)"/><stop offset="100%" stop-color="rgba(255,255,255,.01)"/></linearGradient>
        </defs>
        <path d="M0,145 C70,140 110,158 175,134 C250,106 300,116 380,98 C465,80 520,92 600,66 C665,46 720,62 800,38 L800,200 L0,200 Z" fill="url(#sa)"/>
        <path d="M0,145 C70,140 110,158 175,134 C250,106 300,116 380,98 C465,80 520,92 600,66 C665,46 720,62 800,38" fill="none" stroke="url(#sl)" stroke-width="4" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="cd" style="margin-bottom:12px">
      <div style="font-size:15px;font-weight:600;margin-bottom:10px">Gamma Map</div>
      <div class="g2" style="margin-bottom:8px">
        <div class="ci"><div class="lbl">Call Wall</div><div style="font-size:14px;font-weight:600;margin-top:5px">$545.00</div></div>
        <div class="ci"><div class="lbl">Put Wall</div><div style="font-size:14px;font-weight:600;margin-top:5px">$535.00</div></div>
        <div class="ci"><div class="lbl">Gamma Flip</div><div style="font-size:14px;font-weight:600;margin-top:5px">$540.00</div></div>
        <div class="ci"><div class="lbl">Pin Zone</div><div style="font-size:14px;font-weight:600;margin-top:5px">540&ndash;542</div></div>
      </div>
      <div class="ci"><div class="lbl">Dealer Regime</div><div style="font-size:14px;font-weight:600;margin:5px 0 4px">Long Gamma</div><p class="ts">Pinning likely unless resistance is accepted with macro support.</p></div>
    </div>
    <div class="cd">
      <div style="font-size:15px;font-weight:600;margin-bottom:10px">Key Levels</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Institutional Resistance</div><div class="ts" style="font-size:11px;margin-top:3px">Acceptance opens upside continuation</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$548.00</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">50SMA Battleground</div><div class="ts" style="font-size:11px;margin-top:3px">Tactical trend control</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$541.20</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">200SMA Structural</div><div class="ts" style="font-size:11px;margin-top:3px">Loss damages broader structure</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$498.50</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Gap Truth Zone</div><div class="ts" style="font-size:11px;margin-top:3px">Breakaway down vs exhaustion gap</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$535.00</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Institutional Support</div><div class="ts" style="font-size:11px;margin-top:3px">Major demand shelf</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$527.00</div></div></div>
      </div>
    </div>
  </div>

  <!-- TSLA -->
  <div class="card em-c">
    <span class="pill em-p">Squeeze Bias</span>
    <div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px;margin:12px 0">
      <div style="font-size:34px;font-weight:600">TSLA</div>
      <div style="font-size:26px;font-weight:600">$248.32</div>
      <span class="pill em-p">+6.82 (+2.82%)</span>
    </div>
    <div class="g2" style="margin-bottom:14px">
      <div class="cd"><div class="lbl">Macro</div><div style="font-size:17px;font-weight:600;margin-top:5px">18/25</div></div>
      <div class="cd"><div class="lbl">Technical</div><div style="font-size:17px;font-weight:600;margin-top:5px">26/30</div></div>
      <div class="cd"><div class="lbl">Gamma</div><div style="font-size:17px;font-weight:600;margin-top:5px">21/30</div></div>
      <div class="cd"><div class="lbl">Volatility</div><div style="font-size:17px;font-weight:600;margin-top:5px">6/15</div></div>
    </div>
    <div class="cd" style="text-align:center;margin-bottom:14px;padding:18px">
      <div class="lbl">Signal Score</div>
      <div class="score-n" style="color:#6ee7b7">71</div>
      <div style="font-size:13px;color:#a1a1aa">Squeeze Bias</div>
    </div>
    <div class="chart">
      <div class="go"></div>
      <div class="ll" style="top:18%"><span class="lt">Institutional Resistance &bull; $260.00</span></div>
      <div class="ll" style="top:34%"><span class="lt">Momentum Pivot &bull; $248.00</span></div>
      <div class="ll" style="top:50%"><span class="lt">50SMA Battleground &bull; $235.50</span></div>
      <div class="ll" style="top:66%"><span class="lt">200SMA Structural &bull; $198.00</span></div>
      <div class="ll" style="top:82%"><span class="lt">Gap / Air Pocket &bull; $238.00</span></div>
      <svg viewBox="0 0 800 200" style="position:absolute;inset:0;width:100%;height:100%">
        <defs>
          <linearGradient id="tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#6ee7b7"/></linearGradient>
          <linearGradient id="ta" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(52,211,153,.25)"/><stop offset="100%" stop-color="rgba(255,255,255,.01)"/></linearGradient>
        </defs>
        <path d="M0,154 C60,174 118,136 170,146 C228,158 272,82 340,92 C420,106 470,60 552,72 C630,84 700,32 800,44 L800,200 L0,200 Z" fill="url(#ta)"/>
        <path d="M0,154 C60,174 118,136 170,146 C228,158 272,82 340,92 C420,106 470,60 552,72 C630,84 700,32 800,44" fill="none" stroke="url(#tl)" stroke-width="4" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="cd" style="margin-bottom:12px">
      <div style="font-size:15px;font-weight:600;margin-bottom:10px">Gamma Map</div>
      <div class="g2" style="margin-bottom:8px">
        <div class="ci"><div class="lbl">Call Wall</div><div style="font-size:14px;font-weight:600;margin-top:5px">$260.00</div></div>
        <div class="ci"><div class="lbl">Put Wall</div><div style="font-size:14px;font-weight:600;margin-top:5px">$240.00</div></div>
        <div class="ci"><div class="lbl">Gamma Flip</div><div style="font-size:14px;font-weight:600;margin-top:5px">$248.00</div></div>
        <div class="ci"><div class="lbl">Pin Zone</div><div style="font-size:14px;font-weight:600;margin-top:5px">247&ndash;250</div></div>
      </div>
      <div class="ci"><div class="lbl">Dealer Regime</div><div style="font-size:14px;font-weight:600;margin:5px 0 4px">Approaching Call Wall</div><p class="ts">Acceleration on breakouts, sharp reversals if key levels fail.</p></div>
    </div>
    <div class="cd">
      <div style="font-size:15px;font-weight:600;margin-bottom:10px">Key Levels</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Institutional Resistance</div><div class="ts" style="font-size:11px;margin-top:3px">Supply + call wall confluence</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$260.00</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Momentum Pivot</div><div class="ts" style="font-size:11px;margin-top:3px">Break here unlocks squeeze</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$248.00</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">50SMA Battleground</div><div class="ts" style="font-size:11px;margin-top:3px">Trend control line</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$235.50</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">200SMA Structural</div><div class="ts" style="font-size:11px;margin-top:3px">Breakdown below changes regime</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$198.00</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Gap / Air Pocket</div><div class="ts" style="font-size:11px;margin-top:3px">Fast-move zone if lost</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$238.00</div></div></div>
      </div>
    </div>
  </div>

</div><!-- end ticker panels -->

<!-- ── Divergence + Right Rail ───────────────────────────── -->
<div style="display:grid;grid-template-columns:1.15fr .85fr;gap:18px">

  <div class="card">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px">
      <div>
        <div style="font-size:20px;font-weight:600;margin-bottom:4px">Divergence Engine</div>
        <p class="ts">Live spread between TSLA and SPY scoring with inferred regime classification.</p>
      </div>
      <span class="pill am-p" style="white-space:nowrap;flex-shrink:0">Bullish TSLA Divergence</span>
    </div>
    <div class="g3" style="margin-bottom:12px">
      <div class="cd"><div class="lbl">Score Spread</div><div style="font-size:34px;font-weight:600;margin:8px 0 4px">9</div><div class="ts" style="font-size:11px">TSLA score minus SPY score</div></div>
      <div class="cd"><div class="lbl">Relative Strength</div><div style="font-size:17px;font-weight:600;margin:8px 0 4px">+2.38% TSLA vs SPY intraday</div><div class="ts" style="font-size:11px">Single-name performance edge</div></div>
      <div class="cd"><div class="lbl">Interpretation</div><div class="ts" style="margin-top:6px">TSLA is materially stronger than SPY, suggesting single-name momentum and gamma are leading broad market confirmation.</div></div>
    </div>
    <div class="cd">
      <div class="lbl" style="margin-bottom:10px">Divergence Alerts</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div class="ci ts">If TSLA holds above gamma flip $248 while SPY remains below major resistance, favor TSLA-specific setups over broad beta.</div>
        <div class="ci ts">If SPY reclaims resistance as TSLA extends, divergence could convert into full risk-on confirmation.</div>
        <div class="ci ts">If TSLA loses momentum pivot while SPY weakens, the divergence may resolve lower across both.</div>
      </div>
    </div>
  </div>

  <div style="display:flex;flex-direction:column;gap:18px">
    <div class="card">
      <div style="font-size:20px;font-weight:600;margin-bottom:14px">Action Matrix</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);border-radius:16px;padding:14px"><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#6ee7b7;margin-bottom:7px">Risk-On Confirmation</div><p class="ts">SPY and TSLA both above key gamma control with scores above 60. Favor trend continuation and confirmation trades.</p></div>
        <div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);border-radius:16px;padding:14px"><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#fcd34d;margin-bottom:7px">Selective Longs</div><p class="ts">TSLA materially stronger than SPY. Favor single-name setups while the index remains less decisive.</p></div>
        <div style="background:rgba(251,113,133,.1);border:1px solid rgba(251,113,133,.2);border-radius:16px;padding:14px"><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#fda4af;margin-bottom:7px">Broad Risk-Off</div><p class="ts">Both scores weak and below control levels. Reduce long exposure and treat bounces more cautiously.</p></div>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="font-size:20px;font-weight:600">Live Alert Feed</div>
        <span class="pill sky-p">4 items</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);border-radius:16px;padding:12px;display:flex;justify-content:space-between;gap:10px"><p class="ts" style="color:#6ee7b7">TSLA crossed above gamma flip $248. Squeeze bias active &mdash; dealer hedging supports upside.</p><span style="font-size:11px;color:#71717a;white-space:nowrap">09:32</span></div>
        <div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);border-radius:16px;padding:12px;display:flex;justify-content:space-between;gap:10px"><p class="ts" style="color:#fcd34d">SPY score diverging +9 vs TSLA. Watch for narrowing before committing to index shorts.</p><span style="font-size:11px;color:#71717a;white-space:nowrap">09:28</span></div>
        <div style="background:rgba(125,211,252,.1);border:1px solid rgba(125,211,252,.2);border-radius:16px;padding:12px;display:flex;justify-content:space-between;gap:10px"><p class="ts" style="color:#7dd3fc">Market open: SPY holding above 50SMA. Neutral-to-bullish posture confirmed at open.</p><span style="font-size:11px;color:#71717a;white-space:nowrap">09:15</span></div>
        <div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);border-radius:16px;padding:12px;display:flex;justify-content:space-between;gap:10px"><p class="ts" style="color:#fcd34d">Pre-market: TSLA gap up +2.8%. Call wall at $260 becomes primary resistance target.</p><span style="font-size:11px;color:#71717a;white-space:nowrap">08:45</span></div>
      </div>
    </div>
  </div>

</div><!-- end divergence -->
</div><!-- end #app -->

<script>
setTimeout(function(){
  document.getElementById('loading').style.display='none';
  var app=document.getElementById('app');
  app.style.display='flex';
  var now=new Date();
  document.getElementById('updated').textContent='Last updated '+now.toLocaleString();
},600);
</script>
</body>
</html>`;

async function main() {
  await prisma.app.upsert({
    where:  { id: "spy-tsla-dashboard" },
    update: { html: HTML },
    create: {
      id: "spy-tsla-dashboard", name: "SPY + TSLA Terminal",
      cat: "Quant · Dashboards", icon: "S", color: "teal", env: "live",
      url: "spy-tsla.ada-labs.io", type: "dashboard",
      desc: "Unified SPY/TSLA scoring engine with gamma maps, divergence detection, and real-time regime classification.",
      region: "us-east-1", uptime: "—", latency: "—", requests: "—", errors: "0%",
      log: JSON.stringify([
        ["09:32:01","dual score engine · SPY + TSLA","info"],
        ["09:32:02","gamma map loaded · 4 levels each",""],
        ["09:32:03","divergence engine active","ok"],
        ["09:32:03","demo mode · ui ready","ok"],
      ]),
      sortOrder: 10, html: HTML,
    },
  });

  const app = await prisma.app.findUnique({ where: { id: "spy-tsla-dashboard" }, select: { html: true } });
  console.log("✓ spy-tsla-dashboard updated ·", app.html ? app.html.length + "b" : "NULL");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
