import { NextResponse } from "next/server";
import { z } from "zod";
import { getMongoClient } from "@/lib/mongodb";

const predictionSchema = z.object({
  tool: z.string().min(1),
  inputs: z.record(z.any()).default({}),
  result: z.any(),
  metadata: z.record(z.any()).optional(),
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await getMongoClient();
    const dbName = process.env.MONGODB_DB || "loeffler";
    const collectionName = process.env.MONGODB_COLLECTION || "predictions";
    const collection = client.db(dbName).collection(collectionName);

    const predictions = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Failed to fetch predictions", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = predictionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { tool, inputs, result, metadata } = parsed.data;

  try {
    const client = await getMongoClient();
    const dbName = process.env.MONGODB_DB || "loeffler";
    const collectionName = process.env.MONGODB_COLLECTION || "predictions";
    const collection = client.db(dbName).collection(collectionName);

    const insertResult = await collection.insertOne({
      tool,
      inputs,
      result,
      metadata,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: insertResult.insertedId });
  } catch (error) {
    console.error("Failed to persist prediction", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
