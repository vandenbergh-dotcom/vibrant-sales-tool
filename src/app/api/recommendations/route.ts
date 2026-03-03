import { NextRequest, NextResponse } from "next/server";
import { getStoreRecommendations } from "@/lib/recommendation-engine";

export async function POST(request: NextRequest) {
  try {
    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: "storeId is required" }, { status: 400 });
    }

    const recommendations = await getStoreRecommendations(storeId);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
