"use client";
import React, { useState, useCallback } from "react";
import AdsList from "@/components/ads-list";
import DesktopCategoryFilters from "@/components/sortSearchFilters/desktop/desktop-category-filters";
import type { AdsFilters, Category } from "@/types/ads";
import { useSearch } from "@/lib/search-context";
import { useTranslations } from "next-intl";

// Category type centralized in types/ads

export default function Home() {
  const [filters, setFilters] = useState<AdsFilters>({});
  const [expressFilter, setExpressFilter] = useState<boolean>(false);
  const [featuredFilter, setFeaturedFilter] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleFiltersChange = (newFilters: AdsFilters, selectedCategoryInfo?: Category) => {
    console.log('🔄 Updating filters:', newFilters);
    console.log('📋 Selected category info:', selectedCategoryInfo);
    setFilters(newFilters);
    
    // Update selected category if category information is provided
    if (selectedCategoryInfo) {
      console.log('✅ Setting selected category:', selectedCategoryInfo);
      setSelectedCategory(selectedCategoryInfo);
    } else if (newFilters.category_ids && newFilters.category_ids.length > 0) {
      // Fallback: if we have category IDs but no category info, create a placeholder
      console.log('⚠️ No category info provided, creating placeholder for:', newFilters.category_ids[0]);
      setSelectedCategory({
        id: newFilters.category_ids[0],
        name: "Selected Category", // This should come from your API
        description: "This is a description of the selected category. It provides information about the type of stone and its characteristics."
      });
    } else {
      console.log('❌ No category selected, clearing selectedCategory');
      setSelectedCategory(null);
    }
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
      selectedCategory={selectedCategory}
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
  selectedCategory,
  handleFiltersChange,
  handleExpressFilterChange,
  handleFeaturedFilterChange,
  expressFilter,
  featuredFilter,
  handleSearchChange
}: {
  filters: AdsFilters;
  selectedCategory: Category | null;
  handleFiltersChange: (filters: AdsFilters, selectedCategoryInfo?: Category) => void;
  handleExpressFilterChange: (express: boolean) => void;
  handleFeaturedFilterChange: (featured: boolean) => void;
  expressFilter: boolean;
  featuredFilter: boolean;
  handleSearchChange: (search: string) => void;
}) {
  const { setSearchHandler } = useSearch();
  const t = useTranslations("CategoryHeader");

  // Register the search handler with the global context
  setSearchHandler(handleSearchChange);

  console.log('🎨 Current selectedCategory state:', selectedCategory);

  return (
    <div 
    className="flex flex-col md:flex-row md:items-start w-full px-2 md:px-8 py-10 min-h-screen">
      {/* Desktop: Category Sidebar */}
      <div className="hidden md:block shrink-0 sticky top-8 self-start">
        <DesktopCategoryFilters onFiltersChange={handleFiltersChange} />
      </div>
      {/* Main Content: Ads List */}
      <div className="flex-1 min-w-0">
        {/* Category Description Header */}
        {selectedCategory && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Large Banner Image */}
            {selectedCategory.image && (
              <div className="w-full h-48 relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${selectedCategory.image}`}
                  alt={selectedCategory.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Category Details Section */}
            <div className="p-6">
              {/* Category Tag */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-orange-300 bg-orange-50">
                  <span className="text-xs text-orange-600">×</span>
                  <span className="text-sm font-medium text-orange-600">{selectedCategory.name}</span>
                </div>
                
                {/* Additional Details */}
                {/* <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>Texture:</span>
                    <span className="font-medium">Lorem ipsum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Lorem:</span>
                    <span className="font-medium">Lorem ipsum</span>
                  </div>
                  <div className="w-6 h-6 rounded border border-gray-300 bg-gray-200"></div>
                </div> */}
              </div>
              
              {/* Category Name and Description */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {selectedCategory.name}
                </h2>
                {selectedCategory.description ? (
                  <div className="text-gray-600 leading-relaxed space-y-2">
                    <p>{selectedCategory.description}</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  </div>
                ) : (
                  <div className="text-gray-600 leading-relaxed space-y-2">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                  </div>
                )}
              </div>
              
              {/* Subcategories Section */}
              {selectedCategory.children && selectedCategory.children.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("subcategories")}
                  </h3>
                  <div className="grid grid-cols-6 gap-4">
                    {selectedCategory.children.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          {subcategory.image ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${subcategory.image}`}
                              alt={subcategory.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-600 font-medium">
                                {subcategory.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {subcategory.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
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
