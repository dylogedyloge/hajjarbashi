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
import { useTranslations } from "next-intl";
import { useProfileImageUpload } from "@/hooks/useProfileImageUpload";
import { isValidUrl } from "@/lib/image-utils";
import { DEFAULT_PROFILE_FORM, getUserInitials } from "@/lib/profile-utils";
import { ImageCropper } from "@/components/ui/image-cropper";

const Profile = () => {
  const t = useTranslations("Profile");
  const { user } = useAuth();
  
  // Use the custom hook for image upload functionality
  const {
    isUploading,
    dragActive,
    isCropping,
    handleFileInputChange,
    handleUploadClick,
    handleDrag,
    handleDrop,
    handleCropAndUpload,
    cleanup
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <>
      {/* Image Cropper Modal */}
      <ImageCropper
        isOpen={isCropping}
        onClose={cleanup}
        onCropComplete={handleCropAndUpload}
        aspectRatio={1}
        minWidth={64}
        minHeight={64}
        title={t("cropModal.title")}
        instructions={{
          title: t("cropModal.instructions.title"),
          dragCorners: t("cropModal.instructions.dragCorners"),
          dragInside: t("cropModal.instructions.dragInside"),
          squareArea: t("cropModal.instructions.squareArea")
        }}
        actions={{
          cropAndUpload: t("cropModal.actions.cropAndUpload"),
          uploading: t("cropModal.actions.uploading"),
          cancel: t("cropModal.actions.cancel")
        }}
        preview={{
          title: t("cropModal.preview.title")
        }}
        cropSource={t("cropModal.cropSource")}
      />
      
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