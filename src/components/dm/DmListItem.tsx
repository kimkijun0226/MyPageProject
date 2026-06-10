import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DmListItemProps = {
  avatar: ReactNode;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  /** 강조 액션 행 — 새 대화 시작 등 */
  action?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

function DmListItem({
  avatar,
  title,
  subtitle,
  meta,
  trailing,
  active,
  action,
  onClick,
  disabled,
  className,
}: DmListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        action
          ? cn(
              "border border-primary/25 bg-primary/10 py-3 shadow-sm",
              active
                ? "border-primary/40 bg-primary/15"
                : "hover:border-primary/35 hover:bg-primary/15 active:bg-primary/20",
            )
          : active
            ? "bg-muted"
            : "hover:bg-muted/60",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <span className="shrink-0">{avatar}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-[13px] font-medium text-foreground",
              action && "font-semibold",
            )}
          >
            {title}
          </p>
          {meta}
        </div>
        {subtitle && (
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="truncate text-[12px] text-muted-foreground">{subtitle}</p>
            {trailing}
          </div>
        )}
        {!subtitle && trailing && <div className="mt-0.5 flex justify-end">{trailing}</div>}
      </div>
    </button>
  );
}

function DmAvatar({ src, name, action }: { src?: string | null; name?: string | null; action?: boolean }) {
  if (src) {
    return <img src={src} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-border/40" />;
  }
  return (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium",
        action ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      {name?.charAt(0) ?? "?"}
    </span>
  );
}

export { DmListItem, DmAvatar };
