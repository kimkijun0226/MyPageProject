import { AppEditor, AppFileUpload } from "@/components/common";
import { Button } from "@/components/ui";
import {
  DEFAULT_CATEGORY,
  getCategoryAddLabel,
  isPortfolioCategory,
  isResumeCategory,
  RESUME_TITLE,
} from "@/constants/category.constant";
import { useImageUpload, useTopic } from "@/hooks";
import {
  arePortfolioLinksValid,
  createPortfolioBodyTemplate,
  isPortfolioContentEmpty,
} from "@/lib/portfolioTopicContent";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores";
import { TOPIC_STATUS, type TOPIC_VISIBILITY, type Topic } from "@/types";
import type { Block } from "@blocknote/core";
import { ArrowLeft, BookOpenCheck, Globe, Lock, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface TopicEditorFormProps {
  id: string;
  mode: "create" | "update";
  topic: Topic | null;
  userId: string;
  backHref?: string;
  publishRedirect?: string;
  hideCategoryBadge?: boolean;
}

export function TopicEditorForm({
  id,
  mode,
  topic,
  userId,
  backHref = "/",
  publishRedirect,
  hideCategoryBadge = false,
}: TopicEditorFormProps) {
  const navigate = useNavigate();
  const { updateTopic } = useTopic();
  const { upload } = useImageUpload();
  const isUpdateMode = mode === "update";

  const category = topic?.category ?? DEFAULT_CATEGORY;
  const isResume = isResumeCategory(category);
  const isPortfolio = isPortfolioCategory(category);

  const initialContent = (() => {
    if (topic?.content && !isPortfolioContentEmpty(topic.content)) {
      return JSON.parse(topic.content) as Block[];
    }
    if (isPortfolio) return createPortfolioBodyTemplate();
    return [];
  })();

  const [title, setTitle] = useState(topic?.title ?? "");
  const [content, setContent] = useState<Block[]>(initialContent);
  const resolvedTitle = isResume ? RESUME_TITLE : title;
  const [thumbnail, setThumbnail] = useState<File | string | null>(topic?.thumbnail ?? null);
  const [visibility, setVisibility] = useState<TOPIC_VISIBILITY>(
    isUpdateMode ? (topic?.visibility ?? "PRIVATE") : "PUBLIC",
  );
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const { collapsed } = useSidebarStore();
  const categoryAddLabel = getCategoryAddLabel(category);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  const handleSave = async () => {
    if (!resolvedTitle && !content.length && !thumbnail) {
      toast.warning(isResume ? "본문, 썸네일을 기입하세요." : "제목, 본문, 썸네일을 기입하세요.");
      return;
    }

    const thumbnailUrl = await upload.mutateAsync(thumbnail);
    updateTopic.mutate(
      {
        id: Number(id),
        payload: {
          title: resolvedTitle,
          content: JSON.stringify(content),
          category,
          thumbnail: thumbnailUrl,
          author: userId,
          status: topic?.status ?? TOPIC_STATUS.TEMP,
          visibility,
        },
      },
      { onSuccess: () => toast.success("글을 임시 저장했습니다.") },
    );
  };

  const handlePublish = async () => {
    if (!resolvedTitle || !content.length || !thumbnail) {
      toast.warning(isResume ? "본문, 썸네일은 필수입니다." : "제목, 본문, 썸네일은 필수입니다.");
      return;
    }

    if (isPortfolio && !arePortfolioLinksValid(content)) {
      toast.warning(
        "소제목·설명·Link·GitHub 안내 문구를 본인 내용으로 바꾼 뒤 발행해 주세요.",
      );
      return;
    }

    const thumbnailUrl = await upload.mutateAsync(thumbnail);
    if (!thumbnailUrl) {
      toast.warning("썸네일을 등록해주세요.");
      return;
    }

    updateTopic.mutate(
      {
        id: Number(id),
        payload: {
          title: resolvedTitle,
          content: JSON.stringify(content),
          category,
          thumbnail: thumbnailUrl,
          author: userId,
          status: TOPIC_STATUS.PUBLISH,
          visibility,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            isUpdateMode
              ? visibility === "PUBLIC"
                ? "글 수정을 전체 공개로 반영했습니다."
                : "글 수정을 반영했습니다."
              : visibility === "PUBLIC"
                ? "글을 전체 공개로 발행했습니다."
                : "글을 발행했습니다.",
          );
          navigate(publishRedirect ?? `/topics/${id}/detail`);
        },
      },
    );
  };

  const footerReserveClass = "h-[calc(6.5rem+env(safe-area-inset-bottom,0px))]";

  return (
    <main className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto scroll-pb-28">
        <section className="relative w-full shrink-0">
          {!hideCategoryBadge && !isUpdateMode && !collapsed && (
            <span className="absolute left-4 top-4 z-10 hidden rounded-md bg-background/85 px-2.5 py-1 text-[12px] font-medium text-foreground/80 shadow-sm backdrop-blur-sm lg:block">
              {categoryAddLabel}
            </span>
          )}
          <AppFileUpload file={thumbnail} setFile={setThumbnail} variant="cover" required />
        </section>

        <article className="mx-auto flex w-full max-w-[720px] flex-col px-6 pt-10 sm:px-12 sm:pt-12">
          {isUpdateMode && (
            <div className="mb-4 flex justify-end">
              <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setVisibility("PRIVATE")}
                  className={cn(
                    "flex h-8 items-center gap-1 rounded-md px-2.5 text-[12px] transition",
                    visibility === "PRIVATE" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <Lock className="h-3 w-3" />
                  비공개
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("PUBLIC")}
                  className={cn(
                    "flex h-8 items-center gap-1 rounded-md px-2.5 text-[12px] transition",
                    visibility === "PUBLIC" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <Globe className="h-3 w-3" />
                  공개
                </button>
              </div>
            </div>
          )}

          <section className="shrink-0">
            {isResume ? (
              <h1 className="w-full text-[2rem] font-bold leading-tight text-foreground sm:text-[2.25rem]">
                {RESUME_TITLE}
              </h1>
            ) : (
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                rows={1}
                className="w-full resize-none border-0 bg-transparent text-[2rem] font-bold leading-tight text-foreground outline-none placeholder:text-muted-foreground/35 sm:text-[2.25rem]"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
              />
            )}
          </section>

          <section className="mt-10 flex flex-col sm:mt-12">
            <div
              className={cn(
                "min-h-[min(40vh,360px)]",
                "[&_.bn-container]:!border-0 [&_.bn-editor]:!bg-transparent",
                "[&_.bn-block-outer]:!ml-0 [&_.ProseMirror]:!pl-0 [&_.ProseMirror]:!pb-4",
              )}
            >
              <AppEditor content={content} setContent={setContent} className="min-h-[min(40vh,360px)]" />
            </div>
          </section>

          <div className={cn("shrink-0", footerReserveClass)} aria-hidden />
        </article>
      </div>

      <footer className="z-20 flex shrink-0 justify-center px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <Button type="button" size="icon" variant="outline" className="h-10 w-10" onClick={() => navigate(backHref)} aria-label="뒤로가기">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {!isUpdateMode && (
            <Button type="button" variant="outline" className="h-10 gap-2 px-4" onClick={handleSave}>
              <Save className="h-4 w-4" />
              임시 저장
            </Button>
          )}

          <Button type="button" className="h-10 gap-2 px-5" onClick={handlePublish}>
            <BookOpenCheck className="h-4 w-4" />
            {isUpdateMode ? "수정 완료" : "발행"}
          </Button>
        </div>
      </footer>
    </main>
  );
}
