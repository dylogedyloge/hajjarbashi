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
import { Upload, Loader2, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ImageCropper } from "@/components/ui/image-cropper";
import { getUserInitials } from "@/lib/profile-utils";
import { profileService, fetchCountries, fetchCities, updateProfile, getMyProfile, Country, City, saveContactInfo, ContactInfoItem } from "@/lib/profile";
import { useLocaleDirection } from "@/hooks/useLocaleDirection";


const Profile = () => {
  const t = useTranslations("Profile");
  const { user, token, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("China");
  const [selectedCity, setSelectedCity] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  // Editable state for account info
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [company, setCompany] = useState(user?.company_name || "");
  const [position, setPosition] = useState(user?.position || "");
  const [accountInfoLoading, setAccountInfoLoading] = useState(false);
  const [accountInfoError, setAccountInfoError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [contactInfos, setContactInfos] = useState([
    { title: "", type: "phone" as "phone" | "email", value: "" },
  ]);
  const [contactInfoLoading, setContactInfoLoading] = useState(false);
  const [contactInfoError, setContactInfoError] = useState<string | null>(null);

  // Get current locale from next-intl
  const locale = useLocale();
  const { dir } = useLocaleDirection();

  useEffect(() => {
    setCountriesLoading(true);
    setCountriesError(null);
    fetchCountries(locale)
      .then((data) => setCountries(data))
      .catch((err) => setCountriesError(err.message || 'Failed to load countries'))
      .finally(() => setCountriesLoading(false));
  }, [locale]);

  // Fetch user profile and populate fields
  useEffect(() => {
    if (!token) return;
    setProfileLoading(true);
    setProfileError(null);
    getMyProfile(token, locale)
      .then((resp) => {
        const data = resp.data;
        setName(data.name || "");
        setBio(data.bio || "");
        setCompany(data.company_name || "");
        setPosition(data.position || "");
        setShowContactInfo(!!data.show_contact_info);
        setPreferredLanguage(locale);
        setSelectedCountry(data.country_name || "");
        setSelectedCity(data.city_name || "");
        // Set contactInfos from API response
        if (Array.isArray(data.contact_info) && data.contact_info.length > 0) {
          setContactInfos(
            data.contact_info.map((item: ContactInfoItem) => ({
              title: item.title || "",
              value: item.value || "",
              type: item.value && typeof item.value === "string" && item.value.includes("@") ? "email" : "phone"
            }))
          );
        } else {
          setContactInfos([{ title: "", type: "phone", value: "" }]);
        }
      })
      .catch((err) => setProfileError(err.message || 'Failed to load profile'))
      .finally(() => setProfileLoading(false));
  }, [token, locale]);


  // Remove static form object, use state instead

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

  // When the image loads, center the crop
  // const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
  //   const { width, height } = e.currentTarget;
  //   // setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio
  // };

  // Handle crop complete from ImageCropper
  const handleCropComplete = async (croppedFile: File) => {
    setShowCrop(false);
    setSelectedImage(null);
    await uploadImage(croppedFile);
  };

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(URL.createObjectURL(selectedImage));
      }
    };
  }, [selectedImage]);

  // Fetch cities when selectedCountry changes
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      return;
    }
    setCitiesLoading(true);
    setCitiesError(null);
    // Find the selected country id
    const countryObj = countries.find(c => c.name === selectedCountry);
    const countryId = countryObj?.id || '';
    if (!countryId) {
      setCities([]);
      setCitiesLoading(false);
      return;
    }
    fetchCities(countryId, locale)
      .then((data) => setCities(data))
      .catch((err) => setCitiesError(err.message || 'Failed to load cities'))
      .finally(() => setCitiesLoading(false));
  }, [selectedCountry, countries, locale]);

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
      {profileLoading ? (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12 text-center text-muted-foreground py-12">{t('loading')}</div>
      ) : profileError ? (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12 text-center text-destructive py-12">{profileError}</div>
      ) : (
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
                <Input value={name} onChange={e => setName(e.target.value)} />
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
                <Input value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">{t("accountInformation.position")}</label>
                <Input value={position} onChange={e => setPosition(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">{t("accountInformation.country")}</label>
                <Select
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                  disabled={countriesLoading || !!countriesError}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={countriesLoading ? t("loading") : countriesError ? t("error") : t("accountInformation.selectCountry") } className="w-full" />
                  </SelectTrigger>
                  <SelectContent>
                    {countriesLoading && (
                      <div className="px-4 py-2 text-muted-foreground">{t("loading")}</div>
                    )}
                    {countriesError && (
                      <div className="px-4 py-2 text-destructive">{t("error")}</div>
                    )}
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.name}>{country.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">{t("accountInformation.city")}</label>
                <Select
                  value={selectedCity}
                  onValueChange={setSelectedCity}
                  disabled={citiesLoading || !!citiesError}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={citiesLoading ? t("loading") : citiesError ? t("error") : t("accountInformation.selectCity")} className="w-full" />
                  </SelectTrigger>
                  <SelectContent>
                    {citiesLoading && (
                      <div className="px-4 py-2 text-muted-foreground">{t("loading")}</div>
                    )}
                    {citiesError && (
                      <div className="px-4 py-2 text-destructive">{t("error")}</div>
                    )}
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium">{t("accountInformation.bio")}</label>
                <Textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={300}
                  className="resize-none min-h-24"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {bio.length}/300
                </div>
              </div>
              
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col w-full gap-2">
              <Button
                type="button"
                className="w-full h-12 rounded-full text-lg"
                onClick={async () => {
                  setAccountInfoLoading(true);
                  setAccountInfoError(null);
                  try {
                    // Find country and city IDs
                    const countryObj = countries.find(c => c.name === selectedCountry);
                    const cityObj = cities.find(c => c.name === selectedCity);
                    if (!countryObj || !cityObj) throw new Error('Please select a valid country and city');
                    // Map preferredLanguage to language code
                    let languageCode = 'en';
                    if (preferredLanguage === 'Persian') languageCode = 'fa';
                    else if (preferredLanguage === 'Chinese') languageCode = 'zh';
                    const req = {
                      country_id: countryObj.id,
                      bio,
                      position,
                      name,
                      company_name: company,
                      city_id: cityObj.id,
                      show_contact_info: showContactInfo,
                      language: languageCode,
                    };
                    if (!token) throw new Error('Not authenticated');
                    const resp = await updateProfile(req, token, locale);
                    if (resp.success) {
                      toast.success(t('profileUpdated') || 'Profile updated!');
                    } else {
                      throw new Error(resp.message || 'Failed to update profile');
                    }
                  } catch (err: unknown) {
                    setAccountInfoError(err instanceof Error ? err.message : 'Failed to update profile');
                  } finally {
                    setAccountInfoLoading(false);
                  }
                }}
                disabled={accountInfoLoading}
              >
                {accountInfoLoading ? t('loading') : t('accountInformation.save')}
              </Button>
              {accountInfoError && <div className="text-destructive text-sm text-center">{accountInfoError}</div>}
            </div>
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
            {contactInfos.map((info, idx) => (
              <div key={idx} className="relative border rounded-lg p-4 mb-2 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">{t("contactInformation.contactTitle")}</label>
                  <Input
                    value={info.title}
                    onChange={e => {
                      const newInfos = [...contactInfos];
                      newInfos[idx].title = e.target.value;
                      setContactInfos(newInfos);
                    }}
                    placeholder={t("contactInformation.contactTitlePlaceholder")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">{t("contactInformation.contactType")}</label>
                  <Select
                    value={info.type}
                    onValueChange={val => {
                      const newInfos = [...contactInfos];
                      newInfos[idx].type = val as "phone" | "email";
                      setContactInfos(newInfos);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("contactInformation.selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">{t("contactInformation.phoneNumber")}</SelectItem>
                      <SelectItem value="email">{t("contactInformation.email")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    {info.type === "phone"
                      ? t("contactInformation.phoneNumber")
                      : t("contactInformation.email")}
                  </label>
                  {info.type === "phone" ? (
                    <PhoneInput
                      value={info.value}
                      onChange={val => {
                        const newInfos = [...contactInfos];
                        newInfos[idx].value = val;
                        setContactInfos(newInfos);
                      }}
                      placeholder={t("contactInformation.phonePlaceholder")}
                    />
                  ) : (
                    <Input
                      type="email"
                      value={info.value}
                      onChange={e => {
                        const newInfos = [...contactInfos];
                        newInfos[idx].value = e.target.value;
                        setContactInfos(newInfos);
                      }}
                      placeholder={t("contactInformation.emailPlaceholder")}
                    />
                  )}
                </div>
                {/* Remove button for all but the first entry */}
                {idx > 0 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={`absolute top-2 ${dir === 'rtl' ? 'left-2' : 'right-2'} text-destructive hover:bg-destructive/10`}
                    onClick={() => {
                      setContactInfos(contactInfos.filter((_, i) => i !== idx));
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {/* Plus button to add new entry */}
            <button
              type="button"
              className="w-full border border-dashed rounded-lg p-2 text-primary hover:bg-primary/10 flex items-center justify-center gap-2"
              onClick={() => setContactInfos([...contactInfos, { title: "", type: "phone", value: "" }])}
            >
              <span className="text-xl font-bold">+</span> {t("contactInformation.addAnother") || "Add another"}
            </button>
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
            <Button
              type="button"
              className="w-full h-12 rounded-full text-lg"
              onClick={async () => {
                setContactInfoLoading(true);
                setContactInfoError(null);
                try {
                  if (contactInfos.some(info => !info.title || !info.value)) throw new Error(t('errors.fillAllFields'));
                  if (!token) throw new Error('Not authenticated');
                  const resp = await saveContactInfo(
                    contactInfos.map(info => ({ title: info.title, value: info.value })),
                    token,
                    showContactInfo
                  );
                  if (resp.success) {
                    toast.success(t('contactInformationUpdated') || 'Contact information updated!');
                  } else {
                    throw new Error(resp.message || 'Failed to update contact info');
                  }
                } catch (err: unknown) {
                  setContactInfoError(err instanceof Error ? err.message : 'Failed to update contact info');
                } finally {
                  setContactInfoLoading(false);
                }
              }}
              disabled={contactInfoLoading}
            >
              {contactInfoLoading ? t('loading') : t('contactInformation.save')}
            </Button>
            {contactInfoError && <div className="text-destructive text-sm text-center">{contactInfoError}</div>}
          </CardFooter>
        </Card>
      </form>
      )}
    </>
  );
};

export default Profile; 