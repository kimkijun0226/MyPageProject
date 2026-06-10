import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MessageSquare, UserPlus } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import type { DmRoom } from "@/api/dm";
import { useDmRooms } from "@/hooks";
import { DmAvatar, DmListItem } from "@/components/dm/DmListItem";
import { SidebarSearchBar } from "./SidebarSearchBar";

function formatRoomTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = dayjs(dateStr);
  const now = dayjs();
  if (d.isSame(now, "day")) return d.format("A h:mm");
  if (d.isSame(now.subtract(1, "day"), "day")) return "어제";
  if (d.isSame(now, "year")) return d.format("M/D");
  return d.format("YY/M/D");
}

function lastMessagePreview(room: DmRoom): string {
  if (room.last_message_type === "image") return "사진";
  if (room.last_message_type === "file") return "파일";
  return room.last_message_content || "대화를 시작해보세요";
}

type SidebarDmPanelProps = {
  onStartNewChat: () => void;
};

function SidebarDmPanel({ onStartNewChat }: SidebarDmPanelProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeRoomId = searchParams.get("room");
  const isNewChat = searchParams.get("new") === "1";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: rooms = [] } = useDmRooms();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredRooms = useMemo(
    () =>
      debouncedSearch
        ? rooms.filter((r) => {
            const q = debouncedSearch.toLowerCase();
            const nickname = r.other_user?.nickname?.toLowerCase() ?? "";
            const email = r.other_user?.email?.toLowerCase() ?? "";
            return nickname.includes(q) || email.includes(q);
          })
        : rooms,
    [rooms, debouncedSearch],
  );

  const handleSelectRoom = (room: DmRoom) => {
    navigate(`/dm?room=${room.id}`);
    setSearch("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 pb-3">
        <SidebarSearchBar
          value={search}
          onChange={setSearch}
          placeholder="대화 검색"
          onClear={() => setSearch("")}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {filteredRooms.map((room) => {
            const other = room.other_user;
            const unread = room.unread_count ?? 0;
            return (
              <DmListItem
                key={room.id}
                active={room.id === activeRoomId}
                onClick={() => handleSelectRoom(room)}
                avatar={<DmAvatar src={other?.profile_image} name={other?.nickname} />}
                title={other?.nickname ?? "알 수 없음"}
                subtitle={lastMessagePreview(room)}
                meta={
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatRoomTime(room.last_message_at)}
                  </span>
                }
                trailing={
                  unread > 0 ? (
                    <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-md bg-rose-500/90 px-1 text-[10px] font-semibold text-white">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : undefined
                }
              />
            );
          })}

          {filteredRooms.length === 0 && debouncedSearch && (
            <p className="py-8 text-center text-[13px] text-muted-foreground">검색 결과가 없습니다</p>
          )}

          {filteredRooms.length === 0 && !debouncedSearch && rooms.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground/50">
              <MessageSquare className="h-5 w-5" />
              <p className="text-[12px]">대화가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 pt-2">
        <DmListItem
          action
          active={isNewChat}
          onClick={onStartNewChat}
          avatar={
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
              <UserPlus className="h-4 w-4" />
            </span>
          }
          title="새 대화 시작"
          subtitle="닉네임 또는 이메일로 검색"
        />
      </div>
    </div>
  );
}

export { SidebarDmPanel };
