"use client";

import { useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FlyerTemplate } from "./flyer-template";
import { LanguageSelector } from "./language-selector";
import { DownloadButton } from "./download-button";
import { useFlyerGenerator } from "@/hooks/use-flyer-generator";
import { StoreRecommendations, RecommendedProduct } from "@/lib/types";

interface FlyerGeneratorProps {
  recommendations: StoreRecommendations;
  storeName: string;
}

export function FlyerGenerator({ recommendations, storeName }: FlyerGeneratorProps) {
  const {
    flyerRef,
    imageData,
    generating,
    translatedNames,
    currentLanguage,
    setCurrentLanguage,
    translateProducts,
    generateImage,
  } = useFlyerGenerator();

  // Combine all recommended products for the flyer (top priority first)
  const allProducts: RecommendedProduct[] = [
    ...recommendations.promotions,
    ...recommendations.winBack,
    ...recommendations.crossSell,
    ...recommendations.seasonal,
  ]
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 12);

  const handleLanguageChange = useCallback(async (lang: typeof currentLanguage) => {
    setCurrentLanguage(lang);

    if (lang !== "en") {
      await translateProducts(
        allProducts.map(p => p.productId),
        allProducts.map(p => p.productName),
        lang
      );
    }

    // Regenerate image after translation
    setTimeout(() => generateImage(), 200);
  }, [allProducts, setCurrentLanguage, translateProducts, generateImage]);

  // Auto-generate image when recommendations load
  useEffect(() => {
    if (allProducts.length > 0) {
      setTimeout(() => generateImage(), 300);
    }
  }, [recommendations]); // eslint-disable-line react-hooks/exhaustive-deps

  if (allProducts.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Sales Flyer</h3>
          <LanguageSelector value={currentLanguage} onChange={handleLanguageChange} />
        </div>

        {/* Flyer Preview */}
        <div className="border rounded-lg overflow-hidden bg-gray-100 flex justify-center p-4">
          <div style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
            <FlyerTemplate
              ref={flyerRef}
              storeName={storeName}
              products={allProducts}
              language={currentLanguage}
              translatedNames={translatedNames}
            />
          </div>
        </div>

        {/* Download */}
        <div className="flex justify-end">
          <DownloadButton
            imageData={imageData}
            fileName={`${storeName.replace(/[^a-zA-Z0-9]/g, "-")}-recommendations.png`}
            loading={generating}
          />
        </div>
      </CardContent>
    </Card>
  );
}
