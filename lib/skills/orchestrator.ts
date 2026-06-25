import "server-only";
import { prisma } from "@/lib/db";
import { Env } from "@/lib/types";
import { getExecutor } from "./executors";
import { runLLM } from "./llm";
import { PrevStep, SkillContext, SkillEvent, sleep } from "./types";

interface BuildEventRecord {
  ts: number;
  skill: string;
  label: string;
  output: string;
}

/**
 * Replay a finished build's stored transcript — used when the user re-opens an
 * old card. No re-execution, no LLM call, just replay the saved per-step
 * outputs with a brief pacing so the UI animates naturally.
 */
async function* replayBuild(buildId: string): AsyncGenerator<SkillEvent> {
  const build = await prisma.build.findUnique({ where: { id: buildId } });
  if (!build) {
    yield { type: "error", message: `Build ${buildId} not found` };
    return;
  }
  const skills: string[] = JSON.parse(build.skills);
  const env = build.env as Env;
  yield { type: "build_start", buildId, skills, env };

  const transcript: BuildEventRecord[] = JSON.parse(build.events || "[]");
  for (const entry of transcript) {
    if (entry.skill === "__llm__") {
      yield { type: "llm_start", model: "(replay)", isStub: false };
      yield { type: "llm_token", text: entry.output };
      yield { type: "llm_end", output: entry.output };
    } else {
      yield { type: "step_start", skill: entry.skill, label: entry.label, phase: "skill" };
      yield { type: "token", skill: entry.skill, text: entry.output };
      yield { type: "step_end", skill: entry.skill, output: entry.output };
    }
    await sleep(40);
  }
  yield { type: "done", finalOutput: build.output };
}

/**
 * Run a Build end-to-end:
 *   1. Look up the build row
 *   2. For each skill in order: execute, stream tokens, capture output
 *   3. Hand all captured outputs to the LLM synthesis step (real or stub)
 *   4. Persist final output + per-step transcript + status=done
 *
 * Yields SkillEvent values that the SSE route forwards to the browser.
 */
export async function* runBuild(buildId: string): AsyncGenerator<SkillEvent> {
  const build = await prisma.build.findUnique({ where: { id: buildId } });
  if (!build) {
    yield { type: "error", message: `Build ${buildId} not found` };
    return;
  }

  // If a finished build is re-opened, replay its transcript instead of
  // executing the orchestrator over again.
  if (build.status === "done" || build.status === "failed" || build.status === "cancelled") {
    yield* replayBuild(buildId);
    return;
  }

  const skills: string[] = JSON.parse(build.skills);
  const env = build.env as Env;
  const ctx: SkillContext = { prompt: build.prompt, prevSteps: [], env };
  const transcript: BuildEventRecord[] = [];

  await prisma.build.update({ where: { id: buildId }, data: { status: "streaming" } });

  yield { type: "build_start", buildId, skills, env };

  try {
    let currentSkillLabel = "";

    for (const skillId of skills) {
      let stepOutput = "";

      try {
        const executor = getExecutor(skillId);

        for await (const event of executor(ctx)) {
          if (event.type === "step_start") currentSkillLabel = event.label;
          if (event.type === "step_end") {
            stepOutput = event.output;
            transcript.push({
              ts: Date.now(),
              skill: skillId,
              label: currentSkillLabel,
              output: stepOutput,
            });
          }
          yield event;
        }
      } catch (skillErr) {
        // Individual skill failure: record the error, yield a visible
        // notification, and continue with the next skill instead of
        // aborting the entire build.
        const errMsg = skillErr instanceof Error ? skillErr.message : String(skillErr);
        const fallback = `> ⚠ Skill \`/${skillId}\` encountered an error: ${errMsg}\n> The build continues with remaining skills.`;

        yield { type: "step_start", skill: skillId, label: `${skillId} (error)`, phase: "skill" as const };
        yield { type: "token", skill: skillId, text: fallback };
        yield { type: "step_end", skill: skillId, output: fallback };

        stepOutput = fallback;
        transcript.push({ ts: Date.now(), skill: skillId, label: `${skillId} (error)`, output: fallback });
      }

      // Make this step's output available to downstream skills + LLM.
      const prev: PrevStep = { skill: skillId, output: stepOutput };
      ctx.prevSteps.push(prev);
    }

    // Final synthesis
    let llmFinal = "";
    for await (const event of runLLM(ctx)) {
      if (event.type === "llm_end") {
        llmFinal = event.output;
        transcript.push({
          ts: Date.now(),
          skill: "__llm__",
          label: "synthesis",
          output: event.output,
        });
      }
      yield event;
    }

    const finalOutput = [
      ...ctx.prevSteps.map((s) => `# /${s.skill}\n\n${s.output}`),
      `# Synthesis\n\n${llmFinal}`,
    ].join("\n\n---\n\n");

    await prisma.build.update({
      where: { id: buildId },
      data: {
        status: "done",
        output: finalOutput,
        events: JSON.stringify(transcript),
      },
    });

    // Embed build output into Qdrant (non-blocking)
    onBuildComplete(buildId).catch(() => {});

    yield { type: "done", finalOutput };
  } catch (e) {
    const message = (e as Error).message;
    await prisma.build.update({
      where: { id: buildId },
      data: {
        status: "failed",
        error: message,
        events: JSON.stringify(transcript),
      },
    });
    yield { type: "error", message };
  }
}

/**
 * Embed a completed build's output and add to Qdrant
 */
export async function embedBuildOutput(buildId: string, output: string) {
  try {
    const { embedText, addPoint } = await import("../embeddings");

    const vector = await embedText(output.substring(0, 2000)); // First 2000 chars

    // Add to Qdrant
    const build = await prisma.build.findUnique({ where: { id: buildId } });
    await addPoint("builds", parseInt(buildId.substring(0, 8), 16), vector, {
      id: buildId,
      prompt: build?.prompt || "",
      status: "done",
    });
  } catch (error) {
    // Non-blocking: log but don't fail
    console.error(`Failed to embed build ${buildId}:`, error);
  }
}

/**
 * Called when a build completes streaming
 */
export async function onBuildComplete(buildId: string) {
  const build = await prisma.build.findUnique({
    where: { id: buildId },
    select: { output: true },
  });

  if (build?.output) {
    await embedBuildOutput(buildId, build.output);
  }
}
