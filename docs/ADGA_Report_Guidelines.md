# Alpha Data Architects Report & Document Creation Guidelines
**Master Style & Workflow Reference**  
*Last Updated: April 26, 2026*

---

## 1. PURPOSE & SCOPE

This document establishes mandatory formatting, content, and workflow standards for all reports, briefs, dashboards, and formal documents produced by Alpha Data Architects. The goal is to:
- Eliminate formatting inconsistencies
- Reduce editorial revisions through proactive mistake prevention
- Ensure data accuracy through systematic verification
- Maintain professional brand consistency
- Accelerate document turnaround

**Applies to:**
- Full Reports (multi-section analysis)
- Brief Summaries
- Flash Briefs
- Morning Intelligence Briefings
- All client-facing and internal documents

---

## 2. DOCUMENT FORMATTING STANDARDS

### 2.1 Text Alignment & Justification
- **Body text**: FULL JUSTIFICATION (left AND right edges aligned) on all pages
- **Paragraphs**: 1.15 line spacing for body; 1.5 line spacing between sections
- **Margins**: 1 inch (top, bottom, left, right) — US Letter standard
- **Page breaks**: Insert before new major sections (no widows/orphans)

### 2.2 Typography & Heading Hierarchy
**Strict heading hierarchy — NO EXCEPTIONS:**

| Hierarchy Level | Font Size | Weight | Usage |
|---|---|---|---|
| H1 (Document Title) | 24pt | Bold | Once per document, top of page 1 |
| H2 (Section Heading) | 16pt | Bold | Major sections; all caps OR Title Case |
| H3 (Subsection) | 13pt | Bold | Sub-topics under H2 |
| H4 (Minor Heading) | 12pt | Bold Italic | Nested content; rarely used |
| Body Text | 11pt | Regular | All paragraph content |
| Table Headers | 11pt | Bold | All tables |
| Footnotes | 9pt | Regular | Page references, caveats |

**Font Family**: Times New Roman (body) OR Calibri (modern alternative)  
**Consistency rule**: Pick ONE font family per document; do not mix.

