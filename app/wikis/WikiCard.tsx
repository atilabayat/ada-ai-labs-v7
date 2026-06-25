"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BANNER_GRADIENTS } from "@/lib/data/wikis";
import { deleteWiki, updateWikiTitle, promoteWiki, setWikiSection } from "@/lib/actions";
import type { WikiCard as WikiCardType } from "@/lib/types";
import type { Env } from "@/lib/types";

// ─── Env badge ────────────────────────────────────────────────────────────────

const ENV_STYLES: Record<Env, { label: string; cls: string }> = {
  dev:     { label: "DEV",     cls: "text-accent bg-[rgba(77,141,255,0.12)] border-[rgba(77,141,255,0.3)]" },
  staging: { label: "STAGING", cls: "text-accent-amber bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.3)]" },
  live:    { label: "LIVE",    cls: "text-accent-teal bg-[rgba(20,184,166,0.12)] border-[rgba(20,184,166,0.3)]" },
};

// ─── WikiCard ─────────────────────────────────────────────────────────────────

export default function WikiCard({ w }: { w: WikiCardType }) {
  const router      = useRouter();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [confirm,  setConfirm]    = useState(false);   // delete confirmation
  const [sysConfirm, setSysConfirm] = useState(false); // system-guides publish confirmation
  const [renaming,      setRenaming]      = useState(false);
  const [displayTitle,  setDisplayTitle]  = useState(w.title);
  const [newTitle,      setNewTitle]      = useState(w.title);
  const [pending,  startTransition] = useTransition();
  const menuRef    = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const env        = (w.env ?? "dev") as Env;
  const badge      = ENV_STYLES[env];

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirm(false);
        setSysConfirm(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Focus rename input when it appears
  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleDelete = () => {
    startTransition(async () => {
      await deleteWiki(w.slug);
      setMenuOpen(false);
    });
  };

  const handleRename = () => {
    if (!newTitle.trim() || newTitle === displayTitle) { setRenaming(false); return; }
    startTransition(async () => {
      await updateWikiTitle(w.slug, newTitle);
      setDisplayTitle(newTitle);
      setRenaming(false);
    });
  };

  const handlePromote = (target: Env) => {
    startTransition(async () => {
      await promoteWiki(w.slug, target);
      setMenuOpen(false);
    });
  };

  const handleAddToSystemGuides = () => {
    startTransition(async () => {
      await setWikiSection(w.slug, "system");
      setSysConfirm(false);
      setMenuOpen(false);
    });
  };

  const nextEnv: Env | null = env === "dev" ? "staging" : env === "staging" ? "live" : null;
  const prevEnv: Env | null = env === "live" ? "staging" : env === "staging" ? "dev" : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="group relative">
      {/* Main card — clickable to navigate */}
      <div
        onClick={() => { if (!menuOpen && !renaming) router.push(`/wikis/${w.slug}`); }}
        className="block cursor-pointer overflow-hidden rounded-[10px] border border-line bg-bg-1 transition-all hover:-translate-y-[2px] hover:border-line-strong hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
      >
        {/* Banner */}
        <div className="relative h-[88px]" style={{ background: BANNER_GRADIENTS[w.banner as keyof typeof BANNER_GRADIENTS] }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
          {/* Env badge */}
          <span className={`absolute right-3 top-3 rounded-full border px-[8px] py-[2px] font-mono text-[9px] uppercase tracking-[0.12em] ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-[18px]">
          {renaming ? (
            <input
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") { setRenaming(false); setNewTitle(w.title); }
              }}
              onClick={(e) => e.stopPropagation()}
              className="mb-2 w-full rounded border border-accent bg-bg-2 px-2 py-1 font-display text-[15px] font-medium text-ink-0 outline-none"
            />
          ) : (
            <div className="mb-2 font-display text-[16px] font-medium tracking-tight text-ink-0">{displayTitle}</div>
          )}
          <div className="mb-[14px] min-h-[54px] text-[12px] leading-relaxed text-ink-2">{w.desc}</div>
          <div className="flex flex-wrap gap-x-[14px] gap-y-1 border-t border-line pt-3 font-mono text-[10px] text-ink-3">
            <span>📄 <span className="text-ink-1">{w.stats[0]}</span></span>
            <span>🔗 <span className="text-ink-1">{w.stats[1]}</span></span>
            <span>⌚ <span className="text-ink-1">{w.stats[2]}</span></span>
          </div>
        </div>
      </div>

      {/* Three-dot menu button — visible on card hover */}
      <div
        ref={menuRef}
        className="absolute right-2 top-[96px] z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => { setMenuOpen((o) => !o); setConfirm(false); }}
          className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border text-[13px] transition-all ${
            menuOpen
              ? "border-line-strong bg-bg-3 text-ink-0"
              : "border-transparent bg-transparent text-ink-3 opacity-0 group-hover:opacity-100 hover:border-line hover:bg-bg-2 hover:text-ink-1"
          }`}
          title="Wiki actions"
        >
          ···
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 top-[30px] min-w-[188px] rounded-[8px] border border-line-strong bg-bg-2 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
            {/* Rename */}
            {!confirm && (
              <button
                onClick={() => { setRenaming(true); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-[9px] text-left font-mono text-[11px] text-ink-1 hover:bg-[rgba(77,141,255,0.08)] hover:text-ink-0"
              >
                <span className="text-ink-3">✏</span> Rename title
              </button>
            )}

            {/* Promote forward */}
            {nextEnv && !confirm && (
              <button
                disabled={pending}
                onClick={() => handlePromote(nextEnv)}
                className="flex w-full items-center gap-2 px-3 py-[9px] text-left font-mono text-[11px] text-ink-1 hover:bg-[rgba(77,141,255,0.08)] hover:text-ink-0 disabled:opacity-40"
              >
                <span className="text-accent-teal">▶</span>
                Promote → <span className="uppercase">{nextEnv === "staging" ? "Staging" : "Live"}</span>
              </button>
            )}

            {/* Demote back */}
            {prevEnv && !confirm && (
              <button
                disabled={pending}
                onClick={() => handlePromote(prevEnv)}
                className="flex w-full items-center gap-2 px-3 py-[9px] text-left font-mono text-[11px] text-ink-2 hover:bg-[rgba(77,141,255,0.08)] hover:text-ink-1 disabled:opacity-40"
              >
                <span className="text-ink-3">◀</span>
                Move back → <span className="uppercase">{prevEnv === "dev" ? "Dev" : "Staging"}</span>
              </button>
            )}

            {/* Add to System Guides — show only when banner isn't already "system" */}
            {!confirm && !sysConfirm && w.banner !== "system" && (
              <button
                onClick={() => setSysConfirm(true)}
                className="flex w-full items-center gap-2 px-3 py-[9px] text-left font-mono text-[11px] text-ink-1 hover:bg-[rgba(26,42,74,0.2)] hover:text-ink-0"
              >
                <span>📋</span> Add to System Guides
              </button>
            )}

            {/* System Guides confirmation panel */}
            {sysConfirm && (
              <div className="p-3">
                <p className="mb-1 font-mono text-[11px] text-ink-0">Publish to <span className="text-[#7ba7e8]">System User Guides</span>?</p>
                <p className="mb-3 font-mono text-[10px] leading-relaxed text-ink-3">
                  This will set the banner to <span className="text-ink-2">system</span> and promote the wiki to <span className="text-accent-teal">Live</span>. It will appear in the System User Guides section of the wiki library.
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={pending}
                    onClick={handleAddToSystemGuides}
                    className="flex-1 rounded-[5px] bg-[#1a2a4a] border border-[rgba(122,167,232,0.4)] px-2 py-[6px] font-mono text-[10px] text-[#7ba7e8] transition hover:bg-[#2a3a6a] disabled:opacity-40"
                  >
                    {pending ? "Publishing…" : "Yes, publish"}
                  </button>
                  <button
                    onClick={() => { setSysConfirm(false); setMenuOpen(false); }}
                    className="flex-1 rounded-[5px] border border-line px-2 py-[6px] font-mono text-[10px] text-ink-2 hover:text-ink-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!confirm && !sysConfirm && <div className="mx-2 my-1 border-t border-line" />}

            {/* Delete */}
            {confirm ? (
              <div className="p-3">
                <p className="mb-2 font-mono text-[11px] text-ink-1">Delete <span className="text-accent-rose">{displayTitle.slice(0, 28)}{displayTitle.length > 28 ? "…" : ""}</span>?</p>
                <p className="mb-3 font-mono text-[10px] text-ink-3">This cannot be undone.</p>
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
                className="flex w-full items-center gap-2 px-3 py-[9px] text-left font-mono text-[11px] text-accent-rose hover:bg-[rgba(239,68,68,0.08)]"
              >
                <span>🗑</span> Delete wiki
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
