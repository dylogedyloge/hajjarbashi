"use client";
import AdCard from "./ad-card";
import DesktopFilters from "./sortSearchFilters/desktop/desktop-filters";
import DesktopSortAndCheckboxFilters from "./sortSearchFilters/desktop/desktop-sort-and-checkbox-filters";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { fetchAds } from "@/lib/advertisements";
import MobileSearchAndFilter from "./sortSearchFilters/mobile/mobile-search-and-filter";
import MobileCategoryFilters from "./sortSearchFilters/mobile/mobile-category-filters";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

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

const AdsList = () => {
  const locale = useLocale();
  const { token } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAds({ limit: 10, page: 1, locale, token: token || undefined })
      .then((res) => {
        // Handle new API response structure with data.list
        const adsList = res.data?.list || res.data || [];
        setAds(adsList as Ad[]);
      })
      .catch((err) => setError(err.message || "Failed to load ads"))
      .finally(() => setLoading(false));
  }, [locale, token]);

  if (loading) return <div className="text-center py-8">Loading ads...</div>;
  if (error) return <div className="text-center text-destructive py-8">{error}</div>;

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto px-8">
      {/* Mobile: Search and Badge Filters */}
      <div className="md:hidden flex flex-col gap-2">
        <MobileSearchAndFilter />
        <MobileCategoryFilters />
      </div>
      {/* Desktop: Filters and Sort */}
      <div className="hidden md:block">
        <DesktopFilters />
      </div>
      <div className="hidden md:block">
        <DesktopSortAndCheckboxFilters />
      </div>
      
      {/* Layout Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <Button
            variant={layout === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLayout('list')}
            className="h-8 px-3"
          >
            <List className="w-4 h-4" />
            <span className="ml-2 text-xs">List</span>
          </Button>
          <Button
            variant={layout === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLayout('grid')}
            className="h-8 px-3"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="ml-2 text-xs">Grid</span>
          </Button>
        </div>
      </div>
      
      {/* Ads Container */}
      <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-8'}>
        {ads.map((ad) => (
          <Link key={ad.id} href={`/ads/${ad.id}`} className="block">
            <AdCard ad={ad} isGrid={layout === 'grid'} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdsList;
