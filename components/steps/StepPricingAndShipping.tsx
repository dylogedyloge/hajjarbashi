"use client";

// import { Card } from "@/components/ui/card";
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
import { useEffect } from "react";

interface StepPricingAndShippingProps {
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
  // Add size and weight props for conditional logic
  sizeH: string;
  sizeW: string;
  sizeL: string;
  weight: string;
  t: ReturnType<typeof useTranslations>;
}

export default function StepPricingAndShipping({
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
  // Add size and weight props
  sizeH,
  sizeW,
  sizeL,
  weight,
  t,
}: StepPricingAndShippingProps) {
  
  // Logic to determine available sale unit type options
  const hasSize = sizeH || sizeW || sizeL; // Check if any size dimension is filled
  const hasWeight = weight && weight.trim() !== ''; // Check if weight is filled
  
  // Determine available options based on filled fields
  const getAvailableSaleUnitTypes = () => {
    if (hasSize && hasWeight) {
      // Both size and weight are filled - show both options
      return [
        { value: "weight", label: "Weight" },
        { value: "volume", label: "Volume" }
      ];
    } else if (hasSize && !hasWeight) {
      // Only size is filled - show only volume option
      return [
        { value: "volume", label: "Volume" }
      ];
    } else if (!hasSize && hasWeight) {
      // Only weight is filled - show only weight option
      return [
        { value: "weight", label: "Weight" }
      ];
    } else {
      // Neither size nor weight is filled - show only weight option
      return [
        { value: "weight", label: "Weight" }
      ];
    }
  };

  const availableSaleUnitTypes = getAvailableSaleUnitTypes();

  // Auto-correct saleUnitType if it becomes invalid
  useEffect(() => {
    if (availableSaleUnitTypes.length === 1 && saleUnitType !== availableSaleUnitTypes[0].value) {
      setSaleUnitType(availableSaleUnitTypes[0].value);
    }
  }, [availableSaleUnitTypes, saleUnitType, setSaleUnitType]);

  return (
    <div className="p-8 flex flex-col gap-8">
      
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
          {availableSaleUnitTypes.length === 2 ? (
            // Both options available - show select dropdown
            <Select value={saleUnitType} onValueChange={setSaleUnitType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectUnitType")} />
              </SelectTrigger>
              <SelectContent>
                {availableSaleUnitTypes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            // Only one option available - show readonly field
            <div className="flex items-center space-x-2">
              <Input
                value={availableSaleUnitTypes[0]?.label || "Weight"}
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground">
                {hasSize && !hasWeight 
                  ? "Volume is automatically selected when only size is specified. Fill in weight in Step 2 to enable both options."
                  : !hasSize && hasWeight
                  ? "Weight is automatically selected when only weight is specified. Fill in at least one size dimension in Step 2 to enable both options."
                  : "Weight is automatically selected. Fill in both size and weight fields in Step 2 to enable both options."
                }
              </p>
            </div>
          )}
          {/* Show helpful message when both options are available */}
          {availableSaleUnitTypes.length === 2 && (
            <p className="text-xs text-green-600">
              ✓ Both Weight and Volume options are available since both size and weight are specified.
            </p>
          )}
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
    </div>
  );
} 