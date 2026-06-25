/**
 * lib/skills/executors/notebooklm.ts
 * ─────────────────────────────────
 * Queries a Google NotebookLM notebook via the `nlm` CLI and streams the
 * response as a markdown step + an HTML response card artifact.
 *
 * Expects the prompt to start with a header injected by the UI picker:
 *   __nlm_notebook__: {"id":"<uuid>","title":"<notebook title>"}
 *   <actual user query>
 *
 * The executor strips that header before sending the query to nlm.
 */

import { execFile } from "child_process";
import { SkillContext, SkillEvent, streamMarkdown } from "../types";
import { escapeHtml, htmlDoc, designStep, type SkillExecutor_ } from "./design";

// Full path avoids PATH issues in the Next.js server runtime.
const NLM_PATH =
  "C:\\Users\\Admin\\AppData\\Roaming\\Python\\Python314\\Scripts\\nlm.exe";

const NLM_ENV = {
  ...process.env,
  PATH:
    (process.env.PATH ?? "") +
    ";C:\\Users\\Admin\\AppData\\Roaming\\Python\\Python314\\Scripts",
};

interface NotebookHeader {
  id: string;
  title: string;
  cleanPrompt: string;
}

function parseHeader(prompt: string): NotebookHeader | null {
  const match = prompt.match(/^__nlm_notebook__:\s*(\{[^\n]+\})\n([\s\S]*)$/);
  if (!match) return null;
  try {
    const meta = JSON.parse(match[1]) as { id?: string; title?: string };
    if (!meta.id) return null;
    return {
      id: meta.id,
      title: meta.title ?? "Notebook",
      cleanPrompt: match[2].trim(),
    };
  } catch {
    return null;
  }
}

function callNlm(notebookId: string, query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      NLM_PATH,
      ["notebook", "query", notebookId, query],
      { timeout: 120_000, env: NLM_ENV, maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) { reject(new Error(stderr.trim() || err.message)); return; }
        // Output is always JSON: { answer, conversation_id, sources_used, citations }
        try {
          const parsed = JSON.parse(stdout.trim()) as { answer?: string };
          resolve(parsed.answer?.trim() || "No answer returned from NotebookLM.");
        } catch {
          // Fallback: treat raw stdout as plain text
          resolve(stdout.trim() || "No response from NotebookLM.");
        }
      }
    );
  });
}

const NOTEBOOKLM_EXECUTOR: SkillExecutor_ = async function* (ctx) {
  const parsed = parseHeader(ctx.prompt);

  if (!parsed) {
    yield* streamMarkdown(
      [
        "## NotebookLM",
        "",
        "> **No notebook selected.**",
        "> Use the notebook picker in the AI Builder to choose a notebook before running this skill.",
      ].join("\n"),
      "notebooklm",
      "Driving NotebookLM"
    );
    return;
  }

  const { id, title, cleanPrompt } = parsed;

  // ── Step 1: call nlm and stream text answer ────────────────────────────────
  let answer: string;
  try {
    answer = await callNlm(id, cleanPrompt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    yield* streamMarkdown(
      [
        "## NotebookLM — Error",
        "",
        "```",
        msg,
        "```",
        "",
        "Re-authenticate by running `nlm login` if the session has expired.",
      ].join("\n"),
      "notebooklm",
      "Driving NotebookLM"
    );
    return;
  }

  yield* streamMarkdown(
    `## ${title}\n\n${answer}`,
    "notebooklm",
    `Querying "${title}"`
  );

  // ── Step 2: HTML response card artifact ────────────────────────────────────
  const css = `
    .nlm{max-width:820px;margin:0 auto;padding:26px 20px;}
    .nlm-hd{display:flex;align-items:center;gap:12px;margin-bottom:20px;}
    .nlm-ico{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;
             background:linear-gradient(135deg,#0d6e4b,#1a9e6e);font-size:20px;flex-shrink:0;}
    .nlm-t{font-size:18px;font-weight:600;color:var(--ink-0);line-height:1.2;}
    .nlm-sub{font-size:11px;color:var(--ink-3);margin-top:3px;text-transform:uppercase;letter-spacing:.1em;}
    .nlm-body{background:var(--bg-2);border:1px solid var(--line-strong);border-radius:10px;
              padding:20px 22px;white-space:pre-wrap;font-size:14px;line-height:1.75;color:var(--ink-1);}
    .nlm-ft{margin-top:12px;display:flex;align-items:center;gap:8px;font-size:11px;color:var(--ink-3);}
    .nlm-badge{display:inline-block;background:rgba(26,158,110,.15);color:#1a9e6e;
               padding:2px 9px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.06em;}
  `;

  const html = htmlDoc("NotebookLM Response", css, `
    <div class="nlm">
      <div class="nlm-hd">
        <div class="nlm-ico">📓</div>
        <div>
          <div class="nlm-t">${escapeHtml(title)}</div>
          <div class="nlm-sub">NotebookLM RAG Response</div>
        </div>
      </div>
      <div class="nlm-body">${escapeHtml(answer)}</div>
      <div class="nlm-ft">
        <span class="nlm-badge">NOTEBOOKLM</span>
        <span>Sourced from your uploaded documents · ${escapeHtml(title)}</span>
      </div>
    </div>
  `);

  yield* designStep("notebooklm", `Response — ${title}`, {
    type: "notebooklm",
    metadata: {
      type: "notebooklm",
      title,
      duration: "live",
      modules: 1,
      targetAudience: "User",
    },
    markdown: `# ${title}\n\n${answer}`,
    html,
    htmlDeps: [],
  });
};

export const NOTEBOOKLM_EXECUTORS: Record<string, SkillExecutor_> = {
  notebooklm: NOTEBOOKLM_EXECUTOR,
};
