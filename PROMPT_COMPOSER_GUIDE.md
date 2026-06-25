# Prompt Composer & Orchestration Guide
## Building Research Knowledge Bases Through Skill Stacking

**Version:** 1.0  
**Audience:** Research professionals, institutional researchers, data scientists  
**Last Updated:** June 18, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [The Prompt Composer Interface](#the-prompt-composer-interface)
4. [Building Research Knowledge Bases](#building-research-knowledge-bases)
5. [Analyzing and Synthesizing Research](#analyzing-and-synthesizing-research)
6. [Stacking Prompts Effectively](#stacking-prompts-effectively)
7. [Composing with Skills and Chained Skills](#composing-with-skills-and-chained-skills)
8. [Workflow Patterns for Researchers](#workflow-patterns-for-researchers)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The **Prompt Composer** is ADA AI Labs' orchestration facility for building, iterating, and publishing research knowledge. It enables researchers to:

- **Chain multiple research skills** in sequence for comprehensive inquiry
- **Synthesize outputs** from disparate sources into coherent analysis
- **Preserve research context** across builds for iteration and refinement
- **Publish findings** directly to wikis and research artifacts

The core innovation is **skill stacking**: you compose a multi-step research workflow by selecting skills, providing a guiding prompt, and letting the orchestrator execute them in parallel, then synthesize results with Claude.

### Key Workflow Stages

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Compose Prompt                                            │
│    (your research question + skill stack)                    │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. Execute Skills in Parallel                                │
│    (each skill: fetch data, transform, stream output)        │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. LLM Synthesis (Claude)                                    │
│    (reconcile outputs, cite data, produce final deliverable) │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. Publish & Iterate                                         │
│    (save to wiki, rebuild with refined prompt, etc.)         │
└──────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### Skill
A **skill** is a self-contained research module that fetches or transforms data:
- `web-search` — live internet search via Brave, Exa semantic, Tavily AI
- `deep-research` — multi-angle research with full-page content
- `news-monitor` — real-time news aggregation (GDELT, Brave, NewsAPI)
- `literature-review` — academic paper discovery (arXiv, OpenAlex, Semantic Scholar)
- `sec-filings` — SEC EDGAR full-text search
- `quant` — market data, options chains, dealer positioning (GEX)
- `notebooklm` — query your uploaded NotebookLM research notebooks

Each skill:
- Runs **independently** (parallelizable)
- **Streams output** in real-time (no waiting for all skills to finish)
- **Gracefully degrades** when API keys are missing or services fail
- Produces **markdown output** suitable for synthesis

### Skill Stack
A **stack** is an ordered list of skills selected for a single research inquiry.

Example stack for financial research:
```
web-search + quant + sec-filings + notebooklm
```

The order doesn't affect execution (skills run in parallel), but it helps you remember your intent and appears in the final output in the order you specified.

### Synthesis (LLM Step)
After all skills complete, Claude reconciles their outputs:
- **Deduplicates** overlapping findings
- **Cites data** by skill source (e.g., "According to /web-search...")
- **Flags conflicts** (e.g., "SEC filings show X, but news reports Y")
- **Produces a final deliverable** (report, analysis, decision memo)

The synthesis prompt is **mode-aware**:
- **Finance mode** (if you mention stocks, options, trading): ends with a **Trade Read** section (bias + trigger conditions)
- **Academic mode** (if you stack literature-review): ends with **Research Synthesis** (key findings, open questions, priority sources)
- **General mode**: ends with **Key Takeaways** (3-5 bullets grounded in sources)

### Dual-Button Workflow

**Build vs. Rebuild vs. New Build:**
- **Build** — first build with this prompt
- **Rebuild** — re-execute the same skill stack with a modified prompt (iterates on the last build)
- **New Build** — clear the previous build, start fresh research inquiry

---

## The Prompt Composer Interface

### Layout

```
┌─ Prompt Composer ─────────────────────────────────────────┐
│                                                            │
│  [Textarea: your research question]                       │
│  (6 lines min, 320px max height)                          │
│                                                            │
│  ┌─ Skill Stack ──────────────────┐                       │
│  │ [quant] + [web-search] + [+] + [× clear]              │
│  └────────────────────────────────┘                       │
│                                                            │
│  ┌─ Notebook Picker (if /notebooklm selected) ─────┐     │
│  │ 📓 Notebook   [Choose Notebook ▾]               │     │
│  └──────────────────────────────────────────────────┘     │
│                                                            │
│  [⊕ New Build]  [Build / Rebuild] ⌘↩                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Action | Result |
|---------|--------|--------|
| **[+] button** | Click to open skill picker | Search & select skills to add |
| **Skill chip** | Click [×] to remove | Remove from stack (keeps prompt) |
| **[× clear]** | Click to reset stack | Remove all skills |
| **Notebook picker** | Shows when `/notebooklm` selected | Choose notebook to query |
| **[⊕ New Build]** | Appears when previous build exists | Clear previous build, start fresh |
| **[Build/Rebuild]** | Click or ⌘↩ | Execute orchestration |
| **Textarea focus** | Click in prompt area | Closes skill picker (clean state) |

### State Indicators

- **Lines · Chars · Stack N/10** — upper right shows composition size (max 10 skills per stack)
- **Button text:**
  - "Build" = fresh start
  - "Rebuild" = iterate on last build
  - "Queuing" = build submitted, waiting to execute
- **Skill chips** show category color indicator (blue=research, amber=quant, teal=dev, rose=knowledge)

---

## Building Research Knowledge Bases

### Scenario: Establishing a Curated Research Foundation

When you're starting a new research area, the goal is to **ingest authoritative sources systematically** and **preserve context** for iteration.

#### Step 1: Broad Search Phase

**Prompt:**
```
Summarize the current state of quantum error correction in quantum computing.
Focus on: (1) main technical challenges, (2) leading research groups and companies,
(3) timeline to practical impact, (4) key patents and publications from 2024-2026.
```

**Skill Stack:**
```
literature-review + web-search + sec-filings
```

**Why this stack:**
- `literature-review` → peer-reviewed papers, academic consensus
- `web-search` → commercial developments, announcements, blog posts
- `sec-filings` → company strategy disclosures (10-K, 8-K mentions of QEC)

**Output:**
- Curated list of 30-50 academic papers (with abstracts)
- News headlines and blog analysis
- Company filings mentioning QEC (IBM, Google, IonQ, Rigetti, etc.)
- Synthesis highlighting convergence and conflicts

#### Step 2: Deep-Dive on Key Areas

Once you've identified major players and topics, focus deeper:

**Prompt:**
```
Deep dive: How are IBM and Google approaching quantum error correction differently?
Compare their published research, patent strategies, and timeline statements.
What's the technical gap? Market implications?
```

**Skill Stack:**
```
deep-research + sec-filings + notebooklm
```

**Why this stack:**
- `deep-research` → multi-angle search with full-page content (not just snippets)
- `sec-filings` → official company positions from earnings calls, shareholder letters
- `notebooklm` → if you've uploaded benchmark papers on each company's approach

**Output:**
- Structured comparison of IBM vs. Google QEC strategies
- Patent analysis (with citations)
- Market implications synthesis
- Ready to publish as a wiki article

#### Step 3: Preserve & Iterate

After a successful build:
1. **Review the synthesis** in the live panel
2. Click the **"Save as Wiki"** option to publish with a title and slug
3. The wiki becomes a **permanent knowledge base entry**

If you want to **refine**:
- Modify the prompt slightly (e.g., "Add analysis of Rigetti's approach")
- Click **"Rebuild"** → executes the same skill stack with your new prompt
- Previous wiki remains unchanged; new build is separate iteration

If you want to **move to a new topic**:
- Click **"⊕ New Build"** → clears the previous build
- Change the skill stack
- Enter a new research prompt
- Fresh start with no distracting context

---

## Analyzing and Synthesizing Research

### Core Principle: Let Skills Specialize, Claude Reconciles

**Anti-pattern:** "Fetch everything, ask one question."  
**Pro pattern:** "Stack specialists, ask a focused question, let Claude reconcile."

### Example: Earnings Reaction Analysis

**Research Goal:** Why did Company X's stock drop 5% after beating earnings?

**Prompt:**
```
Company X reported Q2 2026 earnings: EPS beat by 8%, Revenue beat by 3%.
Stock dropped 5% post-market. Explain the disconnect. 

Synthesize from news, analyst commentary, and SEC filing guidance statements.
What guidance miss? Market expectation vs. reality? Sector headwinds?
```

**Skill Stack:**
```
web-search + sec-filings + quant
```

**What each skill provides:**
- `web-search` → real-time analyst reactions, news headlines, social sentiment
- `sec-filings` → official guidance statements, management commentary, forward-looking statements
- `quant` → historical stock moves on earnings, sector comparison, momentum/volatility

**Synthesis Claude performs:**
1. Cite specific evidence from each source
2. Identify the gap (e.g., "Guidance lowered 2H outlook despite Q2 beat")
3. Contextualize (e.g., "Sector average down 3% same day")
4. Produce a **Trade Read** section with directional bias and trigger levels

**Output is immediately actionable:** traders see the precise reconciliation of why fundamentals and price diverged.

---

## Stacking Prompts Effectively

### Principle 1: Stack for Data Diversity, Not Volume

**Bad stack (too many skills):**
```
web-search + deep-research + news-monitor + literature-review + 
sec-filings + notebooklm + academic-search
```
→ Redundant data, confusing synthesis, 7 minutes to execute.

**Good stack (strategic selection):**
```
web-search + sec-filings + notebooklm
```
→ Live news, official company info, your own research notes. Tight synthesis in 2 minutes.

**Ask yourself:** "What data sources do I need *not available elsewhere*?"
- Live news? → use `web-search` or `news-monitor`
- Academic consensus? → use `literature-review`
- Company strategy? → use `sec-filings` (not web-search; web has the highlights already)
- My own documents? → use `notebooklm`

### Principle 2: Order Skills by Priority, Not Execution Order

You stack skills in an order that **reflects importance**, even though they execute in parallel.

**Example:**
```
notebooklm + sec-filings + web-search
```
Says: "My research notebooks are primary source, official filings are secondary, news is tertiary."

In the synthesis output, they're cited in that precedence order.

### Principle 3: Leverage Mode-Aware Synthesis

**Finance mode** (detected if you mention: stock, earnings, options, trading, bid, ask, IV, delta, gamma, VIX, etc.):
- Synthesis ends with a **Trade Read**: directional bias + 1-2 specific trigger conditions
- Example: "Bias: bearish into $450 call wall; buy dips at $420 put wall. Trigger: VIX expansion above 18."

**Academic mode** (detected if you stack `literature-review` or `academic-search`):
- Synthesis ends with **Research Synthesis**: dominant findings, contradictions, priority papers to read first
- Example: "Open question: Does approach A scale to N=1M? Only Chen (2025) addresses this; needs replication."

**General mode** (default):
- Synthesis ends with **Key Takeaways**: 3-5 actionable bullets grounded in sources

**To activate a mode, include relevant skills or terminology in your prompt.**

### Principle 4: Stack for Iteration Readiness

Structure your stack so you can **rebuild quickly** with prompt tweaks:

**Round 1 (Broad):**
```
Stack: web-search + literature-review
Prompt: "Overview of zero-knowledge proofs: history, applications, latest developments."
Output: 50-page conceptual foundation
```

**Round 2 (Narrow → Rebuild):**
```
Stack: same (web-search + literature-review)
Prompt: "Focus on zero-knowledge proofs in privacy-preserving finance. Which banks? Timeline? Regulatory risk?"
Output: Narrower synthesis, same sources, different angle
```

By keeping the stack consistent, you:
- Compare Round 1 vs. Round 2 easily
- Identify what changed (prompt perspective, not data sources)
- Build refinement history in a single conversation

---

## Composing with Skills and Chained Skills

### Chained Skills: Sequential Data Enrichment

Most research needs **chained execution**: Skill A's output informs Skill B's query.

**Example: Insider Trading Watchlist**

**Desired output:** List of insider transactions from the past week, ranked by significance.

**Step 1 (Get baseline list):**
```
Stack: sec-filings (only)
Prompt: "Recent insider transactions filed in Form 4 filings: June 10-17, 2026.
List: officer name, title, transaction type (buy/sell), quantity, company."
Output: ~30 transactions listed
```

**Step 2 (Enrich with context — REBUILD):**
```
Stack: sec-filings + web-search + quant (same, but with new prompt)
Prompt: "For the insider transactions from Step 1, provide context:
(1) Which are most significant by $ amount or % of insider holdings?
(2) What company news occurred in the same week?
(3) How did stock price move relative to transaction?
Rank by likely significance (signal vs. noise)."
Output: Curated watchlist with reasoning
```

**Why rebuild instead of two separate builds?**
- Prompt Composer seamlessly chains them
- Synthesis can reference both steps
- You have one unified output document instead of two

---

## Workflow Patterns for Researchers

### Pattern 1: Literature Review → Deep Dive

**Use case:** Starting research in a new domain.

**Build 1 — Foundation:**
```
Prompt: "Overview of CRISPR gene editing: history, successes, limitations, 
open research questions (2024-2026)."
Stack: literature-review + web-search
Time: ~3 min
Output: 30 papers, news summary, key open questions
Publish as: wiki/crispr-primer
```

**Build 2 — Focused (Rebuild):**
```
Prompt: "Deep dive on off-target effects in CRISPR-Cas9. Which techniques reduce 
off-target risk? Clinical trials addressing this? Company/academic approaches?"
Stack: same
Time: ~3 min
Output: Narrower, methodology-focused, with clinical trial data
Publish as: wiki/crispr-off-target-risk
```

**Build 3 — Competitive Landscape (New Build):**
```
Prompt: "CRISPR alternatives gaining funding/interest (2025-2026): base editing, 
prime editing, epigenetic edits. Compare to CRISPR-Cas9 on: specificity, 
efficiency, deliverability, development timeline."
Stack: web-search + sec-filings + literature-review
Time: ~4 min
Output: Structured comparison, company pipeline analysis
Publish as: wiki/crispr-alternatives
```

### Pattern 2: Real-Time Intelligence (Daily Monitor)

**Use case:** Tracking an emerging company, trend, or regulatory change.

**Recurring Build:**
```
Prompt: "Latest developments in quantum computing hardware, June 2026.
Company announcements, funding, technical breakthroughs, hiring patterns."
Stack: web-search + sec-filings + news-monitor
Frequency: Daily or 2x weekly
Output: Always-fresh digest
Publish as: wiki/quantum-hardware-monitor (update same wiki)
```

**Why this works:**
- Skills refresh live data each time you rebuild
- Same prompt skeleton, always-fresh synthesis
- Easy to spot week-over-week trends
- One central knowledge base entry

### Pattern 3: Multi-Stakeholder Research (Decision Support)

**Use case:** Board-level decision on acquisition target, market entry, etc.

**Build 1 — Market Research:**
```
Prompt: "Market size, growth rate, and competitive landscape in [Industry X].
Distinguish: (1) TAM (total addressable market), (2) SAM (serviceable addressable), 
(3) SOM (serviceable obtainable). Key competitors and positioning."
Stack: web-search + sec-filings + literature-review
Output: Market context
```

**Build 2 — Target Company Deep Dive (Rebuild):**
```
Prompt: "[Target Co.] detailed analysis: financials (trailing 4 quarters, 
guidance), technology (competitive advantages, IP portfolio), team 
(executive background, retention risk), customer concentration, 
regulatory risk. Strengths and vulnerabilities relative to market."
Stack: sec-filings + web-search + notebooklm (if you have target research notebooks)
Output: Target assessment
```

**Build 3 — Integration Scenarios (Rebuild again):**
```
Prompt: "Scenario analysis: If we acquire [Target Co.], what synergies are realistic?
(1) Revenue synergies (customer overlap, cross-sell), (2) cost synergies 
(COGS, SG&A, R&D), (3) timeline and risk. Compare to standalone outlook."
Stack: sec-filings + web-search + notebooklm
Output: Synergy models and recommendation
```

**Advantage:** All three builds in one session, with linked context. Stakeholders can drill down from market → target → scenarios without context-switching.

---

## Best Practices

### 1. Write Specific Prompts, Not Vague Ones

**Weak:**
```
"Tell me about quantum computing."
```
→ Synthesis is broad, unfocused. Researchers drown in general info.

**Strong:**
```
"Quantum error correction progress 2024-2026:
(1) Which companies/labs reached what milestones?
(2) What's the technical bottleneck preventing scale?
(3) Realistic timeline to 1M logical qubits?
Cite sources with specific dates and technical details."
```
→ Synthesis is structured, actionable, citations are precise.

### 2. Use Structured Prompts for Complex Inquiries

Break complex questions into numbered sub-questions:

```
Prompt: "Analyze the impact of AI regulation on semiconductor supply chains:
(1) Which regulatory frameworks (US, EU, China) restrict chip sales/design?
(2) Which semiconductor companies are most exposed?
(3) Which have diversified supply chains vs. concentrated risk?
(4) Market implications: winners and losers over next 2 years?
(5) Realistic timeline for regulatory clarity?"
```

Claude's synthesis naturally follows the structure, producing organized output.

### 3. Cite Your Intent in the Prompt

Researchers appreciate transparency about *why* you're asking:

```
"Prompt: We're evaluating a potential investment in [Company X] in the 
gene therapy space. To inform our decision, we need:
(1) Market growth trajectory and competitive intensity
(2) [Company X] technical differentiation and pipeline risk
(3) Regulatory pathway clarity and timeline
..."
```

This helps Claude contextualize and prioritize in synthesis.

### 4. Name Your Builds for Knowledge Base Organization

When saving to wiki, use clear titles:

**Good:**
- `crispr-off-target-risk` — specific research question
- `quantum-hardware-comparison-2026` — narrow, time-bound
- `insider-trading-watchlist-june` — actionable, dated

**Avoid:**
- `research-1`, `notes`, `analysis` — not searchable or memorable

### 5. Leverage NotebookLM for Proprietary Context

If you have **internal documents** (reports, presentations, datasets):

1. Upload them to NotebookLM
2. Stack `/notebooklm` in your composer
3. Include internal context in the prompt: "Given our internal analysis in [Notebook Name], how does this external research compare?"

Example:
```
Prompt: "We have internal notes on how our competitors approach [Problem X].
Given public research and company statements, what blind spots might we have?
What are we missing?"
Stack: notebooklm + web-search + literature-review
```

Output reconciles your internal view with external reality.

### 6. Iteratively Narrow Scope

Research discovery is iterative. Start broad, then narrow:

**Build 1:** "Overview of X"  
**Build 2:** "Focus on X's application to Y"  
**Build 3:** "Deep dive: X's application to Y in Market Z"  

Each rebuild adds **specificity and precision** without re-fetching basic data.

### 7. Publish Incrementally

Don't wait for perfection. After each meaningful build:
- **Save as wiki** with a descriptive title
- Even partial insights are valuable for future reference
- Creates a **research trail** (audit log) of your inquiry

---

## Troubleshooting

### Build Failed with 500 Error

**Causes:**
- API key for a skill expired or is invalid
- Rate limit hit on an external service
- NotebookLM authentication expired

**Solutions:**
1. Check `.env` for missing or invalid keys
2. For NotebookLM: run `nlm login` in terminal to refresh authentication
3. Rebuild: skills gracefully degrade; one failure shouldn't halt the build
4. Check dev server logs for specific error details

### Skill Picker Stays Open After Selection

**Fix:** Click in the textarea to close picker, or click the "Build" button directly.

### Previous Wiki Appearing When I Want Fresh Start

**Solution:** Click **"⊕ New Build"** button (appears next to "Rebuild" when a previous build exists). This clears the old build and resets to clean state.

### Synthesis Seems Shallow or Misses Key Point

**Causes:**
- Prompt is too vague; Claude can't prioritize
- Stack is missing a relevant skill
- Data not available in selected skills (e.g., expecting academic papers but only selected web-search)

**Solutions:**
1. Make prompt more specific (add numbered sub-questions)
2. Add a skill that covers the gap (e.g., add `literature-review` if academic rigor needed)
3. Rebuild with refined prompt

### NotebookLM Skill Shows "Failed to Execute Prompt 2 Times"

**Cause:** NotebookLM session expired or authentication is invalid.

**Solution:**
```powershell
nlm login
```
Then retry the build.

### Build Takes Too Long

**Cause:** Too many skills in stack; they run in parallel but synthesis waits for all to finish. If one skill is slow, entire build is slow.

**Solution:**
- Remove non-essential skills
- Use `web-search` instead of `deep-research` (faster, less comprehensive)
- If targeting specific domain, use specialized skill (e.g., `sec-filings` instead of `web-search` for company info)

---

## Quick Reference: Skill Selector

| Skill | Best For | Speed | Data Depth | API Key Required |
|-------|----------|-------|-----------|------------------|
| `web-search` | General news, announcements | Fast (1-2 min) | Shallow | Brave, Exa, Tavily |
| `deep-research` | Comprehensive multi-angle | Slow (2-4 min) | Deep | Tavily |
| `news-monitor` | Real-time headlines, trending | Very fast (1 min) | Shallow | NewsAPI optional |
| `literature-review` | Academic papers, rigor | Medium (2-3 min) | Deep | Semantic Scholar optional |
| `academic-search` | Peer-reviewed discovery | Medium (2 min) | Medium | CORE optional |
| `sec-filings` | Company financials, strategy | Fast (1-2 min) | Precise | None (free) |
| `quant` | Market data, technicals, options | Fast (1 min) | Precise | Polygon (free tier) |
| `notebooklm` | Your uploaded research | Instant (1 min) | As detailed as your docs | Google auth |

---

## Summary: The Research Workflow

1. **Start:** Compose a research question + select skills
2. **Execute:** Skills run in parallel, stream results live
3. **Synthesize:** Claude reconciles, cites, produces final deliverable
4. **Publish:** Save to wiki or iterate with "Rebuild" / "New Build"
5. **Repeat:** Build a knowledge base incrementally

The Prompt Composer is your **research orchestration command center**. Use it to scale your research velocity while maintaining rigor and traceability.

---

**Questions or feedback?** This guide evolves with user patterns. Report issues or suggest improvements in your research sessions.
