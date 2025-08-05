"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckedSvg } from "@/components/icons";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  uploadAdMedia,
  deleteAdMedia,
  getAdDetails,
  fetchSurfaces,
  fetchCategories,
  fetchPorts,
  initAdvertisement,
  updateAd,
  saveAdDraft,
  getPaymentReceipt,
  createTransaction,
  // updatePaymentReceipt,
  // getPaymentReceipts,
} from "@/lib/advertisements";
import { useState, useEffect, useRef} from "react";
import {
  arrayMove,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { z } from "zod";
import Stepper from "@/components/Stepper";
import StepFormCategorySubCategoryOfStone from "@/components/steps/StepFormCategorySubCategoryOfStone";
import StepStoneSpecifications from "@/components/steps/StepStoneSpecifications";
import StepReviewAndFeatures from "@/components/steps/StepReviewAndFeatures";
import StepImagesAndProsAndCons from "@/components/steps/StepImagesAndProsAndCons";
import StepPricingAndShipping from "@/components/steps/StepPricingAndShipping";
// import { cn } from "@/utils/cn";

// Add localStorage utilities for form persistence
const FORM_STORAGE_KEY = 'create-ad-form-data';

const saveFormToStorage = (formData: any) => {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  } catch (error) {
    console.warn('Failed to save form data to localStorage:', error);
  }
};

const loadFormFromStorage = () => {
  try {
    const stored = localStorage.getItem(FORM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load form data from localStorage:', error);
    return null;
  }
};

const clearFormStorage = () => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear form data from localStorage:', error);
  }
};

// Helper function to migrate old imageUrls structure to new one
const migrateImageUrls = (imageUrls: any[]): { url: string; mediaPath: string; mediaThumbPath: string }[] => {
  if (!Array.isArray(imageUrls)) return [];
  
  console.log('migrateImageUrls - input:', imageUrls);
  
  const migrated = imageUrls.map(img => {
    if (img.mediaThumbPath) {
      // Already in new format
      console.log('migrateImageUrls - already in new format:', img);
      return img;
    } else {
      // Old format - migrate to new format
      const migratedImg = {
        url: img.url,
        mediaPath: img.mediaPath,
        mediaThumbPath: img.mediaPath, // Use mediaPath as fallback for thumb path
      };
      console.log('migrateImageUrls - migrated from old format:', migratedImg);
      return migratedImg;
    }
  });
  
  console.log('migrateImageUrls - output:', migrated);
  return migrated;
};

type UploadedFile = { path: string; thumb_path: string };

