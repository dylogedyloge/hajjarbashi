"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { fetchCountries, fetchCities, updateProfile, getMyProfile, Country, City, saveContactInfo, ContactInfoItem } from "@/lib/profile";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { AccountInfoForm } from "@/components/profile/AccountInfoForm";
import { ContactInfoForm } from "@/components/profile/ContactInfoForm";


const Profile = () => {
  const t = useTranslations("Profile");
  const { user, token, login } = useAuth();
  // Removed isUploading, showCrop, selectedImage, and related avatar upload logic
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




  // Handle crop complete from ImageCropper
  // Avatar upload and crop logic is now handled in AvatarUploader

  useEffect(() => {
    return () => {
      // No longer needed as selectedImage is removed
    };
  }, []);

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
      {/* Avatar upload and crop logic is now handled in AvatarUploader */}
      {profileLoading ? (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12 text-center text-muted-foreground py-12">{t('loading')}</div>
      ) : profileError ? (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12 text-center text-destructive py-12">{profileError}</div>
      ) : (
      <form className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12">
        {/* Change Avatar */}
        <AvatarUploader user={user ?? {}} token={token ?? ''} login={login} t={t} />
        {/* Account Information */}
        <AccountInfoForm
          name={name ?? ''}
          setName={setName}
          preferredLanguage={preferredLanguage ?? ''}
          setPreferredLanguage={setPreferredLanguage}
          company={company ?? ''}
          setCompany={setCompany}
          position={position ?? ''}
          setPosition={setPosition}
          selectedCountry={selectedCountry ?? ''}
          setSelectedCountry={setSelectedCountry}
          selectedCity={selectedCity ?? ''}
          setSelectedCity={setSelectedCity}
          countries={countries}
          countriesLoading={countriesLoading}
          countriesError={countriesError ?? ''}
          cities={cities}
          citiesLoading={citiesLoading}
          citiesError={citiesError ?? ''}
          bio={bio ?? ''}
          setBio={setBio}
          accountInfoLoading={accountInfoLoading}
          accountInfoError={accountInfoError ?? ''}
          onSave={async () => {
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
          t={t}
        />
        {/* Contact Information */}
        <ContactInfoForm
          contactInfos={contactInfos}
          setContactInfos={setContactInfos}
          showContactInfo={showContactInfo}
          setShowContactInfo={setShowContactInfo}
          contactInfoLoading={contactInfoLoading}
          contactInfoError={contactInfoError}
          onSave={async () => {
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
          t={t}
        />
      </form>
      )}
    </>
  );
};

export default Profile; 