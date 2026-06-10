import { cn } from "@/lib/utils";

type IconTooltipProps = {
  label: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom";
  sideOffset?: number;
  disabled?: boolean;
};

export function IconTooltip({ label, children, side = "top", sideOffset = 8, disabled }: IconTooltipProps) {
  if (disabled) return <>{children}</>;

  const positionClass =
    side === "right"
      ? "left-full top-1/2 -translate-y-1/2 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
      : side === "bottom"
        ? "left-1/2 top-full -translate-x-1/2 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
        : "left-1/2 bottom-full -translate-x-1/2 -translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100";

  const arrowClass =
    side === "right"
      ? "absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-b border-border bg-background/90"
      : side === "bottom"
        ? "absolute left-1/2 -top-1 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-border bg-background/90"
        : "absolute left-1/2 -bottom-1 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-border bg-background/90";

  return (
    <div className="relative inline-flex shrink-0 group">
      {children}
      <div
        className={cn("pointer-events-none absolute z-50 transition duration-150 ease-out", positionClass)}
        style={side === "right" ? { marginLeft: sideOffset } : { marginTop: sideOffset }}
      >
        <div className="relative rounded-lg border border-border bg-background/90 px-2.5 py-1.5 text-[11px] font-semibold text-foreground/80 shadow-lg backdrop-blur-sm whitespace-nowrap">
          {label}
          <span className={cn("h-2 w-2", arrowClass)} />
        </div>
      </div>
    </div>
  );
}
