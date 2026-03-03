import { RecommendedProduct } from "@/lib/types";
import { ProductRecCard } from "./product-rec-card";

export function SeasonalSection({ products }: { products: RecommendedProduct[] }) {
  if (products.length === 0) return (
    <div className="text-center py-8 text-gray-400">
      <p>No seasonal recommendations for this store right now.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700">Seasonal Picks</h3>
        <p className="text-sm text-gray-500">Products relevant for the current season and upcoming events.</p>
      </div>
      {products.map(product => (
        <ProductRecCard key={product.productId} product={product} type="seasonal" />
      ))}
    </div>
  );
}
