"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface DataCounts {
  products: number;
  stores: number;
  purchaseHistory: number;
  promotions: number;
  source: string;
}

export function DataStatus() {
  const [counts, setCounts] = useState<DataCounts | null>(null);

  useEffect(() => {
    fetch("/api/stores")
      .then(r => r.json())
      .then(data => {
        if (data.stores) {
          setCounts({
            products: 0, // We'll get this from a separate call or infer
            stores: data.meta?.total || data.stores.length,
            purchaseHistory: 0,
            promotions: 0,
            source: data.meta?.source || "demo",
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!counts) return null;

  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <Badge variant={counts.source === "demo" ? "secondary" : "default"}>
        {counts.source === "demo" ? "Demo Data" : "Custom Data"}
      </Badge>
      <span>{counts.stores} stores loaded</span>
    </div>
  );
}
