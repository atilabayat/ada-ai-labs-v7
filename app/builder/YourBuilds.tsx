"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BuildRow } from "@/lib/queries";
import { useWorkspace } from "@/lib/store";
import { deleteBuild, cancelBuild } from "@/lib/actions";

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusTone: Record<BuildRow["status"], string> = {
  queued:    "bg-[rgba(77,141,255,0.12)] text-accent",
  streaming: "bg-[rgba(245,183,72,0.12)] text-accent-amber",
  done:      "bg-[rgba(45,212,191,0.12)] text-accent-teal",
  failed:    "bg-[rgba(255,86,119,0.12)] text-accent-rose",
  cancelled: "bg-bg-3 text-ink-2",
};

function timeAgo(iso: Date): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function titleFromPrompt(prompt: string): string {
  const firstLine = prompt.split("\n").find((l) => l.trim().length > 0) ?? "Untitled build";
  return firstLine.length > 64 ? firstLine.slice(0, 64) + "…" : firstLine;
}

function descFromBuild(b: BuildRow): string {
  if (b.status === "queued")     return "Queued — orchestrator about to spin up.";
  if (b.status === "streaming")  return "Streaming live — open the live panel to follow.";
  if (b.status === "failed")     return b.error ?? "Build failed.";
  if (b.status === "cancelled")  return "Cancelled by user.";
  const synthMarker = "# Synthesis";
  const idx = b.output.indexOf(synthMarker);
  const tail = idx >= 0 ? b.output.slice(idx + synthMarker.length) : b.output;
  const cleaned = tail.replace(/^[\s\n]+/, "").replace(/[#*`>]/g, "").slice(0, 200);
  return cleaned + (b.output.length > idx + synthMarker.length + 200 ? "…" : "");
}

// ── BuildCard ─────────────────────────────────────────────────────────────────

function BuildCard({ b, onDeleted }: { b: BuildRow; onDeleted: (id: string) => void }) {
  const router         = useRouter();
  const currentBuildId = useWorkspace((s) => s.currentBuildId);
  const setCurrentBuild = useWorkspace((s) => s.setCurrentBuild);
  const showToast      = useWorkspace((s) => s.showToast);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm,  setConfirm]  = useState(false);
  const [pending,  startAction] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const isActive = b.id === currentBuildId;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirm(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleDelete = () => {
    startAction(async () => {
      const res = await deleteBuild(b.id);
      if (res.ok) {
        onDeleted(b.id);
        if (currentBuildId === b.id) setCurrentBuild(null);
        showToast("Build deleted");
        router.refresh();
      } else {
        showToast(`Delete failed: ${res.error}`);
      }
      setMenuOpen(false);
    });
  };

  const handleCancel = () => {
    startAction(async () => {
      await cancelBuild(b.id);
      setMenuOpen(false);
      router.refresh();
    });
  };

  const canCancel = b.status === "queued" || b.status === "streaming";

  return (
    <div className="group relative">
      {/* Card body */}
      <div
        onClick={() => {
          if (menuOpen) return;
          if (b.status === "done" || b.status === "failed" || b.status === "streaming") {
            setCurrentBuild(b.id, b.prompt);
          }
        }}
        className={`cursor-pointer rounded-lg border bg-bg-1 px-4 py-[14px] transition-all hover:-translate-y-px ${
          isActive
            ? "border-accent shadow-[0_0_0_1px_var(--accent)]"
            : "border-line hover:border-line-strong"
        }`}
      >
        {/* Title row */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h4 className="line-clamp-2 flex-1 text-[14px] font-medium text-ink-0">
            {titleFromPrompt(b.prompt)}
          </h4>
          <span className="flex-shrink-0 text-ink-3">→</span>
        </div>

        {/* Description */}
        <div className="mb-[10px] line-clamp-2 text-[12px] leading-snug text-ink-2">
          {descFromBuild(b)}
        </div>

        {/* Footer row */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
          <span className={`rounded-[3px] px-[6px] py-px ${statusTone[b.status]}`}>
            {b.status}
          </span>
          <span>{b.skills.length} skill{b.skills.length === 1 ? "" : "s"}</span>
          <span>·</span>
          <span>{timeAgo(b.createdAt)}</span>

          {/* Wiki publication badge — only if build was published as a wiki */}
          {b.promotedWikiSlug && (
            <Link
              href={`/wikis/${b.promotedWikiSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="ml-1 flex items-center gap-[4px] rounded-[3px] border border-[rgba(167,139,250,0.3)] bg-[rgba(167,139,250,0.08)] px-[6px] py-px text-accent-violet transition hover:border-accent-violet hover:bg-[rgba(167,139,250,0.15)]"
              title={`Published wiki: ${b.promotedWikiSlug}`}
            >
              ▤ wiki ↗
            </Link>
          )}

          <span className="ml-auto text-ink-3">{b.id.slice(0, 9)}</span>
        </div>
      </div>

      {/* Three-dot menu — visible on group hover */}
      <div
        ref={menuRef}
        className="absolute right-2 top-2 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => { setMenuOpen((o) => !o); setConfirm(false); }}
          className={`flex h-[24px] w-[24px] items-center justify-center rounded-full border text-[12px] transition-all ${
            menuOpen
              ? "border-line-strong bg-bg-3 text-ink-0"
              : "border-transparent bg-transparent text-ink-3 opacity-0 group-hover:opacity-100 hover:border-line hover:bg-bg-2 hover:text-ink-1"
          }`}
          title="Build actions"
        >
          ···
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 top-[28px] min-w-[172px] rounded-[8px] border border-line-strong bg-bg-2 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
            {/* Cancel (only for in-flight builds) */}
            {canCancel && !confirm && (
              <button
                disabled={pending}
                onClick={handleCancel}
                className="flex w-full items-center gap-2 px-3 py-[8px] text-left font-mono text-[11px] text-ink-1 hover:bg-[rgba(77,141,255,0.08)] hover:text-ink-0 disabled:opacity-40"
              >
                <span className="text-accent-amber">⊘</span> Cancel build
              </button>
            )}

            {/* Wiki link shortcut */}
            {b.promotedWikiSlug && !confirm && (
              <Link
                href={`/wikis/${b.promotedWikiSlug}`}
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-[8px] text-left font-mono text-[11px] text-ink-1 hover:bg-[rgba(77,141,255,0.08)] hover:text-ink-0"
              >
                <span className="text-accent-violet">▤</span> Open wiki
              </Link>
            )}

            {!confirm && (canCancel || b.promotedWikiSlug) && (
              <div className="mx-2 my-1 border-t border-line" />
            )}

            {/* Delete */}
            {confirm ? (
              <div className="p-3">
                <p className="mb-2 font-mono text-[11px] text-ink-1">
                  Delete this build?
                </p>
                <p className="mb-3 font-mono text-[10px] text-ink-3">Output and history will be lost.</p>
                <div className="flex gap-2">
                  <button
                    disabled={pending}
                    onClick={handleDelete}
                    className="flex-1 rounded-[5px] bg-accent-rose px-2 py-[6px] font-mono text-[10px] text-white transition hover:opacity-80 disabled:opacity-40"
                  >
                    {pending ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => { setConfirm(false); setMenuOpen(false); }}
                    className="flex-1 rounded-[5px] border border-line px-2 py-[6px] font-mono text-[10px] text-ink-2 hover:text-ink-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirm(true)}
                className="flex w-full items-center gap-2 px-3 py-[8px] text-left font-mono text-[11px] text-accent-rose hover:bg-[rgba(239,68,68,0.08)]"
              >
                <span>🗑</span> Delete build
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── YourBuilds ────────────────────────────────────────────────────────────────

export default function YourBuilds({ builds: initialBuilds }: { builds: BuildRow[] }) {
  const router         = useRouter();
  const currentBuildId = useWorkspace((s) => s.currentBuildId);

  // Optimistic local removal when a build is deleted (router.refresh() will
  // confirm server state, but this makes the UI feel instant).
  const [builds, setBuilds] = useState(initialBuilds);

  // Keep in sync if the server passes a fresh prop (e.g. after streaming ends)
  useEffect(() => { setBuilds(initialBuilds); }, [initialBuilds]);

  const handleDeleted = (id: string) => {
    setBuilds((prev) => prev.filter((b) => b.id !== id));
  };

  // ── Reactive refresh ──────────────────────────────────────────────────────
  // Refresh server data whenever the user returns to this tab or window so the
  // panel always reflects changes made anywhere else in the application.
  useEffect(() => {
    const refresh = () => router.refresh();

    // Tab becomes visible again (user switches back to this tab)
    const onVisibility = () => { if (document.visibilityState === "visible") refresh(); };
    // Window regains focus (user returns from another app/window)
    const onFocus = () => refresh();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);

  // Also refresh when a streaming build finishes (currentBuildId cleared)
  useEffect(() => {
    if (currentBuildId === null) router.refresh();
  }, [currentBuildId, router]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (builds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong bg-bg-1 px-5 py-8 text-center">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">No builds yet</div>
        <div className="text-[13px] text-ink-2">Stack a few skills above and run your first build.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[10px]">
      {builds.map((b) => (
        <BuildCard key={b.id} b={b} onDeleted={handleDeleted} />
      ))}
    </div>
  );
}
