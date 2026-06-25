"use client";

import { useEffect } from "react";
import { useWorkspace } from "@/lib/store";
import { Env } from "@/lib/types";

/**
 * Keeps the global title-bar environment switch in sync with a page's active
 * `?env=` filter (Wikis, Applications, …). When a single environment is selected
 * — via either the title-bar switch or an on-page control — the title bar
 * highlights it. Rendered invisibly; does nothing in the "All" view.
 */
export default function EnvSync({ env }: { env: Env | null }) {
  const setEnv = useWorkspace((s) => s.setEnv);
  useEffect(() => {
    if (env) setEnv(env);
  }, [env, setEnv]);
  return null;
}
