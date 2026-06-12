import { useMemo, useRef, useState, useEffect } from "react";
import { NotebookPen, PencilLine } from "lucide-react";
import { AppDraftsDialog } from "../components/common";
import { SkeletonHotTopic } from "../components/skeleton";
import { Button } from "../components/ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore, useBrowseCategoryStore, useCategoryReadStore, useSearchStore } from "@/stores";
import { toast } from "sonner";
import { useTopic, useCommunityTopics, useSearchTopics } from "@/hooks";
import { NewTopicCard, TOPIC_GRID_CLASS, TopicDetailView } from "@/components/topics";
import type { Topic } from "@/types";
import {
  CLASS_CATEGORY,
  DEFAULT_CATEGORY,
  getCategoryAddLabel,
  isResumeCategory,
  RESUME_TOPIC_ID,
} from "@/constants/category.constant";
import { isAdmin } from "@/lib/admin";
import { cn } from "@/lib/utils";
import { ResumeCategoryPage } from "./ResumeCategoryPage";

function App() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? DEFAULT_CATEGORY;
  const setBrowseCategory = useBrowseCategoryStore((s) => s.setCategory);

  useEffect(() => {
    const current = searchParams.get("category");
    if (!current || current === "home") {
      setSearchParams({ category: DEFAULT_CATEGORY }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setBrowseCategory(category);
  }, [category, setBrowseCategory]);
  const { user } = useAuthStore();
  const isAuthed = Boolean(user?.id);

  const markCategorySeen = useCategoryReadStore((s) => s.markCategorySeen);
  const { createTopic, draftTopics } = useTopic();
  const { data: communityTopics = [], isLoading: communityLoading } = useCommunityTopics(
    category === "" ? undefined : category,
  );

  useEffect(() => {
    if (!communityLoading) markCategorySeen(category);
  }, [category, communityLoading, markCategorySeen]);
  const draftCount = draftTopics.length;

  const list = communityTopics;
  const listLoading = communityLoading;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { searchQuery, searchCategory } = useSearchStore();
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const isSearchMode = debouncedQuery.trim().length > 0;
  const { data: searchData, isLoading: searchLoading } = useSearchTopics(debouncedQuery, searchCategory || undefined);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleRoute = async () => {
    if (!isAdmin(user)) {
      toast.error("글 작성 권한이 없습니다.");
      return;
    }

    if (!user?.id || !user.email) {
      toast(
        <>
          글 작성은 로그인 후 이용 가능합니다.
          <br />
          로그인 페이지로 이동 하시겠습니까?
        </>,
        {
          action: {
            label: "예",
            onClick: () => navigate("/sign-in"),
          },
          cancel: {
            label: "아니오",
            onClick: () => {},
          },
          invert: true,
          classNames: {
            actionButton: "order-1",
            cancelButton: "order-2",
          },
        },
      );
      return;
    }

    try {
      const created = await createTopic.mutateAsync({
        author: user.id,
        status: null,
        title: null,
        content: null,
        category: category || DEFAULT_CATEGORY,
        thumbnail: null,
        visibility: "PRIVATE",
      });
      navigate(`/topics/${created.id}/create?category=${encodeURIComponent(category || DEFAULT_CATEGORY)}`);
    } catch (error) {
      console.log(error);
      toast.error("글 생성에 실패했습니다.");
    }
  };

  const sectionCategories = useMemo(() => {
    if (category !== "") return [];
    return CLASS_CATEGORY.filter((c) => list.some((t) => t.category === c.category));
  }, [category, list]);

  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);

  useEffect(() => {
    if (category !== "") return;
    const root = scrollContainerRef.current;
    if (!root) return;
    if (sectionCategories.length <= 1) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-section-id]"));
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const top = visible[0]?.target as HTMLElement | undefined;
        const idStr = top?.dataset.sectionId;
        if (!idStr) return;
        const id = Number(idStr);
        if (!Number.isNaN(id)) setActiveSectionId(id);
      },
      { root, threshold: [0.45, 0.6, 0.75] },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [category, sectionCategories]);

  const nextSectionLabel = useMemo(() => {
    if (category !== "") return null;
    if (sectionCategories.length <= 1) return null;
    const activeIdx = activeSectionId ? sectionCategories.findIndex((c) => c.id === activeSectionId) : 0;
    const idx = activeIdx >= 0 ? activeIdx : 0;
    const next = sectionCategories[idx + 1];
    return next?.label ?? null;
  }, [activeSectionId, category, sectionCategories]);

  if (!isSearchMode && isResumeCategory(category)) {
    return (
      <main className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <ResumeCategoryPage />
        </section>
      </main>
    );
  }

  return (
    <main className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4">
        <div className="flex w-full flex-1 flex-col gap-2">
          {/* 검색 결과 / 일반 목록 */}
          {isSearchMode ? (
            <>
              <p className="text-sm text-white/50">
                <span className="font-medium text-white/70">"{debouncedQuery}"</span>
                {searchCategory && (
                  <span className="ml-1">· {CLASS_CATEGORY.find((c) => c.category === searchCategory)?.label}</span>
                )}
                <span className="ml-1">검색 결과 {searchData?.length ?? 0}개</span>
              </p>
              {searchLoading ? (
                <div className={TOPIC_GRID_CLASS}>
                  <SkeletonHotTopic />
                  <SkeletonHotTopic />
                  <SkeletonHotTopic />
                </div>
              ) : searchData && searchData.length > 0 ? (
                <div className={TOPIC_GRID_CLASS}>
                  {searchData.map((t: Topic) => (
                    <NewTopicCard key={t.id} props={t} />
                  ))}
                </div>
              ) : (
                <div className="w-full min-h-60 flex items-center justify-center">
                  <p className="text-muted-foreground/50">검색 결과가 없습니다.</p>
                </div>
              )}
            </>
          ) : listLoading ? (
            <div className={TOPIC_GRID_CLASS}>
              <SkeletonHotTopic />
              <SkeletonHotTopic />
              <SkeletonHotTopic />
            </div>
          ) : list.length > 0 ? (
            category === "" ? (
              <div
                ref={scrollContainerRef}
                className="flex h-[calc(100dvh-2rem)] flex-col gap-14 overflow-y-auto pr-1 scroll-smooth snap-y snap-mandatory pb-10"
              >
                {CLASS_CATEGORY.map((cat) => {
                  const items = list.filter((t) => t.category === cat.category);
                  if (items.length === 0) return null;

                  if (cat.category === "resume") {
                    const resumeItem = items.find((t) => t.id === RESUME_TOPIC_ID) ?? items[0];
                    return (
                      <section
                        key={cat.id}
                        data-section-id={cat.id}
                        className="min-h-[calc(100vh-150px)] flex flex-col snap-start px-0 sm:px-0"
                      >
                        <TopicDetailView topic={resumeItem} hideCategoryLabel />
                      </section>
                    );
                  }

                  const maxCards = 4;
                  const visibleItems = items.slice(0, maxCards);
                  const hasMore = items.length > visibleItems.length;
                  const isSingle = visibleItems.length === 1 && !hasMore;

                  return (
                    <section
                      key={cat.id}
                      data-section-id={cat.id}
                      className={cn(
                        "min-h-[calc(100vh-150px)] flex flex-col items-center px-2 sm:px-3 pt-0 snap-start",
                        isSingle ? "justify-between gap-4" : "justify-start gap-5",
                      )}
                    >
                      <div className="flex w-full flex-col gap-3">
                        <div className="flex w-full items-center justify-between gap-4">
                          <div className="flex items-baseline gap-3 min-w-0">
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground truncate">
                              {cat.label}
                            </h2>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">{items.length}개의 글</span>
                          </div>

                          {hasMore && (
                            <Button
                              variant="outline"
                              className="rounded-full"
                              onClick={() => navigate({ pathname: "/", search: `?category=${cat.category}` })}
                            >
                              더보기
                            </Button>
                          )}
                        </div>

                        <div className={TOPIC_GRID_CLASS}>
                          {visibleItems.map((t: Topic) => (
                            <NewTopicCard key={t.id} props={t} />
                          ))}
                        </div>

                        {hasMore && (
                          <div className="flex justify-center pt-2">
                            <Button
                              variant="ghost"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => navigate({ pathname: "/", search: `?category=${cat.category}` })}
                            >
                              {items.length - visibleItems.length}개 더 보기
                            </Button>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className={TOPIC_GRID_CLASS}>
                {list.map((t: Topic) => (
                  <NewTopicCard key={t.id} props={t} />
                ))}
              </div>
            )
          ) : (
            <div className="w-full min-h-120 flex items-center justify-center">
              <p className="text-muted-foreground/50">
                {category ? "해당 카테고리의 글이 없습니다." : "전체 공개된 글이 없습니다."}
              </p>
            </div>
          )}
        </div>
      </section>

      {isAuthed && isAdmin(user) && !isResumeCategory(category) ? (
        <div className="z-20 flex shrink-0 justify-center px-3 py-4 sm:px-4 sm:py-5">
          <div className="flex items-center gap-2 rounded-full border border-violet-200/60 bg-white/65 p-1.5 shadow-2xl shadow-black/10 ring-1 ring-violet-300/15 backdrop-blur-xl dark:border-sky-500/15 dark:bg-slate-950/40 dark:ring-sky-500/10">
            <Button
              variant="ghost"
              className="relative cursor-pointer overflow-hidden rounded-full border border-violet-400/45 bg-linear-to-b from-[#9d9ad8]/90 to-[#5e5baa]/80 px-6 py-5 text-white shadow-lg shadow-violet-400/25 transition-all duration-300 ease-out before:absolute before:inset-0 before:translate-x-[-130%] before:bg-linear-to-r before:from-white/0 before:via-white/25 before:to-white/0 before:transition-transform before:duration-700 before:ease-out hover:-translate-y-0.5 hover:border-violet-300/70 hover:brightness-110 hover:shadow-[0_10px_28px_-6px_rgba(124,121,199,0.5)] hover:before:translate-x-[130%] active:translate-y-0 active:shadow-none"
              onClick={handleRoute}
            >
              <PencilLine />
              {getCategoryAddLabel(category)}
            </Button>
            <AppDraftsDialog>
              <div className="relative">
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-violet-200/60 bg-white/55 shadow-sm shadow-black/5 transition-all duration-300 ease-out before:absolute before:inset-0 before:translate-x-[-130%] before:bg-linear-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:transition-transform before:duration-700 before:ease-out hover:-translate-y-0.5 hover:border-violet-300/80 hover:bg-white/75 hover:shadow-[0_10px_28px_-8px_rgba(124,121,199,0.4)] hover:before:translate-x-[130%] active:translate-y-0 active:shadow-none dark:border-sky-500/15 dark:bg-white/10"
                >
                  <NotebookPen />
                </Button>
                {draftCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-linear-to-b from-rose-500 to-red-600 text-[10px] font-semibold text-white shadow-md shadow-red-500/25 ring-2 ring-background">
                    {draftCount > 99 ? "99+" : draftCount}
                  </span>
                )}
              </div>
            </AppDraftsDialog>
          </div>
        </div>
      ) : null}

      {/* 전체 화면(섹션)에서만: 다음 섹션 힌트 (글쓰기 버튼 아래로 고정) */}
      {!isAuthed && category === "" && nextSectionLabel ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-10 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-11 w-7 rounded-full border border-border/70 bg-background/55 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.65)] backdrop-blur-sm">
              <div className="absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-foreground/55 animate-[scrollWheel_1.35s_ease-in-out_infinite]" />
            </div>
            <p className="text-[11px] text-foreground/55 tracking-wide truncate max-w-[240px]">{nextSectionLabel}</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
