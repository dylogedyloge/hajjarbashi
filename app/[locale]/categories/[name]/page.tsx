"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/ads";
import { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/advertisements";
import { useTranslations } from "next-intl";

// Function to fetch category data by name
async function fetchCategoryByName(name: string, locale: string) {
  console.log('🔍 Fetching category with name:', name, 'and locale:', locale);
  
  try {
    // Use the existing fetchCategories function
    const categories = await fetchCategories(locale);
    console.log('📡 Categories fetched:', categories);
    
    // Find the category by matching the name (convert to slug format)
    const targetSlug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    let foundCategory: Category | null = null;
    
    for (const category of categories) {
      const categorySlug = category.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      if (categorySlug === targetSlug) {
        foundCategory = category;
        break;
      }
    }
    
    if (!foundCategory) {
      console.log('❌ Category not found for name:', name);
      return null;
    }
    
    console.log('✅ Found category:', foundCategory);
    return foundCategory;
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    throw error;
  }
}

function CategoryHeader({ category }: { category: Category }) {
  const t = useTranslations("HomePage");
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
      <div className="p-6">
        {/* Category Tag */}
        <div className="flex items-center justify-between mb-4">
          <Badge 
            variant="outline" 
            className="rounded-full border-orange-300 bg-orange-50 text-orange-600"
          >
            <span className="text-sm font-medium">{category.name}</span>
          </Badge>
          {/* Category Image */}
          {category.image ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${category.image}`}
              alt={category.name}
              width={100}
              height={100}
              className="w-32 h-16 rounded-md overflow-hidden flex-shrink-0 object-cover"
            />
          ) : (
            <Image
              src="https://placehold.co/800x400.png?text=Category&font=poppins"
              alt={t("placeholder")}
              width={100}
              height={100}
              className="w-32 h-16 rounded-md overflow-hidden flex-shrink-0 object-cover"
              unoptimized
            />
          )}
        </div>

        {/* Category Name and Description */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {category.name}
          </h1>
          {category.description ? (
            <div className="text-gray-600 leading-relaxed space-y-2">
              {category.description.split('\\n\\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>Explore our collection of {category.name.toLowerCase()} materials for your construction and decoration needs.</p>
              <p>Find the perfect {category.name.toLowerCase()} for your project from our extensive selection.</p>
            </div>
          )}
        </div>

        {/* Subcategories if available */}
        {category.children && category.children.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Subcategories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {category.children.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/subcategory/${subcategory.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`}
                  className="p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
                  {subcategory.description && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {subcategory.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="border-t border-gray-200 pt-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link 
                  href="/"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {t("home")}
                </Link>
              </li>
              <li className="flex items-center">
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-gray-900 font-medium">{category.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
}

function CategoryContent({ category }: { category: Category }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Category Header */}
        <CategoryHeader category={category} />
      </div>
    </div>
  );
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ name: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const resolvedSearchParams = await searchParams;
        
        console.log('📋 Resolved params:', resolvedParams);
        console.log('🌍 Resolved search params:', resolvedSearchParams);
        
        // Extract locale from params or searchParams
        const locale = resolvedParams.locale || 
          (Array.isArray(resolvedSearchParams?.lang) 
            ? resolvedSearchParams.lang[0] 
            : resolvedSearchParams?.lang) || 
          "en";
        
        console.log('🌐 Locale:', locale);
        console.log('🔗 Category name:', resolvedParams.name);
        
        // Fetch category by name
        const foundCategory = await fetchCategoryByName(resolvedParams.name, locale);
        
        if (!foundCategory) {
          setError('Category not found');
          return;
        }
        
        console.log('✅ Category loaded:', foundCategory);
        setCategory(foundCategory);
      } catch (err) {
        console.error('❌ Error loading category:', err);
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };
    
    loadCategory();
  }, [params, searchParams]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }
  
  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Category not found'}
          </h1>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  console.log('🎉 Returning category content');
  return <CategoryContent category={category} />;
}
