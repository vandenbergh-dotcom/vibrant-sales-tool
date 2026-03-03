import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StoreWithStats } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LANGUAGE_LABELS } from "@/lib/constants";

interface StoreCardProps {
  store: StoreWithStats;
}

export function StoreCard({ store }: StoreCardProps) {
  const sizeColors = {
    small: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    large: "bg-green-100 text-green-700",
  };

  return (
    <Link href={`/stores/${store.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm leading-tight">{store.name}</h3>
            <Badge variant="outline" className={`text-xs ${sizeColors[store.size]}`}>
              {store.size}
            </Badge>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            {store.city}, {store.region}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-400">Orders</p>
              <p className="font-medium">{store.totalOrders}</p>
            </div>
            <div>
              <p className="text-gray-400">Revenue</p>
              <p className="font-medium">{formatCurrency(store.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-gray-400">Products</p>
              <p className="font-medium">{store.productCount}</p>
            </div>
            <div>
              <p className="text-gray-400">Language</p>
              <p className="font-medium">{LANGUAGE_LABELS[store.preferredLanguage]?.split(" ")[0] || "English"}</p>
            </div>
          </div>

          {store.lastOrderDate && (
            <p className="text-xs text-gray-400 mt-3 pt-2 border-t">
              Last order: {formatDate(store.lastOrderDate)}
            </p>
          )}

          {store.topCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {store.topCategories.map(cat => (
                <span key={cat} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
