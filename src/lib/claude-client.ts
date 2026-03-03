import Anthropic from "@anthropic-ai/sdk";
import {
  Store,
  Product,
  PurchaseRecord,
  Promotion,
  StoreRecommendations,
  RecommendedProduct,
} from "./types";
import { getCurrentSeason, getUpcomingEvents, SEASON_LABELS } from "./constants";

// ---------------------------------------------------------------------------
// Anthropic client (singleton)
// ---------------------------------------------------------------------------

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Tool definition — structured output via tool_use
// ---------------------------------------------------------------------------

const recommendationTool: Anthropic.Tool = {
  name: "generate_store_recommendations",
  description:
    "Generate personalized product recommendations for a store visit",
  input_schema: {
    type: "object" as const,
    properties: {
      salesperson_tips: {
        type: "string",
        description:
          "1-2 sentence opening tip for approaching this store owner",
      },
      win_back: {
        type: "array",
        items: {
          type: "object",
          properties: {
            product_id: { type: "string" },
            reason: { type: "string" },
            priority: { type: "string", enum: ["high", "medium", "low"] },
            estimated_order_value: { type: "number" },
          },
          required: [
            "product_id",
            "reason",
            "priority",
            "estimated_order_value",
          ],
        },
      },
      cross_sell: {
        type: "array",
        items: {
          type: "object",
          properties: {
            product_id: { type: "string" },
            reason: { type: "string" },
            priority: { type: "string", enum: ["high", "medium", "low"] },
            estimated_order_value: { type: "number" },
            complementary_to: { type: "array", items: { type: "string" } },
          },
          required: [
            "product_id",
            "reason",
            "priority",
            "estimated_order_value",
          ],
        },
      },
      promotions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            product_id: { type: "string" },
            promotion_id: { type: "string" },
            reason: { type: "string" },
            priority: { type: "string", enum: ["high", "medium", "low"] },
            estimated_order_value: { type: "number" },
          },
          required: [
            "product_id",
            "reason",
            "priority",
            "estimated_order_value",
          ],
        },
      },
      seasonal: {
        type: "array",
        items: {
          type: "object",
          properties: {
            product_id: { type: "string" },
            reason: { type: "string" },
            priority: { type: "string", enum: ["high", "medium", "low"] },
            estimated_order_value: { type: "number" },
          },
          required: [
            "product_id",
            "reason",
            "priority",
            "estimated_order_value",
          ],
        },
      },
    },
    required: [
      "salesperson_tips",
      "win_back",
      "cross_sell",
      "promotions",
      "seasonal",
    ],
  },
};

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildSystemPrompt(): string {
  const season = getCurrentSeason();
  const events = getUpcomingEvents();

  return `You are a field sales recommendation engine for Vibrant Foods, a leading UK distributor of South Asian food products. Vibrant Foods' brand portfolio includes TRS, East End, Cofresh, and Fudco.

Your job is to analyse a store's purchase history and profile, then produce actionable, prioritised product recommendations that a field sales representative can use during their next store visit.

## Context
- Current season: ${SEASON_LABELS[season]} (${season})
- Upcoming events / seasons: ${events.length > 0 ? events.join(", ") : "None"}

## Recommendation guidelines
1. **Win-back**: Products the store previously purchased but has lapsed on. Prioritise high-margin and high-volume items first. Provide a concise, persuasive reason the store should restock.
2. **Cross-sell**: Products from categories the store already buys that complement their existing range. Reference what they already stock so the rep can position the suggestion naturally.
3. **Promotions**: Products with active promotions that are relevant to this store. Lead with the deal value to the store owner.
4. **Seasonal**: Products that align with the current or upcoming season/events, especially ones suited to this store's customer base and region.

## Output rules
- Recommend a maximum of 5 items per category (win_back, cross_sell, promotions, seasonal).
- Each recommendation MUST reference a valid product_id from the provided catalogue.
- estimated_order_value should be a realistic GBP value based on the product's case price and a sensible reorder quantity for the store's size.
- priority must be "high", "medium", or "low".
- salesperson_tips should be practical and specific to this store owner — mention their name, store type, or previous buying patterns.
- Keep reasons concise (1-2 sentences max).
- Use the generate_store_recommendations tool to return your response.`;
}

