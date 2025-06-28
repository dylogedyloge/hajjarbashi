import AdCard from "./ad-card";
import Filters from "./filters";
import SortAndCheckboxFilters from "./sort-and-checkbox-filters";
import { useLocale } from "next-intl";
import { adsEn } from "../dummyData/ads-en";
import { adsFa } from "../dummyData/ads-fa";
import SearchAndFilter from "./SearchAndFilter";
import BadgeFilters from "./BadgeFilters";

const AdsList = () => {
  const locale = useLocale();
  const ads = locale === "fa" ? adsFa : adsEn;
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto px-8">
      {/* Mobile: Search and Badge Filters */}
      <div className="md:hidden flex flex-col gap-2">
        <SearchAndFilter />
        <BadgeFilters />
      </div>
      {/* Desktop: Filters and Sort */}
      <div className="hidden md:block">
        <Filters />
      </div>
      <div className="hidden md:block">
        <SortAndCheckboxFilters />
      </div>
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
};

export default AdsList;
