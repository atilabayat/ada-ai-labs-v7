/**
 * lib/skills/web.ts
 * ─────────────────
 * Internet data layer for research skill executors.
 *
 * Providers used:
 *   Tavily Search  — https://api.tavily.com  (free 1k/mo)
 *     • /web-search, /deep-research, /news-monitor, /literature-review
 *     • Requires TAVILY_API_KEY in .env
 *     • Get key: https://app.tavily.com → API Keys
 *
 *   arXiv Atom API — https://export.arxiv.org (free, no key)
 *     • /academic-search, /literature-review
 *
 *   SEC EDGAR FTS  — https://efts.sec.gov (free, no key)
 *     • /sec-filings
 *
 * All functions return graceful fallbacks (empty results + isLive=false)
 * when keys are missing or the upstream API errors.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WebResult {
  title:   string;
  url:     string;
  content: string; // excerpt or full text
  source?: string; // domain name
  date?:   string; // publication date if known
}

export interface SearchResponse {
  query:   string;
  results: WebResult[];
  answer?: string;   // Tavily AI answer if include_answer=true
  isLive:  boolean;
}

export interface ArxivPaper {
  title:    string;
  authors:  string[];
  abstract: string;
  url:      string;
  date:     string;
  id:       string;
}

export interface SecFiling {
  company:    string;
  form:       string;
  filed:      string;
  url:        string;
  description: string;
}

// ─── Tavily client ─────────────────────────────────────────────────────────────

const TAVILY_BASE = "https://api.tavily.com";

export function hasTavilyKey(): boolean {
  const k = process.env.TAVILY_API_KEY ?? "";
  // Real Tavily keys are ≥20 chars; "tvly-YOUR_KEY" placeholder is excluded explicitly
  return k.length >= 20 && !k.toLowerCase().includes("your") && !k.toLowerCase().includes("key_here");
}

export async function tavilySearch(
  query: string,
  opts: {
    depth?:         "basic" | "advanced";
    topic?:         "general" | "news" | "finance";
    maxResults?:    number;
    includeAnswer?: boolean;
    includeDomains?: string[];
    days?:          number; // for news: last N days
  } = {}
): Promise<SearchResponse> {
  if (!hasTavilyKey()) {
    return { query, results: [], isLive: false };
  }

  try {
    const body: Record<string, unknown> = {
      api_key:        process.env.TAVILY_API_KEY,
      query,
      search_depth:   opts.depth         ?? "basic",
      topic:          opts.topic         ?? "general",
      max_results:    opts.maxResults    ?? 5,
      include_answer: opts.includeAnswer ?? true,
      include_raw_content: false,
    };
    if (opts.includeDomains?.length) body.include_domains = opts.includeDomains;
    if (opts.days)                   body.days            = opts.days;

    const r = await fetch(`${TAVILY_BASE}/search`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(20_000),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.warn(`[tavily] ${r.status}: ${txt}`);
      return { query, results: [], isLive: false };
    }

    const d = await r.json();
    const results: WebResult[] = (d.results ?? []).map((item: any) => ({
      title:   item.title   ?? "",
      url:     item.url     ?? "",
      content: item.content ?? "",
      source:  item.url ? new URL(item.url).hostname.replace(/^www\./, "") : undefined,
      date:    item.published_date ?? undefined,
    }));

    return {
      query,
      results,
      answer:  d.answer ?? undefined,
      isLive:  true,
    };
  } catch (err) {
    console.warn("[tavily] fetch error:", (err as Error).message);
    return { query, results: [], isLive: false };
  }
}

// ─── arXiv API (free, no key) ──────────────────────────────────────────────────

const ARXIV_BASE = "https://export.arxiv.org/api/query";

export async function arxivSearch(
  query: string,
  maxResults = 5
): Promise<ArxivPaper[]> {
  try {
    // arXiv Atom API: `all:` searches title + abstract + authors.
    // Join multi-word queries with `+` (treated as AND internally).
    const terms   = query.trim().replace(/\s+/g, "+").toLowerCase();
    const params  = new URLSearchParams({
      search_query: `all:${terms}`,
      start:        "0",
      max_results:  String(maxResults),
      sortBy:       "relevance",
      sortOrder:    "descending",
    });
    const r = await fetch(`${ARXIV_BASE}?${params}`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return [];
    const xml = await r.text();
    return parseArxivAtom(xml);
  } catch { return []; }
}

function parseArxivAtom(xml: string): ArxivPaper[] {
  const papers: ArxivPaper[] = [];
  const entries = xml.split(/<entry>/).slice(1);
  for (const entry of entries) {
    const getTag = (tag: string) => {
      const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? m[1].trim() : "";
    };
    const title   = getTag("title").replace(/\s+/g, " ");
    const summary = getTag("summary").replace(/\s+/g, " ");
    const id      = getTag("id").replace("http://arxiv.org/abs/", "");
    const date    = getTag("published").slice(0, 10);
    const authors: string[] = [];
    const authorMatches = entry.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/g);
    for (const m of authorMatches) authors.push(m[1].trim());
    if (title) papers.push({
      title, abstract: summary, id, date,
      url:     `https://arxiv.org/abs/${id}`,
      authors: authors.slice(0, 3),
    });
  }
  return papers;
}

// ─── SEC EDGAR full-text search (free, no key) ────────────────────────────────

const EDGAR_SEARCH = "https://efts.sec.gov/LATEST/search-index";

export async function secSearch(
  query: string,
  forms = "10-K,10-Q,8-K",
  limit = 5
): Promise<SecFiling[]> {
  try {
    const params = new URLSearchParams({
      q:        `"${query}"`,
      forms,
      dateRange: "custom",
      startdt:  oneYearAgo(),
      enddt:    today(),
      hits:     String(limit),
    });
    const r = await fetch(`${EDGAR_SEARCH}?${params}`, {
      headers: { "User-Agent": "ADA AI Labs research@ada-labs.io" },
      signal:  AbortSignal.timeout(15_000),
    });
    if (!r.ok) return [];
    const d = await r.json();
    const hits: any[] = d.hits?.hits ?? [];

    // De-duplicate: keep the most recent filing per company+form combination
    const seen = new Set<string>();
    const out: SecFiling[] = [];
    for (const h of hits) {
      const s       = h._source ?? {};
      const company = (s.display_names?.[0] ?? "Unknown").replace(/\s+\(CIK.*$/, "").trim();
      const form    = s.root_forms?.[0] ?? s.form ?? "?";
      const key     = `${company}|${form}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Build EDGAR filing-index URL from accession number + CIK
      const cik  = String(s.ciks?.[0] ?? "").replace(/^0+/, "");
      const adsh = (s.adsh ?? "").replace(/-/g, "");
      const url  = cik && adsh
        ? `https://www.sec.gov/Archives/edgar/data/${cik}/${adsh}/${s.adsh}-index.htm`
        : `https://efts.sec.gov/LATEST/search-index?q="${encodeURIComponent(query)}"&forms=${forms}`;

      out.push({
        company,
        form,
        filed:       s.period_ending ?? s.file_date ?? "",
        url,
        description: s.file_description ?? `${form} filing`,
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch { return []; }
}

// ─── Brave Search API ─────────────────────────────────────────────────────────
// Independent index (not Bing/Google derived). Free tier: 2,000 queries/month.
// Get key: https://api.search.brave.com → Data for AI plan → free

const BRAVE_BASE = "https://api.search.brave.com/res/v1";

export function hasBraveKey(): boolean {
  const k = process.env.BRAVE_API_KEY ?? "";
  return k.length >= 20 && !k.toLowerCase().includes("your") && !k.toLowerCase().includes("key_here");
}

export async function braveSearch(
  query: string,
  opts: { maxResults?: number; news?: boolean } = {}
): Promise<SearchResponse> {
  if (!hasBraveKey()) return { query, results: [], isLive: false };
  try {
    const endpoint = opts.news
      ? `${BRAVE_BASE}/news/search`
      : `${BRAVE_BASE}/web/search`;
    const params = new URLSearchParams({
      q:     query,
      count: String(opts.maxResults ?? 10),
      ...(opts.news ? { freshness: "pd" } : {}),
    });
    const r = await fetch(`${endpoint}?${params}`, {
      headers: {
        "Accept":               "application/json",
        "Accept-Encoding":      "gzip",
        "X-Subscription-Token": process.env.BRAVE_API_KEY!,
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) {
      console.warn(`[brave] ${r.status}: ${await r.text().catch(() => "")}`);
      return { query, results: [], isLive: false };
    }
    const d = await r.json();
    const items: any[] = opts.news
      ? (d.results ?? [])
      : (d.web?.results ?? []);
    const results: WebResult[] = items.map((item: any) => ({
      title:   item.title   ?? "",
      url:     item.url     ?? "",
      content: [item.description, ...(item.extra_snippets ?? [])].filter(Boolean).join(" "),
      source:  item.url ? new URL(item.url).hostname.replace(/^www\./, "") : undefined,
      date:    item.age ?? item.page_age ?? undefined,
    }));
    return { query, results, isLive: true };
  } catch (err) {
    console.warn("[brave] fetch error:", (err as Error).message);
    return { query, results: [], isLive: false };
  }
}

// ─── Exa (neural / semantic search) ──────────────────────────────────────────
// Finds conceptually relevant pages keyword engines miss.
// Free tier: 1,000 searches/month. Get key: https://exa.ai → Dashboard

export function hasExaKey(): boolean {
  const k = process.env.EXA_API_KEY ?? "";
  return k.length >= 20 && !k.toLowerCase().includes("your") && !k.toLowerCase().includes("key_here");
}

export async function exaSearch(
  query: string,
  opts: { maxResults?: number; useAutoprompt?: boolean } = {}
): Promise<SearchResponse> {
  if (!hasExaKey()) return { query, results: [], isLive: false };
  try {
    const body = {
      query,
      numResults:     opts.maxResults ?? 5,
      useAutoprompt:  opts.useAutoprompt ?? true,
      type:           "auto",
      contents:       { text: { maxCharacters: 600 } },
    };
    const r = await fetch("https://api.exa.ai/search", {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key":    process.env.EXA_API_KEY!,
      },
      body:   JSON.stringify(body),
      signal: AbortSignal.timeout(18_000),
    });
    if (!r.ok) {
      console.warn(`[exa] ${r.status}: ${await r.text().catch(() => "")}`);
      return { query, results: [], isLive: false };
    }
    const d = await r.json();
    const results: WebResult[] = (d.results ?? []).map((item: any) => ({
      title:   item.title    ?? "",
      url:     item.url      ?? "",
      content: item.text     ?? (item.highlights ?? []).join(" "),
      source:  item.url ? new URL(item.url).hostname.replace(/^www\./, "") : undefined,
      date:    item.publishedDate ?? undefined,
    }));
    return { query, results, isLive: true };
  } catch (err) {
    console.warn("[exa] fetch error:", (err as Error).message);
    return { query, results: [], isLive: false };
  }
}

// ─── GDELT Project (global news) ──────────────────────────────────────────────
// Completely free, no key, no documented rate limits. Updates every 15 minutes.
// Monitors 250+ languages across global news/broadcast media.
// https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/

export async function gdeltSearch(
  query: string,
  opts: { timespan?: string; maxResults?: number } = {}
): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams({
      query:      query,
      mode:       "artlist",
      format:     "json",
      maxrecords: String(opts.maxResults ?? 10),
      timespan:   opts.timespan ?? "1d",
      sort:       "hybridrel",
    });
    const r = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return { query, results: [], isLive: false };
    const d = await r.json();
    const articles: any[] = d.articles ?? [];
    const results: WebResult[] = articles.map((a: any) => ({
      title:   a.title  ?? "",
      url:     a.url    ?? "",
      content: a.title  ?? "",
      source:  a.domain ?? (a.url ? new URL(a.url).hostname.replace(/^www\./, "") : undefined),
      date:    a.seendate ? `${a.seendate.slice(0,4)}-${a.seendate.slice(4,6)}-${a.seendate.slice(6,8)}` : undefined,
    }));
    return { query, results, isLive: results.length > 0 };
  } catch (err) {
    console.warn("[gdelt] fetch error:", (err as Error).message);
    return { query, results: [], isLive: false };
  }
}

// ─── OpenAlex (scholarly works) ───────────────────────────────────────────────
// 200M+ scholarly works. Completely free, no key required.
// Adding mailto puts you in the "polite pool" for higher rate limits.
// https://docs.openalex.org

export interface OpenAlexWork {
  title:         string;
  authors:       string[];
  abstract:      string;
  url:           string;
  date:          string;
  doi:           string;
  citationCount: number;
  concepts:      string[];
}

export async function openAlexSearch(
  query: string,
  maxResults = 6
): Promise<OpenAlexWork[]> {
  try {
    const params = new URLSearchParams({
      search:   query,
      per_page: String(maxResults),
      sort:     "cited_by_count:desc",
      mailto:   "research@ada-labs.io",
    });
    const r = await fetch(`https://api.openalex.org/works?${params}`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.results ?? []).map((w: any) => ({
      title:         w.title ?? "",
      authors:       (w.authorships ?? []).slice(0, 3).map((a: any) => a.author?.display_name ?? ""),
      abstract:      w.abstract_inverted_index
                       ? rebuildAbstract(w.abstract_inverted_index).slice(0, 420)
                       : "",
      url:           w.primary_location?.landing_page_url ?? w.doi ?? "",
      date:          w.publication_date ?? String(w.publication_year ?? ""),
      doi:           w.doi ?? "",
      citationCount: w.cited_by_count ?? 0,
      concepts:      (w.concepts ?? []).slice(0, 4).map((c: any) => c.display_name),
    }));
  } catch (err) {
    console.warn("[openalex] fetch error:", (err as Error).message);
    return [];
  }
}

function rebuildAbstract(inv: Record<string, number[]>): string {
  const words: string[] = [];
  for (const [word, positions] of Object.entries(inv)) {
    for (const pos of positions) words[pos] = word;
  }
  return words.filter(Boolean).join(" ");
}

// ─── Semantic Scholar ─────────────────────────────────────────────────────────
// 200M+ papers. Free without key (100 req/5min). Free key for higher limits.
// Register at: https://www.semanticscholar.org/product/api
// Env var: SEMANTIC_SCHOLAR_API_KEY (optional)

export async function semanticScholarSearch(
  query: string,
  maxResults = 5
): Promise<ArxivPaper[]> {
  try {
    const headers: Record<string, string> = {};
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
      headers["x-api-key"] = process.env.SEMANTIC_SCHOLAR_API_KEY;
    }
    const params = new URLSearchParams({
      query,
      limit:  String(maxResults),
      fields: "title,authors,abstract,year,externalIds,citationCount,url",
    });
    const r = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?${params}`,
      { headers, signal: AbortSignal.timeout(15_000) }
    );
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data ?? []).map((p: any) => ({
      title:    p.title    ?? "",
      authors:  (p.authors ?? []).slice(0, 3).map((a: any) => a.name),
      abstract: (p.abstract ?? "").slice(0, 400),
      url:      p.url ?? (p.externalIds?.DOI ? `https://doi.org/${p.externalIds.DOI}` : ""),
      date:     String(p.year ?? ""),
      id:       p.paperId ?? "",
    }));
  } catch (err) {
    console.warn("[s2] fetch error:", (err as Error).message);
    return [];
  }
}

// ─── Merge + de-duplicate helpers ─────────────────────────────────────────────

/** Merge multiple SearchResponse arrays, de-duplicating by URL. */
export function mergeResults(...responses: SearchResponse[]): SearchResponse {
  const seen  = new Set<string>();
  const out:   WebResult[] = [];
  const query  = responses[0]?.query ?? "";
  const isLive = responses.some(r => r.isLive);
  for (const resp of responses) {
    for (const item of resp.results) {
      const key = item.url.replace(/\/$/, "").toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
  }
  return { query, results: out, isLive };
}

// ─── Crossref ────────────────────────────────────────────────────────────────
// 180M+ scholarly records. DOI metadata, references, publisher info.
// Free, no key. Polite pool: add mailto.

export interface CrossrefWork {
  title:        string;
  authors:      string[];
  doi:          string;
  url:          string;
  date:         string;
  publisher:    string;
  type:         string;
  citedByCount: number;
}

export async function crossrefSearch(query: string, maxResults = 5): Promise<CrossrefWork[]> {
  try {
    const params = new URLSearchParams({
      query,
      rows:   String(maxResults),
      select: "title,author,DOI,URL,published,publisher,type,is-referenced-by-count",
      mailto: "research@ada-labs.io",
    });
    const r = await fetch(`https://api.crossref.org/works?${params}`, {
      headers: { "User-Agent": "ADA-AI-Labs/1.0 (research@ada-labs.io)" },
      signal:  AbortSignal.timeout(15_000),
    });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.message?.items ?? []).map((item: any) => ({
      title:        (item.title?.[0] ?? "").trim(),
      authors:      (item.author ?? []).slice(0, 3).map((a: any) =>
                      [a.given, a.family].filter(Boolean).join(" ")),
      doi:          item.DOI        ?? "",
      url:          item.URL        ?? (item.DOI ? `https://doi.org/${item.DOI}` : ""),
      date:         item.published?.["date-parts"]?.[0]?.join("-") ?? "",
      publisher:    item.publisher  ?? "",
      type:         item.type       ?? "",
      citedByCount: item["is-referenced-by-count"] ?? 0,
    }));
  } catch (err) {
    console.warn("[crossref]", (err as Error).message);
    return [];
  }
}

