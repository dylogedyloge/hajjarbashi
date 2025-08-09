"use client";
import { create } from "zustand";
import type { AdsFilters } from "@/types/ads";

type AdsFilterState = {
  filters: AdsFilters;
  expressFilter: boolean;
  featuredFilter: boolean;
  layout: "grid" | "list";
  sort: string;
  selectedCategory: { id: string; name: string } | null;
  setFilters: (f: AdsFilters) => void;
  setExpress: (v: boolean) => void;
  setFeatured: (v: boolean) => void;
  setLayout: (v: "grid" | "list") => void;
  setSort: (v: string) => void;
  setSelectedCategory: (c: { id: string; name: string } | null) => void;
  reset: () => void;
};

const initial: AdsFilterState = {
  filters: {},
  expressFilter: false,
  featuredFilter: false,
  layout: "grid",
  sort: "latest",
  selectedCategory: null,
  setFilters: () => {},
  setExpress: () => {},
  setFeatured: () => {},
  setLayout: () => {},
  setSort: () => {},
  setSelectedCategory: () => {},
  reset: () => {},
};

export const useAdsFilterStore = create<AdsFilterState>((set) => ({
  ...initial,
  setFilters: (f) => set({ filters: f }),
  setExpress: (v) => set({ expressFilter: v }),
  setFeatured: (v) => set({ featuredFilter: v }),
  setLayout: (v) => set({ layout: v }),
  setSort: (v) => set({ sort: v }),
  setSelectedCategory: (c) => set({ selectedCategory: c }),
  reset: () => set({ ...initial }),
}));


