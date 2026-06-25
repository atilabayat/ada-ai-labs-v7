import Link from "next/link";
import { PageInner, PageHead } from "@/components/ui";

const guides = [
  {
    id: "prompt-composer",
    title: "Prompt Composer & Orchestration",
    subtitle: "Building Research Knowledge Bases Through Skill Stacking",
    description: "Comprehensive guide to composing research workflows, stacking skills effectively, and building curated research knowledge bases.",
    icon: "📋",
    sections: 12,
  },
  {
    id: "prompt-composer-advanced",
    title: "Prompt User Guide — Advanced Users",
    subtitle: "Research & Knowledge Engineering with the Full Skill Taxonomy",
    description: "Advanced guide covering the complete 60-skill taxonomy, knowledge engineering pipelines, humanities and quant research architectures, LLM Council synthesis, wiki knowledge bases, and NotebookLM integration.",
    icon: "⚗️",
    sections: 12,
  },
  {
    id: "quant-skills",
    title: "Quant Skills Guide",
    subtitle: "All 25 Quant Skills — What They Do and How They Layer Together",
    description: "General guide to all quant skills across the Embedded KB, core Quant, SPY/SPX, and TSLA groups. Covers data infrastructure, regime classification, gamma exposure, liquidity detection, options pricing, trade strategy generation, and governance.",
    icon: "γ",
    sections: 12,
  },
];

export default function GuidesPage() {
  return (
    <PageInner>
      <PageHead
        tag="System User Guides"
        title="Documentation"
        em="& Tutorials"
        sub="Professional guides for researchers. Learn to use ADA AI Labs' core facilities for knowledge synthesis and research orchestration."
      />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-4">
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/guides/${guide.id}`}
            className="group rounded-[12px] border border-line bg-gradient-to-br from-bg-2 to-bg-1 p-6 transition-all hover:border-accent hover:shadow-[0_0_20px_rgba(77,141,255,0.1)]"
          >
            <div className="mb-4 text-4xl">{guide.icon}</div>
            <h3 className="mb-1 text-[16px] font-semibold text-ink-0 group-hover:text-accent transition-colors">
              {guide.title}
            </h3>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
              {guide.sections} sections
            </p>
            <p className="text-[13px] leading-relaxed text-ink-2">{guide.description}</p>
            <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-accent group-hover:translate-x-1 transition-transform">
              <span>Read guide</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </PageInner>
  );
}
