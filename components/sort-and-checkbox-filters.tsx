import { Checkbox } from "@/components/ui/checkbox";
import { ArrowDownUp } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

const SortAndCheckboxFilters = () => {
  const t = useTranslations("SortFilters");
  return (
    <div className="w-full flex flex-row items-center gap-6 py-2 px-2">
      <Select>
        <SelectTrigger className="w-48 h-10 rounded-md border px-4 flex items-center gap-2">
          <ArrowDownUp className="size-5 mr-1 text-muted-foreground" />
          <SelectValue placeholder={t("sortByLatest")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">{t("latest")}</SelectItem>
          <SelectItem value="price-low">{t("priceLowToHigh")}</SelectItem>
          <SelectItem value="price-high">{t("priceHighToLow")}</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <Checkbox id="express" />
        <label
          htmlFor="express"
          className="text-sm font-normal text-foreground cursor-pointer select-none"
        >
          {t("expressDelivery")}
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="featured" />
        <label
          htmlFor="featured"
          className="text-sm font-normal text-foreground cursor-pointer select-none"
        >
          {t("featuredOnly")}
        </label>
      </div>
    </div>
  );
};

export default SortAndCheckboxFilters;
