import { Brand, ProductCategory } from "@/lib/types";
import { BRAND_COLORS, CATEGORY_ICONS } from "@/lib/constants";
import { getProductImageUrl } from "@/lib/product-images";

interface ProductImageProps {
  productId?: string;
  brand: Brand;
  category: ProductCategory;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProductImage({ productId, brand, category, name, size = "md", className = "" }: ProductImageProps) {
  const colors = BRAND_COLORS[brand];
  const icon = CATEGORY_ICONS[category] || "📦";
  const imageUrl = productId ? getProductImageUrl(productId) : null;

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const textSizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  if (imageUrl) {
    return (
      <div
        className={`rounded-lg overflow-hidden ${sizeClasses[size]} ${className}`}
        style={{ backgroundColor: colors.primary }}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-contain bg-white p-1"
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg flex flex-col items-center justify-center ${sizeClasses[size]} ${textSizeClasses[size]} ${className}`}
      style={{ backgroundColor: colors.primary }}
    >
      <span className="mb-1">{icon}</span>
      <span
        className="text-[8px] font-medium text-center px-1 leading-tight line-clamp-2"
        style={{ color: colors.text }}
      >
        {name}
      </span>
    </div>
  );
}