### 2.3 Color & Styling (If Not B&W Print)
- **Navy** (#001f3f) for headers and key callouts
- **Dark Red** (#8B0000) for alerts, warnings, bearish signals
- **Forest Green** (#228B22) for bullish signals, positive indicators
- **Steel Blue** (#4682B4) for neutral/informational content
- **Light Gray** (#E8E8E8) for table backgrounds
- NO gradient, NO shadow, NO decorative elements

### 2.4 Tables
- **Table header rows**: Bold, navy background (if color), white text
- **Alternating row shading**: Optional light gray for readability
- **Column width (colW)**: Arrays must sum exactly to parent column width — verify before output
- **Alignment**: Numbers RIGHT-aligned; text LEFT-aligned
- **Borders**: 0.75pt solid black or dark gray

---

## 3. FOOTER & HEADER REQUIREMENTS

### 3.1 Header Configuration
- **Page number location**: TOP RIGHT corner, right-aligned
- **Format**: Page X of Y (e.g., "Page 1 of 8")
- **Font size**: 10pt
- **NO author name, NO location, NO firm name in header**

### 3.2 Footer Configuration
**Standard Footer (for Full Reports & Briefs):**
```
Research Director, Alpha Data Architects | For Trading Use Only

[right-aligned] Page [#]
```

**Flash Brief Footer:**
- **Header**: Ticker | Week [date range] | **For Trading Use Only**
- **No author name, no firm name** (ticker is identifier)
- Page number (landscape orientation)

**NO VARIATION FROM THIS FORMAT.** Footer text is positioned once in document setup; it is NOT to be manually repositioned per page.

### 3.3 Confidentiality Language — CRITICAL
- **NEVER use**: "Confidential," "Confidential — Restricted," or similar
- **ALWAYS use**: "For Trading Use Only"
- **Position**: Once in footer; inherited on all pages
- **NOT in body text** unless specifically called out in a callout box

---

## 4. CONTENT STRUCTURE & TONE

### 4.1 Executive Summary / Introduction
- **Length**: 150–200 words max
- **Content**: Key thesis, 2–3 main findings, trade setup summary
- **Tone**: Declarative, actionable ("The setup is bullish because…")
- **NO fluff**: Avoid "In this report, we will…"

### 4.2 Section Organization
**Full Report standard structure (~13 sections):**
1. Executive Summary / Thesis
2. Market Context / Macro Backdrop
3. Technical Analysis — [Price/Trend/Support/Resistance]
4. Volume & Momentum Indicators
5. Moving Averages & Trend Confirmation
6. RSI / Stochastic / Oscillators
7. Chart Pattern Recognition
8. Catalyst / News Catalyst
9. Risk Factors & Downside Scenarios
10. Day Trade Setup
11. Swing Trade Setup
12. Key Levels — Support & Resistance
13. Conclusion & Watch List

### 4.3 Tone & Voice
- **Analytical, not narrative**: Present facts with evidence, not storytelling
- **Active voice**: "NVDA is testing $130 support" (not "Support is being tested")
- **Declarative**: Use strong language where data supports it ("Is bullish," not "Could be bullish")
- **Professional but direct**: Avoid filler, redundancy, hedging unless uncertainty is genuine

### 4.4 Length Guidelines
- **Full Report**: 3,000–5,000 words across 8–12 pages
- **Brief Summary**: 800–1,200 words across 3–4 pages
- **Flash Brief**: 300–500 words, 1 page landscape
- **Morning Briefing**: 1,500–2,000 words, HTML email with 6–8 stories + ticker setups

---

## 5. DATA & CITATION STANDARDS

### 5.1 Tool-First Workflow
**For ANY current/recent data (markets, news, APIs, websites):**
1. **Always call tools BEFORE responding** — do not rely on training data
2. **Market data**: Fetch live prices, RSI, volume, moving averages via fetch_sports_data or web_search
3. **News & catalysts**: Search for recent news, earnings announcements, regulatory filings
4. **Economic data**: Pull latest macroeconomic releases (Fed decisions, jobs, inflation)
5. **Company financials**: Verify latest quarterly results, analyst consensus

**Exception**: Historical facts (e.g., "The 2008 financial crisis occurred in…") do not require re-fetching if they are well-established.

### 5.2 Citation & Verification
- **Every market price, RSI, volume figure, or technical level MUST be sourced**
- **Format**: [Source — timestamp] or inline: "TSLA closed at $187.42 (Bloomberg, 3:58 PM EDT)"
- **Academic/Finance standard**: Use APA or Chicago style for longer citations
- **Multiple sources**: For contested facts or analyst consensus, cite 2+ sources and note disagreement
- **ALWAYS include timestamp** in financial data (see Section 5.4)

### 5.3 Avoiding Redundant Summaries
- **No opening phrases like**: "According to our analysis…," "As mentioned above…," "To summarize…"
- **Structure instead**: Use bold headers, tables, bullet points for scannability
- **Lead with findings**: Start sections with the conclusion, then support with evidence
- **Eliminate repetition**: Say it once, concisely; do not reiterate across sections

### 5.4 Timestamp EVERYTHING Financial — MANDATORY

**Every price, RSI, volume, moving average, support/resistance level MUST include:**
- **Time of day** (EDT/NY time preferred for US markets)
- **Date** (if not same-day data)
- **Source** (Bloomberg, Yahoo Finance, TradingView, etc.)

**Format examples:**
- ✅ "TSLA: $187.42 (-1.2%), 2:45 PM EDT, April 25, 2026 [Yahoo Finance]"
- ✅ "RSI(14): 62.3, intraday, 3:30 PM EDT [TradingView]"
- ✅ "Volume: 47.2M shares, trailing 50-day avg: 52.1M [Bloomberg]"
- ✅ "Support: $185 (Feb 28 low, 2026) | Resistance: $192 (Apr 15 high, 2026)"

**NOT acceptable:**
- ❌ "TSLA is trading at $187.42" (no time/source)
- ❌ "RSI is 62" (no timestamp)
- ❌ "Volume was elevated" (no specific figures)

**Rule**: If you cannot timestamp it, do not include the figure.

---

## 6. FINANCIAL DATA STANDARDS

### 6.1 Price Levels & Precision
- **Equity prices**: 2 decimal places (e.g., $187.42)
- **Commodities**: 2–4 decimals as market standard (e.g., WTI $87.35)
- **Cryptocurrencies**: 2–8 decimals (e.g., BTC $43,250.45)
- **Percentages**: 1 decimal place (e.g., +1.2%, -0.8%)

### 6.2 Indicator Precision
- **RSI/Stochastic**: 1 decimal place (e.g., RSI 62.3)
- **Moving averages**: 2 decimals for stocks, 4 for commodities
- **MACD/Histogram**: Match security decimal standard

### 6.3 Risk/Reward Ratios
- **Format**: "Risk: $2.00 | Reward: $5.00 | Ratio: 1:2.5"
- **Always specify entry, stop, target**

### 6.4 Color-Coded Signals (If Table or Visual)
- **Red**: Bearish signal, down move, resistance, sell
- **Green**: Bullish signal, up move, support, buy
- **Blue**: Neutral, informational, consolidation
- Use consistently across all tables and callout boxes

---

## 7. MORNING INTELLIGENCE BRIEFING SPECIFIC STANDARDS

**Trigger**: User says "morning briefing" or "morning intelligence briefing"

### 7.1 Multi-Search Checklist
Execute searches in this order:
1. **Macro/Geopolitical**: Fed decisions, inflation, Iran tensions, oil supply
2. **Mega-Cap Tech (MAG-7)**: Microsoft, Apple, Google, Amazon, Nvidia, Tesla, Meta
3. **Broad Market**: S&P 500, Dow Jones, Nasdaq-100, SPY, QQQ, tracking movements
4. **AI/LLM News**: Agentic AI, Claude releases, OpenAI, LLM developments
5. **Individual Tickers**: TSLA, SPX, F, NVDA, AAPL, AMZN, SPY, QQQ, NASDAQ (latest setups)

### 7.2 Briefing Structure
```
[HTML Header — Navy/Dark Red Theme]
🌅 MORNING INTELLIGENCE BRIEFING
[Day, Date, Time]

[Market Snapshot — table]
- S&P 500: [price, change, % change, timestamp]
- Dow Jones: [price, change, % change, timestamp]
- Nasdaq: [price, change, % change, timestamp]
- VIX: [level, direction, timestamp]
- Key Commodities: Oil, Gold, 10Y yield

[6–8 Top Stories — short summaries with links]
1. [Headline + 1-2 sentence summary + source + link]
2. [Headline + 1-2 sentence summary + source + link]
... (continue)

📈 Ticker Setups — Day & Swing Trade Watch
[Color-coded cards for: TSLA, NVDA, SPY, QQQ, etc.]

Each card includes:
- Last price | % change | timestamp
- Support | Resistance
- Trend bias (bullish/bearish/neutral)
- Active catalyst
- Day trade setup (entry, stop, target)
- Swing trade setup (entry, stop, target)

[Footer]
---
For Trading Use Only
```

### 7.3 Delivery
- **Send directly to**: atila.bayat@gmail.com (NOT draft)
- **Subject line**: "🌅 Morning Intelligence Briefing — [Day, Date]"
- **Format**: HTML email, navy/dark-red styling, professional fonts
- **Timing**: Deliver before market open (9:30 AM EDT)

---

## 8. MISTAKE REDUCTION CHECKLIST

**BEFORE FINALIZING ANY DOCUMENT, run through this checklist:**

### 8.1 Formatting
- [ ] Text is FULL JUSTIFIED (both left and right edges aligned)
- [ ] Heading hierarchy is consistent (H1=24pt, H2=16pt, H3=13pt, H4=12pt)
- [ ] NO name or location in header or footer
- [ ] Footer contains: "Research Director, Alpha Data Architects | For Trading Use Only"
- [ ] Page numbers are in top right (Page X of Y format)
- [ ] Margins are exactly 1 inch on all sides
- [ ] Line spacing is 1.15 (body), 1.5 (between sections)

### 8.2 Content & Data
- [ ] EVERY market price has timestamp (time, date, source)
- [ ] EVERY technical level (support/resistance) is dated
- [ ] EVERY RSI, volume, moving average is timestamped
- [ ] No redundant summaries or repeated points
- [ ] Section structure matches template (H2 sections in correct order)
- [ ] No phrases like "As mentioned," "In summary," "According to our analysis"

### 8.3 Confidentiality & Tone
- [ ] Confidentiality language reads: "For Trading Use Only" (NEVER "Confidential")
- [ ] Language is declarative and active (not hedging)
- [ ] No author name/location in body or headers
- [ ] Tone is analytical, not narrative

### 8.4 Data Accuracy & Tools
- [ ] Current/recent market data was fetched via tools (not from training data)
- [ ] News and catalysts were web-searched (not assumed)
- [ ] Prices double-checked against at least one primary source
- [ ] Charts/images are labeled and sourced (if applicable)
- [ ] No stale data (if data is >5–10 min old during market hours, re-fetch)

### 8.5 Citations
- [ ] All claims from external sources are cited
- [ ] Academic/finance citations follow APA or Chicago style
- [ ] Sources are linked or footnoted
- [ ] No direct quotes without attribution

---

## 9. COMMON MISTAKES TO AVOID

| Mistake | Fix |
|---|---|
| "For Trading Use Only" in header instead of footer | Footer only; use template footer, not manual repositioning |
| Mismatched heading sizes | Use hierarchy table (Section 2.2); apply style consistently |
| Left-aligned text in some sections | Full justification on ALL body text; check before export |
| Author name in footer | Remove; footer is: "Research Director, Alpha Data Architects | For Trading Use Only" |
| Price without timestamp | Always include time, date, source: "$187.42 (3:45 PM EDT, April 25, Yahoo Finance)" |
| "As mentioned above…" opening | Replace with bold header + scannable structure (no redundancy) |
| Stale market data | Re-fetch if >5–10 min old during market hours; always timestamp |
| Mixed confidentiality language | Use "For Trading Use Only" exclusively; never mix with "Confidential" |
| Table column widths don't sum to parent width | Verify: colW array must sum exactly |
| Hedging language ("could be," "may be") | Use "is bullish," "is bearish," "is trading" unless uncertainty is genuine |

---

## 10. REPORT TYPE TEMPLATES

### 10.1 Full Report (8–12 pages)
**File structure**: Portrait, 1-inch margins, H1 title + 13 sections (see Section 4.2)  
**Footer**: Standard (Research Director, Alpha Data Architects | For Trading Use Only)  
**Length**: 3,000–5,000 words  
**Deliverable**: .docx or .pdf

### 10.2 Brief Summary (3–4 pages)
**File structure**: Portrait, 1-inch margins, condensed 6–8 sections  
**Footer**: Standard  
**Length**: 800–1,200 words  
**Sections**: Thesis + Market Context + Technical Analysis + Setup + Risks + Conclusion  
**Deliverable**: .docx or .pdf

### 10.3 Flash Brief (1 page, landscape)
**File structure**: Landscape, 1-inch margins, condensed structure  
**Header**: Ticker | Week [date] | **For Trading Use Only**  
**Sections**: Thesis (50 words) + Technical Setup (150 words) + Risks (75 words) + Key Levels (summary table)  
**Length**: 300–500 words  
**Footer**: Right-aligned page number (no author name)  
**Deliverable**: .pdf (landscape print-optimized)

### 10.4 Morning Intelligence Briefing (HTML email)
**Delivery**: Direct email (not draft) to atila.bayat@gmail.com  
**Subject**: "🌅 Morning Intelligence Briefing — [Day, Date]"  
**Structure**: Market snapshot + 6–8 stories + ticker setups (cards)  
**Length**: 1,500–2,000 words  
**Design**: Navy/dark-red HTML, professional fonts, responsive  
**Timing**: Before 9:30 AM EDT

---

## 11. TOOL WORKFLOW SUMMARY

### Before Writing Any Report:
1. **Fetch current market data** (prices, RSI, volume, moving averages)
2. **Search for recent news & catalysts** (company announcements, earnings, macro events)
3. **Verify support/resistance levels** against historical charts
4. **Check analyst consensus** (multiple sources for contested claims)
5. **Timestamp everything** — record exact time and source

### During Writing:
1. **Use approved templates** (Section 10)
2. **Follow heading hierarchy** (Section 2.2)
3. **Apply full justification** (Section 2.1)
4. **Cite all sources** (Section 5.2)
5. **No redundant summaries** (Section 4.4)

### Before Finalizing:
1. **Run Mistake Reduction Checklist** (Section 8)
2. **Verify footer is correct** (not manually repositioned)
3. **Check all timestamps** (prices, levels, news dates)
4. **Scan for forbidden phrases** (Section 9)
5. **Export to .docx or .pdf** (as specified)

---

## 12. QUICK REFERENCE

| Item | Standard |
|---|---|
| **Text alignment** | Full justification (both edges) |
| **Body font size** | 11pt |
| **H1 (Title)** | 24pt bold |
| **H2 (Section)** | 16pt bold |
| **H3 (Subsection)** | 13pt bold |
| **Margins** | 1 inch all sides |
| **Line spacing** | 1.15 (body), 1.5 (sections) |
| **Confidentiality** | "For Trading Use Only" (footer only) |
| **Author/Location in footer?** | NO — Use: "Research Director, Alpha Data Architects | For Trading Use Only" |
| **Timestamp financial data?** | YES — Always (time, date, source) |
| **Citation format** | APA or Chicago for finance; inline [Source, timestamp] for market data |
| **Tone** | Declarative, analytical, active voice |

---

## 13. VERSION HISTORY & UPDATES

| Version | Date | Changes |
|---|---|---|
| 1.0 | April 26, 2026 | Initial comprehensive guidelines document; includes formatting, content, data, workflow, and mistake reduction standards |

**Next review**: Quarterly (July 2026)  
**Questions/Feedback**: Use this as a living document; update as new patterns emerge.

---

**END OF GUIDELINES**
