/**
 * Registers SPY + TSLA Dashboard v1 (Apr 12 2026 static snapshot).
 * Run: node scripts/add-spy-tsla-dashboard-v1-html.mjs
 * Safe to re-run — uses upsert.
 *
 * v2: replaced CDN React/Babel/Tailwind with self-contained vanilla HTML/CSS.
 * Zero external dependencies. All data hardcoded from original snapshot.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>SPY + TSLA Terminal v1</title>
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
.vi-p{color:#c4b5fd;background:rgba(167,139,250,.1);border-color:rgba(167,139,250,.2)}
.zn-p{color:#a1a1aa;background:rgba(0,0,0,.2);border-color:rgba(255,255,255,.1)}
.sky-c{background:linear-gradient(135deg,rgba(125,211,252,.18),rgba(56,189,248,.04));border-color:rgba(125,211,252,.25)}
.em-c{background:linear-gradient(135deg,rgba(52,211,153,.2),rgba(16,185,129,.04));border-color:rgba(52,211,153,.25)}
.chart{position:relative;height:200px;overflow:hidden;border-radius:18px;border:1px solid rgba(255,255,255,.1);background:#0b0f17;margin-bottom:14px}
.go{position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px);background-size:32px 32px}
.ll{position:absolute;left:0;right:0;border-top:1px dashed rgba(255,255,255,.2)}
.lt{position:absolute;top:-9px;left:8px;background:#0b0f17;padding:0 5px;font-size:10px;color:#a1a1aa;white-space:nowrap}
.ts{font-size:13px;line-height:1.6;color:#a1a1aa}
.score-n{font-size:48px;font-weight:600;margin:8px 0 4px}
.row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
a.pill{text-decoration:none}
</style>
</head>
<body>
<div class="w">

<!-- ── Header ───────────────────────────────────────────── -->
<div class="card">
  <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:4px">
    <span class="pill zn-p">Unified Market Dashboard</span>
    <span class="pill em-p">Dual Scoring Active</span>
    <span class="pill am-p">Divergence Monitoring Enabled</span>
    <span class="pill vi-p">v1 &middot; Apr 12 Snapshot</span>
  </div>
  <div style="font-size:36px;font-weight:600;letter-spacing:-.02em;margin:12px 0 8px">SPY + TSLA Terminal</div>
  <p class="ts" style="max-width:640px">Side-by-side regime tracking for broad market beta and high-beta single-name risk. Use the score spread, key levels, and gamma alignment to decide whether leadership is confirming or diverging.</p>
  <p style="font-size:12px;color:#71717a;margin-top:8px">Apr 12, 2026 &bull; 3:08 PM ET</p>
  <div class="g2" style="margin-top:16px;max-width:580px">
    <div class="cd">
      <div class="lbl">Market Regime</div>
      <div style="font-size:17px;font-weight:600;margin:7px 0 5px">Risk-On With TSLA Outperformance</div>
      <p class="ts">TSLA is materially outperforming SPY, suggesting single-name squeeze dynamics are stronger than broad index confirmation.</p>
    </div>
    <div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);border-radius:18px;padding:14px">
      <div class="lbl" style="color:#fcd34d">Score Spread</div>
      <div style="font-size:36px;font-weight:600;margin:8px 0 4px">8</div>
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
      <div style="font-size:26px;font-weight:600">$684.26</div>
      <span class="pill sky-p">+5.12 (+0.75%)</span>
    </div>
    <div class="g2" style="margin-bottom:14px">
      <div class="cd"><div class="lbl">Macro</div><div style="font-size:17px;font-weight:600;margin-top:5px">24/35</div></div>
      <div class="cd"><div class="lbl">Technical</div><div style="font-size:17px;font-weight:600;margin-top:5px">18/25</div></div>
      <div class="cd"><div class="lbl">Gamma</div><div style="font-size:17px;font-weight:600;margin-top:5px">14/25</div></div>
      <div class="cd"><div class="lbl">Volatility</div><div style="font-size:17px;font-weight:600;margin-top:5px">8/15</div></div>
    </div>
    <div class="cd" style="text-align:center;margin-bottom:14px;padding:18px">
      <div class="lbl">Signal Score</div>
      <div class="score-n" style="color:#7dd3fc">64</div>
      <div style="font-size:13px;color:#a1a1aa">Bullish Control</div>
    </div>
    <div class="chart">
      <div class="go"></div>
      <div class="ll" style="top:18%"><span class="lt">Institutional Resistance &bull; $690</span></div>
      <div class="ll" style="top:34%"><span class="lt">50SMA Battleground &bull; $675</span></div>
      <div class="ll" style="top:50%"><span class="lt">200SMA Structural &bull; $665</span></div>
      <div class="ll" style="top:66%"><span class="lt">Gap Truth Zone &bull; $660</span></div>
      <div class="ll" style="top:82%"><span class="lt">Institutional Support &bull; $630</span></div>
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
        <div class="ci"><div class="lbl">Call Wall</div><div style="font-size:14px;font-weight:600;margin-top:5px">$690</div></div>
        <div class="ci"><div class="lbl">Put Wall</div><div style="font-size:14px;font-weight:600;margin-top:5px">$660</div></div>
        <div class="ci"><div class="lbl">Gamma Flip</div><div style="font-size:14px;font-weight:600;margin-top:5px">$678</div></div>
        <div class="ci"><div class="lbl">Pin Zone</div><div style="font-size:14px;font-weight:600;margin-top:5px">675&ndash;680</div></div>
      </div>
      <div class="ci"><div class="lbl">Dealer Regime</div><div style="font-size:14px;font-weight:600;margin:5px 0 4px">Neutral to Long Gamma</div><p class="ts">Pinning likely unless resistance is accepted with macro support.</p></div>
    </div>
    <div class="cd">
      <div style="font-size:15px;font-weight:600;margin-bottom:10px">Key Levels</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Institutional Resistance</div><div class="ts" style="font-size:11px;margin-top:3px">Acceptance opens upside continuation</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$690</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">50SMA Battleground</div><div class="ts" style="font-size:11px;margin-top:3px">Tactical trend control</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$675</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">200SMA Structural</div><div class="ts" style="font-size:11px;margin-top:3px">Loss damages broader structure</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$665</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Gap Truth Zone</div><div class="ts" style="font-size:11px;margin-top:3px">Breakaway down vs exhaustion gap</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$660</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Institutional Support</div><div class="ts" style="font-size:11px;margin-top:3px">Major demand shelf</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$630</div></div></div>
      </div>
    </div>
  </div>

  <!-- TSLA -->
  <div class="card em-c">
    <span class="pill em-p">Squeeze Bias</span>
    <div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px;margin:12px 0">
      <div style="font-size:34px;font-weight:600">TSLA</div>
      <div style="font-size:26px;font-weight:600">$254.82</div>
      <span class="pill em-p">+6.14 (+2.47%)</span>
    </div>
    <div class="g2" style="margin-bottom:14px">
      <div class="cd"><div class="lbl">Macro</div><div style="font-size:17px;font-weight:600;margin-top:5px">18/25</div></div>
      <div class="cd"><div class="lbl">Technical</div><div style="font-size:17px;font-weight:600;margin-top:5px">24/30</div></div>
      <div class="cd"><div class="lbl">Gamma</div><div style="font-size:17px;font-weight:600;margin-top:5px">22/30</div></div>
      <div class="cd"><div class="lbl">Volatility</div><div style="font-size:17px;font-weight:600;margin-top:5px">8/15</div></div>
    </div>
    <div class="cd" style="text-align:center;margin-bottom:14px;padding:18px">
      <div class="lbl">Signal Score</div>
      <div class="score-n" style="color:#6ee7b7">72</div>
      <div style="font-size:13px;color:#a1a1aa">Squeeze Bias</div>
    </div>
    <div class="chart">
      <div class="go"></div>
      <div class="ll" style="top:18%"><span class="lt">Institutional Resistance &bull; $265</span></div>
      <div class="ll" style="top:34%"><span class="lt">Momentum Pivot &bull; $255</span></div>
      <div class="ll" style="top:50%"><span class="lt">50SMA Battleground &bull; $248</span></div>
      <div class="ll" style="top:66%"><span class="lt">200SMA Structural &bull; $232</span></div>
      <div class="ll" style="top:82%"><span class="lt">Gap / Air Pocket &bull; $240</span></div>
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
        <div class="ci"><div class="lbl">Call Wall</div><div style="font-size:14px;font-weight:600;margin-top:5px">$270</div></div>
        <div class="ci"><div class="lbl">Put Wall</div><div style="font-size:14px;font-weight:600;margin-top:5px">$240</div></div>
        <div class="ci"><div class="lbl">Gamma Flip</div><div style="font-size:14px;font-weight:600;margin-top:5px">$255</div></div>
        <div class="ci"><div class="lbl">Pin Zone</div><div style="font-size:14px;font-weight:600;margin-top:5px">250&ndash;255</div></div>
      </div>
      <div class="ci"><div class="lbl">Dealer Regime</div><div style="font-size:14px;font-weight:600;margin:5px 0 4px">Short Gamma</div><p class="ts">Acceleration on breakouts, sharp reversals if key levels fail.</p></div>
    </div>
    <div class="cd">
      <div style="font-size:15px;font-weight:600;margin-bottom:10px">Key Levels</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Institutional Resistance</div><div class="ts" style="font-size:11px;margin-top:3px">Supply + call wall confluence</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$265</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Momentum Pivot</div><div class="ts" style="font-size:11px;margin-top:3px">Break here unlocks squeeze</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$255</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">50SMA Battleground</div><div class="ts" style="font-size:11px;margin-top:3px">Trend control line</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$248</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">200SMA Structural</div><div class="ts" style="font-size:11px;margin-top:3px">Breakdown below changes regime</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$232</div></div></div>
        <div class="ci"><div class="row"><div><div style="font-size:13px;font-weight:500">Gap / Air Pocket</div><div class="ts" style="font-size:11px;margin-top:3px">Fast-move zone if lost</div></div><div style="font-size:14px;font-weight:600;white-space:nowrap">$240</div></div></div>
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
        <p class="ts">Detect when single-name momentum confirms or fights broad market structure.</p>
      </div>
      <span class="pill am-p" style="white-space:nowrap;flex-shrink:0">Bullish TSLA Divergence</span>
    </div>
    <div class="g3" style="margin-bottom:12px">
      <div class="cd"><div class="lbl">Score Spread</div><div style="font-size:34px;font-weight:600;margin:8px 0 4px">8</div><div class="ts" style="font-size:11px">TSLA score minus SPY score</div></div>
      <div class="cd"><div class="lbl">Relative Strength</div><div style="font-size:17px;font-weight:600;margin:8px 0 4px">+1.72% TSLA vs SPY intraday</div><div class="ts" style="font-size:11px">Single-name performance edge</div></div>
      <div class="cd"><div class="lbl">Interpretation</div><div class="ts" style="margin-top:6px">TSLA is trading with stronger momentum and more supportive gamma than the index, increasing single-name upside asymmetry.</div></div>
    </div>
    <div class="cd">
      <div class="lbl" style="margin-bottom:10px">Divergence Alerts</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div class="ci ts">If TSLA stays above 255 while SPY stalls under 690, favor TSLA-specific long setups over broad market beta.</div>
        <div class="ci ts">If SPY loses 675 while TSLA slips back under 248, divergence likely resolves bearish across both.</div>
        <div class="ci ts">If SPY reclaims 690 and TSLA clears 265, market confirms a higher-conviction risk-on expansion phase.</div>
      </div>
    </div>
  </div>

  <div style="display:flex;flex-direction:column;gap:18px">
    <div class="card">
      <div style="font-size:20px;font-weight:600;margin-bottom:14px">Action Matrix</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);border-radius:16px;padding:14px"><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#6ee7b7;margin-bottom:7px">Risk-On Confirmation</div><p class="ts">SPY reclaims 690 and TSLA clears 265. Favor trend continuation, beta exposure, and momentum follow-through.</p></div>
        <div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);border-radius:16px;padding:14px"><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#fcd34d;margin-bottom:7px">Selective Longs</div><p class="ts">TSLA holds above 255 while SPY remains below 690. Favor single-name setups over broad index aggression.</p></div>
        <div style="background:rgba(251,113,133,.1);border:1px solid rgba(251,113,133,.2);border-radius:16px;padding:14px"><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#fda4af;margin-bottom:7px">Broad Risk-Off</div><p class="ts">SPY loses 675 and TSLA loses 248. Treat divergence as resolved lower and reduce directional long exposure.</p></div>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="font-size:20px;font-weight:600">Live Alert Feed</div>
        <span class="pill" style="color:#7dd3fc;background:rgba(125,211,252,.1);border-color:rgba(125,211,252,.2)">5 new</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);border-radius:16px;padding:12px;display:flex;justify-content:space-between;gap:10px"><p class="ts" style="color:#6ee7b7">TSLA score 72 vs SPY 64 &rarr; bullish single-name divergence active</p><span style="font-size:11px;color:#71717a;white-space:nowrap">15:07</span></div>
        <div style="background:rgba(125,211,252,.1);border:1px solid rgba(125,211,252,.2);border-radius:16px;padding:12px;display:flex;justify-content:space-between;gap:10px"><p class="ts" style="color:#7dd3fc">SPY holding above gamma flip at 678 but still below 690 resistance</p><span style="font-size:11px;color:#71717a;white-space:nowrap">15:03</span></div>
        <div style="background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);border-radius:16px;padding:12px;display:flex;justify-content:space-between;gap:10px"><p class="ts" style="color:#6ee7b7">TSLA reclaimed 255 gamma flip &rarr; squeeze bias remains intact</p><span style="font-size:11px;color:#71717a;white-space:nowrap">14:58</span></div>
        <div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);border-radius:16px;padding:12px;display:flex;justify-content:space-between;gap:10px"><p class="ts" style="color:#fcd34d">Divergence spread widened above 7 points</p><span style="font-size:11px;color:#71717a;white-space:nowrap">14:46</span></div>
        <div style="background:rgba(251,113,133,.1);border:1px solid rgba(251,113,133,.2);border-radius:16px;padding:12px;display:flex;justify-content:space-between;gap:10px"><p class="ts" style="color:#fda4af">Watch resolution risk if SPY loses 675 battleground</p><span style="font-size:11px;color:#71717a;white-space:nowrap">14:29</span></div>
      </div>
    </div>
  </div>

</div><!-- end divergence section -->
</div><!-- end .w -->
</body>
</html>`;

async function main() {
  await prisma.app.upsert({
    where:  { id: "spy-tsla-dashboard-v1" },
    update: { html: HTML },
    create: {
      id: "spy-tsla-dashboard-v1", name: "SPY + TSLA Terminal v1",
      cat: "Quant · Dashboards", icon: "S", color: "amber", env: "live",
      url: "spy-tsla-v1.ada-labs.io", type: "dashboard",
      desc: "Original SPY/TSLA unified terminal — Apr 12 2026 snapshot. Static scoring, gamma maps, and divergence engine. Reference build for v2 comparison.",
      region: "us-east-1", uptime: "snapshot", latency: "—", requests: "—", errors: "0%",
      log: JSON.stringify([
        ["15:08:00","static snapshot · Apr 12 2026","info"],
        ["15:08:00","SPY 64 · TSLA 72 · spread +8","ok"],
        ["15:08:00","divergence: bullish TSLA","ok"],
        ["15:08:00","v1 reference build · ready","ok"],
      ]),
      sortOrder: 11, html: HTML,
    },
  });

  const app = await prisma.app.findUnique({ where: { id: "spy-tsla-dashboard-v1" }, select: { html: true } });
  console.log("✓ spy-tsla-dashboard-v1 updated ·", app.html ? app.html.length + "b" : "NULL");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
