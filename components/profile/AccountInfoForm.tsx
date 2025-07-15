import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React from "react";

interface AccountInfoFormProps {
  name: string;
  setName: (v: string) => void;
  preferredLanguage: string;
  setPreferredLanguage: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  position: string;
  setPosition: (v: string) => void;
  selectedCountry: string;
  setSelectedCountry: (v: string) => void;
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  countries: { id: string; name: string }[];
  countriesLoading: boolean;
  countriesError: string | null;
  cities: { id: string; name: string }[];
  citiesLoading: boolean;
  citiesError: string | null;
  bio: string;
  setBio: (v: string) => void;
  accountInfoLoading: boolean;
  accountInfoError: string | null;
  onSave: () => void;
  t: (key: string) => string;
}

export function AccountInfoForm({
  name,
  setName,
  preferredLanguage,
  setPreferredLanguage,
  company,
  setCompany,
  position,
  setPosition,
  selectedCountry,
  setSelectedCountry,
  selectedCity,
  setSelectedCity,
  countries,
  countriesLoading,
  countriesError,
  cities,
  citiesLoading,
  citiesError,
  bio,
  setBio,
  accountInfoLoading,
  accountInfoError,
  onSave,
  t,
}: AccountInfoFormProps) {
  return (
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
            onClick={onSave}
            disabled={accountInfoLoading}
          >
            {accountInfoLoading ? t('loading') : t('accountInformation.save')}
          </Button>
          {accountInfoError && <div className="text-destructive text-sm text-center">{accountInfoError}</div>}
        </div>
      </CardFooter>
    </Card>
  );
} 