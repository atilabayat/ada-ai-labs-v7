import { NextRequest, NextResponse } from "next/server";
import { getRelatedKnowledge } from "@/lib/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }
  try {
    const data = await getRelatedKnowledge(id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/knowledge/[id]/related]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
