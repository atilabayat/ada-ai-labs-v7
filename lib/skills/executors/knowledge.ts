/**
 * lib/skills/executors/knowledge.ts
 * ─────────────────────────────────
 * Knowledge-category skills that emit dynamic, interactive HTML artifacts,
 * composing whatever upstream skills produced (research, quant, generators).
 *
 *   /wiki-builder     → structured wiki scaffold with a live TOC
 *   /knowledge-graph  → interactive SVG entity/relationship graph
 *   /flash-brief      → one-page landscape flash brief
 *   /llm-council      → multi-perspective deliberation (live via Anthropic)
 */

import Anthropic from "@anthropic-ai/sdk";
import { SkillContext, SkillEvent } from "../types";
import {
  escapeHtml, titleFromPrompt, collectSections, htmlDoc, designStep,
  type StructuredOutput, type SkillExecutor_,
} from "./design";

const meta = (type: string, title: string, modules: number, audience: string): StructuredOutput["metadata"] =>
  ({ type, title, duration: "interactive", modules, targetAudience: audience });

const composedMd = (title: string, kind: string, sections: { skill: string; raw: string }[]): string =>
  [`# ${title}`, ``, `_${kind}._`, ``, ...sections.map((s) => `---\n\n${s.raw}`)].join("\n");

/** Pull candidate entities (headings, capitalised phrases, tickers) from text. */
function extractEntities(text: string, max = 11): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(/^#{1,3}\s+(.+)$/gm)) out.add(m[1].replace(/[*`#]/g, "").trim().slice(0, 28));
  for (const m of text.matchAll(/\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,2})\b/g)) {
    const w = m[1].trim();
    if (w.length >= 4 && !/^(The|This|That|With|From|When|What|Module|Course|Live|Web|Search)$/.test(w)) out.add(w.slice(0, 24));
  }
  for (const m of text.matchAll(/\b([A-Z]{2,5})\b/g)) out.add(m[1]);
  return [...out].slice(0, max);
}

// ─── /wiki-builder ─────────────────────────────────────────────────────────────

const WIKI_BUILDER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Research Wiki");
  const sections = collectSections(ctx);
  const items = sections.length ? sections : [{ skill: "overview", title: "Overview", raw: ctx.prompt, body: `<p>${escapeHtml(ctx.prompt)}</p>` }];

  const toc = items.map((s, i) =>
    `<a class="toc ${i === 0 ? "active" : ""}" href="#sec-${i}" data-i="${i}">${escapeHtml(s.title.replace(/^[#\s]+/, "").slice(0, 36))}</a>`).join("");
  const body = items.map((s, i) =>
    `<section id="sec-${i}" class="sec"><div class="chip">/${escapeHtml(s.skill)}</div>${s.body}</section>`).join("");

  const css = `
    .wrap{display:grid;grid-template-columns:230px 1fr;gap:24px;max-width:1040px;margin:0 auto;padding:26px 20px;}
    .toc-rail{position:sticky;top:18px;align-self:start;border-right:1px solid var(--line);padding-right:14px;}
    .toc-rail h4{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin-bottom:10px;}
    a.toc{display:block;padding:6px 10px;border-radius:7px;color:var(--ink-2);font-size:13px;text-decoration:none;border-left:2px solid transparent;}
    a.toc:hover{color:var(--ink-0);background:var(--bg-2);}
    a.toc.active{color:var(--teal);border-left-color:var(--teal);background:rgba(45,212,191,.08);}
    .sec{padding:14px 0 22px;border-bottom:1px solid var(--line);scroll-margin-top:14px;}
    .chip{display:inline-block;background:var(--bg-3);color:var(--teal);font-size:10px;padding:3px 8px;border-radius:6px;margin-bottom:10px;}
    h1.page{font-size:30px;margin:0 0 4px;}
  `;
  const html = htmlDoc(title, css, `
    <div class="wrap">
      <nav class="toc-rail"><h4>Contents</h4>${toc}</nav>
      <main><h1 class="page">${escapeHtml(title)}</h1>
        <p style="color:var(--ink-2);margin-bottom:16px">Compiled from ${items.length} source${items.length === 1 ? "" : "s"}.</p>
        ${body}</main>
    </div>`, `
    (function(){var links=[].slice.call(document.querySelectorAll('a.toc'));var secs=[].slice.call(document.querySelectorAll('.sec'));
      links.forEach(function(l){l.addEventListener('click',function(e){e.preventDefault();var t=document.getElementById('sec-'+l.dataset.i);if(t)t.scrollIntoView({behavior:'smooth'});});});
      var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){var id=en.target.id.split('-')[1];links.forEach(function(l){l.classList.toggle('active',l.dataset.i===id);});}});},{rootMargin:'0px 0px -70% 0px'});
      secs.forEach(function(s){io.observe(s);});})();`);

  yield* designStep("wiki-builder", `Composing wiki · ${title}`, {
    type: "wiki", metadata: meta("wiki", title, items.length, "Researchers"),
    markdown: composedMd(title, "Wiki compiled by `/wiki-builder`", items), html, htmlDeps: [],
  });
};

