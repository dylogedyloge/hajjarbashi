"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchUserAds } from "@/lib/advertisements";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
import { 
  // Calendar, 
  DollarSign, 
  // MapPin, 
  Package, 
  // Eye, 
  // Edit, 
  // Trash2,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  // XCircle
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
          limit: 50, 
          page: 1, 
          locale, 
          token 
        });
        
        setAds(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your ads");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAdsData();
  }, [isAuthenticated, token, locale]);

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

  // const formatDate = (dateString?: string) => {
  //   if (!dateString) return null;
  //   return new Date(dateString).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric'
  //   });
  // };

  const getMainImage = (ad: UserAd) => {
    if (ad.media && ad.media.length > 0) {
      const firstMedia = ad.media[0];
      return firstMedia.media_thumb_path || firstMedia.media_path;
    }
    return null;
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-6xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
        <h2 className="text-2xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("signInRequired")}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-6xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
        <h2 className="text-2xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
        <h2 className="text-2xl font-semibold">{t("title")}</h2>
        <p className="text-destructive">{t("error", { message: error })}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
          <p className="text-muted-foreground">
            {ads.length === 0 
              ? t("noAds")
              : t("subtitle", { count: ads.length })
            }
          </p>
        </div>
        {/* <Button className="bg-primary hover:bg-primary/90">
          <Package className="w-4 h-4 mr-2" />
          {t("createNewAd")}
        </Button> */}
      </div>
      
      {ads.length > 0 && (
        <div className="grid gap-6">
          {ads.map((ad) => {
            const isPublished = String(ad.status) === "1";
            
            const cardContent = (
              <Card 
                key={ad.id} 
                className={`overflow-hidden transition-shadow ${
                  isPublished 
                    ? "hover:shadow-lg cursor-pointer" 
                    : "hover:shadow-md"
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          {ad.title || ad.stone_type || `Advertisement #${ad.id}`}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {ad.is_featured && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {ad.is_express && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Express
                            </Badge>
                          )}
                          <Badge className={`${getStatusColor(ad.status)} flex items-center gap-1`}>
                            {getStatusIcon(ad.status)}
                            {getStatusText(ad.status)}
                          </Badge>
                        </div>
                      </div>
                      {ad.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ad.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Left Column - Image and Primary Info */}
                    <div className="space-y-6">
                      {/* Image */}
                      {getMainImage(ad) && (
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                          <Image 
                            src={getMainImage(ad)!.startsWith('http') 
                              ? getMainImage(ad)! 
                              : `${process.env.NEXT_PUBLIC_API_BASE_URL}/${getMainImage(ad)!}`
                            }
                            alt={ad.title || 'Advertisement'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1280px) 100vw, 50vw"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<img src="https://placehold.co/800.png?text=Hajjar+Bashi&font=poppins" alt="Placeholder" class="w-full h-full object-cover" />';
                              }
                            }}
                            unoptimized
                          />
                        </div>
                      )}

                      {/* Primary Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-sm font-medium">{t("price")}</span>
                          </div>
                          <div className="text-lg font-semibold text-green-600">
                            {formatPrice(ad.price, ad.sale_unit_type) || t("notSpecified")}
                          </div>
                        </div>

                        {ad.weight && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              <span className="text-sm font-medium">{t("weight")}</span>
                            </div>
                            <div className="text-lg font-semibold">
                              {ad.weight.toLocaleString()} kg
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Colors */}
                      {ad.colors && ad.colors.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span className="text-sm font-medium">{t("colors")}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ad.colors.map((color, index) => (
                              <Badge key={index} variant="outline" className="text-xs capitalize">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                      {/* Specifications Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ad.category && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">{t("category")}</span>
                            <div className="text-sm font-medium capitalize">{ad.category.name}</div>
                          </div>
                        )}

                        {ad.surface && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">{t("surface")}</span>
                            <div className="text-sm font-medium capitalize">
                              {typeof ad.surface === 'string' ? ad.surface : ad.surface.name}
                            </div>
                          </div>
                        )}

                        {ad.grade && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">{t("grade")}</span>
                            <div className="text-sm font-medium uppercase">{ad.grade}</div>
                          </div>
                        )}

                        {ad.form && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">{t("form")}</span>
                            <div className="text-sm font-medium capitalize">{ad.form}</div>
                          </div>
                        )}

                        {(ad.origin_country || ad.origin_city) && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">{t("origin")}</span>
                            <div className="text-sm font-medium capitalize">
                              {ad.origin_city?.name && ad.origin_country?.name 
                                ? `${ad.origin_city.name}, ${ad.origin_country.name}`
                                : ad.origin_country?.name || ad.origin_city?.name || t("notSpecified")
                              }
                            </div>
                          </div>
                        )}

                        {ad.size && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">{t("size")}</span>
                            <div className="text-sm font-medium">
                              {typeof ad.size === 'string' 
                                ? ad.size 
                                : `${ad.size.w || 0}×${ad.size.l || 0}×${ad.size.h || 0} cm`
                              }
                            </div>
                          </div>
                        )}

                        {ad.weight_range_type && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">{t("weightRange")}</span>
                            <div className="text-sm font-medium capitalize">{ad.weight_range_type}</div>
                          </div>
                        )}

                        {ad.size_range_type && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">{t("sizeRange")}</span>
                            <div className="text-sm font-medium capitalize">{ad.size_range_type}</div>
                          </div>
                        )}

                        {ad.minimum_order && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">{t("minOrder")}</span>
                            <div className="text-sm font-medium">{ad.minimum_order.toLocaleString()} kg</div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">{t("created")}</span>
                          <div className="text-sm font-medium">
                            {ad.created_at ? new Date(ad.created_at).toLocaleDateString() : t("notSpecified")}
                          </div>
                        </div>

                        {ad.views !== undefined && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">{t("views")}</span>
                            <div className="text-sm font-medium">{ad.views.toLocaleString()}</div>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      {(ad.is_chat_enabled || ad.contact_info_enabled || ad.express) && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">{t("features")}</h4>
                          <div className="flex flex-wrap gap-2">
                            {ad.is_chat_enabled && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t("chatEnabled")}
                              </Badge>
                            )}
                            {ad.contact_info_enabled && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t("contactInfo")}
                              </Badge>
                            )}
                            {ad.express && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t("express")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Ports Information */}
                      {((ad.receiving_ports_details && ad.receiving_ports_details.length > 0) || (ad.export_ports_details && ad.export_ports_details.length > 0)) && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">{t("ports")}</h4>
                          <div className="space-y-2">
                            {ad.receiving_ports_details && ad.receiving_ports_details.length > 0 && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">{t("receiving")}: </span>
                                <span className="font-medium">
                                  {ad.receiving_ports_details.map(port => `${port.name} (${port.city_name})`).join(', ')}
                                </span>
                              </div>
                            )}
                            {ad.export_ports_details && ad.export_ports_details.length > 0 && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">{t("export")}: </span>
                                <span className="font-medium">
                                  {ad.export_ports_details.map(port => `${port.name} (${port.city_name})`).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Benefits and Defects */}
                      {(ad.benefits && ad.benefits.length > 0 || ad.defects && ad.defects.length > 0) && (
                        <div className="space-y-3">
                          {ad.benefits && ad.benefits.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-green-700">{t("benefits")}</h4>
                              <div className="text-xs text-green-600 space-y-1">
                                {ad.benefits.map((benefit, index) => (
                                  <div key={index}>• {benefit}</div>
                                ))}
                              </div>
                            </div>
                          )}

                          {ad.defects && ad.defects.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-red-700">{t("defects")}</h4>
                              <div className="text-xs text-red-600 space-y-1">
                                {ad.defects.map((defect, index) => (
                                  <div key={index}>• {defect}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
      )}
    </div>
  );
} 