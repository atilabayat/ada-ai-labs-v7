/**
 * Market data layer for ADA AI Labs.
 *
 * Spot prices   — Yahoo Finance v8 chart API (no key required)
 *   /v8/finance/chart/{ticker}  — per-ticker OHLCV + current price
 *   One call per ticker; parallel for multi-ticker. Works without auth.
 *
 * Options chains — Tradier developer sandbox (free account required)
 *   sandbox.tradier.com/v1/markets/options/chains
 *   Requires TRADIER_TOKEN in .env  (free at tradier.com/create-account)
 *   Without it, options skills fall back to stub data — spot skills still work.
 *
 * All functions return null / [] gracefully on any failure.
 */

const YAHOO_BASE   = "https://query1.finance.yahoo.com";
const TRADIER_BASE = "https://sandbox.tradier.com/v1";

// Yahoo v8 requires a browser-like User-Agent
const YF_HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json",
};

function tradierToken(): string { return process.env.TRADIER_TOKEN ?? ""; }

function hasTradier(): boolean {
  const t = tradierToken();
  return t.length > 8 && !t.includes("YOUR_TOKEN");
}

// Yahoo needs no key — always true for spot data
export function hasKey(): boolean { return true; }

export function today(): string { return new Date().toISOString().slice(0, 10); }

// ─── Types (identical to prior Polygon layer — executors unchanged) ───────────

export interface TickerSnapshot {
  ticker:     string;
  price:      number;   // last trade (during hours) or prev close (after hours)
  open:       number;
  high:       number;
  low:        number;
  close:      number;
  vwap:       number;   // Yahoo doesn't provide intraday VWAP; mirrors close
  volume:     number;
  change:     number;   // price - prevClose
  changePct:  number;
  date:       string;   // YYYY-MM-DD
  isRealtime: boolean;  // true during REGULAR market hours
}

export interface OptionContract {
  strike:       number;
  contractType: "call" | "put";
  expiration:   string;
  openInterest: number;
  volume:       number;
  impliedVol:   number;
  delta:        number;
  gamma:        number;
}

export interface MarketStatus {
  market: "open" | "closed" | "extended-hours";
  nyse:   string;
  nasdaq: string;
  otc:    string;
}

// ─── Internal: fetch v8 chart for one ticker ─────────────────────────────────

async function fetchChart(ticker: string): Promise<TickerSnapshot | null> {
  try {
    const r = await fetch(
      `${YAHOO_BASE}/v8/finance/chart/${ticker}?interval=1d&range=1d&includePrePost=false`,
      { headers: YF_HEADERS, cache: "no-store" }
    );
    if (!r.ok) return null;
    const d = await r.json();
    const result = d?.chart?.result?.[0];
    if (!result) return null;
    const meta      = result.meta as Record<string, unknown>;
    const price     = (meta.regularMarketPrice    as number) ?? 0;
    const prevClose = (meta.chartPreviousClose    as number) ?? price;
    const open      = (meta.regularMarketOpen     as number) ?? price;
    const high      = (meta.regularMarketDayHigh  as number) ?? price;
    const low       = (meta.regularMarketDayLow   as number) ?? price;
    const volume    = (meta.regularMarketVolume   as number) ?? 0;
    const change    = price - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;
    // marketState absent in v8 — treat as realtime if volume > 0 and price differs from prevClose
    const isRT      = volume > 0 && price !== prevClose;
    return {
      ticker,
      price,
      open,
      high,
      low,
      close:      price,
      vwap:       price, // intraday VWAP not in v8 free response
      volume,
      change,
      changePct,
      date:       today(),
      isRealtime: isRT,
    };
  } catch { return null; }
}

// ─── Market status — derived from SPY chart response ─────────────────────────

export async function getMarketStatus(): Promise<MarketStatus | null> {
  const spy = await fetchChart("SPY");
  if (!spy) return null;
  const market: MarketStatus["market"] = spy.isRealtime ? "open" : "closed";
  return { market, nyse: market, nasdaq: market, otc: "closed" };
}

