/**
 * lib/skills/executors/design.ts
 * ──────────────────────────────
 * Frontend / dev skills that emit a *dynamic* HTML artifact.
 *
 * Unlike the research/quant skills (which stream markdown), these emit the
 * structured envelope the LiveBuildPanel knows how to preview:
 *
 *   { type, metadata, markdown, html, htmlDeps }
 *
 * The HTML is fully self-contained (inline <style> + <script>) and is rendered
 * by the panel inside a sandboxed <iframe srcdoc>, so its JavaScript actually
 * runs — tabs switch, clocks tick, charts draw. That is what makes the preview
 * "dynamic" rather than a dead snapshot.
 *
 * Composition ("skills working together"): every executor reads ctx.prevSteps
 * and folds each upstream skill's markdown output into its own artifact. Place
 * a design skill *after* research/quant/lesson skills in the stack and it wraps
 * their results in a polished, interactive UI.
 *
 * Skills:
 *   /frontend-design   → polished multi-section page (tabbed upstream content)
 *   /dashboard-builder → Bloomberg-style metric dashboard with live clock
 *   /react-generator   → component preview + the JSX/TSX source side-by-side
 */

import { SkillContext, SkillEvent, streamMarkdown } from "../types";

// ─── Shared types ──────────────────────────────────────────────────────────

interface DesignMeta {
  type: string;
  title: string;
  duration: string;
  modules: number;
  targetAudience: string;
}

interface StructuredOutput {
  type: string;
  metadata: DesignMeta;
  markdown: string;
  html: string;
  htmlDeps: string[];
}

interface Section {
  skill: string;
  title: string;
  raw: string;   // original markdown
  body: string;  // rendered HTML fragment
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Derive a human title from the user prompt. */
function titleFromPrompt(prompt: string, fallback: string): string {
  // Prefer an explicit `titled "X"` clause (WikiWizard / composer convention)
  // so wiki/knowledge artifacts get a clean heading instead of the full
  // "Create a comprehensive research wiki titled …" lead-in.
  const titled = prompt.match(/titled\s+["'""']([^"'""']+)["'""']/i);
  if (titled && titled[1].trim()) {
    const t = titled[1].trim();
    return t.length > 64 ? t.slice(0, 64) + "…" : t;
  }

  const cleaned = prompt
    .replace(/^(build|create|make|design|generate|develop)\s+(a|an|the)?\s*(comprehensive\s+)?(research\s+|knowledge\s+)?(wiki|page|app|dashboard|component)?\s*/i, "")
    .replace(/^(a|an|the)\s+/i, "")
    .split("\n")
    .find((l) => l.trim());
  if (!cleaned) return fallback;
  const t = cleaned.trim().replace(/[.:;,]\s*$/, "");
  return (t.length > 64 ? t.slice(0, 64) + "…" : t) || fallback;
}

/**
 * Minimal, safe markdown → HTML for upstream skill output. Handles the subset
 * the executors actually emit: headings, bold/italic/code, links, bullet &
 * numbered lists, fenced code, GFM tables, blockquotes, and rules. Everything
 * is escaped first, so embedded HTML in the source can't break out.
 */
function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  const inline = (s: string): string =>
    escapeHtml(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; // closing fence
      out.push(`<pre class="code"><code>${escapeHtml(buf.join("\n"))}</code></pre>`);
      continue;
    }

    // GFM table — header row, separator row, then body rows
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const cells = (r: string) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      const thead = `<tr>${head.map((h) => `<th>${inline(h)}</th>`).join("")}</tr>`;
      const tbody = rows
        .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
        .join("");
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+\s*$/.test(line)) { out.push("<hr/>"); i++; continue; }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*[-*]\s+/, ""));
      out.push(`<ul>${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*\d+\.\s+/, ""));
      out.push(`<ol>${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</ol>`);
      continue;
    }

    // Blank line
    if (!line.trim()) { i++; continue; }

    // Paragraph (accumulate consecutive non-empty, non-structural lines)
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|```|>\s?|\s*[-*]\s|\s*\d+\.\s|---+\s*$)/.test(lines[i]) &&
      !/^\s*\|.*\|\s*$/.test(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    if (buf.length) out.push(`<p>${inline(buf.join(" "))}</p>`);
  }

  return out.join("\n");
}

