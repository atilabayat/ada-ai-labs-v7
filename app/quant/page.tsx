import { Suspense } from "react";
import QuantClient from "./QuantClient";

// Dynamic: QuantClient reads the ?view= search param to deep-link workbench tabs.
export const dynamic = "force-dynamic";

// All data is fetched client-side via /api/market — no server queries needed here.
export default function QuantPage() {
  return (
    <Suspense fallback={null}>
      <QuantClient />
    </Suspense>
  );
}
