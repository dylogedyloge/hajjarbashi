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

interface StepPriceAndPortsProps {
  price: string;
  setPrice: (value: string) => void;
  minimumOrder: string;
  setMinimumOrder: (value: string) => void;
  saleUnitType: string;
  setSaleUnitType: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedReceivingPorts: string[];
  setSelectedReceivingPorts: (value: string[]) => void;
  selectedExportPorts: string[];
  setSelectedExportPorts: (value: string[]) => void;
  portOptions: { id: string; name: string }[];
  portLoading: boolean;
  portError: string | null;
  t: ReturnType<typeof useTranslations>;
}

export default function StepPriceAndPorts({
  price,
  setPrice,
  minimumOrder,
  setMinimumOrder,
  saleUnitType,
  setSaleUnitType,
  description,
  setDescription,
  selectedReceivingPorts,
  setSelectedReceivingPorts,
  selectedExportPorts,
  setSelectedExportPorts,
  portOptions,
  portLoading,
  portError,
  t,
}: StepPriceAndPortsProps) {
  return (
    <Card className="p-8 flex flex-col gap-8">
      <h2 className="text-lg font-semibold mb-4">{t("priceAndPorts")}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price */}
        <div className="flex flex-col gap-1">
          <Label>{t("priceLabel")}</Label>
          <div className="relative">
            <Input
              type="number"
              placeholder={t("pricePlaceholder")}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              {t("usd")}
            </span>
          </div>
        </div>

        {/* Minimum Order */}
        <div className="flex flex-col gap-1">
          <Label>{t("minimumOrderLabel")}</Label>
          <Input
            type="number"
            placeholder={t("minimumOrderPlaceholder")}
            value={minimumOrder}
            onChange={(e) => setMinimumOrder(e.target.value)}
          />
        </div>

        {/* Sale Unit Type */}
        <div className="flex flex-col gap-1">
          <Label>{t("saleUnitTypeLabel")}</Label>
          <Select
            value={saleUnitType}
            onValueChange={setSaleUnitType}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectUnitType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Receiving Ports */}
        <div className="flex flex-col gap-1">
          <Label>{t("receivingPortsLabel")}</Label>
          <DropdownMultiSelect
            options={(portOptions || []).map(port => ({ label: port.name, value: port.id }))}
            value={selectedReceivingPorts || []}
            onChange={setSelectedReceivingPorts}
            placeholder={
              portLoading ? t("loading") : t("selectReceivingPorts")
            }
            disabled={portLoading}
          />
          {portError && (
            <span className="text-xs text-destructive">{portError}</span>
          )}
        </div>

        {/* Export Ports */}
        <div className="flex flex-col gap-1">
          <Label>{t("exportPortsLabel")}</Label>
          <DropdownMultiSelect
            options={(portOptions || []).map(port => ({ label: port.name, value: port.id }))}
            value={selectedExportPorts || []}
            onChange={setSelectedExportPorts}
            placeholder={
              portLoading ? t("loading") : t("selectExportPorts")
            }
            disabled={portLoading}
          />
          {portError && (
            <span className="text-xs text-destructive">{portError}</span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="description">{t("descriptionLabel", { defaultValue: "Description" })}</Label>
        <Textarea
          id="description"
          placeholder={t("descriptionPlaceholder", { defaultValue: "Write a description of the stone..." })}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {t("descriptionHelp", { defaultValue: "Provide detailed information about your product" })}
        </p>
      </div>
    </Card>
  );
} 