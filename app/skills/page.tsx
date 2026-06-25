import { PageInner, PageHead } from "@/components/ui";
import { getAllSkills, getSkillTabs } from "@/lib/queries";
import SkillsList from "./SkillsList";

export default async function SkillsPage() {
  // Fetch on the server so the initial HTML includes all 28 skill cards —
  // not a flash of empty list before the client store hydrates.
  const [skills, tabs] = await Promise.all([getAllSkills(), getSkillTabs()]);

  return (
    <PageInner>
      <PageHead
        tag="Skill Library"
        title="Reusable"
        em="capabilities."
        sub="Composable AI skills that chain inside the prompt composer. Bring them into any build with a +  — research, quant, development, and knowledge primitives."
      />
      <SkillsList skills={skills} tabs={tabs} />
    </PageInner>
  );
}
