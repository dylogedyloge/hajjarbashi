"use client";

// import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadIcon, X, VideoIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/ui/tag-input";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  // arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";

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
        isCover ? "col-span-1 row-span-1" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div
        className={`relative w-full h-0 ${
          isCover
            ? "pt-[100%] min-w-[200px] min-h-[200px]"
            : "pt-[100%] min-w-[90px] min-h-[90px]"
        } overflow-hidden rounded-lg`}
      >
        <Image
          src={img.url}
          alt={`Uploaded ${idx + 1}`}
          fill
          className="object-cover rounded-lg"
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

interface StepImagesProps {
  imageUrls: { url: string; mediaPath: string }[];
  videoUrl?: { url: string; mediaPath: string } | null;
  uploading: boolean;
  uploadError: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: (mediaPath: string) => void;
  onDeleteVideo?: (mediaPath: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  benefits: string[];
  setBenefits: (value: string[]) => void;
  defects: string[];
  setDefects: (value: string[]) => void;
  t: ReturnType<typeof useTranslations>;
}

export default function StepImages({
  imageUrls,
  videoUrl,
  uploading,
  uploadError,
  onFileChange,
  onVideoChange,
  onDeleteImage,
  onDeleteVideo,
  onDragEnd,
  benefits,
  setBenefits,
  defects,
  setDefects,
  t,
}: StepImagesProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <div className="p-8 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2">{t("productImage")}</h2>
      
      {/* Media Upload Section */}
      <div className="border border-dashed border-muted rounded-lg p-6 flex flex-col items-center justify-center text-center mb-6 min-h-[120px]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={imageUrls.map((img) => img.mediaPath)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-8 gap-3 mb-4 justify-center ">
              {/* Primary Image Slot (Large) */}
              <div className="col-span-2 row-span-2">
                {imageUrls[0] ? (
                  <SortableImage
                    key={imageUrls[0].mediaPath}
                    id={imageUrls[0].mediaPath}
                    idx={0}
                    img={imageUrls[0]}
                    isCover={true}
                    onDelete={onDeleteImage}
                    t={t}
                  />
                                 ) : (
                   <div className="relative border-2 border-dashed border-primary rounded-lg bg-muted/20 aspect-square min-w-[200px] min-h-[200px] flex flex-col items-center justify-center">
                     <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-40">
                       <UploadIcon className="w-8 h-8 text-primary mb-2" />
                       <span className="text-sm text-primary font-medium select-none mb-1">
                         {t("addImage", { defaultValue: "Add Image" })}
                       </span>
                       <span className="text-xs text-muted-foreground">
                         {t("formatJpgSize3mb", { defaultValue: "Format: JPG | Size: 3MB" })}
                       </span>
                       <input
                         type="file"
                         accept="image/*"
                         className="hidden"
                         onChange={onFileChange}
                         disabled={uploading}
                       />
                     </label>
                   </div>
                 )}
              </div>

              {/* Secondary Image Slots (2x3 Grid) */}
              <div className="col-span-4 grid grid-cols-3 gap-2">
                {Array.from({ length: 5 }, (_, idx) => {
                  const img = imageUrls[idx + 1] || null;
                  const showUpload = imageUrls.length < 7 && imageUrls.length === idx + 1;
                  
                  if (img) {
                    return (
                      <SortableImage
                        key={img.mediaPath}
                        id={img.mediaPath}
                        idx={idx + 1}
                        img={img}
                        isCover={false}
                        onDelete={onDeleteImage}
                        t={t}
                      />
                    );
                  }
                  
                                     return (
                     <div
                       key={`secondary-${idx}`}
                       className={`relative border-2 border-dashed border-muted rounded-lg bg-muted/20 aspect-square min-w-[90px] min-h-[90px] ${
                         showUpload ? "border-primary" : ""
                       }`}
                     >
                       <Skeleton className="w-full h-full rounded-lg" />
                       {showUpload && (
                         <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-40">
                           <UploadIcon className="w-4 h-4 text-primary mb-1" />
                           <span className="text-xs text-primary font-medium select-none">
                             {t("clickHere", { defaultValue: "Click Here" })}
                           </span>
                           <input
                             type="file"
                             accept="image/*"
                             className="hidden"
                             onChange={onFileChange}
                             disabled={uploading}
                           />
                         </label>
                       )}
                     </div>
                   );
                })}
              </div>

              {/* Video Upload Slot */}
              <div className="col-span-2 row-span-2">
                {videoUrl ? (
                  <div className="relative w-full h-0 pt-[56.25%] overflow-hidden rounded-lg">
                    <video
                      src={videoUrl.url}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      controls
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity z-30"
                      onClick={() => onDeleteVideo?.(videoUrl.mediaPath)}
                      aria-label={t("deleteVideo", { defaultValue: "Delete Video" })}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-muted rounded-lg bg-muted/20 min-h-[200px] flex flex-col items-center justify-center">
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-40">
                      <VideoIcon className="w-8 h-8 text-primary mb-2" />
                      <span className="text-sm text-primary font-medium select-none mb-1">
                        {t("addVideo", { defaultValue: "Add Video" })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("formatMp4Size30mb", { defaultValue: "Format: MP4 | Size: 30MB" })}
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={onVideoChange}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}
              </div>
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
        {imageUrls.length >= 7 && (
          <div className="text-xs text-orange-500 mt-2">
            {t("maxImages", { count: 7 })}
          </div>
        )}
      </div>

      {/* Pros and Cons Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros */}
        <div className="space-y-2">
          <Label htmlFor="benefits" className="text-sm font-medium">
            {t("pros", { defaultValue: "Pros" })}
          </Label>
          <TagInput
            value={benefits}
            onChange={setBenefits}
            placeholder={t("prosPlaceholder", { defaultValue: "Type benefits and press Enter" })}
            // className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            {t("prosHelp", { defaultValue: "Type and press Enter to add benefits" })}
          </p>
        </div>

        {/* Cons */}
        <div className="space-y-2">
          <Label htmlFor="defects" className="text-sm font-medium">
            {t("cons", { defaultValue: "Cons" })}
          </Label>
          <TagInput
            value={defects}
            onChange={setDefects}
            placeholder={t("consPlaceholder", { defaultValue: "Type defects and press Enter" })}
            // className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            {t("consHelp", { defaultValue: "Type and press Enter to add defects" })}
          </p>
        </div>
      </div>
    </div>
  );
} 