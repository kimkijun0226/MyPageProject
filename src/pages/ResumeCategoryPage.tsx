import { SiteWelcomeModal } from "@/components/common/SiteWelcomeModal";
import { TopicDetailView } from "@/components/topics/TopicDetailView";
import { topicApi } from "@/api";
import { RESUME_TOPIC_ID } from "@/constants/category.constant";
import { topicKeys } from "@/constants/queryKeys";
import { useResumeTopic } from "@/hooks";
import { isAdmin } from "@/lib/admin";
import { queryClient } from "@/lib/queryClient";
import { getVisitorKey } from "@/lib/visitorKey";
import { useAuthStore } from "@/stores";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function ResumeCategoryPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const admin = isAdmin(user);
  const { data: resumeTopic, isLoading } = useResumeTopic();
  const viewCountedRef = useRef(false);

  useEffect(() => {
    if (!resumeTopic || viewCountedRef.current) return;
    viewCountedRef.current = true;
    getVisitorKey().then((visitorKey) =>
      topicApi.incrementViewCount(RESUME_TOPIC_ID, visitorKey).then(() => {
        queryClient.invalidateQueries({ queryKey: topicKeys._def });
      }),
    );
  }, [resumeTopic]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground/50">이력서를 불러오는 중…</p>
      </div>
    );
  }

  if (!resumeTopic) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground/50">등록된 이력서가 없습니다.</p>
      </div>
    );
  }

  const canEdit = admin;

  return (
    <div className="w-full">
      <SiteWelcomeModal />
      <TopicDetailView
        topic={resumeTopic}
        hideCategoryLabel
        showActions={canEdit}
        onEdit={canEdit ? () => navigate(`/topics/${RESUME_TOPIC_ID}/update?category=resume`) : undefined}
      />
    </div>
  );
}
