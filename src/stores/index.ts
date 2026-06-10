import supabase from "@/lib/supabase";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

interface AuthStore {
  user: User | null;
  setUser: (newUser: User | null) => void;
  reset: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null as User | null,
      setUser: (newUser: User | null) => set({ user: newUser }),

      // 로그아웃 (상태 + Supabase 세션 모두 제거)
      reset: async () => {
        await supabase.auth.signOut();
        set({ user: null }); // Zustand 상태 초기화
        localStorage.removeItem("auth-storage"); // localStorage 제거
      },
    }),
    { name: "auth-storage", partialize: (state) => ({ user: state.user }) },
  ),
);
interface SearchStore {
  searchQuery: string;
  searchCategory: string;
  searchOpen: boolean;
  setSearchQuery: (v: string) => void;
  setSearchCategory: (v: string) => void;
  setSearchOpen: (v: boolean) => void;
}

export const useSearchStore = create<SearchStore>()((set) => ({
  searchQuery: "",
  searchCategory: "",
  searchOpen: false,
  setSearchQuery: (v) => set({ searchQuery: v }),
  setSearchCategory: (v) => set({ searchCategory: v }),
  setSearchOpen: (v) => set({ searchOpen: v }),
}));

export { useSidebarStore, SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from "./sidebarStore";
export type { SidebarNavTab } from "./sidebarStore";
export { useCategoryReadStore, getCategoryUnreadCount, formatCountBadge } from "./categoryReadStore";
export { useBrowseCategoryStore } from "./browseCategoryStore";
