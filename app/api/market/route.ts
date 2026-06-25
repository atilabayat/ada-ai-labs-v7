/**
 * /api/market — Yahoo Finance proxy
 *
 * Yahoo Finance's v7 quote + options endpoints require a session crumb.
 * We obtain it via fc.yahoo.com (lightweight cookie endpoint that avoids the
 * HeadersOverflow error caused by finance.yahoo.com's excessive response headers)
 * then exchange those cookies for a crumb via query2.finance.yahoo.com.
 * The crumb + cookie pair is cached in module-scope for 1 hour.
 *
 * GET /api/market?type=quotes&symbols=TSLA,NVDA,…   → { ok, quotes[], ts }
 * GET /api/market?type=options&symbol=TSLA           → { ok, contracts[], underlying, ts }
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic  = "force-dynamic";
export const revalidate = 0;

// ── Browser-like headers ───────────────────────────────────────────────────────

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const BASE = "https://query2.finance.yahoo.com";

// ── Crumb cache ────────────────────────────────────────────────────────────────
// Persists for the lifetime of the Node.js process (works great in dev;
// in serverless prod each cold start re-acquires, which is fine).

let _auth: { crumb: string; cookie: string; expiry: number } | null = null;

/** Node ≥18.14 exposes Headers.getSetCookie() returning string[].
 *  Older runtimes only expose a single joined string via get("set-cookie").
 */
function collectSetCookies(headers: Headers): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (headers as any).getSetCookie === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (headers as any).getSetCookie() as string[];
  }
  const raw = headers.get("set-cookie");
  return raw ? raw.split(/,(?=[^;]+=[^;]+)/) : [];   // comma-split multi-cookie fallback
}

async function getAuth(): Promise<{ crumb: string; cookie: string }> {
  // Return cached auth if still valid
  if (_auth && Date.now() < _auth.expiry) {
    return { crumb: _auth.crumb, cookie: _auth.cookie };
  }

  // ── Step 1: obtain a session cookie from fc.yahoo.com ────────────────────
  // This endpoint returns 404 but still sets the cookie Yahoo's API needs,
  // and it returns far fewer response headers than finance.yahoo.com (no overflow).
  const fcRes = await fetch("https://fc.yahoo.com/", {
    headers: { "User-Agent": UA, Accept: "text/html" },
    redirect: "follow",
  });

  const rawCookies = collectSetCookies(fcRes.headers);
  const cookie = rawCookies.map((c) => c.split(";")[0].trim()).filter(Boolean).join("; ");

  if (!cookie) throw new Error("No cookie received from fc.yahoo.com");

  // ── Step 2: exchange cookie for a crumb ───────────────────────────────────
  const crumbRes = await fetch(`${BASE}/v1/test/getcrumb`, {
    headers: { "User-Agent": UA, Cookie: cookie, Accept: "*/*" },
  });

  if (!crumbRes.ok) {
    throw new Error(`Crumb request failed with status ${crumbRes.status}`);
  }

  const crumb = (await crumbRes.text()).trim();
  if (!crumb || crumb.length > 30 || crumb.startsWith("<")) {
    throw new Error(`Invalid crumb: "${crumb.slice(0, 25)}"`);
  }

  _auth = { crumb, cookie, expiry: Date.now() + 3_600_000 }; // cache 1 hour
  return { crumb, cookie };
}

// ── Black-Scholes greeks ─────────────────────────────────────────────────────
// Yahoo gives implied vol per contract but not greeks. We compute delta/gamma
// from spot, strike, time-to-expiry and IV via Black-Scholes, then derive each
// contract's dollar-gamma exposure (GEX) for proper dealer-positioning maps.

const RISK_FREE = 0.043; // ~3m T-bill / short-rate assumption