// ─── CORE (open-access full-text) ────────────────────────────────────────────
// Largest open-access collection — full-text PDFs available.
// Free key (10k/month): https://core.ac.uk/services/api

export function hasCoreKey(): boolean {
  const k = process.env.CORE_API_KEY ?? "";
  return k.length >= 20 && !k.toLowerCase().includes("your");
}

export interface CorePaper {
  title:       string;
  authors:     string[];
  abstract:    string;
  doi:         string;
  year:        number;
  fullTextUrl: string;
}

export async function coreSearch(query: string, maxResults = 5): Promise<CorePaper[]> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (hasCoreKey()) headers["Authorization"] = `Bearer ${process.env.CORE_API_KEY}`;
    const r = await fetch("https://api.core.ac.uk/v3/search/works", {
      method: "POST",
      headers,
      body:   JSON.stringify({ q: query, limit: maxResults }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.results ?? []).map((p: any) => ({
      title:       p.title       ?? "",
      authors:     (p.authors    ?? []).slice(0, 3).map((a: any) => a.name ?? String(a)),
      abstract:    (p.abstract   ?? "").slice(0, 420),
      doi:         p.doi         ?? "",
      year:        p.yearPublished ?? 0,
      fullTextUrl: p.fullTextUrl ?? p.downloadUrl ?? (p.doi ? `https://doi.org/${p.doi}` : ""),
    }));
  } catch (err) {
    console.warn("[core]", (err as Error).message);
    return [];
  }
}

