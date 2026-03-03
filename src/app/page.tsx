import { StoreSearch } from "@/components/store-lookup/store-search";
import { StoreList } from "@/components/store-lookup/store-list";
import { DataStatus } from "@/components/data-upload/data-status";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Field Sales Recommendations
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Search for a store to get AI-powered product recommendations,
          personalized for each visit.
        </p>
        <DataStatus />
      </div>

      {/* Store search */}
      <StoreSearch />

      {/* Store grid */}
      <div className="pt-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">All Stores</h2>
        <StoreList />
      </div>
    </div>
  );
}
