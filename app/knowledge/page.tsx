import { PageInner, PageHead } from "@/components/ui";
import { getAppsMap, getKnowledgeGraph, getWikiTitlesMap } from "@/lib/queries";
import KnowledgeGraph from "./KnowledgeGraph";

export default async function KnowledgePage() {
  const [{ nodes, edges, legend, stats }, appsMap, wikiTitlesMap] =
    await Promise.all([getKnowledgeGraph(), getAppsMap(), getWikiTitlesMap()]);

  const statCards = [
    { label: "Entities",   value: stats.entities.toLocaleString(), delta: "+142 today",     accent: "bg-accent-violet" },
    { label: "Edges",      value: stats.edges.toLocaleString(),    delta: "+418 today",     accent: "bg-accent" },
    { label: "Embeddings", value: stats.embeddings,                delta: "qdrant healthy", accent: "bg-accent-teal" },
  ];

  return (
    <PageInner>
      <PageHead
        tag="Knowledge Graph"
        tone="violet"
        title="Entity"
        em="relationships."
        sub="Semantic links across research, tickers, frameworks, and concepts. Click a node to drill into its supporting wiki, sources, and downstream applications."
      />

      <KnowledgeGraph
        nodes={nodes}
        edges={edges}
        legend={legend}
        appsMap={appsMap}
        wikiTitlesMap={wikiTitlesMap}
      />

      <div className="mt-5 grid grid-cols-3 gap-[14px] max-[700px]:grid-cols-1">
        {statCards.map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-[10px] border border-line bg-bg-1 px-[18px] py-4">
            <span className={`absolute left-0 top-0 h-[2px] w-full opacity-50 ${s.accent}`} />
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">{s.label}</div>
            <div className="mb-[6px] font-display text-[32px] font-medium leading-none tracking-tight">{s.value}</div>
            <div className="font-mono text-[10px] text-accent-teal">{s.delta}</div>
          </div>
        ))}
      </div>
    </PageInner>
  );
}