export default function CreateAdPage() {
  const t = useTranslations("CreateAd");
  const searchParams = useSearchParams();
  const router = useRouter();
  const adId = searchParams.get("id");
  const locale = searchParams.get("lang") || "en";
  const { token } = useAuth();

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<
    { url: string; mediaPath: string; mediaThumbPath: string }[]
  >([]);

  // Add state for left panel checkboxes
  const [featured, setFeatured] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const [expressReady, setExpressReady] = useState(false); // Not in API, but keep for UI
  const [enableChat, setEnableChat] = useState(false);
  const [contactInfo, setContactInfo] = useState(false);

  // Add state for all form fields
  const [surfaceId, setSurfaceId] = useState<string>("");
  const [originCountryId, setOriginCountryId] = useState<string>("");
  const [originCityId, setOriginCityId] = useState<string>("");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [defects, setDefects] = useState<string[]>([]);
  const [saleUnitType, setSaleUnitType] = useState<string>("");
  const [formType, setFormType] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [sizeH, setSizeH] = useState<string>("");
  const [sizeW, setSizeW] = useState<string>("");
  const [sizeL, setSizeL] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [minimumOrder, setMinimumOrder] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");


  const [surfaceOptions, setSurfaceOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [surfaceLoading, setSurfaceLoading] = useState(false);
  const [surfaceError, setSurfaceError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<
    {
      id: string;
      name: string;
      colors: string[];
      origin_city_id?: string;
      origin_country_id?: string;
      origin_city_name?: string;
      origin_country_name?: string;
      children?: {
        id: string;
        name: string;
        colors: string[];
        origin_city_id?: string;
        origin_country_id?: string;
        origin_city_name?: string;
        origin_country_name?: string;
      }[];
    }[]
  >([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [portOptions, setPortOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [portLoading, setPortLoading] = useState(false);
  const [portError, setPortError] = useState<string | null>(null);
  const [selectedReceivingPorts, setSelectedReceivingPorts] = useState<
    string[]
  >([]);
  const [selectedExportPorts, setSelectedExportPorts] = useState<string[]>([]);

  // Review step features and payment state
  const [reviewFeatures, setReviewFeatures] = useState({
    is_chat_enabled: false,
    contact_info_enabled: false,
    express: false,
    auto_renew: false,
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");

  // Add state for receipt/pricing
  
  // Add state for API-based receipt data
  const [receiptData, setReceiptData] = useState<any>(null);
  const [receiptLoading, setReceiptLoading] = useState<boolean>(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  // Add state for payment success
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);

  // Pricing constants
  const BASE_PRICE = 10;

  // Validation error states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validation schemas
  const step1Schema = z.object({
    selectedForm: z.string().min(1, "Form is required"),
    selectedCategory: z.string().min(1, "Category is required"),
    selectedSubcategory: z.string().min(1, "Subcategory is required"),
  });

  const step2Schema = z.object({
    grade: z.string().min(1, "Grade is required"),
    sizeH: z.string(),
    sizeW: z.string(),
    sizeL: z.string(),
    weight: z.string(),
  }).refine((data) => {
    // Either size (all three dimensions) or weight must be filled
    const hasSize = data.sizeH && data.sizeW && data.sizeL;
    const hasWeight = data.weight;
    return hasSize || hasWeight;
  }, {
    message: "Either size (width, height, length) or weight must be filled",
    path: ["sizeH", "sizeW", "sizeL", "weight"]
  }).refine((data) => {
    // If any size field is filled, all three must be filled
    const hasAnySize = data.sizeH || data.sizeW || data.sizeL;
    const hasAllSize = data.sizeH && data.sizeW && data.sizeL;
    return !hasAnySize || hasAllSize;
  }, {
    message: "If any size field is filled, all three size fields must be filled",
    path: ["sizeH", "sizeW", "sizeL"]
  });

  const step3Schema = z.object({
    imageUrls: z.array(z.any()).min(1, "At least one image is required"),
  });

  const step4Schema = z.object({
    saleUnitType: z.string().min(1, "Sale unit type is required"),
    price: z.string().min(1, "Price is required"),
    minimumOrder: z.string().min(1, "Minimum order is required"),
    selectedReceivingPorts: z.array(z.string()).min(1, "At least one receiving port is required"),
    selectedExportPorts: z.array(z.string()).min(1, "At least one export port is required"),
  });

  const step5Schema = z.object({
    reviewFeatures: z.object({
      is_chat_enabled: z.boolean(),
      contact_info_enabled: z.boolean(),
    }),
  }).refine((data) => {
    return data.reviewFeatures.is_chat_enabled || data.reviewFeatures.contact_info_enabled;
  }, {
    message: "Either contact info or enable chat must be selected",
    path: ["reviewFeatures"]
  });
  const FEATURE_PRICE = 4;

  // Calculate total price
  const calculateTotal = () => {
    let total = BASE_PRICE;

    // Add feature costs - only Featured adds $4
    if (featured) total += FEATURE_PRICE;

    return Math.max(0, total); // Ensure total is not negative
  };

  // Add new effect to POST receipt when navigating from Step 4 to Step 5
  useEffect(() => {
    // Only run when moving from Step 4 to Step 5
    if (currentStep === 5) {
      const fetchReceipt = async () => {
        setReceiptLoading(true);
        setReceiptError(null);
        try {
          const response = await getPaymentReceipt({
            relatedAdId: adId || "temp-id",
            payables: [{ type: "purchase_ad" }],
            discountCode: "",
            locale,
            token: token || "",
          });
          setReceiptData(response.data);
        } catch (error) {
          setReceiptError(error instanceof Error ? error.message : 'Failed to fetch receipt data');
          setReceiptData(null);
        } finally {
          setReceiptLoading(false);
        }
      };
      fetchReceipt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, adId, locale, token]);

  // Discount code is now handled directly in StepReviewAndFeatures component
  // No need for separate callback function

  // Track initial form state for dirty check
  const initialFormState = useRef<any>(null);
  // Add a ref to store the last loaded adData for use in the city effect
  const lastLoadedAdData = useRef<any>(null);
  // Add a ref to track if we're loading from cache to prevent conflicts
  const isLoadingFromCache = useRef(false);

  // Define steps for the multi-step form
  const steps = [
    { id: 1, title: t("formCategorySubcategory"), description: t("selectStoneFormCategorySubcategory") },
    { id: 2, title: t("stoneSpecifications"), description: t("stoneSpecificationsDetails") },
    { id: 3, title: t("imagesAndProsCons"), description: t("uploadImagesAndProsCons") },
    { id: 4, title: t("pricingAndShipping"), description: t("pricingAndShippingDetails") },
    { id: 5, title: t("reviewAndFeatures"), description: t("reviewAndFeaturesDetails") },
  ];

  // Step navigation functions
  const validateCurrentStep = () => {
    setValidationErrors({});
    
    try {
      switch (currentStep) {
        case 1:
          step1Schema.parse({
            selectedForm,
            selectedCategory,
            selectedSubcategory,
          });
          break;
        case 2:
          step2Schema.parse({
            grade,
            sizeH,
            sizeW,
            sizeL,
            weight,
          });
          break;
        case 3:
          step3Schema.parse({
            imageUrls,
          });
          break;
        case 4:
          step4Schema.parse({
            saleUnitType,
            price,
            minimumOrder,
            selectedReceivingPorts,
            selectedExportPorts,
          });
          break;
        case 5:
          step5Schema.parse({
            reviewFeatures,
          });
          break;
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  // Clear validation errors when user starts making changes
  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step) || step < currentStep) {
      setCurrentStep(step);
      // If clicking on a step that's before the current step, remove all completed steps after it
      if (step < currentStep) {
        setCompletedSteps(completedSteps.filter(completedStep => completedStep <= step));
      }
    }
  };

  const handleNextStep = async () => {
    if (currentStep < steps.length) {
      // Validate current step before proceeding
      if (!validateCurrentStep()) {
        toast.error("Please fix the validation errors before proceeding");
        return;
      }

      const nextStep = currentStep + 1;
      
      // Save draft before moving to next step (except for the last step)
      if (currentStep < steps.length) {
        try {
          let currentAdId = adId;
          
          // If no adId, create a new ad first
          if (!currentAdId) {
            const initRes = await initAdvertisement(locale, token!);
            if (initRes?.success && initRes?.data?.id) {
              currentAdId = initRes.data.id;
              // Update the URL to include the new ad ID
              window.history.replaceState(null, '', `?id=${currentAdId}&lang=${locale}`);
            } else {
              throw new Error(initRes?.message || "Failed to initialize advertisement");
            }
          }
          
          const draftPayload = buildDraftPayload(currentStep, currentAdId!);
          if (draftPayload) {
            await saveAdDraft({
              payload: draftPayload,
              locale,
              token: token!,
            });
            console.log(`Draft saved for step ${currentStep}`);
            // Show a subtle success message for draft saving
            toast.success(t("draftSaved", { defaultValue: "Draft saved automatically" }));
          }
        } catch (error) {
          console.error('Failed to save draft:', error);
          // Don't block navigation on draft save failure
        }
      }
      
      setCurrentStep(nextStep);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    }
  };

  // Helper function to build draft payload based on current step
  const buildDraftPayload = (step: number, adId: string) => {
    if (!adId) return null;

    const basePayload = { id: adId };

    // Helper function to transform form type
    const transformForm = (form: string) => {
      if (form === 'slabs') return 'slab';
      if (form === 'blocks') return 'block';
      if (form === 'tiles') return 'tile';
      return form;
    };

    // Helper function to get effective category ID
    const getEffectiveCategoryId = () => {
      return selectedSubcategory || selectedCategory || categoryId;
    };

    // Helper function to transform grade to lowercase
    const transformGrade = (gradeValue: string) => {
      return gradeValue.toLowerCase();
    };

    switch (step) {
      case 1: // StepFormCategorySubCategoryOfStone
        const effectiveCategoryId = getEffectiveCategoryId();
        return {
          ...basePayload,
          form: transformForm(selectedForm),
          ...(effectiveCategoryId && { category_id: effectiveCategoryId }),
        };

      case 2: // StepStoneSpecifications
        const effectiveCategoryIdStep2 = getEffectiveCategoryId();
        return {
          ...basePayload,
          form: transformForm(selectedForm),
          ...(effectiveCategoryIdStep2 && { category_id: effectiveCategoryIdStep2 }),
          ...(grade && { grade: transformGrade(grade) }),
          size: {
            h: parseFloat(sizeH) || 0,
            w: parseFloat(sizeW) || 0,
            l: parseFloat(sizeL) || 0,
          },
          weight: parseFloat(weight) || 0,
          ...(surfaceId && { surface_id: surfaceId }),
        };

      case 3: // StepImagesAndProsAndCons
        const effectiveCategoryIdStep3 = getEffectiveCategoryId();
        const media = imageUrls.map((img, index) => ({
          index,
          media_path: img.mediaPath,
          media_thumb_path: img.mediaThumbPath,
        }));

        return {
          ...basePayload,
          form: transformForm(selectedForm),
          ...(effectiveCategoryIdStep3 && { category_id: effectiveCategoryIdStep3 }),
          ...(grade && { grade: transformGrade(grade) }),
          size: {
            h: parseFloat(sizeH) || 0,
            w: parseFloat(sizeW) || 0,
            l: parseFloat(sizeL) || 0,
          },
          weight: parseFloat(weight) || 0,
          ...(surfaceId && { surface_id: surfaceId }),
          media,
          benefits,
          defects,
        };

      case 4: // StepPricingAndShipping
        const effectiveCategoryIdStep4 = getEffectiveCategoryId();
        const mediaForPricing = imageUrls.map((img, index) => ({
          index,
          media_path: img.mediaPath,
          media_thumb_path: img.mediaThumbPath,
        }));

        // Debug logging for media paths
        console.log('Step 4 Draft - imageUrls:', imageUrls);
        console.log('Step 4 Draft - mediaForPricing:', mediaForPricing);

        const payload = {
          ...basePayload,
          form: transformForm(selectedForm),
          ...(effectiveCategoryIdStep4 && { category_id: effectiveCategoryIdStep4 }),
          ...(grade && { grade: transformGrade(grade) }),
          size: {
            h: parseFloat(sizeH) || 0,
            w: parseFloat(sizeW) || 0,
            l: parseFloat(sizeL) || 0,
          },
          weight: parseFloat(weight) || 0,
          ...(surfaceId && { surface_id: surfaceId }),
          media: mediaForPricing,
          benefits,
          defects,
          sale_unit_type: saleUnitType,
          price: parseFloat(price) || 0,
          minimum_order: parseFloat(minimumOrder) || 0,
          description,
          receiving_ports: selectedReceivingPorts,
          export_ports: selectedExportPorts,
          colors: selectedColors,
          ...(originCountryId && originCountryId.trim() !== '' && { origin_country_id: originCountryId }),
          ...(originCityId && originCityId.trim() !== '' && { origin_city_id: originCityId }),
          is_chat_enabled: reviewFeatures.is_chat_enabled,
          contact_info_enabled: reviewFeatures.contact_info_enabled,
          express: reviewFeatures.express,
          auto_renew: reviewFeatures.auto_renew,
        };

        console.log('Step 4 Draft - Final payload:', payload);
        return payload;

      default:
        return null;
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      // Remove current step from completed steps when going back
      setCompletedSteps(completedSteps.filter(step => step !== currentStep));
    }
  };

  // Load cached form data on mount (only if not editing an existing ad)
  useEffect(() => {
    if (!adId) {
      const cachedData = loadFormFromStorage();
      if (cachedData) {
        isLoadingFromCache.current = true;
        console.log('Loading cached form data:', cachedData);

        // Restore form state from cache
        if (cachedData.selectedForm) setSelectedForm(cachedData.selectedForm);
        if (cachedData.selectedCategory) setSelectedCategory(cachedData.selectedCategory);
        if (cachedData.selectedSubcategory) setSelectedSubcategory(cachedData.selectedSubcategory);
        if (cachedData.imageUrls) setImageUrls(migrateImageUrls(cachedData.imageUrls));
        if (cachedData.featured !== undefined) setFeatured(cachedData.featured);
        if (cachedData.autoRenew !== undefined) setAutoRenew(cachedData.autoRenew);
        if (cachedData.expressReady !== undefined) setExpressReady(cachedData.expressReady);
        if (cachedData.enableChat !== undefined) setEnableChat(cachedData.enableChat);
        if (cachedData.contactInfo !== undefined) setContactInfo(cachedData.contactInfo);
        if (cachedData.surfaceId) setSurfaceId(cachedData.surfaceId);
        if (cachedData.originCountryId) setOriginCountryId(cachedData.originCountryId);
        if (cachedData.originCityId) setOriginCityId(cachedData.originCityId);
        if (cachedData.benefits) {
          // Handle both old string format and new array format
          if (Array.isArray(cachedData.benefits)) {
            setBenefits(cachedData.benefits);
          } else if (typeof cachedData.benefits === 'string') {
            setBenefits(cachedData.benefits.split(',').map((b: string) => b.trim()).filter(Boolean));
          }
        }
        if (cachedData.defects) {
          // Handle both old string format and new array format
          if (Array.isArray(cachedData.defects)) {
            setDefects(cachedData.defects);
          } else if (typeof cachedData.defects === 'string') {
            setDefects(cachedData.defects.split(',').map((d: string) => d.trim()).filter(Boolean));
          }
        }
        if (cachedData.saleUnitType) setSaleUnitType(cachedData.saleUnitType);
        if (cachedData.formType) setFormType(cachedData.formType);
        if (cachedData.grade) setGrade(cachedData.grade);
        if (cachedData.sizeH) setSizeH(cachedData.sizeH);
        if (cachedData.sizeW) setSizeW(cachedData.sizeW);
        if (cachedData.sizeL) setSizeL(cachedData.sizeL);
        if (cachedData.weight) setWeight(cachedData.weight);
        if (cachedData.minimumOrder) setMinimumOrder(cachedData.minimumOrder);
        if (cachedData.categoryId) setCategoryId(cachedData.categoryId);
        if (cachedData.price) setPrice(cachedData.price);
        if (cachedData.description) setDescription(cachedData.description);
        if (cachedData.selectedColors) setSelectedColors(cachedData.selectedColors);
        if (cachedData.selectedReceivingPorts) setSelectedReceivingPorts(cachedData.selectedReceivingPorts);
        if (cachedData.selectedExportPorts) setSelectedExportPorts(cachedData.selectedExportPorts);
        if (cachedData.reviewFeatures) setReviewFeatures(cachedData.reviewFeatures);
        if (cachedData.selectedPaymentMethod) setSelectedPaymentMethod(cachedData.selectedPaymentMethod);

        isLoadingFromCache.current = false;
      }
    }
  }, [adId]);

  // Handle invalid adId - treat as new ad creation
  const [isValidAdId, setIsValidAdId] = useState<boolean | null>(null);

  useEffect(() => {
    if (!adId) {
      setIsValidAdId(false);
      return;
    }

    const validateAdId = async () => {
      try {
        const res = await getAdDetails({
          id: adId,
          locale,
          token: token || undefined,
        });

        if (res?.success && res?.data) {
          setIsValidAdId(true);
          // This is a valid ad, proceed with normal loading
        } else {
          setIsValidAdId(false);
          // Invalid adId, treat as new ad creation
          console.log('Invalid adId, treating as new ad creation');

          // Load cached data if available
          const cachedData = loadFormFromStorage();
          if (cachedData) {
            isLoadingFromCache.current = true;
            console.log('Loading cached form data for invalid adId:', cachedData);

            // Restore form state from cache
            if (cachedData.selectedForm) setSelectedForm(cachedData.selectedForm);
            if (cachedData.selectedCategory) setSelectedCategory(cachedData.selectedCategory);
            if (cachedData.selectedSubcategory) setSelectedSubcategory(cachedData.selectedSubcategory);
            if (cachedData.imageUrls) setImageUrls(migrateImageUrls(cachedData.imageUrls));
            if (cachedData.featured !== undefined) setFeatured(cachedData.featured);
            if (cachedData.autoRenew !== undefined) setAutoRenew(cachedData.autoRenew);
            if (cachedData.expressReady !== undefined) setExpressReady(cachedData.expressReady);
            if (cachedData.enableChat !== undefined) setEnableChat(cachedData.enableChat);
            if (cachedData.contactInfo !== undefined) setContactInfo(cachedData.contactInfo);
            if (cachedData.surfaceId) setSurfaceId(cachedData.surfaceId);
            if (cachedData.originCountryId) setOriginCountryId(cachedData.originCountryId);
            if (cachedData.originCityId) setOriginCityId(cachedData.originCityId);
            if (cachedData.benefits) {
              // Handle both old string format and new array format
              if (Array.isArray(cachedData.benefits)) {
                setBenefits(cachedData.benefits);
              } else if (typeof cachedData.benefits === 'string') {
                setBenefits(cachedData.benefits.split(',').map((b: string) => b.trim()).filter(Boolean));
              }
            }
            if (cachedData.defects) {
              // Handle both old string format and new array format
              if (Array.isArray(cachedData.defects)) {
                setDefects(cachedData.defects);
              } else if (typeof cachedData.defects === 'string') {
                setDefects(cachedData.defects.split(',').map((d: string) => d.trim()).filter(Boolean));
              }
            }
            if (cachedData.saleUnitType) setSaleUnitType(cachedData.saleUnitType);
            if (cachedData.formType) setFormType(cachedData.formType);
            if (cachedData.grade) setGrade(cachedData.grade);
            if (cachedData.sizeH) setSizeH(cachedData.sizeH);
            if (cachedData.sizeW) setSizeW(cachedData.sizeW);
            if (cachedData.sizeL) setSizeL(cachedData.sizeL);
            if (cachedData.weight) setWeight(cachedData.weight);
            if (cachedData.minimumOrder) setMinimumOrder(cachedData.minimumOrder);
            if (cachedData.categoryId) setCategoryId(cachedData.categoryId);
            if (cachedData.price) setPrice(cachedData.price);
            if (cachedData.description) setDescription(cachedData.description);
            if (cachedData.selectedColors) setSelectedColors(cachedData.selectedColors);
            if (cachedData.selectedReceivingPorts) setSelectedReceivingPorts(cachedData.selectedReceivingPorts);
            if (cachedData.selectedExportPorts) setSelectedExportPorts(cachedData.selectedExportPorts);
            if (cachedData.reviewFeatures) setReviewFeatures(cachedData.reviewFeatures);
            if (cachedData.selectedPaymentMethod) setSelectedPaymentMethod(cachedData.selectedPaymentMethod);

            isLoadingFromCache.current = false;
          }
        }
      } catch (error) {
        console.log('AdId validation failed, treating as new ad creation:', error);
        setIsValidAdId(false);

        // Load cached data if available
        const cachedData = loadFormFromStorage();
        if (cachedData) {
          isLoadingFromCache.current = true;
          console.log('Loading cached form data for failed adId:', cachedData);

          // Restore form state from cache
          if (cachedData.selectedForm) setSelectedForm(cachedData.selectedForm);
          if (cachedData.selectedCategory) setSelectedCategory(cachedData.selectedCategory);
          if (cachedData.imageUrls) setImageUrls(migrateImageUrls(cachedData.imageUrls));
          if (cachedData.featured !== undefined) setFeatured(cachedData.featured);
          if (cachedData.autoRenew !== undefined) setAutoRenew(cachedData.autoRenew);
          if (cachedData.expressReady !== undefined) setExpressReady(cachedData.expressReady);
          if (cachedData.enableChat !== undefined) setEnableChat(cachedData.enableChat);
          if (cachedData.contactInfo !== undefined) setContactInfo(cachedData.contactInfo);
          if (cachedData.surfaceId) setSurfaceId(cachedData.surfaceId);
          if (cachedData.originCountryId) setOriginCountryId(cachedData.originCountryId);
          if (cachedData.originCityId) setOriginCityId(cachedData.originCityId);
          if (cachedData.benefits) {
            // Handle both old string format and new array format
            if (Array.isArray(cachedData.benefits)) {
              setBenefits(cachedData.benefits);
            } else if (typeof cachedData.benefits === 'string') {
              setBenefits(cachedData.benefits.split(',').map((b: string) => b.trim()).filter(Boolean));
            }
          }
          if (cachedData.defects) {
            // Handle both old string format and new array format
            if (Array.isArray(cachedData.defects)) {
              setDefects(cachedData.defects);
            } else if (typeof cachedData.defects === 'string') {
              setDefects(cachedData.defects.split(',').map((d: string) => d.trim()).filter(Boolean));
            }
          }
          if (cachedData.saleUnitType) setSaleUnitType(cachedData.saleUnitType);
          if (cachedData.formType) setFormType(cachedData.formType);
          if (cachedData.grade) setGrade(cachedData.grade);
          if (cachedData.sizeH) setSizeH(cachedData.sizeH);
          if (cachedData.sizeW) setSizeW(cachedData.sizeW);
          if (cachedData.sizeL) setSizeL(cachedData.sizeL);
          if (cachedData.weight) setWeight(cachedData.weight);
          if (cachedData.minimumOrder) setMinimumOrder(cachedData.minimumOrder);
          if (cachedData.categoryId) setCategoryId(cachedData.categoryId);
          if (cachedData.price) setPrice(cachedData.price);
          if (cachedData.description) setDescription(cachedData.description);
          if (cachedData.selectedColors) setSelectedColors(cachedData.selectedColors);
          if (cachedData.selectedReceivingPorts) setSelectedReceivingPorts(cachedData.selectedReceivingPorts);
          if (cachedData.selectedExportPorts) setSelectedExportPorts(cachedData.selectedExportPorts);
          if (cachedData.reviewFeatures) setReviewFeatures(cachedData.reviewFeatures);
          if (cachedData.selectedPaymentMethod) setSelectedPaymentMethod(cachedData.selectedPaymentMethod);

          isLoadingFromCache.current = false;
        }
      }
    };

    validateAdId();
  }, [adId, token, locale]);

  // Save form data to localStorage whenever it changes (debounced)
  useEffect(() => {
    if (adId || isLoadingFromCache.current) return; // Don't save when editing existing ad or loading from cache

    const timeoutId = setTimeout(() => {
      const formData = getFormState();
      saveFormToStorage(formData);
    }, 500); // Debounce saves to avoid excessive localStorage writes

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedForm, selectedCategory, selectedSubcategory, imageUrls, featured, autoRenew, expressReady, enableChat, contactInfo,
    surfaceId, originCountryId, originCityId, benefits, defects, saleUnitType,
    formType, grade, sizeH, sizeW, sizeL, weight, minimumOrder, categoryId,
    price, description, selectedColors, selectedReceivingPorts, selectedExportPorts, reviewFeatures, selectedPaymentMethod
  ]);

  // Clear storage when form is successfully submitted
  const clearFormCache = () => {
    clearFormStorage();
  };

  useEffect(() => {
    if (!adId || isValidAdId === false) return; // Don't load if no adId or if adId is invalid
    (async () => {
      try {
        const res = await getAdDetails({
          id: adId!,
          locale,
          token: token || undefined,
        });

        if (res?.success && res?.data) {
          const adData = res.data;
          lastLoadedAdData.current = adData;

          console.log('Loading ad data:', adData);
          console.log('Setting originCountryId to:', adData.origin_country?.id);
          console.log('Setting originCityId to:', adData.origin_city?.id);

          // Set images
          if (adData.uploaded_files) {
            setImageUrls(
              adData.uploaded_files.map((file: UploadedFile) => ({
                url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/${file.thumb_path}`,
                mediaPath: file.path,
                mediaThumbPath: file.thumb_path,
              }))
            );
          }

          // Set form fields
          if (adData.sale_unit_type) setSaleUnitType(adData.sale_unit_type);
          if (adData.form) setFormType(adData.form);
          if (adData.grade) setGrade(adData.grade);
          if (adData.size) {
            if (typeof adData.size === 'object') {
              setSizeH(adData.size.h?.toString() || '');
              setSizeW(adData.size.w?.toString() || '');
              setSizeL(adData.size.l?.toString() || '');
            }
          }
          if (adData.weight) setWeight(adData.weight.toString());
          if (adData.minimum_order) setMinimumOrder(adData.minimum_order.toString());
          // --- FIXED: Use nested object IDs if present ---
          if (adData.category?.id) setCategoryId(adData.category.id);
          if (adData.surface?.id) setSurfaceId(adData.surface.id);
          if (adData.origin_country?.id) setOriginCountryId(adData.origin_country.id);
          if (adData.origin_city?.id) setOriginCityId(adData.origin_city.id);
          if (adData.receiving_ports_details)
            setSelectedReceivingPorts(adData.receiving_ports_details.map((p: any) => p.id));
          if (adData.export_ports_details)
            setSelectedExportPorts(adData.export_ports_details.map((p: any) => p.id));
          // --- END FIX ---
          if (adData.price) setPrice(adData.price.toString());
          if (adData.description) setDescription(adData.description);
          if (adData.colors) setSelectedColors(adData.colors);
          if (adData.benefits) setBenefits(adData.benefits);
          if (adData.defects) setDefects(adData.defects);


          // Set checkboxes
          if (adData.is_chat_enabled !== undefined) setEnableChat(adData.is_chat_enabled);
          if (adData.contact_info_enabled !== undefined) setContactInfo(adData.contact_info_enabled);
          if (adData.express !== undefined) setExpressReady(adData.express);
          if (adData.auto_renew !== undefined) setAutoRenew(adData.auto_renew);
          if (adData.is_featured !== undefined) setFeatured(adData.is_featured);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [adId, token, locale, isValidAdId]);



  // Fetch surfaces on mount
  useEffect(() => {
    setSurfaceLoading(true);
    setSurfaceError(null);
    fetchSurfaces(locale)
      .then((data) => setSurfaceOptions(data))
      .catch((err) => setSurfaceError(err.message || "Failed to load surfaces"))
      .finally(() => setSurfaceLoading(false));
  }, [locale]);


  // Update selectedColors and origin data when categoryId changes
  useEffect(() => {
    // Use the same logic as the payload to determine which category ID to use
    const effectiveCategoryId = selectedSubcategory || selectedCategory || categoryId;

    console.log('useEffect triggered - effectiveCategoryId:', effectiveCategoryId);
    console.log('useEffect triggered - selectedSubcategory:', selectedSubcategory);
    console.log('useEffect triggered - selectedCategory:', selectedCategory);
    console.log('useEffect triggered - categoryId:', categoryId);
    console.log('useEffect triggered - categoryOptions length:', categoryOptions.length);

    const cat = categoryOptions.find((c) => c.id === effectiveCategoryId);
    console.log('Found category:', cat);

    if (cat) {
      console.log('Category found:', cat);
      console.log('Category colors:', cat.colors);
      // Automatically set selectedColors to the category's colors
      setSelectedColors(cat.colors || []);
      console.log('Setting selectedColors to:', cat.colors || []);

      // Set origin city and country from category data
      if (cat.origin_city_id) {
        setOriginCityId(cat.origin_city_id);
      }
      if (cat.origin_country_id) {
        setOriginCountryId(cat.origin_country_id);
      }
    } else {
      console.log('No category found for effectiveCategoryId:', effectiveCategoryId);
    }
  }, [selectedSubcategory, selectedCategory, categoryId, categoryOptions]);

  // Monitor selectedColors changes
  useEffect(() => {
    console.log('selectedColors changed:', selectedColors);
  }, [selectedColors]);

  // Fetch ports on mount
  useEffect(() => {
    setPortLoading(true);
    setPortError(null);
    fetchPorts(locale)
      .then((data) => setPortOptions(data))
      .catch((err) => setPortError(err.message || "Failed to load ports"))
      .finally(() => setPortLoading(false));
  }, [locale]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories(locale)
      .then((data: any) => setCategoryOptions(data))
      .catch((err: any) => console.error("Failed to load categories:", err));
  }, [locale]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adId || !token) return;
    if (imageUrls.length >= 6) {
      setUploadError(t("maxImages", { count: 6 }));
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadAdMedia({ id: adId, file, locale, token });
      if (
        res?.success &&
        res?.data?.media_thumb_path &&
        res?.data?.media_path
      ) {
        console.log('handleFileChange - API response:', res.data);
        setImageUrls((prev) => {
          // Prevent duplicate images
          if (prev.some((img) => img.mediaPath === res.data.media_path))
            return prev;
          
          const newImage = {
            url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/${res.data.media_thumb_path}`,
            mediaPath: res.data.media_path,
            mediaThumbPath: res.data.media_thumb_path,
          };
          console.log('handleFileChange - adding new image:', newImage);
          return [...prev, newImage];
        });
        toast.success(t("uploadSuccess"));
      } else {
        setUploadError(res?.message || "Upload failed");
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (mediaPath: string) => {
    if (!adId || !token) return;
    try {
      await deleteAdMedia({ id: adId, mediaPath, locale, token });
      setImageUrls((prev) => prev.filter((img) => img.mediaPath !== mediaPath));
      toast.success(t("deleteSuccess"));
    } catch (err: unknown) {
      toast.error(t("deleteError"));
      console.error(err);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = imageUrls.findIndex(
        (img) => img.mediaPath === active.id
      );
      const newIndex = imageUrls.findIndex((img) => img.mediaPath === over.id);
      setImageUrls((imgs) => arrayMove(imgs, oldIndex, newIndex));
    }
  };

  // Review step callbacks
  const handleReviewFeaturesChange = (features: {
    is_chat_enabled: boolean;
    contact_info_enabled: boolean;
    express: boolean;
    auto_renew: boolean;
  }) => {
    setReviewFeatures(features);
  };

  const handlePaymentMethodChange = (paymentMethod: string) => {
    setSelectedPaymentMethod(paymentMethod);
  };

  // Helper to get current form state
  const getFormState = () => ({
    selectedForm,
    selectedCategory,
    selectedSubcategory,
    imageUrls,
    featured,
    autoRenew,
    expressReady,
    enableChat,
    contactInfo,
    surfaceId,
    originCountryId,
    originCityId,
    benefits,
    defects,
    saleUnitType,
    formType,
    grade,
    sizeH,
    sizeW,
    sizeL,
    weight,
    minimumOrder,
    categoryId,
    price,
    description,
    selectedColors,
    selectedReceivingPorts,
    selectedExportPorts,
    reviewFeatures,
    selectedPaymentMethod,
  });


  // Set initial form state after loading ad data
  useEffect(() => {
    if (
      (adId && imageUrls) ||
      (!adId && !initialFormState.current)
    ) {
      initialFormState.current = getFormState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adId, selectedForm, selectedCategory, selectedSubcategory, imageUrls, featured, autoRenew, expressReady, enableChat, contactInfo, surfaceId, originCountryId, originCityId, benefits, defects, saleUnitType, formType, grade, sizeH, sizeW, sizeL, weight, minimumOrder, categoryId, price, description, selectedColors, selectedReceivingPorts, selectedExportPorts, reviewFeatures, selectedPaymentMethod]);

  // Unified submit handler for both actions
  const handleSubmit = async (statusValue: string) => {
    // Transform values to match API expectations
    const transformSaleUnitType = (value: string) => {
      // The values are already correct (weight, volume), just return as is
      return value || 'weight'; // Default to weight if empty
    };

    const transformForm = (value: string) => {
      switch (value) {
        case 'slabs':
          return 'slab';
        case 'blocks':
          return 'block';
        case 'tiles':
          return 'tile';
        default:
          return value;
      }
    };

    const transformGrade = (value: string) => {
      return value.toLowerCase();
    };

    // const transformStatus = (value: string) => {
    //   switch (value) {
    //     case 'draft':
    //       return 3;
    //     case 'published':
    //       return 1;
    //     case 'pending':
    //       return 2;
    //     default:
    //       // If it's already a number, return it as number
    //       const numValue = Number(value);
    //       return isNaN(numValue) ? 3 : numValue; // Default to draft (3) if invalid
    //   }
    // };

    try {
      let currentAdId = adId;

      // If no adId, create a new ad first
      if (!currentAdId) {
        const initRes = await initAdvertisement(locale, token!);
        if (initRes?.success && initRes?.data?.id) {
          currentAdId = initRes.data.id;
          // Update the URL to include the new ad ID
          window.history.replaceState(null, '', `?id=${currentAdId}&lang=${locale}`);
        } else {
          throw new Error(initRes?.message || "Failed to initialize advertisement");
        }
      }

      // Create payload with validation to avoid sending empty required fields
      const updateAdPayload: any = {
        id: currentAdId!,
        sale_unit_type: transformSaleUnitType(saleUnitType),
        form: transformForm(selectedForm),
        grade: transformGrade(grade),
        size: {
          h: Number(sizeH),
          w: Number(sizeW),
          l: Number(sizeL),
        },
        weight: Number(weight),
        description,
        is_chat_enabled: reviewFeatures.is_chat_enabled,
        contact_info_enabled: reviewFeatures.contact_info_enabled,
        express: reviewFeatures.express,
        minimum_order: Number(minimumOrder),
        category_id: selectedSubcategory || selectedCategory || categoryId,
        price: Number(price),
        auto_renew: reviewFeatures.auto_renew,
        media: imageUrls.map((img, idx) => {
          return {
            index: idx,
            media_path: img.mediaPath,
            media_thumb_path: img.mediaThumbPath,
          };
        }),
        benefits: benefits,
        defects: defects,
      };

      // Only add fields if they have values
      console.log('selectedColors during payload construction:', selectedColors);
      console.log('selectedColors.length:', selectedColors.length);
      if (selectedColors.length > 0) {
        updateAdPayload.colors = selectedColors;
        console.log('Added colors to payload:', selectedColors);
      } else {
        console.log('No colors added to payload - selectedColors is empty');
      }
      if (selectedReceivingPorts.length > 0) {
        updateAdPayload.receiving_ports = selectedReceivingPorts;
      }
      if (selectedExportPorts.length > 0) {
        updateAdPayload.export_ports = selectedExportPorts;
      }
      if (surfaceId) {
        updateAdPayload.surface_id = surfaceId;
      }

      // Log the payload for debugging
      console.log('updateAdPayload being sent to API:', JSON.stringify(updateAdPayload, null, 2));

      // Update the ad first
      const res = await updateAd({
        payload: updateAdPayload,
        locale,
        token: token!,
      });
      
      if (res?.success) {
        // If this is a "Pay & Publish" action (not a draft), proceed with payment
        if (statusValue !== "3" && receiptData?.id) {
          setPaymentLoading(true);
          try {
            // Create transaction
            const transactionRes = await createTransaction({
              receiptId: receiptData.id,
              paymentMethod: selectedPaymentMethod || "wallet", // Default to wallet if not selected
              currency: "usd", // Default to USD
              locale,
              token: token!,
            });

            if (transactionRes?.success) {
              setPaymentSuccess(true);
              toast.success(t("paymentSuccess", { defaultValue: "Payment successful! Ad published successfully!" }));
              // Clear form cache on successful payment
              clearFormCache();
            } else {
              toast.error(
                transactionRes?.message ||
                t("paymentError", { defaultValue: "Payment failed." })
              );
            }
          } catch (paymentErr: unknown) {
            console.error('Payment Error Details:', paymentErr);
            const paymentMessage =
              paymentErr instanceof Error
                ? paymentErr.message
                : t("paymentError", { defaultValue: "Payment failed." });
            toast.error(paymentMessage);
          } finally {
            setPaymentLoading(false);
          }
        } else {
          // This is a draft save
          toast.success(
            t("adUpdateSuccess", { defaultValue: "Ad updated successfully!" })
          );
          if (statusValue === "3") {
            toast.success(t("draftSaved", { defaultValue: "Draft saved!" }));
            // Update initial state to current after saving draft
            initialFormState.current = getFormState();
          }
          // Clear form cache on successful submission
          clearFormCache();
        }
      } else {
        console.error('API Error Response:', res);
        toast.error(
          res?.message ||
          t("adUpdateError", { defaultValue: "Failed to update ad." })
        );
      }
    } catch (err: unknown) {
      console.error('API Error Details:', err);
      const message =
        err instanceof Error
          ? err.message
          : t("adUpdateError", { defaultValue: "Failed to update ad." });
      toast.error(message);
    }
  };

  // Handle discard button click
  const handleDiscard = () => {
    // Clear all form data
    setSelectedForm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setImageUrls([]);
    setFeatured(true);
    setAutoRenew(false);
    setExpressReady(false);
    setEnableChat(false);
    setContactInfo(false);
    setSurfaceId("");
    setOriginCountryId("");
    setOriginCityId("");
    setBenefits([]);
    setDefects([]);
    setSaleUnitType("");
    setFormType("");
    setGrade("");
    setSizeH("");
    setSizeW("");
    setSizeL("");
    setWeight("");
    setMinimumOrder("");
    setCategoryId("");
    setPrice("");
    setDescription("");
    setSelectedColors([]);
    setSelectedReceivingPorts([]);
    setSelectedExportPorts([]);

    // Clear form cache
    clearFormCache();

    toast.success(t("formCleared", { defaultValue: "Form cleared!" }));
  };

  // Update the onReceiptUpdate callback to accept an optional receipt object
  const handleReceiptUpdate = (newReceiptData?: any) => {
    if (newReceiptData) {
      setReceiptData(newReceiptData);
    }
    // Do not POST or re-fetch receipt here after PATCH; only update if newReceiptData is provided.
  };

  return (
    <div className="flex gap-8 px-4 py-12">
      {/* Stepper Panel */}
      {!paymentSuccess && (
        <Card className="w-80 flex-shrink-0 p-6">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
        />

        {/* Receipt Section - Only show on review step */}
        {currentStep === 5 && (
          <Card className="mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Payment Receipt
                {receiptLoading && (
                  <div className="ml-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {receiptError ? (
                <div className="text-sm text-red-600">
                  Error loading receipt: {receiptError}
                </div>
              ) : receiptData ? (
                <>
                  {/* Individual Payables */}
                  {receiptData.payables?.map((payable: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {payable.type === "purchase_ad" ? "Base Publishing Fee" : 
                         payable.type === "ad_promotion" ? "Featured" : payable.type}
                      </span>
                      <span className="text-sm font-medium">
                        ${payable.amount?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  ))}

                  {/* Discount */}
                  {receiptData.total_discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600">Discount Code</span>
                      <span className="text-sm font-medium text-green-600">
                        -${receiptData.total_discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Divider */}
                  <Separator className="my-2" />
                  
                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-md">Total</span>
                    <span className="font-semibold text-md">
                      ${receiptData.total_payable_amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </>
              ) : (
                // Fallback to frontend calculation if API data is not available
                <>
                  {/* Base Price */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Base Publishing Fee</span>
                    <span className="text-sm font-medium">$10.00</span>
                  </div>

                  {/* Features */}
                  {featured && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Featured</span>
                      <span className="text-sm font-medium">+$4.00</span>
                    </div>
                  )}



                  {/* Divider */}
                  <Separator className="my-2" />
                  
                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-md">Total</span>
                    <span className="font-semibold text-md">${calculateTotal().toFixed(2)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </Card>
      )}

      {/* Main Form Panel */}
      <div className="flex-1">
        <Card className="p-8 flex flex-col gap-8">
          {/* Payment Success Card */}
          {paymentSuccess && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckedSvg className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Payment Successful!
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Your advertisement has been published successfully. You can view it in your dashboard.
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={() => {
                      setPaymentSuccess(false);
                      // Reset form and go to step 1
                      setCurrentStep(1);
                      clearFormCache();
                    }}
                    variant="default"
                  >
                    Create Another Ad
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setPaymentSuccess(false);
                      // Navigate to view your ads using Next.js router
                      router.push('/profile/view-your-ads');
                    }}
                  >
                    See Your Ads
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Form, Category and Subcategory of Stone */}
          {currentStep === 1 && !paymentSuccess && (
            <div className="space-y-8">
              {/* Step Header */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {steps[0].title}
                </h1>
                <p className="text-gray-600">
                  {steps[0].description}
                </p>
              </div>

              <StepFormCategorySubCategoryOfStone
                selectedForm={selectedForm}
                setSelectedForm={setSelectedForm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
                t={t}
                locale={locale}
                errors={validationErrors}
              />
            </div>
          )}

          {/* Step 2: Stone Specifications */}
          {currentStep === 2 && !paymentSuccess && (
            <div className="space-y-8">
              {/* Step Header */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {steps[1].title}
                </h1>
                <p className="text-gray-600">
                  {steps[1].description}
                </p>
              </div>

              <StepStoneSpecifications
                sizeH={sizeH}
                setSizeH={setSizeH}
                sizeW={sizeW}
                setSizeW={setSizeW}
                sizeL={sizeL}
                setSizeL={setSizeL}
                weight={weight}
                setWeight={setWeight}
                surfaceId={surfaceId}
                setSurfaceId={setSurfaceId}
                grade={grade}
                setGrade={setGrade}
                surfaceOptions={surfaceOptions}
                surfaceLoading={surfaceLoading}
                surfaceError={surfaceError}
                t={t}
                errors={validationErrors}
              />
            </div>
          )}

          {/* Step 3: Images and Pros/Cons */}
          {currentStep === 3 && !paymentSuccess && (
            <div className="space-y-8">
              {/* Step Header */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {steps[2].title}
                </h1>
                <p className="text-gray-600">
                  {steps[2].description}
                </p>
              </div>

              <StepImagesAndProsAndCons
                imageUrls={imageUrls}
                uploading={uploading}
                uploadError={uploadError}
                onFileChange={handleFileChange}
                onDeleteImage={handleDeleteImage}
                onDragEnd={handleDragEnd}
                benefits={benefits}
                setBenefits={setBenefits}
                defects={defects}
                setDefects={setDefects}
                t={t}
                errors={validationErrors}
              />
            </div>
          )}

          {/* Step 4: Pricing and Shipping */}
          {currentStep === 4 && !paymentSuccess && (
            <div className="space-y-8">
              {/* Step Header */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {steps[3].title}
                </h1>
                <p className="text-gray-600">
                  {steps[3].description}
                </p>
              </div>

              <StepPricingAndShipping
                price={price}
                setPrice={setPrice}
                minimumOrder={minimumOrder}
                setMinimumOrder={setMinimumOrder}
                saleUnitType={saleUnitType}
                setSaleUnitType={setSaleUnitType}
                description={description}
                setDescription={setDescription}
                selectedReceivingPorts={selectedReceivingPorts}
                setSelectedReceivingPorts={setSelectedReceivingPorts}
                selectedExportPorts={selectedExportPorts}
                setSelectedExportPorts={setSelectedExportPorts}
                portOptions={portOptions}
                portLoading={portLoading}
                portError={portError}
                sizeH={sizeH}
                sizeW={sizeW}
                sizeL={sizeL}
                weight={weight}
                t={t}
                errors={validationErrors}
              />
            </div>
          )}

          {/* Step 5: Review and Features */}
          {currentStep === 5 && !paymentSuccess && (
            <div className="space-y-8">
              {/* Step Header */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {steps[4].title}
                </h1>
                <p className="text-gray-600">
                  {steps[4].description}
                </p>
              </div>

              <StepReviewAndFeatures
                stoneForm={selectedForm}
                selectedCategory={categoryOptions.find(cat => cat.id === selectedCategory)?.name || selectedCategory}
                selectedSubcategory={(() => {
                  // Find the parent category that contains this subcategory
                  const parentCategory = categoryOptions.find(cat =>
                    cat.children?.some(child => child.id === selectedSubcategory)
                  );
                  // Find the subcategory within the parent
                  const subcategory = parentCategory?.children?.find(child => child.id === selectedSubcategory);
                  return subcategory?.name || selectedSubcategory;
                })()}
                sizeH={sizeH}
                sizeW={sizeW}
                sizeL={sizeL}
                weight={weight}
                surfaceId={surfaceOptions.find(surface => surface.id === surfaceId)?.name || surfaceId}
                grade={grade}
                price={price}
                minimumOrder={minimumOrder}
                saleUnitType={saleUnitType}
                selectedReceivingPorts={selectedReceivingPorts}
                selectedExportPorts={selectedExportPorts}
                portOptions={portOptions}
                images={imageUrls.map(img => img.url)}
                selectedOptions={[]} // This will be populated when options step is implemented
                selectedOriginPorts={[]} // This will be populated when origin ports step is implemented
                featured={featured}
                onFeaturedChange={setFeatured}
                onFeaturesChange={handleReviewFeaturesChange}
                onPaymentMethodChange={handlePaymentMethodChange}

                receiptId={receiptData?.id}
                onReceiptUpdate={handleReceiptUpdate}
                locale={locale}
                token={token || ""}
                adId={adId || ""}
                errors={validationErrors}
              />
            </div>
          )}
          {/* Navigation buttons - always show except on payment success */}
          {!paymentSuccess && (
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleDiscard}
                className="flex items-center space-x-2 border-red-500 text-red-500 hover:bg-red-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{t("discard", { defaultValue: "Discard" })}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                {t("previous")}
              </Button>
              {currentStep < steps.length ? (
                <Button onClick={handleNextStep}>
                  {currentStep === 4 ? t("review", { defaultValue: "Review" }) : t("next")}
                </Button>
              ) : (
                <Button 
                  onClick={() => handleSubmit("published")}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? "Processing..." : t("payAndPublish")}
                </Button>
              )}
            </div>
          )}
          {/* </div> */}
        </Card>
      </div>
    </div>
  );
}
