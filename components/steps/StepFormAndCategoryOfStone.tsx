"use client";

import { Card } from "@/components/ui/card";
import { BlocksSvg, SlabsSvg, TilesSvg } from "@/components/icons";
import { cn } from "@/utils/cn";
import { fetchCategories } from "@/lib/advertisements";
import { useState, useEffect } from "react";

interface StepFormAndCategoryOfStoneProps {
  selectedForm: string;
  setSelectedForm: (form: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  t: any;
  locale: string;
}

export default function StepFormAndCategoryOfStone({ 
  selectedForm, 
  setSelectedForm, 
  selectedCategory,
  setSelectedCategory,
  t,
  locale
}: StepFormAndCategoryOfStoneProps) {
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; name: string }[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const formOptions = [
    {
      id: "blocks",
      title: "Blocks",
      icon: BlocksSvg,
      description: "Three-dimensional stone blocks"
    },
    {
      id: "slabs",
      title: "Slabs", 
      icon: SlabsSvg,
      description: "Flat stone slabs"
    },
    {
      id: "tiles",
      title: "Tiles",
      icon: TilesSvg,
      description: "Small stone tiles"
    }
  ];

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setCategoryLoading(true);
      setCategoryError(null);
      try {
        const data = await fetchCategories(locale);
        setCategoryOptions(data);
      } catch (err) {
        setCategoryError(err instanceof Error ? err.message : "Failed to load categories");
        console.error('Failed to fetch categories:', err);
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategories();
  }, [locale]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Ready to sell? Let's start with your stone details.
        </h1>
        <p className="text-gray-600">
          Please choose the form and type of stone you're listing.
        </p>
      </div>

      {/* Form Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {formOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedForm === option.id;
          
          return (
            <Card
              key={option.id}
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 hover:shadow-lg",
                isSelected 
                  ? "ring-2 ring-primary bg-primary/5" 
                  : "hover:bg-gray-50"
              )}
              onClick={() => setSelectedForm(option.id)}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={cn(
                  "p-4 rounded-lg transition-colors duration-200",
                  isSelected ? "bg-primary/10" : "bg-gray-100"
                )}>
                  <IconComponent 
                    width={64}
                    height={64}
                    className={cn(
                      "transition-colors duration-200",
                      isSelected ? "text-primary" : "text-gray-600"
                    )}
                  />
                </div>
                <div className="text-center">
                  <h3 className={cn(
                    "text-lg font-semibold transition-colors duration-200",
                    isSelected ? "text-primary" : "text-gray-900"
                  )}>
                    {option.title}
                  </h3>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Category Selection - Only show if a form is selected */}
      {selectedForm && (
        <div className="space-y-4">
          {/* <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Stone Type
            </h2>
            <p className="text-gray-600 mt-1">
              Choose the type of stone you're listing
            </p>
          </div> */}
          
          {categoryLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : categoryError ? (
            <div className="text-center text-red-600">
              <p>Failed to load categories: {categoryError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categoryOptions.map((category) => {
                const isSelected = selectedCategory === category.id;
                
                return (
                  <Card
                    key={category.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                      isSelected 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="text-center">
                      <h3 className={cn(
                        "text-sm font-medium transition-colors duration-200",
                        isSelected ? "text-primary" : "text-gray-900"
                      )}>
                        {category.name}
                      </h3>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 