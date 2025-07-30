"use client";
import React, { useState, useCallback } from "react";
import AdsList from "@/components/ads-list";
import DesktopCategoryFilters from "@/components/sortSearchFilters/desktop/desktop-category-filters";
import { AdsFilters } from "@/components/ads-list";
import { useSearch } from "@/lib/search-context";

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

  const handleSearchChange = useCallback((search: string) => {
    console.log('🔍 Search term changed:', search);
    // Update filters with search parameter
    setFilters(prev => ({
      ...prev,
      search_description: search.trim() || undefined
    }));
  }, []);

  return (
    <HomeContent 
      filters={filters}
      handleFiltersChange={handleFiltersChange}
      handleExpressFilterChange={handleExpressFilterChange}
      handleFeaturedFilterChange={handleFeaturedFilterChange}
      expressFilter={expressFilter}
      featuredFilter={featuredFilter}
      handleSearchChange={handleSearchChange}
    />
  );
}

// Separate component to use the search context
function HomeContent({ 
  filters,
  handleFiltersChange,
  handleExpressFilterChange,
  handleFeaturedFilterChange,
  expressFilter,
  featuredFilter,
  handleSearchChange
}: {
  filters: AdsFilters;
  handleFiltersChange: (filters: AdsFilters) => void;
  handleExpressFilterChange: (express: boolean) => void;
  handleFeaturedFilterChange: (featured: boolean) => void;
  expressFilter: boolean;
  featuredFilter: boolean;
  handleSearchChange: (search: string) => void;
}) {
  const { setSearchHandler } = useSearch();

  // Register the search handler with the global context
  setSearchHandler(handleSearchChange);

  return (
    <div 
    className="flex flex-col md:flex-row md:items-start w-full px-2 md:px-8 py-10">
      {/* Desktop: Category Sidebar */}
      <div className="hidden md:block shrink-0">
        <DesktopCategoryFilters onFiltersChange={handleFiltersChange} />
      </div>
      {/* Main Content: Ads List */}
      <div className="flex-1 min-w-0">
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
