# System Requirements Specification (SRS) Framework
## ADA AI Labs v7 — Humanities-Focused Research Portal

**Document Status:** Framework (to be detailed)  
**Target Audience:** Development team + user workgroup (<5 users)  
**Scope:** v7 launch with publishing, integration, humanities specialization  
**Timeline:** Phase 1 (publishing) → Phase 2 (integration) → Phase 3 (humanities)

---

## 1. Overview & Vision

### 1.1 Purpose
ADA AI Labs v7 is an **institutional research sandbox** for humanities scholars and research analysts. It unifies:
- **Workspace (Builder):** Prompt stacking + skill chaining for research synthesis
- **Research Facility:** Deep research engine for structured inquiry
- **Knowledge Graph:** Conceptual visualization of ideas, texts, and relationships
- **Publishing:** Export and deploy research apps publicly

Together, these form a **research portal** that is both an **execution environment** (run research) and a **knowledge repository** (grow understanding).

### 1.2 Key Thesis
- Users shouldn't have to leave the system to publish insights
- Research results should automatically feed the knowledge graph
- The graph should be a "second brain" — navigable, explorable, growing

### 1.3 User Model
- **Primary:** Humanities scholars, intellectual historians, research analysts
- **Workgroup size:** <5 users (not multi-tenant, single-org)
- **Use cases:**
  - Write a structured research note on a topic (Workspace)
  - Run Deep Research on texts, concepts, people (Research Facility)
  - Discover connections via knowledge graph (Knowledge Graph)
  - Publish research apps/dashboards/artifacts (Publishing)

---

## 2. Functional Requirements

### 2.1 Publishing (Phase 1: Critical Path)

#### 2.1.1 Export Formats
**Requirement:** Apps must export to multiple formats

| Format | Use Case | Output |
|--------|----------|--------|
| **Standalone HTML** | Email, archive, legacy system | Self-contained .html file |
| **React Component** | Embed in Next.js site | `.tsx` with props interface |
| **Markdown** | Documentation, archive | `.md` with metadata frontmatter |
| **PDF** | Print, citation | Styled `.pdf` via headless browser |

**Spec details:**
- Standalone HTML: inline all CSS + JS, no external dependencies
- React component: export as TSX, include prop types, handle data injection
- Markdown: preserve heading hierarchy, citations, cross-wiki refs
- PDF: use Puppeteer or similar, template matching the LaunchOverlay render

#### 2.1.2 Deployment Targets
**Requirement:** Support multiple deployment destinations

| Target | Scope | Responsibility |
|--------|-------|-----------------|
| **Vercel** | Built-in; one-click deploy | Claude (via Vercel API) |
| **GitHub Pages** | Git-based; push to `gh-pages` | Claude (via GitHub API) |
| **Self-Hosted** | User's infrastructure | User (download + host) |
| **Archive** | Local .zip, date-stamped | Claude (one-click download) |

**Spec details:**
- Vercel: Create project, link to repo, deploy via CLI (one-click from LaunchOverlay)
- GitHub: Fork/push to `username.github.io`, enable Pages (instructions + one-click)
- Self-hosted: Download all assets in .zip, user deploys
- Archive: Auto-generated timestamp (e.g., `my-app_2026-06-09.zip`)

#### 2.1.3 Versioning & Promotion
**Requirement:** Track app versions through dev → staging → live → published

```
Development (in-progress)
  → Staging (reviewed, ready to ship)
  → Live (deployed, internal use)
  → Published (public, archived, versioned)
```

**Spec details:**
- Existing env system (dev/staging/live) stays
- New "published" state: immutable snapshot + public URL + version number
- Published artifacts stored separately (PublishedApp table)
- Each publication gets: timestamp, semver tag, changelog entry, public slug

