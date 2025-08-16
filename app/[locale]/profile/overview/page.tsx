"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import type { ContactInfoItem } from "@/types/user";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { AccountInfoForm } from "@/components/profile/AccountInfoForm";
import { ContactInfoForm } from "@/components/profile/ContactInfoForm";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AccountInfoFormValues } from "@/components/profile/AccountInfoForm";
import type { ContactInfoFormValues } from "@/components/profile/ContactInfoForm";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { ProfileCompletionCard } from "@/components/profile/ProfileCompletionCard";
import { 
  useCountries, 
  useCities, 
  useMyProfile, 
  useUpdateProfile, 
  useSaveContactInfo 
} from "@/hooks/useProfile";

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
  const locale = useLocale();

  // React Query hooks
  const countriesQuery = useCountries(locale);
  const profileQuery = useMyProfile(token, locale);
  const updateProfileMutation = useUpdateProfile();
  const saveContactInfoMutation = useSaveContactInfo();

  // react-hook-form for account info
  const accountInfoForm = useForm<AccountInfoFormValues>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      name: user?.name || "",
      preferredLanguage: "English",
      company: user?.company_name || "",
      position: user?.position || "",
      country: "iran",
      city: "",
      bio: user?.bio || "",
    },
  });

  // react-hook-form for contact info
  const contactInfoForm = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      contactInfos: [{ title: "", type: "phone", value: "" }],
      showContactInfo: true,
    },
  });

  // Watch country field for changes
  const watchedCountry = accountInfoForm.watch("country");

  // Get country ID for cities query
  const countryObj = countriesQuery.data?.find((c) => c.name === watchedCountry);
  const countryId = countryObj?.id || "";

  // Cities query - only runs when countryId exists
  const citiesQuery = useCities(countryId, locale);

  // Populate forms when profile data is loaded
  useEffect(() => {
    if (profileQuery.data?.data) {
      const data = profileQuery.data.data;
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
        contactInfos:
          Array.isArray(data.contact_info) && data.contact_info.length > 0
            ? data.contact_info.map((item: ContactInfoItem) => ({
                title: item.title || "",
                value: item.value || "",
                type:
                  item.value &&
                  typeof item.value === "string" &&
                  item.value.includes("@")
                    ? "email"
                    : "phone",
              }))
            : [{ title: "", type: "phone", value: "" }],
        showContactInfo: !!data.show_contact_info,
      });
    }
  }, [profileQuery.data, locale, accountInfoForm, contactInfoForm]);

  return (
    <>
      {profileQuery.isLoading ? (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12 text-center text-muted-foreground py-12">
          {t("loading")}
        </div>
      ) : profileQuery.error ? (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12 text-center text-destructive py-12">
          {profileQuery.error.message || "Failed to load profile"}
        </div>
      ) : (
        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <Form {...accountInfoForm}>
              <div className="w-full flex flex-col gap-8 mb-12">
                {/* Change Avatar */}
                <AvatarUploader
                  user={user}
                  token={token ?? ""}
                  login={login}
                  t={t}
                />
                {/* Account Information */}
                <AccountInfoForm
                  form={accountInfoForm}
                  countries={countriesQuery.data || []}
                  countriesLoading={countriesQuery.isLoading}
                  countriesError={countriesQuery.error?.message || null}
                  cities={citiesQuery.data || []}
                  citiesLoading={citiesQuery.isLoading}
                  citiesError={citiesQuery.error?.message || null}
                  accountInfoLoading={updateProfileMutation.isPending}
                  accountInfoError={updateProfileMutation.error?.message || null}
                  onSubmit={async (values) => {
                    try {
                      // Find country and city IDs
                      const countryObj = countriesQuery.data?.find(
                        (c) => c.name === values.country
                      );
                      const cityObj = citiesQuery.data?.find((c) => c.name === values.city);
                      if (!countryObj || !cityObj)
                        throw new Error("Please select a valid country and city");
                      
                      // Map preferredLanguage to language code
                      let languageCode = "en";
                      if (values.preferredLanguage === "Persian")
                        languageCode = "fa";
                      else if (values.preferredLanguage === "Chinese")
                        languageCode = "zh";
                      
                      const req = {
                        country_id: countryObj.id,
                        bio: values.bio,
                        position: values.position,
                        name: values.name,
                        company_name: values.company,
                        city_id: cityObj.id,
                        show_contact_info:
                          contactInfoForm.getValues("showContactInfo"),
                        language: languageCode,
                      };
                      
                      if (!token) throw new Error("Not authenticated");
                      
                      updateProfileMutation.mutate(
                        { data: req, token, locale },
                        {
                          onSuccess: (response) => {
                            if (response.success) {
                              toast.success(t("profileUpdated") || "Profile updated!");
                            } else {
                              throw new Error(response.message || "Failed to update profile");
                            }
                          },
                          onError: (error) => {
                            toast.error(error.message || "Failed to update profile");
                          },
                        }
                      );
                    } catch (err: unknown) {
                      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
                      toast.error(errorMessage);
                    }
                  }}
                  t={t}
                />
                {/* Contact Information */}
                <ContactInfoForm
                  form={contactInfoForm}
                  contactInfoLoading={saveContactInfoMutation.isPending}
                  contactInfoError={saveContactInfoMutation.error?.message || null}
                  onSubmit={async (values) => {
                    try {
                      if (
                        values.contactInfos.some(
                          (info) => !info.title || !info.value
                        )
                      )
                        throw new Error(t("errors.fillAllFields"));
                      
                      if (!token) throw new Error("Not authenticated");
                      
                      saveContactInfoMutation.mutate(
                        {
                          contactInfo: values.contactInfos.map((info) => ({
                            title: info.title,
                            value: info.value,
                          })),
                          token,
                          showContactInfo: values.showContactInfo,
                        },
                        {
                          onSuccess: (response) => {
                            if (response.success) {
                              toast.success(
                                t("contactInformationUpdated") ||
                                  "Contact information updated!"
                              );
                            } else {
                              throw new Error(
                                response.message || "Failed to update contact info"
                              );
                            }
                          },
                          onError: (error) => {
                            toast.error(error.message || "Failed to update contact info");
                          },
                        }
                      );
                    } catch (err: unknown) {
                      const errorMessage = err instanceof Error ? err.message : "Failed to update contact info";
                      toast.error(errorMessage);
                    }
                  }}
                  t={t}
                />
              </div>
            </Form>
          </div>

          {/* Right Sidebar - Profile Completion Card (Hidden on mobile) */}
          <div className="hidden lg:block w-80">
            <Card className="bg-card border flex-col justify-between min-h-[700px] rounded-xl shadow-sm p-6">
              <ProfileCompletionCard 
                accountInfoForm={accountInfoForm}
                contactInfoForm={contactInfoForm}
              />
            </Card>
          </div>

          {/* Mobile Profile Completion Card (Shown below main content) */}
          <div className="lg:hidden mt-6">
            <Card className="bg-card border rounded-xl shadow-sm p-6">
              <ProfileCompletionCard 
                accountInfoForm={accountInfoForm}
                contactInfoForm={contactInfoForm}
              />
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
