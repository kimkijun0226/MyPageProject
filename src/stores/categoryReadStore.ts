import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Topic } from "@/types";

interface CategoryReadStore {
  lastSeenAt: Record<string, string>;
  markCategorySeen: (category: string) => void;
}

export const useCategoryReadStore = create<CategoryReadStore>()(
  persist(
    (set) => ({
      lastSeenAt: {},
      markCategorySeen: (category) =>
        set((s) => ({
          lastSeenAt: { ...s.lastSeenAt, [category]: new Date().toISOString() },
        })),
    }),
    { name: "category-read-storage" },
  ),
);

export function getCategoryUnreadCount(
  topics: Pick<Topic, "category" | "created_at">[],
  category: string,
  lastSeenAt: Record<string, string>,
): number {
  const seenAt = lastSeenAt[category];
  if (!seenAt) return 0;
  const seenTime = new Date(seenAt).getTime();
  return topics.filter((t) => t.category === category && new Date(t.created_at).getTime() > seenTime).length;
}

export function formatCountBadge(count: number): string | null {
  if (count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}
