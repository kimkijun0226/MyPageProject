import { topicApi } from "@/api";
import { RESUME_TOPIC_ID } from "@/constants/category.constant";
import { topicKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useResumeTopic() {
  return useQuery({
    queryKey: topicKeys.detail(RESUME_TOPIC_ID).queryKey,
    queryFn: () => topicApi.getResumeTopic(RESUME_TOPIC_ID),
  });
}
