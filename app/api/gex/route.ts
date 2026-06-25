/**
 * /api/gex — GEX heatmap data
 *
 * Primary:  Flash Alpha  (lab.flashalpha.com/v1/exposure/gex/{symbol})
 *           • FLASH_ALPHA_API_KEY in .env
 *           • Single stocks only on Free plan (TSLA, NVDA, AAPL, PLTR, SPX)
 *           • One expiration per call; we fetch the next N Fridays in parallel
 *           • 5-second per-request timeout; any failure falls through to Yahoo
 *
 * Fallback: Yahoo Finance (same gexmap logic as /api/market?type=gexmap)
 *           • Always works for all tickers including ETFs
 *           • Black-Scholes gamma computed server-side
 *
 * GET /api/gex?symbol=TSLA&n=5&width=100
 * Returns the existing GexPayload shape + `source: "flashalpha" | "yahoo"`
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic  = "force-dynamic";
export const revalidate = 0;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GexRow {
  strike:   number;
  net:      number[];   // indexed by expiry position
  callGex:  number;
  putGex:   number;
  totalNet: number;
}

export interface GexPayload {
  ok:          boolean;
  symbol:      string;
  spot:        number;
  changePct:   number;
  marketState: string;
  expiries:    string[];
  rows:        GexRow[];
  summary: {
    callWall:  number;
    putWall:   number;
    zeroGamma: number;
    netGex:    number;
  };
  source: "flashalpha" | "yahoo";
  ts:     number;
  error?: string;
}

// ── Flash Alpha ────────────────────────────────────────────────────────────────

const FA_BASE = "https://lab.flashalpha.com/v1";

function faKey(): string { return process.env.FLASH_ALPHA_API_KEY ?? ""; }
function hasFa(): boolean { return faKey().length > 8 && !faKey().includes("YOUR_KEY"); }

// ETFs require Flash Alpha Basic plan — skip directly to Yahoo for these
const FA_ETF_BLOCKED = new Set(["SPY", "QQQ", "IWM", "XSP"]);

// Compute the next `n` Friday dates (standard weekly options expirations)
function upcomingFridays(n: number): string[] {
  const dates: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (dates.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 5) dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error(`Flash Alpha timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// Flash Alpha single-expiry response schema (confirmed from live response)
interface FaStrike {
  strike:     number;
  call_gex:   number;
  put_gex:    number;   // already negative (dealer convention)
  net_gex:    number;
  call_oi:    number;
  put_oi:     number;
  call_volume:number;
  put_volume: number;
}
interface FaResponse {
  status?:          string;
  symbol:           string;
  underlying_price: number;
  as_of:            string;
  gamma_flip:       number;   // pre-computed zero-gamma level
  net_gex:          number;
  net_gex_label:    string;
  strikes:          FaStrike[];
}

async function fetchFaExpiry(sym: string, date: string): Promise<FaResponse | null> {
  try {
    const r = await withTimeout(
      fetch(`${FA_BASE}/exposure/gex/${sym}?expiration=${date}`, {
        headers: { "X-Api-Key": faKey(), Accept: "application/json" },
        cache: "no-store",
      }),
      5_000
    );
    if (!r.ok) return null;
    const d: FaResponse = await r.json();
    // Reject error responses (tier_restricted, quota_exceeded, etc.)
    if ((d as { status?: string }).status === "ERROR") return null;
    if (!Array.isArray(d.strikes) || d.strikes.length === 0) return null;
    return d;
  } catch {
    return null;
  }
}

async function fetchFlashAlpha(sym: string, n: number, width: number): Promise<GexPayload> {
  const dates   = upcomingFridays(n);
  const results = await Promise.all(dates.map(d => fetchFaExpiry(sym, d)));
  const valid   = results.filter((r): r is FaResponse => r !== null);

  if (valid.length === 0) throw new Error("No Flash Alpha data returned for any expiration");

  const spot    = valid[0].underlying_price;
  const expiries = dates
    .map((d, i) => results[i] !== null ? fmtExpiry(d) : null)
    .filter((e): e is string => e !== null);

  // Build per-strike map: strike → { net[], callGex, putGex }
  const strikeMap = new Map<number, { net: (number | null)[]; callGex: number; putGex: number }>();

  for (let ei = 0; ei < results.length; ei++) {
    const res = results[ei];
    if (!res) continue;
    const expiryIdx = expiries.indexOf(fmtExpiry(dates[ei]));

    for (const s of res.strikes) {
      if (Math.abs(s.strike - spot) > width) continue;
      let row = strikeMap.get(s.strike);
      if (!row) {
        row = { net: new Array(expiries.length).fill(null), callGex: 0, putGex: 0 };
        strikeMap.set(s.strike, row);
      }
      row.net[expiryIdx] = Math.round(s.net_gex);
      row.callGex += s.call_gex;
      row.putGex  += s.put_gex;
    }
  }

  const rows: GexRow[] = [...strikeMap.entries()].map(([strike, v]) => ({
    strike,
    net:      v.net.map(x => x ?? 0),
    callGex:  Math.round(v.callGex),
    putGex:   Math.round(v.putGex),
    totalNet: Math.round(v.callGex + v.putGex),
  }));

  // Summary
  const callWall  = rows.reduce((b, r) => r.callGex   > b.callGex   ? r : b, rows[0])?.strike ?? 0;
  const putWall   = rows.reduce((b, r) => r.putGex     < b.putGex    ? r : b, rows[0])?.strike ?? 0;
  // Use Flash Alpha's pre-computed gamma_flip from nearest expiry
  const zeroGamma = valid[0].gamma_flip ?? calcZeroGamma(rows);
  const netGex    = rows.reduce((s, r) => s + r.totalNet, 0);

  return {
    ok: true, symbol: sym, spot, changePct: 0, marketState: "REGULAR",
    expiries, rows, summary: { callWall, putWall, zeroGamma, netGex },
    source: "flashalpha", ts: Date.now(),
  };
}

function fmtExpiry(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function calcZeroGamma(rows: GexRow[]): number {
  const asc = [...rows].sort((a, b) => a.strike - b.strike);
  let cum = 0;
  for (let i = 1; i < asc.length; i++) {
    const prev = cum;
    cum += asc[i].totalNet;
    if (i > 0 && ((prev < 0 && cum >= 0) || (prev > 0 && cum <= 0))) return asc[i].strike;
  }
  return 0;
}

// ── Yahoo Finance fallback ─────────────────────────────────────────────────────
// Mirrors the gexmap logic from /api/market/route.ts

const YF_BASE = "https://query2.finance.yahoo.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

let _auth: { crumb: string; cookie: string; expiry: number } | null = null;

function collectSetCookies(headers: Headers): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (headers as any).getSetCookie === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (headers as any).getSetCookie() as string[];
  }
  const raw = headers.get("set-cookie");
  return raw ? raw.split(/,(?=[^;]+=[^;]+)/) : [];
}

async function getYfAuth(): Promise<{ crumb: string; cookie: string }> {
  if (_auth && Date.now() < _auth.expiry) return { crumb: _auth.crumb, cookie: _auth.cookie };
  const fcRes   = await fetch("https://fc.yahoo.com/", { headers: { "User-Agent": UA, Accept: "text/html" }, redirect: "follow" });
  const rawCookies = collectSetCookies(fcRes.headers);
  const cookie  = rawCookies.map(c => c.split(";")[0].trim()).filter(Boolean).join("; ");
  if (!cookie) throw new Error("No cookie from fc.yahoo.com");
  const crumbRes = await fetch(`${YF_BASE}/v1/test/getcrumb`, { headers: { "User-Agent": UA, Cookie: cookie, Accept: "*/*" } });
  if (!crumbRes.ok) throw new Error(`Crumb request failed ${crumbRes.status}`);
  const crumb = (await crumbRes.text()).trim();
  if (!crumb || crumb.length > 30 || crumb.startsWith("<")) throw new Error(`Invalid crumb: "${crumb.slice(0, 25)}"`);
  _auth = { crumb, cookie, expiry: Date.now() + 3_600_000 };
  return { crumb, cookie };
}

