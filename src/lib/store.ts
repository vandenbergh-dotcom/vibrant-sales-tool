import { AppData, Product, Store, PurchaseRecord, Promotion } from "./types";

// Server-side in-memory data store (singleton)
let appData: AppData = {
  products: [],
  stores: [],
  purchaseHistory: [],
  promotions: [],
  isLoaded: false,
  source: "demo",
};

export function getData(): AppData {
  return appData;
}

export function setData(data: Partial<AppData>): void {
  appData = { ...appData, ...data, isLoaded: true, loadedAt: new Date().toISOString() };
}

export function isDataLoaded(): boolean {
  return appData.isLoaded && appData.products.length > 0;
}

export async function ensureDemoData(): Promise<AppData> {
  if (isDataLoaded()) return appData;

  // Dynamic imports for demo data
  const products = (await import("@/data/demo/products.json")).default as Product[];
  const stores = (await import("@/data/demo/stores.json")).default as Store[];
  const purchaseHistory = (await import("@/data/demo/purchase-history.json")).default as PurchaseRecord[];
  const promotions = (await import("@/data/demo/promotions.json")).default as Promotion[];

  setData({
    products,
    stores,
    purchaseHistory,
    promotions,
    source: "demo",
  });

  return appData;
}

export function resetToDemo(): void {
  appData = {
    products: [],
    stores: [],
    purchaseHistory: [],
    promotions: [],
    isLoaded: false,
    source: "demo",
  };
}
