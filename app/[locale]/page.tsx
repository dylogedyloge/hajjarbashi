"use client";
import { useState } from "react";
import AdsList from "@/components/ads-list";
import DesktopCategoryFilters from "@/components/sortSearchFilters/desktop/desktop-category-filters";
import { AdsFilters } from "@/components/ads-list";

export default function Home() {
  const [filters, setFilters] = useState<AdsFilters>({});
  const [expressFilter, setExpressFilter] = useState<boolean>(false);
  const [featuredFilter, setFeaturedFilter] = useState<boolean>(false);

  const handleFiltersChange = (newFilters: AdsFilters) => {
    console.log('🔄 Updating filters:', newFilters);
    setFilters(newFilters);
  };

  const handleExpressFilterChange = (express: boolean) => {
    console.log('⚡ Express filter changed:', express);
    setExpressFilter(express);
    // Update filters with express parameter
    setFilters(prev => ({
      ...prev,
      express: express
    }));
  };

  const handleFeaturedFilterChange = (featured: boolean) => {
    console.log('⭐ Featured filter changed:', featured);
    setFeaturedFilter(featured);
    // Update filters with promoted parameter
    setFilters(prev => ({
      ...prev,
      promoted: featured
    }));
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start md:gap-8 w-full max-w-7xl mx-auto px-2 md:px-8 py-10">
      {/* Desktop: Category Sidebar */}
      <div className="hidden md:block shrink-0">
        <DesktopCategoryFilters onFiltersChange={handleFiltersChange} />
      </div>
      {/* Main Content: Ads List */}
      <div className="flex-1">
        <AdsList 
          filters={filters} 
          onExpressFilterChange={handleExpressFilterChange}
          onFeaturedFilterChange={handleFeaturedFilterChange}
          expressFilter={expressFilter}
          featuredFilter={featuredFilter}
        />
      </div>
    </div>
  );
}
