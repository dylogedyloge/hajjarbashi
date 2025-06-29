import AdsList from "@/components/ads-list";
import DesktopCategoryFilters from "@/components/sortSearchFilters/desktop/desktop-category-filters";

export default function Home() {
  return (
    <div className="py-10 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      <div className="hidden md:block md:w-[350px] w-full flex-shrink-0">
        <DesktopCategoryFilters />
      </div>
      <div className="flex-1">
        <AdsList />
      </div>
    </div>
  );
}