// ─── Europe PMC ───────────────────────────────────────────────────────────────
// 40M+ life-science literature records. Free, no key.

export interface EuropePmcPaper {
  title:    string;
  authors:  string[];
  abstract: string;
  doi:      string;
  year:     string;
  url:      string;
  source:   string;
}

export async function europePmcSearch(query: string, maxResults = 5): Promise<EuropePmcPaper[]> {
  try {
    const params = new URLSearchParams({
      query, resultType: "core",
      pageSize: String(maxResults),
      format:   "json",
      sort:     "CITED desc",
    });
    const r = await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?${params}`,
      { signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.resultList?.result ?? []).map((p: any) => ({
      title:    p.title       ?? "",
      authors:  p.authorString ? p.authorString.split(", ").slice(0, 3) : [],
      abstract: (p.abstractText ?? "").slice(0, 420),
      doi:      p.doi         ?? "",
      year:     String(p.pubYear ?? ""),
      url:      p.doi ? `https://doi.org/${p.doi}`
                      : (p.pmcid ? `https://europepmc.org/article/PMC/${p.pmcid.replace("PMC", "")}` : ""),
      source:   p.source ?? "Europe PMC",
    }));
  } catch (err) {
    console.warn("[europepmc]", (err as Error).message);
    return [];
  }
}

