import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { SkillContext, SkillEvent, sleep } from "./types";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-6";

type ChainMode = "finance" | "academic" | "general";

const FINANCE_SKILLS  = new Set([
  "tsla-putwall", "callwall-monitor", "gamma-exposure", "dealer-flow",
  "vix-regime", "ipa-compendium", "market-data", "morning-brief",
  "embedded-quant-sources", "sec-filings",
  // Quant v2
  "quant-gamma-exposure", "quant-volatility-regimes", "quant-pricing-greeks",
  "quant-data-infrastructure", "quant-liquidity-detection", "quant-backtesting",
  "quant-tsla-institutional-flow", "tsla-daily-analysis", "tsla-gamma-walls-scanner",
  "tsla-trade-strategy", "tsla-quant-skills-inventory",
  "spy-market-analysis", "spy-options-flow", "spy-portfolio-tools",
  "spy-quant-skills-inventory", "spy-trade-strategy",
]);
const ACADEMIC_SKILLS = new Set(["literature-review", "academic-search", "classics-research", "social-science"]);

function detectChainMode(ctx: SkillContext): ChainMode {
  const ids = ctx.prevSteps.map(s => s.skill);
  if (ids.some(id => FINANCE_SKILLS.has(id)))  return "finance";
  if (ids.some(id => ACADEMIC_SKILLS.has(id)) && !ids.some(id => FINANCE_SKILLS.has(id))) return "academic";
  return "general";
}

function buildSystemPrompt(ctx: SkillContext): string {
  const base = [
    "You are the orchestrator inside ADA AI Labs — Alpha Data Architects' research workbench.",
    "You synthesize the outputs of upstream skill executions into a single, decisive deliverable.",
    "Style: concise, direct, no filler. Use markdown headings and tables where helpful.",
    "Cite numbers and quotes from upstream skills literally — do not paraphrase data.",
    "If multiple skills produced overlapping output, reconcile them and explicitly flag any conflicts.",
  ];

  const mode = detectChainMode(ctx);

  if (mode === "finance") {
    base.push(
      "The audience is an institutional trader. Prioritize actionable signals over background.",
      "End with a single '## Trade Read' section: directional bias + 1-2 specific trigger conditions (price levels, events, or indicator thresholds).",
    );
  } else if (mode === "academic") {
    base.push(
      "The audience is a researcher evaluating literature. Prioritize methodological rigor, citation quality, and evidence gaps.",
      "End with a '## Research Synthesis' section covering: (1) dominant findings across sources, (2) main open questions or contradictions, (3) 1-2 highest-priority papers or sources to read first.",
    );
  } else {
    base.push(
      "The audience needs a clear, balanced overview. Avoid jargon. Surface the most surprising or actionable finding first.",
      "End with a '## Key Takeaways' section: 3-5 bullet points, each grounded in a specific upstream source.",
    );
  }

  return base.join(" ");
}

function buildUserMessage(ctx: SkillContext): string {
  const parts: string[] = [];
  parts.push(`# User Prompt\n\n${ctx.prompt}\n`);
  if (ctx.prevSteps.length) {
    parts.push(`# Upstream Skill Outputs (in order)\n`);
    for (const step of ctx.prevSteps) {
      parts.push(`## /${step.skill}\n\n${step.output}\n`);
    }
  }
  parts.push(`Now synthesize the above into the final deliverable.`);
  return parts.join("\n");
}

/**
 * Real streaming from the Anthropic API. Yields llm_token events as text deltas
 * arrive. Falls back to throwing on API errors so the caller can switch to the
 * stub path or surface the error to the user.
 */
async function* streamAnthropic(ctx: SkillContext): AsyncGenerator<SkillEvent> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  yield { type: "llm_start", model: DEFAULT_MODEL, isStub: false };

  let final = "";
  const stream = client.messages.stream({
    model: DEFAULT_MODEL,
    max_tokens: 2048,
    system: buildSystemPrompt(ctx),
    messages: [{ role: "user", content: buildUserMessage(ctx) }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      const text = event.delta.text;
      final += text;
      yield { type: "llm_token", text };
    }
  }

  yield { type: "llm_end", output: final };
}

/**
 * Stub streamer. Emits a credible synthesis using the upstream step outputs.
 * No external network call. Used when ANTHROPIC_API_KEY is unset so the
 * pipeline is fully demoable out of the box.
 */
async function* streamStub(ctx: SkillContext): AsyncGenerator<SkillEvent> {
  yield { type: "llm_start", model: "stub", isStub: true };

  const skills = ctx.prevSteps.map((s) => `/${s.skill}`).join(", ") || "(no skills)";
  const mode   = detectChainMode(ctx);

  let closingSection: string;
  if (mode === "finance") {
    const allText    = ctx.prevSteps.map((s) => s.output).join("\n");
    const tickerMatch = allText.match(/\b(TSLA|NVDA|SPY|QQQ|AAPL|AMZN|SPX|NDX|MSFT|GOOGL|META)\b/);
    const ticker     = tickerMatch ? tickerMatch[0].toUpperCase() : "the targeted ticker";
    closingSection   = `## Trade Read\n**Bias:** neutral-to-bullish on ${ticker} into the call wall; sell rips above $450, buy dips near the put wall $420.\n**Triggers:** (1) spot crosses within 0.5% of the put wall → morning sentinel fires, (2) VIX expansion above 18 → flip to defensive structures.`;
  } else if (mode === "academic") {
    closingSection = `## Research Synthesis\n- **Dominant finding:** Multiple sources converge on this topic (stub — no API key).\n- **Open questions:** Methodological gaps and conflicting evidence noted across sources.\n- **Priority reads:** See highest-cited works surfaced by the upstream skill chain.`;
  } else {
    closingSection = `## Key Takeaways\n- The upstream skill chain surfaced several relevant signals (stub — no API key).\n- Review the skill outputs above for source-grounded details.\n- Add \`ANTHROPIC_API_KEY\` to \`.env\` for a fully synthesized narrative.`;
  }

  const md = `## Synthesis

Built from \`${skills}\`. Prompt: _${ctx.prompt.slice(0, 240)}${ctx.prompt.length > 240 ? "…" : ""}_

The upstream skill chain produced ${ctx.prevSteps.length} executed step${ctx.prevSteps.length === 1 ? "" : "s"}.

${closingSection}

> _Synthesis path: stub (no \`ANTHROPIC_API_KEY\` set). Drop a key in \`.env\`
> to switch to live model streaming via \`@anthropic-ai/sdk\`._`;

  let final = "";
  const tokens = md.match(/\S+\s*|\s+/g) ?? [md];
  for (const t of tokens) {
    final += t;
    yield { type: "llm_token", text: t };
    await sleep(12);
  }
  yield { type: "llm_end", output: final };
}

export async function* runLLM(ctx: SkillContext): AsyncGenerator<SkillEvent> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      yield* streamAnthropic(ctx);
      return;
    } catch (e) {
      // Fall through to stub with an error note, so a failing live call still
      // produces SOME output for the user.
      yield { type: "llm_token", text: `\n\n> _Live model call failed (${(e as Error).message}); falling back to stub._\n\n` };
    }
  }
  yield* streamStub(ctx);
}
