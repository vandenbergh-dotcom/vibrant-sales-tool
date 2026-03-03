import { RecommendedProduct } from "@/lib/types";
import { ProductRecCard } from "./product-rec-card";

export function WinbackSection({ products }: { products: RecommendedProduct[] }) {
  if (products.length === 0) return (
    <div className="text-center py-8 text-gray-400">
      <p>No win-back opportunities found for this store.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700">Products They Stopped Buying</h3>
        <p className="text-sm text-gray-500">These products were previously regular purchases but haven&apos;t been ordered recently.</p>
      </div>
      {products.map(product => (
        <ProductRecCard key={product.productId} product={product} type="winback" />
      ))}
    </div>
  );
}
