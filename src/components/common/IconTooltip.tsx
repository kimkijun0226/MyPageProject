import { cn } from "@/lib/utils";

type IconTooltipProps = {
  label: string;
  children: React.ReactNode;
  sideOffset?: number;
};

export function IconTooltip({ label, children, sideOffset = 8 }: IconTooltipProps) {
  return (
    <div className="relative inline-flex group">
      {children}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-50 -translate-x-1/2 opacity-0 translate-y-1",
          "group-hover:opacity-100 group-hover:translate-y-0",
          "transition duration-150 ease-out",
        )}
        style={{ marginTop: sideOffset }}
      >
        <div className="relative rounded-lg border border-border bg-background/90 px-2.5 py-1.5 text-[11px] font-semibold text-foreground/80 shadow-lg backdrop-blur-sm whitespace-nowrap">
          {label}
          <span className="absolute left-1/2 -top-1 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-border bg-background/90" />
        </div>
      </div>
    </div>
  );
}

