"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkspace } from "@/lib/store";
import { cancelBuild, createBuildApp, createBuildWiki, publishBuildAsWiki } from "@/lib/actions";
import ExportMenu from "@/components/ExportMenu";
import { SkillEvent } from "@/lib/skills/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StepState {
  skill:    string;
  label:    string;
  output:   string;
  complete: boolean;
  failed:   boolean;
}

type Phase     = "idle" | "connecting" | "streaming" | "done" | "failed" | "cancelled";
type SaveState = "idle" | "saving" | "saved" | "error";
type Tab       = "steps" | "output" | "preview" | "markdown";

/** Human label for the structured artifact's Preview tab, keyed by envelope type. */
const PREVIEW_LABEL: Record<string, string> = {
  course:    "📚 Course",
  survey:    "📄 Survey",
  app:       "🎨 Preview",
  dashboard: "📊 Dashboard",
  component: "⚛ Component",
};

/**
 * Some skills (course / survey generators) emit a structured JSON envelope
 * instead of plain markdown:
 *   { "type": "course" | "survey", "html": "<...>", "markdown": "# ..." }
 * When detected we render the HTML in a Preview pane and keep the markdown
 * portion for publishing to a wiki.
 */
interface StructuredOutput {
  type:      string;
  html:      string;
  markdown?: string;
  title?:    string;
}

/** Parse llmOutput as a structured envelope, or return null if it's plain text
 *  / still-streaming / malformed. */
function parseStructured(output: string): StructuredOutput | null {
  const trimmed = output.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const data = JSON.parse(trimmed);
    if (data && typeof data === "object"
        && typeof data.type === "string"
        && typeof data.html === "string") {
      return data as StructuredOutput;
    }
  } catch {
    // not valid JSON (e.g. tokens still streaming in) → treat as plain text
  }
  return null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_TONE: Record<Phase, string> = {
  idle:       "bg-bg-3 text-ink-2",
  connecting: "bg-[rgba(77,141,255,0.12)] text-accent",
  streaming:  "bg-[rgba(245,183,72,0.12)] text-accent-amber",
  done:       "bg-[rgba(45,212,191,0.12)] text-accent-teal",
  failed:     "bg-[rgba(255,86,119,0.12)] text-accent-rose",
  cancelled:  "bg-bg-3 text-ink-2",
};

