"use client";
import { create } from "zustand";

type BookmarksState = {
  ids: Set<string>;
  setAll: (ids: string[]) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
};

export const useBookmarksStore = create<BookmarksState>((set, get) => ({
  ids: new Set<string>(),
  setAll: (ids) => set({ ids: new Set(ids) }),
  add: (id) => {
    const next = new Set(get().ids);
    next.add(id);
    set({ ids: next });
  },
  remove: (id) => {
    const next = new Set(get().ids);
    next.delete(id);
    set({ ids: next });
  },
  has: (id) => get().ids.has(id),
}));


