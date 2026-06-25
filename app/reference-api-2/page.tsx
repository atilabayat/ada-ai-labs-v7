import { PageInner, PageHead } from "@/components/ui";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ApiEntry {
  n: number;
  name: string;
  desc: string;
  docs: string;
  keyRequired?: boolean;
  code: string;
}
interface ApiSection {
  id: string;
  title: string;
  color: string;
  apis: ApiEntry[];
}

// ── Data ───────────────────────────────────────────────────────────────────────
const SECTIONS: ApiSection[] = [
  {
    id: "classics",
    title: "I. Classics & Ancient Texts",
    color: "text-accent-teal",
    apis: [
      {
        n: 1,
        name: "Perseus / Scaife Viewer (CTS API)",
        desc: "Canonical Greek and Latin texts via CTS URNs — the backbone of digital classics.",
        docs: "https://scaife.perseus.org",
        code: `# Iliad, Book 1, lines 1–10 (Greek)
r = requests.get("https://scaife-cts.perseus.org/api/cts", params={
    "request": "GetPassage",
    "urn": "urn:cts:greekLit:tlg0012.tlg001.perseus-grc2:1.1-1.10"
})
print(r.text[:500])  # TEI XML`,
      },
      {
        n: 2,
        name: "Pleiades (Ancient Places Gazetteer)",
        desc: "~40,000 ancient places with stable URIs, coordinates, names, and time periods.",
        docs: "https://pleiades.stoa.org/help/api",
        code: `# Athens: place 579885
r = requests.get("https://pleiades.stoa.org/places/579885/json", headers=HEADERS)
d = r.json()
print(d["title"], d["reprPoint"], [n["romanized"] for n in d["names"]][:5])`,
      },
      {
        n: 3,
        name: "Papyri.info (DDbDP / APIS)",
        desc: "Documentary papyri with EpiDoc TEI source for every text; SPARQL endpoint for relations.",
        docs: "https://papyri.info/docs/api",
        code: `# P.Oxy. I 1 — TEI source
r = requests.get("https://papyri.info/ddbdp/p.oxy;1;1/source", headers=HEADERS)
print(r.text[:400])`,
      },
      {
        n: 4,
        name: "Epigraphic Database Heidelberg (EDH)",
        desc: "~80,000 Latin inscriptions with findspots, dating, and people. Clean JSON API.",
        docs: "https://edh.ub.uni-heidelberg.de/data/api",
        code: `r = requests.get("https://edh.ub.uni-heidelberg.de/data/api/inschrift/suche",
                 params={"fo_antik": "Roma", "dat_jahr_a": "1", "dat_jahr_e": "100", "limit": 5})
for item in r.json().get("items", []):
    print(item.get("id"), item.get("transcription", "")[:80])`,
      },
      {
        n: 5,
        name: "Nomisma.org (Numismatics, SPARQL)",
        desc: "Linked-data hub for ancient numismatic concepts — mints, denominations, hoards.",
        docs: "http://nomisma.org/documentation/apis",
        code: `q = """
PREFIX nm: <http://nomisma.org/id/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?mint ?label WHERE {
  ?mint a <http://nomisma.org/ontology#Mint> ; skos:prefLabel ?label .
  FILTER(lang(?label)="en")
} LIMIT 10"""
r = requests.get("http://nomisma.org/query", params={"query": q, "output": "json"})
for b in r.json()["results"]["bindings"]:
    print(b["label"]["value"])`,
      },
      {
        n: 6,
        name: "OCRE — Online Coins of the Roman Empire",
        desc: "Type corpus of Roman imperial coinage (RIC), hosted by the American Numismatic Society.",
        docs: "http://numismatics.org/ocre/apis",
        code: `r = requests.get("http://numismatics.org/ocre/apis/search",
                 params={"q": 'authority_facet:"Augustus" AND denomination_facet:"Denarius"',
                         "format": "json"})
docs = r.json().get("response", {}).get("docs", [])
for c in docs[:5]:
    print(c.get("recordId"), c.get("title"))`,
      },
      {
        n: 7,
        name: "Trismegistos",
        desc: "Master index of ancient texts (TM numbers), people, and places. Full access requires free academic registration.",
        docs: "https://www.trismegistos.org/dataservices/",
        code: `# Open TM text metadata lookup
r = requests.get("https://www.trismegistos.org/dataservices/texrelations/texrelations.php",
                 params={"id": "412"}, headers=HEADERS)
print(r.text[:300])`,
      },
    ],
  },
  {
    id: "archaeology",
    title: "II. Archaeology & Material Culture",
    color: "text-accent-amber",
    apis: [
      {
        n: 8,
        name: "Open Context",
        desc: "Peer-reviewed archaeological field data — excavation records, artifacts, faunal data.",
        docs: "https://opencontext.org/about/services",
        code: `r = requests.get("https://opencontext.org/search/.json",
                 params={"q": "amphora", "rows": 5}, headers=HEADERS)
for item in r.json().get("oc-api:has-results", []):
    print(item.get("label"), "—", item.get("uri"))`,
      },
      {
        n: 9,
        name: "Portable Antiquities Scheme (PAS)",
        desc: "1.5M+ archaeological finds recorded by the public in England and Wales.",
        docs: "https://finds.org.uk/documentation/api",
        code: `r = requests.get("https://finds.org.uk/database/search/results/q/roman+denarius/format/json",
                 headers=HEADERS)
for f in r.json().get("results", [])[:5]:
    print(f.get("old_findID"), f.get("objecttype"), f.get("broadperiod"))`,
      },
      {
        n: 10,
        name: "iDAI Arachne (German Archaeological Institute)",
        desc: "Central object database of the DAI — sculpture, architecture, excavation photos.",
        docs: "https://arachne.dainst.org",
        code: `r = requests.get("https://arachne.dainst.org/data/search",
                 params={"q": "Pergamon Altar", "limit": 5}, headers=HEADERS)
for e in r.json().get("entities", []):
    print(e.get("entityId"), e.get("title"))`,
      },
      {
        n: 11,
        name: "iDAI Gazetteer",
        desc: "DAI's place-name service, cross-linked to Pleiades and GeoNames.",
        docs: "https://gazetteer.dainst.org",
        code: `r = requests.get("https://gazetteer.dainst.org/search.json",
                 params={"q": "Pergamon", "limit": 3}, headers=HEADERS)
for g in r.json().get("result", []):
    print(g["prefName"]["title"], g.get("prefLocation", {}).get("coordinates"))`,
      },
      {
        n: 12,
        name: "The Metropolitan Museum of Art Collection API",
        desc: "~500K objects, ~half with open-access images. No key. Excellent for Greek/Roman galleries.",
        docs: "https://metmuseum.github.io",
        code: `r = requests.get("https://collectionapi.metmuseum.org/public/collection/v1/search",
                 params={"q": "kylix", "departmentId": 13})  # 13 = Greek and Roman Art
ids = r.json()["objectIDs"][:3]
for oid in ids:
    obj = requests.get(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}").json()
    print(obj["title"], "|", obj["objectDate"], "|", obj["primaryImageSmall"])`,
      },
      {
        n: 13,
        name: "Getty Vocabularies (AAT / TGN / ULAN, SPARQL)",
        desc: "Controlled vocabularies for art-historical concepts, geographic names, and artist names.",
        docs: "http://vocab.getty.edu/queries",
        code: `q = """
SELECT ?c ?label WHERE {
  ?c a skos:Concept ; luc:term "amphorae" ;
     skos:inScheme <http://vocab.getty.edu/aat/> ;
     gvp:prefLabelGVP/xl:literalForm ?label .
} LIMIT 5"""
r = requests.get("http://vocab.getty.edu/sparql.json", params={"query": q})
for b in r.json()["results"]["bindings"]:
    print(b["c"]["value"], "—", b["label"]["value"])`,
      },
    ],
  },
  {
    id: "philosophy",
    title: "III. Philosophy & Intellectual History",
    color: "text-accent",
    apis: [
      {
        n: 14,
        name: "PhilPapers API",
        desc: "The bibliographic database for philosophy — 2.5M+ entries. Free academic key.",
        docs: "https://philpapers.org/help/api/",
        keyRequired: true,
        code: `r = requests.get("https://philpapers.org/philpapers/raw/search.json",
                 params={"apiId": "YOUR_ID", "apiKey": "YOUR_KEY",
                         "searchStr": "quantum logic", "limit": 5})
for rec in r.json():
    print(rec.get("title"), "—", ", ".join(a for a in rec.get("authors", [])))`,
      },
      {
        n: 15,
        name: "InPhO — Indiana Philosophy Ontology",
        desc: "Machine-readable taxonomy of philosophical ideas and thinkers, built atop the SEP.",
        docs: "https://www.inphoproject.org/docs/",
        code: `r = requests.get("https://www.inphoproject.org/thinker.json",
                 params={"q": "Heidegger"}, headers=HEADERS)
for t in r.json().get("responseData", {}).get("results", [])[:3]:
    print(t.get("label"), t.get("birth_string"), "–", t.get("death_string"))`,
      },
      {
        n: 16,
        name: "Wikidata SPARQL",
        desc: "Philosophers, influence networks, schools, dates, works — the most flexible structured-data source for intellectual history.",
        docs: "https://query.wikidata.org",
        code: `q = """
SELECT ?p ?pLabel ?influencedLabel WHERE {
  ?p wdt:P106 wd:Q4964182 .          # occupation: philosopher
  ?p wdt:P737 ?influenced .          # influenced by
  ?p wdt:P135 wd:Q183107 .           # movement: phenomenology
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 15"""
r = requests.get("https://query.wikidata.org/sparql",
                 params={"query": q, "format": "json"}, headers=HEADERS)
for b in r.json()["results"]["bindings"]:
    print(b["pLabel"]["value"], "← influenced by →", b["influencedLabel"]["value"])`,
      },
      {
        n: 17,
        name: "OpenAlex",
        desc: "Open scholarly graph (replaced Microsoft Academic). Filter by concept/field for humanities; citation networks free.",
        docs: "https://docs.openalex.org",
        code: `r = requests.get("https://api.openalex.org/works",
                 params={"search": "Aristotle Metaphysics reception",
                         "filter": "primary_topic.field.id:fields/12",
                         "per-page": 5, "mailto": "you@example.com"})
for w in r.json()["results"]:
    print(w["title"], "|", w["publication_year"], "| cited:", w["cited_by_count"])`,
      },
    ],
  },
  {
    id: "archives",
    title: "IV. Historical Archives & Libraries",
    color: "text-accent-rose",
    apis: [
      {
        n: 18,
        name: "Europeana",
        desc: "~60M digitized items from European museums, libraries, and archives. Free key by email.",
        docs: "https://apis.europeana.eu",
        keyRequired: true,
        code: `r = requests.get("https://api.europeana.eu/record/v2/search.json",
                 params={"wskey": "YOUR_KEY", "query": "Thucydides manuscript", "rows": 5})
for item in r.json().get("items", []):
    print(item.get("title", ["?"])[0], "—", item.get("dataProvider", ["?"])[0])`,
      },
      {
        n: 19,
        name: "DPLA — Digital Public Library of America",
        desc: "Aggregates metadata from US libraries, archives, and museums. Free key by email.",
        docs: "https://pro.dp.la/developers/api-codex",
        keyRequired: true,
        code: `r = requests.get("https://api.dp.la/v2/items",
                 params={"q": "Boston College philosophy lectures",
                         "api_key": "YOUR_KEY", "page_size": 5})
for d in r.json().get("docs", []):
    print(d["sourceResource"].get("title"))`,
      },
      {
        n: 20,
        name: "Library of Congress (loc.gov JSON)",
        desc: "Nearly every loc.gov page returns JSON with ?fo=json — search, collections, items, maps, photos.",
        docs: "https://www.loc.gov/apis/",
        code: `r = requests.get("https://www.loc.gov/search/",
                 params={"q": "Alexander Hamilton letters", "fo": "json", "c": 5})
for item in r.json().get("results", []):
    print(item.get("title"), "—", item.get("date"))`,
      },
      {
        n: 21,
        name: "Chronicling America (Historic US Newspapers)",
        desc: "Full-text searchable newspapers 1756–1963 with page-level OCR.",
        docs: "https://chroniclingamerica.loc.gov/about/api/",
        code: `r = requests.get("https://chroniclingamerica.loc.gov/search/pages/results/",
                 params={"andtext": "stock exchange panic", "date1": "1907",
                         "date2": "1908", "dateFilterType": "yearRange",
                         "format": "json", "rows": 5})
for it in r.json().get("items", []):
    print(it["title"], "|", it["date"], "|", it["ocr_eng"][:80].replace("\\n", " "))`,
      },
      {
        n: 22,
        name: "Internet Archive (Advanced Search + Metadata)",
        desc: "Search 35M+ texts; fetch full item metadata and file lists. No key for read access.",
        docs: "https://archive.org/developers/",
        code: `r = requests.get("https://archive.org/advancedsearch.php",
                 params={"q": "creator:(Werner Jaeger) AND mediatype:texts",
                         "fl[]": ["identifier", "title", "year"],
                         "rows": 5, "output": "json"})
for d in r.json()["response"]["docs"]:
    print(d.get("year"), d["title"],
          "→ https://archive.org/details/" + d["identifier"])`,
      },
      {
        n: 23,
        name: "HathiTrust Bibliographic API",
        desc: "Look up volumes by OCLC/LCCN/ISBN; returns rights status and catalog records.",
        docs: "https://www.hathitrust.org/bib_api",
        code: `r = requests.get("https://catalog.hathitrust.org/api/volumes/brief/oclc/424023.json")
d = r.json()
for rec in d.get("records", {}).values():
    print(rec["titles"][0], rec.get("publishDates"))`,
      },
      {
        n: 24,
        name: "Smithsonian Open Access",
        desc: "4.5M+ CC0 records and images across all Smithsonian museums. Key via api.data.gov.",
        docs: "https://edan.si.edu/openaccess/apidocs/",
        keyRequired: true,
        code: `r = requests.get("https://api.si.edu/openaccess/api/v1.0/search",
                 params={"q": "Greek vase",
                         "api_key": "YOUR_DATA_GOV_KEY", "rows": 5})
for row in r.json()["response"]["rows"]:
    print(row["title"], "—", row["unitCode"])`,
      },
      {
        n: 25,
        name: "SNAC — Social Networks and Archival Context",
        desc: "Person/family/org records linking archival collections across repositories.",
        docs: "https://portal.snaccooperative.org/api_help",
        code: `r = requests.put("https://api.snaccooperative.org/",
                 json={"command": "search", "term": "Josiah Royce",
                       "entity_type": "person"})
for res in r.json().get("results", [])[:5]:
    print(res.get("nameEntries", [{}])[0].get("original"), "—", res.get("ark"))`,
      },
      {
        n: 26,
        name: "Victoria & Albert Museum API",
        desc: "Half a million object records, IIIF images — no key required.",
        docs: "https://developers.vam.ac.uk",
        code: `r = requests.get("https://api.vam.ac.uk/v2/objects/search",
                 params={"q": "Plato bust", "page_size": 5})
for rec in r.json().get("records", []):
    print(rec.get("_primaryTitle"), "|", rec.get("_primaryDate"))`,
      },
    ],
  },
  {
    id: "social-science",
    title: "V. Social-Science & Economic Datasets",
    color: "text-accent-violet",
    apis: [
      {
        n: 27,
        name: "World Bank Indicators API",
        desc: "16,000+ development indicators, all countries, no key.",
        docs: "https://datahelpdesk.worldbank.org/knowledgebase/topics/125589",
        code: `r = requests.get("https://api.worldbank.org/v2/country/GRC/indicator/NY.GDP.MKTP.CD",
                 params={"format": "json", "date": "2015:2024"})
for row in r.json()[1]:
    print(row["date"], f"{row['value']:.3e}" if row["value"] else "—")`,
      },
      {
        n: 28,
        name: "FRED — Federal Reserve Economic Data",
        desc: "800,000+ US and international time series. Free key required.",
        docs: "https://fred.stlouisfed.org/docs/api/fred/",
        keyRequired: true,
        code: `r = requests.get("https://api.stlouisfed.org/fred/series/observations",
                 params={"series_id": "VIXCLS", "api_key": "YOUR_KEY",
                         "file_type": "json", "observation_start": "2026-05-01"})
for o in r.json()["observations"][-5:]:
    print(o["date"], o["value"])`,
      },
      {
        n: 29,
        name: "US Census Bureau API",
        desc: "Decennial census, ACS, economic census — foundation of US social-science microdata.",
        docs: "https://www.census.gov/data/developers.html",
        code: `r = requests.get("https://api.census.gov/data/2023/acs/acs1",
                 params={"get": "NAME,B01003_001E",
                         "for": "state:09"})  # Connecticut population
print(r.json())`,
      },
      {
        n: 30,
        name: "Harvard Dataverse API",
        desc: "Search and download replication datasets from thousands of social-science studies.",
        docs: "https://guides.dataverse.org/en/latest/api/",
        code: `r = requests.get("https://dataverse.harvard.edu/api/search",
                 params={"q": "Correlates of War", "type": "dataset", "per_page": 5})
for d in r.json()["data"]["items"]:
    print(d["name"], "—", d.get("global_id"))`,
      },
    ],
  },
];

