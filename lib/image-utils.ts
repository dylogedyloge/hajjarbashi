import { Crop, centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';

/**
 * Centers a crop area with a specific aspect ratio
 */
export function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

/**
 * Validates if a URL is valid
 */
export function isValidUrl(url: string | null): boolean {
  if (!url || url.trim() === "") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Crops an image using canvas and returns a blob
 */
export function cropImage(
  imgElement: HTMLImageElement,
  crop: Crop,
  fileName: string = 'cropped-image.jpg'
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const scaleX = imgElement.naturalWidth / imgElement.width;
    const scaleY = imgElement.naturalHeight / imgElement.height;
    const pixelCrop = convertToPixelCrop(crop, imgElement.width, imgElement.height);
    
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    ctx.drawImage(
      imgElement,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], fileName, { type: blob.type });
          resolve(file);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      'image/jpeg',
      0.95
    );
  });
}

/**
 * Creates an object URL for a file
 */
export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes an object URL to free memory
 */
export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
} 