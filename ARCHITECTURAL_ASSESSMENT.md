# ADA AI Labs — Architectural Assessment (v6.7 → v7 Planning)

**Date:** June 9, 2026  
**Status:** Current state analysis + gap identification  
**Scope:** Humanities-focused research portal with cohesive Workspace, Research, and Knowledge Graph layers

---

## Executive Summary

ADA AI Labs v6.7 is a **well-architected prototype** with a working builder pipeline, wiki/knowledge layer, and skill chaining system. The core gaps preventing v7 launch are:

1. **No publishing mechanism** — apps exist in the database but can't be exported or deployed publicly
2. **Workspace ↔ Research disconnected** — builds don't feed research; research doesn't update knowledge graph
3. **Knowledge graph is static** — nodes/edges are seed data, not updated from research/wikis
4. **Domain-agnostic skill set** — quant/market skills must be removed for humanities focus
5. **No concept-discovery UX** — knowledge graph visualization exists but lacks query/filter/traversal UI

---

## Current Architecture: What's Working

### Foundational Layers

| Layer | Technology | Status |
|-------|-----------|--------|
| **Framework** | Next.js 14 (App Router) + TypeScript | ✅ Solid |
| **Database** | Prisma + SQLite (swappable to Postgres) | ✅ Production-ready schema |
| **State** | Zustand (client) + Server Actions | ✅ Clean separation |
| **Styling** | Tailwind + CSS variables (design tokens) | ✅ Themeable |
| **Fonts** | Fraunces (display), IBM Plex (body), JetBrains Mono | ✅ Professional aesthetic |

### Features Implemented

#### 1. Builder (Prompt Stacking + Skill Chaining)
- ✅ Prompt composer with real-time skill picker
- ✅ Skill orchestration (sequential execution, context carryover)
- ✅ Streaming output via EventSource
- ✅ Build persistence (every build saved to DB)
- ✅ Re-runnable builds (click any saved build to replay)

**Executor types:**
- 8 Quant skills (TSLA putwall, gamma exposure, dealer flow, etc.) — Bloomberg-style templates
- 28 total skills across research, learning, documents, design, NotebookLM, knowledge
- Default executor for unmapped skills (contribute context to LLM synthesis)

**LLM synthesis:**
- ✅ Env-gated: real Anthropic API if `ANTHROPIC_API_KEY` set, deterministic stub if not
- ✅ Falls back gracefully if API errors
- ✅ Model configurable (`ANTHROPIC_MODEL`)

#### 2. Applications (Launch + Deployment Rail)
- ✅ App launcher grid (`/applications`)
- ✅ Full-screen launch overlay with live preview
- ✅ Deployment rail: Dev → Staging → Live (env switching via server action)
- ✅ Runtime metrics stub (region, uptime, latency, requests, errors)
- ✅ Build log animation
- ✅ Promotion pipeline is **optimistic** (good UX, rolls back on error)

**Data structure:**
```prisma
model App {
  id, name, cat, icon, color, env, url, type, desc
  html, markdown  // captured artifact + markdown export
  region, uptime, latency, requests, errors  // runtime metrics
  log  // JSON: [time, message, level][]
}
```

**App types:** `putwall | briefing | compendium | digest | lattice | wiki | artifact | generic`

#### 3. Wikis (Karpathy-Style Knowledge Layer)
- ✅ Wiki grid with card metadata (`/wikis`)
- ✅ Wiki reader with 3-pane layout (TOC + content + metadata)
- ✅ Scroll-spy TOC highlighting
- ✅ Citation popovers (hover `[1]` → see source)
- ✅ Cross-wiki linking (`[Wiki Name]` → route to wiki)
- ✅ Edit mode toggle (contenteditable prose)
- ✅ Static pages per wiki (WikiPage model)

**Data structure:**
```prisma
model Wiki {
  slug, title, lede, banner, content (HTML)
  sources (WikiSource[]), related (WikiRelated[])
  toc (WikiTocItem[]), pages (WikiPage[])
  card metadata: cardDesc, cardStat1/2/3
}
```

**Banners:** `research | quant | philosophy`

#### 4. Knowledge Graph (Conceptual Visualization)
- ✅ Interactive SVG graph (`/knowledge`)
- ✅ Nodes: label, x/y, radius, color, category
- ✅ Edges: opacity, directed (fromId → toId)
- ✅ Categories: `Quant | Wiki | Research | Application | Concept`
- ✅ Stats page (entity/edge counts from DB)

**Current state:** 100% seed data (static)

#### 5. Deep Research Engine
- ✅ Research panel UI (`/research`)
- ✅ Source rail + research feed
- ✅ ResearchSession model (topic, categories, status, results)
- ✅ Per-session result logging

**Current limitation:** Executes but doesn't feed other systems (no Build → Research → Graph flow)

#### 6. Admin + Dashboard
- ✅ `/admin` page (API keys, system health, audit trail)
- ✅ `/dashboard` (workspace status, activity feed, build chart)
- ✅ Sidebar nav with dynamic badges (computed at query time)
- ✅ Toast notifications (Zustand-driven)