// ─── /knowledge-graph ───────────────────────────────────────────────────────────

const KNOWLEDGE_GRAPH: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Knowledge Graph");
  const sections = collectSections(ctx);
  const corpus = `${ctx.prompt}\n${sections.map((s) => s.raw).join("\n")}`;
  const entities = extractEntities(corpus);
  const center = title.slice(0, 20);

  const cx = 320, cy = 250, R = 180;
  const nodes = entities.map((e, i) => {
    const a = (i / Math.max(1, entities.length)) * Math.PI * 2 - Math.PI / 2;
    return { e, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, i };
  });
  const edges = nodes.map((n) => `<line class="edge e${n.i}" x1="${cx}" y1="${cy}" x2="${n.x.toFixed(0)}" y2="${n.y.toFixed(0)}" />`).join("");
  // a few inter-entity edges for texture
  const cross = nodes.slice(0, -1).filter((_, i) => i % 2 === 0)
    .map((n, k) => { const m = nodes[(n.i + 2) % nodes.length]; return `<line class="edge x" x1="${n.x.toFixed(0)}" y1="${n.y.toFixed(0)}" x2="${m.x.toFixed(0)}" y2="${m.y.toFixed(0)}" />`; }).join("");
  const nodeEls = nodes.map((n) =>
    `<g class="node" data-i="${n.i}" transform="translate(${n.x.toFixed(0)},${n.y.toFixed(0)})">
       <circle r="22" /><text>${escapeHtml(n.e.slice(0, 12))}</text></g>`).join("");

  const css = `
    .gwrap{max-width:760px;margin:0 auto;padding:24px 20px;text-align:center;}
    svg{width:100%;height:auto;background:radial-gradient(ellipse at 50% 40%,rgba(167,139,250,.06),transparent 60%);border:1px solid var(--line);border-radius:14px;}
    .edge{stroke:rgba(167,139,250,.25);stroke-width:1;transition:stroke .15s;}
    .edge.x{stroke:rgba(77,141,255,.12);}
    .node circle{fill:#141d33;stroke:var(--violet);stroke-width:1.5;transition:all .15s;cursor:pointer;}
    .node text{fill:var(--ink-1);font-size:9px;font-family:monospace;text-anchor:middle;dominant-baseline:middle;pointer-events:none;}
    .node.hot circle{fill:rgba(167,139,250,.25);stroke:var(--teal);r:26;}
    .center circle{fill:rgba(167,139,250,.18);stroke:var(--teal);stroke-width:2;}
    .center text{fill:var(--ink-0);font-weight:700;}
    h1.page{font-size:24px;margin:0 0 6px;}
  `;
  const html = htmlDoc(title, css, `
    <div class="gwrap">
      <h1 class="page">${escapeHtml(title)}</h1>
      <p style="color:var(--ink-3);font-size:12px;margin-bottom:14px">${entities.length} entities · hover a node to trace links</p>
      <svg viewBox="0 0 640 500">
        ${cross}${edges}
        <g class="node center"><g transform="translate(${cx},${cy})"><circle r="34"/><text x="0" y="0" text-anchor="middle" dominant-baseline="middle">${escapeHtml(center)}</text></g></g>
        ${nodeEls}
      </svg>
    </div>`, `
    (function(){[].slice.call(document.querySelectorAll('.node[data-i]')).forEach(function(n){
      var i=n.dataset.i;
      n.addEventListener('mouseenter',function(){n.classList.add('hot');var e=document.querySelector('.edge.e'+i);if(e)e.style.stroke='var(--teal)';});
      n.addEventListener('mouseleave',function(){n.classList.remove('hot');var e=document.querySelector('.edge.e'+i);if(e)e.style.stroke='';});
    });})();`);

  const md = `# ${title}\n\n_Entity graph by \`/knowledge-graph\`._\n\n## Entities\n${entities.map((e) => `- ${e}`).join("\n")}`;
  yield* designStep("knowledge-graph", `Graphing ${entities.length} entities`, {
    type: "graph", metadata: meta("graph", title, entities.length, "Analysts"), markdown: md, html, htmlDeps: [],
  });
};

