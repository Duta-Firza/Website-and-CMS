import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  count?: number;
  columns?: 2 | 3 | 4;
}

export function CardGridSkeleton({ count = 6, columns = 3 }: Props) {
  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];
  return (
    <div className="px-6 py-12 md:px-12">
      <div className={`mx-auto grid max-w-6xl gap-6 ${colClass}`}>
        {Array.from({ length: count }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={i} className="space-y-3 rounded-lg border p-5">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
