import { AppEditor, AppCommentSection, AuthorProfileCard } from "@/components/common";
import { Button, Separator } from "@/components/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CLASS_CATEGORY, isResumeCategory, RESUME_TITLE } from "@/constants/category.constant";
import { useUserInfo } from "@/hooks";
import { isAdmin } from "@/lib/admin";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import type { Topic } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react";

dayjs.extend(relativeTime);
dayjs.locale("ko");

type TopicDetailViewProps = {
  topic: Topic;
  showActions?: boolean;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  hideCategoryLabel?: boolean;
};

export function TopicDetailView({
  topic,
  showActions = false,
  onBack,
  onEdit,
  onDelete,
  hideCategoryLabel = false,
}: TopicDetailViewProps) {
  const { user } = useAuthStore();
  const { userInfo: authorInfo } = useUserInfo(topic.author);
  const categoryLabel = CLASS_CATEGORY.find((c) => c.category === topic.category)?.label ?? topic.category;
  const displayTitle = isResumeCategory(topic.category) ? RESUME_TITLE : topic.title;
  const canManage = isAdmin(user) && topic.author === user?.id;

  function formatCreatedAt(createdAt: string) {
    const date = dayjs(createdAt);
    return date.isSame(dayjs(), "day") ? date.fromNow() : date.format("YYYY. MM. DD");
  }

  const stickyHeader = (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-5 py-2.5 sm:px-8">
      <div className="flex shrink-0 items-center gap-1">
        {onBack && (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-border/60 bg-background/80 hover:bg-background"
            onClick={onBack}
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {showActions && canManage && onEdit && (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-border/60 bg-primary/15 text-primary hover:bg-primary/25"
            onClick={onEdit}
            aria-label="수정"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {showActions && canManage && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 !bg-red-800/50" aria-label="삭제">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말 해당 토픽을 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  삭제하시면 해당 토픽의 모든 내용이 영구적으로 삭제되어 복구할 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>닫기</AlertDialogCancel>
                <AlertDialogAction className="bg-red-800/50 text-white hover:bg-red-700/50" onClick={onDelete}>
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <AuthorProfileCard
        authorInfo={authorInfo}
        variant="compact"
        align="end"
        className="ml-auto max-w-none shrink border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
      />
    </header>
  );

  return (
    <div className="relative w-full">
      {stickyHeader}

      <div
        className="relative h-60 w-full shrink-0 bg-muted bg-cover bg-[50%_35%] md:h-100"
        style={{ backgroundImage: topic.thumbnail ? `url(${topic.thumbnail})` : undefined }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-background via-transparent to-transparent" />
      </div>

      <section className="relative z-10 -mt-40 flex w-full shrink-0 flex-col items-center px-4 pb-2">
        {!hideCategoryLabel && categoryLabel && (
          <span className="mb-4 text-sm font-medium text-primary"># {categoryLabel}</span>
        )}
        <h1 className="scroll-m-20 text-center text-xl font-extrabold tracking-tight text-foreground drop-shadow-sm sm:text-2xl md:text-4xl">
          {displayTitle}
        </h1>
        <Separator className="my-6 !w-6 bg-primary" />
        <span className="text-sm text-muted-foreground">{formatCreatedAt(topic.created_at ?? "")}</span>
        <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
          <Eye size={14} />
          <span className="text-sm">{topic.view_count ?? 0}</span>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[840px] px-4 pb-6 pt-10">
        <div
          className={cn(
            "[&_.bn-container]:!h-auto [&_.bn-container]:!min-h-0 [&_.bn-editor]:!min-h-0 [&_.bn-container]:!border-0 [&_.bn-editor]:!bg-transparent",
            hideCategoryLabel && "resume-content",
          )}
        >
          {topic.content && <AppEditor content={JSON.parse(topic.content)} readonly />}
        </div>

        <div className="mt-14">
          <AppCommentSection topicId={topic.id} topicAuthorId={topic.author} topicTitle={topic.title} />
        </div>
      </div>
    </div>
  );
}
