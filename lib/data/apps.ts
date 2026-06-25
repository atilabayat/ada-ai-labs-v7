import { Env } from "../types";

// Static configuration (no DB needed) — the actual `APPS` data now lives in
// the database. Use the query layer:
//
//   import { getAllApps, getApp } from "@/lib/queries"   (server only)
//
// On the client, apps are hydrated into the Zustand store by <DataProvider>.

export const ENV_ORDER: Env[] = ["dev", "staging", "live"];

export const ENV_LABELS: Record<Env, string> = {
  dev: "Development",
  staging: "Staging",
  live: "Production",
};

export const ICON_COLORS: Record<string, string> = {
  amber: "linear-gradient(135deg, var(--accent-amber), rgba(245,183,72,0.3))",
  teal: "linear-gradient(135deg, var(--accent-teal), rgba(45,212,191,0.3))",
  rose: "linear-gradient(135deg, var(--accent-rose), rgba(255,86,119,0.3))",
  violet: "linear-gradient(135deg, var(--accent-violet), rgba(167,139,250,0.3))",
};
