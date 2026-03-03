"use client";

import { useState, useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import { Language } from "@/lib/types";

export function useFlyerGenerator() {
  const flyerRef = useRef<HTMLDivElement>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [translatedNames, setTranslatedNames] = useState<Record<string, string>>({});
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");

  const translateProducts = useCallback(async (productIds: string[], productNames: string[], language: Language) => {
    if (language === "en") {
      setTranslatedNames({});
      return {};
    }

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: productNames, targetLanguage: language }),
      });

      const data = await response.json();

      if (data.translations) {
        const mapped: Record<string, string> = {};
        productIds.forEach((id, i) => {
          mapped[id] = data.translations[i] || productNames[i];
        });
        setTranslatedNames(mapped);
        return mapped;
      }
    } catch {
      // Fallback to English names
    }

    return {};
  }, []);

  const generateImage = useCallback(async () => {
    if (!flyerRef.current) return null;

    setGenerating(true);

    try {
      // Wait a tick for the DOM to update with translations
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(flyerRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#FFF8E7",
      });

      setImageData(dataUrl);
      return dataUrl;
    } catch (err) {
      console.error("Failed to generate flyer image:", err);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  return {
    flyerRef,
    imageData,
    generating,
    translatedNames,
    currentLanguage,
    setCurrentLanguage,
    translateProducts,
    generateImage,
  };
}
