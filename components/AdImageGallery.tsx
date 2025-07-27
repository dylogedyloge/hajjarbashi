"use client";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  mainImageUrl: string | null;
  galleryImages: string[];
  alt: string;
};

export default function AdImageGallery({ mainImageUrl, galleryImages, alt }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(mainImageUrl);

  // Combine main image with gallery images, ensuring no duplicates
  const allImages = [mainImageUrl, ...galleryImages].filter((img, index, arr) => 
    img && arr.indexOf(img) === index
  ) as string[];

  return (
    <div className="flex gap-4 h-full min-h-[400px]">
      {/* Vertical Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex flex-col gap-2">
          {allImages.map((img, i) => {
            const imgUrl = img.startsWith("http") ? img : `https://api.hajjardevs.ir/${img}`;
            return (
              <div
                key={i}
                className="relative w-20 h-20 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden"
                onClick={() => setSelectedImage(imgUrl)}
              >
                <Image
                  src={imgUrl}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  className={`object-cover ${selectedImage === imgUrl ? "ring-2 ring-primary" : ""}`}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1 bg-muted flex items-center justify-center relative rounded-lg overflow-hidden h-full">
        {selectedImage ? (
          <Image src={selectedImage} alt={alt} fill className="object-cover" />
        ) : (
          <Skeleton className="w-full h-full" />
        )}
      </div>
    </div>
  );
} 