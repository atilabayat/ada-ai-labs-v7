"use client";

import { useState } from "react";
import { PageInner, PageHead } from "@/components/ui";

// ── Types ──────────────────────────────────────────────────────────────────────
interface SourceTab {
  id: string;
  label: string;
  file: string;
  cat: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  desc: string;
  type: "text" | "csv";
}

// ── Static reference data (verbatim from SKILL.md catalog) ────────────────────
const TABS: SourceTab[] = [
  {
    id:            "core-strategies",
    label:         "Core Strategies",
    file:          "strategies-core-5.md",
    cat:           "5 Strategies",
    accent:        "text-accent-teal",
    accentBg:      "bg-[rgba(20,184,166,0.06)]",
    accentBorder:  "border-[rgba(20,184,166,0.2)]",
    desc:          "Dual MA Crossover, RSI Oversold Bounce, Bollinger Band MR, Pullback to MA, S/R Breakout — with entry/exit rules, risk defaults, and comparison table.",
    type:          "text",
  },
  {
    id:            "largecap-strategies",
    label:         "Large-Cap Strategies",
    file:          "strategies-largecap-7.md",
    cat:           "7 Strategies",
    accent:        "text-accent-amber",
    accentBg:      "bg-[rgba(245,183,72,0.06)]",
    accentBorder:  "border-[rgba(245,183,72,0.2)]",
    desc:          "MACD Momentum, RSI MR, Bollinger MR, Volume Breakout, Dual MA, MACD+RSI Dual, BB Squeeze — parameterized with ATR multiples, ticker suitability table (TSLA/SPY/QQQ/AAPL/F/GE).",
    type:          "text",
  },
  {
    id:            "indicators-100",
    label:         "100 Indicators",
    file:          "indicators-100.md",
    cat:           "100 Indicators",
    accent:        "text-accent-violet",
    accentBg:      "bg-[rgba(139,92,246,0.06)]",
    accentBorder:  "border-[rgba(139,92,246,0.2)]",
    desc:          "Volume & Money Flow (20), Trend & Moving Averages (25), Momentum & Oscillators (35), Volatility & Overlays (10), Support/Resistance & Day-Trading Tools (10). Pro core setup recommendation included.",
    type:          "text",
  },
  {
    id:            "ipa-v3",
    label:         "IPA Patterns v3.0",
    file:          "ipa-patterns-v3.0-full.csv",
    cat:           "35 Patterns · Authoritative",
    accent:        "text-accent-rose",
    accentBg:      "bg-[rgba(239,68,68,0.06)]",
    accentBorder:  "border-[rgba(239,68,68,0.2)]",
    desc:          "Complete 35-row IPA table — Pattern Name, Category, Structure, Bias, Entry Trigger, Key Levels, Stop Logic, Target Logic, Volume Confirmation, Session VP Confirmation. #1 QM Quick Retest through #35 Measured Move.",
    type:          "csv",
  },
  {
    id:            "ipa-v25",
    label:         "IPA Compendium v2.5",
    file:          "ipa-patterns-v2.5.md",
    cat:           "Supporting Sheets",
    accent:        "text-accent",
    accentBg:      "bg-[rgba(77,141,255,0.06)]",
    accentBorder:  "border-[rgba(77,141,255,0.2)]",
    desc:          "Glossary (SVP/POC/VAH/VAL/HVN/LVN), Volume-Only Quick Reference, SVP Quick Reference (Sheet 9), Chart Examples, and Volume-Based Risk Management Rules 1–11 including triple filter.",
    type:          "text",
  },
  {
    id:            "options-playbook",
    label:         "Options Playbook",
    file:          "options-playbook-v2.csv",
    cat:           "22 Scenarios",
    accent:        "text-accent-amber",
    accentBg:      "bg-[rgba(245,183,72,0.06)]",
    accentBorder:  "border-[rgba(245,183,72,0.2)]",
    desc:          "Hedge-fund options playbook — Book/Category, Strategy, Goal, Margin Requirement, and all four Greeks (Δ Γ Θ ν) for 22 scenarios across Core Yield, Risk Management, Volatility & Arbitrage, and Directional & Leverage.",
    type:          "csv",
  },
];

