import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchAds } from "@/lib/advertisements";
import type { AdsFilters } from "@/types/ads";

interface UseAdsParams {
  filters?: AdsFilters;
  sort?: string;
  locale: string;
  token?: string;
  itemsPerPage?: number;
}

export function useAds({ 
  filters = {}, 
  sort = "latest", 
  locale, 
  token, 
  itemsPerPage = 2 
}: UseAdsParams) {
  console.log('🔍 useAds hook called with filters:', filters);
  console.log('🔍 useAds hook called with sort:', sort);
  
  return useInfiniteQuery({
    queryKey: ['ads', filters, sort, locale, token],
    queryFn: ({ pageParam = 1 }) => {
      console.log('🚀 fetchAds being called with:', { 
        limit: itemsPerPage, 
        page: pageParam, 
        locale, 
        token: token || undefined,
        sort,
        ...filters
      });
      return fetchAds({ 
        limit: itemsPerPage, 
        page: pageParam, 
        locale, 
        token: token || undefined,
        sort,
        ...filters
      });
    },
    enabled: true, // Ensure query is always enabled
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalItems = lastPage.data?.total || 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
