import { useRef, useState, useCallback } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@/lib/auth-context";
import { Upload, Loader2 } from "lucide-react";
import { ImageCropper } from "@/components/profile/image-cropper";
import { getUserInitials } from "@/lib/profile-utils";
import { profileService } from "@/lib/profile";
import { toast } from "sonner";

interface AvatarUploaderProps {
  user: User | null;
  token: string;
  login: (user: User, token: string) => void;
  t: (key: string) => string;
}

export function AvatarUploader({ user, token, login, t }: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Helper function to validate file
  const validateFile = useCallback((file: File): boolean => {
    const validTypes = ['image/svg+xml', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (!validTypes.includes(file.type)) {
      toast.error(t("errors.invalidFileType"));
      return false;
    }
    if (file.size > maxSize) {
      toast.error(t("errors.fileTooLarge"));
      return false;
    }
    return true;
  }, [t]);

  // Upload image to API
  const uploadImage = async (file: File): Promise<void> => {
    if (!user || !token) {
      toast.error(t("errors.authenticationRequired"));
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
        toast.success(t("messages.avatarUpdated"));
      } else {
        throw new Error(data.message || t("errors.uploadFailed"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : t("errors.uploadFailed");
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedImage(file);
      setShowCrop(true);
    }
  }, [validateFile]);

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Handle click to upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle crop complete from ImageCropper
  const handleCropComplete = async (croppedFile: File) => {
    setShowCrop(false);
    setSelectedImage(null);
    await uploadImage(croppedFile);
  };

  return (
    <>
      {/* Crop Modal using ImageCropper */}
      <ImageCropper
        isOpen={showCrop}
        file={selectedImage}
        onClose={() => {
          setShowCrop(false);
          setSelectedImage(null);
        }}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        minWidth={64}
        minHeight={64}
        title={t("cropModal.title")}
        instructions={{
          title: t("cropModal.instructions.title"),
          dragCorners: t("cropModal.instructions.dragCorners"),
          dragInside: t("cropModal.instructions.dragInside"),
          squareArea: t("cropModal.instructions.squareArea"),
        }}
        actions={{
          cropAndUpload: t("cropModal.actions.cropAndUpload"),
          uploading: t("cropModal.actions.uploading"),
          cancel: t("cropModal.actions.cancel"),
        }}
        preview={{
          title: t("cropModal.preview.title"),
        }}
        cropSource={t("cropModal.cropSource")}
        className=""
      />
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="w-20 h-20">
            {user?.avatar_thumb && user.avatar_thumb.startsWith('http') ? (
              <AvatarImage
                src={user.avatar_thumb}
                alt={t("avatar.alt")}
              />
            ) : null}
            <AvatarFallback className="text-2xl font-semibold">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        {/* Upload Area */}
        <div
          className={`w-full max-w-xs border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/svg+xml,image/jpeg,image/jpg,image/png"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-primary font-medium">{t("avatar.upload.clickHere")}</span> {t("avatar.upload.orDrag")}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("avatar.upload.supportedFormats")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 