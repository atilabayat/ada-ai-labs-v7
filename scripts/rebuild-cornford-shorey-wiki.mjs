/**
 * Rebuilds the "Cornford and Shorey — Comparative Views on Plato" wiki that was
 * lost from the database (confirmed present in the Jun 12 app snapshot, absent
 * from the current dev.db and all local archives).
 *
 * Content sourced from NotebookLM notebook ea2eb3c5-e81b-43a7-98e9-405af5654232
 * ("F. Cornford and Paul Shorey", 7 primary sources) via the `nlm` CLI RAG.
 *
 * Run: node scripts/rebuild-cornford-shorey-wiki.mjs
 * Safe to re-run — upserts the Wiki and replaces its child rows.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SLUG = "cornford-and-shorey-comparative-views-on-plato";

// 7 primary sources from the NotebookLM notebook (5 Cornford, 2 Shorey).
const SOURCES = [
  { title: "Cornford — Greek Religious Thought from Homer to the Age of Alexander", meta: "F. M. Cornford · 1923", sortOrder: 0 },
  { title: "Cornford — Plato and Orpheus",                                          meta: "F. M. Cornford · 1903", sortOrder: 1 },
  { title: "Cornford — Principium Sapientiae: Origins of Greek Philosophical Thought", meta: "F. M. Cornford · 1952", sortOrder: 2 },
  { title: "Cornford — Plato's Cosmology",                                          meta: "F. M. Cornford · 1937", sortOrder: 3 },
  { title: "Cornford — Principium (notes)",                                         meta: "F. M. Cornford",       sortOrder: 4 },
  { title: "Shorey — Collected Papers",                                             meta: "Paul Shorey",          sortOrder: 5 },
  { title: "Shorey — The Republic (Loeb, Vol. II, Introduction)",                   meta: "Paul Shorey · trans.", sortOrder: 6 },
];

const TOC = [
  { anchorId: "introduction",    name: "Introduction",                     sub: false, sortOrder: 0 },
  { anchorId: "two-paradigms",   name: "Two Paradigms",                    sub: false, sortOrder: 1 },
  { anchorId: "unity",           name: "Unity vs. Development",            sub: false, sortOrder: 2 },
  { anchorId: "forms",           name: "The Theory of Forms",              sub: false, sortOrder: 3 },
  { anchorId: "religion",        name: "Religion, Orphism & the Mysteries", sub: true,  sortOrder: 4 },
  { anchorId: "mysticism",       name: "Plato's Mysticism",                sub: true,  sortOrder: 5 },
  { anchorId: "the-good",        name: "The Idea of the Good",             sub: true,  sortOrder: 6 },
  { anchorId: "contrast",        name: "Point-by-Point Contrast",          sub: false, sortOrder: 7 },
  { anchorId: "conclusion",      name: "Conclusion",                       sub: false, sortOrder: 8 },
  { anchorId: "sources",         name: "Sources & Citations",             sub: false, sortOrder: 9 },
];

const PAGELIST = [
  { pageId: "overview",   name: "Overview",                current: true,  sortOrder: 0 },
  { pageId: "paradigms",  name: "Two Paradigms",           current: false, sortOrder: 1 },
  { pageId: "forms",      name: "Theory of Forms",         current: false, sortOrder: 2 },
  { pageId: "religion",   name: "Religion & Mysticism",    current: false, sortOrder: 3 },
  { pageId: "contrast",   name: "Point-by-Point Contrast", current: false, sortOrder: 4 },
  { pageId: "sources",    name: "Sources & Citations",     current: false, sortOrder: 5 },
];

// HTML body for the reader. Uses the established wiki CSS classes
// (wiki-banner-hero, wiki-crumb, wiki-h1, wiki-lede, wiki-meta-row,
//  callout insight / ct-label, wiki-table-wrap / wiki-table).
const CONTENT = `
        <div class="wiki-banner-hero" data-c="philosophy"></div>
        <div class="wiki-crumb">
          <span>Research</span><span class="sep">/</span>
          <span>Wikis</span><span class="sep">/</span>
          <span class="ent">Cornford and Shorey</span>
        </div>
        <h1 class="wiki-h1">Cornford &amp; Shorey: <em>Comparative Views on Plato.</em></h1>
        <div class="wiki-lede">Two of the twentieth century's most influential and fundamentally opposed interpreters of Plato. F. M. Cornford reads Plato through historical anthropology and religious evolution; Paul Shorey reads him as a rigorous, self-consistent logician. Their disagreement turns on a single question: is Plato a poetic seer or a systematic philosopher?</div>

        <div class="wiki-meta-row">
          <div class="mr">Pages <span class="v">6</span></div>
          <div class="mr">Sources <span class="v">7</span></div>
          <div class="mr">Updated <span class="v">just now</span></div>
          <div class="mr">Version <span class="v">v1.0.1</span></div>
        </div>

        <h2 id="introduction">Introduction</h2>
        <p>F. M. Cornford (1874–1943) and Paul Shorey (1857–1934) stand as two of the most influential, yet fundamentally opposed, interpreters of Plato in the twentieth century. Their divergence stems from how each situates Plato within the history of ideas. <strong>Shorey</strong> champions Plato as a rigorous, self-aware master of conceptual logic whose philosophical system remained remarkably consistent across his career. <strong>Cornford</strong>, by contrast, approaches Plato through historical anthropology and religious evolution, viewing the philosopher as the inheritor and transformer of the Greek mystery religions and the pre-Socratic cosmological tradition.</p>

        <div class="callout insight">
          <div class="ct-label">The Central Tension</div>
          <p>Together, their opposed interpretations dramatize a tension internal to Plato's own writing — the rational dialectician versus the inspired poetic seer. Cornford resurrects the spiritual and mythological atmosphere of the ancient world; Shorey demythologizes the texts and demands Plato be respected as a deliberate systematic thinker.</p>
        </div>

        <h2 id="two-paradigms">Two Paradigms</h2>
        <p>The methodological chasm between the two scholars is the root of every downstream disagreement. Cornford employs a historical, anthropological, and religious approach, situating Plato as the intellectual heir of the primitive "seer-poet" or shamanic tradition. Shorey reads Plato through rigorous logical and textual analysis, treating him as a highly self-aware master of conceptual thought who used rhetorical brilliance to embellish — but never to obscure — practical and logical truths.</p>
        <p>This difference is not merely emphasis. It produces two incompatible Platos: Cornford's Plato is continuous with Orpheus, Pythagoras, and the mystery cults; Shorey's Plato is continuous with the analytic refutation of sophistic relativism.</p>

        <h2 id="unity">Unity vs. Development</h2>
        <p>At the core of Shorey's interpretation is his famous <strong>"Unity of Plato's Thought"</strong> thesis. Shorey rejects the notion that Plato's philosophy underwent significant evolution, arguing that the alleged chronological shifts across the dialogues do not reveal an immature mind wrestling with problems later solved, but rather a thinker who adapted his <em>presentation</em> to different dramatic contexts while holding a stable framework from his earliest writings to his last.</p>
        <p>Cornford adopts a <strong>developmental</strong> method. He argues that Plato's thought expanded well beyond the rational agnosticism of the historical Socrates — faithfully reproduced in the early dialogues — into a mature doctrine of immortality and the soul's divine nature, heavily modified by Pythagorean and Orphic influence. On this view Plato becomes the sophisticated successor of the primitive seer-poet. Shorey vigorously dismisses such anthropological comparisons, attacking critics who equate Platonic doctrine with primitive animism or "savage" thought as uncritical and reductive.</p>

        <div class="callout insight">
          <div class="ct-label">Shorey, on style-statistics and dating</div>
          <p>Shorey held that we "can infer nothing as to the composition or date of the Republic from the fact that the ideas are not mentioned where there is no reason for mentioning them," and that hypotheses reading different evolutionary stages into Plato's varying presentations of the Forms are methodologically unsound.</p>
        </div>

        <h2 id="forms">The Theory of Forms</h2>
        <p>The methodological divide profoundly shapes each scholar's treatment of the Theory of Forms.</p>
        <p><strong>Shorey</strong> strips the Forms of any esoteric aura, defining the doctrine technically as "the deliberate and conscious hypostatization of all concepts." He argues that Plato hypostatized abstract general notions — treating them as objective entities outside the mind — as a necessary logical postulate to defeat crude nominalism and to secure a stable basis for ethical and mathematical reasoning. The doctrine, for Shorey, is epistemology, not revelation.</p>
        <p><strong>Cornford</strong> situates the Forms within a deeply religious and cosmological context. He connects the apprehension of the Forms to the Orphic and Pythagorean doctrine of <em>anamnesis</em> (recollection), asserting that the immortal soul recovers knowledge of truths it possessed in a divine, prenatal existence. For Cornford the Forms belong to an unseen, eternal world of which the human soul is a native citizen, and knowing them requires a spiritual purification akin to religious initiation.</p>

        <h3 id="religion">Religion, Orphism &amp; the Mysteries</h3>
        <p>Cornford asserts that Plato actively adopted and transformed the mystical traditions, mystery rites, and Orphic–Pythagorean concepts of his time — the soul's purification, the body as tomb (<em>sōma/sēma</em>), and the escape from bodily bondage. In <em>Plato and Orpheus</em> he reads the <em>Phaedo</em>'s philosophy as "a rehearsal of death," the deliverance of the soul "as from bonds." Shorey minimizes literal religious interpretation, arguing that Plato simply deployed traditional religious language as rhetorical "unction" to inspire moral faith while keeping his logical conclusions distinct from it.</p>

        <h3 id="mysticism">Plato's Mysticism</h3>
        <p>This is the sharpest point of disagreement. Cornford takes the ecstatic language of the dialogues literally: the allegory of the Cave is inspired by the Eleusinian mysteries, symbolizing deliverance from the bodily tomb and the ascent of the spirit toward unity with the divine; the Platonic philosopher experiences a genuine beatific vision of ultimate reality.</p>
        <p>Shorey steadfastly minimizes Plato's literal mysticism. While acknowledging the emotional and poetic power of Plato's symbolism, he insists these are rhetorical devices meant to inspire moral conviction, not naïve superstition. "Plato the rationalist," Shorey writes, "distinctly draws the line between his religious language thrown out at an object and his definite logical and practical conclusions." For Shorey, Plato is "no ascetic" and no visionary mystic — his soaring language merely registers the intensity of his intellectual and moral convictions.</p>

        <h3 id="the-good">The Idea of the Good</h3>
        <p>Cornford views the Idea of the Good and the Beautiful through a spiritual lens: the philosopher's ascent is a religious initiation culminating in a literal vision of transcendent reality. Shorey demystifies it: in ethics the Good is the ultimate "sanction"; in politics it is the ideal of social welfare; in cosmology it is the teleological principle of design. He explicitly rejects the Neoplatonist identification of the Idea of the Good with a transcendent, mystical God, calling it "a regulative not a substantive concept" that "cannot in any metaphysical or literal sense be identified with the Deity."</p>

        <h2 id="contrast">Point-by-Point Contrast</h2>
        <div class="wiki-table-wrap">
          <table class="wiki-table">
            <thead>
              <tr><th>Dimension</th><th>F. M. Cornford</th><th>Paul Shorey</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Overall method</strong></td>
                <td>Historical, anthropological, religious — Plato as heir of the seer-poet/shamanic tradition.</td>
                <td>Logical and textual analysis — Plato as a self-aware master of conceptual thought.</td>
              </tr>
              <tr>
                <td><strong>Development vs. unity</strong></td>
                <td>Developmental: Plato evolves from Socratic agnosticism to a Pythagorean doctrine of the immortal soul.</td>
                <td>"Unity of Plato's Thought" — a stable framework, consistent from first dialogue to last.</td>
              </tr>
              <tr>
                <td><strong>Theory of Forms</strong></td>
                <td>Religious–cosmological doctrine; Forms grasped via <em>anamnesis</em> of a prenatal divine existence.</td>
                <td>"Deliberate and conscious hypostatization of all concepts" — a logical postulate against nominalism.</td>
              </tr>
              <tr>
                <td><strong>Religion / Orphism</strong></td>
                <td>Plato adopts and transforms mystery rites, Orphic purification, the body-as-tomb.</td>
                <td>Religious language is rhetorical "unction," kept distinct from logical conclusions.</td>
              </tr>
              <tr>
                <td><strong>Mysticism</strong></td>
                <td>Genuine: divine madness, beatific vision, spiritual union with the real.</td>
                <td>Denied: soaring language reflects moral intensity, not literal vision.</td>
              </tr>
              <tr>
                <td><strong>The Idea of the Good</strong></td>
                <td>A transcendent reality apprehended through quasi-religious ascent.</td>
                <td>Practical: ethical "sanction," political ideal, cosmological teleology — not God.</td>
              </tr>
              <tr>
                <td><strong>Primitive parallels</strong></td>
                <td>Embraced: direct links between Platonic philosophy and shamanic prophecy/poetry.</td>
                <td>Dismissed as reductive; Plato is a sophisticated conceptual thinker, not a "savage."</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="conclusion">Conclusion</h2>
        <p>Cornford and Shorey offer two distinct paradigms for reading Plato. Cornford's anthropological approach resurrects the spiritual and mythological atmosphere of the ancient Greek world, revealing a Plato whose philosophy integrates religion, poetry, and esoteric wisdom. Shorey's unitarian approach demythologizes the texts, demanding readers respect Plato as a sophisticated logician whose hypostatized concepts were deployed with deliberate, systematic precision against the relativism of the sophists. Their opposed readings endure because each fastens on something genuinely present in Plato — the inspired seer and the rigorous dialectician — and refuses to let the other dissolve it.</p>

        <h2 id="sources">Sources &amp; Citations</h2>
        <p>Comparison synthesized from the seven primary works held in the source notebook — five by Cornford, two by Shorey:</p>
        <ul>
          <li><strong>Cornford</strong>, <em>Greek Religious Thought from Homer to the Age of Alexander</em> (1923)</li>
          <li><strong>Cornford</strong>, <em>Plato and Orpheus</em> (1903)</li>
          <li><strong>Cornford</strong>, <em>Principium Sapientiae: The Origins of Greek Philosophical Thought</em> (1952)</li>
          <li><strong>Cornford</strong>, <em>Plato's Cosmology</em> (1937)</li>
          <li><strong>Cornford</strong>, <em>Principium</em> (working notes)</li>
          <li><strong>Shorey</strong>, <em>Collected Papers</em></li>
          <li><strong>Shorey</strong>, <em>The Republic</em>, Loeb Classical Library Vol. II — Introduction (translation &amp; commentary)</li>
        </ul>
        <div class="callout insight">
          <div class="ct-label">Provenance</div>
          <p>Rebuilt from NotebookLM notebook "F. Cornford and Paul Shorey" (id ea2eb3c5) via RAG over the seven sources. The original wiki was created on or before Jun 12 2026 and lost in a subsequent database reset; this is a faithful reconstruction, not the byte-identical original.</p>
        </div>
`;

async function main() {
  // Upsert the parent wiki.
  await prisma.wiki.upsert({
    where:  { slug: SLUG },
    update: {
      title:      "Cornford and Shorey - Comparative Views on Plato",
      titleEm:    null,
      lede:       "Two opposed twentieth-century interpreters of Plato — Cornford's religious-anthropological method against Shorey's unitarian logic.",
      banner:     "philosophy",
      crumb:      "Research / Wikis / Cornford and Shorey",
      pages:      6,
      updated:    "just now",
      version:    "1.0.1",
      visibility: "workspace",
      env:        "dev",
      content:    CONTENT,
      cardDesc:   "Cornford's religious-anthropological Plato vs. Shorey's unitarian, logical Plato — a point-by-point comparison across method, the Forms, mysticism, and the Good.",
      cardStat1:  "6 pages",
      cardStat2:  "7 sources",
      cardStat3:  "just now",
    },
    create: {
      slug:       SLUG,
      title:      "Cornford and Shorey - Comparative Views on Plato",
      titleEm:    null,
      lede:       "Two opposed twentieth-century interpreters of Plato — Cornford's religious-anthropological method against Shorey's unitarian logic.",
      banner:     "philosophy",
      crumb:      "Research / Wikis / Cornford and Shorey",
      pages:      6,
      updated:    "just now",
      version:    "1.0.1",
      visibility: "workspace",
      env:        "dev",
      content:    CONTENT,
      cardDesc:   "Cornford's religious-anthropological Plato vs. Shorey's unitarian, logical Plato — a point-by-point comparison across method, the Forms, mysticism, and the Good.",
      cardStat1:  "6 pages",
      cardStat2:  "7 sources",
      cardStat3:  "just now",
      sortOrder:  0,
    },
  });

  // Replace child rows (idempotent re-run).
  await prisma.wikiSource.deleteMany({ where: { wikiSlug: SLUG } });
  await prisma.wikiTocItem.deleteMany({ where: { wikiSlug: SLUG } });
  await prisma.wikiPage.deleteMany({ where: { wikiSlug: SLUG } });

  await prisma.wikiSource.createMany({ data: SOURCES.map((s) => ({ ...s, wikiSlug: SLUG })) });
  await prisma.wikiTocItem.createMany({ data: TOC.map((t) => ({ ...t, wikiSlug: SLUG })) });
  await prisma.wikiPage.createMany({ data: PAGELIST.map((p) => ({ ...p, wikiSlug: SLUG })) });

  // Verify.
  const w = await prisma.wiki.findUnique({
    where:   { slug: SLUG },
    include: { sources: true, toc: true, pageList: true },
  });
  console.log("✓ Wiki rebuilt:", w.title);
  console.log("  slug:      ", w.slug);
  console.log("  banner:    ", w.banner, "| visibility:", w.visibility, "| env:", w.env);
  console.log("  content:   ", w.content.length, "bytes");
  console.log("  sources:   ", w.sources.length);
  console.log("  toc items: ", w.toc.length);
  console.log("  pages:     ", w.pageList.length);
  console.log("\n✅  Open at /wikis/" + SLUG);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
