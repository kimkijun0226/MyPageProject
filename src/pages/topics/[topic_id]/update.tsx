import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useTopicDetail } from "@/hooks";
import { isAdmin } from "@/lib/admin";
import { useAuthStore, useBrowseCategoryStore } from "@/stores";
import { TopicEditorForm } from "./TopicEditorForm";

export default function UpdateTopic() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const { data: topic, isLoading: topicLoading } = useTopicDetail(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const setBrowseCategory = useBrowseCategoryStore((s) => s.setCategory);

  useEffect(() => {
    const category = topic?.category;
    if (!category) return;
    setBrowseCategory(category);
    if (searchParams.get("category") === category) return;
    setSearchParams({ category }, { replace: true });
  }, [topic?.category, searchParams, setBrowseCategory, setSearchParams]);

  useEffect(() => {
    if (!user) return;
    if (!isAdmin(user)) {
      toast.error("글 수정 권한이 없습니다.");
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!id || topicLoading || !topic || !user?.id) return;

    if (topic.author !== user.id) {
      toast.error("본인이 작성한 글만 수정할 수 있습니다.");
      navigate(`/topics/${id}/detail`, { replace: true });
    }
  }, [id, navigate, topic, topicLoading, user?.id]);

  if (id && topicLoading) return null;
  if (!id || !user?.id || !isAdmin(user)) return null;
  if (!topic) return null;
  if (topic.author !== user.id) return null;

  return <TopicEditorForm key={`${id}-update`} id={id} mode="update" topic={topic} userId={user.id} />;
}
