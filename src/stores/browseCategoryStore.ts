import { DEFAULT_CATEGORY } from "@/constants/category.constant";
import { create } from "zustand";

interface BrowseCategoryStore {
  category: string;
  setCategory: (category: string) => void;
}

export const useBrowseCategoryStore = create<BrowseCategoryStore>()((set) => ({
  category: DEFAULT_CATEGORY,
  setCategory: (category) => set({ category }),
}));
