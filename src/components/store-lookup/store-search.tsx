"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { StoreWithStats } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function StoreSearch() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreWithStats[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/stores")
      .then(r => r.json())
      .then(data => {
        if (data.stores) setStores(data.stores);
      })
      .catch(console.error);
  }, []);

  const filteredStores = stores.filter(store => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      store.name.toLowerCase().includes(q) ||
      store.city.toLowerCase().includes(q) ||
      store.region.toLowerCase().includes(q) ||
      store.ownerName.toLowerCase().includes(q) ||
      (store.assignedRep && store.assignedRep.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Command className="rounded-xl border shadow-lg bg-white" shouldFilter={false}>
        <CommandInput
          placeholder="Search for a store by name, city, or region..."
          value={search}
          onValueChange={setSearch}
          onFocus={() => setOpen(true)}
          className="h-14 text-lg"
        />
        {open && (
          <CommandList className="max-h-80">
            <CommandEmpty>No stores found.</CommandEmpty>
            <CommandGroup heading={`${filteredStores.length} stores`}>
              {filteredStores.slice(0, 20).map(store => (
                <CommandItem
                  key={store.id}
                  value={store.id}
                  onSelect={() => {
                    router.push(`/stores/${store.id}`);
                    setOpen(false);
                  }}
                  className="cursor-pointer py-3"
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-medium">{store.name}</p>
                      <p className="text-sm text-gray-500">
                        {store.city}, {store.region} · {store.storeType} · {store.size}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-600">{store.totalOrders} orders</p>
                      <p className="text-gray-400">{formatCurrency(store.totalRevenue)}</p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  );
}
