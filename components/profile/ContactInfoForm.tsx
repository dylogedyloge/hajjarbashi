import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X } from "lucide-react";
import React from "react";
import { useLocaleDirection } from "@/hooks/useLocaleDirection";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn, useFieldArray } from "react-hook-form";

export interface ContactInfoItemForm {
  title: string;
  type: "phone" | "email";
  value: string;
}

export interface ContactInfoFormValues {
  contactInfos: ContactInfoItemForm[];
  showContactInfo: boolean;
}

interface ContactInfoFormProps {
  form: UseFormReturn<ContactInfoFormValues>;
  contactInfoLoading: boolean;
  contactInfoError: string | null;
  onSubmit: (values: ContactInfoFormValues) => void | Promise<void>;
  t: (key: string) => string;
}

export function ContactInfoForm({
  form,
  contactInfoLoading,
  contactInfoError,
  onSubmit,
  t,
}: ContactInfoFormProps) {
  const { dir } = useLocaleDirection();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contactInfos",
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="pb-4">
            <div className="text-base font-semibold">
              {t("contactInformation.title")}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, idx) => {
              const watchedType = form.watch(`contactInfos.${idx}.type`);
              return (
                <div key={field.id} className="relative border rounded-lg p-4 mb-2 flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name={`contactInfos.${idx}.title` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contactInformation.contactTitle")}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t("contactInformation.contactTitlePlaceholder")} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`contactInfos.${idx}.type` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contactInformation.contactType")}</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("contactInformation.selectType")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="phone">{t("contactInformation.phoneNumber")}</SelectItem>
                              <SelectItem value="email">{t("contactInformation.email")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`contactInfos.${idx}.value` as const}
                    render={({ field: valueField }) => (
                      <FormItem>
                        <FormLabel>
                          {watchedType === "phone"
                            ? t("contactInformation.phoneNumber")
                            : t("contactInformation.email")}
                        </FormLabel>
                        <FormControl>
                          {watchedType === "phone" ? (
                            <PhoneInput
                              {...valueField}
                              value={valueField.value}
                              onChange={valueField.onChange}
                              placeholder={t("contactInformation.phonePlaceholder")}
                            />
                          ) : (
                            <Input
                              {...valueField}
                              type="email"
                              placeholder={t("contactInformation.emailPlaceholder")}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Remove button for all but the first entry */}
                  {idx > 0 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className={`absolute top-2 ${dir === 'rtl' ? 'left-2' : 'right-2'} text-destructive hover:bg-destructive/10`}
                      onClick={() => remove(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
            {/* Plus button to add new entry */}
            <button
              type="button"
              className="w-full border border-dashed rounded-lg p-2 text-primary hover:bg-primary/10 flex items-center justify-center gap-2"
              onClick={() => append({ title: "", type: "phone", value: "" })}
            >
              <span className="text-xl font-bold">+</span> {t("contactInformation.addAnother") || "Add another"}
            </button>
            <FormField
              control={form.control}
              name="showContactInfo"
              render={({ field }) => (
                <div className="flex items-center gap-2 md:col-span-2 mt-2">
                  <input
                    type="checkbox"
                    id="show-contact-info"
                    checked={field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    className="accent-primary w-4 h-4"
                  />
                  <label htmlFor="show-contact-info" className="text-sm font-medium cursor-pointer">
                    {t("contactInformation.showContactInfo")}
                  </label>
                </div>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full h-12 rounded-full text-lg"
              disabled={contactInfoLoading}
            >
              {contactInfoLoading ? t('loading') : t('contactInformation.save')}
            </Button>
            {contactInfoError && <div className="text-destructive text-sm text-center">{contactInfoError}</div>}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
} 