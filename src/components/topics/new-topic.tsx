import { useNavigate } from "react-router-dom";
import { useBrowseCategoryStore } from "@/stores";
import { Card, Separator } from "../ui";
import { Eye, Heart, Share2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import type { Topic } from "@/types";
import { useShareTopic, useToggleTopicLike, useTopicLike, useUserInfo } from "@/hooks";
import { toast } from "sonner";
import { TOPIC_CARD_HEIGHT_CLASS } from "./topic-grid";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface Props {
  props: Topic;
}

interface ContentBlock {
  content?: Array<{ text?: string }>;
}

function extractTextFromContent(content: string | ContentBlock[], maxChars = 200) {
  try {
    const parsed: unknown = typeof content === "string" ? JSON.parse(content) : content;

    if (!Array.isArray(parsed)) {
      console.warn("content 데이터 타입이 배열이 아닙니다.");
      return "";
    }

    const blocks = parsed as ContentBlock[];
    let result = "";

    for (const block of blocks) {
      if (Array.isArray(block.content)) {
        for (const child of block.content) {
          if (child?.text) {
            result += child.text + " ";

            if (result.length >= maxChars) {
              return result.slice(0, maxChars) + "...";
            }
          }
        }
      }
    }
    return result.trim();
  } catch (error) {
    console.log("콘텐츠 파싱 실패: ", error);
    return "";
  }
}

function formatCreatedAt(createdAt: string) {
  const date = dayjs(createdAt);
  return date.isSame(dayjs(), "day") ? date.fromNow() : date.format("YYYY. MM. DD");
}

export function NewTopicCard({ props }: Props) {
  const navigate = useNavigate();
  const setBrowseCategory = useBrowseCategoryStore((s) => s.setCategory);
  const topicCategory = props.category;
  const { userInfo: authorInfo } = useUserInfo(props?.author);
  const { data } = useTopicLike(props.id);
  const toggleLike = useToggleTopicLike(props.id, props?.author, props.title);
  const shareTopic = useShareTopic(props.id);

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleLike.mutate();
  };

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    shareTopic.mutate(window.location.href, {
      onSuccess: () => toast.success("링크가 복사되었습니다!"),
    });
  };

  return (
    <Card
      className={`flex w-full ${TOPIC_CARD_HEIGHT_CLASS} cursor-pointer flex-col gap-3 border border-border bg-card p-4 shadow-sm transition-all duration-200 ease-out hover:scale-[1.01] hover:shadow-md`}
      onClick={() => {
        setBrowseCategory(topicCategory);
        navigate(`/topics/${props.id}/detail?category=${encodeURIComponent(topicCategory)}`, {
          state: { fromCategory: topicCategory },
        });
      }}
    >
      <div className="flex min-h-0 flex-1 items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight">{props.title}</h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">{extractTextFromContent(props.content)}</p>
        </div>
        <img
          src={props.thumbnail || ""}
          alt="@THUMBNAIL"
          className="h-[108px] w-[108px] shrink-0 rounded-lg object-cover"
        />
      </div>
      <Separator />
      <div className="flex w-full shrink-0 items-center justify-between text-xs text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={authorInfo?.profile_image || undefined}
            alt="author profile"
            className="h-5 w-5 shrink-0 rounded-full object-cover"
          />
          <p className="truncate text-xs">{authorInfo?.nickname}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span className="text-xs">{props.view_count ?? 0}</span>
          </div>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 transition-transform duration-200 ease-out hover:scale-110"
            onClick={(e) => handleLike(e)}
          >
            <Heart size={13} className={`text-rose-400 ${data?.isLiked ? "fill-rose-400" : ""}`} />
            <span className="text-xs">{data?.count || 0}</span>
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 transition-transform duration-200 ease-out hover:scale-110"
            onClick={(e) => handleShare(e)}
          >
            <Share2 size={13} className="text-muted-foreground" />
            <span className="text-xs">{props.share_count || 0}</span>
          </button>
          <span className="text-xs">{formatCreatedAt(props.created_at)}</span>
        </div>
      </div>
    </Card>
  );
}
