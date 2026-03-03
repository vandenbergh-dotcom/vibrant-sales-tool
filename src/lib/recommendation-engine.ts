import { ensureDemoData } from "./store";
import { generateRecommendations } from "./claude-client";
import {
  StoreRecommendations,
  Product,
  PurchaseRecord,
  Promotion,
  ProductCategory,
  UKRegion,
} from "./types";
import { daysSince } from "./utils";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getStoreRecommendations(
  storeId: string
): Promise<StoreRecommendations> {
  const data = await ensureDemoData();

  const store = data.stores.find((s) => s.id === storeId);
  if (!store) throw new Error(`Store ${storeId} not found`);

  const storeHistory = data.purchaseHistory.filter(
    (p) => p.storeId === storeId
  );

  // 1. Compute lapsed products
  const lapsedProducts = computeLapsedProducts(storeHistory, data.products);

  // 2. Compute category gaps
  const categoryGaps = computeCategoryGaps(storeHistory, data.products);

  // 3. Find eligible promotions
  const eligiblePromotions = findEligiblePromotions(
    store.region,
    data.promotions,
    data.products
  );

  // 4. Call Claude
  const recommendations = await generateRecommendations({
    store,
    purchaseHistory: storeHistory,
    lapsedProducts,
    categoryGaps,
    eligiblePromotions,
    productCatalog: data.products,
  });

  return recommendations;
}

// ---------------------------------------------------------------------------
// Helper: Compute lapsed products
// ---------------------------------------------------------------------------

/**
 * A product is considered "lapsed" when:
 * - The store purchased it at some point (appears in their history)
 * - The most recent purchase was more than 90 days ago
 *
 * Returns the product details alongside the last purchase date and the
 * number of days since that purchase.
 */
function computeLapsedProducts(
  storeHistory: PurchaseRecord[],
  products: Product[]
): Array<{ product: Product; lastPurchased: string; daysSincePurchase: number }> {
  // Group history by productId and find the most recent purchase date
  const lastPurchaseByProduct = new Map<string, string>();

  for (const record of storeHistory) {
    const existing = lastPurchaseByProduct.get(record.productId);
    if (!existing || record.date > existing) {
      lastPurchaseByProduct.set(record.productId, record.date);
    }
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const lapsed: Array<{
    product: Product;
    lastPurchased: string;
    daysSincePurchase: number;
  }> = [];

  for (const [productId, lastDate] of lastPurchaseByProduct.entries()) {
    const daysSinceLastPurchase = daysSince(lastDate);

    if (daysSinceLastPurchase > 90) {
      const product = productMap.get(productId);
      if (product && product.isActive) {
        lapsed.push({
          product,
          lastPurchased: lastDate,
          daysSincePurchase: daysSinceLastPurchase,
        });
      }
    }
  }

  // Sort by most lapsed first (highest days since purchase)
  return lapsed.sort((a, b) => b.daysSincePurchase - a.daysSincePurchase);
}

// ---------------------------------------------------------------------------
// Helper: Compute category gaps
// ---------------------------------------------------------------------------

/**
 * Returns product categories that the store has NEVER purchased from.
 * Compares the set of categories present in the store's purchase history
 * against all categories available in the product catalogue.
 */
function computeCategoryGaps(
  storeHistory: PurchaseRecord[],
  products: Product[]
): string[] {
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Collect categories the store has purchased
  const purchasedCategories = new Set<ProductCategory>();
  for (const record of storeHistory) {
    const product = productMap.get(record.productId);
    if (product) {
      purchasedCategories.add(product.category);
    }
  }

  // Collect all categories available in the active catalogue
  const allCategories = new Set<ProductCategory>();
  for (const product of products) {
    if (product.isActive) {
      allCategories.add(product.category);
    }
  }

  // Gap = available categories minus purchased categories
  const gaps: string[] = [];
  for (const category of allCategories) {
    if (!purchasedCategories.has(category)) {
      gaps.push(category);
    }
  }

  return gaps.sort();
}

// ---------------------------------------------------------------------------
// Helper: Find eligible promotions
// ---------------------------------------------------------------------------

/**
 * A promotion is eligible for a store when:
 * 1. It is currently active (isActive === true)
 * 2. Its date range includes today
 * 3. Its scope is either:
 *    - "all_stores" (available everywhere), OR
 *    - "region" AND the promotion's region matches the store's region
 *
 * For each eligible promotion we also resolve the relevant product objects.
 */
function findEligiblePromotions(
  storeRegion: UKRegion,
  promotions: Promotion[],
  products: Product[]
): Array<{ promotion: Promotion; relevantProducts: Product[] }> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const productMap = new Map(products.map((p) => [p.id, p]));

  const eligible: Array<{ promotion: Promotion; relevantProducts: Product[] }> =
    [];

  for (const promo of promotions) {
    // Must be active
    if (!promo.isActive) continue;

    // Must be within date range
    if (promo.startDate > today || promo.endDate < today) continue;

    // Scope check
    const scopeMatch =
      promo.scope === "all_stores" ||
      (promo.scope === "region" && promo.region === storeRegion);

    if (!scopeMatch) continue;

    // Resolve products
    const relevantProducts: Product[] = [];
    for (const pid of promo.productIds) {
      const product = productMap.get(pid);
      if (product && product.isActive) {
        relevantProducts.push(product);
      }
    }

    // Only include if there is at least one active product
    if (relevantProducts.length > 0) {
      eligible.push({ promotion: promo, relevantProducts });
    }
  }

  return eligible;
}
