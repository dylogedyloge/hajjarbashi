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
    image?: string;
    stone_type?: string;
    origin?: string;
    form?: string;
    surface?: string | { id: string; name: string };
    source_port?: string;
    color?: string | string[];
    size?: string | { h?: number; w?: number; l?: number };
    price: number;
    price_unit?: string;
    published_at?: string;
    is_featured?: boolean;
    is_express?: boolean;
    description?: string;
    weight?: number | string;
    origin_country?: { id: string; name: string };
    origin_city?: { id: string; name: string };
    category?: { id: string; name: string };
    colors?: string[];
    media?: Array<{ media_thumb_path?: string; media_path?: string }>;
    bookmarked?: boolean;
  };
  onBookmarkChange?: (isBookmarked: boolean) => void;
  isFromBookmarksPage?: boolean;
}

const AdCard = ({ ad, onBookmarkChange, isFromBookmarksPage = false }: AdCardProps) => {
  const t = useTranslations("AdCard");
  const locale = useLocale();
  const { user, token, isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(ad.bookmarked || isFromBookmarksPage);
  const [isBookmarking, setIsBookmarking] = useState(false);
  
  // Prefer ad.colors (array) over ad.color (string)
  const colorArray = Array.isArray(ad.colors)
    ? ad.colors
    : typeof ad.color === "string"
    ? ad.color.split(/[,\s]+/).filter(Boolean)
    : [];
  // Prefer first media image if available
  const mediaArray = Array.isArray(ad.media) ? ad.media as Array<{ media_thumb_path?: string; media_path?: string }> : [];
  const mediaImage = mediaArray.length > 0
    ? mediaArray[0].media_thumb_path || mediaArray[0].media_path
    : null;
  const imageSrc = mediaImage
    ? (mediaImage.startsWith("http") ? mediaImage : `https://api.hajjardevs.ir/${mediaImage}`)
    : ad.image;

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
              /{ad.price_unit?.toLowerCase?.()}
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
            <Clock size={16} /> {ad.published_at}
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
                <div className="font-bold">{typeof ad.surface === "object" ? ad.surface.name : ad.surface}</div>
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
