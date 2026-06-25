---
name: embedded-quant-sources
description: ADA's embedded knowledge base of vetted quant trading sources — 12 technical-analysis strategies with full entry/exit rules, 100 technical indicators, the complete 35-row institutional price action (IPA) pattern table (v3.0) with Session Volume Profile confluence, and a 21-scenario hedge fund options playbook with Greeks. ALWAYS consult this skill when assembling, generating, or refining any quant skill, trading strategy, screener, backtest, trade card, briefing, or report that involves technical indicators, entry/exit rules, chart patterns, price action, volume profile, options strategies, or Greeks. Use these sources as the authoritative reference instead of synthesizing rules from general knowledge, and cite the source file and entity in any output.
---

# ADA Embedded Quant Sources (KB v1.1)

**Owner:** Atila Bayat | Research Director, Alpha Data Architects Group
**Status:** For Trading Use Only — Informational research for professional traders only
**Sources:** 6 files (5 source documents + complete IPA v3.0 pattern table), all stored verbatim in `references/`. Never paraphrase rules from memory when the source can be read directly.

## Operating rules (non-negotiable)

1. **Objectivity / no synthesis without citation.** When a generated skill, report, or strategy uses an entry rule, exit rule, indicator definition, pattern, or options structure, read it from the relevant reference file and cite it. Do not invent or blend rules the sources don't contain.
2. **Lineage.** Every output that draws on this KB must include a source-lineage line, e.g.:
   `Source: ipa-patterns-v3.0-full.csv → Pattern #1 "QM Quick Retest" (KB v1.1)`
3. **Load only what's needed.** Use the catalog below to pick the right file(s); don't read all five for every task.
4. **Versioning is immutable.** These files are pinned. To update, add a new file (e.g., `ipa-patterns-v2.6.md`), update this catalog, and bump the KB version in this header. Never edit a pinned source in place.
5. **Conflicts.** If two sources give different parameters for the same concept (e.g., two RSI mean-reversion variants), present both with their citations — do not silently merge.

## Catalog — what's in each file and when to read it

### 1. `references/strategies-core-5.md` — Core TA Strategies (5)
Read when: building swing/position strategies, general entry/exit rule templates, risk-management defaults.
| # | Strategy | Category |
|---|----------|----------|
| 1 | Dual Moving Average Crossover (50/200 SMA Golden/Death Cross) | Momentum / Trend |
| 2 | RSI Oversold Bounce | Mean-Reversion |
| 3 | Bollinger Band Mean Reversion | Mean-Reversion / Volatility |
| 4 | Pullback to Moving Average w/ Trend Confirmation | Hybrid (Momentum/MR) |
| 5 | Support/Resistance Breakout w/ Volume Confirmation | Breakout / Momentum |
Also contains: strategy comparison table (holding periods), universal risk rules (1–2% risk, 1:2 R:R minimum, 50–100 trade backtest standard).

### 2. `references/strategies-largecap-7.md` — Large-Cap / ETF Strategies (7) + Ticker Suitability
Read when: building strategies for specific tickers (TSLA, SPY, QQQ, AAPL, F, GE), needing precise parameterized rules (ATR multiples, volume thresholds, ADX filters), or ticker volatility/liquidity context.
| # | Strategy |
|---|----------|
| 1 | MACD Crossover Momentum |
| 2 | RSI Mean Reversion |
| 3 | Bollinger Bands Mean Reversion |
| 4 | Volume-Confirmed Breakout |
| 5 | Dual MA Crossover Trend (9/21 EMA) |
| 6 | MACD + RSI Dual Confirmation |
| 7 | Bollinger Band Squeeze Breakout |
Also contains: per-ticker volatility/beta/liquidity table, per-strategy ticker application guidelines, universal risk rules (max 3–5 concurrent positions, FOMC/CPI sizing rule).

### 3. `references/indicators-100.md` — 100 Technical Indicators Reference
Read when: selecting indicators for a skill, defining an indicator, or choosing a "pro starter kit."
Categories: Volume & Money Flow (20, incl. VWAP, OBV, CMF, RVOL); Trend & Moving Averages (25, incl. SMA/EMA/HMA, Ichimoku, SuperTrend, Bollinger, Keltner, Donchian); Momentum & Oscillators (35, incl. RSI, Stochastic, MACD, CCI, Williams %R); Volatility & Overlays (10, incl. ATR, BB Width); Support/Resistance & Day-Trading Tools (10, incl. Fib, Pivots, ORB, ADX, Anchored VWAP).
Also contains: pro core setup recommendation (VWAP + 9/20/50 EMA + Volume + RSI + Bollinger).

### 4a. `references/ipa-patterns-v3.0-full.csv` — IPA Pattern Index, COMPLETE 35-row table (v3.0 FINAL — AUTHORITATIVE)
Read when: any price-action, order-flow, volume-profile, session-based, or institutional-pattern work (QM, order blocks, BOS/CHOCH, liquidity sweeps, measured moves, flags, H&S, etc.). **This is the authoritative pattern source — always prefer it over 4b for pattern rows.**
Columns (13): #, Pattern Name, Category, Structure/Shape, Bias, Entry Trigger, Key Level(s), Stop Logic, Target Logic, Trader Notes/Edge, Example/Visual, Volume Confirmation, Session VP Confirmation.
All 35 patterns present, #1 "QM Quick Retest" through #35 "Measured Move", incl. DM Shadow, Continuation QM, CHOCH, Liquidity Sweep. Sources: CMS + Cameron, Velez, Minervini, O'Neil, SMC/ICT + VP + SVP. Note: data rows begin after 3 title/header rows.

### 4b. `references/ipa-patterns-v2.5.md` — IPA Compendium supporting sheets (v2.5, pinned)
Read when: you need the **non-table sheets**: Glossary (SVP/POC/VAH/VAL/HVN/LVN), Volume-Only Quick Reference, SVP Quick Reference (Sheet 9), Chart Examples, and **Volume-Based Risk Management Rules 1–11** (incl. triple filter: volume + VP + SVP). For individual pattern rows, use 4a instead.

### 5. `references/options-playbook-v2.csv` — Hedge Fund Options Strategies Playbook (21 scenarios)
Read when: any options strategy, income/yield, hedging, volatility, or Greeks-aware work.
Columns: Book/Category, Scenario #, Scenario, Strategy Used, Goal, Margin Requirement, Delta, Gamma, Theta, Vega.
Categories include Core Yield & Accumulation (covered calls OTM/ATM/ITM, cash-secured puts) and additional books through scenario 21. Read the CSV directly for exact Greeks signs and margin requirements.

## Retrieval recipes

- "Mean-reversion strategies" → files 1 + 2 (strategies #2, #3 in each); optionally cross-check oversold patterns in file 4a.
- "Build a SPY 0DTE / intraday skill" → file 2 (SPY suitability) + file 3 (VWAP, ORB, pivots) + file 4b (SVP rules — NY session priority for indices).
- "Which indicators for a momentum screener?" → file 3 (Momentum & Oscillators) + confirm usage in files 1–2.
- "Hedge a long equity book" / "income overlay" → file 5, filter by Goal/Greeks.
- "Pattern entry for order block retest" → file 4a (pattern row) + file 4b (Risk Rules + SVP sheet).

## Updating this KB

1. Drop the new/updated source into `references/` with a versioned filename.
2. Update the catalog above and the KB version in the header.
3. Re-package the skill. Old skills citing prior versions remain valid — the citation records which version they used.