#### 2.1.4 Database Schema Additions
**New models:**
```prisma
model PublishedApp {
  id            String    @id              // UUID
  appId         String                     // FK to App (the source)
  version       String                     // semver: 1.0.0
  publishedAt   DateTime  @default(now())
  publicSlug    String    @unique          // URL-safe: my-app-v1-0-0
  publicUrl     String                     // https://research.adaglobal.ai/apps/my-app-v1-0-0
  
  title         String
  description   String
  banner        String                     // research | humanities | quant | etc.
  
  html          String                     // exported standalone HTML
  markdown      String?                    // optional markdown export
  
  deployments   Deployment[]               // history of deploys to Vercel, Pages, etc.
  changelog     String                     // markdown: what changed vs prior version
  tags          String                     // JSON: ["literary-analysis", "history", ...]
  
  visibility    String    @default("private")  // private | shared | public
  downloads     Int       @default(0)
  views         Int       @default(0)
  
  @@index([appId])
  @@index([publicSlug])
}

model Deployment {
  id            Int       @id @default(autoincrement())
  published     PublishedApp @relation(fields: [publishedAppId], references: [id])
  publishedAppId String
  
  target        String                     // vercel | github | self-hosted | archive
  status        String                     // pending | deployed | failed
  url           String?                    // vercel.com/..., github.io/..., etc.
  log           String?                    // JSON deployment log
  
  deployedAt    DateTime  @default(now())
}
```

#### 2.1.5 LaunchOverlay Enhancement
**Current:** Dev → Staging → Live promotion only

**New workflow:**
1. App is in "Live" state (existing)
2. Click **Publish** button (new)
3. Dialog: version number, description, tags, visibility
4. System creates PublishedApp record + public slug
5. Dialog: deploy to (Vercel | GitHub | Archive)
6. One-click deploy to chosen target
7. Confirmation: public URL + archive link

---

### 2.2 Workspace ↔ Research Integration (Phase 2)

#### 2.2.1 Build Output Analysis
**Requirement:** Extract concepts, insights, and sources from completed builds

**Triggers:**
- When a Build reaches status `done`, run post-processing pipeline
- Extract: key concepts, entities, cited sources, insights

**Pipeline:**
```
Build completed
  → LLM extracts: concepts[], entities[], sources[], insights[]
  → (minimal call, can re-use existing API quota)
  → Store in Build.metadata field (new)
  → Display in "Build Insights" sidebar section
```

**New Build field:**
```prisma
model Build {
  // ... existing fields ...
  
  // Post-processing results (set on completion)
  conceptsExtracted String    @default("[]")  // JSON: {id, label, category}[]
  entitiesExtracted  String    @default("[]")  // JSON: {name, type, context}[]
  sourcesExtracted   String    @default("[]")  // JSON: {url, title, citedIn}[]
  
  linkedToResearch   String?                   // FK to ResearchSession (manual link)
  linkedToWiki       String?                   // FK to Wiki (auto-created or manual)
}
```

#### 2.2.2 Research Session Integration
**Requirement:** Builds feed into Deep Research; Research feeds into Knowledge Graph

**Workflow:**
1. **Build → Research:** 
   - User clicks "→ Research" button on a Build
   - Creates ResearchSession with Build's topic + extracted concepts as input
   - Pre-populated with Build's output as first source

2. **Research → Knowledge Graph:**
   - When ResearchSession completes, extract new concepts + relationships
   - Create KnowledgeNode for each new concept
   - Create KnowledgeEdge for each relationship (fromId → toId)
   - Link back to source (research session ID)

3. **Research → Wiki (optional):**
   - If research result is research-worthy (user flag), auto-create Wiki
   - Wiki slug = concept name (slugified)
   - Wiki content = formatted research results
   - Wiki sources = research sources

**New ResearchSession fields:**
```prisma
model ResearchSession {
  // ... existing fields ...
  
  sourceBuilds      String?                   // JSON: buildId[]
  conceptsIdentified String @default("[]")   // JSON: concept{}[]
  nodesCreated      String?                   // JSON: nodeId[]
  
  wikiCreated       String?                   // FK to Wiki (if promoted)
}
```

