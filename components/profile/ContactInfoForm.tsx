import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import React from "react";
import { useLocaleDirection } from "@/hooks/useLocaleDirection";

interface ContactInfoItem {
  title: string;
  type: "phone" | "email";
  value: string;
}

interface ContactInfoFormProps {
  contactInfos: ContactInfoItem[];
  setContactInfos: (infos: ContactInfoItem[]) => void;
  showContactInfo: boolean;
  setShowContactInfo: (v: boolean) => void;
  contactInfoLoading: boolean;
  contactInfoError: string | null;
  onSave: () => void;
  t: (key: string) => string;
}

export function ContactInfoForm({
  contactInfos,
  setContactInfos,
  showContactInfo,
  setShowContactInfo,
  contactInfoLoading,
  contactInfoError,
  onSave,
  t,
}: ContactInfoFormProps) {
  const { dir } = useLocaleDirection();
  return (
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
            onChange={e => setShowContactInfo(e.target.checked)}
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
          onClick={onSave}
          disabled={contactInfoLoading}
        >
          {contactInfoLoading ? t('loading') : t('contactInformation.save')}
        </Button>
        {contactInfoError && <div className="text-destructive text-sm text-center">{contactInfoError}</div>}
      </CardFooter>
    </Card>
  );
} 