function buildUserPrompt(params: {
  store: Store;
  purchaseHistory: PurchaseRecord[];
  lapsedProducts: Array<{
    product: Product;
    lastPurchased: string;
    daysSincePurchase: number;
  }>;
  categoryGaps: string[];
  eligiblePromotions: Array<{ promotion: Promotion; relevantProducts: Product[] }>;
  productCatalog: Product[];
}): string {
  const {
    store,
    purchaseHistory,
    lapsedProducts,
    categoryGaps,
    eligiblePromotions,
    productCatalog,
  } = params;

  // --- Store profile -------------------------------------------------------
  const storeSection = `## Store Profile
- Name: ${store.name}
- Owner: ${store.ownerName}
- Type: ${store.storeType} (${store.size})
- Region: ${store.region} — ${store.city}, ${store.postcode}
- Preferred language: ${store.preferredLanguage}
- Last visit: ${store.lastVisitDate ?? "unknown"}
- Notes: ${store.notes ?? "none"}`;

  // --- Aggregated purchase history ------------------------------------------
  const historyByProduct = new Map<
    string,
    { productId: string; totalQty: number; totalValue: number; dates: string[] }
  >();
  for (const record of purchaseHistory) {
    const existing = historyByProduct.get(record.productId);
    if (existing) {
      existing.totalQty += record.quantity;
      existing.totalValue += record.totalValue;
      existing.dates.push(record.date);
    } else {
      historyByProduct.set(record.productId, {
        productId: record.productId,
        totalQty: record.quantity,
        totalValue: record.totalValue,
        dates: [record.date],
      });
    }
  }

  const purchaseSummaryLines = Array.from(historyByProduct.values())
    .sort((a, b) => b.totalValue - a.totalValue)
    .map((h) => {
      const product = productCatalog.find((p) => p.id === h.productId);
      const name = product ? `${product.brand} ${product.name}` : h.productId;
      const lastDate = h.dates.sort().reverse()[0];
      return `- ${name} (${h.productId}): ${h.totalQty} units, £${h.totalValue.toFixed(2)} total, last ordered ${lastDate}`;
    });

  const purchaseSection = `## Purchase History (aggregated)
${purchaseSummaryLines.length > 0 ? purchaseSummaryLines.join("\n") : "No purchase history available."}`;

  // --- Lapsed products ------------------------------------------------------
  const lapsedLines = lapsedProducts
    .sort((a, b) => b.daysSincePurchase - a.daysSincePurchase)
    .map(
      (l) =>
        `- ${l.product.brand} ${l.product.name} (${l.product.id}): last purchased ${l.lastPurchased} (${l.daysSincePurchase} days ago), case price £${l.product.casePrice.toFixed(2)}`
    );

  const lapsedSection = `## Lapsed Products (previously bought, not reordered in 90+ days)
${lapsedLines.length > 0 ? lapsedLines.join("\n") : "No lapsed products identified."}`;

  // --- Category gaps --------------------------------------------------------
  const gapsSection = `## Category Gaps (categories this store has never purchased)
${categoryGaps.length > 0 ? categoryGaps.map((c) => `- ${c}`).join("\n") : "Store has purchased from all categories."}`;

  // --- Eligible promotions --------------------------------------------------
  const promoLines = eligiblePromotions.map((ep) => {
    const prodNames = ep.relevantProducts
      .map((p) => `${p.brand} ${p.name} (${p.id})`)
      .join(", ");
    return `- ${ep.promotion.name} (${ep.promotion.id}): ${ep.promotion.discountDescription}. Products: ${prodNames}. Valid ${ep.promotion.startDate}–${ep.promotion.endDate}.${ep.promotion.minimumOrder ? ` Min order: ${ep.promotion.minimumOrder} cases.` : ""}`;
  });

  const promoSection = `## Eligible Promotions
${promoLines.length > 0 ? promoLines.join("\n") : "No promotions currently eligible for this store."}`;

  // --- Product catalogue (active only) -------------------------------------
  const catalogLines = productCatalog
    .filter((p) => p.isActive)
    .map(
      (p) =>
        `- ${p.id}: ${p.brand} ${p.name} | ${p.category} > ${p.subcategory} | ${p.size} | case of ${p.caseSize} @ £${p.casePrice.toFixed(2)}${p.seasonalRelevance ? ` | seasons: ${p.seasonalRelevance.join(", ")}` : ""}`
    );

  const catalogSection = `## Product Catalogue
${catalogLines.join("\n")}`;

  return [
    storeSection,
    purchaseSection,
    lapsedSection,
    gapsSection,
    promoSection,
    catalogSection,
    "\nAnalyse the above data and generate store visit recommendations using the generate_store_recommendations tool.",
  ].join("\n\n");
}