// ─── Wikidata ─────────────────────────────────────────────────────────────────
// Structured knowledge graph: people, places, events, concepts. Free, no key.

export interface WikidataEntity {
  id:          string;
  label:       string;
  description: string;
  url:         string;
}

export async function wikidataSearch(query: string, maxResults = 8): Promise<WikidataEntity[]> {
  try {
    const params = new URLSearchParams({
      action: "wbsearchentities", search: query,
      language: "en", limit: String(maxResults),
      format: "json", origin: "*",
    });
    const r = await fetch(`https://www.wikidata.org/w/api.php?${params}`,
      { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.search ?? []).map((e: any) => ({
      id:          e.id          ?? "",
      label:       e.label       ?? "",
      description: e.description ?? "",
      url:         e.concepturi  ?? `https://www.wikidata.org/wiki/${e.id}`,
    }));
  } catch (err) {
    console.warn("[wikidata]", (err as Error).message);
    return [];
  }
}

export async function wikidataSparql(sparql: string): Promise<Record<string, string>[]> {
  try {
    const r = await fetch("https://query.wikidata.org/sparql", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept":        "application/sparql-results+json",
        "User-Agent":    "ADA-AI-Labs/1.0 (research@ada-labs.io)",
      },
      body:   `query=${encodeURIComponent(sparql)}`,
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) return [];
    const d = await r.json();
    const vars: string[] = d.head?.vars ?? [];
    return (d.results?.bindings ?? []).map((row: any) =>
      Object.fromEntries(vars.map(v => [v, row[v]?.value ?? ""]))
    );
  } catch (err) {
    console.warn("[wikidata sparql]", (err as Error).message);
    return [];
  }
}

