/**
 * lib/skills/executors/research.ts
 * ─────────────────────────────────
 * Live internet research executors.
 *
 * Skill → Data sources (all parallel, graceful degradation):
 *
 *   /web-search        Brave (10) + Exa semantic (5) + Tavily AI answer
 *                        BRAVE_API_KEY + EXA_API_KEY + TAVILY_API_KEY
 *
 *   /deep-research     Brave primary (10) + Exa (5) [angle 1]
 *                      Brave (5) + Tavily advanced (5) [angle 2 — context]
 *                      Brave news (8) + GDELT (10, free) [angle 3 — recent]
 *                        BRAVE_API_KEY + EXA_API_KEY + TAVILY_API_KEY
 *
 *   /news-monitor      GDELT 24h (free) + GDELT 7d (free) [always]
 *                      + Brave news + Tavily news [if keys present]
 *                      + NewsAPI [NEWS_API_KEY] + MediaStack [MEDIASTACK_API_KEY]
 *
 *   /literature-review arXiv (free) + OpenAlex (free, 200M+ works)
 *                      + Semantic Scholar (free) + Crossref (free, 180M+)
 *                      + CORE (open-access PDFs) + Europe PMC (life sciences)
 *                      + Tavily domain-filter
 *
 *   /academic-search   arXiv (free) + OpenAlex (free) + Semantic Scholar (free)
 *                      + Crossref (free) + CORE [CORE_API_KEY optional]
 *                      + Europe PMC (free) + SSRN/NBER via Tavily [TAVILY_API_KEY]
 *
 *   /classics-research Wikidata (free) + Internet Archive (free) + Open Library (free)
 *                      + Europeana via Tavily [TAVILY_API_KEY]
 *
 *   /social-science    World Bank (free) + FRED [FRED_API_KEY] + USA Spending (free)
 *                      + OpenAlex (social science filter)
 *
 *   /sec-filings       SEC EDGAR full-text search — completely free, no key
 *
 * Each executor:
 *  1. Fetches real data
 *  2. Streams clean markdown to the build panel
 *  3. Appends output to ctx.prevSteps so downstream skills + LLM can cite it
 */

import { SkillExecutor, streamMarkdown } from "../types";
import {
  tavilySearch,
  arxivSearch,
  secSearch,
  braveSearch,
  exaSearch,
  gdeltSearch,
  openAlexSearch,
  semanticScholarSearch,
  crossrefSearch,
  coreSearch,
  europePmcSearch,
  wikidataSearch,
  internetArchiveSearch,
  openLibrarySearch,
  worldBankSearch,
  fredSearch,
  usaSpendingSearch,
  newsApiSearch,
  mediaStackSearch,
  mergeResults,
  fmtWebResults,
  fmtArxivResults,
  fmtOpenAlexResults,
  fmtCrossrefResults,
  fmtCorePapers,
  fmtEuropePmcResults,
  fmtWikidataEntities,
  fmtOpenLibraryBooks,
  fmtFredSeries,
  fmtSecFilings,
  tavilyNote,
  hasTavilyKey,
  hasBraveKey,
  hasExaKey,
  hasCoreKey,
  hasFredKey,
  hasNewsApiKey,
  hasMediaStackKey,
} from "../web";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function today(): string { return new Date().toISOString().slice(0, 10); }

/** Extract the most meaningful query from the user's prompt */
function extractQuery(prompt: string): string {
  return prompt.replace(/^(research|find|search|look up|analyze|get|pull|fetch)\s+/i, "").trim().slice(0, 200);
}

/** Pull ticker symbols out of a prompt */
function extractTickers(prompt: string): string[] {
  const matches = prompt.match(/\b([A-Z]{1,5})\b/g) ?? [];
  const COMMON_WORDS = new Set(["THE","AND","FOR","FROM","WITH","WHAT","WHEN","WHERE","HOW","WHY","PUT","CALL","SEC","ETF"]);
  return [...new Set(matches.filter(m => m.length >= 2 && m.length <= 5 && !COMMON_WORDS.has(m)))].slice(0, 3);
}

// ─── /web-search ─────────────────────────────────────────────────────────────
// Source priority: Brave (primary, independent index) + Exa (semantic/neural)
// + Tavily (AI answer overlay). All fire in parallel; results merged + de-duped.

