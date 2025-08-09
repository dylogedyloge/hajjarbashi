

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
// import Zap from "@/components/icons/Gemini";
import Star from "@/components/icons/LightningBolt2";
import {  AlertTriangle, Share2 } from "lucide-react";
import { getCountryFlag } from "@/utils/country-utils";
import ActionButtons from "@/components/ActionButtons";
import BookmarkButton from "@/components/BookmarkButton";
import { useTranslations } from "next-intl";
import { formatRelativeTime } from "@/utils/time";
import OtherSellersCarousel from "@/components/OtherSellersCarousel";
import type { Media } from "@/types/ads";


// centralized in types/ads
// Get the appropriate date to display

function AdStoneInfoSection({ ad }: { ad: any }) {
  const t = useTranslations("AdDetailPage");
  const getDisplayDate = () => {
    // Use updated_at if available, otherwise fall back to created_at
    const timestamp = ad.updated_at || ad.created_at;
    return timestamp ? formatRelativeTime(timestamp) : (ad.published_at || '');
  };
  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-12">
      {/* Main Content */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-foreground mb-4">Stone Information</h2>
        <p className="text-muted-foreground mb-6">
          {ad.description}
        </p>
        {/* {[1,2,3,4].map((_, i) => (
          <div key={i} className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="text-green-500 w-5 h-5" />
              <span className="font-semibold text-base text-foreground">Why Choose This Car?</span>
            </div>
            <div className="text-muted-foreground text-sm">
              Experience luxury and performance with this 2022 Porsche Cayenne Coupe Platinum Edition in elegant Gray. With 62,000 km on the clock, this SUV blends power and sophistication seamlessly.<br/>
              This Cayenne delivers thrilling performance while offering maximum comfort and cutting-edge features.<br/>
              This special Platinum Edition includes exclusive trims and premium options, making it a standout in Porsche’s lineup.
            </div>
          </div>
        ))} */}
        <div className="text-xs text-muted-foreground mt-8">Posted on: <span className="font-semibold text-foreground">{getDisplayDate()}</span></div>
      </div>
      {/* Sidebar */}
      <div className="w-full lg:w-[340px] flex flex-col gap-6">
        {/* Pros/Cons */}
        <div className="bg-white rounded-xl p-6 shadow flex flex-col gap-4">
          <div className="font-semibold text-lg text-foreground mb-2">{t("pros")}</div>
          <ul className="mb-4">
            <li className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span className="inline-block w-1 h-4 bg-green-500 rounded-sm mr-2" />
              {ad.benefits?.[0]}
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block w-1 h-4 bg-green-500 rounded-sm mr-2" />
              {ad.benefits?.[1]}
            </li>
          </ul>
          <div className="font-semibold text-lg text-foreground mb-2">{t("cons")}</div>
          <ul>
            <li className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span className="inline-block w-1 h-4 bg-red-500 rounded-sm mr-2" />
              {ad.defects?.[0]}
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block w-1 h-4 bg-red-500 rounded-sm mr-2" />
              {ad.defects?.[1]}
            </li>
          </ul>
        </div>
        {/* Stone Card */}
        <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-3">
          <div className="rounded-lg overflow-hidden mb-2">
            <img src="https://placehold.co/800.png?text=Hajjar+Bashi&font=poppins" alt="Negro Marquina" className="w-full h-32 object-cover" />
          </div>
          <div className="font-semibold text-lg text-foreground">Negro Marquina</div>
          <div className="text-muted-foreground text-sm mb-3">
            Verde Levanto Marble is characterized by its blend of Bordeaux and petroleum green tones, accented with white ...
          </div>
          <button className="bg-zinc-700 text-white rounded-lg px-4 py-2 font-medium">Lorem Ipsum</button>
        </div>
      </div>
    </div>
  );
}

  function OtherSellersSection() {
    const sellers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Dummy data
    return <OtherSellersCarousel sellers={sellers} />;
  }

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
    <div className="py-8 px-4">
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
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column - Image Gallery */}
        <div className="md:w-1/2">
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
        <div className="md:w-1/2">
          <Card className="h-full min-h-[400px] flex flex-col justify-between">
            <div className="p-6 flex flex-col h-full">
              {/* Header: Title & Actions */}
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-extrabold text-foreground">
                  {ad.category?.name || ad.stone_type || "Product"}
                </h1>
                <div className="flex gap-2">
                  <BookmarkButton adId={ad.id} isBookmarked={ad.bookmarked || false} />
                  <Button variant="outline" size="icon" className="bg-white border h-9 w-9 p-0">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="bg-white border h-9 w-9 p-0">
                    <AlertTriangle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Price, Colors, Min Order */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-foreground">
                    ${ad.price?.toLocaleString?.()}
                  </span>
                  <span className="text-lg text-muted-foreground">/{ad.sale_unit_type || t("unit")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{t("colors")}:</span>
                  <div className="flex -space-x-1">
                    {colorArray.slice(0, 3).map((color: string, index: number) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="w-5 h-5 rounded-full border border-background cursor-help"
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
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">{t("minOrder")}:</span>
                  <span className="font-semibold text-foreground ml-1">
                    {ad.minimum_order?.toLocaleString?.()} {ad.sale_unit_type || t("unit")}
                  </span>
                </div>
              </div>

              {/* Description */}
              {ad.description && (
                <div className="text-sm text-muted-foreground mb-4">{ad.description}</div>
              )}

              {/* Specifications Grid */}
              <div className="grid grid-cols-3 gap-y-1 gap-x-2 mb-4">
                <div className="flex gap-2 ">
                  <span className="text-muted-foreground">{t("size")}:</span>
                  <span className=" text-foreground">{ad.size_range_type}</span>
                </div>
                <div className="flex gap-2 ">
                  <span className="text-muted-foreground">{t("dims")}:</span>
                  <span className=" text-foreground">
                    {ad.size ? `${ad.size.h ?? "-"}×${ad.size.w ?? "-"}×${ad.size.l ?? "-"} ${t("cm")}` : "-"}
                  </span>
                </div>
                <div className="flex gap-2 ">
                  <span className="text-muted-foreground">{t("weight")}:</span>
                  <span className=" text-foreground">{ad.weight?.toLocaleString?.()} {ad.sale_unit_type}</span>
                </div>
                <div className="flex gap-2 ">
                  <span className="text-muted-foreground">{t("origin")}:</span>
                  <div className="flex gap-2 items-center gap-1">
                    {getCountryFlagComponent()}
                    <span className=" text-foreground">{ad.origin_country?.name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">{t("grade")}:</span>
                  <span className=" text-foreground">{ad.grade?.toUpperCase()}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">{t("surface")}:</span>
                  <span className=" text-foreground">{ad.surface?.name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">{t("form")}:</span>
                  {/* <span className="font-semibold text-foreground">{ad.form }</span> */}
                </div>
              </div>

              {/* Benefits and Defects */}
              {(ad.benefits?.length > 0 || ad.defects?.length > 0) && (
                <div className="space-y-2 mb-4">
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
              <div className="border-t pt-4 mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">R</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {creatorProfile?.company_name || t("unknownCompany")}
                  </span>
                  <div className="w-5 h-5 bg-orange-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">V</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-foreground">4.1</span>
                  </div>
                  <Button variant="link" className="text-sm p-0 h-auto ml-2 text-info underline">
                    {t("viewAllAds")}
                  </Button>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>
                    {t("port")}: {ad.origin_country?.name } - {ad.origin_city?.name || t("unknown")} - {ad.export_ports_details?.[0]?.name || t("unknown")}
                  </span>
                  <span>
                    {t("receivePort")}: <span className="text-info underline">{t("showDetails")}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6">
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
            </div>
          </Card>
        </div>
      </div>
      <AdStoneInfoSection ad={ad} />
      <OtherSellersSection />
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
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/${mainImage}`
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
