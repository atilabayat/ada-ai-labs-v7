# CLAUDE.md — ADA AI Labs Platform

Project-scoped. Global owns environment (PowerShell/Windows), my identity, the
Karpathy working rules, the UI default (IBM Mission Control / Palantir),
conciseness, and the don'ts (no commit/push unless asked, no committed secrets).
Not repeated here.

## What this repo is

Mixed codebase: app code (JS/React/Vercel front ends, Python for quant/data)
plus document-/artifact-generation and research-knowledge pipelines for ADGA.
"Ship working code," "produce a correctly formatted deliverable," and "preserve
knowledge safely" are all first-class outputs.

## Skills to consult (don't reinvent their content)

- Prompt/agent/RAG design in this repo → consult the `prompt-engineering-guide`
  skill before writing prompts or harness logic. Don't hand-roll technique
  choices it already covers.
- Any quant rule, indicator, pattern, or options logic → `embedded-quant-sources`
  / IPA v3.0 (`docs/ipa-patterns-v3.0-full.csv`) is the authority, NOT general
  knowledge. Cite the source entity.
- Building/editing/maintaining a wiki or knowledge base → `wiki-builder` skill;
  its per-wiki `wiki.config.md` beats generic defaults.

## Imported standards (single source of truth, auto-loaded)

@docs/ADGA_Report_Guidelines.md
@docs/ipa-patterns-v3.0-full.csv

An imported file wins for its own domain — it is the versioned authority.
IPA v3.0 (the CSV above) supersedes v2.5; if they ever conflict, v3.0 wins.

## Reference library (in docs/, consult on demand — NOT auto-loaded)

Open the relevant file when a task needs it; do not work from general knowledge:

- `docs/indicators-100.md` — catalogue of 100 technical indicators by category.
- `docs/strategies-core-5.md` — 5 core TA strategies (entry / exit / stop rules).
- `docs/strategies-largecap-7.md` — 7 large-cap & ETF strategies + per-ticker tuning.
- `docs/options-playbook-v2.csv` — 22 options scenarios with goal, margin, Greeks.
- `docs/ipa-patterns-v2.5.md` — prior IPA compendium; SUPERSEDED by v3.0, kept for history.

To promote any of these to always-loaded, move it up into the imported-standards
block as an `@docs/...` line.

## Knowledge-base safety (HARD RULE — context: 23 wikis were lost)

- Wikis are Markdown trees under ~/dair-wikis/<slug>/ per the wiki-builder skill.
  Markdown is the source of truth. Do NOT convert wikis to JSON — JSON is only
  the backup *manifest*, never the content store.
- After any session that creates or materially edits a wiki, run the backup
  script and confirm it succeeded before considering the task done:
    powershell -File ./scripts/backup-wikis.ps1
  It zips each wiki to the Drive-synced folder and writes manifest.json
  (per-file SHA-256 catalog) so loss/corruption is detectable.
- Never delete, move, or bulk-rewrite wiki folders without an explicit confirmed
  backup snapshot existing first. If unsure a backup exists, stop and ask.
- Provenance is mandatory: new wiki facts need a sources.md entry (title,
  path/URL, date, contribution note). No unsourced claims promoted to facts.

## Code conventions (repo-specific only)

- Python: NumPy/Pandas-first; quant logic in pure, importable functions, not
  notebook-only cells. Testable without I/O.
- Browser artifacts (sandboxed iframes / Claude.ai artifacts): no localStorage —
  it throws a SecurityError. In-memory only in that context.
- Deployed app: use the zustand `persist` middleware (lib/store.ts) for user
  preferences (theme, selectedSkills, env). Do not add raw localStorage calls
  elsewhere — partialize controls what persists. Server data (appsMap, wikis,
  skills, nav) must come from Prisma, never localStorage.
- Anthropic API key server-side via the serverless proxy (api/claude.js).
  (Global forbids committed secrets; this is the how.)
- Deploy: GitHub → Vercel dashboard, ANTHROPIC_API_KEY as a Vercel env var.
- Market symbols: indices are ^SPX / ^XSP per ADA S/R notes (data code here
  breaks on this most, so restated).

## Document & artifact generation

- HTML → Drive: create_file with contentMimeType text/html and
  disableConversionToGoogleType True. Converting breaks styling/JS.
- Reports follow @docs/ADGA_Report_Guidelines.md. Most-often-broken rules:
  - Footer string verbatim, right-aligned page numbers.
  - Never "Confidential."
  - Inner-table colW arrays sum exactly to parent column width, or right column clips.
  - Flash Brief: landscape; header = ticker + week + tag ONLY (no name/title/firm).

## Working agreement (project-specific)

- Repo research infra, humanities tooling, quant skills and trading. If a request
  doesn't name the subsystem, ask — a change safe in one is often wrong elsewhere.
- Fix a recurring mistake by appending the rule here (or the imported doc),
  not just patching in place.

## Platform stability rules (hard-won — do not regress)

### 1 — Seed is non-destructive (upsert pattern)
All four seed functions (`seedApps`, `seedWikis`, `seedSkills`, `seedNav`,
`seedKnowledge`) must NEVER call `deleteMany({})` on the whole table.
- `seedApps` / `seedSkills` / `seedKnowledge`: upsert by `id`; `update` block
  refreshes only seed-managed metadata — never touches `html`, `markdown`, `env`,
  `sortOrder`, or `uses` (user-controlled fields).
- `seedWikis`: may delete only the exact slugs it owns (cascade child relations
  require it), but MUST snapshot `env` values before the wipe and restore them
  on re-insert: `env: envBySlug.get(slug) ?? "dev"`. User-created wikis (slugs
  not in seed data) are never touched.
- `seedNav`: upsert sections by `id`; match items by `(sectionId, route)` — only
  update label/icon/badge on existing items, never delete. User-added sidebar tabs
  (e.g. "System User Guides", "Dashboards") have routes not in SEED_NAV and must
  survive every seed run.
- **Root cause context**: a `deleteMany({})` in `seedApps()` wiped imported
  dashboards and the Peirce lattice artifact; `deleteMany({})` in `seedNav()`
  wiped user-added sidebar sections. Recovery required SQLite freelist forensics.

### 2 — Wiki pages: suppress Next.js static-path worker
Every `app/wikis/[slug]/page.tsx` (and any future DB-driven `[param]` route with
many large rows) MUST export both of these:

```ts
export const dynamic = "force-dynamic";
export async function generateStaticParams() { return []; }
```

`force-dynamic` alone is not enough — Next.js 14 dev mode still spawns a
jest-worker child process to enumerate static paths for `[slug]` segments.
With 27+ large wiki rows that worker OOMs, crashes twice, and poisons the shared
worker pool, cascading 500 errors to every wiki page. The empty
`generateStaticParams` short-circuits that worker pass entirely.

### 3 — Nav lives in Prisma, not a config file
The sidebar (`NavSection` + `NavItem` tables) is seeded from
`prisma/seed-data/nav.ts` but is also mutated at runtime by the user (adding
tabs, reordering, renaming). Treat it like user data:
- To rename a nav label: update `nav.ts` AND run a targeted
  `prisma.navItem.updateMany(...)` against the live DB — changing only the seed
  file leaves the running app stale until the next seed.
- Never infer nav structure from the file alone; query the DB for current state.
- The `getNav()` query in `lib/queries.ts` computes dynamic badge counts
  (live-app count, wiki count, skill count) at request time — badge values in
  `nav.ts` with `badgeText: null` are intentionally omitted there.

## Out of scope for this file

Morning Briefing and weekly SOP triggers are cross-project/interface-level —
keep in global or their own skill, not here.
