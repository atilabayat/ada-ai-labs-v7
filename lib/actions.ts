"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { promoteAppDb } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { Env, DeepResearchResult } from "@/lib/types";
import { embedText, addPoint } from "@/lib/embeddings";
import { tavilySearch, arxivSearch, secSearch } from "@/lib/skills/web";
import { mdToHtml, slugify, cleanBuildMarkdown, extractWikiTitle, extractHeadings } from "@/lib/markdown";
import { runLLM } from "@/lib/skills/llm";
import type { SkillContext } from "@/lib/skills/types";

const VALID_ENVS: Env[] = ["dev", "staging", "live"];

export async function promoteApp(id: string, env: Env): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!VALID_ENVS.includes(env)) return { ok: false, error: "invalid env" };
  if (!id) return { ok: false, error: "missing id" };
  try {
    await promoteAppDb(id, env);
    revalidatePath("/applications");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export interface CreateBuildResult {
  ok: true;
  id: string;
}
export type CreateBuildOutcome = CreateBuildResult | { ok: false; error: string };

/**
 * Insert a new Build row and return its id. The client then opens an
 * EventSource against /api/builds/[id]/stream to receive live tokens.
 *
 * Note: this only PERSISTS the build intent. The actual orchestration runs
 * once the client connects to the SSE endpoint, so we don't block here.
 */
export async function createBuild(
  prompt: string,
  skills: string[],
  env: Env
): Promise<CreateBuildOutcome> {
  if (!prompt.trim()) return { ok: false, error: "prompt is empty" };
  if (!VALID_ENVS.includes(env)) return { ok: false, error: "invalid env" };
  try {
    const id = `b_${randomUUID().slice(0, 12)}`;
    await prisma.build.create({
      data: {
        id,
        prompt: prompt.trim(),
        skills: JSON.stringify(skills),
        env,
        status: "queued",
      },
    });
    revalidatePath("/builder");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function cancelBuild(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!id) return { ok: false, error: "missing id" };
  try {
    await prisma.build.update({ where: { id }, data: { status: "cancelled" } });
    revalidatePath("/builder");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─── App mutations ───────────────────────────────────────────────────────────

/** Hard-delete an application row. */
export async function deleteApp(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!id) return { ok: false, error: "missing id" };
  try {
    await prisma.app.delete({ where: { id } });
    revalidatePath("/applications");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Rename an application (name only — id is stable). */
export async function updateAppName(
  id: string,
  name: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!id || !name.trim()) return { ok: false, error: "missing id or name" };
  try {
    await prisma.app.update({ where: { id }, data: { name: name.trim() } });
    revalidatePath("/applications");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─── Wiki mutations ──────────────────────────────────────────────────────────

/** Hard-delete a wiki and all cascaded child rows (toc, sources, related, pages).
 *  Also clears promotedWikiSlug on any Build that referenced this slug, and
 *  invalidates the builder page cache so YourBuilds reflects the deletion. */
export async function deleteWiki(slug: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!slug) return { ok: false, error: "missing slug" };
  try {
    await prisma.$transaction([
      // Clear the wiki link on any build that referenced this slug
      prisma.build.updateMany({
        where:  { promotedWikiSlug: slug },
        data:   { promotedWikiSlug: null },
      }),
      // Delete the wiki (cascades to sources, related, toc, pageList)
      prisma.wiki.delete({ where: { slug } }),
    ]);
    revalidatePath("/wikis");
    revalidatePath("/knowledge");
    revalidatePath("/builder");   // ← keeps YourBuilds in sync
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Rename a wiki (title only — slug stays stable to avoid broken links). */
export async function updateWikiTitle(
  slug: string,
  title: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!slug || !title.trim()) return { ok: false, error: "missing slug or title" };
  try {
    await prisma.wiki.update({ where: { slug }, data: { title: title.trim() } });
    revalidatePath("/wikis");
    revalidatePath(`/wikis/${slug}`);
    revalidatePath("/builder");   // ← title shown in build card wiki badge
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Promote a wiki through the dev → staging → live pipeline. */
export async function promoteWiki(
  slug: string,
  env: Env
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!VALID_ENVS.includes(env)) return { ok: false, error: "invalid env" };
  if (!slug) return { ok: false, error: "missing slug" };
  try {
    await prisma.wiki.update({ where: { slug }, data: { env } });
    revalidatePath("/wikis");
    revalidatePath(`/wikis/${slug}`);
    revalidatePath("/builder");   // ← env badge on build card wiki link
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Tag / un-tag a wiki as a System User Guide.
 *  section="system"  → banner="system", env="live"  (published to System Guides section)
 *  section=null      → no-op (currently un-tagging is a manual promote/demote)
 */
export async function setWikiSection(
  slug: string,
  section: "system"
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!slug) return { ok: false, error: "missing slug" };
  try {
    await prisma.wiki.update({
      where: { slug },
      data:  { banner: "system", env: "live" },
    });
    revalidatePath("/wikis");
    revalidatePath(`/wikis/${slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─── NotebookLM ──────────────────────────────────────────────────────────────

export interface NotebookEntry {
  id: string;
  title: string;
  source_count: number;
  updated_at: string;
}

export interface NotebookResult {
  notebooks: NotebookEntry[];
  /** Set only when the fetch FAILED — distinguishes an error from a genuinely
   *  empty library, so the UI can show a real message + retry instead of a
   *  misleading "no notebooks found". */
  error?: string;
  cached?: boolean;
}

// Short-lived in-memory cache. The `nlm` CLI cold-starts a browser scrape that
// takes ~20-35s per call, which used to blow the old 30s timeout and silently
// return []. Caching means we pay that cost once, then the picker opens
// instantly for the rest of the session.
let _nbCache: { at: number; notebooks: NotebookEntry[] } | null = null;
const NB_TTL_MS = 5 * 60 * 1000;

/**
 * Returns the list of notebooks from the authenticated nlm CLI.
 * Called by the notebook picker in PromptComposer. Caches successful results
 * for NB_TTL_MS; on failure returns an `error` string instead of a bare [] so
 * the UI can tell "couldn't load" apart from "you have no notebooks".
 */
// Disk cache survives server restarts AND detached launch contexts. The nlm CLI
// does browser automation that fails with STATUS_DLL_INIT_FAILED (0xC0000142)
// when the Next server runs without an interactive desktop (e.g. launched as a
// background/detached process). When a live fetch fails for any reason, we fall
// back to the last successfully-saved list so the picker still works.
async function readNbDiskCache(): Promise<NotebookEntry[] | null> {
  try {
    const { readFile } = await import("fs/promises");
    const path = (await import("path")).default;
    const raw = await readFile(path.join(process.cwd(), ".nlm-notebooks.json"), "utf8");
    const arr = JSON.parse(raw) as NotebookEntry[];
    return Array.isArray(arr) && arr.length ? arr : null;
  } catch { return null; }
}
async function writeNbDiskCache(notebooks: NotebookEntry[]): Promise<void> {
  try {
    const { writeFile } = await import("fs/promises");
    const path = (await import("path")).default;
    await writeFile(path.join(process.cwd(), ".nlm-notebooks.json"), JSON.stringify(notebooks));
  } catch { /* non-fatal */ }
}

export async function getNotebooks(force = false): Promise<NotebookResult> {
  if (!force && _nbCache && Date.now() - _nbCache.at < NB_TTL_MS) {
    return { notebooks: _nbCache.notebooks, cached: true };
  }

  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const run = promisify(execFile);
  const NLM_PATH =
    "C:\\Users\\Admin\\AppData\\Roaming\\Python\\Python314\\Scripts\\nlm.exe";
  const env = {
    ...process.env,
    PATH:
      (process.env.PATH ?? "") +
      ";C:\\Users\\Admin\\AppData\\Roaming\\Python\\Python314\\Scripts",
  };

  try {
    const { stdout } = await run(
      NLM_PATH,
      ["notebook", "list", "--json"],
      { timeout: 90_000, env, maxBuffer: 4 * 1024 * 1024 }
    );
    const notebooks = JSON.parse(stdout) as NotebookEntry[];
    _nbCache = { at: Date.now(), notebooks };
    void writeNbDiskCache(notebooks);
    return { notebooks };
  } catch (err) {
    const e = err as NodeJS.ErrnoException & { code?: string | number; killed?: boolean };
    const dllInit = Number(e.code) === 3221225794; // 0xC0000142: no interactive desktop for the browser
    const timedOut = e.killed || /timed?\s?out|ETIMEDOUT/i.test(String(e.message));
    const why = dllInit
      ? "the NotebookLM browser can't start here - the dev server is running without an interactive desktop. Launch it from a normal terminal (npm run dev)."
      : timedOut
        ? "NotebookLM took too long to respond (cold start). Try again in a moment."
        : `nlm CLI error: ${String(e.message).slice(0, 160)}`;

    // Fall back to the last saved list so the picker still works.
    const disk = await readNbDiskCache();
    if (disk) {
      _nbCache = { at: Date.now(), notebooks: disk };
      return { notebooks: disk, cached: true, error: `Live refresh failed (${why}). Showing your last saved list.` };
    }
    return { notebooks: [], error: `Couldn't load notebooks: ${why}` };
  }
}

/** Hard-delete a build record from YourBuilds. */
export async function deleteBuild(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!id) return { ok: false, error: "missing id" };
  try {
    await prisma.build.delete({ where: { id } });
    revalidatePath("/builder");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─── Build → App conversion ─────────────────────────────────────────────────

const QUANT_IDS = new Set(["tsla-putwall","callwall-monitor","gamma-exposure","dealer-flow","vix-regime","ipa-compendium","market-data","morning-brief"]);
const RESEARCH_IDS = new Set(["deep-research","web-search","literature-review","academic-search","news-monitor","sec-filings"]);
const DEV_IDS = new Set(["frontend-design","dashboard-builder","react-generator","pdf-builder","docx-builder","xlsx-builder","vercel-deploy"]);
const KNOWLEDGE_IDS = new Set(["wiki-builder","knowledge-graph","lesson-generator","flash-brief","survey-paper","llm-council","notebooklm"]);

function deriveAppCat(skillIds: string[]): string {
  const counts = { quant: 0, research: 0, dev: 0, knowledge: 0 };
  for (const id of skillIds) {
    if (QUANT_IDS.has(id))     counts.quant++;
    else if (RESEARCH_IDS.has(id)) counts.research++;
    else if (DEV_IDS.has(id))   counts.dev++;
    else if (KNOWLEDGE_IDS.has(id)) counts.knowledge++;
  }
  const top = (Object.entries(counts) as [string, number][])
    .sort((a, b) => b[1] - a[1])[0];
  if (top[1] === 0) return "AI · Builder";
  const labels: Record<string, string> = {
    quant: "Quant · Builder", research: "Research · Builder",
    dev: "Dev · Builder", knowledge: "Knowledge · Builder",
  };
  return labels[top[0]] ?? "AI · Builder";
}

function deriveColor(cat: string): string {
  if (cat.startsWith("Quant"))    return "amber";
  if (cat.startsWith("Research")) return "teal";
  if (cat.startsWith("Dev"))      return "teal";
  if (cat.startsWith("Knowledge"))return "violet";
  return "rose";
}

function deriveType(skillIds: string[]): string {
  if (skillIds.includes("morning-brief"))       return "briefing";
  if (skillIds.includes("tsla-putwall") ||
      skillIds.includes("callwall-monitor"))     return "putwall";
  if (skillIds.includes("ipa-compendium"))       return "compendium";
  if (skillIds.includes("ai-news-digest"))       return "digest";
  if (skillIds.includes("wiki-builder"))         return "wiki";
  if (skillIds.includes("dashboard-builder") ||
      skillIds.includes("frontend-design"))      return "generic";
  return "generic";
}

function deriveAppName(prompt: string): string {
  const line = prompt.split("\n").find((l) => l.trim().length > 0) ?? "Untitled Build";
  return line.trim().slice(0, 52);
}

/**
 * Scan a build's stored output for a structured artifact envelope
 * ({ type, html, markdown }) emitted by a skill (course/survey/app/dashboard/
 * component). The orchestrator joins step outputs with "\n\n---\n\n", each
 * prefixed by a "# /skill" header, so we parse the whole output first, then
 * each header-stripped section. Returns the first interactive HTML artifact.
 */
function extractArtifact(rawOutput: string): { html: string; markdown: string; type: string } | null {
  const tryParse = (s: string): { html: string; markdown: string; type: string } | null => {
    const t = s.trim();
    if (!t.startsWith("{")) return null;
    try {
      const d = JSON.parse(t);
      if (d && typeof d === "object" && typeof d.html === "string" && d.html.trim()) {
        return {
          html: d.html,
          markdown: typeof d.markdown === "string" ? d.markdown : "",
          type: typeof d.type === "string" ? d.type : "artifact",
        };
      }
    } catch {
      /* not an envelope */
    }
    return null;
  };

  // Whole output is a bare envelope?
  const whole = tryParse(rawOutput);
  if (whole) return whole;

  // Otherwise scan each "# /skill"-prefixed section.
  for (const section of rawOutput.split("\n\n---\n\n")) {
    const body = section.replace(/^#[^\n]*\n+/, "");
    const found = tryParse(body);
    if (found) return found;
  }
  return null;
}

function deriveAppDesc(output: string, prompt: string): string {
  // Try to pull the first meaningful sentence from the synthesis section.
  const synthIdx = output.indexOf("# Synthesis");
  const tail = synthIdx >= 0 ? output.slice(synthIdx + 11) : output;
  const cleaned = tail.replace(/#{1,6}\s+/g, "").replace(/[*`>]/g, "").replace(/\s+/g, " ").trim();
  const desc = cleaned.slice(0, 200);
  if (desc.length > 20) return desc + (cleaned.length > 200 ? "…" : "");
  // Fallback to the prompt itself
  return `Build from prompt: ${prompt.trim().slice(0, 180)}`;
}

export interface CreateBuildWikiResult { ok: true; slug: string }
export type CreateBuildWikiOutcome = CreateBuildWikiResult | { ok: false; error: string };

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function extractTitle(prompt: string): string {
  // Shared resolver: `titled "X"` → ## Topic line → boilerplate-stripped line.
  return extractWikiTitle(prompt);
}

function extractSections(output: string): string[] {
  const synthIdx = output.indexOf("# Synthesis");
  const body = synthIdx >= 0 ? output.slice(synthIdx) : output;
  const headers = [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  return headers.length > 0 ? headers : ["Overview", "Key Concepts", "Analysis", "References"];
}

/**
 * Promote a finished Build into a Wiki row. Parses the synthesis output to
 * auto-generate a TOC. Idempotent via `promotedWikiSlug` on the Build row.
 */
export async function createBuildWiki(buildId: string, customTitle?: string): Promise<CreateBuildWikiOutcome> {
  const build = await prisma.build.findUnique({ where: { id: buildId } });
  if (!build) return { ok: false, error: "Build not found" };
  if (build.status !== "done") return { ok: false, error: "Build must be complete before saving" };
  if (build.promotedWikiSlug) return { ok: true, slug: build.promotedWikiSlug };

  const title   = (customTitle?.trim()) || extractTitle(build.prompt);
  const baseSlug = toSlug(title) || `wiki-${buildId.slice(0, 8)}`;

  // Build clean, publishable Markdown from the full build output (strips skill
  // headers / JSON envelopes / stub lines), then render it to HTML for the
  // reader. Storing HTML is what the Wiki reader expects — storing raw Markdown
  // is exactly what made new wikis render as garbled text.
  const cleanMd   = cleanBuildMarkdown(build.output);
  const htmlBody  = mdToHtml(cleanMd, { headingIds: true });
  // Deduped h2 headings — ids match the anchors mdToHtml emitted in htmlBody.
  const headings  = extractHeadings(cleanMd, [2]);
  const tocSource = headings.length
    ? headings
    : ["Overview", "Key Concepts", "Analysis", "References"].map((name, i) => ({ level: 2, text: name, id: slugify(name) || `section-${i}` }));
  const shortDesc = cleanMd.replace(/#{1,6}\s+/g, "").replace(/[*`>|]/g, "").trim().slice(0, 240);

  try {
    // Everything below runs in one transaction so a second concurrent call
    // (double-click, slow-network retry, etc.) sees this build's
    // promotedWikiSlug already set before it can compute its own slug and
    // create a duplicate row. Without this, the idempotency check at the top
    // of this function and the promotedWikiSlug write at the bottom raced —
    // every concurrent call read promotedWikiSlug as null and each created
    // its own wiki (this is how "quantum-cognition", -2, -3, -4, -5 all got
    // created from a single Save-as-Wiki click).
    const finalSlug = await prisma.$transaction(async (tx) => {
      const fresh = await tx.build.findUnique({
        where: { id: buildId },
        select: { promotedWikiSlug: true },
      });
      if (fresh?.promotedWikiSlug) return fresh.promotedWikiSlug;

      // Ensure slug uniqueness (re-checked inside the transaction).
      const existing = await tx.wiki.findMany({
        where: { slug: { startsWith: baseSlug } },
        select: { slug: true },
      });
      const slugSet = new Set(existing.map((w) => w.slug));
      let slug = baseSlug;
      let n = 2;
      while (slugSet.has(slug)) { slug = `${baseSlug}-${n++}`; }

      const wikiCount = await tx.wiki.count();
      const tocItems  = tocSource.map((h, i) => ({
        anchorId: h.id || `section-${i}`,
        name: h.text,
        sub: false,
        sortOrder: i,
      }));

      await tx.wiki.create({
        data: {
          slug,
          title,
          titleEm: null,
          lede: shortDesc.slice(0, 180),
          banner: "research",
          crumb: title,
          pages: 1,
          updated: new Date().toISOString().slice(0, 10),
          version: "1.0.0",
          visibility: "internal",
          env: "dev",
          content: htmlBody,
          cardDesc: shortDesc.slice(0, 160),
          cardStat1: `${tocSource.length} sections`,
          cardStat2: `${Math.max(1, Math.round(cleanMd.split(/\s+/).length / 200))} min read`,
          cardStat3: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          sortOrder: wikiCount,
          toc: { create: tocItems },
          pageList: {
            create: [{ pageId: "main", name: title, current: true, sortOrder: 0 }],
          },
        },
      });

      await tx.build.update({ where: { id: buildId }, data: { promotedWikiSlug: slug } });
      return slug;
    });

    revalidatePath("/wikis");
    revalidatePath("/builder");
    return { ok: true, slug: finalSlug };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
export interface CreateBuildAppResult { ok: true; appId: string }
export type CreateBuildAppOutcome = CreateBuildAppResult | { ok: false; error: string };

/**
 * Promote a finished Build into a persistent App row. Derives app metadata
 * (name, category, color, type) from the build's prompt + skill list. The
 * new app starts in `env: dev` — promote it to live via the Applications page.
 *
 * Idempotent: if the build already has a `promotedAppId`, returns that id
 * without creating a duplicate row.
 */
export async function createBuildApp(buildId: string): Promise<CreateBuildAppOutcome> {
  const build = await prisma.build.findUnique({ where: { id: buildId } });
  if (!build) return { ok: false, error: "Build not found" };
  if (build.status !== "done") return { ok: false, error: "Build must be complete before saving" };

  // Idempotent: already saved.
  if (build.promotedAppId) return { ok: true, appId: build.promotedAppId };

  const skills: string[] = JSON.parse(build.skills);
  const cat = deriveAppCat(skills);
  const color = deriveColor(cat);
  const name = deriveAppName(build.prompt);
  const appId = `app-${buildId}`;
  const now = new Date().toISOString().slice(11, 19); // HH:MM:SS

  // If the build produced a self-contained interactive artifact (course,
  // survey, dashboard, app, component…), capture its HTML so the launcher can
  // render the *actual application* instead of a generic placeholder.
  const artifact = extractArtifact(build.output);
  const type = artifact ? "artifact" : deriveType(skills);
  const desc = artifact && artifact.markdown
    ? deriveAppDesc(artifact.markdown, build.prompt)
    : deriveAppDesc(build.output, build.prompt);

  try {
    // Count existing apps for sort order.
    const count = await prisma.app.count();

    await prisma.app.create({
      data: {
        id: appId,
        name,
        cat,
        icon: name.charAt(0).toUpperCase(),
        color,
        env: "dev",
        url: `#${appId}`,
        type,
        desc,
        html: artifact?.html ?? null,
        markdown: artifact?.markdown || null,
        region: "ada-labs · local",
        uptime: "—",
        latency: "—",
        requests: "0/d",
        errors: "0%",
        log: JSON.stringify([[now, `promoted from build ${buildId}`, "ok"]]),
        sortOrder: count,
      },
    });

    // Record the link back on the build row.
    await prisma.build.update({ where: { id: buildId }, data: { promotedAppId: appId } });

    revalidatePath("/applications");
    revalidatePath("/builder");
    return { ok: true, appId };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─── Build → Wiki (with embedding) ─────────────────────────────────────────

/**
 * Resolve the markdown to publish for a build.
 *
 * Some skills emit a structured JSON envelope ({ type, html, markdown }) rather
 * than plain markdown. We never want to embed/store the raw JSON, so:
 *   1. an explicit `override` (passed by the client) wins;
 *   2. otherwise, if the stored output is a structured envelope, use its
 *      `markdown` portion;
 *   3. otherwise, fall back to the raw output (already plain markdown).
 */
function resolvePublishMarkdown(rawOutput: string, override?: string): string {
  if (override && override.trim()) return override;

  // Try to parse a single string as a structured envelope, returning its
  // markdown portion (or null if it isn't one).
  const envelopeMarkdown = (s: string): string | null => {
    const t = s.trim();
    if (!t.startsWith("{")) return null;
    try {
      const data = JSON.parse(t);
      if (data && typeof data === "object" && typeof data.markdown === "string" && data.markdown.trim()) {
        return data.markdown;
      }
    } catch {
      // not JSON → not an envelope
    }
    return null;
  };

  // Case 1: the whole output is a bare envelope.
  const whole = envelopeMarkdown(rawOutput);
  if (whole) return whole;

  // Case 2: the orchestrator stores finalOutput as sections joined by
  // "\n\n---\n\n", each prefixed with a "# /skill" header. Scan each section
  // (header stripped) for an embedded envelope and publish its markdown.
  for (const section of rawOutput.split("\n\n---\n\n")) {
    const body = section.replace(/^#[^\n]*\n+/, ""); // drop leading "# /skill" header
    const md = envelopeMarkdown(body);
    if (md) return md;
  }

  // Case 3: plain markdown already.
  return rawOutput;
}

/**
 * Publish a completed build as a new wiki page (with Qdrant embedding).
 *
 * @param buildId          the build to publish
 * @param markdownOverride optional markdown to publish instead of the stored
 *                         build.output — used by the client to publish the
 *                         markdown portion of a structured (course/survey)
 *                         output rather than its raw JSON envelope.
 * @returns the slug of the newly created wiki, e.g. "tsla-dealer-positioning-1717948284"
 *
 * Usage:
 *   const wikiSlug = await publishBuildAsWiki(buildId);
 *   // → redirect to /wikis/{wikiSlug}
 */
export async function publishBuildAsWiki(buildId: string, markdownOverride?: string): Promise<string> {
  try {
    // Fetch the build — `skills` is a JSON string of skill id[]
    const build = await prisma.build.findUnique({
      where: { id: buildId },
      select: { prompt: true, output: true, skills: true, createdAt: true, promotedWikiSlug: true },
    });

    if (!build || !build.output) {
      throw new Error("Build not found or has no output");
    }

    // Idempotent: this build already has a wiki — re-embed it and return the
    // existing slug instead of creating a duplicate entry.
    if (build.promotedWikiSlug) {
      const existing = await prisma.wiki.findUnique({
        where: { slug: build.promotedWikiSlug },
        select: { title: true, lede: true, slug: true },
      });
      if (existing) {
        try {
          const textToEmbed = `${existing.title}\n${existing.lede}`;
          const vector = await embedText(textToEmbed);
          const pointId = Math.abs(existing.slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0));
          await addPoint("wikis", pointId, vector, {
            id: existing.slug, slug: existing.slug,
            title: existing.title, excerpt: existing.lede,
          });
        } catch { /* embedding failure is non-fatal */ }
        return existing.slug;
      }
    }

    const skillIds: string[] = JSON.parse(build.skills);

    // Decide the wiki body:
    //   • An explicit course/survey override IS the deliverable → publish it.
    //   • Otherwise publish the FULL cleaned build output (research + synthesis).
    //     This matters for app-type artifacts (frontend-design / dashboard):
    //     their envelope markdown is just a thin wrapper, but the build's
    //     synthesis (Executive Summary, Key Findings, Trade Read, tables…) is a
    //     rich, elegant deliverable — that's what belongs in the wiki.
    // Then render to HTML, because the reader expects HTML (raw markdown shows
    // as garbled text).
    const markdown = markdownOverride && markdownOverride.trim()
      ? markdownOverride
      : cleanBuildMarkdown(build.output);
    const htmlBody = mdToHtml(markdown, { headingIds: true });

    // Resolve a clean human title — prefers an explicit `titled "..."` clause,
    // then the ## Topic line, then a boilerplate-stripped first line. (Slicing
    // the first 50 chars produced broken titles like
    // 'Create a comprehensive research wiki titled "AI Re'.)
    const title = extractWikiTitle(build.prompt);

    // Extract lede (first 2 sentences) from the clean markdown (no markup noise)
    const ledeSrc = markdown.replace(/#{1,6}\s+/g, "").replace(/[*`>|]/g, "").trim();
    const sentences = ledeSrc.split(/[.!?]+/).slice(0, 2);
    const lede = sentences.join(". ").substring(0, 200);

    // Extract H2 headings for TOC — deduped ids matching the anchors mdToHtml
    // emitted in htmlBody, so in-page navigation lands on the exact section.
    const headings = extractHeadings(markdown, [2]);

    // Generate unique slug — suffix is Unix seconds (decimal), matching the
    // pattern "tsla-dealer-positioning-1717948284" shown in callers.
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const slug = `${baseSlug}-${Math.floor(Date.now() / 1000)}`;

    // Everything below runs in one transaction so a second concurrent call
    // (double-click on Publish, slow-network retry, etc.) sees this build's
    // promotedWikiSlug already set before it creates its own duplicate wiki —
    // same race as createBuildWiki above, fixed the same way.
    const result = await prisma.$transaction(async (tx) => {
      const fresh = await tx.build.findUnique({
        where: { id: buildId },
        select: { promotedWikiSlug: true },
      });
      if (fresh?.promotedWikiSlug) {
        return { reused: true as const, slug: fresh.promotedWikiSlug };
      }

      const wikiCount = await tx.wiki.count();

      // Create the wiki with inline TOC + page list
      const wiki = await tx.wiki.create({
        data: {
          slug,
          title,
          lede,
          content: htmlBody,
          banner: "research",
          crumb: "Generated from Build",
          pages: 1,
          updated: new Date().toISOString().slice(0, 10),
          version: "1.0",
          visibility: "internal",
          env: "dev",
          cardDesc: lede.slice(0, 160),
          cardStat1: `${headings.length} sections`,
          cardStat2: `${Math.max(1, Math.round(markdown.split(/\s+/).length / 200))} min read`,
          cardStat3: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          sortOrder: wikiCount,
          toc: {
            create: headings.map((h, i) => ({
              anchorId: h.id || `section-${i}`,
              name: h.text,
              sub: false,
              sortOrder: i,
            })),
          },
          pageList: {
            create: [{ pageId: "main", name: title, current: true, sortOrder: 0 }],
          },
        },
      });

      // Link WikiSources to contributing skills
      for (let i = 0; i < skillIds.length; i++) {
        const skill = await tx.skill.findUnique({
          where: { id: skillIds[i] },
          select: { name: true },
        });
        if (skill) {
          await tx.wikiSource.create({
            data: {
              wikiSlug: wiki.slug,
              title: skill.name,
              meta: "Contributed skill",
              sortOrder: i,
            },
          });
        }
      }

      // Mark this build as promoted so future calls are idempotent.
      await tx.build.update({ where: { id: buildId }, data: { promotedWikiSlug: wiki.slug } });

      return { reused: false as const, slug: wiki.slug, title: wiki.title, lede: wiki.lede };
    });

    // Embed the wiki and add to Qdrant (non-blocking on failure). Outside the
    // transaction since it's a network call and doesn't need DB atomicity.
    try {
      const embedTitle = result.reused
        ? (await prisma.wiki.findUnique({ where: { slug: result.slug }, select: { title: true, lede: true } }))
        : { title: result.title, lede: result.lede };
      if (embedTitle) {
        const textToEmbed = result.reused
          ? `${embedTitle.title}\n${embedTitle.lede}`
          : `${embedTitle.title}\n${embedTitle.lede}\n${markdown.substring(0, 2000)}`;
        const vector = await embedText(textToEmbed);
        const pointId = Math.abs(result.slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0));
        await addPoint("wikis", pointId, vector, {
          id: result.slug,
          slug: result.slug,
          title: embedTitle.title,
          excerpt: embedTitle.lede,
        });
      }
    } catch (embeddingError) {
      console.error("Failed to embed wiki:", embeddingError);
    }

    revalidatePath("/wikis");
    revalidatePath("/builder");
    return result.slug;
  } catch (error) {
    console.error("Failed to publish build as wiki:", error);
    throw error;
  }
}

// ─── Research Session Log ────────────────────────────────────────────────────

export interface SavedResearchSession {
  id:          string;
  topic:       string;
  categories:  string[];
  status:      "finished" | "error";
  results:     DeepResearchResult[];
  resultCount: number;
  createdAt:   string; // ISO string
}

/** Persist a completed research session (upsert). */
export async function saveResearchSession(
  id: string,
  topic: string,
  categories: string[],
  status: "finished" | "error",
  results: DeepResearchResult[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.researchSession.upsert({
      where: { id },
      create: {
        id,
        topic,
        categories: JSON.stringify(categories),
        status,
        results:     JSON.stringify(results),
        resultCount: results.length,
      },
      update: {
        status,
        results:     JSON.stringify(results),
        resultCount: results.length,
      },
    });
    revalidatePath("/research");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Load all saved research sessions, newest first. */
export async function getResearchSessions(): Promise<SavedResearchSession[]> {
  const rows = await prisma.researchSession.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id:          r.id,
    topic:       r.topic,
    categories:  JSON.parse(r.categories) as string[],
    status:      r.status as "finished" | "error",
    results:     JSON.parse(r.results) as DeepResearchResult[],
    resultCount: r.resultCount,
    createdAt:   r.createdAt.toISOString(),
  }));
}

/** Delete a saved research session. */
export async function deleteResearchSession(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.researchSession.delete({ where: { id } });
    revalidatePath("/research");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─── Research → Knowledge Pipeline (curate → publish → graph) ────────────────

/** Format selected research results into a markdown source dossier for synthesis. */
function researchResultsToMarkdown(topic: string, results: DeepResearchResult[]): string {
  const lines: string[] = [`# Source dossier: ${topic}`, ""];
  results.forEach((r, i) => {
    lines.push(`## [${i + 1}] ${r.title}`);
    lines.push(`- Source: ${r.org || "—"} · ${r.badge || "—"} · ${r.date || "—"} · ${r.category}`);
    if (r.url) lines.push(`- URL: ${r.url}`);
    if (r.body) lines.push("", r.body);
    lines.push("");
  });
  return lines.join("\n");
}

/** Synthesize a narrative wiki body from the selected results via the orchestrator
 *  LLM (real Anthropic model when ANTHROPIC_API_KEY is set, stub fallback otherwise).
 *  Including a literature-review step nudges the synthesizer into "academic" mode. */
async function synthesizeResearchMarkdown(topic: string, results: DeepResearchResult[]): Promise<string> {
  const ctx: SkillContext = {
    prompt:
      `Create a research wiki titled "${topic}". Synthesize the source dossier below into a coherent, ` +
      `well-structured article using ## section headings. Weave the sources into a narrative and cite them ` +
      `inline as [n] matching their dossier numbers. Do not invent facts beyond the dossier.`,
    prevSteps: [
      { skill: "deep-research", output: researchResultsToMarkdown(topic, results) },
      { skill: "literature-review", output: "" },
    ],
    env: "dev",
  };
  let final = "";
  for await (const ev of runLLM(ctx)) {
    if (ev.type === "llm_end") final = ev.output;
  }
  return final.trim();
}

/** Deterministic structured body (synthesis off) — groups results by category. */
function structuredResearchMarkdown(topic: string, results: DeepResearchResult[]): string {
  const cats = [...new Set(results.map((r) => r.category))];
  const out: string[] = [
    `Curated research on **${topic}** — ${results.length} source${results.length === 1 ? "" : "s"} across ${cats.length} categor${cats.length === 1 ? "y" : "ies"}.`,
    "",
  ];
  for (const cat of cats) {
    out.push(`## ${cat}`, "");
    for (const r of results.filter((x) => x.category === cat)) {
      out.push(`### ${r.title}`);
      out.push(`*${r.org || "—"} · ${r.badge || "—"} · ${r.date || "—"}*`, "");
      if (r.body) out.push(r.body, "");
      if (r.url) out.push(`Source: [${r.title}](${r.url})`, "");
    }
  }
  return out.join("\n");
}

/** A numbered Sources section appended to every published research wiki. */
function sourcesMarkdown(results: DeepResearchResult[]): string {
  const out: string[] = ["## Sources", ""];
  results.forEach((r, i) => {
    const link = r.url ? `[${r.title}](${r.url})` : r.title;
    out.push(`${i + 1}. ${link} — ${r.org || "—"}, ${r.date || "—"} (${r.badge || r.category})`);
  });
  return out.join("\n");
}

/** Wikis available as append targets (slug + title + banner), for the publish picker. */
export async function getPublishableWikis(): Promise<{ slug: string; title: string; banner: string }[]> {
  return prisma.wiki.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, title: true, banner: true },
  });
}

export interface PublishResearchInput {
  topic:       string;
  results:     DeepResearchResult[];
  mode:        "new" | "append";
  targetSlug?: string;   // required when mode === "append"
  synthesize:  boolean;  // true → LLM narrative, false → structured list
  title?:      string;   // optional custom title for a new wiki
}
export type PublishResearchOutcome =
  | { ok: true; slug: string; appended: boolean }
  | { ok: false; error: string };

/**
 * Publish curated research results into a wiki — either a brand-new research
 * wiki or appended as a dated addendum to an existing one. When `synthesize` is
 * true, the body is generated by the orchestrator LLM; otherwise it is a
 * deterministic, category-grouped list. Sources are always recorded.
 */
export async function publishResearchToWiki(input: PublishResearchInput): Promise<PublishResearchOutcome> {
  const { topic, results, mode, targetSlug, synthesize } = input;
  if (!results || results.length === 0) return { ok: false, error: "No results selected" };
  if (!topic.trim()) return { ok: false, error: "Topic is required" };

  try {
    const bodyMd = synthesize
      ? await synthesizeResearchMarkdown(topic, results)
      : structuredResearchMarkdown(topic, results);
    const fullMd = `${bodyMd}\n\n${sourcesMarkdown(results)}`;

    // ── Append to an existing wiki ──────────────────────────────────────────
    if (mode === "append") {
      if (!targetSlug) return { ok: false, error: "No target wiki chosen" };
      const wiki = await prisma.wiki.findUnique({ where: { slug: targetSlug } });
      if (!wiki) return { ok: false, error: "Target wiki not found" };

      const stamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const heading = `Research addendum: ${topic} (${stamp})`;
      const addendumHtml = `\n<hr/>\n` + mdToHtml(`## ${heading}\n\n${fullMd}`, { headingIds: true });
      const existingSources = await prisma.wikiSource.count({ where: { wikiSlug: targetSlug } });

      await prisma.wiki.update({
        where: { slug: targetSlug },
        data: {
          content: wiki.content + addendumHtml,
          updated: new Date().toISOString().slice(0, 10),
          toc:     { create: { anchorId: slugify(heading), name: `Research: ${topic}`.slice(0, 46), sub: false, sortOrder: 900 + existingSources } },
          sources: { create: results.map((r, i) => ({
            title: r.title,
            meta:  `${r.org || "—"} · ${r.date || "—"} · ${r.badge || r.category}`,
            sortOrder: existingSources + i,
          })) },
        },
      });

      revalidatePath("/wikis");
      revalidatePath(`/wikis/${targetSlug}`);
      return { ok: true, slug: targetSlug, appended: true };
    }

    // ── Create a new research wiki ──────────────────────────────────────────
    const title    = (input.title?.trim()) || topic.trim();
    const baseSlug = slugify(title) || `research-${Date.now().toString(36)}`;
    const existing = await prisma.wiki.findMany({ where: { slug: { startsWith: baseSlug } }, select: { slug: true } });
    const slugSet  = new Set(existing.map((w) => w.slug));
    let slug = baseSlug, k = 2;
    while (slugSet.has(slug)) slug = `${baseSlug}-${k++}`;

    const htmlBody  = mdToHtml(fullMd, { headingIds: true });
    // Deduped h2 headings — ids match the anchors mdToHtml emitted in htmlBody.
    const headings  = extractHeadings(fullMd, [2]);
    const tocSource = headings.length
      ? headings
      : [{ level: 2, text: "Overview", id: "overview" }, { level: 2, text: "Sources", id: "sources" }];
    const shortDesc = bodyMd.replace(/#{1,6}\s+/g, "").replace(/[*`>|[\]]/g, "").trim().slice(0, 200);
    const cats      = [...new Set(results.map((r) => r.category))];
    const wikiCount = await prisma.wiki.count();

    await prisma.wiki.create({
      data: {
        slug, title, titleEm: null,
        lede:       shortDesc.slice(0, 180) || `Curated research on ${topic}.`,
        banner:     "research",
        crumb:      `Research / Wikis / ${title}`,
        pages:      1,
        updated:    new Date().toISOString().slice(0, 10),
        version:    "1.0.0",
        visibility: "internal",
        env:        "dev",
        content:    htmlBody,
        cardDesc:   shortDesc.slice(0, 160) || `Curated research on ${topic}.`,
        cardStat1:  `${results.length} source${results.length === 1 ? "" : "s"}`,
        cardStat2:  `${cats.length} categor${cats.length === 1 ? "y" : "ies"}`,
        cardStat3:  synthesize ? "synthesized" : "curated",
        sortOrder:  wikiCount,
        toc:        { create: tocSource.map((h, i) => ({ anchorId: h.id || `section-${i}`, name: h.text, sub: false, sortOrder: i })) },
        pageList:   { create: [{ pageId: "main", name: title, current: true, sortOrder: 0 }] },
        sources:    { create: results.map((r, i) => ({
          title: r.title,
          meta:  `${r.org || "—"} · ${r.date || "—"} · ${r.badge || r.category}`,
          sortOrder: i,
        })) },
      },
    });

    revalidatePath("/wikis");
    return { ok: true, slug, appended: false };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Push a research topic + its sources into the Knowledge Graph as a small
 * cluster: one central topic node linked to up to six distinct source-org nodes.
 */
export async function pushResearchToKnowledgeGraph(
  topic: string,
  results: DeepResearchResult[]
): Promise<{ ok: true; nodes: number; edges: number } | { ok: false; error: string }> {
  if (!topic.trim()) return { ok: false, error: "Topic is required" };
  try {
    const existing = await prisma.knowledgeNode.findMany({ select: { id: true, sortOrder: true } });
    const idSet    = new Set(existing.map((n) => n.id));
    const baseOrder = existing.reduce((m, n) => Math.max(m, n.sortOrder), 0) + 1;
    const uniqueId = (base: string) => {
      let id = base, j = 2;
      while (idSet.has(id)) id = `${base}-${j++}`;
      idSet.add(id);
      return id;
    };
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    // Offset each new cluster so they don't stack on prior pushes.
    const priorClusters = existing.filter((n) => n.id.startsWith("rk-")).length;
    const cx = 220 + ((priorClusters * 90) % 520);
    const cy = 300 + ((priorClusters * 60) % 170);

    const topicId = uniqueId(`rk-${slugify(topic).slice(0, 24) || "topic"}`);
    const nodes: {
      id: string; label: string; x: number; y: number; radius: number;
      color: string; fontSize: number; category: string; highlight: boolean; sortOrder: number;
    }[] = [{
      id: topicId,
      label: topic.length > 22 ? topic.slice(0, 21) + "…" : topic,
      x: clamp(cx, 110, 860), y: clamp(cy, 130, 500),
      radius: 20, color: "#a78bfa", fontSize: 11, category: "Research", highlight: true,
      sortOrder: baseOrder,
    }];
    const edges: { fromId: string; toId: string; opacity: number; sortOrder: number }[] = [];

    const orgs = [...new Set(results.map((r) => r.org).filter(Boolean))].slice(0, 6);
    orgs.forEach((org, i) => {
      const ang = (2 * Math.PI * i) / Math.max(1, orgs.length);
      const ox  = clamp(Math.round(cx + Math.cos(ang) * 78), 110, 860);
      const oy  = clamp(Math.round(cy + Math.sin(ang) * 64), 130, 500);
      const oid = uniqueId(`rk-${slugify(org).slice(0, 20) || "org"}`);
      nodes.push({
        id: oid, label: org.length > 18 ? org.slice(0, 17) + "…" : org,
        x: ox, y: oy, radius: 14, color: "#4d8dff", fontSize: 9, category: "Concept", highlight: false,
        sortOrder: baseOrder + 1 + i,
      });
      edges.push({ fromId: topicId, toId: oid, opacity: 0.22, sortOrder: baseOrder + i });
    });

    await prisma.knowledgeNode.createMany({ data: nodes });
    if (edges.length) await prisma.knowledgeEdge.createMany({ data: edges });
    revalidatePath("/knowledge");
    return { ok: true, nodes: nodes.length, edges: edges.length };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─── Deep Research ────────────────────────────────────────────────────────────

/**
 * Run a multi-source research session.
 * Called from the Research page client component.
 *
 * Parallel strategy per category:
 *   Academic   → arXiv (free, no key)
 *   Industry   → Tavily general
 *   Financial  → Tavily finance + SEC EDGAR 10-K/10-Q
 *   Government → Tavily general + SEC regulatory forms
 *   Technical  → Tavily general (technical framing)
 */
export async function runDeepResearch(
  topic: string,
  categories: string[]
): Promise<{ ok: true; results: DeepResearchResult[] } | { ok: false; error: string }> {
  if (!topic.trim()) return { ok: false, error: "Topic is required" };

  const results: DeepResearchResult[] = [];

  // Helper: safe URL parsing
  const getDomain = (url: string) => {
    try { return new URL(url).hostname.replace(/^www\./, ""); }
    catch { return url.slice(0, 30); }
  };

  // Helper: format ISO date string → "Month YYYY"
  const fmtDate = (iso?: string | null) => {
    if (!iso) return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
    try { return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" }); }
    catch { return iso; }
  };

  // Collect all parallel tasks
  const tasks: Promise<void>[] = [];

  // ── Academic ──────────────────────────────────────────────────────────────
  if (categories.includes("Academic")) {
    tasks.push((async () => {
      const papers = await arxivSearch(topic, 5);
      for (const p of papers) {
        const shortId = p.id.includes("/") ? p.id.split("/").pop()! : p.id;
        results.push({
          id:       `arxiv-${shortId}`,
          title:    p.title,
          badge:    `arXiv ${shortId}`,
          date:     fmtDate(p.date),
          org:      p.authors.length
            ? p.authors.slice(0, 2).join(", ") + (p.authors.length > 2 ? " et al." : "")
            : "Unknown",
          body:     p.abstract.length > 300
            ? p.abstract.slice(0, 297) + "…"
            : p.abstract,
          category: "Academic",
          url:      p.url,
        });
      }
    })());
  }

  // ── Industry ──────────────────────────────────────────────────────────────
  if (categories.includes("Industry")) {
    tasks.push((async () => {
      const resp = await tavilySearch(`${topic} industry analysis market trends`, {
        depth: "advanced", topic: "general", maxResults: 4,
      });
      for (const r of resp.results.slice(0, 4)) {
        const domain = r.source ?? getDomain(r.url);
        results.push({
          id:       `industry-${encodeURIComponent(r.url).slice(0, 60)}`,
          title:    r.title || topic,
          badge:    domain,
          date:     fmtDate(r.date),
          org:      domain,
          body:     r.content.length > 300 ? r.content.slice(0, 297) + "…" : r.content || "No excerpt.",
          category: "Industry",
          url:      r.url,
        });
      }
    })());
  }

  // ── Financial ─────────────────────────────────────────────────────────────
  if (categories.includes("Financial")) {
    tasks.push((async () => {
      const [tvRes, secRes] = await Promise.allSettled([
        tavilySearch(`${topic} financial analysis investment valuation`, {
          depth: "advanced", topic: "finance", maxResults: 3,
        }),
        secSearch(topic, "10-K,10-Q,8-K", 2),
      ]);

      if (tvRes.status === "fulfilled") {
        for (const r of tvRes.value.results.slice(0, 3)) {
          const domain = r.source ?? getDomain(r.url);
          results.push({
            id:       `finance-${encodeURIComponent(r.url).slice(0, 60)}`,
            title:    r.title || topic,
            badge:    domain,
            date:     fmtDate(r.date),
            org:      domain,
            body:     r.content.length > 300 ? r.content.slice(0, 297) + "…" : r.content || "No excerpt.",
            category: "Financial",
            url:      r.url,
          });
        }
      }
      if (secRes.status === "fulfilled") {
        for (const f of secRes.value) {
          results.push({
            id:       `sec-${f.company.replace(/\s+/g, "-")}-${f.form}`,
            title:    `${f.form} — ${f.company}`,
            badge:    `SEC ${f.form}`,
            date:     fmtDate(f.filed),
            org:      f.company,
            body:     f.description || `${f.form} filing retrieved from EDGAR.`,
            category: "Financial",
            url:      f.url,
          });
        }
      }
    })());
  }

  // ── Government ───────────────────────────────────────────────────────────
  if (categories.includes("Government")) {
    tasks.push((async () => {
      const [tvRes, secRes] = await Promise.allSettled([
        tavilySearch(`${topic} government policy regulation report`, {
          depth: "basic", topic: "general", maxResults: 3,
        }),
        secSearch(topic, "DEF 14A,S-1,20-F", 2),
      ]);

      if (tvRes.status === "fulfilled") {
        for (const r of tvRes.value.results.slice(0, 3)) {
          const domain = r.source ?? getDomain(r.url);
          results.push({
            id:       `gov-${encodeURIComponent(r.url).slice(0, 60)}`,
            title:    r.title || topic,
            badge:    domain,
            date:     fmtDate(r.date),
            org:      domain,
            body:     r.content.length > 300 ? r.content.slice(0, 297) + "…" : r.content || "No excerpt.",
            category: "Government",
            url:      r.url,
          });
        }
      }
      if (secRes.status === "fulfilled") {
        for (const f of secRes.value) {
          results.push({
            id:       `gov-sec-${f.company.replace(/\s+/g, "-")}-${f.form}`,
            title:    `${f.form} — ${f.company}`,
            badge:    `SEC ${f.form}`,
            date:     fmtDate(f.filed),
            org:      f.company,
            body:     f.description || `${f.form} filing retrieved from EDGAR.`,
            category: "Government",
            url:      f.url,
          });
        }
      }
    })());
  }

  // ── Technical ─────────────────────────────────────────────────────────────
  if (categories.includes("Technical")) {
    tasks.push((async () => {
      const resp = await tavilySearch(`${topic} technical implementation documentation`, {
        depth: "basic", topic: "general", maxResults: 4,
      });
      for (const r of resp.results.slice(0, 4)) {
        const domain = r.source ?? getDomain(r.url);
        results.push({
          id:       `tech-${encodeURIComponent(r.url).slice(0, 60)}`,
          title:    r.title || topic,
          badge:    domain,
          date:     fmtDate(r.date),
          org:      domain,
          body:     r.content.length > 300 ? r.content.slice(0, 297) + "…" : r.content || "No excerpt.",
          category: "Technical",
          url:      r.url,
        });
      }
    })());
  }

  await Promise.allSettled(tasks);
  return { ok: true, results };
}
