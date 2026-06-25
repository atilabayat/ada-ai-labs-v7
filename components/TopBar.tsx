"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTE_META } from "@/lib/data/nav";
import { useWorkspace } from "@/lib/store";

// ─── Page-contextual help ────────────────────────────────────────────────────

const PAGE_HELP: Record<string, { title: string; lines: string[] }> = {
  "/builder": {
    title: "AI Builder",
    lines: [
      "Compose prompts and attach skills to build AI applications.",
      "Select skills from the stack on the right, type your build prompt, and click Build.",
      "Completed builds appear in Applications.",
    ],
  },
  "/dashboard": {
    title: "Dashboard",
    lines: [
      "Overview of workspace health, recent builds, and active pipelines.",
      "Monitor live build status, API health, and data sync state.",
    ],
  },
  "/applications": {
    title: "Applications",
    lines: [
      "All built and deployed AI applications in the workspace.",
      "Click any app to launch it, or use the overflow menu to rename, re-env, or delete.",
    ],
  },
  "/knowledge": {
    title: "Knowledge Graph",
    lines: [
      "Interactive entity graph linking tickers, concepts, research, and applications.",
      "Click any node to drill into its wiki, sources, and downstream apps.",
      "Nodes are colored by type — Quant (yellow), Wiki (red), Research (blue), Concept (purple).",
    ],
  },
  "/research": {
    title: "Deep Research",
    lines: [
      "Submit research queries and synthesize findings across all sources.",
      "Results are embedded and linked to the Knowledge Graph automatically.",
    ],
  },
  "/wikis": {
    title: "Wikis",
    lines: [
      "Browse all research wikis synthesized from deep research sessions.",
      "Click any wiki to read its full content, edit, or link to a source.",
    ],
  },
  "/quant": {
    title: "Market Floor",
    lines: [
      "Real-time quant data dashboard for all tracked tickers.",
      "Greeks, momentum, and options flow update on each data tick.",
    ],
  },
  "/sr-profiles": {
    title: "S/R Profiles",
    lines: [
      "Support and Resistance level dashboard across all tracked tickers.",
      "Shows key S/R levels, catalysts, and bull / base / bear scenarios for today and the week.",
      "Market data auto-refreshes every 60 seconds.",
    ],
  },
  "/sources-quant": {
    title: "Sources for Quants Research",
    lines: [
      "Manage and browse data sources feeding the Quant Lab.",
      "Add API endpoints, CSV uploads, or streaming feeds here.",
    ],
  },
  "/sources-wiki": {
    title: "Sources for Wiki Architecture",
    lines: [
      "Data sources powering the research wiki synthesis pipeline.",
      "Link documents, URLs, or API feeds as wiki source material.",
    ],
  },
  "/skills": {
    title: "Skill Library",
    lines: [
      "Browse all available AI skills. Toggle any skill to add it to the build stack.",
      "Skills are composable modules that extend AI Builder capabilities.",
    ],
  },
  "/quant-embedded-sources": {
    title: "Quant Embedded Sources",
    lines: [
      "Embedded vector sources powering quant research retrieval.",
      "Inspect chunk counts, embedding status, and source metadata.",
    ],
  },
  "/admin": {
    title: "Administration",
    lines: [
      "Manage API keys, users, audit logs, and system-level configuration.",
      "Environment variables and integrations are configured here.",
    ],
  },
};

const FALLBACK_HELP = {
  title: "ADA AI Labs",
  lines: [
    "Alpha Data Architects — research, quant, and AI build platform.",
    "Use the sidebar to navigate between modules.",
    "Press ⌘K to open the command palette and search anything.",
    "Press ⌘/ to toggle contextual help for any page.",
  ],
};

