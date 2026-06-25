"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AppDef } from "@/lib/types";
import { ICON_COLORS, ENV_LABELS } from "@/lib/data/apps";
import { useWorkspace } from "@/lib/store";
import { deleteApp, updateAppName } from "@/lib/actions";

const statusTone: Record<string, string> = {
  live:    "text-accent-teal",
  staging: "text-accent-amber",
  dev:     "text-accent",
};

// ── Individual app card with three-dot menu ───────────────────────────────────

function AppCard({ app }: { app: AppDef }) {
  const router             = useRouter();
  const openLaunch         = useWorkspace((s) => s.openLaunch);
  const removeAppFromStore = useWorkspace((s) => s.removeAppFromStore);
  const renameAppInStore   = useWorkspace((s) => s.renameAppInStore);
  const showToast          = useWorkspace((s) => s.showToast);

  const [menuOpen, setMenuOpen]   = useState(false);
  const [confirm,  setConfirm]    = useState(false);   // delete confirmation
  const [renaming, setRenaming]   = useState(false);
  const [newName,  setNewName]    = useState(app.name);
  const [pending,  startTransition] = useTransition();
  const menuRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Auto-focus rename input
  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteApp(app.id);
      if (res.ok) {
        removeAppFromStore(app.id);
        showToast(`${app.name} deleted`);
        router.refresh();
      } else {
        showToast(`Delete failed: ${res.error}`);
      }
      setMenuOpen(false);
    });
  };

  const handleRename = () => {
    if (!newName.trim() || newName === app.name) { setRenaming(false); return; }
    startTransition(async () => {
      const res = await updateAppName(app.id, newName);
      if (res.ok) {
        renameAppInStore(app.id, newName.trim());
        showToast("App renamed");
        router.refresh();
      } else {
        showToast(`Rename failed: ${res.error}`);
      }
      setRenaming(false);
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="group relative">
      {/* Main card */}
      <div
        onClick={() => { if (!menuOpen && !renaming) openLaunch(app.id); }}
        className="cursor-pointer overflow-hidden rounded-[10px] border border-line bg-bg-1 p-[18px] transition-all hover:-translate-y-[2px] hover:border-accent hover:shadow-[0_8px_24px_rgba(77,141,255,0.15)]"
      >
        <div className="mb-[14px] flex items-center gap-3">
          <div
            className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg font-display text-base font-bold text-white"
            style={{ background: ICON_COLORS[app.color] }}
          >
            {app.icon}
          </div>
          <div className="min-w-0 flex-1">
            {renaming ? (
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter")  handleRename();
                  if (e.key === "Escape") { setRenaming(false); setNewName(app.name); }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded border border-accent bg-bg-2 px-2 py-1 font-display text-[15px] font-medium text-ink-0 outline-none"
              />
            ) : (
              <div className="font-display text-[15px] font-medium">{app.name}</div>
            )}
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-2">{app.cat}</div>
          </div>
        </div>

        <div className="mb-[14px] min-h-[36px] text-[12px] leading-relaxed text-ink-2">{app.desc}</div>

        <div className="flex items-center justify-between border-t border-line pt-3">
          <div className={`flex items-center gap-[6px] font-mono text-[9px] uppercase tracking-[0.1em] ${statusTone[app.env]}`}>
            <span className="h-[6px] w-[6px] rounded-full bg-current shadow-[0_0_6px_currentColor]" />
            {app.env === "live" ? "LIVE" : ENV_LABELS[app.env]}
          </div>
          <div className="font-mono text-[10px] text-ink-1 transition-colors group-hover:text-accent-hot">Launch ↗</div>
        </div>
      </div>

      {/* Three-dot menu — top-right of card, shown on group hover */}
      <div
        ref={menuRef}
        className="absolute right-2 top-2 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => { setMenuOpen((o) => !o); setConfirm(false); }}
          className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border text-[13px] transition-all ${
            menuOpen
              ? "border-line-strong bg-bg-3 text-ink-0"
              : "border-transparent bg-transparent text-ink-3 opacity-0 group-hover:opacity-100 hover:border-line hover:bg-bg-2 hover:text-ink-1"
          }`}
          title="App actions"
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
                <span className="text-ink-3">✏</span> Rename app
              </button>
            )}

            {!confirm && <div className="mx-2 my-1 border-t border-line" />}

            {/* Delete */}
            {confirm ? (
              <div className="p-3">
                <p className="mb-2 font-mono text-[11px] text-ink-1">
                  Delete <span className="text-accent-rose">{app.name.slice(0, 28)}{app.name.length > 28 ? "…" : ""}</span>?
                </p>
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
                <span>🗑</span> Delete app
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────

export default function ApplicationsGrid({ apps }: { apps: AppDef[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[14px]">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}
