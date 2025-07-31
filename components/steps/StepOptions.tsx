"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

interface StepOptionsProps {
  featured: boolean;
  setFeatured: (value: boolean) => void;
  autoRenew: boolean;
  setAutoRenew: (value: boolean) => void;
  expressReady: boolean;
  setExpressReady: (value: boolean) => void;
  enableChat: boolean;
  setEnableChat: (value: boolean) => void;
  contactInfo: boolean;
  setContactInfo: (value: boolean) => void;
  onSubmit: (statusValue: string) => void;
  onDiscard: () => void;
  submitting: boolean;
  isFormEmpty: () => boolean;
  isDirty: boolean;
  t: ReturnType<typeof useTranslations>;
}

export default function StepOptions({
  featured,
  setFeatured,
  autoRenew,
  setAutoRenew,
  expressReady,
  setExpressReady,
  enableChat,
  setEnableChat,
  contactInfo,
  setContactInfo,
  onSubmit,
  onDiscard,
  submitting,
  isFormEmpty,
  isDirty,
  t,
}: StepOptionsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Panel - Options */}
      <Card className="w-full md:w-80 flex-shrink-0 p-6 flex flex-col gap-6 h-fit mb-8 md:mb-0">
        <div>
          <div className="text-muted-foreground text-sm">
            {t("advertisementCost")}
          </div>
          <div className="text-2xl font-bold mt-1 mb-4">
            {t("usd", { value: 24 })} 24
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {/* Map checkboxes to API fields */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={featured}
              onCheckedChange={(checked) =>
                typeof checked === "boolean" && setFeatured(checked)
              }
            />
            <span className="text-sm">{t("featured")}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("infoAbout", { item: t("featured") })}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={autoRenew}
              onCheckedChange={(checked) =>
                typeof checked === "boolean" && setAutoRenew(checked)
              }
            />
            <span className="text-sm">{t("autoRenew")}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("infoAbout", { item: t("autoRenew") })}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={expressReady}
              onCheckedChange={(checked) =>
                typeof checked === "boolean" && setExpressReady(checked)
              }
            />
            <span className="text-sm">{t("expressReady")}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("infoAbout", { item: t("expressReady") })}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={enableChat}
              onCheckedChange={(checked) =>
                typeof checked === "boolean" && setEnableChat(checked)
              }
            />
            <span className="text-sm">{t("enableChat")}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("infoAbout", { item: t("enableChat") })}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={contactInfo}
              onCheckedChange={(checked) =>
                typeof checked === "boolean" && setContactInfo(checked)
              }
            />
            <span className="text-sm">{t("contactInfo")}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("infoAbout", { item: t("contactInfo") })}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            className="bg-foreground text-background w-full rounded-full py-2 text-base font-semibold"
            onClick={() => onSubmit("0")}
            type="button"
            disabled={submitting}
          >
            {submitting ? t("updating") : t("payAndPublish")}
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full py-2 text-base font-semibold border-2"
            onClick={() => onSubmit("3")}
            type="button"
            disabled={submitting || isFormEmpty() || !isDirty}
          >
            {t("saveDraft")}
          </Button>
          <Button
            variant="destructive"
            className="w-full rounded-full py-2 text-base font-semibold"
            onClick={onDiscard}
          >
            {t("discard")}
          </Button>
        </div>
      </Card>

      {/* Right Panel - Summary */}
      <Card className="flex-1 p-8">
        <h2 className="text-lg font-semibold mb-4">{t("summary", { defaultValue: "Summary" })}</h2>
        <div className="text-muted-foreground text-sm">
          {t("summaryDescription", { defaultValue: "Review your advertisement details before publishing." })}
        </div>
      </Card>
    </div>
  );
} 