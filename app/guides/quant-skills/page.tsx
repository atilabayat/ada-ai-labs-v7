import Link from "next/link";
import { PageInner, PageHead } from "@/components/ui";
import QuantSkillsGuide from "./QuantSkillsGuide";

export default function QuantSkillsGuidePage() {
  return (
    <PageInner>
      <div className="mb-8 flex items-center justify-between">
        <PageHead
          tag="Quant Lab"
          title="Quant Skills"
          em="Guide"
          sub="All 25 quant skills — what they do, when to use them, and how they layer together"
        />
        <Link
          href="/guides"
          className="font-mono text-[12px] text-ink-2 hover:text-accent transition-colors"
        >
          ← Back to Guides
        </Link>
      </div>
      <QuantSkillsGuide />
    </PageInner>
  );
}
