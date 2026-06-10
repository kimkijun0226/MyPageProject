import { useTopicDetail } from "@/hooks";
import { isAdmin } from "@/lib/admin";
import { useAuthStore, useBrowseCategoryStore } from "@/stores";
import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { TopicEditorForm } from "./TopicEditorForm";

export default function CreateTopic() {
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
      toast.error("글 작성 권한이 없습니다.");
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (id && topicLoading) return null;

  if (!id || !user?.id || !isAdmin(user)) return null;

  return <TopicEditorForm key={`${id}-create`} id={id} mode="create" topic={topic ?? null} userId={user.id} />;
}
