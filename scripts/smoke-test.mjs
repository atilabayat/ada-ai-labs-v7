/**
 * Smoke-test layer for ADA AI Labs.
 *
 * Probes a RUNNING server (default http://127.0.0.1:3000, override with
 * SMOKE_URL) and asserts every page + API route responds correctly. Catches the
 * "is the app up / is a route broken" regression class fast — the same failures
 * that bit us manually this session (server down, wiki 500s, build-stream 500s).
 *
 * Run:   npm run smoke      (server must already be running)
 *        SMOKE_URL=http://127.0.0.1:3001 npm run smoke
 *
 * Exit:  0 = all internal checks passed (external/market warnings allowed)
 *        1 = an internal check failed
 *        2 = server unreachable
 *
 * Zero dependencies beyond @prisma/client (already installed) + global fetch.
 */

import { PrismaClient } from "@prisma/client";

const BASE = (process.env.SMOKE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const REQ_TIMEOUT = 30_000;

// ── tiny reporter ───────────────────────────────────────────────────────────
const C = { reset: "\x1b[0m", green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m", dim: "\x1b[90m", bold: "\x1b[1m" };
const sym = { ok: `${C.green}✓${C.reset}`, fail: `${C.red}✗${C.reset}`, warn: `${C.yellow}⚠${C.reset}`, skip: `${C.dim}·${C.reset}` };
const results = []; // { group, name, status: "ok"|"fail"|"warn"|"skip", detail }
function record(group, name, status, detail = "") {
  results.push({ group, name, status, detail });
  const label = name.length > 42 ? name.slice(0, 41) + "…" : name.padEnd(42);
  console.log(`  ${sym[status]} ${label} ${C.dim}${detail}${C.reset}`);
}

// ── fetch helpers ───────────────────────────────────────────────────────────
async function get(path, { timeout = REQ_TIMEOUT } = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeout);
  try {
    const res = await fetch(BASE + path, { signal: ac.signal, redirect: "follow" });
    const body = await res.text();
    return { status: res.status, body };
  } finally {
    clearTimeout(t);
  }
}

// Next 16 App Router embeds the not-found / error boundary templates into every
// valid page's HTML (for client-side nav), so we CAN'T scan the body for strings
// like "This page could not be found" — they're present on healthy pages too.
// A real failure returns a non-200 status (404 / 500), which the status check
// catches (that's the class that bit us: wiki + build 500s). The app-shell
// marker confirms the layout actually rendered rather than a bare error page.
function pageProblem(status, body) {
  if (status !== 200) return `HTTP ${status}`;
  if (!body.includes("AI Labs")) return "missing app shell";
  return null;
}

// ── check groups ────────────────────────────────────────────────────────────
const PAGES = [
  "/", "/dashboard", "/builder", "/applications", "/dashboards", "/gex-heatmap",
  "/research", "/knowledge", "/quant", "/quant?view=walls", "/quant?view=bloomberg",
  "/sr-profiles", "/skills", "/quant-embedded-sources", "/sources-quant", "/sources-wiki",
  "/reference-api-1", "/reference-api-2", "/admin", "/wikis", "/wikis?section=system", "/wikis/new",
];

async function checkPages() {
  console.log(`\n${C.bold}Pages${C.reset}`);
  for (const path of PAGES) {
    try {
      const { status, body } = await get(path);
      const problem = pageProblem(status, body);
      if (problem) record("pages", path, "fail", problem);
      else record("pages", path, "ok", "200");
    } catch (e) {
      record("pages", path, "fail", e.name === "AbortError" ? "timeout" : e.message);
    }
  }
}

async function checkWikis(slugs) {
  console.log(`\n${C.bold}Wiki reader (dynamic)${C.reset}`);
  if (!slugs.length) { record("wikis", "/wikis/[slug]", "skip", "no wikis in DB"); return; }
  for (const { slug, title } of slugs) {
    try {
      const { status, body } = await get(`/wikis/${slug}`);
      const problem = pageProblem(status, body);
      if (problem) record("wikis", `/wikis/${slug}`, "fail", problem);
      else if (title && !body.includes(title)) record("wikis", `/wikis/${slug}`, "fail", "title not rendered");
      else record("wikis", `/wikis/${slug}`, "ok", "200 + title");
    } catch (e) {
      record("wikis", `/wikis/${slug}`, "fail", e.name === "AbortError" ? "timeout" : e.message);
    }
  }
}

async function checkHealth() {
  console.log(`\n${C.bold}API${C.reset}`);
  try {
    const { status, body } = await get("/api/health");
    if (status !== 200) return record("api", "/api/health", "fail", `HTTP ${status}`);
    JSON.parse(body); // must be JSON
    record("api", "/api/health", "ok", "200 + json");
  } catch (e) {
    record("api", "/api/health", "fail", e.message);
  }
}

async function checkBuildStream(buildId) {
  if (!buildId) return record("api", "/api/builds/[id]/stream", "skip", "no done build in DB");
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 6000);
  try {
    const res = await fetch(`${BASE}/api/builds/${buildId}/stream`, { signal: ac.signal });
    if (res.status !== 200) { clearTimeout(t); return record("api", "/api/builds/[id]/stream", "fail", `HTTP ${res.status}`); }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", events = 0;
    const deadline = Date.now() + 3500;
    while (Date.now() < deadline) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      events = (buf.match(/^data:/gm) || []).length;
      if (events >= 1) break;
    }
    ac.abort(); // stop streaming the rest
    clearTimeout(t);
    if (events >= 1) record("api", "/api/builds/[id]/stream", "ok", `200 + ${events} event(s)`);
    else record("api", "/api/builds/[id]/stream", "fail", "200 but no data events");
  } catch (e) {
    clearTimeout(t);
    // An abort AFTER we recorded success won't reach here; a real failure will.
    record("api", "/api/builds/[id]/stream", "fail", e.name === "AbortError" ? "timeout (no events)" : e.message);
  }
}

async function checkKnowledgeRelated(nodeId) {
  if (!nodeId) return record("api", "/api/knowledge/[id]/related", "skip", "no graph node in DB");
  try {
    const { status, body } = await get(`/api/knowledge/${nodeId}/related`);
    if (status !== 200) return record("api", "/api/knowledge/[id]/related", "fail", `HTTP ${status}`);
    JSON.parse(body);
    record("api", "/api/knowledge/[id]/related", "ok", "200 + json");
  } catch (e) {
    record("api", "/api/knowledge/[id]/related", "fail", e.message);
  }
}

const MARKET = [
  ["quotes",  "type=quotes&symbols=SPY,TSLA"],
  ["options", "type=options&symbol=TSLA"],
  ["term",    "type=term&symbol=TSLA"],
  ["gexmap",  "type=gexmap&symbol=TSLA"],
  ["history", "type=history&symbol=SPY"],
  ["bbchain", "type=bbchain&symbol=SPY"],
];
async function checkMarket() {
  console.log(`\n${C.bold}API · /api/market ${C.dim}(EXTERNAL — Yahoo; warnings don't fail the run)${C.reset}`);
  for (const [name, qs] of MARKET) {
    try {
      const { status, body } = await get(`/api/market?${qs}`);
      let ok = false;
      try { ok = JSON.parse(body)?.ok === true; } catch { /* non-json */ }
      if (status === 200 && ok) record("market", `market:${name}`, "ok", "200 + ok");
      else record("market", `market:${name}`, "warn", status !== 200 ? `HTTP ${status}` : "ok:false");
    } catch (e) {
      record("market", `market:${name}`, "warn", e.name === "AbortError" ? "timeout" : e.message);
    }
  }
}

// ── ID discovery via Prisma ─────────────────────────────────────────────────
async function discover() {
  const prisma = new PrismaClient();
  const out = { slugs: [], buildId: null, nodeId: null };
  try {
    // Prefer one system guide + one research wiki to hit both render paths.
    const sys = await prisma.wiki.findFirst({ where: { banner: "system" }, select: { slug: true, title: true } });
    const res = await prisma.wiki.findFirst({ where: { banner: "research" }, select: { slug: true, title: true } });
    const any = await prisma.wiki.findMany({ take: 3, orderBy: { sortOrder: "asc" }, select: { slug: true, title: true } });
    const picked = new Map();
    for (const w of [sys, res, ...any].filter(Boolean)) if (!picked.has(w.slug)) picked.set(w.slug, w);
    out.slugs = [...picked.values()].slice(0, 3);

    const build = await prisma.build.findFirst({ where: { status: "done" }, orderBy: { createdAt: "desc" }, select: { id: true } });
    out.buildId = build?.id ?? null;

    const node = await prisma.knowledgeNode.findFirst({ select: { id: true } });
    out.nodeId = node?.id ?? null;
  } catch (e) {
    console.log(`${C.yellow}⚠ DB discovery failed (${e.message}); dynamic-route checks will be skipped.${C.reset}`);
  } finally {
    await prisma.$disconnect();
  }
  return out;
}

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`${C.bold}ADA AI Labs · smoke test${C.reset}  ${C.dim}→ ${BASE}${C.reset}`);

  // Preflight — server reachable?
  try {
    await get("/api/health", { timeout: 8000 });
  } catch (e) {
    console.log(`\n${sym.fail} ${C.bold}No server at ${BASE}${C.reset} (${e.name === "AbortError" ? "timeout" : e.message})`);
    console.log(`  Start it from a terminal, then re-run:`);
    console.log(`    ${C.dim}cd C:\\dev\\ada-ai-labs && npm run dev${C.reset}`);
    console.log(`    ${C.dim}npm run smoke${C.reset}`);
    process.exit(2);
  }

  const { slugs, buildId, nodeId } = await discover();

  await checkPages();
  await checkWikis(slugs);
  await checkHealth();
  await checkBuildStream(buildId);
  await checkKnowledgeRelated(nodeId);
  await checkMarket();

  // ── summary ────────────────────────────────────────────────────────────────
  const internal = results.filter((r) => r.group !== "market");
  const passed = internal.filter((r) => r.status === "ok").length;
  const failed = internal.filter((r) => r.status === "fail");
  const skipped = internal.filter((r) => r.status === "skip").length;
  const marketWarn = results.filter((r) => r.group === "market" && r.status === "warn").length;
  const marketOk = results.filter((r) => r.group === "market" && r.status === "ok").length;

  console.log(`\n${C.bold}Summary${C.reset}`);
  console.log(`  internal: ${C.green}${passed} passed${C.reset}, ${failed.length ? C.red : C.dim}${failed.length} failed${C.reset}, ${C.dim}${skipped} skipped${C.reset}`);
  console.log(`  market (external): ${marketOk} ok, ${marketWarn} warn`);

  if (failed.length) {
    console.log(`\n${C.red}${C.bold}FAILED:${C.reset}`);
    for (const f of failed) console.log(`  ${sym.fail} [${f.group}] ${f.name} — ${f.detail}`);
    process.exit(1);
  }
  console.log(`\n${C.green}${C.bold}All internal checks passed.${C.reset}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(`${C.red}smoke runner crashed:${C.reset}`, e);
  process.exit(1);
});