// ─── Internet Archive ─────────────────────────────────────────────────────────
// Scanned books, manuscripts, historical documents. Free, no key.

export async function internetArchiveSearch(
  query: string,
  opts: { mediatype?: string; maxResults?: number } = {}
): Promise<WebResult[]> {
  try {
    const q = opts.mediatype ? `${query} AND mediatype:${opts.mediatype}` : query;
    const params = new URLSearchParams({
      q, "fl[]": "identifier,title,description,date,creator", output: "json",
      rows:  String(opts.maxResults ?? 8),
      sort:  "downloads desc",
    });
    const r = await fetch(`https://archive.org/advancedsearch.php?${params}`,
      { signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.response?.docs ?? []).map((doc: any) => ({
      title:   doc.title       ?? doc.identifier ?? "",
      url:     `https://archive.org/details/${doc.identifier}`,
      content: doc.description ?? doc.creator ?? "",
      source:  "archive.org",
      date:    doc.date        ?? undefined,
    }));
  } catch (err) {
    console.warn("[archive.org]", (err as Error).message);
    return [];
  }
}

// ─── Open Library ─────────────────────────────────────────────────────────────
// Bibliographic records + digitized books. Free, no key.

export interface OpenLibraryBook {
  title:        string;
  authors:      string[];
  year:         string;
  subjects:     string[];
  url:          string;
  editionCount: number;
}

export async function openLibrarySearch(query: string, maxResults = 6): Promise<OpenLibraryBook[]> {
  try {
    const params = new URLSearchParams({
      q: query, limit: String(maxResults),
      fields: "title,author_name,first_publish_year,subject,key,edition_count",
    });
    const r = await fetch(`https://openlibrary.org/search.json?${params}`,
      { signal: AbortSignal.timeout(12_000) });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.docs ?? []).map((b: any) => ({
      title:        b.title            ?? "",
      authors:      (b.author_name     ?? []).slice(0, 3),
      year:         String(b.first_publish_year ?? ""),
      subjects:     (b.subject         ?? []).slice(0, 4),
      url:          `https://openlibrary.org${b.key}`,
      editionCount: b.edition_count    ?? 0,
    }));
  } catch (err) {
    console.warn("[openlibrary]", (err as Error).message);
    return [];
  }
}

// ─── World Bank Data API ──────────────────────────────────────────────────────
// Global economic, social, development datasets. Free, no key.