---

## The Three Critical Gaps

### Gap 1: Publishing Mechanism

**Current State:**
- Apps are stored in DB (`App.html`, `App.markdown`)
- LaunchOverlay renders them in a sandboxed iframe
- No export, versioning, or public deployment

**What's missing:**
```
Build (in DB)
  → can be promoted to App
  → App.html is captured artifact
  → ??? (no publish pathway)
  → Can't share publicly or deploy
```

**Implications:**
- Users can't share built apps outside the workspace
- No version control for published artifacts
- No deployment to Vercel, GitHub Pages, etc.
- No persistent shareable URLs

### Gap 2: Workspace ↔ Research Disconnection

**Current State:**
```
/builder
  → Builds (prompt + skills + output)
  → Can promote to App or Wiki
  → Build persisted but not analyzed

/research
  → ResearchSession (topic + results)
  → Standalone—doesn't consume Builds
  → Doesn't feed Knowledge Graph

/wikis
  → Static knowledge layer
  → Can't be created from Research

/knowledge
  → Nodes + edges visualization
  → 100% seed data, not updated
```

**What's missing:**
```
Build output
  → Extract key concepts, insights, sources
  → Enrich Research sessions with build findings
  → Update Knowledge Graph (add/link nodes)
  → Trigger wiki creation if research-worthy
```

**Implications:**
- Research is isolated from the builder
- Knowledge graph is static (doesn't grow)
- No feedback loop: Workspace → Research → Knowledge Graph
- Can't feed research insights back into the system

### Gap 3: Knowledge Graph as Static Visualization

**Current State:**
- 100% seed data (not updated by any system)
- Nodes have categories but no concept inheritance
- Edges are fixed (no dynamic relationship inference)
- No query/filter UI (can't traverse graph, search by concept)
- No distinction between curated vs. inferred relationships

**What's missing:**
```
Research session completes
  → Concepts extracted from results
  → New nodes created or linked
  → Graph reflects current state
  → User can explore via traversal UI
  → Graph grows as "second brain"
```

**Implications:**
- Knowledge graph doesn't reflect what's been researched
- Can't discover related concepts via graph traversal
- Static nature defeats the purpose of "second brain"
- No way to see emerging themes across research sessions

---

## Domain-Specific Friction: Quant Focus

Current v6.7 is domain-agnostic but **heavily weighted toward quant/market skills:**

| Category | Count | Status |
|----------|-------|--------|
| Quant | 8 | Must remove for humanities |
| Research | 4 | Reorient to humanities |
| Learning | 3 | Keep (universal) |
| Documents | 2 | Keep (universal) |
| Design | 2 | Keep (universal) |
| NotebookLM | 1 | Reorient |
| Knowledge | 1 | Reorient |

**Routes affected:**
- `/quant` (market floor, TSLA dealer positioning) — remove
- `/skills` filter on "quant" category — remove

**Data affected:**
- SEED_APPS: 8 apps, mostly market-themed — rebuild
- SEED_WIKIS: 6 wikis, mix of domains — reorient to humanities

---

## Technical Readiness Assessment

| Component | Readiness | Notes |
|-----------|-----------|-------|
| **Database schema** | 95% | Add PublishedApp, KnowledgeGraphUpdate, ResearchIntegration |
| **Builder pipeline** | 95% | Add artifact extraction, concept mining |
| **Wiki system** | 90% | Add wiki-from-research creation, linking |
| **Knowledge graph UI** | 40% | Nodes/edges render, need query/filter UI |
| **Publishing** | 5% | Infrastructure doesn't exist |
| **Workspace-Research** | 10% | No integration wiring |

---

## Path Forward: v7 Requirements

The SRS (next document) will specify:

1. **Publishing Architecture** — versioning, deployment targets, export formats
2. **Integration Wiring** — Build → Research signal extraction → Graph update → Wiki creation
3. **Knowledge Graph as Second Brain** — concept discovery UI, traversal, relationship inference
4. **Humanities Specialization** — new skills, content models, routes, seed data
5. **Deep Research Filters** — concept-based filtering, humanities source prioritization

---

## Risks & Dependencies

### Critical Path
1. **Publishing mechanism** blocks sharing, evaluation, deployment
2. **Workspace-Research integration** blocks automated knowledge graph growth
3. **Humanities domain shift** blocks team evaluation of humanities-focused system

### Nice-to-Haves (Post-v7)
- Relationship inference (NLP-based concept linking)
- Multi-tenant workspace (right now single-user)
- Full-text search over research results
- Export to academic citation formats (BibTeX, etc.)

---

## Next Steps

1. ✅ **This document** — architecture assessment (current state)
2. **SRS_FRAMEWORK.md** — requirements specification for v7
3. **PUBLISHING_SPEC.md** — detailed publishing mechanism design
4. **INTEGRATION_SPEC.md** — Workspace ↔ Research ↔ Knowledge Graph wiring
5. **HUMANITIES_DOMAIN_SPEC.md** — skills, routes, content models for humanities focus