const BONUS = [
  { name: "GDELT v2 DOC API",   desc: "Global news/event monitoring, no key",                         url: "https://api.gdeltproject.org/api/v2/doc/doc?query=...&format=json" },
  { name: "Eurostat",           desc: "EU statistics in JSON-stat format",                             url: "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}" },
  { name: "IPUMS API",          desc: "Census/survey microdata extracts — requires registration",       url: "https://www.ipums.org" },
  { name: "UNHCR Population",   desc: "Refugee/displacement statistics, no key",                       url: "https://api.unhcr.org/population/v1/population/" },
];

const CROSSWALKS = [
  "Pleiades ↔ iDAI Gazetteer ↔ Wikidata  (places)",
  "Nomisma ↔ OCRE  (coins)",
  "Trismegistos ↔ Papyri.info ↔ EDH  (texts)",
  "Getty ULAN ↔ Wikidata ↔ SNAC  (people)",
];

// ── Components ────────────────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative mt-3 rounded-[8px] border border-line bg-bg-0 overflow-x-auto">
      <div className="flex items-center gap-2 border-b border-line px-4 py-[7px]">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">Python</span>
      </div>
      <pre className="px-4 py-3 font-mono text-[11px] leading-relaxed text-[#93c5fd] whitespace-pre overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ApiCard({ api }: { api: ApiEntry }) {
  return (
    <div className="rounded-[10px] border border-line bg-bg-1 p-5">
      <div className="mb-1 flex items-start gap-3">
        <span className="mt-[2px] w-[22px] flex-shrink-0 font-mono text-[10px] text-ink-3">
          {String(api.n).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[13px] text-ink-0">{api.name}</span>
            {api.keyRequired && (
              <span className="rounded-[3px] bg-[rgba(245,183,72,0.1)] px-[6px] py-[2px] font-mono text-[9px] text-accent-amber">
                🔑 key required
              </span>
            )}
            <a
              href={api.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto font-mono text-[9px] text-accent opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap"
            >
              docs →
            </a>
          </div>
          <p className="mt-[5px] font-mono text-[11px] text-ink-3 leading-relaxed">{api.desc}</p>
        </div>
      </div>
      <CodeBlock code={api.code} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReferenceApi2Page() {
  const totalApis   = SECTIONS.reduce((s, sec) => s + sec.apis.length, 0);
  const keyRequired = SECTIONS.flatMap((s) => s.apis).filter((a) => a.keyRequired).length;

  return (
    <PageInner>
      <PageHead
        tag="Workspace · Reference"
        tone="violet"
        title="API Reference with"
        em="Code Examples."
        sub={`${totalApis} APIs across Classics, Archaeology, Philosophy, Historical Archives, and Social Science — with Python (requests) examples for each endpoint.`}
      />

      {/* Stats */}
      <div className="mb-8 grid grid-cols-4 gap-3">
        {[
          [String(totalApis), "APIs documented"],
          ["5",               "Thematic sections"],
          [String(keyRequired), "Require API key"],
          [String(totalApis - keyRequired), "No key needed"],
        ].map(([val, lbl]) => (
          <div key={lbl} className="rounded-[10px] border border-line bg-bg-1 px-4 py-3">
            <div className="font-display text-[22px] font-medium text-accent">{val}</div>
            <div className="mt-[3px] font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Polite header snippet */}
      <div className="mb-8 rounded-[10px] border border-line bg-bg-1 p-5">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
          Standard header — include in all requests
        </div>
        <CodeBlock code={`import requests\nHEADERS = {"User-Agent": "ADGA-Research/1.0 (your@email.com)"}  # required by some endpoints`} />
      </div>

      {/* Resilient fetch wrapper */}
      <div className="mb-10 rounded-[10px] border border-line bg-bg-1 p-5">
        <div className="mb-1 font-semibold text-[13px] text-ink-0">Resilient fetch wrapper</div>
        <p className="mb-1 font-mono text-[11px] text-ink-3">
          DH endpoints are slower and flakier than commercial APIs — use this for anything load-bearing.
        </p>
        <CodeBlock code={`import time

def fetch(url, params=None, retries=3, timeout=30):
    for i in range(retries):
        try:
            r = requests.get(url, params=params, headers=HEADERS, timeout=timeout)
            r.raise_for_status()
            return r
        except requests.RequestException as e:
            if i == retries - 1:
                raise
            time.sleep(2 ** i)  # exponential back-off: 1s, 2s, 4s`} />
      </div>

      {/* TOC */}
      <div className="mb-10 rounded-[10px] border border-line bg-bg-1 p-5">
        <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">Contents</div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
          {SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="flex items-center gap-2 rounded-[6px] px-3 py-2 text-[12px] text-ink-2 transition hover:bg-bg-2 hover:text-ink-0"
            >
              <span className={`font-mono text-[10px] ${sec.color}`}>→</span>
              {sec.title}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((sec) => (
        <section key={sec.id} id={sec.id} className="mb-12">
          <div className="mb-5 flex items-center gap-3">
            <h2 className={`font-display text-[17px] font-semibold ${sec.color}`}>{sec.title}</h2>
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[9px] text-ink-3">{sec.apis.length} APIs</span>
          </div>
          <div className="flex flex-col gap-4">
            {sec.apis.map((api) => (
              <ApiCard key={api.n} api={api} />
            ))}
          </div>
        </section>
      ))}

      {/* Bonus APIs */}
      <section className="mb-12">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="font-display text-[17px] font-semibold text-ink-2">Bonus APIs</h2>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          {BONUS.map((b) => (
            <a
              key={b.name}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-[10px] border border-line bg-bg-1 px-4 py-3 transition hover:border-line-strong hover:bg-bg-2"
            >
              <div className="font-medium text-[13px] text-ink-0 group-hover:text-accent transition-colors">
                {b.name}
              </div>
              <div className="mt-[4px] font-mono text-[11px] text-ink-3">{b.desc}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Linked-data crosswalks */}
      <section className="mb-8">
        <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
          Linked-data crosswalks — shared URIs for cross-database knowledge bases
        </div>
        <div className="rounded-[10px] border border-line bg-bg-1 p-4">
          {CROSSWALKS.map((c) => (
            <div key={c} className="border-b border-line py-[9px] font-mono text-[11px] text-ink-2 last:border-b-0">
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* Key registry */}
      <div className="rounded-[10px] border border-[rgba(245,183,72,0.2)] bg-[rgba(245,183,72,0.04)] p-4">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-accent-amber">
          Key registry — free, email or instant signup
        </div>
        <div className="font-mono text-[11px] text-ink-2 leading-relaxed">
          PhilPapers · Europeana · DPLA · Smithsonian (api.data.gov) · FRED · Census (optional below 500 req/day) · IPUMS
        </div>
      </div>

      <p className="mt-6 font-mono text-[10px] text-ink-3">
        Compiled June 2026 · Endpoints in the digital humanities change more often than commercial APIs — verify against the linked docs before building anything load-bearing on them.
      </p>
    </PageInner>
  );
}
