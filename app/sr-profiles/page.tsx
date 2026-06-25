"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TICKER_PROFILES, type TickerProfile, type SRLevel, type Scenario, type WeekLevel } from "./sr-data";

// ── Constants ─────────────────────────────────────────────────────────────────

const TICKERS = ["TSLA", "NVDA", "SPY", "XSP", "SPX", "QQQ", "AAPL", "PLTR", "SPCX"] as const;
type Ticker = typeof TICKERS[number];

const REFRESH_MS = 60_000;

// Yahoo Finance uses caret-prefix for index symbols
const YF_SYM: Partial<Record<Ticker, string>> = { SPX: "^SPX", XSP: "^XSP" };

const STATE_LABEL: Record<string, string> = {
  REGULAR: "● MARKET OPEN", PRE: "● PRE-MARKET", PREPRE: "● PRE-MARKET",
  POST: "● AFTER-HOURS", POSTPOST: "● AFTER-HOURS", CLOSED: "● MARKET CLOSED",
};
const STATE_COLOR: Record<string, string> = {
  REGULAR: "#22c55e", PRE: "#f59e0b", PREPRE: "#f59e0b",
  POST: "#94a3b8", POSTPOST: "#94a3b8", CLOSED: "#64748b",
};

// ── Live quote shape (matches /api/market normaliseQuote) ─────────────────────

interface LiveQuote {
  symbol:      string;
  price:       number;
  prevClose:   number;
  changePct:   number;
  volume:      number;
  open?:       number;
  high52?:     number;
  low52?:      number;
  avgVol?:     number;
  marketState: string;
}

// ── Date utils ────────────────────────────────────────────────────────────────