/** Pull the upstream skill outputs into render-ready sections. */
function collectSections(ctx: SkillContext): Section[] {
  return ctx.prevSteps
    .filter((s) => s.output && s.output.trim())
    .map((s) => {
      const firstHeading = s.output.match(/^#{1,3}\s+(.*)$/m);
      const title = firstHeading ? firstHeading[1].trim() : `/${s.skill}`;
      return { skill: s.skill, title, raw: s.output, body: mdToHtml(s.output) };
    });
}

/** Shared design tokens / base CSS for all artifacts (dark institutional theme). */
const BASE_CSS = `
  :root {
    --bg-0:#0a0e1a; --bg-1:#0f1525; --bg-2:#141d33; --bg-3:#1c2742;
    --line:#1f2b47; --line-strong:#2c3b5e;
    --ink-0:#eef2fb; --ink-1:#c7d0e4; --ink-2:#8b97b5; --ink-3:#5a6a8c;
    --accent:#4d8dff; --teal:#2dd4bf; --amber:#f5b748; --rose:#ff5677; --violet:#a78bfa;
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg-0); color:var(--ink-1);
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; line-height:1.6; }
  .mono { font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace; }
  a { color:var(--accent); }
  h1,h2,h3,h4 { color:var(--ink-0); line-height:1.25; }
  h2 { border-bottom:1px solid var(--line); padding-bottom:8px; }
  code { background:var(--bg-3); padding:2px 6px; border-radius:4px; font-family:'SF Mono',ui-monospace,monospace; font-size:0.88em; color:var(--teal); }
  pre.code { background:var(--bg-2); border:1px solid var(--line); border-radius:8px; padding:14px 16px; overflow:auto; }
  pre.code code { background:none; color:var(--ink-1); padding:0; }
  table { width:100%; border-collapse:collapse; margin:14px 0; font-size:13px; }
  th { background:var(--bg-2); color:var(--ink-2); text-transform:uppercase; letter-spacing:0.08em; font-size:10px; text-align:left; padding:8px 10px; border-bottom:1px solid var(--line-strong); }
  td { padding:8px 10px; border-bottom:1px solid var(--line); }
  blockquote { border-left:3px solid var(--accent); margin:14px 0; padding:6px 16px; color:var(--ink-2); background:rgba(77,141,255,0.05); border-radius:0 6px 6px 0; }
  hr { border:none; border-top:1px solid var(--line); margin:20px 0; }
`;

/** Wrap a complete HTML document so it can run inside an iframe srcdoc. */
function htmlDoc(title: string, extraCss: string, body: string, script = ""): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(title)}</title>
<style>${BASE_CSS}${extraCss}</style></head>
<body>${body}${script ? `<script>${script}</script>` : ""}</body></html>`;
}

// ─── /frontend-design ─────────────────────────────────────────────────────────

const FRONTEND_DESIGN: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Frontend Artifact");
  const sections = collectSections(ctx);
  yield* designStep("frontend-design", `Designing UI · ${title}`, buildFrontend(ctx, title, sections));
};

function buildFrontend(ctx: SkillContext, title: string, sections: Section[]): StructuredOutput {
  const hasContent = sections.length > 0;

  const tabs = hasContent
    ? sections
        .map(
          (s, idx) =>
            `<button class="tab ${idx === 0 ? "active" : ""}" data-idx="${idx}">${escapeHtml(
              s.title.replace(/^[#\s]+/, "").slice(0, 28)
            )}</button>`
        )
        .join("")
    : "";

  const panels = hasContent
    ? sections
        .map(
          (s, idx) =>
            `<section class="panel ${idx === 0 ? "active" : ""}" data-idx="${idx}">
               <div class="chip mono">/${escapeHtml(s.skill)}</div>${s.body}
             </section>`
        )
        .join("")
    : `<section class="panel active">
         <div class="empty">
           <h3>No upstream content yet</h3>
           <p>Stack a research, quant, or lesson skill <em>before</em> <code>/frontend-design</code>
           and its output will be composed into these tabs automatically.</p>
           <p class="mono">Prompt: ${escapeHtml(ctx.prompt.slice(0, 160))}</p>
         </div>
       </section>`;

  const css = `
    .wrap { max-width:1000px; margin:0 auto; padding:28px 22px 48px; }
    .hero { background:linear-gradient(135deg,rgba(77,141,255,0.18),rgba(167,139,250,0.12));
      border:1px solid var(--line-strong); border-radius:16px; padding:32px 28px; margin-bottom:24px; }
    .hero .kicker { color:var(--accent); font-size:11px; letter-spacing:0.18em; text-transform:uppercase; }
    .hero h1 { font-size:30px; margin:10px 0 8px; }
    .hero p { color:var(--ink-2); margin:0; max-width:60ch; }
    .clock { float:right; font-size:12px; color:var(--ink-2); }
    .tabs { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px; }
    .tab { background:var(--bg-2); color:var(--ink-2); border:1px solid var(--line);
      border-radius:8px; padding:8px 14px; font-size:12px; cursor:pointer; transition:all .15s; }
    .tab:hover { color:var(--ink-0); border-color:var(--line-strong); }
    .tab.active { background:rgba(77,141,255,0.15); color:var(--accent); border-color:var(--accent); }
    .panel { display:none; background:var(--bg-1); border:1px solid var(--line);
      border-radius:12px; padding:22px 24px; animation:fade .25s ease; }
    .panel.active { display:block; }
    .chip { display:inline-block; background:var(--bg-3); color:var(--teal); font-size:10px;
      padding:3px 8px; border-radius:6px; margin-bottom:12px; }
    .empty { text-align:center; padding:30px 10px; color:var(--ink-2); }
    @keyframes fade { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
  `;

  const body = `
    <div class="wrap">
      <div class="hero">
        <span class="clock mono" id="clock"></span>
        <div class="kicker">ADA AI Labs · Frontend Artifact</div>
        <h1>${escapeHtml(title)}</h1>
        <p>${hasContent
          ? `Composed from ${sections.length} upstream skill${sections.length === 1 ? "" : "s"}: ${sections
              .map((s) => `<code>/${escapeHtml(s.skill)}</code>`)
              .join(" ")}`
          : "Interactive single-file artifact rendered live in a sandboxed frame."}</p>
      </div>
      ${tabs ? `<div class="tabs">${tabs}</div>` : ""}
      ${panels}
    </div>`;

  const script = `
    (function(){
      var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
      var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
      tabs.forEach(function(t){
        t.addEventListener('click', function(){
          var idx = t.getAttribute('data-idx');
          tabs.forEach(function(x){ x.classList.toggle('active', x===t); });
          panels.forEach(function(p){ p.classList.toggle('active', p.getAttribute('data-idx')===idx); });
        });
      });
      var clock = document.getElementById('clock');
      function tick(){ if(clock) clock.textContent = new Date().toLocaleTimeString(); }
      tick(); setInterval(tick, 1000);
    })();
  `;

  const markdown = [
    `# ${title}`,
    ``,
    `_Frontend artifact composed by \`/frontend-design\` from ${sections.length} upstream skill output${
      sections.length === 1 ? "" : "s"
    }._`,
    ``,
    ...sections.map((s) => `---\n\n${s.raw}`),
  ].join("\n");

  return {
    type: "app",
    metadata: { type: "app", title, duration: "interactive", modules: sections.length || 1, targetAudience: "End users" },
    markdown,
    html: htmlDoc(title, css, body, script),
    htmlDeps: [],
  };
}

// ─── /dashboard-builder ─────────────────────────────────────────────────────────

const DASHBOARD_BUILDER: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Live Dashboard");
  const sections = collectSections(ctx);
  yield* designStep("dashboard-builder", `Composing dashboard · ${title}`, buildDashboard(ctx, title, sections));
};

