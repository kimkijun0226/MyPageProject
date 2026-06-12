import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bell,
  CircleUser,
  FileText,
  Heart,
  MessageCircle,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { CLASS_CATEGORY, DEFAULT_CATEGORY, getCategoryAddLabel } from "@/constants/category.constant";
import { cn } from "@/lib/utils";
import {
  formatCountBadge,
  useAuthStore,
  useSearchStore,
  useBrowseCategoryStore,
  useSidebarStore,
  type SidebarNavTab,
} from "@/stores";
import { useCategoryUnreadCounts, useDmRooms, useDmUnreadCount, useNotification, useUser } from "@/hooks";
import { IconTooltip } from "./IconTooltip";
import { SidebarDmPanel } from "./SidebarDmPanel";
import { SidebarSearchBar } from "./SidebarSearchBar";
import type { NotificationType } from "@/api";
import { getNotificationDisplayPreview, getNotificationDisplayTitle } from "@/lib/notificationContent";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

dayjs.extend(relativeTime);
dayjs.locale("ko");

const typeLabel: Record<NotificationType, string> = {
  follow: "팔로우",
  new_post: "새 글",
  comment: "댓글",
  reply: "답글",
  topic_like: "좋아요",
  comment_like: "댓글 좋아요",
};

type NavItemProps = {
  icon: ReactNode;
  label: string;
  to?: string;
  active?: boolean;
  collapsed: boolean;
  onClick?: () => void;
  badge?: number;
};