function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}
// Abramowitz–Stegun normal CDF approximation
function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}
interface Greeks { delta: number; gamma: number; vega: number; theta: number; }
// Full Black-Scholes greek set for one option (per-share; vega per 1 vol pt,
// theta per calendar day).
function bsGreeks(S: number, K: number, T: number, sig: number, call: boolean): Greeks {
  if (S <= 0 || K <= 0 || T <= 0 || sig <= 0) return { delta: 0, gamma: 0, vega: 0, theta: 0 };
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (RISK_FREE + (sig * sig) / 2) * T) / (sig * sqrtT);
  const d2 = d1 - sig * sqrtT;
  const pdf = normPdf(d1);
  const disc = RISK_FREE * K * Math.exp(-RISK_FREE * T);
  const theta = ((-(S * pdf * sig) / (2 * sqrtT)) + (call ? -disc * normCdf(d2) : disc * normCdf(-d2))) / 365;
  return {
    delta: call ? normCdf(d1) : normCdf(d1) - 1,
    gamma: pdf / (S * sig * sqrtT),
    vega:  (S * pdf * sqrtT) / 100,
    theta,
  };
}

// Midnight UTC of the current day — Yahoo expirations are timestamped at 00:00
// UTC of the expiry date, so an expiration is "today (0DTE) or later" iff its
// timestamp is >= this. Used to drop genuinely-expired (prior-day) expirations.
function todayUtcMidnight(): number {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}

// ── Quote normaliser ───────────────────────────────────────────────────────────

