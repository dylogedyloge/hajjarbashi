// import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
import { Magnifier } from "@/components/icons";

const SearchInput = () => {
  const t = useTranslations("Header");
  return (
    <div className="relative flex items-center w-full max-w-md">
      <Magnifier className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input
        type="text"
        placeholder={t("searchPlaceholder")}
        className="w-full pl-10 pr-4 py-2 bg-muted/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm placeholder:text-muted-foreground"
      />
    </div>
  );
};

export default SearchInput;
