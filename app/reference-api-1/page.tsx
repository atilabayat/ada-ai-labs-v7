import { PageInner, PageHead } from "@/components/ui";

const APIS = [
  { n: 1,  name: "OpenAlex",                        focus: "Scholarly literature, citations, authors, institutions",                   docs: "https://docs.openalex.org" },
  { n: 2,  name: "Crossref",                        focus: "DOI metadata for academic publications",                                    docs: "https://www.crossref.org/documentation/retrieve-metadata/rest-api/" },
  { n: 3,  name: "ORCID",                           focus: "Researcher identities and publication profiles",                            docs: "https://info.orcid.org/documentation/api-tutorials/" },
  { n: 4,  name: "Europeana",                       focus: "Museums, archives, cultural heritage (60M+ digitized items)",               docs: "https://pro.europeana.eu/page/apis" },
  { n: 5,  name: "DPLA",                            focus: "Historical archives — US libraries, museums, archives",                     docs: "https://dp.la/developers" },
  { n: 6,  name: "Internet Archive",                focus: "Historical books, texts, and media (35M+ items)",                          docs: "https://archive.org/developers/" },
  { n: 7,  name: "Open Library",                    focus: "Books and editions — bibliographic catalog",                               docs: "https://openlibrary.org/developers/api" },
  { n: 8,  name: "HathiTrust",                      focus: "Academic book metadata, rights status, volumes",                           docs: "https://www.hathitrust.org/bib_api" },
  { n: 9,  name: "WorldCat",                        focus: "Global library catalogs via OCLC",                                         docs: "https://developer.api.oclc.org" },
  { n: 10, name: "Wikidata SPARQL",                 focus: "Open knowledge graph — entities, relations, dates",                        docs: "https://query.wikidata.org" },
  { n: 11, name: "Pleiades",                        focus: "Ancient places gazetteer — 40,000 georeferenced locations",                docs: "https://pleiades.stoa.org" },
  { n: 12, name: "Pelagios / Recogito",             focus: "Historical place annotation and linking",                                   docs: "https://pelagios.org" },
  { n: 13, name: "Open Context",                    focus: "Archaeological excavation data — artifacts, faunal records",               docs: "https://opencontext.org" },
  { n: 14, name: "ADS (Archaeology Data Service)",  focus: "Archaeology datasets from UK excavations",                                 docs: "https://archaeologydataservice.ac.uk" },
  { n: 15, name: "tDAR",                            focus: "Archaeological reports and field data",                                    docs: "https://www.tdar.org" },
  { n: 16, name: "Arachne (iDAI)",                  focus: "Classical archaeology — sculpture, architecture, excavation photos",       docs: "https://arachne.dainst.org" },
  { n: 17, name: "Nomisma",                         focus: "Ancient coins — mints, denominations, hoards (linked data)",               docs: "http://nomisma.org" },
  { n: 18, name: "Epigraphic Database Heidelberg",  focus: "Latin inscriptions — 80,000+ with findspots and dating",                  docs: "https://edh.ub.uni-heidelberg.de" },
  { n: 19, name: "Perseus Digital Library",         focus: "Greek and Latin classical texts (CTS API)",                               docs: "https://www.perseus.tufts.edu" },
  { n: 20, name: "CTS (Canonical Text Services)",   focus: "Standard protocol for classical text retrieval by URN",                   docs: "https://cts.readthedocs.io" },
  { n: 21, name: "PhilPapers",                      focus: "Philosophy bibliography — 2.5M+ entries (free API key)",                   docs: "https://philpapers.org" },
  { n: 22, name: "Stanford Encyclopedia of Philosophy", focus: "Philosophy reference articles — no direct API; use InPhO",            docs: "https://plato.stanford.edu" },
  { n: 23, name: "JSTOR Constellate",               focus: "Text mining for humanities journals",                                      docs: "https://constellate.org" },
  { n: 24, name: "ICPSR",                           focus: "Social science datasets — political science, sociology",                   docs: "https://www.icpsr.umich.edu" },
  { n: 25, name: "Harvard Dataverse",               focus: "Replication datasets from academic social-science studies",               docs: "https://guides.dataverse.org" },
  { n: 26, name: "GESIS",                           focus: "Sociology and social sciences — European survey data",                    docs: "https://www.gesis.org" },
  { n: 27, name: "World Bank Data API",             focus: "Historical social and development indicators — all countries",            docs: "https://datahelpdesk.worldbank.org" },
  { n: 28, name: "OECD API",                        focus: "Comparative social-science data — OECD member countries",                 docs: "https://www.oecd.org/sdd/oecd-data-api.htm" },
];

