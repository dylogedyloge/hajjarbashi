"use client";

import { Card } from "@/components/ui/card";
import { BlocksSvg, SlabsSvg, TilesSvg } from "@/components/icons";
import { cn } from "@/utils/cn";
import { fetchCategories } from "@/lib/advertisements";
import { useState, useEffect } from "react";
import { Magnifier } from "@/components/icons";
import Image from "next/image";

interface Subcategory {
  id: string;
  name: string;
  image?: string;
  colors?: string[];
  tags?: string[];
  description?: string;
}

interface StepFormAndCategoryOfStoneProps {
  selectedForm: string;
  setSelectedForm: (form: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (subcategory: string) => void;
  t: any;
  locale: string;
}

export default function StepFormAndCategoryOfStone({ 
  selectedForm, 
  setSelectedForm, 
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  
  locale
}: StepFormAndCategoryOfStoneProps) {
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; name: string }[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoryLoading, setSubcategoryLoading] = useState(false);
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch subcategories when category is selected
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategories([]);
        return;
      }

      setSubcategoryLoading(true);
      setSubcategoryError(null);
      try {
        const data = await fetchCategories(locale);
        
        // Find the selected category and extract its children (subcategories)
        const selectedCategoryData = data.find((cat: any) => cat.id === selectedCategory);
        if (selectedCategoryData && selectedCategoryData.children) {
          setSubcategories(selectedCategoryData.children);
        } else {
          setSubcategories([]);
        }
      } catch (err) {
        setSubcategoryError(err instanceof Error ? err.message : "Failed to load subcategories");
        console.error('Failed to fetch categories:', err);
      } finally {
        setSubcategoryLoading(false);
      }
    };

    loadSubcategories();
  }, [selectedCategory, locale]);

  // Filter subcategories based on search query
  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
         Title
        </h1>
        <p className="text-gray-600">
          Subtitle
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

      {/* Subcategory Selection - Only show if a category is selected */}
      {selectedCategory && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Magnifier className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Type a command or search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Subcategories Grid */}
          {subcategoryLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(16)].map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : subcategoryError ? (
            <div className="text-center text-red-600">
              <p>Failed to load subcategories: {subcategoryError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredSubcategories.map((subcategory) => {
                const isSelected = selectedSubcategory === subcategory.id;
                
                return (
                  <Card
                    key={subcategory.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                      isSelected 
                        ? "ring-2 ring-red-500 bg-red-50" 
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedSubcategory(subcategory.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Subcategory Image */}
                      <div className={cn(
                        "w-12 h-12 rounded flex-shrink-0 overflow-hidden",
                        isSelected ? "ring-2 ring-red-500" : ""
                      )}>
                        {subcategory.image ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${subcategory.image}`}
                            alt={subcategory.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-600 font-medium">
                              {subcategory.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-sm font-medium transition-colors duration-200 truncate",
                          isSelected ? "text-red-600" : "text-gray-900"
                        )}>
                          {subcategory.name}
                        </h3>
                      </div>
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