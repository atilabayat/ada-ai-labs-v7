import { QdrantClient } from "@qdrant/js-client-rest";
import { VoyageAIClient } from "voyageai";

const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
});

const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY ?? "",
});

const EMBEDDING_MODEL = "voyage-3";
const VECTOR_SIZE = 1024; // voyage-3 output dimension

export async function embedText(text: string): Promise<number[]> {
  if (!process.env.VOYAGE_API_KEY) {
    // Graceful fallback during local dev when key is unset
    console.warn("embedText: VOYAGE_API_KEY not set — returning zero vector");
    return new Array(VECTOR_SIZE).fill(0);
  }
  try {
    const response = await voyage.embed({
      input: [text],
      model: EMBEDDING_MODEL,
    });
    const embedding = response.data?.[0]?.embedding;
    if (!embedding) throw new Error("No embedding returned from Voyage AI");
    return embedding;
  } catch (error) {
    console.error("Embedding error:", error);
    throw new Error(`Failed to embed text: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function ensureCollection(collectionName: string) {
  try {
    const collections = await client.getCollections();
    const exists = collections.collections.some((c) => c.name === collectionName);

    if (!exists) {
      console.log(`Creating collection: ${collectionName}`);
      await client.createCollection(collectionName, {
        vectors: { size: VECTOR_SIZE, distance: "Cosine" as const },
      });
      console.log(`✓ Collection ${collectionName} created`);
    } else {
      console.log(`✓ Collection ${collectionName} exists`);
    }
  } catch (error) {
    console.error(`Error ensuring collection ${collectionName}:`, error);
    throw error;
  }
}

export async function addPoint(
  collectionName: string,
  id: number,
  vector: number[],
  payload: Record<string, unknown>
) {
  try {
    await client.upsert(collectionName, {
      points: [{ id, vector, payload }],
    });
  } catch (error) {
    console.error(`Error adding point to ${collectionName}:`, error);
    throw error;
  }
}

export async function searchSimilar(
  collectionName: string,
  queryVector: number[],
  limit: number = 5
): Promise<Array<{ id: number; score: number; payload: Record<string, unknown> }>> {
  try {
    const results = await client.search(collectionName, {
      vector: queryVector,
      limit,
      with_payload: true,
    });

    return results.map((result) => ({
      id: result.id as number,
      score: result.score,
      payload: result.payload || {},
    }));
  } catch (error) {
    console.error(`Error searching ${collectionName}:`, error);
    throw error;
  }
}

export async function search(
  collectionName: string,
  query: string,
  limit: number = 5
): Promise<Array<{ id: number; score: number; payload: Record<string, unknown> }>> {
  try {
    const queryVector = await embedText(query);
    return await searchSimilar(collectionName, queryVector, limit);
  } catch (error) {
    console.error(`Error in search:`, error);
    throw error;
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const health = await client.getCollections();
    return !!health;
  } catch (error) {
    console.error("Qdrant health check failed:", error);
    return false;
  }
}
