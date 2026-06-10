import { useMemo } from "react";
import { CLASS_CATEGORY } from "@/constants/category.constant";
import { useCategoryReadStore, getCategoryUnreadCount } from "@/stores";
import { useCommunityTopics } from "./useTopic";

export function useCategoryUnreadCounts() {
  const lastSeenAt = useCategoryReadStore((s) => s.lastSeenAt);
  const { data: topics = [] } = useCommunityTopics();

  return useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const cat of CLASS_CATEGORY) {
      const count = getCategoryUnreadCount(topics, cat.category, lastSeenAt);
      counts[cat.category] = count;
      total += count;
    }
    return { counts, total };
  }, [topics, lastSeenAt]);
}
