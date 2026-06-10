import { TopicDetailView } from "@/components/topics/TopicDetailView";
import { DEFAULT_CATEGORY } from "@/constants/category.constant";
import { topicApi } from "@/api";
import { topicKeys } from "@/constants/queryKeys";
import { useTopic, useTopicDetail } from "@/hooks";
import { queryClient } from "@/lib/queryClient";
import { getVisitorKey } from "@/lib/visitorKey";
import { useBrowseCategoryStore } from "@/stores";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type DetailLocationState = {
  fromCategory?: string;
};

export function TopicDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const browseCategory = useBrowseCategoryStore((s) => s.category);
  const setBrowseCategory = useBrowseCategoryStore((s) => s.setCategory);
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: topic } = useTopicDetail(id);
  const { deleteTopic } = useTopic();
  const viewCountedRef = useRef(false);

  const goHome = () => {
    const fromCategory =
      (location.state as DetailLocationState | null)?.fromCategory ??
      topic?.category ??
      browseCategory ??
      DEFAULT_CATEGORY;
    navigate({ pathname: "/", search: `?category=${encodeURIComponent(fromCategory)}` });
  };

  useEffect(() => {
    if (!topic?.category) return;
    setBrowseCategory(topic.category);
    if (searchParams.get("category") !== topic.category) {
      setSearchParams({ category: topic.category }, { replace: true });
    }
  }, [topic?.category, searchParams, setBrowseCategory, setSearchParams]);

  useEffect(() => {
    if (!id || viewCountedRef.current || !topic) return;
    viewCountedRef.current = true;
    getVisitorKey().then((visitorKey) =>
      topicApi.incrementViewCount(id, visitorKey).then(() => {
        queryClient.invalidateQueries({ queryKey: topicKeys._def });
      }),
    );
  }, [id, topic]);

  const handleDelete = async () => {
    deleteTopic.mutate(Number(id));
    goHome();
    toast.success("토픽이 삭제되었습니다.");
  };

  if (!topic) return null;

  return (
    <TopicDetailView
      topic={topic}
      showActions
      onBack={goHome}
      onEdit={() =>
        navigate(`/topics/${id}/update${topic.category ? `?category=${encodeURIComponent(topic.category)}` : ""}`)
      }
      onDelete={handleDelete}
    />
  );
}
