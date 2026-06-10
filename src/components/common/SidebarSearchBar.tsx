import { type RefObject } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  autoFocus?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
};

function SidebarSearchBar({
  value,
  onChange,
  placeholder = "검색",
  className,
  onClear,
  autoFocus,
  inputRef,
}: SidebarSearchBarProps) {
  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 rounded-lg bg-muted/50 px-3 ring-1 ring-transparent transition focus-within:bg-background focus-within:ring-border",
        className,
      )}
    >
      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => (onClear ? onClear() : onChange(""))}
          className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export { SidebarSearchBar };
