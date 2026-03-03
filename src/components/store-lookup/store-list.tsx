"use client";

import { useEffect, useState } from "react";
import { StoreCard } from "./store-card";
import { StoreWithStats } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StoreList() {
  const [stores, setStores] = useState<StoreWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");

  useEffect(() => {
    fetch("/api/stores")
      .then(r => r.json())
      .then(data => {
        if (data.stores) setStores(data.stores);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const regions = [...new Set(stores.map(s => s.region))].sort();

  const filteredStores = stores.filter(store => {
    const matchesText = !filter ||
      store.name.toLowerCase().includes(filter.toLowerCase()) ||
      store.city.toLowerCase().includes(filter.toLowerCase());
    const matchesRegion = regionFilter === "all" || store.region === regionFilter;
    return matchesText && matchesRegion;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Filter stores..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            {regions.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500 self-center">
          {filteredStores.length} of {stores.length} stores
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStores.map(store => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}
