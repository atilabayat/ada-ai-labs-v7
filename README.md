# ADA AI Labs

**Alpha Data Architects — Research & Development Workspace**

A route-based Next.js codebase exported from the ADA AI Labs prototype. An institutional sandbox research workbench unifying prompt stacking, skill chaining, deep research, Karpathy-style wikis, a knowledge graph, a quant market floor, and a full application launch/deployment layer.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Prisma + SQLite** for data (apps, wikis, sub-relations); one-line switch to **Postgres**
- **Tailwind CSS** with design tokens mapped to CSS variables
- **Zustand** for client state (env, launch overlay, toasts, skill stack, hydrated app + wiki maps)
- **next/font** — Fraunces (display), IBM Plex Sans (body), JetBrains Mono (mono)

No external UI kit; all components are hand-built to preserve the institutional Bloomberg-style aesthetic.

---

## Getting started

```bash
npm install
npm run db:setup    # creates dev.db and seeds 8 apps + 6 wikis from prisma/seed-data
npm run dev
```

Then open <http://localhost:3000>. The root redirects to `/builder`.

Production build:

```bash
npm run build
npm start
```

### Database commands

| Command | What it does |
| --- | --- |
| `npm run db:push` | Push the Prisma schema to the DB (creates `prisma/dev.db` on first run) |
| `npm run db:seed` | Seed apps + wikis + skills + knowledge graph + nav from `prisma/seed-data/` (idempotent — wipes first) |
| `npm run db:setup` | `db:push` + `db:seed` in one step |
| `npm run db:studio` | Open Prisma Studio at <http://localhost:5555> to browse the DB |
| `npm run db:generate` | Regenerate the Prisma client (also runs automatically before `npm run build`) |

### Schema

All structural data lives in the database:

| Model | Holds |
| --- | --- |
| `App` | The 8 launchable apps with their env (`dev` / `staging` / `live`) |
| `Wiki` + `WikiSource` / `WikiToc` / `WikiCard` / `WikiPage` | The 6 wikis with TOC, sources, related cards, and version history |
| `Build` | Per-build orchestrator state — prompt, skill chain, status, streamed output, JSON transcript |
| `Skill` | The 28 composable skills shown in the picker and `/skills` |
| `KnowledgeNode` + `KnowledgeEdge` | The knowledge graph rendered on `/knowledge` — node-id-referenced edges, category-tagged nodes for legend derivation |
| `NavSection` + `NavItem` | The sidebar nav structure |

### Dynamic badges

Sidebar nav badges aren't hardcoded — they're **computed at query time** in
`getNav()` from live DB counts:

- `/applications` → `{n} LIVE` from apps where `env='live'`
- `/wikis` → `{n}` from total wiki count
- `/skills` → `{n}` from total skill count

Promote an app from `dev` to `live` and the **"5 LIVE"** badge becomes
**"6 LIVE"** on the next request — no code change. Same logic on the
`/knowledge` page where entity/edge counts come straight from the graph row
counts.

### Switching to Postgres

Open `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`, set `DATABASE_URL` in `.env` to your Postgres connection string, then re-run `npm run db:setup`. All column types in the schema are portable across both.

---

## Builder pipeline

Type a prompt, stack skills, hit **Build** (or **⌘↩**). The composer calls the
`createBuild` server action, gets back a build id, and writes it to the store as
`currentBuildId`. The `LiveBuildPanel` notices the change, opens an
`EventSource` against `/api/builds/[id]/stream`, and renders incoming events
in real time — one collapsible section per executed skill, then a final
"synthesis" section streamed from the LLM.

### Skill chaining

Each entry in the `selectedSkills` stack maps to a server-side executor in
`lib/skills/executors/`:

- The **eight quant skills** (`/tsla-putwall`, `/callwall-monitor`,
  `/gamma-exposure`, `/dealer-flow`, `/vix-regime`, `/ipa-compendium`,
  `/market-data`, `/morning-brief`) have real executors that emit
  Bloomberg-style markdown reports with the right structure for that
  domain — tables, GEX heatmaps, regime classification, pattern match against
  the IPA compendium. The current data is stubbed with realistic values; each
  executor body has an `INTEGRATION POINT` comment indicating where to drop in
  a Tradier / Polygon / CBOE pull to enable live data.
- **Every other skill** falls through to a default executor that emits a brief
  "applied" status and contributes a context note for the LLM step.