export async function worldBankSearch(query: string, maxResults = 5): Promise<WebResult[]> {
  try {
    const params = new URLSearchParams({
      qterm: query, rows: String(maxResults),
      format: "json", srt: "score", order: "desc",
    });
    const r = await fetch(`https://search.worldbank.org/api/v2/wds?${params}`,
      { signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return [];
    const d = await r.json();
    const docs: any[] = d.documents
      ? Object.values(d.documents).filter((v: any) => typeof v === "object" && v?.id)
      : [];
    return docs.slice(0, maxResults).map((doc: any) => ({
      title:   doc.display_title ?? doc.title ?? "",
      url:     doc.url ?? doc.pdfurl ?? `https://documents.worldbank.org/en/publication/documents-reports/documentdetail/${doc.id}`,
      content: doc.abstract ?? doc.subtopic ?? "",
      source:  "worldbank.org",
      date:    doc.docdt ?? undefined,
    }));
  } catch (err) {
    console.warn("[worldbank]", (err as Error).message);
    return [];
  }
}

// ─── FRED (Federal Reserve Economic Data) ─────────────────────────────────────
// 800k+ economic time series. Free key: https://fred.stlouisfed.org/docs/api/api_key.html

export function hasFredKey(): boolean {
  const k = process.env.FRED_API_KEY ?? "";
  return k.length >= 20 && !k.toLowerCase().includes("your");
}

export interface FredSeries {
  id:          string;
  title:       string;
  units:       string;
  frequency:   string;
  lastUpdated: string;
  url:         string;
}

export async function fredSearch(query: string, maxResults = 6): Promise<FredSeries[]> {
  if (!hasFredKey()) return [];
  try {
    const params = new URLSearchParams({
      search_text: query, api_key: process.env.FRED_API_KEY!,
      file_type: "json", limit: String(maxResults),
      order_by: "popularity", sort_order: "desc",
    });
    const r = await fetch(`https://api.stlouisfed.org/fred/series/search?${params}`,
      { signal: AbortSignal.timeout(12_000) });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.seriess ?? []).map((s: any) => ({
      id:          s.id           ?? "",
      title:       s.title        ?? "",
      units:       s.units        ?? "",
      frequency:   s.frequency    ?? "",
      lastUpdated: s.last_updated ?? "",
      url:         `https://fred.stlouisfed.org/series/${s.id}`,
    }));
  } catch (err) {
    console.warn("[fred]", (err as Error).message);
    return [];
  }
}

// ─── OpenCitations ────────────────────────────────────────────────────────────
// Open citation graph — citation network traversal. Free, no key.

export interface OpenCitation {
  citing:   string;
  cited:    string;
  creation: string;
}

export async function openCitationsFor(doi: string, limit = 10): Promise<OpenCitation[]> {
  try {
    const clean = doi.replace(/^https?:\/\/doi\.org\//i, "");
    const r = await fetch(
      `https://opencitations.net/index/api/v1/citations/${encodeURIComponent(clean)}`,
      { signal: AbortSignal.timeout(12_000) }
    );
    if (!r.ok) return [];
    const d: OpenCitation[] = await r.json();
    return Array.isArray(d) ? d.slice(0, limit) : [];
  } catch (err) {
    console.warn("[opencitations]", (err as Error).message);
    return [];
  }
}

// ─── OpenCorporates ───────────────────────────────────────────────────────────
// Largest open company database. Free tier: 500 req/day with key.
// Get key: https://opencorporates.com/api_accounts/new

export function hasOpenCorporatesKey(): boolean {
  const k = process.env.OPENCORPORATES_API_KEY ?? "";
  return k.length >= 10 && !k.toLowerCase().includes("your");
}

export async function openCorporatesSearch(query: string, maxResults = 5): Promise<WebResult[]> {
  try {
    const params = new URLSearchParams({ q: query, per_page: String(maxResults) });
    if (hasOpenCorporatesKey()) params.set("api_token", process.env.OPENCORPORATES_API_KEY!);
    const r = await fetch(`https://api.opencorporates.com/v0.4/companies/search?${params}`,
      { signal: AbortSignal.timeout(12_000) });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.results?.companies ?? []).map((c: any) => {
      const co = c.company ?? c;
      return {
        title:   co.name ?? "",
        url:     co.opencorporates_url ?? "",
        content: [co.company_type, co.jurisdiction_code, co.registered_address?.in_full].filter(Boolean).join(" · "),
        source:  "opencorporates.com",
        date:    co.incorporation_date ?? undefined,
      };
    });
  } catch (err) {
    console.warn("[opencorporates]", (err as Error).message);
    return [];
  }
}

// ─── USA Spending ─────────────────────────────────────────────────────────────
// Federal contracts, grants, procurement. Free, no key.

export async function usaSpendingSearch(query: string, maxResults = 5): Promise<WebResult[]> {
  try {
    const body = {
      filters: {
        keywords: [query],
        time_period: [{ start_date: oneYearAgo(), end_date: today() }],
      },
      fields:    ["Award ID", "Recipient Name", "Award Amount", "Awarding Agency", "Award Type", "Start Date"],
      page: 1, limit: maxResults, sort: "Award Amount", order: "desc", subawards: false,
    };
    const r = await fetch("https://api.usaspending.gov/api/v2/search/spending_by_award/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(15_000),
    });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.results ?? []).map((item: any) => ({
      title:   `${item["Award Type"] ?? "Award"}: ${item["Recipient Name"] ?? "Unknown"}`,
      url:     `https://www.usaspending.gov/award/${item["Award ID"] ?? ""}`,
      content: `${item["Awarding Agency"] ?? ""} · $${Number(item["Award Amount"] ?? 0).toLocaleString()} · ${item["Start Date"] ?? ""}`,
      source:  "usaspending.gov",
      date:    item["Start Date"] ?? undefined,
    }));
  } catch (err) {
    console.warn("[usaspending]", (err as Error).message);
    return [];
  }
}

