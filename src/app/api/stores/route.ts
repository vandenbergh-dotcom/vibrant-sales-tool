import { NextResponse } from "next/server";
import { ensureDemoData } from "@/lib/store";
import { StoreWithStats } from "@/lib/types";

export async function GET() {
  try {
    const data = await ensureDemoData();

    const storesWithStats: StoreWithStats[] = data.stores.map(store => {
      const storeHistory = data.purchaseHistory.filter(p => p.storeId === store.id);
      const productIds = new Set(storeHistory.map(p => p.productId));
      const categories = new Set(
        storeHistory
          .map(p => data.products.find(prod => prod.id === p.productId)?.category)
          .filter(Boolean) as string[]
      );

      const dates = storeHistory.map(p => p.date).sort();

      return {
        ...store,
        totalOrders: storeHistory.length,
        totalRevenue: storeHistory.reduce((sum, p) => sum + p.totalValue, 0),
        lastOrderDate: dates[dates.length - 1],
        topCategories: Array.from(categories).slice(0, 3),
        productCount: productIds.size,
      };
    });

    // Sort by name
    storesWithStats.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      stores: storesWithStats,
      meta: {
        total: storesWithStats.length,
        source: data.source,
        loadedAt: data.loadedAt,
      },
    });
  } catch (error) {
    console.error("Stores API error:", error);
    return NextResponse.json({ error: "Failed to load stores" }, { status: 500 });
  }
}
