import { ArrowLeft, Search, X, type LucideIcon } from "lucide-react";

type SidebarPanelHeaderProps = {
  title: string;
  mode: "default" | "search" | "sub";
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onSearchOpen?: () => void;
  onSearchClose?: () => void;
  onBack?: () => void;
  subTitle?: string;
  actions?: Array<{
    icon: LucideIcon;
    label: string;
    onClick: () => void;
  }>;
};

function SidebarPanelHeader({
  title,
  mode,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "검색",
  onSearchOpen,
  onSearchClose,
  onBack,
  subTitle,
  actions = [],
}: SidebarPanelHeaderProps) {
  if (mode === "sub") {
    return (
      <div className="mb-2 flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-foreground/6 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="flex-1 truncate text-sm font-semibold text-foreground">{subTitle ?? title}</span>
      </div>
    );
  }

  if (mode === "search") {
    return (
      <div className="mb-2 flex items-center gap-2 px-1">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-foreground/4 px-2.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={onSearchClose}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-foreground/6 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <p className="text-sm font-bold text-foreground">{title}</p>
      <div className="flex items-center gap-0.5">
        {onSearchOpen && (
          <button
            type="button"
            onClick={onSearchOpen}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-foreground/6 hover:text-foreground"
            title="검색"
          >
            <Search className="h-4 w-4" />
          </button>
        )}
        {actions.map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-foreground/6 hover:text-foreground"
            title={label}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

export { SidebarPanelHeader };
