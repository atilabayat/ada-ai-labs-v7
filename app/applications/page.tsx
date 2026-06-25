import { PageInner, PageHead } from "@/components/ui";
import { getAllApps } from "@/lib/queries";
import ApplicationsGrid from "./ApplicationsGrid";
import EnvSync from "@/components/EnvSync";
import type { Env } from "@/lib/types";

const VALID_ENVS: Env[] = ["dev", "staging", "live"];
const ENV_LABEL: Record<Env, string> = { dev: "Development", staging: "Staging", live: "Production" };
const ENV_COLOR: Record<Env, string> = { dev: "text-accent", staging: "text-accent-amber", live: "text-accent-teal" };

// Server component — fetches apps from the DB on every render, optionally
// filtered by the ?env= param the title-bar switch drives.
export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { env?: string };
}) {
  const filterEnv = VALID_ENVS.includes(searchParams.env as Env)
    ? (searchParams.env as Env)
    : null; // null = show all

  const all = await getAllApps();
  const apps = filterEnv ? all.filter((a) => a.env === filterEnv) : all;

  const byEnv: Record<string, number> = { dev: 0, staging: 0, live: 0 };
  for (const a of all) byEnv[a.env] = (byEnv[a.env] ?? 0) + 1;

  return (
    <PageInner>
      {/* Sync the title-bar env switch with the active filter */}
      <EnvSync env={filterEnv} />

      <PageHead
        tag="Application Launcher"
        tone="teal"
        title="Standalone"
        em="apps."
        sub="Every build can be launched as a standalone application — production dashboards, sentinels, research portals, and wikis, deployed from this workspace."
      />

      {/* ── Filter status bar (driven by the title-bar environment switch) ── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">
          {filterEnv ? (
            <>
              <span className={ENV_COLOR[filterEnv]}>{ENV_LABEL[filterEnv]}</span>
              {" · "}{apps.length} app{apps.length !== 1 ? "s" : ""}
            </>
          ) : (
            <>{all.length} app{all.length !== 1 ? "s" : ""} · all environments</>
          )}
        </span>
        <span className="ml-auto flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">
          <span className="text-accent">Dev {byEnv.dev}</span>
          <span className="text-accent-amber">Staging {byEnv.staging}</span>
          <span className="text-accent-teal">Prod {byEnv.live}</span>
        </span>
      </div>

      {apps.length > 0 ? (
        <ApplicationsGrid apps={apps} />
      ) : (
        <p className="font-mono text-[12px] text-ink-3">
          No {filterEnv ? ENV_LABEL[filterEnv].toLowerCase() : ""} applications yet.
          {filterEnv ? " Switch environments in the title bar, or promote an app from its launcher." : ""}
        </p>
      )}
    </PageInner>
  );
}
