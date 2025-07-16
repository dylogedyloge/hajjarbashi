"use client";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  uploadAdMedia,
  deleteAdMedia,
  getAdDetails,
} from "@/lib/advertisements";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadIcon } from "lucide-react";

type UploadedFile = { path: string; thumb_path: string };

export default function CreateAdPage() {
  const t = useTranslations("CreateAd");
  const searchParams = useSearchParams();
  const adId = searchParams.get("id");
  const locale = searchParams.get("lang") || "en";
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<
    { url: string; mediaPath: string }[]
  >([]);

  useEffect(() => {
    if (!adId) return;
    (async () => {
      try {
        const res = await getAdDetails({
          id: adId!,
          locale,
          token: token || undefined,
        });
        if (res?.success && res?.data?.uploaded_files) {
          setImageUrls(
            res.data.uploaded_files.map((file: UploadedFile) => ({
              url: `https://api.hajjardevs.ir/${file.thumb_path}`,
              mediaPath: file.path,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [adId, token, locale]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adId || !token) return;
    if (imageUrls.length >= 6) {
      setUploadError(t("maxImages", { count: 6 }));
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadAdMedia({ id: adId, file, locale, token });
      if (
        res?.success &&
        res?.data?.media_thumb_path &&
        res?.data?.media_path
      ) {
        setImageUrls((prev) => {
          // Prevent duplicate images
          if (prev.some((img) => img.mediaPath === res.data.media_path))
            return prev;
          return [
            ...prev,
            {
              url: `https://api.hajjardevs.ir/${res.data.media_thumb_path}`,
              mediaPath: res.data.media_path,
            },
          ];
        });
        toast.success(t("uploadSuccess"));
      } else {
        setUploadError(res?.message || "Upload failed");
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (mediaPath: string) => {
    if (!adId || !token) return;
    try {
      await deleteAdMedia({ id: adId, mediaPath, locale, token });
      setImageUrls((prev) => prev.filter((img) => img.mediaPath !== mediaPath));
      toast.success(t("deleteSuccess"));
    } catch (err: unknown) {
      toast.error(t("deleteError"));
      console.error(err);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(imageUrls);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setImageUrls(reordered);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto py-12">
      {/* Left Panel */}
      <Card className="w-full md:w-80 flex-shrink-0 p-6 flex flex-col gap-6">
        <div>
          <div className="text-muted-foreground text-sm">
            {t("advertisementCost")}
          </div>
          <div className="text-2xl font-bold mt-1 mb-4">
            {t("usd", { value: 24 })} 24
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { label: t("featured"), key: "featured", checked: true },
            { label: t("autoRenew"), key: "autoRenew" },
            { label: t("expressReady"), key: "expressReady" },
            { label: t("enableChat"), key: "enableChat" },
            { label: t("contactInfo"), key: "contactInfo" },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <Checkbox checked={item.checked} />
              <span className="text-sm">{item.label}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{t("infoAbout", { item: item.label })}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 mt-4">
          <Button className="bg-foreground text-background w-full rounded-full py-2 text-base font-semibold">
            {t("payAndPublish")}
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full py-2 text-base font-semibold border-2"
          >
            {t("saveDraft")}
          </Button>
          <Button
            variant="destructive"
            className="w-full rounded-full py-2 text-base font-semibold"
          >
            {t("discard")}
          </Button>
        </div>
      </Card>
      {/* Right Panel */}
      <Card className="flex-1 p-8 flex flex-col gap-8">
        {/* Product Image Upload */}
        <div>
          <div className="font-semibold mb-2">{t("productImage")}</div>
          <div className="border border-dashed border-muted rounded-lg p-6 flex flex-col items-center justify-center text-center mb-2 min-h-[120px]">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="images" direction="horizontal">
                {(provided: DroppableProvided) => {
                  // Always show 6 slots (first is cover, rest are regular)
                  const slots = Array.from(
                    { length: 6 },
                    (_, i) => imageUrls[i] || null
                  );
                  return (
                    <div
                      className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 justify-center"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {slots.map((img, idx) => {
                        const isCover = idx === 0;
                        // Only render Draggable for filled slots (images)
                        if (img) {
                          return (
                            <Draggable
                              key={img.mediaPath}
                              draggableId={img.mediaPath}
                              index={idx}
                            >
                              {(
                                provided: DraggableProvided,
                                snapshot: DraggableStateSnapshot
                              ) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`relative group ${
                                    snapshot.isDragging ? "z-10" : ""
                                  } ${
                                    isCover
                                      ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2"
                                      : ""
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    opacity: snapshot.isDragging ? 0.7 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {/* Image container with fixed aspect ratio and overflow-hidden */}
                                  <div
                                    className={`relative w-full h-0 ${
                                      isCover
                                        ? "pt-[100%] min-w-[180px] min-h-[180px]"
                                        : "pt-[100%] min-w-[90px] min-h-[90px]"
                                    } overflow-hidden rounded`}
                                  >
                                    <Image
                                      src={img.url}
                                      alt={`Uploaded ${idx + 1}`}
                                      fill
                                      className="object-cover rounded"
                                    />
                                    {/* Cover badge */}
                                    {isCover && (
                                      <Badge className="absolute bottom-2 left-2 bg-primary text-white shadow-md text-xs px-2 py-1 rounded-full z-20">
                                        {t("coverImage", {
                                          defaultValue: "Cover Image",
                                        })}
                                      </Badge>
                                    )}
                                    <button
                                      type="button"
                                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity group-hover:opacity-100 z-30"
                                      onClick={() =>
                                        handleDeleteImage(img.mediaPath)
                                      }
                                      aria-label={t("deleteImage")}
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        }
                        // Skeleton slot (static, not draggable)
                        // Show the upload button in the first empty slot only
                        const showUpload =
                          slots.findIndex((s) => s === null) === idx &&
                          imageUrls.length < 6;
                        return (
                          <div
                            key={`skeleton-${idx}`}
                            className={`${
                              isCover
                                ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2"
                                : ""
                            } relative ${
                              showUpload
                                ? "border-2 border-dotted rounded-sm border-primary"
                                : ""
                            }`}
                          >
                            <Skeleton
                              className={`w-full h-0 ${
                                isCover
                                  ? "pt-[100%] min-w-[180px] min-h-[180px]"
                                  : "pt-[100%] min-w-[90px] min-h-[90px]"
                              } rounded`}
                            />
                            {showUpload && (
                              <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-40">
                                <UploadIcon className="w-3 h-3 md:w-5 md:h-5 text-primary mb-1" />
                                <span className="text-xs text-primary font-medium select-none">
                                  {t("clickHere")}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleFileChange}
                                  disabled={uploading || imageUrls.length >= 6}
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
            </DragDropContext>
            <span className="text-muted-foreground text-sm">
              <span className="text-xs text-muted-foreground">
                {t("supportedFormats")}
              </span>
            </span>
            {uploading && (
              <div className="text-xs text-blue-500 mt-2">{t("uploading")}</div>
            )}
            {uploadError && (
              <div className="text-xs text-red-500 mt-2">{uploadError}</div>
            )}
            {imageUrls.length >= 6 && (
              <div className="text-xs text-orange-500 mt-2">
                {t("maxImages", { count: 6 })}
              </div>
            )}
          </div>
        </div>
        {/* Product Info Form */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type */}
          <div className="flex flex-col gap-1">
            <Label>{t("type")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="john">John</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* From */}
          <div className="flex flex-col gap-1">
            <Label>{t("from")}</Label>
            <Input placeholder="email@example.com" />
          </div>
          {/* Surface */}
          <div className="flex flex-col gap-1">
            <Label>{t("surface")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectSurface")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hajjarbashi">Hajjarbashi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Origin */}
          <div className="flex flex-col gap-1">
            <Label>{t("origin")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectOrigin")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="china">China</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Grade */}
          <div className="flex flex-col gap-1">
            <Label>{t("grade")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectGrade")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hajjarbashi">Hajjarbashi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Grade (again) */}
          <div className="flex flex-col gap-1">
            <Label>{t("grade")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectGrade")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hajjarbashi">Hajjarbashi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Origin of Shipment */}
          <div className="flex flex-col gap-1">
            <Label>{t("originOfShipment")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectOrigin")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="china">China</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Empty for grid alignment */}
          <div />
          {/* Dimensions */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>{t("dimensions")}</Label>
            <div className="flex gap-2">
              <Input placeholder="x" className="w-16" />
              <Input placeholder="y" className="w-16" />
              <Input placeholder="z" className="w-16" />
              <Select>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="M" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m">M</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Weight */}
          <div className="flex flex-col gap-1">
            <Label>{t("weight")}</Label>
            <Input placeholder="12345" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>{t("unit")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectUnit")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">KG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Deliverable Destination */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>{t("deliverableDestination")}</Label>
            <Input placeholder="12345" />
          </div>
          {/* Minimum Order Quantity */}
          <div className="flex flex-col gap-1">
            <Label>{t("minimumOrderQuantity")}</Label>
            <Input placeholder="12345" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>{t("unit")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectUnit")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">KG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Price */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>{t("price")}</Label>
            <Input placeholder="12345" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>{t("perUnit")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectUnit")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">KG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Description */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>{t("description")}</Label>
            <Textarea placeholder={t("description")} rows={3} />
          </div>
        </form>
      </Card>
    </div>
  );
}
