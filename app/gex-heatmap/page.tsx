import { Suspense } from "react";
import { PageInner, PageHead } from "@/components/ui";
import GexHeatmapClient from "./GexHeatmapClient";

export const dynamic = "force-dynamic";

export default function GexHeatmapPage() {
  return (
    <PageInner>
      <PageHead
        tag="Quant Lab"
        tone="amber"
        title="Gamma Exposure"
        em="heat maps."
        sub="Per-strike × per-expiry Net GEX across TSLA, NVDA, SPY, XSP, SPX, QQQ, AAPL, and PLTR. Green = long gamma (dealers stabilize price). Red = short gamma (dealers amplify moves). Yellow marker = underlying price."
      />
      <Suspense fallback={null}>
        <GexHeatmapClient />
      </Suspense>
    </PageInner>
  );
}
