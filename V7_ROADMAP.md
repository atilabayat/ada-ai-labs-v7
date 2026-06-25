# ADA AI Labs v7 — Development Roadmap & Priorities

**Created:** June 9, 2026  
**Baseline:** v6.7 (working prototype with identified gaps)  
**Target:** v7 launch (publishing + integration + humanities focus)  
**Timeline:** 12 weeks (3 phases × 4 weeks)

---

## Context: Why v7?

Your current prototype (v6.7) **works well for solo research** but has three blockers:

1. **Can't publish or share** research apps outside the workspace
2. **Workspace and Research are disconnected** — builds don't feed research, research doesn't update the knowledge graph
3. **Knowledge graph is static** — it's a visualization, not a living second brain

**v7 solves these by unifying Workspace → Research → Knowledge Graph → Publishing** into a cohesive research portal.

---

## Phase 1: Publishing (Weeks 1-3)
### Goal: Make research apps shareable and deployable

**Why first:** Unblocks evaluation, sharing, and team collaboration. Without publishing, research stays trapped in localhost.

### Deliverables

| Task | Effort | Owner | Notes |
|------|--------|-------|-------|
| **1.1 Export formats** | 2 weeks | Dev | HTML, React component, Markdown, PDF |
| **1.2 Deployment targets** | 1.5 weeks | Dev | Vercel (API), GitHub Pages, Archive |
| **1.3 Publishing schema** | 3 days | Dev | PublishedApp + Deployment models |
| **1.4 LaunchOverlay UX** | 1 week | Dev+Designer | Publish dialog, version entry, deploy selection |
| **1.5 Testing & hardening** | 2 days | QA | Smoke test all export/deploy paths |

### Success Criteria
- [ ] Can export any app to standalone HTML (no external deps)
- [ ] One-click Vercel deploy with public URL
- [ ] Archive download works (.zip with all assets)
- [ ] PublishedApp table has 5+ test entries
- [ ] Team can view published app at public URL

### Questions to Answer
- Which Vercel team/project for deployments? (Org or personal?)
- DNS for public URLs? (`research.adaglobal.ai`? subdomain?)
- Archive retention policy? (Keep all versions or prune old?)

### Post-Phase-1 Blockers Unblocked
- ✅ Apps are now shareable
- ✅ Team can evaluate your research work
- ✅ Publishing doesn't require manual deployment

---

## Phase 2: Integration (Weeks 4-8)
### Goal: Connect Workspace, Research, and Knowledge Graph

**Why second:** Now that publishing works, integrate the three facilities so research automatically feeds the knowledge graph and wiki creation.

### Deliverables

| Task | Effort | Owner | Notes |
|------|--------|-------|-------|
| **2.1 Concept extraction** | 1.5 weeks | Dev | Post-build LLM call, 3-5 concepts, store in Build.metadata |
| **2.2 Build Insights sidebar** | 1 week | Dev+Designer | Show extracted concepts, allow manual curation |
| **2.3 Build → Research wiring** | 1 week | Dev | Button to route Build output as ResearchSession input |
| **2.4 Research → Graph updates** | 1.5 weeks | Dev | Extract concepts + relationships, create nodes/edges |
| **2.5 Graph traversal UI** | 2 weeks | Dev+Designer | Search, filters, breadcrumb, relationship navigation |
| **2.6 Wiki auto-creation (optional)** | 1 week | Dev | "Save as wiki" button, auto-slug from concept |
| **2.7 Integration testing** | 1 week | QA | End-to-end: Build → Research → Graph growth |

### Success Criteria
- [ ] Completed Build auto-extracts 3-5 concepts
- [ ] User can review/curate concepts in sidebar
- [ ] Concepts appear as nodes in knowledge graph (within 1 min)
- [ ] Graph has 50+ new nodes from research (not seed data)
- [ ] User can search/traverse graph by clicking nodes
- [ ] Create 5+ wikis from research sessions

### Questions to Answer
- **Concept extraction confidence:** What threshold before auto-adding to graph? (0.8? 0.9?)
- **Relationship inference:** How do we infer edges? (NLP library, LLM, user-curated only?)
- **Graph limits:** At what node/edge count does SVG rendering degrade?
- **Merge strategy:** If two concepts are similar, how do users merge nodes?

