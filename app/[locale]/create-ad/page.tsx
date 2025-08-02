"use client";
import { Card } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Textarea } from "@/components/ui/textarea";
// import { Info, X, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
// import Image from "next/image";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
import {
  uploadAdMedia,
  deleteAdMedia,
  getAdDetails,
  fetchCountries,
  fetchCities,
  fetchSurfaces,
  fetchCategories,
  fetchPorts,
  initAdvertisement,
  updateAd,
} from "@/lib/advertisements";
import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import DropdownMultiSelect from "@/components/ui/dropdown-multiselect";
// import {
  // DndContext,
  // closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
import {
  arrayMove,
  // SortableContext,
  // useSortable,
  // rectSortingStrategy,
} from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
import Stepper from "@/components/Stepper";
import StepFormAndCategoryOfStone from "@/components/steps/StepFormAndCategoryOfStone";
import StepSubcategoryOfStone from "@/components/steps/StepSubcategoryOfStone";
import StepSizeWeightSurfaceGradeOfStone from "@/components/steps/StepSizeWeightSurfaceGradeOfStone";
import StepReviewAndPublish from "@/components/steps/StepReviewAndPublish";
import StepImages from "@/components/steps/StepImages";
import StepPriceAndPorts from "@/components/steps/StepPriceAndPorts";
// import isEqual from "lodash.isequal";

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

type UploadedFile = { path: string; thumb_path: string };

