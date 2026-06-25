"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageInner, PageHead, SecLabel, Panel } from "@/components/ui";

// ── Types ──────────────────────────────────────────────────────────────────────

type MktState = "REGULAR" | "PRE" | "POST" | "POSTPOST" | "PREPRE" | "CLOSED";

interface Quote {
  symbol:      string;
  shortName?:  string;
  price:       number;
  prevClose:   number;
  changePct:   number;
  volume:      number;
  open?:       number;
  high52?:     number;
  low52?:      number;
  avgVol?:     number;
  marketState: MktState;
}

interface Contract {
  otype:  "call" | "put";
  strike: number;
  expiry: string;
  volume: number;
  oi:     number;
  ratio:  string;
  iv:     string;
  lastPx: number;
  itm:    boolean;
  // Black-Scholes greeks computed server-side (present on the options feed).
  delta?: number;
  gamma?: number;
  vega?:  number;   // per 1 vol point, per share
  theta?: number;   // per calendar day, per share
  gex?:   number;   // dealer dollar-gamma per 1% move (calls +, puts −)
}

type Tab = "floor" | "walls" | "options" | "regime" | "portfolio" | "bloomberg";

// ── Symbol lists ───────────────────────────────────────────────────────────────

const WATCHLIST   = ["TSLA", "NVDA", "SPY", "QQQ", "AAPL", "AMZN", "F"] as const;
const SECTOR_SYMS = ["XLK","XLF","XLE","XLV","XLI","XLY","XLP","XLRE","XLU","XLB","XLC"] as const;
const FUTURES_SYMS = ["ES=F","NQ=F","YM=F","RTY=F","GC=F","CL=F","EURUSD=X"] as const;
const INTERNAL_SYMS = ["^VIX","^GSPC","^IXIC","^DJI","^VVIX","^PCALL"] as const;
const OPT_TICKERS = ["TSLA", "NVDA", "SPY", "XSP", "SPX", "QQQ", "AAPL", "PLTR", "SPCX"] as const;
// Yahoo Finance uses caret-prefixed symbols for index options chains
const OPT_YF_SYM: Record<string, string> = { XSP: "^XSP", SPX: "^SPX" };
function yfSym(s: string): string { return OPT_YF_SYM[s] ?? s; }

const SECTOR_NAMES: Record<string, string> = {
  XLK:"Technology", XLF:"Financials", XLE:"Energy", XLV:"Health Care",
  XLI:"Industrials", XLY:"Cons. Disc.", XLP:"Cons. Staples",
  XLRE:"Real Estate", XLU:"Utilities", XLB:"Materials", XLC:"Comm. Svcs.",
};
const FUTURES_NAMES: Record<string, string> = {
  "ES=F":"S&P 500 Fut","NQ=F":"Nasdaq Fut","YM=F":"Dow Fut",
  "RTY=F":"Russell Fut","GC=F":"Gold","CL=F":"Crude Oil","EURUSD=X":"EUR/USD",
};
const INTERNAL_NAMES: Record<string, string> = {
  "^VIX":"VIX","^GSPC":"S&P 500","^IXIC":"Nasdaq","^DJI":"Dow Jones",
  "^VVIX":"VVIX","^PCALL":"Put/Call Ratio",
};

// ── Stub / seed data (shown immediately; replaced by live data on mount) ───────

const mkStub = (sym: string, px: number, prev: number, chg: number, vol: number): Quote => ({
  symbol: sym, price: px, prevClose: prev, changePct: chg, volume: vol, marketState: "CLOSED",
});

const STUB_TICKERS: Quote[] = [
  mkStub("TSLA", 432.18, 420.12,  2.84,  82_500_000),
  mkStub("NVDA", 894.50, 884.50,  1.12,  45_200_000),
  mkStub("SPY",  612.04, 609.72,  0.38,  62_100_000),
  mkStub("QQQ",  548.91, 545.52,  0.62,  38_400_000),
  mkStub("AAPL", 234.72, 235.69, -0.41,  55_800_000),
  mkStub("AMZN", 218.40, 216.35,  0.94,  28_700_000),
  mkStub("F",     11.84,  12.00, -1.20,  95_300_000),
];

const emptyQuote = (sym: string): Quote => ({
  symbol: sym, price: 0, prevClose: 0, changePct: 0, volume: 0, marketState: "CLOSED",
});

// ── Formatting helpers ─────────────────────────────────────────────────────────

