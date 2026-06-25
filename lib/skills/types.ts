import { Env } from "@/lib/types";

export interface PrevStep {
  skill: string;
  output: string;
}

export interface SkillContext {
  prompt: string;
  prevSteps: PrevStep[];
  env: Env;
}

/**
 * Streaming events emitted by the orchestrator and forwarded over SSE.
 * The client renders these in real time in the LiveBuildPanel.
 */
export type SkillEvent =
  | { type: "build_start"; buildId: string; skills: string[]; env: Env }
  | { type: "step_start"; skill: string; label: string; phase: "skill" | "llm" }
  | { type: "token"; skill: string; text: string }
  | { type: "step_end"; skill: string; output: string }
  | { type: "llm_start"; model: string; isStub: boolean }
  | { type: "llm_token"; text: string }
  | { type: "llm_end"; output: string }
  | { type: "done"; finalOutput: string }
  | { type: "error"; message: string };

export type SkillExecutor = (ctx: SkillContext) => AsyncGenerator<SkillEvent>;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Helper: stream a finished markdown block out as tokens with realistic
 * pacing. Used by every skill executor so the user sees output materialize
 * progressively rather than appearing all at once.
 */
export async function* streamMarkdown(
  markdown: string,
  skill: string,
  label: string
): AsyncGenerator<SkillEvent> {
  yield { type: "step_start", skill, label, phase: "skill" };
  // Chunk on word boundaries; ~12ms per token feels live without being slow.
  const tokens = markdown.match(/\S+\s*|\s+/g) ?? [markdown];
  for (const t of tokens) {
    yield { type: "token", skill, text: t };
    await sleep(8);
  }
  yield { type: "step_end", skill, output: markdown };
}
