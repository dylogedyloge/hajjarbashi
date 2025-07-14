"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useCallback, useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import ReactCrop, { centerCrop, convertToPixelCrop, Crop, makeAspectCrop } from "react-image-crop";
import { getUserInitials } from "@/lib/profile-utils";
import { profileService } from "@/lib/profile";

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
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

const Profile = () => {
  const t = useTranslations("Profile");
  const { user, token, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("China");
  const [selectedCity, setSelectedCity] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  // Example cities for each country
  const citiesByCountry: Record<string, string[]> = {
    China: ["Beijing", "Shanghai", "Guangzhou"],
    Malaysia: ["Kuala Lumpur", "Penang", "Johor Bahru"],
    Iran: ["Tehran", "Mashhad", "Isfahan"],
  };

  // Placeholder state for form fields
  const form = {
    name: "John Doe",
    company: "Hajjarbashi",
    position: "Manager",
    country: selectedCountry,
    city: selectedCity,
    preferredLanguage,
    email: "example@domain.com",
    phone: "+989376544675",
    bio: "Lorem Ipsum is dummy text...",
  };

  // Helper function to validate URL
  const isValidUrl = (url: string | null): boolean => {
    if (!url || url.trim() === "") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Helper function to validate file
  const validateFile = (file: File): boolean => {
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
  };

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
        const baseUrl = 'https://api.hajjardevs.ir/';
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

  // Crop and upload the cropped image
  const handleCropAndUpload = async () => {
    if (!completedCrop || !imgRef.current) return;
    // Create a canvas to crop the image
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    const pixelCrop = convertToPixelCrop(completedCrop, imgRef.current.width, imgRef.current.height);
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      imgRef.current,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        const croppedFile = new File([blob], selectedImage?.name || 'avatar.jpg', { type: blob.type });
        setShowCrop(false);
        setSelectedImage(null);
        setImageUrl(null);
        setCrop(undefined);
        setCompletedCrop(undefined);
        await uploadImage(croppedFile);
      }
    }, 'image/jpeg', 0.95);
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedImage(file);
      setImageUrl(URL.createObjectURL(file));
      setShowCrop(true);
    }
  }, []);

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

  // When the image loads, center the crop
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio
  };

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <>
      {/* Crop Modal */}
      {showCrop && imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-xl shadow-2xl max-w-5xl w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <h2 className="text-xl font-semibold text-foreground">{t("cropModal.title")}</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowCrop(false);
                  setSelectedImage(null);
                  setImageUrl(null);
                  setCrop(undefined);
                  setCompletedCrop(undefined);
                }}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                    aspect={1}
                    minWidth={64}
                    minHeight={64}
                    keepSelection
                    onComplete={(c) => setCompletedCrop(c)}
                    className="max-w-full max-h-full"
                  >
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt={t("cropModal.cropSource")}
                      onLoad={onImageLoad}
                      className="max-w-full max-h-[60vh] lg:max-h-[70vh] object-contain rounded-lg shadow-lg"
                    />
                  </ReactCrop>
                </div>
              </div>

              {/* Sidebar - Instructions and Actions */}
              <div className="w-full lg:w-80 bg-card border-l border-border p-6 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">{t("cropModal.instructions.title")}</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p>{t("cropModal.instructions.dragCorners")}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p>{t("cropModal.instructions.dragInside")}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p>{t("cropModal.instructions.squareArea")}</p>
                    </div>
                  </div>

                  {/* Preview */}
                  {completedCrop && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3 text-foreground">{t("cropModal.preview.title")}</h4>
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
                        {t("cropModal.actions.uploading")}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {t("cropModal.actions.cropAndUpload")}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCrop(false);
                      setSelectedImage(null);
                      setImageUrl(null);
                      setCrop(undefined);
                      setCompletedCrop(undefined);
                    }}
                    className="w-full h-11"
                  >
                    {t("cropModal.actions.cancel")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <form className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12">
        {/* Change Avatar */}
        <Card className="overflow-visible">
          <CardHeader className="pb-4">
            <div className="text-base font-semibold">
              {t("avatar.title")}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                {user?.avatar_thumb && isValidUrl(user.avatar_thumb) ? (
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
          </CardContent>
        </Card>
        {/* Account Information */}
        <Card>
          <CardHeader className="pb-4">
            <div className="text-base font-semibold">
              {t("accountInformation.title")}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">{t("accountInformation.name")}</label>
                <Input value={form.name} readOnly />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium">{t("accountInformation.preferredLanguage")}</label>
                <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("accountInformation.selectPreferredLanguage")} className="w-full" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">{t("accountInformation.languages.english")}</SelectItem>
                    <SelectItem value="Persian">{t("accountInformation.languages.persian")}</SelectItem>
                    <SelectItem value="Chinese">{t("accountInformation.languages.chinese")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">{t("accountInformation.companyName")}</label>
                <Input value={form.company} readOnly />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">{t("accountInformation.position")}</label>
                <Input value={form.position} readOnly />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">{t("accountInformation.country")}</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry} defaultValue={form.country}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("accountInformation.selectCountry")} className="w-full" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="China">{t("locations.china")}</SelectItem>
                    <SelectItem value="Malaysia">{t("locations.malaysia")}</SelectItem>
                    <SelectItem value="Iran">{t("locations.iran")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">{t("accountInformation.city")}</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("accountInformation.selectCity")} className="w-full" />
                  </SelectTrigger>
                  <SelectContent>
                    {citiesByCountry[selectedCountry]?.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium">{t("accountInformation.bio")}</label>
                <Textarea
                  value={form.bio}
                  readOnly
                  maxLength={300}
                  className="resize-none min-h-24"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {form.bio.length}/300
                </div>
              </div>
              
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" className="w-full h-12 rounded-full text-lg">
              {t("accountInformation.save")}
            </Button>
          </CardFooter>
        </Card>
        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-4">
            <div className="text-base font-semibold">
              {t("contactInformation.title")}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t("contactInformation.email")}</label>
              <Input value={form.email} readOnly />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t("contactInformation.phoneNumber")}</label>
              <PhoneInput value={form.phone} readOnly />
            </div>
            <div className="flex items-center gap-2 md:col-span-2 mt-2">
              <input
                type="checkbox"
                id="show-contact-info"
                checked={showContactInfo}
                onChange={() => setShowContactInfo((v) => !v)}
                className="accent-primary w-4 h-4"
              />
              <label htmlFor="show-contact-info" className="text-sm font-medium cursor-pointer">
                {t("contactInformation.showContactInfo")}
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" className="w-full h-12 rounded-full text-lg">
              {t("contactInformation.save")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default Profile; 