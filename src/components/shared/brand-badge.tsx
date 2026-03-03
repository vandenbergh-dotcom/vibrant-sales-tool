import { Brand } from "@/lib/types";
import { BRAND_COLORS } from "@/lib/constants";

interface BrandBadgeProps {
  brand: Brand;
  className?: string;
}

export function BrandBadge({ brand, className = "" }: BrandBadgeProps) {
  const colors = BRAND_COLORS[brand];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: colors.secondary, color: colors.primary }}
    >
      {brand}
    </span>
  );
}
