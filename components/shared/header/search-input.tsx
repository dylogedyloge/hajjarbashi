import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchInput = () => {
  const t = useTranslations("Header");
  return (
    <div className="flex items-center w-full max-w-xl bg-muted rounded-full border border-border px-4 py-2 h-10">
      <Search className="text-muted-foreground" size={20} />
      <Input
        type="text"
        placeholder={t("searchPlaceholder")}
        className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground"
      />
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-muted hover:bg-accent transition-colors"
        aria-label={t("clear")}
      >
        <X size={20} className="text-muted-foreground" />
      </Button>
    </div>
  );
};

export default SearchInput;
