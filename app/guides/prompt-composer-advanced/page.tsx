import Link from "next/link";
import { PageInner, PageHead } from "@/components/ui";
import PromptComposerAdvancedGuide from "./PromptComposerAdvancedGuide";

export default function PromptComposerAdvancedPage() {
  return (
    <PageInner>
      <div className="mb-8 flex items-center justify-between">
        <PageHead
          tag="System User Guides"
          title="Prompt User Guide"
          em="— Advanced Users"
          sub="Advanced research and knowledge engineering with the full 60-skill taxonomy"
        />
        <Link
          href="/guides"
          className="font-mono text-[12px] text-ink-2 hover:text-accent transition-colors"
        >
          ← Back to Guides
        </Link>
      </div>
      <PromptComposerAdvancedGuide />
    </PageInner>
  );
}
