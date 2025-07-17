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
import { AdCreatorCard } from "@/components/AdCreatorCard";
import { fetchUserProfile } from "@/lib/profile";

type Port = {
  id: string;
  name: string;
  city_name?: string;
};

type Media = { media_thumb_path?: string; media_path?: string };

export default async function Page(props: unknown) {
  const { params, searchParams } = props as {
    params: { [key: string]: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  };
  const locale = Array.isArray(searchParams?.lang)
    ? searchParams.lang[0]
    : searchParams?.lang || "en";
  let ad = null;
  let creatorProfile = null;
  try {
    const res = await fetchAdById({ id: params.id, locale });
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

  // Ports
  const receivingPorts = Array.isArray(ad.receiving_ports_details)
    ? ad.receiving_ports_details
    : [];
  const exportPorts = Array.isArray(ad.export_ports_details)
    ? ad.export_ports_details
    : [];

  // Combine main image and gallery images, remove duplicates and falsy
  const allImages = [mainImageUrl, ...galleryImages].filter(
    (img, idx, arr) => img && arr.indexOf(img) === idx
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="p-0 overflow-hidden">
        {/* Main Image & Gallery */}
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 w-full">
            <AdImageGallery
              mainImageUrl={mainImageUrl}
              galleryImages={allImages}
              alt={ad.category?.name || "Ad image"}
            />
          </div>
          <div className="md:w-1/2 w-full flex flex-col gap-4 p-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {ad.is_express && <Badge variant="default">Express</Badge>}
              {ad.is_chat_enabled && (
                <Badge variant="outline">Chat Enabled</Badge>
              )}
              {ad.contact_info_enabled && (
                <Badge variant="outline">Contact Info Enabled</Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {ad.category?.name || "Ad"}
            </h2>
            <div className="text-lg font-semibold text-primary mb-2">
              {ad.price?.toLocaleString?.()} {ad.price_unit || "USD"}
            </div>
            <div className="text-muted-foreground mb-2">{ad.description}</div>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              {colorArray.length > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">Colors:</span>
                  <TooltipProvider>
                    {colorArray.map((c: string, i: number) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <span
                            className="w-5 h-5 rounded-full border border-muted inline-block cursor-pointer"
                            style={{ backgroundColor: c }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">{c}</TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Form:</span>{" "}
                <span className="font-semibold">{ad.form}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Grade:</span>{" "}
                <span className="font-semibold">{ad.grade}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Surface:</span>{" "}
                <span className="font-semibold">
                  {ad.surface?.name || ad.surface}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>{" "}
                <span className="font-semibold">{ad.category?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Weight:</span>{" "}
                <span className="font-semibold">{ad.weight}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sale Unit:</span>{" "}
                <span className="font-semibold">{ad.sale_unit_type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Min Order:</span>{" "}
                <span className="font-semibold">{ad.minimum_order}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <span className="font-semibold">{ad.status}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Origin Country:</span>{" "}
                <span className="font-semibold">{ad.origin_country?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Origin City:</span>{" "}
                <span className="font-semibold">{ad.origin_city?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>{" "}
                <span className="font-semibold">
                  {ad.size
                    ? `${ad.size.h ?? "-"} × ${ad.size.w ?? "-"} × ${
                        ad.size.l ?? "-"
                      }`
                    : "-"}
                </span>
              </div>
            </div>
            {/* Ports */}
            <div className="mt-4">
              {receivingPorts.length > 0 && (
                <div className="mb-2">
                  <span className="text-muted-foreground text-xs">
                    Receiving Ports:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {receivingPorts.map((port: Port) => (
                      <Badge key={port.id} variant="secondary">
                        {port.name}{" "}
                        {port.city_name ? `(${port.city_name})` : ""}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {exportPorts.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-xs">
                    Export Ports:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {exportPorts.map((port: Port) => (
                      <Badge key={port.id} variant="secondary">
                        {port.name}{" "}
                        {port.city_name ? `(${port.city_name})` : ""}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      {/* Creator Card (dynamic data) */}
      <div className="flex justify-center mt-8">
        <AdCreatorCard
          avatarUrl={
            creatorProfile?.avatar_thumb
              ? creatorProfile.avatar_thumb.startsWith("http")
                ? creatorProfile.avatar_thumb
                : `https://api.hajjardevs.ir/${creatorProfile.avatar_thumb}`
              : undefined
          }
          name={creatorProfile?.name || "-"}
          company={creatorProfile?.company_name || "-"}
          adId={ad.id || "-"}
          isChatEnabled={!!ad.is_chat_enabled}
          isContactInfoEnabled={!!ad.contact_info_enabled}
          isExpressEnabled={!!ad.is_express}
          contactInfo={
            Array.isArray(creatorProfile?.contact_info)
              ? creatorProfile.contact_info
              : []
          }
        />
      </div>
    </div>
  );
}
