"use client";
import AdCard from "./ad-card";
import DesktopFilters from "./sortSearchFilters/desktop/desktop-filters";
import DesktopSortAndCheckboxFilters from "./sortSearchFilters/desktop/desktop-sort-and-checkbox-filters";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { fetchAds } from "@/lib/advertisements";
import MobileSearchAndFilter from "./sortSearchFilters/mobile/mobile-search-and-filter";
import MobileCategoryFilters from "./sortSearchFilters/mobile/mobile-category-filters";

// Define the Ad type matching the API
export type Ad = {
  id: string;
  image?: string;
  stone_type?: string;
  origin?: string;
  form?: string;
  surface?: string | { id: string; name: string };
  source_port?: string;
  color?: string | string[];
  size?: string | { h?: number; w?: number; l?: number };
  price: number;
  price_unit?: string;
  published_at?: string;
  is_featured?: boolean;
  is_express?: boolean;
  description?: string;
  weight?: number | string;
  origin_country?: { id: string; name: string };
  origin_city?: { id: string; name: string };
  category?: { id: string; name: string };
  colors?: string[];
  media?: Array<{ media_thumb_path?: string; media_path?: string }>;
  // ...add any other fields you use
};

const AdsList = () => {
  const locale = useLocale();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAds({ limit: 10, page: 1, locale })
      .then((res) => setAds(res.data as Ad[] || []))
      .catch((err) => setError(err.message || "Failed to load ads"))
      .finally(() => setLoading(false));
  }, [locale]);

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
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
};

export default AdsList;
