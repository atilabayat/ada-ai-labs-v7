// Always fetch fresh build rows — never serve a stale cached render.
export const dynamic = "force-dynamic";

import { PageInner, PageHead, SecLabel } from "@/components/ui";
import PromptComposer from "@/components/PromptComposer";
import LiveBuildPanel from "@/components/LiveBuildPanel";
import YourBuilds from "./YourBuilds";
import SuggestionCards from "./SuggestionCards";
import { getRecentBuilds } from "@/lib/queries";

export default async function BuilderPage() {
  const builds = await getRecentBuilds(8);

  return (
    <PageInner>
      <PageHead
        tag="Research Workbench · v7.1.0"
        title="Build, research,"
        em="compound."
        sub="An institutional sandbox for prompt stacking, skill chaining, and live web preview. Compose once — deploy as an app, a wiki, or a research portal."
      />

      <PromptComposer />

      {/* Live build panel — mounts only when a build is in flight */}
      <LiveBuildPanel />

      <SecLabel>Suggested Builds</SecLabel>
      <SuggestionCards />

      <SecLabel>Your Builds</SecLabel>
      <YourBuilds builds={builds} />
    </PageInner>
  );
}
