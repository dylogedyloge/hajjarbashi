"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepSizeWeightSurfaceGradeOfStoneProps {
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
}

export default function StepSizeWeightSurfaceGradeOfStone({
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
  t
}: StepSizeWeightSurfaceGradeOfStoneProps) {
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

  // Debug logging
  useEffect(() => {
    console.log('StepSizeWeightSurfaceGradeOfStone props:', {
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
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Tell us about your stone
        </h1>
        <p className="text-gray-600">
          Please provide details such as its dimensions, weight, surface texture, and finish.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Size and Weight Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Size Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900">Size</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Height"
                  value={safeSizeH}
                  onChange={(e) => setSizeH(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">cm</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Width"
                  value={safeSizeW}
                  onChange={(e) => setSizeW(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">cm</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Length"
                  value={safeSizeL}
                  onChange={(e) => setSizeL(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">cm</span>
              </div>
            </div>
          </div>

          {/* Weight Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900">Weight</label>
            <div className="relative">
              <input
                type="number"
                placeholder="Weight"
                value={safeWeight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="absolute right-3 top-2 text-sm text-gray-500">kg</span>
            </div>
          </div>
        </div>

        {/* Surface and Grade Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Surface Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900">Surface</label>
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
            <label className="text-sm font-semibold text-gray-900">Grade</label>
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


      </div>
    </div>
  );
} 