function titleFromPrompt(s: string, max = 72): string {
  const line = s.split("\n").find((l) => l.trim()) ?? "Untitled build";
  return line.length > max ? line.slice(0, max) + "…" : line;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LiveBuildPanel() {
  const router = useRouter();

  const buildId         = useWorkspace((s) => s.currentBuildId);
  const buildPrompt     = useWorkspace((s) => s.currentBuildPrompt);
  const setCurrentBuild = useWorkspace((s) => s.setCurrentBuild);
  const showToast       = useWorkspace((s) => s.showToast);

  // ── Build state ──────────────────────────────────────────────────────────
  const [phase,     setPhase]     = useState<Phase>("idle");
  const [steps,     setSteps]     = useState<StepState[]>([]);
  const [llmOutput, setLlmOutput] = useState("");
  const [llmModel,  setLlmModel]  = useState("");
  const [llmStub,   setLlmStub]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed,   setElapsed]   = useState(0);

  // ── UI state ────────────────────────────────────────────────────────────
  const [minimized,  setMinimized]  = useState(false);
  const [tab,        setTab]        = useState<Tab>("steps");
  // Tracks whether we've already auto-advanced the tab for this build, so the
  // user's manual tab choice is never yanked away mid-stream.
  const autoTabRef = useRef(false);

  // ── Structured-output detection (course/survey JSON envelope) ─────────────
  // The lesson-/survey-generator executors emit the envelope as a *skill step*
  // output (not the LLM synthesis), so scan completed steps first; fall back to
  // the synthesis output in case a future skill emits the envelope there.
  const structured = useMemo(() => {
    for (const s of steps) {
      const parsed = parseStructured(s.output);
      if (parsed) return parsed;
    }
    return parseStructured(llmOutput);
  }, [steps, llmOutput]);

  // ── Auto-advance the active tab (once per build) ──────────────────────────
  // Prefer the interactive Preview when a structured artifact is detected;
  // otherwise fall to the Output tab once synthesis text starts arriving.
  useEffect(() => {
    if (autoTabRef.current) return;
    if (structured) {
      setTab("preview");
      autoTabRef.current = true;
    } else if (llmOutput || llmModel) {
      setTab("output");
      autoTabRef.current = true;
    }
  }, [structured, llmOutput, llmModel]);

  // ── Save/publish state ───────────────────────────────────────────────────
  const [saveState,      setSaveState]      = useState<SaveState>("idle");
  const [savedAppId,     setSavedAppId]     = useState<string | null>(null);
  const [wikiSaveState,  setWikiSaveState]  = useState<SaveState>("idle");
  const [savedWikiSlug,  setSavedWikiSlug]  = useState<string | null>(null);
  const [wikiNaming,     setWikiNaming]     = useState(false);
  const [wikiTitle,      setWikiTitle]      = useState("");
  const [publishState,   setPublishState]   = useState<SaveState>("idle");
  const [publishedSlug,  setPublishedSlug]  = useState<string | null>(null);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const esRef    = useRef<EventSource | null>(null);
  const stepsRef = useRef<StepState[]>([]);
  const llmRef   = useRef("");
  const bodyRef  = useRef<HTMLDivElement>(null);

  // ── Elapsed timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "streaming" && phase !== "connecting") return;
    const start = startedAt ?? Date.now();
    const i = setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => clearInterval(i);
  }, [phase, startedAt]);

  // ── Auto-scroll during streaming ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== "streaming" && phase !== "connecting") return;
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [llmOutput, steps, phase]);

  // ── EventSource lifecycle ─────────────────────────────────────────────────
  useEffect(() => {
    if (!buildId) {
      esRef.current?.close();
      esRef.current = null;
      return;
    }

    // Full reset for the new build
    setPhase("connecting");
    setSteps([]); stepsRef.current = [];
    setLlmOutput(""); llmRef.current = "";
    setLlmModel(""); setLlmStub(false);
    setError(null);
    setSaveState("idle"); setSavedAppId(null);
    setWikiSaveState("idle"); setSavedWikiSlug(null);
    setPublishState("idle"); setPublishedSlug(null);
    setStartedAt(Date.now()); setElapsed(0);
    setMinimized(false);
    setTab("steps");
    autoTabRef.current = false;

    const es = new EventSource(`/api/builds/${buildId}/stream`);
    esRef.current = es;

    es.onopen  = () => setPhase("streaming");
    es.onerror = () => {
      if (esRef.current !== es) return;
      es.close(); esRef.current = null;
      setPhase((p) => (["done", "cancelled", "failed"].includes(p) ? p : "failed"));
    };
    es.onmessage = (msg) => {
      try { handleEvent(JSON.parse(msg.data) as SkillEvent); }
      catch { /* ignore malformed frames */ }
    };

    return () => { es.close(); if (esRef.current === es) esRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildId]);

  // ── Event handler ─────────────────────────────────────────────────────────
  const handleEvent = (event: SkillEvent) => {
    switch (event.type) {
      case "step_start": {
        const next = [...stepsRef.current, { skill: event.skill, label: event.label, output: "", complete: false, failed: false }];
        stepsRef.current = next; setSteps(next);
        break;
      }
      case "token": {
        const next = stepsRef.current.map((s, i, a) =>
          i === a.length - 1 && s.skill === event.skill ? { ...s, output: s.output + event.text } : s
        );
        stepsRef.current = next; setSteps(next);
        break;
      }
      case "step_end": {
        const next = stepsRef.current.map((s, i, a) =>
          i === a.length - 1 && s.skill === event.skill ? { ...s, output: event.output, complete: true } : s
        );
        stepsRef.current = next; setSteps(next);
        break;
      }
      case "llm_start":
        setLlmModel(event.model); setLlmStub(event.isStub);
        break;
      case "llm_token":
        llmRef.current += event.text; setLlmOutput(llmRef.current);
        break;
      case "llm_end":
        llmRef.current = event.output; setLlmOutput(event.output);
        break;
      case "done":
        setPhase("done"); esRef.current?.close(); esRef.current = null;
        break;
      case "error":
        setError(event.message); setPhase("failed");
        esRef.current?.close(); esRef.current = null;
        break;
    }
  };

  // ── Keyboard shortcut ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!buildId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Esc while live → minimize (preserve stream); Esc in terminal → close
      if (isLive) setMinimized(true);
      else        handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildId, phase]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const isLive = phase === "streaming" || phase === "connecting";

  const handleClose = () => {
    esRef.current?.close(); esRef.current = null;
    if (isLive && buildId) {
      cancelBuild(buildId); // fire-and-forget; DB update in background
      showToast("Build cancelled and closed");
    }
    setCurrentBuild(null);
    setPhase("idle");
    setMinimized(false);
    router.refresh();
  };

  const onSaveAsApp = async () => {
    if (!buildId || saveState === "saving" || saveState === "saved") return;
    setSaveState("saving");
    const res = await createBuildApp(buildId);
    if (res.ok) {
      setSaveState("saved"); setSavedAppId(res.appId);
      showToast("Saved as app — starts in dev env");
      router.refresh();
    } else {
      setSaveState("error");
      showToast(`Save failed: ${res.error}`);
    }
  };

  const onSaveAsWiki = () => {
    if (!buildId || wikiSaveState === "saving" || wikiSaveState === "saved") return;
    // Pre-fill with the auto-derived title, then let the user edit before saving.
    setWikiTitle(buildTitle);
    setWikiNaming(true);
  };

  const onConfirmWikiSave = async (title: string) => {
    if (!buildId) return;
    setWikiNaming(false);
    setWikiSaveState("saving");
    const res = await createBuildWiki(buildId, title.trim() || buildTitle);
    if (res.ok) {
      setWikiSaveState("saved"); setSavedWikiSlug(res.slug);
      showToast("Saved as wiki — ready to read");
      router.refresh();
    } else {
      setWikiSaveState("error");
      showToast(`Wiki save failed: ${res.error}`);
    }
  };

  const onPublish = async () => {
    if (!buildId || publishState === "saving" || publishState === "saved") return;
    setPublishState("saving");
    try {
      // Course/survey artifacts ARE the deliverable → publish their markdown.
      // App/dashboard/component artifacts are just a UI wrapper, so let the
      // server build the wiki from the richer synthesis instead.
      const isDoc = structured?.type === "course" || structured?.type === "survey";
      const markdown = isDoc && structured?.markdown?.trim() ? structured.markdown : undefined;
      const slug = await publishBuildAsWiki(buildId, markdown);
      setPublishState("saved"); setPublishedSlug(slug);
      showToast("Published as wiki with embeddings");
      router.refresh();
    } catch (e) {
      setPublishState("error");
      showToast(`Publish failed: ${(e as Error).message}`);
    }
  };

  // ── Derived display values ────────────────────────────────────────────────

  const elapsedSec  = Math.floor(elapsed / 1000);
  const totalChars  = steps.reduce((n, s) => n + s.output.length, 0) + llmOutput.length;
  const buildTitle  = buildPrompt
    ? titleFromPrompt(buildPrompt)
    : buildId ? buildId.slice(0, 18) : "Build";

  // ── Render: nothing (idle, no build) ─────────────────────────────────────
  if (!buildId && phase === "idle") return null;

  // ── Render: minimized bar ─────────────────────────────────────────────────
  if (minimized) {
    return (
      <div className="mb-7 flex items-center gap-3 overflow-hidden rounded-[12px] border border-line-strong bg-bg-2 px-5 py-[10px] shadow-[var(--glow),0_8px_24px_rgba(0,0,0,0.3)]">

        {/* Traffic lights */}
        <div className="flex gap-[6px]">
          <button
            onClick={handleClose}
            title="Close build"
            className="group/btn grid h-[11px] w-[11px] place-items-center rounded-full bg-[#ff5f57] transition hover:bg-[#ff4338]"
          >
            <span className="text-[7px] font-bold text-[#7a0d09] opacity-0 transition group-hover/btn:opacity-100">✕</span>
          </button>
          <button
            onClick={() => setMinimized(false)}
            title="Restore"
            className="group/btn grid h-[11px] w-[11px] place-items-center rounded-full bg-[#febc2e] transition hover:bg-[#f5a900]"
          >
            <span className="text-[9px] font-bold text-[#5c3e00] opacity-0 transition group-hover/btn:opacity-100">+</span>
          </button>
        </div>

        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">▸ Live Build</span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-1" title={buildPrompt ?? ""}>
          {buildTitle}
        </span>

        {/* Status badge */}
        <span className={`flex-shrink-0 rounded-[3px] px-[8px] py-[2px] font-mono text-[9px] uppercase tracking-[0.12em] ${STATUS_TONE[phase]}`}>
          {isLive && (
            <span className="mr-[5px] inline-block h-[5px] w-[5px] animate-pulse rounded-full bg-current align-middle" />
          )}
          {phase}
        </span>

        {/* Restore button */}
        <button
          onClick={() => setMinimized(false)}
          className="flex-shrink-0 rounded-[6px] border border-line px-[10px] py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] text-ink-2 transition hover:border-line-strong hover:text-ink-0"
        >
          ↓ Restore
        </button>
      </div>
    );
  }

  // ── Render: full panel ────────────────────────────────────────────────────
  return (
    <div className="mb-7 overflow-hidden rounded-[14px] border border-line-strong bg-bg-1 shadow-[var(--glow),0_30px_60px_-20px_rgba(0,0,0,0.6)]">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-bg-2 px-5 py-[11px]">

        {/* Traffic-light controls — always visible */}
        <div className="flex gap-[6px]" title="Controls">
          {/* Close (●) — cancels stream if live */}
          <button
            onClick={handleClose}
            title={isLive ? "Cancel and close" : "Close panel"}
            className="group/btn grid h-[12px] w-[12px] place-items-center rounded-full bg-[#ff5f57] transition hover:bg-[#ff4338]"
          >
            <span className="text-[8px] font-bold text-[#7a0d09] opacity-0 transition group-hover/btn:opacity-100">✕</span>
          </button>
          {/* Minimize (─) */}
          <button
            onClick={() => setMinimized(true)}
            title="Minimize"
            className="group/btn grid h-[12px] w-[12px] place-items-center rounded-full bg-[#febc2e] transition hover:bg-[#f5a900]"
          >
            <span className="text-[10px] font-bold text-[#5c3e00] opacity-0 transition group-hover/btn:opacity-100">−</span>
          </button>
        </div>

        {/* Label */}
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">▸ Live Build</span>

        {/* Build title (derived from prompt) */}
        <span
          className="max-w-[340px] truncate text-[13px] font-medium text-ink-1"
          title={buildPrompt ?? ""}
        >
          {buildTitle}
        </span>

        {/* Status badge */}
        <span className={`rounded-[3px] px-[8px] py-[2px] font-mono text-[9px] uppercase tracking-[0.12em] ${STATUS_TONE[phase]}`}>
          {isLive && (
            <span className="mr-[5px] inline-block h-[6px] w-[6px] animate-pulse rounded-full bg-current align-middle" />
          )}
          {phase}
        </span>

        {/* ── Action buttons (shown when done) ── */}
        <div className="ml-auto flex flex-wrap items-center gap-[6px]">

          {/* ↗ Save as App */}
          {phase === "done" && saveState !== "saved" && (
            <button
              onClick={onSaveAsApp}
              disabled={saveState === "saving"}
              className="flex items-center gap-[6px] rounded-[6px] bg-gradient-to-br from-accent-hot to-accent-rose px-[10px] py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] text-white shadow-[0_4px_12px_rgba(255,122,61,0.25)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveState === "saving"
                ? <><span className="inline-block h-[10px] w-[10px] animate-spin rounded-full border-2 border-white/40 border-t-white" /> Saving…</>
                : saveState === "error" ? "↗ Retry App" : "↗ App"}
            </button>
          )}
          {phase === "done" && saveState === "saved" && savedAppId && (
            <button
              onClick={() => router.push("/applications")}
              className="flex items-center gap-[6px] rounded-[6px] border border-accent-teal bg-[rgba(45,212,191,0.08)] px-[10px] py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] text-accent-teal transition hover:bg-[rgba(45,212,191,0.15)]"
            >
              ✓ App →
            </button>
          )}

          {/* ▤ Save as Wiki — naming prompt or button */}
          {phase === "done" && wikiNaming && (
            <div className="flex items-center gap-[6px] rounded-[8px] border border-accent-violet bg-[rgba(167,139,250,0.08)] px-[8px] py-[4px]">
              <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-accent-violet">▤ Title</span>
              <input
                autoFocus
                value={wikiTitle}
                onChange={(e) => setWikiTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); onConfirmWikiSave(wikiTitle); }
                  if (e.key === "Escape") { setWikiNaming(false); }
                }}
                className="w-[200px] border-0 bg-transparent font-body text-[12px] text-ink-0 outline-none placeholder:text-ink-3"
                placeholder="Wiki title…"
              />
              <button
                onClick={() => onConfirmWikiSave(wikiTitle)}
                className="shrink-0 rounded px-[6px] py-[2px] font-mono text-[9px] uppercase tracking-[0.08em] text-accent-violet hover:bg-[rgba(167,139,250,0.2)]"
              >Save</button>
              <button
                onClick={() => setWikiNaming(false)}
                className="shrink-0 font-mono text-[12px] leading-none text-ink-3 hover:text-accent-rose"
              >×</button>
            </div>
          )}
          {phase === "done" && !wikiNaming && wikiSaveState !== "saved" && publishState !== "saved" && (
            <button
              onClick={onSaveAsWiki}
              disabled={wikiSaveState === "saving"}
              className="flex items-center gap-[6px] rounded-[6px] border border-[rgba(167,139,250,0.4)] bg-[rgba(167,139,250,0.08)] px-[10px] py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] text-accent-violet transition hover:border-accent-violet hover:bg-[rgba(167,139,250,0.15)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {wikiSaveState === "saving"
                ? <><span className="inline-block h-[10px] w-[10px] animate-spin rounded-full border-2 border-accent-violet/40 border-t-accent-violet" /> Saving…</>
                : wikiSaveState === "error" ? "▤ Retry" : "▤ Wiki"}
            </button>
          )}
          {phase === "done" && wikiSaveState === "saved" && savedWikiSlug && (
            <button
              onClick={() => router.push(`/wikis/${savedWikiSlug}`)}
              className="flex items-center gap-[6px] rounded-[6px] border border-accent-violet bg-[rgba(167,139,250,0.08)] px-[10px] py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] text-accent-violet transition hover:bg-[rgba(167,139,250,0.15)]"
            >
              ✓ Wiki →
            </button>
          )}

          {/* 📖 Publish Wiki (with embeddings) — hidden once wiki button already saved */}
          {phase === "done" && publishState !== "saved" && wikiSaveState !== "saved" && (
            <button
              onClick={onPublish}
              disabled={publishState === "saving"}
              className="flex items-center gap-[6px] rounded-[6px] border border-[rgba(45,212,191,0.4)] bg-[rgba(45,212,191,0.08)] px-[10px] py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] text-accent-teal transition hover:border-accent-teal hover:bg-[rgba(45,212,191,0.15)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {publishState === "saving"
                ? <><span className="inline-block h-[10px] w-[10px] animate-spin rounded-full border-2 border-accent-teal/40 border-t-accent-teal" /> Publishing…</>
                : publishState === "error" ? "📖 Retry" : "📖 Publish"}
            </button>
          )}
          {phase === "done" && publishState === "saved" && publishedSlug && (
            <button
              onClick={() => router.push(`/wikis/${publishedSlug}`)}
              className="flex items-center gap-[6px] rounded-[6px] border border-accent-teal bg-[rgba(45,212,191,0.08)] px-[10px] py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] text-accent-teal transition hover:bg-[rgba(45,212,191,0.15)]"
            >
              ✓ Published →
            </button>
          )}
          {/* ⬡ Export */}
          {phase === "done" && (
            <ExportMenu
              triggerLabel="⬡ Export"
              triggerClassName="flex items-center gap-[6px] rounded-[6px] border border-[rgba(77,141,255,0.3)] bg-[rgba(77,141,255,0.06)] px-[10px] py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] text-accent transition hover:border-accent hover:bg-[rgba(77,141,255,0.13)]"
              getContent={() => ({
                title:    buildTitle,
                html:     structured?.html ?? `<pre style="white-space:pre-wrap;word-break:break-word">${llmOutput.replace(/</g, "&lt;")}</pre>`,
                filename: buildTitle,
              })}
            />
          )}

        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-0 border-b border-line bg-bg-2">
        <button
          onClick={() => setTab("steps")}
          className={`relative px-5 py-[8px] font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
            tab === "steps"
              ? "text-accent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent after:content-['']"
              : "text-ink-3 hover:text-ink-1"
          }`}
        >
          Steps
          {steps.length > 0 && (
            <span className={`ml-[6px] rounded-[3px] px-[5px] py-[1px] text-[9px] ${
              tab === "steps" ? "bg-[rgba(77,141,255,0.15)] text-accent" : "bg-bg-3 text-ink-3"
            }`}>
              {steps.length}
            </span>
          )}
        </button>

        {/* Interactive Preview — only when a structured HTML artifact is detected */}
        {structured && (
          <button
            onClick={() => setTab("preview")}
            className={`relative px-5 py-[8px] font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
              tab === "preview"
                ? "text-accent-violet after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent-violet after:content-['']"
                : "text-ink-3 hover:text-ink-1"
            }`}
          >
            {PREVIEW_LABEL[structured.type] ?? "🎨 Preview"}
          </button>
        )}

        {/* Markdown (what publishes to a wiki) — only for structured artifacts */}
        {structured && structured.markdown && (
          <button
            onClick={() => setTab("markdown")}
            className={`relative px-5 py-[8px] font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
              tab === "markdown"
                ? "text-accent-violet after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent-violet after:content-['']"
                : "text-ink-3 hover:text-ink-1"
            }`}
          >
            Markdown
          </button>
        )}

        <button
          onClick={() => setTab("output")}
          className={`relative flex items-center gap-[6px] px-5 py-[8px] font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
            tab === "output"
              ? "text-accent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent after:content-['']"
              : "text-ink-3 hover:text-ink-1"
          }`}
        >
          {structured ? "Synthesis" : "Output"}
          {llmOutput.length > 0 && (
            <span className={`rounded-[3px] px-[5px] py-[1px] text-[9px] ${
              tab === "output" ? "bg-[rgba(45,212,191,0.12)] text-accent-teal" : "bg-bg-3 text-ink-3"
            }`}>
              {(llmOutput.length / 1000).toFixed(1)}k
            </span>
          )}
        </button>

        {/* Build ID — right-aligned in tab bar */}
        {buildId && (
          <span className="ml-auto pr-5 font-mono text-[9px] text-ink-3">{buildId.slice(0, 12)}…</span>
        )}
      </div>


      {/* ── Body ── */}
      <div ref={bodyRef} className="max-h-[60vh] overflow-y-auto scroll-smooth bg-bg-0">

        {/* ── STEPS TAB ── */}
        {tab === "steps" && (
          <>
            {steps.length === 0 && phase === "connecting" && (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-2">
                  Connecting to orchestrator…
                </div>
              </div>
            )}

            {steps.length === 0 && phase !== "connecting" && (
              <div className="px-5 py-8 text-center">
                <div className="font-mono text-[11px] text-ink-3">No skill steps recorded for this build.</div>
              </div>
            )}

            {steps.map((s, i) => (
              <div key={i} className="border-b border-line">
                {/* Step header */}
                <div className="flex items-center gap-3 bg-bg-2 px-5 py-[8px] font-mono text-[11px]">
                  <span
                    className={`grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-full text-[9px] font-bold ${
                      s.failed     ? "bg-accent-rose text-white"
                      : s.complete ? "bg-accent-teal text-white"
                      :              "border border-accent-amber text-accent-amber"
                    }`}
                    style={!s.complete && !s.failed ? { animation: "pulse 1.4s infinite" } : undefined}
                  >
                    {s.failed ? "✗" : s.complete ? "✓" : "▸"}
                  </span>
                  <span className="text-ink-0">/{s.skill}</span>
                  <span className="text-ink-3">·</span>
                  <span className="flex-1 text-ink-2">{s.label}</span>
                  <span className="text-ink-3">{s.output.length}b</span>
                </div>
                {/* Step output */}
                {s.output && (
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words px-5 py-3 font-mono text-[11.5px] leading-[1.55] text-ink-1">
                    {s.output}
                  </pre>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── PREVIEW TAB (structured artifact, rendered in a sandboxed iframe ── */}
        {/*    so its inline <script> actually runs — the preview is live) ──── */}
        {tab === "preview" && structured && (
          <div className="bg-bg-0">
            <div className="flex items-center gap-3 border-b border-line bg-bg-2 px-5 py-[8px] font-mono text-[11px]">
              <span className="rounded-[3px] bg-[rgba(167,139,250,0.15)] px-[6px] py-[1px] text-[9px] uppercase tracking-[0.1em] text-accent-violet">
                {structured.type}
              </span>
              <span className="text-ink-2">interactive preview · sandboxed</span>
              <span className="ml-auto text-ink-3">{(structured.html.length / 1000).toFixed(1)}k html</span>
            </div>
            <iframe
              title="artifact-preview"
              sandbox="allow-scripts"
              srcDoc={structured.html}
              className="h-[58vh] w-full border-0 bg-white"
            />
          </div>
        )}

        {/* ── MARKDOWN TAB (structured artifact — what publishes to a wiki) ── */}
        {tab === "markdown" && structured && (
          <pre className="overflow-x-auto whitespace-pre-wrap break-words bg-[rgba(167,139,250,0.03)] px-5 py-4 font-mono text-[12px] leading-[1.65] text-ink-0">
            {structured.markdown?.trim()
              ? structured.markdown
              : "— this artifact has no markdown portion; Publish will fall back to the raw synthesis —"}
          </pre>
        )}

        {/* ── OUTPUT TAB (LLM synthesis text) ── */}
        {tab === "output" && (
          <>
            {!llmOutput && !llmModel && (
              <div className="px-5 py-10 text-center">
                <div className="font-mono text-[11px] text-ink-3">
                  {isLive
                    ? "Synthesis begins once all skill steps complete…"
                    : "No synthesis output for this build."}
                </div>
              </div>
            )}

            {(llmOutput || llmModel) && (
              <>
                {/* Synthesis header row */}
                <div className="flex items-center gap-3 bg-bg-2 px-5 py-[8px] font-mono text-[11px]">
                  <span
                    className={`grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-full text-[9px] font-bold ${
                      phase === "done" ? "bg-accent-teal text-white" : "border border-accent text-accent"
                    }`}
                    style={phase !== "done" ? { animation: "pulse 1.4s infinite" } : undefined}
                  >
                    {phase === "done" ? "✓" : "▸"}
                  </span>
                  <span className="text-ink-0">synthesis</span>
                  <span className="text-ink-3">·</span>
                  <span className="text-ink-2">
                    {llmModel}{llmStub ? " · stub mode" : ""}
                  </span>
                  <span className="ml-auto text-ink-3">{llmOutput.length}b</span>
                </div>

                <pre className="overflow-x-auto whitespace-pre-wrap break-words bg-[rgba(77,141,255,0.02)] px-5 py-4 font-mono text-[12px] leading-[1.65] text-ink-0">
                  {llmOutput}
                </pre>
              </>
            )}
          </>
        )}

        {/* Error notice — shown in both tabs */}
        {error && (
          <div className="border-t border-accent-rose bg-[rgba(255,86,119,0.05)] px-5 py-3 font-mono text-[11px] text-accent-rose">
            <span className="mr-2 font-bold uppercase tracking-[0.1em]">Error:</span>
            {error}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex flex-wrap items-center gap-4 border-t border-line bg-bg-2 px-5 py-[8px] font-mono text-[10px] text-ink-3">
        <span>elapsed <span className="text-ink-1">{elapsedSec}s</span></span>
        <span>output <span className="text-ink-1">{(totalChars / 1000).toFixed(1)}k</span></span>
        <span>steps <span className="text-ink-1">{steps.length}</span></span>

        {/* Saved artifact links */}
        {saveState === "saved" && (
          <span className="text-accent-teal">✓ app saved · dev env</span>
        )}
        {wikiSaveState === "saved" && savedWikiSlug && (
          <Link href={`/wikis/${savedWikiSlug}`} className="text-accent-violet hover:underline">
            ✓ wiki · /wikis/{savedWikiSlug}
          </Link>
        )}
        {publishState === "saved" && publishedSlug && (
          <Link href={`/wikis/${publishedSlug}`} className="text-accent-teal hover:underline">
            ✓ published · /wikis/{publishedSlug}
          </Link>
        )}

        {/* Right side: model / shortcut hint */}
        <span className="ml-auto">
          {llmStub
            ? "stub · add ANTHROPIC_API_KEY for live synthesis"
            : llmModel
            ? `live · ${llmModel}`
            : ""}
        </span>
        {isLive && (
          <span className="text-ink-3 opacity-50">esc · minimize</span>
        )}
        {!isLive && buildId && (
          <span className="text-ink-3 opacity-50">esc · close</span>
        )}
      </div>

    </div>
  );
}
