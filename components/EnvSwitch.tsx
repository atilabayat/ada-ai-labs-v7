"use client";

import { usePathname, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/store";
import { Env } from "@/lib/types";

const OPTS: { env: Env; label: string; active: string }[] = [
  { env: "dev", label: "Development", active: "text-accent" },
  { env: "staging", label: "Staging", active: "text-accent-amber" },
  { env: "live", label: "Production", active: "text-accent-teal" },
];

// Routes whose listing is filtered by ?env=<env>. On these pages the title-bar
// switch also drives the list (and clicking the active env toggles back to All).
const ENV_FILTERED: Record<string, string> = {
  "/wikis": "/wikis",
  "/applications": "/applications",
};

export default function EnvSwitch() {
  const { env, setEnv } = useWorkspace();
  const pathname = usePathname();
  const router = useRouter();

  const select = (next: Env) => {
    setEnv(next);
    // If we're on an env-filterable page, reflect the choice in the URL so the
    // server-rendered list filters to that environment. Re-selecting the active
    // env clears the filter (back to "All").
    const base = ENV_FILTERED[pathname];
    if (base) {
      router.push(env === next ? base : `${base}?env=${next}`);
    }
  };

  return (
    <div className="ml-auto flex rounded-md border border-line-strong bg-bg-2 p-[3px]">
      {OPTS.map((o) => (
        <button
          key={o.env}
          onClick={() => select(o.env)}
          className={`rounded px-3 py-[5px] font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
            env === o.env
              ? `bg-bg-3 ${o.active}`
              : "text-ink-2 hover:text-ink-1"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
