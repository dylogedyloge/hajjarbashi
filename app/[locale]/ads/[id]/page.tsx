
import { fetchAdById } from "@/lib/advertisements";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdImageGallery from "@/components/AdImageGallery";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchUserProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Share2, AlertTriangle, Star } from "lucide-react";
import { getCountryFlag } from "@/utils/country-utils";
import ActionButtons from "@/components/ActionButtons";
import BookmarkButton from "@/components/BookmarkButton";

type Media = { media_thumb_path?: string; media_path?: string };

// Client component for translations
// "use client";
import { useTranslations } from "next-intl";

function AdDetailContent({ 
  ad, 
  creatorProfile, 
  mainImageUrl, 
  galleryImages, 
  colorArray 
}: {
  ad: any;
  creatorProfile: any;
  mainImageUrl: string | null;
  galleryImages: string[];
  colorArray: string[];
}) {
  const t = useTranslations("AdDetailPage");

  // Get country flag component
  const getCountryFlagComponent = () => {
    return getCountryFlag(ad.origin_country?.name);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Breadcrumbs and Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted-foreground">
          {t("home")} &gt; {t("products")} &gt; {ad.category?.name || t("products")}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {t("adsId")}: {ad.id}
          </div>
        </div>
      </div>

      {/* Combined Image Gallery and Product Details */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Image Gallery */}
        <div className="lg:w-1/2">
          <div className="relative h-full">
            <AdImageGallery
              mainImageUrl={mainImageUrl}
              galleryImages={galleryImages}
              alt={ad.category?.name || ad.stone_type || "Product image"}
            />
            {/* Featured Badge */}
            {ad.is_featured && (
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-yellow-500 text-white border-0">
                  <Star className="w-3 h-3 mr-1" />
                  {t("featured")}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Product Details Card */}
        <div className="lg:w-1/2">
          <Card className="h-full min-h-[400px]">
            <div className="p-6 space-y-4 h-full flex flex-col justify-between">
              {/* Product Title and Actions */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">
                  {ad.category?.name || ad.stone_type || "Product"}
                </h1>
                <div className="flex gap-2">
                  <BookmarkButton 
                    adId={ad.id} 
                    isBookmarked={ad.bookmarked || false} 
                  />
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <AlertTriangle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              {ad.description && (
                <div className="text-sm text-muted-foreground">
                  {ad.description}
                </div>
              )}

              {/* Price and Colors */}
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">
                  ${ad.price?.toLocaleString?.()} <span className="text-lg text-muted-foreground">/{ad.sale_unit_type || t("unit")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t("colors")}:</span>
                  <div className="flex -space-x-1">
                    {colorArray.slice(0, 3).map((color: string, index: number) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="w-4 h-4 rounded-full border border-background cursor-help"
                              style={{ backgroundColor: color }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{color}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specifications Grid - Exact Layout from Design */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("size")}:</span>
                  <span className="font-semibold text-foreground">{ad.size_range_type || "Medium"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("minOrder")}:</span>
                  <span className="font-semibold text-foreground">{ad.minimum_order?.toLocaleString?.()} {ad.sale_unit_type || t("unit")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("dims")}:</span>
                  <span className="font-semibold text-foreground">
                    {ad.size ? `${ad.size.h ?? "-"}×${ad.size.w ?? "-"}×${ad.size.l ?? "-"} ${t("cm")}` : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("weight")}:</span>
                  <span className="font-semibold text-foreground">{ad.weight?.toLocaleString?.()} {ad.sale_unit_type || t("kg")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("origin")}:</span>
                  <div className="flex items-center gap-1">
                    {getCountryFlagComponent()}
                    <span className="font-semibold text-foreground">{ad.origin_country?.name || t("unknown")}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("grade")}:</span>
                  <span className="font-semibold text-foreground">{ad.grade?.toUpperCase() || t("aGrade")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("surface")}:</span>
                  <span className="font-semibold text-foreground">{ad.surface?.name || t("raw")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("form")}:</span>
                  <span className="font-semibold text-foreground">{ad.form || t("block")}</span>
                </div>
              </div>

              {/* Benefits and Defects */}
              {(ad.benefits?.length > 0 || ad.defects?.length > 0) && (
                <div className="space-y-2">
                  {ad.benefits?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">{t("benefits")}:</h4>
                      <div className="flex flex-wrap gap-1">
                        {ad.benefits.map((benefit: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {ad.defects?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">{t("defects")}:</h4>
                      <div className="flex flex-wrap gap-1">
                        {ad.defects.map((defect: string, index: number) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {defect}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Supplier Section */}
              <div className="pt-2">
                <h3 className="text-muted-foreground mb-3">{t("supplier")}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">R</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {creatorProfile?.company_name || t("unknownCompany")}
                  </span>
                  <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">V</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-foreground">4.1</span>
                  </div>
                  <Button variant="link" className="text-sm p-0 h-auto">
                    {t("viewAllAds")}
                  </Button>
                </div>
              </div>

              {/* Port Information */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-muted-foreground">
                  {t("port")}: {ad.origin_country?.name || t("unknown")} - {ad.origin_city?.name || t("unknown")} - {ad.export_ports_details?.[0]?.name || t("unknown")}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("receivePort")}: <span className="text-primary underline">{t("showDetails")}</span>
                </span>
              </div>

              {/* Action Buttons with Functionality */}
              <ActionButtons
                adId={ad.id}
                adCreatorUserId={ad.creator_id}
                creatorName={creatorProfile?.name || ""}
                creatorAvatar={creatorProfile?.avatar_thumb || ""}
                creatorCompany={creatorProfile?.company_name || ""}
                contactInfo={Array.isArray(creatorProfile?.contact_info) ? creatorProfile.contact_info : []}
                isChatEnabled={!!ad.is_chat_enabled}
                isContactInfoEnabled={!!ad.contact_info_enabled}
                isExpressEnabled={!!ad.is_express}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default async function Page(props: unknown) {
  const { params, searchParams } = props as {
    params: Promise<{ id: string; locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  };
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const locale = Array.isArray(resolvedSearchParams?.lang)
    ? resolvedSearchParams.lang[0]
    : resolvedSearchParams?.lang || "en";
  let ad = null;
  let creatorProfile = null;
  try {
    const res = await fetchAdById({ id: resolvedParams.id, locale });
    ad = res?.data || null;
    if (ad?.creator_id) {
      creatorProfile = await fetchUserProfile(ad.creator_id, locale);
    }
  } catch {
    ad = null;
    creatorProfile = null;
  }
  if (!ad) return notFound();

  // Main image: first media or cover
  const mediaArray = Array.isArray(ad.media) ? ad.media : [];
  const mainImage =
    mediaArray.length > 0
      ? mediaArray[0].media_thumb_path || mediaArray[0].media_path
      : ad.cover_thumb || ad.cover || "";
  const mainImageUrl = mainImage
    ? mainImage.startsWith("http")
      ? mainImage
      : `https://api.hajjardevs.ir/${mainImage}`
    : null;
  const galleryImages = mediaArray
    .slice(1)
    .map((m: Media) => m.media_thumb_path || m.media_path)
    .filter(Boolean);

  // Colors
  const colorArray = Array.isArray(ad.colors) ? ad.colors : [];

  return (
    <AdDetailContent
      ad={ad}
      creatorProfile={creatorProfile}
      mainImageUrl={mainImageUrl}
      galleryImages={galleryImages}
      colorArray={colorArray}
    />
  );
}
