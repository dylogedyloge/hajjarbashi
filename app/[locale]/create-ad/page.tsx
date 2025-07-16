import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CreateAdPage() {
  const t = useTranslations("CreateAd");
  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto py-12">
      {/* Left Panel */}
      <Card className="w-full md:w-80 flex-shrink-0 p-6 flex flex-col gap-6">
        <div>
          <div className="text-muted-foreground text-sm">
            {t("advertisementCost")}
          </div>
          <div className="text-2xl font-bold mt-1 mb-4">
            {t("usd", { value: 24 })} 24
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { label: t("featured"), key: "featured", checked: true },
            { label: t("autoRenew"), key: "autoRenew" },
            { label: t("expressReady"), key: "expressReady" },
            { label: t("enableChat"), key: "enableChat" },
            { label: t("contactInfo"), key: "contactInfo" },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <Checkbox checked={item.checked} />
              <span className="text-sm">{item.label}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{t("infoAbout", { item: item.label })}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 mt-4">
          <Button className="bg-foreground text-background w-full rounded-full py-2 text-base font-semibold">
            {t("payAndPublish")}
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full py-2 text-base font-semibold border-2"
          >
            {t("saveDraft")}
          </Button>
          <Button
            variant="destructive"
            className="w-full rounded-full py-2 text-base font-semibold"
          >
            {t("discard")}
          </Button>
        </div>
      </Card>
      {/* Right Panel */}
      <Card className="flex-1 p-8 flex flex-col gap-8">
        {/* Product Image Upload */}
        <div>
          <div className="font-semibold mb-2">{t("productImage")}</div>
          <div className="border border-dashed border-muted rounded-lg p-6 flex flex-col items-center justify-center text-center mb-2 min-h-[120px]">
            <span className="text-muted-foreground text-sm">
              <span className="font-semibold text-primary cursor-pointer">
                {t("clickHere")}
              </span>{" "}
              {t("uploadOrDrag")}
              <br />
              <span className="text-xs text-muted-foreground">
                {t("supportedFormats")}
              </span>
            </span>
          </div>
        </div>
        {/* Product Info Form */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type */}
          <div className="flex flex-col gap-1">
            <Label>{t("type")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="john">John</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* From */}
          <div className="flex flex-col gap-1">
            <Label>{t("from")}</Label>
            <Input placeholder="email@example.com" />
          </div>
          {/* Surface */}
          <div className="flex flex-col gap-1">
            <Label>{t("surface")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectSurface")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hajjarbashi">Hajjarbashi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Origin */}
          <div className="flex flex-col gap-1">
            <Label>{t("origin")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectOrigin")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="china">China</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Grade */}
          <div className="flex flex-col gap-1">
            <Label>{t("grade")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectGrade")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hajjarbashi">Hajjarbashi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Grade (again) */}
          <div className="flex flex-col gap-1">
            <Label>{t("grade")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectGrade")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hajjarbashi">Hajjarbashi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Origin of Shipment */}
          <div className="flex flex-col gap-1">
            <Label>{t("originOfShipment")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectOrigin")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="china">China</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Empty for grid alignment */}
          <div />
          {/* Dimensions */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>{t("dimensions")}</Label>
            <div className="flex gap-2">
              <Input placeholder="x" className="w-16" />
              <Input placeholder="y" className="w-16" />
              <Input placeholder="z" className="w-16" />
              <Select>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="M" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m">M</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Weight */}
          <div className="flex flex-col gap-1">
            <Label>{t("weight")}</Label>
            <Input placeholder="12345" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>{t("unit")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectUnit")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">KG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Deliverable Destination */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>{t("deliverableDestination")}</Label>
            <Input placeholder="12345" />
          </div>
          {/* Minimum Order Quantity */}
          <div className="flex flex-col gap-1">
            <Label>{t("minimumOrderQuantity")}</Label>
            <Input placeholder="12345" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>{t("unit")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectUnit")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">KG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Price */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>{t("price")}</Label>
            <Input placeholder="12345" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>{t("perUnit")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("selectUnit")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">KG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Description */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>{t("description")}</Label>
            <Textarea placeholder={t("description")} rows={3} />
          </div>
        </form>
      </Card>
    </div>
  );
}
