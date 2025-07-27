import Image from "next/image";
import {  Zap, Bookmark, Star} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { useState } from "react";
// import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
// import { createBookmark, deleteBookmark } from "@/lib/advertisements";
// import { useAuth } from "@/lib/auth-context";
import { formatRelativeTime } from "@/utils/time";
import { getCountryFlag } from "@/utils/country-utils";

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
  isGrid?: boolean;
}

const AdCard = ({ ad,
  //  onBookmarkChange, isFromBookmarksPage = false
   isGrid = false
   }: AdCardProps) => {
  const t = useTranslations("AdCard");
  const locale = useLocale();
  // const { token, isAuthenticated } = useAuth();
  // const [isBookmarked, setIsBookmarked] = useState(ad.bookmarked || isFromBookmarksPage);
  // const [isBookmarking, setIsBookmarking] = useState(false);
  
  // Prefer ad.colors (array) over ad.color (string)
  // const colorArray = Array.isArray(ad.colors)
  //   ? ad.colors
  //   : typeof ad.color === "string"
  //   ? ad.color.split(/[,\s]+/).filter(Boolean)
  //   : [];
  
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

  // Get the appropriate date to display
  const getDisplayDate = () => {
    // Use updated_at if available, otherwise fall back to created_at
    const timestamp = ad.updated_at || ad.created_at;
    return timestamp ? formatRelativeTime(timestamp) : (ad.published_at || '');
  };

  // Get price unit from sale_unit_type
  const getPriceUnit = () => {
    return ad.sale_unit_type || ad.price_unit || 'unit';
  };

  // Get country flag component
  const getCountryFlagComponent = () => {
    return getCountryFlag(ad.origin_country?.name);
  };

  // const handleBookmarkToggle = async (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
    
  //   if (!isAuthenticated || !token) {
  //     // Handle unauthenticated user - could show login prompt
  //     console.log("User must be authenticated to bookmark ads");
  //     return;
  //   }

  //   if (isBookmarking) return; // Prevent multiple simultaneous requests

  //   setIsBookmarking(true);
    
  //   try {
  //     if (isBookmarked) {
  //       // Remove bookmark
  //       await deleteBookmark({
  //         adId: ad.id,
  //         locale,
  //         token: token,
  //       });
  //       setIsBookmarked(false);
  //       onBookmarkChange?.(false);
  //     } else {
  //       // Add bookmark
  //       await createBookmark({
  //         adId: ad.id,
  //         locale,
  //         token: token,
  //       });
  //       setIsBookmarked(true);
  //       onBookmarkChange?.(true);
  //     }
  //   } catch (error) {
  //     console.error('Bookmark operation failed:', error);
  //     // Revert the UI state on error
  //     setIsBookmarked(!isBookmarked);
  //   } finally {
  //     setIsBookmarking(false);
  //   }
  // };

  return (
    <div className="relative bg-background rounded-xl shadow-sm border border-border overflow-hidden w-full">
      {/* Bookmark Button */}
      {/* <Button
        onClick={handleBookmarkToggle}
        className="absolute top-3 right-3 z-10 transition-colors shadow-sm"
        aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        variant={isBookmarked ? "default" : "outline"}
        size="sm"
      >
        <Bookmark className="w-4 h-4" />
      </Button> */}

      <div className="flex flex-col md:flex-row">
        {/* Left Section - Image */}
        <div className="relative md:w-48 w-full aspect-square md:aspect-auto flex-shrink-0">
          {imageSrc && imageSrc !== "" ? (
            <Image
              src={imageSrc}
              alt={ad.stone_type || ad.category?.name || "Ad image"}
              fill
              className="object-cover w-full h-full md:static md:w-48 md:h-36"
            />
          ) : (
            <div className="bg-muted w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No image
            </div>
          )}
          
          {/* Overlay Icons */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {ad.express && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-white rounded-md p-1 cursor-help shadow-sm">
                      <Zap className="w-3 h-3 text-red-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Express</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {ad.bookmarked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-white rounded-md p-1 cursor-help shadow-sm">
                      <Bookmark className="w-3 h-3 text-blue-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bookmarked</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {ad.is_featured && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-white rounded-md p-1 cursor-help shadow-sm">
                      <Star className="w-3 h-3 text-yellow-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Featured</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Right Section - Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getCountryFlagComponent() || (
                <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">IR</span>
                </div>
              )}
              <span className="text-sm text-muted-foreground font-medium">
               {ad.origin_country?.name}
              </span>
            </div>
            
            {/* Status Indicators */}
            <div className="flex -space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-3 h-3 bg-black rounded-full border border-white cursor-help"></div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Black</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-3 h-3 bg-orange-500 rounded-full border border-white cursor-help"></div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Orange</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-3 h-3 bg-green-500 rounded-full border border-white cursor-help"></div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Green</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Product Title */}
          <h3 className={`font-bold text-foreground mb-2 ${isGrid ? 'text-base' : 'text-lg'}`}>
            {ad.stone_type || ad.category?.name || "Negro Marquina Travertine Blocks"}
          </h3>

          {/* Description - Only show in list view */}
          {!isGrid && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {ad.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ..."}
            </p>
          )}

          {/* Specifications Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {ad.size && typeof ad.size === "object" && (
              <Badge variant="secondary" className="text-xs">
                {ad.size.h ?? "-"}×{ad.size.w ?? "-"}×{ad.size.l ?? "-"} CM
              </Badge>
            )}
            {ad.surface && (
              <Badge variant="secondary" className="text-xs">
                {ad.surface.name}
              </Badge>
            )}
          </div>

          {/* Price and Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className={`font-bold text-foreground ${isGrid ? 'text-sm' : 'text-xl'}`}>
                {locale === "fa"
                  ? `${ad.price?.toLocaleString?.()} $`
                  : `$ ${ad.price?.toLocaleString?.()}`}
              </span>
              <span className={`text-muted-foreground ${isGrid ? 'text-xs' : 'text-sm'}`}>
                /{getPriceUnit()?.toLowerCase?.()}
              </span>
            </div>
            
            <span className="text-xs text-muted-foreground">
              {getDisplayDate()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
