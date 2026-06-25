"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/lib/store";

type QdrantStatus = "warming" | "ready" | "down";

export default function StatusBar() {
  const pathname       = usePathname();
  const setPaletteOpen = useWorkspace((s) => s.setPaletteOpen);
  const theme          = useWorkspace((s) => s.theme);
  const toggleTheme    = useWorkspace((s) => s.toggleTheme);
  const isLight        = theme === "light";

  const [qdrant, setQdrant] = useState<QdrantStatus>("warming");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok) { if (!cancelled) setQdrant("down"); return; }
        const { qdrant: status } = await res.json();
        if (!cancelled) setQdrant(status === "ready" ? "ready" : "down");
      } catch {
        if (!cancelled) setQdrant("down");
      }
    };
    check();
    const id = setInterval(check, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const dot: Record<QdrantStatus, string> = {
    warming: "bg-accent-amber shadow-[0_0_6px_var(--accent-amber)]",
    ready:   "bg-accent-teal  shadow-[0_0_6px_var(--accent-teal)]",
    down:    "bg-accent-rose  shadow-[0_0_6px_var(--accent-rose)]",
  };

  return (
    <div className="flex h-[26px] flex-shrink-0 items-center gap-[18px] border-t border-line bg-bg-1 px-[18px] font-mono text-[10px] text-ink-3">
      <div className="flex items-center gap-[6px]">
        <span className="h-[6px] w-[6px] rounded-full bg-accent-teal shadow-[0_0_6px_var(--accent-teal)]" />
        sandbox·dev
      </div>
      <div className="flex items-center gap-[6px]">
        <span className="h-[6px] w-[6px] rounded-full bg-accent-teal shadow-[0_0_6px_var(--accent-teal)]" />
        orchestrator: idle
      </div>
      <div className="flex items-center gap-[6px]">
        <span className={`h-[6px] w-[6px] rounded-full ${dot[qdrant]}`} />
        qdrant: {qdrant}
      </div>
      <div className="flex-1" />
      <div>route: {pathname}</div>
      <div>build 0.3.0-beta · ada-ai-labs</div>
      <button
        onClick={toggleTheme}
        title={`Switch to ${isLight ? "dark" : "light"} mode`}
        className="rounded px-[6px] py-px transition-colors hover:bg-[rgba(0,0,0,0.06)] hover:text-ink-0 [data-theme='dark']_&:hover:bg-[rgba(255,255,255,0.06)]"
      >
        {isLight ? "☾ Dark" : "☀ Light"}
      </button>
      <button
        onClick={() => setPaletteOpen(true)}
        className="cursor-pointer rounded px-[6px] py-px transition-colors hover:bg-[rgba(0,0,0,0.06)] hover:text-ink-0"
      >
        ⌘K commands
      </button>
    </div>
  );
}
