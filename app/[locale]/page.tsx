import AdsList from "@/components/ads-list";
import DesktopCategoryFilters from "@/components/sortSearchFilters/desktop/desktop-category-filters";

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:gap-8 w-full max-w-7xl mx-auto px-2 md:px-8 py-10">
      {/* Desktop: Category Sidebar */}
      <div className="hidden md:block shrink-0">
        <DesktopCategoryFilters />
      </div>
      {/* Main Content: Ads List */}
      <div className="flex-1">
        <AdsList />
      </div>
    </div>
  );
}
