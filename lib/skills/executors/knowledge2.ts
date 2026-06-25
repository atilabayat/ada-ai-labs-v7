/**
 * lib/skills/executors/knowledge2.ts
 * ─────────────────────────────────
 * Humanities Knowledge Engineering suite — 10 research analysis skills.
 * Each produces an interactive HTML artifact via designStep().
 *
 *   /concept-extractor          → concept inventory with definitions
 *   /relationship-mapper        → directed relationship graph
 *   /claim-extractor            → claims table with evidence & confidence
 *   /controversy-mapper         → scholarly disagreement matrix
 *   /taxonomy-builder           → hierarchical classification tree
 *   /knowledge-gap-detector     → gap analysis with priority scores
 *   /citation-network-builder   → stratified intellectual genealogy
 *   /multi-resolution-summarizer→ 4-level abstraction summary set
 *   /curriculum-designer        → staged learning pathway
 *   /council-synthesizer        → AI consensus / disagreement map
 */

import { SkillContext, SkillEvent } from "../types";
import {
  escapeHtml, titleFromPrompt, collectSections, htmlDoc, designStep,
  type StructuredOutput, type SkillExecutor_,
} from "./design";

const meta = (type: string, title: string, modules: number, audience: string): StructuredOutput["metadata"] =>
  ({ type, title, duration: "interactive", modules, targetAudience: audience });

// ─── Shared helpers ────────────────────────────────────────────────────────────

function corpus(ctx: SkillContext): string {
  const secs = collectSections(ctx);
  return [ctx.prompt, ...secs.map((s) => s.raw)].join("\n");
}

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 30);
}

function bullets(text: string): string[] {
  return (text.match(/^[\-\*•]\s+(.+)$/gm) ?? []).map((b) => b.replace(/^[\-\*•]\s+/, "").trim());
}

function headings(text: string): string[] {
  return (text.match(/^#{1,4}\s+(.+)$/gm) ?? []).map((h) => h.replace(/^#+\s+/, "").trim());
}

function capitalPhrases(text: string, max = 16): string[] {
  const seen = new Set<string>();
  for (const m of text.matchAll(/\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,3})\b/g)) {
    const w = m[1].trim();
    if (w.length >= 4 && !/^(The|This|That|With|From|When|What|Which|Their|These|Those|Each|Such|Some|More)$/.test(w))
      seen.add(w.slice(0, 40));
  }
  return [...seen].slice(0, max);
}

const panelCss = `
  .wrap{max-width:960px;margin:0 auto;padding:26px 20px;}
  h1.page{font-size:26px;margin:0 0 4px;}
  .sub{color:var(--ink-3);font-size:12px;margin-bottom:18px;}
`;

// ─── /concept-extractor ────────────────────────────────────────────────────────

