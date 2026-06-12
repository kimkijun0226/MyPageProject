import type { UserInfo } from "@/api";
import { Button } from "@/components/ui";
import { useFollow, useGetOrCreateRoom } from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import { MessageCircle, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LOGIN_REQUIRED_MESSAGE = "로그인시 이용가능한 서비스";

type AuthorProfileCardProps = {
  authorInfo: UserInfo | null | undefined;
  variant?: "default" | "compact";
  align?: "start" | "end";
  className?: string;
};

function AuthorProfileCard({ authorInfo, variant = "default", align = "start", className }: AuthorProfileCardProps) {
  const isCompact = variant === "compact";
  const [isImageError, setIsImageError] = useState(false);
  const hasProfileImage = !!authorInfo?.profile_image && !isImageError;
  const { user } = useAuthStore();
  const isAuthed = Boolean(user?.id);
  const { isFollowing, followerCount, toggleFollow, isLoading } = useFollow(authorInfo?.id ?? "");
  const navigate = useNavigate();
  const getOrCreate = useGetOrCreateRoom();

  const handleFollow = () => {
    if (!isAuthed) {
      toast.info(LOGIN_REQUIRED_MESSAGE);
      return;
    }
    toggleFollow();
  };

  const handleDm = () => {
    if (!isAuthed) {
      toast.info(LOGIN_REQUIRED_MESSAGE);
      return;
    }
    if (!authorInfo?.id) return;
    getOrCreate.mutate(authorInfo.id, {
      onSuccess: (roomId) => navigate(`/dm?room=${roomId}`),
    });
  };

  const isSelf = user?.id === authorInfo?.id;

  return (
    <section
      className={cn(
        "border border-border/50 bg-background/75 backdrop-blur-md",
        isCompact ? "max-w-[220px] rounded-lg px-2.5 py-2 shadow-sm" : "rounded-xl bg-muted/15 px-4 py-4 sm:px-5",
        className,
      )}
    >
      {!isCompact && (
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">작성자</p>
      )}
      <div
        className={cn(
          "flex items-center gap-2",
          align === "end" && "justify-end",
          !isCompact && "flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className={cn("flex min-w-0 items-center gap-2", align === "start" && "flex-1")}>
          {hasProfileImage ? (
            <img
              src={authorInfo.profile_image ?? undefined}
              alt="author profile"
              className={cn(
                "shrink-0 rounded-full object-cover ring-1 ring-border/60",
                isCompact ? "h-8 w-8" : "h-12 w-12",
              )}
              onError={() => setIsImageError(true)}
            />
          ) : (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-1 ring-border/60",
                isCompact ? "h-8 w-8 text-[11px]" : "h-12 w-12 text-sm",
              )}
            >
              {authorInfo?.nickname?.charAt(0) || "작"}
            </div>
          )}
          <div className="min-w-0">
            <h3 className={cn("truncate font-semibold text-foreground", isCompact ? "text-xs" : "text-[15px]")}>
              {authorInfo?.nickname || "작성자"}
            </h3>
            {!isCompact && <p className="text-xs text-muted-foreground">팔로워 {followerCount}명</p>}
          </div>
        </div>

        {!isSelf && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                isCompact ? "h-7 w-7 rounded-md p-0" : "h-9 rounded-lg px-3 text-xs",
                isFollowing && "border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500",
              )}
              onClick={handleFollow}
              disabled={isAuthed && isLoading}
              title={isFollowing ? "언팔로우" : "팔로우"}
            >
              {isFollowing ? <UserMinus className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
              {!isCompact && <span className="ml-1">{isFollowing ? "언팔로우" : "팔로우"}</span>}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={isCompact ? "h-7 w-7 rounded-md p-0" : "h-9 rounded-lg px-3 text-xs"}
              onClick={handleDm}
              disabled={isAuthed && getOrCreate.isPending}
              title="DM"
            >
              <MessageCircle className="h-3 w-3" />
              {!isCompact && <span className="ml-1">DM</span>}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export { AuthorProfileCard };