#### 2.2.3 Concept Extraction & Curation
**Requirement:** Concepts are either auto-extracted or manually curated

**Auto-extraction:**
- Post-build LLM call identifies concepts (3-5 max, high confidence)
- Creates draft KnowledgeNode entries (marked `draft: true`)
- User must review before nodes go live

**Manual curation:**
- User can add/edit concepts in Build Insights panel
- Right-click concept → "Add to Knowledge Graph"
- Or drag concept into graph visualization (future UI)

---

### 2.3 Knowledge Graph as Second Brain (Phase 2+)

#### 2.3.1 Graph Updates from Research
**Requirement:** Knowledge graph grows automatically as research is conducted

**Update triggers:**
1. Build completion → extract concepts
2. Research session completion → extract concepts + relationships
3. Wiki creation → add node for topic + link to related wikis

**Node lifecycle:**
```
Draft (auto-extracted)
  → Reviewed by user
  → Active (in graph)
  → Optionally merged with existing node
  → Can be curated (description, color, category)
```

**Edge lifecycle:**
```
Inferred (from research context)
  → Confidence score 0-1
  → User can curate (accept, reject, edit label)
  → Label: "cited-in", "related-to", "influenced-by", etc.
```

#### 2.3.2 Query & Traversal UI
**Requirement:** Users can explore graph via concept search + relationship traversal

**New `/knowledge` features:**
1. **Search:** Find node by label, category, or tag
2. **Traversal:** Click node → see incoming/outgoing edges + neighbors
3. **Filter:** Show only nodes in category (Research, Humanities, People, Texts, etc.)
4. **Breadcrumb:** Show path from selected node back to root (via SHORTEST_PATH)
5. **Related:** Click concept → show all research sessions that mention it

**UX flow:**
```
User lands on /knowledge
  → Graph displayed (server-rendered SVG)
  → Search bar: "Augustine"
  → Filters to nodes matching "Augustine"
  → User clicks node
  → Sidebar: node metadata + incoming/outgoing edges
  → Click edge → jump to related node
  → Breadcrumb shows path
```

#### 2.3.3 Database Schema Additions
```prisma
model KnowledgeNode {
  // ... existing fields ...
  
  sourceResearch   String?                   // FK to ResearchSession (where it originated)
  sourceWiki       String?                   // FK to Wiki (if wiki-based)
  sourceBuilds     String?                   // JSON: buildId[]
  
  description      String?                   // curated text about concept
  draft            Boolean    @default(false)
  confidence       Float      @default(1.0) // 0-1 score if auto-inferred
  
  tags             String     @default("[]") // JSON: string[]
}

model KnowledgeEdge {
  // ... existing fields ...
  
  label            String?                   // "cited-in", "influenced-by", "related-to"
  confidence       Float      @default(1.0) // 0-1 score if inferred
  sourceResearch   String?                   // FK to ResearchSession
  
  inferred         Boolean    @default(false)
}
```

---

### 2.4 Humanities Domain Specialization (Phase 3)

#### 2.4.1 Skill Reorientation
**Remove:** All 8 quant skills (TSLA putwall, gamma exposure, etc.)  
**Add:** Humanities-focused skills
```
/literary-analysis     — analyze text, style, themes
/historical-research   — find primary sources, dates, events
/philosophical-inquiry — trace arguments, concepts, thinkers
/textual-criticism     — compare editions, interpret variants
/biographical-research — people, context, archives
/concept-genealogy     — trace history of an idea
```

**Keep:** Universal skills (NotebookLM, web research, document analysis, design)

#### 2.4.2 Routes & Data
**Remove:** `/quant` (market floor)  
**Keep:** `/builder`, `/research`, `/wikis`, `/knowledge`, `/skills`, `/dashboard`  
**Update seed data:** Apps, wikis, examples → humanities focus