// ---------------------------------------------------------------------------
// Main API call
// ---------------------------------------------------------------------------

export async function generateRecommendations(params: {
  store: Store;
  purchaseHistory: PurchaseRecord[];
  lapsedProducts: Array<{
    product: Product;
    lastPurchased: string;
    daysSincePurchase: number;
  }>;
  categoryGaps: string[];
  eligiblePromotions: Array<{ promotion: Promotion; relevantProducts: Product[] }>;
  productCatalog: Product[];
}): Promise<StoreRecommendations> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(params);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    tools: [recommendationTool],
    tool_choice: { type: "tool", name: "generate_store_recommendations" },
    messages: [{ role: "user", content: userPrompt }],
  });

  // Extract the tool use block from the response
  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUseBlock) {
    throw new Error(
      "Claude did not return a tool_use block. Unable to parse recommendations."
    );
  }

  const raw = toolUseBlock.input as {
    salesperson_tips: string;
    win_back: Array<{
      product_id: string;
      reason: string;
      priority: "high" | "medium" | "low";
      estimated_order_value: number;
    }>;
    cross_sell: Array<{
      product_id: string;
      reason: string;
      priority: "high" | "medium" | "low";
      estimated_order_value: number;
      complementary_to?: string[];
    }>;
    promotions: Array<{
      product_id: string;
      promotion_id?: string;
      reason: string;
      priority: "high" | "medium" | "low";
      estimated_order_value: number;
    }>;
    seasonal: Array<{
      product_id: string;
      reason: string;
      priority: "high" | "medium" | "low";
      estimated_order_value: number;
    }>;
  };

  // Build a product lookup for enrichment
  const productMap = new Map(params.productCatalog.map((p) => [p.id, p]));
  const lapsedMap = new Map(
    params.lapsedProducts.map((l) => [l.product.id, l])
  );
  const promotionMap = new Map(
    params.eligiblePromotions.flatMap((ep) =>
      ep.relevantProducts.map((p) => [
        p.id,
        { name: ep.promotion.name, discount: ep.promotion.discountDescription },
      ])
    )
  );

  function toRecommendedProduct(
    item: {
      product_id: string;
      reason: string;
      priority: "high" | "medium" | "low";
      estimated_order_value: number;
      complementary_to?: string[];
      promotion_id?: string;
    },
    category: "win_back" | "cross_sell" | "promotions" | "seasonal"
  ): RecommendedProduct {
    const product = productMap.get(item.product_id);
    const lapsed = lapsedMap.get(item.product_id);
    const promo = promotionMap.get(item.product_id);

    return {
      productId: item.product_id,
      productName: product ? product.name : item.product_id,
      brand: product ? product.brand : "TRS",
      category: product ? product.category : "Spices",
      reason: item.reason,
      priority: item.priority,
      estimatedValue: item.estimated_order_value,
      ...(category === "promotions" && promo ? { promotion: promo } : {}),
      ...(lapsed
        ? {
            lastPurchased: lapsed.lastPurchased,
            daysLapsed: lapsed.daysSincePurchase,
          }
        : {}),
      ...(item.complementary_to && item.complementary_to.length > 0
        ? { complementaryTo: item.complementary_to }
        : {}),
    };
  }

  return {
    storeId: params.store.id,
    storeName: params.store.name,
    generatedAt: new Date().toISOString(),
    salespersonTips: raw.salesperson_tips,
    winBack: raw.win_back.map((item) =>
      toRecommendedProduct(item, "win_back")
    ),
    crossSell: raw.cross_sell.map((item) =>
      toRecommendedProduct(item, "cross_sell")
    ),
    promotions: raw.promotions.map((item) =>
      toRecommendedProduct(item, "promotions")
    ),
    seasonal: raw.seasonal.map((item) =>
      toRecommendedProduct(item, "seasonal")
    ),
  };
}
