import { NextRequest } from "next/server";
import { runBuild } from "@/lib/skills/orchestrator";

// Long-lived response — needs the node runtime, not edge (Prisma).
export const runtime = "nodejs";
// Disable any caching at the route level.
export const dynamic = "force-dynamic";
// Increase the max duration so long builds don't time out.
export const maxDuration = 120;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: buildId } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // SSE preamble — flush an initial comment so browsers open the channel
      // immediately even before the first real event arrives.
      controller.enqueue(encoder.encode(`: open\n\n`));

      try {
        for await (const event of runBuild(buildId)) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        }
        // runBuild already calls onBuildComplete internally, so no
        // additional call here to avoid duplicate embedding work.
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const err = { type: "error", message: msg };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(err)}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
