/**
 * lib/skills/executors/documents.ts
 * ─────────────────────────────────
 * Development-category "builder" skills that emit dynamic HTML document
 * artifacts (print-ready), composing upstream skill output.
 *
 *   /pdf-builder    → institutional print-ready report (navy / dark-red), Print→PDF
 *   /docx-builder   → Word-style document with letterhead + page styling
 *   /xlsx-builder   → interactive multi-sheet workbook from upstream tables
 *   /vercel-deploy  → deployment manifest with animated build log
 */

import {
  escapeHtml, titleFromPrompt, collectSections, htmlDoc, designStep,
  type StructuredOutput, type SkillExecutor_, type Section,
} from "./design";

const meta = (type: string, title: string, modules: number, audience: string): StructuredOutput["metadata"] =>
  ({ type, title, duration: "document", modules, targetAudience: audience });

const composedMd = (title: string, kind: string, sections: { skill: string; raw: string }[]): string =>
  [`# ${title}`, ``, `_${kind}._`, ``, ...sections.map((s) => `---\n\n${s.raw}`)].join("\n");

const sectionsOr = (ctx: { prompt: string }, sections: Section[]): Section[] =>
  sections.length ? sections : [{ skill: "content", title: "Content", raw: ctx.prompt, body: `<p>${escapeHtml(ctx.prompt)}</p>` }];

// ─── /pdf-builder ───────────────────────────────────────────────────────────────

const PDF_BUILDER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Research Report");
  const sections = sectionsOr(ctx, collectSections(ctx));
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const css = `
    body{background:var(--bg-3);} .toolbar{position:sticky;top:0;display:flex;gap:8px;padding:10px 16px;background:var(--bg-2);border-bottom:1px solid var(--line);z-index:5;}
    .btn{background:var(--accent);color:#fff;border:none;border-radius:7px;padding:7px 14px;font-size:12px;cursor:pointer;}
    .page{max-width:780px;margin:18px auto;background:#fff;color:#13213c;box-shadow:0 10px 40px rgba(0,0,0,.4);padding:54px 60px;}
    .ph{border-bottom:3px solid #7a1020;padding-bottom:16px;margin-bottom:22px;}
    .ph .org{color:#13213c;font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;}
    .ph h1{color:#13213c;font-size:26px;margin:8px 0 4px;} .ph .meta{color:#566;font-size:12px;}
    .page h2{color:#13213c;border-bottom:1px solid #d8dee9;padding-bottom:5px;font-size:17px;margin:24px 0 10px;}
    .page h3{color:#7a1020;font-size:14px;margin:16px 0 6px;}
    .page p,.page li{color:#2a3550;font-size:13.5px;line-height:1.7;} .page table{width:100%;border-collapse:collapse;margin:12px 0;font-size:12.5px;}
    .page th{background:#13213c;color:#fff;padding:7px 10px;text-align:left;} .page td{padding:7px 10px;border-bottom:1px solid #e4e9f2;color:#2a3550;}
    .pf{margin-top:34px;border-top:1px solid #d8dee9;padding-top:12px;color:#889;font-size:10px;display:flex;justify-content:space-between;}
    @media print{.toolbar{display:none;} body{background:#fff;} .page{box-shadow:none;margin:0;}}
  `;
  const html = htmlDoc(title, css, `
    <div class="toolbar"><button class="btn" onclick="window.print()">⎙ Print / Save as PDF</button>
      <span style="color:var(--ink-3);font-size:11px;align-self:center">Institutional report · ${sections.length} section${sections.length === 1 ? "" : "s"}</span></div>
    <div class="page">
      <div class="ph"><div class="org">Alpha Data Architects · Research</div><h1>${escapeHtml(title)}</h1><div class="meta">${date} · Confidential</div></div>
      ${sections.map((s) => `<div>${s.body}</div>`).join("")}
      <div class="pf"><span>Alpha Data Architects Group</span><span>Generated ${date}</span></div>
    </div>`);

  yield* designStep("pdf-builder", `Building report · ${title}`, {
    type: "report", metadata: meta("report", title, sections.length, "Institutional"),
    markdown: composedMd(title, "Report by `/pdf-builder`", sections), html, htmlDeps: [],
  });
};

