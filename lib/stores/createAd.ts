"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type CreateAdState = {
  currentStep: number;
  completedSteps: number[];
  selectedForm: string;
  selectedCategory: string;
  selectedSubcategory: string;
  imageUrls: { url: string; mediaPath: string; mediaThumbPath: string }[];
  featured: boolean;
  autoRenew: boolean;
  expressReady: boolean;
  enableChat: boolean;
  contactInfo: boolean;
  surfaceId: string;
  originCountryId: string;
  originCityId: string;
  benefits: string[];
  defects: string[];
  saleUnitType: string;
  formType: string;
  grade: string;
  sizeH: string;
  sizeW: string;
  sizeL: string;
  weight: string;
  minimumOrder: string;
  categoryId: string;
  price: string;
  description: string;
  selectedColors: string[];
  selectedReceivingPorts: string[];
  selectedExportPorts: string[];
  reviewFeatures: {
    is_chat_enabled: boolean;
    contact_info_enabled: boolean;
    express: boolean;
    auto_renew: boolean;
  };
  selectedPaymentMethod: string;

  setField: <K extends keyof CreateAdState>(key: K, value: CreateAdState[K]) => void;
  setImageUrls: (images: CreateAdState["imageUrls"]) => void;
  setReviewFeatures: (v: CreateAdState["reviewFeatures"]) => void;
  reset: () => void;
};

const initialState: CreateAdState = {
  currentStep: 1,
  completedSteps: [],
  selectedForm: "",
  selectedCategory: "",
  selectedSubcategory: "",
  imageUrls: [],
  featured: false,
  autoRenew: false,
  expressReady: false,
  enableChat: false,
  contactInfo: false,
  surfaceId: "",
  originCountryId: "",
  originCityId: "",
  benefits: [],
  defects: [],
  saleUnitType: "",
  formType: "",
  grade: "",
  sizeH: "",
  sizeW: "",
  sizeL: "",
  weight: "",
  minimumOrder: "",
  categoryId: "",
  price: "",
  description: "",
  selectedColors: [],
  selectedReceivingPorts: [],
  selectedExportPorts: [],
  reviewFeatures: {
    is_chat_enabled: false,
    contact_info_enabled: false,
    express: false,
    auto_renew: false,
  },
  selectedPaymentMethod: "",

  setField: () => {},
  setImageUrls: () => {},
  setReviewFeatures: () => {},
  reset: () => {},
};

export const useCreateAdStore = create<CreateAdState>()(
  persist(
    (set) => ({
      ...initialState,
      setField: (key, value) => set({ [key]: value } as any),
      setImageUrls: (images) => set({ imageUrls: images }),
      setReviewFeatures: (v) => set({ reviewFeatures: v }),
      reset: () => set({ ...initialState }),
    }),
    {
      name: "create-ad-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);