function NavItem({ icon, label, to, active, collapsed, onClick, badge }: NavItemProps) {
  const className = cn(
    "group relative flex items-center text-[13px] transition-colors",
    collapsed
      ? "mx-auto h-10 w-10 justify-center rounded-lg"
      : "h-10 w-full gap-3 rounded-lg px-3",
    collapsed && active && "bg-muted ring-2 ring-foreground/15",
    !collapsed && active && "bg-muted font-medium text-foreground",
    !collapsed && !active && "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    collapsed && !active && "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    "cursor-pointer",
  );

  const inner = (
    <>
      <span
        className={cn(
          "shrink-0 [&>svg]:h-[17px] [&>svg]:w-[17px]",
          active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        {icon}
      </span>
      {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
      {badge != null && badge > 0 && (
        <span
          className={cn(
            "flex items-center justify-center rounded-md bg-rose-500/90 font-semibold text-white",
            collapsed
              ? "absolute -right-0.5 -top-0.5 h-3.5 min-w-3.5 px-0.5 text-[8px]"
              : "h-[18px] min-w-[18px] px-1 text-[10px]",
          )}
        >
          {formatCountBadge(badge)}
        </span>
      )}
    </>
  );

  const node = to ? (
    <Link to={to} className={className}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );

  if (!collapsed) return node;

  return (
    <div className="flex w-full justify-center">
      <IconTooltip label={label} side="right">
        {node}
      </IconTooltip>
    </div>
  );
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const map: Record<NotificationType, { icon: React.ReactNode; className: string }> = {
    follow: { icon: <UserPlus className="h-4 w-4" />, className: "bg-emerald-500/20 text-emerald-400" },
    new_post: { icon: <FileText className="h-4 w-4" />, className: "bg-violet-500/18 text-violet-400" },
    comment: { icon: <MessageCircle className="h-4 w-4" />, className: "bg-sky-500/18 text-sky-400" },
    reply: { icon: <MessageCircle className="h-4 w-4" />, className: "bg-indigo-500/18 text-indigo-400" },
    topic_like: { icon: <Heart className="h-4 w-4" />, className: "bg-rose-500/18 text-rose-400" },
    comment_like: { icon: <Heart className="h-4 w-4" />, className: "bg-pink-500/18 text-pink-400" },
  };
  const { icon, className } = map[type] ?? map.new_post;
  return (
    <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", className)}>{icon}</div>
  );
}

type PanelCoords = { bottom: number; left: number; width: number };

function SidebarNotifications({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [panelCoords, setPanelCoords] = useState<PanelCoords | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const updatePanelCoords = () => {
    const anchor = ref.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    const margin = 12;
    setPanelCoords({
      bottom: window.innerHeight - rect.top + 8,
      left: window.innerWidth - width - margin,
      width,
    });
  };

  useEffect(() => {
    if (!open) {
      setPanelCoords(null);
      return;
    }
    updatePanelCoords();
    window.addEventListener("resize", updatePanelCoords);
    window.addEventListener("scroll", updatePanelCoords, true);
    return () => {
      window.removeEventListener("resize", updatePanelCoords);
      window.removeEventListener("scroll", updatePanelCoords, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const button = (
    <button
      type="button"
      onClick={() => {
        const next = !open;
        setOpen(next);
        if (next && unreadCount > 0) markAllAsRead.mutate();
      }}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Bell className={cn("h-[18px] w-[18px]", unreadCount > 0 && "text-rose-400")} />
      {unreadCount > 0 && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
      )}
    </button>
  );

  return (
    <div ref={ref} className="relative shrink-0">
      {collapsed ? (
        <IconTooltip label="알림" side="right">
          {button}
        </IconTooltip>
      ) : (
        button
      )}

      {open && panelCoords && (
        <div
          ref={panelRef}
          className="fixed z-[100] overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          style={{
            bottom: panelCoords.bottom,
            left: panelCoords.left,
            width: panelCoords.width,
          }}
        >
          <div className="border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">알림</span>
          </div>
          <div className="max-h-[min(24rem,50dvh)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-foreground/30">
                <Bell className="h-8 w-8" />
                <p className="text-sm">알림이 없습니다</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const title = getNotificationDisplayTitle(notification);
                const preview = getNotificationDisplayPreview(notification.content);
                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={cn(
                      "relative flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-foreground/5",
                      !notification.is_read && "bg-primary/5",
                    )}
                    onClick={() => {
                      markAsRead.mutate(notification.id);
                      setOpen(false);
                      if (notification.link) navigate(notification.link);
                    }}
                  >
                    {!notification.is_read && (
                      <span className="absolute left-2.5 top-4 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                    {!notification.thumbnail && <NotificationIcon type={notification.type} />}
                    {notification.thumbnail && (
                      <img
                        src={notification.thumbnail}
                        alt="썸네일"
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {typeLabel[notification.type]}
                        </span>
                        <span className="shrink-0 text-[11px] text-foreground/40">
                          {dayjs(notification.created_at).fromNow()}
                        </span>
                      </div>
                      <div className="mt-1.5 min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground/90">{title}</p>
                        {preview ? (
                          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-foreground/55">{preview}</p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type SidebarNavToggleProps = {
  tab: SidebarNavTab;
  categoryUnread: number;
  dmUnread: number;
  onChange: (tab: SidebarNavTab) => void;
};

function SidebarNavToggle({ tab, categoryUnread, dmUnread, onChange }: SidebarNavToggleProps) {
  const tabs: { id: SidebarNavTab; label: string; badge: number }[] = [
    { id: "categories", label: "카테고리", badge: categoryUnread },
    { id: "chat", label: "DM", badge: dmUnread },
  ];

  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/50 p-1">
      {tabs.map((t) => {
        const isActive = tab === t.id;
        const badgeLabel = formatCountBadge(t.badge);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 rounded-md py-2 text-[13px] font-medium transition-all",
              isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {badgeLabel && (
              <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md bg-rose-500/90 px-1 text-[10px] font-semibold text-white">
                {badgeLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const browseCategory = useBrowseCategoryStore((s) => s.category);
  const isOnHome = location.pathname === "/";
  const isOnDm = location.pathname === "/dm";
  const isOnTopicDetail = /^\/topics\/\d+\/detail$/.test(location.pathname);
  const isOnTopicEditor = /^\/topics\/\d+\/(create|update)$/.test(location.pathname);
  const isTopicCreate = /\/topics\/\d+\/create$/.test(location.pathname);
  const createCategoryLabel = isTopicCreate
    ? getCategoryAddLabel(searchParams.get("category") ?? DEFAULT_CATEGORY)
    : null;
  const searchCategory = searchParams.get("category");
  const urlCategory = isOnHome ? (searchCategory ?? DEFAULT_CATEGORY) : (searchCategory ?? browseCategory);
  const currentCategory =
    isOnTopicDetail || isOnTopicEditor ? (searchCategory ?? browseCategory) : urlCategory;
  const isCategoryContext = isOnHome || isOnTopicEditor || isOnTopicDetail;
  const { user } = useAuthStore();
  const { userInfo } = useUser();
  const { data: dmUnreadCount = 0 } = useDmUnreadCount();
  const { data: dmRooms = [] } = useDmRooms();
  const activeDmRoomId = searchParams.get("room");
  const isNewDmChat = searchParams.get("new") === "1";
  const activeDmRoom = activeDmRoomId ? dmRooms.find((r) => r.id === activeDmRoomId) : undefined;
  const chatPartner = activeDmRoom?.other_user;
  const { counts: categoryUnreadCounts, total: categoryUnreadTotal } = useCategoryUnreadCounts();
  const { collapsed, mobileOpen, navTab, toggleCollapsed, setMobileOpen, setNavTab } = useSidebarStore();
  const { searchQuery, setSearchQuery } = useSearchStore();
  const showFullSidebar = !collapsed || mobileOpen;
  const showIconRail = collapsed && !mobileOpen;

  const makeSearch = (category: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  useEffect(() => {
    if (isOnDm) setNavTab("chat");
    else if (isCategoryContext) setNavTab("categories");
  }, [isOnDm, isCategoryContext, setNavTab]);

  const handleCategorySearchChange = (value: string) => {
    setSearchQuery(value);
    if (!isOnHome) navigate({ pathname: "/", search: makeSearch(currentCategory) });
  };

  const handleNavTabChange = (tab: SidebarNavTab) => {
    setNavTab(tab);
    if (tab === "chat") navigate("/dm");
    else navigate({ pathname: "/", search: makeSearch(currentCategory) });
  };

  const handleStartNewChat = () => {
    navigate("/dm?new=1");
  };

  const handleCollapse = () => {
    toggleCollapsed();
    setMobileOpen(false);
  };

  const partnerAvatarIcon = chatPartner ? (
    chatPartner.profile_image ? (
      <img src={chatPartner.profile_image} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-border/40" />
    ) : (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[12px] font-medium text-muted-foreground">
        {chatPartner.nickname?.charAt(0) ?? "?"}
      </span>
    )
  ) : null;

  const categoryNav = (
    <div className={cn("flex flex-col gap-0.5", showFullSidebar ? "pb-2" : "px-1.5 py-2")}>
      {CLASS_CATEGORY.map((menu) => (
        <NavItem
          key={menu.id}
          icon={menu.icon}
          label={menu.label}
          to={`/${makeSearch(menu.category)}`}
          active={isCategoryContext && currentCategory === menu.category}
          collapsed={showIconRail}
          badge={
            showIconRail || (isCategoryContext && currentCategory === menu.category)
              ? 0
              : categoryUnreadCounts[menu.category] ?? 0
          }
        />
      ))}
    </div>
  );

  const collapsedDmNav = (
    <div className="flex flex-col gap-0.5 px-1.5 py-2">
      {chatPartner && activeDmRoomId ? (
        <NavItem
          icon={partnerAvatarIcon}
          label={chatPartner.nickname ?? "DM"}
          to={`/dm?room=${activeDmRoomId}`}
          active={!isNewDmChat}
          collapsed
          badge={activeDmRoom?.unread_count}
        />
      ) : (
        <NavItem
          icon={<MessageSquare className="h-[17px] w-[17px]" />}
          label="DM"
          to="/dm"
          active={isOnDm && !isNewDmChat && !activeDmRoomId}
          collapsed
          badge={dmUnreadCount}
        />
      )}
      <NavItem
        icon={<UserPlus className="h-[17px] w-[17px]" />}
        label="새 대화"
        to="/dm?new=1"
        active={isNewDmChat}
        collapsed
      />
    </div>
  );

  const iconRailNav = isOnDm && user?.id ? collapsedDmNav : categoryNav;

  return (
    <aside
      className={cn(
        "flex h-dvh shrink-0 flex-col border-border/60 bg-background transition-[width] duration-200 ease-out",
        showFullSidebar && "w-64 overflow-visible border-r",
        showIconRail && "w-0 overflow-hidden border-r-0 lg:w-[52px] lg:overflow-visible lg:border-r",
      )}
    >
        {showFullSidebar ? (
          <>
            {/* 헤더 */}
            <div className="flex h-14 shrink-0 items-center justify-between px-4">
              <button
                type="button"
                onClick={() => navigate({ pathname: "/", search: makeSearch(DEFAULT_CATEGORY) })}
                className="min-w-0 truncate text-left text-[15px] font-semibold tracking-tight text-foreground transition hover:opacity-80"
              >
                My Page
                {createCategoryLabel && (
                  <span className="ml-1 font-normal text-muted-foreground">({createCategoryLabel})</span>
                )}
              </button>
              <div className="flex items-center">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={mobileOpen ? () => setMobileOpen(false) : handleCollapse}
                  aria-label={mobileOpen ? "메뉴 닫기" : "사이드바 접기"}
                >
                  <TbLayoutSidebarLeftCollapse className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 네비게이션 */}
            <nav className="flex min-h-0 flex-1 flex-col overflow-hidden px-3">
              {user?.id && (
                <div className="shrink-0 pb-3">
                  <SidebarNavToggle
                    tab={navTab}
                    categoryUnread={categoryUnreadTotal}
                    dmUnread={dmUnreadCount}
                    onChange={handleNavTabChange}
                  />
                </div>
              )}

              {(!user?.id || navTab === "categories") && (
                <>
                  <div className="shrink-0 pb-3">
                    <SidebarSearchBar
                      value={searchQuery}
                      onChange={handleCategorySearchChange}
                      placeholder="키워드로 검색"
                      onClear={() => setSearchQuery("")}
                    />
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto">{categoryNav}</div>
                </>
              )}

              {user?.id && navTab === "chat" && (
                <div className="min-h-0 flex-1 overflow-hidden">
                  <SidebarDmPanel onStartNewChat={handleStartNewChat} />
                </div>
              )}
            </nav>

            {/* 하단: 프로필 + 알림 */}
            <div className="relative z-30 shrink-0 overflow-visible p-3">
              {user?.id ? (
                <div className="flex min-w-0 items-center gap-2 rounded-lg bg-muted/50 p-2 ring-1 ring-border/40">
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    {userInfo?.profile_image ? (
                      <img src={userInfo.profile_image} alt="profile" className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border/50" />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <CircleUser className="h-4 w-4 text-muted-foreground" />
                      </span>
                    )}
                    <span className="truncate text-[13px] font-medium text-foreground">{userInfo?.nickname || user.email}</span>
                  </button>
                  <SidebarNotifications collapsed={false} />
                </div>
              ) : (
                <NavLink
                  to="/sign-in"
                  className="flex h-10 items-center justify-center rounded-lg bg-muted px-3 text-[13px] font-medium text-foreground transition hover:bg-muted/80"
                >
                  로그인
                </NavLink>
              )}
            </div>
          </>
        ) : null}

        {showIconRail ? (
          <div className="hidden min-h-0 flex-1 flex-col lg:flex">
            <div className="flex h-14 shrink-0 items-center justify-center">
              <IconTooltip label="사이드바 펼치기" side="right">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={toggleCollapsed}
                  aria-label="사이드바 펼치기"
                >
                  <TbLayoutSidebarLeftExpand className="h-4 w-4" />
                </button>
              </IconTooltip>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto">{iconRailNav}</nav>

            <div className="shrink-0 p-2">
              {user?.id ? (
                <div className="flex flex-col items-center gap-1">
                  <IconTooltip label="프로필" side="right">
                    <button
                      type="button"
                      onClick={() => navigate("/profile")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {userInfo?.profile_image ? (
                        <img src={userInfo.profile_image} alt="profile" className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <CircleUser className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </IconTooltip>
                  <SidebarNotifications collapsed />
                </div>
              ) : (
                <IconTooltip label="로그인" side="right">
                  <NavLink
                    to="/sign-in"
                    className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <CircleUser className="h-[18px] w-[18px]" />
                  </NavLink>
                </IconTooltip>
              )}
            </div>
          </div>
        ) : null}
    </aside>
  );
}

export { AppSidebar };
