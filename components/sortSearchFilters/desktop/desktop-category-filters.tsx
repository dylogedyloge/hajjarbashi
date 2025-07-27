"use client";
import React, { useState } from "react";
import { Gem, Box, Square, Grid3X3, Check, ArrowLeft,  DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";

const DesktopCategoryFilters = () => {
  const t = useTranslations("DesktopCategoryFilters");
  const [activeTab, setActiveTab] = useState<"ads" | "request">("ads");
  const [selectedFormStone, setSelectedFormStone] = useState<string>("all");
  const [selectedTypeStone, setSelectedTypeStone] = useState<string>("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([12000, 18000]);
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedPort, setSelectedPort] = useState<string>("");
  const [selectedReceivePort, setSelectedReceivePort] = useState<string>("");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");

  const formStoneOptions = [
    { id: "all", label: t("allStone"), icon: Gem },
    { id: "blocks", label: t("blocks"), icon: Box },
    { id: "slabs", label: t("slabs"), icon: Square },
    { id: "tiles", label: t("tiles"), icon: Grid3X3 },
  ];

  const typeStoneOptions = [
    { id: "marble", name: t("marble"), image: "/images/marble.jpg" },
    { id: "granite", name: t("granite"), image: "/images/granite.jpg" },
    { id: "onyx", name: t("onyx"), image: "/images/onyx.jpg" },
    { id: "travertine", name: t("travertine"), image: "/images/travertine.jpg" },
    { id: "limestone", name: t("limestone"), image: "/images/limestone.jpg" },
    { id: "quartzite", name: t("quartzite"), image: "/images/quartzite.jpg" },
    { id: "sandstone", name: t("sandstone"), image: "/images/sandstone.jpg" },
    { id: "basalt", name: t("basalt"), image: "/images/basalt.jpg" },
  ];

  const colorOptions = [
    { id: "red", color: "#ef4444" },
    { id: "orange", color: "#f97316" },
    { id: "yellow", color: "#eab308" },
    { id: "green", color: "#22c55e" },
    { id: "blue", color: "#3b82f6" },
    { id: "black", color: "#000000" },
    { id: "gray", color: "#6b7280" },
    { id: "white", color: "#ffffff" },
  ];

  const handleColorToggle = (colorId: string) => {
    setSelectedColors(prev => 
      prev.includes(colorId) 
        ? prev.filter(c => c !== colorId)
        : [...prev, colorId]
    );
  };

  const handleSurfaceToggle = (surfaceId: string) => {
    setSelectedSurfaces(prev => 
      prev.includes(surfaceId) 
        ? prev.filter(s => s !== surfaceId)
        : [...prev, surfaceId]
    );
  };

  const handleSizeToggle = (sizeId: string) => {
    setSelectedSize(selectedSize === sizeId ? "" : sizeId);
  };

  const handleGradeToggle = (gradeId: string) => {
    setSelectedGrade(selectedGrade === gradeId ? "" : gradeId);
  };

  const formatPrice = (price: number) => {
    return price >= 1000 ? `$${(price / 1000).toFixed(0)}K` : `$${price}`;
  };

  return (
    <aside className="w-[350px] bg-background rounded-xl p-4 flex flex-col gap-6 border border-border max-h-[95vh] overflow-y-auto">
      {/* Toggle Tabs */}
      <div className="flex bg-muted rounded-lg p-1">
        <Button
          variant={activeTab === "ads" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("ads")}
          className={cn(
            "flex-1",
            activeTab === "ads" 
              ? "bg-orange-100 text-orange-600 hover:bg-orange-200" 
              : "text-muted-foreground"
          )}
        >
          {t("ads")}
        </Button>
        <Button
          variant={activeTab === "request" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("request")}
          className={cn(
            "flex-1",
            activeTab === "request" 
              ? "bg-orange-100 text-orange-600 hover:bg-orange-200" 
              : "text-muted-foreground"
          )}
        >
          {t("request")}
        </Button>
      </div>

      {/* Select Form Stone */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground text-sm">{t("selectFormStone")}</h3>
        <div className="grid grid-cols-2 gap-3">
          {formStoneOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.id}
                variant={selectedFormStone === option.id ? "default" : "outline"}
                className={cn(
                  "h-20 flex flex-col gap-2 p-3",
                  selectedFormStone === option.id 
                    ? "bg-orange-50 border-orange-200 text-orange-600" 
                    : "border-muted"
                )}
                onClick={() => setSelectedFormStone(option.id)}
              >
                <IconComponent className="w-6 h-6" />
                <span className="text-xs font-medium">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Select Type Stone */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground text-sm">{t("selectTypeStone")}</h3>
        <div className="grid grid-cols-4 gap-2">
          {typeStoneOptions.map((option) => (
            <div
              key={option.id}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 transition-all",
                selectedTypeStone === option.id 
                  ? "border-orange-500" 
                  : "border-muted hover:border-orange-200"
              )}
              onClick={() => setSelectedTypeStone(option.id)}
            >
              <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-sm" />
              </div>
              <div className="p-1 text-center">
                <span className="text-xs font-medium text-foreground">{option.name}</span>
              </div>
              {selectedTypeStone === option.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground text-sm">{t("color")}</h3>
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map((color) => (
            <div
              key={color.id}
              className={cn(
                "w-8 h-8 rounded-md border-2 cursor-pointer transition-all",
                selectedColors.includes(color.id) 
                  ? "border-orange-500 ring-2 ring-orange-200" 
                  : "border-white hover:border-orange-200"
              )}
              style={{ backgroundColor: color.color }}
              onClick={() => handleColorToggle(color.id)}
            />
          ))}
        </div>
      </div>

      {/* Price Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground text-sm">{t("price")}</h3>
        <div className="space-y-3">
          {/* Price Inputs */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t("min")}
                className="pl-8"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                {t("to")}
              </span>
              <DollarSign className="absolute left-12 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t("max")}
                className="pl-16"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
              />
            </div>
          </div>
          
          {/* Price Range Slider */}
          <div className="relative">
            <div className="h-2 bg-muted rounded-full">
              <div 
                className="h-2 bg-orange-500 rounded-full absolute"
                style={{ 
                  left: `${((priceRange[0] - 0) / (50000 - 0)) * 100}%`,
                  right: `${100 - ((priceRange[1] - 0) / (50000 - 0)) * 100}%`
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white cursor-pointer" />
              <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white cursor-pointer" />
            </div>
          </div>
          
          {/* Current Range Display */}
          <div className="text-sm text-muted-foreground text-center">
            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </div>
        </div>
      </div>

      {/* Surface Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground text-sm">{t("surface")}</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "raw", "polished", "honed", "satin", "matte", 
            "leathered", "brushed", "bush-hammered", "sandblasted",
            "tumbled", "flamed", "sawn", "split-face", "chiseled"
          ].map((surface) => (
            <Button
              key={surface}
              variant={selectedSurfaces.includes(surface) ? "default" : "outline"}
              size="sm"
              className={cn(
                "text-xs",
                selectedSurfaces.includes(surface) 
                  ? "bg-orange-50 border-orange-200 text-orange-600" 
                  : "border-muted"
              )}
              onClick={() => handleSurfaceToggle(surface)}
            >
              {t(surface)}
            </Button>
          ))}
        </div>
      </div>

      {/* Size Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground text-sm">{t("size")}</h3>
        <div className="flex gap-2">
          {["small", "medium", "big"].map((size) => (
            <Button
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex-1",
                selectedSize === size 
                  ? "bg-orange-50 border-orange-200 text-orange-600" 
                  : "border-muted"
              )}
              onClick={() => handleSizeToggle(size)}
            >
              {t(size)}
            </Button>
          ))}
        </div>
      </div>

      {/* Port Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground text-sm">{t("port")}</h3>
        <Select value={selectedPort} onValueChange={setSelectedPort}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectPort")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bandar-abbas">{t("bandarAbbas")}</SelectItem>
            <SelectItem value="port1">{t("port1")}</SelectItem>
            <SelectItem value="port2">{t("port2")}</SelectItem>
            <SelectItem value="port3">{t("port3")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Receive Port Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground text-sm">{t("receivePort")}</h3>
        <Select value={selectedReceivePort} onValueChange={setSelectedReceivePort}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectOriginStone")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="origin1">{t("origin1")}</SelectItem>
            <SelectItem value="origin2">{t("origin2")}</SelectItem>
            <SelectItem value="origin3">{t("origin3")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Origin Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground text-sm">{t("origin")}</h3>
        <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectOriginStone")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="iran">{t("iran")}</SelectItem>
            <SelectItem value="turkey">{t("turkey")}</SelectItem>
            <SelectItem value="china">{t("china")}</SelectItem>
            <SelectItem value="italy">{t("italy")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grade Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground text-sm">{t("grade")}</h3>
        <div className="flex gap-2">
          {["gradeA", "gradeB", "gradeC"].map((grade) => (
            <Button
              key={grade}
              variant={selectedGrade === grade ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex-1",
                selectedGrade === grade 
                  ? "bg-orange-50 border-orange-200 text-orange-600" 
                  : "border-muted"
              )}
              onClick={() => handleGradeToggle(grade)}
            >
              {t(grade)}
            </Button>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <Button variant="link" className="text-muted-foreground p-0 h-auto">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("back")}
        </Button>
        <Button className="bg-foreground text-background hover:bg-foreground/90">
          {t("apply")}
        </Button>
      </div>
    </aside>
  );
};

export default DesktopCategoryFilters;
