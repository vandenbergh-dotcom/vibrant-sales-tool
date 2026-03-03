import { NextRequest, NextResponse } from "next/server";
import { ensureDemoData, getData, resetToDemo } from "@/lib/store";

export async function GET() {
  try {
    const data = await ensureDemoData();

    return NextResponse.json({
      products: data.products.length,
      stores: data.stores.length,
      purchaseHistory: data.purchaseHistory.length,
      promotions: data.promotions.length,
      source: data.source,
      loadedAt: data.loadedAt,
      isLoaded: data.isLoaded,
    });
  } catch (error) {
    console.error("Data API error:", error);
    return NextResponse.json({ error: "Failed to get data status" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, password } = await request.json();

    // Simple password check
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";
    if (password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    if (action === "reset") {
      resetToDemo();
      const data = await ensureDemoData();
      return NextResponse.json({
        success: true,
        message: "Reset to demo data",
        counts: {
          products: data.products.length,
          stores: data.stores.length,
          purchaseHistory: data.purchaseHistory.length,
          promotions: data.promotions.length,
        },
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Data API error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