const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildDates() {
  const now = new Date(), dow = now.getDay();
  const full  = `${DAYS[dow]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  const short = `${MS[now.getMonth()]} ${now.getDate()}`;
  const gap   = dow === 0 ? 1 : 8 - dow;
  const nMon  = new Date(now); nMon.setDate(now.getDate() + gap);
  const nFri  = new Date(nMon); nFri.setDate(nMon.getDate() + 4);
  const sm    = nMon.getMonth() === nFri.getMonth();
  const wkS   = sm
    ? `${MS[nMon.getMonth()]} ${nMon.getDate()}–${nFri.getDate()}`
    : `${MS[nMon.getMonth()]} ${nMon.getDate()}–${MS[nFri.getMonth()]} ${nFri.getDate()}`;
  const wkR   = sm
    ? `${MS[nMon.getMonth()]} ${nMon.getDate()}–${nFri.getDate()}, ${nFri.getFullYear()}`
    : `${MS[nMon.getMonth()]} ${nMon.getDate()} – ${MS[nFri.getMonth()]} ${nFri.getDate()}, ${nFri.getFullYear()}`;
  return { full, short, wkS, wkR };
}

// ── Format helpers ────────────────────────────────────────────────────────────

const $p   = (n?: number | null) => n != null ? `$${Number(n).toFixed(2)}` : "—";
const sign = (n: number) => n >= 0 ? "+" : "";
const fmtVol = (v?: number) => {
  if (!v) return "—";
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return String(v);
};
const change$ = (q: LiveQuote) => (q.price - q.prevClose).toFixed(2);

// ── Dynamic scenario target derivation ───────────────────────────────────────
// Replaces hardcoded price strings in scenToday with values computed live from
// the current spot price + the ticker's srLevels grid. Thesis/setup text is
// preserved unchanged — only target prices and stops are updated.

function deriveTargets(profile: TickerProfile, spot: number): TickerProfile["scenToday"] {
  const resistances = profile.srLevels
    .filter(l => l.type === "resistance" && l.price > spot)
    .sort((a, b) => a.price - b.price); // nearest first
  const supports = profile.srLevels
    .filter(l => l.type === "support" && l.price < spot)
    .sort((a, b) => b.price - a.price); // nearest first

  const fmt = (n: number) => n.toFixed(2);

  return profile.scenToday.map(s => {
    const lbl = s.label.toLowerCase();

    if (lbl.includes("bull")) {
      const tgts = resistances.slice(0, 3);
      const stop = supports[0]?.price ?? spot * 0.98;
      return {
        ...s,
        targets: tgts.length
          ? tgts.map((l, i) => ({ k: `Target ${i + 1}`, v: fmt(l.price) }))
          : s.targets,
        stop: fmt(stop),
      };
    }

    if (lbl.includes("bear")) {
      const tgts = supports.slice(0, 3);
      const stop = resistances[0]?.price ?? spot * 1.02;
      return {
        ...s,
        targets: tgts.length
          ? tgts.map((l, i) => ({ k: `Target ${i + 1}`, v: fmt(l.price) }))
          : s.targets,
        stop: fmt(stop),
      };
    }

    // Base / Neutral: nearest resistance above + nearest support below
    const baseTgts: { k: string; v: string }[] = [];
    if (resistances[0]) baseTgts.push({ k: "Target 1", v: fmt(resistances[0].price) });
    if (supports[0])    baseTgts.push({ k: "Target 2", v: fmt(supports[0].price) });
    if (resistances[1]) baseTgts.push({ k: "Target 3", v: fmt(resistances[1].price) });
    const baseStop = supports[1]?.price ?? (supports[0] ? supports[0].price * 0.99 : spot * 0.98);
    return {
      ...s,
      targets: baseTgts.length ? baseTgts : s.targets,
      stop: fmt(baseStop),
    };
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Stars({ n }: { n: number }) {
  if (n === 0) return null;
  return (
    <span style={{ color: "#f59e0b", letterSpacing: 1, fontSize: 11 }}>
      {"★".repeat(n)}{"☆".repeat(4 - n)}
    </span>
  );
}

function SRTable({ levels, quote, stamp }: {
  levels: SRLevel[];
  quote:  LiveQuote | null;
  stamp:  Date | null;
}) {
  const liveLabel = quote && stamp
    ? `LIVE  ${stamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
    : null;

  const rows: (SRLevel & { isCurrent?: boolean })[] = [
    ...levels,
    ...(quote && liveLabel ? [{ price: quote.price, label: liveLabel, str: 0, type: "support" as const, isCurrent: true }] : []),
  ].sort((a, b) => b.price - a.price);

  if (rows.length === 0) {
    return (
      <div style={{ padding: "24px 16px", color: "#475569", fontSize: 12, textAlign: "center", lineHeight: 1.7 }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>⊟</div>
        No S/R levels configured yet.<br />
        Add entries to <code style={{ color: "#60a5fa", fontSize: 11 }}>sr-data.ts</code> to populate this table.
      </div>
    );
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {rows.map((lv, i) => {
          const isCur  = !!lv.isCurrent;
          const isRes  = lv.type === "resistance";
          const strong = lv.str >= 3;
          const priceColor = isCur ? "#fde68a"
            : isRes ? (strong ? "#f87171" : "#fca5a5")
            : (strong ? "#4ade80" : "#86efac");
          const labelColor = isCur ? "#fde68a" : strong ? "#e2e8f0" : "#94a3b8";
          const fw = (strong || isCur) ? 700 : 400;
          const bg = isCur ? "rgba(250,204,21,0.13)"
            : strong && isRes  ? "rgba(239,68,68,0.06)"
            : strong && !isRes ? "rgba(34,197,94,0.06)"
            : "transparent";
          const borderLeft = isCur ? "3px solid #fde68a"
            : strong && isRes  ? "3px solid #ef4444"
            : strong && !isRes ? "3px solid #22c55e"
            : "3px solid transparent";
          return (
            <tr key={i} style={{ background: bg, transition: "background 0.3s" }}>
              <td style={{ padding: "5px 12px 5px 10px", fontFamily: "monospace", fontSize: 13, whiteSpace: "nowrap", color: priceColor, fontWeight: fw, borderLeft }}>
                {lv.price.toFixed(2)}
              </td>
              <td style={{ padding: "5px 8px", textAlign: "center", width: 72 }}>
                {isCur
                  ? <span style={{ background: "#fde68a", color: "#000", fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 3, letterSpacing: 1 }}>NOW</span>
                  : <Stars n={lv.str} />
                }
              </td>
              <td style={{ padding: "5px 10px 5px 6px", fontSize: 12, color: labelColor, fontWeight: fw === 700 ? 600 : 400 }}>
                {lv.label}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SnapGrid({ quote, stamp, up }: { quote: LiveQuote; stamp: Date; up: boolean }) {
  const cc  = up ? "#22c55e" : "#ef4444";
  const chg = parseFloat(change$(quote));
  const cells = [
    { k: "Price",     v: $p(quote.price),   c: "#fde68a" },
    { k: "Change",    v: `${sign(chg)}${chg.toFixed(2)} (${sign(quote.changePct)}${quote.changePct.toFixed(2)}%)`, c: cc },
    { k: "Day High",  v: quote.high52  ? $p(quote.open) : "—", c: "#94a3b8" },
    { k: "Volume",    v: fmtVol(quote.volume),                  c: "#34d399" },
    { k: "Prev Close",v: $p(quote.prevClose),                   c: "#94a3b8" },
    { k: "Bias",      v: up ? "BULLISH" : "BEARISH",            c: cc       },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
      {cells.map(c => (
        <div key={c.k} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 4, padding: "6px 10px" }}>
          <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1, marginBottom: 2, textTransform: "uppercase" }}>{c.k}</div>
          <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: c.c }}>{c.v}</div>
        </div>
      ))}
    </div>
  );
}

function ScenCard({ s, compact, quote }: { s: Scenario; compact?: boolean; quote?: LiveQuote | null }) {
  const isStale = (() => {
    if (!quote) return false;
    const vals = s.targets.map(t => parseFloat(t.v)).filter(v => !isNaN(v));
    if (!vals.length) return false;
    const lbl = s.label.toLowerCase();
    if (lbl.includes("bull")) return quote.price > Math.max(...vals);
    if (lbl.includes("bear")) return quote.price < Math.min(...vals);
    // Base / Neutral: stale if price is outside the full target range
    return quote.price > Math.max(...vals) || quote.price < Math.min(...vals);
  })();

  return (
    <div style={{
      borderRadius: 6, padding: compact ? "10px 12px" : "14px 16px", marginBottom: 10,
      background: s.bg,
      borderTop:    `1px solid ${isStale ? "rgba(245,158,11,0.4)" : s.color + "33"}`,
      borderRight:  `1px solid ${isStale ? "rgba(245,158,11,0.4)" : s.color + "33"}`,
      borderBottom: `1px solid ${isStale ? "rgba(245,158,11,0.4)" : s.color + "33"}`,
      borderLeft:   `3px solid ${isStale ? "#f59e0b" : s.color}`,
    }}>
      <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, color: isStale ? "#f59e0b" : s.color }}>
        {s.label}
        {isStale && <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 600, color: "#f59e0b", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 3, padding: "1px 6px", letterSpacing: 1, verticalAlign: "middle" }}>⚠ PRICE MOVED</span>}
      </div>
      {isStale && (
        <div style={{ marginBottom: 8, padding: "4px 10px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 3, fontSize: 10, color: "#d97706", letterSpacing: 0.5 }}>
          Live price has passed all targets — update scenarios in <code style={{ color: "#f59e0b" }}>sr-data.ts</code>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${s.targets.length + 1},1fr)`, gap: 6, marginBottom: 8 }}>
        {s.targets.map(t => (
          <div key={t.k} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "5px 8px", textAlign: "center" }}>
            <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 1, marginBottom: 2, textTransform: "uppercase" }}>{t.k}</div>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: s.color }}>{t.v}</div>
          </div>
        ))}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "5px 8px", textAlign: "center" }}>
          <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 1, marginBottom: 2, textTransform: "uppercase" }}>Stop</div>
          <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#ef4444" }}>{s.stop}</div>
        </div>
      </div>
      <div style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.55 }}>{s.thesis}</div>
      {s.setup && <div style={{ marginTop: 6, color: "#cbd5e1", fontSize: 11, fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 6 }}>⚡ {s.setup}</div>}
      {s.risk  && <div style={{ marginTop: 6, color: "#f59e0b", fontSize: 11, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 6 }}>⚠ {s.risk}</div>}
    </div>
  );
}

function WeekLevelsTable({ levels }: { levels: WeekLevel[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid #1e293b" }}>
          {["Price","R/S","Role"].map(h => (
            <th key={h} style={{ textAlign: "left", padding: "4px 10px", fontSize: 10, color: "#64748b", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {levels.map((lv, i) => {
          const color = lv.t === "R" ? "#f87171" : lv.t === "S" ? "#4ade80" : "#fde68a";
          const rsBg  = lv.t === "R" ? "rgba(239,68,68,0.1)" : lv.t === "S" ? "rgba(34,197,94,0.1)" : "rgba(253,230,138,0.1)";
          const key   = lv.role.includes("KEY") || lv.role.includes("ceiling");
          return (
            <tr key={i} style={{ background: key ? "rgba(250,204,21,0.04)" : "transparent", borderBottom: "1px solid #0f1626" }}>
              <td style={{ padding: "5px 10px", fontFamily: "monospace", fontSize: 13, fontWeight: 600, color }}>{lv.price.toFixed(2)}</td>
              <td style={{ padding: "5px 10px" }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 3, color, background: rsBg }}>{lv.t}</span>
              </td>
              <td style={{ padding: "5px 10px", fontSize: 11, color: "#94a3b8" }}>{lv.role}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

interface LiveCatalyst {
  icon:  "▲" | "▼";
  text:  string;
  up:    boolean;
  url?:  string;
  date?: string;
  source?: string;
}

export default function SRProfilesPage() {
  const [ticker, setTicker]   = useState<Ticker>("TSLA");
  const [subTab, setSubTab]   = useState<"today" | "week">("today");
  const [quote, setQuote]     = useState<LiveQuote | null>(null);
  const [stamp, setStamp]     = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [stale, setStale]     = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live catalysts state
  const [liveCatalysts,     setLiveCatalysts]     = useState<LiveCatalyst[] | null>(null);
  const [catalystsLoading,  setCatalystsLoading]  = useState(false);
  const [catalystsIsLive,   setCatalystsIsLive]   = useState(false);
  const [catalystsDate,     setCatalystsDate]     = useState<Date | null>(null);

  const fetchCatalysts = useCallback(async (sym: string) => {
    setCatalystsLoading(true);
    try {
      const res  = await fetch(`/api/catalysts?symbol=${encodeURIComponent(sym)}`);
      const json = await res.json();
      if (json.ok && json.catalysts?.length) {
        setLiveCatalysts(json.catalysts);
        setCatalystsIsLive(json.isLive);
        setCatalystsDate(new Date());
      }
    } catch {
      // silently fall back to static catalysts
    } finally {
      setCatalystsLoading(false);
    }
  }, []);

  const profile: TickerProfile = TICKER_PROFILES[ticker];
  const dates = buildDates();

  // Live-derived today scenarios: recalculate targets from spot price whenever
  // a quote is available, so Bull/Base/Bear always reflect current S/R proximity.
  const liveScenToday = quote ? deriveTargets(profile, quote.price) : profile.scenToday;

  const fetchQuote = useCallback(async (sym: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market?type=quotes&symbols=${sym}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Market API error");
      const q: LiveQuote | undefined = json.quotes?.[0];
      if (!q) throw new Error("No quote returned");
      setQuote(q);
      setStamp(new Date());
      setStale(false);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      if (quote) setStale(true);
    } finally {
      setLoading(false);
    }
  }, [quote]);

  const sym = YF_SYM[ticker] ?? ticker;

  // Fetch on ticker change and on auto-refresh interval
  useEffect(() => {
    setQuote(null);
    setStamp(null);
    setError(null);
    setStale(false);
    setLiveCatalysts(null);
    fetchQuote(sym);
    fetchCatalysts(ticker);
    if (timerRef.current) clearInterval(timerRef.current);
    // Refresh quote every 60s; catalysts once per ticker change (news doesn't need sub-minute refresh)
    timerRef.current = setInterval(() => fetchQuote(sym), REFRESH_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [ticker]); // eslint-disable-line react-hooks/exhaustive-deps

  const chg    = quote ? parseFloat(change$(quote)) : 0;
  const up     = chg >= 0;
  const cc     = up ? "#22c55e" : "#ef4444";
  const status = quote ? (STATE_LABEL[quote.marketState] ?? "● MARKET CLOSED") : null;
  const stColor= quote ? (STATE_COLOR[quote.marketState] ?? "#64748b") : "#64748b";
  const stampStr = stamp?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div style={{ minHeight: "100vh", background: "#060b13", color: "#e2e8f0", fontFamily: "'DM Sans', system-ui, sans-serif", paddingBottom: 40 }}>

      {/* ── TICKER SELECTOR ────────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg,#08111f 0%,#0d1e38 50%,#0a1628 100%)", borderBottom: "1px solid #1a3352", padding: "12px 24px 0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
        {/* Page label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#3b82f6", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
            ⊸ Support &amp; Resistance Profiles
          </span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "#334155" }}>
              {loading ? "⟳ Refreshing…" : stale ? "⚠ STALE DATA" : stamp ? `Live  ${stampStr}  •  60-sec auto-refresh` : "Fetching…"}
            </span>
            <button
              onClick={() => fetchQuote(sym)}
              disabled={loading}
              style={{
                background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 3, color: loading ? "#334155" : "#60a5fa",
                fontSize: 10, padding: "2px 8px", cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: 1, fontFamily: "monospace", transition: "all 0.15s",
              }}
            >
              ⟳ REFRESH
            </button>
          </span>
          {stale && <span style={{ fontSize: 10, color: "#f59e0b", border: "1px solid rgba(245,158,11,0.4)", padding: "1px 6px", borderRadius: 3 }}>⚠ STALE</span>}
        </div>

        {/* Ticker tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {TICKERS.map(t => (
            <button
              key={t}
              onClick={() => { setTicker(t); setSubTab("today"); }}
              style={{
                background: "none", border: "none",
                borderBottom: ticker === t ? "2px solid #3b82f6" : "2px solid transparent",
                color: ticker === t ? "#e2e8f0" : "#64748b",
                padding: "8px 14px 6px", fontSize: 12, fontWeight: ticker === t ? 700 : 400,
                letterSpacing: 0.5, cursor: "pointer", transition: "all 0.15s",
                fontFamily: "monospace",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── LIVE PRICE HEADER ──────────────────────────────────────────────── */}
      <div style={{ background: "#0b1524", borderBottom: "1px solid #1a3352", padding: "12px 24px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{ticker}</span>
          <span style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, textTransform: "uppercase" }}>{profile.name} — S/R Projection Dashboard</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {!quote && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 12 }}>
                <span style={{ display: "inline-block", animation: "ada-spin 1s linear infinite" }}>⟳</span>
                Fetching live data…
              </span>
            )}
            {quote && (
              <>
                <span style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 700, color: "#fde68a" }}>{$p(quote.price)}</span>
                <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 600, color: cc }}>
                  {sign(chg)}{chg.toFixed(2)} ({sign(quote.changePct)}{quote.changePct.toFixed(2)}%)
                </span>
                {status && <span style={{ fontSize: 10, fontWeight: 700, color: stColor }}>{status}</span>}
                <div style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, color: cc, background: up ? "#052010" : "#150202", border: `1px solid ${cc}44` }}>
                  {up ? "▲ BULLISH" : "▼ BEARISH"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats bar */}
        {quote && (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { k: "Volume",    v: fmtVol(quote.volume),   c: "#34d399" },
              { k: "Prev Close",v: $p(quote.prevClose),    c: "#94a3b8" },
              { k: "52W Range", v: quote.high52 ? `${$p(quote.low52)} – ${$p(quote.high52)}` : "see S/R table", c: "#94a3b8" },
              { k: "Earnings",  v: profile.earnings,       c: "#f59e0b" },
            ].map(s => (
              <div key={s.k} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 9, color: "#64748b", letterSpacing: 1, textTransform: "uppercase" }}>{s.k}</span>
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: s.c }}>{s.v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{ marginTop: 8, padding: "6px 12px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, fontSize: 11, color: "#f87171" }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* ── CATALYST BANNER ────────────────────────────────────────────────── */}
      <div style={{ padding: "7px 24px", display: "flex", alignItems: "center", gap: 10, fontSize: 11, background: "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.18)", color: "#f59e0b" }}>
        <span>⚑</span>
        {catalystsLoading
          ? <span style={{ color: "#64748b" }}>Fetching live catalysts…</span>
          : catalystsIsLive
            ? <span style={{ color: "#64748b" }}>Live news catalysts · {catalystsDate?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            : <span style={{ color: "#64748b" }}>Analyst catalysts · {profile.lastUpdated}</span>
        }
      </div>

      {/* ── SUB-TABS ───────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e293b", padding: "0 24px" }}>
        {[
          { id: "today" as const, label: `Today — ${dates.short}`   },
          { id: "week"  as const, label: `Next Week — ${dates.wkS}` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            style={{
              background: "none", border: "none",
              borderBottom: subTab === t.id ? "2px solid #3b82f6" : "2px solid transparent",
              color: subTab === t.id ? "#e2e8f0" : "#64748b",
              padding: "11px 20px 9px", fontSize: 13, fontWeight: subTab === t.id ? 600 : 400,
              letterSpacing: 0.5, cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BODY GRID ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "306px 1fr", gap: 20 }}>

        {/* ── LEFT: S/R PANEL ────────────────────────────────────────────── */}
        <div>
          <div style={{ background: "#0b1524", border: "1px solid #1a3352", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ background: "#0f1e35", padding: "10px 14px", borderBottom: "1px solid #1a3352", fontSize: 11, fontWeight: 700, color: "#93c5fd", letterSpacing: 2, textTransform: "uppercase" }}>
              Support &amp; Resistance
            </div>
            <SRTable levels={profile.srLevels} quote={quote} stamp={stamp} />
          </div>

          {/* Legend */}
          <div style={{ marginTop: 10, background: "#0b1524", border: "1px solid #1e293b", borderRadius: 6, padding: "10px 14px", fontSize: 11 }}>
            <div style={{ color: "#64748b", fontWeight: 600, marginBottom: 6, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>Legend</div>
            {[
              { c: "#f87171", l: "Resistance"                   },
              { c: "#4ade80", l: "Support"                      },
              { c: "#fde68a", l: "Live price (real-time)"       },
              { c: "#f59e0b", l: "★★★★ Strongest level"         },
            ].map(r => (
              <div key={r.l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, color: "#94a3b8" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: r.c, flexShrink: 0 }} />
                {r.l}
              </div>
            ))}
            {stamp && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1e293b" }}>
                <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1, marginBottom: 2, textTransform: "uppercase" }}>Data Source</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#93c5fd" }}>Yahoo Finance</div>
                <div style={{ fontSize: 9, color: "#334155", marginTop: 1 }}>60-second auto-refresh</div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
        <div>

          {/* TODAY TAB */}
          {subTab === "today" && (
            <>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>
                {dates.full} — Intraday Projection
              </div>

              {/* Market Snapshot */}
              {quote && stamp && (
                <div style={{ background: "#0b1524", border: "1px solid #1a3352", borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
                    Live Market Snapshot — Yahoo Finance &nbsp; {stampStr}
                  </div>
                  <SnapGrid quote={quote} stamp={stamp} up={up} />
                </div>
              )}

              {/* Active Catalysts */}
              {(() => {
                const items: { icon: "▲"|"▼"; text: string; up: boolean; url?: string; date?: string; source?: string }[] =
                  liveCatalysts ?? profile.catalysts;
                const isLive = !!liveCatalysts;
                if (!items.length && !catalystsLoading) return null;
                return (
                  <div style={{ background: "#0b1524", border: "1px solid #1a3352", borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                      Active Catalysts
                      <span style={{ fontSize: 9, fontWeight: 400, color: "#334155", letterSpacing: 1 }}>
                        {catalystsLoading
                          ? "fetching…"
                          : isLive
                            ? `live news · ${catalystsDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : `analyst · ${profile.lastUpdated}`
                        }
                      </span>
                    </div>
                    {catalystsLoading && (
                      <div style={{ color: "#334155", fontSize: 11 }}>Loading headlines…</div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {items.map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11 }}>
                          <span style={{ flexShrink: 0, fontSize: 10, marginTop: 2, color: c.up ? "#22c55e" : "#ef4444" }}>{c.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {c.url
                              ? <a href={c.url} target="_blank" rel="noopener noreferrer"
                                  style={{ color: c.up ? "#86efac" : "#fca5a5", textDecoration: "none" }}
                                  onMouseOver={e => (e.currentTarget.style.textDecoration = "underline")}
                                  onMouseOut={e  => (e.currentTarget.style.textDecoration = "none")}
                                >{c.text}</a>
                              : <span style={{ color: c.up ? "#86efac" : "#fca5a5" }}>{c.text}</span>
                            }
                            {(c.source || c.date) && (
                              <span style={{ marginLeft: 6, fontSize: 9, color: "#334155" }}>
                                {c.source}{c.source && c.date ? " · " : ""}{c.date}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Today scenarios — targets derived from live spot + S/R grid */}
              {liveScenToday.length > 0
                ? liveScenToday.map((s, i) => <ScenCard key={i} s={s} quote={quote} />)
                : (
                  <div style={{ background: "#0b1524", border: "1px solid #1e293b", borderRadius: 8, padding: "20px 16px", color: "#475569", fontSize: 12, textAlign: "center" }}>
                    No intraday scenarios configured yet — add to <code style={{ color: "#60a5fa" }}>sr-data.ts</code>
                  </div>
                )
              }

              {/* Today note */}
              {profile.todayNote && (
                <div style={{ background: "#0b1524", border: "1px solid #1e293b", borderRadius: 6, padding: "10px 14px", fontSize: 11, color: "#64748b", marginTop: 4 }}>
                  <strong style={{ color: "#334155" }}>NOTE: </strong>{profile.todayNote}
                </div>
              )}
            </>
          )}

          {/* NEXT WEEK TAB */}
          {subTab === "week" && (
            <>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>
                {dates.wkR} — Weekly Projection
              </div>

              {/* Week scenarios */}
              {profile.scenWeek.length > 0
                ? profile.scenWeek.map((s, i) => <ScenCard key={i} s={s} compact quote={quote} />)
                : (
                  <div style={{ background: "#0b1524", border: "1px solid #1e293b", borderRadius: 8, padding: "20px 16px", color: "#475569", fontSize: 12, textAlign: "center", marginBottom: 14 }}>
                    No weekly scenarios configured yet — add to <code style={{ color: "#60a5fa" }}>sr-data.ts</code>
                  </div>
                )
              }

              {/* Weekly levels table */}
              {profile.weekLevels.length > 0 && (
                <div style={{ background: "#0b1524", border: "1px solid #1a3352", borderRadius: 8, padding: "12px 16px", marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
                    Key Weekly Levels to Watch
                  </div>
                  <WeekLevelsTable levels={profile.weekLevels} />
                </div>
              )}

              {/* Week note */}
              {profile.weekNote && (
                <div style={{ background: "#0b1524", border: "1px solid #1e293b", borderRadius: 6, padding: "10px 14px", fontSize: 11, color: "#64748b", marginTop: 10 }}>
                  <strong style={{ color: "#334155" }}>WEEK NOTE: </strong>{profile.weekNote}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "right", padding: "12px 24px 0", fontSize: 10, color: "#334155", borderTop: "1px solid #0f1626", marginTop: 4 }}>
        Atila Bayat | Research Director, Alpha Data Architects Group | For Trading Use Only
      </div>

      {/* Spin keyframe */}
      <style>{`
        @keyframes ada-spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .sr-body { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