### Post-Phase-2 Blockers Unblocked
- ✅ Research feeds into knowledge graph automatically
- ✅ Graph grows from real research (not just seed data)
- ✅ Users have visibility into what they've discovered
- ✅ Workspace ↔ Research ↔ Graph are now connected

---

## Phase 3: Humanities Specialization (Weeks 9-12)
### Goal: Reorient system for humanities scholarship

**Why third:** Only after publishing + integration work do you pivot to humanities. This isn't a blocker—it's a specialization.

### Deliverables

| Task | Effort | Owner | Notes |
|------|--------|-------|-------|
| **3.1 Remove quant skills** | 3 days | Dev | Delete 8 quant executors; remove `/quant` route |
| **3.2 Add humanities skills** | 2 weeks | Dev | 6 new skills (literary analysis, historical research, etc.) |
| **3.3 Reseed apps** | 1 week | Dev+Domain | Create 5-8 humanities-focused demo apps |
| **3.4 Reseed wikis** | 2 weeks | Dev+Domain | Humanities examples: classical texts, philosophers, movements |
| **3.5 Reseed knowledge graph** | 1 week | Dev+Domain | 100+ nodes (people, texts, concepts) + edges (influenced-by, cited-in, etc.) |
| **3.6 Domain model updates** | 1 week | Dev | Wiki banners, node categories, research filters for humanities |
| **3.7 Launch testing** | 1 week | QA+Domain | Full workflow on humanities content |

### Success Criteria
- [ ] All quant skills removed; no references remain
- [ ] 6 humanities skills functional (each tested with sample prompt)
- [ ] `/applications` shows only humanities-themed apps
- [ ] `/wikis` displays classical texts, philosophers, movements
- [ ] Knowledge graph seeded with classical humanities topics
- [ ] Deep Research filters work on humanities sources
- [ ] Workgroup can run end-to-end humanities research workflow

### Questions to Answer
- **Which humanities disciplines?** Philosophy, history, literary analysis, classics, theology? (Focus?)
- **Canonical texts:** Which texts to seed? (Augustine, Aristotle, Shakespeare, etc.?)
- **Skill definitions:** What does each skill do exactly? (Prompts, tools, outputs?)
- **Source prioritization:** Which Deep Research sources prioritize humanities? (JSTOR? Google Scholar?)

### Post-Phase-3 Blockers Unblocked
- ✅ System is humanities-native, not quant-first
- ✅ Workgroup can use it for actual humanities research
- ✅ Knowledge graph reflects your research domain

---

## Development Roadmap (Calendar View)

```
WEEK 1-3: PUBLISHING
├─ Export formats (HTML, React, MD, PDF)
├─ Deployment targets (Vercel, GitHub, Archive)
├─ LaunchOverlay "Publish" button
└─ Testing

WEEK 4-8: INTEGRATION
├─ Concept extraction (post-build LLM)
├─ Build → Research wiring
├─ Research → Graph updates
├─ Graph traversal UI
└─ Wiki auto-creation

WEEK 9-12: HUMANITIES SPECIALIZATION
├─ Remove quant, add humanities skills
├─ Reseed apps / wikis / knowledge graph
├─ Domain model updates
└─ Launch testing
```

---

## Effort Breakdown

| Phase | Dev Time | Design/UX | QA | Domain Expert | Total |
|-------|----------|-----------|-----|--------------|-------|
| Phase 1 (Publishing) | 4 weeks | 1 week | 2 days | — | ~5 weeks |
| Phase 2 (Integration) | 6 weeks | 2 weeks | 1 week | — | ~9 weeks |
| Phase 3 (Humanities) | 4 weeks | 1 week | 1 week | 2 weeks | ~8 weeks |
| **TOTAL** | **14 weeks** | **4 weeks** | **2.5 weeks** | **2 weeks** | **~22 dev-weeks** |

**With a 1-person team:** 22 weeks (~5.5 months)  
**With a 2-person team (Dev + Designer/Domain):** 12-14 weeks (~3 months)  
**With a 3-person team:** 8-10 weeks (~2 months)

---

## Critical Path (Must-Do for v7 MVP)

**Phase 1 (Publishing):** ✅ Critical
- Without publishing, research stays local and can't be shared/evaluated

**Phase 2 (Integration):** ✅ Critical
- Without integration, knowledge graph doesn't grow; system isn't cohesive