// ─── NewsAPI ──────────────────────────────────────────────────────────────────
// Free dev tier: 100 req/day. Get key: https://newsapi.org/register

export function hasNewsApiKey(): boolean {
  const k = process.env.NEWS_API_KEY ?? "";
  return k.length >= 20 && !k.toLowerCase().includes("your");
}

export async function newsApiSearch(query: string, maxResults = 5): Promise<SearchResponse> {
  if (!hasNewsApiKey()) return { query, results: [], isLive: false };
  try {
    const params = new URLSearchParams({
      q: query, sortBy: "relevancy",
      pageSize: String(maxResults),
      apiKey: process.env.NEWS_API_KEY!, language: "en",
    });
    const r = await fetch(`https://newsapi.org/v2/everything?${params}`,
      { signal: AbortSignal.timeout(12_000) });
    if (!r.ok) return { query, results: [], isLive: false };
    const d = await r.json();
    const results: WebResult[] = (d.articles ?? []).map((a: any) => ({
      title:   a.title       ?? "",
      url:     a.url         ?? "",
      content: a.description ?? a.content ?? "",
      source:  a.source?.name ?? undefined,
      date:    a.publishedAt?.slice(0, 10) ?? undefined,
    }));
    return { query, results, isLive: true };
  } catch (err) {
    console.warn("[newsapi]", (err as Error).message);
    return { query, results: [], isLive: false };
  }
}

// ─── MediaStack ───────────────────────────────────────────────────────────────
// Free tier: 500 req/month. Get key: https://mediastack.com

export function hasMediaStackKey(): boolean {
  const k = process.env.MEDIASTACK_API_KEY ?? "";
  return k.length >= 20 && !k.toLowerCase().includes("your");
}

