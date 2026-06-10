import { useDmMessages, useDmRooms, useGetOrCreateRoom, useSendMessage } from "@/hooks/useDm";
import { useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";
import { dmApi } from "@/api/dm";
import type { DmMessage } from "@/api/dm";
import {
  ArrowLeft,
  File as FileIcon,
  Image,
  Images,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  X,
} from "lucide-react";
import { DmNewChatPanel } from "@/components/dm/DmNewChatPanel";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("ko");

// ── 날짜 구분선 라벨 ──
function getDateLabel(dateStr: string): string {
  const d = dayjs(dateStr);
  const today = dayjs();
  if (d.isSame(today, "day")) return "오늘";
  if (d.isSame(today.subtract(1, "day"), "day")) return "어제";
  return d.format("YYYY년 M월 D일");
}

// 메시지 배열에 날짜 구분선 삽입
type ChatItem = { type: "date"; label: string } | { type: "message"; data: DmMessage };
function buildChatItems(messages: DmMessage[]): ChatItem[] {
  const result: ChatItem[] = [];
  let lastDate = "";
  for (const msg of messages) {
    const date = dayjs(msg.created_at).format("YYYY-MM-DD");
    if (date !== lastDate) {
      lastDate = date;
      result.push({ type: "date", label: getDateLabel(msg.created_at) });
    }
    result.push({ type: "message", data: msg });
  }
  return result;
}

export default function DmPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNewChat = searchParams.get("new") === "1";
  const [activeRoomId, setActiveRoomId] = useState<string | null>(isNewChat ? null : searchParams.get("room"));

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setActiveRoomId(null);
      return;
    }
    setActiveRoomId(searchParams.get("room"));
  }, [searchParams]);

  // 입력
  const [inputText, setInputText] = useState("");
  const [previewFile, setPreviewFile] = useState<{ file: File; url: string; type: "image" | "file" } | null>(null);

  // DM 메시지 검색
  const [showSearch, setShowSearch] = useState(false);
  const [chatSearchText, setChatSearchText] = useState("");
  const [chatSearchDate, setChatSearchDate] = useState("");

  // 이미지 보관함
  const [showGallery, setShowGallery] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const getOrCreate = useGetOrCreateRoom();

  const { data: rooms = [] } = useDmRooms();
  const { data: messages = [] } = useDmMessages(activeRoomId);
  const sendMessage = useSendMessage(activeRoomId);
  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  // URL 파라미터 user 로 DM 자동 진입
  useEffect(() => {
    const targetUserId = searchParams.get("user");
    if (targetUserId && user?.id) {
      getOrCreate.mutate(targetUserId, {
        onSuccess: (roomId) => {
          setActiveRoomId(roomId);
          setSearchParams({ room: roomId });
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 새 메시지 오면 DM창 하단 스크롤
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  // 방 전환 시 검색/갤러리 패널 초기화 + 메시지 입력 포커스
  useEffect(() => {
    setShowSearch(false);
    setShowGallery(false);
    setChatSearchText("");
    setChatSearchDate("");
    if (activeRoomId) {
      const timer = setTimeout(() => messageInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [activeRoomId]);

  const handleBackToList = () => {
    setActiveRoomId(null);
    setSearchParams({});
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile({ file, url: URL.createObjectURL(file), type });
    e.target.value = "";
  };

  const handleSend = async () => {
    if (!activeRoomId || (!inputText.trim() && !previewFile)) return;
    if (previewFile) {
      const { url, type } = await dmApi.uploadFile(previewFile.file);
      sendMessage.mutate({ content: inputText.trim() || undefined, file_url: url, file_type: type });
      URL.revokeObjectURL(previewFile.url);
      setPreviewFile(null);
    } else {
      sendMessage.mutate({ content: inputText.trim() });
    }
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // DM 검색 필터된 메시지
  const filteredMessages = useMemo(() => {
    if (!showSearch || (!chatSearchText.trim() && !chatSearchDate)) return messages;
    return messages.filter((msg) => {
      const textMatch = !chatSearchText.trim() || msg.content?.toLowerCase().includes(chatSearchText.toLowerCase());
      const dateMatch = !chatSearchDate || dayjs(msg.created_at).format("YYYY-MM-DD") === chatSearchDate;
      return textMatch && dateMatch;
    });
  }, [messages, chatSearchText, chatSearchDate, showSearch]);

  // 날짜 구분선 포함 DM 아이템
  const chatItems = useMemo(() => buildChatItems(filteredMessages), [filteredMessages]);

  // 이미지 보관함
  const galleryImages = useMemo(() => messages.filter((m) => m.file_type === "image" && m.file_url), [messages]);

  const closeNewChat = () => {
    navigate("/dm");
  };

  return (
    <div className="flex h-[calc(100dvh-53px)] lg:h-dvh overflow-hidden bg-background">
      {isNewChat ? (
        <DmNewChatPanel onClose={closeNewChat} />
      ) : activeRoomId && activeRoom ? (
        <div className="flex flex-1 flex-col min-w-0">
          {/* 헤더 */}
          <div className="flex items-center gap-2 border-b border-border dark:border-white/10 px-4 py-3">
            {/* 뒤로가기 */}
            <button
              type="button"
              onClick={handleBackToList}
              className="shrink-0 rounded-lg p-1.5 text-foreground/50 dark:text-white/50 transition hover:bg-foreground/5 dark:bg-white/8 hover:text-foreground dark:text-white"
              title="목록으로"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            {activeRoom.other_user?.profile_image ? (
              <img
                src={activeRoom.other_user.profile_image}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-500/40 text-sm font-semibold text-foreground/80 dark:text-white/80">
                {activeRoom.other_user?.nickname?.charAt(0) ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground dark:text-white">
                {activeRoom.other_user?.nickname}
              </p>
              <p className="truncate text-[11px] text-foreground/40 dark:text-white/40">
                {activeRoom.other_user?.email}
              </p>
            </div>
            {/* 검색 토글 */}
            <button
              type="button"
              title="메시지 검색"
              onClick={() => {
                setShowSearch((p) => !p);
                setShowGallery(false);
              }}
              className={cn(
                "rounded-lg p-1.5 transition hover:bg-foreground/5 dark:bg-white/8",
                showSearch
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-foreground/40 dark:text-white/40 hover:text-foreground/70 dark:text-white/70",
              )}
            >
              <Search className="h-4 w-4" />
            </button>
            {/* 이미지 보관함 토글 */}
            <button
              type="button"
              title="이미지 보관함"
              onClick={() => {
                setShowGallery((p) => !p);
                setShowSearch(false);
              }}
              className={cn(
                "rounded-lg p-1.5 transition hover:bg-foreground/5 dark:bg-white/8",
                showGallery
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-foreground/40 dark:text-white/40 hover:text-foreground/70 dark:text-white/70",
              )}
            >
              <Images className="h-4 w-4" />
            </button>
          </div>

          {/* 검색 패널 */}
          {showSearch && (
            <div className="flex items-center gap-2 border-b border-border dark:border-white/10 bg-foreground/2 dark:bg-white/3 px-5 py-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-foreground/40 dark:text-white/40" />
              <input
                type="text"
                value={chatSearchText}
                onChange={(e) => setChatSearchText(e.target.value)}
                placeholder="메시지 내용 검색..."
                className="flex-1 bg-transparent text-sm text-foreground dark:text-white placeholder:text-foreground/30 dark:text-white/30 focus:outline-none"
                autoFocus
              />
              <input
                type="date"
                value={chatSearchDate}
                onChange={(e) => setChatSearchDate(e.target.value)}
                className="hidden sm:block rounded-lg border border-border dark:border-white/10 bg-foreground/3 dark:bg-white/5 px-2 py-1 text-xs text-foreground/70 dark:text-white/70 focus:outline-none"
              />
              {(chatSearchText || chatSearchDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setChatSearchText("");
                    setChatSearchDate("");
                  }}
                  className="text-foreground/30 dark:text-white/30 hover:text-foreground dark:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <span className="text-[11px] text-foreground/30 dark:text-white/30">{filteredMessages.length}건</span>
            </div>
          )}

          {/* ── 이미지 보관함 ── */}
          {showGallery ? (
            <div className="flex-1 overflow-y-auto p-5">
              <p className="mb-3 text-sm font-semibold text-foreground/70 dark:text-white/70">
                이미지 보관함 ({galleryImages.length})
              </p>
              {galleryImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-foreground/20 dark:text-white/20">
                  <Images className="h-10 w-10" />
                  <p className="text-sm">공유된 이미지가 없습니다</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {galleryImages.map((msg) => (
                    <a
                      key={msg.id}
                      href={msg.file_url!}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-lg"
                    >
                      <img
                        src={msg.file_url!}
                        alt=""
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                        <p className="text-[10px] text-foreground/70 dark:text-white/70">
                          {dayjs(msg.created_at).format("M.D")}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── 메시지 목록 ── */
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-5 py-4">
              {/* 상단 프로필 카드 */}
              {!showSearch && (
                <div className="mb-6 flex flex-col items-center gap-2 pt-4 pb-2">
                  {activeRoom.other_user?.profile_image ? (
                    <img
                      src={activeRoom.other_user.profile_image}
                      alt=""
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-border dark:ring-white/10"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/50 to-purple-500/50 text-xl font-bold text-foreground/80 dark:text-white/80 ring-2 ring-border dark:ring-white/10">
                      {activeRoom.other_user?.nickname?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <p className="text-base font-semibold text-foreground dark:text-white">
                    {activeRoom.other_user?.nickname}
                  </p>
                  {activeRoom.other_user?.email && (
                    <p className="text-xs text-foreground/40 dark:text-white/40">{activeRoom.other_user.email}</p>
                  )}
                  <div className="mt-1 h-px w-24 bg-foreground/8 dark:bg-white/10" />
                </div>
              )}

              {chatItems.length === 0 && showSearch && (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-foreground/25 dark:text-white/25">
                  <Search className="h-8 w-8" />
                  <p className="text-sm">검색 결과가 없습니다</p>
                </div>
              )}
              <div className="space-y-1">
                {chatItems.map((item, idx) => {
                  if (item.type === "date") {
                    return (
                      <div key={`date-${idx}`} className="flex items-center gap-3 py-3">
                        <div className="h-px flex-1 bg-foreground/5 dark:bg-white/8" />
                        <span className="text-[11px] text-foreground/40 dark:text-white/35 font-medium">
                          {item.label}
                        </span>
                        <div className="h-px flex-1 bg-foreground/5 dark:bg-white/8" />
                      </div>
                    );
                  }
                  const msg = item.data;
                  const isMine = msg.sender_id === user?.id;
                  const other = activeRoom.other_user;
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex items-start gap-2 pt-2", isMine ? "justify-end" : "justify-start")}
                    >
                      {/* 상대방 아바타 (이름 옆에 정렬) */}
                      {!isMine &&
                        (other?.profile_image ? (
                          <img
                            src={other.profile_image}
                            alt=""
                            className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-500/40 text-xs font-semibold text-foreground/80 dark:text-white/80">
                            {other?.nickname?.charAt(0) ?? "?"}
                          </div>
                        ))}
                      <div
                        className={cn("flex max-w-[85%] sm:max-w-[68%] flex-col", isMine ? "items-end" : "items-start")}
                      >
                        {/* 상대방 이름 */}
                        {!isMine && (
                          <p className="mb-1 pl-1 text-[11px] font-semibold text-foreground/55 dark:text-white/55">
                            {other?.nickname}
                          </p>
                        )}
                        {msg.file_url && msg.file_type === "image" && (
                          <a href={msg.file_url} target="_blank" rel="noreferrer" className="mb-1">
                            <img src={msg.file_url} alt="이미지" className="max-h-60 w-auto rounded-xl object-cover" />
                          </a>
                        )}
                        {msg.file_url && msg.file_type === "file" && (
                          <a
                            href={msg.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              "mb-1 flex items-center gap-2 rounded-xl px-3 py-2 text-xs underline",
                              isMine
                                ? "bg-indigo-500/80 dark:bg-indigo-400/70 text-white"
                                : "bg-foreground/8 dark:bg-white/10 text-foreground/80 dark:text-white/80",
                            )}
                          >
                            <FileIcon className="h-4 w-4 shrink-0" />
                            파일 다운로드
                          </a>
                        )}
                        {msg.content && (
                          <div
                            className={cn(
                              "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                              isMine
                                ? "rounded-tr-sm bg-indigo-500/80 dark:bg-indigo-400/70 text-white"
                                : "rounded-tl-sm bg-foreground/8 dark:bg-white/10 text-foreground/90 dark:text-white/90",
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                        )}
                        <p
                          className={cn(
                            "mt-1 text-[10px] text-foreground/25 dark:text-white/25 px-1",
                            isMine ? "text-right" : "text-left",
                          )}
                        >
                          {dayjs(msg.created_at).format("A h:mm")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 파일 미리보기 */}
          {previewFile && (
            <div className="mx-5 mb-2 flex items-center gap-3 rounded-xl border border-border dark:border-white/10 bg-foreground/3 dark:bg-white/5 px-3 py-2">
              {previewFile.type === "image" ? (
                <img src={previewFile.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground/8 dark:bg-white/10">
                  <FileIcon className="h-5 w-5 text-foreground/60 dark:text-white/60" />
                </div>
              )}
              <span className="flex-1 truncate text-xs text-foreground/60 dark:text-white/60">
                {previewFile.file.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(previewFile.url);
                  setPreviewFile(null);
                }}
                className="text-foreground/40 dark:text-white/40 hover:text-foreground dark:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* 입력창 */}
          <div className="border-t border-border dark:border-white/10 px-5 py-3">
            <div className="flex items-end gap-2 rounded-xl border border-border dark:border-white/10 bg-foreground/3 dark:bg-white/5 px-3 py-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="mb-1 text-foreground/40 dark:text-white/40 hover:text-foreground/80 dark:text-white/80"
                title="이미지 첨부"
              >
                <Image className="h-5 w-5" />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "image")}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mb-1 text-foreground/40 dark:text-white/40 hover:text-foreground/80 dark:text-white/80"
                title="파일 첨부"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileSelect(e, "file")} />
              <textarea
                ref={messageInputRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지 보내기 (Enter 전송, Shift+Enter 줄바꿈)"
                className="flex-1 resize-none bg-transparent text-sm text-foreground dark:text-white placeholder:text-foreground/30 dark:text-white/30 focus:outline-none"
                style={{ maxHeight: "120px" }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sendMessage.isPending || (!inputText.trim() && !previewFile)}
                className="mb-1 text-indigo-400 hover:text-indigo-300 disabled:opacity-30"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground/5">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">대화를 선택해주세요</p>
            <p className="mt-1 text-xs text-muted-foreground/60">왼쪽에서 대화를 선택하거나 새 대화를 시작하세요</p>
          </div>
        </div>
      )}
    </div>
  );
}