// ─── Settings panel ──────────────────────────────────────────────────────────

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const theme = useWorkspace((s) => s.theme);
  const toggleTheme = useWorkspace((s) => s.toggleTheme);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[500] flex items-start justify-end bg-[rgba(3,5,11,0.4)] pt-[52px] backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[320px] border-b border-l border-line-strong bg-bg-1 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-bg-2 px-5 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">Settings</span>
          <button
            onClick={onClose}
            className="rounded border border-line-strong px-[7px] py-[2px] font-mono text-[10px] uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-accent hover:text-ink-0"
          >
            Esc
          </button>
        </div>

        {/* Options */}
        <div className="space-y-1 p-4">
          {/* Theme */}
          <div className="flex items-center justify-between rounded-md border border-line bg-bg-2 px-4 py-3">
            <div>
              <div className="text-[13px] text-ink-0">Appearance</div>
              <div className="font-mono text-[10px] text-ink-3">Interface theme</div>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded border border-line-strong bg-bg-1 px-3 py-1.5 font-mono text-[11px] text-ink-1 transition-colors hover:border-accent hover:text-ink-0"
            >
              {theme === "dark" ? "◑ Dark" : "◐ Light"}
            </button>
          </div>

        </div>

        {/* Keyboard shortcuts */}
        <div className="border-t border-line px-5 py-4">
          <div className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
            Keyboard Shortcuts
          </div>
          <div className="space-y-2">
            {([
              ["⌘ K", "Command palette"],
              ["⌘ /", "Toggle help"],
              ["⌘ R", "Refresh page"],
              ["⌘ ,", "Open settings"],
            ] as [string, string][]).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[12px] text-ink-2">{label}</span>
                <span className="rounded border border-line-strong bg-bg-2 px-[7px] py-[2px] font-mono text-[10px] text-ink-1">
                  {key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Help panel ──────────────────────────────────────────────────────────────

function HelpPanel({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const helpKey = pathname.startsWith("/wikis/") ? "/wikis" : pathname;
  const help = PAGE_HELP[helpKey] ?? FALLBACK_HELP;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[500] flex items-start justify-end bg-[rgba(3,5,11,0.4)] pt-[52px] backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[340px] border-b border-l border-line-strong bg-bg-1 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-bg-2 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[13px] text-accent">?</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
              Help — {help.title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded border border-line-strong px-[7px] py-[2px] font-mono text-[10px] uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-accent hover:text-ink-0"
          >
            Esc
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 p-5">
          {help.lines.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span className="mt-[3px] font-mono text-[9px] text-accent-teal">▸</span>
              <p className="text-[13px] leading-relaxed text-ink-1">{line}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-line bg-bg-2 px-5 py-3">
          <div className="font-mono text-[10px] text-ink-3">
            <span className="text-ink-1">Esc</span> or click outside to close ·{" "}
            <span className="text-ink-1">⌘/</span> to toggle
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TopBar ──────────────────────────────────────────────────────────────────

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const wikiTitlesMap = useWorkspace((s) => s.wikiTitlesMap);
  const showToast = useWorkspace((s) => s.showToast);
  const settingsOpen = useWorkspace((s) => s.settingsOpen);
  const toggleSettings = useWorkspace((s) => s.toggleSettings);
  const helpOpen = useWorkspace((s) => s.helpOpen);
  const toggleHelp = useWorkspace((s) => s.toggleHelp);

  let crumb: string[] = ["Workspace", "AI Builder", "New Session"];

  if (pathname.startsWith("/wikis/")) {
    const slug = pathname.split("/")[2];
    const title = wikiTitlesMap[slug];
    crumb = ["Research", "Wikis", title ?? "Wiki"];
  } else if (ROUTE_META[pathname]) {
    crumb = ROUTE_META[pathname].crumb;
  }

  // Global keyboard shortcuts for these three actions
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key === "/") {
        e.preventDefault();
        toggleHelp();
      }
      if (cmd && e.key === ",") {
        e.preventDefault();
        toggleSettings();
      }
      if (cmd && e.key === "r") {
        e.preventDefault();
        router.refresh();
        showToast("Page refreshed");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, showToast, toggleHelp, toggleSettings]);

  const handleRefresh = () => {
    router.refresh();
    showToast("Page refreshed");
  };

  return (
    <>
      <div className="flex h-[52px] flex-shrink-0 items-center gap-6 border-b border-line bg-[rgba(10,15,28,0.6)] px-6 backdrop-blur-xl">
        <div className="flex items-center gap-[10px] font-mono text-[11px] text-ink-2">
          {crumb.map((c, i) => {
            const last = i === crumb.length - 1;
            return (
              <span key={i} className="flex items-center gap-[10px]">
                <span className={last ? "text-ink-0" : ""}>{c}</span>
                {!last && <span className="text-ink-3">/</span>}
              </span>
            );
          })}
        </div>

        <div className="flex gap-2">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            title="Refresh (⌘R)"
            className="grid h-[30px] w-[30px] place-items-center rounded-md border border-line-strong bg-bg-2 text-[13px] text-ink-1 transition-colors hover:border-accent hover:bg-[rgba(77,141,255,0.08)] hover:text-ink-0"
          >
            ⟳
          </button>

          {/* Settings */}
          <button
            onClick={toggleSettings}
            title="Settings (⌘,)"
            className={`grid h-[30px] w-[30px] place-items-center rounded-md border text-[13px] transition-colors ${
              settingsOpen
                ? "border-accent bg-[rgba(77,141,255,0.12)] text-ink-0"
                : "border-line-strong bg-bg-2 text-ink-1 hover:border-accent hover:bg-[rgba(77,141,255,0.08)] hover:text-ink-0"
            }`}
          >
            ⚙
          </button>

          {/* Help */}
          <button
            onClick={toggleHelp}
            title="Help (⌘/)"
            className={`grid h-[30px] w-[30px] place-items-center rounded-md border text-[13px] transition-colors ${
              helpOpen
                ? "border-accent bg-[rgba(77,141,255,0.12)] text-ink-0"
                : "border-line-strong bg-bg-2 text-ink-1 hover:border-accent hover:bg-[rgba(77,141,255,0.08)] hover:text-ink-0"
            }`}
          >
            ?
          </button>
        </div>
      </div>

      {settingsOpen && <SettingsPanel onClose={toggleSettings} />}
      {helpOpen && <HelpPanel onClose={toggleHelp} />}
    </>
  );
}
