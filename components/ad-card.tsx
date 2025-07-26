import Image from "next/image";
import { Clock, Weight, Bookmark } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { Button } from "./ui/button";
import { createBookmark, deleteBookmark } from "@/lib/advertisements";
import { useAuth } from "@/lib/auth-context";

interface AdCardProps {
  ad: {
    id: string;
    created_at?: number;
    updated_at?: number;
    weight?: number;
    sale_unit_type?: string;
    price: number;
    colors?: string[];
    category?: { 
      id: string; 
      name: string; 
      description?: string;
      image?: string;
      colors?: string[];
    };
    form?: string;
    surface?: { id: string; name: string };
    grade?: string;
    is_chat_enabled?: boolean;
    contact_info_enabled?: boolean;
    express?: boolean;
    minimum_order?: number;
    description?: string;
    origin_country?: { id: string; name: string };
    origin_city?: { id: string; name: string };
    size?: { h?: number; w?: number; l?: number };
    media?: Array<{ 
      index: number;
      media_path?: string; 
      media_thumb_path?: string 
    }>;
    cover?: string;
    cover_thumb?: string;
    benefits?: string[];
    defects?: string[];
    weight_range_type?: string;
    size_range_type?: string;
    bookmarked?: boolean;
    receiving_ports_details?: Array<{
      id: string;
      name: string;
      city_name: string | null;
      ownership: string;
    }>;
    export_ports_details?: Array<{
      id: string;
      name: string;
      city_name: string | null;
      ownership: string;
    }>;
    // Legacy fields for backward compatibility
    image?: string;
    stone_type?: string;
    origin?: string;
    source_port?: string;
    color?: string | string[];
    price_unit?: string;
    published_at?: string;
    is_featured?: boolean;
    is_express?: boolean;
  };
  onBookmarkChange?: (isBookmarked: boolean) => void;
  isFromBookmarksPage?: boolean;
}

