import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerClose,
  DrawerTitle,
} from "@/components/ui/drawer";
import MobileDrawerFilters from "./MobileDrawerFilters";
import { useTranslations } from "next-intl";

const SearchAndFilter = () => {
  const t = useTranslations("SearchAndFilter");
  return (
    <Drawer direction="bottom">
      <div className="flex items-center bg-background border border-border rounded-full px-3 py-2 w-full shadow-sm">
        <Search className="text-muted-foreground mr-2" size={20} />
        <div className="flex-1 flex flex-col">
          <Textarea
            placeholder={t("searchPlaceholder")}
            rows={2}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus:ring-0 focus:border-0 resize-none text-sm placeholder:text-foreground/80 px-2 py-1 h-[38px] font-medium leading-tight overflow-hidden "
            style={{ minHeight: 38, maxHeight: 38 }}
          />
        </div>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-2">
            <Filter className="text-foreground" size={20} />
          </Button>
        </DrawerTrigger>
      </div>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("filterTitle")}</DrawerTitle>
        </DrawerHeader>
        {/* TODO: Add filter form UI here, styled as per design */}
        <MobileDrawerFilters />
        <DrawerFooter className="pt-2 pb-4  flex flex-row gap-4 justify-between">
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="rounded-full font-medium flex-1"
            >
              {t("resetAll")}
            </Button>
          </DrawerClose>
          <Button className="rounded-full font-medium bg-foreground text-background flex-1">
            {t("apply")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SearchAndFilter;