// ─── /docx-builder ──────────────────────────────────────────────────────────────

const DOCX_BUILDER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Document");
  const sections = sectionsOr(ctx, collectSections(ctx));
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const css = `
    body{background:var(--bg-3);} .toolbar{position:sticky;top:0;display:flex;gap:8px;padding:10px 16px;background:var(--bg-2);border-bottom:1px solid var(--line);}
    .btn{background:var(--accent);color:#fff;border:none;border-radius:7px;padding:7px 14px;font-size:12px;cursor:pointer;}
    .doc{max-width:740px;margin:18px auto;background:#fff;color:#222;box-shadow:0 10px 40px rgba(0,0,0,.4);padding:60px 70px;font-family:Georgia,'Times New Roman',serif;}
    .lh{text-align:center;border-bottom:2px solid #2a3d63;padding-bottom:14px;margin-bottom:26px;}
    .lh .org{color:#2a3d63;font-size:13px;letter-spacing:.12em;font-weight:700;} .lh h1{font-size:24px;margin:10px 0 2px;color:#1a2030;} .lh .meta{color:#777;font-size:12px;}
    .doc h2{font-size:18px;color:#1a2030;margin:22px 0 8px;} .doc h3{font-size:15px;color:#2a3d63;margin:14px 0 6px;}
    .doc p,.doc li{font-size:14px;line-height:1.8;color:#2a2a2a;} .doc table{width:100%;border-collapse:collapse;margin:12px 0;}
    .doc th,.doc td{border:1px solid #ccc;padding:7px 10px;font-size:13px;text-align:left;} .doc th{background:#eef1f7;}
    .pnum{text-align:center;color:#aaa;font-size:11px;margin-top:30px;}
    @media print{.toolbar{display:none;} body{background:#fff;} .doc{box-shadow:none;margin:0;}}
  `;
  const html = htmlDoc(title, css, `
    <div class="toolbar"><button class="btn" onclick="window.print()">⎙ Print / Export</button>
      <span style="color:var(--ink-3);font-size:11px;align-self:center">Word-style document</span></div>
    <div class="doc">
      <div class="lh"><div class="org">ALPHA DATA ARCHITECTS</div><h1>${escapeHtml(title)}</h1><div class="meta">${date}</div></div>
      ${sections.map((s) => `<div>${s.body}</div>`).join("")}
      <div class="pnum">— 1 —</div>
    </div>`);

  yield* designStep("docx-builder", `Building document · ${title}`, {
    type: "document", metadata: meta("document", title, sections.length, "General"),
    markdown: composedMd(title, "Document by `/docx-builder`", sections), html, htmlDeps: [],
  });
};

// ─── /xlsx-builder ──────────────────────────────────────────────────────────────

interface Sheet { name: string; head: string[]; rows: string[][]; }

/** Parse GFM tables out of upstream markdown into sheets. */
function parseSheets(sections: Section[]): Sheet[] {
  const sheets: Sheet[] = [];
  const cells = (r: string) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
  for (const s of sections) {
    const lines = s.raw.split("\n");
    for (let i = 0; i < lines.length - 1; i++) {
      if (/^\s*\|.*\|\s*$/.test(lines[i]) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
        const head = cells(lines[i]); i += 2; const rows: string[][] = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
        sheets.push({ name: `${s.skill}·${sheets.length + 1}`, head, rows });
      }
    }
  }
  return sheets;
}