const Q_FIELDS = [
  "regularMarketPrice",
  "regularMarketChangePercent",
  "regularMarketPreviousClose",
  "regularMarketVolume",
  "regularMarketOpen",
  "marketState",
  "shortName",
  "fiftyTwoWeekHigh",
  "fiftyTwoWeekLow",
  "averageDailyVolume10Day",
].join(",");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseQuote(q: Record<string, any>) {
  return {
    symbol:      q.symbol                          as string,
    shortName:   q.shortName                       as string | undefined,
    price:       (q.regularMarketPrice          ?? 0) as number,
    prevClose:   (q.regularMarketPreviousClose   ?? 0) as number,
    changePct:   (q.regularMarketChangePercent   ?? 0) as number,
    volume:      (q.regularMarketVolume          ?? 0) as number,
    open:         q.regularMarketOpen                  as number | undefined,
    high52:       q.fiftyTwoWeekHigh                   as number | undefined,
    low52:        q.fiftyTwoWeekLow                    as number | undefined,
    avgVol:       q.averageDailyVolume10Day            as number | undefined,
    marketState: (q.marketState ?? "CLOSED")      as string,
  };
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const p    = req.nextUrl.searchParams;
  const type = p.get("type") ?? "quotes";

  try {
    const { crumb, cookie } = await getAuth();
    const hdrs = {
      "User-Agent": UA,
      Cookie:       cookie,
      Accept:       "application/json",
    };

    // ── Batch quotes ──────────────────────────────────────────────────────────
    if (type === "quotes") {
      const syms = p.get("symbols") ?? "";
      if (!syms) return NextResponse.json({ ok: true, quotes: [], ts: Date.now() });

      const url = `${BASE}/v7/finance/quote?symbols=${encodeURIComponent(syms)}&fields=${Q_FIELDS}&crumb=${encodeURIComponent(crumb)}`;
      const res = await fetch(url, { headers: hdrs, cache: "no-store" });

      // Stale crumb — invalidate so next request re-acquires
      if (res.status === 401) {
        _auth = null;
        throw new Error("Yahoo session expired — retrying next request");
      }
      if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status}`);

      const json = await res.json();
      if (json?.quoteResponse?.error) {
        // Yahoo-level error (e.g. invalid crumb in body)
        _auth = null;
        throw new Error(json.quoteResponse.error.description ?? "Yahoo Finance error");
      }

      const quotes = (json?.quoteResponse?.result ?? []).map(normaliseQuote);
      return NextResponse.json({ ok: true, quotes, ts: Date.now() });
    }

    // ── Options chain ─────────────────────────────────────────────────────────
    if (type === "options") {
      const sym = p.get("symbol") ?? "TSLA";
      // Depth of chain to return (default 12 for the compact Market-Floor table;
      // the Options Flow workbench requests more to compute gamma / term structure).
      const limit = Math.min(120, Math.max(1, parseInt(p.get("limit") ?? "12", 10) || 12));
      // Optional: include the underlying spot so the client can anchor GEX ladders.
      const url = `${BASE}/v7/finance/options/${sym}?crumb=${encodeURIComponent(crumb)}`;
      const res = await fetch(url, { headers: hdrs, cache: "no-store" });

      if (res.status === 401) {
        _auth = null;
        throw new Error("Yahoo session expired — retrying next request");
      }
      if (!res.ok) throw new Error(`Yahoo Finance options returned ${res.status}`);

      const json  = await res.json();
      const chain = json?.optionChain?.result?.[0];
      if (!chain) return NextResponse.json({ ok: true, contracts: [], ts: Date.now() });

      const opts = chain.options?.[0] ?? {};

      // Underlying spot — needed for greeks + to anchor gamma ladders at the money.
      const spot =
        (chain.quote?.regularMarketPrice as number | undefined) ??
        (chain.quote?.regularMarketPreviousClose as number | undefined) ??
        0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toContract = (c: Record<string, any>, otype: "call" | "put") => {
        const strike = c.strike as number;
        const oi     = (c.openInterest ?? 0) as number;
        const sig    = (c.impliedVolatility ?? 0) as number;
        // Time to expiry in years; floor at ~half a day so 0DTE gamma stays finite.
        const T      = Math.max(((c.expiration as number) * 1000 - Date.now()) / (365.25 * 864e5), 0.5 / 365);
        const g      = bsGreeks(spot, strike, T, sig, otype === "call");
        // Dealer dollar-gamma per 1% move (long calls / short puts convention).
        const gex    = g.gamma * oi * 100 * spot * spot * 0.01 * (otype === "call" ? 1 : -1);
        return {
          otype,
          strike,
          // Yahoo expirations are at 00:00 UTC of the expiry day — format in UTC
          // so e.g. a 2026-06-08 0DTE never renders as the prior day in a
          // west-of-UTC server timezone.
          expiry: new Date((c.expiration as number) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
          volume: (c.volume ?? 0) as number,
          oi,
          ratio:  oi > 0 ? ((c.volume ?? 0) / oi).toFixed(2) : "—",
          iv:     sig > 0 ? `${(sig * 100).toFixed(0)}%` : "—",
          lastPx: (c.lastPrice ?? 0) as number,
          itm:    (c.inTheMoney ?? false) as boolean,
          delta:  +g.delta.toFixed(4),
          gamma:  +g.gamma.toFixed(6),
          vega:   +g.vega.toFixed(4),
          theta:  +g.theta.toFixed(4),
          gex:    Math.round(gex),
        };
      };

      const contracts = [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(opts.calls ?? []).map((c: any) => toContract(c, "call")),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(opts.puts  ?? []).map((c: any) => toContract(c, "put")),
      ]
        .filter((c) => c.volume > 0)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, limit);

      return NextResponse.json({
        ok: true,
        contracts,
        underlying: chain.underlyingSymbol as string,
        spot,
        ts: Date.now(),
      });
    }

    // ── Volatility term structure (multiple expirations) ───────────────────────
    // Yahoo's options endpoint returns one expiration per call, so we read the
    // expirationDates list from the base response then fetch the nearest N
    // expiries and aggregate ATM IV + OI/volume per expiry. Powers the IV term
    // structure and expiry-concentration panels in the Options Flow workbench.
    if (type === "term") {
      const sym = p.get("symbol") ?? "TSLA";
      const n   = Math.min(8, Math.max(2, parseInt(p.get("n") ?? "6", 10) || 6));

      const baseRes = await fetch(`${BASE}/v7/finance/options/${sym}?crumb=${encodeURIComponent(crumb)}`, {
        headers: hdrs, cache: "no-store",
      });
      if (baseRes.status === 401) { _auth = null; throw new Error("Yahoo session expired — retrying next request"); }
      if (!baseRes.ok) throw new Error(`Yahoo Finance term returned ${baseRes.status}`);

      const baseJson = await baseRes.json();
      const chain0   = baseJson?.optionChain?.result?.[0];
      if (!chain0) return NextResponse.json({ ok: true, term: [], spot: 0, ts: Date.now() });

      const spot: number =
        (chain0.quote?.regularMarketPrice as number | undefined) ??
        (chain0.quote?.regularMarketPreviousClose as number | undefined) ?? 0;

      const dates: number[] = (chain0.expirationDates ?? [])
        .filter((d: number) => d * 1000 >= todayUtcMidnight())  // drop expired (prior-day) expirations
        .slice(0, n);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aggregate = (opts: any, date: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const calls: any[] = opts?.calls ?? [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const puts:  any[] = opts?.puts  ?? [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nearest = (arr: any[]) =>
          arr.slice().sort((a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot))[0];
        const ci = nearest(calls)?.impliedVolatility ?? 0;
        const pi = nearest(puts)?.impliedVolatility ?? 0;
        const ivs = [ci, pi].filter((x: number) => x > 0);
        const atmIV = ivs.length ? (ivs.reduce((a: number, b: number) => a + b, 0) / ivs.length) * 100 : 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sum = (arr: any[], k: string) => arr.reduce((a: number, c: any) => a + (c[k] ?? 0), 0);
        return {
          expiry: new Date(date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
          dte:    Math.max(0, Math.round((date * 1000 - Date.now()) / 864e5)),
          atmIV,
          callOI:  sum(calls, "openInterest"),
          putOI:   sum(puts,  "openInterest"),
          callVol: sum(calls, "volume"),
          putVol:  sum(puts,  "volume"),
        };
      };

      const term = await Promise.all(
        dates.map(async (date, i) => {
          // The first expiry's chain is already in the base response.
          if (i === 0 && chain0.options?.[0]) return aggregate(chain0.options[0], date);
          try {
            const r = await fetch(`${BASE}/v7/finance/options/${sym}?date=${date}&crumb=${encodeURIComponent(crumb)}`, {
              headers: hdrs, cache: "no-store",
            });
            if (!r.ok) return null;
            const j = await r.json();
            const opts = j?.optionChain?.result?.[0]?.options?.[0];
            return opts ? aggregate(opts, date) : null;
          } catch { return null; }
        })
      );

      return NextResponse.json({
        ok: true,
        spot,
        term: term.filter(Boolean),
        ts: Date.now(),
      });
    }

    // ── GEX map: per-strike × per-expiry dealer gamma (call/put wall system) ───
    // Fetches the nearest N expirations, computes Black-Scholes γ per contract,
    // and aggregates net GEX (callγ·OI − putγ·OI)·100 per strike per expiry —
    // the data behind a call-wall / put-wall heatmap.
    if (type === "gexmap") {
      const sym   = p.get("symbol") ?? "TSLA";
      const n     = Math.min(6, Math.max(1, parseInt(p.get("n") ?? "5", 10) || 5));
      const width = Math.min(250, Math.max(10, parseInt(p.get("width") ?? "70", 10) || 70));

      const baseRes = await fetch(`${BASE}/v7/finance/options/${sym}?crumb=${encodeURIComponent(crumb)}`, {
        headers: hdrs, cache: "no-store",
      });
      if (baseRes.status === 401) { _auth = null; throw new Error("Yahoo session expired — retrying next request"); }
      if (!baseRes.ok) throw new Error(`Yahoo Finance gexmap returned ${baseRes.status}`);

      const baseJson = await baseRes.json();
      const chain0   = baseJson?.optionChain?.result?.[0];
      if (!chain0) return NextResponse.json({ ok: true, spot: 0, expiries: [], rows: [], summary: {}, ts: Date.now() });

      const spot: number =
        (chain0.quote?.regularMarketPrice as number | undefined) ??
        (chain0.quote?.regularMarketPreviousClose as number | undefined) ?? 0;
      const changePct = (chain0.quote?.regularMarketChangePercent as number | undefined) ?? 0;
      const marketState = (chain0.quote?.marketState as string | undefined) ?? "CLOSED";
      const dates: number[] = (chain0.expirationDates ?? [])
        .filter((d: number) => d * 1000 >= todayUtcMidnight())  // drop expired (prior-day) expirations
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
            const gex = bsGreeks(spot, strike, T, (c.impliedVolatility ?? 0) as number, isCall).gamma * ((c.openInterest ?? 0) as number) * 100;
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
            const r = await fetch(`${BASE}/v7/finance/options/${sym}?date=${date}&crumb=${encodeURIComponent(crumb)}`, { headers: hdrs, cache: "no-store" });
            if (!r.ok) return null;
            opts = (await r.json())?.optionChain?.result?.[0]?.options?.[0];
          } catch { return null; }
        }
        if (!opts) return null;
        return { label: new Date(date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), map: gexForExpiry(opts, date) };
      }));
      const exps = perExp.filter((e): e is { label: string; map: Map<number, { call: number; put: number }> } => e !== null);

      const strikeSet = new Set<number>();
      for (const e of exps) for (const s of e.map.keys()) strikeSet.add(s);
      const strikes = [...strikeSet].sort((a, b) => b - a);

      const rows = strikes.map((strike) => {
        const net = exps.map((e) => { const v = e.map.get(strike); return v ? Math.round(v.call - v.put) : 0; });
        let callGex = 0, putGex = 0;
        for (const e of exps) { const v = e.map.get(strike); if (v) { callGex += v.call; putGex += v.put; } }
        return { strike, net, callGex: Math.round(callGex), putGex: Math.round(putGex), totalNet: Math.round(callGex - putGex) };
      });

      const callWall = rows.slice().sort((a, b) => b.totalNet - a.totalNet)[0]?.strike ?? 0;
      const putWall  = rows.slice().sort((a, b) => a.totalNet - b.totalNet)[0]?.strike ?? 0;
      const netGex   = rows.reduce((s, r) => s + r.totalNet, 0);
      const asc = rows.slice().sort((a, b) => a.strike - b.strike);
      let cum = 0, zeroGamma = 0;
      for (let i = 0; i < asc.length; i++) {
        const prev = cum; cum += asc[i].totalNet;
        if (i > 0 && ((prev < 0 && cum >= 0) || (prev > 0 && cum <= 0))) { zeroGamma = asc[i].strike; break; }
      }

      return NextResponse.json({
        ok: true, symbol: sym, spot, changePct, marketState,
        expiries: exps.map((e) => e.label), rows,
        summary: { callWall, putWall, zeroGamma, netGex }, ts: Date.now(),
      });
    }

    // ── Daily price history (for realized vol + moving averages) ───────────────
    if (type === "history") {
      const sym      = p.get("symbol") ?? "SPY";
      const range    = p.get("range") ?? "1y";
      const interval = p.get("interval") ?? "1d";
      const url = `${BASE}/v8/finance/chart/${encodeURIComponent(sym)}?range=${range}&interval=${interval}`;
      const res = await fetch(url, { headers: hdrs, cache: "no-store" });
      if (res.status === 401) { _auth = null; throw new Error("Yahoo session expired — retrying next request"); }
      if (!res.ok) throw new Error(`Yahoo Finance chart returned ${res.status}`);

      const json = await res.json();
      const r0   = json?.chart?.result?.[0];
      const closes: number[] = (r0?.indicators?.quote?.[0]?.close ?? []).filter(
        (x: unknown): x is number => typeof x === "number" && isFinite(x)
      );
      return NextResponse.json({ ok: true, symbol: sym, closes, ts: Date.now() });
    }

    // ── Bloomberg chain (symmetric strike-keyed chain for the terminal) ────────
    // Returns every strike with both call and put sides, organized for the
    // Bloomberg-style dual-column options chain. Powers the Bloomberg Terminal tab.
    if (type === "bbchain") {
      const sym = p.get("symbol") ?? "SPY";
      const dateParam = p.get("date");
      const url = dateParam
        ? `${BASE}/v7/finance/options/${sym}?date=${dateParam}&crumb=${encodeURIComponent(crumb)}`
        : `${BASE}/v7/finance/options/${sym}?crumb=${encodeURIComponent(crumb)}`;
      const res = await fetch(url, { headers: hdrs, cache: "no-store" });
      if (res.status === 401) { _auth = null; throw new Error("Yahoo session expired — retrying next request"); }
      if (!res.ok) throw new Error(`Yahoo Finance bbchain returned ${res.status}`);

      const json = await res.json();
      const chain = json?.optionChain?.result?.[0];
      if (!chain) return NextResponse.json({ ok: true, quote: null, expirations: [], rows: [], ts: Date.now() });

      const spot: number = (chain.quote?.regularMarketPrice ?? chain.quote?.regularMarketPreviousClose ?? 0) as number;

      const quote = {
        symbol: (chain.underlyingSymbol ?? sym) as string,
        price: spot,
        change: (chain.quote?.regularMarketChange ?? 0) as number,
        changePct: (chain.quote?.regularMarketChangePercent ?? 0) as number,
        bid: (chain.quote?.bid ?? Math.round((spot - 0.01) * 100) / 100) as number,
        ask: (chain.quote?.ask ?? Math.round((spot + 0.01) * 100) / 100) as number,
        volume: (chain.quote?.regularMarketVolume ?? 0) as number,
        iv30: 0,
        totalOI: 0,
        marketState: (chain.quote?.marketState ?? "CLOSED") as string,
      };

      // Available expirations with DTE (drop prior-day expiries)
      const expirations = ((chain.expirationDates ?? []) as number[])
        .filter((d) => d * 1000 >= todayUtcMidnight())
        .map((d) => ({
          date: d,
          label: new Date(d * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit", timeZone: "UTC" }),
          dte: Math.max(0, Math.round((d * 1000 - Date.now()) / 864e5)),
        }));

      // Build symmetric chain keyed by strike
      const opts = chain.options?.[0] ?? {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callMap = new Map<number, any>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const putMap  = new Map<number, any>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapSide = (arr: any[], isCall: boolean, target: Map<number, any>) => {
        for (const c of arr ?? []) {
          const strike = c.strike as number;
          const sig = (c.impliedVolatility ?? 0) as number;
          const T = Math.max(((c.expiration as number) * 1000 - Date.now()) / (365.25 * 864e5), 0.5 / 365);
          const g = bsGreeks(spot, strike, T, sig, isCall);
          target.set(strike, {
            bid: (c.bid ?? 0) as number, ask: (c.ask ?? 0) as number,
            last: (c.lastPrice ?? 0) as number,
            volume: (c.volume ?? 0) as number, oi: (c.openInterest ?? 0) as number,
            iv: sig,
            delta: +g.delta.toFixed(4), gamma: +g.gamma.toFixed(6),
            vega: +g.vega.toFixed(4), theta: +g.theta.toFixed(4),
            itm: (c.inTheMoney ?? false) as boolean,
          });
        }
      };

      mapSide(opts.calls, true, callMap);
      mapSide(opts.puts, false, putMap);

      const allStrikes = new Set([...callMap.keys(), ...putMap.keys()]);
      const rows = [...allStrikes].sort((a, b) => a - b).map((strike) => ({
        strike,
        call: callMap.get(strike) ?? null,
        put: putMap.get(strike) ?? null,
      }));

      // Compute aggregate IV30 (average ATM implied vol)
      const atmRows = rows.filter((r) => Math.abs(r.strike - spot) < spot * 0.02);
      const ivVals = atmRows.flatMap((r) =>
        [r.call?.iv, r.put?.iv].filter((v: number | undefined): v is number => typeof v === "number" && v > 0)
      );
      quote.iv30 = ivVals.length ? (ivVals.reduce((a: number, b: number) => a + b, 0) / ivVals.length) * 100 : 0;
      quote.totalOI = rows.reduce((s, r) => s + (r.call?.oi ?? 0) + (r.put?.oi ?? 0), 0);

      return NextResponse.json({ ok: true, quote, expirations, rows, ts: Date.now() });
    }

    return NextResponse.json({ ok: false, error: "unknown type" }, { status: 400 });

  } catch (err) {
    console.error("[/api/market]", String(err));
    return NextResponse.json(
      { ok: false, error: String(err), quotes: [], contracts: [] },
      { status: 502 }
    );
  }
}