// ── Inline reference content (avoids server-side file reads in client component)
const CONTENT: Record<string, string> = {
  "strategies-core-5.md": `Technical Analysis Trading Strategies

## Strategy 1: Dual Moving Average Crossover (Momentum/Trend Following)

Category: Momentum / Trend Following

Entry (Buy) Rules:
• Primary Trigger: The 50-period SMA crosses above the 200-period SMA (Golden Cross) on the daily chart
• Confirmation: Price closes above both moving averages after the crossover
• Context: Only take long signals when the broader trend is bullish (price above 200-period SMA)

Exit (Stoploss) Rules:
• Primary Exit: Sell when 50-period SMA crosses below 200-period SMA (Death Cross)
• Stop-Loss: Place initial stop-loss 5–8% below entry price or at the most recent swing low
• Trailing Stop: Once in profit by 10%, move stop to break-even, then trail using 50-period SMA

─────────────────────────────────────────────────────────────
## Strategy 2: RSI Oversold Bounce (Mean-Reversion)

Category: Mean-Reversion

Entry (Buy) Rules:
• Trend Filter: Price must be above its 200-period SMA
• Primary Trigger: 14-period RSI drops below 30 (oversold territory)
• Confirmation: A bullish candlestick pattern (hammer, bullish engulfing) closes after RSI crosses below 30
• Divergence Enhancement: Stronger signal if price makes lower low while RSI forms higher low

Exit (Stoploss) Rules:
• Profit Target: Exit when RSI rises above 70 or at recent swing high resistance
• Invalidation Exit: Exit if RSI fails to recover above 35 within 5 trading days
• Stop-Loss: Just below recent swing low that triggered oversold reading (typically 3–5% below entry)

─────────────────────────────────────────────────────────────
## Strategy 3: Bollinger Band Mean Reversion (Volatility-Based)

Category: Mean-Reversion / Volatility

Entry (Buy) Rules:
• Primary Trigger: Price closes below lower Bollinger Band (20-period, 2 std dev)
• Extreme Condition: RSI also below 30 for confirmation
• Candlestick Confirmation: A bullish reversal candle after touching lower band
• Context: Avoid if broader market is in confirmed downtrend (SPY below 200-period SMA)

Exit (Stoploss) Rules:
• Profit Target: Exit when price touches middle BB (20-period SMA) or upper band
• Stop-Loss: 1 ATR below the lowest low of the reversal candle
• Invalidation Exit: Exit if price closes below lower band for 3 consecutive days without reversal

─────────────────────────────────────────────────────────────
## Strategy 4: Pullback to Moving Average (Momentum/MR Hybrid)

Category: Momentum / Pullback

Entry (Buy) Rules:
• Trend Filter: Price above 200-period SMA; 20-period SMA above 50-period SMA (bullish alignment)
• Primary Trigger: Price pulls back to touch 20-period or 50-period SMA during uptrend
• Entry Execution: Enter when bullish candle closes after touching MA, showing rejection of lower prices
• Volume: Contract during pullback, expand on entry candle

Exit (Stoploss) Rules:
• Profit Target: Recent swing high (typically 1.5×–2× risk amount)
• Stop-Loss: Just below the MA that triggered entry (0.5–1 ATR below)
• Trailing Exit: Once price moves 1 ATR in favor, move stop to break-even. Trail using 20-period SMA
• Time Exit: If price hasn't reached target within 10–15 trading days, exit

─────────────────────────────────────────────────────────────
## Strategy 5: Support/Resistance Breakout with Volume Confirmation

Category: Breakout / Momentum

Entry (Buy) Rules:
• Key Level: Identify resistance where price rejected at least twice previously
• Primary Trigger: Price closes above resistance with strong bullish candle
• Volume: Breakout candle must be significantly above 20-period average volume
• ATR Context: Breakout move should exceed 1.5× ATR to confirm genuine momentum

Exit (Stoploss) Rules:
• Profit Target 1 (Partial): Exit 50% at 1.5× ATR above breakout level
• Profit Target 2 (Full): Exit remaining at 3× ATR or next logical resistance
• Stop-Loss: Just below breakout level (0.5–1 ATR below entry)
• Trailing Stop: After hitting Target 1, move to break-even; trail at 1 ATR
• Invalidation: Exit if price falls back below breakout level within 3 days

─────────────────────────────────────────────────────────────
## Strategy Comparison Summary

  Strategy                   | Category           | Best For                  | Holding Period
  ─────────────────────────────────────────────────────────────────────────────────────────
  Dual MA Crossover          | Momentum/Trend     | Trending markets          | Weeks to months
  RSI Oversold Bounce        | Mean-Reversion     | Range-bound markets       | Days to 2 weeks
  Bollinger Band Reversion   | MR / Volatility    | High volatility periods   | Days to 1 week
  Pullback to MA             | Hybrid             | Strong uptrends           | 1–3 weeks
  S/R Breakout               | Breakout           | Consolidation breakouts   | Days to 2 weeks

Risk Management (All Strategies):
• Never risk more than 1–2% of total account capital on any single trade
• Maintain minimum risk-reward ratio of 1:2
• Backtest on at least 50–100 trades before live application`,

  "strategies-largecap-7.md": `TECHNICAL ANALYSIS STRATEGIES — LARGE-CAP EQUITIES & MAJOR ETFs
Source: Alpha Data Architects Group · KB v1.1

─────────────────────────────────────────────────────────────
TICKER VOLATILITY & LIQUIDITY REFERENCE

  Ticker | Avg Daily Vol       | Beta      | Annualized Vol | Trend Character
  ────────────────────────────────────────────────────────────────────────────
  TSLA   | ~61.8M shares       | 1.12–1.50 | 40–55%         | High-beta momentum, frequent breakouts
  SPY    | ~$47B dollar vol    | 1.00      | 12–18%         | Low-vol trend follower; ideal for MR
  QQQ    | ~54M shares avg     | ~1.15     | 18–25%         | Tech-heavy momentum, strong trends
  AAPL   | ~45–60M shares      | 0.90–1.28 | 15–30%         | Stable large-cap, moderate trends
  F      | Moderate            | 1.50–1.63 | 25–40%         | Cyclical, earnings-sensitive volatility
  GE     | Lower vs peers      | 1.20–1.40 | 20–35%         | Industrial, range-bound phases

Key: SPY/QQQ offer tightest spreads. TSLA/F require wider stops.

─────────────────────────────────────────────────────────────
STRATEGY 1: MACD CROSSOVER MOMENTUM

Entry (Buy) Rules:
• MACD Line (12,26,9) crosses above Signal Line
• MACD Histogram turns positive AND expands for 2 consecutive bars
• Price closes above 20-period EMA
• Volume >= 100% of 20-day average on crossover bar
• RSI(14) between 40–70

Exit (Stoploss) Rules:
• Hard Stop: 1.5× ATR(14) below entry OR below most recent swing low
• Trailing Exit: MACD Line crosses below Signal Line AND Histogram turns negative
• Profit Target: Previous resistance level OR RSI(14) > 75
• Time Exit: Close position if no 2% move within 3 trading sessions

─────────────────────────────────────────────────────────────
STRATEGY 2: RSI MEAN REVERSION

Entry (Buy) Rules:
• RSI(14) closes below 30
• Price touches or closes below lower Bollinger Band (20,2)
• Next candle closes back inside Bollinger Bands
• Volume on reversal candle >= 120% of 10-day average
• Price remains above 200-day SMA

Exit (Stoploss) Rules:
• Hard Stop: 1.0× ATR(14) below low of reversal candle
• Indicator Exit: RSI(14) crosses back above 50 AND price closes above middle BB
• Profit Target: Middle BB (initial) OR upper BB (extended)
• Invalidation: Price closes below lower BB for 2 consecutive sessions after entry

─────────────────────────────────────────────────────────────
STRATEGY 3: BOLLINGER BANDS MEAN REVERSION

Entry (Buy) Rules:
• Price closes below lower BB (20-period SMA, 2 std dev)
• RSI(14) < 35 confirms oversold
• Next candle opens above prior close AND closes above lower band
• Volume on confirmation candle >= 110% of 20-day average
• ADX(14) < 25 (confirms range-bound environment)

Exit (Stoploss) Rules:
• Hard Stop: 1.2× ATR(14) below entry OR below most recent swing low
• Indicator Exit: Price closes above middle BB (20 SMA)
• Trailing Stop: Move to break-even at middle band; trail at 0.8× ATR thereafter
• Time Exit: Exit if price fails to reach middle band within 5 sessions

─────────────────────────────────────────────────────────────
STRATEGY 4: VOLUME-CONFIRMED BREAKOUT

Entry (Buy) Rules:
• Price closes above defined resistance level
• Volume on breakout candle >= 150% of 20-day average
• Breakout occurs during first 2 hours of trading session
• RSI(14) between 50–70
• Price holds above breakout level on next candle's open

Exit (Stoploss) Rules:
• Hard Stop: Just below breakout level (0.5–1.0% buffer)
• Trailing Exit: Trail at 1.5× ATR(14) below highest close since entry
• Volume Exit: Exit if volume on pullback candle > breakout volume (distribution signal)
• Profit Target: Measured move = height of prior consolidation added to breakout point

─────────────────────────────────────────────────────────────
STRATEGY 5: DUAL MOVING AVERAGE CROSSOVER (9/21 EMA)

Entry (Buy) Rules:
• 9-period EMA crosses above 21-period EMA
• Price closes above both EMAs on crossover candle
• Volume >= 110% of 20-day average on crossover confirmation
• ADX(14) > 20 (confirms emerging trend strength)
• Price above 200-day SMA

Exit (Stoploss) Rules:
• Hard Stop: Below most recent swing low OR 1.5× ATR(14) below entry
• Indicator Exit: 9 EMA crosses below 21 EMA
• Trailing Stop: Trail at 2× ATR(14) below highest close once position is +3%
• Time Exit: Close if price closes below 200-day SMA

─────────────────────────────────────────────────────────────
STRATEGY 6: MACD + RSI DUAL CONFIRMATION

Entry (Buy) Rules:
• MACD Line (12,26,9) crosses above Signal Line
• RSI(14) crosses above 50 from below
• Both signals occur within 3 trading bars of each other
• Price closes above 20-period EMA
• Volume on confirmation bar >= 120% of 20-day average

Exit (Stoploss) Rules:
• Hard Stop: 1.5× ATR(14) below entry OR below most recent swing low
• Indicator Exit: EITHER MACD crosses below Signal Line OR RSI crosses below 45
• Profit Target: When RSI(14) > 70 AND MACD Histogram begins contracting
• Invalidation: Price closes below 20 EMA for 2 consecutive sessions

─────────────────────────────────────────────────────────────
STRATEGY 7: BOLLINGER BAND SQUEEZE BREAKOUT

Entry (Buy) Rules:
• Bollinger Band Width (20,2) at 6-month low (volatility contraction)
• Price closes above upper BB with volume >= 150% of 20-day average
• ADX(14) begins rising from < 20 to > 25 (trend emergence confirmation)
• MACD Histogram turns positive on breakout candle
• Breakout occurs after minimum 5-day consolidation

Exit (Stoploss) Rules:
• Hard Stop: Below middle BB (20 SMA) OR 1.8× ATR(14) below entry
• Trailing Exit: Trail at 2.0× ATR(14) below highest close once position is +4%
• Volatility Exit: Exit if BB Width > 2× entry width AND price closes below middle band
• Profit Target: 2× height of pre-squeeze consolidation range

─────────────────────────────────────────────────────────────
RISK MANAGEMENT — UNIVERSAL RULES

• Position size: Risk <= 1–2% of capital per trade
• Maximum concurrent positions: 3–5 (avoid correlation risk)
• Avoid trading first/last 30 minutes unless breakout strategy
• Reduce position size by 50% during FOMC/CPI announcement weeks`,

  "indicators-100.md": `100 TECHNICAL INDICATORS — Professional Reference
Source: Quantified Strategies · TradingView/StockCharts · Expert day-trading guides · KB v1.1

Pro core setup: VWAP + 9/20/50 EMA + Volume + RSI + Bollinger Bands
Combine with price action (candlesticks, S/R, breakouts). Avoid indicator overload.

─────────────────────────────────────────────────────────────
VOLUME & MONEY FLOW  (Key for Day Trading Confirmation — 20 indicators)

 1. Volume (raw bars / relative volume)
 2. VWAP (Volume Weighted Average Price) — #1 intraday benchmark
 3. OBV (On-Balance Volume)
 4. Accumulation/Distribution Line (A/D)
 5. Chaikin Money Flow (CMF)
 6. Volume Oscillator
 7. Money Flow Index (MFI)
 8. Twiggs Money Flow
 9. Chaikin Oscillator
10. Volume Profile / Market Profile
11. Price Volume Trend (PVT)
12. Negative Volume Index (NVI)
13. Positive Volume Index (PVI)
14. Williams Accumulation Distribution
15. Ease of Movement (EMV)
16. Market Facilitation Index
17. Wave Volume
18. Relative Volume (RVOL)
19. Time Segmented Volume (TSV)
20. Volume Rate of Change (VROC)

─────────────────────────────────────────────────────────────
TREND & MOVING AVERAGES  (Core for Direction — 25 indicators)

 1. Simple Moving Average (SMA)
 2. Exponential Moving Average (EMA)
 3. Weighted Moving Average (WMA)
 4. Hull Moving Average (HMA)
 5. Adaptive Moving Average (ALMA / Jurik MA)
 6. Moving Average Ribbon (multiple MAs)
 7. Rainbow Moving Average
 8. Zero-Lag Hull Moving Average
 9. Displaced Moving Average (DMA)
10. Parabolic SAR
11. SuperTrend
12. Ichimoku Cloud / Kinko Hyo
13. Linear Regression Indicator / Slope
14. Moving Average Envelopes
15. Keltner Channels
16. Donchian Channels
17. Bollinger Bands
18. Standard Deviation Bands
19. High Low Bands
20. Prime Number Bands
21. Fractal Chaos Bands
22. Acceleration Bands
23. Stoller Average Range Channels (STARC)
24. Chandelier Exit
25. Heikin Ashi (smoothed candles)

─────────────────────────────────────────────────────────────
MOMENTUM & OSCILLATORS  (Overbought/Oversold & Reversals — 35 indicators)

 1. RSI (Relative Strength Index)
 2. Stochastic Oscillator
 3. Stochastic RSI
 4. MACD (Moving Average Convergence Divergence)
 5. MACD Histogram
 6. Percentage Price Oscillator (PPO)
 7. Williams %R
 8. Commodity Channel Index (CCI)
 9. Rate of Change (ROC)
10. True Strength Index (TSI)
11. Ultimate Oscillator
12. Chande Momentum Oscillator (CMO)
13. Awesome Oscillator (Bill Williams)
14. Accelerator Oscillator
15. TRIX
16. Relative Vigor Index (RVI)
17. Fisher Transform
18. Schaff Trend Cycle (STC)
19. KST Oscillator
20. Choppiness Index
21. Range Expansion Index (REI)
22. Polarized Fractal Efficiency (PFE)
23. Balance of Power (BOP)
24. REX Oscillator
25. Laguerre RSI
26. Volume RSI
27. Dynamic RSI / Cumulative RSI
28. Detrended Price Oscillator (DPO)
29. Internal Bar Strength (IBS)
30. Elder Force Index
31. Elder Impulse System
32. Gator Oscillator
33. Alligator (Bill Williams)
34. Fractals (Bill Williams)
35. Center of Gravity Oscillator

─────────────────────────────────────────────────────────────
VOLATILITY & OTHER OVERLAYS  (10 indicators)

 1. Average True Range (ATR)
 2. ATR Percentage (ATRP)
 3. Bollinger Band Width / %B
 4. Standard Deviation
 5. Mass Index
 6. Efficiency Ratio
 7. Linear Regression Channels
 8. Raff Regression Channel
 9. ZigZag
10. Projection Bands / Envelopes

─────────────────────────────────────────────────────────────
SUPPORT/RESISTANCE & DAY-TRADING TOOLS  (10 indicators)

 1. Fibonacci Retracement / Extensions
 2. Pivot Points (Standard, Camarilla, Woodie, DeMark)
 3. Opening Range Breakout (ORB) / Prior Day OHLC
 4. NR4 / NR7 (Narrow Range bars)
 5. Anchored VWAP / Order Flow VWAP
 6. Aroon Indicator / Oscillator
 7. ADX (Average Directional Index)
 8. Vortex Indicator
 9. Accumulative Swing Index
10. SuperTrend (paired with pivots/fibs for day trades)`,

  "ipa-patterns-v2.5.md": `INSTITUTIONAL PRICE ACTION — PATTERN REFERENCE COMPENDIUM (MASTER FILE v2.5)
Source: ReadTheMarket.com / CMS + leading traders + Volume Profile + Session-Based Volume Profile
Compiled By: Atila Bayat | Research Director, Alpha Data Architects Group
Version: 2.5 — Session-Based Volume Profile Integration Complete

─────────────────────────────────────────────────────────────
SHEET 2: GLOSSARY & LEGEND (including SVP terms)

  Abbreviation | Full Term                       | Definition / Trading Context
  ─────────────────────────────────────────────────────────────────────────────
  SVP          | Session-Based Volume Profile     | VP calculated for a specific session (Asian/London/NY)
  London SVP   | London Session Volume Profile    | VP for London open (8–12 GMT) — highest institutional activity
  NY SVP       | New York Session Volume Profile  | VP for NY open (13–17 GMT) — strongest volume in equities/futures
  Asian SVP    | Asian Session Volume Profile     | VP for Tokyo/Sydney open (00–08 GMT) — lower volume; ranging/liquidity
  POC          | Point of Control                 | Price level with highest volume in the profile period
  VAH          | Value Area High                  | Upper boundary of the 70% Value Area
  VAL          | Value Area Low                   | Lower boundary of the 70% Value Area
  HVN          | High Volume Node                 | Dense cluster of volume — strong S/R; institutions defend aggressively
  LVN          | Low Volume Node                  | Thin area in profile — "air pocket"; price accelerates through LVNs

─────────────────────────────────────────────────────────────
SHEET 5: VOLUME-ONLY QUICK REFERENCE (All 35 Patterns)

  Key Volume Signal        | Description                                          | Strongest Patterns
  ───────────────────────────────────────────────────────────────────────────────────────────────
  Volume Spike at Key Level| Confirmation candle volume >= 1.5× avg              | QM/QML, H&S, Order Block, BOS
  Volume Divergence        | Price new high/low with declining volume             | All reversal patterns
  Volume Contraction       | Decreasing volume in consolidation/flag              | Flag A/B, BB Squeeze, Wedges
  Volume Re-expansion      | Strong volume on breakout from consolidation         | Breakout patterns, Measured Move
  Session VP Confluence    | London/NY SVP POC rejection, VAH/VAL bounce          | All 35 patterns

─────────────────────────────────────────────────────────────
SHEET 9: SESSION-BASED VOLUME PROFILE (SVP) QUICK REFERENCE

  SVP Signal              | Description                                    | Edge
  ───────────────────────────────────────────────────────────────────────────────────
  London SVP POC Rejection| Price rejects London session POC               | Highest-probability reversal during London open
  NY SVP VAH/VAL Bounce   | Price bounces off NY session Value Area H/L    | Strong S/R during NY session (equities/futures)
  HVN in London/NY SVP    | Price tests High Volume Node within session    | Absorption zone — institutions defend session HVNs
  LVN Breakout in SVP     | Price accelerates through Low Volume Node      | Fast momentum — "air" between sessions
  Failed Auction in SVP   | Price enters VA but fails opposite side        | Strong reversal after failed breakout
  General SVP Rule        | Align pattern with current/previous session VP | SVP + standard VP + volume = complete institutional filter

Priority: NY SVP for indices/futures | London SVP for forex/majors
Impact: Filters out ~60% of marginal setups

─────────────────────────────────────────────────────────────
SHEET 7: VOLUME-BASED RISK MANAGEMENT RULES (All 35 Patterns)

  Rule 1:  Minimum Volume Threshold — >= 1.5× avg on confirmation candle + standard VP + SVP alignment
  Rule 2:  Volume Divergence Filter — Never enter reversal pattern if volume is expanding against your direction
  Rule 3:  VP Node Alignment — Enter only when pattern aligns with a VP HVN or LVN; avoid mid-VA entries
  Rule 4:  POC Rejection — Treat POC as the strongest S/R; use it as both entry trigger and stop reference
  Rule 5:  VAH/VAL Confirmation — Breakouts through VAH/VAL with volume >= 2× avg = highest conviction
  Rule 6:  Distribution Warning — Exit longs if price closes at VAH on 3 consecutive sessions (distribution)
  Rule 7:  LVN Momentum Rule — After LVN breakout, price typically runs to next HVN; use as target
  Rule 8:  HVN Stall Rule — Reduce position size by 50% when approaching HVN from below (absorption risk)
  Rule 9:  Volume Cluster Stop — Place stop just beyond the nearest HVN to the entry direction
  Rule 10: Session VP Priority — Prioritize London SVP for forex/majors; NY SVP for indices/futures
  Rule 11: SVP Failed Auction Filter — Avoid counter-trend trades inside current session VA

  General Note: Standard volume + Volume Profile + Session-Based Volume Profile = non-negotiable triple filter.`,
};

