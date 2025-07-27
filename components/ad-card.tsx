import Image from "next/image";
import {  Zap, Bookmark, Star} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { useState } from "react";
// import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
// import { createBookmark, deleteBookmark } from "@/lib/advertisements";
// import { useAuth } from "@/lib/auth-context";
import { formatRelativeTime } from "@/lib/utils";
import * as CountryFlags from "country-flag-icons/react/3x2";

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
  const getCountryFlag = () => {
    if (!ad.origin_country?.name) return null;
    
    // Map country names to ISO codes (case-insensitive)
    const countryToISO: Record<string, string> = {
      'iran': 'IR',
      'china': 'CN',
      'turkey': 'TR',
      'italy': 'IT',
      'spain': 'ES',
      'india': 'IN',
      'brazil': 'BR',
      'egypt': 'EG',
      'greece': 'GR',
      'portugal': 'PT',
      'united states': 'US',
      'united kingdom': 'GB',
      'germany': 'DE',
      'france': 'FR',
      'canada': 'CA',
      'australia': 'AU',
      'japan': 'JP',
      'south korea': 'KR',
      'russia': 'RU',
      'mexico': 'MX',
      'argentina': 'AR',
      'chile': 'CL',
      'peru': 'PE',
      'colombia': 'CO',
      'venezuela': 'VE',
      'uruguay': 'UY',
      'paraguay': 'PY',
      'bolivia': 'BO',
      'ecuador': 'EC',
      'guyana': 'GY',
      'suriname': 'SR',
      'french guiana': 'GF',
      'falkland islands': 'FK',
      'south georgia': 'GS',
      'bouvet island': 'BV',
      'heard island': 'HM',
      'south sandwich islands': 'SH',
      'antarctica': 'AQ',
      'afghanistan': 'AF',
      'albania': 'AL',
      'algeria': 'DZ',
      'andorra': 'AD',
      'angola': 'AO',
      'antigua and barbuda': 'AG',
      'azerbaijan': 'AZ',
      'bahamas': 'BS',
      'bahrain': 'BH',
      'bangladesh': 'BD',
      'barbados': 'BB',
      'belarus': 'BY',
      'belgium': 'BE',
      'belize': 'BZ',
      'benin': 'BJ',
      'bhutan': 'BT',
      'bosnia and herzegovina': 'BA',
      'botswana': 'BW',
      'brunei': 'BN',
      'burkina faso': 'BF',
      'burundi': 'BI',
      'cambodia': 'KH',
      'cameroon': 'CM',
      'cape verde': 'CV',
      'central african republic': 'CF',
      'chad': 'TD',
      'comoros': 'KM',
      'congo': 'CG',
      'costa rica': 'CR',
      'croatia': 'HR',
      'cuba': 'CU',
      'cyprus': 'CY',
      'czech republic': 'CZ',
      'denmark': 'DK',
      'djibouti': 'DJ',
      'dominica': 'DM',
      'dominican republic': 'DO',
      'east timor': 'TL',
      'el salvador': 'SV',
      'equatorial guinea': 'GQ',
      'eritrea': 'ER',
      'estonia': 'EE',
      'ethiopia': 'ET',
      'fiji': 'FJ',
      'finland': 'FI',
      'gabon': 'GA',
      'gambia': 'GM',
      'georgia': 'GE',
      'ghana': 'GH',
      'grenada': 'GD',
      'guatemala': 'GT',
      'guinea': 'GN',
      'guinea-bissau': 'GW',
      'haiti': 'HT',
      'honduras': 'HN',
      'hungary': 'HU',
      'iceland': 'IS',
      'indonesia': 'ID',
      'iraq': 'IQ',
      'ireland': 'IE',
      'israel': 'IL',
      'jamaica': 'JM',
      'jordan': 'JO',
      'kazakhstan': 'KZ',
      'kenya': 'KE',
      'kiribati': 'KI',
      'kuwait': 'KW',
      'kyrgyzstan': 'KG',
      'laos': 'LA',
      'latvia': 'LV',
      'lebanon': 'LB',
      'lesotho': 'LS',
      'liberia': 'LR',
      'libya': 'LY',
      'liechtenstein': 'LI',
      'lithuania': 'LT',
      'luxembourg': 'LU',
      'madagascar': 'MG',
      'malawi': 'MW',
      'malaysia': 'MY',
      'maldives': 'MV',
      'mali': 'ML',
      'malta': 'MT',
      'marshall islands': 'MH',
      'mauritania': 'MR',
      'mauritius': 'MU',
      'micronesia': 'FM',
      'moldova': 'MD',
      'monaco': 'MC',
      'mongolia': 'MN',
      'montenegro': 'ME',
      'morocco': 'MA',
      'mozambique': 'MZ',
      'myanmar': 'MM',
      'namibia': 'NA',
      'nauru': 'NR',
      'nepal': 'NP',
      'netherlands': 'NL',
      'new zealand': 'NZ',
      'nicaragua': 'NI',
      'niger': 'NE',
      'nigeria': 'NG',
      'north korea': 'KP',
      'north macedonia': 'MK',
      'norway': 'NO',
      'oman': 'OM',
      'palau': 'PW',
      'panama': 'PA',
      'papua new guinea': 'PG',
      'poland': 'PL',
      'qatar': 'QA',
      'romania': 'RO',
      'rwanda': 'RW',
      'saint kitts and nevis': 'KN',
      'saint lucia': 'LC',
      'saint vincent and the grenadines': 'VC',
      'samoa': 'WS',
      'san marino': 'SM',
      'sao tome and principe': 'ST',
      'saudi arabia': 'SA',
      'senegal': 'SN',
      'serbia': 'RS',
      'seychelles': 'SC',
      'sierra leone': 'SL',
      'singapore': 'SG',
      'slovakia': 'SK',
      'slovenia': 'SI',
      'solomon islands': 'SB',
      'somalia': 'SO',
      'south africa': 'ZA',
      'sri lanka': 'LK',
      'sudan': 'SD',
      'sweden': 'SE',
      'switzerland': 'CH',
      'syria': 'SY',
      'taiwan': 'TW',
      'tajikistan': 'TJ',
      'tanzania': 'TZ',
      'thailand': 'TH',
      'togo': 'TG',
      'tonga': 'TO',
      'trinidad and tobago': 'TT',
      'tunisia': 'TN',
      'turkmenistan': 'TM',
      'tuvalu': 'TV',
      'uganda': 'UG',
      'ukraine': 'UA',
      'united arab emirates': 'AE',
      'uzbekistan': 'UZ',
      'vanuatu': 'VU',
      'vatican city': 'VA',
      'vietnam': 'VN',
      'yemen': 'YE',
      'zambia': 'ZM',
      'zimbabwe': 'ZW'
    };
    
    const countryName = ad.origin_country.name.toLowerCase();
    const isoCode = countryToISO[countryName];
    
    if (!isoCode) {
      // Fallback - show country initials
      return (
        <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {ad.origin_country.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      );
    }
    
    const FlagComponent = (CountryFlags as any)[isoCode];
    return FlagComponent ? <FlagComponent className="w-4 h-4" /> : null;
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
              {getCountryFlag() || (
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
