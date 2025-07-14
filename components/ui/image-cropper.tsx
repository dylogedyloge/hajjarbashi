"use client";
import React, { useRef, useCallback, useEffect, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';
import { Crop,  convertToPixelCrop } from 'react-image-crop';
import { centerAspectCrop, cropImage, createObjectURL, revokeObjectURL } from '@/lib/image-utils';
// import { validateImageFile } from '@/lib/file-validation';

interface ImageCropperProps {
  isOpen: boolean;
  file?: File | null;
  onClose: () => void;
  onCropComplete: (file: File) => Promise<void>;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  title?: string;
  instructions?: {
    title: string;
    dragCorners: string;
    dragInside: string;
    squareArea: string;
  };
  actions?: {
    cropAndUpload: string;
    uploading: string;
    cancel: string;
  };
  preview?: {
    title: string;
  };
  cropSource?: string;
  className?: string;
}

export function ImageCropper({
  isOpen,
  file,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  minWidth = 64,
  minHeight = 64,
  maxWidth,
  maxHeight,
  title = "Crop Image",
  instructions = {
    title: "Instructions",
    dragCorners: "Drag the corners to resize the crop area",
    dragInside: "Click and drag inside the crop area to move it",
    squareArea: "The crop area must be square for best results"
  },
  actions = {
    cropAndUpload: "Crop & Upload",
    uploading: "Uploading...",
    cancel: "Cancel"
  },
  preview = {
    title: "Preview"
  },
  cropSource = "Crop source",
  className = ""
}: ImageCropperProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Handle file selection
  // const handleFileSelect = useCallback((file: File) => {
  //   const isValid = validateImageFile(file, (errorMessage) => {
  //     console.error(errorMessage);
  //   });

  //   if (isValid) {
  //     setSelectedImage(file);
  //     const url = createObjectURL(file);
  //     setImageUrl(url);
  //   }
  // }, []);

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

  // When the file prop changes, update selectedImage and imageUrl
  useEffect(() => {
    if (file) {
      setSelectedImage(file);
      const url = createObjectURL(file);
      setImageUrl(url);
    }
  }, [file]);

  // Handle crop and upload
  const handleCropAndUpload = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !selectedImage) return;
    
    setIsUploading(true);
    
    try {
      const croppedFile = await cropImage(
        imgRef.current,
        completedCrop,
        selectedImage.name || 'cropped-image.jpg'
      );
      
      await onCropComplete(croppedFile);
      
      // Cleanup
      if (imageUrl) {
        revokeObjectURL(imageUrl);
      }
      setSelectedImage(null);
      setImageUrl(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
      onClose();
    } catch (error) {
      console.error("Crop error:", error);
    } finally {
      setIsUploading(false);
    }
  }, [completedCrop, selectedImage, imageUrl, onCropComplete, onClose]);

  // Cleanup on unmount or close
  const handleClose = useCallback(() => {
    if (imageUrl) {
      revokeObjectURL(imageUrl);
    }
    setSelectedImage(null);
    setImageUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    onClose();
  }, [imageUrl, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) {
        revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={`bg-background border border-border rounded-xl shadow-2xl max-w-5xl w-[95vw] max-h-[95vh] flex flex-col overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Crop Area */}
          <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
            <div className="relative max-w-full max-h-full">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                aspect={aspectRatio}
                minWidth={minWidth}
                minHeight={minHeight}
                maxWidth={maxWidth}
                maxHeight={maxHeight}
                keepSelection
                onComplete={(c) => setCompletedCrop(c)}
                className="max-w-full max-h-full"
              >
                {imageUrl && (
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt={cropSource}
                    onLoad={onImageLoad}
                    className="max-w-full max-h-[60vh] lg:max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                )}
              </ReactCrop>
            </div>
          </div>

          {/* Sidebar - Instructions and Actions */}
          <div className="w-full lg:w-80 bg-card border-l border-border p-6 flex flex-col">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4 text-foreground">{instructions.title}</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>{instructions.dragCorners}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>{instructions.dragInside}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>{instructions.squareArea}</p>
                </div>
              </div>

              {/* Preview */}
              {completedCrop && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3 text-foreground">{preview.title}</h4>
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted">
                    <canvas
                      id="preview-canvas"
                      className="w-full h-full object-cover"
                      width="80"
                      height="80"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-6 border-t border-border">
              <Button
                onClick={handleCropAndUpload}
                disabled={!completedCrop || isUploading}
                className="w-full h-11"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {actions.uploading}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {actions.cropAndUpload}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full h-11"
              >
                {actions.cancel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 