export default function CreateAdPage() {
  const t = useTranslations("CreateAd");
  const searchParams = useSearchParams();
  const adId = searchParams.get("id");
  const locale = searchParams.get("lang") || "en";
  const { token } = useAuth();
  // const router = useRouter();
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<
    { url: string; mediaPath: string }[]
  >([]);

  // Add state for left panel checkboxes
  const [featured, setFeatured] = useState(true);
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

  // Add state for country/city options and loading
  const [countryOptions, setCountryOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [cityOptions, setCityOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
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
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
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

  // Track initial form state for dirty check
  const initialFormState = useRef<any>(null);
  // Add a ref to store the last loaded adData for use in the city effect
  const lastLoadedAdData = useRef<any>(null);
  // Add a ref to track if we're loading from cache to prevent conflicts
  const isLoadingFromCache = useRef(false);

  // Define steps for the multi-step form
  const steps = [
    { id: 1, title: t("formOfStone"), description: t("selectStoneForm") },
    { id: 2, title: t("subcategoryOfStone"), description: t("selectStoneSubcategory") },
    { id: 3, title: t("sizeWeightSurfaceGrade"), description: t("stoneSpecifications") },
    { id: 4, title: t("images"), description: t("uploadImages") },
    { id: 5, title: t("priceAndPorts"), description: t("priceAndPortsDetails") },
    { id: 6, title: t("reviewAndPublish"), description: t("reviewAndPublishDetails") },
  ];

  // Step navigation functions
  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step) || step < currentStep) {
      setCurrentStep(step);
      // If clicking on a step that's before the current step, remove all completed steps after it
      if (step < currentStep) {
        setCompletedSteps(completedSteps.filter(completedStep => completedStep <= step));
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
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
        if (cachedData.imageUrls) setImageUrls(cachedData.imageUrls);
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
            if (cachedData.imageUrls) setImageUrls(cachedData.imageUrls);
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
          if (cachedData.imageUrls) setImageUrls(cachedData.imageUrls);
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
          // Optionally update color options if category has colors
          if (adData.category?.colors) setColorOptions(adData.category.colors);
          
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

  // Fetch countries on mount
  useEffect(() => {
    setCountryLoading(true);
    setCountryError(null);
    fetchCountries(locale)
      .then((data) => setCountryOptions(data))
      .catch((err) =>
        setCountryError(err.message || "Failed to load countries")
      )
      .finally(() => setCountryLoading(false));
  }, [locale]);
  // Patch the city effect to add the current city if missing from the fetched list
  useEffect(() => {
    if (!originCountryId) {
      setCityOptions([]);
      setOriginCityId("");
      return;
    }
    setCityLoading(true);
    setCityError(null);
    fetchCities(originCountryId, locale)
      .then((data) => {
        console.log('Fetched cities for country', originCountryId, data);
        console.log('Current originCityId:', originCityId);
        let patchedData = data;
        if (
          originCityId &&
          !data.some((city: { id: string }) => city.id === originCityId) &&
          lastLoadedAdData.current?.origin_city?.id === originCityId
        ) {
          patchedData = [
            ...data,
            {
              id: lastLoadedAdData.current.origin_city.id,
              name: lastLoadedAdData.current.origin_city.name,
            },
          ];
        }
        setCityOptions(patchedData);
        if (!patchedData.some((city: { id: string }) => city.id === originCityId)) {
          setOriginCityId("");
        }
      })
      .catch((err) => setCityError(err.message || "Failed to load cities"))
      .finally(() => setCityLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originCountryId, locale]);

  // Fetch surfaces on mount
  useEffect(() => {
    setSurfaceLoading(true);
    setSurfaceError(null);
    fetchSurfaces(locale)
      .then((data) => setSurfaceOptions(data))
      .catch((err) => setSurfaceError(err.message || "Failed to load surfaces"))
      .finally(() => setSurfaceLoading(false));
  }, [locale]);

  // Fetch categories on mount
  useEffect(() => {
    setCategoryLoading(true);
    setCategoryError(null);
    fetchCategories(locale)
      .then((data) => setCategoryOptions(data))
      .catch((err) =>
        setCategoryError(err.message || "Failed to load categories")
      )
      .finally(() => setCategoryLoading(false));
  }, [locale]);
  // Update color options and origin data when categoryId changes
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
      // Set color options
      setColorOptions(cat.colors || []);
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
        setImageUrls((prev) => {
          // Prevent duplicate images
          if (prev.some((img) => img.mediaPath === res.data.media_path))
            return prev;
          return [
            ...prev,
            {
              url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/${res.data.media_thumb_path}`,
              mediaPath: res.data.media_path,
            },
          ];
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

  // dnd-kit drag and drop logic
  // const sensors = useSensors(
  //   useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  // );

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

  // Helper to check if form is empty
  const isFormEmpty = () => {
    const state = getFormState();
    // Consider empty if all fields are empty/false/[]
    return (
      !state.selectedForm &&
      !state.selectedCategory &&
      !state.selectedSubcategory &&
      !state.imageUrls.length &&
      !state.featured &&
      !state.autoRenew &&
      !state.expressReady &&
      !state.enableChat &&
      !state.contactInfo &&
      !state.surfaceId &&
      !state.originCountryId &&
      !state.originCityId &&
      !state.benefits &&
      !state.defects &&
      !state.saleUnitType &&
      !state.formType &&
      !state.grade &&
      !state.sizeH &&
      !state.sizeW &&
      !state.sizeL &&
      !state.weight &&
      !state.minimumOrder &&
      !state.categoryId &&
      !state.price &&
      !state.description &&
      !state.selectedColors.length &&
      !state.selectedReceivingPorts.length &&
      !state.selectedExportPorts.length
    );
  };

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

  // Check if form is dirty
  // const isDirty = initialFormState.current
  //   ? !isEqual(getFormState(), initialFormState.current)
  //   : false;

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

    const transformStatus = (value: string) => {
      switch (value) {
        case 'draft':
          return 3;
        case 'published':
          return 1;
        case 'pending':
          return 2;
        default:
          // If it's already a number, return it as number
          const numValue = Number(value);
          return isNaN(numValue) ? 3 : numValue; // Default to draft (3) if invalid
      }
    };

    setSubmitting(true);
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
                  const url = new URL(img.url);
                  const media_thumb_path = url.pathname.replace(/^\//, "");
                  return {
                    index: idx,
                    media_path: img.mediaPath,
                    media_thumb_path,
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



      const res = await updateAd({
        payload: updateAdPayload,
        locale,
        token: token!,
      });
      if (res?.success) {
        toast.success(
          t("adUpdateSuccess", { defaultValue: "Ad updated successfully!" })
        );
        // Show confirmation for draft
        if (statusValue === "3") {
          toast.success(t("draftSaved", { defaultValue: "Draft saved!" }));
          // Update initial state to current after saving draft
          initialFormState.current = getFormState();
        }
        // Clear form cache on successful submission
        clearFormCache();
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
    } finally {
      setSubmitting(false);
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

  return (
    <div className="flex gap-8 max-w-7xl mx-auto py-12">
      {/* Stepper Panel */}
      <Card className="w-80 flex-shrink-0 p-6 h-fit">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
        />
      </Card>
      
      {/* Main Form Panel */}
      <div className="flex-1">
        <Card className="p-8 flex flex-col gap-8">
          {/* Step 1: Form and Category of Stone */}
          {currentStep === 1 && (
            <StepFormAndCategoryOfStone
              selectedForm={selectedForm}
              setSelectedForm={setSelectedForm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              t={t}
              locale={locale}
            />
          )}
          
          {/* Step 2: Subcategory of Stone */}
          {currentStep === 2 && (
            <StepSubcategoryOfStone
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              onDiscard={handleDiscard}
              locale={locale}
            />
          )}
          
                     {/* Step 3: Size, Weight, Surface, Grade */}
           {currentStep === 3 && (
             <StepSizeWeightSurfaceGradeOfStone
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
             />
           )}
          
                     {/* Step 4: Images */}
           {currentStep === 4 && (
             <StepImages
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
             />
           )}
          
                     {/* Step 5: Price & Ports */}
           {currentStep === 5 && (
             <StepPriceAndPorts
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
               t={t}
             />
           )}
          
                                 {/* Step 6: Review & Publish */}
            {currentStep === 6 && (
              <StepReviewAndPublish
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
                onFeaturesChange={handleReviewFeaturesChange}
                onPaymentMethodChange={handlePaymentMethodChange}
              />
            )}
          

          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              {t("previous")}
            </Button>
            <div className="flex gap-2">
              {currentStep < steps.length ? (
                <Button onClick={handleNextStep}>
                  {t("next")}
                </Button>
              ) : (
                <Button onClick={() => handleSubmit("draft")}>
                  {t("saveAsDraft")}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