function buildDashboard(ctx: SkillContext, title: string, sections: Section[]): StructuredOutput {
  // Mine simple "Label: value" or "$nnn" style metrics from upstream output for KPI cards.
  const text = sections.map((s) => s.raw).join("\n");
  const metricMatches = Array.from(
    text.matchAll(/^([A-Z][A-Za-z0-9 /()%-]{2,24}):\s*([$+\-]?[\d.,]+%?[A-Za-z$]*)/gm)
  ).slice(0, 8);

  const kpis =
    metricMatches.length > 0
      ? metricMatches
          .map(
            (m) =>
              `<div class="kpi"><div class="kpi-label mono">${escapeHtml(m[1].trim())}</div>
                 <div class="kpi-val">${escapeHtml(m[2].trim())}</div></div>`
          )
          .join("")
      : `<div class="kpi"><div class="kpi-label mono">Skills</div><div class="kpi-val">${sections.length}</div></div>
         <div class="kpi"><div class="kpi-label mono">Status</div><div class="kpi-val" style="color:var(--teal)">Live</div></div>
         <div class="kpi"><div class="kpi-label mono">Sections</div><div class="kpi-val">${sections.length}</div></div>
         <div class="kpi"><div class="kpi-label mono">Mode</div><div class="kpi-val">Preview</div></div>`;

  const cards = sections.length
    ? sections
        .map(
          (s) =>
            `<article class="card"><header class="mono">/${escapeHtml(s.skill)}</header>
               <div class="card-body">${s.body}</div></article>`
        )
        .join("")
    : `<article class="card"><header class="mono">empty</header>
         <div class="card-body"><p>Stack quant or research skills before <code>/dashboard-builder</code>
         to bind their data into these panels.</p></div></article>`;

  const css = `
    .top { display:flex; align-items:center; justify-content:space-between; padding:18px 24px;
      border-bottom:1px solid var(--line); background:var(--bg-1); position:sticky; top:0; z-index:5; }
    .top h1 { font-size:18px; margin:0; }
    .top .live { font-size:11px; color:var(--teal); }
    .top .live::before { content:''; display:inline-block; width:7px; height:7px; border-radius:50%;
      background:var(--teal); margin-right:6px; box-shadow:0 0 8px var(--teal); animation:blink 1.4s infinite; }
    @keyframes blink { 50% { opacity:.3; } }
    .kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:14px; padding:22px 24px; }
    .kpi { background:var(--bg-1); border:1px solid var(--line); border-radius:12px; padding:16px 18px; }
    .kpi-label { font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:var(--ink-3); margin-bottom:8px; }
    .kpi-val { font-size:26px; font-weight:600; color:var(--ink-0); }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:16px; padding:0 24px 32px; }
    .card { background:var(--bg-1); border:1px solid var(--line); border-radius:12px; overflow:hidden; }
    .card header { background:var(--bg-2); color:var(--teal); font-size:11px; padding:10px 16px; border-bottom:1px solid var(--line); }
    .card-body { padding:6px 18px 16px; max-height:420px; overflow:auto; }
  `;

  const body = `
    <div class="top">
      <h1>${escapeHtml(title)}</h1>
      <span class="live mono" id="status">LIVE · <span id="clock"></span></span>
    </div>
    <div class="kpis">${kpis}</div>
    <div class="grid">${cards}</div>`;

  const script = `
    (function(){
      var clock=document.getElementById('clock');
      function tick(){ if(clock) clock.textContent=new Date().toLocaleTimeString(); }
      tick(); setInterval(tick,1000);
    })();
  `;

  const markdown = [
    `# ${title}`,
    ``,
    `_Dashboard composed by \`/dashboard-builder\`._`,
    ``,
    ...sections.map((s) => `---\n\n${s.raw}`),
  ].join("\n");

  return {
    type: "dashboard",
    metadata: { type: "dashboard", title, duration: "live", modules: sections.length || 1, targetAudience: "Analysts" },
    markdown,
    html: htmlDoc(title, css, body, script),
    htmlDeps: [],
  };
}

