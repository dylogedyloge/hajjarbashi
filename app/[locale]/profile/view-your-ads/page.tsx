"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchUserAds } from "@/lib/advertisements";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  // TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Grid,
  List
} from "lucide-react";

type UserAd = {
  id: string;
  created_at?: number;
  updated_at?: number;
  title?: string;
  description?: string;
  price?: number;
  price_unit?: string;
  stone_type?: string;
  origin?: string;
  origin_country?: { id: string; name: string };
  origin_city?: { id: string; name: string };
  published_at?: string;
  status?: string;
  is_featured?: boolean;
  is_express?: boolean;
  express?: boolean;
  weight?: number | string;
  weight_range_type?: string;
  sale_unit_type?: string;
  size?: { h?: number; w?: number; l?: number } | string;
  size_range_type?: string;
  surface?: string | { id: string; name: string };
  category?: { 
    id: string; 
    name: string; 
    description?: string;
    image?: string;
    colors?: string[];
  };
  media?: Array<{ 
    index: number;
    media_thumb_path?: string; 
    media_path?: string 
  }>;
  cover?: string;
  cover_thumb?: string;
  views?: number;
  colors?: string[];
  form?: string;
  grade?: string;
  is_chat_enabled?: boolean;
  contact_info_enabled?: boolean;
  minimum_order?: number;
  benefits?: string[];
  defects?: string[];
  receiving_ports_details?: Array<{
    id: string;
    name: string;
    city_name: string;
    ownership: string;
  }>;
  export_ports_details?: Array<{
    id: string;
    name: string;
    city_name: string;
    ownership: string;
  }>;
};

