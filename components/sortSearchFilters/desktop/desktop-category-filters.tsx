"use client";
import React, { useState, useEffect } from "react";
import {  ArrowLeft, DollarSign } from "lucide-react";
import { Stone, Block, Slab, Tile } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import DropdownMultiSelect from "@/components/ui/dropdown-multiselect";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";
import { AdsFilters } from "@/components/ads-list";
import { fetchCategories, fetchSurfaces, fetchPorts, fetchCountries, fetchAds } from "@/lib/advertisements";

interface DesktopCategoryFiltersProps {
  onFiltersChange?: (filters: AdsFilters) => void;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  colors?: string[];
}

interface Surface {
  id: string;
  name: string;
  description?: string;
}

interface Port {
  id: string;
  name: string;
  city_name: string;
  ownership: string;
  mtpa?: string;
}

interface Country {
  id: string;
  name: string;
}

const DesktopCategoryFilters = ({ onFiltersChange }: DesktopCategoryFiltersProps) => {
  const t = useTranslations("DesktopCategoryFilters");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFormStone, setSelectedFormStone] = useState<string>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedReceivingPorts, setSelectedReceivingPorts] = useState<string[]>([]);
  const [selectedExportPorts, setSelectedExportPorts] = useState<string[]>([]);
  const [selectedOriginCountries, setSelectedOriginCountries] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [surfaces, setSurfaces] = useState<Surface[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSurfaces, setLoadingSurfaces] = useState(true);
  const [loadingPorts, setLoadingPorts] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await fetchCategories("en"); // Add locale parameter
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    const loadSurfaces = async () => {
      setLoadingSurfaces(true);
      try {
        const data = await fetchSurfaces("en"); // Add locale parameter
        setSurfaces(data);
      } catch (error) {
        console.error("Error fetching surfaces:", error);
      } finally {
        setLoadingSurfaces(false);
      }
    };

    const loadPorts = async () => {
      setLoadingPorts(true);
      try {
        const data = await fetchPorts("en"); // Add locale parameter
        setPorts(data);
      } catch (error) {
        console.error("Error fetching ports:", error);
      } finally {
        setLoadingPorts(false);
      }
    };

    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const data = await fetchCountries("en"); // Add locale parameter
        setCountries(data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoadingCountries(false);
      }
    };

    async function fetchPriceRange() {
      setLoadingPrice(true);
      try {
        const res = await fetchAds({ limit: 1, page: 1, locale: "en" }); // TODO: use current locale if available
        const min = res.data?.min_price ?? 0;
        const max = res.data?.max_price ?? 50000;
        setMinPrice(min);
        setMaxPrice(max);
        setPriceRange([min, max]);
      } catch (e) {
        setMinPrice(0);
        setMaxPrice(50000);
        setPriceRange([0, 50000]);
        console.log('🔍 Error fetching price range:', e);
      } finally {
        setLoadingPrice(false);
      }
    }
    fetchPriceRange();

    loadCategories();
    loadSurfaces();
    loadPorts();
    loadCountries();
  }, []);

  const formStoneOptions = [
    { id: "all", label: t("allStone"), icon: Stone },
    { id: "block", label: t("blocks"), icon: Block },
    { id: "slab", label: t("slabs"), icon: Slab },
    { id: "tile", label: t("tiles"), icon: Tile },
  ];

  const colorOptions = [
    { id: "black", color: "#000000", name: "Black" },
    { id: "white", color: "#ffffff", name: "White" },
    { id: "gray", color: "#6b7280", name: "Gray" },
    { id: "green", color: "#22c55e", name: "Green" },
    { id: "blue", color: "#3b82f6", name: "Blue" },
    { id: "red", color: "#ef4444", name: "Red" },
    { id: "yellow", color: "#eab308", name: "Yellow" },
    { id: "orange", color: "#f97316", name: "Orange" },
    { id: "purple", color: "#a855f7", name: "Purple" },
    { id: "pink", color: "#ec4899", name: "Pink" },
    { id: "brown", color: "#92400e", name: "Brown" },
    { id: "beige", color: "#fbbf24", name: "Beige" },
    { id: "cream", color: "#fef3c7", name: "Cream" },
    { id: "gold", color: "#facc15", name: "Gold" },
    { id: "silver", color: "#9ca3af", name: "Silver" },
    { id: "bronze", color: "#c2410c", name: "Bronze" },
  ];

  const handleColorToggle = (colorId: string) => {
    setSelectedColors(prev => 
      prev.includes(colorId) 
        ? prev.filter(c => c !== colorId)
        : [...prev, colorId]
    );
  };

  const clearColors = () => {
    setSelectedColors([]);
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

  // const handlePriceRangeChange = (value: number[]) => {
  //   setPriceRange([value[0], value[1]]);
  // };

  const handleApplyFilters = () => {
    const filters: AdsFilters = {};
    
    // Add price filters
    if (priceRange[0] > 0) {
      filters.min_price = priceRange[0];
    }
    if (priceRange[1] < 50000) {
      filters.max_price = priceRange[1];
    }
    
    // Add form filter (skip "all")
    if (selectedFormStone !== "all") {
      filters.form = selectedFormStone;
      console.log('📦 Selected form for filter:', selectedFormStone);
    }
    
    // Add category filter
    if (selectedCategories.length > 0) {
      filters.category_ids = selectedCategories;
      console.log('🎨 Selected categories for filter:', selectedCategories);
    }
    
    // Add colors filter
    if (selectedColors.length > 0) {
      filters.colors = selectedColors;
      console.log('🎨 Selected colors for filter:', selectedColors);
    }
    
    // Add surfaces filter
    if (selectedSurfaces.length > 0) {
      filters.surface_ids = selectedSurfaces;
      console.log('🏗️ Selected surfaces for filter:', selectedSurfaces);
    }
    
    // Add size filter
    if (selectedSize) {
      filters.size_range_type = selectedSize;
      console.log('📏 Selected size for filter:', selectedSize);
    }
    
    // Add port filter
    if (selectedReceivingPorts.length > 0) {
      filters.receiving_ports = selectedReceivingPorts;
      console.log('🚢 Selected receiving ports for filter:', selectedReceivingPorts);
    }

    if (selectedExportPorts.length > 0) {
      filters.export_ports = selectedExportPorts;
      console.log('🚢 Selected export ports for filter:', selectedExportPorts);
    }
    
    // Add origin filter
    if (selectedOriginCountries.length > 0) {
      filters.origin_country_ids = selectedOriginCountries;
      console.log('🌎 Selected origin countries for filter:', selectedOriginCountries);
    }
    
    // Add grade filter
    if (selectedGrade) {
      filters.grade = selectedGrade;
      console.log('⭐ Selected grade for filter:', selectedGrade);
    }
    
    console.log('🔍 Applying filters:', filters);
    console.log('🎨 Colors being sent:', filters.colors);
    console.log('📏 Size being sent:', filters.size_range_type);
    console.log('⭐ Grade being sent:', filters.grade);
    onFiltersChange?.(filters);
  };

  return (
    <aside className="w-[350px] bg-background rounded-xl p-4 flex flex-col gap-6 border border-border max-h-[95vh] overflow-hidden">
      {/* Content Container with Fade Effect */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Basic Filters - Only visible when showAdvanced is false */}
        {!showAdvanced && (
          <div className="space-y-6">
            {/* Select Form Stone */}
            <div className="space-y-3">
              <h3 className="font-bold text-foreground text-sm">{t("selectFormStone")}</h3>
              <div className="grid grid-cols-2 gap-3">
                {formStoneOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant="outline"
                      className={cn(
                        "h-20 flex flex-col gap-2 p-3",
                        selectedFormStone === option.id 
                          ? "border-orange-500" 
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
              {loadingCategories ? (
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded-md" />
                      <div className="p-1 text-center">
                        <div className="h-3 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={cn(
                        "relative cursor-pointer rounded-lg border-1 transition-all",
                        selectedCategories.includes(category.id) 
                          ? "border-orange-500" 
                          : "border-muted hover:border-orange-200"
                      )}
                      onClick={() => {
                        setSelectedCategories(prev => 
                          prev.includes(category.id) 
                            ? prev.filter(c => c !== category.id)
                            : [...prev, category.id]
                        );
                      }}
                    >
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-sm" />
                      </div>
                      <div className="p-1 text-center">
                        <span className="text-xs font-medium text-foreground">{category.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Color Selection */}
            <div className="space-y-3 mb-4">
              <h3 className="font-bold text-foreground text-sm">{t("color")}</h3>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <div
                    key={color.id}
                    className={cn(
                      "relative cursor-pointer rounded-sm border-1 transition-all p-1",
                      selectedColors.includes(color.id) 
                        ? "border-orange-500" 
                        : "border-white hover:border-orange-200"
                    )}
                    onClick={() => handleColorToggle(color.id)}
                  >
                    <div className="flex flex-col items-center ">
                      <div
                        className="w-10 h-10 rounded-sm border"
                        style={{ backgroundColor: color.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {selectedColors.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Selected: {selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''}
                </div>
              )}
              {selectedColors.length > 0 && (
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" onClick={clearColors} className="text-xs text-muted-foreground">
                    {t("clearColors")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advanced Filters - Only visible when showAdvanced is true */}
        {showAdvanced && (
          <div className="space-y-6">
            {/* Price Section */}
            <div className="space-y-3">
              <h3 className="font-bold text-foreground text-sm">{t("price")}</h3>
              <div className="space-y-3">
                {loadingPrice ? (
                  <div>Loading price range...</div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder={t("min")}
                          className="pl-8"
                          value={priceRange[0]}
                          min={minPrice ?? 0}
                          max={maxPrice ?? 50000}
                          onChange={e => setPriceRange([parseInt(e.target.value) || minPrice!, priceRange[1]])}
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
                          min={minPrice ?? 0}
                          max={maxPrice ?? 50000}
                          onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice!])}
                        />
                      </div>
                    </div>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={value => setPriceRange([value[0], value[1]])}
                        min={minPrice ?? 0}
                        max={maxPrice ?? 50000}
                        step={100}
                        className="w-full"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground text-center">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Surface Section */}
            <div className="space-y-3">
              <h3 className="font-bold text-foreground text-sm">{t("surface")}</h3>
              <div className="flex flex-wrap gap-2">
                {loadingSurfaces ? (
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(8)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="aspect-square bg-muted rounded-md" />
                        <div className="p-1 text-center">
                          <div className="h-3 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  surfaces.map((surface) => (
                    <Button
                      key={surface.id}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-xs",
                        selectedSurfaces.includes(surface.id) 
                          ? "border-orange-500" 
                          : "border-muted"
                      )}
                      onClick={() => handleSurfaceToggle(surface.id)}
                    >
                      {surface.name}
                    </Button>
                  ))
                )}
              </div>
            </div>

            {/* Size Section */}
            <div className="space-y-3">
              <h3 className="font-bold text-foreground text-sm">{t("size")}</h3>
              <div className="flex gap-2">
                {["small", "medium", "big"].map((size) => (
                  <Button
                    key={size}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1",
                      selectedSize === size 
                        ? "border-orange-500" 
                        : "border-muted"
                    )}
                    onClick={() => handleSizeToggle(size)}
                  >
                    {t(size)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Receiving Port Section */}
            <div className="space-y-3">
              <h3 className="font-bold text-foreground text-sm">{t("receivingPort")}</h3>
              {loadingPorts ? (
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-10 bg-muted rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {ports.map((port) => (
                    <Button
                      key={port.id}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-xs",
                        selectedReceivingPorts.includes(port.id) 
                          ? "border-orange-500" 
                          : "border-muted"
                      )}
                      onClick={() => {
                        setSelectedReceivingPorts(prev => 
                          prev.includes(port.id) 
                            ? prev.filter(p => p !== port.id)
                            : [...prev, port.id]
                        );
                      }}
                    >
                      {port.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Port Section */}
            <div className="space-y-3">
              <h3 className="font-bold text-foreground text-sm">{t("exportPort")}</h3>
              {loadingPorts ? (
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-10 bg-muted rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {ports.map((port) => (
                    <Button
                      key={port.id}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-xs",
                        selectedExportPorts.includes(port.id) 
                          ? "border-orange-500" 
                          : "border-muted"
                      )}
                      onClick={() => {
                        setSelectedExportPorts(prev => 
                          prev.includes(port.id) 
                            ? prev.filter(p => p !== port.id)
                            : [...prev, port.id]
                        );
                      }}
                    >
                      {port.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>

                         {/* Origin Section */}
             <div className="space-y-3">
               <h3 className="font-bold text-foreground text-sm">{t("origin")}</h3>
               {loadingCountries ? (
                 <div className="grid grid-cols-2 gap-2">
                   {[...Array(4)].map((_, index) => (
                     <div key={index} className="animate-pulse">
                       <div className="h-10 bg-muted rounded-md" />
                     </div>
                   ))}
                 </div>
               ) : (
                 <DropdownMultiSelect
                   options={countries.map(country => ({ label: country.name, value: country.id }))}
                   value={selectedOriginCountries}
                   onChange={setSelectedOriginCountries}
                   placeholder={t("selectOriginCountries")}
                   disabled={loadingCountries}
                 />
               )}
             </div>

            {/* Grade Section */}
            <div className="space-y-3 mb-10">
              <h3 className="font-bold text-foreground text-sm">{t("grade")}</h3>
              <div className="flex gap-2">
                {["a", "b", "c"].map((grade) => (
                  <Button
                    key={grade}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1",
                      selectedGrade === grade 
                        ? "border-orange-500" 
                        : "border-muted"
                    )}
                    onClick={() => handleGradeToggle(grade)}
                  >
                    {t(`grade${grade.toUpperCase()}`)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fade Out Effect - Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border gap-2">
        {showAdvanced ? (
          <Button 
            variant="ghost" 
            className="flex-1"
            onClick={() => setShowAdvanced(false)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("back")}
          </Button>
        ) : (
          
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAdvanced(true)}
              className="flex-1"
            >
              {t("advanced")}
            </Button>
          
        )}
        
          <Button 
            variant="default"
            size="default"
            className="bg-gray-700 hover:bg-gray-800 text-white rounded-lg px-4 py-2 flex items-center gap-2 font-medium flex-1"
            onClick={handleApplyFilters}
           
          >
            {t("apply")}
          </Button>
      </div>
    </aside>
  );
};

export default DesktopCategoryFilters;
