import { NextRequest, NextResponse } from "next/server";
import { newsApiSearch, hasNewsApiKey } from "@/lib/skills/web";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LiveCatalyst {
  icon:  "▲" | "▼";
  text:  string;
  up:    boolean;
  url?:  string;
  date?: string;
  source?: string;
}

export interface CatalystsPayload {
  ok:        boolean;
  symbol:    string;
  catalysts: LiveCatalyst[];
  isLive:    boolean;
  ts:        number;
  error?:    string;
}

// ── Sentiment heuristic ───────────────────────────────────────────────────────
// Simple keyword scan — bullish words tilt up, bearish words tilt down.

const BULL_WORDS = [
  "beat", "beats", "surge", "surges", "record", "rally", "rallies", "gain",
  "gains", "upgrade", "upgrades", "outperform", "buy", "bullish", "growth",
  "profit", "profits", "revenue", "milestone", "launch", "contract", "win",
  "wins", "expansion", "demand", "raises", "raised", "raised guidance",
  "strong", "higher", "boost", "boosted", "positive", "approval", "approved",
];

const BEAR_WORDS = [
  "miss", "misses", "decline", "declines", "drop", "drops", "fell", "fall",
  "downgrade", "downgrades", "underperform", "sell", "bearish", "loss",
  "losses", "lawsuit", "recall", "recall", "probe", "investigation", "fine",
  "fined", "weak", "lower", "warning", "cut", "cuts", "guidance cut",
  "layoff", "layoffs", "negative", "concern", "concerns", "risk", "risks",
  "delay", "delays", "miss", "shortfall", "below", "disappoints",
];

function sentiment(text: string): boolean {
  const lower = text.toLowerCase();
  let bullScore = 0, bearScore = 0;
  for (const w of BULL_WORDS) if (lower.includes(w)) bullScore++;
  for (const w of BEAR_WORDS) if (lower.includes(w)) bearScore++;
  return bullScore >= bearScore; // ties default to bullish
}

// ── Full company name map for better news queries ─────────────────────────────

const COMPANY_NAMES: Record<string, string> = {
  TSLA: "Tesla",
  NVDA: "Nvidia",
  SPY:  "S&P 500 ETF",
  XSP:  "S&P 500 mini index",
  SPX:  "S&P 500 index",
  QQQ:  "Nasdaq QQQ ETF",
  AAPL: "Apple",
  PLTR: "Palantir",
  SPCX: "SpaceX",
};

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sym = (req.nextUrl.searchParams.get("symbol") ?? "").toUpperCase().trim();
  if (!sym) {
    return NextResponse.json({ ok: false, error: "symbol required" } as Partial<CatalystsPayload>, { status: 400 });
  }

  // Build a focused news query.
  const name  = COMPANY_NAMES[sym] ?? sym;
  const query = `${name} ${sym} stock news`;

  try {
    const { results, isLive } = await newsApiSearch(query, 8);

    const catalysts: LiveCatalyst[] = results
      .filter((r) => r.title && r.title.length > 10)
      .slice(0, 6)
      .map((r) => {
        const up = sentiment(`${r.title} ${r.content ?? ""}`);
        return {
          icon:   up ? "▲" : "▼",
          text:   r.title,
          up,
          url:    r.url,
          date:   r.date,
          source: r.source,
        };
      });

    return NextResponse.json({
      ok: true,
      symbol: sym,
      catalysts,
      isLive,
      ts: Date.now(),
    } satisfies CatalystsPayload);
  } catch (err) {
    return NextResponse.json({
      ok: false,
      symbol: sym,
      catalysts: [],
      isLive: false,
      ts: Date.now(),
      error: String(err),
    } satisfies CatalystsPayload, { status: 500 });
  }
}