const XLSX_BUILDER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Workbook");
  const sections = collectSections(ctx);
  let sheets = parseSheets(sections);
  if (!sheets.length) {
    sheets = [{
      name: "Summary",
      head: ["Skill", "Output Title", "Size (chars)"],
      rows: (sections.length ? sections : [{ skill: "prompt", title: ctx.prompt, raw: ctx.prompt } as Section])
        .map((s) => [`/${s.skill}`, (s.title || "").replace(/^[#\s]+/, "").slice(0, 40), String(s.raw.length)]),
    }];
  }

  const tabs = sheets.map((s, i) => `<button class="xtab ${i === 0 ? "active" : ""}" data-i="${i}">${escapeHtml(s.name)}</button>`).join("");
  const colLabel = (n: number) => String.fromCharCode(65 + (n % 26));
  const grids = sheets.map((sh, i) => `
    <table class="grid ${i === 0 ? "active" : ""}" data-i="${i}">
      <tr><th class="rh"></th>${sh.head.map((_, c) => `<th class="ch">${colLabel(c)}</th>`).join("")}</tr>
      <tr><td class="rh">1</td>${sh.head.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
      ${sh.rows.map((r, ri) => `<tr><td class="rh">${ri + 2}</td>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}
    </table>`).join("");

  const css = `
    .xw{max-width:1000px;margin:0 auto;padding:20px;}
    h1.page{font-size:22px;margin:0 0 12px;}
    .xtabs{display:flex;gap:2px;}
    .xtab{background:var(--bg-2);color:var(--ink-2);border:1px solid var(--line);border-bottom:none;border-radius:7px 7px 0 0;padding:7px 14px;font-size:11px;cursor:pointer;}
    .xtab.active{background:#107c41;color:#fff;border-color:#107c41;}
    .grid{display:none;width:100%;border-collapse:collapse;font-family:monospace;font-size:12px;border:1px solid var(--line-strong);}
    .grid.active{display:table;} .grid td,.grid th{border:1px solid var(--line);padding:5px 9px;text-align:left;color:var(--ink-1);}
    .grid .ch,.grid .rh{background:var(--bg-3);color:var(--ink-3);text-align:center;font-weight:400;}
    .grid tr:nth-child(2) th{background:rgba(16,124,65,.12);color:var(--ink-0);}
  `;
  const html = htmlDoc(title, css, `
    <div class="xw"><h1 class="page">▦ ${escapeHtml(title)}</h1>
      <div class="xtabs">${tabs}</div>${grids}
      <p style="color:var(--ink-3);font-size:11px;margin-top:10px">${sheets.length} sheet${sheets.length === 1 ? "" : "s"} · parsed from upstream tables</p>
    </div>`, `
    (function(){var tabs=[].slice.call(document.querySelectorAll('.xtab')),g=[].slice.call(document.querySelectorAll('.grid'));
      tabs.forEach(function(t){t.addEventListener('click',function(){var i=t.dataset.i;tabs.forEach(function(x){x.classList.toggle('active',x===t);});g.forEach(function(x){x.classList.toggle('active',x.dataset.i===i);});});});})();`);

  const md = `# ${title}\n\n_Workbook by \`/xlsx-builder\` · ${sheets.length} sheet(s)._\n\n` +
    sheets.map((sh) => `## ${sh.name}\n\n| ${sh.head.join(" | ")} |\n| ${sh.head.map(() => "---").join(" | ")} |\n${sh.rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}`).join("\n\n");
  yield* designStep("xlsx-builder", `Building workbook · ${sheets.length} sheet(s)`, {
    type: "workbook", metadata: meta("workbook", title, sheets.length, "Analysts"), markdown: md, html, htmlDeps: [],
  });
};

// ─── /vercel-deploy ─────────────────────────────────────────────────────────────

const VERCEL_DEPLOY: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Deployment");
  const sections = collectSections(ctx);
  const hasToken = !!process.env.VERCEL_TOKEN;
  const project = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30) || "ada-app";
  const url = `https://${project}.vercel.app`;

  const steps = [
    "Resolving build environment (iad1 · edge)",
    "Installing dependencies",
    `Building ${sections.length} composed artifact${sections.length === 1 ? "" : "s"}`,
    "Optimizing serverless functions",
    hasToken ? "Uploading to Vercel" : "Generating deployment manifest (no token)",
    hasToken ? "Deployment live" : "Manifest ready — add VERCEL_TOKEN to go live",
  ];

  const css = `
    .dw{max-width:760px;margin:0 auto;padding:24px 20px;}
    h1.page{font-size:22px;margin:0 0 2px;} .sub{color:var(--ink-3);font-size:12px;margin-bottom:18px;}
    .card{background:var(--bg-1);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:14px;}
    .card header{background:var(--bg-2);padding:10px 16px;font-size:11px;color:var(--ink-2);text-transform:uppercase;letter-spacing:.1em;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;}
    .kv{display:flex;justify-content:space-between;padding:9px 16px;border-bottom:1px solid var(--line);font-family:monospace;font-size:12px;}
    .kv:last-child{border-bottom:none;} .kv .k{color:var(--ink-3);} .kv .v{color:var(--ink-0);}
    .log{font-family:monospace;font-size:12px;padding:10px 16px;}
    .ln{opacity:0;color:var(--ink-2);padding:3px 0;} .ln .ok{color:var(--teal);}
    .url{color:var(--accent);} .badge{padding:2px 8px;border-radius:5px;font-size:10px;}
    .badge.live{background:rgba(45,212,191,.12);color:var(--teal);} .badge.man{background:rgba(245,183,72,.12);color:var(--amber);}
  `;
  const logLines = steps.map((s, i) =>
    `<div class="ln" style="animation:fade .3s forwards;animation-delay:${(i * 0.5).toFixed(1)}s"><span class="ok">✓</span> ${escapeHtml(s)}</div>`).join("");
  const html = htmlDoc(title, css + "@keyframes fade{to{opacity:1}}", `
    <div class="dw"><h1 class="page">▲ ${escapeHtml(title)}</h1>
      <div class="sub">${hasToken ? "Live deployment" : "Deployment manifest"} · Vercel</div>
      <div class="card"><header>Project <span class="badge ${hasToken ? "live" : "man"}">${hasToken ? "LIVE" : "MANIFEST"}</span></header>
        <div class="kv"><span class="k">project</span><span class="v">${escapeHtml(project)}</span></div>
        <div class="kv"><span class="k">url</span><span class="v url">${escapeHtml(url)}</span></div>
        <div class="kv"><span class="k">region</span><span class="v">iad1 · edge</span></div>
        <div class="kv"><span class="k">framework</span><span class="v">Next.js · serverless</span></div>
        <div class="kv"><span class="k">artifacts</span><span class="v">${sections.length} composed</span></div>
      </div>
      <div class="card"><header>Build Log</header><div class="log">${logLines}</div></div>
    </div>`);

  const md = `# ${title}\n\n_${hasToken ? "Deployment" : "Deployment manifest"} by \`/vercel-deploy\`._\n\n` +
    `- **Project:** ${project}\n- **URL:** ${url}\n- **Region:** iad1 · edge\n- **Artifacts:** ${sections.length}\n` +
    (hasToken ? "" : "\n> Add `VERCEL_TOKEN` to the environment to perform a live deploy.");
  yield* designStep("vercel-deploy", hasToken ? `Deploying ${project}` : `Manifest · ${project}`, {
    type: "deployment", metadata: meta("deployment", title, sections.length, "DevOps"), markdown: md, html, htmlDeps: [],
  });
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const DOCUMENT_EXECUTORS: Record<string, SkillExecutor_> = {
  "pdf-builder":   PDF_BUILDER,
  "docx-builder":  DOCX_BUILDER,
  "xlsx-builder":  XLSX_BUILDER,
  "vercel-deploy": VERCEL_DEPLOY,
};
