"use client";

import { useWorkspace } from "@/lib/store";

export default function Toast() {
  const toast = useWorkspace((s) => s.toast);

  return (
    <div
      className={`fixed bottom-[50px] right-6 z-[200] flex items-center gap-[10px] rounded-lg border border-accent-teal bg-bg-2 px-[18px] py-[12px] font-mono text-[11px] text-ink-0 shadow-[0_10px_40px_rgba(45,212,191,0.2)] transition-all ${
        toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-accent-teal shadow-[0_0_10px_var(--accent-teal)]" />
      {toast}
    </div>
  );
}
