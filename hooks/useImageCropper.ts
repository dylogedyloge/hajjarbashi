import { useState, useRef, useCallback, useEffect } from 'react';
import { Crop } from 'react-image-crop';
import { centerAspectCrop, cropImage, createObjectURL, revokeObjectURL } from '@/lib/image-utils';
import { validateImageFile } from '@/lib/file-validation';

interface UseImageCropperOptions {
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onError?: (error: string) => void;
  onSuccess?: (file: File) => void;
}

export function useImageCropper(options: UseImageCropperOptions = {}) {
  const {
    aspectRatio = 1,
    minWidth = 64,
    minHeight = 64,
    maxWidth,
    maxHeight,
    onError,
    onSuccess
  } = options;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const isValid = validateImageFile(file, (errorMessage) => {
      onError?.(errorMessage);
    });

    if (isValid) {
      setSelectedImage(file);
      const url = createObjectURL(file);
      setImageUrl(url);
      setIsCropping(true);
    }
  }, [onError]);

  // When the image loads, center the crop
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }, [aspectRatio]);

  // Update preview when crop changes
  const updatePreview = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { convertToPixelCrop } = require('react-image-crop');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    const pixelCrop = convertToPixelCrop(completedCrop, imgRef.current.width, imgRef.current.height);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the cropped image
    ctx.drawImage(
      imgRef.current,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }, [completedCrop]);

  // Update preview when crop completes
  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  // Handle crop completion
  const handleCropComplete = useCallback(async (onCropComplete?: (file: File) => Promise<void>) => {
    if (!completedCrop || !imgRef.current || !selectedImage) return;
    
    try {
      const croppedFile = await cropImage(
        imgRef.current,
        completedCrop,
        selectedImage.name || 'cropped-image.jpg'
      );
      
      if (onCropComplete) {
        await onCropComplete(croppedFile);
      } else {
        onSuccess?.(croppedFile);
      }
      
      // Cleanup
      cleanup();
    } catch (error) {
      console.error("Crop error:", error);
      onError?.("Failed to crop image");
    }
  }, [completedCrop, selectedImage, onSuccess, onError]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (imageUrl) {
      revokeObjectURL(imageUrl);
    }
    setSelectedImage(null);
    setImageUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setIsCropping(false);
  }, [imageUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) {
        revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return {
    // State
    selectedImage,
    imageUrl,
    crop,
    completedCrop,
    isCropping,
    
    // Refs
    imgRef,
    
    // Handlers
    handleFileSelect,
    onImageLoad,
    handleCropComplete,
    cleanup,
    
    // Setters
    setCrop,
    setCompletedCrop,
    setIsCropping,
    
    // Crop configuration
    aspectRatio,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight
  };
} 