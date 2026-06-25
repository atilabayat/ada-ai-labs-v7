import { PageInner, PageHead } from "@/components/ui";
import WikiWizard from "./WikiWizard";

export default function NewWikiPage() {
  return (
    <PageInner>
      <PageHead
        tag="Wiki Builder"
        tone="violet"
        title="Compose a new"
        em="wiki."
        sub="Describe your topic, add sources, stage the structure — then generate. The build pipeline streams each section live; save to your wiki library when done."
      />
      <WikiWizard />
    </PageInner>
  );
}
