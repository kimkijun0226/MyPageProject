import { create } from "zustand";
import { persist } from "zustand/middleware";

export const SIDEBAR_WIDTH_EXPANDED = 256;
export const SIDEBAR_WIDTH_COLLAPSED = 52;

export type SidebarNavTab = "categories" | "chat";

interface SidebarStore {
  collapsed: boolean;
  mobileOpen: boolean;
  navTab: SidebarNavTab;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  setNavTab: (tab: SidebarNavTab) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      navTab: "categories",
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      setMobileOpen: (open) => set({ mobileOpen: open }),
      setNavTab: (tab) => set({ navTab: tab }),
    }),
    {
      name: "sidebar-storage-v2",
      // collapsed는 저장하지 않음 — 항상 펼친 상태가 기본
      partialize: (state) => ({ navTab: state.navTab }),
    },
  ),
);
