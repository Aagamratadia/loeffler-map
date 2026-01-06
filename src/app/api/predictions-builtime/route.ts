import { NextResponse } from "next/server";
import { z } from "zod";
import { getMongoClient } from "@/lib/mongodb";
import predictionsData from "../../../../public/predictions.json";

const predictionSchema = z.object({
  tool: z.string().min(1),
  inputs: z.record(z.any()).default({}),
  metadata: z.record(z.any()).optional(),
});

export const dynamic = "force-dynamic";

// Load predictions into memory once
const PREDICTIONS_MAP = new Map();

function initializePredictions() {
  if (PREDICTIONS_MAP.size === 0 && predictionsData) {
    predictionsData.forEach((item: any) => {
      const key = JSON.stringify(item.profile);
      PREDICTIONS_MAP.set(key, {
        preferred_drugs: item.preferred_drugs,
        contraindicated_drugs: item.contraindicated_drugs,
      });
    });
  }
}

function findClosestPrediction(
  inputs: Record<string, number>
): {
  preferred_drugs: string[];
  contraindicated_drugs: string[];
} | null {
  /**
   * Find the closest matching pre-computed prediction.
   * Uses Euclidean distance to find similar patient profiles.
   */

  if (!predictionsData || predictionsData.length === 0) {
    return null;
  }

  let closest = null;
  let minDistance = Infinity;

  for (const item of predictionsData) {
    const profile = item.profile;

    // Calculate Euclidean distance
    let distance = 0;
    for (const key in inputs) {
      if (key in profile) {
        distance += Math.pow(
          (inputs[key] as number) - (profile[key as keyof typeof profile] as number),
          2
        );
      }
    }
    distance = Math.sqrt(distance);

    if (distance < minDistance) {
      minDistance = distance;
      closest = {
        preferred_drugs: item.preferred_drugs,
        contraindicated_drugs: item.contraindicated_drugs,
      };
    }
  }

  return closest;
}

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
 * Returns pre-computed predictions based on patient features.
 * Uses build-time ML inference (no Python at runtime).
 *
 * Works on Vercel!
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
    let result = null;

    // For antihypertensive recommendations
    if (
      tool === "antihypertensive-recommender" ||
      tool === "drug-dosing"
    ) {
      // Find closest matching pre-computed prediction
      result = findClosestPrediction(inputs as Record<string, number>);

      if (!result) {
        return NextResponse.json(
          {
            error: "No matching prediction found",
            message:
              "Could not find a similar patient profile in the prediction database",
          },
          { status: 404 }
        );
      }

      // Add confidence based on how close the match was
      result = {
        ...result,
        success: true,
        note: "Predictions pre-computed at build time",
      };
    } else {
      result = {
        message: `Tool '${tool}' not yet implemented`,
      };
    }

    // Log to MongoDB (optional)
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
      // Continue even if logging fails
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
