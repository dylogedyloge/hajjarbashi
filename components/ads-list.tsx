import AdCard from "./ad-card";
<<<<<<< HEAD
import Filters from "./filters";
import SortAndCheckboxFilters from "./sort-and-checkbox-filters";
import { useLocale } from "next-intl";
import { adsEn } from "../dummyData/ads-en";
import { adsFa } from "../dummyData/ads-fa";
=======
import DesktopFilters from "./sortSearchFilters/desktop/desktop-filters";
import DesktopSortAndCheckboxFilters from "./sortSearchFilters/desktop/desktop-sort-and-checkbox-filters";
import { useLocale } from "next-intl";
import { adsEn } from "../dummyData/ads-en";
import { adsFa } from "../dummyData/ads-fa";
import MobileSearchAndFilter from "./sortSearchFilters/mobile/mobile-search-and-filter";
import MobileCategoryFilters from "./sortSearchFilters/mobile/mobile-category-filters";
>>>>>>> 5c02b4e141f922317fbffb67e446b6978a417093

const AdsList = () => {
  const locale = useLocale();
  const ads = locale === "fa" ? adsFa : adsEn;
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