// ─── /flash-brief ───────────────────────────────────────────────────────────────

const FLASH_BRIEF: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Flash Brief");
  const sections = collectSections(ctx);
  const bullets = (sections.map((s) => s.raw).join("\n").match(/^[-*]\s+(.+)$/gm) ?? [])
    .slice(0, 6).map((b) => b.replace(/^[-*]\s+/, ""));
  const cards = (sections.length ? sections : [{ skill: "brief", title: "Summary", raw: ctx.prompt, body: `<p>${escapeHtml(ctx.prompt)}</p>` }])
    .map((s) => `<article class="bcard"><header>/${escapeHtml(s.skill)}</header><div class="bbody">${s.body}</div></article>`).join("");
  const date = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  const css = `
    .fb{max-width:1000px;margin:0 auto;padding:24px 20px;}
    .fhead{display:flex;align-items:baseline;justify-content:space-between;border-bottom:2px solid var(--amber);padding-bottom:12px;margin-bottom:18px;}
    .fhead h1{font-size:26px;margin:0;} .fhead .d{color:var(--ink-3);font-size:12px;font-family:monospace;}
    .takeaways{background:linear-gradient(135deg,rgba(245,183,72,.1),transparent);border:1px solid var(--line);border-radius:12px;padding:16px 20px;margin-bottom:18px;}
    .takeaways h4{color:var(--amber);font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px;}
    .takeaways li{margin:5px 0;color:var(--ink-1);}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;}
    .bcard{background:var(--bg-1);border:1px solid var(--line);border-radius:12px;overflow:hidden;}
    .bcard header{background:var(--bg-2);color:var(--amber);font-size:11px;padding:9px 14px;border-bottom:1px solid var(--line);}
    .bbody{padding:6px 16px 14px;max-height:340px;overflow:auto;}
  `;
  const html = htmlDoc(title, css, `
    <div class="fb">
      <div class="fhead"><h1>⚡ ${escapeHtml(title)}</h1><span class="d">${date}</span></div>
      ${bullets.length ? `<div class="takeaways"><h4>Key Takeaways</h4><ul>${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul></div>` : ""}
      <div class="grid">${cards}</div>
    </div>`);

  yield* designStep("flash-brief", `Drafting flash brief · ${title}`, {
    type: "brief", metadata: meta("brief", title, sections.length || 1, "Desk"),
    markdown: composedMd(title, "Flash brief by `/flash-brief`", sections.length ? sections : [{ skill: "brief", raw: ctx.prompt }]),
    html, htmlDeps: [],
  });
};

// ─── /llm-council ───────────────────────────────────────────────────────────────

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

