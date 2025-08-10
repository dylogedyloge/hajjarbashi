"use client";
import AdCard from "./ad-card";
// import DesktopFilters from "./sortSearchFilters/desktop/desktop-filters";
import DesktopSortAndCheckboxFilters from "./sortSearchFilters/desktop/desktop-sort-and-checkbox-filters";
import { useLocale } from "next-intl";
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchAds } from "@/lib/advertisements";
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

import type { Ad, AdsFilters } from "@/types/ads";

interface AdsListProps {
  filters?: AdsFilters;
  onExpressFilterChange?: (express: boolean) => void;
  onFeaturedFilterChange?: (featured: boolean) => void;
  expressFilter?: boolean;
  featuredFilter?: boolean;
}

import type { PaginationData } from "@/types/common";

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
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'list' | 'grid'>('grid');
  const [sort, setSort] = useState<string>("latest");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Use limit 2 for testing as requested
  const ITEMS_PER_PAGE = 2;
  
  // Ref for scroll detection
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
  };

  const fetchAdsData = useCallback(async (page: number, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    
    try {
      const res = await fetchAds({ 
        limit: ITEMS_PER_PAGE, 
        page, 
        locale, 
        token: token || undefined,
        sort,
        ...filters
      });
      

      
      // Handle new API response structure with data.list
      const adsList = res.data?.list || res.data || [];
      
             if (isLoadMore) {
         setAds(prev => [...prev, ...adsList]);
       } else {
         setAds(adsList as Ad[]);
       }
       
       // Set pagination data if available
       if (res.data?.pagination) {
         setPaginationData(res.data.pagination);
         console.log('📊 Pagination data set:', res.data.pagination);
       } else {
         // If no pagination data from API, create it based on the response
         const totalItems = res.data?.total || 0;
         const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
         const paginationInfo = {
           current_page: page,
           total_pages: totalPages,
           total_items: totalItems,
           items_per_page: ITEMS_PER_PAGE
         };
         setPaginationData(paginationInfo);
         console.log('📊 Created pagination data:', paginationInfo);
       }
       
       // Update hasMore state using the total from API response
       const totalItems = res.data?.total || 0;
       
       if (isLoadMore) {
         // For load more, check if we have more items to load
         const currentTotalLoaded = ads.length + adsList.length;
         const hasMoreItems = currentTotalLoaded < totalItems;
         setHasMore(hasMoreItems);
         console.log('🔄 Load More - Total Items:', totalItems, 'Loaded:', currentTotalLoaded, 'Has More:', hasMoreItems);
       } else {
         // For initial load, check if there are more items than what we loaded
         const hasMoreItems = totalItems > adsList.length;
         setHasMore(hasMoreItems);
       }
      
    } catch (err) {

      setError(err instanceof Error ? err.message : "Failed to load ads");
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [locale, token, filters, sort, ITEMS_PER_PAGE]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (loadingRef.current && hasMore && !loadingMore) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasMore && !loadingMore) {

            handleLoadMore();
          }
        },
        {
          root: null,
          rootMargin: '100px', // Start loading 100px before reaching the bottom
          threshold: 0.1,
        }
      );

      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore]);

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchAdsData(1);
  }, [fetchAdsData]);

  if (loading) return <div className="text-center py-8">Loading ads...</div>;
  if (error) return <div className="text-center text-destructive py-8">{error}</div>;

  // Check if there are any active filters
  const hasActiveFilters = Object.keys(filters).length > 0;

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAdsData(page);
  };

  // Handle load more (lazy loading)
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchAdsData(nextPage, true);
    }
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!paginationData) {
      return [];
    }
    
    const items = [];
    const totalPages = paginationData.total_pages;
    const currentPageNum = paginationData.current_page;
    
    
    // Always show first page
    items.push(1);
    
    // Show ellipsis if there's a gap
    if (currentPageNum > 3) {
      items.push('ellipsis1');
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPageNum - 1); i <= Math.min(totalPages - 1, currentPageNum + 1); i++) {
      if (!items.includes(i)) {
        items.push(i);
      }
    }
    
    // Show ellipsis if there's a gap
    if (currentPageNum < totalPages - 2) {
      items.push('ellipsis2');
    }
    
    // Always show last page if there are more than 1 page
    if (totalPages > 1) {
      items.push(totalPages);
    }
    return items;
  };

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
      

      {/* Ads Container */}
      {ads.length > 0 ? (
        <>
          <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-8'}>
            {ads.map((ad) => (
              <Link key={ad.id} href={`/ads/${ad.id}`} className="block">
                <AdCard ad={ad} isGrid={layout === 'grid'} />
              </Link>
            ))}
          </div>
          
                     {/* Infinite Scroll Loading Indicator */}
           {hasMore && (
             <div 
               ref={loadingRef}
               className="flex justify-center mt-8 py-4"
             >
               {loadingMore ? (
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   Loading more ads...
                 </div>
               ) : (
                 <div className="h-4" /> // Invisible element for intersection observer
               )}
             </div>
           )}
          
          {/* Pagination */}
          {(paginationData && paginationData.total_pages > 1) && (
            <div className="flex justify-center mt-8">
              <div className="flex flex-col items-center gap-4">
                {/* Debug info */}
                {/* <div className="text-xs text-muted-foreground">
                  Debug: Current Page: {currentPage}, Total Pages: {paginationData.total_pages}, Total Items: {paginationData.total_items}
                </div> */}
                
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
                           if (paginationData && currentPage < paginationData.total_pages && hasMore) {
                             handlePageChange(currentPage + 1);
                           }
                         }}
                         className={paginationData && (currentPage >= paginationData.total_pages || !hasMore) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                       />
                     </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
          
                     {/* Results Info */}
           {paginationData && (
             <div className="text-center text-sm text-muted-foreground mt-4">
               {t("showingResults", { current: ads.length, total: paginationData.total_items })}
               {!hasMore && paginationData.total_items > ads.length && (
                 <span className="ml-2 text-green-600">{t("allAdsLoaded")}</span>
               )}
             </div>
           )}
          
          {/* Simple Pagination Fallback */}
          {(!paginationData || paginationData.total_pages <= 1) && ads.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex flex-col items-center gap-4">
                {/* <div className="text-xs text-muted-foreground">
                  Debug: No pagination data or only 1 page. Ads count: {ads.length}
                </div> */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("previous")}
                  </button>
                  <span className="px-3 py-2 text-sm">{t("page", { page: currentPage })}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-2 text-sm border rounded-md"
                  >
                    {t("next")}
                  </button>
                </div>
              </div>
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
              onClick={() => window.location.reload()}
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
