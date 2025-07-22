import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { profileService } from '@/lib/profile';
import { validateImageFile } from '@/lib/file-validation';
import { createObjectURL, revokeObjectURL } from '@/lib/image-utils';
import { useDragAndDrop } from '@/lib/drag-drop-utils';
import { useImageCropper } from '@/hooks/useImageCropper';
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

  // Use the image cropper hook
  const {
    selectedImage,
    imageUrl,
    crop,
    completedCrop,
    isCropping,
    imgRef,
    handleFileSelect,
    onImageLoad,
    handleCropComplete,
    cleanup: cleanupCropper,
    setCrop,
    setCompletedCrop,
    setIsCropping
  } = useImageCropper({
    aspectRatio: 1, // Square aspect ratio for avatars
    onError: (error) => {
      options.onError?.(error);
      if (options.showToast !== false) {
        toast.error(error);
      }
    }
  });

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
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.hajjardevs.ir/';
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

  // Handle crop and upload
  const handleCropAndUpload = useCallback(async () => {
    await handleCropComplete(async (croppedFile) => {
      await uploadImage(croppedFile);
    });
  }, [handleCropComplete, uploadImage]);

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

  // Cleanup function
  const cleanup = useCallback(() => {
    cleanupCropper();
  }, [cleanupCropper]);

  return {
    // State
    isUploading,
    dragActive,
    isCropping,
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
    setIsCropping,
    
    // Upload function
    uploadImage
  };
} 