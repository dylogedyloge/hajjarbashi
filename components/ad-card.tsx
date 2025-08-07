"use client";
import Image from "next/image";
import { Zap, Bookmark, Star } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "./ui/badge";
import { formatRelativeTime } from "@/utils/time";
import { getCountryFlag } from "@/utils/country-utils";
import { useState } from "react";

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
  const [imageError, setImageError] = useState(false);

  // Get image from cover_thumb, media array, or legacy image field
  const mediaArray = Array.isArray(ad.media) ? ad.media : [];
  const mediaImage = mediaArray.length > 0
    ? mediaArray[0].media_thumb_path || mediaArray[0].media_path
    : null;
  const rawImage = ad.cover_thumb || ad.cover || mediaImage || ad.image;
  let imageSrc = null;
  if (rawImage) {
    if (rawImage.startsWith('http')) {
      imageSrc = rawImage;
    } else if (rawImage.startsWith('/files/')) {
      imageSrc = `${process.env.NEXT_PUBLIC_API_BASE_URL}${rawImage}`;
    } else {
      imageSrc = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${rawImage}`;
    }
    console.log('AdCard image src:', imageSrc, 'raw:', rawImage, 'ad id:', ad.id, 'starts with http:', imageSrc?.startsWith('http'));
  }

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

  const handleImageError = () => {
    setImageError(true);
    // Try fallback to original image if thumbnail fails
    if (imageSrc && imageSrc.includes('-thumb')) {
      const originalImage = imageSrc.replace('-thumb', '');
      console.log('Trying fallback image:', originalImage);
      // You could implement a retry mechanism here if needed
    }
  };

  return (
    <div className="relative bg-background rounded-xl shadow-sm border border-border overflow-hidden w-full min-h-36">

      <div className="flex flex-col md:flex-row">
        {/* Left Section - Image */}
        <div className="relative md:w-48 w-full h-full min-h-50 flex-shrink-0">
          {imageSrc && imageSrc !== "" && !imageError ? (
            (() => {
              //  console.log('Rendering image for ad', ad.id, 'imageSrc:', imageSrc, 'starts with http:', imageSrc?.startsWith('http'));
              return imageSrc.startsWith('http') ? (
                <img
                  src={imageSrc}
                  alt={ad.stone_type || ad.category?.name || "Ad image"}
                  className="object-cover w-full h-full absolute inset-0"
                  onError={handleImageError}
                />
              ) : (
                <Image
                  src={imageSrc}
                  alt={ad.stone_type || ad.category?.name || "Ad image"}
                  fill
                  className="object-cover w-full h-full"
                  onError={handleImageError}
                  unoptimized
                />
              );
            })()
          ) : (
            <Image
              src="https://placehold.co/800.png?text=Hajjar+Bashi&font=poppins"
              alt="Placeholder"
              fill
              className="object-cover w-full h-full"
              unoptimized
            />
          )}

          {/* Overlay Icons */}
          <div className="absolute bottom-2 left-2 flex gap-1 z-10">
            {ad.express && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-background rounded-sm p-1 cursor-help shadow-sm">
                      <Zap className="w-4 h-4 text-red-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("express")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {ad.bookmarked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-background rounded-sm p-1 cursor-help shadow-sm">
                      <Bookmark className="w-4 h-4 text-blue-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("bookmarked")}</p>
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
                    <p>{t("featured")}</p>
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
              {(ad.colors || ad.category?.colors || []).map((color, index) => {
                const colorMap: Record<string, { bg: string; name: string }> = {
                  black: { bg: "bg-black", name: t("black") },
                  white: { bg: "bg-white", name: t("white") },
                  gray: { bg: "bg-gray-500", name: t("gray") },
                  green: { bg: "bg-green-500", name: t("green") },
                  blue: { bg: "bg-blue-500", name: t("blue") },
                  red: { bg: "bg-red-500", name: t("red") },
                  yellow: { bg: "bg-yellow-500", name: t("yellow") },
                  orange: { bg: "bg-orange-500", name: t("orange") },
                  purple: { bg: "bg-purple-500", name: t("purple") },
                  pink: { bg: "bg-pink-500", name: t("pink") },
                  brown: { bg: "bg-amber-700", name: t("brown") },
                  beige: { bg: "bg-amber-200", name: t("beige") },
                  cream: { bg: "bg-yellow-100", name: t("cream") },
                  gold: { bg: "bg-yellow-400", name: t("gold") },
                  silver: { bg: "bg-gray-400", name: t("silver") },
                  bronze: { bg: "bg-orange-700", name: t("bronze") }
                };

                const colorInfo = colorMap[color.toLowerCase()] || { bg: "bg-gray-400", name: color };

                return (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`w-3 h-3 ${colorInfo.bg} rounded-full border border-white cursor-help`}></div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{colorInfo.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-foreground mb-2 text-lg">
            {ad.stone_type || ad.category?.name || t("defaultProductName")}
          </h3>

          {/* Description - Always show, clamp lines based on view */}
          <p className={`text-sm text-muted-foreground mb-4 ${isGrid ? 'line-clamp-2' : 'line-clamp-4'}`}>
            {ad.description || t("defaultDescription")}
          </p>

          {/* Specifications Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {ad.size && typeof ad.size === "object" && (
              <Badge variant="secondary" className="text-xs">
                {ad.size.h ?? "-"}×{ad.size.w ?? "-"}×{ad.size.l ?? "-"} {t("cm")}
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
              <span className="font-bold text-foreground text-xl">
                {locale === "fa"
                  ? `${ad.price?.toLocaleString?.()} $`
                  : `$ ${ad.price?.toLocaleString?.()}`}
              </span>
              <span className="text-muted-foreground text-sm">
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
