import { Brand, ProductCategory, Season } from "./types";

export const BRAND_COLORS: Record<Brand, { primary: string; secondary: string; text: string }> = {
  "TRS": { primary: "#004B87", secondary: "#E8F0FE", text: "#FFFFFF" },
  "East End": { primary: "#2E7D32", secondary: "#E8F5E9", text: "#FFFFFF" },
  "Cofresh": { primary: "#C62828", secondary: "#FFEBEE", text: "#FFFFFF" },
  "Fudco": { primary: "#F57F17", secondary: "#FFF8E1", text: "#000000" },
};

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  "Spices": "🌶️",
  "Pulses & Lentils": "🫘",
  "Flours": "🌾",
  "Rice": "🍚",
  "Snacks": "🥨",
  "Dairy": "🧈",
  "Frozen Foods": "❄️",
  "Condiments & Sauces": "🥫",
  "Oils & Ghee": "🫒",
  "Canned Goods": "🥫",
  "Nuts & Dried Fruits": "🥜",
  "Tea & Beverages": "🍵",
  "Papads & Crackers": "🫓",
};

export const SEASON_LABELS: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
  ramadan: "Ramadan",
  diwali: "Diwali",
  eid: "Eid",
};

export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  // March-May: spring, June-Aug: summer, Sept-Nov: autumn + diwali, Dec-Feb: winter + ramadan
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

export function getUpcomingEvents(): string[] {
  const month = new Date().getMonth();
  const events: string[] = [];
  if (month >= 1 && month <= 3) events.push("Ramadan season");
  if (month >= 2 && month <= 4) events.push("Spring promotions period");
  if (month >= 5 && month <= 7) events.push("Summer snacking season");
  if (month >= 8 && month <= 10) events.push("Diwali preparations");
  if (month >= 9 && month <= 10) events.push("Eid celebrations");
  if (month >= 10 || month <= 0) events.push("Winter comfort foods");
  if (month === 11) events.push("Christmas & New Year");
  return events;
}

export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "हिन्दी (Hindi)",
  ur: "اردو (Urdu)",
};

export const APP_NAME = "Vibrant Foods Sales Tool";
export const APP_DESCRIPTION = "AI-powered field sales recommendations for Vibrant Foods";
