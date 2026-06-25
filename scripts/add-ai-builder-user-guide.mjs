/**
 * Adds the "AI Builder: Prompt Composer & Orchestrator User Guide" to the
 * System User Guides area (/wikis?section=system). banner="system".
 *
 * Scope: AI Builder functionality only — the Prompt Composer, the skill stack,
 * the Orchestrator chain, the ⌘K commands navigator on the taskbar, Suggested /
 * Your Builds, source-grounding via NotebookLM, and a spectrum of example
 * builds from the simplest research command to advanced orchestration.
 *
 * Accurate to the deployed /builder page, components/PromptComposer.tsx,
 * components/CommandPalette.tsx, components/StatusBar.tsx, and
 * lib/skills/orchestrator.ts (sequential skill chain + final LLM synthesis).
 *
 * Run: node scripts/add-ai-builder-user-guide.mjs   (safe to re-run)
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SLUG = "ai-builder-prompt-composer-orchestrator-guide";

const SOURCES = [
  { title: "ADA AI Labs",     meta: "Orchestrator & skill-chain engine", sortOrder: 0 },
  { title: "Prompt Composer", meta: "/builder research workbench",        sortOrder: 1 },
  { title: "Skill Library",   meta: "28 skills across 4 groups",          sortOrder: 2 },
];

const TOC = [
  { anchorId: "overview",    name: "Overview",                      sub: false, sortOrder: 0 },
  { anchorId: "navigation",  name: "Getting to the Builder",        sub: false, sortOrder: 1 },
  { anchorId: "composer",    name: "The Prompt Composer",           sub: false, sortOrder: 2 },
  { anchorId: "stack",       name: "The Skill Stack",               sub: false, sortOrder: 3 },
  { anchorId: "orchestrator",name: "How the Orchestrator Runs",     sub: false, sortOrder: 4 },
  { anchorId: "navigator",   name: "The Commands Navigator (⌘K)",   sub: false, sortOrder: 5 },
  { anchorId: "spectrum",    name: "A Spectrum of Builds to Try",   sub: false, sortOrder: 6 },
  { anchorId: "level-1",     name: "Level 1 — A Single Command",    sub: true,  sortOrder: 7 },
  { anchorId: "level-2",     name: "Level 2 — One Focused Skill",   sub: true,  sortOrder: 8 },
  { anchorId: "level-3",     name: "Level 3 — A Two-Skill Chain",   sub: true,  sortOrder: 9 },
  { anchorId: "level-4",     name: "Level 4 — Chain to a Wiki",     sub: true,  sortOrder: 10 },
  { anchorId: "level-5",     name: "Level 5 — Full Orchestration",  sub: true,  sortOrder: 11 },
  { anchorId: "grounding",   name: "Grounding in Your Sources",     sub: false, sortOrder: 12 },
  { anchorId: "builds",      name: "Suggested & Your Builds",       sub: false, sortOrder: 13 },
  { anchorId: "catalog",     name: "The Skill Catalog",             sub: false, sortOrder: 14 },
  { anchorId: "tips",        name: "Tips & Best Practice",          sub: false, sortOrder: 15 },
];

const RELATED = [
  { name: "Options Flow User Guide",            ic: "Activity",  sortOrder: 0 },
  { name: "Gamma Exposure Heatmaps User Guide", ic: "Grid",      sortOrder: 1 },
  { name: "Deep Research Sessions Guide",       ic: "Search",    sortOrder: 2 },
];

const PAGELIST = [
  { pageId: "main", name: "AI Builder · Composer & Orchestrator", current: true, sortOrder: 0 },
];

// HTML body. System-guide conventions; no backticks and no "$"+"{" sequences.
const CONTENT = `<div class="wiki-banner-hero" data-c="research"></div>
<div class="wiki-crumb">
  <span>Workspace</span><span class="sep">/</span>
  <span>Wikis</span><span class="sep">/</span>
  <span class="ent">AI Builder</span>
</div>
<h1 class="wiki-h1">AI Builder: Prompt Composer &amp; Orchestrator <em>User Guide.</em></h1>
<div class="wiki-lede">The AI Builder is the compose-once surface of the ADA AI Labs Workspace. Write a prompt, stack one or more skills, and the Orchestrator runs them as a chain &mdash; ending in a synthesised result you can read, reopen, or publish as a wiki. This guide is the first source for what the Builder can do, from a one-line research command to a fully orchestrated dashboard.</div>
<div class="wiki-meta-row"><span class="mr"><span class="v">June 2026</span></span><span class="mr"><span class="v">v1.0</span></span><span class="mr"><span class="v">Internal</span></span></div>

<nav class="toc-rail">
  <a class="toc" href="#overview">Overview</a>
  <a class="toc" href="#navigation">Getting to the Builder</a>
  <a class="toc" href="#composer">The Prompt Composer</a>
  <a class="toc" href="#stack">The Skill Stack</a>
  <a class="toc" href="#orchestrator">How the Orchestrator Runs</a>
  <a class="toc" href="#navigator">The Commands Navigator</a>
  <a class="toc" href="#spectrum">A Spectrum of Builds to Try</a>
  <a class="toc" href="#grounding">Grounding in Your Sources</a>
  <a class="toc" href="#builds">Suggested &amp; Your Builds</a>
  <a class="toc" href="#catalog">The Skill Catalog</a>
  <a class="toc" href="#tips">Tips &amp; Best Practice</a>
</nav>

<h2 id="overview">Overview</h2>
<p>Everything in the Workspace &mdash; research reports, quant dashboards, wikis, course material, briefings &mdash; can begin in one place: the <strong>AI Builder</strong>. You describe what you want in plain language, optionally attach <em>skills</em> that give the system specialised capabilities, and submit. The <strong>Orchestrator</strong> executes your skills in order, feeds each step's output into the next, and finishes with a synthesis pass that ties the whole chain together.</p>
<div class="callout insight">
  <p><strong>The mental model:</strong> a build is <strong>one prompt + an ordered stack of skills</strong>. With zero skills you get a direct answer. With a stack, you get a pipeline &mdash; research feeds a review, which feeds a wiki, and so on. The same composer scales from a quick lookup to a multi-stage portal.</p>
</div>

<h2 id="navigation">Getting to the Builder</h2>
<ol>
  <li>Open <strong>Workspace &rarr; AI Builder</strong> from the sidebar, or navigate to <a class="ref" href="/builder">/builder</a>.</li>
  <li>You will land on the <strong>Prompt Composer</strong> with <strong>Suggested Builds</strong> beneath it and <strong>Your Builds</strong> (recent history) below that.</li>
  <li>Type a prompt, add skills if you want them, and press <strong>Build</strong> (or <strong>&#8984;&#8617;</strong> / <strong>Ctrl+Enter</strong>).</li>
</ol>

<h2 id="composer">The Prompt Composer</h2>
<p>The composer is the boxed input at the top of the page, labelled <strong>&#9656; Prompt Composer</strong>. Its parts:</p>
<div class="wiki-table-wrap"><table class="wiki-table">
  <thead><tr><th>Element</th><th>What it does</th></tr></thead>
  <tbody>
    <tr><td>Prompt textarea</td><td>Where you describe the build in natural language. Stack several instructions across multiple lines if you want a richer brief.</td></tr>
    <tr><td>Live counter</td><td>Top-right readout: lines, characters, and <strong>stack N/10</strong> &mdash; how many skills are attached (maximum 10).</td></tr>
    <tr><td>Skill chips + the "+" button</td><td>Each attached skill shows as a chip joined by "+". The dashed "+" opens the skill picker; "×" on a chip removes it; "clear" empties the stack.</td></tr>
    <tr><td>Build button</td><td>Submits the build. Shows <strong>Build</strong> normally, <strong>Rebuild</strong> once a build is active, and <strong>Queuing</strong> while it spins up. Shortcut: <strong>&#8984;&#8617;</strong>.</td></tr>
  </tbody>
</table></div>
<div class="callout"><strong>Skill picker:</strong> click "+" to open a searchable list grouped by Research, Quant, Development, Knowledge, and Embedded KB. Type to filter; click to toggle a skill in or out of the stack.</div>

<h2 id="stack">The Skill Stack</h2>
<p>Skills are the verbs of the Builder. A bare prompt with no skills returns a direct synthesised answer. Add skills and you compose a pipeline: <strong>order matters</strong>, because each skill can see the output of the ones before it. A natural chain reads left to right &mdash; gather, then analyse, then format.</p>
<ul>
  <li><strong>Research skills</strong> gather and cite material (<em>/deep-research, /web-search, /academic-search, /sec-filings</em>).</li>
  <li><strong>Quant skills</strong> pull and interpret market structure (<em>/tsla-putwall, /gamma-exposure, /vix-regime, /market-data</em>).</li>
  <li><strong>Knowledge skills</strong> shape output into durable artifacts (<em>/wiki-builder, /lesson-generator, /knowledge-graph</em>).</li>
  <li><strong>Development skills</strong> render deliverables (<em>/dashboard-builder, /frontend-design, /pdf-builder</em>).</li>
</ul>

<h2 id="orchestrator">How the Orchestrator Runs</h2>
<p>When you submit, the Orchestrator takes over. You can watch it work in the <strong>live build panel</strong> that appears beneath the composer, and the bottom taskbar's <strong>orchestrator:</strong> indicator switches from <em>idle</em> to active.</p>
<ol>
  <li><strong>Queue.</strong> The build is created and queued; a toast confirms the build id and skill count.</li>
  <li><strong>Skill chain.</strong> Each skill runs <em>in the order you stacked it</em>, streaming tokens live. Every step's output is captured and passed to the next skill as context.</li>
  <li><strong>Synthesis.</strong> After the last skill, a final language-model pass synthesises all step outputs into one coherent result.</li>
  <li><strong>Persist.</strong> The final output and a per-step transcript are saved, and the result is embedded into the semantic index so it is searchable later.</li>
</ol>
<div class="callout insight"><p><strong>Resilient by design:</strong> if one skill errors, the Orchestrator records the failure, notes it inline, and <strong>continues with the remaining skills</strong> rather than aborting the whole build. Reopening a finished build <em>replays</em> its saved transcript &mdash; it does not re-run or re-bill the chain.</p></div>

<h2 id="navigator">The Commands Navigator (⌘K)</h2>
<p>The fastest way around the Workspace &mdash; and the fastest way to load skills into a build &mdash; is the <strong>commands navigator</strong>. Open it from the <strong>"⌘K commands" button on the bottom taskbar</strong> (the status bar), or press <strong>&#8984;K</strong> / <strong>Ctrl+K</strong> anywhere.</p>
<p>It is a single fuzzy search across four kinds of target:</p>
<div class="wiki-table-wrap"><table class="wiki-table">
  <thead><tr><th>Result type</th><th>What selecting it does</th></tr></thead>
  <tbody>
    <tr><td>Pages</td><td>Jumps straight to a workspace page (Builder, Dashboard, Wikis, Market Floor, and so on).</td></tr>
    <tr><td>Applications</td><td>Launches a standalone app.</td></tr>
    <tr><td>Wikis</td><td>Opens that wiki in the reader.</td></tr>
    <tr><td>Skills</td><td><strong>Adds the skill to your build stack and drops you on the Builder</strong> &mdash; the quickest way to assemble a chain without opening the picker.</td></tr>
  </tbody>
</table></div>
<div class="callout"><strong>Try it:</strong> press <strong>&#8984;K</strong>, type <em>gamma</em>, and pick <em>/gamma-exposure</em> from the Skills group. You will land in the Builder with that skill already stacked, ready for a prompt. Navigate the list with &#8593;&#8595; and select with &#8617;.</div>

<h2 id="spectrum">A Spectrum of Builds to Try</h2>
<p>The Builder is the same tool whether you want a one-line answer or a multi-stage deliverable. The five levels below climb from the simplest research command to full orchestration. Type the prompt, stack the listed skills (use <strong>&#8984;K</strong> or the "+" picker), and press <strong>Build</strong>.</p>
<div class="wiki-table-wrap"><table class="wiki-table">
  <thead><tr><th>Level</th><th>Prompt</th><th>Skill stack</th><th>Result</th></tr></thead>
  <tbody>
    <tr><td>1 · Single command</td><td>"Provide the news for today"</td><td>/web-search</td><td>A ranked, cited news brief</td></tr>
    <tr><td>2 · One focused skill</td><td>"Analyze VIX now and forecast Monday"</td><td>/vix-regime</td><td>A regime read with a directional view</td></tr>
    <tr><td>3 · Two-skill chain</td><td>"Build me a mini course on dark matter"</td><td>/deep-research + /lesson-generator</td><td>A lesson plan grounded in fresh research</td></tr>
    <tr><td>4 · Chain to a wiki</td><td>"Academic review: Peircean semiotics &amp; lattice theory"</td><td>/deep-research + /literature-review + /wiki-builder</td><td>A published, cited research wiki</td></tr>
    <tr><td>5 · Full orchestration</td><td>"TSLA dealer positioning dashboard with put/call walls"</td><td>/tsla-putwall + /gamma-exposure + /vix-regime + /dashboard-builder</td><td>A live quant dashboard</td></tr>
  </tbody>
</table></div>

<h3 id="level-1">Level 1 — A Single Command</h3>
<p>Start with the simplest possible build: a plain question and a single research skill. Prompt <strong>"Provide the news for today"</strong> with <strong>/web-search</strong> attached. The Orchestrator runs one skill and synthesises a ranked, cited brief. With no skill at all, the same prompt still returns a direct answer &mdash; the skill simply makes it current and sourced.</p>

<h3 id="level-2">Level 2 — One Focused Skill</h3>
<p>Swap the general skill for a specialist. <strong>"Analyze VIX now and prepare a forecast for Monday"</strong> with <strong>/vix-regime</strong> classifies the volatility regime from term structure and returns a directional read. Other one-skill builds in this tier: <strong>"Pull SEC filings for TSLA from the last 6 months"</strong> with <strong>/sec-filings</strong>, or <strong>"Daily MAG-7 pre-market briefing"</strong> with <strong>/morning-brief</strong>.</p>

<h3 id="level-3">Level 3 — A Two-Skill Chain</h3>
<p>Now compose. <strong>"Build me a mini course on dark matter"</strong> with <strong>/deep-research + /lesson-generator</strong> first gathers and cites current material, then the second skill turns that material into a structured course with objectives, flashcards, and quizzes. The chain matters: research <em>then</em> shape.</p>

<h3 id="level-4">Level 4 — Chain to a Published Wiki</h3>
<p>Three skills produce a durable artifact. <strong>"Academic review: Peircean semiotics &amp; lattice theory"</strong> with <strong>/deep-research + /literature-review + /wiki-builder</strong> gathers sources, organises them into a citation-tracked review, and renders a Karpathy-style wiki with a sources list. Finished builds that produce a wiki surface an <strong>Open wiki</strong> link on their card in Your Builds.</p>

<h3 id="level-5">Level 5 — Full Orchestration</h3>
<p>At the top of the spectrum, a longer chain assembles a live deliverable. <strong>"TSLA dealer positioning dashboard with put/call walls"</strong> with <strong>/tsla-putwall + /gamma-exposure + /vix-regime + /dashboard-builder</strong> pulls options structure, layers the gamma and volatility reads, and renders a Bloomberg-style dashboard. Another: <strong>"Morning briefing dashboard — Bloomberg-style"</strong> with <strong>/morning-brief + /market-data + /dashboard-builder + /frontend-design</strong>. Keep stacks purposeful &mdash; up to ten skills, but every skill should earn its place in the chain.</p>

<h2 id="grounding">Grounding in Your Sources</h2>
<p>To anchor a build in your own material rather than the open web, add the <strong>/notebooklm</strong> skill. A green <strong>Notebook</strong> picker appears beneath the composer; choose one of your NotebookLM notebooks and the build is grounded in that notebook's sources. This is how source-faithful comparison wikis are produced &mdash; for example, pairing <strong>/notebooklm</strong> (a chosen notebook) with <strong>/deep-research + /wiki-builder</strong> to build a cited wiki straight from your own documents.</p>
<div class="callout"><strong>Tip:</strong> grounding is what separates a generic summary from a defensible, source-backed artifact. When accuracy matters, start the chain with /notebooklm.</div>

<h2 id="builds">Suggested &amp; Your Builds</h2>
<ul>
  <li><strong>Suggested Builds</strong> &mdash; the cards under the composer. Click one to <em>prime</em> the composer: it fills the prompt and pre-stacks the right skills so you can edit and run in one step. A fast way to learn good prompt-plus-skill combinations.</li>
  <li><strong>Your Builds</strong> &mdash; recent build history with status (queued, streaming, done, failed, cancelled). Reopen a finished build to replay its transcript, cancel one that is in flight, or jump to a wiki it published.</li>
</ul>

<h2 id="catalog">The Skill Catalog</h2>
<p>The full library is 28 skills in four groups (browse them any time at <a class="ref" href="/skills">Skill Library</a> or via <strong>&#8984;K</strong>). A representative slice:</p>
<div class="wiki-table-wrap"><table class="wiki-table">
  <thead><tr><th>Group</th><th>Representative skills</th><th>Use them to&hellip;</th></tr></thead>
  <tbody>
    <tr><td>Research</td><td>/deep-research, /web-search, /academic-search, /literature-review, /sec-filings, /news-monitor</td><td>Gather, cite, and review source material</td></tr>
    <tr><td>Quant</td><td>/tsla-putwall, /callwall-monitor, /gamma-exposure, /vix-regime, /market-data, /morning-brief, /ipa-compendium</td><td>Pull and interpret market structure</td></tr>
    <tr><td>Knowledge</td><td>/wiki-builder, /lesson-generator, /knowledge-graph, /flash-brief, /llm-council, /notebooklm</td><td>Turn output into durable artifacts</td></tr>
    <tr><td>Development</td><td>/dashboard-builder, /frontend-design, /react-generator, /pdf-builder, /docx-builder, /xlsx-builder</td><td>Render dashboards, documents, and apps</td></tr>
  </tbody>
</table></div>

<h2 id="tips">Tips &amp; Best Practice</h2>
<ul>
  <li><strong>Order your stack as a pipeline.</strong> Gather &rarr; analyse &rarr; format. The Orchestrator feeds each step into the next, so sequence changes the result.</li>
  <li><strong>Start small, then climb.</strong> Get a Level 1 or 2 build right before stacking a four-skill chain. It is easier to see where a chain went wrong when you have built up to it.</li>
  <li><strong>Use &#8984;K to assemble chains.</strong> Searching and selecting skills from the navigator is faster than the picker and drops you straight into the Builder.</li>
  <li><strong>Ground when accuracy matters.</strong> Add /notebooklm and pick a notebook to anchor the build in your own sources.</li>
  <li><strong>Keep stacks lean.</strong> Ten skills is the ceiling, not a target. Every skill should add a distinct step.</li>
  <li><strong>Reopen, do not rebuild, to review.</strong> Finished builds replay from their saved transcript &mdash; free and instant. Use Rebuild only when you actually want a fresh run.</li>
  <li><strong>&#8984;&#8617; submits.</strong> Compose, then Command/Ctrl+Enter without reaching for the mouse.</li>
</ul>
<div class="callout insight"><p><strong>First-source summary:</strong> the AI Builder is one prompt plus an ordered skill stack, run by the Orchestrator as a streamed chain ending in synthesis. Use the &#8984;K commands navigator on the taskbar to find pages, apps, wikis, and skills &mdash; and to load skills into a build in one keystroke.</p></div>`;

async function main() {
  const fields = {
    title:      "AI Builder: Prompt Composer & Orchestrator User Guide",
    titleEm:    "User Guide.",
    lede:       "The Workspace's compose-once surface: write a prompt, stack skills, and the Orchestrator runs them as a chain. From a one-line research command to a fully orchestrated dashboard.",
    banner:     "system",
    crumb:      "Workspace / Wikis / AI Builder",
    pages:      1,
    updated:    "June 2026",
    version:    "1.0.0",
    visibility: "internal",
    env:        "live",
    content:    CONTENT,
    cardDesc:   "First source for AI Builder: the Prompt Composer, the skill stack, the Orchestrator chain, the ⌘K commands navigator, and a spectrum of example builds from a single research command to full orchestration.",
    cardStat1:  "Composer + Orchestrator",
    cardStat2:  "28 skills",
    cardStat3:  "5 worked examples",
  };

  await prisma.wiki.upsert({
    where:  { slug: SLUG },
    update: fields,
    create: { slug: SLUG, sortOrder: 18, ...fields },
  });

  await prisma.wikiSource.deleteMany({ where: { wikiSlug: SLUG } });
  await prisma.wikiTocItem.deleteMany({ where: { wikiSlug: SLUG } });
  await prisma.wikiRelated.deleteMany({ where: { wikiSlug: SLUG } });
  await prisma.wikiPage.deleteMany({ where: { wikiSlug: SLUG } });

  await prisma.wikiSource.createMany({ data: SOURCES.map((s) => ({ ...s, wikiSlug: SLUG })) });
  await prisma.wikiTocItem.createMany({ data: TOC.map((t) => ({ ...t, wikiSlug: SLUG })) });
  await prisma.wikiRelated.createMany({ data: RELATED.map((r) => ({ ...r, wikiSlug: SLUG })) });
  await prisma.wikiPage.createMany({ data: PAGELIST.map((p) => ({ ...p, wikiSlug: SLUG })) });

  const w = await prisma.wiki.findUnique({
    where:   { slug: SLUG },
    include: { sources: true, toc: true, related: true, pageList: true },
  });
  console.log("✓ User Guide added:", w.title);
  console.log("  slug:      ", w.slug);
  console.log("  banner:    ", w.banner, "(→ System User Guides)");
  console.log("  env:       ", w.env, "| visibility:", w.visibility, "| sortOrder:", w.sortOrder);
  console.log("  content:   ", w.content.length, "bytes");
  console.log("  toc/sources/related/pages:", w.toc.length, "/", w.sources.length, "/", w.related.length, "/", w.pageList.length);
  console.log("\n✅  Live at /wikis/" + SLUG + "  ·  listed under /wikis?section=system");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
