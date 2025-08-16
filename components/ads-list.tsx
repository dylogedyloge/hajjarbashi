"use client";
import AdCard from "./ad-card";
// import DesktopFilters from "./sortSearchFilters/desktop/desktop-filters";
import DesktopSortAndCheckboxFilters from "./sortSearchFilters/desktop/desktop-sort-and-checkbox-filters";
import { useLocale } from "next-intl";
import { useState } from "react";
import MobileSearchAndFilter from "./sortSearchFilters/mobile/mobile-search-and-filter";
import MobileCategoryFilters from "./sortSearchFilters/mobile/mobile-category-filters";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Search, Filter, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslations } from "next-intl";
import { useAds } from "@/hooks/useAds";

import type { Ad, AdsFilters } from "@/types/ads";

interface AdsListProps {
  filters?: AdsFilters;
  onExpressFilterChange?: (express: boolean) => void;
  onFeaturedFilterChange?: (featured: boolean) => void;
  expressFilter?: boolean;
  featuredFilter?: boolean;
}

const AdsList = ({ 
  filters = {}, 
  onExpressFilterChange,
  onFeaturedFilterChange,
  expressFilter = false,
  featuredFilter = false
}: AdsListProps) => {
  const t = useTranslations("AdsList");
  const locale = useLocale();
  const { token } = useAuth();
  const [layout, setLayout] = useState<'list' | 'grid'>('grid');
  const [sort, setSort] = useState<string>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMode, setPaginationMode] = useState<'pagination' | 'infinite'>('infinite');
  
  // Use React Query for fetching ads
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useAds({
    filters,
    sort,
    locale,
    token: token || undefined,
    itemsPerPage: 2
  });

  // Flatten all pages data into a single array for infinite scroll
  const allAds = data?.pages.flatMap(page => page.data?.list || page.data || []) || [];
  
  // Get current page data for pagination mode
  const currentPageData = data?.pages[currentPage - 1];
  const ads = paginationMode === 'pagination' ? (currentPageData?.data?.list || currentPageData?.data || []) : allAds;

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Check if there are any active filters
  const hasActiveFilters = Object.keys(filters).length > 0;

  // Handle page change for pagination mode
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Fetch the specific page if it doesn't exist in cache
    if (!data?.pages[page - 1]) {
      // This will trigger React Query to fetch the missing page
      refetch();
    }
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!data?.pages[0]?.data?.total) {
      return [];
    }
    
    const items = [];
    const totalItems = data.pages[0].data.total;
    const totalPages = Math.ceil(totalItems / 2); // itemsPerPage = 2
    
    // Always show first page
    items.push(1);
    
    // Show ellipsis if there's a gap
    if (currentPage > 3) {
      items.push('ellipsis1');
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!items.includes(i)) {
        items.push(i);
      }
    }
    
    // Show ellipsis if there's a gap
    if (currentPage < totalPages - 2) {
      items.push('ellipsis2');
    }
    
    // Always show last page if there are more than 1 page
    if (totalPages > 1) {
      items.push(totalPages);
    }
    return items;
  };

  if (isLoading) return <div className="text-center py-8">Loading ads...</div>;
  if (isError) return <div className="text-center text-destructive py-8">{(error as Error)?.message || "Failed to load ads"}</div>;

  return (
    <div className="flex flex-col gap-8 w-full px-4">
      {/* Mobile: Search and Badge Filters */}
      <div className="md:hidden flex flex-col gap-2">
        <MobileSearchAndFilter />
        <MobileCategoryFilters />
      </div>
      {/* Desktop: Filters and Sort */}
      {/* <div className="hidden md:block">
        <DesktopFilters />
      </div> */}
      <div className="hidden md:block">
        <DesktopSortAndCheckboxFilters 
          viewMode={layout} 
          onViewModeChange={setLayout}
          onExpressFilterChange={onExpressFilterChange}
          onFeaturedFilterChange={onFeaturedFilterChange}
          onSortChange={handleSortChange}
          expressFilter={expressFilter}
          featuredFilter={featuredFilter}
          selectedSort={sort}
        />
      </div>
      
      {/* Pagination Mode Toggle */}
      {/* <div className="flex justify-center gap-2">
        <button
          onClick={() => setPaginationMode('pagination')}
          className={`px-3 py-1 text-sm rounded-md ${
            paginationMode === 'pagination' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          Pagination
        </button>
        <button
          onClick={() => setPaginationMode('infinite')}
          className={`px-3 py-1 text-sm rounded-md ${
            paginationMode === 'infinite' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          Infinite Scroll
        </button>
      </div> */}

      {/* Ads Container */}
      {ads.length > 0 ? (
        <>
          <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-8'}>
            {ads.map((ad: Ad) => (
              <Link key={ad.id} href={`/ads/${ad.id}`} className="block">
                <AdCard ad={ad} isGrid={layout === 'grid'} />
              </Link>
            ))}
          </div>
          
          {/* Pagination Mode */}
          {paginationMode === 'pagination' && data?.pages[0]?.data?.total && (
            <>
              {/* Pagination Controls */}
              {generatePaginationItems().length > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex flex-col items-center gap-4">
                    <Pagination>
                      <PaginationContent>
                        {/* Previous Button */}
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) {
                                handlePageChange(currentPage - 1);
                              }
                            }}
                            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {/* Page Numbers */}
                        {generatePaginationItems().map((item, index) => (
                          <PaginationItem key={index}>
                            {item === 'ellipsis1' || item === 'ellipsis2' ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(item as number);
                                }}
                                isActive={currentPage === item}
                                className="cursor-pointer"
                              >
                                {item}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}
                        
                        {/* Next Button */}
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              const totalPages = Math.ceil((data.pages[0].data.total || 0) / 2);
                              if (currentPage < totalPages) {
                                handlePageChange(currentPage + 1);
                              }
                            }}
                            className={currentPage >= Math.ceil((data.pages[0].data.total || 0) / 2) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Infinite Scroll Mode */}
          {paginationMode === 'infinite' && hasNextPage && (
            <div className="flex justify-center mt-8 py-4">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading more ads...
                </div>
              ) : (
                <button
                  onClick={() => fetchNextPage()}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                >
                  Load More
                </button>
              )}
            </div>
          )}
          
          {/* Results Info */}
          {data?.pages[0]?.data?.total && (
            <div className="text-center text-sm text-muted-foreground mt-4">
              {paginationMode === 'pagination' ? (
                t("showingResults", { 
                  current: ads.length, 
                  total: data.pages[0].data.total 
                })
              ) : (
                t("showingResults", { 
                  current: allAds.length, 
                  total: data.pages[0].data.total 
                })
              )}
              {paginationMode === 'infinite' && !hasNextPage && data.pages[0].data.total > allAds.length && (
                <span className="ml-2 text-green-600">{t("allAdsLoaded")}</span>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            {hasActiveFilters ? (
              <Filter className="w-8 h-8 text-muted-foreground" />
            ) : (
              <Search className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {hasActiveFilters ? t("noMatchingAds") : t("noAdsAvailable")}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {hasActiveFilters 
              ? t("tryAdjustingFilters")
              : t("checkBackLater")
            }
          </p>
          {hasActiveFilters && (
            <button 
              onClick={() => refetch()}
              className="mt-4 text-sm text-primary hover:text-primary/80 underline"
            >
              {t("clearAllFilters")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdsList;
