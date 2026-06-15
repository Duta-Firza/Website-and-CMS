import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  rows?: number;
}

export function TimelineSkeleton({ rows = 5 }: Props) {
  return (
    <div className="px-6 py-12 md:px-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {Array.from({ length: rows }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={i} className="flex gap-6">
            <div className="flex flex-col items-center">
              <Skeleton className="h-10 w-16 rounded" />
              {i < rows - 1 && <Skeleton className="mt-2 h-16 w-0.5 rounded-full" />}
            </div>
            <div className="flex-1 space-y-2 pb-2 pt-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