// ─── Single ticker ────────────────────────────────────────────────────────────

export async function getSnapshot(ticker: string): Promise<TickerSnapshot | null> {
  return fetchChart(ticker);
}

// ─── Multi-ticker — parallel v8 chart calls ───────────────────────────────────

export async function getSnapshots(tickers: string[]): Promise<Map<string, TickerSnapshot>> {
  const map = new Map<string, TickerSnapshot>();
  if (!tickers.length) return map;
  const results = await Promise.all(tickers.map(t => fetchChart(t)));
  results.forEach((snap, i) => { if (snap) map.set(tickers[i], snap); });
  return map;
}

// ─── Options chains — Tradier developer sandbox ───────────────────────────────

async function getTradierExpirations(ticker: string): Promise<string[]> {
  try {
    const r = await fetch(
      `${TRADIER_BASE}/markets/options/expirations?symbol=${ticker}&includeAllRoots=false`,
      {
        headers: {
          Authorization: `Bearer ${tradierToken()}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
    if (!r.ok) return [];
    const d = await r.json();
    // Tradier returns { expirations: { date: string[] } } or { expirations: null }
    const dates = d.expirations?.date;
    if (!dates) return [];
    return Array.isArray(dates) ? dates : [dates];
  } catch { return []; }
}

export async function getOptionsChain(
  ticker: string,
  contractType: "call" | "put",
  limit = 20
): Promise<OptionContract[]> {
  if (!hasTradier()) return [];
  try {
    const expirations = await getTradierExpirations(ticker);
    if (!expirations.length) return [];

    // Use the nearest upcoming expiration (front month / 0DTE context)
    const expiration = expirations[0];

    const r = await fetch(
      `${TRADIER_BASE}/markets/options/chains?symbol=${ticker}&expiration=${expiration}&greeks=true`,
      {
        headers: {
          Authorization: `Bearer ${tradierToken()}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
    if (!r.ok) return [];
    const d = await r.json();

    const options = (d.options?.option ?? []) as Record<string, unknown>[];
    return options
      .filter((o) => (o.option_type as string) === contractType)
      .sort((a, b) => ((b.open_interest as number) ?? 0) - ((a.open_interest as number) ?? 0))
      .slice(0, limit)
      .map((o): OptionContract => ({
        strike:       (o.strike        as number)  ?? 0,
        contractType: (o.option_type   as "call" | "put") ?? contractType,
        expiration:   (o.expiration_date as string) ?? expiration,
        openInterest: (o.open_interest as number)  ?? 0,
        volume:       (o.volume        as number)  ?? 0,
        impliedVol:   ((o.greeks as Record<string, number>)?.mid_iv) ?? 0,
        delta:        ((o.greeks as Record<string, number>)?.delta)  ?? 0,
        gamma:        ((o.greeks as Record<string, number>)?.gamma)  ?? 0,
      }));
  } catch { return []; }
}

// ─── Formatting helpers (unchanged) ──────────────────────────────────────────

export function fmtPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function fmtOI(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function fmtVol(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  return n.toLocaleString();
}

export function fmtChange(snap: TickerSnapshot): string {
  const sign = snap.change >= 0 ? "+" : "";
  return `${sign}${snap.change.toFixed(2)} (${sign}${snap.changePct.toFixed(2)}%)`;
}

export function sourceNote(snap: TickerSnapshot | null, marketStatus?: MarketStatus | null): string {
  if (!snap) {
    return `> _Data: **stub** — Yahoo Finance unavailable. Check network or retry._`;
  }
  const tier = snap.isRealtime ? "**live**" : "**prev close**";
  const mkt  = marketStatus ? ` · market ${marketStatus.market}` : "";
  const opts = hasTradier()
    ? ""
    : "\n> _Options chains require a free Tradier sandbox token — add `TRADIER_TOKEN` to .env ([tradier.com/create-account](https://tradier.com/create-account))._";
  return `> _Data: ${tier} via Yahoo Finance · ${snap.date}${mkt}${opts}_`;
}
