// ── Types ──────────────────────────────────────────────────────────────────────

export type SRType = "resistance" | "support";
export type RSTag  = "R" | "S" | "N";

export interface SRLevel {
  price: number;
  label: string;
  str:   number;   // 1–4 stars
  type:  SRType;
}

export interface Catalyst {
  icon: "▲" | "▼";
  text: string;
  up:   boolean;
}

export interface ScenTarget { k: string; v: string; }

export interface Scenario {
  label:   string;
  color:   string;
  bg:      string;
  targets: ScenTarget[];
  stop:    string;
  thesis:  string;
  setup?:  string;
  risk?:   string;
}

export interface WeekLevel { price: number; role: string; t: RSTag; }

export interface TickerProfile {
  ticker:     string;
  name:       string;
  earnings:   string;
  srLevels:   SRLevel[];
  catalysts:  Catalyst[];
  scenToday:  Scenario[];
  scenWeek:   Scenario[];
  weekLevels: WeekLevel[];
  todayNote:   string;
  weekNote:    string;
  lastUpdated: string;
}

// ── Per-ticker profiles ────────────────────────────────────────────────────────

export const TICKER_PROFILES: Record<string, TickerProfile> = {

  // ── TSLA — Full analyst model ─────────────────────────────────────────────
  TSLA: {
    ticker: "TSLA", name: "Tesla Inc", earnings: "Jul 29, 2026",

    srLevels: [
      { price: 439.92, label: "multi-week contain",    str: 4, type: "resistance" },
      { price: 428.27, label: "minor",                 str: 1, type: "resistance" },
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
      { price: 341.85, label: "(1% below) DP",         str: 3, type: "support"    },
    ],

    catalysts: [
      { icon: "▲", text: "Musk joining Trump China business delegation",  up: true  },
      { icon: "▲", text: "Tesla $250M battery cell expansion — Germany",  up: true  },
      { icon: "▲", text: "Piper Sandler reiterates $500 PT — Overweight", up: true  },
      { icon: "▲", text: "Model Y NHTSA federal safety bar clearance",    up: true  },
      { icon: "▼", text: "Barclays Hold / Equalweight — $360 PT",         up: false },
      { icon: "▼", text: "JPMorgan Bear Case — $145 PT",                  up: false },
      { icon: "▼", text: "Robotaxi Texas rollout errors",                  up: false },
      { icon: "▼", text: "EU regulators flagging FSD communications",      up: false },
    ],

    scenToday: [
      {
        label: "Bull Case", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Target 1", v: "415.83" }, { k: "Target 2", v: "418.04" }, { k: "Target 3", v: "424.06" }],
        stop: "402.12",
        thesis: "Holds above 409.28 minor S/R → tests session containment at 418.04. Model Y NHTSA approval + Semi deal catalysts. Volume 15% above avg confirms momentum.",
        setup: "Long above 409.28. PT1=415.83, PT2=418.04. Stop below 402.12.",
      },
      {
        label: "Base Case", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Target 1", v: "415.83" }, { k: "Target 2", v: "409.28" }, { k: "Target 3", v: "402.12" }],
        stop: "395.00",
        thesis: "Consolidation between 402.12 intra-day containment and 415.83 minor resistance. 50% fib at 418.04 acts as cap.",
        setup: "Fade rallies near 415.83 / buy dips at 402.12. Range trade day.",
      },
      {
        label: "Bear Case", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Target 1", v: "402.12" }, { k: "Target 2", v: "395.00" }, { k: "Target 3", v: "392.66" }],
        stop: "418.04",
        thesis: "Fails to hold 409.28 → flush to 402.12. Below 402.12 opens 395.00 and weekly containment at 392.66.",
        setup: "Short below 402.12. PT=395.00/392.66. Stop 418.04.",
      },
    ],

    scenWeek: [
      {
        label: "Bull — Break & Hold", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Entry", v: "433–440" }, { k: "Target 1", v: "439.92" }, { k: "Target 2", v: "447.80" }, { k: "Target 3", v: "498.83" }],
        stop: "428.27",
        thesis: "Break $439.92 ceiling on volume → $447.80 then 52W high $498.83. China trip + earnings anticipation as catalysts.",
        risk: "Rejection at $439.92 drops back to 428.27.",
      },
      {
        label: "Neutral — Containment Range", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Entry", v: "428–440" }, { k: "Target 1", v: "439.92" }, { k: "Target 2", v: "428.27" }],
        stop: "424.06",
        thesis: "Compression between 428.27 support and 439.92 ceiling through mid-week. Direction break likely Thu/Fri.",
        risk: "Sideways chop below $439.92; no clean directional trade until clear break.",
      },
      {
        label: "Bear — Support Failure", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Entry", v: "Below 428" }, { k: "Target 1", v: "424.06" }, { k: "Target 2", v: "418.04" }, { k: "Target 3", v: "409.28" }],
        stop: "439.92",
        thesis: "Failure to hold 428.27 triggers flush to 424.06, 418.04, then 409.28.",
        risk: "428.27 is technically strong as flipped resistance-to-support.",
      },
    ],

    weekLevels: [
      { price: 498.83, role: "52W high — ultimate bull target",     t: "R" },
      { price: 447.80, role: "Recent intraday high",                t: "R" },
      { price: 439.92, role: "Multi-week ceiling — KEY",            t: "R" },
      { price: 433.45, role: "Current base / consolidation zone",   t: "N" },
      { price: 428.27, role: "Cleared R → new support floor",       t: "S" },
      { price: 418.04, role: "Session containment — bear target 1", t: "S" },
      { price: 409.28, role: "May 8 pivot — major support",         t: "S" },
      { price: 392.66, role: "Weekly containment UP",               t: "S" },
      { price: 345.29, role: "Multi-week floor",                    t: "S" },
    ],

    todayNote: "TSLA has cleared all original May 8 resistance levels ($409.28, $415.83, $418.04, $424.06, $428.27). Next major test is $439.92 multi-week containment (4★). EPS Q1: $0.41 beat $0.35 est (+15.87%). Q1 Revenue: $22.39B vs $22.10B est.",
    weekNote:  "$439.92 multi-week ceiling is the week's key level. Weekly close above opens $447.80 → $498.83 (52W high). Musk/China trip headlines are the primary catalyst. Watch 428.27 as the new support floor. Earnings Jul 29, 2026 (est. $0.44 EPS).",
    lastUpdated: "Jun 14, 2026",
  },

  // ── NVDA — Live: $203.13 | 52W: $140.85–$236.54 ───────────────────────────
  NVDA: {
    ticker: "NVDA", name: "NVIDIA Corporation", earnings: "Aug 27, 2026",

    srLevels: [
      { price: 236.54, label: "52W high / ATH zone",       str: 4, type: "resistance" },
      { price: 227.80, label: "multi-week containment",    str: 3, type: "resistance" },
      { price: 221.40, label: "session containment",       str: 2, type: "resistance" },
      { price: 215.50, label: "minor",                     str: 1, type: "resistance" },
      { price: 210.20, label: "minor",                     str: 1, type: "resistance" },
      { price: 206.75, label: "session containment",       str: 2, type: "resistance" },
      { price: 200.00, label: "round number / pivot",      str: 3, type: "support"    },
      { price: 196.30, label: "minor",                     str: 1, type: "support"    },
      { price: 192.80, label: "intra-day containment",     str: 2, type: "support"    },
      { price: 188.00, label: "minor",                     str: 1, type: "support"    },
      { price: 184.50, label: "session containment",       str: 2, type: "support"    },
      { price: 179.40, label: "minor",                     str: 1, type: "support"    },
      { price: 175.00, label: "round number support",      str: 2, type: "support"    },
      { price: 168.20, label: "weekly containment",        str: 3, type: "support"    },
      { price: 160.00, label: "minor",                     str: 1, type: "support"    },
      { price: 152.50, label: "multi-week floor",          str: 3, type: "support"    },
      { price: 140.85, label: "52W low",                   str: 4, type: "support"    },
    ],

    catalysts: [
      { icon: "▲", text: "Blackwell GB200 NVL72 full production ramp",          up: true  },
      { icon: "▲", text: "MSFT / Google / Meta capex guidance raised — GPU OI", up: true  },
      { icon: "▲", text: "CUDA ecosystem lock-in — AI training dominance",       up: true  },
      { icon: "▲", text: "Sovereign AI infrastructure deal pipeline expanding",  up: true  },
      { icon: "▼", text: "AMD MI350 gaining hyperscaler evaluation slots",       up: false },
      { icon: "▼", text: "US export control risk — B200/H20 China restrictions", up: false },
      { icon: "▼", text: "Customer capex digestion cycle concerns in H2 2026",  up: false },
      { icon: "▼", text: "High valuation — premium requires flawless execution", up: false },
    ],

    scenToday: [
      {
        label: "Bull Case", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Target 1", v: "215.50" }, { k: "Target 2", v: "221.40" }, { k: "Target 3", v: "227.80" }],
        stop: "206.75",
        thesis: "NVDA holds above $210.20 cleared minor resistance → tests $215.50 then session containment $221.40. Blackwell GB200 ramp + hyperscaler capex sustain momentum. $227.80 multi-week ceiling is max range target.",
        setup: "Long above $210.20. PT1=$215.50, PT2=$221.40. Stop below $206.75.",
      },
      {
        label: "Base Case", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Target 1", v: "215.50" }, { k: "Target 2", v: "210.20" }, { k: "Target 3", v: "206.75" }],
        stop: "200.00",
        thesis: "Consolidation between $206.75 session containment and $215.50 minor resistance. $210.20 acts as intraday pivot. Digesting recent +3% move ahead of next catalyst.",
        setup: "Buy dips at $206.75–$210. Fade rallies near $215.50. Wait for volume confirmation.",
      },
      {
        label: "Bear Case", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Target 1", v: "206.75" }, { k: "Target 2", v: "200.00" }, { k: "Target 3", v: "196.30" }],
        stop: "215.50",
        thesis: "Loses $210.20 → session containment $206.75 then critical $200 round-number pivot. Export control headline or capex digestion cycle risk triggers flush.",
        setup: "Short below $210.20. PT=$206.75/$200. Stop above $215.50.",
      },
    ],

    scenWeek: [
      {
        label: "Bull — ATH Reclaim", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Entry", v: "203–207" }, { k: "Target 1", v: "221.40" }, { k: "Target 2", v: "227.80" }, { k: "Target 3", v: "236.54" }],
        stop: "196.30",
        thesis: "Clears $206.75 session containment → accelerates to $221.40 and multi-week containment at $227.80. ATH retest at $236.54 if Blackwell ramp confirms.",
        risk: "Stalls at $221.40; needs volume conviction to continue.",
      },
      {
        label: "Neutral — Range Coil", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Entry", v: "198–207" }, { k: "Target 1", v: "206.75" }, { k: "Target 2", v: "200.00" }],
        stop: "192.80",
        thesis: "Coils between $200 and $206.75 through mid-week. Direction catalyst needed — watch for Blackwell supply update or hyperscaler commentary.",
        risk: "Choppy action; no clean setup until a clear level breaks with volume.",
      },
      {
        label: "Bear — Pivot Failure", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Entry", v: "Below 200" }, { k: "Target 1", v: "192.80" }, { k: "Target 2", v: "184.50" }, { k: "Target 3", v: "175.00" }],
        stop: "210.20",
        thesis: "Loses $200 pivot → $192.80 intraday containment. Sustained break opens $184.50 and round-number support at $175.00.",
        risk: "$200 is a heavily watched level — expect buy programs on initial test.",
      },
    ],

    weekLevels: [
      { price: 236.54, role: "52W high — ATH / ultimate bull target", t: "R" },
      { price: 227.80, role: "Multi-week ceiling",                    t: "R" },
      { price: 221.40, role: "Session containment — KEY",             t: "R" },
      { price: 210.20, role: "Near-term resistance",                  t: "R" },
      { price: 203.13, role: "Current price / consolidation base",    t: "N" },
      { price: 200.00, role: "Major round number pivot — KEY",        t: "S" },
      { price: 192.80, role: "Intra-day containment",                 t: "S" },
      { price: 184.50, role: "Session containment floor",             t: "S" },
      { price: 168.20, role: "Weekly containment UP",                 t: "S" },
      { price: 152.50, role: "Multi-week floor",                      t: "S" },
      { price: 140.85, role: "52W low",                               t: "S" },
    ],

    todayNote: "NVDA at $210.75 is clearing $210.20 minor resistance on strong volume (+2.98%). $215.50 minor resistance is the immediate intraday ceiling; session containment $221.40 is the bull extension target. $206.75 session containment and $200 round pivot are key support levels. Blackwell GB200 ramp + hyperscaler capex remain the dominant bull catalysts.",
    weekNote:  "$200 pivot is the week's battleground. Hold and a run to $221.40 (session containment) opens the path to $227.80 multi-week ceiling and ultimately the $236.54 ATH. Failure at $200 targets $192.80 → $184.50. Earnings Aug 27, 2026 — expect pre-earnings positioning mid-August.",
    lastUpdated: "Jun 18, 2026",
  },

  // ── SPY — Live: $735.21 | 52W: $591.89–$760.40 ────────────────────────────
  SPY: {
    ticker: "SPY", name: "SPDR S&P 500 ETF", earnings: "—",

    srLevels: [
      { price: 760.40, label: "52W high / ATH",          str: 4, type: "resistance" },
      { price: 752.50, label: "multi-week containment",  str: 3, type: "resistance" },
      { price: 745.80, label: "session containment",     str: 2, type: "resistance" },
      { price: 740.20, label: "minor",                   str: 1, type: "resistance" },
      { price: 737.60, label: "minor",                   str: 1, type: "resistance" },
      { price: 732.00, label: "minor",                   str: 1, type: "support"    },
      { price: 728.50, label: "minor",                   str: 1, type: "support"    },
      { price: 725.00, label: "round number / intraday", str: 2, type: "support"    },
      { price: 720.10, label: "minor",                   str: 1, type: "support"    },
      { price: 715.30, label: "session containment",     str: 2, type: "support"    },
      { price: 710.00, label: "round number support",    str: 2, type: "support"    },
      { price: 702.80, label: "minor",                   str: 1, type: "support"    },
      { price: 695.40, label: "weekly containment",      str: 3, type: "support"    },
      { price: 685.00, label: "minor",                   str: 1, type: "support"    },
      { price: 675.20, label: "session containment",     str: 2, type: "support"    },
      { price: 658.00, label: "multi-week floor",        str: 3, type: "support"    },
      { price: 635.00, label: "major support zone",      str: 3, type: "support"    },
      { price: 610.00, label: "52W support zone",        str: 3, type: "support"    },
      { price: 591.89, label: "52W low",                 str: 4, type: "support"    },
    ],

    catalysts: [
      { icon: "▲", text: "Fed rate cut path intact — easing bias sustained",   up: true  },
      { icon: "▲", text: "Q1 2026 earnings season — 78% beat rate",            up: true  },
      { icon: "▲", text: "US-China trade deal progress — tariff de-escalation", up: true  },
      { icon: "▲", text: "AI productivity boom driving revenue growth",         up: true  },
      { icon: "▼", text: "Inflation re-acceleration risk — CPI watching",       up: false },
      { icon: "▼", text: "Consumer credit stress — delinquencies rising",       up: false },
      { icon: "▼", text: "Geopolitical risk premium — Middle East / Ukraine",   up: false },
      { icon: "▼", text: "High P/E multiples — compression risk at ATH zone",   up: false },
    ],

    scenToday: [
      {
        label: "Bull Case", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Target 1", v: "752.50" }, { k: "Target 2", v: "760.40" }],
        stop: "740.20",
        thesis: "SPY cleared $745.80 session containment — that level now acts as intraday support. $752.50 multi-week ceiling is the near-term target. Positive macro + Fed easing bias extend the move to ATH $760.40.",
        setup: "Long above $745.80. PT1=$752.50, PT2=$760.40. Stop below $740.20.",
      },
      {
        label: "Base Case", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Target 1", v: "752.50" }, { k: "Target 2", v: "745.80" }, { k: "Target 3", v: "740.20" }],
        stop: "732.00",
        thesis: "Consolidation between cleared $745.80 (now support) and $752.50 multi-week ceiling. Market digests breakout above session containment — direction catalyst needed to clear $752.50.",
        setup: "Buy dips at $745.80–$740 zone, fade rallies near $752.50.",
      },
      {
        label: "Bear Case", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Target 1", v: "745.80" }, { k: "Target 2", v: "740.20" }, { k: "Target 3", v: "737.60" }],
        stop: "752.50",
        thesis: "Rejected at $752.50 ceiling → reversal back through $745.80 session containment. $740.20 and $737.60 are first bear targets. Risk-off catalyst extends to $732.",
        setup: "Short on rejection at $752.50. PT=$745.80/$740. Stop above $752.50.",
      },
    ],

    scenWeek: [
      {
        label: "Bull — ATH Charge", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Entry", v: "730–737" }, { k: "Target 1", v: "745.80" }, { k: "Target 2", v: "752.50" }, { k: "Target 3", v: "760.40" }],
        stop: "725.00",
        thesis: "Clears $737.60–$740 zone → $745.80 session containment then multi-week ceiling $752.50. ATH retest at $760.40 on positive macro + earnings.",
        risk: "Stalls at $745.80; needs macro confirmation to reach $752.50.",
      },
      {
        label: "Neutral — Consolidation", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Entry", v: "725–737" }, { k: "Target 1", v: "740.20" }, { k: "Target 2", v: "725.00" }],
        stop: "715.30",
        thesis: "Digests gains between $725 round support and $740 resistance. Direction likely set by Thursday CPI or Fed speak.",
        risk: "Choppy, low-conviction week; wait for level break with volume.",
      },
      {
        label: "Bear — Rollover", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Entry", v: "Below 725" }, { k: "Target 1", v: "715.30" }, { k: "Target 2", v: "710.00" }, { k: "Target 3", v: "695.40" }],
        stop: "745.80",
        thesis: "Loses $725 round support → session containment at $715.30 then $710 round number. Full pullback to weekly containment $695.40 on macro shock.",
        risk: "$725 has strong institutional buy programs; initial breaks often reverse.",
      },
    ],

    weekLevels: [
      { price: 760.40, role: "52W high — ATH target",              t: "R" },
      { price: 752.50, role: "Multi-week ceiling",                  t: "R" },
      { price: 745.80, role: "Session containment — KEY",           t: "R" },
      { price: 735.21, role: "Current price / consolidation base",  t: "N" },
      { price: 725.00, role: "Round number — critical weekly support", t: "S" },
      { price: 715.30, role: "Session containment floor",           t: "S" },
      { price: 710.00, role: "Round number support",                t: "S" },
      { price: 695.40, role: "Weekly containment UP",               t: "S" },
      { price: 658.00, role: "Multi-week floor",                    t: "S" },
      { price: 591.89, role: "52W low",                             t: "S" },
    ],

    todayNote: "SPY at $746.94 has cleared $745.80 session containment — that level now acts as intraday support. $752.50 multi-week ceiling is the immediate resistance. Bull catalyst: Fed easing path + AI productivity boom. Hold above $745.80 targets $752.50; loss below $740.20 signals reversal.",
    weekNote:  "The $745.80 session containment is the week's key resistance. Break and hold opens $752.50 multi-week ceiling and ultimately ATH $760.40. Loss of $725 targets $715.30 → $710 → $695.40 weekly containment. No earnings; macro data drives.",
    lastUpdated: "Jun 18, 2026",
  },

  // ── XSP — Live: $734.05 | 52W: $594.32–$762.09 ────────────────────────────
  XSP: {
    ticker: "XSP", name: "Mini-SPX Index Options (XSP)", earnings: "—",

    srLevels: [
      { price: 762.09, label: "52W high / ATH",          str: 4, type: "resistance" },
      { price: 752.00, label: "multi-week containment",  str: 3, type: "resistance" },
      { price: 745.50, label: "session containment",     str: 2, type: "resistance" },
      { price: 740.00, label: "round number / minor",    str: 2, type: "resistance" },
      { price: 737.20, label: "minor",                   str: 1, type: "resistance" },
      { price: 730.00, label: "minor",                   str: 1, type: "support"    },
      { price: 726.40, label: "minor",                   str: 1, type: "support"    },
      { price: 722.00, label: "intra-day containment",   str: 2, type: "support"    },
      { price: 718.00, label: "minor",                   str: 1, type: "support"    },
      { price: 713.50, label: "session containment",     str: 2, type: "support"    },
      { price: 708.00, label: "minor",                   str: 1, type: "support"    },
      { price: 700.00, label: "major round number",      str: 3, type: "support"    },
      { price: 692.80, label: "minor",                   str: 1, type: "support"    },
      { price: 685.00, label: "weekly containment",      str: 3, type: "support"    },
      { price: 672.00, label: "minor",                   str: 1, type: "support"    },
      { price: 660.00, label: "session containment",     str: 2, type: "support"    },
      { price: 640.00, label: "multi-week floor",        str: 3, type: "support"    },
      { price: 610.00, label: "52W support zone",        str: 3, type: "support"    },
      { price: 594.32, label: "52W low",                 str: 4, type: "support"    },
    ],

    catalysts: [
      { icon: "▲", text: "SPX breakout impulse — index options flow bullish",  up: true  },
      { icon: "▲", text: "0DTE options positioning net long above 730",        up: true  },
      { icon: "▲", text: "VIX compressed — positive gamma dealer positioning", up: true  },
      { icon: "▲", text: "End-of-week options expiry pin above 730 zone",      up: true  },
      { icon: "▼", text: "Dealer gamma flip below 722 — move amplification",   up: false },
      { icon: "▼", text: "Put wall accumulation at 700 strike",                up: false },
      { icon: "▼", text: "Monthly OPEX — potential delta unwind pressure",     up: false },
      { icon: "▼", text: "VIX spike risk on macro shock — dealer short gamma", up: false },
    ],

    scenToday: [
      {
        label: "Bull Case", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Target 1", v: "752.00" }, { k: "Target 2", v: "762.09" }],
        stop: "740.00",
        thesis: "XSP cleared $745.50 session containment — now acts as intraday support. $752.00 multi-week ceiling is the immediate target. Positive gamma regime above $722 sustains dealer bid. Break above $752 opens ATH $762.09.",
        setup: "Long above $745.50. PT1=$752.00, PT2=$762.09. Stop below $740.",
      },
      {
        label: "Base Case", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Target 1", v: "752.00" }, { k: "Target 2", v: "745.50" }, { k: "Target 3", v: "740.00" }],
        stop: "730.00",
        thesis: "Consolidation between cleared $745.50 (now support) and $752.00 multi-week ceiling. Positive gamma above $722 damps large moves. 0DTE pinning likely near $750 zone into close.",
        setup: "Buy $745–$747 zone, fade $750–$752 zone. Range scalp — avoid overnight risk.",
      },
      {
        label: "Bear Case", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Target 1", v: "745.50" }, { k: "Target 2", v: "740.00" }, { k: "Target 3", v: "730.00" }],
        stop: "752.00",
        thesis: "Rejected at $752 multi-week ceiling → reversal through $745.50 session containment. Gamma flip below $722 would accelerate. $740 round and $730 minor support are bear targets.",
        setup: "Short on rejection at $752. PT=$745.50/$740. Stop above $752.",
      },
    ],

    scenWeek: [
      {
        label: "Bull — ATH Reclaim", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Entry", v: "730–737" }, { k: "Target 1", v: "745.50" }, { k: "Target 2", v: "752.00" }, { k: "Target 3", v: "762.09" }],
        stop: "722.00",
        thesis: "Clears $737–$740 zone → $745.50 session containment and multi-week ceiling $752. ATH retest $762.09 if macro sustains.",
        risk: "High strike clustering near $745–$750 may create dealer resistance.",
      },
      {
        label: "Neutral — Expiry Pin", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Entry", v: "722–737" }, { k: "Target 1", v: "737.20" }, { k: "Target 2", v: "722.00" }],
        stop: "713.50",
        thesis: "OPEX pinning between $722 gamma flip and $740 round resistance. Market stays range-bound into weekly close.",
        risk: "OPEX week can produce sharp moves in either direction post-pin.",
      },
      {
        label: "Bear — Gamma Cascade", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Entry", v: "Below 722" }, { k: "Target 1", v: "713.50" }, { k: "Target 2", v: "708.00" }, { k: "Target 3", v: "700.00" }],
        stop: "745.50",
        thesis: "Gamma flip at $722 → dealer short gamma forces selling cascade to $713.50 session containment. Major $700 put wall is the week's bear target.",
        risk: "Put wall at $700 represents massive institutional hedging floor.",
      },
    ],

    weekLevels: [
      { price: 762.09, role: "52W high — ATH target",              t: "R" },
      { price: 752.00, role: "Multi-week ceiling",                  t: "R" },
      { price: 745.50, role: "Session containment — KEY",           t: "R" },
      { price: 734.05, role: "Current price / consolidation base",  t: "N" },
      { price: 722.00, role: "GEX gamma flip level — KEY",          t: "S" },
      { price: 713.50, role: "Session containment floor",           t: "S" },
      { price: 700.00, role: "Put wall / major psychological",       t: "S" },
      { price: 685.00, role: "Weekly containment UP",               t: "S" },
      { price: 640.00, role: "Multi-week floor",                    t: "S" },
      { price: 594.32, role: "52W low",                             t: "S" },
    ],

    todayNote: "XSP at $749.65 has cleared $745.50 session containment — that level now acts as intraday support. $752.00 multi-week ceiling is the immediate test. Positive gamma regime above $722 GEX flip sustains dealer bid. Break and hold above $752 opens ATH $762.09.",
    weekNote:  "$745.50 session containment is the weekly ceiling. $722 GEX flip is the pivotal support — loss targets $713.50 and $700 put wall. OPEX dynamics will dominate direction into Friday close. No fundamental catalyst; index options flow and dealer positioning drive.",
    lastUpdated: "Jun 18, 2026",
  },

  // ── SPX — Live: $7,339.82 | 52W: $5,943.23–$7,620.90 ─────────────────────
  SPX: {
    ticker: "SPX", name: "S&P 500 Index", earnings: "—",

    srLevels: [
      { price: 7620.90, label: "52W high / ATH zone",     str: 4, type: "resistance" },
      { price: 7500.00, label: "round number ceiling",    str: 3, type: "resistance" },
      { price: 7425.00, label: "session containment",     str: 2, type: "resistance" },
      { price: 7390.00, label: "minor",                   str: 1, type: "resistance" },
      { price: 7360.00, label: "minor",                   str: 1, type: "resistance" },
      { price: 7300.00, label: "round number",            str: 2, type: "support"    },
      { price: 7265.00, label: "minor",                   str: 1, type: "support"    },
      { price: 7225.00, label: "intra-day containment",   str: 2, type: "support"    },
      { price: 7190.00, label: "minor",                   str: 1, type: "support"    },
      { price: 7140.00, label: "session containment",     str: 2, type: "support"    },
      { price: 7080.00, label: "minor",                   str: 1, type: "support"    },
      { price: 7000.00, label: "major round number",      str: 3, type: "support"    },
      { price: 6925.00, label: "minor",                   str: 1, type: "support"    },
      { price: 6850.00, label: "weekly containment UP",   str: 3, type: "support"    },
      { price: 6720.00, label: "minor",                   str: 1, type: "support"    },
      { price: 6600.00, label: "session containment",     str: 2, type: "support"    },
      { price: 6400.00, label: "multi-week floor",        str: 3, type: "support"    },
      { price: 6100.00, label: "52W support zone",        str: 3, type: "support"    },
      { price: 5943.23, label: "52W low",                 str: 4, type: "support"    },
    ],

    catalysts: [
      { icon: "▲", text: "Federal Reserve rate cut cycle — easing bias intact", up: true  },
      { icon: "▲", text: "S&P 500 Q1 2026 EPS: +9.2% YoY — beat estimates",    up: true  },
      { icon: "▲", text: "US-China Phase 2 trade deal progress",                up: true  },
      { icon: "▲", text: "AI productivity wave driving margin expansion",        up: true  },
      { icon: "▼", text: "Core PCE re-acceleration — Fed pause risk",           up: false },
      { icon: "▼", text: "10Y Treasury yield pressure — P/E multiple headwind", up: false },
      { icon: "▼", text: "Credit market stress — HY spreads widening",          up: false },
      { icon: "▼", text: "Geopolitical risk premium: Middle East / Taiwan",     up: false },
    ],

    scenToday: [
      {
        label: "Bull Case", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Target 1", v: "7500" }, { k: "Target 2", v: "7620.90" }],
        stop: "7390",
        thesis: "SPX at $7,496 — testing the critical $7,500 round-number ceiling. Confirmed hold and close above $7,500 opens a direct path to ATH $7,620.90 with no major S/R between. Positive macro + AI productivity narrative as catalyst.",
        setup: "Long on hold above $7,500. PT=$7,620.90. Stop below $7,390.",
      },
      {
        label: "Base Case", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Target 1", v: "7500" }, { k: "Target 2", v: "7425" }, { k: "Target 3", v: "7390" }],
        stop: "7300",
        thesis: "SPX consolidates at the $7,500 psychological ceiling — a massively watched institutional level. $7,425 session containment (cleared, now support) anchors the range below. Direction break likely on macro catalyst.",
        setup: "Buy dips at $7,425–$7,390 zone, fade rallies at $7,500. Wait for confirmed breakout.",
      },
      {
        label: "Bear Case", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Target 1", v: "7425" }, { k: "Target 2", v: "7390" }, { k: "Target 3", v: "7300" }],
        stop: "7500",
        thesis: "Rejected at $7,500 round ceiling → reversal to $7,425 session containment then $7,390 minor. P/E compression risk at ATH zone. Macro shock extends to $7,300 round number.",
        setup: "Short on rejection at $7,500. PT=$7,425/$7,300. Stop above $7,500.",
      },
    ],

    scenWeek: [
      {
        label: "Bull — ATH Charge", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Entry", v: "7300–7360" }, { k: "Target 1", v: "7425" }, { k: "Target 2", v: "7500" }, { k: "Target 3", v: "7620.90" }],
        stop: "7225",
        thesis: "Clears $7,360–$7,390 resistance → $7,425 session containment then $7,500 round ceiling. ATH retest at $7,620.90 on positive macro + earnings.",
        risk: "Dense resistance $7,390–$7,425; needs broad market participation to push through.",
      },
      {
        label: "Neutral — Near ATH Consolidation", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Entry", v: "7265–7390" }, { k: "Target 1", v: "7425" }, { k: "Target 2", v: "7265" }],
        stop: "7140",
        thesis: "Index consolidates below all-time highs in $7,265–$7,390 range. Catalyst needed for directional break — watch Thursday CPI and FOMC speakers.",
        risk: "Indecisive week; patience required before directional commitment.",
      },
      {
        label: "Bear — ATH Rejection", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Entry", v: "Below 7265" }, { k: "Target 1", v: "7140" }, { k: "Target 2", v: "7080" }, { k: "Target 3", v: "7000" }],
        stop: "7425",
        thesis: "Rejected near ATH zone → pullback to $7,140 session containment. Macro shock extends to major $7,000 round support.",
        risk: "$7,000 is a massive psychological and institutional support level.",
      },
    ],

    weekLevels: [
      { price: 7620.90, role: "52W high — ATH target",             t: "R" },
      { price: 7500.00, role: "Round number ceiling",               t: "R" },
      { price: 7425.00, role: "Session containment — KEY",          t: "R" },
      { price: 7339.82, role: "Current price / consolidation base", t: "N" },
      { price: 7225.00, role: "Intra-day containment floor",        t: "S" },
      { price: 7140.00, role: "Session containment",                t: "S" },
      { price: 7000.00, role: "Major round number / put wall",      t: "S" },
      { price: 6850.00, role: "Weekly containment UP",              t: "S" },
      { price: 6400.00, role: "Multi-week floor",                   t: "S" },
      { price: 5943.23, role: "52W low",                            t: "S" },
    ],

    todayNote: "SPX at $7,496 is testing the critical $7,500 round-number ceiling — the most pivotal level of the session. A confirmed close above $7,500 opens a direct path to ATH $7,620.90 with no major resistance between. $7,425 session containment (cleared, now support) is the key intraday floor. Watch for institutional buy/sell programs at the $7,500 print.",
    weekNote:  "$7,425 session containment is the week's key resistance. Break and hold opens $7,500 round ceiling and ATH $7,620.90. Loss of $7,225 targets $7,140 → $7,000 major psychological. No individual earnings; macro data (CPI, PPI, Fed speak) and index flows drive the tape.",
    lastUpdated: "Jun 18, 2026",
  },

  // ── QQQ — Live: $710.95 | 52W: $523.65–$748.65 ────────────────────────────
  QQQ: {
    ticker: "QQQ", name: "Invesco QQQ Trust (Nasdaq-100)", earnings: "—",

    srLevels: [
      { price: 748.65, label: "52W high / ATH zone",       str: 4, type: "resistance" },
      { price: 738.40, label: "multi-week containment",    str: 3, type: "resistance" },
      { price: 728.50, label: "session containment",       str: 2, type: "resistance" },
      { price: 720.00, label: "round number / minor",      str: 2, type: "resistance" },
      { price: 715.80, label: "minor",                     str: 1, type: "resistance" },
      { price: 708.20, label: "minor",                     str: 1, type: "support"    },
      { price: 703.50, label: "minor",                     str: 1, type: "support"    },
      { price: 698.00, label: "intra-day containment",     str: 2, type: "support"    },
      { price: 692.40, label: "minor",                     str: 1, type: "support"    },
      { price: 685.70, label: "session containment",       str: 2, type: "support"    },
      { price: 678.00, label: "minor",                     str: 1, type: "support"    },
      { price: 670.00, label: "round number support",      str: 2, type: "support"    },
      { price: 658.30, label: "weekly containment UP",     str: 3, type: "support"    },
      { price: 645.00, label: "minor",                     str: 1, type: "support"    },
      { price: 635.80, label: "session containment",       str: 2, type: "support"    },
      { price: 620.00, label: "round number support",      str: 2, type: "support"    },
      { price: 598.40, label: "multi-week floor",          str: 3, type: "support"    },
      { price: 570.00, label: "major support",             str: 3, type: "support"    },
      { price: 545.00, label: "52W support zone",          str: 3, type: "support"    },
      { price: 523.65, label: "52W low",                   str: 4, type: "support"    },
    ],

    catalysts: [
      { icon: "▲", text: "Mega-cap tech earnings beats — NVDA, MSFT, GOOG",    up: true  },
      { icon: "▲", text: "AI infrastructure spend cycle accelerating sharply",  up: true  },
      { icon: "▲", text: "Apple Intelligence driving iPhone upgrade supercycle", up: true  },
      { icon: "▲", text: "Rate sensitive: Fed cut path supports Nasdaq premium", up: true  },
      { icon: "▼", text: "Regulatory scrutiny on big tech — DOJ / EU antitrust", up: false },
      { icon: "▼", text: "NVDA & AAPL concentration — single-stock event risk",  up: false },
      { icon: "▼", text: "Rate sensitivity: any Fed pause reprices growth names", up: false },
      { icon: "▼", text: "Valuation stretched — QQQ P/E premium vs SPY",        up: false },
    ],

    scenToday: [
      {
        label: "Bull Case", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Target 1", v: "748.65" }],
        stop: "732.00",
        thesis: "QQQ cleared $738.40 multi-week containment — that level flips to support. ATH $748.65 is the only major resistance remaining. Strong AI/mega-cap tape + rate easing path. No resistance between current price and ATH.",
        setup: "Long above $738.40. PT=$748.65. Stop below $732 (below breakout zone).",
      },
      {
        label: "Base Case", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Target 1", v: "748.65" }, { k: "Target 2", v: "738.40" }, { k: "Target 3", v: "728.50" }],
        stop: "720.00",
        thesis: "Consolidation just above $738.40 breakout zone. Needs catalyst to clear ATH $748.65 — potential supply at the high. $738.40 is now the critical intraday support pivot.",
        setup: "Buy dips at $738.40–$735 zone. Fade initial test of $748.65. Await volume confirmation.",
      },
      {
        label: "Bear Case", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Target 1", v: "738.40" }, { k: "Target 2", v: "728.50" }, { k: "Target 3", v: "720.00" }],
        stop: "748.65",
        thesis: "False breakout above $738.40 → reversal back through multi-week ceiling. $728.50 session containment is key bear target. Rate concern or regulatory headline triggers unwind.",
        setup: "Short below $738.40. PT=$728.50/$720. Stop above $748.65.",
      },
    ],

    scenWeek: [
      {
        label: "Bull — ATH Push", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Entry", v: "708–716" }, { k: "Target 1", v: "728.50" }, { k: "Target 2", v: "738.40" }, { k: "Target 3", v: "748.65" }],
        stop: "698.00",
        thesis: "Clears $715.80–$720 resistance → session containment $728.50 then multi-week ceiling $738.40. ATH retest $748.65 on sustained mega-cap momentum.",
        risk: "Dense resistance $720–$728; must see volume spike on break.",
      },
      {
        label: "Neutral — Tech Pause", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Entry", v: "698–716" }, { k: "Target 1", v: "720.00" }, { k: "Target 2", v: "698.00" }],
        stop: "685.70",
        thesis: "Sideways week between $698 intraday containment and $720 round resistance. Await next NVDA supply update or AAPL AI announcement.",
        risk: "No direction catalyst in sight; risk of extended chop.",
      },
      {
        label: "Bear — Growth Unwind", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Entry", v: "Below 698" }, { k: "Target 1", v: "685.70" }, { k: "Target 2", v: "678.00" }, { k: "Target 3", v: "658.30" }],
        stop: "728.50",
        thesis: "Loses $698 intraday containment → $685.70 session containment then $678. Weekly containment $658.30 is the bear target on a rate shock.",
        risk: "$670 round number and $658.30 are powerful institutional support levels.",
      },
    ],

    weekLevels: [
      { price: 748.65, role: "52W high — ATH / ultimate bull target", t: "R" },
      { price: 738.40, role: "Multi-week ceiling",                    t: "R" },
      { price: 728.50, role: "Session containment — KEY",             t: "R" },
      { price: 720.00, role: "Round number resistance",               t: "R" },
      { price: 710.95, role: "Current price / consolidation base",    t: "N" },
      { price: 698.00, role: "Intra-day containment floor",           t: "S" },
      { price: 685.70, role: "Session containment",                   t: "S" },
      { price: 658.30, role: "Weekly containment UP",                 t: "S" },
      { price: 598.40, role: "Multi-week floor",                      t: "S" },
      { price: 523.65, role: "52W low",                               t: "S" },
    ],

    todayNote: "QQQ at $739.40 has broken above $738.40 multi-week containment with strong conviction (+2.34%). ATH $748.65 is now in direct sight with no major resistance between. $738.40 flips to intraday support — hold it and the breakout is confirmed. AI/mega-cap tape is the driver; loss of $738.40 signals a false breakout and targets $728.50.",
    weekNote:  "$728.50 session containment is the week's breakout level — clear it and $738.40 multi-week ceiling comes into view. $698 intraday containment is the support pivot. QQQ is rate-sensitive; any Fed hawkishness reprices the growth premium rapidly.",
    lastUpdated: "Jun 18, 2026",
  },

  // ── AAPL — Live: $296.36 | 52W: $195.07–$317.40 ───────────────────────────
  AAPL: {
    ticker: "AAPL", name: "Apple Inc.", earnings: "Jul 31, 2026",

    srLevels: [
      { price: 317.40, label: "52W high / ATH zone",       str: 4, type: "resistance" },
      { price: 310.00, label: "round number ceiling",      str: 3, type: "resistance" },
      { price: 305.50, label: "session containment",       str: 2, type: "resistance" },
      { price: 301.80, label: "minor",                     str: 1, type: "resistance" },
      { price: 298.50, label: "minor",                     str: 1, type: "resistance" },
      { price: 293.00, label: "minor",                     str: 1, type: "support"    },
      { price: 289.70, label: "minor",                     str: 1, type: "support"    },
      { price: 285.40, label: "intra-day containment",     str: 2, type: "support"    },
      { price: 280.00, label: "round number support",      str: 2, type: "support"    },
      { price: 275.20, label: "minor",                     str: 1, type: "support"    },
      { price: 270.00, label: "round number support",      str: 2, type: "support"    },
      { price: 264.80, label: "session containment",       str: 2, type: "support"    },
      { price: 257.50, label: "minor",                     str: 1, type: "support"    },
      { price: 250.00, label: "major round / weekly support", str: 3, type: "support" },
      { price: 240.00, label: "round number support",      str: 2, type: "support"    },
      { price: 228.50, label: "multi-week floor",          str: 3, type: "support"    },
      { price: 215.00, label: "session containment",       str: 2, type: "support"    },
      { price: 200.00, label: "major psychological",       str: 3, type: "support"    },
      { price: 195.07, label: "52W low",                   str: 4, type: "support"    },
    ],

    catalysts: [
      { icon: "▲", text: "Apple Intelligence on-device AI — iPhone upgrade supercycle", up: true  },
      { icon: "▲", text: "Services revenue all-time high — $100B+ annualized run rate",  up: true  },
      { icon: "▲", text: "India manufacturing ramp — supply chain diversification",      up: true  },
      { icon: "▲", text: "Vision Pro enterprise adoption — B2B channel opening",         up: true  },
      { icon: "▼", text: "China iPhone sales pressure — Huawei competition intensifying", up: false },
      { icon: "▼", text: "Epic Games / App Store legal headwinds — margin risk",          up: false },
      { icon: "▼", text: "EU Digital Markets Act compliance costs",                       up: false },
      { icon: "▼", text: "Valuation: 30x P/E — compressed upside vs earnings growth",    up: false },
    ],

    scenToday: [
      {
        label: "Bull Case", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Target 1", v: "298.50" }, { k: "Target 2", v: "301.80" }, { k: "Target 3", v: "305.50" }],
        stop: "289.70",
        thesis: "Holds above $293 minor support → tests $298.50 then $301.80. Services margin expansion or iPhone upgrade data as catalyst. Session containment $305.50 is max range.",
        setup: "Long above $293. PT1=$298.50, PT2=$301.80. Stop below $289.70.",
      },
      {
        label: "Base Case", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Target 1", v: "301.80" }, { k: "Target 2", v: "293.00" }, { k: "Target 3", v: "289.70" }],
        stop: "280.00",
        thesis: "Consolidation between $289.70 minor support and $301.80 minor resistance. AAPL digests move from earnings anticipation.",
        setup: "Buy $289–$293, sell $298–$302. Range trade ahead of earnings.",
      },
      {
        label: "Bear Case", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Target 1", v: "289.70" }, { k: "Target 2", v: "285.40" }, { k: "Target 3", v: "280.00" }],
        stop: "301.80",
        thesis: "Fails to hold $293 → $289.70 then intraday containment $285.40. China headline risk or App Store ruling triggers flush to $280.",
        setup: "Short below $293. PT=$285.40/$280. Stop above $301.80.",
      },
    ],

    scenWeek: [
      {
        label: "Bull — ATH Reclaim", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Entry", v: "293–298" }, { k: "Target 1", v: "305.50" }, { k: "Target 2", v: "310.00" }, { k: "Target 3", v: "317.40" }],
        stop: "285.40",
        thesis: "Clears $301.80 → session containment $305.50 then $310 round ceiling. ATH reclaim at $317.40 on iPhone upgrade data or Apple Intelligence adoption beat.",
        risk: "$310 round number has dense institutional sell orders.",
      },
      {
        label: "Neutral — Pre-Earnings Drift", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Entry", v: "285–298" }, { k: "Target 1", v: "301.80" }, { k: "Target 2", v: "285.40" }],
        stop: "275.20",
        thesis: "Slow drift in $285–$302 range as market positions for Jul 31 earnings. No major catalyst to break range until earnings.",
        risk: "Low-volatility week; risk is a sideways drift that offers no clean trade.",
      },
      {
        label: "Bear — Pre-Earnings Hedge", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Entry", v: "Below 285" }, { k: "Target 1", v: "280.00" }, { k: "Target 2", v: "275.20" }, { k: "Target 3", v: "264.80" }],
        stop: "305.50",
        thesis: "Loses $285.40 intraday containment → $280 round number then $275.20. China data shock or broad tech selloff extends to $264.80.",
        risk: "$280 and $275 are strong buy-program levels heading into earnings.",
      },
    ],

    weekLevels: [
      { price: 317.40, role: "52W high — ATH / ultimate bull target",  t: "R" },
      { price: 310.00, role: "Round number ceiling",                   t: "R" },
      { price: 305.50, role: "Session containment — KEY",              t: "R" },
      { price: 296.36, role: "Current price / consolidation base",     t: "N" },
      { price: 285.40, role: "Intra-day containment floor",            t: "S" },
      { price: 280.00, role: "Round number support",                   t: "S" },
      { price: 264.80, role: "Session containment",                    t: "S" },
      { price: 250.00, role: "Major round number / weekly floor",      t: "S" },
      { price: 228.50, role: "Multi-week floor",                       t: "S" },
      { price: 195.07, role: "52W low",                                t: "S" },
    ],

    todayNote: "AAPL at $296.36 is between $293 minor support and $298.50 minor resistance. The $310 round number is the primary weekly ceiling; the $285.40 intraday containment is the key support floor. Apple Intelligence adoption data and China iPhone sell-through are the primary weekly catalysts. Earnings Jul 31, 2026.",
    weekNote:  "$305.50 session containment is the breakout level — clear it and $310 round ceiling comes into play with ATH $317.40 as the bull target. $285.40 is the critical support floor. Pre-earnings positioning will dominate second half of the week. Expect implied volatility expansion into Jul 31.",
    lastUpdated: "Jun 14, 2026",
  },

  // ── PLTR — Live: $131.05 | 52W: $122.68–$207.52 ───────────────────────────
  PLTR: {
    ticker: "PLTR", name: "Palantir Technologies", earnings: "Aug 5, 2026",

    srLevels: [
      { price: 207.52, label: "52W high / ATH zone",       str: 4, type: "resistance" },
      { price: 180.00, label: "round number ceiling",      str: 3, type: "resistance" },
      { price: 165.00, label: "session containment",       str: 2, type: "resistance" },
      { price: 155.00, label: "minor",                     str: 1, type: "resistance" },
      { price: 147.50, label: "minor",                     str: 1, type: "resistance" },
      { price: 140.00, label: "intra-day containment",     str: 2, type: "resistance" },
      { price: 135.80, label: "minor",                     str: 1, type: "resistance" },
      { price: 128.40, label: "minor",                     str: 1, type: "support"    },
      { price: 125.00, label: "round number support",      str: 2, type: "support"    },
      { price: 122.68, label: "52W low / critical floor",  str: 4, type: "support"    },
      { price: 118.50, label: "minor",                     str: 1, type: "support"    },
      { price: 115.00, label: "round number support",      str: 2, type: "support"    },
      { price: 110.00, label: "session containment",       str: 2, type: "support"    },
      { price: 105.00, label: "minor",                     str: 1, type: "support"    },
      { price: 100.00, label: "major psychological",       str: 3, type: "support"    },
    ],

    catalysts: [
      { icon: "▲", text: "US DoD / intelligence community contract expansion",  up: true  },
      { icon: "▲", text: "AIP (AI Platform) commercial customer growth — 49%+", up: true  },
      { icon: "▲", text: "NATO / allied-nation sovereign AI deal pipeline",      up: true  },
      { icon: "▲", text: "Medicare / Medicaid AI deployment contracts signed",   up: true  },
      { icon: "▼", text: "Significant pullback from $207.52 ATH — 37% off highs", up: false },
      { icon: "▼", text: "Government budget sequestration risk — CR spending",    up: false },
      { icon: "▼", text: "High valuation even post-correction — growth priced in", up: false },
      { icon: "▼", text: "Customer concentration risk — gov't spending cycles",   up: false },
    ],

    scenToday: [
      {
        label: "Bull Case", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Target 1", v: "135.80" }, { k: "Target 2", v: "140.00" }, { k: "Target 3", v: "147.50" }],
        stop: "125.00",
        thesis: "Holds above $128.40 minor support → presses $135.80 then intraday containment $140. Government contract catalyst or AIP customer beat required for extension.",
        setup: "Long above $128.40. PT1=$135.80, PT2=$140. Stop below $125.",
      },
      {
        label: "Base Case", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Target 1", v: "135.80" }, { k: "Target 2", v: "128.40" }, { k: "Target 3", v: "125.00" }],
        stop: "118.50",
        thesis: "Consolidation between $125 round support and $135.80 minor resistance. PLTR digests significant pullback from ATH.",
        setup: "Buy $125–$128 range / fade rallies near $135. Tight risk management.",
      },
      {
        label: "Bear Case", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Target 1", v: "125.00" }, { k: "Target 2", v: "122.68" }, { k: "Target 3", v: "118.50" }],
        stop: "140.00",
        thesis: "Fails to hold $128.40 → $125 round number then 52W low at $122.68. Continued ATH unwind; government spending headlines add pressure.",
        setup: "Short below $128. PT=$122.68/$118.50. Stop above $140.",
      },
    ],

    scenWeek: [
      {
        label: "Bull — Recovery Rally", color: "#22c55e", bg: "#052010",
        targets: [{ k: "Entry", v: "128–136" }, { k: "Target 1", v: "147.50" }, { k: "Target 2", v: "155.00" }, { k: "Target 3", v: "165.00" }],
        stop: "122.68",
        thesis: "Clears $135.80–$140 resistance zone → $147.50 minor and session containment $155. Defense contract win or AIP ARR beat drives recovery to $165.",
        risk: "Recovery faces multiple resistance layers; needs strong catalyst to break each.",
      },
      {
        label: "Neutral — Base Building", color: "#3b82f6", bg: "#020c1b",
        targets: [{ k: "Entry", v: "122–136" }, { k: "Target 1", v: "140.00" }, { k: "Target 2", v: "122.68" }],
        stop: "115.00",
        thesis: "Basing action between 52W low $122.68 and $140 intraday containment. Constructive if above $125; direction break needed to confirm recovery or further decline.",
        risk: "Basing patterns can be slow — capital tied up with limited near-term catalyst.",
      },
      {
        label: "Bear — New Lows", color: "#ef4444", bg: "#150202",
        targets: [{ k: "Entry", v: "Below 122.68" }, { k: "Target 1", v: "115.00" }, { k: "Target 2", v: "110.00" }, { k: "Target 3", v: "100.00" }],
        stop: "140.00",
        thesis: "Breaks 52W low $122.68 → $115 round support then $110 session containment. Major $100 psychological floor is the bear target on continued ATH unwind.",
        risk: "$122.68 is a massively watched level — institutional buy programs expected on first test.",
      },
    ],

    weekLevels: [
      { price: 207.52, role: "52W high / ATH — ultimate bull target",  t: "R" },
      { price: 165.00, role: "Session containment",                    t: "R" },
      { price: 155.00, role: "Minor resistance",                       t: "R" },
      { price: 140.00, role: "Intra-day containment — KEY",            t: "R" },
      { price: 131.05, role: "Current price / basing zone",            t: "N" },
      { price: 125.00, role: "Round number support floor",             t: "S" },
      { price: 122.68, role: "52W low — critical support — KEY",       t: "S" },
      { price: 115.00, role: "Round number support",                   t: "S" },
      { price: 110.00, role: "Session containment",                    t: "S" },
      { price: 100.00, role: "Major psychological floor",              t: "S" },
    ],

    todayNote: "PLTR is at $131.05, sitting 37% below its 52W high of $207.52. The stock is in a basing zone above the critical $122.68 52W low. $128.40 minor support and $125 round number are the key intraday support levels. $135.80 and $140 intraday containment are the resistance gates. Government contract news or AIP commercial metrics are the catalysts to watch.",
    weekNote:  "The 52W low at $122.68 is the week's critical pivot — hold it and a recovery to $135.80–$140 is in play. Lose it and $115 → $110 → $100 open up. $140 intraday containment is the breakout level that would signal recovery confirmation. Earnings Aug 5, 2026 — pre-earnings positioning likely begins mid-July.",
    lastUpdated: "Jun 14, 2026",
  },

  // ── SPCX — Space Exploration Technologies Corp ────────────────────────────
  SPCX: {
    ticker: "SPCX", name: "Space Exploration Technologies Corp", earnings: "TBD",

    srLevels: [
      { price: 175.00, label: "round number resistance",         str: 3, type: "resistance" },
      { price: 168.50, label: "minor resistance",                str: 2, type: "resistance" },
      { price: 163.00, label: "session containment",             str: 2, type: "resistance" },
      { price: 159.50, label: "minor resistance",                str: 1, type: "resistance" },
      { price: 156.11, label: "current price",                   str: 2, type: "resistance" },
      { price: 152.00, label: "minor support",                   str: 1, type: "support"    },
      { price: 148.00, label: "session containment",             str: 2, type: "support"    },
      { price: 143.00, label: "round number support",            str: 3, type: "support"    },
      { price: 138.50, label: "key support — KEY",               str: 3, type: "support"    },
      { price: 130.00, label: "major support floor",             str: 4, type: "support"    },
    ],

    catalysts: [
      { icon: "▲", text: "Launch cadence / Starship milestone beats",             up: true  },
      { icon: "▲", text: "Starlink subscriber growth or government contract wins", up: true  },
      { icon: "▼", text: "Launch failure or regulatory hold",                     up: false },
      { icon: "▼", text: "Broader tech/growth selloff on rates",                  up: false },
    ],

    scenToday: [
      {
        label:   "Bull",
        color:   "#22c55e",
        bg:      "rgba(34,197,94,0.08)",
        targets: [
          { k: "T1", v: "$159.50" },
          { k: "T2", v: "$163.00" },
          { k: "T3", v: "$168.50" },
        ],
        stop:   "$152.00",
        thesis: "Holds $156 spot and reclaims $159.50 minor resistance on positive space sector news. T2 $163 and T3 $168.50 in play on continuation.",
        setup:  "Bid above $156.11 with volume confirmation",
        risk:   "Failure below $152 invalidates",
      },
      {
        label:   "Base",
        color:   "#f59e0b",
        bg:      "rgba(245,158,11,0.08)",
        targets: [
          { k: "T1", v: "$159.50" },
          { k: "T2", v: "$152.00" },
          { k: "T3", v: "$163.00" },
        ],
        stop:   "$148.00",
        thesis: "Chop between $152 support and $159.50 resistance. Broad market tone is the primary driver.",
        setup:  "Range trade $152–$159.50",
        risk:   "Break below $148 opens $143",
      },
      {
        label:   "Bear",
        color:   "#ef4444",
        bg:      "rgba(239,68,68,0.08)",
        targets: [
          { k: "T1", v: "$152.00" },
          { k: "T2", v: "$148.00" },
          { k: "T3", v: "$143.00" },
        ],
        stop:   "$159.50",
        thesis: "Fails to hold $156 and breaks $152 support. $148 and $143 round number open as next targets.",
        setup:  "Break and close below $152",
        risk:   "Reclaim of $159.50 invalidates bear",
      },
    ],

    scenWeek: [
      {
        label:   "Bull",
        color:   "#22c55e",
        bg:      "rgba(34,197,94,0.08)",
        targets: [
          { k: "W1", v: "$163.00" },
          { k: "W2", v: "$168.50" },
          { k: "W3", v: "$175.00" },
        ],
        stop:   "$148.00",
        thesis: "Weekly close above $159.50 sets up extension to $163–$175 range. Catalyst-driven.",
      },
      {
        label:   "Base",
        color:   "#f59e0b",
        bg:      "rgba(245,158,11,0.08)",
        targets: [
          { k: "W1", v: "$159.50" },
          { k: "W2", v: "$152.00" },
          { k: "W3", v: "$163.00" },
        ],
        stop:   "$143.00",
        thesis: "Consolidation week, $148–$163 range. Awaiting catalyst.",
      },
      {
        label:   "Bear",
        color:   "#ef4444",
        bg:      "rgba(239,68,68,0.08)",
        targets: [
          { k: "W1", v: "$148.00" },
          { k: "W2", v: "$143.00" },
          { k: "W3", v: "$138.50" },
        ],
        stop:   "$163.00",
        thesis: "Weekly failure below $152 signals distribution. $143 and $138.50 key support are the next levels.",
      },
    ],

    weekLevels: [
      { price: 175.00, role: "Round number resistance",          t: "R" },
      { price: 168.50, role: "Minor resistance",                 t: "R" },
      { price: 163.00, role: "Session containment",              t: "R" },
      { price: 159.50, role: "Minor resistance",                 t: "R" },
      { price: 156.11, role: "Current price / pivot",            t: "N" },
      { price: 152.00, role: "Minor support",                    t: "S" },
      { price: 148.00, role: "Session containment",              t: "S" },
      { price: 143.00, role: "Round number support",             t: "S" },
      { price: 138.50, role: "Key support — KEY",                t: "S" },
      { price: 130.00, role: "Major support floor",              t: "S" },
    ],

    todayNote: "SPCX is at $156.11. Placeholder S/R levels based on round numbers and approximate structure — update with live chart analysis. Key intraday pivot is $156; $152 is the first support and $159.50 the first resistance gate.",
    weekNote:  "Weekly structure pending full analysis. $148–$163 is the broad consolidation range. $138.50 and $130 are the key support floors to watch on any broader selloff.",
    lastUpdated: "Jun 23, 2026",
  },

};
