import * as XLSX from "xlsx";
import { Product, Store, PurchaseRecord, Promotion } from "./types";

export interface ParseResult {
  products: Product[];
  stores: Store[];
  purchaseHistory: PurchaseRecord[];
  promotions: Promotion[];
  errors: string[];
}

export function parseExcelBuffer(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const errors: string[] = [];

  let products: Product[] = [];
  let stores: Store[] = [];
  let purchaseHistory: PurchaseRecord[] = [];
  let promotions: Promotion[] = [];

  // Try to find sheets by name (case-insensitive)
  const sheetNames = workbook.SheetNames;

  const productsSheet = findSheet(sheetNames, ["Products", "Product", "product", "products"]);
  const storesSheet = findSheet(sheetNames, ["Stores", "Store", "store", "stores"]);
  const historySheet = findSheet(sheetNames, ["PurchaseHistory", "Purchase History", "History", "history", "purchases", "Purchases"]);
  const promotionsSheet = findSheet(sheetNames, ["Promotions", "Promotion", "promotion", "promotions", "Promos", "promos"]);

  if (productsSheet) {
    try {
      products = parseProductsSheet(workbook.Sheets[productsSheet]);
    } catch (e) {
      errors.push(`Error parsing Products sheet: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (storesSheet) {
    try {
      stores = parseStoresSheet(workbook.Sheets[storesSheet]);
    } catch (e) {
      errors.push(`Error parsing Stores sheet: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (historySheet) {
    try {
      purchaseHistory = parseHistorySheet(workbook.Sheets[historySheet]);
    } catch (e) {
      errors.push(`Error parsing PurchaseHistory sheet: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (promotionsSheet) {
    try {
      promotions = parsePromotionsSheet(workbook.Sheets[promotionsSheet]);
    } catch (e) {
      errors.push(`Error parsing Promotions sheet: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (!productsSheet && !storesSheet && !historySheet && !promotionsSheet) {
    errors.push(`No recognized sheets found. Expected: Products, Stores, PurchaseHistory, Promotions. Found: ${sheetNames.join(", ")}`);
  }

  return { products, stores, purchaseHistory, promotions, errors };
}

function findSheet(sheetNames: string[], candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    const found = sheetNames.find(s => s.toLowerCase() === candidate.toLowerCase());
    if (found) return found;
  }
  return undefined;
}

function parseProductsSheet(sheet: XLSX.WorkSheet): Product[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  return rows.map((row, i) => ({
    id: String(row["ID"] || row["id"] || row["Product ID"] || `PROD-${i + 1}`),
    name: String(row["Name"] || row["name"] || row["Product Name"] || ""),
    brand: String(row["Brand"] || row["brand"] || "TRS") as Product["brand"],
    category: String(row["Category"] || row["category"] || "Spices") as Product["category"],
    subcategory: String(row["Subcategory"] || row["subcategory"] || ""),
    size: String(row["Size"] || row["size"] || ""),
    caseSize: Number(row["CaseSize"] || row["Case Size"] || row["caseSize"] || 12),
    unitPrice: Number(row["UnitPrice"] || row["Unit Price"] || row["unitPrice"] || 0),
    casePrice: Number(row["CasePrice"] || row["Case Price"] || row["casePrice"] || 0),
    imageUrl: row["ImageUrl"] ? String(row["ImageUrl"]) : undefined,
    isActive: row["IsActive"] !== false && row["isActive"] !== false && row["Active"] !== false,
    seasonalRelevance: row["SeasonalRelevance"]
      ? String(row["SeasonalRelevance"]).split(",").map(s => s.trim()) as Product["seasonalRelevance"]
      : undefined,
  }));
}

function parseStoresSheet(sheet: XLSX.WorkSheet): Store[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  return rows.map((row, i) => ({
    id: String(row["ID"] || row["id"] || row["Store ID"] || `STORE-${String(i + 1).padStart(3, "0")}`),
    name: String(row["Name"] || row["name"] || row["Store Name"] || ""),
    ownerName: String(row["OwnerName"] || row["Owner Name"] || row["ownerName"] || ""),
    preferredLanguage: (String(row["PreferredLanguage"] || row["Language"] || row["language"] || "en")) as Store["preferredLanguage"],
    address: String(row["Address"] || row["address"] || ""),
    city: String(row["City"] || row["city"] || ""),
    region: String(row["Region"] || row["region"] || "London") as Store["region"],
    postcode: String(row["Postcode"] || row["postcode"] || row["PostCode"] || ""),
    phone: row["Phone"] || row["phone"] ? String(row["Phone"] || row["phone"]) : undefined,
    storeType: String(row["StoreType"] || row["Store Type"] || row["storeType"] || "Independent Grocery") as Store["storeType"],
    size: String(row["Size"] || row["size"] || "medium") as Store["size"],
    lastVisitDate: row["LastVisitDate"] || row["Last Visit"] ? String(row["LastVisitDate"] || row["Last Visit"]) : undefined,
    assignedRep: row["AssignedRep"] || row["Rep"] ? String(row["AssignedRep"] || row["Rep"]) : undefined,
    notes: row["Notes"] || row["notes"] ? String(row["Notes"] || row["notes"]) : undefined,
  }));
}

function parseHistorySheet(sheet: XLSX.WorkSheet): PurchaseRecord[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  return rows.map((row, i) => ({
    id: String(row["ID"] || row["id"] || row["Transaction ID"] || `TXN-${String(i + 1).padStart(5, "0")}`),
    storeId: String(row["StoreID"] || row["Store ID"] || row["storeId"] || ""),
    productId: String(row["ProductID"] || row["Product ID"] || row["productId"] || ""),
    date: String(row["Date"] || row["date"] || ""),
    quantity: Number(row["Quantity"] || row["quantity"] || row["Qty"] || 0),
    totalValue: Number(row["TotalValue"] || row["Total Value"] || row["totalValue"] || row["Total"] || 0),
    wasPromotion: Boolean(row["WasPromotion"] || row["Promotion"] || row["wasPromotion"]),
    promotionId: row["PromotionID"] || row["Promotion ID"] ? String(row["PromotionID"] || row["Promotion ID"]) : undefined,
  }));
}

function parsePromotionsSheet(sheet: XLSX.WorkSheet): Promotion[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  return rows.map((row, i) => ({
    id: String(row["ID"] || row["id"] || `PROMO-${i + 1}`),
    name: String(row["Name"] || row["name"] || ""),
    type: String(row["Type"] || row["type"] || "national") as Promotion["type"],
    scope: String(row["Scope"] || row["scope"] || "all_stores") as Promotion["scope"],
    region: row["Region"] || row["region"] ? String(row["Region"] || row["region"]) as Promotion["region"] : undefined,
    productIds: String(row["ProductIDs"] || row["Product IDs"] || row["productIds"] || "").split(",").map(s => s.trim()).filter(Boolean),
    discountType: String(row["DiscountType"] || row["Discount Type"] || "percentage") as Promotion["discountType"],
    discountValue: Number(row["DiscountValue"] || row["Discount Value"] || row["discountValue"] || 0),
    discountDescription: String(row["DiscountDescription"] || row["Description"] || row["discountDescription"] || ""),
    startDate: String(row["StartDate"] || row["Start Date"] || row["startDate"] || ""),
    endDate: String(row["EndDate"] || row["End Date"] || row["endDate"] || ""),
    minimumOrder: row["MinimumOrder"] || row["Minimum Order"] ? Number(row["MinimumOrder"] || row["Minimum Order"]) : undefined,
    isActive: row["IsActive"] !== false && row["isActive"] !== false,
  }));
}