The orchestrator (`lib/skills/orchestrator.ts`) runs the skills sequentially,
collects each one's output, then hands all outputs + the original prompt to the
LLM step for synthesis. Each step's output is also added to the running
`ctx.prevSteps` so later skills can reference earlier ones.

### LLM synthesis — env-gated

`lib/skills/llm.ts`:

- **If `ANTHROPIC_API_KEY` is set** in `.env`, the orchestrator streams from
  the real Anthropic API using `@anthropic-ai/sdk`. The model is
  `claude-opus-4-6` by default; override with `ANTHROPIC_MODEL`. If the live
  call errors, the pipeline falls back to the stub with a note.
- **If unset**, the orchestrator uses a deterministic stub that produces a
  credible synthesis from the upstream skill outputs (no network call). This
  means the whole pipeline is runnable out of the box without any keys.

### Build persistence

Every build is a row in the `Build` table — prompt, skill ids (JSON), env,
status (`queued | streaming | done | failed | cancelled`), final concatenated
output, and a JSON transcript of per-step results. The "Your Builds" list on
`/builder` is rendered from `getRecentBuilds()` and auto-refreshes via
`router.refresh()` whenever the live panel closes.

Click any build card to reopen it in the live panel (replays the final state,
since the row already holds the persisted output).

---

## Routes

| Route | Module |
| --- | --- |
| `/builder` | AI Builder — prompt composer, skill chaining, suggested + saved builds |
| `/dashboard` | Workspace status, activity feed, build chart, system health |
| `/applications` | Application launcher — click any card to open the launch overlay |
| `/research` | Deep Research engine — source rail + research feed |
| `/wikis` | Wiki grid (Karpathy-style knowledge layer) |
| `/wikis/[slug]` | Wiki reader — 3-pane TOC + content + metadata, citations, cross-refs |
| `/knowledge` | Knowledge graph (interactive SVG) + index stats |
| `/quant` | Market floor — ticker setups, TSLA dealer positioning, quant modules |
| `/skills` | Skill library — tabbed, 28 composable skills |
| `/admin` | Administration — API keys, system health, audit trail, settings |

---

## Architecture

```
app/
  layout.tsx            Root layout: fonts + app shell (sidebar / topbar / statusbar)
                        + global LaunchOverlay + Toast
  page.tsx              Redirects to /builder
  globals.css           Design tokens, base styles, wiki-reader CSS
  <module>/page.tsx     One page per route
  wikis/[slug]/page.tsx Dynamic wiki reader (generateStaticParams over all wikis)

components/
  Sidebar / TopBar / StatusBar / EnvSwitch    App shell
  PromptComposer        Builder prompt box with skill picker (client)
  AppPreview            Per-app-type live preview renderers
  LaunchOverlay         Full-screen app launch view + deployment rail (client)
  Toast                 Global toast (driven by Zustand)
  ui.tsx                Shared page primitives (PageInner / PageHead / SecLabel / Panel)
  wiki/WikiReader       Wiki reader: scroll-spy, citation popovers, cross-wiki refs,
                        read/edit toggle, page nav (client)

lib/
  types.ts              Shared TypeScript types
  db.ts                 Prisma client singleton (HMR-safe)
  queries.ts            Server-only query layer (cached via React cache())
                        getAllApps, getApp, getAppsMap, getAllWikiCards,
                        getAllWikiSlugs, getWiki, getWikiSlugMap, getWikiTitlesMap,
                        promoteAppDb
  actions.ts            Server actions ("use server"): promoteApp() writes to DB
                        and revalidates /applications
  store.ts              Zustand workspace store (env, launch overlay, toasts,
                        skill stack, hydrated app + wiki maps)
  data/
    nav.ts              Sidebar nav + route metadata (static config)
    skills.ts           28 skills + tab definitions (still static for now)
    apps.ts             Static config only: ENV_ORDER, ENV_LABELS, ICON_COLORS
    wikis.ts            Static config only: BANNER_GRADIENTS, re-exported WikiCard

prisma/
  schema.prisma         Prisma schema — App + Wiki (+ WikiSource, WikiRelated,
                        WikiTocItem, WikiPage cascade-deleted relations)
  seed.ts               Idempotent seed: wipe + reinsert from seed-data
  seed-data/
    apps.ts             SEED_APPS — the 8 launchable apps
    wikis.ts            SEED_WIKIS + SEED_WIKI_CARDS — 6 wikis with full HTML
    skills.ts           SEED_SKILLS — the 28 composable skills
    knowledge.ts        SEED_KNOWLEDGE_NODES + EDGES — graph topology
    nav.ts              SEED_NAV — sidebar structure (dynamic-badge markers)
  dev.db                SQLite database file (created by db:push, gitignored)
```

