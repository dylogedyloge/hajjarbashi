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
import { updatePaymentReceipt, validateDiscountCode } from "@/lib/advertisements";
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
import { toast } from "sonner";

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
  
  // Feature states from parent
  featured?: boolean;
  onFeaturedChange?: (featured: boolean) => void;
  
  // Callbacks for features and payment data
  onFeaturesChange?: (features: {
    is_chat_enabled: boolean;
    contact_info_enabled: boolean;
    express: boolean;
    auto_renew: boolean;
  }) => void;
  
  onPaymentMethodChange?: (paymentMethod: string) => void;
  

  
  // Receipt management
  receiptId?: string;
  onReceiptUpdate?: (newReceiptData?: any) => void;
  
  // API credentials
  locale?: string;
  token?: string;
  
  // Ad ID for API calls
  adId?: string;
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
  featured = false,
  onFeaturedChange,
  onFeaturesChange,
  onPaymentMethodChange,
  receiptId,
  onReceiptUpdate,
  locale,
  token,
  adId,
}: StepReviewAndFeaturesProps) {
  const t = useTranslations("CreateAd");
  
  // State for features and payment method
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("paypal"); // Default to PayPal as shown in image
  const [promoCode, setPromoCode] = useState<string>("");
  const [isPromoCodeValid, setIsPromoCodeValid] = useState<boolean | null>(null);

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

  const handleFeatureToggle = async (feature: string) => {
    // Handle featured separately since it's controlled by parent
    if (feature === "featured") {
      if (onFeaturedChange) {
        const newFeatured = !featured;
        onFeaturedChange(newFeatured);
        
        // Call PATCH API to update receipt when Featured is toggled (both ON and OFF)
        if (receiptId && locale && token && adId) {
          try {
            // Determine payables based on new featured state
            const payables = [
              { type: "purchase_ad" }
            ];
            
            // Add ad_promotion only if Featured is being enabled
            if (newFeatured) {
              payables.push({ type: "ad_promotion" });
            }
            
            const patchResponse = await updatePaymentReceipt({
              id: receiptId,
              relatedAdId: adId,
              payables,
              discountCode: "", // Use empty string for type safety
              locale,
              token,
            });
            
            // After PATCH, call the parent's update function to refresh receipt data with the new response
            if (patchResponse?.data && onReceiptUpdate) {
              await onReceiptUpdate(patchResponse.data); // Pass the new receipt data to parent
            }
          } catch (error) {
            console.error('Failed to update receipt for Featured toggle:', error);
            // Revert the featured state if API call fails
            onFeaturedChange(!newFeatured);
          }
        }
      }
      return;
    }
    
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

  const handleApplyPromoCode = async () => {
    if (!promoCode) {
      toast.error("Promo code cannot be empty.");
      return;
    }

    if (!locale || !token) {
      toast.error("Missing authentication. Please try again.");
      return;
    }

    try {
      const response = await validateDiscountCode({
        discountCode: promoCode,
        locale,
        token,
      });
      
      // Check if the API call was successful AND the code is valid
      if (response.success && response.data?.valid === true) {
        setIsPromoCodeValid(true);
        toast.success("Promo code applied successfully!");
        
        // Use the discount information from the validation response to update receipt
        if (receiptId && onReceiptUpdate) {
          try {
            const payables = [{ type: "purchase_ad" }];
            if (featured) {
              payables.push({ type: "ad_promotion" });
            }
            // Add the discount type from the validation response
            if (response.data.type) {
              payables.push({ type: response.data.type });
            }
            const patchRes = await updatePaymentReceipt({
              id: receiptId,
              relatedAdId: adId || "temp-id",
              payables,
              discountCode: promoCode,
              locale,
              token,
            });
            // Update receipt with PATCH response
            if (patchRes?.data) {
              await onReceiptUpdate(patchRes.data);
            }
          } catch (error) {
            console.error('Failed to update receipt with discount:', error);
            toast.error("Failed to apply discount to receipt.");
          }
        }
      } else {
        setIsPromoCodeValid(false);
        toast.error("Invalid promo code. Please try again.");
      }
    } catch (error) {
      console.error("Failed to validate promo code:", error);
      setIsPromoCodeValid(false);
      toast.error("Failed to apply promo code. Please try again.");
    }
  };

  return (
    <div className=" space-y-8">
      
      {/* Preview Section */}
      <Card>
        
        <CardContent className="space-y-4 text-sm prose-sm">
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
                featured 
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
              <CardContent>
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
              <CardContent>
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
          </div>
          
          {/* Promo Code Input */}
          <div className="space-y-2">
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
                className={`w-32 h-8 text-sm ${
                  isPromoCodeValid === true ? "border-green-500" : 
                  isPromoCodeValid === false ? "border-red-500" : ""
                }`}
              />
              <Button
                size="sm"
                onClick={handleApplyPromoCode}
                className="h-8 px-3 text-xs cursor-pointer"
              >
                Apply
              </Button>
            </div>
            {isPromoCodeValid === true && (
              <div className="text-green-600 text-xs flex items-center gap-1">
                <span>✓</span>
                <span>Promo code applied successfully</span>
              </div>
            )}
            {isPromoCodeValid === false && (
              <div className="text-red-600 text-xs flex items-center gap-1">
                <span>✗</span>
                <span>Invalid promo code</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 