// ─── /react-generator ─────────────────────────────────────────────────────────

const REACT_GENERATOR: SkillExecutor_ = async function* (ctx) {
  const title = titleFromPrompt(ctx.prompt, "Component");
  const sections = collectSections(ctx);
  yield* designStep("react-generator", `Generating component · ${title}`, buildReact(ctx, title, sections));
};

function buildReact(ctx: SkillContext, title: string, sections: Section[]): StructuredOutput {
  const compName =
    title.replace(/[^A-Za-z0-9]+/g, " ").trim().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("") ||
    "GeneratedComponent";

  const items = sections.length
    ? sections.map((s) => ({ label: s.skill, title: s.title.replace(/^[#\s]+/, "").slice(0, 60) }))
    : [{ label: "sample", title: "Replace with your data source" }];

  const source = `import { useState } from "react";

interface Item { label: string; title: string; }

const ITEMS: Item[] = ${JSON.stringify(items, null, 2)};

export default function ${compName}() {
  const [active, setActive] = useState(0);
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 text-slate-100">
      <h2 className="mb-4 text-lg font-semibold">${title.replace(/"/g, '\\"')}</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {ITEMS.map((it, i) => (
          <button
            key={it.label}
            onClick={() => setActive(i)}
            className={\`rounded-lg px-3 py-1.5 text-xs \${
              active === i ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-300"
            }\`}
          >
            /{it.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-300">{ITEMS[active]?.title}</p>
    </div>
  );
}`;

  // A vanilla-JS mirror of the component so the preview is genuinely interactive.
  const previewData = JSON.stringify(items);
  const css = `
    .wrap { max-width:760px; margin:0 auto; padding:28px 22px; }
    .split { display:grid; grid-template-columns:1fr; gap:18px; }
    @media(min-width:760px){ .split { grid-template-columns:1fr 1fr; } }
    .pane { background:var(--bg-1); border:1px solid var(--line); border-radius:12px; overflow:hidden; }
    .pane header { background:var(--bg-2); color:var(--ink-2); font-size:10px; text-transform:uppercase;
      letter-spacing:0.1em; padding:8px 14px; border-bottom:1px solid var(--line); }
    .pane .inner { padding:18px; }
    .btns { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
    .btns button { background:var(--bg-3); color:var(--ink-2); border:1px solid var(--line);
      border-radius:8px; padding:6px 12px; font-size:12px; cursor:pointer; }
    .btns button.active { background:rgba(77,141,255,0.15); color:var(--accent); border-color:var(--accent); }
    pre.code { margin:0; max-height:520px; font-size:12px; }
  `;

  const body = `
    <div class="wrap">
      <h1 style="font-size:22px;margin:0 0 4px">${escapeHtml(title)}</h1>
      <p class="mono" style="color:var(--ink-3);font-size:12px;margin:0 0 18px">&lt;${escapeHtml(compName)} /&gt; · React + Tailwind</p>
      <div class="split">
        <div class="pane">
          <header>Live preview</header>
          <div class="inner">
            <div class="btns" id="btns"></div>
            <p id="out" style="font-size:14px;color:var(--ink-1)"></p>
          </div>
        </div>
        <div class="pane">
          <header>${escapeHtml(compName)}.tsx</header>
          <div class="inner"><pre class="code"><code>${escapeHtml(source)}</code></pre></div>
        </div>
      </div>
    </div>`;

  const script = `
    (function(){
      var items = ${previewData};
      var active = 0;
      var btns = document.getElementById('btns');
      var out = document.getElementById('out');
      function render(){
        btns.innerHTML = items.map(function(it,i){
          return '<button class="'+(i===active?'active':'')+'" data-i="'+i+'">/'+it.label+'</button>';
        }).join('');
        out.textContent = items[active] ? items[active].title : '';
        Array.prototype.forEach.call(btns.querySelectorAll('button'), function(b){
          b.addEventListener('click', function(){ active = +b.getAttribute('data-i'); render(); });
        });
      }
      render();
    })();
  `;

  const markdown = [
    `# ${title}`,
    ``,
    `\`\`\`tsx`,
    source,
    `\`\`\``,
  ].join("\n");

  return {
    type: "component",
    metadata: { type: "component", title, duration: "n/a", modules: 1, targetAudience: "Developers" },
    markdown,
    html: htmlDoc(title, css, body, script),
    htmlDeps: ["react", "tailwindcss"],
  };
}

// ─── Plumbing ─────────────────────────────────────────────────────────────────

// Local alias so we don't widen the public SkillExecutor type import surface.
type SkillExecutor_ = (ctx: SkillContext) => AsyncGenerator<SkillEvent>;

/** Stream a structured envelope out as a single skill step (JSON payload). */
async function* designStep(skill: string, label: string, payload: StructuredOutput): AsyncGenerator<SkillEvent> {
  const json = JSON.stringify(payload, null, 2);
  yield* streamMarkdown(json, skill, label);
}

// ─── Shared exports (reused by knowledge.ts / documents.ts executors) ─────────
export { escapeHtml, titleFromPrompt, mdToHtml, collectSections, htmlDoc, BASE_CSS, designStep };
export type { StructuredOutput, Section, SkillExecutor_ };

// ─── Registry ─────────────────────────────────────────────────────────────────

export const DESIGN_EXECUTORS: Record<string, SkillExecutor_> = {
  "frontend-design":   FRONTEND_DESIGN,
  "dashboard-builder": DASHBOARD_BUILDER,
  "react-generator":   REACT_GENERATOR,
};