**Phase 3 (Humanities):** 🟡 Important but deferrable
- System works fine with current domain; specialization is optimization

**MVP definition:** Phases 1 + 2 = publishing + integration. Phase 3 is post-MVP polish.

---

## Resource Allocation Recommendation

Given <5-person workgroup and timeline constraints:

### Option A: Lean (1 Dev)
- Focus Phase 1 (publishing) first—4-5 weeks
- Pause after Phase 1, get team feedback
- Phase 2 (integration) next—6-9 weeks
- Phase 3 (humanities) last (post-v7 or slower)
- **Total to MVP:** ~10-15 weeks

### Option B: Sprint (1 Dev + 1 Designer)
- Phases 1 + 2 in parallel (publishing dev, integration design)
- Phase 3 post-launch (can be async)
- **Total to MVP:** ~10-12 weeks

### Option C: Full Throttle (2 Dev + 1 Designer + 1 Domain)
- All three phases in parallel
- Highest risk (context switching), fastest delivery
- **Total to MVP:** ~8-10 weeks

---

## Dependencies & Blockers

### External Dependencies
- **Anthropic API** (concept extraction, LLM synthesis) — already have key
- **Vercel API** (one-click deploy) — need OAuth app
- **GitHub API** (GitHub Pages deploy) — optional, lower priority
- **Postgres** (if scaling beyond SQLite) — optional for v7

### Internal Blockers
None identified. Schema is sound; builder works; wiki system works. This is **feature development, not architecture rework**.

---

## Milestones & Sign-Offs

### End of Phase 1 (Week 3)
- [ ] Publishing demo: build an app → publish → share public URL
- [ ] Team sign-off: "I can share my research outside localhost"

### End of Phase 2 (Week 8)
- [ ] Integration demo: build → extract concepts → graph grows
- [ ] Team sign-off: "The system feels cohesive"

### End of Phase 3 (Week 12)
- [ ] Humanities demo: humanities research workflow end-to-end
- [ ] Team sign-off: "This is ready for humanities research"

---

## Success Criteria for v7 Launch

| Criterion | Measurement |
|-----------|-------------|
| **Publishing works** | 5+ public URLs, users can access from browser |
| **Integration works** | 50+ new knowledge graph nodes from research (not seed) |
| **Humanities focus** | All quant routes removed; new skills functional |
| **Team confidence** | Workgroup agrees system is ready for research |
| **No critical bugs** | Zero P1 issues in final test phase |

---

## Post-v7 Opportunities (Future Backlog)

These are **valuable but not blocking v7 launch:**

- [ ] Full-text search over research corpus
- [ ] Relationship inference via NLP (auto-suggest edges)
- [ ] Academic citation export (BibTeX, CSL, etc.)
- [ ] Graph clustering & anomaly detection
- [ ] Multi-user collaboration (concurrent editing)
- [ ] Mobile-responsive UI
- [ ] Webhooks (export to Notion, Obsidian, etc.)
- [ ] Version diffing (compare wiki versions)
- [ ] Collaborative annotation layer

---

## Next Steps

1. **Finalize Architecture & SRS** (this week)
   - [ ] Team reviews ARCHITECTURAL_ASSESSMENT.md
   - [ ] Team reviews SRS_FRAMEWORK.md
   - [ ] Resolve open questions (concept confidence thresholds, deployment strategy, etc.)

2. **Sprint Planning** (start of Week 1)
   - [ ] Break Phase 1 tasks into 1-2 day sprints
   - [ ] Assign owners (dev, designer, domain expert)
   - [ ] Set up monitoring/logging for Phase 1

3. **Begin Phase 1: Publishing** (Week 1)
   - [ ] Start with export formats (lowest hanging fruit)
   - [ ] Get team feedback on UX early
   - [ ] Aim for Vercel integration by end of Week 2

---

## Questions for Your Workgroup

Before starting, align on:

1. **Domain focus:** Which humanities disciplines? (Philosophy, history, classics, lit crit?)
2. **Canonical texts:** Which texts/authors should seed the knowledge graph?
3. **Publication strategy:** Public URLs at `research.adaglobal.ai` or your own domain?
4. **Collaboration:** Single-user (solo research) or <5-user shared workspace?
5. **Timeline:** Can you dedicate a dev + designer for 3 months? Or slower pace?

Once aligned, Phase 1 can kick off immediately.
