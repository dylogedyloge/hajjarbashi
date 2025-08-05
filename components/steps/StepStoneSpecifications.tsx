"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface StepStoneSpecificationsProps {
  sizeH: string;
  setSizeH: (value: string) => void;
  sizeW: string;
  setSizeW: (value: string) => void;
  sizeL: string;
  setSizeL: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  surfaceId: string;
  setSurfaceId: (value: string) => void;
  grade: string;
  setGrade: (value: string) => void;
  surfaceOptions: { id: string; name: string }[];
  surfaceLoading: boolean;
  surfaceError: string | null;
  t: any;
  errors?: Record<string, string>;
}

export default function StepStoneSpecifications({
  sizeH,
  setSizeH,
  sizeW,
  setSizeW,
  sizeL,
  setSizeL,
  weight,
  setWeight,
  surfaceId,
  setSurfaceId,
  grade,
  setGrade,
  surfaceOptions,
  surfaceLoading,
  surfaceError,
  t,
  errors
}: StepStoneSpecificationsProps) {
  // Grade options - you can make this dynamic if needed
  const gradeOptions = [
    { id: "A", name: "A" },
    { id: "B", name: "B" },
    { id: "C", name: "C" },
  ];

  // Ensure all values are strings and add debugging
  const safeSurfaceId = typeof surfaceId === 'string' ? surfaceId : '';
  const safeGrade = typeof grade === 'string' ? grade : '';
  const safeSizeH = typeof sizeH === 'string' ? sizeH : '';
  const safeSizeW = typeof sizeW === 'string' ? sizeW : '';
  const safeSizeL = typeof sizeL === 'string' ? sizeL : '';
  const safeWeight = typeof weight === 'string' ? weight : '';

  // Function to determine size category based on dimensions
  const getSizeCategory = () => {
    const h = parseFloat(safeSizeH) || 0;
    const w = parseFloat(safeSizeW) || 0;
    const l = parseFloat(safeSizeL) || 0;
    
    // If no dimensions are filled, return null
    if (h === 0 && w === 0 && l === 0) {
      return null;
    }
    
    // Calculate average dimension (using non-zero values only)
    const dimensions = [h, w, l].filter(d => d > 0);
    if (dimensions.length === 0) return null;
    
    const avgDimension = dimensions.reduce((sum, dim) => sum + dim, 0) / dimensions.length;
    
    // Define size categories based on average dimension
    if (avgDimension <= 50) {
      return { text: "Small", variant: "secondary" as const };
    } else if (avgDimension <= 150) {
      return { text: "Medium", variant: "default" as const };
    } else {
      return { text: "Large", variant: "destructive" as const };
    }
  };

  const sizeCategory = getSizeCategory();

  // Debug logging
  useEffect(() => {
    console.log('StepStoneSpecifications props:', {
      surfaceId,
      grade,
      sizeH,
      sizeW,
      sizeL,
      weight,
      surfaceOptions: surfaceOptions?.length,
      surfaceLoading,
      surfaceError
    });
  }, [surfaceId, grade, sizeH, sizeW, sizeL, weight, surfaceOptions, surfaceLoading, surfaceError]);

  return (
    <div className="space-y-8">

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Size and Weight Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Size Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-900">Size</Label>
              {sizeCategory && (
                <Badge variant={sizeCategory.variant} className="text-xs">
                  {sizeCategory.text}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Height"
                  value={safeSizeH}
                  onChange={(e) => setSizeH(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">cm</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Width"
                  value={safeSizeW}
                  onChange={(e) => setSizeW(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">cm</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Length"
                  value={safeSizeL}
                  onChange={(e) => setSizeL(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">cm</span>
              </div>
            </div>
          </div>

          {/* Weight Section */}
          <div className="space-y-3">
            <Label className="text-sm   text-gray-900">Weight</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Weight"
                value={safeWeight}
                onChange={(e) => setWeight(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">kg</span>
            </div>
          </div>
        </div>

        {/* Size and Weight Error */}
        {(errors?.sizeH || errors?.sizeW || errors?.sizeL || errors?.weight) && (
          <div className="text-red-600 text-sm">
            {errors.sizeH || errors.sizeW || errors.sizeL || errors.weight}
          </div>
        )}

        {/* Surface and Grade Row */}
        <div className="grid grid-cols-2 gap-6 mt-12">
          {/* Surface Section */}
          <div className="space-y-3">
            <Label className="text-sm   text-gray-900">Surface</Label>
            <Select value={safeSurfaceId} onValueChange={setSurfaceId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Surface Stone" />
              </SelectTrigger>
              <SelectContent>
                {surfaceLoading ? (
                  <SelectItem value="" disabled>
                    Loading surfaces...
                  </SelectItem>
                ) : surfaceError ? (
                  <SelectItem value="" disabled>
                    Error loading surfaces
                  </SelectItem>
                ) : (
                  (surfaceOptions || []).map((surface) => (
                    <SelectItem key={surface.id} value={surface.id}>
                      {surface.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Grade Section */}
          <div className="space-y-3">
            <Label className="text-sm   text-gray-900">Grade</Label>
            <Select value={safeGrade} onValueChange={setGrade}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Grade Stone" />
              </SelectTrigger>
              <SelectContent>
                {(gradeOptions || []).map((gradeOption) => (
                  <SelectItem key={gradeOption.id} value={gradeOption.id}>
                    {gradeOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grade Error */}
        {errors?.grade && (
          <div className="text-red-600 text-sm mt-2">
            {errors.grade}
          </div>
        )}

      </div>
    </div>
  );
} 