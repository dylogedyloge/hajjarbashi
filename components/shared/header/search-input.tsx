"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Magnifier as MagnifierIcon } from "@/components/icons";
import { cn } from "@/utils/cn";

interface SearchInputProps {
  onSearchChange?: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = ({ 
  onSearchChange, 
  placeholder,
  className 
}: SearchInputProps) => {
  const t = useTranslations("Header");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Trigger search when debounced term changes
  useEffect(() => {
    if (onSearchChange && debouncedSearchTerm !== undefined) {
      setIsLoading(true);
      onSearchChange(debouncedSearchTerm);
      // Simulate loading delay for better UX
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(loadingTimer);
    }
  }, [debouncedSearchTerm, onSearchChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    if (onSearchChange) {
      onSearchChange("");
    }
  }, [onSearchChange]);

  return (
    <div className={cn("relative flex items-center w-full max-w-md", className)}>
      {isLoading ? (
        <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 animate-spin" />
      ) : (
        <MagnifierIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
      )}
      <Input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder={placeholder || t("searchPlaceholder")}
        className={cn(
          "w-full pl-10 pr-4 py-2 bg-muted/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm placeholder:text-muted-foreground",
          isLoading && "pr-10" // Extra padding for loading state
        )}
      />
      {searchTerm && (
        <button
          onClick={handleClearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          type="button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchInput;
