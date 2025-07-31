"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DropdownMultiSelect from "@/components/ui/dropdown-multiselect";
import { useTranslations } from "next-intl";

interface StepBasicInfoProps {
  categoryId: string;
  setCategoryId: (value: string) => void;
  categoryOptions: { id: string; name: string; colors: string[] }[];
  categoryLoading: boolean;
  categoryError: string | null;
  selectedColors: string[];
  setSelectedColors: (value: string[]) => void;
  colorOptions: string[];
  description: string;
  setDescription: (value: string) => void;
  benefits: string;
  setBenefits: (value: string) => void;
  defects: string;
  setDefects: (value: string) => void;
  t: ReturnType<typeof useTranslations>;
}

export default function StepBasicInfo({
  categoryId,
  setCategoryId,
  categoryOptions,
  categoryLoading,
  categoryError,
  selectedColors,
  setSelectedColors,
  colorOptions,
  description,
  setDescription,
  benefits,
  setBenefits,
  defects,
  setDefects,
  t,
}: StepBasicInfoProps) {
  return (
    <Card className="p-8 flex flex-col gap-8">
      <h2 className="text-lg font-semibold mb-4">{t("productDetails")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div className="flex flex-col gap-1">
          <Label>{t("categoryLabel")}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  categoryLoading ? t("loading") : t("selectCategory")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryError && (
            <span className="text-xs text-destructive">{categoryError}</span>
          )}
        </div>

        {/* Colors */}
        <div className="flex flex-col gap-1">
          <Label>{t("colorsLabel")}</Label>
          <DropdownMultiSelect
            options={colorOptions.map((c) => ({ label: c, value: c }))}
            value={selectedColors}
            onChange={setSelectedColors}
            placeholder={
              !categoryId
                ? t("selectCategory")
                : colorOptions.length
                ? t("selectColors")
                : t("noColorsAvailable")
            }
            disabled={!colorOptions.length}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <Label>{t("descriptionLabel")}</Label>
          <Textarea
            placeholder={t("descriptionPlaceholder")}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Benefits */}
        <div className="flex flex-col gap-1">
          <Label>{t("benefitsLabel")}</Label>
          <Input
            placeholder={t("benefitsExample")}
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
          />
        </div>

        {/* Defects */}
        <div className="flex flex-col gap-1">
          <Label>{t("defectsLabel")}</Label>
          <Input
            placeholder={t("defectsExample")}
            value={defects}
            onChange={(e) => setDefects(e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
} 