"use client";
import React, { useState, useCallback, useEffect } from "react";
import AdsList from "@/components/ads-list";
import DesktopCategoryFilters from "@/components/sortSearchFilters/desktop/desktop-category-filters";
import type { AdsFilters, Category } from "@/types/ads";
import { useSearch } from "@/lib/search-context";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { generateSlug } from "@/utils/slug";

// Category type centralized in types/ads

export default function Home() {
  const [filters, setFilters] = useState<AdsFilters>({});
  const [expressFilter, setExpressFilter] = useState<boolean>(false);
  const [featuredFilter, setFeaturedFilter] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Category[]>([]);

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

  const handleClearCategoryFilter = useCallback(() => {
    console.log('❌ Clearing category filter');
    // Remove category_ids from filters
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters.category_ids;
      return newFilters;
    });
    // Clear selected category and subcategories
    setSelectedCategory(null);
    setSelectedSubcategories([]);
    // Dispatch custom event to notify desktop filters
    window.dispatchEvent(new CustomEvent('clearCategoryFilter'));
  }, []);

  const handleSubcategoryToggle = useCallback((subcategory: Category) => {
    console.log('🔄 Toggling subcategory:', subcategory);
    setSelectedSubcategories(prev => {
      const isSelected = prev.some(sub => sub.id === subcategory.id);
      if (isSelected) {
        // Remove subcategory
        const updated = prev.filter(sub => sub.id !== subcategory.id);
        console.log('❌ Removed subcategory:', subcategory.name, 'Updated list:', updated);
        return updated;
      } else {
        // Add subcategory
        const updated = [...prev, subcategory];
        console.log('✅ Added subcategory:', subcategory.name, 'Updated list:', updated);
        return updated;
      }
    });
  }, []);

  const handleClearSubcategoryFilter = useCallback((subcategoryId: string) => {
    console.log('❌ Clearing subcategory filter:', subcategoryId);
    setSelectedSubcategories(prev => prev.filter(sub => sub.id !== subcategoryId));
  }, []);

  return (
    <HomeContent
      filters={filters}
      selectedCategory={selectedCategory}
      selectedSubcategories={selectedSubcategories}
      handleFiltersChange={handleFiltersChange}
      handleExpressFilterChange={handleExpressFilterChange}
      handleFeaturedFilterChange={handleFeaturedFilterChange}
      expressFilter={expressFilter}
      featuredFilter={featuredFilter}
      handleSearchChange={handleSearchChange}
      handleClearCategoryFilter={handleClearCategoryFilter}
      handleSubcategoryToggle={handleSubcategoryToggle}
      handleClearSubcategoryFilter={handleClearSubcategoryFilter}
    />
  );
}

