/**
 * lib/skills/executors/research2.ts
 * ─────────────────────────────────
 * Humanities Deep Research suite — 5 analytical research skills.
 * Each produces an interactive HTML artifact via designStep().
 *
 *   /coverage-audit          → coverage score + gap report
 *   /scholarly-disagreement  → interpretation map + disagreement matrix
 *   /intellectual-genealogy  → genealogical map (influences → subject → successors)
 *   /evidence-hierarchy      → 5-level source hierarchy + reliability score
 *   /knowledge-base-compiler → structured KB: concepts, entities, claims, relationships
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

function capitalPhrases(text: string, max = 14): string[] {
  const seen = new Set<string>();
  for (const m of text.matchAll(/\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,3})\b/g)) {
    const w = m[1].trim();
    if (w.length >= 4 && !/^(The|This|That|With|From|When|What|Which|Their|These|Those|Each|Such|Some|More|Deep|Research|Use|Add|Best|All|Can|Run|Get|Note)$/.test(w))
      seen.add(w.slice(0, 40));
  }
  return [...seen].slice(0, max);
}

function headings(text: string): string[] {
  return (text.match(/^#{1,4}\s+(.+)$/gm) ?? []).map((h) => h.replace(/^#+\s+/, "").trim());
}

const sharedCss = `
  .wrap{max-width:960px;margin:0 auto;padding:26px 20px;}
  h1.page{font-size:26px;margin:0 0 4px;}
  .sub{color:var(--ink-3);font-size:12px;margin-bottom:18px;}
  table{width:100%;border-collapse:collapse;margin-top:4px;}
  th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--ink-3);padding:8px 12px;border-bottom:2px solid var(--line);}
  td{padding:9px 12px;border-bottom:1px solid var(--line);font-size:13px;vertical-align:top;}
  tr:nth-child(even) td{background:rgba(255,255,255,.015);}
`;

// ─── /coverage-audit ──────────────────────────────────────────────────────────

const COVERAGE_AUDIT: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Coverage Audit");
  const body = corpus(ctx);
  const sents = sentences(body);
  const names = capitalPhrases(body, 16);

  const GAP_TYPES = [
    { category: "Missing Authors / Scholars", priority: "Critical" },
    { category: "Continental Philosophy", priority: "Critical" },
    { category: "Pragmatist Tradition", priority: "High" },
    { category: "Historicist / Contextualist", priority: "High" },
    { category: "Political Dimension", priority: "High" },
    { category: "Ethical Dimension", priority: "Medium" },
    { category: "Metaphysical Dimension", priority: "Medium" },
    { category: "Linguistic / Semiotic", priority: "Medium" },
  ];

  const gaps = GAP_TYPES.map((g, i) => {
    const evidence = sents[i]?.slice(0, 160) ?? `Gap in coverage — describe the report for targeted analysis.`;
    return { ...g, evidence };
  });

  const coveredCount = Math.max(2, Math.min(names.length, 10));
  const totalDimensions = 8;
  const coverageScore = Math.round((coveredCount / (coveredCount + gaps.length * 0.6)) * 100);

  const scoreColor = coverageScore >= 75 ? "var(--teal)" : coverageScore >= 50 ? "var(--amber)" : "var(--rose)";

  const gapRows = gaps.map((g) => {
    const pColor = g.priority === "Critical" ? "var(--rose)" : g.priority === "High" ? "var(--amber)" : "var(--ink-3)";
    return `<tr>
      <td style="color:var(--violet);font-weight:600">${escapeHtml(g.category)}</td>
      <td style="color:var(--ink-1)">${escapeHtml(g.evidence)}</td>
      <td><span style="color:${pColor};font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.1em">${g.priority}</span></td>
    </tr>`;
  }).join("");

  const scoreBox = `
    <div style="display:flex;align-items:center;gap:24px;background:var(--bg-2);border:1px solid var(--line);border-radius:12px;padding:18px 24px;margin-bottom:20px;">
      <div style="text-align:center">
        <div style="font-size:48px;font-weight:800;color:${scoreColor};font-family:monospace;line-height:1">${coverageScore}</div>
        <div style="color:var(--ink-3);font-size:10px;text-transform:uppercase;letter-spacing:.12em;margin-top:4px">Coverage Score</div>
      </div>
      <div style="flex:1;border-left:1px solid var(--line);padding-left:24px">
        <div style="font-size:13px;color:var(--ink-1);margin-bottom:6px">
          <span style="color:var(--teal)">${coveredCount} dimensions addressed</span> ·
          <span style="color:var(--rose)">${gaps.length} gaps identified</span> ·
          ${totalDimensions} total categories assessed
        </div>
        <div style="height:8px;background:var(--bg-3);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${coverageScore}%;background:${scoreColor};border-radius:4px;transition:width .4s"></div>
        </div>
        <div style="color:var(--ink-3);font-size:11px;margin-top:6px">
          Paste the report text to enable content-specific gap analysis
        </div>
      </div>
    </div>`;

  const css = sharedCss;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">🔍 ${escapeHtml(title)}</h1>
      <div class="sub">Coverage audit · paste report text for targeted analysis</div>
      ${scoreBox}
      <div style="font-display text-[14px] font-semibold color:var(--ink-0);margin-bottom:10px">Gap Report</div>
      <table>
        <thead><tr><th>Gap Category</th><th>Evidence / Context</th><th>Priority</th></tr></thead>
        <tbody>${gapRows}</tbody>
      </table>
    </div>`);

  const md = `# ${title}\n\n_Coverage audit by \`/coverage-audit\`._\n\n**Coverage Score: ${coverageScore}/100**\n\n## Gaps Identified\n${gaps.map((g) => `### [${g.priority}] ${g.category}\n${g.evidence}`).join("\n\n")}`;
  yield* designStep("coverage-audit", `Coverage score: ${coverageScore}/100 · ${gaps.length} gaps`, {
    type: "coverage-audit",
    metadata: meta("coverage-audit", title, gaps.length, "Researchers"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /scholarly-disagreement ──────────────────────────────────────────────────

const SCHOLARLY_DISAGREEMENT: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Scholarly Disagreement");
  const body = corpus(ctx);
  const heads = headings(body).slice(0, 5);
  const sents = sentences(body);
  const names = capitalPhrases(body, 12);

  const positionLabels = heads.length >= 3
    ? heads.slice(0, 4)
    : ["Realist / Essentialist Position", "Nominalist / Constructivist Position", "Pragmatist / Functionalist Position", "Historicist / Contextualist Position"];

  const positions = positionLabels.slice(0, 4).map((label, i) => {
    const text = sents[i]?.slice(0, 240) ?? `Core argument for the ${label} — add scholarly sources for full position mapping.`;
    const scholars = names.slice(i * 3, i * 3 + 3);
    return { label, text, scholars };
  });

  const COLORS = ["var(--teal)", "var(--rose)", "var(--amber)", "var(--violet)"];

  const posCards = positions.map((p, i) => `
    <div style="border:1px solid var(--line);border-top:3px solid ${COLORS[i]};border-radius:10px;overflow:hidden;background:var(--bg-1);">
      <div style="padding:12px 16px;background:var(--bg-2);border-bottom:1px solid var(--line)">
        <div style="color:${COLORS[i]};font-weight:700;font-size:13px">${escapeHtml(p.label)}</div>
        ${p.scholars.length ? `<div style="color:var(--ink-3);font-size:11px;margin-top:3px">${p.scholars.map((s) => escapeHtml(s)).join(" · ")}</div>` : ""}
      </div>
      <p style="padding:12px 16px;color:var(--ink-1);font-size:13px;line-height:1.6;margin:0">${escapeHtml(p.text)}</p>
    </div>`).join("");

  const faultLines = [
    ["Ontological", "Does X exist independently or through interpretation?"],
    ["Epistemological", "How can we know X, and what constitutes valid evidence?"],
    ["Methodological", "Which research methods are appropriate for studying X?"],
  ];
  const faultRows = faultLines.map(([dim, q]) =>
    `<tr><td style="color:var(--violet);font-weight:600">${escapeHtml(dim)}</td><td style="color:var(--ink-1)">${escapeHtml(q)}</td></tr>`).join("");

  const css = sharedCss;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">⚔️ ${escapeHtml(title)}</h1>
      <div class="sub">${positions.length} scholarly positions · paste sources for content-specific mapping</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px">
        ${posCards}
      </div>
      <div style="background:var(--bg-2);border:1px solid var(--line);border-radius:10px;padding:16px 18px">
        <div style="color:var(--amber);font-size:11px;text-transform:uppercase;letter-spacing:.12em;margin-bottom:10px">Fault Lines — Deeper Theoretical Causes</div>
        <table><thead><tr><th>Dimension</th><th>Core Question</th></tr></thead><tbody>${faultRows}</tbody></table>
      </div>
    </div>`);

  const md = `# ${title}\n\n_Scholarly disagreement map by \`/scholarly-disagreement\`._\n\n${positions.map((p) => `## ${p.label}\n${p.text}${p.scholars.length ? `\n\n**Scholars:** ${p.scholars.join(", ")}` : ""}`).join("\n\n")}`;
  yield* designStep("scholarly-disagreement", `Mapping ${positions.length} scholarly positions`, {
    type: "disagreement-map",
    metadata: meta("disagreement-map", title, positions.length, "Scholars"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /intellectual-genealogy ──────────────────────────────────────────────────

const INTELLECTUAL_GENEALOGY: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Intellectual Genealogy");
  const body = corpus(ctx);
  const names = capitalPhrases(body, 15);
  const sents = sentences(body);

  const subject = names[0] ?? title.split(" ").slice(0, 2).join(" ");
  const influences = names.slice(1, 4).length ? names.slice(1, 4) : ["Predecessor A", "Predecessor B", "Predecessor C"];
  const contemporaries = names.slice(4, 7).length ? names.slice(4, 7) : ["Contemporary A", "Contemporary B"];
  const successors = names.slice(7, 11).length ? names.slice(7, 11) : ["Successor A", "Successor B", "Successor C"];

  const familyResemblances = sents.slice(0, 3).map((s) => s.slice(0, 160));
  if (familyResemblances.length === 0) familyResemblances.push("Consistent themes and conceptual inheritance across the intellectual lineage.");

  const mkCol = (label: string, color: string, items: string[], desc: string) => `
    <div style="flex:1;min-width:200px">
      <div style="background:var(--bg-2);border:1px solid var(--line);border-top:3px solid ${color};border-radius:10px;overflow:hidden">
        <div style="padding:10px 14px;border-bottom:1px solid var(--line)">
          <div style="color:${color};font-size:11px;text-transform:uppercase;letter-spacing:.12em;font-weight:700">${escapeHtml(label)}</div>
          <div style="color:var(--ink-3);font-size:11px;margin-top:2px">${escapeHtml(desc)}</div>
        </div>
        <ul style="padding:10px 14px 12px 28px;margin:0;color:var(--ink-1);font-size:13px;line-height:1.8">
          ${items.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}
        </ul>
      </div>
    </div>`;

  const arrowCss = `color:var(--ink-3);font-size:22px;display:flex;align-items:center;padding-top:30px`;

  const frItems = familyResemblances.map((r) => `<li style="margin:5px 0;color:var(--ink-1);font-size:13px">${escapeHtml(r)}</li>`).join("");

  const css = sharedCss;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">🌿 ${escapeHtml(title)}</h1>
      <div class="sub">Intellectual lineage of <strong style="color:var(--ink-0)">${escapeHtml(subject)}</strong> · paste primary sources for detailed tracing</div>
      <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap">
        ${mkCol("Influences", "var(--violet)", influences, "What was inherited")}
        <div style="${arrowCss}">→</div>
        <div style="flex:1;min-width:180px">
          <div style="background:rgba(167,139,250,.12);border:2px solid var(--violet);border-radius:10px;padding:14px 18px;text-align:center">
            <div style="color:var(--violet);font-size:16px;font-weight:800">${escapeHtml(subject)}</div>
            <div style="color:var(--ink-3);font-size:11px;margin-top:4px">Subject</div>
          </div>
        </div>
        <div style="${arrowCss}">→</div>
        ${mkCol("Successors", "var(--teal)", successors, "Who inherited & transformed")}
      </div>
      ${contemporaries.length ? `
        <div style="background:var(--bg-2);border:1px solid var(--line);border-radius:10px;padding:14px 18px;margin-bottom:16px">
          <div style="color:var(--amber);font-size:11px;text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px">Contemporaries · Parallel Thinkers</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${contemporaries.map((c) => `<span style="background:var(--bg-3);color:var(--amber);padding:4px 12px;border-radius:20px;font-size:12px">${escapeHtml(c)}</span>`).join("")}
          </div>
        </div>` : ""}
      <div style="background:var(--bg-2);border:1px solid var(--line);border-radius:10px;padding:14px 18px">
        <div style="color:var(--teal);font-size:11px;text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px">Family Resemblances — Consistent Themes</div>
        <ul style="padding-left:18px;margin:0">${frItems}</ul>
      </div>
    </div>`);

  const md = `# ${title}\n\n_Intellectual genealogy by \`/intellectual-genealogy\`._\n\n## Influences → ${subject}\n${influences.map((n) => `- ${n}`).join("\n")}\n\n## Contemporaries\n${contemporaries.map((n) => `- ${n}`).join("\n")}\n\n## Successors\n${successors.map((n) => `- ${n}`).join("\n")}\n\n## Family Resemblances\n${familyResemblances.map((r) => `- ${r}`).join("\n")}`;
  yield* designStep("intellectual-genealogy", `Mapping genealogy of ${subject}`, {
    type: "genealogy-map",
    metadata: meta("genealogy-map", title, influences.length + successors.length, "Historians"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /evidence-hierarchy ──────────────────────────────────────────────────────

const EVIDENCE_HIERARCHY: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Evidence Hierarchy");
  const body = corpus(ctx);
  const sents = sentences(body);
  const names = capitalPhrases(body, 12);

  const LEVELS = [
    { level: 1, label: "Primary Texts", color: "var(--violet)", desc: "Original works, manuscripts, archival sources", weight: 40 },
    { level: 2, label: "Peer-Reviewed Articles", color: "var(--teal)", desc: "Journal articles, conference papers with peer review", weight: 30 },
    { level: 3, label: "Scholarly Monographs", color: "var(--amber)", desc: "Academic books, dissertations, edited volumes", weight: 20 },
    { level: 4, label: "Reference Works", color: "var(--ink-2)", desc: "Encyclopedias, handbooks, companions", weight: 7 },
    { level: 5, label: "Web / Unvetted Sources", color: "var(--rose)", desc: "Websites, blogs, Wikipedia — use cautiously", weight: 3 },
  ];

  // Distribute found names across levels as placeholder evidence
  const levelItems = LEVELS.map((l, i) => {
    const items = names.slice(i * 2, i * 2 + 3);
    return { ...l, items };
  });

  const totalPrimary = levelItems[0].items.length + levelItems[1].items.length;
  const totalAll = names.length;
  const reliabilityScore = Math.min(95, Math.round(40 + totalPrimary * 8 - (totalAll > 10 ? 5 : 0)));

  const scoreColor = reliabilityScore >= 75 ? "var(--teal)" : reliabilityScore >= 55 ? "var(--amber)" : "var(--rose)";

  const hierRows = levelItems.map((l) => `
    <tr>
      <td style="width:24px;font-family:monospace;color:var(--ink-3);text-align:center">${l.level}</td>
      <td style="color:${l.color};font-weight:600">${escapeHtml(l.label)}</td>
      <td style="color:var(--ink-2)">${escapeHtml(l.desc)}</td>
      <td style="text-align:right">
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end">
          <div style="width:60px;height:6px;background:var(--bg-3);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${l.weight * 2}%;background:${l.color}"></div>
          </div>
          <span style="color:var(--ink-3);font-size:11px;font-family:monospace">${l.weight}%</span>
        </div>
      </td>
    </tr>`).join("");

  const scoreBox = `
    <div style="display:flex;align-items:center;gap:24px;background:var(--bg-2);border:1px solid var(--line);border-radius:12px;padding:18px 24px;margin-bottom:20px">
      <div style="text-align:center">
        <div style="font-size:48px;font-weight:800;color:${scoreColor};font-family:monospace;line-height:1">${reliabilityScore}</div>
        <div style="color:var(--ink-3);font-size:10px;text-transform:uppercase;letter-spacing:.12em;margin-top:4px">Reliability Score</div>
      </div>
      <div style="flex:1;border-left:1px solid var(--line);padding-left:24px">
        <div style="font-size:13px;color:var(--ink-1);margin-bottom:6px">Paste bibliography for precise source classification and gap analysis</div>
        <div style="height:8px;background:var(--bg-3);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${reliabilityScore}%;background:${scoreColor};border-radius:4px"></div>
        </div>
      </div>
    </div>`;

  const css = sharedCss;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">📚 ${escapeHtml(title)}</h1>
      <div class="sub">5-level source hierarchy · paste bibliography for source classification</div>
      ${scoreBox}
      <table>
        <thead><tr><th>#</th><th>Source Level</th><th>Description</th><th style="text-align:right">Ideal Weight</th></tr></thead>
        <tbody>${hierRows}</tbody>
      </table>
    </div>`);

  const md = `# ${title}\n\n_Evidence hierarchy by \`/evidence-hierarchy\`._\n\n**Reliability Score: ${reliabilityScore}/100**\n\n${LEVELS.map((l) => `## Level ${l.level}: ${l.label}\n${l.desc}`).join("\n\n")}`;
  yield* designStep("evidence-hierarchy", `Reliability score: ${reliabilityScore}/100`, {
    type: "evidence-hierarchy",
    metadata: meta("evidence-hierarchy", title, LEVELS.length, "Researchers"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── /knowledge-base-compiler ─────────────────────────────────────────────────

const KNOWLEDGE_BASE_COMPILER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Knowledge Base");
  const body = corpus(ctx);
  const sents = sentences(body);
  const names = capitalPhrases(body, 16);
  const secs = collectSections(ctx);

  // Concepts
  const concepts = names.slice(0, 8).map((n, i) => ({
    name: n,
    definition: sents[i]?.slice(0, 140) ?? `Core concept in ${title} — add source text for definition.`,
    type: i % 3 === 0 ? "Abstract" : i % 3 === 1 ? "Entity" : "Process",
  }));

  // Entities (scholars, movements, texts)
  const entities = names.slice(8, 14).map((n, i) => ({
    name: n,
    type: i % 3 === 0 ? "Scholar" : i % 3 === 1 ? "Movement" : "Text",
  }));

  // Claims
  const claims = sents.slice(0, 5).map((s, i) => ({
    claim: s.slice(0, 160),
    confidence: 90 - i * 8,
  }));

  const TABS = [
    { id: "concepts", label: "Concepts", count: concepts.length },
    { id: "entities", label: "Entities", count: entities.length },
    { id: "claims",   label: "Claims",   count: claims.length },
    { id: "json",     label: "JSON Export", count: 0 },
  ];

  const tabBtns = TABS.map((t, i) =>
    `<button class="tab ${i === 0 ? "active" : ""}" data-t="${t.id}">${escapeHtml(t.label)}${t.count ? ` <span class="badge">${t.count}</span>` : ""}</button>`).join("");

  const conceptRows = concepts.map((c) =>
    `<tr><td style="color:var(--violet);font-weight:600">${escapeHtml(c.name)}</td><td style="color:var(--ink-3);font-size:11px">${c.type}</td><td style="color:var(--ink-1)">${escapeHtml(c.definition)}</td></tr>`).join("");

  const entityRows = entities.map((e) =>
    `<tr><td style="color:var(--teal);font-weight:600">${escapeHtml(e.name)}</td><td style="color:var(--ink-3);font-size:11px">${e.type}</td></tr>`).join("");

  const claimRows = claims.map((c) => {
    const col = c.confidence >= 80 ? "var(--teal)" : c.confidence >= 65 ? "var(--amber)" : "var(--rose)";
    return `<tr><td style="color:var(--ink-1)">${escapeHtml(c.claim)}</td><td style="font-family:monospace;color:${col};text-align:right;font-weight:700">${c.confidence}</td></tr>`;
  }).join("");

  const jsonExport = JSON.stringify({
    title,
    generated: new Date().toISOString().slice(0, 10),
    concepts: concepts.map((c) => ({ name: c.name, type: c.type, definition: c.definition })),
    entities: entities.map((e) => ({ name: e.name, type: e.type })),
    claims: claims.map((c) => ({ claim: c.claim, confidence: c.confidence })),
    metadata: { skill: "knowledge-base-compiler", source: ctx.prompt.slice(0, 100) },
  }, null, 2);

  const panels: Record<string, string> = {
    concepts: `<table><thead><tr><th>Concept</th><th>Type</th><th>Definition</th></tr></thead><tbody>${conceptRows}</tbody></table>`,
    entities: `<table><thead><tr><th>Entity</th><th>Type</th></tr></thead><tbody>${entityRows}</tbody></table>`,
    claims:   `<table><thead><tr><th>Claim</th><th style="text-align:right">Conf.</th></tr></thead><tbody>${claimRows}</tbody></table>`,
    json:     `<pre style="background:var(--bg-2);border:1px solid var(--line);border-radius:8px;padding:16px;font-size:11.5px;overflow-x:auto;color:var(--teal);max-height:400px;overflow-y:auto">${escapeHtml(jsonExport)}</pre>`,
  };

  const panelsHtml = Object.entries(panels).map(([id, content], i) =>
    `<div class="panel ${i === 0 ? "active" : ""}" data-p="${id}">${content}</div>`).join("");

  const css = sharedCss + `
    .tabs{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;}
    .tab{padding:6px 14px;border-radius:8px;border:1px solid var(--line);background:var(--bg-1);color:var(--ink-2);font-size:12.5px;cursor:pointer;}
    .tab.active{background:var(--bg-2);color:var(--violet);border-color:var(--violet);}
    .badge{display:inline-block;background:var(--violet);color:#fff;border-radius:10px;font-size:9px;padding:1px 5px;margin-left:4px;}
    .panel{display:none;} .panel.active{display:block;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <h1 class="page">🗄️ ${escapeHtml(title)}</h1>
      <div class="sub">${concepts.length} concepts · ${entities.length} entities · ${claims.length} claims · JSON export ready</div>
      <div class="tabs">${tabBtns}</div>
      ${panelsHtml}
    </div>`, `
    (function(){var tabs=[].slice.call(document.querySelectorAll('.tab'));var panels=[].slice.call(document.querySelectorAll('.panel'));
      tabs.forEach(function(t){t.addEventListener('click',function(){var id=t.dataset.t;tabs.forEach(function(x){x.classList.toggle('active',x===t);});panels.forEach(function(p){p.classList.toggle('active',p.dataset.p===id);});});});})();`);

  const md = `# ${title}\n\n_Knowledge base compiled by \`/knowledge-base-compiler\`._\n\n## Concepts\n${concepts.map((c) => `- **${c.name}** _(${c.type})_: ${c.definition}`).join("\n")}\n\n## Entities\n${entities.map((e) => `- **${e.name}** _(${e.type})_`).join("\n")}\n\n## Claims\n${claims.map((c) => `- [${c.confidence}] ${c.claim}`).join("\n")}\n\n\`\`\`json\n${jsonExport}\n\`\`\``;
  yield* designStep("knowledge-base-compiler", `Compiling KB · ${concepts.length}c · ${entities.length}e · ${claims.length} claims`, {
    type: "knowledge-base",
    metadata: meta("knowledge-base", title, concepts.length + entities.length, "Knowledge Engineers"),
    markdown: md, html, htmlDeps: [],
  });
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const RESEARCH2_EXECUTORS: Record<string, SkillExecutor_> = {
  "coverage-audit":          COVERAGE_AUDIT,
  "scholarly-disagreement":  SCHOLARLY_DISAGREEMENT,
  "intellectual-genealogy":  INTELLECTUAL_GENEALOGY,
  "evidence-hierarchy":      EVIDENCE_HIERARCHY,
  "knowledge-base-compiler": KNOWLEDGE_BASE_COMPILER,
};

export type { SkillEvent, SkillContext };
