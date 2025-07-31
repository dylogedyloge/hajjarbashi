"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface StepPhysicalSpecsProps {
  formType: string;
  setFormType: (value: string) => void;
  grade: string;
  setGrade: (value: string) => void;
  sizeH: string;
  setSizeH: (value: string) => void;
  sizeW: string;
  setSizeW: (value: string) => void;
  sizeL: string;
  setSizeL: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  minimumOrder: string;
  setMinimumOrder: (value: string) => void;
  saleUnitType: string;
  setSaleUnitType: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  t: ReturnType<typeof useTranslations>;
}

export default function StepPhysicalSpecs({
  formType,
  setFormType,
  grade,
  setGrade,
  sizeH,
  setSizeH,
  sizeW,
  setSizeW,
  sizeL,
  setSizeL,
  weight,
  setWeight,
  minimumOrder,
  setMinimumOrder,
  saleUnitType,
  setSaleUnitType,
  price,
  setPrice,
  t,
}: StepPhysicalSpecsProps) {
  return (
    <Card className="p-8 flex flex-col gap-8">
      <h2 className="text-lg font-semibold mb-4">{t("physicalSpecifications")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="flex flex-col gap-1">
          <Label>{t("formLabel")}</Label>
          <Select value={formType} onValueChange={setFormType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectForm")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slab">Slab</SelectItem>
              <SelectItem value="block">Block</SelectItem>
              <SelectItem value="tile">Tile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grade */}
        <div className="flex flex-col gap-1">
          <Label>{t("gradeLabel")}</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectGrade")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">A</SelectItem>
              <SelectItem value="b">B</SelectItem>
              <SelectItem value="c">C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Size (h, w, l) */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <Label>{t("sizeLabel")}</Label>
          <div className="flex gap-2">
            <Input
              placeholder={t("heightPlaceholder")}
              type="number"
              min={0}
              value={sizeH}
              onChange={(e) => setSizeH(e.target.value)}
            />
            <Input
              placeholder={t("widthPlaceholder")}
              type="number"
              min={0}
              value={sizeW}
              onChange={(e) => setSizeW(e.target.value)}
            />
            <Input
              placeholder={t("lengthPlaceholder")}
              type="number"
              min={0}
              value={sizeL}
              onChange={(e) => setSizeL(e.target.value)}
            />
          </div>
        </div>

        {/* Weight */}
        <div className="flex flex-col gap-1">
          <Label>{t("weightLabel")}</Label>
          <Input
            placeholder={t("weightPlaceholder")}
            type="number"
            min={0}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        {/* Minimum Order */}
        <div className="flex flex-col gap-1">
          <Label>{t("minimumOrderLabel")}</Label>
          <Input
            placeholder={t("minimumOrderPlaceholder")}
            type="number"
            min={0}
            value={minimumOrder}
            onChange={(e) => setMinimumOrder(e.target.value)}
          />
        </div>

        {/* Sale Unit Type */}
        <div className="flex flex-col gap-1">
          <Label>{t("saleUnitTypeLabel")}</Label>
          <Select value={saleUnitType} onValueChange={setSaleUnitType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectUnitType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1">
          <Label>{t("priceLabel")}</Label>
          <Input
            placeholder={t("pricePlaceholder")}
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
} 