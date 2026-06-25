import { PageInner, PageHead } from "@/components/ui";
import ResearchPanel from "./ResearchPanel";
import { getResearchSessions } from "@/lib/actions";

export default async function ResearchPage() {
  const savedSessions = await getResearchSessions();

  return (
    <PageInner>
      <PageHead
        tag="Deep Research Engine"
        tone="violet"
        title="Institutional"
        em="research."
        sub="Multi-source research across academic, industry, financial, and government feeds. Outputs flow into wikis, briefings, and the knowledge graph."
      />
      <ResearchPanel savedSessions={savedSessions} />
    </PageInner>
  );
}