// CSV content stored as parsed rows
const CSV_ROWS: Record<string, string[][]> = {
  "ipa-patterns-v3.0-full.csv": [
    ["#", "Pattern Name", "Category", "Bias", "Entry Trigger", "Stop Logic", "Target Logic", "Volume Confirmation", "Session VP Confirmation"],
    ["1", "QM Quick Retest", "Quasimodo (QM)", "Bearish", "Short at QML on first retest candle", "Above QML / prior HH", "LL zone or next demand", "Volume spike + long upper wick at QML; VP: rejection at HVN or above POC inside VA", "London or NY session POC rejection at QML = highest-conviction reversal"],
    ["2", "QM Late Retest", "Quasimodo (QM)", "Bearish", "Short at QML on delayed retest", "Above QML", "LL or macro demand", "Moderate volume on retest; avoid if volume expands on retest; VP: retest at LVN outside VA", "Retest aligns with London SVP VAL or NY open LVN = accelerated move expected"],
    ["3", "QML (Quasi-Mirror Level)", "Quasimodo (QM)", "Bearish/Bullish", "Short/Long at QML after structure break", "Beyond QML", "Measured to prior swing", "Volume confirms level; VP: aligns with HVN", "SVP: NY/London session POC alignment adds confluence"],
    ["4", "Inverse QM (IQM)", "Quasimodo (QM)", "Bullish", "Long at IQM level on retest", "Below IQM", "Prior HH area", "Volume expansion on initial break; VP: LVN between IQM and target", "Asian SVP VAL support + London continuation"],
    ["5", "DM Shadow", "Shadow / Projection", "Directional", "Entry on DM shadow level retest", "Beyond shadow level", "Projected shadow target", "Volume contraction then expansion; VP: shadow level at HVN", "NY session SVP POC alignment with shadow = strongest signal"],
    ["6", "Continuation QM", "Quasimodo (QM)", "Directional", "Same direction as primary QM", "Beyond QML", "Extension of primary move", "Volume confirms continuation; VP: price above/below POC in direction", "SVP: London/NY session direction confirmation"],
    ["7", "Head & Shoulders (H&S)", "Reversal Pattern", "Bearish", "Short on neckline break with volume", "Above right shoulder", "Neckline – head height projected down", "Volume spike on left shoulder and head; divergence on right shoulder; VP: neckline at LVN for clean break", "NY SVP HVN at head; volume divergence on right shoulder; LVN neckline breakout"],
    ["8", "Inverse H&S", "Reversal Pattern", "Bullish", "Long on neckline break with volume", "Below right shoulder", "Neckline + head height projected up", "Volume confirmation on breakout; VP: neckline at LVN", "NY session VAL/LVN neckline break = momentum fuel"],
    ["9", "Double Top", "Reversal Pattern", "Bearish", "Short on second peak rejection or neckline break", "Above second top", "Neckline – pattern height", "Volume declining on second top; expansion on breakdown; VP: second top at HVN", "London SVP HVN rejection on second top = high-confidence reversal"],
    ["10", "Double Bottom", "Reversal Pattern", "Bullish", "Long on neckline break or second low bounce", "Below second bottom", "Neckline + pattern height", "Volume expansion on breakout; VP: second low at HVN support", "NY SVP VAL bounce at second bottom = institutional accumulation signal"],
    ["11", "Triple Top", "Reversal Pattern", "Bearish", "Short on breakdown below support", "Above third top", "Pattern height projected down", "Declining volume on third top; VP: tops aligned with HVN resistance", "London SVP distribution pattern at HVN across sessions"],
    ["12", "Triple Bottom", "Reversal Pattern", "Bullish", "Long on breakout above resistance", "Below third bottom", "Pattern height projected up", "Volume expansion on breakout; VP: bottoms at HVN support", "NY open SVP VAL support across three sessions = accumulation"],
    ["13", "Flag A (Bull Flag)", "Continuation Pattern", "Bullish", "Long on breakout above flag upper boundary", "Below flag lower boundary", "Flagpole height added to breakout", "Volume contraction inside flag; expansion on breakout; VP: flag channel at LVN", "NY SVP VAH breakout through LVN = spring-loaded continuation"],
    ["14", "Flag B (Bear Flag)", "Continuation Pattern", "Bearish", "Short on breakdown below flag lower boundary", "Above flag upper boundary", "Flagpole height subtracted from breakdown", "Volume contraction in flag; expansion on breakdown; VP: flag at LVN above breakdown", "London SVP LVN breakdown = momentum acceleration in Asian/London session"],
    ["15", "Flag A+B (Combined)", "Continuation Pattern", "Directional", "Entry on combined flag breakout/breakdown", "Beyond opposite boundary", "Combined flagpole projection", "Volume pattern confirms both flags; VP: transition from HVN to LVN", "SVP: Combined London + NY session volume profile confirmation"],
    ["16", "Order Block (OB)", "Institutional Pattern", "Bullish/Bearish", "Long/Short at OB level retest", "Beyond OB zone", "Previous swing before OB", "Volume absorption at OB; VP: OB aligns with HVN or POC", "NY SVP VAL/VAH alignment with OB = institutional confirmation"],
    ["17", "Breaker Block", "Institutional Pattern", "Directional", "Entry at breaker level after mitigation", "Beyond breaker", "Prior swing high/low", "Volume confirms breaker; VP: breaker at POC/HVN", "Session SVP POC at breaker = strongest institutional level"],
    ["18", "Fair Value Gap (FVG)", "Institutional Pattern", "Directional", "Entry on FVG fill or continuation", "Beyond FVG boundary", "Opposite FVG boundary", "Volume in FVG area; VP: FVG spans LVN zone", "SVP: FVG inside session VA = high fill probability"],
    ["19", "BOS (Break of Structure)", "Market Structure", "Directional", "Entry on BOS retest or continuation", "Beyond BOS origin", "Next swing high/low", "Volume expansion on BOS candle; VP: BOS through LVN", "NY session BOS through SVP VAH/VAL = highest momentum signal"],
    ["20", "CHOCH (Change of Character)", "Market Structure", "Reversal", "Entry on CHOCH confirmation candle", "Beyond CHOCH origin", "Opposite swing", "Volume divergence before CHOCH; expansion after; VP: CHOCH at HVN/POC", "CHOCH at London/NY SVP POC = highest-probability reversal setup"],
    ["21", "Liquidity Sweep", "Institutional Pattern", "Reversal", "Entry after sweep spike with rejection candle", "Beyond sweep extreme", "Origin of sweep", "Volume spike on sweep; rejection confirmed by VP: sweep at HVN", "London SVP POC sweep and rejection = institutional stop hunt complete"],
    ["22", "Inducement / Trap", "Institutional Pattern", "Reversal", "Entry after false break confirmed", "Beyond false break extreme", "Pre-inducement origin", "Volume spike on trap candle; VP: trap at LVN false breakout", "SVP: false break above/below session VAH/VAL = typical institutional trap zone"],
    ["23", "Engulfing (Bullish)", "Candlestick Pattern", "Bullish", "Long on close of engulfing candle", "Below engulfing low", "Next resistance or 1.5–2× candle range", "Volume >= 1.5× avg on engulfing candle; VP: at HVN or POC", "NY session open engulfing at SVP VAL = highest-conviction reversal"],
    ["24", "Engulfing (Bearish)", "Candlestick Pattern", "Bearish", "Short on close of bearish engulfing", "Above engulfing high", "Next support or 1.5–2× range", "Volume spike confirming engulfing; VP: at HVN resistance", "London SVP HVN bearish engulfing = institutional supply confirmed"],
    ["25", "Pin Bar / Hammer", "Candlestick Pattern", "Reversal", "Entry on next candle confirmation", "Beyond pin bar wick", "Previous swing or 2× body range", "Long shadow with volume spike; VP: pin bar at POC/HVN", "SVP: pin bar at session POC = ultimate confluence entry"],
    ["26", "Inside Bar", "Candlestick Pattern", "Directional", "Entry on breakout of inside bar range", "Beyond opposite side of inside bar", "Measured move of prior move", "Volume contraction inside bar; expansion on breakout; VP: inside bar in VA", "SVP: inside bar breakout through session LVN = momentum"],
    ["27", "Wedge (Rising/Falling)", "Continuation/Reversal", "Reversal", "Entry on wedge boundary break", "Beyond wedge extreme", "Wedge height projected from breakout", "Volume contraction in wedge; expansion on break; VP: break through LVN", "Session SVP LVN breakout from wedge = accelerated move expected"],
    ["28", "Ascending/Descending Triangle", "Continuation Pattern", "Directional", "Entry on flat boundary breakout with volume", "Below ascending support / above descending resistance", "Triangle height added to breakout", "Volume contraction then strong expansion; VP: breakout through LVN", "NY session SVP breakout through VAH/VAL triangle boundary"],
    ["29", "Symmetrical Triangle", "Neutral/Continuation", "Directional", "Entry on either boundary break", "Beyond opposite side", "Pattern height from breakout", "Volume expansion on breakout; VP: triangle apex near POC", "SVP: London/NY session confluence determines direction bias"],
    ["30", "Compression / Range Squeeze", "Volatility Pattern", "Directional", "Entry on range breakout with volume expansion", "Beyond range boundary", "Range height projected from breakout", "Volume near zero in range; explosive expansion on break; VP: range inside VA", "BB squeeze breakout through session SVP LVN = highest velocity"],
    ["31", "Fakeout / False Break", "Reversal Pattern", "Reversal", "Entry after false break reversal candle", "Beyond false break extreme", "Origin level or measured to S/R", "Volume spike on false break; VP: false break at HVN/LVN transition", "SVP: false break above/below session VAH/VAL = institutional reversal zone"],
    ["32", "MPL (Micro Price Level)", "Level Trading", "Reversal", "Entry at MPL on rejection candle", "Beyond MPL", "Next major S/R", "Volume confirms rejection at MPL; VP: MPL at HVN", "SVP: MPL aligned with session POC = precision institutional entry"],
    ["33", "Can-Can (Double S/R)", "Level Trading", "Reversal", "Entry at second test of Can-Can level", "Beyond Can-Can", "Opposite side of Can-Can range", "Volume absorption at both tests; VP: Can-Can at HVN cluster", "London/NY SVP HVN cluster at Can-Can = institution-confirmed level"],
    ["34", "3 Drive Pattern", "Reversal Pattern", "Reversal", "Entry after third drive rejection", "Beyond third drive extreme", "Fibonacci retrace of full pattern", "Declining volume on each drive; VP: third drive at HVN exhaustion", "NY SVP HVN exhaustion on third drive + declining volume = high-conviction reversal"],
    ["35", "Measured Move", "Projection / Level Trading", "Directional", "Breakout of consolidation in impulse direction", "Beyond consolidation", "Equal to first impulse leg", "Volume expansion on impulse; contraction in consolidation; re-expansion on second leg", "NY session VAH or London SVP HVN breakout confirms measured-move target validity"],
  ],

  "options-playbook-v2.csv": [
    ["Book / Category", "Scen #", "Scenario", "Strategy", "Goal", "Margin", "Δ Delta", "Γ Gamma", "Θ Theta", "ν Vega"],
    ["Core Yield & Accumulation", "1", "Capital Appreciation + Yield", "OTM Covered Calls", "1–3% yield while leaving room for growth", "Own 100 shares", "+", "−", "+", "−"],
    ["Core Yield & Accumulation", "2", "Max Income / Flat Market", "ATM Covered Calls", "Highest extrinsic premium in sideways market", "Own 100 shares", "≈0/+", "−", "+", "−"],
    ["Core Yield & Accumulation", "3", "Defensive Yield", "ITM Covered Calls", "Massive premium with downside protection; sacrifice upside", "Own 100 shares", "+", "−", "+", "−"],
    ["Core Yield & Accumulation", "4", "Discounted Entry", "OTM Cash-Secured Puts", "Get paid to wait for target entry below market", "100% strike in cash", "+", "−", "+", "−"],
    ["Core Yield & Accumulation", "5", "High-Conviction Entry", "ATM Cash-Secured Puts", "Max premium while aggressively seeking to acquire stock", "100% strike in cash", "+", "−", "+", "−"],
    ["Core Yield & Accumulation", "6", "Capital-Efficient Yield", "Poor Man's Covered Call", "Replicate covered call via deep ITM LEAPS; free up 70%+ capital", "Cost of LEAPS spread", "+", "Var", "+", "+"],
    ["Core Yield & Accumulation", "7", "Systematic Cash Flow", "The Wheel Strategy", "Loop CSPs + Covered Calls to continuously lower cost basis", "100% strike / Own 100 shares", "+", "−", "+", "−"],
    ["Core Yield & Accumulation", "8", "Instant Basis Reduction", "Buy-Write Strategy", "Buy shares + sell calls simultaneously to lock in lower entry", "Cost of shares less premium", "+", "−", "+", "−"],
    ["Risk Management & Hedging", "9", "Black Swan Protection", "Protective Puts", "Hedge long portfolio against catastrophic market crashes", "Cost of put", "−", "+", "−", "+"],
    ["Risk Management & Hedging", "10", "Capping Downside at Zero Cost", "Zero-Cost Collars", "Sell OTM calls to fund OTM puts; defined floor and ceiling", "Own 100 shares", "+", "≈0", "≈0", "≈0"],
    ["Risk Management & Hedging", "11", "Position Recovery", "Stock Repair Strategy", "Lower breakeven on losing stock without risking more capital", "Margin for short calls / Own 100 shares", "+", "−", "+", "−"],
    ["Risk Management & Hedging", "12", "Hedging Extreme Downside", "Put Ratio Backspreads", "Sell high-strike put; buy multiple lower-strike puts. Pays on crash", "Margin on short put", "−", "+", "−", "+"],
    ["Volatility & Arbitrage", "13", "Volatility Arbitrage", "Delta-Neutral Straddles", "Bet realized vol outpaces implied vol regardless of direction", "Cost of straddle", "≈0", "+", "−", "+"],
    ["Volatility & Arbitrage", "14", "Market Neutrality", "Gamma Scalping", "Trade underlying against long option position; lock in delta profits", "Cost of options + dynamic stock margin", "≈0", "+", "−", "+"],
    ["Volatility & Arbitrage", "15", "Earnings IV Crush", "Iron Condors", "Sell OTM calls + puts before earnings; profit from IV crush after", "Difference in spread strikes", "≈0", "−", "+", "−"],
    ["Volatility & Arbitrage", "16", "Extreme Vol Crush", "Short Strangles", "Sell OTM calls + puts naked to maximize IV crush profits. High risk.", "High naked margin", "≈0", "−", "+", "−"],
    ["Volatility & Arbitrage", "17", "Merger Arbitrage", "Risk Reversals", "Lock in acquisition spread; hedge deal-failure risk with options", "Margin on short option", "+", "Var", "Var", "Var"],
    ["Volatility & Arbitrage", "18", "Relative Value / Indexing", "Dispersion Trading", "Sell index options (low vol); buy component options (high vol)", "Complex portfolio margin", "≈0", "+", "−", "+"],
    ["Volatility & Arbitrage", "19", "Time Arbitrage", "Calendar Spreads", "Sell near-term; buy longer-term options — exploit faster theta decay", "Cost of spread", "≈0", "−", "+", "+"],
    ["Directional & Leverage", "20", "Macro Thematic Leverage", "Deep OTM LEAPS", "Cheap long-dated calls for asymmetric macro leverage", "Cost of options", "+", "+", "−", "+"],
    ["Directional & Leverage", "21", "Skew Exploitation", "Vertical Debit Spreads", "Buy ITM; sell OTM options. Defined-risk directional stance on mispriced asset", "Cost of spread", "+", "Var", "Var", "Var"],
    ["Directional & Leverage", "22", "Dividend Capture", "Synthetic Long Stock", "Buy ATM call + sell ATM put to replicate 100 shares; free up capital", "Naked put margin", "+", "≈0", "≈0", "≈0"],
  ],
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function TextContent({ content }: { content: string }) {
  return (
    <div className="rounded-[10px] border border-line bg-bg-0 overflow-hidden">
      <pre className="overflow-x-auto p-5 font-mono text-[11px] leading-relaxed text-[#cbd5e1] whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
}

function CsvTable({ rows }: { rows: string[][] }) {
  if (rows.length < 2) return null;
  const [header, ...body] = rows;
  return (
    <div className="overflow-x-auto rounded-[10px] border border-line bg-bg-0">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-line bg-bg-1">
            {header.map((h, i) => (
              <th
                key={i}
                className="px-3 py-[8px] text-left font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-b border-line last:border-0 hover:bg-bg-1 transition-colors">
              {header.map((_, ci) => (
                <td
                  key={ci}
                  className={`px-3 py-[7px] text-ink-2 align-top leading-relaxed ${
                    ci === 0 ? "font-mono text-[9px] uppercase tracking-[0.08em] text-ink-3 whitespace-nowrap" :
                    ci === 1 ? "font-mono text-[10px] font-semibold text-accent-amber whitespace-nowrap" :
                    ci === 2 ? "font-medium text-ink-0" :
                    "text-ink-2"
                  }`}
                >
                  {row[ci] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function QuantEmbeddedSourcesPage() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <PageInner>
      <PageHead
        tag="Skills · Embedded KB"
        tone="amber"
        title="Quant Embedded"
        em="Sources."
        sub="Vetted quant reference library — 12 trading strategies, 100 indicators, complete 35-row IPA pattern table (v3.0), and hedge-fund options playbook. Authoritative source for the /embedded-quant-sources skill."
      />

      {/* Tab bar */}
      <div className="mb-5 flex flex-wrap gap-[6px] border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`-mb-px border-b-2 px-4 py-[10px] font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
              active === t.id
                ? "border-accent-amber text-ink-0"
                : "border-transparent text-ink-2 hover:text-ink-0"
            }`}
          >
            {t.label}
            <span className="ml-2 font-mono text-[9px] text-ink-3">{t.cat}</span>
          </button>
        ))}
      </div>

      {/* Active tab header */}
      <div className={`mb-5 rounded-[10px] border ${tab.accentBorder} ${tab.accentBg} px-5 py-4`}>
        <div className={`font-mono text-[9px] uppercase tracking-[0.14em] ${tab.accent}`}>
          {tab.file} · KB v1.1
        </div>
        <h2 className={`mt-1 font-display text-[18px] font-semibold ${tab.accent}`}>{tab.label}</h2>
        <p className="mt-[4px] font-mono text-[11px] text-ink-3 leading-relaxed">{tab.desc}</p>
      </div>

      {/* Content */}
      {tab.type === "csv" ? (
        <CsvTable rows={CSV_ROWS[tab.file] ?? []} />
      ) : (
        <TextContent content={CONTENT[tab.file] ?? ""} />
      )}

      <p className="mt-6 font-mono text-[10px] text-ink-3">
        Source: ADA Embedded Quant KB v1.1 · Alpha Data Architects Group · Cite as:{" "}
        <span className="text-ink-2">Source: {tab.file} → entity (KB v1.1)</span>
      </p>
    </PageInner>
  );
}
