import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { likeApi, notificationApi, userApi } from "@/api";
import { buildTopicLikeNotificationContent } from "@/lib/notificationContent";
import { likeKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/stores";
import { getVisitorKey } from "@/lib/visitorKey";

export function useTopicLike(topicId: number) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: likeKeys.topic(topicId).queryKey,
    queryFn: async () => {
      const visitorKey = await getVisitorKey();
      return likeApi.getTopicLikeInfo(topicId, user?.id, visitorKey);
    },
    enabled: !!topicId,
  });
}

export function useToggleTopicLike(topicId: number, topicAuthorId?: string, topicTitle?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const visitorKey = await getVisitorKey();
      const liked = await likeApi.toggleTopicLike(topicId, user?.id, visitorKey);

      if (liked && user?.id && topicAuthorId && topicAuthorId !== user.id) {
        const senderInfo = await userApi.getUserInfo(user.id);
        const nickname = senderInfo?.nickname?.trim() || "회원";
        await notificationApi.createNotification({
          receiver_id: topicAuthorId,
          sender_id: user.id,
          type: "topic_like",
          content: buildTopicLikeNotificationContent(nickname, topicTitle),
          link: `/topics/${topicId}/detail`,
        });
      }

      return liked;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: likeKeys.topic(topicId).queryKey });
    },
  });
}

export function useShareTopic(topicId: number) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (url: string) => {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      const visitorKey = await getVisitorKey();
      await likeApi.recordTopicShare(topicId, user?.id, visitorKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: likeKeys.topic(topicId).queryKey });
    },
  });
}
