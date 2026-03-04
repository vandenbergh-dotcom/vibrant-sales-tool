import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecommendedProduct } from "@/lib/types";
import { ProductImage } from "@/components/shared/product-image";
import { BrandBadge } from "@/components/shared/brand-badge";
import { BRAND_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface ProductRecCardProps {
  product: RecommendedProduct;
  type: "winback" | "crosssell" | "promotion" | "seasonal";
}

export function ProductRecCard({ product, type }: ProductRecCardProps) {
  const priorityColors = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  const brandColor = BRAND_COLORS[product.brand]?.primary || "#004B87";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="w-1.5 shrink-0" style={{ backgroundColor: brandColor }} />
        <CardContent className="p-4 flex-1">
          <div className="flex items-start gap-3">
            <ProductImage
              productId={product.productId}
              brand={product.brand}
              category={product.category}
              name={product.productName}
              size="sm"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm leading-tight">{product.productName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <BrandBadge brand={product.brand} />
                    <Badge variant="outline" className={`text-xs ${priorityColors[product.priority]}`}>
                      {product.priority}
                    </Badge>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-green-700">
                    {formatCurrency(product.estimatedValue)}
                  </p>
                  <p className="text-xs text-gray-400">est. order</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-2 italic">{product.reason}</p>

              {/* Win-back: show days lapsed */}
              {type === "winback" && product.daysLapsed && (
                <p className="text-xs text-orange-600 mt-1">
                  Last purchased {product.daysLapsed} days ago
                </p>
              )}

              {/* Cross-sell: show complementary products */}
              {type === "crosssell" && product.complementaryTo && product.complementaryTo.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Pairs with: {product.complementaryTo.join(", ")}
                </p>
              )}

              {/* Promotion: show deal */}
              {product.promotion && (
                <div className="mt-2">
                  <Badge className="bg-red-600 text-white text-xs">
                    {product.promotion.discount}
                  </Badge>
                  <span className="text-xs text-gray-500 ml-2">{product.promotion.name}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
