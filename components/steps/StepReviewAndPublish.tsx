"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { 
  Zap, 
  Star, 
  RotateCcw, 
  MessageCircle, 
  Phone, 
  Wallet, 
  CreditCard 
} from "lucide-react";

interface StepReviewAndPublishProps {
  // Basic Info
  stoneForm?: string;
  selectedCategory?: string;
  selectedSubcategory?: string;
  
  // Size, Weight, Surface, Grade
  sizeH?: string;
  sizeW?: string;
  sizeL?: string;
  weight?: string;
  surfaceId?: string;
  grade?: string;
  
  // Price and Ports
  price?: string;
  minimumOrder?: string;
  saleUnitType?: string;
  selectedReceivingPorts?: string[];
  selectedExportPorts?: string[];
  portOptions?: { id: string; name: string }[];
  
  // Images
  images?: string[];
  
  // Options
  selectedOptions?: string[];
  
  // Origin Ports
  selectedOriginPorts?: string[];
  
  // Callbacks for features and payment data
  onFeaturesChange?: (features: {
    is_chat_enabled: boolean;
    contact_info_enabled: boolean;
    express: boolean;
    auto_renew: boolean;
  }) => void;
  
  onPaymentMethodChange?: (paymentMethod: string) => void;
}

export default function StepReviewAndPublish({
  stoneForm,
  selectedCategory,
  selectedSubcategory,
  sizeH,
  sizeW,
  sizeL,
  weight,
  surfaceId,
  grade,
  price,
  minimumOrder,
  saleUnitType,
  selectedReceivingPorts,
  selectedExportPorts,
  portOptions = [],
  images,
  selectedOptions,
  selectedOriginPorts,
  onFeaturesChange,
  onPaymentMethodChange,
}: StepReviewAndPublishProps) {
  const t = useTranslations("CreateAd");
  
  // State for features and payment method
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");

  const formatSize = () => {
    const dimensions = [sizeH, sizeW, sizeL].filter(Boolean);
    return dimensions.length > 0 ? `${dimensions.join(" × ")} cm` : t("notSpecified");
  };

  const formatPorts = (portIds?: string[]) => {
    // Handle empty or undefined portIds
    if (!portIds || portIds.length === 0) {
      return t("notSpecified");
    }
    
    // If portOptions is empty or not loaded yet, return the IDs as fallback
    if (!portOptions || portOptions.length === 0) {
      return portIds.join(", ");
    }
    
    // Map port IDs to names, fallback to ID if not found
    const portNames = portIds.map(id => {
      const port = portOptions.find(p => p.id === id);
      return port ? port.name : id;
    });
    
    return portNames.join(", ");
  };

  const formatOptions = (options?: string[]) => {
    if (!options || options.length === 0) return t("noneSelected");
    return options.join(", ");
  };

  const handleFeatureToggle = (feature: string) => {
    const newSelectedFeatures = selectedFeatures.includes(feature) 
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature];
    
    setSelectedFeatures(newSelectedFeatures);
    
    // Call the callback with the updated features
    if (onFeaturesChange) {
      onFeaturesChange({
        is_chat_enabled: newSelectedFeatures.includes("chatEnabled"),
        contact_info_enabled: newSelectedFeatures.includes("contactInfo"),
        express: newSelectedFeatures.includes("express"),
        auto_renew: newSelectedFeatures.includes("autoRenew"),
      });
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    
    // Call the callback with the selected payment method
    if (onPaymentMethodChange) {
      onPaymentMethodChange(method);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t("reviewAndPublish")}</h2>
        <p className="text-muted-foreground">{t("reviewAndPublishDetails")}</p>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">1</Badge>
              {t("basicInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("stoneForm")}
                </label>
                <p className="text-lg">{stoneForm || t("notSpecified")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("category")}
                </label>
                <p className="text-lg">{selectedCategory || t("notSpecified")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("subcategory")}
                </label>
                <p className="text-lg">{selectedSubcategory || t("notSpecified")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">2</Badge>
              {t("stoneSpecifications")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("size")}
                </label>
                <p className="text-lg">{formatSize()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("weight")}
                </label>
                <p className="text-lg">{weight ? `${weight} kg` : t("notSpecified")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("surface")}
                </label>
                <p className="text-lg">{surfaceId || t("notSpecified")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("grade")}
                </label>
                <p className="text-lg">{grade || t("notSpecified")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price and Ports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">3</Badge>
              {t("priceAndPortsDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("price")}
                </label>
                <p className="text-lg">{price ? `$${price}` : t("notSpecified")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("minimumOrder")}
                </label>
                <p className="text-lg">{minimumOrder || t("notSpecified")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("saleUnitType")}
                </label>
                <p className="text-lg">{saleUnitType || t("notSpecified")}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("receivingPorts")}
                </label>
                <p className="text-lg">
                  {selectedReceivingPorts && selectedReceivingPorts.length > 0 
                    ? formatPorts(selectedReceivingPorts)
                    : t("notSpecified")
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("exportPorts")}
                </label>
                <p className="text-lg">
                  {selectedExportPorts && selectedExportPorts.length > 0 
                    ? formatPorts(selectedExportPorts)
                    : t("notSpecified")
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">4</Badge>
              {t("images")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {images && images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t("noImagesUploaded")}</p>
            )}
          </CardContent>
        </Card>

        {/* Features and Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">5</Badge>
              {t("featuresAndPayment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("features")} (Lorem Ipsum 3 Item)</h3>
              
              {/* Large Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Express Card */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedFeatures.includes("express") 
                      ? "border-orange-500 bg-orange-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleFeatureToggle("express")}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-red-100">
                      <Zap className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">Express</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Lorem ipsum dolor sit amet, 
                      </p>
                    </div>
                  </div>
                </div>

                {/* Featured Card */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedFeatures.includes("featured") 
                      ? "border-orange-500 bg-orange-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleFeatureToggle("featured")}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Star className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">Featured</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggle Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleFeatureToggle("autoRenew")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                    selectedFeatures.includes("autoRenew")
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RotateCcw className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Auto Renew</span>
                </button>

                <button
                  onClick={() => handleFeatureToggle("chatEnabled")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                    selectedFeatures.includes("chatEnabled")
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Enable Chat</span>
                </button>

                <button
                  onClick={() => handleFeatureToggle("contactInfo")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                    selectedFeatures.includes("contactInfo")
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Contact Info</span>
                </button>
              </div>
            </div>

            <Separator />

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("paymentMethod")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Wallet Option */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === "wallet" 
                      ? "border-orange-500 bg-orange-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handlePaymentMethodChange("wallet")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-brown-100">
                        <Wallet className="w-6 h-6 text-brown-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Wallet</h4>
                        <p className="text-sm text-gray-600">Balance: $24.25</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-gray-700">
                      Add Balance
                    </Button>
                  </div>
                </div>

                {/* PayPal Option */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === "paypal" 
                      ? "border-orange-500 bg-orange-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handlePaymentMethodChange("paypal")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">PayPal</h4>
                      <p className="text-sm text-gray-600">Secure payment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div>
              <Label htmlFor="promoCode" className="text-sm font-medium">
                Promo Code:
              </Label>
              <Input
                id="promoCode"
                type="text"
                placeholder="Type Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 