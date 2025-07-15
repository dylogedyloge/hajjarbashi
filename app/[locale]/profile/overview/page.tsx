"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { fetchCountries, fetchCities, updateProfile, getMyProfile, Country, City, saveContactInfo, ContactInfoItem } from "@/lib/profile";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { AccountInfoForm } from "@/components/profile/AccountInfoForm";
import { ContactInfoForm } from "@/components/profile/ContactInfoForm";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AccountInfoFormValues } from "@/components/profile/AccountInfoForm";
import type { ContactInfoFormValues } from "@/components/profile/ContactInfoForm";
import { Form } from "@/components/ui/form";


// Zod schemas
const accountInfoSchema = z.object({
  name: z.string().min(1),
  preferredLanguage: z.string(),
  company: z.string(),
  position: z.string(),
  country: z.string().min(1),
  city: z.string().min(1),
  bio: z.string().max(300),
});

const contactInfoItemSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["phone", "email"]),
  value: z.string().min(1),
});
const contactInfoSchema = z.object({
  contactInfos: z.array(contactInfoItemSchema),
  showContactInfo: z.boolean(),
});

const Profile = () => {
  const t = useTranslations("Profile");
  const { user, token, login } = useAuth();
  // Removed isUploading, showCrop, selectedImage, and related avatar upload logic
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [accountInfoLoading, setAccountInfoLoading] = useState(false);
  const [accountInfoError, setAccountInfoError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [contactInfoLoading, setContactInfoLoading] = useState(false);
  const [contactInfoError, setContactInfoError] = useState<string | null>(null);

  // react-hook-form for account info
  const accountInfoForm = useForm<AccountInfoFormValues>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      name: user?.name || "",
      preferredLanguage: "English",
      company: user?.company_name || "",
      position: user?.position || "",
      country: "China",
      city: "",
      bio: user?.bio || "",
    },
  });

  // react-hook-form for contact info
  const contactInfoForm = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      contactInfos: [ { title: "", type: "phone", value: "" } ],
      showContactInfo: true,
    },
  });

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
        accountInfoForm.reset({
          name: data.name || "",
          preferredLanguage: locale,
          company: data.company_name || "",
          position: data.position || "",
          country: data.country_name || "",
          city: data.city_name || "",
          bio: data.bio || "",
        });
        contactInfoForm.reset({
          contactInfos: Array.isArray(data.contact_info) && data.contact_info.length > 0
            ? data.contact_info.map((item: ContactInfoItem) => ({
                title: item.title || "",
                value: item.value || "",
                type: item.value && typeof item.value === "string" && item.value.includes("@") ? "email" : "phone"
              }))
            : [{ title: "", type: "phone", value: "" }],
          showContactInfo: !!data.show_contact_info,
        });
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
    if (!accountInfoForm.getValues('country')) {
      setCities([]);
      return;
    }
    setCitiesLoading(true);
    setCitiesError(null);
    // Find the selected country id
    const countryObj = countries.find(c => c.name === accountInfoForm.getValues('country'));
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
  }, [accountInfoForm.getValues('country'), countries, locale]);

  return (
    <>
      {/* Crop Modal using ImageCropper */}
      {/* Avatar upload and crop logic is now handled in AvatarUploader */}
      {profileLoading ? (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12 text-center text-muted-foreground py-12">{t('loading')}</div>
      ) : profileError ? (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12 text-center text-destructive py-12">{profileError}</div>
      ) : (
      <Form {...accountInfoForm}>
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12">
        {/* Change Avatar */}
        <AvatarUploader user={user} token={token ?? ''} login={login} t={t} />
        {/* Account Information */}
        <AccountInfoForm
          form={accountInfoForm}
          countries={countries}
          countriesLoading={countriesLoading}
          countriesError={countriesError}
          cities={cities}
          citiesLoading={citiesLoading}
          citiesError={citiesError}
          accountInfoLoading={accountInfoLoading}
          accountInfoError={accountInfoError}
          onSubmit={async (values) => {
            setAccountInfoLoading(true);
            setAccountInfoError(null);
            try {
              // Find country and city IDs
              const countryObj = countries.find(c => c.name === values.country);
              const cityObj = cities.find(c => c.name === values.city);
              if (!countryObj || !cityObj) throw new Error('Please select a valid country and city');
              // Map preferredLanguage to language code
              let languageCode = 'en';
              if (values.preferredLanguage === 'Persian') languageCode = 'fa';
              else if (values.preferredLanguage === 'Chinese') languageCode = 'zh';
              const req = {
                country_id: countryObj.id,
                bio: values.bio,
                position: values.position,
                name: values.name,
                company_name: values.company,
                city_id: cityObj.id,
                show_contact_info: contactInfoForm.getValues('showContactInfo'),
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
          form={contactInfoForm}
          contactInfoLoading={contactInfoLoading}
          contactInfoError={contactInfoError}
          onSubmit={async (values) => {
            setContactInfoLoading(true);
            setContactInfoError(null);
            try {
              if (values.contactInfos.some(info => !info.title || !info.value)) throw new Error(t('errors.fillAllFields'));
              if (!token) throw new Error('Not authenticated');
              const resp = await saveContactInfo(
                values.contactInfos.map(info => ({ title: info.title, value: info.value })),
                token,
                values.showContactInfo
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
        </div>
      </Form>
      )}
    </>
  );
};

export default Profile; 