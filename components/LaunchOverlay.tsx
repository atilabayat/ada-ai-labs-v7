"use client";

import { useEffect, useState, useCallback, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/store";
import { ENV_ORDER, ENV_LABELS, ICON_COLORS } from "@/lib/data/apps";
import { promoteApp, deleteApp, updateAppName } from "@/lib/actions";
import { Env } from "@/lib/types";
import AppPreview from "./AppPreview";
import ExportMenu from "./ExportMenu";

const MIN_W = 560;
const MIN_H = 380;
const DEFAULT_W = 1080;
const DEFAULT_H = 680;
const MARGIN = 12;

interface Pos { x: number; y: number }
interface Size { w: number; h: number }

export default function LaunchOverlay() {
  const router             = useRouter();
  const launchedAppId      = useWorkspace((s) => s.launchedAppId);
  const closeLaunch        = useWorkspace((s) => s.closeLaunch);
  const showToast          = useWorkspace((s) => s.showToast);
  const appsMap            = useWorkspace((s) => s.appsMap);
  const setAppEnv          = useWorkspace((s) => s.setAppEnv);
  const removeAppFromStore = useWorkspace((s) => s.removeAppFromStore);
  const renameAppInStore   = useWorkspace((s) => s.renameAppInStore);

  const [booting,         setBooting]         = useState(true);
  const [bootMsg,         setBootMsg]         = useState("Booting sandbox...");
  const [env,             setEnv]             = useState<Env>("dev");
  const [reloadKey,       setReloadKey]       = useState(0);
  const [deleteConfirm,   setDeleteConfirm]   = useState(false);
  const [overlayRenaming, setOverlayRenaming] = useState(false);
  const [newAppName,      setNewAppName]      = useState("");
  const [actionPending,   startAction]        = useTransition();
  const renameInputRef = useRef<HTMLInputElement>(null);

  // ── Window geometry ────────────────────────────────────────────────────
  // pos/size persist across open/close of different apps (component stays
  // mounted) but reset to defaults on full page reload.
  const [pos, setPos]   = useState<Pos>({ x: 0, y: 0 });
  const [size, setSize] = useState<Size>({ w: DEFAULT_W, h: DEFAULT_H });
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hasPositioned, setHasPositioned] = useState(false);
  const prevGeometryRef = useRef<{ pos: Pos; size: Size } | null>(null);

  const app = launchedAppId ? appsMap[launchedAppId] : null;

  // Reset overlay-specific state when a different app opens
  useEffect(() => {
    if (app) {
      setNewAppName(app.name);
      setDeleteConfirm(false);
      setOverlayRenaming(false);
    }
  }, [app?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus rename input
  useEffect(() => {
    if (overlayRenaming) renameInputRef.current?.select();
  }, [overlayRenaming]);

  const handleOverlayDelete = () => {
    if (!app) return;
    startAction(async () => {
      const res = await deleteApp(app.id);
      if (res.ok) {
        removeAppFromStore(app.id);
        showToast(`${app.name} deleted`);
        router.refresh();
      } else {
        showToast(`Delete failed: ${res.error}`);
      }
      setDeleteConfirm(false);
    });
  };

  const handleOverlayRename = () => {
    if (!app) return;
    if (!newAppName.trim() || newAppName === app.name) { setOverlayRenaming(false); return; }
    startAction(async () => {
      const res = await updateAppName(app.id, newAppName);
      if (res.ok) {
        renameAppInStore(app.id, newAppName.trim());
        showToast("App renamed");
        router.refresh();
      } else {
        showToast(`Rename failed: ${res.error}`);
      }
      setOverlayRenaming(false);
    });
  };

  // Center the window on first open; HTML artifact apps open maximized by default
  useEffect(() => {
    if (!app || hasPositioned) return;
    if (app.html) {
      setPos({ x: MARGIN, y: MARGIN });
      setSize({ w: window.innerWidth - 2 * MARGIN, h: window.innerHeight - 2 * MARGIN });
      setMaximized(true);
    } else {
      const w = Math.min(DEFAULT_W, window.innerWidth - 2 * MARGIN);
      const h = Math.min(DEFAULT_H, window.innerHeight - 2 * MARGIN);
      setSize({ w, h });
      setPos({
        x: Math.max(MARGIN, (window.innerWidth - w) / 2),
        y: Math.max(MARGIN, (window.innerHeight - h) / 2),
      });
    }
    setHasPositioned(true);
  }, [app, hasPositioned]);

  // ── Boot sequence ──────────────────────────────────────────────────────
  const runBoot = useCallback(() => {
    setBooting(true);
    const msgs = ["Booting sandbox...", "Mounting runtime...", "Establishing connection...", "Rendering app..."];
    let i = 0;
    setBootMsg(msgs[0]);
    const interval = setInterval(() => { i++; if (i < msgs.length) setBootMsg(msgs[i]); }, 320);
    const timeout  = setTimeout(() => { clearInterval(interval); setBooting(false); }, 1300);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    if (app) {
      setEnv(app.env);
      setMinimized(false);
      return runBoot();
    }
  }, [app, reloadKey, runBoot]);

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && launchedAppId && !minimized) closeLaunch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [launchedAppId, minimized, closeLaunch]);

  // ── Drag handler ───────────────────────────────────────────────────────
  const onTitleBarMouseDown = (e: React.MouseEvent) => {
    if (maximized || minimized) return;
    // Skip if the click target is one of the window controls (button/svg/etc).
    if ((e.target as HTMLElement).closest("[data-window-control]")) return;
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const origX  = pos.x,    origY  = pos.y;

    const onMove = (ev: MouseEvent) => {
      const nx = origX + (ev.clientX - startX);
      const ny = origY + (ev.clientY - startY);
      setPos({
        // Keep at least 80px of title bar on-screen so the window can't be lost
        x: Math.max(80 - size.w, Math.min(window.innerWidth - 80, nx)),
        y: Math.max(0, Math.min(window.innerHeight - 40, ny)),
      });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
    };
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ── Resize handler (bottom-right corner) ───────────────────────────────
  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (maximized || minimized) return;
    const startX = e.clientX, startY = e.clientY;
    const origW  = size.w,   origH  = size.h;

    const onMove = (ev: MouseEvent) => {
      const nw = origW + (ev.clientX - startX);
      const nh = origH + (ev.clientY - startY);
      setSize({
        w: Math.max(MIN_W, Math.min(window.innerWidth - pos.x - MARGIN, nw)),
        h: Math.max(MIN_H, Math.min(window.innerHeight - pos.y - MARGIN, nh)),
      });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
    };
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ── Window controls ────────────────────────────────────────────────────
  const toggleMaximize = () => {
    if (maximized) {
      const prev = prevGeometryRef.current;
      if (prev) { setPos(prev.pos); setSize(prev.size); }
      setMaximized(false);
    } else {
      prevGeometryRef.current = { pos, size };
      setPos({ x: MARGIN, y: MARGIN });
      setSize({ w: window.innerWidth - 2 * MARGIN, h: window.innerHeight - 2 * MARGIN });
      setMaximized(true);
    }
  };

  const restoreMinimized = () => setMinimized(false);

  if (!app) return null;

  const curIdx = ENV_ORDER.indexOf(env);
  const envMetas: Record<Env, string> = {
    dev:     "commit a3f9c1 · 2h ago",
    staging: "build #214 · validated",
    live:    `v${app.type === "compendium" ? "3.0.0" : "1.2.0"} · stable`,
  };

  // ── Optimistic env promotion ───────────────────────────────────────────
  const promote = async (target: Env) => {
    const prev = env;
    showToast(`Promoting ${app.name} → ${ENV_LABELS[target]}`);
    setEnv(target);
    setAppEnv(app.id, target);
    const result = await promoteApp(app.id, target);
    if (result.ok) showToast(`${app.name} now in ${ENV_LABELS[target]}`);
    else { setEnv(prev); setAppEnv(app.id, prev); showToast(`Promotion failed: ${result.error}`); }
  };

  const envPillClass =
    env === "live"    ? "bg-[rgba(45,212,191,0.12)] text-accent-teal"
  : env === "staging" ? "bg-[rgba(245,183,72,0.12)] text-accent-amber"
                      : "bg-[rgba(77,141,255,0.12)] text-accent";

  // ── Minimized dock bar ─────────────────────────────────────────────────
  if (minimized) {
    return (
      <button
        onClick={restoreMinimized}
        className="fixed bottom-[34px] left-[260px] z-[500] flex items-center gap-3 rounded-[10px] border border-line-strong bg-bg-1 px-3 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-[1px] hover:border-accent"
      >
        <div
          className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md font-display text-[12px] font-bold text-white"
          style={{ background: ICON_COLORS[app.color] }}
        >
          {app.icon}
        </div>
        <div className="text-left">
          <div className="text-[12px] font-medium leading-tight text-ink-0">{app.name}</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">minimized · click to restore</div>
        </div>
        <span className="ml-2 font-mono text-[11px] text-ink-3">↗</span>
      </button>
    );
  }

  // ── Floating window ────────────────────────────────────────────────────
  return (
    <div
      className="fixed z-[500] grid grid-rows-[44px_1fr] overflow-hidden rounded-[12px] border border-line-strong bg-bg-1 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        transition: maximized ? "none" : undefined,
      }}
    >
      {/* ── Title bar (draggable) ── */}
      <div
        onMouseDown={onTitleBarMouseDown}
        onDoubleClick={toggleMaximize}
        className="flex select-none items-center gap-3 border-b border-line bg-bg-2 px-3"
        style={{ cursor: maximized ? "default" : "grab" }}
      >
        {/* Traffic-light controls */}
        <div className="flex gap-[6px]" data-window-control>
          <button
            onClick={closeLaunch}
            title="Close"
            className="group/btn relative grid h-[12px] w-[12px] place-items-center rounded-full bg-[#ff5f57] transition-all hover:bg-[#ff4338]"
          >
            <span className="text-[9px] font-bold text-[#7a0d09] opacity-0 transition-opacity group-hover/btn:opacity-100">✕</span>
          </button>
          <button
            onClick={() => setMinimized(true)}
            title="Minimize"
            className="group/btn relative grid h-[12px] w-[12px] place-items-center rounded-full bg-[#febc2e] transition-all hover:bg-[#f5a900]"
          >
            <span className="text-[10px] font-bold text-[#5c3e00] opacity-0 transition-opacity group-hover/btn:opacity-100">−</span>
          </button>
          <button
            onClick={toggleMaximize}
            title={maximized ? "Restore" : "Maximize"}
            className="group/btn relative grid h-[12px] w-[12px] place-items-center rounded-full bg-[#28c840] transition-all hover:bg-[#1aa830]"
          >
            <span className="text-[8px] font-bold text-[#003d0c] opacity-0 transition-opacity group-hover/btn:opacity-100">
              {maximized ? "❐" : "▢"}
            </span>
          </button>
        </div>

        {/* URL bar */}
        <div className="mx-auto flex max-w-[500px] flex-1 select-text items-center gap-[10px] rounded-[6px] border border-line bg-bg-1 px-3 py-[5px]" data-window-control>
          <span className="text-[10px] text-accent-teal">⊘</span>
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10.5px] text-ink-1">
            <span className="text-ink-3">https://</span>
            {app.url}
          </span>
          <span className={`rounded-[3px] px-[6px] py-[1px] font-mono text-[9px] uppercase tracking-[0.1em] ${envPillClass}`}>
            {env === "live" ? "Production" : ENV_LABELS[env]}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-[5px]" data-window-control>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            title="Reload"
            className="grid h-[26px] w-[26px] place-items-center rounded-md border border-line-strong bg-bg-1 text-[12px] text-ink-1 transition-colors hover:border-accent hover:bg-[rgba(77,141,255,0.08)] hover:text-ink-0"
          >↻</button>
          <ExportMenu
            triggerLabel="↗"
            triggerClassName="grid h-[26px] w-[26px] place-items-center rounded-md border border-line-strong bg-bg-1 text-[12px] text-ink-1 transition-colors hover:border-accent hover:bg-[rgba(77,141,255,0.08)] hover:text-ink-0"
            getContent={() => ({
              title:    app.name,
              html:     app.html ?? `<p><strong>App:</strong> ${app.name}</p><p><strong>Type:</strong> ${app.type}</p><p><strong>Environment:</strong> ${env}</p>`,
              filename: app.name,
            })}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-[280px_1fr] overflow-hidden max-[760px]:grid-cols-1">
        {/* Rail */}
        <aside className="overflow-y-auto border-r border-line bg-bg-1 px-[16px] py-4 max-[760px]:hidden">
          <div className="mb-4 flex items-center gap-3 border-b border-line pb-3">
            <div className="grid h-[38px] w-[38px] flex-shrink-0 place-items-center rounded-[8px] font-display text-[15px] font-bold text-white" style={{ background: ICON_COLORS[app.color] }}>{app.icon}</div>
            <div className="min-w-0 flex-1">
              {overlayRenaming ? (
                <input
                  ref={renameInputRef}
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")  handleOverlayRename();
                    if (e.key === "Escape") { setOverlayRenaming(false); setNewAppName(app.name); }
                  }}
                  className="mb-[2px] w-full rounded border border-accent bg-bg-0 px-[6px] py-[3px] font-display text-[13px] font-medium text-ink-0 outline-none"
                />
              ) : (
                <div className="mb-[2px] font-display text-[14px] font-medium leading-tight">{app.name}</div>
              )}
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-2">{app.cat}</div>
            </div>
          </div>

          <Section>Deployment Pipeline</Section>
          <div className="mb-2 flex flex-col">
            {ENV_ORDER.map((e, i) => {
              const active     = i <= curIdx;
              const current    = i === curIdx;
              const canPromote = current && i < ENV_ORDER.length - 1;
              return (
                <div key={e} className="relative flex items-center gap-3 py-[9px]">
                  {i < ENV_ORDER.length - 1 && (
                    <span className={`absolute left-[9px] top-7 h-[16px] w-[2px] ${active ? "bg-gradient-to-b from-accent-teal to-line-strong" : "bg-line-strong"}`} />
                  )}
                  <div className={`z-[1] grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border-2 text-[9px] ${
                    current ? "border-accent-amber bg-bg-1 text-accent-amber"
                    : active ? "border-accent-teal bg-accent-teal text-bg-0 shadow-[0_0_12px_rgba(45,212,191,0.4)]"
                    : "border-line-strong bg-bg-1 text-ink-3"
                  }`} style={current ? { animation: "nodePulse 1.6s infinite" } : undefined}>
                    {active && !current ? "✓" : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`text-[12px] font-medium ${active ? "text-ink-0" : "text-ink-1"}`}>{ENV_LABELS[e]}</div>
                    <div className="mt-[1px] font-mono text-[9px] text-ink-3">{active ? envMetas[e] : "not deployed"}</div>
                  </div>
                  {canPromote && (
                    <button onClick={() => promote(ENV_ORDER[i + 1])} className="rounded border border-[rgba(77,141,255,0.3)] px-2 py-[3px] font-mono text-[9px] uppercase tracking-[0.08em] text-accent transition-colors hover:bg-[rgba(77,141,255,0.1)] hover:text-accent-hot">
                      Promote →
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <Section>Runtime</Section>
          <Metric k="region" v={app.runtime.region} />
          <Metric k="uptime" v={app.runtime.uptime} />
          <Metric k="latency" v={app.runtime.latency} ok />
          <Metric k="requests" v={app.runtime.requests} />
          <Metric k="errors" v={app.runtime.errors} ok={app.runtime.errors === "0%"} warn={app.runtime.errors !== "0%"} />

          <Section>Build Log</Section>
          <div className="max-h-[140px] overflow-y-auto rounded-lg border border-line bg-bg-0 p-3 font-mono text-[10px] leading-[1.7]">
            {app.log.map((line, i) => (
              <div key={i} className="flex gap-2 opacity-0" style={{ animation: "logIn 0.3s forwards", animationDelay: `${i * 0.15}s` }}>
                <span className="flex-shrink-0 text-ink-3">{line[0]}</span>
                <span className={line[2] === "ok" ? "text-accent-teal" : line[2] === "info" ? "text-accent" : line[2] === "warn" ? "text-accent-amber" : "text-ink-1"}>{line[1]}</span>
              </div>
            ))}
          </div>

          <Section>Controls</Section>
          <RailButton primary onClick={() => { showToast("Redeploying " + app.name + "..."); setReloadKey((k) => k + 1); }}>▸ Redeploy</RailButton>
          <RailButton onClick={() => showToast("Streaming live logs...")}>≡ Stream Logs</RailButton>
          <RailButton onClick={() => showToast("Rollback initiated · reverting to previous build")}>↩ Rollback</RailButton>
          <RailButton onClick={() => showToast("Opening environment config...")}>⚙ Environment Config</RailButton>

          {/* ── Rename ── */}
          {overlayRenaming ? (
            <div className="mb-[5px] flex gap-[5px]">
              <button
                disabled={actionPending}
                onClick={handleOverlayRename}
                className="flex-1 rounded-[7px] border border-accent bg-[rgba(77,141,255,0.1)] px-2 py-[7px] font-mono text-[10px] uppercase tracking-[0.08em] text-accent transition-colors hover:bg-[rgba(77,141,255,0.18)] disabled:opacity-40"
              >
                {actionPending ? "Saving…" : "✓ Save"}
              </button>
              <button
                onClick={() => { setOverlayRenaming(false); setNewAppName(app.name); }}
                className="rounded-[7px] border border-line-strong bg-bg-2 px-3 py-[7px] font-mono text-[10px] uppercase tracking-[0.08em] text-ink-2 transition-colors hover:text-ink-0"
              >
                ✕
              </button>
            </div>
          ) : (
            <RailButton onClick={() => { setOverlayRenaming(true); setDeleteConfirm(false); }}>
              ✏ Rename App
            </RailButton>
          )}

          {/* ── Delete ── */}
          {deleteConfirm ? (
            <div className="mt-2 rounded-[8px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)] p-3">
              <p className="mb-1 font-mono text-[10px] text-ink-1">Delete <span className="font-medium text-accent-rose">{app.name}</span>?</p>
              <p className="mb-3 font-mono text-[9px] text-ink-3">All data will be permanently removed.</p>
              <div className="flex gap-2">
                <button
                  disabled={actionPending}
                  onClick={handleOverlayDelete}
                  className="flex-1 rounded-[6px] bg-accent-rose py-[6px] font-mono text-[10px] uppercase tracking-[0.05em] text-white transition hover:opacity-80 disabled:opacity-40"
                >
                  {actionPending ? "Deleting…" : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 rounded-[6px] border border-line py-[6px] font-mono text-[10px] uppercase tracking-[0.05em] text-ink-2 hover:text-ink-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setDeleteConfirm(true); setOverlayRenaming(false); }}
              className="mb-[5px] mt-1 flex w-full items-center gap-2 rounded-[7px] border border-[rgba(239,68,68,0.25)] bg-transparent px-3 py-[8px] font-mono text-[10px] uppercase tracking-[0.08em] text-accent-rose transition-colors hover:border-accent-rose hover:bg-[rgba(239,68,68,0.08)]"
            >
              🗑 Delete App
            </button>
          )}
        </aside>

        {/* Preview */}
        <div
          className={`relative ${app.html ? "overflow-hidden" : "overflow-y-auto"}`}
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(77,141,255,0.04), transparent 60%), var(--bg-0)" }}
        >
          {booting && (
            <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-4 bg-bg-0">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">{bootMsg}</div>
            </div>
          )}
          {!booting && app.html && (
            <AppPreview app={{ ...app, env }} key={reloadKey} />
          )}
          {!booting && !app.html && (
            <div className="min-h-full px-7 py-6">
              <AppPreview app={{ ...app, env }} key={reloadKey} />
            </div>
          )}
        </div>
      </div>

      {/* ── Resize handle (bottom-right corner) ── */}
      {!maximized && (
        <div
          onMouseDown={onResizeMouseDown}
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
          style={{
            background: "linear-gradient(135deg, transparent 0%, transparent 50%, rgba(120,150,220,0.4) 50%, rgba(120,150,220,0.4) 60%, transparent 60%, transparent 70%, rgba(120,150,220,0.5) 70%, rgba(120,150,220,0.5) 80%, transparent 80%)",
          }}
        />
      )}
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="mb-[8px] mt-[16px] font-mono text-[9px] uppercase tracking-[0.15em] text-ink-3 first:mt-0">{children}</div>;
}

function Metric({ k, v, ok, warn }: { k: string; v: string; ok?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-[6px] text-[12px] last:border-0">
      <span className="font-mono text-[10px] text-ink-3">{k}</span>
      <span className={`font-mono text-[11px] font-medium ${ok ? "text-accent-teal" : warn ? "text-accent-amber" : "text-ink-0"}`}>{v}</span>
    </div>
  );
}

function RailButton({ children, onClick, primary }: { children: React.ReactNode; onClick?: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`mb-[5px] flex w-full items-center gap-2 rounded-[7px] px-3 py-[8px] font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${
        primary
          ? "justify-center border-0 bg-gradient-to-br from-accent-hot to-accent-rose text-white hover:shadow-[0_4px_16px_rgba(255,122,61,0.3)]"
          : "border border-line-strong bg-bg-2 text-ink-1 hover:border-accent hover:bg-bg-3 hover:text-ink-0"
      }`}
    >
      {children}
    </button>
  );
}
