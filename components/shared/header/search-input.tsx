import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

const SearchInput = () => {
  const t = useTranslations("Header");
  return (
    <div className="flex items-center w-full max-w-xl bg-muted rounded-full border border-border px-4 py-2">
      <Search className="mr-2 text-muted-foreground" size={20} />
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
      />
      <button className="ml-2 rounded-full bg-muted p-1 hover:bg-accent transition-colors">
        <span className="sr-only">{t("clear")}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-muted-foreground"
        >
          <path
            d="M6 6l8 8M6 14L14 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default SearchInput;
