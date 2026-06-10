import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, UserPlus } from "lucide-react";
import { userApi, type UserInfo } from "@/api";
import { useAuthStore } from "@/stores";
import { useDmRooms, useGetOrCreateRoom } from "@/hooks";
import { DmAvatar, DmListItem } from "@/components/dm/DmListItem";
import { SidebarSearchBar } from "@/components/common/SidebarSearchBar";

type DmNewChatPanelProps = {
  onClose: () => void;
};

function DmNewChatPanel({ onClose }: DmNewChatPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: rooms = [] } = useDmRooms();
  const getOrCreate = useGetOrCreateRoom();

  useEffect(() => {
    const timer = setTimeout(() => searchRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<UserInfo[]>({
    queryKey: ["user", "search", "dm-new", debouncedSearch],
    queryFn: () => userApi.searchUsers(debouncedSearch, user!.id),
    enabled: !!user?.id && debouncedSearch.length > 0,
  });

  const roomByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const room of rooms) {
      if (room.other_user?.id) map.set(room.other_user.id, room.id);
    }
    return map;
  }, [rooms]);

  const hasQuery = debouncedSearch.length > 0;
  const hasResults = hasQuery && users.length > 0;

  const handleSelect = (target: UserInfo) => {
    if (!user?.id) return;
    const existingRoomId = roomByUserId.get(target.id);
    if (existingRoomId) {
      navigate(`/dm?room=${existingRoomId}`);
      onClose();
      return;
    }
    getOrCreate.mutate(target.id, {
      onSuccess: (roomId) => {
        navigate(`/dm?room=${roomId}`);
        onClose();
      },
    });
  };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-background">
      <button
        type="button"
        onClick={onClose}
        className="absolute left-4 top-4 z-10 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        title="닫기"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div
        className={
          hasResults
            ? "flex flex-1 flex-col items-center overflow-y-auto px-6 pb-8 pt-16"
            : "flex flex-1 flex-col items-center justify-center px-6 pb-12"
        }
      >
        <div className="flex w-full max-w-sm flex-col items-center">
          {!hasResults && (
            <div className="mb-6 flex flex-col items-center text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <UserPlus className="h-6 w-6 text-muted-foreground" />
              </span>
              <h2 className="text-[17px] font-semibold text-foreground">새 대화</h2>
              <p className="mt-1.5 text-[13px] text-muted-foreground">닉네임 또는 이메일로 상대를 찾아보세요</p>
            </div>
          )}

          <SidebarSearchBar
            inputRef={searchRef}
            value={search}
            onChange={setSearch}
            placeholder="닉네임 또는 이메일"
            onClear={() => setSearch("")}
            autoFocus
            className="h-10 w-full bg-muted/40"
          />

          <div className="mt-6 w-full">
            {!hasQuery && (
              <p className="text-center text-[12px] text-muted-foreground/70">검색어를 입력해 주세요</p>
            )}
            {hasQuery && isLoading && (
              <p className="py-8 text-center text-[13px] text-muted-foreground">검색 중...</p>
            )}
            {hasQuery && isError && (
              <p className="py-8 text-center text-[13px] text-rose-400">검색에 실패했습니다. 다시 시도해 주세요.</p>
            )}
            {hasQuery && !isLoading && !isError && users.length === 0 && (
              <p className="py-8 text-center text-[13px] text-muted-foreground">검색 결과가 없습니다</p>
            )}
            {hasResults && (
              <div className="flex flex-col gap-0.5">
                <p className="mb-2 px-3 text-center text-[11px] font-medium text-muted-foreground">
                  {users.length}명
                </p>
                {users.map((u) => (
                  <UserResultItem
                    key={u.id}
                    user={u}
                    hasExistingRoom={roomByUserId.has(u.id)}
                    onSelect={() => handleSelect(u)}
                    disabled={getOrCreate.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserResultItem({
  user: u,
  hasExistingRoom,
  onSelect,
  disabled,
}: {
  user: UserInfo;
  hasExistingRoom?: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <DmListItem
      onClick={onSelect}
      disabled={disabled}
      avatar={<DmAvatar src={u.profile_image} name={u.nickname} />}
      title={u.nickname ?? "알 수 없음"}
      subtitle={u.email}
      trailing={
        <span className="shrink-0 text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
          {hasExistingRoom ? "대화 열기 →" : "대화하기 →"}
        </span>
      }
    />
  );
}

export { DmNewChatPanel };
