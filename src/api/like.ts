import supabase from "@/lib/supabase";
import { getVisitorKey } from "@/lib/visitorKey";

export interface TopicLikeInfo {
  count: number;
  isLiked: boolean;
  shareCount: number;
}

const getTopicLikeInfo = async (topicId: number, userId?: string, visitorKey?: string): Promise<TopicLikeInfo> => {
  const key = visitorKey ?? (await getVisitorKey());

  const [{ data: likeData }, { data: topicData }] = await Promise.all([
    supabase.from("topic_like").select("user_id, visitor_key").eq("topic_id", topicId),
    supabase.from("topic").select("share_count").eq("id", topicId).single(),
  ]);

  const likes = likeData ?? [];
  const isLiked = userId
    ? likes.some((l) => l.user_id === userId)
    : likes.some((l) => l.visitor_key === key);

  return {
    count: likes.length,
    isLiked,
    shareCount: topicData?.share_count ?? 0,
  };
};

const toggleTopicLike = async (topicId: number, userId?: string, visitorKey?: string): Promise<boolean> => {
  const key = visitorKey ?? (await getVisitorKey());
  const { data, error } = await supabase.rpc("toggle_topic_like", {
    p_topic_id: topicId,
    p_visitor_key: userId ? null : key,
    p_user_id: userId ?? null,
  });
  if (error) throw error;
  return Boolean(data);
};

const recordTopicShare = async (topicId: number, userId?: string, visitorKey?: string): Promise<void> => {
  const key = visitorKey ?? (await getVisitorKey());
  const { error } = await supabase.rpc("record_topic_share", {
    p_topic_id: topicId,
    p_visitor_key: userId ? null : key,
    p_user_id: userId ?? null,
  });
  if (error) throw error;
};

export const likeApi = { getTopicLikeInfo, toggleTopicLike, recordTopicShare };