const RISK_FREE = 0.043;

function normPdf(x: number): number { return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI); }
function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

function bsGamma(S: number, K: number, T: number, sig: number): number {
  if (S <= 0 || K <= 0 || T <= 0 || sig <= 0) return 0;
  const d1 = (Math.log(S / K) + (RISK_FREE + sig * sig / 2) * T) / (sig * Math.sqrt(T));
  return normPdf(d1) / (S * sig * Math.sqrt(T));
}

function todayUtcMidnight(): number {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}

async function fetchYahoo(yfSym: string, n: number, width: number): Promise<GexPayload> {
  const { crumb, cookie } = await getYfAuth();
  const hdrs = { "User-Agent": UA, Cookie: cookie, Accept: "application/json" };

  const baseRes = await fetch(`${YF_BASE}/v7/finance/options/${yfSym}?crumb=${encodeURIComponent(crumb)}`, {
    headers: hdrs, cache: "no-store",
  });
  if (baseRes.status === 401) { _auth = null; throw new Error("Yahoo session expired"); }
  if (!baseRes.ok) throw new Error(`Yahoo Finance returned ${baseRes.status}`);

  const baseJson = await baseRes.json();
  const chain0   = baseJson?.optionChain?.result?.[0];
  if (!chain0) throw new Error("Empty Yahoo Finance options chain");

  const spot: number =
    (chain0.quote?.regularMarketPrice as number | undefined) ??
    (chain0.quote?.regularMarketPreviousClose as number | undefined) ?? 0;
  const changePct  = (chain0.quote?.regularMarketChangePercent as number | undefined) ?? 0;
  const marketState = (chain0.quote?.marketState as string | undefined) ?? "CLOSED";

  const dates: number[] = (chain0.expirationDates ?? [])
    .filter((d: number) => d * 1000 >= todayUtcMidnight())
    .slice(0, n);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gexForExpiry = (opts: any, date: number): Map<number, { call: number; put: number }> => {
    const m = new Map<number, { call: number; put: number }>();
    const T = Math.max((date * 1000 - Date.now()) / (365.25 * 864e5), 0.5 / 365);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const add = (arr: any[], isCall: boolean) => {
      for (const c of arr ?? []) {
        const strike = c.strike as number;
        if (!strike || Math.abs(strike - spot) > width) continue;
        const gex = bsGamma(spot, strike, T, (c.impliedVolatility ?? 0) as number)
          * ((c.openInterest ?? 0) as number) * 100;
        const e = m.get(strike) ?? { call: 0, put: 0 };
        if (isCall) e.call += gex; else e.put += gex;
        m.set(strike, e);
      }
    };
    add(opts?.calls, true); add(opts?.puts, false);
    return m;
  };

  const perExp = await Promise.all(dates.map(async (date, i) => {
    let opts = i === 0 ? chain0.options?.[0] : undefined;
    if (!opts) {
      try {
        const r = await fetch(`${YF_BASE}/v7/finance/options/${yfSym}?date=${date}&crumb=${encodeURIComponent(crumb)}`, {
          headers: hdrs, cache: "no-store",
        });
        if (r.status === 401) { _auth = null; }
        if (!r.ok) return null;
        opts = (await r.json())?.optionChain?.result?.[0]?.options?.[0];
      } catch { return null; }
    }
    if (!opts) return null;
    return {
      label: new Date(date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      map: gexForExpiry(opts, date),
    };
  }));

  const exps = perExp.filter((e): e is { label: string; map: Map<number, { call: number; put: number }> } => e !== null);
  const expiries = exps.map(e => e.label);

  const strikeSet = new Set<number>();
  for (const e of exps) for (const s of e.map.keys()) strikeSet.add(s);
  const strikes = [...strikeSet].sort((a, b) => b - a);

  const rows: GexRow[] = strikes.map(strike => {
    const net = exps.map(e => { const v = e.map.get(strike); return v ? Math.round(v.call - v.put) : 0; });
    let callGex = 0, putGex = 0;
    for (const e of exps) { const v = e.map.get(strike); if (v) { callGex += v.call; putGex += v.put; } }
    return { strike, net, callGex: Math.round(callGex), putGex: Math.round(putGex), totalNet: Math.round(callGex - putGex) };
  });

  const callWall  = rows.slice().sort((a, b) => b.totalNet - a.totalNet)[0]?.strike ?? 0;
  const putWall   = rows.slice().sort((a, b) => a.totalNet - b.totalNet)[0]?.strike ?? 0;
  const netGex    = rows.reduce((s, r) => s + r.totalNet, 0);
  const asc = rows.slice().sort((a, b) => a.strike - b.strike);
  let cum = 0, zeroGamma = 0;
  for (let i = 0; i < asc.length; i++) {
    const prev = cum; cum += asc[i].totalNet;
    if (i > 0 && ((prev < 0 && cum >= 0) || (prev > 0 && cum <= 0))) { zeroGamma = asc[i].strike; break; }
  }

  return {
    ok: true, symbol: yfSym.replace(/^\^/, ""), spot, changePct, marketState,
    expiries, rows, summary: { callWall, putWall, zeroGamma, netGex },
    source: "yahoo", ts: Date.now(),
  };
}

// ── Yahoo Finance symbol mapping ───────────────────────────────────────────────

const YF_PREFIX: Record<string, string> = { SPX: "^SPX", XSP: "^XSP" };
const yfSym = (s: string) => YF_PREFIX[s.toUpperCase()] ?? s;

// ── Route handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const p      = req.nextUrl.searchParams;
  const sym    = (p.get("symbol") ?? "TSLA").toUpperCase();
  const n      = Math.min(6, Math.max(1, parseInt(p.get("n") ?? "5") || 5));
  const width  = Math.min(300, Math.max(10, parseInt(p.get("width") ?? "100") || 100));

  // Try Flash Alpha if we have a key and the ticker is supported on Free plan
  const tryFlashAlpha = hasFa() && !FA_ETF_BLOCKED.has(sym);

  if (tryFlashAlpha) {
    try {
      const payload = await fetchFlashAlpha(sym, n, width);
      if (payload.rows.length === 0) throw new Error("Flash Alpha returned empty rows");
      return NextResponse.json(payload);
    } catch (faErr) {
      // Log and fall through — Yahoo fallback runs unconditionally
      console.warn(`[/api/gex] Flash Alpha failed for ${sym}: ${String(faErr)} — falling back to Yahoo Finance`);
    }
  }

  // Yahoo Finance fallback
  try {
    const payload = await fetchYahoo(yfSym(sym), n, width);
    return NextResponse.json(payload);
  } catch (yfErr) {
    console.error(`[/api/gex] Yahoo Finance also failed for ${sym}: ${String(yfErr)}`);
    return NextResponse.json(
      { ok: false, error: String(yfErr), quotes: [], contracts: [] },
      { status: 502 }
    );
  }
}
