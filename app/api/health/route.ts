import { NextResponse } from "next/server";
import { healthCheck } from "@/lib/embeddings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const qdrantOk = await healthCheck();
  return NextResponse.json({ qdrant: qdrantOk ? "ready" : "down" });
}
