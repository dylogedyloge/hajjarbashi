"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import Image from "next/image";
import { useState } from "react";
import { 
  Zap, 
  Star, 
  RotateCcw, 
  MessageCircle, 
  Phone, 
  Wallet, 
  CreditCard,
  // Trash2,
  // ArrowLeft
} from "lucide-react";

interface StepReviewAndFeaturesProps {
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

export default function StepReviewAndFeatures({
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
  // images,
  onFeaturesChange,
  onPaymentMethodChange,
}: StepReviewAndFeaturesProps) {
  const t = useTranslations("CreateAd");
  
  // State for features and payment method
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("paypal"); // Default to PayPal as shown in image
  const [promoCode, setPromoCode] = useState<string>("");

  // const formatSize = () => {
  //   const dimensions = [sizeH, sizeW, sizeL].filter(Boolean);
  //   return dimensions.length > 0 ? `${dimensions.join(" × ")} cm` : t("notSpecified");
  // };

  const formatPorts = (portIds?: string[]) => {
    if (!portIds || portIds.length === 0) {
      return t("notSpecified");
    }
    
    if (!portOptions || portOptions.length === 0) {
      return portIds.join(", ");
    }
    
    const portNames = portIds.map(id => {
      const port = portOptions.find(p => p.id === id);
      return port ? port.name : id;
    });
    
    return portNames.join(", ");
  };

  const handleFeatureToggle = (feature: string) => {
    const newSelectedFeatures = selectedFeatures.includes(feature) 
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature];
    
    setSelectedFeatures(newSelectedFeatures);
    
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
    
    if (onPaymentMethodChange) {
      onPaymentMethodChange(method);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex gap-2">
              <span className="text-muted-foreground">Form:</span>
              <span className="font-medium">{stoneForm || t("notSpecified")}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{selectedCategory || t("notSpecified")}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">Sub-Type:</span>
              <span className="font-medium">{selectedSubcategory || t("notSpecified")}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex gap-2">
              <span className="text-muted-foreground">Surface:</span>
              <span className="font-medium">{surfaceId || t("notSpecified")}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">Height:</span>
              <span className="font-medium">{sizeH ? `${sizeH} cm` : t("notSpecified")}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">Width:</span>
              <span className="font-medium">{sizeW ? `${sizeW} cm` : t("notSpecified")}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex gap-2">
              <span className="text-muted-foreground">Length:</span>
              <span className="font-medium">{sizeL ? `${sizeL} cm` : t("notSpecified")}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium">{weight ? `${weight} kg` : t("notSpecified")}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">Grade:</span>
              <span className="font-medium">{grade || t("notSpecified")}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex gap-2">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">{price ? `$${price}` : t("notSpecified")}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">Min Order:</span>
              <span className="font-medium">{minimumOrder || t("notSpecified")}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">Sale Unit Type:</span>
              <span className="font-medium">{saleUnitType || t("notSpecified")}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* Row 4 - Spans three columns */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <span className="text-muted-foreground">Port:</span>
              <span className="font-medium">
                {selectedExportPorts && selectedExportPorts.length > 0 
                  ? formatPorts(selectedExportPorts)
                  : t("notSpecified")
                }
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">Receive Port:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {selectedReceivingPorts && selectedReceivingPorts.length > 0 
                    ? formatPorts(selectedReceivingPorts)
                    : t("notSpecified")
                  }
                </span>
                <Badge variant="secondary">+45</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <p className="text-sm text-muted-foreground">(Lorem Ipsum 3 Item)</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Express Card */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedFeatures.includes("express") 
                  ? "border-orange-500 bg-orange-50" 
                  : "hover:border-gray-300"
              }`}
              onClick={() => handleFeatureToggle("express")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-red-100">
                    <Zap className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Express</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Egestas purus viverra accumsan in nisl nisi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Card */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedFeatures.includes("featured") 
                  ? "border-orange-500 bg-orange-50" 
                  : "hover:border-gray-300"
              }`}
              onClick={() => handleFeatureToggle("featured")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-gray-100">
                    <Star className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Featured</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Egestas purus viverra accumsan in nisl nisi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Toggle Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedFeatures.includes("autoRenew") ? "default" : "outline"}
              size="sm"
              onClick={() => handleFeatureToggle("autoRenew")}
              className={selectedFeatures.includes("autoRenew") ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              <RotateCcw className="w-4 h-4 mr-2 text-yellow-600" />
              Auto Renew
            </Button>

            <Button
              variant={selectedFeatures.includes("chatEnabled") ? "default" : "outline"}
              size="sm"
              onClick={() => handleFeatureToggle("chatEnabled")}
              className={selectedFeatures.includes("chatEnabled") ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              <MessageCircle className="w-4 h-4 mr-2 text-blue-600" />
              Enable Chat
            </Button>

            <Button
              variant={selectedFeatures.includes("contactInfo") ? "default" : "outline"}
              size="sm"
              onClick={() => handleFeatureToggle("contactInfo")}
              className={selectedFeatures.includes("contactInfo") ? "bg-green-500 hover:bg-green-600" : ""}
            >
              <Phone className="w-4 h-4 mr-2 text-green-600" />
              Contact Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Section */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wallet Option */}
            <Card 
              className={`cursor-pointer transition-all ${
                paymentMethod === "wallet" 
                  ? "border-orange-500 bg-orange-50" 
                  : "hover:border-gray-300"
              }`}
              onClick={() => handlePaymentMethodChange("wallet")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-100">
                      <Wallet className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Wallet</h4>
                      <p className="text-sm text-muted-foreground">Balance: <span className="font-bold">$24.25</span></p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Add Balance
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PayPal Option */}
            <Card 
              className={`cursor-pointer transition-all ${
                paymentMethod === "paypal" 
                  ? "border-orange-500 bg-orange-50" 
                  : "hover:border-gray-300"
              }`}
              onClick={() => handlePaymentMethodChange("paypal")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">PayPal</h4>
                    <p className="text-sm text-muted-foreground">Secure payment</p>
                  </div>
                  
                </div>
                
              </CardContent>
            </Card>
                        {/* Promo Code Input */}
                        <div className="flex items-center gap-2">
              <Label htmlFor="promoCode" className="text-sm font-medium">
                Promo Code:
              </Label>
              <Input
                id="promoCode"
                type="text"
                placeholder="Type Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-32 h-8 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 