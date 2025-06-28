import AdCard from "./ad-card";
import Filters from "./filters";
import SortAndCheckboxFilters from "./sort-and-checkbox-filters";
import { useLocale } from "next-intl";
import { adsEn } from "../dummyData/ads-en";
import { adsFa } from "../dummyData/ads-fa";

const AdsList = () => {
  const locale = useLocale();
  const ads = locale === "fa" ? adsFa : adsEn;
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <Filters />
      <SortAndCheckboxFilters />
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
};

export default AdsList;