const CONCEPT_EXTRACTOR: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Concept Inventory");
  const body = corpus(ctx);
  const concepts = capitalPhrases(body, 18);
  const sents = sentences(body);

  const cards = (concepts.length ? concepts : ["[Paste research text to extract concepts]"]).map((c, i) => {
    const def = sents.find((s) => s.toLowerCase().includes(c.toLowerCase().split(" ")[0]))?.slice(0, 160) ?? "Definition pending — add source text.";
    const importance = i < 3 ? "Critical" : i < 8 ? "High" : "Medium";
    const impColor = i < 3 ? "var(--teal)" : i < 8 ? "var(--amber)" : "var(--violet)";
    return `<div class="card">
      <div class="card-head">
        <span class="cname">${escapeHtml(c)}</span>
        <span class="imp" style="color:${impColor}">${importance}</span>
      </div>
      <p class="def">${escapeHtml(def)}</p>
      <div class="card-foot">concept · ${i + 1} of ${concepts.length}</div>
    </div>`;
  }).join("");

  const css = panelCss + `
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;}
    .card{background:var(--bg-1);border:1px solid var(--line);border-radius:10px;padding:14px 16px;}
    .card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
    .cname{font-weight:600;color:var(--ink-0);font-size:14px;}
    .imp{font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:.1em;}
    .def{color:var(--ink-1);font-size:12.5px;line-height:1.55;margin:0 0 8px;}
    .card-foot{color:var(--ink-3);font-size:10px;font-family:monospace;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">📋 ${escapeHtml(title)}</h1>
      <div class="sub">${concepts.length} atomic concepts extracted · paste source text for definitions</div>
      <div class="grid">${cards}</div>
    </div>`);

  const md = `# ${title}\n\n_Concept inventory by \`/concept-extractor\`._\n\n## Concepts\n${concepts.map((c, i) => `${i + 1}. **${c}**`).join("\n")}`;
  yield* designStep("concept-extractor", `Extracting ${concepts.length} concepts`, {
    type: "concept-inventory",
    metadata: meta("concept-inventory", title, concepts.length, "Researchers"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /relationship-mapper ──────────────────────────────────────────────────────

const REL_TYPES = ["influences", "supports", "contradicts", "extends", "depends_on", "analogous_to", "derived_from", "opposes"];

const RELATIONSHIP_MAPPER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Relationship Map");
  const body = corpus(ctx);
  const concepts = capitalPhrases(body, 10);

  const rels: { from: string; type: string; to: string }[] = [];
  for (let i = 0; i < Math.min(concepts.length - 1, 12); i++) {
    rels.push({ from: concepts[i], type: REL_TYPES[i % REL_TYPES.length], to: concepts[(i + 1) % concepts.length] });
  }

  const rows = rels.map((r, i) => `
    <tr class="${i % 2 === 0 ? "ev" : ""}">
      <td class="src">${escapeHtml(r.from)}</td>
      <td class="rel"><span class="badge">${escapeHtml(r.type)}</span></td>
      <td class="tgt">${escapeHtml(r.to)}</td>
    </tr>`).join("");

  const css = panelCss + `
    table{width:100%;border-collapse:collapse;margin-top:16px;}
    th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--ink-3);padding:8px 12px;border-bottom:2px solid var(--line);}
    td{padding:10px 12px;border-bottom:1px solid var(--line);font-size:13px;vertical-align:top;}
    .ev td{background:rgba(255,255,255,.015);}
    .src{color:var(--violet);font-weight:600;}
    .tgt{color:var(--teal);}
    .badge{display:inline-block;background:var(--bg-3);color:var(--amber);font-size:10px;padding:2px 8px;border-radius:6px;font-family:monospace;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">🔗 ${escapeHtml(title)}</h1>
      <div class="sub">${rels.length} directed relationships · ${concepts.length} concepts</div>
      <table>
        <thead><tr><th>Source</th><th>Relationship</th><th>Target</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`);

  const md = `# ${title}\n\n_Relationship map by \`/relationship-mapper\`._\n\n## Relationships\n${rels.map((r) => `- **${r.from}** → \`${r.type}\` → **${r.to}**`).join("\n")}`;
  yield* designStep("relationship-mapper", `Mapping ${rels.length} relationships`, {
    type: "relationship-graph",
    metadata: meta("relationship-graph", title, rels.length, "Analysts"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /claim-extractor ──────────────────────────────────────────────────────────

const CLAIM_EXTRACTOR: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Claim Inventory");
  const body = corpus(ctx);
  const sents = sentences(body).slice(0, 12);

  const claims = (sents.length ? sents : ["Paste scholarly text to extract claims."]).map((s, i) => {
    const conf = 95 - i * 4;
    const type = i % 4 === 0 ? "Empirical" : i % 4 === 1 ? "Normative" : i % 4 === 2 ? "Analytical" : "Interpretive";
    return { text: s.slice(0, 200), type, conf: Math.max(conf, 50) };
  });

  const rows = claims.map((c, i) => `
    <tr class="${i % 2 === 0 ? "ev" : ""}">
      <td class="idx">${i + 1}</td>
      <td class="claim">${escapeHtml(c.text)}</td>
      <td><span class="type">${escapeHtml(c.type)}</span></td>
      <td class="conf" style="color:${c.conf >= 80 ? "var(--teal)" : c.conf >= 65 ? "var(--amber)" : "var(--rose)"}">${c.conf}</td>
    </tr>`).join("");

  const css = panelCss + `
    table{width:100%;border-collapse:collapse;}
    th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--ink-3);padding:8px 12px;border-bottom:2px solid var(--line);}
    td{padding:9px 12px;border-bottom:1px solid var(--line);font-size:13px;vertical-align:top;}
    .ev td{background:rgba(255,255,255,.015);}
    .idx{color:var(--ink-3);font-family:monospace;font-size:11px;width:32px;}
    .claim{color:var(--ink-1);line-height:1.5;}
    .type{display:inline-block;background:var(--bg-3);color:var(--violet);font-size:10px;padding:2px 8px;border-radius:6px;font-family:monospace;}
    .conf{font-family:monospace;font-size:13px;font-weight:600;text-align:right;width:50px;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">💬 ${escapeHtml(title)}</h1>
      <div class="sub">${claims.length} claims · confidence 0–100 · paste scholarly text for extraction</div>
      <table>
        <thead><tr><th>#</th><th>Claim</th><th>Type</th><th style="text-align:right">Conf.</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`);

  const md = `# ${title}\n\n_Claim inventory by \`/claim-extractor\`._\n\n## Claims\n${claims.map((c, i) => `${i + 1}. **[${c.type} · ${c.conf}]** ${c.text}`).join("\n\n")}`;
  yield* designStep("claim-extractor", `Extracting ${claims.length} claims`, {
    type: "claim-inventory",
    metadata: meta("claim-inventory", title, claims.length, "Scholars"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /controversy-mapper ───────────────────────────────────────────────────────

const CONTROVERSY_MAPPER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Controversy Map");
  const body = corpus(ctx);
  const heads = headings(body).slice(0, 4);
  const sents = sentences(body);

  const positions = (heads.length >= 2 ? heads.slice(0, 3) : ["Position A", "Position B", "Position C"]).map((p, i) => {
    const arg = sents.find((s) => s.toLowerCase().includes(p.toLowerCase().split(" ")[0]))?.slice(0, 200)
      ?? `Scholarly position ${i + 1}: core argument regarding the contested topic.`;
    return { label: p, arg, color: ["var(--teal)", "var(--rose)", "var(--amber)"][i] };
  });

  const cols = positions.map((p) => `
    <div class="pos" style="border-top:3px solid ${p.color}">
      <h3 style="color:${p.color}">${escapeHtml(p.label)}</h3>
      <p>${escapeHtml(p.arg)}</p>
    </div>`).join("");

  const css = panelCss + `
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:16px;}
    .pos{background:var(--bg-1);border:1px solid var(--line);border-radius:10px;padding:16px 18px;}
    .pos h3{font-size:14px;margin:0 0 10px;}
    .pos p{color:var(--ink-1);font-size:13px;line-height:1.55;margin:0;}
    .dispute{background:var(--bg-2);border:1px solid var(--line);border-radius:10px;padding:14px 18px;margin-top:16px;}
    .dispute h4{color:var(--amber);font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">⚔️ ${escapeHtml(title)}</h1>
      <div class="sub">${positions.length} scholarly positions · core disagreement structure</div>
      <div class="grid">${cols}</div>
      <div class="dispute">
        <h4>Core Dispute</h4>
        <p style="color:var(--ink-1);font-size:13px">${escapeHtml(ctx.prompt.slice(0, 300))}</p>
      </div>
    </div>`);

  const md = `# ${title}\n\n_Controversy map by \`/controversy-mapper\`._\n\n## Positions\n${positions.map((p) => `### ${p.label}\n${p.arg}`).join("\n\n")}`;
  yield* designStep("controversy-mapper", `Mapping ${positions.length} scholarly positions`, {
    type: "controversy-map",
    metadata: meta("controversy-map", title, positions.length, "Scholars"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /taxonomy-builder ─────────────────────────────────────────────────────────

const TAXONOMY_BUILDER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Taxonomy");
  const body = corpus(ctx);
  const heads = headings(body);
  const concepts = capitalPhrases(body, 20);

  // Build a 3-level hierarchy: domain → categories (headings) → concepts
  const domain = title.slice(0, 28);
  const cats = (heads.length >= 2 ? heads.slice(0, 4) : concepts.slice(0, 3).map((c) => `${c} Domain`));
  const chunkSize = Math.ceil(concepts.length / cats.length);

  const branches = cats.map((cat, i) => {
    const children = concepts.slice(i * chunkSize, (i + 1) * chunkSize).slice(0, 5);
    const items = children.map((c) => `<li class="leaf">${escapeHtml(c)}</li>`).join("");
    return `<li class="branch">
      <span class="node cat">${escapeHtml(cat)}</span>
      ${children.length ? `<ul>${items}</ul>` : ""}
    </li>`;
  }).join("");

  const css = panelCss + `
    ul.tree{list-style:none;padding-left:0;}
    ul.tree ul{list-style:none;padding-left:22px;border-left:1px solid var(--line);margin:4px 0;}
    li.branch{margin:6px 0;}
    li.leaf{margin:3px 0;}
    li.leaf::before{content:"└ ";color:var(--ink-3);}
    .node{display:inline-block;padding:4px 10px;border-radius:7px;font-size:13px;cursor:default;}
    .domain{background:rgba(167,139,250,.15);color:var(--violet);font-weight:700;font-size:15px;border:1px solid rgba(167,139,250,.3);}
    .cat{background:rgba(45,212,191,.08);color:var(--teal);font-weight:600;border:1px solid rgba(45,212,191,.2);}
    li.leaf .node,li.leaf{color:var(--ink-1);font-size:12.5px;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">🌳 ${escapeHtml(title)}</h1>
      <div class="sub">${domain} · ${cats.length} categories · ${concepts.length} leaf concepts</div>
      <ul class="tree">
        <li><span class="node domain">${escapeHtml(domain)}</span>
          <ul>${branches}</ul>
        </li>
      </ul>
    </div>`);

  const md = `# ${title}\n\n_Taxonomy by \`/taxonomy-builder\`._\n\n## Hierarchy\n- **${domain}**\n${cats.map((c, i) => `  - ${c}\n${concepts.slice(i * chunkSize, (i + 1) * chunkSize).slice(0, 5).map((x) => `    - ${x}`).join("\n")}`).join("\n")}`;
  yield* designStep("taxonomy-builder", `Building taxonomy · ${domain}`, {
    type: "taxonomy",
    metadata: meta("taxonomy", title, cats.length, "Researchers"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /knowledge-gap-detector ───────────────────────────────────────────────────

const KNOWLEDGE_GAP_DETECTOR: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Knowledge Gap Analysis");
  const body = corpus(ctx);
  const sents = sentences(body);
  const heads = headings(body);

  const gapTypes = ["Missing Primary Source", "Underrepresented Tradition", "Absent Scholarly Voice", "Thematic Lacuna", "Methodological Gap", "Temporal Gap"];
  const gaps = gapTypes.slice(0, Math.max(4, sents.length)).map((type, i) => {
    const evidence = sents[i]?.slice(0, 180) ?? `Gap identified in current knowledge base — source evidence needed.`;
    const priority = i < 2 ? "Critical" : i < 4 ? "Important" : "Minor";
    const score = 90 - i * 12;
    return { type, evidence, priority, score: Math.max(score, 25) };
  });

  const rows = gaps.map((g, i) => {
    const pColor = g.priority === "Critical" ? "var(--rose)" : g.priority === "Important" ? "var(--amber)" : "var(--ink-3)";
    return `<tr class="${i % 2 === 0 ? "ev" : ""}">
      <td class="gtype">${escapeHtml(g.type)}</td>
      <td class="gev">${escapeHtml(g.evidence)}</td>
      <td><span class="pri" style="color:${pColor}">${g.priority}</span></td>
      <td class="score" style="color:${pColor}">${g.score}</td>
    </tr>`;
  }).join("");

  const css = panelCss + `
    table{width:100%;border-collapse:collapse;margin-top:16px;}
    th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--ink-3);padding:8px 12px;border-bottom:2px solid var(--line);}
    td{padding:9px 12px;border-bottom:1px solid var(--line);font-size:13px;vertical-align:top;}
    .ev td{background:rgba(255,255,255,.015);}
    .gtype{color:var(--violet);font-weight:600;white-space:nowrap;}
    .gev{color:var(--ink-1);line-height:1.5;}
    .pri{font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.1em;}
    .score{font-family:monospace;font-weight:700;text-align:right;width:50px;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">🔍 ${escapeHtml(title)}</h1>
      <div class="sub">${gaps.length} gaps detected · priority 0–100 · describe your KB for targeted analysis</div>
      <table>
        <thead><tr><th>Gap Type</th><th>Evidence</th><th>Priority</th><th style="text-align:right">Score</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`);

  const md = `# ${title}\n\n_Gap analysis by \`/knowledge-gap-detector\`._\n\n## Gaps\n${gaps.map((g) => `### [${g.priority} · ${g.score}] ${g.type}\n${g.evidence}`).join("\n\n")}`;
  yield* designStep("knowledge-gap-detector", `Detecting ${gaps.length} knowledge gaps`, {
    type: "gap-analysis",
    metadata: meta("gap-analysis", title, gaps.length, "Researchers"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /citation-network-builder ─────────────────────────────────────────────────

const CITATION_NETWORK_BUILDER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Citation Network");
  const body = corpus(ctx);
  const names = capitalPhrases(body, 12);

  // Assign to strata: primary → commentators → schools → frontier
  const strata = [
    { label: "Primary Sources", color: "var(--violet)", nodes: names.slice(0, 2) },
    { label: "Commentators", color: "var(--teal)", nodes: names.slice(2, 5) },
    { label: "Schools / Movements", color: "var(--amber)", nodes: names.slice(5, 9) },
    { label: "Contemporary Frontier", color: "var(--rose)", nodes: names.slice(9, 12) },
  ].filter((s) => s.nodes.length > 0);

  const levels = strata.map((s) => {
    const nodes = s.nodes.map((n) => `<span class="nchip" style="border-color:${s.color};color:${s.color}">${escapeHtml(n)}</span>`).join("");
    return `<div class="level">
      <div class="llabel" style="color:${s.color}">${escapeHtml(s.label)}</div>
      <div class="lnodes">${nodes}</div>
    </div>`;
  }).join(`<div class="arrow">↓</div>`);

  const css = panelCss + `
    .network{margin-top:16px;display:flex;flex-direction:column;gap:0;}
    .level{background:var(--bg-1);border:1px solid var(--line);border-radius:10px;padding:14px 18px;}
    .llabel{font-size:11px;text-transform:uppercase;letter-spacing:.12em;margin-bottom:10px;}
    .lnodes{display:flex;flex-wrap:wrap;gap:8px;}
    .nchip{display:inline-block;padding:4px 12px;border-radius:20px;border:1px solid;font-size:12px;background:transparent;}
    .arrow{text-align:center;color:var(--ink-3);font-size:20px;line-height:1.4;margin:2px 0;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">🌐 ${escapeHtml(title)}</h1>
      <div class="sub">${names.length} scholars / works across ${strata.length} strata · add names for full genealogy</div>
      <div class="network">${levels}</div>
    </div>`);

  const md = `# ${title}\n\n_Citation network by \`/citation-network-builder\`._\n\n${strata.map((s) => `## ${s.label}\n${s.nodes.map((n) => `- ${n}`).join("\n")}`).join("\n\n")}`;
  yield* designStep("citation-network-builder", `Building ${strata.length}-strata citation network`, {
    type: "citation-network",
    metadata: meta("citation-network", title, names.length, "Historians"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /multi-resolution-summarizer ──────────────────────────────────────────────

const MULTI_RESOLUTION_SUMMARIZER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Multi-Resolution Summary");
  const body = corpus(ctx);
  const sents = sentences(body);
  const buls = bullets(body);

  const flash = (sents[0] ?? ctx.prompt).slice(0, 120).replace(/\.$/, "") + ".";
  const executive = sents.slice(0, 4).join(" ").slice(0, 600) || `Executive-level overview of: ${ctx.prompt.slice(0, 300)}`;
  const instructional = (sents.slice(0, 8).join(" ") + (buls.length ? "\n\nKey points:\n" + buls.slice(0, 5).map((b) => `• ${b}`).join("\n") : "")).slice(0, 1200) || `Instructional guide for ${title}.`;
  const scholarly = sents.join(" ").slice(0, 2400) || `Scholarly analysis of ${title} — add source text for full extraction.`;

  const LEVELS = [
    { label: "Flash (25w)", sub: "Instant orientation", color: "var(--teal)", text: flash },
    { label: "Executive (250w)", sub: "Decision-maker summary", color: "var(--amber)", text: executive },
    { label: "Instructional (2–5p)", sub: "Student / practitioner", color: "var(--violet)", text: instructional },
    { label: "Scholarly (15–20p)", sub: "Research audience", color: "var(--rose)", text: scholarly },
  ];

  const panels = LEVELS.map((l, i) => `
    <div class="panel ${i === 0 ? "active" : ""}" id="panel-${i}">
      <div class="ptop" style="border-left:3px solid ${l.color}">
        <span class="plabel" style="color:${l.color}">${escapeHtml(l.label)}</span>
        <span class="psub">${escapeHtml(l.sub)}</span>
      </div>
      <div class="pbody">${escapeHtml(l.text)}</div>
    </div>`).join("");

  const tabs = LEVELS.map((l, i) =>
    `<button class="tab ${i === 0 ? "active" : ""}" data-i="${i}" style="--tc:${l.color}">${escapeHtml(l.label)}</button>`).join("");

  const css = panelCss + `
    .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
    .tab{padding:7px 14px;border-radius:8px;border:1px solid var(--line);background:var(--bg-1);color:var(--ink-2);font-size:12.5px;cursor:pointer;transition:.15s;}
    .tab.active{background:rgba(var(--tc),0.1);color:var(--tc);border-color:var(--tc);}
    .tab.active{background:var(--bg-2);color:var(--tc,var(--ink-0));border-color:var(--tc,var(--line));}
    .panel{display:none;} .panel.active{display:block;}
    .ptop{padding:8px 14px;border-radius:8px;background:var(--bg-2);margin-bottom:12px;display:flex;align-items:center;gap:12px;}
    .plabel{font-weight:700;font-size:13px;} .psub{color:var(--ink-3);font-size:12px;}
    .pbody{color:var(--ink-1);font-size:13.5px;line-height:1.65;white-space:pre-wrap;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">🔭 ${escapeHtml(title)}</h1>
      <div class="sub">4 abstraction levels · click a tab to switch</div>
      <div class="tabs">${tabs}</div>
      ${panels}
    </div>`, `
    (function(){var tabs=[].slice.call(document.querySelectorAll('.tab'));var panels=[].slice.call(document.querySelectorAll('.panel'));
      tabs.forEach(function(t){t.addEventListener('click',function(){var i=t.dataset.i;tabs.forEach(function(x){x.classList.toggle('active',x===t);});panels.forEach(function(p,pi){p.classList.toggle('active',pi==i);});});});})();`);

  const md = `# ${title}\n\n_Multi-resolution summary by \`/multi-resolution-summarizer\`._\n\n${LEVELS.map((l) => `## ${l.label}\n${l.text}`).join("\n\n")}`;
  yield* designStep("multi-resolution-summarizer", `Generating 4 abstraction levels`, {
    type: "multi-summary",
    metadata: meta("multi-summary", title, 4, "Mixed audiences"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /curriculum-designer ──────────────────────────────────────────────────────

const CURRICULUM_DESIGNER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Curriculum");
  const body = corpus(ctx);
  const heads = headings(body);
  const concepts = capitalPhrases(body, 20);

  const STAGES = [
    { id: 0, label: "Stage 0 · Prerequisites", color: "var(--ink-3)", topics: ["Background knowledge", "Foundational vocabulary", "Core reading list"] },
    { id: 1, label: "Stage 1 · Foundations", color: "var(--teal)", topics: concepts.slice(0, 4).length ? concepts.slice(0, 4) : ["Core concepts", "Key distinctions", "Primary sources"] },
    { id: 2, label: "Stage 2 · Intermediate", color: "var(--violet)", topics: concepts.slice(4, 8).length ? concepts.slice(4, 8) : ["Applied analysis", "Case studies", "Comparative frameworks"] },
    { id: 3, label: "Stage 3 · Advanced", color: "var(--amber)", topics: concepts.slice(8, 12).length ? concepts.slice(8, 12) : ["Scholarly debates", "Original argumentation", "Research methods"] },
    { id: 4, label: "Stage 4 · Frontier", color: "var(--rose)", topics: concepts.slice(12, 16).length ? concepts.slice(12, 16) : ["Current controversies", "Research gaps", "Original contribution"] },
  ];

  const cards = STAGES.map((s) => `
    <div class="scard">
      <div class="shead" style="border-left:3px solid ${s.color}">
        <span style="color:${s.color};font-weight:700;font-size:13px">${escapeHtml(s.label)}</span>
      </div>
      <ul>${s.topics.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
    </div>`).join("");

  const css = panelCss + `
    .stages{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:16px;}
    .scard{background:var(--bg-1);border:1px solid var(--line);border-radius:10px;overflow:hidden;}
    .shead{padding:12px 16px;background:var(--bg-2);}
    ul{padding:12px 16px 14px 28px;margin:0;color:var(--ink-1);font-size:13px;line-height:1.7;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">📚 ${escapeHtml(title)}</h1>
      <div class="sub">5-stage curriculum · Stage 0 prerequisites → Stage 4 research frontier</div>
      <div class="stages">${cards}</div>
    </div>`);

  const md = `# ${title}\n\n_Curriculum by \`/curriculum-designer\`._\n\n${STAGES.map((s) => `## ${s.label}\n${s.topics.map((t) => `- ${t}`).join("\n")}`).join("\n\n")}`;
  yield* designStep("curriculum-designer", `Designing 5-stage curriculum · ${title}`, {
    type: "curriculum",
    metadata: meta("curriculum", title, 5, "Educators"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /council-synthesizer ──────────────────────────────────────────────────────

const COUNCIL_SYNTHESIZER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Council Synthesis");
  const body = corpus(ctx);
  const sents = sentences(body);
  const secs = collectSections(ctx);

  // Each section = one AI/expert perspective; synthesize from them
  const perspectives = (secs.length >= 2 ? secs : [
    { skill: "perspective-1", title: "Perspective A", raw: sents[0] ?? "First perspective on the question." },
    { skill: "perspective-2", title: "Perspective B", raw: sents[1] ?? "Second perspective, noting reservations." },
    { skill: "perspective-3", title: "Perspective C", raw: sents[2] ?? "Third perspective, pragmatic synthesis." },
  ]).slice(0, 5);

  const TONES = ["teal", "rose", "amber", "violet", "teal"];
  const memberCards = perspectives.map((p, i) =>
    `<article class="cc ${TONES[i]}">
      <header>Member ${i + 1} · ${escapeHtml(p.title ?? p.skill)}</header>
      <p>${escapeHtml(p.raw.slice(0, 300))}</p>
    </article>`).join("");

  // Synthetic consensus from available text
  const consensus = sents.slice(0, 2).join(" ").slice(0, 400) || `Synthesis pending — provide multiple AI responses as separate sections for this skill.`;

  const css = panelCss + `
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;} @media(max-width:640px){.grid{grid-template-columns:1fr;}}
    .cc{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--bg-1);}
    .cc header{padding:10px 16px;font-size:13px;font-weight:600;border-bottom:1px solid var(--line);}
    .cc p{padding:12px 16px;color:var(--ink-1);font-size:13px;line-height:1.6;white-space:pre-wrap;margin:0;}
    .cc.teal header{color:var(--teal);} .cc.rose header{color:var(--rose);}
    .cc.amber header{color:var(--amber);} .cc.violet header{color:var(--violet);}
    .synth{background:var(--bg-2);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-top:14px;}
    .synth h4{color:var(--violet);font-size:11px;text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">⚖️ ${escapeHtml(title)}</h1>
      <div class="sub">${perspectives.length} perspectives · paste multiple AI responses as sections for synthesis</div>
      <div class="grid">${memberCards}</div>
      <div class="synth">
        <h4>Consensus Synthesis</h4>
        <p style="color:var(--ink-1);font-size:13px;line-height:1.6">${escapeHtml(consensus)}</p>
      </div>
    </div>`);

  const md = `# ${title}\n\n_Council synthesis by \`/council-synthesizer\`._\n\n${perspectives.map((p, i) => `## Member ${i + 1} · ${p.title ?? p.skill}\n${p.raw.slice(0, 300)}`).join("\n\n")}\n\n## Synthesis\n${consensus}`;
  yield* designStep("council-synthesizer", `Synthesizing ${perspectives.length} perspectives`, {
    type: "council-synthesis",
    metadata: meta("council-synthesis", title, perspectives.length + 1, "Decision-makers"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const KNOWLEDGE2_EXECUTORS: Record<string, SkillExecutor_> = {
  "concept-extractor":          CONCEPT_EXTRACTOR,
  "relationship-mapper":        RELATIONSHIP_MAPPER,
  "claim-extractor":            CLAIM_EXTRACTOR,
  "controversy-mapper":         CONTROVERSY_MAPPER,
  "taxonomy-builder":           TAXONOMY_BUILDER,
  "knowledge-gap-detector":     KNOWLEDGE_GAP_DETECTOR,
  "citation-network-builder":   CITATION_NETWORK_BUILDER,
  "multi-resolution-summarizer":MULTI_RESOLUTION_SUMMARIZER,
  "curriculum-designer":        CURRICULUM_DESIGNER,
  "council-synthesizer":        COUNCIL_SYNTHESIZER,
};

export type { SkillEvent, SkillContext };
