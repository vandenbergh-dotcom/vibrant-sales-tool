"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreRecommendations } from "@/lib/types";
import { WinbackSection } from "./winback-section";
import { CrosssellSection } from "./crosssell-section";
import { PromotionsSection } from "./promotions-section";
import { SeasonalSection } from "./seasonal-section";
import { Card, CardContent } from "@/components/ui/card";

interface RecommendationPanelProps {
  recommendations: StoreRecommendations;
}

export function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  const tabCounts = {
    winback: recommendations.winBack.length,
    crosssell: recommendations.crossSell.length,
    promotions: recommendations.promotions.length,
    seasonal: recommendations.seasonal.length,
  };

  return (
    <div className="space-y-4">
      {/* Salesperson Tips */}
      {recommendations.salespersonTips && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-800">Conversation Tip</p>
            <p className="text-sm text-blue-700 mt-1">{recommendations.salespersonTips}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="winback">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="winback">
            Win-Back ({tabCounts.winback})
          </TabsTrigger>
          <TabsTrigger value="crosssell">
            Cross-Sell ({tabCounts.crosssell})
          </TabsTrigger>
          <TabsTrigger value="promotions">
            Promotions ({tabCounts.promotions})
          </TabsTrigger>
          <TabsTrigger value="seasonal">
            Seasonal ({tabCounts.seasonal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="winback">
          <WinbackSection products={recommendations.winBack} />
        </TabsContent>
        <TabsContent value="crosssell">
          <CrosssellSection products={recommendations.crossSell} />
        </TabsContent>
        <TabsContent value="promotions">
          <PromotionsSection products={recommendations.promotions} />
        </TabsContent>
        <TabsContent value="seasonal">
          <SeasonalSection products={recommendations.seasonal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
