import { Skeleton } from "../ui";
import { TOPIC_CARD_HEIGHT_CLASS } from "../topics/topic-grid";

function SkeletonHotTopic() {
  return (
    <div className={`flex w-full ${TOPIC_CARD_HEIGHT_CLASS} flex-col gap-3 rounded-xl border border-border bg-card p-4`}>
      <div className="flex flex-1 gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <Skeleton className="h-[108px] w-[108px] shrink-0 rounded-lg" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export { SkeletonHotTopic };
