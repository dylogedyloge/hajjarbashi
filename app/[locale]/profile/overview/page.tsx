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
import { useEffect, useCallback } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useTranslations } from "next-intl";
import { useProfileImageUpload } from "@/hooks/useProfileImageUpload";
import { isValidUrl, centerAspectCrop } from "@/lib/image-utils";
import { DEFAULT_PROFILE_FORM, getUserInitials } from "@/lib/profile-utils";

const Profile = () => {
  const t = useTranslations("Profile");
  const { user } = useAuth();
  
  // Use the custom hook for image upload functionality
  const {
    isUploading,
    dragActive,
    showCrop,
    imageUrl,
    crop,
    completedCrop,
    fileInputRef,
    imgRef,
    handleFileInputChange,
    handleUploadClick,
    handleDrag,
    handleDrop,
    handleCropAndUpload,
    onImageLoad,
    cleanup,
    setCrop,
    setCompletedCrop,
    setShowCrop
  } = useProfileImageUpload({
    onSuccess: (updatedUser) => {
      toast.success(t("messages.avatarUpdated"));
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  // Placeholder state for form fields
  const form = DEFAULT_PROFILE_FORM;

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
  }, [completedCrop, imgRef]);

  // Update preview when crop completes
  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
                onClick={cleanup}
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
                    onClick={cleanup}
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
      <form className="w-full max-w-3xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
        {/* Change Avatar */}
        <section className="flex flex-col items-center gap-2 border-b pb-8">
          <div className="text-base font-semibold w-full text-left mb-2">
            {t("avatar.title")}
          </div>
          <div className="flex flex-col items-center gap-2 w-full">
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
        </section>
        {/* Account Information */}
        <section className="grid grid-cols-2 gap-6">
          <div className="col-span-2 text-base font-semibold mb-2">
            {t("accountInformation.title")}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t("accountInformation.firstName")}</label>
            <Input value={form.firstName} readOnly />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t("accountInformation.lastName")}</label>
            <Input value={form.lastName} readOnly />
          </div>
          <div className="flex flex-col gap-2 col-span-1">
            <label className="text-sm font-medium">{t("accountInformation.companyName")}</label>
            <Input value={form.company} readOnly />
          </div>
          <div className="flex flex-col gap-2 col-span-1">
            <label className="text-sm font-medium">{t("accountInformation.location")}</label>
            <Select defaultValue={form.location}>
              <SelectTrigger>
                <SelectValue placeholder={t("accountInformation.selectLocation")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="China">{t("locations.china")}</SelectItem>
                <SelectItem value="Malaysia">{t("locations.malaysia")}</SelectItem>
                <SelectItem value="Iran">{t("locations.iran")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
        {/* Display Information */}
        <section className="grid grid-cols-2 gap-6">
          <div className="col-span-2 text-base font-semibold mb-2">
            {t("displayInformation.title")}
          </div>
          <div className="flex flex-col gap-2 col-span-1">
            <label className="text-sm font-medium">{t("displayInformation.email")}</label>
            <Input value={form.email} readOnly />
          </div>
          <div className="flex flex-col gap-2 col-span-1">
            <label className="text-sm font-medium">{t("displayInformation.phoneNumber")}</label>
            <PhoneInput value={form.phone} readOnly />
          </div>
          <div className="flex flex-col gap-2 col-span-2">
            <label className="text-sm font-medium">{t("displayInformation.description")}</label>
            <Textarea
              value={form.description}
              readOnly
              maxLength={300}
              className="resize-none min-h-24"
            />
            <div className="text-xs text-muted-foreground text-right">
              {form.description.length}/300
            </div>
          </div>
        </section>
        <Button type="submit" className="w-full h-12 rounded-full text-lg mt-4">
          {t("actions.save")}
        </Button>
      </form>
    </>
  );
};

export default Profile; 