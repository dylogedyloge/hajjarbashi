"use client";
import AdCard from "./ad-card";
// import DesktopFilters from "./sortSearchFilters/desktop/desktop-filters";
import DesktopSortAndCheckboxFilters from "./sortSearchFilters/desktop/desktop-sort-and-checkbox-filters";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { fetchAds } from "@/lib/advertisements";
import MobileSearchAndFilter from "./sortSearchFilters/mobile/mobile-search-and-filter";
import MobileCategoryFilters from "./sortSearchFilters/mobile/mobile-category-filters";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Search, Filter } from "lucide-react";

// Define the Ad type matching the API
export type Ad = {
  id: string;
  created_at?: number;
  updated_at?: number;
  weight?: number;
  sale_unit_type?: string;
  price: number;
  colors?: string[];
  category?: { 
    id: string; 
    name: string; 
    description?: string;
    image?: string;
    colors?: string[];
  };
  form?: string;
  surface?: { id: string; name: string };
  grade?: string;
  is_chat_enabled?: boolean;
  contact_info_enabled?: boolean;
  express?: boolean;
  minimum_order?: number;
  description?: string;
  origin_country?: { id: string; name: string };
  origin_city?: { id: string; name: string };
  size?: { h?: number; w?: number; l?: number };
  media?: Array<{ 
    index: number;
    media_path?: string; 
    media_thumb_path?: string 
  }>;
  cover?: string;
  cover_thumb?: string;
  benefits?: string[];
  defects?: string[];
  weight_range_type?: string;
  size_range_type?: string;
  bookmarked?: boolean;
  receiving_ports_details?: Array<{
    id: string;
    name: string;
    city_name: string | null;
    ownership: string;
  }>;
  export_ports_details?: Array<{
    id: string;
    name: string;
    city_name: string | null;
    ownership: string;
  }>;
  // Legacy fields for backward compatibility
  image?: string;
  stone_type?: string;
  origin?: string;
  source_port?: string;
  color?: string | string[];
  price_unit?: string;
  published_at?: string;
  is_featured?: boolean;
  is_express?: boolean;
};

// Define filter types
export type AdsFilters = {
  min_price?: number;
  max_price?: number;
  form?: string;
  category_ids?: string[];
  colors?: string[];
  surface_ids?: string[];
  size_range_type?: string;
  receiving_ports?: string[];
  export_ports?: string[];
  origin_country_ids?: string[];
  grade?: string;
  express?: boolean;
  promoted?: boolean;
  search_description?: string;
  sort?: string;
};

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
  const locale = useLocale();
  const { token } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'list' | 'grid'>('grid');
  const [sort, setSort] = useState<string>("latest");

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    console.log('📋 AdsList received filters:', filters);
    console.log('🎨 Color filters:', filters.colors);
    console.log('📦 Form filters:', filters.form);
    console.log('📏 Size filters:', filters.size_range_type);
    console.log('🏷️ Category filters:', filters.category_ids);
    console.log('🏗️ Surface filters:', filters.surface_ids);
    console.log('⭐ Grade filters:', filters.grade);
    console.log('🚢 Receiving Ports filters:', filters.receiving_ports);
    console.log('🚢 Export Ports filters:', filters.export_ports);
    console.log('🌎 Origin Country filters:', filters.origin_country_ids);
    
    fetchAds({ 
      limit: 10, 
      page: 1, 
      locale, 
      token: token || undefined,
      sort,
      ...filters
    })
      .then((res) => {
        console.log('📊 API Response:', res);
        console.log('📊 API Response data:', res.data);
        console.log('📊 API Response list:', res.data?.list);
        // Handle new API response structure with data.list
        const adsList = res.data?.list || res.data || [];
        console.log('📋 Ads list:', adsList);
        console.log('📋 Number of ads found:', adsList.length);
        setAds(adsList as Ad[]);
      })
      .catch((err) => {
        console.error('❌ Error fetching ads:', err);
        console.error('❌ Error details:', err.message);
        setError(err.message || "Failed to load ads");
      })
      .finally(() => setLoading(false));
  }, [locale, token, filters, sort]);

  if (loading) return <div className="text-center py-8">Loading ads...</div>;
  if (error) return <div className="text-center text-destructive py-8">{error}</div>;

  // Check if there are any active filters
  const hasActiveFilters = Object.keys(filters).length > 0;
  


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
        <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-8'}>
          {ads.map((ad) => (
            <Link key={ad.id} href={`/ads/${ad.id}`} className="block">
              <AdCard ad={ad} isGrid={layout === 'grid'} />
            </Link>
          ))}
        </div>
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
            {hasActiveFilters ? "No matching ads found" : "No ads available"}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {hasActiveFilters 
              ? "Try adjusting your filters or search criteria to find more results."
              : "Check back later for new advertisements."
            }
          </p>
          {hasActiveFilters && (
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-primary hover:text-primary/80 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdsList;
