import Link from "next/link";
import { PageInner, PageHead } from "@/components/ui";
import PromptComposerGuide from "./PromptComposerGuide";

export default function PromptComposerPage() {
  return (
    <PageInner>
      <div className="mb-8 flex items-center justify-between">
        <PageHead
          tag="System User Guides"
          title="Prompt Composer"
          em="& Orchestration"
          sub="Building research knowledge bases through skill stacking"
        />
        <Link
          href="/guides"
          className="font-mono text-[12px] text-ink-2 hover:text-accent transition-colors"
        >
          ← Back to Guides
        </Link>
      </div>
      <PromptComposerGuide />
    </PageInner>
  );
}
