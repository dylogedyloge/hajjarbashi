"use client";

import { Card } from "@/components/ui/card";
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

interface StepSubcategoryOfStoneProps {
  selectedCategory: string;
  selectedSubcategory: string;
  setSelectedSubcategory: (subcategory: string) => void;
  onDiscard: () => void;
  locale: string;
}

export default function StepSubcategoryOfStone({
  selectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  onDiscard,
  locale
}: StepSubcategoryOfStoneProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories and find subcategories for the selected category
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
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
        setError(err instanceof Error ? err.message : "Failed to load subcategories");
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory) {
      loadCategories();
    }
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
          Ready to sell? Lets start with your stone details.
        </h1>
        <p className="text-gray-600">
          Please choose the form and type of stone youre listing.
        </p>
      </div>

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
      {loading ? (
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
      ) : error ? (
        <div className="text-center text-red-600">
          <p>Failed to load subcategories: {error}</p>
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

      {/* Discard Button */}
      <div className="flex justify-start pt-6">
        <button
          onClick={onDiscard}
          className="flex items-center space-x-2 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Discard</span>
        </button>
      </div>
    </div>
  );
} 