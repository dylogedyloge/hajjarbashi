"use client";
import AdCard from "./ad-card";
import DesktopFilters from "./sortSearchFilters/desktop/desktop-filters";
import DesktopSortAndCheckboxFilters from "./sortSearchFilters/desktop/desktop-sort-and-checkbox-filters";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { fetchAds } from "@/lib/advertisements";
import MobileSearchAndFilter from "./sortSearchFilters/mobile/mobile-search-and-filter";
import MobileCategoryFilters from "./sortSearchFilters/mobile/mobile-category-filters";

const AdsList = () => {
  const locale = useLocale();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAds({ limit: 10, page: 1, locale })
      .then((res) => setAds(res.data || []))
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
