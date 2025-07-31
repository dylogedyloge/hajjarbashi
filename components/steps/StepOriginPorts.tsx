"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DropdownMultiSelect from "@/components/ui/dropdown-multiselect";
import { useTranslations } from "next-intl";

interface StepOriginPortsProps {
  originCountryId: string;
  setOriginCountryId: (value: string) => void;
  originCityId: string;
  setOriginCityId: (value: string) => void;
  surfaceId: string;
  setSurfaceId: (value: string) => void;
  selectedReceivingPorts: string[];
  setSelectedReceivingPorts: (value: string[]) => void;
  selectedExportPorts: string[];
  setSelectedExportPorts: (value: string[]) => void;
  countryOptions: { id: string; name: string }[];
  cityOptions: { id: string; name: string }[];
  surfaceOptions: { id: string; name: string }[];
  portOptions: { id: string; name: string }[];
  countryLoading: boolean;
  cityLoading: boolean;
  surfaceLoading: boolean;
  portLoading: boolean;
  countryError: string | null;
  cityError: string | null;
  surfaceError: string | null;
  portError: string | null;
  t: ReturnType<typeof useTranslations>;
}

export default function StepOriginPorts({
  originCountryId,
  setOriginCountryId,
  originCityId,
  setOriginCityId,
  surfaceId,
  setSurfaceId,
  selectedReceivingPorts,
  setSelectedReceivingPorts,
  selectedExportPorts,
  setSelectedExportPorts,
  countryOptions,
  cityOptions,
  surfaceOptions,
  portOptions,
  countryLoading,
  cityLoading,
  surfaceLoading,
  portLoading,
  countryError,
  cityError,
  surfaceError,
  portError,
  t,
}: StepOriginPortsProps) {
  return (
    <Card className="p-8 flex flex-col gap-8">
      <h2 className="text-lg font-semibold mb-4">{t("originAndPorts")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin Country ID */}
        <div className="flex flex-col gap-1">
          <Label>{t("originCountryLabel")}</Label>
          <Select
            value={originCountryId}
            onValueChange={setOriginCountryId}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  countryLoading ? t("loading") : t("selectCountry")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {countryError && (
            <span className="text-xs text-destructive">{countryError}</span>
          )}
        </div>

        {/* Origin City ID */}
        <div className="flex flex-col gap-1">
          <Label>{t("originCityLabel")}</Label>
          <Select
            value={originCityId}
            onValueChange={setOriginCityId}
            disabled={!originCountryId || cityLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  cityLoading
                    ? t("loading")
                    : !originCountryId
                    ? t("selectCountry")
                    : t("selectCity")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {cityError && (
            <span className="text-xs text-destructive">{cityError}</span>
          )}
        </div>

        {/* Surface */}
        <div className="flex flex-col gap-1">
          <Label>{t("surfaceLabel")}</Label>
          <Select value={surfaceId} onValueChange={setSurfaceId}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  surfaceLoading ? t("loading") : t("selectSurface")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {surfaceOptions.map((surface) => (
                <SelectItem key={surface.id} value={surface.id}>
                  {surface.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {surfaceError && (
            <span className="text-xs text-destructive">{surfaceError}</span>
          )}
        </div>

        {/* Receiving Ports */}
        <div className="flex flex-col gap-1">
          <Label>{t("receivingPortsLabel")}</Label>
          <DropdownMultiSelect
            options={portOptions.map((p) => ({
              label: p.name,
              value: p.id,
            }))}
            value={selectedReceivingPorts}
            onChange={setSelectedReceivingPorts}
            placeholder={
              portLoading ? t("loading") : t("selectReceivingPorts")
            }
            disabled={portLoading || !portOptions.length}
          />
          {portError && (
            <span className="text-xs text-destructive">{portError}</span>
          )}
        </div>

        {/* Export Ports */}
        <div className="flex flex-col gap-1">
          <Label>{t("exportPortsLabel")}</Label>
          <DropdownMultiSelect
            options={portOptions.map((p) => ({
              label: p.name,
              value: p.id,
            }))}
            value={selectedExportPorts}
            onChange={setSelectedExportPorts}
            placeholder={
              portLoading ? t("loading") : t("selectExportPorts")
            }
            disabled={portLoading || !portOptions.length}
          />
          {portError && (
            <span className="text-xs text-destructive">{portError}</span>
          )}
        </div>
      </div>
    </Card>
  );
} 