export async function mediaStackSearch(query: string, maxResults = 5): Promise<SearchResponse> {
  if (!hasMediaStackKey()) return { query, results: [], isLive: false };
  try {
    const params = new URLSearchParams({
      access_key: process.env.MEDIASTACK_API_KEY!,
      keywords: query, limit: String(maxResults),
      sort: "published_desc", languages: "en",
    });
    const r = await fetch(`http://api.mediastack.com/v1/news?${params}`,
      { signal: AbortSignal.timeout(12_000) });
    if (!r.ok) return { query, results: [], isLive: false };
    const d = await r.json();
    const results: WebResult[] = (d.data ?? []).map((a: any) => ({
      title:   a.title       ?? "",
      url:     a.url         ?? "",
      content: a.description ?? "",
      source:  a.source      ?? undefined,
      date:    a.published_at?.slice(0, 10) ?? undefined,
    }));
    return { query, results, isLive: true };
  } catch (err) {
    console.warn("[mediastack]", (err as Error).message);
    return { query, results: [], isLive: false };
  }
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function fmtWebResults(resp: SearchResponse): string {
  if (!resp.results.length) return "> _No results returned._";
  const lines: string[] = [];
  if (resp.answer) {
    lines.push(`**Summary:** ${resp.answer}\n`);
  }
  resp.results.forEach((r, i) => {
    const date = r.date ? ` · ${r.date.slice(0, 10)}` : "";
    const src  = r.source ? ` · ${r.source}` : "";
    lines.push(`**${i + 1}. [${r.title}](${r.url})**${src}${date}`);
    if (r.content) {
      const excerpt = r.content.slice(0, 300).replace(/\n/g, " ");
      lines.push(`> ${excerpt}${r.content.length > 300 ? "…" : ""}`);
    }
    lines.push("");
  });
  return lines.join("\n");
}

export function fmtArxivResults(papers: ArxivPaper[]): string {
  if (!papers.length) return "> _No papers found._";
  return papers.map((p, i) => {
    const authors = p.authors.length ? p.authors.join(", ") + (p.authors.length < 3 ? "" : " et al.") : "Unknown";
    const abs = p.abstract.slice(0, 280).replace(/\n/g, " ");
    return [
      `**${i + 1}. [${p.title}](${p.url})**`,
      `*${authors} · ${p.date}*`,
      `> ${abs}${p.abstract.length > 280 ? "…" : ""}`,
      "",
    ].join("\n");
  }).join("\n");
}

export function fmtOpenAlexResults(works: OpenAlexWork[]): string {
  if (!works.length) return "> _No OpenAlex results._";
  return works.map((w, i) => {
    const authors  = w.authors.length ? w.authors.join(", ") : "Unknown";
    const cited    = w.citationCount  ? ` · **${w.citationCount} citations**` : "";
    const concepts = w.concepts.length ? ` · ${w.concepts.join(", ")}` : "";
    const abs      = w.abstract ? `> ${w.abstract.slice(0, 300).replace(/\n/g, " ")}${w.abstract.length > 300 ? "…" : ""}` : "";
    return [
      `**${i + 1}. [${w.title}](${w.url})**`,
      `*${authors} · ${w.date}${cited}${concepts}*`,
      abs,
      "",
    ].join("\n");
  }).join("\n");
}

export function fmtCrossrefResults(works: CrossrefWork[]): string {
  if (!works.length) return "> _No Crossref results._";
  return works.map((w, i) => {
    const authors  = w.authors.length ? w.authors.join(", ") : "Unknown";
    const cited    = w.citedByCount ? ` · **${w.citedByCount} citations**` : "";
    const pub      = w.publisher ? ` · ${w.publisher}` : "";
    return `**${i + 1}. [${w.title || "Untitled"}](${w.url || `https://doi.org/${w.doi}`})**\n*${authors} · ${w.date}${pub}${cited}*`;
  }).join("\n\n");
}

export function fmtCorePapers(papers: CorePaper[]): string {
  if (!papers.length) return "> _No CORE full-text results._";
  return papers.map((p, i) => {
    const authors = p.authors.length ? p.authors.join(", ") : "Unknown";
    const abs     = p.abstract ? `> ${p.abstract.slice(0, 280).replace(/\n/g, " ")}…` : "";
    return [
      `**${i + 1}. [${p.title || "Untitled"}](${p.fullTextUrl})** *(open access)*`,
      `*${authors} · ${p.year || "n/a"}*`,
      abs,
    ].filter(Boolean).join("\n");
  }).join("\n\n");
}

export function fmtEuropePmcResults(papers: EuropePmcPaper[]): string {
  if (!papers.length) return "> _No Europe PMC results._";
  return papers.map((p, i) => {
    const authors = p.authors.length ? p.authors.join(", ") : "Unknown";
    const abs     = p.abstract ? `> ${p.abstract.slice(0, 280).replace(/\n/g, " ")}…` : "";
    return [
      `**${i + 1}. [${p.title || "Untitled"}](${p.url})**`,
      `*${authors} · ${p.year} · ${p.source}*`,
      abs,
    ].filter(Boolean).join("\n");
  }).join("\n\n");
}

export function fmtWikidataEntities(entities: WikidataEntity[]): string {
  if (!entities.length) return "> _No Wikidata entities found._";
  return entities.map((e, i) =>
    `**${i + 1}. [${e.label}](${e.url})** (${e.id})\n*${e.description || "No description"}*`
  ).join("\n\n");
}

export function fmtOpenLibraryBooks(books: OpenLibraryBook[]): string {
  if (!books.length) return "> _No Open Library results._";
  return books.map((b, i) => {
    const authors   = b.authors.length ? b.authors.join(", ") : "Unknown";
    const subjects  = b.subjects.length ? ` · ${b.subjects.join(", ")}` : "";
    const editions  = b.editionCount   ? ` · ${b.editionCount} editions` : "";
    return `**${i + 1}. [${b.title}](${b.url})**\n*${authors} · ${b.year}${editions}${subjects}*`;
  }).join("\n\n");
}

export function fmtFredSeries(series: FredSeries[]): string {
  if (!series.length) return "> _No FRED series found. Check your FRED_API_KEY._";
  return series.map((s, i) =>
    `**${i + 1}. [${s.title}](${s.url})**\n*${s.units} · ${s.frequency} · Updated ${s.lastUpdated.slice(0, 10)}*`
  ).join("\n\n");
}

export function fmtSecFilings(filings: SecFiling[]): string {
  if (!filings.length) return "> _No EDGAR filings found._";
  return filings.map((f, i) =>
    `**${i + 1}. [${f.form} — ${f.company}](${f.url})** · filed ${f.filed}\n> ${f.description}`
  ).join("\n\n");
}

export function tavilyNote(isLive: boolean): string {
  if (isLive) return `> _Sources: live web via Tavily Search · ${today()}_`;
  return [
    "> _Web search: **stub** — add `TAVILY_API_KEY` to .env for live results._",
    "> _Get a free key (1k searches/mo) at [app.tavily.com](https://app.tavily.com)._",
  ].join("\n");
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function today(): string { return new Date().toISOString().slice(0, 10); }
function oneYearAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}