const AdCard = ({ ad, onBookmarkChange, isFromBookmarksPage = false }: AdCardProps) => {
  const t = useTranslations("AdCard");
  const locale = useLocale();
  const {  token, isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(ad.bookmarked || isFromBookmarksPage);
  const [isBookmarking, setIsBookmarking] = useState(false);
  
  // Prefer ad.colors (array) over ad.color (string)
  const colorArray = Array.isArray(ad.colors)
    ? ad.colors
    : typeof ad.color === "string"
    ? ad.color.split(/[,\s]+/).filter(Boolean)
    : [];
  
  // Get image from cover_thumb, media array, or legacy image field
  const mediaArray = Array.isArray(ad.media) ? ad.media : [];
  const mediaImage = mediaArray.length > 0
    ? mediaArray[0].media_thumb_path || mediaArray[0].media_path
    : null;
  const imageSrc = ad.cover_thumb || ad.cover || mediaImage || ad.image
    ? (ad.cover_thumb || ad.cover || mediaImage || ad.image)?.startsWith("http") 
      ? (ad.cover_thumb || ad.cover || mediaImage || ad.image)
      : `https://api.hajjardevs.ir/${ad.cover_thumb || ad.cover || mediaImage || ad.image}`
    : null;

  // Format date from timestamp
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ad.published_at || '';
    return new Date(timestamp).toLocaleDateString();
  };

  // Get price unit from sale_unit_type
  const getPriceUnit = () => {
    return ad.sale_unit_type || ad.price_unit || 'unit';
  };

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || !token) {
      // Handle unauthenticated user - could show login prompt
      console.log("User must be authenticated to bookmark ads");
      return;
    }

    if (isBookmarking) return; // Prevent multiple simultaneous requests

    setIsBookmarking(true);
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        await deleteBookmark({
          adId: ad.id,
          locale,
          token: token,
        });
        setIsBookmarked(false);
        onBookmarkChange?.(false);
      } else {
        // Add bookmark
        await createBookmark({
          adId: ad.id,
          locale,
          token: token,
        });
        setIsBookmarked(true);
        onBookmarkChange?.(true);
      }
    } catch (error) {
      console.error('Bookmark operation failed:', error);
      // Revert the UI state on error
      setIsBookmarked(!isBookmarked);
    } finally {
      setIsBookmarking(false);
    }
  };
  return (
    <div className="relative flex flex-col md:flex-row bg-background rounded-2xl shadow-sm border border-muted overflow-hidden w-full">
      {/* Bookmark Button */}
      <Button
        onClick={handleBookmarkToggle}
        className="absolute top-3 right-3 z-10  transition-colors shadow-sm"
        aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        variant={isBookmarked ? "default" : "outline"}

      >
        <Bookmark
          className="w-5 h-5"
        />
      </Button>
      {/* Image & Badge */}
      <div className="relative md:w-80 w-full aspect-square md:aspect-auto flex-shrink-0">
        {imageSrc && imageSrc !== "" ? (
          <Image
            src={imageSrc}
            alt={ad.stone_type || ad.category?.name || "Ad image"}
            fill
            className="object-cover w-full h-full md:static md:w-80 md:h-64 rounded-2xl md:rounded-2xl md:rounded-r-none"
          />
        ) : (
          <div className="bg-muted w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
        {ad.is_featured && (
          <span className="absolute top-3 left-3 bg-sky-400 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow">
            {t("new")}
          </span>
        )}
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col p-4 md:p-8 gap-2 md:gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-foreground">
              {locale === "fa"
                ? `${ad.price?.toLocaleString?.()} ${t("usd")}`
                : `${t("usd")} ${ad.price?.toLocaleString?.()}`}
            </span>
            <span className="text-xs text-muted-foreground">
              /{getPriceUnit()?.toLowerCase?.()}
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          {ad.stone_type || ad.category?.name}
        </div>
        <div className="text-sm text-foreground line-clamp-2 md:line-clamp-3">
          {ad.description}
        </div>
        {/* Icons and Info */}
        <div className="flex items-center gap-4 text-muted-foreground text-xs mt-1">
          <span className="flex items-center gap-1">
            <Clock size={16} /> {formatDate(ad.created_at)}
          </span>
          {ad.weight && (
            <span className="flex items-center gap-1">
              <Weight size={16} /> {ad.weight} {t("kg")}
            </span>
          )}
          {/* Color dots (show if color/colors is present) */}
          {colorArray.length > 0 && (
            <span className="flex items-center gap-1">
              <TooltipProvider>
                {colorArray.map((c, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <span
                        className="w-4 h-4 rounded-full border border-muted inline-block cursor-pointer"
                        style={{ backgroundColor: c }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">{c}</TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </span>
          )}
        </div>
        {/* Overview Table */}
        <div className="mt-2">
          <div className="font-semibold text-sm mb-1">{t("overview")}</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-1 text-xs md:text-sm">
            <div>
              <div>{t("form")}</div>
              <div className="font-bold">{ad.form}</div>
            </div>
            <div>
              <div>{t("origin")}</div>
              <div className="font-bold">{ad.origin_country?.name || ad.origin}</div>
            </div>
            {colorArray.length > 0 && (
              <div>
                <div>{t("color")}</div>
                <div className="font-bold">{colorArray.join(", ")}</div>
              </div>
            )}
            {ad.surface && (
              <div>
                <div>{t("surface")}</div>
                <div className="font-bold">{ad.surface.name}</div>
              </div>
            )}
            {ad.grade && (
              <div>
                <div>{t("grade")}</div>
                <div className="font-bold">{ad.grade.toUpperCase()}</div>
              </div>
            )}
            {/* Show size as h × w × l if size is an object */}
            {ad.size && typeof ad.size === "object" && (
              <div>
                <div>{t("size")}</div>
                <div className="font-bold">
                  {ad.size.h ?? "-"} × {ad.size.w ?? "-"} × {ad.size.l ?? "-"}
                </div>
              </div>
            )}
            {ad.weight && (
              <div>
                <div>{t("weight")}</div>
                <div className="font-bold">
                  {ad.weight} {t("kg")}
                </div>
              </div>
            )}
            {ad.minimum_order && (
              <div>
                <div>{t("minOrder")}</div>
                <div className="font-bold">
                  {ad.minimum_order} {t("kg")}
                </div>
              </div>
            )}
            {ad.source_port && (
              <div>
                <div>{t("sourcePort")}</div>
                <div className="font-bold">{ad.source_port}</div>
              </div>
            )}
            {/* Show origin city if present */}
            {ad.origin_city && (
              <div>
                <div>{t("origin")}</div>
                <div className="font-bold">{ad.origin_city.name}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
