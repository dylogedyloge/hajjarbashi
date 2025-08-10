import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { useLocaleDirection } from "@/hooks/useLocaleDirection";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

  const handleAddContact = (type: "phone" | "email") => {
    append({ title: "", type, value: "" });
  };

  const handleRemoveContact = (index: number) => {
    remove(index);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">
                Contact Information
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700">
                    + Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => handleAddContact("phone")}>
                    Phone
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddContact("email")}>
                    Email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, idx) => {
              const watchedType = form.watch(`contactInfos.${idx}.type`);
              return (
                <div key={field.id} className="relative border border-gray-200 rounded-lg p-4">
                  {/* Close button for all fields except the first one */}
                  {idx > 0 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleRemoveContact(idx)}
                      title="Remove this contact"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`contactInfos.${idx}.title` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Title Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your Name"
                              className="border-gray-300 rounded-lg"
                            />
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
                          <FormLabel className="text-sm font-semibold">
                            {watchedType === "phone" ? "Phone Nubmer" : "Email Address"}
                          </FormLabel>
                          <FormControl>
                            {watchedType === "phone" ? (
                              <PhoneInput
                                {...valueField}
                                value={valueField.value}
                                onChange={valueField.onChange}
                                placeholder="--- --- ----"
                                className="border-gray-300 rounded-lg"
                              />
                            ) : (
                              <Input
                                {...valueField}
                                type="email"
                                placeholder="Enter your email"
                                className="border-gray-300 rounded-lg"
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              );
            })}
            
            <FormField
              control={form.control}
              name="showContactInfo"
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="show-contact-info"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                  />
                  <label htmlFor="show-contact-info" className="text-sm font-medium cursor-pointer">
                    Show my contact information to others
                  </label>
                </div>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-6">
            {/* <Button
              type="button"
              variant="outline"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
            >
              Cancle
            </Button> */}
            <Button
              type="submit"
              className="bg-gray-800 text-white hover:bg-gray-700 rounded-lg"
              disabled={contactInfoLoading}
            >
              {contactInfoLoading ? 'Loading...' : 'Save'}
            </Button>
            {contactInfoError && <div className="text-destructive text-sm text-center">{contactInfoError}</div>}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
} 