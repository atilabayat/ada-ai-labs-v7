/**
 * Adds the "Research Publishing Workflow User Guide" to the System User Guides
 * area (/wikis?section=system). banner="system".
 *
 * Documents the curate → publish → export pipeline on the Deep Research panel:
 * starring feed results, publishing them to a new or existing wiki (with optional
 * LLM synthesis), pushing entities to the Knowledge Graph, and exporting.
 *
 * Accurate to the deployed app/research/ResearchPanel.tsx + the
 * publishResearchToWiki / pushResearchToKnowledgeGraph server actions.
 *
 * Run: node scripts/add-research-publishing-user-guide.mjs   (safe to re-run)
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SLUG = "research-publishing-workflow-guide";

const SOURCES = [
  { title: "ADA AI Labs",     meta: "publishResearchToWiki engine",       sortOrder: 0 },
  { title: "Deep Research",   meta: "/research panel & session feed",     sortOrder: 1 },
  { title: "Orchestrator",    meta: "LLM synthesis (/wiki-builder)",      sortOrder: 2 },
];

const TOC = [
  { anchorId: "overview",   name: "Overview",                  sub: false, sortOrder: 0 },
  { anchorId: "navigation", name: "Getting to the Workflow",   sub: false, sortOrder: 1 },
  { anchorId: "curate",     name: "Step 1 — Curate Results",   sub: false, sortOrder: 2 },
  { anchorId: "publish",    name: "Step 2 — Publish to a Wiki", sub: false, sortOrder: 3 },
  { anchorId: "options",    name: "Synthesis & Graph Options", sub: true,  sortOrder: 4 },
  { anchorId: "append",     name: "Appending to a Wiki",       sub: true,  sortOrder: 5 },
  { anchorId: "export",     name: "Step 3 — Export",           sub: false, sortOrder: 6 },
  { anchorId: "output",     name: "What Gets Created",         sub: false, sortOrder: 7 },
  { anchorId: "tips",       name: "Tips & Best Practice",      sub: false, sortOrder: 8 },
];

const RELATED = [
  { name: "Deep Research Sessions Guide",                       ic: "Search",  sortOrder: 0 },
  { name: "AI Builder: Prompt Composer & Orchestrator User Guide", ic: "Cpu", sortOrder: 1 },
  { name: "Gamma Exposure Heatmaps User Guide",                ic: "Grid",    sortOrder: 2 },
];

const PAGELIST = [
  { pageId: "main", name: "Research Publishing Workflow", current: true, sortOrder: 0 },
];

// HTML body. System-guide conventions; no backticks and no "$"+"{" sequences.
const CONTENT = `<div class="wiki-banner-hero" data-c="research"></div>
<div class="wiki-crumb">
  <span>Research</span><span class="sep">/</span>
  <span>Wikis</span><span class="sep">/</span>
  <span class="ent">Research Publishing</span>
</div>
<h1 class="wiki-h1">Research Publishing <em>Workflow.</em></h1>
<div class="wiki-lede">Turn a good Deep Research feed into durable knowledge. Star the results worth keeping, publish them to a new or existing wiki &mdash; optionally synthesised into a cited article and pushed to the Knowledge Graph &mdash; or export the selection as PDF, Word, or HTML.</div>
<div class="wiki-meta-row"><span class="mr"><span class="v">June 2026</span></span><span class="mr"><span class="v">v1.0</span></span><span class="mr"><span class="v">Internal</span></span></div>

<nav class="toc-rail">
  <a class="toc" href="#overview">Overview</a>
  <a class="toc" href="#navigation">Getting to the Workflow</a>
  <a class="toc" href="#curate">Step 1 — Curate Results</a>
  <a class="toc" href="#publish">Step 2 — Publish to a Wiki</a>
  <a class="toc" href="#export">Step 3 — Export</a>
  <a class="toc" href="#output">What Gets Created</a>
  <a class="toc" href="#tips">Tips &amp; Best Practice</a>
</nav>

<h2 id="overview">Overview</h2>
<p>The Deep Research panel produces a live feed of cited results across academic, industry, financial, government, and technical sources. The <strong>publishing workflow</strong> is how you keep the good ones: curate a selection, then publish it as a wiki or export it as a document. Nothing good has to be lost in a session log again.</p>
<div class="callout insight">
  <p><strong>Three steps:</strong> <strong>curate</strong> (star the results you want) &rarr; <strong>publish</strong> (to a new or existing wiki, optionally synthesised and graphed) <em>or</em> <strong>export</strong> (PDF / Word / HTML). Curation is the gate &mdash; everything downstream acts on your starred selection.</p>
</div>

<h2 id="navigation">Getting to the Workflow</h2>
<ol>
  <li>Open <strong>Research &rarr; Deep Research</strong> from the sidebar, or go to <a class="ref" href="/research">/research</a>.</li>
  <li>Run a session with <strong>+ New Session</strong> (see the <a class="ref" href="/wikis/deep-research-sessions-guide">Deep Research Sessions Guide</a>). Results stream into the <strong>Live Feed</strong>.</li>
  <li>Older saved sessions can be re-loaded into the feed from the <strong>Session Log</strong> tab via the <strong>Load</strong> button &mdash; so you can curate past research too.</li>
</ol>

<h2 id="curate">Step 1 — Curate Results</h2>
<p>Each result in the Live Feed has a star toggle on its right edge. Click <strong>&#9734;</strong> to select a result; it fills to <strong>&#9733;</strong> and the card highlights. As soon as you select one, a <strong>selection action bar</strong> appears at the top of the feed showing <strong>&#9733; N selected</strong>, a <strong>clear</strong> link, and the <strong>Export</strong> and <strong>Publish to Wiki</strong> actions.</p>
<div class="callout"><strong>Curate, don't dump:</strong> pick only the results that earn a place in your knowledge base. The selection &mdash; not the whole session &mdash; is what gets published or exported.</div>

<h2 id="publish">Step 2 — Publish to a Wiki</h2>
<p>Click <strong>&#9636; Publish to Wiki</strong> to open the publish dialog. Choose where the selection goes:</p>
<div class="wiki-table-wrap"><table class="wiki-table">
  <thead><tr><th>Mode</th><th>What it does</th></tr></thead>
  <tbody>
    <tr><td><strong>New wiki</strong></td><td>Creates a fresh research wiki. Enter a title; the slug, sources, table of contents, and card metadata are generated for you.</td></tr>
    <tr><td><strong>Append to existing</strong></td><td>Adds your selection as a dated "Research addendum" section to a wiki you pick from the dropdown, and registers the new sources on it.</td></tr>
  </tbody>
</table></div>
<p>On success the dialog confirms the destination and offers <strong>Open wiki &#8599;</strong> to jump straight to it. New research wikis land in <strong>Development (dev)</strong> &mdash; promote them through Staging to Production from the wiki reader when they are ready.</p>

<h3 id="options">Synthesis &amp; Graph Options</h3>
<p>Two toggles in the dialog shape what is published:</p>
<ul>
  <li><strong>Synthesise narrative</strong> (on by default) &mdash; runs your selection through the Orchestrator LLM (the same engine as <a class="ref" href="/wikis/ai-builder-prompt-composer-orchestrator-guide">/wiki-builder</a>) to produce a coherent, cited article with section headings. Turn it <em>off</em> for a deterministic, category-grouped source list instead.</li>
  <li><strong>Push entities to Knowledge Graph</strong> (off by default) &mdash; adds a central topic node plus a node for each distinct source organisation to the <a class="ref" href="/knowledge">Knowledge Graph</a>, linked by edges. A quick way to make new research discoverable as part of the graph.</li>
</ul>
<div class="callout insight"><p><strong>Either way, sources are preserved.</strong> Synthesised or structured, every published wiki ends with a numbered <strong>Sources</strong> section and records each result as a citation on the wiki.</p></div>

<h3 id="append">Appending to a Wiki</h3>
<p>Use <strong>Append</strong> to grow a living knowledge base. Each append adds a dated section (<em>Research addendum: &lt;topic&gt; (&lt;date&gt;)</em>) to the bottom of the target wiki, extends its table of contents, and adds the new sources &mdash; so a single wiki can accumulate findings across many sessions over time.</p>

<h2 id="export">Step 3 — Export</h2>
<p>To take a selection out of the workspace instead of (or as well as) publishing it, click <strong>&#8599; Export</strong> in the selection bar. The same export menu used across the platform offers:</p>
<ul>
  <li><strong>PDF</strong> &mdash; via the browser print dialog.</li>
  <li><strong>Word / Google Docs</strong> &mdash; a .docx that imports natively.</li>
  <li><strong>HTML</strong> &mdash; a self-contained document.</li>
</ul>
<p>The export contains every starred result with its title, source metadata, and summary &mdash; a portable briefing you can share or archive.</p>

<h2 id="output">What Gets Created</h2>
<div class="wiki-table-wrap"><table class="wiki-table">
  <thead><tr><th>Action</th><th>Result</th><th>Where it lives</th></tr></thead>
  <tbody>
    <tr><td>Publish &rarr; New wiki</td><td>A research wiki (synthesised or structured) with sources &amp; TOC</td><td><a class="ref" href="/wikis">Wikis</a> (Development)</td></tr>
    <tr><td>Publish &rarr; Append</td><td>A dated addendum section + new sources on an existing wiki</td><td>The target wiki</td></tr>
    <tr><td>Push to Knowledge Graph</td><td>A topic node + source-org nodes and edges</td><td><a class="ref" href="/knowledge">Knowledge Graph</a></td></tr>
    <tr><td>Export</td><td>A PDF, Word, or HTML briefing of the selection</td><td>Your downloads</td></tr>
  </tbody>
</table></div>

<h2 id="tips">Tips &amp; Best Practice</h2>
<ul>
  <li><strong>Star as you read.</strong> Curate while the feed is fresh; the selection bar tracks your count live.</li>
  <li><strong>Synthesise for a narrative, structure for a reference.</strong> Leave synthesis on when you want a readable article; turn it off when you want a clean, verbatim source list.</li>
  <li><strong>Append to compound knowledge.</strong> Returning to a topic? Append to its existing wiki instead of creating duplicates &mdash; the dated sections build a running record.</li>
  <li><strong>Graph the big topics.</strong> Push to the Knowledge Graph for themes you will revisit, so they surface as connected entities later.</li>
  <li><strong>Export for sharing.</strong> When the audience is outside the workspace, export the selection rather than sending a wiki link.</li>
  <li><strong>Curate older sessions too.</strong> Load a saved session from the Session Log into the feed, then star and publish as usual.</li>
</ul>
<div class="callout insight"><p><strong>First-source summary:</strong> star the research worth keeping, then Publish to Wiki (new or append, synthesised or structured, optionally graphed) or Export (PDF / Word / HTML). Curation is the gate; publishing turns good feeds into compounding knowledge.</p></div>`;

async function main() {
  const fields = {
    title:      "Research Publishing Workflow User Guide",
    titleEm:    "User Guide.",
    lede:       "Curate Deep Research results, then publish them to a new or existing wiki (optionally synthesised and graphed) or export them as PDF / Word / HTML.",
    banner:     "system",
    crumb:      "Research / Wikis / Research Publishing",
    pages:      1,
    updated:    "June 2026",
    version:    "1.0.0",
    visibility: "internal",
    env:        "live",
    content:    CONTENT,
    cardDesc:   "Star the research worth keeping, then publish it to a new or existing wiki (with optional LLM synthesis + Knowledge Graph push) or export the selection as PDF, Word, or HTML.",
    cardStat1:  "Curate → Publish",
    cardStat2:  "Wiki + Graph",
    cardStat3:  "Export",
  };

  await prisma.wiki.upsert({
    where:  { slug: SLUG },
    update: fields,
    create: { slug: SLUG, sortOrder: 19, ...fields },
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
