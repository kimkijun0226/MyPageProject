import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { hideWelcomeForToday, isWelcomeHiddenToday } from "@/lib/siteWelcomeStorage";
import { cn } from "@/lib/utils";

export function SiteWelcomeModal() {
  const [open, setOpen] = useState(() => !isWelcomeHiddenToday());

  const handleHideToday = () => {
    hideWelcomeForToday();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-zinc-900/70 backdrop-blur-none dark:bg-zinc-950/75"
        className={cn(
          "gap-0 overflow-hidden border-zinc-200 bg-white p-0 backdrop-blur-none sm:max-w-md",
          "shadow-[0_24px_56px_-16px_rgba(0,0,0,0.42)]",
          "dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-[0_28px_64px_-16px_rgba(0,0,0,0.7)]",
          "supports-backdrop-filter:bg-white dark:supports-backdrop-filter:bg-zinc-900",
        )}
      >
        <div className="h-0.5 w-full bg-primary" aria-hidden />

        <div className="relative px-7 pb-6 pt-7">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-5 top-5 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="inline-block -rotate-3 rounded border border-dashed border-primary/45 px-2 py-0.5 text-[10px] font-bold tracking-[0.2em] text-primary">
            OPEN
          </span>

          <DialogTitle className="mt-5 text-[1.625rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            안녕하세요!
          </DialogTitle>

          <DialogDescription asChild>
            <p className="mt-5 text-[14px] leading-[1.85] text-zinc-600 dark:text-zinc-300">
              프론트엔드 개발자 <span className="font-medium text-zinc-900 dark:text-zinc-100">김기준</span>
              입니다. 방문해 주셔서 감사합니다. 이곳에는 제 이력서와 개인 프로젝트를 정리해 두었으니,
              편히 둘러봐 주시면 감사하겠습니다. 보시면서 떠오르는 의견이나 피드백은 댓글로 남겨
              주시기 바라며, 궁금하신 점은 메일로 보내 주시면 감사드리겠습니다.
            </p>
          </DialogDescription>

          <button
            type="button"
            onClick={handleHideToday}
            className="mt-6 text-[11px] text-zinc-400 underline-offset-2 transition hover:text-zinc-600 hover:underline dark:hover:text-zinc-300"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
