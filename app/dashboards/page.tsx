import { PageInner, PageHead } from "@/components/ui";
import { getAllApps } from "@/lib/queries";
import ApplicationsGrid from "@/app/applications/ApplicationsGrid";

// Server component — shows only apps with type "dashboard".
// New dashboards added via scripts/add-*-html.mjs appear here automatically.
export default async function DashboardsPage() {
  const all        = await getAllApps();
  const dashboards = all.filter((a) => a.type === "dashboard");

  return (
    <PageInner>
      <PageHead
        tag="Quant Lab"
        tone="amber"
        title="Trading"
        em="dashboards."
        sub={`${dashboards.length} interactive dashboard${dashboards.length !== 1 ? "s" : ""} — SPY/TSLA scoring, gamma analysis, divergence engines, and market-regime monitors. Each dashboard opens full-screen with live data wiring.`}
      />

      {dashboards.length > 0 ? (
        <ApplicationsGrid apps={dashboards} />
      ) : (
        <p className="font-mono text-[12px] text-ink-3">
          No dashboards yet. Add one via <code className="text-accent">scripts/add-*-html.mjs</code> with <code className="text-accent">type: &quot;dashboard&quot;</code>.
        </p>
      )}
    </PageInner>
  );
}
