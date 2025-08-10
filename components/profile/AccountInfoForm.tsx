import { CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Country, City } from "@/types/common";

export interface AccountInfoFormValues {
  name: string;
  preferredLanguage: string;
  company: string;
  position: string;
  country: string;
  city: string;
  bio: string;
}

interface AccountInfoFormProps {
  form: UseFormReturn<AccountInfoFormValues>;
  countries: Country[];
  countriesLoading: boolean;
  countriesError: string | null;
  cities: City[];
  citiesLoading: boolean;
  citiesError: string | null;
  accountInfoLoading: boolean;
  accountInfoError: string | null;
  onSubmit: (values: AccountInfoFormValues) => void | Promise<void>;
  t: (key: string) => string;
}

export function AccountInfoForm({
  form,
  countries,
  countriesLoading,
  countriesError,
  cities,
  citiesLoading,
  citiesError,
  accountInfoLoading,
  accountInfoError,
  onSubmit,
  t,
}: AccountInfoFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardHeader className="pb-4">
            <div className="text-base font-semibold">
              {t("accountInformation.title")}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("accountInformation.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("accountInformation.preferredLanguage")}</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("accountInformation.selectPreferredLanguage")} className="w-full" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">{t("accountInformation.languages.english")}</SelectItem>
                          <SelectItem value="Persian">{t("accountInformation.languages.persian")}</SelectItem>
                          <SelectItem value="Chinese">{t("accountInformation.languages.chinese")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("accountInformation.companyName")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("accountInformation.position")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("accountInformation.country")}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("accountInformation.city")}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("accountInformation.bio")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} maxLength={300} className="resize-none min-h-24" />
                    </FormControl>
                    <div className="text-xs text-muted-foreground text-right">
                      {field.value.length}/300
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-6">
            {/* <div className="flex flex-col w-full gap-2"> */}
              <Button
                type="submit"
                className="bg-gray-800 text-white hover:bg-gray-700 rounded-lg"
                disabled={accountInfoLoading}
              >
                {accountInfoLoading ? t('loading') : t('actions.save')}
              </Button>
              {accountInfoError && <div className="text-destructive text-sm text-center">{accountInfoError}</div>}
            {/* </div> */}
          </CardFooter>
        </div>
      </form>
    </Form>
  );
} 