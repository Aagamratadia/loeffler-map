import { NextResponse } from "next/server";
import { z } from "zod";
import { getMongoClient } from "@/lib/mongodb";
import { callMLInference, isModelAvailable } from "@/lib/ml-inference";

const predictionSchema = z.object({
  tool: z.string().min(1),
  inputs: z.record(z.any()).default({}),
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

/**
 * POST /api/predictions
 *
 * Handles drug recommendation predictions using local Python ML model.
 *
 * Request body:
 * {
 *   "tool": "antihypertensive-recommender",
 *   "inputs": { patient features },
 *   "metadata": { optional additional data }
 * }
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = predictionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { tool, inputs, metadata } = parsed.data;

  try {
    let result: any = null;

    // For antihypertensive drug recommendations, use ML model
    if (
      tool === "antihypertensive-recommender" ||
      tool === "drug-dosing"
    ) {
      // Check if model is available
      if (!isModelAvailable()) {
        return NextResponse.json(
          {
            error: "ML model not available",
            message:
              "The model has not been trained yet. Please run: python scripts/train_model.py --data <dataset.csv>",
          },
          { status: 503 }
        );
      }

      try {
        // Call Python ML inference
        result = await callMLInference(inputs);
      } catch (mlError) {
        console.error("ML inference failed:", mlError);
        return NextResponse.json(
          {
            error: "ML prediction failed",
            message:
              mlError instanceof Error
                ? mlError.message
                : "Unknown error",
          },
          { status: 500 }
        );
      }
    } else {
      // For other tools, return placeholder
      result = {
        message: `Tool '${tool}' not yet implemented`,
      };
    }

    // Log to MongoDB
    try {
      const client = await getMongoClient();
      const dbName = process.env.MONGODB_DB || "loeffler";
      const collectionName =
        process.env.MONGODB_COLLECTION || "predictions";
      const collection = client.db(dbName).collection(collectionName);

      await collection.insertOne({
        tool,
        inputs,
        result,
        metadata,
        createdAt: new Date(),
        timestamp: new Date().toISOString(),
      });
    } catch (dbError) {
      console.warn("Failed to log to MongoDB:", dbError);
      // Still return result even if logging fails
    }

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