const WEB_SEARCH: SkillExecutor = async function* (ctx) {
  const query    = extractQuery(ctx.prompt);
  const hasAny   = hasBraveKey() || hasExaKey() || hasTavilyKey();

  if (!hasAny) {
    yield* streamMarkdown(
      `## Web Search · ${query}\n\n` +
      `> **Not connected** — add at least one search key to \`.env\`:\n` +
      `> - \`BRAVE_API_KEY\` — [api.search.brave.com](https://api.search.brave.com) · free 2,000/mo _(recommended primary)_\n` +
      `> - \`EXA_API_KEY\`   — [exa.ai](https://exa.ai) · free 1,000/mo _(semantic layer)_\n` +
      `> - \`TAVILY_API_KEY\`— [app.tavily.com](https://app.tavily.com) · free 1,000/mo _(AI answer)_`,
      "web-search", "Web search (no keys)"
    );
    return;
  }

  // Fire all available sources in parallel
  const [braveResp, exaResp, tavilyResp] = await Promise.all([
    braveSearch(query,  { maxResults: 10 }),
    exaSearch(query,    { maxResults: 5, useAutoprompt: true }),
    hasTavilyKey()
      ? tavilySearch(query, { depth: "basic", maxResults: 5, includeAnswer: true })
      : Promise.resolve(null),
  ]);

  const merged  = mergeResults(braveResp, exaResp, tavilyResp ?? { query, results: [], isLive: false });
  const sources = [
    hasBraveKey()  && "Brave",
    hasExaKey()    && "Exa",
    hasTavilyKey() && "Tavily",
  ].filter(Boolean).join(" · ");

  const md = `## Web Search · ${query}

${tavilyResp?.answer ? `> **AI Summary:** ${tavilyResp.answer}\n` : ""}
${fmtWebResults(merged)}

> _Sources: **live** via ${sources} · ${today()}_`;

  yield* streamMarkdown(md, "web-search", `Searching: ${query.slice(0, 60)}`);
};

// ─── /deep-research ──────────────────────────────────────────────────────────

