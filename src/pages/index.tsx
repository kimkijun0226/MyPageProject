import { useMemo, useRef, useState, useEffect } from "react";
import { ChevronDown, NotebookPen, PencilLine, Search, X } from "lucide-react";
import { AppDraftsDialog, AppSidebar } from "../components/common";
import { SkeletonHotTopic } from "../components/skeleton";
import { Button } from "../components/ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore, useSearchStore } from "@/stores";
import { toast } from "sonner";
import { useTopic, useCommunityTopics, useSearchTopics } from "@/hooks";
import { NewTopicCard } from "@/components/topics";
import type { Topic } from "@/types";
import { CLASS_CATEGORY } from "@/constants/category.constant";
import { cn } from "@/lib/utils";

function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const { user } = useAuthStore();
  const isAuthed = Boolean(user?.id);

  const { createTopic, draftTopics } = useTopic();
  const { data: communityTopics = [], isLoading: communityLoading } = useCommunityTopics(category || undefined);
  const draftCount = draftTopics.length;

  const list = communityTopics;
  const listLoading = communityLoading;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchCatRef = useRef<HTMLDivElement>(null);

  const { searchOpen, setSearchOpen } = useSearchStore();
  const [inputValue, setInputValue] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchCatOpen, setSearchCatOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const isSearchMode = debouncedQuery.trim().length > 0;
  const { data: searchData, isLoading: searchLoading } = useSearchTopics(debouncedQuery, searchCategory || undefined);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue), 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (!searchCatOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchCatRef.current && !searchCatRef.current.contains(e.target as Node)) {
        setSearchCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchCatOpen]);

  const handleRoute = async () => {
    if (!user || !user.id || !user.email || !user.role) {
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
        category: null,
        thumbnail: null,
        visibility: "PRIVATE",
      });
      toast.success("글을 생성하였습니다.");
      navigate(`/topics/${created.id}/create`);
    } catch (error) {
      console.log(error);
      toast.error("글 생성에 실패했습니다.");
    }
  };

  const sectionCategories = useMemo(() => {
    if (category !== "") return [];
    return CLASS_CATEGORY.filter((c) => c.category !== "").filter((c) => list.some((t) => t.category === c.category));
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

  return (
    <main className="w-full flex-1 min-h-screen lg:flex ">
      {isAuthed ? (
        <div
          className={cn(
            "fixed right-1/2 translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-full border border-violet-200/60 bg-white/65 dark:border-sky-500/15 dark:bg-slate-950/40 shadow-2xl shadow-black/10 ring-1 ring-violet-300/15 dark:ring-sky-500/10 backdrop-blur-xl supports-backdrop-filter:bg-white/70 supports-backdrop-filter:dark:bg-slate-950/45",
            "bottom-5 lg:bottom-10",
          )}
        >
          <Button
            variant="ghost"
            className={`relative overflow-hidden py-5 px-6 rounded-full border text-white shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-300 ease-out before:absolute before:inset-0 before:bg-linear-to-r before:from-white/0 before:via-white/25 before:to-white/0 before:translate-x-[-130%] hover:before:translate-x-[130%] before:transition-transform before:duration-700 before:ease-out ${
              "border-violet-400/45 bg-linear-to-b from-[#9d9ad8]/90 to-[#5e5baa]/80 shadow-violet-400/25 hover:border-violet-300/70 hover:brightness-110 hover:shadow-[0_10px_28px_-6px_rgba(124,121,199,0.5)]"
            }`}
            onClick={handleRoute}
          >
            <PencilLine />글 쓰기
          </Button>
          <AppDraftsDialog>
            <div className="relative">
              <Button
                variant="ghost"
                className={`relative overflow-hidden rounded-full w-10 h-10 border dark:border-sky-500/15 dark:bg-white/10 shadow-sm shadow-black/5 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-300 ease-out before:absolute before:inset-0 before:bg-linear-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-130%] hover:before:translate-x-[130%] before:transition-transform before:duration-700 before:ease-out ${
                  "border-violet-200/60 bg-white/55 text-primary dark:text-foreground hover:bg-white/75 hover:border-violet-300/80 hover:shadow-[0_10px_28px_-8px_rgba(124,121,199,0.4)]"
                }`}
              >
                <NotebookPen />
              </Button>
              {draftCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-linear-to-b from-rose-500 to-red-600 text-[10px] font-semibold text-white shadow-md shadow-red-500/25 ring-2 ring-background">
                  {draftCount > 99 ? "99+" : draftCount}
                </span>
              )}
            </div>
          </AppDraftsDialog>
        </div>
      ) : null}
      {/* 카테고리 사이드바 - YouTube처럼 fixed 좌측 */}
      <aside
        className={`hidden lg:flex fixed left-0 top-[60px] bottom-0 w-56 flex-col overflow-y-auto bg-background pt-4 pb-6 px-2${searchOpen ? " !hidden" : ""}`}
      >
        <AppSidebar />
      </aside>
      {/* 사이드바 자리 확보용 spacer */}
      {!searchOpen && <div className="hidden lg:block shrink-0 w-56" />}
      {/* 글 목록 */}
      <section className="flex-1 min-w-0 flex flex-col gap-12 px-4 pt-4 pb-8">
        <div className="w-full flex flex-col gap-2">
          {/* 검색 패널 */}
          {searchOpen && (
            <div ref={searchPanelRef} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center rounded-xl border border-border bg-foreground/5 focus-within:border-primary/40 transition overflow-visible">
                {/* 카테고리 드롭다운 */}
                <div ref={searchCatRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setSearchCatOpen((v) => !v)}
                    className="inline-flex items-center gap-1 h-[42px] pl-3.5 pr-2 text-xs font-medium text-foreground/70 hover:text-primary transition"
                  >
                    <span className="max-w-[52px] truncate">
                      {searchCategory ? CLASS_CATEGORY.find((c) => c.category === searchCategory)?.label : "전체"}
                    </span>
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform duration-150", searchCatOpen && "rotate-180")}
                    />
                  </button>
                  {searchCatOpen && (
                    <div className="absolute left-0 top-full mt-1.5 z-50 w-40 rounded-xl border border-border bg-card py-1 shadow-xl shadow-black/10">
                      {CLASS_CATEGORY.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSearchCategory(searchCategory === cat.category ? "" : cat.category);
                            setSearchCatOpen(false);
                          }}
                          className={cn(
                            "w-full inline-flex items-center gap-2 px-3 py-2 text-xs transition [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0",
                            searchCategory === cat.category
                              ? "bg-primary/8 text-primary font-semibold"
                              : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                          )}
                        >
                          {cat.icon}
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* 구분선 */}
                <div className="h-5 w-px bg-border shrink-0" />
                {/* 텍스트 인풋 */}
                <div className="relative flex flex-1 items-center">
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="제목, 닉네임, 이메일로 검색..."
                    className="w-full bg-transparent py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  {inputValue && (
                    <button
                      type="button"
                      onClick={() => setInputValue("")}
                      className="absolute right-3 text-foreground/40 hover:text-foreground transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 제목 - 검색 시 숨김 */}
          {/* {!searchOpen && (
            <div className="flex flex-col gap-1">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {isMyView ? "나의 글" : "커뮤니티"}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({CLASS_CATEGORY.find((c) => c.category === category)?.label ?? "전체"})
                </span>
              </h4>
            </div>
          )} */}

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                  <SkeletonHotTopic />
                  <SkeletonHotTopic />
                  <SkeletonHotTopic />
                </div>
              ) : searchData && searchData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
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
          ) : searchOpen ? (
            <div className="w-full min-h-60 flex items-center justify-center">
              <p className="text-muted-foreground/40 text-sm">검색어를 입력해 주세요</p>
            </div>
          ) : listLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              <SkeletonHotTopic />
              <SkeletonHotTopic />
              <SkeletonHotTopic />
            </div>
          ) : list.length > 0 ? (
            category === "" ? (
              <div
                ref={scrollContainerRef}
                className={cn(
                  "h-[calc(100vh-96px)] overflow-y-auto pr-1 flex flex-col gap-14 snap-y snap-mandatory scroll-smooth",
                  isAuthed ? "pb-28 lg:pb-36" : "pb-10",
                )}
              >
                {CLASS_CATEGORY.filter((c) => c.category !== "").map((cat) => {
                  const items = list.filter((t) => t.category === cat.category);
                  if (items.length === 0) return null;

                  // 한 화면에서 보여줄 카드 수 (대략 1 스크린 기준)
                  const maxCards = 4;
                  const visibleItems = items.slice(0, maxCards);
                  const hasMore = items.length > visibleItems.length;
                  const isSingle = visibleItems.length === 1 && !hasMore;

                  return (
                    <section
                      key={cat.id}
                      data-section-id={cat.id}
                      className={cn(
                        "min-h-[calc(100vh-150px)] flex flex-col items-start px-2 sm:px-3 pt-0 snap-start",
                        isSingle ? "justify-between gap-4" : "justify-start gap-5",
                      )}
                    >
                      <div className="w-full flex flex-col gap-3 items-start">
                        <div className="flex items-center justify-between gap-4 w-full">
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

                        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch justify-items-start">
                          {visibleItems.map((t: Topic) => (
                            <div key={t.id} className="w-full">
                              <NewTopicCard props={t} />
                            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
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
