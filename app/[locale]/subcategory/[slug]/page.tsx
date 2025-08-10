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

// Function to fetch subcategory data by slug
async function fetchSubcategoryBySlug(slug: string, locale: string) {
  console.log('🔍 Fetching subcategory with slug:', slug, 'and locale:', locale);
  
  try {
    // Use the existing fetchCategories function
    const categories = await fetchCategories(locale);
    console.log('📡 Categories fetched:', categories);
    
    // Find the subcategory by matching the slug
    const targetSlug = slug.toLowerCase();
    let foundSubcategory: Category | null = null;
    
    for (const category of categories) {
      if (category.children && category.children.length > 0) {
        for (const subcategory of category.children) {
          const subcategorySlug = subcategory.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
          if (subcategorySlug === targetSlug) {
            foundSubcategory = subcategory;
            break;
          }
        }
      }
      if (foundSubcategory) break;
    }
    
    if (!foundSubcategory) {
      console.log('❌ Subcategory not found for slug:', slug);
      return null;
    }
    
    console.log('✅ Found subcategory:', foundSubcategory);
    return foundSubcategory;
  } catch (error) {
    console.error('❌ Error fetching subcategory:', error);
    throw error;
  }
}

function SubcategoryHeader({ subcategory }: { subcategory: Category }) {
  const t = useTranslations("HomePage");
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
      <div className="p-6">
        {/* Subcategory Tag */}
        <div className="flex items-center justify-between mb-4">
          <Badge 
            variant="outline" 
            className="rounded-full border-orange-300 bg-orange-50 text-orange-600"
          >
            <span className="text-sm font-medium">{subcategory.name}</span>
          </Badge>
          {/* Subcategory Image */}
          {subcategory.image ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${subcategory.image}`}
              alt={subcategory.name}
              width={100}
              height={100}
              className="w-32 h-16 rounded-md overflow-hidden flex-shrink-0 object-cover"
            />
          ) : (
            <Image
              src="https://placehold.co/800x400.png?text=Subcategory&font=poppins"
              alt={t("placeholder")}
              width={100}
              height={100}
              className="w-32 h-16 rounded-md overflow-hidden flex-shrink-0 object-cover"
              unoptimized
            />
          )}
        </div>

        {/* Subcategory Name and Description */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {subcategory.name}
          </h1>
          {subcategory.description ? (
            <div className="text-gray-600 leading-relaxed space-y-2">
              {subcategory.description.split('\\n\\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>{t("defaultSubcategoryDescription", { name: subcategory.name })}</p>
              <p>{t("exploreCollection")}</p>
            </div>
          )}
        </div>

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
                <span className="text-gray-900 font-medium">{subcategory.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
}

function SubcategoryContent({ subcategory }: { subcategory: Category }) {
  const t = useTranslations("HomePage");
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
              {t("backToCategories")}
            </Button>
          </Link>
        </div>

        {/* Subcategory Header */}
        <SubcategoryHeader subcategory={subcategory} />
      </div>
    </div>
  );
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = useTranslations("HomePage");
  const [subcategory, setSubcategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSubcategory = async () => {
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
        console.log('🔗 Subcategory slug:', resolvedParams.slug);
        
        // Fetch subcategory by slug
        const foundSubcategory = await fetchSubcategoryBySlug(resolvedParams.slug, locale);
        
        if (!foundSubcategory) {
          setError(t('subcategoryNotFound'));
          return;
        }
        
        console.log('✅ Subcategory loaded:', foundSubcategory);
        setSubcategory(foundSubcategory);
      } catch (err) {
        console.error('❌ Error loading subcategory:', err);
        setError(t('failedToLoadSubcategory'));
      } finally {
        setLoading(false);
      }
    };
    
    loadSubcategory();
  }, [params, searchParams]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loadingSubcategory")}</p>
        </div>
      </div>
    );
  }
  
  if (error || !subcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || t("subcategoryNotFound")}
          </h1>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToHome")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  console.log('🎉 Returning subcategory content');
  return <SubcategoryContent subcategory={subcategory} />;
}


