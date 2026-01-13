import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * DELETE /api/predictions/[id]
 *
 * Deletes a single prediction by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid prediction ID" },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const dbName = process.env.MONGODB_DB || "loeffler";
    const collectionName = process.env.MONGODB_COLLECTION || "predictions";
    const collection = client.db(dbName).collection(collectionName);

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Prediction deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete prediction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
