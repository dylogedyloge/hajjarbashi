import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { profileService } from '@/lib/profile';
import { validateImageFile } from '@/lib/file-validation';
import { cropImage, createObjectURL, revokeObjectURL } from '@/lib/image-utils';
import { useDragAndDrop } from '@/lib/drag-drop-utils';
import { toast } from 'sonner';

interface UseProfileImageUploadOptions {
  onSuccess?: (updatedUser: any) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

export function useProfileImageUpload(options: UseProfileImageUploadOptions = {}) {
  const { user, token, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<any>();
  const [completedCrop, setCompletedCrop] = useState<any>();
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Upload image to API
  const uploadImage = useCallback(async (file: File): Promise<void> => {
    if (!user || !token) {
      const errorMsg = "Authentication required";
      options.onError?.(errorMsg);
      if (options.showToast !== false) {
        toast.error(errorMsg);
      }
      return;
    }

    setIsUploading(true);

    try {
      const data = await profileService.updateProfileImage(file, token);

      if (data.success) {
        const baseUrl = 'https://api.hajjardevs.ir/';
        const updatedUser = {
          ...user,
          avatar: baseUrl + data.data.avatar,
          avatar_thumb: baseUrl + data.data.avatar_thumb,
        };
        
        login(updatedUser, token);
        options.onSuccess?.(updatedUser);
        
        if (options.showToast !== false) {
          toast.success("Avatar updated successfully!");
        }
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      options.onError?.(errorMessage);
      if (options.showToast !== false) {
        toast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  }, [user, token, login, options]);

  // Crop and upload the cropped image
  const handleCropAndUpload = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;
    
    try {
      const croppedFile = await cropImage(
        imgRef.current,
        completedCrop,
        selectedImage?.name || 'avatar.jpg'
      );
      
      setShowCrop(false);
      setSelectedImage(null);
      setImageUrl(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
      
      await uploadImage(croppedFile);
    } catch (error) {
      console.error("Crop error:", error);
      const errorMessage = error instanceof Error ? error.message : "Crop failed";
      options.onError?.(errorMessage);
      if (options.showToast !== false) {
        toast.error(errorMessage);
      }
    }
  }, [completedCrop, selectedImage, uploadImage, options]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const isValid = validateImageFile(file, (errorMessage) => {
      options.onError?.(errorMessage);
      if (options.showToast !== false) {
        toast.error(errorMessage);
      }
    });

    if (isValid) {
      setSelectedImage(file);
      const url = createObjectURL(file);
      setImageUrl(url);
      setShowCrop(true);
    }
  }, [options]);

  // Handle file input change
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  // Handle click to upload
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Drag and drop handlers
  const { handleDrag, handleDrop } = useDragAndDrop(
    handleFileSelect,
    setDragActive
  );

  // When the image loads, center the crop
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Import centerAspectCrop from image-utils
    const { centerAspectCrop } = require('@/lib/image-utils');
    setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (imageUrl) {
      revokeObjectURL(imageUrl);
    }
    setShowCrop(false);
    setSelectedImage(null);
    setImageUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [imageUrl]);

  return {
    // State
    isUploading,
    dragActive,
    showCrop,
    selectedImage,
    imageUrl,
    crop,
    completedCrop,
    
    // Refs
    fileInputRef,
    imgRef,
    
    // Handlers
    handleFileSelect,
    handleFileInputChange,
    handleUploadClick,
    handleDrag,
    handleDrop,
    handleCropAndUpload,
    onImageLoad,
    cleanup,
    
    // Setters
    setCrop,
    setCompletedCrop,
    setShowCrop,
    
    // Upload function
    uploadImage
  };
} 