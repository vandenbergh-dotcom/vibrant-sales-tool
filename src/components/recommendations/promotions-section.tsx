import { RecommendedProduct } from "@/lib/types";
import { ProductRecCard } from "./product-rec-card";

export function PromotionsSection({ products }: { products: RecommendedProduct[] }) {
  if (products.length === 0) return (
    <div className="text-center py-8 text-gray-400">
      <p>No active promotions relevant for this store.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700">Active Promotions to Push</h3>
        <p className="text-sm text-gray-500">Current deals and offers relevant to this store.</p>
      </div>
      {products.map(product => (
        <ProductRecCard key={product.productId} product={product} type="promotion" />
      ))}
    </div>
  );
}