// Separate component to use the search context
function HomeContent({
  filters,
  selectedCategory,
  selectedSubcategories,
  handleFiltersChange,
  handleExpressFilterChange,
  handleFeaturedFilterChange,
  expressFilter,
  featuredFilter,
  handleSearchChange,
  handleClearCategoryFilter,
  handleSubcategoryToggle,
  handleClearSubcategoryFilter
}: {
  filters: AdsFilters;
  selectedCategory: Category | null;
  selectedSubcategories: Category[];
  handleFiltersChange: (filters: AdsFilters, selectedCategoryInfo?: Category) => void;
  handleExpressFilterChange: (express: boolean) => void;
  handleFeaturedFilterChange: (featured: boolean) => void;
  expressFilter: boolean;
  featuredFilter: boolean;
  handleSearchChange: (search: string) => void;
  handleClearCategoryFilter: () => void;
  handleSubcategoryToggle: (subcategory: Category) => void;
  handleClearSubcategoryFilter: (subcategoryId: string) => void;
}) {
  const { setSearchHandler } = useSearch();
  const t = useTranslations("CategoryHeader");

  const [imageError, setImageError] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderDescription = (description: string, id: string, maxLength: number = 300) => {
    const paragraphs = description.split('\\n\\n');
    const isExpanded = expandedDescriptions.has(id);

    if (description.length <= maxLength) {
      return (
        <div className="text-gray-600 leading-relaxed space-y-2">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      );
    }

    if (isExpanded) {
      return (
        <div className="text-gray-600 leading-relaxed space-y-2">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          <Button
            variant="link"
            className="p-0 h-auto text-orange-600 hover:text-orange-800 font-medium"
            onClick={() => toggleDescription(id)}
          >
            Show less
          </Button>
        </div>
      );
    }

    // Truncated version
    const truncatedText = description.substring(0, maxLength);
    const lastSpaceIndex = truncatedText.lastIndexOf(' ');
    const finalText = truncatedText.substring(0, lastSpaceIndex) + '...';

    return (
      <div className="text-gray-600 leading-relaxed space-y-2">
        <p>{finalText}</p>
        <Button
          variant="link"
          className="p-0 h-auto text-orange-600 hover:text-orange-800 font-medium"
          onClick={() => toggleDescription(id)}
        >
          Show more
        </Button>
      </div>
    );
  };

  // Reset fallback state when category image changes
  useEffect(() => {
    setImageError(false);
  }, [selectedCategory?.image]);

  // Register the search handler with the global context
  setSearchHandler(handleSearchChange);

  console.log('🎨 Current selectedCategory state:', selectedCategory);

  return (
    <div
      className="flex flex-col md:flex-row md:items-start w-full px-2 md:px-8 py-10 min-h-screen">
      {/* Desktop: Category Sidebar */}
      <div className="hidden md:block shrink-0 sticky top-8 self-start">
        <DesktopCategoryFilters
          onFiltersChange={handleFiltersChange}
          onClearCategory={handleClearCategoryFilter}
        />
      </div>
      {/* Main Content: Ads List */}
      <div className="flex-1 min-w-0">
        {/* Category Description Header */}
        {selectedCategory && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Show Category Info only when no subcategories are selected */}
            {selectedSubcategories.length === 0 && (
              <>
                {/* Category Details Section */}
                <div className="p-6">
                  {/* Category Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant="outline"
                      className="rounded-full border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClearCategoryFilter}
                        className="h-4 w-4 p-4 hover:bg-orange-200 rounded-full text-orange-600 hover:text-orange-800"
                        aria-label="Clear category filter"
                        title="Clear category filter"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium">{selectedCategory.name}</span>
                    </Badge>
                    {/* if image is not null show it else show a default image */}
                    {selectedCategory.image && !imageError ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${selectedCategory.image}`}
                        alt={selectedCategory.name}
                        width={100}
                        height={100}
                        className="w-32 h-16 rounded-md overflow-hidden flex-shrink-0 object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <Image
                        src="https://placehold.co/800x400.png?text=Hajjar+Bashi&font=poppins"
                        alt="Placeholder"
                        width={100}
                        height={100}
                        className="w-32 h-16 rounded-md overflow-hidden flex-shrink-0 object-cover"
                        unoptimized
                      />
                    )}
                  </div>

                  {/* Category Name and Description */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {selectedCategory.name}
                    </h2>
                    {selectedCategory.description ? (
                      renderDescription(selectedCategory.description, `category-${selectedCategory.id}`)
                    ) : (
                      <div className="text-gray-600 leading-relaxed space-y-2">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Subcategories Section - Only show when no subcategories are selected */}
            {selectedCategory.children && selectedCategory.children.length > 0 && selectedSubcategories.length === 0 && (
              <div className="border-t border-gray-200 p-6">
                <div className="grid grid-cols-6 gap-4">
                  {selectedCategory.children.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="flex items-center gap-3 p-3 rounded-full border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer"
                      onClick={() => handleSubcategoryToggle(subcategory)}
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
                      <span className="text-sm font-medium truncate text-gray-900">
                        {subcategory.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Subcategories Display */}
            {selectedSubcategories.length > 0 && (
              <div className={`${selectedSubcategories.length > 0 ? 'border-t border-gray-200 pt-6' : ''} space-y-4`}>
                {selectedSubcategories.map((subcategory) => (
                  <div key={subcategory.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mx-6 mb-6">
                    <div className="p-6">
                      {/* Subcategory Tag */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge
                          variant="outline"
                          className="rounded-full border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleClearSubcategoryFilter(subcategory.id)}
                            className="h-4 w-4 p-4 hover:bg-orange-200 rounded-full text-orange-600 hover:text-orange-800"
                            aria-label="Clear subcategory filter"
                            title="Clear subcategory filter"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium">{subcategory.name}</span>
                        </Badge>
                        {/* Subcategory Image */}
                        {subcategory.image ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${subcategory.image}`}
                            alt={subcategory.name}
                            width={100}
                            height={100}
                            className="w-32 h-16 rounded-md overflow-hidden flex-shrink-0 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Image
                            src="https://placehold.co/800x400.png?text=Subcategory&font=poppins"
                            alt="Placeholder"
                            width={100}
                            height={100}
                            className="w-32 h-16 rounded-md overflow-hidden flex-shrink-0 object-cover"
                            unoptimized
                          />
                        )}
                      </div>

                      {/* Subcategory Name and Description */}
                      <div className="mb-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-3">
                          {subcategory.name}
                        </h4>
                        {subcategory.description ? (
                          renderDescription(subcategory.description, `subcategory-${subcategory.id}`)
                        ) : (
                          <div className="text-gray-600 leading-relaxed space-y-2">
                            <p>This subcategory contains specialized products and materials related to {subcategory.name}.</p>
                            <p>Explore our collection of high-quality items in this category.</p>
                          </div>
                        )}
                      </div>

                      {/* Subcategory Link */}
                      <div className=" border-gray-200 pt-4 flex justify-center">
                        <Link href={`/subcategory/${generateSlug(subcategory.name)}`}>
                          <Button
                            variant="outline"
                            className="rounded-full hover:bg-orange-50"
                          >
                            <Plus className="w-4 h-4" />
                            More about {subcategory.name}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
