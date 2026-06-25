import { SkillExecutor, streamMarkdown } from "../types";

const LABELS: Record<string, string> = {
  "deep-research": "Running multi-source research",
  "web-search": "Searching the web",
  "literature-review": "Building literature review",
  "academic-search": "Scanning arXiv / SSRN / PubMed",
  "news-monitor": "Pulling latest news",
  "sec-filings": "Querying SEC filings",
  "frontend-design": "Applying frontend design heuristics",
  "dashboard-builder": "Composing dashboard scaffold",
  "react-generator": "Generating React component",
  "pdf-builder": "Building PDF artifact",
  "docx-builder": "Building Word document",
  "xlsx-builder": "Building Excel workbook",
  "vercel-deploy": "Provisioning Vercel deployment",
  "wiki-builder": "Composing wiki structure",
  "knowledge-graph": "Updating knowledge graph",
  "lesson-generator": "Generating lesson outline",
  "flash-brief": "Drafting flash brief",
  "survey-paper": "Drafting survey paper outline",
  "llm-council": "Convening LLM council",
  notebooklm: "Driving NotebookLM",
};

/**
 * Fallback executor used for any skill without a domain-specific implementation
 * in the registry. Emits a short status block so the user sees that the skill
 * was applied, and contributes a small context note to be passed downstream to
 * the LLM final step.
 */
export function makeDefaultExecutor(skillId: string): SkillExecutor {
  return async function* () {
    const label = LABELS[skillId] ?? `Applying skill /${skillId}`;
    const md = `_Skill applied:_ \`/${skillId}\` — ${label.toLowerCase()}.`;
    yield* streamMarkdown(md, skillId, label);
  };
}
