import { NextRequest, NextResponse } from "next/server";
import { parseExcelBuffer } from "@/lib/excel-parser";
import { setData } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json({ error: "File must be .xlsx or .xls" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = parseExcelBuffer(buffer);

    // Update the in-memory store with any non-empty datasets
    const updateData: Record<string, unknown> = { source: "uploaded" };

    if (result.products.length > 0) updateData.products = result.products;
    if (result.stores.length > 0) updateData.stores = result.stores;
    if (result.purchaseHistory.length > 0) updateData.purchaseHistory = result.purchaseHistory;
    if (result.promotions.length > 0) updateData.promotions = result.promotions;

    setData(updateData);

    return NextResponse.json({
      success: true,
      counts: {
        products: result.products.length,
        stores: result.stores.length,
        purchaseHistory: result.purchaseHistory.length,
        promotions: result.promotions.length,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process file" },
      { status: 500 }
    );
  }
}
