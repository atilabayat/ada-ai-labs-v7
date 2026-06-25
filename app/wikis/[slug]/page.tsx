import { notFound } from "next/navigation";
import WikiReader from "@/components/wiki/WikiReader";
import { getWiki, getWikiSlugMap } from "@/lib/queries";

// Wikis are database-driven, user-generated content that changes at runtime.
// They must render on-demand (SSR) per request — never be statically
// pre-generated. Static generation here spawned jest-workers that crashed
// under concurrent build load, corrupting the worker pool and cascading 500s
// into the build-stream route. force-dynamic keeps every wiki page fresh and
// isolates it from the static-generation worker pool entirely.
export const dynamic = "force-dynamic";

// Even with force-dynamic, Next's dev server runs a "generate static paths"
// collection pass for this [slug] segment in a jest-worker child process.
// With many large DB-backed wikis that pass crashes the worker ("Jest worker
// encountered child process exceptions"), which poisons the shared worker pool
// and cascades 500s to every wiki page. Returning an empty param list tells
// Next there is nothing to pre-generate, so it skips that worker pass entirely
// and renders each wiki on-demand (dynamicParams defaults to true).
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wiki = await getWiki(slug);
  return {
    title: wiki ? `${wiki.title} — ADA AI Labs Wiki` : "Wiki — ADA AI Labs",
  };
}

export default async function WikiReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [wiki, slugMap] = await Promise.all([getWiki(slug), getWikiSlugMap()]);
  if (!wiki) notFound();
  return <WikiReader wiki={wiki} slug={slug} slugMap={slugMap} />;
}
