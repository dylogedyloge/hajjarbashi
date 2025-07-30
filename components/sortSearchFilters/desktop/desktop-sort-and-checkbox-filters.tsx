"use client";
import { useState } from "react";
import { ArrowDownUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";
import Grid from "@/components/icons/Grid";
import List from "@/components/icons/List";
import Star from "@/components/icons/Gemini";



interface DesktopSortAndCheckboxFiltersProps {
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  onExpressFilterChange?: (express: boolean) => void;
  onFeaturedFilterChange?: (featured: boolean) => void;
  onSortChange?: (sort: string) => void;
  expressFilter?: boolean;
  featuredFilter?: boolean;
  selectedSort?: string;
}

const DesktopSortAndCheckboxFilters = ({ 
  viewMode = "grid", 
  onViewModeChange,
  onExpressFilterChange,
  onFeaturedFilterChange,
  onSortChange,
  expressFilter = false,
  featuredFilter = false,
  selectedSort = "latest"
}: DesktopSortAndCheckboxFiltersProps) => {
  const t = useTranslations("DesktopSortAndCheckboxFilters");
  const [sortValue, setSortValue] = useState<string>(selectedSort);

  const handleSortChange = (value: string) => {
    setSortValue(value);
    onSortChange?.(value);
  };

  return (
    <div className="w-full flex flex-row items-center gap-6 py-2 px-2">
      {/* Sorting Section */}
      <div className="flex items-center gap-2">
        <ArrowDownUp className="size-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t("sortBy")}</span>
        <Select value={sortValue} onValueChange={handleSortChange}>
          <SelectTrigger className="w-32 h-8 border-muted">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">{t("latest")}</SelectItem>
            <SelectItem value="oldest">{t("oldest")}</SelectItem>
            <SelectItem value="cheapest">{t("priceLowToHigh")}</SelectItem>
            <SelectItem value="most_expensive">{t("priceHighToLow")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter Buttons Section */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white active:bg-orange-600 active:text-white transition-colors",
            expressFilter 
              ? "bg-orange-600 text-white border-orange-600" 
              : "bg-white"
          )}
          onClick={() => onExpressFilterChange?.(!expressFilter)}
        >
          <Zap className="w-4 h-4 mr-1" />
          {t("expressDelivery")}
        </Button>
        <Button
          variant={featuredFilter ? "default" : "outline"}
          size="sm"
          className={cn(
           "h-8 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white active:bg-orange-600 active:text-white transition-colors",
            featuredFilter 
              ? "bg-orange-600 text-white border-orange-600" 
              : "bg-white"
          )}
          onClick={() => onFeaturedFilterChange?.(!featuredFilter)}
        >
          <Star className="w-4 h-4 mr-1" />
          {t("featuredOnly")}
        </Button>
      </div>

      {/* View Toggle Section */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm text-muted-foreground">{t("view")}</span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              viewMode === "grid" 
                ? "bg-orange-50 border-orange-200 text-orange-600" 
                : "border-muted"
            )}
            onClick={() => onViewModeChange?.("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              viewMode === "list" 
                ? "bg-orange-50 border-orange-200 text-orange-600" 
                : "border-muted"
            )}
            onClick={() => onViewModeChange?.("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DesktopSortAndCheckboxFilters;
