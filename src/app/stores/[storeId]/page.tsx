"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendationPanel } from "@/components/recommendations/recommendation-panel";
import { FlyerGenerator } from "@/components/visual-output/flyer-generator";
import { useRecommendations } from "@/hooks/use-recommendations";
import { StoreWithStats } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LANGUAGE_LABELS } from "@/lib/constants";
import Link from "next/link";

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<StoreWithStats | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const { recommendations, loading, error, fetchRecommendations } = useRecommendations();

  useEffect(() => {
    fetch("/api/stores")
      .then(r => r.json())
      .then(data => {
        const found = data.stores?.find((s: StoreWithStats) => s.id === storeId);
        setStore(found || null);
        setStoreLoading(false);
      })
      .catch(() => setStoreLoading(false));
  }, [storeId]);

  if (storeLoading) {
    return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-96" /></div>;
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-600">Store not found</h2>
        <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{store.name}</span>
      </div>

      {/* Store Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
              <p className="text-gray-500 mt-1">{store.address}, {store.city}, {store.postcode}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline">{store.storeType}</Badge>
                <Badge variant="outline">{store.size}</Badge>
                <Badge variant="outline">{store.region}</Badge>
                <Badge variant="outline">{LANGUAGE_LABELS[store.preferredLanguage]?.split(" ")[0]}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Owner: {store.ownerName}</p>
              {store.assignedRep && <p className="text-sm text-gray-500">Rep: {store.assignedRep}</p>}
              {store.phone && <p className="text-sm text-gray-500">{store.phone}</p>}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-400">Total Orders</p>
              <p className="text-xl font-bold">{store.totalOrders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(store.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Products</p>
              <p className="text-xl font-bold">{store.productCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Order</p>
              <p className="text-xl font-bold">{store.lastOrderDate ? formatDate(store.lastOrderDate) : "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Recommendations */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">AI Recommendations</h2>
        <Button
          onClick={() => fetchRecommendations(storeId)}
          disabled={loading}
          size="lg"
          className="bg-[#004B87] hover:bg-[#003A6B]"
        >
          {loading ? "Generating..." : recommendations ? "Regenerate" : "Generate Recommendations"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-12" />
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && !loading && (
        <>
          <RecommendationPanel recommendations={recommendations} />
          <FlyerGenerator recommendations={recommendations} storeName={store.name} />
        </>
      )}

      {/* Empty state */}
      {!recommendations && !loading && !error && (
        <Card className="bg-gray-50">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-lg">Click &quot;Generate Recommendations&quot; to get AI-powered product suggestions for this store visit.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
