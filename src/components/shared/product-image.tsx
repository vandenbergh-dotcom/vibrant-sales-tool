import { Brand, ProductCategory } from "@/lib/types";
import { BRAND_COLORS, CATEGORY_ICONS } from "@/lib/constants";

interface ProductImageProps {
  brand: Brand;
  category: ProductCategory;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProductImage({ brand, category, name, size = "md", className = "" }: ProductImageProps) {
  const colors = BRAND_COLORS[brand];
  const icon = CATEGORY_ICONS[category] || "📦";

  const sizeClasses = {
    sm: "w-16 h-16 text-xl",
    md: "w-24 h-24 text-3xl",
    lg: "w-32 h-32 text-4xl",
  };

  return (
    <div
      className={`rounded-lg flex flex-col items-center justify-center ${sizeClasses[size]} ${className}`}
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