const DEEP_RESEARCH: SkillExecutor = async function* (ctx) {
  const baseQuery = extractQuery(ctx.prompt);
  const isLive    = hasTavilyKey();

  if (!isLive) {
    const md = `## Deep Research · ${baseQuery}

> **Not connected** — set \`TAVILY_API_KEY\` to enable multi-angle web research.
>
> When connected, this skill runs 3 search passes with different angle queries,
> gathers full-page content via Tavily's \`search_depth: "advanced"\` mode,
> and compiles a structured research briefing for LLM synthesis.

${tavilyNote(false)}`;
    yield* streamMarkdown(md, "deep-research", "Deep research (stub)");
    return;
  }

  // Build context-aware search angles: finance mode vs. general research mode
  const isFinanceQuery =
    /\b(stock|earnings|options|put|call|vix|spy|qqq|price|market|trading|analyst|consensus|valuation|revenue|eps|guidance|etf|iv|delta|gamma|fed|fomc|inflation|yield|bond|rate|hedge|short|long|squeeze)\b/i
      .test(ctx.prompt);
  const queryTickers = extractTickers(ctx.prompt.toUpperCase());
  const currentYear  = today().slice(0, 4);
  const currentMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  const angles = (isFinanceQuery || queryTickers.length > 0)
    ? [
        baseQuery,
        `${baseQuery} earnings analyst consensus price target outlook`,
        `${baseQuery} news ${currentMonth}`,
      ]
    : [
        baseQuery,
        `${baseQuery} analysis background context key findings`,
        `${baseQuery} latest developments ${currentYear}`,
      ];

  // Fire all 5 fetches in parallel across 3 angles
  const [
    bravePrimary,
    exaPrimary,
    tavilyBackground,
    braveNews,
    gdeltRecent,
  ] = await Promise.all([
    braveSearch(angles[0], { maxResults: 10 }),
    exaSearch(angles[0],   { maxResults: 5, useAutoprompt: true }),
    hasTavilyKey()
      ? tavilySearch(angles[1], { depth: "advanced", maxResults: 5, includeAnswer: true })
      : Promise.resolve(null),
    braveSearch(angles[2], { maxResults: 8, news: true }),
    gdeltSearch(angles[2], { maxResults: 10, timespan: "7d" }),
  ]);

  // Merge each angle, then de-dup globally by URL
  const primaryMerged    = mergeResults(bravePrimary, exaPrimary);
  const backgroundMerged = mergeResults(
    tavilyBackground ?? { query: angles[1], results: [], isLive: false },
    hasBraveKey() ? await braveSearch(angles[1], { maxResults: 5 }) : { query: angles[1], results: [], isLive: false }
  );
  const recentMerged     = mergeResults(braveNews, gdeltRecent);

  const activeKeys = [
    hasBraveKey()  && "Brave",
    hasExaKey()    && "Exa",
    hasTavilyKey() && "Tavily",
    "GDELT",
  ].filter(Boolean).join(" · ");

  const md = `## Deep Research · ${baseQuery}

${tavilyBackground?.answer ? `### AI Summary\n${tavilyBackground.answer}\n` : ""}
### Primary Sources _(Brave + Exa)_
${fmtWebResults(primaryMerged)}

${backgroundMerged.results.length ? `### Background & Context\n${fmtWebResults(backgroundMerged)}` : ""}

${recentMerged.results.length ? `### Recent Coverage _(Brave News + GDELT)_\n${fmtWebResults(recentMerged)}` : ""}

> _Sources: **live** via ${activeKeys} · ${today()}_`;

  yield* streamMarkdown(md, "deep-research", `Deep research: ${baseQuery.slice(0, 50)}`);
};

// ─── /news-monitor ────────────────────────────────────────────────────────────
// GDELT is always live (free, no key, global coverage).
// Brave news + Tavily news add when keys are present.

const NEWS_MONITOR: SkillExecutor = async function* (ctx) {
  const query      = extractQuery(ctx.prompt);
  const prevText   = ctx.prevSteps.map(s => s.output).join("\n");
  const allText    = ctx.prompt + " " + prevText;
  const tickers    = extractTickers(allText.toUpperCase());
  const newsQuery  = tickers.length ? `${tickers.slice(0, 2).join(" ")} news` : query;

  // GDELT always fires (free). All other sources degrade gracefully.
  const [
    gdelt24h,
    gdelt7d,
    braveHeadlines,
    tavilyBreaking,
    tavilyAnalysis,
    newsApiResp,
    mediaStackResp,
  ] = await Promise.all([
    gdeltSearch(newsQuery,   { timespan: "1d",   maxResults: 10 }),
    gdeltSearch(newsQuery,   { timespan: "7d",   maxResults: 8  }),
    braveSearch(newsQuery,   { maxResults: 8,    news: true }),
    hasTavilyKey()
      ? tavilySearch(newsQuery, { topic: "news", depth: "basic", maxResults: 5, days: 3,  includeAnswer: false })
      : Promise.resolve(null),
    hasTavilyKey()
      ? tavilySearch(newsQuery, { topic: "news", depth: "basic", maxResults: 4, days: 14, includeAnswer: true })
      : Promise.resolve(null),
    newsApiSearch(newsQuery,     5),
    mediaStackSearch(newsQuery,  5),
  ]);

  const breaking = mergeResults(
    gdelt24h, braveHeadlines,
    tavilyBreaking  ?? { query: newsQuery, results: [], isLive: false },
    newsApiResp,
    mediaStackResp,
  );
  const coverage = mergeResults(gdelt7d, tavilyAnalysis ?? { query: newsQuery, results: [], isLive: false });

  const activeSources = [
    "GDELT",
    hasBraveKey()      && "Brave",
    hasTavilyKey()     && "Tavily",
    hasNewsApiKey()    && "NewsAPI",
    hasMediaStackKey() && "MediaStack",
  ].filter(Boolean).join(" · ");

  const md = `## News Monitor · ${newsQuery}

### Breaking (last 24 hours) — ${breaking.results.length} items
${fmtWebResults(breaking)}

### Coverage (last 7 days) — ${coverage.results.length} items
${tavilyAnalysis?.answer ? `**AI Summary:** ${tavilyAnalysis.answer}\n\n` : ""}${fmtWebResults({ ...coverage, answer: undefined })}

> _Sources: **live** via ${activeSources} · ${today()}_`;

  yield* streamMarkdown(md, "news-monitor", `News: ${newsQuery.slice(0, 50)}`);
};

// ─── /literature-review ──────────────────────────────────────────────────────
// 6 free sources always fire in parallel; Tavily domain-filter adds institutional
// working papers when key is present.

const LITERATURE_REVIEW: SkillExecutor = async function* (ctx) {
  const query = extractQuery(ctx.prompt);

  const [
    arxivPapers,
    openAlexWorks,
    s2Papers,
    crossrefWorks,
    corePapers,
    pmcPapers,
    webSection,
  ] = await Promise.all([
    arxivSearch(query,          6),
    openAlexSearch(query,       5),
    semanticScholarSearch(query, 5),
    crossrefSearch(query,       5),
    coreSearch(query,           4),
    europePmcSearch(query,      4),
    hasTavilyKey()
      ? tavilySearch(`${query} research paper working paper`, {
          depth:          "advanced",
          maxResults:     5,
          includeAnswer:  true,
          includeDomains: [
            "arxiv.org", "ssrn.com", "papers.ssrn.com",
            "pubmed.ncbi.nlm.nih.gov", "scholar.google.com", "researchgate.net",
            "jstor.org", "nber.org", "federalreserve.gov", "bis.org", "cfainstitute.org",
          ],
        })
      : Promise.resolve(null),
  ]);

  const sourceNote = [
    "arXiv (free)",
    "OpenAlex (free · 200M+ works)",
    "Semantic Scholar (free)",
    "Crossref (free · 180M+ records)",
    `CORE (${hasCoreKey() ? "keyed" : "free tier"})`,
    "Europe PMC (free)",
    hasTavilyKey() && "Tavily: SSRN · NBER · Fed · BIS · CFA",
  ].filter(Boolean).join(" · ");

  const md = `## Literature Review · ${query}

### arXiv Preprints
${fmtArxivResults(arxivPapers)}

### Top Cited Works — OpenAlex
${fmtOpenAlexResults(openAlexWorks)}

### Semantic Scholar
${fmtArxivResults(s2Papers)}

${crossrefWorks.length ? `### Crossref — DOI Metadata\n${fmtCrossrefResults(crossrefWorks)}` : ""}

${corePapers.length ? `### CORE — Open-Access Full Text\n${fmtCorePapers(corePapers)}` : ""}

${pmcPapers.length ? `### Europe PMC — Life Sciences\n${fmtEuropePmcResults(pmcPapers)}` : ""}

${webSection?.results.length
  ? `### Working Papers & Institutional Research\n${webSection.answer ? `> **Summary:** ${webSection.answer}\n\n` : ""}${fmtWebResults({ ...webSection, answer: undefined })}`
  : ""}

> _Sources: **live** · ${sourceNote} · ${today()}_`;

  yield* streamMarkdown(md, "literature-review", `Literature review: ${query.slice(0, 50)}`);
};

// ─── /academic-search ────────────────────────────────────────────────────────
// 6 free sources always fire; SSRN/NBER via Tavily if key present.

const ACADEMIC_SEARCH: SkillExecutor = async function* (ctx) {
  const query = extractQuery(ctx.prompt);

  const [papers, openAlexWorks, s2Papers, crossrefWorks, corePapers, pmcPapers, ssrnResp] = await Promise.all([
    arxivSearch(query,           8),
    openAlexSearch(query,        6),
    semanticScholarSearch(query, 5),
    crossrefSearch(query,        5),
    coreSearch(query,            4),
    europePmcSearch(query,       4),
    hasTavilyKey()
      ? tavilySearch(`${query} research paper working paper`, {
          depth:          "basic",
          maxResults:     5,
          includeAnswer:  false,
          includeDomains: ["ssrn.com", "papers.ssrn.com", "nber.org"],
        })
      : Promise.resolve(null),
  ]);

  const ssrnCount    = ssrnResp?.results.length ?? 0;
  const totalResults = papers.length + openAlexWorks.length + s2Papers.length
                     + crossrefWorks.length + corePapers.length + pmcPapers.length + ssrnCount;

  const totalSources = [
    papers.length        && `${papers.length} arXiv`,
    openAlexWorks.length && `${openAlexWorks.length} OpenAlex`,
    s2Papers.length      && `${s2Papers.length} S2`,
    crossrefWorks.length && `${crossrefWorks.length} Crossref`,
    corePapers.length    && `${corePapers.length} CORE`,
    pmcPapers.length     && `${pmcPapers.length} EuropePMC`,
    ssrnCount            && `${ssrnCount} SSRN/NBER`,
  ].filter(Boolean).join(" · ");

  const sourceNote = [
    "arXiv (free)",
    "OpenAlex (free · 200M+)",
    "Semantic Scholar (free)",
    "Crossref (free · 180M+)",
    `CORE (${hasCoreKey() ? "keyed" : "free tier"})`,
    "Europe PMC (free)",
    ssrnCount ? "SSRN/NBER via Tavily" : "Add TAVILY_API_KEY for SSRN/NBER",
  ].filter(Boolean).join(" · ");

  const md = `## Academic Search · ${today()}

**Query:** _${query}_ · **${totalResults} results** across ${totalSources}

### arXiv Papers
${fmtArxivResults(papers)}

### Top Cited Works — OpenAlex
${fmtOpenAlexResults(openAlexWorks)}

### Semantic Scholar
${fmtArxivResults(s2Papers)}

${crossrefWorks.length ? `### Crossref — DOI Records\n${fmtCrossrefResults(crossrefWorks)}` : ""}

${corePapers.length ? `### CORE — Open-Access Full Text\n${fmtCorePapers(corePapers)}` : ""}

${pmcPapers.length ? `### Europe PMC\n${fmtEuropePmcResults(pmcPapers)}` : ""}

${ssrnCount ? `### SSRN & NBER Working Papers\n${fmtWebResults(ssrnResp!)}` : ""}

> _Sources: **live** · ${sourceNote} · ${today()}_`;

  yield* streamMarkdown(md, "academic-search",
    totalResults > 0
      ? `Academic: ${totalSources}`
      : "Academic search (no results)");
};

// ─── /classics-research ──────────────────────────────────────────────────────
// Humanities-specific: Wikidata (structured knowledge) + Internet Archive (scans)
// + Open Library (bibliographic) + Europeana + Perseus via Tavily

const CLASSICS_RESEARCH: SkillExecutor = async function* (ctx) {
  const query = extractQuery(ctx.prompt);

  const [entities, archiveTexts, archiveAudio, books, europeanaResp] = await Promise.all([
    wikidataSearch(query, 8),
    internetArchiveSearch(query, { mediatype: "texts",       maxResults: 6 }),
    internetArchiveSearch(query, { mediatype: "audio",       maxResults: 3 }),
    openLibrarySearch(query,     6),
    hasTavilyKey()
      ? tavilySearch(`${query} manuscripts texts history`, {
          depth:          "basic",
          maxResults:     5,
          includeAnswer:  false,
          includeDomains: [
            "europeana.eu", "perseus.tufts.edu", "penelope.uchicago.edu",
            "hathitrust.org", "gutenberg.org", "wikisource.org",
            "plato.stanford.edu", "britannica.com", "jstor.org",
          ],
        })
      : Promise.resolve(null),
  ]);

  const archiveAll = mergeResults(
    { query, results: archiveTexts, isLive: true },
    { query, results: archiveAudio, isLive: true },
  );

  const sourceNote = [
    "Wikidata (free · structured knowledge graph)",
    "Internet Archive (free · digitized texts & audio)",
    "Open Library (free · bibliographic)",
    hasTavilyKey() && "Europeana · Perseus · HathiTrust via Tavily",
  ].filter(Boolean).join(" · ");

  const md = `## Classics & Humanities Research · ${query}

### Wikidata — Knowledge Graph Entities
${fmtWikidataEntities(entities)}

### Internet Archive — Primary Sources
${fmtWebResults(archiveAll)}

### Open Library — Bibliographic Records
${fmtOpenLibraryBooks(books)}

${europeanaResp?.results.length
  ? `### Europeana · Perseus · Digital Humanities\n${fmtWebResults(europeanaResp)}`
  : ""}

> _Sources: **live** · ${sourceNote} · ${today()}_`;

  yield* streamMarkdown(md, "classics-research", `Classics: ${query.slice(0, 50)}`);
};

// ─── /social-science ─────────────────────────────────────────────────────────
// Quantitative social data: World Bank + FRED + USA Spending + OpenAlex filter.

const SOCIAL_SCIENCE: SkillExecutor = async function* (ctx) {
  const query = extractQuery(ctx.prompt);

  const [wbDocs, fredSeries, spendingAwards, openAlexSocial, oecd] = await Promise.all([
    worldBankSearch(query,  6),
    fredSearch(query,       6),
    usaSpendingSearch(query, 5),
    openAlexSearch(`${query} social science economics policy`, 5),
    hasTavilyKey()
      ? tavilySearch(`${query} data statistics report`, {
          depth:          "basic",
          maxResults:     5,
          includeAnswer:  true,
          includeDomains: [
            "data.worldbank.org", "oecd.org", "data.un.org", "fred.stlouisfed.org",
            "ourworldindata.org", "statista.com", "imf.org", "icpsr.umich.edu",
          ],
        })
      : Promise.resolve(null),
  ]);

  const sourceNote = [
    "World Bank Data (free)",
    hasFredKey() ? "FRED / St. Louis Fed (keyed)" : "FRED (add FRED_API_KEY)",
    "USA Spending (free · federal contracts & grants)",
    "OpenAlex social science filter (free)",
    hasTavilyKey() && "OECD · IMF · UN Data via Tavily",
  ].filter(Boolean).join(" · ");

  const md = `## Social Science & Economic Data · ${query}

${wbDocs.length ? `### World Bank — Development Data\n${fmtWebResults({ query, results: wbDocs, isLive: true })}` : ""}

${fredSeries.length
  ? `### FRED — Economic Time Series\n${fmtFredSeries(fredSeries)}`
  : hasFredKey() ? "" : "> _FRED: add `FRED_API_KEY` to .env to search 800k+ economic series._"}

${spendingAwards.length ? `### USA Spending — Federal Awards\n${fmtWebResults({ query, results: spendingAwards, isLive: true })}` : ""}

${openAlexSocial.length ? `### OpenAlex — Social Science Research\n${fmtOpenAlexResults(openAlexSocial)}` : ""}

${oecd?.results.length
  ? `### OECD · IMF · UN Data\n${oecd.answer ? `> **AI Summary:** ${oecd.answer}\n\n` : ""}${fmtWebResults({ ...oecd, answer: undefined })}`
  : ""}

> _Sources: **live** · ${sourceNote} · ${today()}_`;

  yield* streamMarkdown(md, "social-science", `Social science: ${query.slice(0, 50)}`);
};

// ─── /sec-filings ─────────────────────────────────────────────────────────────

const SEC_FILINGS: SkillExecutor = async function* (ctx) {
  const query   = extractQuery(ctx.prompt);
  const tickers = extractTickers(ctx.prompt.toUpperCase() + " " + ctx.prevSteps.map(s => s.output).join(" "));
  const search  = tickers[0] ?? query;

  // Which form types to look for
  const formsMatch = ctx.prompt.match(/\b(10-K|10-Q|8-K|DEF 14A|S-1|20-F|13F|13G|13D)\b/gi);
  const forms = formsMatch?.join(",") ?? "10-K,10-Q,8-K";

  const filings = await secSearch(search, forms, 6);
  const isLive  = filings.length > 0;

  const md = `## SEC EDGAR Filings · ${search}

**Query:** _${search}_ · Form types: \`${forms}\` · Last 12 months

${fmtSecFilings(filings)}

> _Source: **live** via SEC EDGAR full-text search — free, no key required._
> _[EDGAR viewer](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(search)})_`;

  yield* streamMarkdown(md, "sec-filings",
    isLive ? `EDGAR: ${filings.length} filing${filings.length === 1 ? "" : "s"} for ${search}` : `EDGAR: no results for ${search}`);
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const RESEARCH_EXECUTORS: Record<string, SkillExecutor> = {
  "web-search":          WEB_SEARCH,
  "deep-research":       DEEP_RESEARCH,
  "news-monitor":        NEWS_MONITOR,
  "literature-review":   LITERATURE_REVIEW,
  "academic-search":     ACADEMIC_SEARCH,
  "classics-research":   CLASSICS_RESEARCH,
  "social-science":      SOCIAL_SCIENCE,
  "sec-filings":         SEC_FILINGS,
};