const STACK = [
  { purpose: "Scholarly papers",      api: "OpenAlex" },
  { purpose: "DOI enrichment",        api: "Crossref" },
  { purpose: "Books",                 api: "Open Library + HathiTrust" },
  { purpose: "Classical texts",       api: "Perseus + CTS" },
  { purpose: "Ancient geography",     api: "Pleiades" },
  { purpose: "Ancient coins",         api: "Nomisma" },
  { purpose: "Archaeology",           api: "Open Context + tDAR" },
  { purpose: "Cultural heritage",     api: "Europeana + DPLA" },
  { purpose: "Knowledge graph",       api: "Wikidata" },
  { purpose: "Social science data",   api: "Dataverse + ICPSR + World Bank" },
];

const SECTION_COLORS: Record<string, string> = {
  "Scholarly":      "text-accent-violet",
  "Ancient":        "text-accent-teal",
  "Archaeology":    "text-accent-amber",
  "Philosophy":     "text-accent",
  "Social":         "text-accent-rose",
  "Digital":        "text-accent-teal",
};

function sectionColor(focus: string): string {
  for (const [key, cls] of Object.entries(SECTION_COLORS)) {
    if (focus.toLowerCase().includes(key.toLowerCase())) return cls;
  }
  return "text-ink-2";
}

export default function ReferenceApi1Page() {
  return (
    <PageInner>
      <PageHead
        tag="Workspace · Reference"
        tone="violet"
        title="Humanities &amp; Social"
        em="Science APIs."
        sub="28 data sources covering classical texts, archaeology, philosophy, historical archives, and social science datasets — with docs links and recommended stack."
      />

      {/* Stats bar */}
      <div className="mb-8 grid grid-cols-4 gap-3">
        {[
          ["28", "Total APIs"],
          ["10", "Recommended Stack"],
          ["Free", "Most Require No Key"],
          ["Open", "All Open Access"],
        ].map(([val, lbl]) => (
          <div key={lbl} className="rounded-[10px] border border-line bg-bg-1 px-4 py-3">
            <div className="font-display text-[22px] font-medium text-accent">{val}</div>
            <div className="mt-[3px] font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">{lbl}</div>
          </div>
        ))}
      </div>

      {/* API grid */}
      <h2 className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">All APIs</h2>
      <div className="mb-10 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
        {APIS.map((api) => (
          <a
            key={api.n}
            href={api.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-3 rounded-[10px] border border-line bg-bg-1 px-4 py-3 transition-colors hover:border-line-strong hover:bg-bg-2"
          >
            <span className="mt-[2px] w-[22px] flex-shrink-0 font-mono text-[10px] text-ink-3">
              {String(api.n).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <div className="font-medium text-[13px] text-ink-0 group-hover:text-accent transition-colors truncate">
                {api.name}
              </div>
              <div className="mt-[3px] font-mono text-[11px] text-ink-3 leading-snug line-clamp-2">
                {api.focus}
              </div>
              <div className="mt-[6px] font-mono text-[9px] text-accent opacity-60 group-hover:opacity-100 transition-opacity">
                docs →
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Recommended stack */}
      <h2 className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">Recommended Digital Humanities Stack</h2>
      <div className="rounded-[12px] border border-line bg-bg-1 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-line">
              <th className="px-5 py-3 text-left font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3 w-[40%]">Purpose</th>
              <th className="px-5 py-3 text-left font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">API</th>
            </tr>
          </thead>
          <tbody>
            {STACK.map((row, i) => (
              <tr
                key={row.purpose}
                className={`border-b border-line last:border-b-0 ${i % 2 === 0 ? "" : "bg-bg-0"}`}
              >
                <td className="px-5 py-[10px] font-mono text-[11px] text-ink-3">{row.purpose}</td>
                <td className="px-5 py-[10px] font-medium text-ink-1">{row.api}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 font-mono text-[10px] text-ink-3">
        Compiled June 2026 · For Python examples, authentication details, and cross-database crosswalks, see{" "}
        <span className="text-accent">Reference Source API 2</span>.
      </p>
    </PageInner>
  );
}