export default function ViewYourAdsPage() {
  const { token, isAuthenticated } = useAuth();
  const locale = useLocale();
  const t = useTranslations("ViewYourAds");
  const [ads, setAds] = useState<UserAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setError("Please sign in to view your ads");
      setLoading(false);
      return;
    }

    const fetchUserAdsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchUserAds({ 
          limit: itemsPerPage, 
          page: currentPage, 
          locale, 
          token 
        });
        
        setAds(response.data || []);
        
        // Set pagination data
        if (response.data && response.data.length > 0) {
          // If we get a full page, there might be more
          if (response.data.length === itemsPerPage) {
            setTotalPages(Math.max(currentPage + 1, totalPages));
            setTotalItems((currentPage * itemsPerPage) + response.data.length);
          } else {
            // This is likely the last page
            setTotalPages(currentPage);
            setTotalItems((currentPage - 1) * itemsPerPage + response.data.length);
          }
        } else {
          setTotalPages(1);
          setTotalItems(0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your ads");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAdsData();
  }, [isAuthenticated, token, locale, currentPage, itemsPerPage]);

  const getStatusIcon = (status?: string | number) => {
    switch (status) {
      case 0:
        return <Clock className="w-4 h-4" />;
      case 1:
        return <CheckCircle className="w-4 h-4" />;
      case 2:
        return <AlertCircle className="w-4 h-4" />;
      case 3:
        return <Clock className="w-4 h-4" />;
      case 4:
        return <AlertCircle className="w-4 h-4" />;
      case 5:
        return <AlertCircle className="w-4 h-4" />;
      case 6:
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status?: string | number) => {
    switch (status) {
      case 0:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 1:
        return 'bg-green-100 text-green-800 border-green-200';
      case 2:
        return 'bg-red-100 text-red-800 border-red-200';
      case 3:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 5:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 6:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status?: string | number) => {
    switch (status) {
      case 0:
        return t("waiting");
      case 1:
        return t("published");
      case 2:
        return t("rejected");
      case 3:
        return t("draft");
      case 4:
        return t("deleted");
      case 5:
        return t("expired");
      case 6:
        return t("temp");
      default:
        return t("unknown");
    }
  };

  const formatPrice = (price?: number, unit?: string) => {
    if (!price) return null;
    return `$${price.toLocaleString()}${unit ? `/${unit}` : ''}`;
  };

  const getMainImage = (ad: UserAd) => {
    if (ad.media && ad.media.length > 0) {
      const firstMedia = ad.media[0];
      return firstMedia.media_thumb_path || firstMedia.media_path;
    }
    return null;
  };

  const getTimeAgo = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} ${days === 1 ? 'Day' : 'Days'} Ago`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'Hour' : 'Hours'} Ago`;
    } else {
      return "Just Now";
    }
  };

  const getSizeText = (ad: UserAd) => {
    if (ad.size) {
      if (typeof ad.size === 'string') {
        return ad.size;
      } else {
        return `${ad.size.w || 0}*${ad.size.l || 0}*${ad.size.h || 0} cm`;
      }
    }
    return null;
  };

  const getSurfaceText = (ad: UserAd) => {
    if (ad.surface) {
      if (typeof ad.surface === 'string') {
        return ad.surface;
      } else {
        return ad.surface.name;
      }
    }
    return null;
  };

  const getColorSwatches = (ad: UserAd) => {
    if (ad.colors && ad.colors.length > 0) {
      return ad.colors.slice(0, 3).map((color, index) => (
        <div
          key={index}
          className="w-3 h-3 rounded-full border border-gray-200"
          style={{ backgroundColor: color.toLowerCase() }}
        />
      ));
    }
    return null;
  };

  const filteredAds = ads.filter(ad => {
    if (selectedFilter === "all") return true;
    return String(ad.status) === selectedFilter;
  });

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Show first page
      items.push(1);

      if (currentPage > 3) {
        items.push('ellipsis-start');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        items.push('ellipsis-end');
      }

      // Show last page
      if (totalPages > 1) {
        items.push(totalPages);
      }
    }

    return items;
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
          <p className="text-muted-foreground">{t("signInRequired")}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
          <p className="text-destructive">{t("error", { message: error })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
          <p className="text-muted-foreground">
            {ads.length === 0 
              ? t("noAds")
              : t("subtitle", { count: totalItems })
            }
          </p>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
          >
            All
          </Button>
          <Button
            variant={selectedFilter === "1" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("1")}
          >
            Published
          </Button>
          <Button
            variant={selectedFilter === "2" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("2")}
          >
            Rejected
          </Button>
          <Button
            variant={selectedFilter === "3" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("3")}
          >
            Review
          </Button>
          <Button
            variant={selectedFilter === "0" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("0")}
          >
            Draft
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Ads Grid */}
      {filteredAds.length > 0 && (
        <>
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {filteredAds.map((ad) => {
              const isPublished = String(ad.status) === "1";
              
              const cardContent = (
                <div 
                  key={ad.id} 
                  className={`overflow-hidden transition-shadow h-full w-full bg-card rounded-xl flex flex-col gap-8 shadow-md mb-12 ${
                    isPublished 
                      ? "hover:shadow-lg cursor-pointer" 
                      : "hover:shadow-lg"
                  }`}
                >
                  <div className="flex h-full">
                    {/* Left Section - Image */}
                    <div className="relative w-32 flex-shrink-0 h-full">
                      {getMainImage(ad) ? (
                        <Image 
                          src={getMainImage(ad)!}
                          alt={ad.title || 'Advertisement'}
                          fill
                          className="object-cover w-full h-full"
                          sizes="128px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500 text-xs">No Image</span></div>';
                            }
                          }}
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute bottom-2 left-2">
                        <Badge className={`${getStatusColor(ad.status)} flex items-center gap-1 text-xs px-2 py-1`}>
                          {getStatusIcon(ad.status)}
                          {getStatusText(ad.status)}
                        </Badge>
                      </div>
                    </div>

                    {/* Right Section - Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between h-full">
                      {/* Header with Seller Info and Colors */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs font-bold">UK</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Grand Stone Enterprise</span>
                        </div>
                        {getColorSwatches(ad) && (
                          <div className="flex gap-1">
                            {getColorSwatches(ad)}
                          </div>
                        )}
                      </div>

                      {/* Product Title */}
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                          {ad.title || ad.stone_type || `Advertisement #${ad.id}`}
                        </h3>
                        <p className="text-xs text-gray-600">Blocks</p>
                      </div>

                      {/* Specifications */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {getSizeText(ad) && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-gray-300">
                            {getSizeText(ad)}
                          </Badge>
                        )}
                        {getSurfaceText(ad) && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-gray-300">
                            {getSurfaceText(ad)}
                          </Badge>
                        )}
                      </div>

                      {/* Price and Time */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-sm font-bold text-gray-900">
                          {formatPrice(ad.price, ad.sale_unit_type) || "Price not set"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getTimeAgo(ad.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );

              return isPublished ? (
                <Link key={ad.id} href={`/ads/${ad.id}`} className="block">
                  {cardContent}
                </Link>
              ) : (
                <Link key={ad.id} href={`/create-ad?id=${ad.id}`} className="block">
                  {cardContent}
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          handlePageChange(currentPage - 1);
                        }
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {generatePaginationItems().map((item, index) => (
                    <PaginationItem key={index}>
                      {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(item as number);
                          }}
                          isActive={currentPage === item}
                          className={currentPage === item ? "bg-primary text-primary-foreground" : ""}
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          handlePageChange(currentPage + 1);
                        }
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Results Info */}
          <div className="text-center text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} ads
          </div>
        </>
      )}

      {/* Empty State */}
      {filteredAds.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {selectedFilter === "all" 
              ? "No ads found" 
              : `No ${getStatusText(selectedFilter).toLowerCase()} ads found`
            }
          </p>
        </div>
      )}
    </div>
  );
} 