#### 2.4.3 Content Model for Humanities
**Wiki banners:** `research | philosophy | classical | history` (instead of `quant`)  
**Concept categories:** `Person | Text | Movement | Concept | Theory | Debate`  
**Deep Research filters:** By author, time period, discipline, text type

---

## 3. Non-Functional Requirements

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| **Performance** | <3s load, <1s interaction | Research workflow requires responsiveness |
| **Reliability** | 99.5% uptime | Research portal (not trading system) |
| **Scalability** | <5 users (MVP) → 50+ (future) | Current workgroup small; schema supports growth |
| **Privacy** | Single-org, no multi-tenant | Users control their own research data |
| **Auditability** | Build/research logs persisted | Transparency for scholarship |

---

## 4. Acceptance Criteria by Phase

### Phase 1: Publishing (Weeks 1-3)
- [ ] App export to standalone HTML, React component, Markdown
- [ ] One-click deploy to Vercel (OAuth flow)
- [ ] Archive download (.zip)
- [ ] PublishedApp table + public URL scheme
- [ ] LaunchOverlay "Publish" button wired up
- [ ] Versioning & semver tracking

### Phase 2: Integration (Weeks 4-8)
- [ ] Build completion triggers concept extraction
- [ ] ResearchSession linked to source Builds
- [ ] Concepts auto-populate Knowledge Graph
- [ ] Build Insights sidebar shows extracted concepts
- [ ] Knowledge graph grows from research (100+ new nodes/edges)

### Phase 3: Humanities (Weeks 9-12)
- [ ] Quant skills removed, 6 humanities skills added
- [ ] `/quant` route removed
- [ ] Wikis reseeded with humanities examples
- [ ] Apps reseeded (no market-themed)
- [ ] Knowledge graph pre-populated with classical texts/thinkers
- [ ] Deep Research filters for humanities sources

---

## 5. Open Questions (To Be Resolved)

1. **Concept extraction method:** Use LLM, NLP library, or manual curation only?
   - **Current plan:** LLM (reuse existing quota, high quality)

2. **Relationship inference:** Auto-infer edges from research, or curator-only?
   - **Current plan:** Auto-infer with confidence scores, user can curate

3. **Wiki creation from research:** Auto or user-initiated?
   - **Current plan:** User-initiated ("save as wiki" button)

4. **Public URL strategy:** Published apps at `research.adaglobal.ai/apps/slug` or user domain?
   - **Current plan:** Subdomain, but support custom domains via Vercel env

5. **Graph visualization limits:** How many nodes/edges before performance degrades?
   - **Current plan:** Benchmark SVG at 1000+ nodes; if needed, partition by category

---

## 6. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Apps published** | 5+ per user per month | Count PublishedApp rows |
| **Research sessions** | 3+ per week | Count ResearchSession rows |
| **Knowledge graph growth** | 50+ new nodes/month | Node creation rate |
| **Cross-wiki links** | 2+ per wiki | WikiRelated reference count |
| **Time to insight** | <5min build → concept extraction | Monitor Build.completedAt → concept creation |

---

## 7. Dependencies & Risks

### Critical Dependencies
- **Anthropic API:** LLM for concept extraction, synthesis
- **Vercel API:** One-click deployment
- **GitHub API:** GitHub Pages deployment

### Risks
| Risk | Mitigation |
|------|-----------|
| Concept extraction hallucination | User review before graph update |
| Graph visualization performance | Category-based partitioning, lazy rendering |
| Multi-user conflicts | Not in scope (single-org, <5 users) |

---

## 8. Out of Scope (v7)

- Multi-user collaboration (concurrent editing)
- Full-text search over research corpus
- Relationship inference via NLP (user curates)
- Academic citation export (BibTeX, etc.)
- Graph machine learning (clustering, anomaly detection)
- Mobile app