async function deliberate(prompt: string, contextMd: string): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1600,
      system: "You are the LLM Council: three distinct expert members deliberate, then a Chairman synthesizes. Be concise and decisive.",
      messages: [{
        role: "user",
        content: `Question: ${prompt}\n\nContext from upstream skills:\n${contextMd.slice(0, 4000)}\n\n` +
          `Respond in markdown with exactly these sections:\n### 🟢 The Optimist\n### 🔴 The Skeptic\n### 🟡 The Pragmatist\n### ⚖️ Chairman's Synthesis`,
      }],
    });
    return msg.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("").trim() || null;
  } catch {
    return null;
  }
}

function councilFallback(prompt: string, sections: { skill: string; raw: string }[]): string {
  const ctxNote = sections.length ? `Drawing on ${sections.map((s) => `\`/${s.skill}\``).join(", ")}.` : "";
  return `### 🟢 The Optimist
The proposition around _${prompt.slice(0, 120)}_ has strong tailwinds; upstream signals support the constructive case. ${ctxNote}

### 🔴 The Skeptic
Counter-evidence and tail risks deserve weight; do not over-extrapolate from a thin sample.

### 🟡 The Pragmatist
Net: act on the highest-conviction, reversible steps first; size to the uncertainty.

### ⚖️ Chairman's Synthesis
Balanced read — proceed with a staged plan and explicit invalidation triggers.

> _Council ran in offline mode (no ANTHROPIC_API_KEY); add a key for live multi-member deliberation._`;
}

// ─── Fireworks multi-model council (true multi-model when key is present) ─────
const FW_URL = "https://api.fireworks.ai/inference/v1/chat/completions";
// Diverse open-weight panel; override with FIREWORKS_MODELS (comma-separated).
// Defaults track models currently deployed on Fireworks (verified available).
const FW_MODELS = (process.env.FIREWORKS_MODELS ??
  "accounts/fireworks/models/deepseek-v4-pro,accounts/fireworks/models/kimi-k2p6,accounts/fireworks/models/glm-5p1"
).split(",").map((s) => s.trim()).filter(Boolean);

const fwShort = (m: string) => (m.split("/").pop() ?? m).replace(/-instruct$/, "");

async function fwChat(model: string, system: string, user: string, maxTokens = 1000): Promise<string> {
  const r = await fetch(FW_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.6, messages: [
      { role: "system", content: system }, { role: "user", content: user },
    ] }),
  });
  if (!r.ok) throw new Error(`Fireworks ${r.status}`);
  const j = await r.json();
  return (j?.choices?.[0]?.message?.content ?? "").trim();
}

interface CouncilMember { name: string; text: string; }
/** Run each panel model independently, then a chairman reconciliation. */
async function fireworksCouncil(prompt: string, contextMd: string): Promise<{ members: CouncilMember[]; chair: string } | null> {
  if (!process.env.FIREWORKS_API_KEY || FW_MODELS.length === 0) return null;
  const sys = "You are an expert member of a decision council. Give a sharp, concise, decisive perspective — state your strongest argument and your biggest reservation.";
  const user = `Question: ${prompt}\n\nContext from upstream skills:\n${contextMd.slice(0, 3000)}\n\nRespond in 4-6 sentences.`;
  const settled = await Promise.all(FW_MODELS.slice(0, 4).map(async (m) => {
    try { const text = await fwChat(m, sys, user); return text ? { name: fwShort(m), text } : null; }
    catch { return null; }
  }));
  const members = settled.filter((x): x is CouncilMember => !!x);
  if (members.length === 0) return null;

  const panel = members.map((m, i) => `Member ${i + 1} (${m.name}):\n${m.text}`).join("\n\n");
  let chair = "";
  try {
    chair = await fwChat(FW_MODELS[0],
      "You are the Chairman of an LLM council. Reconcile the members into one decisive recommendation; note where they agree and the key disagreement.",
      `Question: ${prompt}\n\nMember responses:\n${panel}\n\nChairman's synthesis, 4-6 sentences:`, 700);
  } catch { /* chair optional */ }
  return { members, chair };
}

const TONES = ["teal", "rose", "amber", "violet"];

