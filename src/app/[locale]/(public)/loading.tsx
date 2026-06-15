import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      {/* Hero */}
      <div className="-mt-16">
        <div className="relative h-[90vh] min-h-[500px]">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
      </div>
      {/* Quick stats */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-12 sm:grid-cols-4 md:px-12">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={i} className="space-y-2 rounded-lg border p-5">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
      {/* Solutions */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-12 sm:grid-cols-3 md:px-12">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={i} className="space-y-3 rounded-lg border p-6">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </>
  );
}
