// CORE DATA MODELS

export type Brand = "TRS" | "East End" | "Cofresh" | "Fudco";

export type ProductCategory =
  | "Spices"
  | "Pulses & Lentils"
  | "Flours"
  | "Rice"
  | "Snacks"
  | "Dairy"
  | "Frozen Foods"
  | "Condiments & Sauces"
  | "Oils & Ghee"
  | "Canned Goods"
  | "Nuts & Dried Fruits"
  | "Tea & Beverages"
  | "Papads & Crackers";

export type Season = "spring" | "summer" | "autumn" | "winter" | "ramadan" | "diwali" | "eid";

export type UKRegion =
  | "London"
  | "West Midlands"
  | "East Midlands"
  | "North West"
  | "Yorkshire"
  | "South East"
  | "South West"
  | "East of England"
  | "Scotland"
  | "Wales";

export type StoreType = "Independent Grocery" | "Mini Market" | "Cash & Carry" | "Convenience" | "Specialist";
export type StoreSize = "small" | "medium" | "large";
export type PromotionType = "national" | "regional" | "product_specific" | "seasonal" | "new_product";
export type Language = "en" | "hi" | "ur";

export interface Product {
  id: string;
  name: string;
  brand: Brand;
  category: ProductCategory;
  subcategory: string;
  size: string;
  caseSize: number;
  unitPrice: number;
  casePrice: number;
  imageUrl?: string;
  isActive: boolean;
  seasonalRelevance?: Season[];
}

export interface Store {
  id: string;
  name: string;
  ownerName: string;
  preferredLanguage: Language;
  address: string;
  city: string;
  region: UKRegion;
  postcode: string;
  phone?: string;
  storeType: StoreType;
  size: StoreSize;
  lastVisitDate?: string;
  assignedRep?: string;
  notes?: string;
}

export interface PurchaseRecord {
  id: string;
  storeId: string;
  productId: string;
  date: string;
  quantity: number;
  totalValue: number;
  wasPromotion: boolean;
  promotionId?: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  scope: "all_stores" | "region" | "selected_stores";
  region?: UKRegion;
  productIds: string[];
  discountType: "percentage" | "fixed" | "buy_x_get_y" | "case_deal";
  discountValue: number;
  discountDescription: string;
  startDate: string;
  endDate: string;
  minimumOrder?: number;
  isActive: boolean;
}

// RECOMMENDATION OUTPUT

export interface StoreRecommendations {
  storeId: string;
  storeName: string;
  generatedAt: string;
  salespersonTips: string;
  winBack: RecommendedProduct[];
  crossSell: RecommendedProduct[];
  promotions: RecommendedProduct[];
  seasonal: RecommendedProduct[];
}

export interface RecommendedProduct {
  productId: string;
  productName: string;
  brand: Brand;
  category: ProductCategory;
  reason: string;
  priority: "high" | "medium" | "low";
  estimatedValue: number;
  promotion?: {
    name: string;
    discount: string;
  };
  lastPurchased?: string;
  daysLapsed?: number;
  complementaryTo?: string[];
}

// FLYER

export interface FlyerConfig {
  title: string;
  subtitle?: string;
  language: Language;
  products: FlyerProduct[];
  footer: string;
  brandColor: string;
}

export interface FlyerProduct {
  name: string;
  brand: Brand;
  size: string;
  price?: string;
  dealBadge?: string;
  imageUrl?: string;
}

// APP STATE

export interface AppData {
  products: Product[];
  stores: Store[];
  purchaseHistory: PurchaseRecord[];
  promotions: Promotion[];
  isLoaded: boolean;
  loadedAt?: string;
  source: "demo" | "uploaded";
}

// API TYPES

export interface UploadResponse {
  success: boolean;
  counts: {
    products: number;
    stores: number;
    purchaseHistory: number;
    promotions: number;
  };
  errors?: string[];
}

export interface RecommendationRequest {
  storeId: string;
}

export interface TranslationRequest {
  texts: string[];
  targetLanguage: "hi" | "ur";
}

export interface TranslationResponse {
  translations: string[];
  language: "hi" | "ur";
}

// Store with computed stats for display
export interface StoreWithStats extends Store {
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate?: string;
  topCategories: string[];
  productCount: number;
}
