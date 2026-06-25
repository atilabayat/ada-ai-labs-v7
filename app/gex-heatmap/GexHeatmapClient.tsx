"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/ui";

// ── Types ──────────────────────────────────────────────────────────────────────

type MktState = "REGULAR" | "PRE" | "POST" | "POSTPOST" | "PREPRE" | "CLOSED";

interface GexRow {
  strike: number;
  net: number[];      // indexed by expiry position
  callGex: number;
  putGex: number;
  totalNet: number;
}
interface GexPayload {
  ok: boolean;
  symbol: string;
  spot: number;
  changePct: number;
  marketState: MktState;
  expiries: string[];
  rows: GexRow[];
  summary: { callWall: number; putWall: number; zeroGamma: number; netGex: number };
  source?: "flashalpha" | "yahoo";
  ts: number;
  error?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const OPT_TICKERS = ["TSLA", "NVDA", "SPY", "XSP", "SPX", "QQQ", "AAPL", "PLTR", "SPCX"] as const;
type OptTicker = (typeof OPT_TICKERS)[number];

// ── Terminal color palette (matches original GexHeatmap.jsx) ──────────────────

const HM = {
  bg:       "#0a0e1a",
  panel:    "#0d1424",
  grid:     "#1a2540",
  text:     "#c7d2e0",
  textDim:  "#6b7a99",
  pos:      [34, 197, 94]  as [number, number, number],
  neg:      [220, 38, 38]  as [number, number, number],
  mark:     "#facc15",
};

function fmtVal(v: number): string {
  if (!v) return "";
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return v.toFixed(0);
}

function fmtMoney(n: number): string {
  if (!n) return "—";
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function cellStyle(v: number, maxAbs: number): React.CSSProperties {
  if (!v) return { background: HM.panel, color: HM.textDim };
  const t = Math.min(Math.abs(v) / (maxAbs || 1), 1);
  const intensity = 0.18 + t * 0.82;
  const [r, g, b] = v > 0 ? HM.pos : HM.neg;
  return {
    background: `rgba(${r},${g},${b},${intensity})`,
    color:      intensity > 0.55 ? "#06110a" : HM.text,
    fontWeight: intensity > 0.55 ? 600 : 400,
  };
}

// ── Shared mini-components ─────────────────────────────────────────────────────

function Spin() {
  return (
    <span className="inline-block h-[10px] w-[10px] animate-spin rounded-full border-2 border-line-strong border-t-accent" />
  );
}

function Stamp({ ts, loading, err }: { ts: number | null; loading?: boolean; err?: string | null }) {
  const secsAgo = ts ? (() => {
    const s = Math.floor((Date.now() - ts) / 1000);
    return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;
  })() : null;

  if (loading)
    return (
      <span className="flex items-center gap-[5px] font-mono text-[9px] uppercase tracking-[0.08em] text-accent-amber">
        <Spin /> fetching…
      </span>
    );
  if (err)
    return <span className="font-mono text-[9px] text-accent-rose" title={err}>⚠ fetch failed</span>;
  if (!ts)
    return <span className="font-mono text-[9px] text-ink-3">— no data —</span>;

  const fresh = Date.now() - ts < 90_000;
  const hhmmss = new Date(ts).toLocaleTimeString("en-US", { hour12: false });
  return (
    <span className="flex items-center gap-[5px] font-mono text-[9px] text-ink-3">
      <span className={`h-[5px] w-[5px] rounded-full ${fresh ? "bg-accent-teal animate-pulse shadow-[0_0_5px_var(--accent-teal)]" : "bg-[#666]"}`} />
      <span className="text-ink-2">⟳ {hhmmss}</span>
      <span className="text-ink-3">· {secsAgo}</span>
    </span>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 2, background: color, display: "inline-block", flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ── Heatmap renderer ───────────────────────────────────────────────────────────

function GexHeatmapView({ payload }: { payload: GexPayload }) {
  const { symbol, spot, expiries, rows, summary, ts } = payload;

  // Sort rows descending by strike for the display table.
  const sorted = useMemo(() => [...rows].sort((a, b) => b.strike - a.strike), [rows]);

  const maxAbs = useMemo(() => {
    let m = 0;
    for (const r of sorted) {
      for (const v of r.net) if (Math.abs(v) > m) m = Math.abs(v);
      if (Math.abs(r.totalNet) > m) m = Math.abs(r.totalNet);
    }
    return m;
  }, [sorted]);

  // Strike row nearest to spot gets the underlying marker.
  const markedStrike = useMemo(() => {
    if (!spot || sorted.length === 0) return null;
    return sorted.reduce((best, r) =>
      Math.abs(r.strike - spot) < Math.abs(best.strike - spot) ? r : best
    ).strike;
  }, [sorted, spot]);

  const asOf = ts
    ? new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

  const th: React.CSSProperties = {
    position: "sticky", top: 0,
    background: HM.bg, color: HM.textDim,
    fontSize: 11, fontWeight: 600,
    letterSpacing: "0.04em", padding: "8px 10px",
    textAlign: "right", borderBottom: `1px solid ${HM.grid}`,
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        background: HM.bg, color: HM.text, borderRadius: 8, padding: 16,
        fontFamily: "ui-monospace, SFMono-Regular, 'Roboto Mono', Menlo, monospace",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.02em" }}>{symbol}</span>
          <span style={{ fontSize: 13, color: HM.textDim }}>Net GEX Heat Map</span>
        </div>
        <div style={{ fontSize: 12, color: HM.textDim, textAlign: "right" }}>
          {spot ? <span style={{ color: HM.mark }}>${spot.toFixed(2)} underlying</span> : null}
          {asOf ? <span> · {asOf}</span> : null}
          <span style={{ marginLeft: 10 }}>
            {"Net GEX: "}
            <span style={{ color: summary.netGex >= 0 ? "#34d399" : "#f87171" }}>{fmtMoney(summary.netGex)}</span>
          </span>
        </div>
      </div>

      {/* Summary stat chips */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        {(
          [
            { label: "Call Wall",  value: summary.callWall  ? `$${summary.callWall}`  : "—", color: "#34d399" },
            { label: "Put Wall",   value: summary.putWall   ? `$${summary.putWall}`   : "—", color: "#f87171" },
            { label: "Zero Gamma", value: summary.zeroGamma ? `$${summary.zeroGamma}` : "—", color: "#facc15" },
            { label: "Net GEX",    value: fmtMoney(summary.netGex),                           color: summary.netGex >= 0 ? "#34d399" : "#f87171" },
          ] as const
        ).map(({ label, value, color }) => (
          <div
            key={label}
            style={{ background: HM.panel, border: `1px solid ${HM.grid}`, borderRadius: 6, padding: "6px 12px" }}
          >
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: HM.textDim, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div style={{ overflow: "auto", maxHeight: "62vh", borderRadius: 6 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left", position: "sticky", left: 0, zIndex: 2 }}>Strike</th>
              {expiries.map((exp) => (
                <th key={exp} style={th}>{exp}</th>
              ))}
              <th style={{ ...th, borderLeft: `1px solid ${HM.grid}` }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const isMarked = row.strike === markedStrike;
              return (
                <tr key={row.strike}>
                  <td
                    style={{
                      position: "sticky", left: 0, zIndex: 1,
                      background: isMarked ? HM.mark : HM.bg,
                      color:      isMarked ? "#000"  : HM.text,
                      fontWeight: isMarked ? 700     : 500,
                      padding: "6px 10px", textAlign: "right",
                      borderRight:  `1px solid ${HM.grid}`,
                      borderBottom: `1px solid ${HM.grid}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ${row.strike.toFixed(2)}
                  </td>
                  {expiries.map((exp, i) => (
                    <td
                      key={exp}
                      title={`${exp} @ $${row.strike}: ${fmtVal(row.net[i] ?? 0) || "0"}`}
                      style={{
                        ...cellStyle(row.net[i] ?? 0, maxAbs),
                        padding: "6px 10px", textAlign: "right",
                        borderBottom: `1px solid ${HM.grid}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtVal(row.net[i] ?? 0)}
                    </td>
                  ))}
                  <td
                    style={{
                      ...cellStyle(row.totalNet, maxAbs),
                      padding: "6px 10px", textAlign: "right",
                      borderBottom: `1px solid ${HM.grid}`,
                      borderLeft:   `1px solid ${HM.grid}`,
                      fontWeight: 600, whiteSpace: "nowrap",
                    }}
                  >
                    {fmtVal(row.totalNet)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 11, color: HM.textDim, flexWrap: "wrap" }}>
        <LegendItem color="rgba(34,197,94,0.85)"  label="Positive GEX — long gamma, stabilizing" />
        <LegendItem color="rgba(220,38,38,0.85)"  label="Negative GEX — short gamma, amplifying" />
        <LegendItem color={HM.mark}               label="Underlying price / nearest strike" />
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

type Status = "idle" | "loading" | "ready" | "error";

export default function GexHeatmapClient() {
  const [ticker,  setTicker] = useState<OptTicker>("TSLA");
  const [status,  setStatus] = useState<Status>("idle");
  const [data,    setData]   = useState<GexPayload | null>(null);
  const [err,     setErr]    = useState<string | null>(null);
  const [ts,      setTs]     = useState<number | null>(null);

  const load = useCallback(async (sym: string) => {
    setStatus("loading"); setErr(null); setData(null);
    try {
      const url = `/api/gex?symbol=${encodeURIComponent(sym)}&n=5&width=100&_ts=${Date.now()}`;
      const r   = await fetch(url, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
      const payload = (await r.json()) as GexPayload;
      if (!payload.ok) throw new Error(payload.error ?? `request failed (${r.status})`);
      if (!payload.rows?.length) throw new Error(`No GEX data returned for ${sym}.`);
      setData(payload); setTs(Date.now()); setStatus("ready");
    } catch (e) {
      setErr(String(e)); setStatus("error");
    }
  }, []);

  // Auto-load TSLA on mount.
  useEffect(() => { load("TSLA"); }, [load]);

  const selectTicker = (sym: OptTicker) => { setTicker(sym); load(sym); };

  const closedNote =
    status === "ready" && data && data.marketState !== "REGULAR";

  return (
    <>
      {/* Ticker selector + controls */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">Symbol</div>
        <div className="flex flex-wrap gap-[5px]">
          {OPT_TICKERS.map((sym) => (
            <button
              key={sym}
              onClick={() => selectTicker(sym)}
              className={`rounded-[5px] px-[12px] py-[5px] font-mono text-[11px] uppercase tracking-[0.08em] transition ${
                ticker === sym
                  ? "bg-[rgba(245,183,72,0.15)] text-accent-amber"
                  : "border border-line text-ink-3 hover:border-line-strong hover:text-ink-1"
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {closedNote && (
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
              Market closed · most recent session
            </span>
          )}
          {status === "ready" && data?.source && (
            <span
              className="font-mono text-[9px] uppercase tracking-[0.08em]"
              style={{ color: data.source === "flashalpha" ? "#34d399" : "#9fb0cc" }}
            >
              {data.source === "flashalpha" ? "Flash Alpha" : "Yahoo Finance"}
            </span>
          )}
          <Stamp ts={ts} loading={status === "loading"} err={err} />
          <button
            onClick={() => load(ticker)}
            disabled={status === "loading"}
            className={`flex items-center gap-[6px] rounded-[5px] border px-[12px] py-[4px] font-mono text-[10px] uppercase tracking-[0.08em] transition ${
              status === "loading"
                ? "cursor-not-allowed border-line text-ink-3 opacity-50"
                : "border-accent text-accent hover:bg-[rgba(77,141,255,0.06)]"
            }`}
          >
            {status === "loading" ? <><Spin /> Fetching…</> : <>↻ Refresh</>}
          </button>
        </div>
      </div>

      {/* Body states */}
      {status === "loading" && (
        <div
          style={{
            background: "#0d1424", border: "1px solid #1a2540",
            borderRadius: 8, padding: 24,
            color: "#9fb0cc", fontSize: 13,
            display: "flex", alignItems: "center", gap: 10,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          <Spin /> Computing Net GEX for {ticker}…
        </div>
      )}
      {status === "error" && (
        <div
          style={{
            background: "#0d1424", border: "1px solid #5a2230",
            borderRadius: 8, padding: 24,
            color: "#f0a0a8", fontSize: 13,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          <strong>Couldn&#39;t load {ticker}.</strong> {err}
        </div>
      )}
      {status === "ready" && data && (
        <Panel>
          <GexHeatmapView payload={data} />
        </Panel>
      )}

      {/* Methodology footnote */}
      <div className="mt-4 font-mono text-[9px] leading-relaxed text-ink-3">
        Primary source: Flash Alpha pre-computed GEX (single stocks). Fallback: Black-Scholes γ per contract
        via Yahoo Finance (r ≈ 4.3%, q = 0). Sign: calls +, puts − (dealer public-data convention). ETFs (SPY,
        QQQ, XSP) always route to Yahoo Finance. Nearest 5 expirations, strikes within ±100 of spot.
      </div>
    </>
  );
}
