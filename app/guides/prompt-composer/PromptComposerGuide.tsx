"use client";

import { useState } from "react";

const TableOfContents = [
  "Overview",
  "Core Concepts",
  "The Prompt Composer Interface",
  "Building Research Knowledge Bases",
  "Analyzing and Synthesizing Research",
  "Stacking Prompts Effectively",
  "Composing with Skills and Chained Skills",
  "Workflow Patterns for Researchers",
  "Best Practices",
  "Troubleshooting",
];

export default function PromptComposerGuide() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-8 rounded-[10px] border border-line bg-bg-2 p-6">
        <h2 className="mb-4 text-[20px] font-semibold text-ink-0">Table of Contents</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {TableOfContents.map((item, idx) => (
            <button
              key={item}
              onClick={() => toggleSection(item)}
              className="text-left font-mono text-[12px] text-accent hover:text-accent-hot transition-colors py-1"
            >
              {idx + 1}. {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {/* OVERVIEW */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">1.</span> Overview
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p>
              The <strong>Prompt Composer</strong> is ADA AI Labs' orchestration facility for building, iterating, and publishing research knowledge. It enables researchers to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-ink-2">
              <li>Chain multiple research skills in sequence for comprehensive inquiry</li>
              <li>Synthesize outputs from disparate sources into coherent analysis</li>
              <li>Preserve research context across builds for iteration and refinement</li>
              <li>Publish findings directly to wikis and research artifacts</li>
            </ul>
            <p className="pt-2">
              The core innovation is <strong>skill stacking</strong>: you compose a multi-step research workflow by selecting skills, providing a guiding prompt, and letting the orchestrator execute them in parallel, then synthesize results with Claude.
            </p>
          </div>
        </section>

        {/* CORE CONCEPTS */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">2.</span> Core Concepts
          </h3>
          <div className="space-y-6 text-[14px] leading-relaxed text-ink-1">
            <div>
              <h4 className="mb-2 font-semibold text-accent">Skill</h4>
              <p className="text-ink-2">
                A <strong>skill</strong> is a self-contained research module that fetches or transforms data. Examples include:
                <code className="block mt-2 p-3 bg-bg-1 rounded text-[12px] text-accent-teal overflow-auto">
                  web-search, deep-research, news-monitor, literature-review, sec-filings, quant, notebooklm
                </code>
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-accent">Skill Stack</h4>
              <p className="text-ink-2">
                A <strong>stack</strong> is an ordered list of skills selected for a single research inquiry. Order helps you remember intent; execution is parallel.
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-accent">Synthesis (LLM Step)</h4>
              <p className="text-ink-2">
                After all skills complete, Claude reconciles their outputs, deduplicates findings, cites data, and produces a final deliverable in mode-aware format.
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-accent">Dual-Button Workflow</h4>
              <ul className="list-disc list-inside space-y-1 text-ink-2">
                <li><strong>Build</strong> — first build with this prompt</li>
                <li><strong>Rebuild</strong> — re-execute with modified prompt (iterates on last build)</li>
                <li><strong>New Build</strong> — clear previous build, start fresh inquiry</li>
              </ul>
            </div>
          </div>
        </section>

        {/* INTERFACE */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">3.</span> The Prompt Composer Interface
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p className="text-ink-2">
              The Prompt Composer has 4 main sections:
            </p>
            <div className="bg-bg-1 p-4 rounded space-y-3 text-[12px] font-mono">
              <div><span className="text-accent-teal">1. Textarea</span> — your research question (6+ lines)</div>
              <div><span className="text-accent-teal">2. Skill Stack</span> — selected skills with +/× controls</div>
              <div><span className="text-accent-teal">3. Notebook Picker</span> — shown when /notebooklm selected</div>
              <div><span className="text-accent-teal">4. Build Buttons</span> — Build/Rebuild/New Build with ⌘↩ shortcut</div>
            </div>
            <p className="text-ink-2 pt-2">
              <strong>Pro tip:</strong> Click in the textarea to auto-close the skill picker. Keyboard shortcut ⌘↩ submits builds.
            </p>
          </div>
        </section>

        {/* KNOWLEDGE BASE BUILDING */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">4.</span> Building Research Knowledge Bases
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p className="text-ink-2">
              Research foundation-building follows a 3-step pattern:
            </p>
            <div className="space-y-3 text-[13px]">
              <div className="border-l-2 border-accent-teal pl-4">
                <h4 className="font-semibold text-accent-teal">Step 1: Broad Search Phase</h4>
                <p className="text-ink-2 mt-1">Use <code className="text-accent">literature-review + web-search + sec-filings</code> to establish baseline understanding. Generates 30-50 curated papers and news analysis.</p>
              </div>
              <div className="border-l-2 border-accent-hot pl-4">
                <h4 className="font-semibold text-accent-hot">Step 2: Deep-Dive on Key Areas</h4>
                <p className="text-ink-2 mt-1">Use <code className="text-accent">deep-research + sec-filings + notebooklm</code> to compare major players. Produces structured comparison with patent analysis.</p>
              </div>
              <div className="border-l-2 border-accent pl-4">
                <h4 className="font-semibold text-accent">Step 3: Preserve & Iterate</h4>
                <p className="text-ink-2 mt-1">Save outputs as wikis. Use <strong>Rebuild</strong> for refinement, <strong>New Build</strong> for new topics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ANALYSIS & SYNTHESIS */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">5.</span> Analyzing and Synthesizing Research
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p className="text-ink-2">
              <strong>Core Principle:</strong> Let skills specialize, Claude reconciles.
            </p>
            <div className="bg-bg-1 p-4 rounded text-[12px] space-y-2">
              <p><span className="text-accent-amber">❌ Anti-pattern:</span> "Fetch everything, ask one question."</p>
              <p><span className="text-accent-teal">✓ Pro pattern:</span> "Stack specialists, ask focused question, let Claude reconcile."</p>
            </div>
            <p className="text-ink-2 pt-2">
              Example: For earnings reaction analysis, stack <code className="text-accent">web-search + sec-filings + quant</code>. Each provides distinct data; synthesis identifies gaps and produces actionable Trade Read.
            </p>
          </div>
        </section>

        {/* STACKING EFFECTIVELY */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">6.</span> Stacking Prompts Effectively
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <div className="space-y-3 text-[13px]">
              <div>
                <h4 className="font-semibold text-accent mb-1">Principle 1: Data Diversity Over Volume</h4>
                <p className="text-ink-2">Bad: 7 skills with overlap. Good: 3 strategic skills with zero overlap.</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-1">Principle 2: Order by Priority</h4>
                <p className="text-ink-2">Stack order reflects importance in synthesis: <code className="text-accent">notebooklm + sec-filings + web-search</code></p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-1">Principle 3: Leverage Mode-Aware Synthesis</h4>
                <p className="text-ink-2"><strong>Finance mode:</strong> ends with Trade Read. <strong>Academic mode:</strong> ends with Research Synthesis. <strong>General:</strong> Key Takeaways.</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-1">Principle 4: Stack for Iteration Readiness</h4>
                <p className="text-ink-2">Keep stack consistent across Rebuilds. Prompt changes, not data sources. Compare iterations easily.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CHAINED SKILLS */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">7.</span> Composing with Chained Skills
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <p className="text-ink-2">
              Most research needs <strong>chained execution</strong>: Skill A's output informs Skill B's query.
            </p>
            <div className="bg-bg-1 p-4 rounded text-[12px] space-y-3">
              <p><strong>Build 1 (Get baseline):</strong> sec-filings only → list of insider transactions</p>
              <p><strong>Build 2 (Enrich—REBUILD):</strong> sec-filings + web-search + quant → context + ranking</p>
            </div>
            <p className="text-ink-2 pt-2">
              Use <strong>Rebuild</strong> instead of two builds: synthesizes both seamlessly, produces one unified output.
            </p>
          </div>
        </section>

        {/* WORKFLOW PATTERNS */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">8.</span> Workflow Patterns for Researchers
          </h3>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-1">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-accent mb-1">Pattern 1: Literature Review → Deep Dive</h4>
                <p className="text-ink-2">Build 1: Foundation (30 papers). Build 2: Narrow focus (methodology). Build 3: Competitive landscape.</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-1">Pattern 2: Real-Time Intelligence (Daily Monitor)</h4>
                <p className="text-ink-2">Same stack, same prompt skeleton, always-fresh data. Rebuild 2x weekly to track trends.</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-1">Pattern 3: Multi-Stakeholder Decision Support</h4>
                <p className="text-ink-2">Build 1: Market research. Build 2: Target assessment (Rebuild). Build 3: Integration scenarios (Rebuild). All in one session, linked context.</p>
              </div>
            </div>
          </div>
        </section>

        {/* BEST PRACTICES */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">9.</span> Best Practices
          </h3>
          <div className="space-y-3 text-[13px] leading-relaxed text-ink-1">
            <div className="border-l-2 border-accent-teal pl-3">
              <p className="font-semibold text-accent-teal">1. Write specific prompts, not vague ones</p>
              <p className="text-ink-2 text-[12px] mt-1">Include numbered sub-questions, cite your intent, be structured.</p>
            </div>
            <div className="border-l-2 border-accent-amber pl-3">
              <p className="font-semibold text-accent-amber">2. Stack for data diversity</p>
              <p className="text-ink-2 text-[12px] mt-1">Remove redundant skills. Ask: "What data is available ONLY here?"</p>
            </div>
            <div className="border-l-2 border-accent pl-3">
              <p className="font-semibold text-accent">3. Name wikis descriptively</p>
              <p className="text-ink-2 text-[12px] mt-1">Use crispr-off-target-risk, not research-1. Makes knowledge base searchable.</p>
            </div>
            <div className="border-l-2 border-accent-rose pl-3">
              <p className="font-semibold text-accent-rose">4. Iterate narrowly</p>
              <p className="text-ink-2 text-[12px] mt-1">Build 1: overview. Build 2: narrow. Build 3: specialized. Each Rebuild adds precision.</p>
            </div>
            <div className="border-l-2 border-accent-hot pl-3">
              <p className="font-semibold text-accent-hot">5. Publish incrementally</p>
              <p className="text-ink-2 text-[12px] mt-1">Save to wiki after each meaningful build. Don't wait for perfection.</p>
            </div>
            <div className="border-l-2 border-accent-teal pl-3">
              <p className="font-semibold text-accent-teal">6. Leverage NotebookLM</p>
              <p className="text-ink-2 text-[12px] mt-1">Stack notebooklm + external skills to reconcile internal vs. external views.</p>
            </div>
          </div>
        </section>

        {/* TROUBLESHOOTING */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0 flex items-center gap-2">
            <span className="text-accent">10.</span> Troubleshooting
          </h3>
          <div className="space-y-3 text-[13px] leading-relaxed text-ink-1">
            <div>
              <p className="font-semibold text-accent-teal">Build failed with 500 error?</p>
              <p className="text-ink-2 text-[12px] mt-1">Check API keys in .env. For NotebookLM, run <code className="text-accent">nlm login</code>. Rebuild: skills gracefully degrade.</p>
            </div>
            <div>
              <p className="font-semibold text-accent-amber">Skill picker won't close?</p>
              <p className="text-ink-2 text-[12px] mt-1">Click in textarea or click Build button directly.</p>
            </div>
            <div>
              <p className="font-semibold text-accent">Previous wiki showing when you want fresh start?</p>
              <p className="text-ink-2 text-[12px] mt-1">Click ⊕ New Build button (next to Rebuild).</p>
            </div>
            <div>
              <p className="font-semibold text-accent-rose">Build takes too long?</p>
              <p className="text-ink-2 text-[12px] mt-1">Remove non-essential skills. Use web-search instead of deep-research. Use sec-filings for company info, not web-search.</p>
            </div>
          </div>
        </section>

        {/* QUICK REFERENCE */}
        <section className="rounded-[10px] border border-line bg-bg-2 p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-ink-0">Quick Reference: Skill Selector</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] text-ink-2">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-3 py-2 text-left font-semibold text-ink-0">Skill</th>
                  <th className="px-3 py-2 text-left font-semibold text-ink-0">Best For</th>
                  <th className="px-3 py-2 text-left font-semibold text-ink-0">Speed</th>
                  <th className="px-3 py-2 text-left font-semibold text-ink-0">Depth</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["web-search", "General news, announcements", "Fast", "Shallow"],
                  ["deep-research", "Comprehensive multi-angle", "Slow", "Deep"],
                  ["literature-review", "Academic papers, rigor", "Medium", "Deep"],
                  ["sec-filings", "Company financials, strategy", "Fast", "Precise"],
                  ["quant", "Market data, options, technicals", "Fast", "Precise"],
                  ["notebooklm", "Your uploaded research", "Instant", "As detailed as docs"],
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-line/50">
                    <td className="px-3 py-2 font-mono text-accent">{row[0]}</td>
                    <td className="px-3 py-2">{row[1]}</td>
                    <td className="px-3 py-2 text-ink-3">{row[2]}</td>
                    <td className="px-3 py-2 text-ink-3">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="rounded-[10px] border border-accent bg-gradient-to-r from-[rgba(77,141,255,0.08)] to-[rgba(77,141,255,0.02)] p-6">
          <h3 className="mb-4 text-[18px] font-semibold text-accent">The Research Workflow</h3>
          <div className="space-y-3 text-[14px] leading-relaxed text-ink-1">
            <div className="flex items-start gap-3">
              <span className="text-accent-teal font-semibold min-w-[60px]">1. Start</span>
              <span className="text-ink-2">Compose research question + select skills</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent-amber font-semibold min-w-[60px]">2. Execute</span>
              <span className="text-ink-2">Skills run in parallel, stream results live</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent font-semibold min-w-[60px]">3. Synthesize</span>
              <span className="text-ink-2">Claude reconciles, cites, produces final deliverable</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent-rose font-semibold min-w-[60px]">4. Publish</span>
              <span className="text-ink-2">Save to wiki or iterate with Rebuild/New Build</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent-hot font-semibold min-w-[60px]">5. Repeat</span>
              <span className="text-ink-2">Build a knowledge base incrementally</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