function fmtPx(n: number, decimals = 2): string {
  if (n === 0) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
function fmtRaw(n: number, decimals = 2): string {
  if (n === 0) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtPct(n: number): string {
  if (n === 0) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}
function fmtVol(n: number): string {
  if (n === 0) return "—";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

// Institutional bias from 1-day change
function bias(chg: number): { label: string; cls: string } {
  if (chg >  0.5) return { label: "Bullish", cls: "bg-[rgba(45,212,191,0.12)] text-accent-teal" };
  if (chg < -0.5) return { label: "Bearish", cls: "bg-[rgba(255,86,119,0.12)] text-accent-rose" };
  return { label: "Neutral", cls: "bg-[rgba(77,141,255,0.12)] text-accent" };
}

// Sector heat-map color (green ↔ red with 3 intensity levels)
function heatCls(chg: number): string {
  if (chg >  1.5) return "bg-[rgba(45,212,191,0.22)] text-accent-teal";
  if (chg >  0.4) return "bg-[rgba(45,212,191,0.11)] text-[rgba(45,212,191,0.85)]";
  if (chg >  0)   return "bg-[rgba(45,212,191,0.05)] text-[rgba(45,212,191,0.6)]";
  if (chg > -0.4) return "bg-[rgba(255,86,119,0.05)] text-[rgba(255,86,119,0.6)]";
  if (chg > -1.5) return "bg-[rgba(255,86,119,0.11)] text-[rgba(255,86,119,0.85)]";
  return "bg-[rgba(255,86,119,0.22)] text-accent-rose";
}

// Market session status indicator
function sessionBadge(state: MktState): { text: string; dot: string; textCls: string } {
  if (state === "REGULAR")
    return { text: "Live",            dot: "bg-accent-teal animate-pulse shadow-[0_0_6px_var(--accent-teal)]", textCls: "text-accent-teal" };
  if (state === "PRE")
    return { text: "Pre-Market",      dot: "bg-accent-amber",                                                   textCls: "text-accent-amber" };
  if (state === "POST" || state === "POSTPOST")
    return { text: "Post-Market",     dot: "bg-accent-amber",                                                   textCls: "text-accent-amber" };
  return   { text: "Closed · Prior",  dot: "bg-[#555]",                                                         textCls: "text-ink-3" };
}

function secsAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

// ── API helper (defined outside component — no stale closure risk) ─────────────

/**
 * Force every request to bypass the browser HTTP cache. Without this, repeated
 * GETs to the same /api/market URL return a cached response, so the Refresh
 * buttons appear to do nothing. We add `cache: "no-store"` AND a per-call
 * cache-busting timestamp so each refresh is a genuine round-trip to live data.
 */
async function getJSON<T>(url: string): Promise<T> {
  const bust = url + (url.includes("?") ? "&" : "?") + "_ts=" + Date.now();
  const res  = await fetch(bust, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
  return (await res.json()) as T;
}

async function fetchQuotes(symbols: readonly string[]): Promise<Quote[]> {
  const data = await getJSON<{ ok: boolean; quotes?: Quote[]; error?: string }>(`/api/market?type=quotes&symbols=${symbols.join(",")}`);
  if (!data.ok) throw new Error(data.error ?? "fetch failed");
  return data.quotes ?? [];
}

async function fetchContracts(sym: string): Promise<Contract[]> {
  const data = await getJSON<{ ok: boolean; contracts?: Contract[]; error?: string }>(`/api/market?type=options&symbol=${yfSym(sym)}`);
  if (!data.ok) throw new Error(data.error ?? "fetch failed");
  return data.contracts ?? [];
}

// Deeper chain (+ underlying spot) for the Options Flow workbench.
async function fetchChain(sym: string, limit = 60): Promise<{ contracts: Contract[]; spot: number }> {
  const data = await getJSON<{ ok: boolean; contracts?: Contract[]; spot?: number; error?: string }>(`/api/market?type=options&symbol=${yfSym(sym)}&limit=${limit}`);
  if (!data.ok) throw new Error(data.error ?? "fetch failed");
  return { contracts: data.contracts ?? [], spot: data.spot ?? 0 };
}

interface TermExp {
  expiry: string; dte: number; atmIV: number;
  callOI: number; putOI: number; callVol: number; putVol: number;
}
// Multi-expiry term structure (separate Yahoo calls per expiration).
async function fetchTerm(sym: string, n = 6): Promise<{ term: TermExp[]; spot: number }> {
  const data = await getJSON<{ ok: boolean; term?: TermExp[]; spot?: number; error?: string }>(`/api/market?type=term&symbol=${yfSym(sym)}&n=${n}`);
  if (!data.ok) throw new Error(data.error ?? "fetch failed");
  return { term: data.term ?? [], spot: data.spot ?? 0 };
}

// Daily close history (for realized vol + moving averages).
async function fetchHistory(sym: string, range = "1y"): Promise<number[]> {
  const data = await getJSON<{ ok: boolean; closes?: number[]; error?: string }>(`/api/market?type=history&symbol=${encodeURIComponent(sym)}&range=${range}`);
  if (!data.ok) throw new Error(data.error ?? "fetch failed");
  return data.closes ?? [];
}

// Per-strike × per-expiry GEX map (call-wall / put-wall system).
interface GexRowMap { strike: number; net: number[]; callGex: number; putGex: number; totalNet: number; }
interface GexMap {
  symbol: string; spot: number; changePct: number; marketState: MktState;
  expiries: string[]; rows: GexRowMap[];
  summary: { callWall: number; putWall: number; zeroGamma: number; netGex: number };
}
async function fetchGexMap(sym: string, n = 5, width = 70): Promise<GexMap> {
  const data = await getJSON<{ ok: boolean } & Partial<GexMap> & { error?: string }>(`/api/market?type=gexmap&symbol=${encodeURIComponent(yfSym(sym))}&n=${n}&width=${width}`);
  if (!data.ok) throw new Error(data.error ?? "fetch failed");
  return {
    symbol: data.symbol ?? sym, spot: data.spot ?? 0, changePct: data.changePct ?? 0,
    marketState: (data.marketState ?? "CLOSED") as MktState,
    expiries: data.expiries ?? [], rows: data.rows ?? [],
    summary: data.summary ?? { callWall: 0, putWall: 0, zeroGamma: 0, netGex: 0 },
  };
}

// ── Spinner component (reused throughout) ─────────────────────────────────────
function Spin() {
  return (
    <span className="inline-block h-[10px] w-[10px] animate-spin rounded-full border-2 border-line-strong border-t-accent" />
  );
}

/**
 * Data-fetch timestamp badge — the validation stamp shown on every panel.
 * Renders the absolute wall-clock time of the last successful fetch (HH:MM:SS),
 * a relative "Ns ago", and a live/stale pulse. While fetching it shows a
 * spinner + "fetching…". `nowTick` is threaded in so the relative age re-renders
 * each second.
 */
function Stamp({ ts, loading, err }: { ts: number | null; loading?: boolean; err?: string | null }) {
  if (loading) {
    return (
      <span className="flex items-center gap-[5px] font-mono text-[9px] uppercase tracking-[0.08em] text-accent-amber">
        <Spin /> fetching…
      </span>
    );
  }
  if (err) {
    return <span className="font-mono text-[9px] text-accent-rose" title={err}>⚠ fetch failed</span>;
  }
  if (!ts) return <span className="font-mono text-[9px] text-ink-3">— no data —</span>;
  const fresh = Date.now() - ts < 90_000; // pulse green if under 90s old
  const hhmmss = new Date(ts).toLocaleTimeString("en-US", { hour12: false });
  return (
    <span className="flex items-center gap-[5px] font-mono text-[9px] text-ink-3" title={new Date(ts).toLocaleString()}>
      <span className={`h-[5px] w-[5px] rounded-full ${fresh ? "bg-accent-teal animate-pulse shadow-[0_0_5px_var(--accent-teal)]" : "bg-[#666]"}`} />
      <span className="text-ink-2">⟳ {hhmmss}</span>
      <span className="text-ink-3">· {secsAgo(ts)}</span>
    </span>
  );
}

/** 1-second ticking clock so relative timestamps ("Ns ago") stay current
 *  without each panel wiring its own interval. */
function useNowTick(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ── Quant Modules (preserved from original design) ────────────────────────────
const MODULES = [
  { ic: "P", name: "Put Wall Monitor",  cat: "Options · Live",          desc: "Real-time put wall detection across MAG-7 with morning sentinel hooks.",       status: "live"    },
  { ic: "G", name: "Gamma Exposure",    cat: "Options · Flow",          desc: "Dealer gamma exposure heatmap across the next 5 expiries.",                     status: "live"    },
  { ic: "V", name: "VIX Regime",        cat: "Volatility · Classifier", desc: "Term-structure regime classifier with SPX backtest overlay.",                   status: "staging" },
];
const modTone: Record<string, string> = { live: "text-accent-teal", staging: "text-accent-amber" };

function QuantModules() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[14px]">
      {MODULES.map((m) => (
        <div key={m.name} className="rounded-[10px] border border-line bg-bg-1 p-[18px]">
          <div className="mb-[14px] flex items-center gap-3">
            <div
              className="grid h-10 w-10 place-items-center rounded-lg font-display text-base font-bold text-white"
              style={{ background: "linear-gradient(135deg,var(--accent-amber),rgba(245,183,72,0.3))" }}
            >
              {m.ic}
            </div>
            <div>
              <div className="font-display text-[15px] font-medium">{m.name}</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-2">{m.cat}</div>
            </div>
          </div>
          <div className="mb-[14px] text-[12px] leading-relaxed text-ink-2">{m.desc}</div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <div className={`flex items-center gap-[6px] font-mono text-[9px] uppercase tracking-[0.1em] ${modTone[m.status]}`}>
              <span className="h-[6px] w-[6px] rounded-full bg-current shadow-[0_0_6px_currentColor]" />
              {m.status === "live" ? "LIVE" : "STAGING"}
            </div>
            <div className="cursor-pointer font-mono text-[10px] text-ink-1 transition hover:text-accent-hot">Launch ↗</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  OPTIONS FLOW WORKBENCH
//  Six panels a senior options PM watches: premium flow direction, cross-ticker
//  sentiment, dealer gamma, vol term structure, unusual sweeps, expiry / OI
//  structure. All derived from the live chain for the selected ticker plus a
//  cross-ticker put/call scan over the same watchlist.
// ════════════════════════════════════════════════════════════════════════════

const premiumOf = (c: Contract) => c.volume * c.lastPx * 100;

function fmtMoney(n: number): string {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
interface FlowStats {
  callVol: number; putVol: number; callPrem: number; putPrem: number;
  totPrem: number; bullPct: number; pcVol: number;
}
function flowStats(cs: Contract[]): FlowStats {
  let callVol = 0, putVol = 0, callPrem = 0, putPrem = 0;
  for (const c of cs) {
    const pr = premiumOf(c);
    if (c.otype === "call") { callVol += c.volume; callPrem += pr; }
    else                    { putVol  += c.volume; putPrem  += pr; }
  }
  const totPrem = callPrem + putPrem;
  return {
    callVol, putVol, callPrem, putPrem, totPrem,
    bullPct: totPrem > 0 ? callPrem / totPrem : 0.5,
    pcVol:   callVol > 0 ? putVol / callVol : 0,
  };
}

// Sentiment label from net-premium tilt
function flowSentiment(bullPct: number): { label: string; cls: string } {
  if (bullPct >= 0.62) return { label: "Bullish Flow",  cls: "text-accent-teal" };
  if (bullPct >= 0.55) return { label: "Lean Bullish",  cls: "text-[rgba(45,212,191,0.85)]" };
  if (bullPct <= 0.38) return { label: "Bearish Flow",  cls: "text-accent-rose" };
  if (bullPct <= 0.45) return { label: "Lean Bearish",  cls: "text-[rgba(255,86,119,0.85)]" };
  return { label: "Balanced", cls: "text-accent" };
}

// Put/Call heat for the cross-ticker matrix
function pcHeat(pc: number): string {
  if (pc === 0)   return "bg-bg-2 text-ink-3";
  if (pc <= 0.6)  return "bg-[rgba(45,212,191,0.20)] text-accent-teal";
  if (pc <= 0.85) return "bg-[rgba(45,212,191,0.10)] text-[rgba(45,212,191,0.85)]";
  if (pc <= 1.15) return "bg-[rgba(77,141,255,0.10)] text-accent";
  if (pc <= 1.5)  return "bg-[rgba(255,86,119,0.10)] text-[rgba(255,86,119,0.85)]";
  return "bg-[rgba(255,86,119,0.20)] text-accent-rose";
}

interface GexRow { strike: number; call: number; put: number; gex: number; }
function gexLadder(cs: Contract[], spot: number): {
  rows: GexRow[]; maxAbs: number; callWall: number; putWall: number;
  netGex: number; zeroGamma: number; realGreeks: boolean;
} {
  const byStrike = new Map<number, { call: number; put: number; gex: number }>();
  let hasGex = false;
  for (const c of cs) {
    const e = byStrike.get(c.strike) ?? { call: 0, put: 0, gex: 0 };
    if (c.otype === "call") e.call += c.oi; else e.put += c.oi;
    if (typeof c.gex === "number") { e.gex += c.gex; hasGex = true; }
    byStrike.set(c.strike, e);
  }
  // Use real dollar-gamma when available; else fall back to OI imbalance.
  const all = [...byStrike.entries()].map(([strike, o]) => ({
    strike, call: o.call, put: o.put,
    gex: hasGex ? o.gex : (o.call - o.put),
  }));
  const callWall = all.slice().sort((a, b) => b.gex - a.gex)[0]?.strike ?? 0; // most positive γ
  const putWall  = all.slice().sort((a, b) => a.gex - b.gex)[0]?.strike ?? 0; // most negative γ
  const netGex   = all.reduce((s, r) => s + r.gex, 0);

  // Zero-gamma flip: walk strikes low→high, find where cumulative γ crosses 0.
  const asc = all.slice().sort((a, b) => a.strike - b.strike);
  let cum = 0, zeroGamma = 0;
  for (let i = 0; i < asc.length; i++) {
    const prev = cum; cum += asc[i].gex;
    if (i > 0 && ((prev < 0 && cum >= 0) || (prev > 0 && cum <= 0))) { zeroGamma = asc[i].strike; break; }
  }

  // Show strikes nearest spot, displayed high→low.
  const near = (spot > 0 ? all.slice().sort((a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot)) : all)
    .slice(0, 9)
    .sort((a, b) => b.strike - a.strike);
  const maxAbs = Math.max(1, ...near.map((r) => Math.abs(r.gex)));
  return { rows: near, maxAbs, callWall, putWall, netGex, zeroGamma, realGreeks: hasGex };
}

interface WallRow { strike: number; oi: number; call: number; put: number; }
function oiWalls(cs: Contract[]): WallRow[] {
  const m = new Map<number, { call: number; put: number }>();
  for (const c of cs) {
    const e = m.get(c.strike) ?? { call: 0, put: 0 };
    if (c.otype === "call") e.call += c.oi; else e.put += c.oi;
    m.set(c.strike, e);
  }
  return [...m.entries()].map(([strike, o]) => ({ strike, oi: o.call + o.put, call: o.call, put: o.put }))
    .sort((a, b) => b.oi - a.oi).slice(0, 6);
}

interface PcCell { sym: string; pcVol: number; bullPct: number; totPrem: number; loaded: boolean; }

function OptionsFlow({ watch, internals, mktState }: { watch: Quote[]; internals: Quote[]; mktState: MktState }) {
  const [selSym, setSelSym]   = useState<string>("TSLA");
  const [chain,  setChain]    = useState<Contract[]>([]);
  const [spot,   setSpot]     = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [err,    setErr]      = useState<string | null>(null);

  const [term, setTerm]       = useState<TermExp[]>([]);
  const [termLoading, setTermLoading] = useState(false);

  const [matrix, setMatrix]   = useState<PcCell[]>(OPT_TICKERS.map((s) => ({ sym: s, pcVol: 0, bullPct: 0.5, totPrem: 0, loaded: false })));
  const [matLoading, setMatLoading] = useState(false);
  const [ts, setTs] = useState<number | null>(null);
  useNowTick();

  // Spot for the selected ticker (prefer chain spot, fall back to watchlist quote)
  const watchSpot = watch.find((q) => q.symbol === selSym)?.price ?? 0;
  const usedSpot  = spot > 0 ? spot : watchSpot;

  const loadChain = useCallback(async (sym: string) => {
    setLoading(true); setErr(null); setChain([]);
    try {
      const { contracts, spot } = await fetchChain(sym, 60);
      setChain(contracts); setSpot(spot); setTs(Date.now());
      if (!contracts.length) setErr(`No active options flow for ${sym}`);
    } catch { setErr(`Options chain unavailable for ${sym}`); }
    finally { setLoading(false); }
  }, []);

  const loadTerm = useCallback(async (sym: string) => {
    setTermLoading(true); setTerm([]);
    try {
      const { term } = await fetchTerm(sym, 6);
      setTerm(term);
    } catch { /* term panel shows empty state */ }
    finally { setTermLoading(false); }
  }, []);

  // Refresh the whole Options Flow workbench for the selected symbol.
  const refreshFlow = useCallback(() => {
    loadChain(selSym); loadTerm(selSym); loadMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selSym, loadChain, loadTerm]);

  const loadMatrix = useCallback(async () => {
    setMatLoading(true);
    try {
      const cells = await Promise.all(OPT_TICKERS.map(async (sym) => {
        try {
          const { contracts } = await fetchChain(sym, 40);
          const s = flowStats(contracts);
          return { sym, pcVol: s.pcVol, bullPct: s.bullPct, totPrem: s.totPrem, loaded: contracts.length > 0 };
        } catch {
          return { sym, pcVol: 0, bullPct: 0.5, totPrem: 0, loaded: false };
        }
      }));
      setMatrix(cells);
    } finally { setMatLoading(false); }
  }, []);

  useEffect(() => { loadChain(selSym); loadTerm(selSym); }, [selSym, loadChain, loadTerm]);
  useEffect(() => { loadMatrix(); }, [loadMatrix]);

  // ── Derived analytics ──────────────────────────────────────────────────────
  const stats   = flowStats(chain);
  const sent    = flowSentiment(stats.bullPct);
  const topFlow = chain.slice().sort((a, b) => premiumOf(b) - premiumOf(a)).slice(0, 6);
  const gex     = gexLadder(chain, usedSpot);
  const unusual = chain.filter((c) => c.ratio !== "—" && parseFloat(c.ratio) >= 1).sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio)).slice(0, 7);
  const walls   = oiWalls(chain);
  // Expiry concentration uses total (call+put) volume per expiration from the
  // multi-expiry term feed, sorted by volume.
  const expConc = term.slice().map((t) => ({ expiry: t.expiry, vol: t.callVol + t.putVol })).sort((a, b) => b.vol - a.vol).slice(0, 6);
  const maxExpVol = Math.max(1, ...expConc.map((e) => e.vol));
  const maxTermIv = Math.max(1, ...term.map((t) => t.atmIV));
  const termShape = term.length >= 2
    ? (term[term.length - 1].atmIV > term[0].atmIV + 1 ? "Contango" : term[term.length - 1].atmIV < term[0].atmIV - 1 ? "Backwardation" : "Flat")
    : "—";

  const vix  = internals.find((q) => q.symbol === "^VIX")?.price ?? 0;
  const vvix = internals.find((q) => q.symbol === "^VVIX")?.price ?? 0;
  const pcr  = internals.find((q) => q.symbol === "^PCALL")?.price ?? 0;

  const closedNote = mktState !== "REGULAR";

  return (
    <>
      {/* ── Ticker selector ── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">Flow Symbol</div>
        <div className="flex flex-wrap gap-[5px]">
          {OPT_TICKERS.map((sym) => (
            <button
              key={sym}
              onClick={() => setSelSym(sym)}
              className={`rounded-[5px] px-[12px] py-[5px] font-mono text-[11px] uppercase tracking-[0.08em] transition ${
                selSym === sym
                  ? "bg-[rgba(245,183,72,0.15)] text-accent-amber"
                  : "border border-line text-ink-3 hover:border-line-strong hover:text-ink-1"
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
        {err && <span className="font-mono text-[9px] text-accent-rose">{err}</span>}
        <div className="ml-auto flex items-center gap-3">
          {closedNote && !err && (
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Market closed · most recent session</span>
          )}
          <Stamp ts={ts} loading={loading || termLoading || matLoading} err={err} />
          <button
            onClick={refreshFlow}
            disabled={loading}
            className={`flex items-center gap-[6px] rounded-[5px] border px-[12px] py-[4px] font-mono text-[10px] uppercase tracking-[0.08em] transition ${
              loading ? "cursor-not-allowed border-line text-ink-3 opacity-50" : "border-accent text-accent hover:bg-[rgba(77,141,255,0.06)]"
            }`}
          >
            {loading ? <><Spin /> Fetching…</> : <>↻ Refresh</>}
          </button>
        </div>
      </div>

      {/* ── Row 1: Net Premium Flow | Cross-Ticker Sentiment ── */}
      <div className="mb-5 grid grid-cols-[2fr_1fr] gap-[14px] max-[1000px]:grid-cols-1">

        {/* Panel 1 — Net Premium Flow */}
        <Panel>
          <div className="mb-[14px] flex items-center justify-between">
            <div>
              <div className="font-display text-[18px] font-medium">{selSym} · Net Premium Flow</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
                Directional $ premium · call vs put · top sweeps
              </div>
            </div>
            <div className={`font-mono text-[12px] font-semibold ${sent.cls}`}>{sent.label}</div>
          </div>

          {/* Bull/Bear premium gauge */}
          <div className="mb-2 flex items-center justify-between font-mono text-[10px]">
            <span className="text-accent-teal">Calls {fmtMoney(stats.callPrem)}</span>
            <span className="text-accent-rose">{fmtMoney(stats.putPrem)} Puts</span>
          </div>
          <div className="relative mb-[6px] flex h-[10px] overflow-hidden rounded-[4px] bg-bg-3">
            <span className="h-full bg-accent-teal/70" style={{ width: `${(stats.bullPct * 100).toFixed(1)}%` }} />
            <span className="h-full bg-accent-rose/70" style={{ width: `${((1 - stats.bullPct) * 100).toFixed(1)}%` }} />
          </div>
          <div className="mb-[14px] flex justify-between font-mono text-[9px] text-ink-3">
            <span>{(stats.bullPct * 100).toFixed(0)}% call premium</span>
            <span>P/C vol {stats.pcVol ? stats.pcVol.toFixed(2) : "—"}</span>
          </div>

          {/* Top sweeps tape */}
          <div className="mb-1 flex items-center border-b border-line pb-[6px] font-mono text-[8px] uppercase tracking-[0.12em] text-ink-3">
            <span className="w-[42px]">Side</span>
            <span className="w-[60px]">Strike</span>
            <span className="w-[58px]">Expiry</span>
            <span className="ml-auto w-[68px] text-right">Premium</span>
            <span className="w-[58px] text-right">Vol/OI</span>
            <span className="w-[44px] text-right">IV</span>
          </div>
          {topFlow.length === 0 && !loading && (
            <div className="py-6 text-center font-mono text-[11px] text-ink-3">No flow to display.</div>
          )}
          {topFlow.map((c, i) => (
            <div key={i} className="flex items-center border-b border-line py-[7px] last:border-0">
              <span className={`w-[42px] rounded-[3px] px-[5px] py-px font-mono text-[9px] uppercase ${
                c.otype === "call" ? "bg-[rgba(45,212,191,0.12)] text-accent-teal" : "bg-[rgba(255,86,119,0.12)] text-accent-rose"
              }`}>{c.otype}</span>
              <span className="w-[60px] font-mono text-[12px] text-ink-0">${c.strike}</span>
              <span className="w-[58px] font-mono text-[10px] text-ink-3">{c.expiry}</span>
              <span className="ml-auto w-[68px] text-right font-mono text-[12px] font-semibold text-ink-1">{fmtMoney(premiumOf(c))}</span>
              <span className={`w-[58px] text-right font-mono text-[10px] ${
                c.ratio !== "—" && parseFloat(c.ratio) >= 1 ? "font-semibold text-accent-amber" : "text-ink-2"
              }`}>{c.ratio === "—" ? "—" : `${c.ratio}×`}</span>
              <span className="w-[44px] text-right font-mono text-[10px] text-ink-2">{c.iv}</span>
            </div>
          ))}
        </Panel>

        {/* Panel 2 — Cross-Ticker Sentiment Matrix */}
        <Panel>
          <div className="mb-[12px] flex items-center justify-between">
            <div>
              <div className="font-display text-[15px] font-medium">Cross-Ticker Sentiment</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Put/Call vol · same watchlist</div>
            </div>
            {matLoading && <Spin />}
          </div>
          <div className="grid grid-cols-1 gap-[6px]">
            {matrix.map((m) => (
              <button
                key={m.sym}
                onClick={() => setSelSym(m.sym)}
                className={`flex items-center gap-3 rounded-[6px] px-[10px] py-[8px] text-left transition ${pcHeat(m.pcVol)} ${
                  selSym === m.sym ? "ring-1 ring-accent-amber" : ""
                }`}
              >
                <span className="w-[44px] font-mono text-[12px] font-bold">{m.sym}</span>
                <div className="flex-1">
                  <div className="font-mono text-[9px] uppercase tracking-[0.08em] opacity-70">P/C ratio</div>
                  <div className="font-mono text-[14px] font-semibold">{m.loaded ? m.pcVol.toFixed(2) : "—"}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[9px] uppercase tracking-[0.08em] opacity-70">Bull%</div>
                  <div className="font-mono text-[12px]">{m.loaded ? `${(m.bullPct * 100).toFixed(0)}%` : "—"}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-[10px] border-t border-line pt-[8px] font-mono text-[9px] text-ink-3">
            Mkt Put/Call {pcr ? pcr.toFixed(2) : "—"} · &lt;0.7 greedy · &gt;1.0 fearful
          </div>
        </Panel>
      </div>

      {/* ── Row 2: Gamma Profile | IV Term Structure | Unusual Activity ── */}
      <div className="mb-5 grid grid-cols-3 gap-[14px] max-[1000px]:grid-cols-1">

        {/* Panel 3 — Dealer Gamma Profile (real Black-Scholes γ) */}
        <Panel>
          <div className="mb-[10px] flex items-center justify-between">
            <div>
              <div className="font-display text-[15px] font-medium">Dealer Gamma Profile</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
                {selSym} · {gex.realGreeks ? "$γ by strike (BS)" : "net OI by strike"}
              </div>
            </div>
            {loading && <Spin />}
          </div>

          {/* Net GEX + zero-gamma flip */}
          <div className="mb-[10px] grid grid-cols-2 gap-2 rounded-[6px] bg-bg-2 px-3 py-[8px]">
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-3">Net GEX /1%</div>
              <div className={`font-mono text-[13px] font-semibold ${gex.netGex >= 0 ? "text-accent-teal" : "text-accent-rose"}`}>
                {gex.realGreeks ? `${gex.netGex >= 0 ? "+" : "−"}${fmtMoney(Math.abs(gex.netGex)).replace("$", "$")}` : (gex.netGex >= 0 ? "+" : "") + (gex.netGex / 1000).toFixed(0) + "k"}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-3">Zero Gamma</div>
              <div className="font-mono text-[13px] font-semibold text-ink-0">{gex.zeroGamma ? `$${gex.zeroGamma}` : "—"}</div>
            </div>
          </div>

          <div className="mb-[8px] flex justify-between font-mono text-[10px]">
            <span className="text-accent-rose">Put Wall ${gex.putWall || "—"}</span>
            <span className="text-accent-teal">Call Wall ${gex.callWall || "—"}</span>
          </div>

          {gex.rows.length === 0 && !loading && (
            <div className="py-6 text-center font-mono text-[11px] text-ink-3">No open-interest data.</div>
          )}
          {gex.rows.map((r) => {
            const pct = (Math.abs(r.gex) / gex.maxAbs) * 100;
            const callSide = r.gex >= 0;
            const isSpot = usedSpot > 0 && gex.rows.reduce((best, x) => Math.abs(x.strike - usedSpot) < Math.abs(best - usedSpot) ? x.strike : best, gex.rows[0].strike) === r.strike;
            return (
              <div key={r.strike} className="flex items-center gap-2 py-[3px] font-mono text-[10px]">
                <span className={`w-[48px] text-right ${isSpot ? "font-bold text-accent-amber" : "text-ink-1"}`}>
                  ${r.strike}
                </span>
                <div className="relative h-[12px] flex-1 overflow-hidden rounded-[2px] bg-bg-3">
                  <span
                    className={`absolute top-0 h-full ${callSide ? "bg-accent-teal/60 left-1/2" : "bg-accent-rose/60 right-1/2"}`}
                    style={{ width: `${(pct / 2).toFixed(1)}%` }}
                  />
                  <span className="absolute left-1/2 top-0 h-full w-px bg-line-strong" />
                </div>
                <span className={`w-[52px] text-right ${callSide ? "text-accent-teal" : "text-accent-rose"}`}>
                  {gex.realGreeks
                    ? `${r.gex >= 0 ? "+" : "−"}${fmtMoney(Math.abs(r.gex))}`
                    : `${r.gex >= 0 ? "+" : ""}${(r.gex / 1000).toFixed(1)}k`}
                </span>
              </div>
            );
          })}
          <div className="mt-[8px] flex justify-between font-mono text-[8px] text-ink-3">
            <span>◀ put-heavy (support)</span><span>call-heavy (resistance) ▶</span>
          </div>
        </Panel>

        {/* Panel 4 — IV Term Structure */}
        <Panel>
          <div className="mb-[12px] flex items-center justify-between">
            <div>
              <div className="font-display text-[15px] font-medium">IV Term Structure</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">{selSym} · ATM IV across expiries</div>
            </div>
            {termLoading && <Spin />}
          </div>

          {term.length === 0 && !termLoading && (
            <div className="py-6 text-center font-mono text-[11px] text-ink-3">No IV data.</div>
          )}
          {term.map((t) => (
            <div key={t.expiry} className="mb-[7px]">
              <div className="mb-[2px] flex justify-between font-mono text-[10px]">
                <span className="text-ink-2">{t.expiry} <span className="text-ink-3">· {t.dte}d</span></span>
                <span className="text-ink-0">{t.atmIV.toFixed(1)}%</span>
              </div>
              <div className="h-[6px] overflow-hidden rounded-[2px] bg-bg-3">
                <span className="block h-full bg-gradient-to-r from-accent to-accent-violet"
                  style={{ width: `${((t.atmIV / maxTermIv) * 100).toFixed(0)}%` }} />
              </div>
            </div>
          ))}

          <div className="mt-[12px] border-t border-line pt-[10px]">
            <div className="flex items-center justify-between py-[3px] font-mono text-[11px]">
              <span className="text-ink-2">Term shape</span>
              <span className={termShape === "Backwardation" ? "text-accent-rose" : termShape === "Contango" ? "text-accent-teal" : "text-ink-1"}>{termShape}</span>
            </div>
            <div className="flex items-center justify-between py-[3px] font-mono text-[11px]">
              <span className="text-ink-2">VIX / VVIX</span>
              <span className="text-ink-1">{vix ? vix.toFixed(1) : "—"} / {vvix ? vvix.toFixed(0) : "—"}</span>
            </div>
          </div>
        </Panel>

        {/* Panel 5 — Unusual Activity */}
        <Panel>
          <div className="mb-[12px] flex items-center justify-between">
            <div>
              <div className="font-display text-[15px] font-medium">Unusual Activity</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">{selSym} · Vol ≥ OI = new positioning</div>
            </div>
            {loading && <Spin />}
          </div>

          {unusual.length === 0 && !loading && (
            <div className="py-6 text-center font-mono text-[11px] text-ink-3">No unusual prints.</div>
          )}
          {unusual.map((c, i) => {
            const r = parseFloat(c.ratio);
            const kind = r >= 3 ? "Sweep" : r >= 1.8 ? "Aggr." : "Block";
            return (
              <div key={i} className="flex items-center border-b border-line py-[7px] last:border-0 font-mono">
                <span className={`w-[38px] rounded-[3px] px-[4px] py-px text-[9px] uppercase ${
                  c.otype === "call" ? "bg-[rgba(45,212,191,0.12)] text-accent-teal" : "bg-[rgba(255,86,119,0.12)] text-accent-rose"
                }`}>{c.otype}</span>
                <span className="w-[54px] text-[11px] text-ink-0">${c.strike}</span>
                <span className="flex-1 text-[10px] text-ink-3">{c.expiry}</span>
                <span className="w-[44px] text-right text-[11px] font-semibold text-accent-amber">{c.ratio}×</span>
                <span className="ml-2 w-[44px] rounded-[3px] bg-bg-3 px-[5px] py-px text-right text-[8px] uppercase text-ink-2">{kind}</span>
              </div>
            );
          })}
        </Panel>
      </div>

      {/* ── Row 3: Expiry Concentration & OI Walls ── */}
      <Panel className="mb-6">
        <div className="mb-[14px]">
          <div className="font-display text-[18px] font-medium">{selSym} · Expiry Concentration &amp; Open-Interest Walls</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
            Where volume clusters by expiry · largest OI strikes (pin / max-pain zones)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[24px] max-[760px]:grid-cols-1">
          {/* Expiry concentration */}
          <div>
            <div className="mb-[8px] flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2">
              Volume by Expiry {termLoading && <Spin />}
            </div>
            {expConc.length === 0 && !termLoading && (
              <div className="py-4 font-mono text-[11px] text-ink-3">No data.</div>
            )}
            {expConc.map((e) => (
              <div key={e.expiry} className="mb-[8px] flex items-center gap-3">
                <span className="w-[56px] font-mono text-[11px] text-ink-1">{e.expiry}</span>
                <div className="h-[14px] flex-1 overflow-hidden rounded-[3px] bg-bg-3">
                  <span className="block h-full bg-gradient-to-r from-accent-amber to-[rgba(245,183,72,0.4)]"
                    style={{ width: `${((e.vol / maxExpVol) * 100).toFixed(0)}%` }} />
                </div>
                <span className="w-[56px] text-right font-mono text-[10px] text-ink-2">{fmtVol(e.vol)}</span>
              </div>
            ))}
          </div>

          {/* OI walls */}
          <div>
            <div className="mb-[8px] font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2">Largest OI Strikes</div>
            <div className="mb-1 flex items-center border-b border-line pb-[6px] font-mono text-[8px] uppercase tracking-[0.12em] text-ink-3">
              <span className="w-[64px]">Strike</span>
              <span className="ml-auto w-[64px] text-right">Call OI</span>
              <span className="w-[64px] text-right">Put OI</span>
              <span className="w-[56px] text-right">Total</span>
            </div>
            {walls.length === 0 && !loading && (
              <div className="py-4 font-mono text-[11px] text-ink-3">No data.</div>
            )}
            {walls.map((w) => {
              const callHeavy = w.call >= w.put;
              return (
                <div key={w.strike} className="flex items-center border-b border-line py-[7px] last:border-0 font-mono">
                  <span className={`w-[64px] text-[12px] ${usedSpot > 0 && Math.abs(w.strike - usedSpot) / usedSpot < 0.01 ? "font-bold text-accent-amber" : "text-ink-0"}`}>
                    ${w.strike}
                  </span>
                  <span className="ml-auto w-[64px] text-right text-[10px] text-accent-teal">{w.call.toLocaleString()}</span>
                  <span className="w-[64px] text-right text-[10px] text-accent-rose">{w.put.toLocaleString()}</span>
                  <span className={`w-[56px] text-right text-[11px] font-semibold ${callHeavy ? "text-accent-teal" : "text-accent-rose"}`}>
                    {fmtVol(w.oi)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-[14px] border-t border-line pt-[10px] font-mono text-[9px] text-ink-3">
          GEX / walls use Black-Scholes γ computed from live implied vol (r≈4.3%), aggregated over the active chain (top {60} by volume).
          {closedNote ? " Most-recent session — refreshes when markets reopen." : " Live during regular hours."}
        </div>
      </Panel>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  REGIME LAB
//  Six panels framing the macro / volatility backdrop a senior PM sizes into:
//  vol-regime radar, vol-risk-premium, cross-asset risk-on/off, tail risk/skew,
//  rates & curve, and a trend regime across the same watchlist.
// ════════════════════════════════════════════════════════════════════════════

const REGIME_SYMS = [
  "^VIX9D", "^VIX", "^VIX3M", "^VVIX", "^SKEW", "^PCALL",   // vol / skew complex
  "^IRX", "^FVX", "^TNX", "^TYX", "DX-Y.NYB",               // rates + dollar
  "SPY", "TLT", "GLD", "UUP", "HYG", "USO", "BTC-USD",      // cross-asset
] as const;

const CROSS: { sym: string; name: string; up: boolean }[] = [
  { sym: "SPY",     name: "S&P 500",        up: true  },
  { sym: "HYG",     name: "HY Credit",      up: true  },
  { sym: "USO",     name: "Crude Oil",      up: true  },
  { sym: "BTC-USD", name: "Bitcoin",        up: true  },
  { sym: "TLT",     name: "20Y Treasuries", up: false },
  { sym: "GLD",     name: "Gold",           up: false },
  { sym: "UUP",     name: "US Dollar",      up: false },
];

const RATES: { sym: string; name: string }[] = [
  { sym: "^IRX", name: "3-Month" },
  { sym: "^FVX", name: "5-Year"  },
  { sym: "^TNX", name: "10-Year" },
  { sym: "^TYX", name: "30-Year" },
];

// Annualised realised volatility (%) from the last `win` daily log returns.
function realizedVol(closes: number[], win = 20): number {
  if (closes.length < win + 1) return 0;
  const rets: number[] = [];
  for (let i = closes.length - win; i < closes.length; i++) {
    if (closes[i - 1] > 0) rets.push(Math.log(closes[i] / closes[i - 1]));
  }
  if (rets.length < 2) return 0;
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const varr = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1);
  return Math.sqrt(varr * 252) * 100;
}
function sma(closes: number[], n: number): number {
  if (closes.length < n) return 0;
  return closes.slice(-n).reduce((a, b) => a + b, 0) / n;
}
// Treasury indices sometimes quote yield×10 (e.g. 43.1 → 4.31%); normalise.
const normYield = (v: number): number => (v > 15 ? v / 10 : v);

function RegimeLab({ watch }: { watch: Quote[] }) {
  const [rq, setRq] = useState<Quote[]>([]);
  const [rqLoading, setRqLoading] = useState(false);
  const [hist, setHist] = useState<Record<string, number[]>>({});
  const [histLoading, setHistLoading] = useState(false);
  const [ts, setTs] = useState<number | null>(null);
  useNowTick();

  const loadRegime = useCallback(async () => {
    setRqLoading(true);
    try { const q = await fetchQuotes(REGIME_SYMS); setRq(q); setTs(Date.now()); }
    catch { /* panels show — where empty */ }
    finally { setRqLoading(false); }
  }, []);

  const loadHist = useCallback(async () => {
    setHistLoading(true);
    try {
      const entries = await Promise.all(
        WATCHLIST.map(async (s) => { try { return [s, await fetchHistory(s, "1y")] as const; } catch { return [s, [] as number[]] as const; } })
      );
      setHist(Object.fromEntries(entries));
    } finally { setHistLoading(false); }
  }, []);

  const refreshRegime = useCallback(() => { loadRegime(); loadHist(); }, [loadRegime, loadHist]);

  useEffect(() => { loadRegime(); loadHist(); }, [loadRegime, loadHist]);

  const get = (sym: string): Quote | undefined => rq.find((q) => q.symbol === sym);
  const px  = (sym: string): number => get(sym)?.price ?? 0;

  // ── Panel 1: Volatility regime ───────────────────────────────────────────
  const vix9d = px("^VIX9D"), vix = px("^VIX"), vix3m = px("^VIX3M"), vvix = px("^VVIX");
  const contango = vix > 0 && vix3m > 0 ? vix3m / vix : 0;          // >1 calm, <1 stress
  const backwardation = contango > 0 && contango < 1;
  const regime =
    vix >= 30 || backwardation ? { label: "STRESS",   cls: "bg-[rgba(255,86,119,0.15)] text-accent-rose",  play: "De-risk · own convexity · vol spikes self-reinforce" }
  : vix >= 20                  ? { label: "ELEVATED", cls: "bg-[rgba(245,183,72,0.15)] text-accent-amber", play: "Trim size · favour spreads · mean-reversion edge" }
  : vix >= 15                  ? { label: "NORMAL",   cls: "bg-[rgba(77,141,255,0.12)] text-accent",        play: "Balanced · trend + carry both viable" }
  :                             { label: "LOW VOL · CONTANGO", cls: "bg-[rgba(45,212,191,0.12)] text-accent-teal", play: "Carry / short-vol tailwind · sell premium" };
  const volTerm = [
    { k: "VIX9D", v: vix9d }, { k: "VIX", v: vix }, { k: "VIX3M", v: vix3m },
  ].filter((t) => t.v > 0);
  const maxVol = Math.max(1, ...volTerm.map((t) => t.v));

  // ── Panel 2: Vol risk premium ─────────────────────────────────────────────
  const spyCloses = hist["SPY"] ?? [];
  const rv20 = realizedVol(spyCloses, 20), rv10 = realizedVol(spyCloses, 10);
  const vrp  = vix > 0 && rv20 > 0 ? vix - rv20 : 0;
  const vrpRead = vrp >= 5 ? { label: "Rich — sell premium", cls: "text-accent-teal" }
                : vrp <= 0 ? { label: "Cheap — own vol",     cls: "text-accent-rose" }
                :            { label: "Fair value",          cls: "text-accent" };

  // ── Panel 3: Cross-asset risk ─────────────────────────────────────────────
  const crossRows = CROSS.map((c) => ({ ...c, q: get(c.sym) }));
  let riskScore = 0, riskN = 0;
  for (const r of crossRows) {
    if (!r.q || r.q.price === 0) continue;
    riskN++;
    const dir = r.q.changePct >= 0 ? 1 : -1;
    riskScore += dir * (r.up ? 1 : -1);
  }
  const riskPct = riskN ? (riskScore / riskN) : 0;           // -1..1
  const riskLabel = riskPct > 0.3 ? { t: "RISK-ON",  c: "text-accent-teal" }
                  : riskPct < -0.3 ? { t: "RISK-OFF", c: "text-accent-rose" }
                  :                  { t: "MIXED",    c: "text-accent-amber" };

  // ── Panel 4: Tail risk / skew ─────────────────────────────────────────────
  const skew = px("^SKEW"), pcall = px("^PCALL");
  const skewRead = skew >= 145 ? { label: "High tail demand", cls: "text-accent-rose" }
                 : skew >= 135 ? { label: "Elevated",         cls: "text-accent-amber" }
                 : skew > 0    ? { label: "Complacent",       cls: "text-accent-teal" }
                 :               { label: "—",                cls: "text-ink-3" };

  // ── Panel 6: Rates & curve ────────────────────────────────────────────────
  const y3m = normYield(px("^IRX")), y10 = normYield(px("^TNX"));
  const slope = y10 && y3m ? y10 - y3m : 0;                  // 10y − 3m (×100 bps)
  const curveRead = slope < -0.1 ? { label: "Inverted", cls: "text-accent-rose" }
                  : slope < 0.3  ? { label: "Flat",     cls: "text-accent-amber" }
                  :                { label: "Steep",    cls: "text-accent-teal" };
  const dxy = px("DX-Y.NYB");

  // ── Panel 5: Trend regime across the watchlist ────────────────────────────
  const trend = WATCHLIST.map((sym) => {
    const closes = hist[sym] ?? [];
    const q = watch.find((w) => w.symbol === sym);
    const last = q?.price && q.price > 0 ? q.price : closes[closes.length - 1] ?? 0;
    const ma50 = sma(closes, 50), ma200 = sma(closes, 200);
    const rangePos = q?.high52 && q?.low52 && q.high52 > q.low52
      ? ((last - q.low52) / (q.high52 - q.low52)) * 100 : null;
    const label = ma50 && ma200 && last
      ? (last > ma50 && ma50 > ma200 ? { t: "Uptrend",    c: "text-accent-teal" }
        : last < ma50 && ma50 < ma200 ? { t: "Downtrend",  c: "text-accent-rose" }
        :                               { t: "Transition", c: "text-accent-amber" })
      : { t: "—", c: "text-ink-3" };
    return { sym, last, ma50, ma200, rangePos, label, chg: q?.changePct ?? 0 };
  });

  const Loading = rqLoading || histLoading;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">Regime Snapshot</div>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">· Last fetch</span>
        <Stamp ts={ts} loading={Loading} />
        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Vol · cross-asset · rates · trend</span>
          <button
            onClick={refreshRegime}
            disabled={Loading}
            className={`flex items-center gap-[6px] rounded-[5px] border px-[12px] py-[4px] font-mono text-[10px] uppercase tracking-[0.08em] transition ${
              Loading ? "cursor-not-allowed border-line text-ink-3 opacity-50" : "border-accent text-accent hover:bg-[rgba(77,141,255,0.06)]"
            }`}
          >
            {Loading ? <><Spin /> Fetching…</> : <>↻ Refresh</>}
          </button>
        </div>
      </div>

      {/* ── Row 1: Vol Regime Radar | Vol Risk Premium ── */}
      <div className="mb-5 grid grid-cols-[2fr_1fr] gap-[14px] max-[1000px]:grid-cols-1">

        {/* Panel 1 — Volatility Regime Radar */}
        <Panel>
          <div className="mb-[14px] flex items-center justify-between">
            <div>
              <div className="font-display text-[18px] font-medium">Volatility Regime Radar</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">VIX term structure · VVIX</div>
            </div>
            <div className={`rounded-[5px] px-[12px] py-[6px] font-mono text-[12px] font-semibold ${regime.cls}`}>{regime.label}</div>
          </div>

          {/* VIX term bars */}
          {volTerm.map((t) => (
            <div key={t.k} className="mb-[8px] flex items-center gap-3">
              <span className="w-[52px] font-mono text-[11px] text-ink-2">{t.k}</span>
              <div className="h-[12px] flex-1 overflow-hidden rounded-[3px] bg-bg-3">
                <span className="block h-full bg-gradient-to-r from-accent-amber to-accent-rose"
                  style={{ width: `${((t.v / maxVol) * 100).toFixed(0)}%` }} />
              </div>
              <span className="w-[44px] text-right font-mono text-[12px] font-semibold text-ink-0">{t.v.toFixed(1)}</span>
            </div>
          ))}

          <div className="mt-[12px] grid grid-cols-3 gap-2 border-t border-line pt-[12px]">
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-3">Term VIX3M/VIX</div>
              <div className={`font-mono text-[13px] font-semibold ${backwardation ? "text-accent-rose" : "text-accent-teal"}`}>
                {contango ? contango.toFixed(2) : "—"} {backwardation ? "↓" : "↑"}
              </div>
            </div>
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-3">VVIX (vol-of-vol)</div>
              <div className="font-mono text-[13px] font-semibold text-ink-0">{vvix ? vvix.toFixed(0) : "—"}</div>
            </div>
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-3">Structure</div>
              <div className={`font-mono text-[12px] font-semibold ${backwardation ? "text-accent-rose" : "text-accent-teal"}`}>
                {contango ? (backwardation ? "Backwardation" : "Contango") : "—"}
              </div>
            </div>
          </div>
          <div className="mt-[10px] rounded-[5px] bg-bg-2 px-3 py-[7px] font-mono text-[10px] text-ink-2">
            <span className="text-ink-3">Playbook · </span>{regime.play}
          </div>
        </Panel>

        {/* Panel 2 — Vol Risk Premium */}
        <Panel>
          <div className="mb-[14px]">
            <div className="font-display text-[15px] font-medium">Vol Risk Premium</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">SPY implied − realized</div>
          </div>

          <div className="mb-[10px] text-center">
            <div className={`font-display text-[34px] font-medium leading-none ${vrp >= 0 ? "text-accent-teal" : "text-accent-rose"}`}>
              {vrp ? `${vrp >= 0 ? "+" : ""}${vrp.toFixed(1)}` : "—"}
            </div>
            <div className="mt-[2px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">VRP points (vol)</div>
            <div className={`mt-[6px] font-mono text-[11px] ${vrpRead.cls}`}>{rv20 ? vrpRead.label : "awaiting history"}</div>
          </div>

          {[
            ["Implied (VIX)", vix, "text-ink-0"],
            ["Realized 20d",  rv20, "text-ink-1"],
            ["Realized 10d",  rv10, "text-ink-2"],
          ].map(([k, v, c]) => (
            <div key={k as string} className="flex items-center justify-between border-b border-line py-[7px] font-mono text-[12px] last:border-0">
              <span className="text-ink-2">{k as string}</span>
              <span className={c as string}>{(v as number) ? `${(v as number).toFixed(1)}%` : "—"}</span>
            </div>
          ))}
          {histLoading && <div className="mt-2 text-center"><Spin /></div>}
        </Panel>
      </div>

      {/* ── Row 2: Cross-Asset | Tail Risk | Rates & Curve ── */}
      <div className="mb-5 grid grid-cols-3 gap-[14px] max-[1000px]:grid-cols-1">

        {/* Panel 3 — Cross-Asset Risk */}
        <Panel>
          <div className="mb-[12px] flex items-center justify-between">
            <div>
              <div className="font-display text-[15px] font-medium">Cross-Asset Risk</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Risk-on / risk-off tape</div>
            </div>
            <div className={`font-mono text-[12px] font-semibold ${riskLabel.c}`}>{riskN ? riskLabel.t : "—"}</div>
          </div>
          {crossRows.map((r) => {
            const has = r.q && r.q.price > 0;
            return (
              <div key={r.sym} className="flex items-center border-b border-line py-[7px] last:border-0 font-mono">
                <span className="w-[120px] text-[11px] text-ink-1">{r.name}</span>
                <span className="flex-1 text-[9px] text-ink-3">{r.up ? "risk-on↑" : "risk-off↓"}</span>
                <span className={`w-[60px] text-right text-[11px] ${has ? (r.q!.changePct >= 0 ? "text-accent-teal" : "text-accent-rose") : "text-ink-3"}`}>
                  {has ? fmtPct(r.q!.changePct) : "—"}
                </span>
              </div>
            );
          })}
        </Panel>

        {/* Panel 4 — Tail Risk & Skew */}
        <Panel>
          <div className="mb-[12px]">
            <div className="font-display text-[15px] font-medium">Tail Risk &amp; Skew</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">CBOE SKEW · VVIX · Put/Call</div>
          </div>
          <div className="mb-[12px] text-center">
            <div className={`font-display text-[34px] font-medium leading-none ${skewRead.cls}`}>{skew ? skew.toFixed(0) : "—"}</div>
            <div className="mt-[2px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">CBOE SKEW Index</div>
            <div className={`mt-[6px] font-mono text-[11px] ${skewRead.cls}`}>{skewRead.label}</div>
          </div>
          {[
            ["VVIX", vvix, vvix >= 100 ? "text-accent-rose" : "text-ink-1"],
            ["Put/Call", pcall, pcall >= 1 ? "text-accent-rose" : "text-accent-teal"],
            ["VIX", vix, "text-ink-1"],
          ].map(([k, v, c]) => (
            <div key={k as string} className="flex items-center justify-between border-b border-line py-[7px] font-mono text-[12px] last:border-0">
              <span className="text-ink-2">{k as string}</span>
              <span className={c as string}>{(v as number) ? (v as number).toFixed(2) : "—"}</span>
            </div>
          ))}
          <div className="mt-[8px] font-mono text-[9px] text-ink-3">SKEW &gt;145 = crash-hedging bid · &lt;125 = complacency</div>
        </Panel>

        {/* Panel 6 — Rates & Curve */}
        <Panel>
          <div className="mb-[12px] flex items-center justify-between">
            <div>
              <div className="font-display text-[15px] font-medium">Rates &amp; Curve</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Treasury yields · USD</div>
            </div>
            <div className={`font-mono text-[11px] font-semibold ${curveRead.cls}`}>{slope ? curveRead.label : "—"}</div>
          </div>
          {RATES.map((r) => {
            const y = normYield(px(r.sym));
            return (
              <div key={r.sym} className="flex items-center justify-between border-b border-line py-[7px] font-mono text-[12px] last:border-0">
                <span className="text-ink-2">{r.name}</span>
                <span className="text-ink-0">{y ? `${y.toFixed(2)}%` : "—"}</span>
              </div>
            );
          })}
          <div className="mt-[10px] grid grid-cols-2 gap-2 border-t border-line pt-[10px]">
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-3">10y − 3m</div>
              <div className={`font-mono text-[13px] font-semibold ${slope < 0 ? "text-accent-rose" : "text-accent-teal"}`}>
                {slope ? `${slope >= 0 ? "+" : ""}${(slope * 100).toFixed(0)}bp` : "—"}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-3">US Dollar (DXY)</div>
              <div className="font-mono text-[13px] font-semibold text-ink-0">{dxy ? dxy.toFixed(2) : "—"}</div>
            </div>
          </div>
        </Panel>
      </div>

      {/* ── Row 3: Trend Regime across the watchlist ── */}
      <Panel className="mb-6">
        <div className="mb-[14px] flex items-center justify-between">
          <div>
            <div className="font-display text-[18px] font-medium">Trend Regime · Watchlist</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
              Price vs 50/200-day MA · 52-week range position
            </div>
          </div>
          {histLoading && <Spin />}
        </div>

        <div className="mb-1 flex items-center border-b border-line pb-[6px] font-mono text-[8px] uppercase tracking-[0.12em] text-ink-3">
          <span className="w-[60px]">Symbol</span>
          <span className="w-[80px] text-right">Last</span>
          <span className="w-[80px] text-right">50d MA</span>
          <span className="w-[80px] text-right">200d MA</span>
          <span className="flex-1 px-3">52-wk Range</span>
          <span className="w-[90px] text-right">Regime</span>
        </div>
        {trend.map((t) => (
          <div key={t.sym} className="flex items-center border-b border-line py-[9px] last:border-0">
            <span className="w-[60px] font-mono text-[13px] font-semibold text-ink-0">{t.sym}</span>
            <span className="w-[80px] text-right font-mono text-[12px] text-ink-1">{t.last ? fmtPx(t.last) : "—"}</span>
            <span className={`w-[80px] text-right font-mono text-[11px] ${t.ma50 && t.last >= t.ma50 ? "text-accent-teal" : "text-accent-rose"}`}>
              {t.ma50 ? fmtPx(t.ma50) : "—"}
            </span>
            <span className={`w-[80px] text-right font-mono text-[11px] ${t.ma200 && t.last >= t.ma200 ? "text-accent-teal" : "text-accent-rose"}`}>
              {t.ma200 ? fmtPx(t.ma200) : "—"}
            </span>
            <span className="flex-1 px-3">
              {t.rangePos !== null ? (
                <span className="relative block h-[8px] w-full overflow-hidden rounded-[3px] bg-bg-3">
                  <span className="absolute top-0 h-full w-[3px] rounded bg-accent-amber" style={{ left: `${Math.min(98, Math.max(0, t.rangePos)).toFixed(0)}%` }} />
                </span>
              ) : <span className="font-mono text-[10px] text-ink-3">—</span>}
            </span>
            <span className={`w-[90px] text-right font-mono text-[10px] font-semibold ${t.label.c}`}>{t.label.t}</span>
          </div>
        ))}
        <div className="mt-[12px] border-t border-line pt-[10px] font-mono text-[9px] text-ink-3">
          Realized vol &amp; MAs from 1-year daily history · yields normalised · vol/skew from CBOE indices.
        </div>
      </Panel>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  PORTFOLIO — position-level risk & exposure
//  A representative long/short book drawn from the firm ticker universe, priced
//  live. Aggregates the Black-Scholes greeks engine over option overlays and
//  runs beta-weighting, sector exposure, scenario/stress and parametric VaR.
// ════════════════════════════════════════════════════════════════════════════

// Reference betas (vs SPX) and GICS-style sectors for the ticker universe.
const BETA: Record<string, number> = {
  NVDA:1.75, AAPL:1.2, MSFT:0.95, AMD:1.8, SMCI:1.9, PLTR:2.6, IBM:0.9, ACN:1.1,
  GOOGL:1.05, META:1.3, DJT:1.8, TSLA:2.0, AMZN:1.3, TGT:0.9, SBUX:0.95, KSS:1.7, GM:1.4,
  LLY:0.45, MRNA:1.4, GE:1.1, GD:0.7, TT:1.05, BAH:0.8, ALLE:1.0, AAL:1.5, GS:1.3, RKT:2.2,
  AA:2.1, BP:0.8, SPY:1.0, QQQ:1.1, DIA:0.95, VGT:1.15, VT:0.9, SPXU:-3.0, BND:0.05, PTY:0.6,
};
const SECTOR: Record<string, string> = {
  NVDA:"Technology", AAPL:"Technology", MSFT:"Technology", AMD:"Technology", SMCI:"Technology",
  PLTR:"Technology", IBM:"Technology", ACN:"Technology", VGT:"Technology",
  GOOGL:"Comm Svcs", META:"Comm Svcs", DJT:"Comm Svcs",
  TSLA:"Cons Disc", AMZN:"Cons Disc", TGT:"Cons Disc", SBUX:"Cons Disc", KSS:"Cons Disc", GM:"Cons Disc",
  LLY:"Health Care", MRNA:"Health Care",
  GE:"Industrials", GD:"Industrials", TT:"Industrials", BAH:"Industrials", ALLE:"Industrials", AAL:"Industrials",
  GS:"Financials", RKT:"Financials", AA:"Materials", BP:"Energy",
  SPY:"Index ETF", QQQ:"Index ETF", DIA:"Index ETF", VT:"Index ETF", SPXU:"Index ETF",
  BND:"Fixed Income", PTY:"Fixed Income",
};
const SECTOR_IDIO: Record<string, number> = { // annualised residual vol %
  Technology:38, "Comm Svcs":32, "Cons Disc":40, "Health Care":34, Industrials:26,
  Financials:30, Materials:42, Energy:32, "Index ETF":14, "Fixed Income":7,
};
const DURATION: Record<string, number> = { BND:6.0, PTY:6.5, SPXU:0 }; // bond-like rate sensitivity

const getSector = (s: string) => SECTOR[s] ?? "Index ETF";
const getBeta   = (s: string) => BETA[s] ?? 1.0;
const getIdio   = (s: string) => SECTOR_IDIO[getSector(s)] ?? 30;

interface Pos { sym: string; qty: number; avgCost: number; }
// Long/short book (negative qty = short). All symbols are in the firm universe.
const POSITIONS: Pos[] = [
  // Core longs
  { sym:"NVDA", qty: 12000, avgCost: 150 }, { sym:"MSFT", qty: 4000, avgCost: 380 },
  { sym:"AAPL", qty: 7000,  avgCost: 250 }, { sym:"AMZN", qty: 6000, avgCost: 195 },
  { sym:"GOOGL",qty: 9000,  avgCost: 155 }, { sym:"META", qty: 2000, avgCost: 540 },
  { sym:"LLY",  qty: 1500,  avgCost: 760 }, { sym:"GE",   qty: 5000, avgCost: 165 },
  { sym:"GS",   qty: 2000,  avgCost: 460 }, { sym:"PLTR", qty: 15000,avgCost: 35  },
  { sym:"AMD",  qty: 6000,  avgCost: 115 }, { sym:"ACN",  qty: 1500, avgCost: 320 },
  { sym:"QQQ",  qty: 5000,  avgCost: 470 }, { sym:"VGT",  qty: 2500, avgCost: 540 },
  // Income / fixed-income
  { sym:"PTY",  qty: 20000, avgCost: 12  }, { sym:"BND",  qty: 8000, avgCost: 72  },
  // Tactical shorts / hedges
  { sym:"TSLA", qty: -3000, avgCost: 430 }, { sym:"KSS",  qty: -8000, avgCost: 17 },
  { sym:"AAL",  qty: -25000,avgCost: 13  }, { sym:"SBUX", qty: -5000, avgCost: 92 },
  { sym:"AA",   qty: -10000,avgCost: 36  }, { sym:"SPXU", qty: 4000,  avgCost: 12 },
];
const POS_SYMS = POSITIONS.map((p) => p.sym);

interface Overlay { sym: string; otype: "call" | "put"; qty: number; mny: number; }
// Option overlays — exercised through the live greeks engine.
const OVERLAYS: Overlay[] = [
  { sym:"SPY",  otype:"put",  qty: 400, mny: 0.95 }, // index downside protection
  { sym:"QQQ",  otype:"put",  qty: 150, mny: 0.95 },
  { sym:"NVDA", otype:"call", qty: 200, mny: 1.05 }, // upside convexity
];

interface OvGreek { sym:string; otype:"call"|"put"; qty:number; strike:number; spot:number; delta:number; gamma:number; vega:number; theta:number; lastPx:number; }

const CASH = 6_000_000;

function fmtUsd(n: number): string {
  const a = Math.abs(n), sign = n < 0 ? "−" : "";
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(0)}K`;
  return `${sign}$${a.toFixed(0)}`;
}

function PortfolioTab() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [spyHist, setSpyHist] = useState<number[]>([]);
  const [ovg, setOvg] = useState<OvGreek[]>([]);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState<number | null>(null);
  useNowTick();

  const loadBook = useCallback(async () => {
    setLoading(true);
    const [qs, hist, ovs] = await Promise.all([
      fetchQuotes(POS_SYMS).catch(() => [] as Quote[]),
      fetchHistory("SPY", "1y").catch(() => [] as number[]),
      Promise.all(OVERLAYS.map(async (o): Promise<OvGreek | null> => {
        try {
          const { contracts, spot } = await fetchChain(o.sym, 60);
          const pool = contracts.filter((c) => c.otype === o.otype && typeof c.gamma === "number");
          if (!pool.length || !spot) return null;
          const target = spot * o.mny;
          const c = pool.reduce((best, x) => Math.abs(x.strike - target) < Math.abs(best.strike - target) ? x : best, pool[0]);
          return { sym:o.sym, otype:o.otype, qty:o.qty, strike:c.strike, spot,
            delta:c.delta ?? 0, gamma:c.gamma ?? 0, vega:c.vega ?? 0, theta:c.theta ?? 0, lastPx:c.lastPx };
        } catch { return null; }
      })),
    ]);
    setQuotes(qs); setSpyHist(hist);
    setOvg(ovs.filter((x): x is OvGreek => x !== null));
    setTs(Date.now());
    setLoading(false);
  }, []);

  useEffect(() => { loadBook(); }, [loadBook]);

  const qOf = (s: string) => quotes.find((q) => q.symbol === s);

  // ── Priced positions ───────────────────────────────────────────────────────
  const priced = POSITIONS.map((p) => {
    const q = qOf(p.sym);
    const price = q?.price ?? 0;
    const prev  = q?.prevClose ?? price;
    const mv    = p.qty * price;
    return {
      ...p, price, prev, mv,
      dayPnl: p.qty * (price - prev),
      pnl:    p.qty * (price - p.avgCost),
      beta:   getBeta(p.sym), sector: getSector(p.sym),
      chgPct: q?.changePct ?? 0,
    };
  });

  const longMV  = priced.filter((p) => p.mv > 0).reduce((s, p) => s + p.mv, 0);
  const shortMV = priced.filter((p) => p.mv < 0).reduce((s, p) => s + p.mv, 0);
  const grossMV = priced.reduce((s, p) => s + Math.abs(p.mv), 0);
  const netMV   = longMV + shortMV;
  const dayPnl  = priced.reduce((s, p) => s + p.dayPnl, 0);
  const optMV   = ovg.reduce((s, o) => s + o.qty * 100 * o.lastPx, 0);
  const nav     = CASH + netMV + optMV;
  const leverage = nav > 0 ? grossMV / nav : 0;

  // ── Beta-weighted exposure (SPX-equivalent $) ─────────────────────────────
  const equityBetaW = priced.reduce((s, p) => s + p.mv * p.beta, 0);
  const optDelta$   = ovg.reduce((s, o) => s + o.qty * 100 * o.delta * o.spot, 0);
  const optBetaW    = ovg.reduce((s, o) => s + o.qty * 100 * o.delta * o.spot * getBeta(o.sym), 0);
  const betaW       = equityBetaW + optBetaW;

  // ── Portfolio greeks (options engine) ─────────────────────────────────────
  const netDelta$ = netMV + optDelta$;                                            // equity Δ=1
  const netGamma$ = ovg.reduce((s, o) => s + o.qty * 100 * o.gamma * o.spot * o.spot * 0.01, 0); // $/1%
  const netVega$  = ovg.reduce((s, o) => s + o.qty * 100 * o.vega, 0);            // $/1 vol pt
  const netTheta$ = ovg.reduce((s, o) => s + o.qty * 100 * o.theta, 0);          // $/day

  // ── Sector exposure (net + gross) ─────────────────────────────────────────
  const sectorMap = new Map<string, { net: number; gross: number }>();
  for (const p of priced) {
    const e = sectorMap.get(p.sector) ?? { net: 0, gross: 0 };
    e.net += p.mv; e.gross += Math.abs(p.mv);
    sectorMap.set(p.sector, e);
  }
  const sectors = [...sectorMap.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.gross - a.gross);
  const maxSectorGross = Math.max(1, ...sectors.map((s) => s.gross));

  // ── VaR (parametric factor model) ─────────────────────────────────────────
  const mktVolAnn = realizedVol(spyHist, 20) || 16;          // SPY realised, fallback 16%
  const mktDaily  = mktVolAnn / 100 / Math.sqrt(252);
  const sysDaily$ = Math.abs(betaW) * mktDaily;
  const idioDaily$ = Math.sqrt(priced.reduce((s, p) => {
    const v = Math.abs(p.mv) * (getIdio(p.sym) / 100 / Math.sqrt(252));
    return s + v * v;
  }, 0));
  const sigmaP$ = Math.sqrt(sysDaily$ * sysDaily$ + idioDaily$ * idioDaily$);
  const var95 = 1.645 * sigmaP$, var99 = 2.326 * sigmaP$, es95 = 2.062 * sigmaP$;

  // Standalone risk contribution (largest single-name daily $vol)
  const riskRows = priced.map((p) => {
    const tot = Math.abs(p.mv) * Math.sqrt(
      (p.beta * mktDaily) ** 2 + (getIdio(p.sym) / 100 / Math.sqrt(252)) ** 2
    );
    return { sym: p.sym, vol: tot };
  }).sort((a, b) => b.vol - a.vol).slice(0, 6);
  const maxRisk = Math.max(1, ...riskRows.map((r) => r.vol));

  // ── Scenario / stress ─────────────────────────────────────────────────────
  const spotShocks = [-10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10];
  const scenario = spotShocks.map((s) => {
    const eq = priced.reduce((sum, p) => sum + p.mv * p.beta * (s / 100), 0);
    const opt = ovg.reduce((sum, o) => {
      const uMove = getBeta(o.sym) * (s / 100) * o.spot;        // $ move in underlier
      const shD = o.qty * 100 * o.delta, shG = o.qty * 100 * o.gamma;
      return sum + shD * uMove + 0.5 * shG * uMove * uMove;
    }, 0);
    return { s, pnl: eq + opt };
  });
  const maxScn = Math.max(1, ...scenario.map((x) => Math.abs(x.pnl)));

  const volShocks = [-5, -2, 2, 5, 10].map((dv) => ({ dv, pnl: netVega$ * dv }));
  const rateShocks = [25, 50, 100].map((bp) => ({
    bp,
    pnl: -priced.reduce((s, p) => s + p.mv * (DURATION[p.sym] ?? 0) * (bp / 10000), 0),
  }));

  const navPct = (x: number) => (nav > 0 ? `${(x / nav * 100).toFixed(2)}%` : "—");

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">Risk Book · {POSITIONS.length} positions · {OVERLAYS.length} overlays</div>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">· Priced</span>
        <Stamp ts={ts} loading={loading} />
        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Live-priced · firm universe</span>
          <button
            onClick={loadBook}
            disabled={loading}
            className={`flex items-center gap-[6px] rounded-[5px] border px-[12px] py-[4px] font-mono text-[10px] uppercase tracking-[0.08em] transition ${
              loading ? "cursor-not-allowed border-line text-ink-3 opacity-50" : "border-accent text-accent hover:bg-[rgba(77,141,255,0.06)]"
            }`}
          >
            {loading ? <><Spin /> Pricing…</> : <>↻ Reprice</>}
          </button>
        </div>
      </div>

      {/* ── Row 1: Exposure Summary | Portfolio Greeks ── */}
      <div className="mb-5 grid grid-cols-[2fr_1fr] gap-[14px] max-[1000px]:grid-cols-1">

        {/* Panel 1 — Exposure Summary */}
        <Panel>
          <div className="mb-[14px] flex items-center justify-between">
            <div>
              <div className="font-display text-[18px] font-medium">Exposure Summary</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Net liquidation · long/short · leverage</div>
            </div>
            <div className="text-right">
              <div className="font-display text-[22px] font-medium leading-none">{fmtUsd(nav)}</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Net Asset Value</div>
            </div>
          </div>

          <div className="mb-[6px] flex justify-between font-mono text-[10px]">
            <span className="text-accent-teal">Long {fmtUsd(longMV)}</span>
            <span className="text-accent-rose">Short {fmtUsd(shortMV)}</span>
          </div>
          <div className="relative mb-[12px] flex h-[10px] overflow-hidden rounded-[4px] bg-bg-3">
            <span className="h-full bg-accent-teal/70" style={{ width: `${(longMV / grossMV * 100).toFixed(1)}%` }} />
            <span className="h-full bg-accent-rose/70" style={{ width: `${(-shortMV / grossMV * 100).toFixed(1)}%` }} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ["Gross", fmtUsd(grossMV), "text-ink-0"],
              ["Net", fmtUsd(netMV), netMV >= 0 ? "text-accent-teal" : "text-accent-rose"],
              ["Leverage", `${leverage.toFixed(2)}×`, "text-ink-0"],
              ["Net / NAV", navPct(netMV), "text-ink-1"],
              ["Day P&L", fmtUsd(dayPnl), dayPnl >= 0 ? "text-accent-teal" : "text-accent-rose"],
              ["β-Wtd Δ ($SPX)", fmtUsd(betaW), Math.abs(betaW) < grossMV * 0.5 ? "text-accent-teal" : "text-accent-amber"],
            ].map(([k, v, c]) => (
              <div key={k} className="rounded-[6px] bg-bg-2 px-3 py-[8px]">
                <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-3">{k}</div>
                <div className={`font-mono text-[14px] font-semibold ${c}`}>{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-[10px] font-mono text-[9px] text-ink-3">
            β-weighted delta is the SPX-equivalent dollar exposure (incl. option Δ). {navPct(betaW)} of NAV.
          </div>
        </Panel>

        {/* Panel 2 — Portfolio Greeks */}
        <Panel>
          <div className="mb-[14px]">
            <div className="font-display text-[15px] font-medium">Portfolio Greeks</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Overlay engine · BS-aggregated</div>
          </div>
          {[
            ["Net Δ ($)",      fmtUsd(netDelta$),  "equity + option delta", netDelta$ >= 0 ? "text-accent-teal" : "text-accent-rose"],
            ["Net Γ ($/1%)",   fmtUsd(netGamma$),  "convexity per 1% move", netGamma$ >= 0 ? "text-accent-teal" : "text-accent-rose"],
            ["Net Vega ($)",   fmtUsd(netVega$),   "per +1 vol point",       netVega$ >= 0 ? "text-accent-teal" : "text-accent-rose"],
            ["Net Θ ($/day)",  fmtUsd(netTheta$),  "time decay",             netTheta$ >= 0 ? "text-accent-teal" : "text-accent-rose"],
          ].map(([k, v, sub, c]) => (
            <div key={k} className="flex items-center justify-between border-b border-line py-[10px] last:border-0">
              <div>
                <div className="font-mono text-[12px] text-ink-1">{k}</div>
                <div className="font-mono text-[8px] uppercase tracking-[0.08em] text-ink-3">{sub}</div>
              </div>
              <div className={`font-mono text-[15px] font-semibold ${c}`}>{v}</div>
            </div>
          ))}
          <div className="mt-[8px] font-mono text-[9px] text-ink-3">
            From {ovg.length}/{OVERLAYS.length} overlays{loading ? " · loading…" : ""}. Long puts add positive Γ/Vega (downside convexity).
          </div>
        </Panel>
      </div>

      {/* ── Row 2: Sector Exposure | Value at Risk ── */}
      <div className="mb-5 grid grid-cols-2 gap-[14px] max-[1000px]:grid-cols-1">

        {/* Panel 3 — Sector Exposure */}
        <Panel>
          <div className="mb-[12px] font-display text-[15px] font-medium">Sector Exposure</div>
          {sectors.map((s) => {
            const netW = s.net >= 0;
            return (
              <div key={s.name} className="mb-[9px] flex items-center gap-3">
                <span className="w-[96px] font-mono text-[11px] text-ink-1">{s.name}</span>
                <div className="relative h-[14px] flex-1 overflow-hidden rounded-[3px] bg-bg-3">
                  <span className={`absolute top-0 h-full ${netW ? "bg-accent-teal/60 left-1/2" : "bg-accent-rose/60 right-1/2"}`}
                    style={{ width: `${(Math.abs(s.net) / maxSectorGross * 50).toFixed(1)}%` }} />
                  <span className="absolute left-1/2 top-0 h-full w-px bg-line-strong" />
                </div>
                <span className={`w-[64px] text-right font-mono text-[11px] ${netW ? "text-accent-teal" : "text-accent-rose"}`}>{fmtUsd(s.net)}</span>
              </div>
            );
          })}
          <div className="mt-[8px] flex justify-between font-mono text-[8px] text-ink-3"><span>◀ net short</span><span>net long ▶</span></div>
        </Panel>

        {/* Panel 4 — Value at Risk */}
        <Panel>
          <div className="mb-[12px] flex items-center justify-between">
            <div className="font-display text-[15px] font-medium">Value at Risk</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">1-day · parametric</div>
          </div>
          <div className="mb-[12px] grid grid-cols-3 gap-2">
            {[
              ["VaR 95%", var95], ["VaR 99%", var99], ["ES 97.5%", es95],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-[6px] bg-bg-2 px-2 py-[8px] text-center">
                <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-3">{k as string}</div>
                <div className="font-mono text-[15px] font-semibold text-accent-rose">{fmtUsd(v as number)}</div>
                <div className="font-mono text-[9px] text-ink-3">{navPct(v as number)}</div>
              </div>
            ))}
          </div>
          <div className="mb-[6px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Top standalone risk (daily $vol)</div>
          {riskRows.map((r) => (
            <div key={r.sym} className="mb-[5px] flex items-center gap-3">
              <span className="w-[52px] font-mono text-[11px] text-ink-1">{r.sym}</span>
              <div className="h-[10px] flex-1 overflow-hidden rounded-[2px] bg-bg-3">
                <span className="block h-full bg-gradient-to-r from-accent-amber to-accent-rose" style={{ width: `${(r.vol / maxRisk * 100).toFixed(0)}%` }} />
              </div>
              <span className="w-[60px] text-right font-mono text-[10px] text-ink-2">{fmtUsd(r.vol)}</span>
            </div>
          ))}
          <div className="mt-[8px] font-mono text-[9px] text-ink-3">
            Factor model: systematic (β·SPY σ {mktVolAnn.toFixed(0)}%) + idiosyncratic. Normal-VaR.
          </div>
        </Panel>
      </div>

      {/* ── Row 3: Scenario & Stress ── */}
      <Panel className="mb-5">
        <div className="mb-[14px]">
          <div className="font-display text-[18px] font-medium">Scenario &amp; Stress</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
            β-adjusted spot shocks (with option convexity) · vol shocks · rate shocks
          </div>
        </div>

        {/* Spot shock grid */}
        <div className="mb-[6px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">SPX Spot Shock → Portfolio P&amp;L</div>
        <div className="grid grid-cols-9 gap-[4px] max-[760px]:grid-cols-3">
          {scenario.map((x) => {
            const pos = x.pnl >= 0;
            const intensity = Math.abs(x.pnl) / maxScn;
            return (
              <div key={x.s} className="rounded-[5px] px-1 py-[8px] text-center"
                style={{ background: x.s === 0 ? "var(--bg-3)" : `rgba(${pos ? "45,212,191" : "255,86,119"},${(0.07 + intensity * 0.22).toFixed(2)})` }}>
                <div className={`font-mono text-[10px] font-semibold ${x.s < 0 ? "text-accent-rose" : x.s > 0 ? "text-accent-teal" : "text-ink-2"}`}>
                  {x.s > 0 ? "+" : ""}{x.s}%
                </div>
                <div className={`font-mono text-[11px] font-semibold ${pos ? "text-accent-teal" : "text-accent-rose"}`}>{fmtUsd(x.pnl)}</div>
                <div className="font-mono text-[8px] text-ink-3">{navPct(x.pnl)}</div>
              </div>
            );
          })}
        </div>

        {/* Vol + rate shocks */}
        <div className="mt-[16px] grid grid-cols-2 gap-[24px] max-[760px]:grid-cols-1">
          <div>
            <div className="mb-[8px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Implied Vol Shock (Net Vega {fmtUsd(netVega$)}/pt)</div>
            {volShocks.map((v) => (
              <div key={v.dv} className="flex items-center justify-between border-b border-line py-[6px] font-mono text-[11px] last:border-0">
                <span className="text-ink-2">{v.dv > 0 ? "+" : ""}{v.dv} vol pts</span>
                <span className={v.pnl >= 0 ? "text-accent-teal" : "text-accent-rose"}>{fmtUsd(v.pnl)}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-[8px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Rate Shock (bond sleeve duration)</div>
            {rateShocks.map((r) => (
              <div key={r.bp} className="flex items-center justify-between border-b border-line py-[6px] font-mono text-[11px] last:border-0">
                <span className="text-ink-2">+{r.bp} bp parallel</span>
                <span className={r.pnl >= 0 ? "text-accent-teal" : "text-accent-rose"}>{fmtUsd(r.pnl)}</span>
              </div>
            ))}
            <div className="mt-[4px] font-mono text-[8px] text-ink-3">Applies to BND / PTY sleeve only.</div>
          </div>
        </div>
      </Panel>

      {/* ── Row 4: Positions Blotter ── */}
      <Panel className="mb-6">
        <div className="mb-[12px] font-display text-[18px] font-medium">Positions Blotter</div>
        <div className="mb-1 flex items-center border-b border-line pb-[6px] font-mono text-[8px] uppercase tracking-[0.12em] text-ink-3">
          <span className="w-[56px]">Symbol</span>
          <span className="w-[64px]">Sector</span>
          <span className="w-[64px] text-right">Qty</span>
          <span className="w-[72px] text-right">Price</span>
          <span className="w-[80px] text-right">Mkt Value</span>
          <span className="w-[56px] text-right">Wt%</span>
          <span className="w-[44px] text-right">β</span>
          <span className="w-[64px] text-right">Day</span>
          <span className="ml-auto w-[78px] text-right">Unreal P&amp;L</span>
        </div>
        {priced.slice().sort((a, b) => Math.abs(b.mv) - Math.abs(a.mv)).map((p) => (
          <div key={p.sym} className="flex items-center border-b border-line py-[7px] last:border-0 font-mono transition hover:bg-[rgba(77,141,255,0.03)]">
            <span className="w-[56px] text-[12px] font-semibold text-ink-0">{p.sym}</span>
            <span className="w-[64px] truncate text-[9px] text-ink-3">{p.sector}</span>
            <span className={`w-[64px] text-right text-[11px] ${p.qty >= 0 ? "text-accent-teal" : "text-accent-rose"}`}>
              {p.qty >= 0 ? "" : "−"}{Math.abs(p.qty).toLocaleString()}
            </span>
            <span className="w-[72px] text-right text-[11px] text-ink-1">{p.price ? fmtPx(p.price) : "—"}</span>
            <span className={`w-[80px] text-right text-[11px] ${p.mv >= 0 ? "text-ink-1" : "text-accent-rose"}`}>{fmtUsd(p.mv)}</span>
            <span className="w-[56px] text-right text-[10px] text-ink-2">{grossMV ? (Math.abs(p.mv) / grossMV * 100).toFixed(1) : "—"}</span>
            <span className="w-[44px] text-right text-[10px] text-ink-2">{p.beta.toFixed(2)}</span>
            <span className={`w-[64px] text-right text-[10px] ${p.dayPnl >= 0 ? "text-accent-teal" : "text-accent-rose"}`}>{fmtUsd(p.dayPnl)}</span>
            <span className={`ml-auto w-[78px] text-right text-[11px] font-semibold ${p.pnl >= 0 ? "text-accent-teal" : "text-accent-rose"}`}>{fmtUsd(p.pnl)}</span>
          </div>
        ))}
        <div className="mt-[12px] border-t border-line pt-[10px] font-mono text-[9px] text-ink-3">
          Representative book from the firm ticker universe · live prices · betas/sectors are reference estimates · greeks via Black-Scholes overlay engine.
        </div>
      </Panel>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  CALL WALL / PUT WALL SYSTEM
//  Faithful re-home of the TSLA "GAMMA Heat Map" dashboard (May 2026) onto the
//  ADA live data layer. Preserves the analyst S/R level ladder and the per-strike
//  × per-expiry GEX heatmap; call/put walls + zero-gamma flip are computed live
//  from the Black-Scholes greeks engine (/api/market?type=gexmap).
// ════════════════════════════════════════════════════════════════════════════

// Analyst S/R levels — hand-curated reference levels for TSLA (May 2026).
// For all other tickers, getSRLevels() auto-derives levels from the live spot price
// using standard percentage-based volatility bands.
const TSLA_SR_LEVELS: { price: number; label: string; str: number; type: "resistance" | "support" }[] = [
  { price: 439.92, label: "multi-week contain",    str: 4, type: "resistance" },
  { price: 428.27, label: "minor (testing now)",   str: 3, type: "resistance" },
  { price: 424.06, label: "minor",                 str: 1, type: "resistance" },
  { price: 418.04, label: "session containment",   str: 2, type: "resistance" },
  { price: 415.83, label: "minor",                 str: 1, type: "resistance" },
  { price: 409.28, label: "minor",                 str: 1, type: "resistance" },
  { price: 402.12, label: "intra-day containment", str: 2, type: "support"    },
  { price: 398.73, label: "minor",                 str: 1, type: "support"    },
  { price: 395.00, label: "minor",                 str: 1, type: "support"    },
  { price: 392.66, label: "weekly containment UP", str: 3, type: "support"    },
  { price: 387.57, label: "minor",                 str: 1, type: "support"    },
  { price: 383.81, label: "intra-day containment", str: 2, type: "support"    },
  { price: 378.57, label: "minor",                 str: 1, type: "support"    },
  { price: 371.84, label: "minor",                 str: 1, type: "support"    },
  { price: 368.23, label: "session containment",   str: 2, type: "support"    },
  { price: 357.22, label: "minor",                 str: 1, type: "support"    },
  { price: 351.69, label: "minor",                 str: 1, type: "support"    },
  { price: 345.29, label: "multi-week contain",    str: 4, type: "support"    },
  { price: 341.85, label: "(1% below) dark pool",  str: 3, type: "support"    },
];

// Auto-generate S/R levels from a live spot price using standard volatility bands.
// Resistance levels above spot, support levels below — mirrored at the same
// percentage offsets so the ladder is always anchored to the current price.
const SR_PCT_BANDS = [
  { pct: 0.013, label: "minor",                 str: 1 },
  { pct: 0.028, label: "intra-day containment", str: 2 },
  { pct: 0.045, label: "session containment",   str: 2 },
  { pct: 0.065, label: "minor",                 str: 1 },
  { pct: 0.090, label: "weekly containment UP", str: 3 },
  { pct: 0.125, label: "minor",                 str: 1 },
  { pct: 0.170, label: "multi-week contain",    str: 4 },
  { pct: 0.215, label: "dark pool cluster",     str: 3 },
] as const;

function getSRLevels(sym: string, spot: number): { price: number; label: string; str: number; type: "resistance" | "support" }[] {
  if (sym === "TSLA") return TSLA_SR_LEVELS;
  if (spot <= 0) return [];
  const dp = spot >= 100 ? 2 : spot >= 10 ? 2 : 3;
  const round = (n: number) => parseFloat(n.toFixed(dp));
  return [
    ...SR_PCT_BANDS.map((b) => ({ price: round(spot * (1 + b.pct)), label: b.label, str: b.str, type: "resistance" as const })),
    ...SR_PCT_BANDS.map((b) => ({ price: round(spot * (1 - b.pct)), label: b.label, str: b.str, type: "support"    as const })),
  ];
}

const WALL_TICKERS = ["TSLA", "NVDA", "SPY", "XSP", "SPX", "QQQ", "AAPL", "PLTR", "SPCX"] as const;

// GEX heatmap cell colour — green (positive/pinning) → red (negative/explosive),
// matching the original dashboard's hsl intensity scale.
function gexCellStyle(net: number): React.CSSProperties {
  const intensity = Math.min(Math.abs(net) / 50000, 1);
  const hue = net >= 0 ? 145 : 0;
  return {
    background: net === 0 ? "var(--bg-2)" : `hsl(${hue}, 75%, ${16 + intensity * 34}%)`,
    color: Math.abs(net) > 20000 ? "#fff" : "var(--ink-2)",
  };
}

function CallPutWallSystem() {
  const [sym, setSym]       = useState<string>("TSLA");
  const [data, setData]     = useState<GexMap | null>(null);
  const [loading, setLoad]  = useState(true);
  const [err, setErr]       = useState<string | null>(null);
  const [ts, setTs]         = useState<number | null>(null);
  useNowTick();

  const load = useCallback(async (s: string, silent = false) => {
    if (!silent) setLoad(true);
    setErr(null);
    try {
      const d = await fetchGexMap(s, 5, 70);
      setData(d); setTs(Date.now());
      if (!d.rows.length) setErr(`No options data for ${s}`);
    } catch { setErr(`GEX map unavailable for ${s}`); }
    finally { setLoad(false); }
  }, []);

  useEffect(() => { load(sym); }, [sym, load]);
  // Auto-refresh every 5 min, matching the original dashboard cadence.
  useEffect(() => {
    const id = setInterval(() => load(sym, true), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [sym, load]);

  // ── Greeks & Market Metrics ────────────────────────────────────────────────
  const [gChain,        setGChain]       = useState<Contract[]>([]);
  const [gCloses,       setGCloses]      = useState<number[]>([]);
  const [greeksLoading, setGreeksLoad]   = useState(false);
  const [ivDirection,   setIvDirection]  = useState<string>("—");
  const [gTs,           setGTs]          = useState<number | null>(null);
  const prevAtmIVRef = useRef<number>(0);

  const loadGreeks = useCallback(async (s: string) => {
    setGreeksLoad(true);
    try {
      const [{ contracts, spot: cSpot }, cls] = await Promise.all([
        fetchChain(s, 60),
        fetchHistory(yfSym(s), "1mo").catch(() => [] as number[]),
      ]);
      setGChain(contracts);
      setGCloses(cls);
      setGTs(Date.now());
      if (contracts.length && cSpot > 0) {
        const calls = contracts.filter((c) => c.otype === "call");
        if (calls.length) {
          const atmCall = calls.reduce((b, c) =>
            Math.abs(c.strike - cSpot) < Math.abs(b.strike - cSpot) ? c : b
          );
          const rawIV  = parseFloat(atmCall.iv) || 0;
          const ivPct  = rawIV < 2 ? rawIV * 100 : rawIV;
          if (prevAtmIVRef.current > 0 && ivPct > 0) {
            const diff = ivPct - prevAtmIVRef.current;
            setIvDirection(diff > 0.5 ? "↑ Expanding" : diff < -0.5 ? "↓ Contracting" : "→ Stable");
          }
          if (ivPct > 0) prevAtmIVRef.current = ivPct;
        }
      }
    } catch { /* Greeks panel shows empty state */ }
    finally { setGreeksLoad(false); }
  }, []);

  useEffect(() => { loadGreeks(sym); }, [sym, loadGreeks]);
  useEffect(() => {
    const id = setInterval(() => loadGreeks(sym), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [sym, loadGreeks]);

  const spot = data?.spot ?? 0;
  const chg  = data?.changePct ?? 0;
  const sess = sessionBadge((data?.marketState ?? "CLOSED") as MktState);
  const sum  = data?.summary;

  // S/R levels: hand-curated for TSLA, auto-derived from spot for all other tickers.
  const srLevels = useMemo(() => getSRLevels(sym, spot), [sym, spot]);
  const srPrices = useMemo(() => srLevels.map((l) => l.price), [srLevels]);

  // Full ladder: S/R levels + live price row, sorted high → low.
  const ladder = useMemo(
    () =>
      [...srLevels, ...(spot > 0 ? [{ price: spot, label: "● LIVE PRICE", str: 0, type: "current" as const }] : [])]
        .sort((a, b) => b.price - a.price),
    [srLevels, spot]
  );

  // ── Greeks derived values ────────────────────────────────────────────────────
  // ATM call contract (nearest strike to live spot, delta-aware)
  const atmContract = useMemo(() => {
    if (!gChain.length || spot <= 0) return null;
    const calls = gChain.filter((c) => c.otype === "call" && typeof c.delta === "number");
    const pool  = calls.length ? calls : gChain.filter((c) => c.otype === "call");
    if (!pool.length) return null;
    return pool.reduce((b, c) => Math.abs(c.strike - spot) < Math.abs(b.strike - spot) ? c : b);
  }, [gChain, spot]);

  // ATM implied volatility (normalised to %)
  const curAtmIV = useMemo(() => {
    if (!atmContract) return 0;
    const n = parseFloat(atmContract.iv) || 0;
    return n < 2 ? n * 100 : n;
  }, [atmContract]);

  // IV direction styling
  const ivDirCls = ivDirection === "↑ Expanding"   ? "text-accent-rose"
                 : ivDirection === "↓ Contracting" ? "text-accent-teal"
                 : "text-ink-1";

  // Delta strike thresholds (Δ5, Δ10, Δ35) from the nearest expiry
  const deltaRows = useMemo(() => {
    if (!gChain.length || spot <= 0) return [];
    const expiries  = [...new Set(gChain.map((c) => c.expiry))].sort();
    const nearChain = gChain.filter((c) => c.expiry === expiries[0]);
    const findStrike = (otype: "call" | "put", targetAbs: number): number | null => {
      const target = otype === "call" ? targetAbs : -targetAbs;
      const pool   = nearChain.filter((c) => c.otype === otype && typeof c.delta === "number");
      if (!pool.length) return null;
      return pool.reduce((b, c) =>
        Math.abs((c.delta ?? 0) - target) < Math.abs((b.delta ?? 0) - target) ? c : b
      ).strike;
    };
    return [
      { label: "Δ35", callStrike: findStrike("call", 0.35), putStrike: findStrike("put", 0.35) },
      { label: "Δ10", callStrike: findStrike("call", 0.10), putStrike: findStrike("put", 0.10) },
      { label: "Δ5",  callStrike: findStrike("call", 0.05), putStrike: findStrike("put", 0.05) },
    ];
  }, [gChain, spot]);

  // Swing low: 5-day close-based minimum
  const swingLow5D = useMemo(
    () => (gCloses.length >= 5 ? Math.min(...gCloses.slice(-5)) : 0),
    [gCloses]
  );

  // ATR: 14-day average close-to-close absolute range
  const atr14 = useMemo(() => {
    if (gCloses.length < 15) return 0;
    let s = 0;
    for (let i = gCloses.length - 14; i < gCloses.length; i++) s += Math.abs(gCloses[i] - gCloses[i - 1]);
    return s / 14;
  }, [gCloses]);

  // Expected 1-day move from ATM IV
  const expMove = curAtmIV > 0 && spot > 0 ? spot * (curAtmIV / 100) / Math.sqrt(252) : 0;

  // Prior close derived from GEX data (spot / (1 + chg%))
  const prevClose = spot > 0 && chg !== 0 ? spot / (1 + chg / 100) : spot;

  // Key level rows for the centre column
  const keyLevelRows: { label: string; value: string; cls: string; sub: string }[] = [
    {
      label: "Put Wall",
      value: sum?.putWall ? fmtPx(sum.putWall) : "—",
      cls:   "text-accent-rose",
      sub:   "max −γ support",
    },
    {
      label: "Prior Close (PDL)",
      value: prevClose > 0 ? fmtPx(prevClose) : "—",
      cls:   prevClose > 0 && prevClose < spot ? "text-accent-teal" : "text-accent-rose",
      sub:   "yesterday's close",
    },
    {
      label: "Swing Low 5D",
      value: swingLow5D > 0 ? fmtPx(swingLow5D) : "—",
      cls:   "text-accent-teal",
      sub:   "5-day close min",
    },
    {
      label: "ATM IV",
      value: curAtmIV > 0 ? `${curAtmIV.toFixed(1)}%` : "—",
      cls:   ivDirCls,
      sub:   ivDirection !== "—" ? ivDirection : "implied vol",
    },
    {
      label: "Exp. Move 1D",
      value: expMove > 0 ? `±${fmtPx(expMove)}` : "—",
      cls:   "text-accent",
      sub:   "IV ÷ √252 · ATM",
    },
    {
      label: "ATR 14D",
      value: atr14 > 0 ? fmtPx(atr14) : "—",
      cls:   "text-ink-1",
      sub:   "avg close-to-close Δ",
    },
  ];

  return (
    <>
      {/* ── Control row ── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-[5px]">
          {WALL_TICKERS.map((s) => (
            <button key={s} onClick={() => setSym(s)}
              className={`rounded-[5px] px-[12px] py-[5px] font-mono text-[11px] uppercase tracking-[0.08em] transition ${
                sym === s ? "bg-[rgba(245,183,72,0.15)] text-accent-amber" : "border border-line text-ink-3 hover:border-line-strong hover:text-ink-1"
              }`}>{s}</button>
          ))}
        </div>
        {spot > 0 && (
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[22px] font-medium leading-none">{fmtPx(spot)}</span>
            <span className={`font-mono text-[12px] ${chg >= 0 ? "text-accent-teal" : "text-accent-rose"}`}>{fmtPct(chg)}</span>
          </div>
        )}
        <div className={`flex items-center gap-[6px] font-mono text-[10px] ${sess.textCls}`}>
          <span className={`h-[6px] w-[6px] rounded-full ${sess.dot}`} />{sess.text}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {err && <span className="font-mono text-[9px] text-accent-rose">{err}</span>}
          <Stamp ts={ts} loading={loading} err={err} />
          <button onClick={() => load(sym)} disabled={loading}
            className={`flex items-center gap-[6px] rounded-[5px] border px-[10px] py-[4px] font-mono text-[10px] uppercase tracking-[0.08em] transition ${
              loading ? "cursor-not-allowed border-line text-ink-3 opacity-50" : "border-line text-accent hover:border-accent hover:bg-[rgba(77,141,255,0.06)]"
            }`}>{loading ? <><Spin /> Fetching…</> : <>Refresh ↻</>}</button>
        </div>
      </div>

      {/* ── Wall readings ── */}
      <div className="mb-5 grid grid-cols-5 gap-[14px] max-[1000px]:grid-cols-2">
        {[
          ["Call Wall",  sum?.callWall ? fmtPx(sum.callWall) : "—", "text-accent-teal", "max +γ resistance"],
          ["Put Wall",   sum?.putWall  ? fmtPx(sum.putWall)  : "—", "text-accent-rose", "max −γ support"],
          ["Zero Gamma", sum?.zeroGamma ? fmtPx(sum.zeroGamma) : "—", "text-ink-0", "γ flip level"],
          ["Net GEX",    sum ? `${sum.netGex >= 0 ? "+" : ""}${(sum.netGex / 1000).toFixed(0)}k` : "—", (sum?.netGex ?? 0) >= 0 ? "text-accent-teal" : "text-accent-rose", "γ·OI·100 units"],
          ["Spot",       spot ? fmtPx(spot) : "—", "text-accent-amber", sess.text],
        ].map(([k, v, c, sub]) => (
          <Panel key={k as string}>
            <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-3">{k as string}</div>
            <div className={`mt-[4px] font-display text-[24px] font-medium leading-none ${c as string}`}>{v as string}</div>
            <div className="mt-[5px] font-mono text-[9px] text-ink-3">{sub as string}</div>
          </Panel>
        ))}
      </div>

      {/* ── Body: S/R ladder | GEX heatmap ── */}
      <div className="mb-6 grid grid-cols-[310px_1fr] gap-[14px] max-[1000px]:grid-cols-1">

        {/* Analyst S/R Levels */}
        <Panel>
          <div className="mb-[10px]">
            <div className="font-display text-[15px] font-medium">Analyst S/R Levels</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
              {sym === "TSLA" ? "TSLA curated ladder · live overlay" : `${sym} dynamic bands · live spot anchor`}
            </div>
          </div>
          {spot <= 0 && (
            <div className="py-8 text-center font-mono text-[11px] text-ink-3">
              Loading spot price…
            </div>
          )}
          {spot > 0 && ladder.map((l, i) => {
            const cur = l.type === "current";
            const res = l.type === "resistance";
            return (
              <div key={`${l.price}-${i}`}
                className={`flex items-center gap-2 border-b border-line py-[6px] font-mono last:border-0 ${cur ? "bg-[rgba(245,183,72,0.08)]" : ""}`}>
                <span className={`w-[64px] text-[12px] font-semibold ${cur ? "text-accent-amber" : res ? "text-accent-rose" : "text-accent-teal"}`}>
                  ${l.price.toFixed(2)}
                </span>
                {!cur && (
                  <span className="flex gap-[1px]">
                    {Array.from({ length: l.str }).map((_, j) => (
                      <span key={j} className={`text-[9px] ${res ? "text-accent-rose" : "text-accent-teal"}`}>●</span>
                    ))}
                  </span>
                )}
                <span className={`ml-auto truncate text-[10px] ${cur ? "text-accent-amber" : "text-ink-3"}`}>{l.label}</span>
              </div>
            );
          })}
        </Panel>

        {/* GEX Heatmap (strike × expiry) */}
        <Panel>
          <div className="mb-[10px] flex items-center justify-between">
            <div>
              <div className="font-display text-[15px] font-medium">Gamma Exposure Heatmap</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
                {sym} · net γ·OI by strike × expiry · key S/R highlighted
              </div>
            </div>
            {loading && <Spin />}
          </div>

          {(!data || data.rows.length === 0) && !loading ? (
            <div className="py-10 text-center font-mono text-[11px] text-ink-3">No GEX data for {sym}.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-[11px]">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-bg-1 px-2 py-[6px] text-left text-[8px] uppercase tracking-[0.1em] text-accent-amber">Strike</th>
                    {(data?.expiries ?? []).map((e) => (
                      <th key={e} className="px-2 py-[6px] text-center text-[8px] uppercase tracking-[0.08em] text-ink-3">{e}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.rows ?? []).map((r) => {
                    const isKey = srPrices.some((sr) => Math.abs(sr - r.strike) < 1.5);
                    const isSpot = spot > 0 && Math.abs(r.strike - spot) < (spot * 0.0025);
                    return (
                      <tr key={r.strike} className={isSpot ? "outline outline-1 outline-accent-amber" : ""}>
                        <td className={`sticky left-0 px-2 py-[5px] text-left font-semibold ${
                          isKey ? "bg-[rgba(245,183,72,0.12)] text-accent-amber" : "bg-bg-1 text-ink-1"}`}>
                          {r.strike.toFixed(2)}
                        </td>
                        {r.net.map((v, i) => (
                          <td key={i} className="px-2 py-[5px] text-center font-semibold" style={gexCellStyle(v)}>
                            {v === 0 ? "·" : (v / 1000).toFixed(0) + "k"}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-[12px] flex flex-wrap gap-4 border-t border-line pt-[10px] font-mono text-[9px] text-ink-3">
            <span><span className="text-accent-teal">■</span> Positive GEX · pinning / stabilising</span>
            <span><span className="text-accent-rose">■</span> Negative GEX · explosive moves likely</span>
            <span className="ml-auto text-accent-amber">Key S/R strikes highlighted · γ via Black-Scholes</span>
          </div>
        </Panel>
      </div>

      {/* ── Greeks & Market Metrics ─────────────────────────────────────────── */}
      <Panel className="mb-6">
        <div className="mb-[14px] flex items-center justify-between">
          <div>
            <div className="font-display text-[18px] font-medium">Greeks &amp; Market Metrics</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
              Δ strike thresholds · key levels · ATM greeks · volatility
            </div>
          </div>
          <div className="flex items-center gap-3">
            {greeksLoading && <Spin />}
            <Stamp ts={gTs} loading={greeksLoading} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[20px] max-[900px]:grid-cols-1">

          {/* ── Col 1: Delta Strike Thresholds ── */}
          <div>
            <div className="mb-[8px] font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2">Δ Strike Thresholds</div>
            <div className="mb-[4px] flex items-center border-b border-line pb-[5px] font-mono text-[8px] uppercase tracking-[0.12em] text-ink-3">
              <span className="w-[44px]">Level</span>
              <span className="flex-1 text-center text-accent-teal">Call Strike</span>
              <span className="w-[76px] text-right text-accent-rose">Put Strike</span>
            </div>
            {deltaRows.length === 0 && !greeksLoading && (
              <div className="py-4 font-mono text-[11px] text-ink-3">No delta data. Load chain first.</div>
            )}
            {deltaRows.map((row) => (
              <div key={row.label} className="flex items-center border-b border-line py-[9px] last:border-0 font-mono">
                <span className="w-[44px] text-[12px] font-semibold text-ink-0">{row.label}</span>
                <span className={`flex-1 text-center text-[14px] font-semibold ${row.callStrike ? "text-accent-teal" : "text-ink-3"}`}>
                  {row.callStrike ? `$${row.callStrike.toFixed(2)}` : "—"}
                </span>
                <span className={`w-[76px] text-right text-[14px] font-semibold ${row.putStrike ? "text-accent-rose" : "text-ink-3"}`}>
                  {row.putStrike ? `$${row.putStrike.toFixed(2)}` : "—"}
                </span>
              </div>
            ))}
            {deltaRows.length > 0 && (
              <div className="mt-[6px] font-mono text-[9px] text-ink-3">Near-term expiry · call Δ &gt; 0 · put Δ &lt; 0</div>
            )}
          </div>

          {/* ── Col 2: Key Levels ── */}
          <div>
            <div className="mb-[8px] font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2">Key Levels</div>
            {keyLevelRows.map(({ label, value, cls, sub }) => (
              <div key={label} className="flex items-center justify-between border-b border-line py-[8px] last:border-0 font-mono">
                <div>
                  <div className="text-[11px] text-ink-2">{label}</div>
                  <div className="text-[8px] uppercase tracking-[0.08em] text-ink-3">{sub}</div>
                </div>
                <span className={`text-[15px] font-semibold ${cls}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* ── Col 3: ATM Greeks + IV ── */}
          <div>
            <div className="mb-[8px] font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2">ATM Greeks</div>
            {!atmContract && (
              <div className="py-8 text-center font-mono text-[11px] text-ink-3">
                {greeksLoading ? "Loading chain…" : "No contract data."}
              </div>
            )}
            {atmContract && (
              <>
                <div className="mb-[8px] rounded-[6px] bg-bg-2 px-3 py-[7px]">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-ink-3">Strike</span>
                    <span className="font-semibold text-accent-amber">${atmContract.strike.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-ink-3">Expiry</span>
                    <span className="text-ink-1">{atmContract.expiry}</span>
                  </div>
                </div>
                {([
                  ["Δ Delta", typeof atmContract.delta === "number" ? atmContract.delta.toFixed(4) : "—",
                    (atmContract.delta ?? 0) >= 0.4 ? "text-accent-teal" : (atmContract.delta ?? 0) >= 0 ? "text-ink-0" : "text-accent-rose",
                    "directional exposure"],
                  ["Γ Gamma", typeof atmContract.gamma === "number" ? atmContract.gamma.toFixed(5) : "—",
                    "text-ink-0",
                    "convexity / dealer hedging speed"],
                  ["ν Vega",  typeof atmContract.vega  === "number" ? atmContract.vega.toFixed(4)  : "—",
                    (atmContract.vega ?? 0) >= 0 ? "text-accent-teal" : "text-accent-rose",
                    "$/1 vol point"],
                  ["Θ Theta", typeof atmContract.theta === "number" ? atmContract.theta.toFixed(4) : "—",
                    (atmContract.theta ?? 0) >= 0 ? "text-accent-teal" : "text-accent-rose",
                    "$/calendar day"],
                ] as [string, string, string, string][]).map(([k, v, c, sub]) => (
                  <div key={k} className="flex items-center justify-between border-b border-line py-[7px] last:border-0 font-mono">
                    <div>
                      <div className="text-[12px] text-ink-1">{k}</div>
                      <div className="text-[8px] uppercase tracking-[0.08em] text-ink-3">{sub}</div>
                    </div>
                    <span className={`text-[14px] font-semibold ${c}`}>{v}</span>
                  </div>
                ))}
                <div className="mt-[8px] border-t border-line pt-[8px]">
                  <div className="flex items-center justify-between font-mono">
                    <div>
                      <div className="text-[12px] text-ink-2">ATM IV</div>
                      <div className="text-[8px] uppercase tracking-[0.08em] text-ink-3">implied volatility</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[18px] font-semibold ${ivDirCls}`}>
                        {curAtmIV > 0 ? `${curAtmIV.toFixed(1)}%` : "—"}
                      </div>
                      <div className={`text-[9px] uppercase tracking-[0.08em] ${ivDirCls}`}>{ivDirection}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-[14px] border-t border-line pt-[10px] font-mono text-[9px] text-ink-3">
          Δ thresholds: near-term expiry only · ATM = strike nearest live spot ·
          PDL = prior close (GEX-derived) · Swing Low = 5-day min close ·
          ATR = 14-day avg |ΔClose| · Exp. Move = Spot × IV ÷ √252
        </div>
      </Panel>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  BLOOMBERG OPTIONS TERMINAL
//  Full-featured options chain terminal with Bloomberg-style UI, live market
//  data from Yahoo Finance via /api/market?type=bbchain, Black-Scholes greeks
//  computed server-side, and simulated paper trading.
// ════════════════════════════════════════════════════════════════════════════

const BB = {
  bg: "#0a0a0a", panel: "#111111", border: "#2a2a2a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc66",
  red: "#ff3344", blue: "#4499ff", cyan: "#00ccdd",
  text: "#e0e0e0", muted: "#666666", header: "#1a1a1a",
} as const;

const BB_SYMS   = ["SPY", "QQQ", "TSLA", "NVDA", "AAPL"] as const;
const BB_STRIP  = ["SPY", "QQQ", "^VIX", "IWM", "GLD", "^TNX", "NVDA", "TSLA"] as const;

interface BBSide  { bid: number; ask: number; last: number; volume: number; oi: number; iv: number; delta: number; gamma: number; vega: number; theta: number; itm: boolean }
interface BBRow   { strike: number; call: BBSide | null; put: BBSide | null }
interface BBExp   { date: number; label: string; dte: number }
interface BBQuote { symbol: string; price: number; change: number; changePct: number; bid: number; ask: number; volume: number; iv30: number; totalOI: number; marketState: string }
interface BBData  { ok: boolean; error?: string; quote: BBQuote; expirations: BBExp[]; rows: BBRow[]; ts: number }
interface BBPos   { id: number; sym: string; exp: string; strike: number; type: "CALL" | "PUT"; side: "BUY" | "SELL"; qty: number; fillPrice: number }

const bbInput: React.CSSProperties = { background: "#1a1a1a", border: `1px solid ${BB.border}`, color: BB.cyan, fontFamily: "monospace", fontSize: 11, padding: "3px 6px", width: 70, outline: "none" };
const bbSelect: React.CSSProperties = { ...bbInput, width: 80 };

function BloombergTerminal() {
  const [sym, setSym]             = useState("SPY");
  const [chainData, setChainData] = useState<BBData | null>(null);
  const [expIdx, setExpIdx]       = useState(0);
  const [strikeN, setStrikeN]     = useState(15);
  const [strip, setStrip]         = useState<Quote[]>([]);
  const [loading, setLoading]     = useState(false);
  const [ts, setTs]               = useState<number | null>(null);
  const [err, setErr]             = useState<string | null>(null);
  const [clock, setClock]         = useState("");
  const [bbTab, setBBTab]         = useState("chain");

  // Paper trading
  const [positions, setPositions] = useState<BBPos[]>([]);
  const [bp, setBp]               = useState(100000);
  const [oStrike, setOStrike]     = useState(""); const [oType, setOType]     = useState<"CALL"|"PUT">("CALL");
  const [oQty, setOQty]           = useState("1"); const [oPrice, setOPrice]   = useState("");
  const [oOType, setOOType]       = useState("LMT");
  const [notif, setNotif]         = useState<{ msg: string; ok: boolean } | null>(null);

  useNowTick();

  // Clock
  useEffect(() => {
    const tick = () => { const d = new Date(); setClock(d.toLocaleTimeString("en-US") + " ET  |  " + d.toLocaleDateString("en-US")); };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  // Fetch chain
  const loadChain = useCallback(async (symbol: string, date?: number) => {
    setLoading(true); setErr(null);
    try {
      const url = date ? `/api/market?type=bbchain&symbol=${symbol}&date=${date}` : `/api/market?type=bbchain&symbol=${symbol}`;
      const data = await getJSON<BBData>(url);
      if (!data.ok) throw new Error(data.error ?? "fetch failed");
      setChainData(data); setTs(Date.now());
    } catch (e) { setErr(String(e)); } finally { setLoading(false); }
  }, []);

  const loadStrip = useCallback(async () => {
    try { setStrip(await fetchQuotes(BB_STRIP)); } catch { /* strip is non-critical */ }
  }, []);

  useEffect(() => { loadChain(sym); loadStrip(); }, [sym, loadChain, loadStrip]);

  const refresh = useCallback(() => {
    const d = chainData?.expirations[expIdx]?.date;
    loadChain(sym, d); loadStrip();
  }, [sym, expIdx, chainData, loadChain, loadStrip]);

  const switchExp = useCallback((i: number) => {
    setExpIdx(i);
    const d = chainData?.expirations[i]?.date;
    if (d) loadChain(sym, d);
  }, [sym, chainData, loadChain]);

  const switchSym = useCallback((s: string) => { setSym(s); setExpIdx(0); }, []);

  // Filter rows around ATM
  const q = chainData?.quote;
  const spot = q?.price ?? 0;
  const filteredRows = (chainData?.rows ?? []).filter(r => {
    if (!spot) return true;
    const step = spot > 100 ? 1 : spot > 20 ? 0.5 : 0.25;
    return Math.abs(r.strike - spot) <= strikeN * step;
  });

  // Paper trading
  const flash = (msg: string, ok: boolean) => { setNotif({ msg, ok }); setTimeout(() => setNotif(null), 3000); };
  const placeOrder = (side: "BUY" | "SELL") => {
    const strike = parseFloat(oStrike), price = parseFloat(oPrice), qty = parseInt(oQty);
    const exp = chainData?.expirations[expIdx]?.label ?? "";
    if (!strike || !price || !qty || !exp) { flash("FILL ALL ORDER FIELDS", false); return; }
    const cost = price * qty * 100;
    if (side === "BUY" && cost > bp) { flash("INSUFFICIENT BUYING POWER", false); return; }
    setPositions(prev => [...prev, { id: Date.now(), sym, exp, strike, type: oType, side, qty, fillPrice: price }]);
    setBp(prev => side === "BUY" ? prev - cost : prev + cost * 0.5);
    flash(`${side} ${qty}x ${sym} ${exp} $${strike} ${oType} @ $${price.toFixed(2)}`, true);
  };
  const fillOrder = (strike: number) => {
    setOStrike(String(strike));
    const row = chainData?.rows.find(r => r.strike === strike);
    if (row) { const o = oType === "CALL" ? row.call : row.put; if (o) setOPrice(o.last.toFixed(2)); }
  };

  const OField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
      <label style={{ color: BB.muted, fontSize: 9, letterSpacing: 1 }}>{label}</label>
      {children}
    </div>
  );

  // BB sub-tabs
  const BB_TABS = ["OPTION CHAIN", "GREEKS", "POSITIONS"];

  return (
    <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: BB.text, background: BB.bg, borderRadius: 10, border: `1px solid ${BB.border}`, overflow: "hidden", display: "flex", flexDirection: "column" as const, height: "max(700px, calc(100vh - 240px))", position: "relative" }}>

      {/* Notification toast */}
      {notif && (
        <div style={{ position: "absolute", top: 32, right: 12, zIndex: 999, background: notif.ok ? BB.green : BB.red, color: notif.ok ? "#000" : "#fff", padding: "6px 14px", fontWeight: "bold", fontSize: 11 }}>
          {notif.ok ? "✓ FILLED: " : "✗ ERROR: "}{notif.msg}
        </div>
      )}

      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: BB.orange, color: "#000", padding: "3px 8px", fontWeight: "bold", fontSize: 11, flexShrink: 0 }}>
        <span style={{ fontSize: 13, letterSpacing: 2 }}>BLOOMBERG TERMINAL</span>
        <span>OPTIONS CHAIN — {sym}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 10 }}>
          <Stamp ts={ts} loading={loading} err={err} />
          <button onClick={refresh} disabled={loading} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(0,0,0,0.3)", color: "#000", padding: "2px 10px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "monospace", fontSize: 10, fontWeight: "bold", opacity: loading ? 0.5 : 1 }}>
            ↻ REFRESH
          </button>
          <span>{clock}</span>
        </div>
      </div>

      {/* ── Ticker strip ── */}
      <div style={{ background: BB.header, borderBottom: `1px solid ${BB.border}`, padding: "3px 8px", display: "flex", gap: 16, fontSize: 10, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden" }}>
        {strip.map(sq => {
          const up = sq.changePct >= 0;
          return (
            <span key={sq.symbol} style={{ display: "flex", gap: 6 }}>
              <span style={{ color: BB.amber, fontWeight: "bold" }}>{sq.symbol.replace("^", "")}</span>
              <span style={{ color: up ? BB.green : BB.red }}>{sq.price.toFixed(2)} {up ? "▲" : "▼"}{Math.abs(sq.changePct).toFixed(2)}%</span>
            </span>
          );
        })}
      </div>

      {/* ── BB sub-tabs ── */}
      <div style={{ display: "flex", background: BB.header, borderBottom: `1px solid ${BB.border}`, flexShrink: 0 }}>
        {BB_TABS.map(t => {
          const id = t.toLowerCase().replace(/ /g, "");
          const active = (bbTab === "chain" && t === "OPTION CHAIN") || (bbTab === "greeks" && t === "GREEKS") || (bbTab === "positions" && t === "POSITIONS");
          return (
            <button key={t} onClick={() => setBBTab(t === "OPTION CHAIN" ? "chain" : t === "GREEKS" ? "greeks" : "positions")} style={{
              padding: "5px 14px", cursor: "pointer", fontSize: 10, borderRight: `1px solid ${BB.border}`, borderBottom: "none", borderTop: "none", borderLeft: "none",
              color: active ? "#000" : BB.muted, background: active ? BB.orange : "transparent", fontWeight: active ? "bold" : "normal", letterSpacing: 0.5, fontFamily: "monospace",
            }}>{t}</button>
          );
        })}
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left sidebar ── */}
        <div style={{ width: 200, background: BB.panel, borderRight: `1px solid ${BB.border}`, display: "flex", flexDirection: "column" as const, flexShrink: 0, overflowY: "auto" }}>
          <div style={{ background: BB.orange, color: "#000", padding: "3px 8px", fontSize: 10, fontWeight: "bold", letterSpacing: 1 }}>WATCHLIST</div>
          {BB_SYMS.map(s => {
            const active = sym === s;
            const wq = strip.find(sq => sq.symbol === s);
            return (
              <div key={s} onClick={() => switchSym(s)} style={{ padding: "5px 8px", borderBottom: `1px solid ${BB.border}`, cursor: "pointer", borderLeft: active ? `2px solid ${BB.orange}` : "2px solid transparent", background: active ? "#1a1a1a" : "transparent" }}>
                <div style={{ color: BB.amber, fontWeight: "bold" }}>{s}</div>
                <div style={{ fontSize: 12 }}>{wq ? `$${wq.price.toFixed(2)}` : active && q ? `$${q.price.toFixed(2)}` : "—"}</div>
                {wq && <div style={{ fontSize: 10, color: wq.changePct >= 0 ? BB.green : BB.red }}>{wq.changePct >= 0 ? "+" : ""}{wq.changePct.toFixed(2)}%</div>}
              </div>
            );
          })}
          <div style={{ height: 1, background: BB.border, margin: "4px 0" }} />
          <div style={{ background: BB.header, color: BB.amber, padding: "3px 8px", fontSize: 10, fontWeight: "bold", letterSpacing: 1, borderBottom: `1px solid ${BB.border}` }}>MARKET DATA</div>
          <div style={{ padding: "6px 8px", fontSize: 10, lineHeight: 1.8 }}>
            {q && <>
              {[["IV30", `${q.iv30.toFixed(1)}%`, BB.cyan], ["TOTAL OI", fmtVol(q.totalOI), BB.text], ["VOLUME", fmtVol(q.volume), BB.text], ["STATE", q.marketState, q.marketState === "REGULAR" ? BB.green : BB.muted]].map(([l, v, c]) => (
                <div key={l as string} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: BB.muted }}>{l as string}</span><span style={{ color: c as string }}>{v as string}</span>
                </div>
              ))}
            </>}
          </div>
          <div style={{ background: BB.header, color: BB.amber, padding: "3px 8px", fontSize: 10, fontWeight: "bold", letterSpacing: 1, borderBottom: `1px solid ${BB.border}` }}>POSITION SUMMARY</div>
          <div style={{ padding: "6px 8px", fontSize: 10, lineHeight: 1.8 }}>
            {[["POSITIONS", String(positions.length), BB.text], ["BUYING PWR", `$${bp.toLocaleString("en-US", { minimumFractionDigits: 0 })}`, BB.green]].map(([l, v, c]) => (
              <div key={l as string} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: BB.muted }}>{l as string}</span><span style={{ color: c as string }}>{v as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Content area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, overflow: "hidden" }}>

          {/* Quote block */}
          {q && (
            <div style={{ padding: 8, borderBottom: `1px solid ${BB.border}` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 18, color: BB.orange, fontWeight: "bold" }}>{q.symbol}</span>
                <span style={{ fontSize: 22, color: BB.amber, fontWeight: "bold" }}>{q.price.toFixed(2)}</span>
                <span style={{ color: q.change >= 0 ? BB.green : BB.red }}>
                  {q.change >= 0 ? "▲ +" : "▼ "}{q.change.toFixed(2)} ({q.changePct >= 0 ? "+" : ""}{q.changePct.toFixed(2)}%)
                </span>
                <span style={{ color: BB.muted, fontSize: 10, marginLeft: 8 }}>BID <span style={{ color: BB.green }}>{q.bid.toFixed(2)}</span> &nbsp; ASK <span style={{ color: BB.red }}>{q.ask.toFixed(2)}</span></span>
                <span style={{ color: BB.muted, fontSize: 10 }}>IV30 <span style={{ color: BB.cyan }}>{q.iv30.toFixed(1)}%</span></span>
                <span style={{ color: BB.muted, fontSize: 10 }}>OI <span style={{ color: BB.text }}>{fmtVol(q.totalOI)}</span></span>
              </div>
            </div>
          )}

          {/* Expiry bar */}
          <div style={{ display: "flex", gap: 4, padding: "6px 8px", flexWrap: "wrap", borderBottom: `1px solid ${BB.border}`, flexShrink: 0 }}>
            {(chainData?.expirations ?? []).map((exp, i) => (
              <button key={exp.date} onClick={() => switchExp(i)} style={{
                padding: "2px 8px", fontFamily: "monospace", fontSize: 10, cursor: "pointer",
                border: `1px solid ${expIdx === i ? BB.orange : BB.border}`,
                background: expIdx === i ? BB.orange : "#111",
                color: expIdx === i ? "#000" : BB.cyan,
                fontWeight: expIdx === i ? "bold" : "normal",
              }}>{exp.label} ({exp.dte}d)</button>
            ))}
          </div>

          {/* Control row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "5px 8px", background: "#0d0d0d", borderBottom: `1px solid ${BB.border}`, flexShrink: 0 }}>
            {BB_SYMS.map(s => (
              <span key={s} onClick={() => switchSym(s)} style={{
                padding: "2px 10px", border: `1px solid ${BB.orange}`, fontFamily: "monospace", fontSize: 11, cursor: "pointer", fontWeight: "bold",
                background: sym === s ? BB.orange : "transparent", color: sym === s ? "#000" : BB.orange,
              }}>{s}</span>
            ))}
            <span style={{ width: 1, height: 16, background: BB.border }} />
            <span style={{ color: BB.muted, fontSize: 10 }}>STRIKES ±</span>
            <input type="range" min={5} max={40} value={strikeN} onChange={e => setStrikeN(parseInt(e.target.value))} style={{ width: 80, accentColor: BB.orange }} />
            <span style={{ color: BB.cyan, fontSize: 11, fontWeight: "bold", minWidth: 30 }}>{strikeN}</span>
          </div>

          {/* ── Chain / Greeks / Positions ── */}
          <div style={{ flex: 1, overflowY: "auto" }}>

            {/* Positions view */}
            {bbTab === "positions" && (
              <div style={{ padding: 12 }}>
                <div style={{ color: BB.orange, fontWeight: "bold", fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>OPEN POSITIONS ({positions.length})</div>
                {positions.length === 0 ? (
                  <div style={{ color: BB.muted, padding: 30, textAlign: "center" }}>No open positions — click a strike then use the order panel below to trade.</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                    <thead>
                      <tr>{["SIDE","SYM","EXPIRY","STRIKE","TYPE","QTY","FILL PX","VALUE"].map(h => (
                        <th key={h} style={{ background: BB.header, color: BB.amber, padding: "4px 6px", borderBottom: `1px solid ${BB.border}`, textAlign: "right" }}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {positions.map(p => (
                        <tr key={p.id} style={{ borderBottom: `1px solid ${BB.header}` }}>
                          <td style={{ padding: "3px 6px", textAlign: "right", color: p.side === "BUY" ? BB.green : BB.red, fontWeight: "bold" }}>{p.side}</td>
                          <td style={{ padding: "3px 6px", textAlign: "right", color: BB.amber }}>{p.sym}</td>
                          <td style={{ padding: "3px 6px", textAlign: "right" }}>{p.exp}</td>
                          <td style={{ padding: "3px 6px", textAlign: "right", color: BB.cyan }}>${p.strike.toFixed(2)}</td>
                          <td style={{ padding: "3px 6px", textAlign: "right" }}>{p.type}</td>
                          <td style={{ padding: "3px 6px", textAlign: "right" }}>{p.qty}</td>
                          <td style={{ padding: "3px 6px", textAlign: "right" }}>${p.fillPrice.toFixed(2)}</td>
                          <td style={{ padding: "3px 6px", textAlign: "right" }}>${(p.fillPrice * p.qty * 100).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Chain / Greeks table */}
            {(bbTab === "chain" || bbTab === "greeks") && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead>
                  <tr>
                    <th colSpan={6} style={{ background: BB.header, color: "#88ddaa", textAlign: "center", padding: "4px 6px", borderBottom: `1px solid ${BB.border}`, position: "sticky", top: 0, zIndex: 2 }}>— CALLS —</th>
                    <th style={{ background: "#1a1a00", color: BB.amber, fontWeight: "bold", textAlign: "center", padding: "4px 6px", borderBottom: `1px solid ${BB.border}`, position: "sticky", top: 0, zIndex: 2, width: 70 }}>STRIKE</th>
                    <th colSpan={6} style={{ background: BB.header, color: "#ff8888", textAlign: "center", padding: "4px 6px", borderBottom: `1px solid ${BB.border}`, position: "sticky", top: 0, zIndex: 2 }}>— PUTS —</th>
                  </tr>
                  <tr>
                    {(bbTab === "chain"
                      ? [["OI","c","#88ddaa"],["VOL","r","#aaaaff"],["DELTA","r",BB.cyan],["IV","r",BB.cyan],["BID","r",BB.green],["ASK","r",BB.red]]
                      : [["DELTA","r",BB.cyan],["GAMMA","r",BB.cyan],["THETA","r","#ff8888"],["VEGA","r",BB.blue],["IV","r",BB.cyan],["LAST","r",BB.amber]]
                    ).map(([h, a, c]) => (
                      <th key={"c"+h} style={{ background: BB.header, color: c, padding: "4px 6px", borderBottom: `1px solid ${BB.border}`, textAlign: a === "c" ? "center" : "right", position: "sticky", top: 24, zIndex: 2, whiteSpace: "nowrap", fontSize: 9, fontFamily: "monospace" }}>{h}</th>
                    ))}
                    <th style={{ background: "#1a1a00", position: "sticky", top: 24, zIndex: 2, borderBottom: `1px solid ${BB.border}`, width: 70 }}></th>
                    {(bbTab === "chain"
                      ? [["BID","r",BB.green],["ASK","r",BB.red],["IV","r",BB.cyan],["DELTA","r",BB.cyan],["VOL","r","#aaaaff"],["OI","c","#ff8888"]]
                      : [["LAST","r",BB.amber],["IV","r",BB.cyan],["VEGA","r",BB.blue],["THETA","r","#ff8888"],["GAMMA","r",BB.cyan],["DELTA","r",BB.cyan]]
                    ).map(([h, a, c]) => (
                      <th key={"p"+h} style={{ background: BB.header, color: c, padding: "4px 6px", borderBottom: `1px solid ${BB.border}`, textAlign: a === "c" ? "center" : "right", position: "sticky", top: 24, zIndex: 2, whiteSpace: "nowrap", fontSize: 9, fontFamily: "monospace" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(row => {
                    const itm = spot > row.strike;
                    const c = row.call, p = row.put;
                    const itmC = itm ? "#0d1a0d" : undefined;
                    const itmP = !itm ? "#1a0d0d" : undefined;
                    const cVal = (side: BBSide | null, key: string) => {
                      if (!side) return "—";
                      switch (key) {
                        case "OI":    return fmtVol(side.oi);
                        case "VOL":   return side.volume || "—";
                        case "DELTA": return side.delta.toFixed(2);
                        case "GAMMA": return side.gamma.toFixed(4);
                        case "THETA": return side.theta.toFixed(4);
                        case "VEGA":  return side.vega.toFixed(4);
                        case "IV":    return side.iv > 0 ? `${(side.iv * 100).toFixed(1)}%` : "—";
                        case "BID":   return side.bid.toFixed(2);
                        case "ASK":   return side.ask.toFixed(2);
                        case "LAST":  return side.last.toFixed(2);
                        default:      return "—";
                      }
                    };
                    const colColor = (key: string) => {
                      switch (key) {
                        case "OI": return "#88ddaa"; case "VOL": return "#aaaaff";
                        case "DELTA": case "GAMMA": case "IV": return BB.cyan;
                        case "THETA": return "#ff8888"; case "VEGA": return BB.blue;
                        case "BID": return BB.green; case "ASK": return BB.red;
                        case "LAST": return BB.amber; default: return BB.text;
                      }
                    };
                    const callCols = bbTab === "chain" ? ["OI","VOL","DELTA","IV","BID","ASK"] : ["DELTA","GAMMA","THETA","VEGA","IV","LAST"];
                    const putCols  = bbTab === "chain" ? ["BID","ASK","IV","DELTA","VOL","OI"] : ["LAST","IV","VEGA","THETA","GAMMA","DELTA"];
                    return (
                      <tr key={row.strike} onClick={() => fillOrder(row.strike)} style={{ cursor: "pointer", borderBottom: `1px solid ${BB.header}` }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#181818")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}>
                        {callCols.map(k => (
                          <td key={"c"+k} style={{ padding: "3px 6px", textAlign: k === "OI" ? "center" : "right", color: colColor(k), background: itmC }}>{cVal(c, k)}</td>
                        ))}
                        <td style={{ background: "#1a1a00", color: BB.amber, fontWeight: "bold", textAlign: "center", width: 70, padding: "3px 6px" }}>${row.strike.toFixed(2)}</td>
                        {putCols.map(k => (
                          <td key={"p"+k} style={{ padding: "3px 6px", textAlign: k === "OI" ? "center" : "right", color: colColor(k), background: itmP }}>{cVal(p, k)}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {filteredRows.length === 0 && !loading && (bbTab === "chain" || bbTab === "greeks") && (
              <div style={{ padding: 40, textAlign: "center", color: BB.muted }}>{err ? `⚠ ${err}` : "Loading chain data…"}</div>
            )}
          </div>

          {/* ── Order entry ── */}
          <div style={{ background: "#0d0d0d", borderTop: `1px solid ${BB.border}`, padding: 8, display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0, flexWrap: "wrap" }}>
            <div style={{ color: BB.orange, fontWeight: "bold", fontSize: 10, width: "100%", letterSpacing: 1 }}>ORDER ENTRY</div>
            <OField label="SYMBOL"><input value={sym} readOnly style={{ ...bbInput, width: 60 }} /></OField>
            <OField label="EXPIRY"><input value={chainData?.expirations[expIdx]?.label ?? ""} readOnly style={{ ...bbInput, width: 90 }} /></OField>
            <OField label="STRIKE"><input value={oStrike} onChange={e => setOStrike(e.target.value)} style={{ ...bbInput, width: 75 }} /></OField>
            <OField label="TYPE">
              <select value={oType} onChange={e => setOType(e.target.value as "CALL"|"PUT")} style={bbSelect}><option>CALL</option><option>PUT</option></select>
            </OField>
            <OField label="QTY">
              <input type="number" value={oQty} onChange={e => setOQty(e.target.value)} min={1} style={{ ...bbInput, width: 60 }} />
            </OField>
            <OField label="ORDER">
              <select value={oOType} onChange={e => setOOType(e.target.value)} style={bbSelect}><option>LMT</option><option>MKT</option><option>STP</option></select>
            </OField>
            <OField label="PRICE"><input value={oPrice} onChange={e => setOPrice(e.target.value)} style={{ ...bbInput, width: 75 }} /></OField>
            <div style={{ display: "flex", gap: 6, alignSelf: "flex-end" }}>
              <button onClick={() => placeOrder("BUY")} style={{ background: BB.green, color: "#000", border: "none", padding: "6px 14px", fontFamily: "monospace", fontSize: 11, fontWeight: "bold", cursor: "pointer", letterSpacing: 1 }}>BUY ↑</button>
              <button onClick={() => placeOrder("SELL")} style={{ background: BB.red, color: "#fff", border: "none", padding: "6px 14px", fontFamily: "monospace", fontSize: 11, fontWeight: "bold", cursor: "pointer", letterSpacing: 1 }}>SELL ↓</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div style={{ background: "#111", borderTop: `1px solid ${BB.border}`, padding: "2px 8px", fontSize: 9, color: BB.muted, display: "flex", gap: 16, flexShrink: 0 }}>
        <span style={{ color: BB.green }}>LIVE</span>
        SIMULATED PAPER TRADING &nbsp;|&nbsp; EQUITY: <span style={{ color: BB.green }}>${(100000).toLocaleString()}</span>
        &nbsp;|&nbsp; BUYING POWER: <span style={{ color: BB.green }}>${bp.toLocaleString()}</span>
        &nbsp;|&nbsp; POSITIONS: <span style={{ color: BB.cyan }}>{positions.length}</span>
        &nbsp;|&nbsp; MODEL: BLACK-SCHOLES
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; soon?: true }[] = [
  { id: "floor",     label: "Market Floor" },
  { id: "walls",     label: "Call/Put Wall System" },
  { id: "options",   label: "Options Flow" },
  { id: "regime",    label: "Regime Lab" },
  { id: "portfolio", label: "Portfolio" },
  { id: "bloomberg", label: "Bloomberg Terminal" },
];

const TAB_IDS: Tab[] = ["floor", "walls", "options", "regime", "portfolio", "bloomberg"];

export default function QuantClient() {
  const [tab, setTab] = useState<Tab>("floor");

  // Deep-link support: /quant?view=<tab> (used by the sidebar nav items) selects
  // the matching workbench — reactive to soft navigations, not just first mount.
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  useEffect(() => {
    if (viewParam && (TAB_IDS as string[]).includes(viewParam)) setTab(viewParam as Tab);
    else if (!viewParam) setTab("floor");
  }, [viewParam]);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [tickers,   setTickers]   = useState<Quote[]>(STUB_TICKERS);
  const [sectors,   setSectors]   = useState<Quote[]>(SECTOR_SYMS.map(emptyQuote));
  const [futures,   setFutures]   = useState<Quote[]>(FUTURES_SYMS.map(emptyQuote));
  const [internals, setInternals] = useState<Quote[]>(INTERNAL_SYMS.map(emptyQuote));
  const [contracts, setContracts] = useState<Contract[]>([]);

  // ── Loading / error state ─────────────────────────────────────────────────
  const [tickLoading, setTickLoading] = useState(false);
  const [tickErr,     setTickErr]     = useState<string | null>(null);
  const [tickTs,      setTickTs]      = useState<number | null>(null);
  const [sectLoading, setSectLoading] = useState(false);
  const [sectTs,      setSectTs]      = useState<number | null>(null);
  const [futLoading,  setFutLoading]  = useState(false);
  const [futTs,       setFutTs]       = useState<number | null>(null);
  const [intLoading,  setIntLoading]  = useState(false);
  const [intTs,       setIntTs]       = useState<number | null>(null);
  const [optLoading,  setOptLoading]  = useState(false);
  const [optTs,       setOptTs]       = useState<number | null>(null);
  const [optErr,      setOptErr]      = useState<string | null>(null);
  const [optSym,      setOptSym]      = useState<string>("TSLA");

  // 1-second tick so the "Ns ago" stamps stay current across all panels.
  useNowTick();

  // ── Derived: market session state from SPY quote ───────────────────────────
  const mktState: MktState = (
    tickers.find((q) => q.symbol === "SPY")?.marketState ?? "CLOSED"
  ) as MktState;

  // ── Fetchers ───────────────────────────────────────────────────────────────

  const refreshTickers = useCallback(async (silent = false) => {
    setTickLoading(true);
    if (!silent) setTickErr(null);
    try {
      const quotes = await fetchQuotes(WATCHLIST);
      if (quotes.length) {
        setTickers(quotes);
        setTickTs(Date.now());
        setTickErr(null); // clear any prior error on success
      } else if (!silent) {
        setTickErr("No data returned — Yahoo may be temporarily unavailable");
      }
    } catch (e) {
      if (!silent) {
        const msg = String(e);
        // Auth-expiry messages are transient; give a soft notice
        if (msg.includes("expired") || msg.includes("session")) {
          setTickErr("Session refreshed — click Refresh to retry");
        } else {
          setTickErr("Live data unavailable · showing last known prices");
        }
      }
    }
    finally { setTickLoading(false); }
  }, []);

  const loadSectors = useCallback(async () => {
    setSectLoading(true);
    try {
      const quotes = await fetchQuotes(SECTOR_SYMS);
      if (quotes.length) { setSectors(quotes); setSectTs(Date.now()); }
    } catch { /* silent — sector panel shows stubs */ }
    finally { setSectLoading(false); }
  }, []);

  const loadFutures = useCallback(async () => {
    setFutLoading(true);
    try {
      const quotes = await fetchQuotes(FUTURES_SYMS);
      if (quotes.length) { setFutures(quotes); setFutTs(Date.now()); }
    } catch { /* silent */ }
    finally { setFutLoading(false); }
  }, []);

  const loadInternals = useCallback(async () => {
    setIntLoading(true);
    try {
      const quotes = await fetchQuotes(INTERNAL_SYMS);
      if (quotes.length) { setInternals(quotes); setIntTs(Date.now()); }
    } catch { /* silent */ }
    finally { setIntLoading(false); }
  }, []);

  const loadOptions = useCallback(async (sym: string) => {
    setOptLoading(true);
    setOptErr(null);
    setContracts([]);
    try {
      const cs = await fetchContracts(sym);
      setContracts(cs); setOptTs(Date.now());
    } catch { setOptErr(`Options chain unavailable for ${sym}`); }
    finally { setOptLoading(false); }
  }, []);

  // Refresh every Market-Floor panel at once.
  const refreshAll = useCallback(() => {
    refreshTickers(false);
    loadSectors();
    loadFutures();
    loadInternals();
    loadOptions(optSym);
  }, [refreshTickers, loadSectors, loadFutures, loadInternals, loadOptions, optSym]);

  // On mount: fetch all panels simultaneously.
  // Tickers mount silently — stubs stay visible; no error banner on initial load.
  // Subsequent manual Refresh will surface errors if they persist.
  useEffect(() => {
    refreshTickers(true);  // silent=true: don't show error on first load
    loadSectors();
    loadFutures();
    loadInternals();
    loadOptions("TSLA");
  }, [refreshTickers, loadSectors, loadFutures, loadInternals, loadOptions]);

  // When the user switches options ticker
  useEffect(() => {
    loadOptions(optSym);
  }, [optSym, loadOptions]);

  // ── Render helpers ─────────────────────────────────────────────────────────
  const sess = sessionBadge(mktState);

  // VIX regime from internals
  const vixQ   = internals.find((q) => q.symbol === "^VIX");
  const vixPx  = vixQ?.price ?? 14.2;
  const vixReg = vixPx < 15
    ? { label: "LOW VOL",  cls: "bg-[rgba(45,212,191,0.12)] text-accent-teal"  }
    : vixPx < 25
    ? { label: "MODERATE", cls: "bg-[rgba(245,183,72,0.12)] text-accent-amber" }
    : { label: "HIGH VOL", cls: "bg-[rgba(255,86,119,0.12)] text-accent-rose"  };

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <PageInner>
      <PageHead
        tag="Quant Lab · Market Floor"
        tone="amber"
        title="Institutional"
        em="signals."
        sub="Live ticker intelligence, dealer positioning, options flow, and regime overlays. Built for the small and medium-sized fund desk."
      />

      {/* ── Tab bar ── */}
      <div className="mb-7 flex items-center gap-0 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-5 py-[9px] font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
              tab === t.id
                ? "text-accent-amber after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent-amber after:content-['']"
                : "text-ink-3 hover:text-ink-1"
            }`}
          >
            {t.label}
            {t.soon && (
              <span className="ml-[5px] rounded-[3px] bg-bg-3 px-[5px] py-[1px] text-[8px] uppercase tracking-[0.08em] text-ink-3">
                soon
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Call / Put Wall System ── */}
      {tab === "walls" && <CallPutWallSystem />}

      {/* ── Options Flow workbench ── */}
      {tab === "options" && (
        <OptionsFlow watch={tickers} internals={internals} mktState={mktState} />
      )}

      {/* ── Regime Lab workbench ── */}
      {tab === "regime" && <RegimeLab watch={tickers} />}

      {/* ── Portfolio risk workbench ── */}
      {tab === "portfolio" && <PortfolioTab />}

      {/* ── Bloomberg Options Terminal ── */}
      {tab === "bloomberg" && <BloombergTerminal />}

      {/* ══════════════════════════════════════════════════════════════════════
          MARKET FLOOR
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "floor" && (
        <>
          {/* ── Refresh-All toolbar: market session + master data-fetch stamp ── */}
          {(() => {
            const anyLoading = tickLoading || sectLoading || futLoading || intLoading || optLoading;
            const lastTs = [tickTs, sectTs, futTs, intTs, optTs].filter((t): t is number => t !== null).sort((a, b) => b - a)[0] ?? null;
            return (
              <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[10px] border border-line bg-bg-1 px-4 py-[10px]">
                <div className={`flex items-center gap-[6px] font-mono text-[10px] uppercase tracking-[0.1em] ${sess.textCls}`}>
                  <span className={`h-[6px] w-[6px] rounded-full ${sess.dot}`} />
                  Market {sess.text}
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">Last fetch</span>
                <Stamp ts={lastTs} loading={anyLoading} />
                <button
                  onClick={refreshAll}
                  disabled={anyLoading}
                  className={`ml-auto flex items-center gap-[6px] rounded-[6px] border px-[12px] py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] transition ${
                    anyLoading ? "cursor-not-allowed border-line text-ink-3 opacity-60" : "border-accent text-accent hover:bg-[rgba(77,141,255,0.08)]"
                  }`}
                >
                  {anyLoading ? <><Spin /> Refreshing…</> : <>↻ Refresh All Panels</>}
                </button>
              </div>
            );
          })()}

          {/* ── Row 1: Ticker Setups | Dealer Positioning ── */}
          <div className="mb-5 grid grid-cols-[2fr_1fr] gap-[14px] max-[1000px]:grid-cols-1">

            {/* ── Ticker Setups ── */}
            <Panel>
              {/* Header */}
              <div className="mb-[14px] flex flex-wrap items-center gap-3">
                <div className="font-display text-[18px] font-medium">Ticker Setups · Day &amp; Swing</div>

                <div className="ml-auto flex items-center gap-3">
                  {/* Error */}
                  {tickErr && (
                    <span className="font-mono text-[9px] text-accent-rose">{tickErr}</span>
                  )}
                  {/* Data-fetch timestamp */}
                  <Stamp ts={tickTs} loading={tickLoading} />
                  {/* Refresh button */}
                  <button
                    onClick={() => refreshTickers(false)}
                    disabled={tickLoading}
                    className={`flex items-center gap-[6px] rounded-[5px] border px-[10px] py-[4px] font-mono text-[10px] uppercase tracking-[0.08em] transition ${
                      tickLoading
                        ? "cursor-not-allowed border-line text-ink-3 opacity-50"
                        : "border-line text-accent hover:border-accent hover:bg-[rgba(77,141,255,0.06)]"
                    }`}
                  >
                    {tickLoading ? <><Spin /> Fetching…</> : <>Refresh ↻</>}
                  </button>
                </div>
              </div>

              {/* Column headers */}
              <div className="mb-1 flex items-center border-b border-line pb-[6px] font-mono text-[8px] uppercase tracking-[0.12em] text-ink-3">
                <span className="w-[60px]">Symbol</span>
                <span className="w-[84px] text-right">Price</span>
                <span className="w-[84px] text-right">Prior</span>
                <span className="w-[72px] text-right">Chg %</span>
                <span className="w-[68px] text-right">Volume</span>
                <span className="ml-auto text-right">Bias</span>
              </div>

              {/* Rows */}
              {tickers.map((t) => {
                const b = bias(t.changePct);
                return (
                  <div
                    key={t.symbol}
                    className="flex items-center border-b border-line py-[9px] transition hover:bg-[rgba(77,141,255,0.03)] last:border-0"
                  >
                    <span className="w-[60px] font-mono text-[13px] font-semibold text-ink-0">{t.symbol}</span>
                    <span className="w-[84px] text-right font-mono text-[13px] text-ink-1">{fmtPx(t.price)}</span>
                    {/* Prior day close — muted so it reads secondary to current price */}
                    <span className="w-[84px] text-right font-mono text-[12px] text-ink-3">{fmtPx(t.prevClose)}</span>
                    <span className={`w-[72px] text-right font-mono text-[11px] ${t.changePct >= 0 ? "text-accent-teal" : "text-accent-rose"}`}>
                      {fmtPct(t.changePct)}
                    </span>
                    <span className="w-[68px] text-right font-mono text-[10px] text-ink-2">{fmtVol(t.volume)}</span>
                    <span className={`ml-auto rounded-[3px] px-2 py-px font-mono text-[9px] uppercase tracking-[0.1em] ${b.cls}`}>
                      {b.label}
                    </span>
                  </div>
                );
              })}
            </Panel>

            {/* ── Dealer Positioning ── */}
            <Panel>
              {/* Header with market-hours-aware badge */}
              <div className="mb-[14px] flex items-center justify-between">
                <div className="font-display text-[18px] font-medium">TSLA Dealer Positioning</div>
                <div className={`flex items-center gap-[6px] font-mono text-[10px] ${sess.textCls}`}>
                  <span className={`h-[6px] w-[6px] flex-shrink-0 rounded-full ${sess.dot}`} />
                  {sess.text}
                </div>
              </div>

              {/* Contextual note when closed */}
              {mktState !== "REGULAR" && (
                <div className="mb-[12px] rounded-[5px] bg-bg-2 px-3 py-[6px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
                  {mktState === "PRE" || mktState === "PREPRE"
                    ? "Pre-market · levels from prior close"
                    : mktState === "POST" || mktState === "POSTPOST"
                    ? "Post-market · levels from today's close"
                    : "Market closed · showing most recent session data"}
                </div>
              )}

              {/* Key GEX levels */}
              {[
                ["Put Wall",   "$420", "text-accent-rose"],
                ["Call Wall",  "$450", "text-accent-teal"],
                ["Zero Gamma", "$428", "text-ink-0"],
                ["Net GEX",    "+$1.4B", "text-ink-0"],
              ].map(([k, v, c]) => (
                <div key={k} className="flex items-center justify-between py-2 font-mono text-[12px]">
                  <span className="text-ink-2">{k}</span>
                  <span className={c}>{v}</span>
                </div>
              ))}

              {/* Gamma exposure bar */}
              <div className="mt-[14px]">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2">
                  <span>Gamma Exposure</span>
                  {mktState !== "REGULAR" && (
                    <span className="text-[9px] text-ink-3">prior session</span>
                  )}
                </div>
                <div className="relative my-1 h-[6px] overflow-hidden rounded-[3px] bg-bg-3">
                  <span
                    className="absolute left-0 top-0 h-full w-[68%]"
                    style={{ background: "linear-gradient(90deg,var(--accent-rose),var(--accent-amber),var(--accent-teal))" }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] text-ink-3">
                  <span>−$2B</span><span>0</span><span>+$2B</span>
                </div>
              </div>

              {/* VIX regime — uses live internals when available */}
              <div className="mt-[14px] border-t border-line pt-[14px]">
                <div className="mb-[6px] flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2">
                  <span>VIX Regime</span>
                  {mktState !== "REGULAR" && (
                    <span className="text-[9px] text-ink-3">prior close</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`rounded px-[10px] py-1 font-mono text-[11px] ${vixReg.cls}`}>{vixReg.label}</div>
                  <div className="font-mono text-[11px] text-ink-1">VIX {vixPx.toFixed(1)}</div>
                  {intLoading && <Spin />}
                </div>
              </div>
            </Panel>
          </div>

          {/* ── Row 2: Sector Rotation | Futures | Market Internals ── */}
          <div className="mb-5 grid grid-cols-3 gap-[14px] max-[1000px]:grid-cols-1">

            {/* ── Sector Rotation Heat Map ── */}
            <Panel>
              <div className="mb-[12px] flex items-center justify-between">
                <div>
                  <div className="font-display text-[15px] font-medium">Sector Rotation</div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">SPDR ETFs · 1-day</div>
                </div>
                <Stamp ts={sectTs} loading={sectLoading} />
              </div>
              <div className="grid grid-cols-2 gap-[5px]">
                {sectors.map((s) => {
                  const hasData = s.price > 0;
                  return (
                    <div
                      key={s.symbol}
                      className={`rounded-[5px] px-[9px] py-[8px] ${hasData ? heatCls(s.changePct) : "bg-bg-2 text-ink-3"}`}
                    >
                      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.06em]">{s.symbol}</div>
                      <div className="mt-[1px] font-mono text-[8px] opacity-70 truncate">{SECTOR_NAMES[s.symbol]}</div>
                      <div className="mt-[4px] font-mono text-[12px] font-semibold">
                        {hasData ? fmtPct(s.changePct) : sectLoading ? "—" : "—"}
                      </div>
                      {hasData && (
                        <div className="mt-[1px] font-mono text-[9px] opacity-60">{fmtPx(s.price)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* ── Futures & Global Markets ── */}
            <Panel>
              <div className="mb-[12px] flex items-center justify-between">
                <div>
                  <div className="font-display text-[15px] font-medium">Futures &amp; Global</div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">Overnight · Pre-mkt positioning</div>
                </div>
                <Stamp ts={futTs} loading={futLoading} />
              </div>
              {futures.map((f) => {
                const hasData = f.price > 0;
                // EUR/USD displayed without $ prefix
                const isFx = f.symbol === "EURUSD=X";
                const pxLabel = hasData
                  ? isFx
                    ? f.price.toFixed(4)
                    : f.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : "—";
                return (
                  <div
                    key={f.symbol}
                    className="flex items-center border-b border-line py-[9px] last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[11px] font-semibold text-ink-0 truncate">
                        {FUTURES_NAMES[f.symbol] ?? f.symbol}
                      </div>
                      <div className="font-mono text-[9px] text-ink-3">{f.symbol}</div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="font-mono text-[11px] text-ink-1">
                        {isFx ? pxLabel : hasData ? `$${pxLabel}` : "—"}
                      </div>
                      <div className={`font-mono text-[10px] ${hasData ? (f.changePct >= 0 ? "text-accent-teal" : "text-accent-rose") : "text-ink-3"}`}>
                        {hasData ? fmtPct(f.changePct) : "—"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Panel>

            {/* ── Market Internals ── */}
            <Panel>
              <div className="mb-[12px] flex items-center justify-between">
                <div>
                  <div className="font-display text-[15px] font-medium">Market Internals</div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">VIX · Breadth · Put/Call</div>
                </div>
                <Stamp ts={intTs} loading={intLoading} />
              </div>
              {internals.map((q) => {
                const hasData = q.price > 0;
                const isVix   = q.symbol === "^VIX";
                const isVVix  = q.symbol === "^VVIX";
                // VIX colored by regime; others by direction
                const valCls  = isVix
                  ? q.price < 15 ? "text-accent-teal" : q.price < 25 ? "text-accent-amber" : "text-accent-rose"
                  : hasData
                  ? q.changePct >= 0 ? "text-accent-teal" : "text-accent-rose"
                  : "text-ink-3";

                return (
                  <div
                    key={q.symbol}
                    className="flex items-center justify-between border-b border-line py-[9px] last:border-0"
                  >
                    <div>
                      <div className="font-mono text-[11px] text-ink-1">{INTERNAL_NAMES[q.symbol] ?? q.symbol}</div>
                      {isVix && hasData && (
                        <div className={`mt-[1px] rounded-[3px] px-[5px] py-[1px] font-mono text-[8px] uppercase inline-block ${vixReg.cls}`}>
                          {vixReg.label}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <div className={`font-mono text-[12px] font-semibold ${valCls}`}>
                        {hasData ? fmtRaw(q.price) : "—"}
                      </div>
                      {hasData && (
                        <div className={`font-mono text-[9px] ${q.changePct >= 0 ? "text-accent-teal" : "text-accent-rose"}`}>
                          {fmtPct(q.changePct)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </Panel>
          </div>

          {/* ── Row 3: Options Flow · Unusual Strikes ── */}
          <Panel className="mb-6">
            <div className="mb-[14px] flex flex-wrap items-center gap-3">
              <div>
                <div className="font-display text-[18px] font-medium">Options Flow · Unusual Strikes</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
                  Sorted by volume · Vol/OI ratio flags unusual institutional activity
                </div>
              </div>

              {/* Ticker selector */}
              <div className="flex flex-wrap gap-[5px]">
                {OPT_TICKERS.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setOptSym(sym)}
                    className={`rounded-[5px] px-[10px] py-[4px] font-mono text-[10px] uppercase tracking-[0.08em] transition ${
                      optSym === sym
                        ? "bg-[rgba(245,183,72,0.15)] text-accent-amber"
                        : "border border-line text-ink-3 hover:border-line-strong hover:text-ink-1"
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-3">
                <Stamp ts={optTs} loading={optLoading} err={optErr} />
                <button
                  onClick={() => loadOptions(optSym)}
                  disabled={optLoading}
                  className={`flex items-center gap-[6px] rounded-[5px] border px-[10px] py-[4px] font-mono text-[10px] uppercase tracking-[0.08em] transition ${
                    optLoading ? "cursor-not-allowed border-line text-ink-3 opacity-50" : "border-line text-accent hover:border-accent hover:bg-[rgba(77,141,255,0.06)]"
                  }`}
                >
                  {optLoading ? <><Spin /> Fetching…</> : <>Refresh ↻</>}
                </button>
              </div>
            </div>

            {/* Error state */}
            {optErr && (
              <div className="rounded-[6px] border border-accent-rose bg-[rgba(255,86,119,0.06)] px-4 py-3 font-mono text-[11px] text-accent-rose">
                {optErr} — try a different symbol or check connection.
              </div>
            )}

            {/* Empty / loading state */}
            {!optErr && !optLoading && contracts.length === 0 && (
              <div className="py-8 text-center font-mono text-[11px] text-ink-3">
                No unusual options contracts found for {optSym}.
              </div>
            )}

            {/* Options table */}
            {contracts.length > 0 && (
              <>
                {/* Column headers */}
                <div className="mb-1 flex items-center border-b border-line pb-[6px] font-mono text-[8px] uppercase tracking-[0.12em] text-ink-3">
                  <span className="w-[46px]">Type</span>
                  <span className="w-[64px]">Strike</span>
                  <span className="w-[64px]">Expiry</span>
                  <span className="w-[72px] text-right">Volume</span>
                  <span className="w-[72px] text-right">Open Int.</span>
                  <span className="w-[60px] text-right">Vol/OI</span>
                  <span className="w-[46px] text-right">IV</span>
                  <span className="w-[70px] text-right">Last</span>
                  <span className="ml-auto text-right">Strike</span>
                </div>

                {contracts.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center border-b border-line py-[9px] transition hover:bg-[rgba(77,141,255,0.03)] last:border-0"
                  >
                    {/* Call / Put badge */}
                    <span className={`w-[46px] rounded-[3px] px-[5px] py-px font-mono text-[9px] uppercase tracking-[0.08em] ${
                      c.otype === "call"
                        ? "bg-[rgba(45,212,191,0.12)] text-accent-teal"
                        : "bg-[rgba(255,86,119,0.12)] text-accent-rose"
                    }`}>
                      {c.otype}
                    </span>

                    <span className="w-[64px] font-mono text-[12px] text-ink-0">${c.strike}</span>
                    <span className="w-[64px] font-mono text-[11px] text-ink-2">{c.expiry}</span>
                    <span className="w-[72px] text-right font-mono text-[11px] text-ink-1">{c.volume.toLocaleString()}</span>
                    <span className="w-[72px] text-right font-mono text-[11px] text-ink-3">{c.oi.toLocaleString()}</span>

                    {/* Vol/OI ratio — highlight if > 1 (unusual) */}
                    <span className={`w-[60px] text-right font-mono text-[11px] ${
                      c.ratio !== "—" && parseFloat(c.ratio) >= 1.0
                        ? "font-semibold text-accent-amber"
                        : "text-ink-2"
                    }`}>
                      {c.ratio === "—" ? "—" : `${c.ratio}×`}
                    </span>

                    <span className="w-[46px] text-right font-mono text-[10px] text-ink-2">{c.iv}</span>
                    <span className="w-[70px] text-right font-mono text-[12px] text-ink-1">
                      ${c.lastPx.toFixed(2)}
                    </span>

                    {/* ITM / OTM badge */}
                    <span className={`ml-auto rounded-[3px] px-[6px] py-px font-mono text-[9px] uppercase tracking-[0.08em] ${
                      c.itm
                        ? "bg-[rgba(77,141,255,0.12)] text-accent"
                        : "bg-bg-3 text-ink-3"
                    }`}>
                      {c.itm ? "ITM" : "OTM"}
                    </span>
                  </div>
                ))}
              </>
            )}
          </Panel>

          {/* ── Quant Modules ── */}
          <SecLabel>Quant Modules</SecLabel>
          <QuantModules />
        </>
      )}
    </PageInner>
  );
}
