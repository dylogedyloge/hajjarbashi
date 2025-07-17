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
import { Info, X, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  uploadAdMedia,
  deleteAdMedia,
  getAdDetails,
  fetchCountries,
  fetchCities,
  fetchSurfaces,
  fetchCategories,
  fetchPorts,
  updateAd,
} from "@/lib/advertisements";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
// dnd-kit imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
import DropdownMultiSelect from "@/components/ui/dropdown-multiselect";

type UploadedFile = { path: string; thumb_path: string };

interface SortableImageProps {
  id: string;
  idx: number;
  img: { url: string; mediaPath: string };
  isCover: boolean;
  onDelete: (mediaPath: string) => void;
  t: ReturnType<typeof useTranslations>;
}

function SortableImage({
  id,
  idx,
  img,
  isCover,
  onDelete,
  t,
}: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: isDragging ? 10 : undefined,
      }}
      className={`relative group ${
        isCover ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2" : ""
      }`}
      {...attributes}
      {...listeners}
    >
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
        {isCover && (
          <Badge className="absolute bottom-2 left-2 bg-primary text-white shadow-md text-xs px-2 py-1 rounded-full z-20">
            {t("coverImage", { defaultValue: "Cover Image" })}
          </Badge>
        )}
        <button
          type="button"
          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity group-hover:opacity-100 z-30"
          onClick={() => onDelete(img.mediaPath)}
          aria-label={t("deleteImage")}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

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

  // Add state for left panel checkboxes
  const [featured, setFeatured] = useState(true);
  const [autoRenew, setAutoRenew] = useState(false);
  const [expressReady, setExpressReady] = useState(false); // Not in API, but keep for UI
  const [enableChat, setEnableChat] = useState(false);
  const [contactInfo, setContactInfo] = useState(false);

  // Add state for all form fields
 
  const [surfaceId, setSurfaceId] = useState<string>("");
  const [originCountryId, setOriginCountryId] = useState<string>("");
  const [originCityId, setOriginCityId] = useState<string>("");
  const [benefits, setBenefits] = useState<string>("");
  const [defects, setDefects] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [saleUnitType, setSaleUnitType] = useState<string>("");
  const [formType, setFormType] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [sizeH, setSizeH] = useState<string>("");
  const [sizeW, setSizeW] = useState<string>("");
  const [sizeL, setSizeL] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [minimumOrder, setMinimumOrder] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Add state for country/city options and loading
  const [countryOptions, setCountryOptions] = useState<{ id: string; name: string }[]>([]);
  const [cityOptions, setCityOptions] = useState<{ id: string; name: string }[]>([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
  const [surfaceOptions, setSurfaceOptions] = useState<{ id: string; name: string }[]>([]);
  const [surfaceLoading, setSurfaceLoading] = useState(false);
  const [surfaceError, setSurfaceError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; name: string; colors: string[] }[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [portOptions, setPortOptions] = useState<{ id: string; name: string }[]>([]);
  const [portLoading, setPortLoading] = useState(false);
  const [portError, setPortError] = useState<string | null>(null);
  const [selectedReceivingPorts, setSelectedReceivingPorts] = useState<string[]>([]);
  const [selectedExportPorts, setSelectedExportPorts] = useState<string[]>([]);

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

  // Fetch countries on mount
  useEffect(() => {
    setCountryLoading(true);
    setCountryError(null);
    fetchCountries(locale)
      .then((data) => setCountryOptions(data))
      .catch((err) => setCountryError(err.message || "Failed to load countries"))
      .finally(() => setCountryLoading(false));
  }, [locale]);
  // Fetch cities when originCountryId changes
  useEffect(() => {
    if (!originCountryId) {
      setCityOptions([]);
      return;
    }
    setCityLoading(true);
    setCityError(null);
    fetchCities(originCountryId, locale)
      .then((data) => setCityOptions(data))
      .catch((err) => setCityError(err.message || "Failed to load cities"))
      .finally(() => setCityLoading(false));
  }, [originCountryId, locale]);

  // Fetch surfaces on mount
  useEffect(() => {
    setSurfaceLoading(true);
    setSurfaceError(null);
    fetchSurfaces(locale)
      .then((data) => setSurfaceOptions(data))
      .catch((err) => setSurfaceError(err.message || "Failed to load surfaces"))
      .finally(() => setSurfaceLoading(false));
  }, [locale]);

  // Fetch categories on mount
  useEffect(() => {
    setCategoryLoading(true);
    setCategoryError(null);
    fetchCategories(locale)
      .then((data) => setCategoryOptions(data))
      .catch((err) => setCategoryError(err.message || "Failed to load categories"))
      .finally(() => setCategoryLoading(false));
  }, [locale]);
  // Update color options when categoryId changes
  useEffect(() => {
    const cat = categoryOptions.find((c) => c.id === categoryId);
    setColorOptions(cat?.colors || []);
    setSelectedColors([]); // Reset selected colors when category changes
  }, [categoryId, categoryOptions]);

  // Fetch ports on mount
  useEffect(() => {
    setPortLoading(true);
    setPortError(null);
    fetchPorts(locale)
      .then((data) => setPortOptions(data))
      .catch((err) => setPortError(err.message || "Failed to load ports"))
      .finally(() => setPortLoading(false));
  }, [locale]);

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

  // dnd-kit drag and drop logic
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = imageUrls.findIndex(
        (img) => img.mediaPath === active.id
      );
      const newIndex = imageUrls.findIndex((img) => img.mediaPath === over.id);
      setImageUrls((imgs) => arrayMove(imgs, oldIndex, newIndex));
    }
  };

  // Add handler for Pay and Publish
  const handlePayAndPublish = async () => {
    const updateAdPayload = {
      id: adId!,
      status: Number(status),
      sale_unit_type: saleUnitType,
      form: formType,
      grade,
      size: {
        h: Number(sizeH),
        w: Number(sizeW),
        l: Number(sizeL),
      },
      weight: Number(weight),
      description,
      is_chat_enabled: enableChat,
      contact_info_enabled: contactInfo,
      express: expressReady,
      minimum_order: Number(minimumOrder),
      category_id: categoryId,
      price: Number(price),
      colors: selectedColors,
      receiving_ports: selectedReceivingPorts,
      export_ports: selectedExportPorts,
      surface_id: surfaceId,
      origin_country_id: originCountryId,
      origin_city_id: originCityId,
      auto_renew: autoRenew,
      media: imageUrls.map((img, idx) => {
        const url = new URL(img.url);
        const media_thumb_path = url.pathname.replace(/^\//, "");
        return {
          index: idx,
          media_path: img.mediaPath,
          media_thumb_path,
        };
      }),
      benefits: benefits.split(",").map(b => b.trim()).filter(Boolean),
      defects: defects.split(",").map(d => d.trim()).filter(Boolean),
    };
    setSubmitting(true);
    try {
      const res = await updateAd({ payload: updateAdPayload, locale, token: token! });
      if (res?.success) {
        toast.success(t("adUpdateSuccess", { defaultValue: "Ad updated successfully!" }));
      } else {
        toast.error(res?.message || t("adUpdateError", { defaultValue: "Failed to update ad." }));
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("adUpdateError", { defaultValue: "Failed to update ad." });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
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
          {/* Map checkboxes to API fields */}
          <div className="flex items-center gap-2">
            <Checkbox checked={featured} onCheckedChange={checked => typeof checked === 'boolean' && setFeatured(checked)} />
            <span className="text-sm">{t("featured")}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("infoAbout", { item: t("featured") })}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={autoRenew} onCheckedChange={checked => typeof checked === 'boolean' && setAutoRenew(checked)} />
            <span className="text-sm">{t("autoRenew")}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("infoAbout", { item: t("autoRenew") })}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={expressReady} onCheckedChange={checked => typeof checked === 'boolean' && setExpressReady(checked)} />
            <span className="text-sm">{t("expressReady")}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("infoAbout", { item: t("expressReady") })}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={enableChat} onCheckedChange={checked => typeof checked === 'boolean' && setEnableChat(checked)} />
            <span className="text-sm">{t("enableChat")}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("infoAbout", { item: t("enableChat") })}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={contactInfo} onCheckedChange={checked => typeof checked === 'boolean' && setContactInfo(checked)} />
            <span className="text-sm">{t("contactInfo")}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("infoAbout", { item: t("contactInfo") })}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-4">
          <Button className="bg-foreground text-background w-full rounded-full py-2 text-base font-semibold" onClick={handlePayAndPublish} type="button" disabled={submitting}>
            {submitting ? t("updating") : t("payAndPublish")}
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={imageUrls.map((img) => img.mediaPath)}
                strategy={rectSortingStrategy}
              >
                {/* Always show 6 slots (first is cover, rest are regular) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 justify-center">
                  {Array.from({ length: 6 }, (_, idx) => {
                    const img = imageUrls[idx] || null;
                    const isCover = idx === 0;
                    // Show the upload button in the first empty slot only
                    const showUpload =
                      imageUrls.length < 6 && imageUrls.length === idx;
                    if (img) {
                      return (
                        <SortableImage
                          key={img.mediaPath}
                          id={img.mediaPath}
                          idx={idx}
                          img={img}
                          isCover={isCover}
                          onDelete={handleDeleteImage}
                          t={t}
                        />
                      );
                    }
                    // Skeleton slot (static, not draggable)
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
                </div>
              </SortableContext>
            </DndContext>
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
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={e => { e.preventDefault(); handlePayAndPublish(); }}>
          {/* Status */}
          <div className="flex flex-col gap-1">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Draft</SelectItem>
                <SelectItem value="3">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Sale Unit Type */}
          <div className="flex flex-col gap-1">
            <Label>Sale Unit Type</Label>
            <Select value={saleUnitType} onValueChange={setSaleUnitType}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Form */}
          <div className="flex flex-col gap-1">
            <Label>Form</Label>
            <Select value={formType} onValueChange={setFormType}>
              <SelectTrigger>
                <SelectValue placeholder="Select form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slab">Slab</SelectItem>
                <SelectItem value="block">Block</SelectItem>
                <SelectItem value="tile">Tile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Grade */}
          <div className="flex flex-col gap-1">
            <Label>Grade</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
                <SelectItem value="b">B</SelectItem>
                <SelectItem value="c">C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Size (h, w, l) */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>Size (H × W × L)</Label>
            <div className="flex gap-2">
              <Input placeholder="Height (h)" type="number" min={0} value={sizeH} onChange={e => setSizeH(e.target.value)} />
              <Input placeholder="Width (w)" type="number" min={0} value={sizeW} onChange={e => setSizeW(e.target.value)} />
              <Input placeholder="Length (l)" type="number" min={0} value={sizeL} onChange={e => setSizeL(e.target.value)} />
            </div>
          </div>
          {/* Weight */}
          <div className="flex flex-col gap-1">
            <Label>Weight</Label>
            <Input placeholder="Weight" type="number" min={0} value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          {/* Minimum Order */}
          <div className="flex flex-col gap-1">
            <Label>Minimum Order</Label>
            <Input placeholder="Minimum Order" type="number" min={0} value={minimumOrder} onChange={e => setMinimumOrder(e.target.value)} />
          </div>
          {/* Category ID */}
          <div className="flex flex-col gap-1">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder={categoryLoading ? "Loading..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categoryError && <span className="text-xs text-destructive">{categoryError}</span>}
            <span className="text-xs text-muted-foreground">Must be a valid UUID</span>
          </div>
          {/* Colors */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>Colors</Label>
            <DropdownMultiSelect
              options={colorOptions.map((c) => ({ label: c, value: c }))}
              value={selectedColors}
              onChange={setSelectedColors}
              placeholder={!categoryId ? "Select category first" : (colorOptions.length ? "Select colors" : "No colors available")}
              disabled={!colorOptions.length}
            />
          </div>
          {/* Receiving Ports */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>Receiving Ports</Label>
            <DropdownMultiSelect
              options={portOptions.map((p) => ({ label: p.name, value: p.id }))}
              value={selectedReceivingPorts}
              onChange={setSelectedReceivingPorts}
              placeholder={portLoading ? "Loading..." : "Select receiving ports"}
              disabled={portLoading || !portOptions.length}
            />
            {portError && <span className="text-xs text-destructive">{portError}</span>}
          </div>
          {/* Export Ports */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>Export Ports</Label>
            <DropdownMultiSelect
              options={portOptions.map((p) => ({ label: p.name, value: p.id }))}
              value={selectedExportPorts}
              onChange={setSelectedExportPorts}
              placeholder={portLoading ? "Loading..." : "Select export ports"}
              disabled={portLoading || !portOptions.length}
            />
            {portError && <span className="text-xs text-destructive">{portError}</span>}
          </div>
          {/* Surface */}
          <div className="flex flex-col gap-1">
            <Label>Surface</Label>
            <Select value={surfaceId} onValueChange={setSurfaceId}>
              <SelectTrigger>
                <SelectValue placeholder={surfaceLoading ? "Loading..." : "Select surface"} />
              </SelectTrigger>
              <SelectContent>
                {surfaceOptions.map((surface) => (
                  <SelectItem key={surface.id} value={surface.id}>{surface.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {surfaceError && <span className="text-xs text-destructive">{surfaceError}</span>}
            <span className="text-xs text-muted-foreground">Must be a valid UUID</span>
          </div>
          {/* Origin Country ID */}
          <div className="flex flex-col gap-1">
            <Label>Origin Country</Label>
            <Select value={originCountryId} onValueChange={setOriginCountryId}>
              <SelectTrigger>
                <SelectValue placeholder={countryLoading ? "Loading..." : "Select country"} />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((country) => (
                  <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {countryError && <span className="text-xs text-destructive">{countryError}</span>}
            <span className="text-xs text-muted-foreground">Must be a valid UUID</span>
          </div>
          {/* Origin City ID */}
          <div className="flex flex-col gap-1">
            <Label>Origin City</Label>
            <Select value={originCityId} onValueChange={setOriginCityId} disabled={!originCountryId || cityLoading}>
              <SelectTrigger>
                <SelectValue placeholder={cityLoading ? "Loading..." : (!originCountryId ? "Select country first" : "Select city")}/>
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((city) => (
                  <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cityError && <span className="text-xs text-destructive">{cityError}</span>}
            <span className="text-xs text-muted-foreground">Must be a valid UUID</span>
          </div>
          {/* Benefits */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>Benefits (comma separated)</Label>
            <Input placeholder="e.g. benefit1,benefit2" value={benefits} onChange={e => setBenefits(e.target.value)} />
          </div>
          {/* Defects */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>Defects (comma separated)</Label>
            <Input placeholder="e.g. defect1,defect2" value={defects} onChange={e => setDefects(e.target.value)} />
          </div>
          {/* Description */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>Description</Label>
            <Textarea placeholder="Description" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          {/* Price */}
          <div className="flex flex-col gap-1">
            <Label>Price</Label>
            <Input placeholder="Price" type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          {/* Checkboxes */}
          {/* In the right panel form, remove checkboxes for Enable Chat, Enable Contact Info, Express */}
        </form>
      </Card>
    </div>
  );
}
