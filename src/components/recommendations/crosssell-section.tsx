import { RecommendedProduct } from "@/lib/types";
import { ProductRecCard } from "./product-rec-card";

export function CrosssellSection({ products }: { products: RecommendedProduct[] }) {
  if (products.length === 0) return (
    <div className="text-center py-8 text-gray-400">
      <p>No cross-sell opportunities found for this store.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700">New Products to Try</h3>
        <p className="text-sm text-gray-500">Products this store has never ordered that complement their current purchases.</p>
      </div>
      {products.map(product => (
        <ProductRecCard key={product.productId} product={product} type="crosssell" />
      ))}
    </div>
  );
}