### Data flow

The database is the source of truth. On every request the root layout
(`app/layout.tsx`, async server component) awaits five queries in parallel —
`getAppsMap()`, `getWikiSlugMap()`, `getWikiTitlesMap()`, `getAllSkills()`,
`getNav()` — and hands them down two paths:

1. **As props for SSR-critical components.** `Sidebar` receives `nav` directly
   so the initial HTML contains the full nav structure including computed
   badges (`"5 LIVE"`, `"6"`, `"28"`) — no flash-of-empty-sidebar on first
   paint.
2. **Through `<DataProvider>` into the Zustand store**, for client-side
   interactions (CommandPalette ⌘K, the composer's skill picker, etc.). The
   provider synchronously hydrates on first render via `useRef`, but for
   components that need data in the initial paint, props are still the
   primary channel.

Server components read from the query layer directly:

- `app/applications/page.tsx` → `getAllApps()` → passes apps to `ApplicationsGrid`
- `app/wikis/page.tsx` → `getAllWikiCards()`
- `app/wikis/[slug]/page.tsx` → `getWiki(slug)` + `getWikiSlugMap()` →
  passes both to `WikiReader`; `generateStaticParams` uses `getAllWikiSlugs()`
- `app/knowledge/page.tsx` → `getKnowledgeGraph()` → renders SVG inline (server-rendered)
- `app/skills/page.tsx` → `getAllSkills()` + `getSkillTabs()` → passes to client `SkillsList` for tab state
- `app/builder/page.tsx` → `getRecentBuilds(8)` for the "Your Builds" panel

### State

`lib/store.ts` exposes `useWorkspace`:

- **Server-hydrated data**: `appsMap`, `wikiSlugMap`, `wikiTitlesMap`, `skills`, `nav`, plus `hydrate()` and optimistic `setAppEnv()`
- `env` / `setEnv` — active workspace environment (dev / staging / live)
- `launchedAppId` / `openLaunch` / `closeLaunch` — app launch overlay
- `paletteOpen` / `setPaletteOpen` / `togglePalette` — ⌘K command palette
- `currentBuildId` / `setCurrentBuild` — active build for `LiveBuildPanel`
- `toast` / `showToast` — transient notifications
- `selectedSkills` / `toggleSkill` / `removeSkill` — builder skill stack

### Application launch

`/applications` cards call `openLaunch(id)`. `LaunchOverlay` (mounted globally in
the root layout) reads the launched app from `appsMap` in the store, then
renders a full-screen embedded preview with a deployment rail: promotion
pipeline (Development → Staging → Production), runtime metrics, animated build
log, and controls. Clicking **Promote →** does the optimistic UI flip, calls
the `promoteApp` server action which updates the DB and `revalidatePath`s
`/applications`, and rolls back the optimistic state if the server rejects.

### Wiki reader

`/wikis/[slug]` renders `WikiReader` with the wiki's HTML content + the slug
map. After mount it:

- builds scroll-spy over `h2[id]` headings to drive the TOC active state
- converts inline `[1]`-style refs into hover citation popovers (with jump-to-source)
- converts inline `[Wiki Name]` refs into cross-wiki links that route between wikis
- wires source-click → jump to first inline citation
- toggles `contenteditable` prose in Edit mode

---

## Notes

- Design tokens live as CSS variables in `app/globals.css` and are mirrored into
  `tailwind.config.ts` (`bg-*`, `ink-*`, `accent-*`, `font-*`).
- Wiki body content is stored as HTML strings (`Wiki.content` column) and rendered
  with `dangerouslySetInnerHTML`; this content is first-party (authored in
  `prisma/seed-data/wikis.ts`), not user input.
- Skills (`lib/data/skills.ts`) and the knowledge graph are still static. Move
  them to the DB next by following the same pattern: add a Prisma model, port
  the data into `prisma/seed-data/`, add query functions to `lib/queries.ts`.
