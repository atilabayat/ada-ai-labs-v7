"use client";

import { AppDef } from "@/lib/types";
import { ENV_LABELS } from "@/lib/data/apps";

function Spark() {
  const bars = Array.from({ length: 16 }, () => 20 + Math.random() * 80);
  return (
    <div className="flex h-6 flex-1 items-end gap-[2px] px-4">
      {bars.map((h, i) => (
        <div
          key={i}
          className="min-h-[2px] flex-1 rounded-[1px] bg-accent opacity-50"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function Card({ label, value, delta, deltaKind, valueColor }: {
  label: string; value: string; delta?: string; deltaKind?: "up" | "down"; valueColor?: string;
}) {
  return (
    <div className="rounded-[10px] border border-line bg-bg-1 px-[18px] py-4">
      <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">{label}</div>
      <div className="mb-1 font-display text-[28px] font-medium leading-none" style={valueColor ? { color: valueColor } : undefined}>{value}</div>
      {delta && (
        <div className={`font-mono text-[10px] ${deltaKind === "up" ? "text-accent-teal" : deltaKind === "down" ? "text-accent-rose" : "text-ink-2"}`}>{delta}</div>
      )}
    </div>
  );
}

function Header({ title, right, liveDot }: { title: string; right: string; liveDot?: boolean }) {
  return (
    <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
      <div className="font-display text-[26px] font-medium tracking-tight">
        {title}
        {liveDot && <span className="ml-[10px] inline-block h-2 w-2 animate-pulse rounded-full bg-accent-teal align-middle shadow-[0_0_10px_var(--accent-teal)]" />}
      </div>
      <div className="font-mono text-[11px] text-ink-2">{right}</div>
    </div>
  );
}

function EmbedNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-r-lg border border-l-2 border-[rgba(77,141,255,0.15)] border-l-accent bg-[rgba(77,141,255,0.04)] px-4 py-[14px] text-[12px] leading-relaxed text-ink-2">
      {children}
    </div>
  );
}

function WallLevel({ price, kind, width, qty, highlight }: {
  price: string; kind: "put" | "call" | "spot"; width: number; qty: string; highlight?: boolean;
}) {
  const barColor =
    kind === "put" ? "linear-gradient(90deg, var(--accent-rose), rgba(255,86,119,0.4))"
    : kind === "call" ? "linear-gradient(90deg, var(--accent-teal), rgba(45,212,191,0.4))"
    : "linear-gradient(90deg, var(--accent-amber), rgba(245,183,72,0.4))";
  return (
    <div className="flex items-center gap-3 py-[7px] font-mono text-[11px]">
      <span className={`w-14 ${highlight ? "font-semibold text-accent-amber" : "text-ink-1"}`}>{price}</span>
      <div className="relative h-[18px] flex-1 overflow-hidden rounded-[3px] bg-bg-3">
        <div className="h-full rounded-[3px]" style={{ width: `${width}%`, background: barColor }} />
      </div>
      <span className="w-[70px] text-right text-ink-2">{qty}</span>
    </div>
  );
}

function TickerRow({ sym, px, chg, chgKind, spark }: {
  sym: string; px?: string; chg: string; chgKind: "up" | "down"; spark?: boolean;
}) {
  return (
    <div className="flex items-center border-b border-line py-[9px] font-mono last:border-0">
      <span className="w-[70px] text-[13px] font-semibold text-ink-0">{sym}</span>
      {px && <span className="w-[90px] text-right text-[12px] text-ink-1">{px}</span>}
      <span className={`w-20 text-right text-[11px] ${chgKind === "up" ? "text-accent-teal" : "text-accent-rose"}`}>{chg}</span>
      {spark && <Spark />}
    </div>
  );
}

const now = () =>
  new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export default function AppPreview({ app }: { app: AppDef }) {
  const clock = now();

  // ── Captured interactive artifact ──────────────────────────────────────────
  // Apps promoted from a build that emitted a self-contained HTML artifact
  // (course, survey, dashboard, generated app/component) carry that HTML. Render
  // the *real application* in a sandboxed iframe so its scripts run live.
  if (app.html) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-line bg-bg-2 px-5 py-[8px] font-mono text-[11px]">
          <span className="rounded-[3px] bg-[rgba(167,139,250,0.15)] px-[6px] py-[1px] text-[9px] uppercase tracking-[0.1em] text-accent-violet">
            {app.type === "artifact" ? "interactive app" : app.type}
          </span>
          <span className="text-ink-2">running · sandboxed</span>
          <span className="ml-auto text-ink-3">{ENV_LABELS[app.env]} · {clock}</span>
        </div>
        <iframe
          title={app.name}
          sandbox="allow-scripts"
          srcDoc={app.html}
          className="min-h-0 w-full flex-1 border-0 bg-white"
        />
      </div>
    );
  }

  if (app.type === "putwall") {
    return (
      <>
        <Header title={app.name.includes("Call") ? "TSLA Call Wall" : "TSLA Put Wall"} right={`RTH · ${clock} EST`} liveDot />
        <div className="mb-5 grid grid-cols-2 gap-[14px] lg:grid-cols-4">
          <Card label="Spot" value="$432.18" delta="+2.84%" deltaKind="up" />
          <Card label="Put Wall" value="$420" valueColor="var(--accent-rose)" delta="support" />
          <Card label="Call Wall" value="$450" valueColor="var(--accent-teal)" delta="resistance" />
          <Card label="Net GEX" value="+1.4B" delta="positive" deltaKind="up" />
        </div>
        <div className="rounded-[10px] border border-line bg-bg-1 p-5">
          <div className="mb-[14px] font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">Gamma by Strike · Next Expiry</div>
          <WallLevel price="$455" kind="call" width={30} qty="12.4k" />
          <WallLevel price="$450" kind="call" width={88} qty="41.2k" highlight />
          <WallLevel price="$445" kind="call" width={46} qty="18.7k" />
          <WallLevel price="$435" kind="spot" width={62} qty="spot" />
          <WallLevel price="$425" kind="put" width={52} qty="22.1k" />
          <WallLevel price="$420" kind="put" width={94} qty="48.9k" highlight />
          <WallLevel price="$415" kind="put" width={28} qty="11.0k" />
        </div>
        <EmbedNote>
          This is a <strong>live embedded preview</strong> of the {app.name} application running in the {ENV_LABELS[app.env]} environment. The morning sentinel fires when spot crosses within 0.5% of the put wall. Data refreshes every 60s from the Tradier options chain.
        </EmbedNote>
      </>
    );
  }

  if (app.type === "briefing") {
    return (
      <>
        <Header title="🌅 Morning Intelligence Briefing" right={`Mon, Jun 2 · ${clock}`} />
        <div className="mb-5 grid grid-cols-2 gap-[14px] lg:grid-cols-4">
          <Card label="S&P 500" value="5,284" delta="+0.38%" deltaKind="up" />
          <Card label="Nasdaq" value="18,712" delta="+0.62%" deltaKind="up" />
          <Card label="VIX" value="14.2" delta="−3.1%" deltaKind="down" />
          <Card label="10Y" value="4.31%" delta="+2bp" deltaKind="up" />
        </div>
        <div className="mb-[10px] font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">📈 Ticker Setups — Day &amp; Swing Trade Watch</div>
        <div className="rounded-[10px] border border-line bg-bg-1 px-[18px] py-4">
          <TickerRow sym="TSLA" px="$432.18" chg="+2.84%" chgKind="up" spark />
          <TickerRow sym="NVDA" px="$894.50" chg="+1.12%" chgKind="up" spark />
          <TickerRow sym="AAPL" px="$234.72" chg="−0.41%" chgKind="down" spark />
          <TickerRow sym="AMZN" px="$218.40" chg="+0.94%" chgKind="up" spark />
          <TickerRow sym="SPY" px="$612.04" chg="+0.38%" chgKind="up" spark />
        </div>
        <EmbedNote>
          Live preview of the recurring <strong>Morning Briefing</strong> dashboard. The cron fires at 7:00 AM EST, runs a multi-search across macro, MAG-7, and ticker setups, then dispatches the composed HTML directly to atila.bayat@gmail.com.
        </EmbedNote>
      </>
    );
  }

  if (app.type === "compendium") {
    return (
      <>
        <Header title="IPA Pattern Compendium" right="35 patterns · 7 sheets" />
        <div className="mb-5 grid grid-cols-2 gap-[14px] lg:grid-cols-3">
          <Card label="Patterns" value="35" delta="+13 since v1" deltaKind="up" />
          <Card label="Avg Win Rate" value="64.8%" valueColor="var(--accent-teal)" delta="bull regime" />
          <Card label="Best Setup" value="QML" delta="71.8%" deltaKind="up" />
        </div>
        <div className="rounded-[10px] border border-line bg-bg-1 px-[18px] py-4">
          <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">Top Patterns by Win Rate</div>
          {[
            ["QML Bearish", "15m–4h", "71.8% · 2.6R"],
            ["QML Bullish", "15m–4h", "69.4% · 2.4R"],
            ["QM Bearish", "15m–1h", "64.2% · 2.1R"],
            ["IQM Inverse", "5m–15m", "58.1% · 1.7R"],
          ].map(([name, tf, wr]) => (
            <div key={name} className="flex items-center border-b border-line py-[9px] font-mono last:border-0">
              <span className="w-[120px] text-[13px] font-semibold text-ink-0">{name}</span>
              <span className="w-[90px] text-right text-[12px] text-ink-1">{tf}</span>
              <span className="w-[100px] text-right text-[11px] text-accent-teal">{wr}</span>
              <Spark />
            </div>
          ))}
        </div>
        <EmbedNote>
          <strong>Staging build</strong> of the IPA Compendium reference app. Win rates are conditioned on the live Market Regime Memory. Promote to production from the deployment rail to make it the active reference.
        </EmbedNote>
      </>
    );
  }

  if (app.type === "digest") {
    return (
      <>
        <Header title="AI News Digest" right={`Overnight · ${clock}`} liveDot />
        <div className="mb-2 grid grid-cols-1 gap-[14px] md:grid-cols-2">
          <div className="rounded-[10px] border border-line bg-bg-1 px-[18px] py-4">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">AI Leaderboard</div>
            {[["1. Anthropic", "▲", "up"], ["2. OpenAI", "—", "neut"], ["3. Google DeepMind", "▲", "up"], ["4. Meta AI", "▼", "down"]].map(([n, m, k]) => (
              <div key={n} className="flex items-center border-b border-line py-[9px] font-mono last:border-0">
                <span className="w-[140px] text-[13px] font-semibold text-ink-0">{n}</span>
                <span className={`flex-1 text-right ${k === "up" ? "text-accent-teal" : k === "down" ? "text-accent-rose" : "text-ink-3"}`}>{m}</span>
              </div>
            ))}
          </div>
          <div className="rounded-[10px] border border-line bg-bg-1 px-[18px] py-4">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">MAG-7 Pre-Market</div>
            {[["NVDA", "+1.4%", "up"], ["MSFT", "+0.6%", "up"], ["GOOGL", "−0.2%", "down"], ["META", "+0.9%", "up"]].map(([s, c, k]) => (
              <div key={s} className="flex items-center border-b border-line py-[9px] font-mono last:border-0">
                <span className="w-[70px] text-[13px] font-semibold text-ink-0">{s}</span>
                <span className={`flex-1 text-right text-[11px] ${k === "up" ? "text-accent-teal" : "text-accent-rose"}`}>{c}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-[14px] rounded-[10px] border border-line bg-bg-1 px-[18px] py-4">
          {[
            ["MAG-7", "mag7", "NVIDIA unveils next-gen inference accelerator at data-center summit", "3 sources · 04:12 EST"],
            ["MACRO", "macro", "Fed minutes signal patience on rate path; markets price June hold", "5 sources · 02:30 EST"],
            ["AI", "", "New agentic coding benchmark shows 2-3x gains from self-improvement loops", "2 sources · 23:48 EST"],
          ].map(([cat, kind, title, meta]) => (
            <div key={title} className="border-b border-line py-3 last:border-0">
              <span className={`mb-[6px] inline-block rounded-[3px] px-[6px] py-[2px] font-mono text-[8px] uppercase tracking-[0.1em] ${
                kind === "macro" ? "bg-[rgba(245,183,72,0.12)] text-accent-amber" : kind === "mag7" ? "bg-[rgba(45,212,191,0.12)] text-accent-teal" : "bg-[rgba(77,141,255,0.12)] text-accent"
              }`}>{cat}</span>
              <div className="mb-1 text-[14px] leading-snug text-ink-0">{title}</div>
              <div className="font-mono text-[9px] text-ink-3">{meta}</div>
            </div>
          ))}
        </div>
        <EmbedNote>
          Live preview of the autonomous <strong>AI News Digest Agent</strong>. Bloomberg-Terminal styling with gold accents. Dispatched to Slack and email each morning at 7am EST.
        </EmbedNote>
      </>
    );
  }

  if (app.type === "lattice") {
    const nodes: [string, number, number][] = [
      ["Rheme", 300, 50], ["Sinsign", 180, 110], ["Legisign", 420, 110],
      ["Qualisign", 110, 190], ["Dicent", 300, 190], ["Argument", 490, 190],
      ["Icon", 180, 270], ["Symbol", 420, 270],
    ];
    const edges: [number, number, number, number, number][] = [
      [300, 50, 180, 110, 0.25], [300, 50, 420, 110, 0.25],
      [180, 110, 110, 190, 0.18], [180, 110, 300, 190, 0.18],
      [420, 110, 300, 190, 0.18], [420, 110, 490, 190, 0.18],
      [110, 190, 180, 270, 0.18], [490, 190, 420, 270, 0.18],
      [300, 190, 180, 270, 0.12], [300, 190, 420, 270, 0.12],
    ];
    return (
      <>
        <Header title="Peirce's Ten Classes of Signs" right="Interactive Lattice" />
        <div className="rounded-[10px] border border-line bg-bg-1 p-6">
          <svg viewBox="0 0 600 340" className="h-auto w-full">
            <defs>
              <radialGradient id="lg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
              </radialGradient>
            </defs>
            {edges.map(([x1, y1, x2, y2, o], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`rgba(167,139,250,${o})`} />
            ))}
            {nodes.map(([t, x, y]) => (
              <g key={t}>
                <circle cx={x} cy={y} r={26} fill="url(#lg)" />
                <circle cx={x} cy={y} r={16} fill="#141d33" stroke="#a78bfa" strokeWidth={1.5} />
                <text x={x} y={y + 34} textAnchor="middle" fill="#aab4cc" fontFamily="monospace" fontSize="9">{t}</text>
              </g>
            ))}
          </svg>
        </div>
        <EmbedNote>
          Interactive <strong>Peirce Lattice Diagram</strong> — the ten classes of signs arranged by Firstness, Secondness, and Thirdness. Built as a React artifact and deployed as a standalone semiotics reference. Linked from the Peircean Semiotics wiki.
        </EmbedNote>
      </>
    );
  }

  if (app.type === "wiki") {
    return (
      <>
        <Header title="Self-Improving Agents Wiki" right="28 pages · 10 sources" />
        <div className="mb-5 grid grid-cols-2 gap-[14px] lg:grid-cols-3">
          <Card label="SWE-Bench" value="50%" valueColor="var(--accent-teal)" delta="from 20%" deltaKind="up" />
          <Card label="Polyglot" value="30.7%" valueColor="var(--accent-teal)" delta="from 14.2%" deltaKind="up" />
          <Card label="Frameworks" value="6" delta="tracked" />
        </div>
        <div className="rounded-[10px] border border-line bg-bg-1 px-[18px] py-4">
          {[
            ["Self-Challenging Agents — curriculum generation", "arXiv 2506.04287 · Jun 2025"],
            ["Darwin Gödel Machine — evolutionary self-modification", "arXiv 2505.21156 · May 2025"],
            ["Metacognitive Learning — reflection layer", "arXiv 2504.18923 · Apr 2025"],
          ].map(([title, meta]) => (
            <div key={title} className="border-b border-line py-3 last:border-0">
              <span className="mb-[6px] inline-block rounded-[3px] bg-[rgba(77,141,255,0.12)] px-[6px] py-[2px] font-mono text-[8px] uppercase tracking-[0.1em] text-accent">Framework</span>
              <div className="mb-1 text-[14px] leading-snug text-ink-0">{title}</div>
              <div className="font-mono text-[9px] text-ink-3">{meta}</div>
            </div>
          ))}
        </div>
        <EmbedNote>
          <strong>Dev preview</strong> of the Self-Improving Agents wiki rendered as a standalone app. Open the full reader from the Wikis module, or promote this build to production to publish it.
        </EmbedNote>
      </>
    );
  }

  // generic
  return (
    <>
      <Header title={app.name} right={`${ENV_LABELS[app.env]} · ${clock}`} />
      <div className="mb-5 grid grid-cols-2 gap-[14px]">
        <Card label="Status" value="Preview" valueColor="var(--accent-amber)" delta="serverless" />
        <Card label="Runtime" value="Vercel" delta="iad1 · edge" />
      </div>
      <div className="rounded-[10px] border border-line bg-bg-1 p-10 text-center">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-3">Embedded Application</div>
        <div className="mb-2 font-display text-[22px] text-ink-1">{app.name}</div>
        <div className="mx-auto max-w-[380px] text-[13px] leading-relaxed text-ink-2">
          React UI with serverless API proxy (api/claude.js) keeping the Anthropic key server-side. Deploy to Vercel from the controls panel.
        </div>
      </div>
      <EmbedNote>
        This app runs in <strong>{ENV_LABELS[app.env]}</strong>. Use the deployment rail to promote it through staging to production.
      </EmbedNote>
    </>
  );
}