const LLM_COUNCIL: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "LLM Council");
  const sections = collectSections(ctx);
  const contextMd = sections.map((s) => s.raw).join("\n\n");
  // Prefer a genuine multi-model panel (Fireworks); else a single-model council
  // (Anthropic); else an offline composed read.
  let subtitle: string;
  let mdBody: string;
  const memberCards: { head: string; text: string; tone: string }[] = [];
  let chairText = "";

  const fw = await fireworksCouncil(ctx.prompt, contextMd);
  if (fw) {
    subtitle = `Live multi-model deliberation · ${fw.members.length} models · Fireworks`;
    fw.members.forEach((m, i) => memberCards.push({ head: `Member ${i + 1} · ${m.name}`, text: m.text, tone: TONES[i % 4] }));
    chairText = fw.chair;
    mdBody = fw.members.map((m, i) => `### Member ${i + 1} · ${m.name}\n${m.text}`).join("\n\n") +
      (chairText ? `\n\n### ⚖️ Chairman's Synthesis\n${chairText}` : "");
  } else {
    const live = await deliberate(ctx.prompt, contextMd);
    mdBody = live ?? councilFallback(ctx.prompt, sections);
    for (const b of mdBody.split(/^###\s+/m).filter((x) => x.trim())) {
      const nl = b.indexOf("\n");
      const head = (nl >= 0 ? b.slice(0, nl) : b).trim();
      const text = nl >= 0 ? b.slice(nl + 1).trim() : "";
      if (/Chairman/i.test(head)) { chairText = text; continue; }
      const tone = /Optimist/.test(head) ? "teal" : /Skeptic/.test(head) ? "rose" : "amber";
      memberCards.push({ head, text, tone });
    }
    subtitle = live
      ? `Single-model council · ${MODEL} · add FIREWORKS_API_KEY for true multi-model`
      : "Offline mode · add FIREWORKS_API_KEY or ANTHROPIC_API_KEY";
  }

  const cardsHtml = memberCards.map((c) =>
    `<article class="cc ${c.tone}"><header>${escapeHtml(c.head)}</header><p>${escapeHtml(c.text)}</p></article>`).join("") +
    (chairText ? `<article class="cc violet"><header>⚖️ Chairman's Synthesis</header><p>${escapeHtml(chairText)}</p></article>` : "");

  const css = `
    .cwrap{max-width:900px;margin:0 auto;padding:24px 20px;}
    h1.page{font-size:24px;margin:0 0 4px;} .sub{color:var(--ink-3);font-size:12px;margin-bottom:16px;}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    @media(max-width:680px){.grid{grid-template-columns:1fr;}}
    .cc{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--bg-1);}
    .cc header{padding:10px 16px;font-size:14px;font-weight:600;border-bottom:1px solid var(--line);}
    .cc p{padding:12px 16px;color:var(--ink-1);font-size:13.5px;line-height:1.6;white-space:pre-wrap;}
    .cc.teal header{color:var(--teal);} .cc.rose header{color:var(--rose);}
    .cc.amber header{color:var(--amber);} .cc.violet header{color:var(--violet);background:rgba(167,139,250,.06);}
    .cc.violet{grid-column:1/-1;}
  `;
  const html = htmlDoc(title, css, `
    <div class="cwrap"><h1 class="page">⚖️ ${escapeHtml(title)}</h1>
    <div class="sub">${escapeHtml(subtitle)}</div>
    <div class="grid">${cardsHtml}</div></div>`);

  yield* designStep("llm-council", subtitle, {
    type: "council", metadata: meta("council", title, memberCards.length + (chairText ? 1 : 0), "Decision-makers"),
    markdown: `# ${title}\n\n${mdBody}`, html, htmlDeps: [],
  });
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const KNOWLEDGE_EXECUTORS: Record<string, SkillExecutor_> = {
  "wiki-builder":    WIKI_BUILDER,
  "knowledge-graph": KNOWLEDGE_GRAPH,
  "flash-brief":     FLASH_BRIEF,
  "llm-council":     LLM_COUNCIL,
};

// Re-export shared event type to satisfy isolatedModules consumers if needed.
export type { SkillEvent, SkillContext };
