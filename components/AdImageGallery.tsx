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

  return (
    <div>
      <div className="aspect-square bg-muted flex items-center justify-center relative w-full">
        {selectedImage ? (
          <Image src={selectedImage} alt={alt} fill className="object-cover" />
        ) : (
          <Skeleton className="w-full h-full" />
        )}
      </div>
      {galleryImages.length > 0 && (
        <div className="flex gap-2 p-4 border-t bg-muted overflow-x-auto">
          {galleryImages.map((img, i) => {
            const imgUrl = img.startsWith("http") ? img : `https://api.hajjardevs.ir/${img}`;
            return (
              <div
                key={i}
                className="relative w-24 h-24 flex-shrink-0 cursor-pointer"
                onClick={() => setSelectedImage(imgUrl)}
              >
                <Image
                  src={imgUrl}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  className={`object-cover rounded ${selectedImage === imgUrl ? "ring-2 ring-primary" : ""}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 