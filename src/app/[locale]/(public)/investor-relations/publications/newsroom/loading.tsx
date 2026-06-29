import { BodySectionSkeleton } from "@/components/public/skeletons/body-section-skeleton";
import { PageHeaderSkeleton } from "@/components/public/skeletons/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative">
      <PageHeaderSkeleton />
      <BodySectionSkeleton />
      <div className="px-6 pb-12 md:px-12">
        <div className="mx-auto max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
            <div key={i} className="overflow-hidden rounded-xl border">
              <Skeleton className="aspect-video w-full" />
              <div className="space-y-2 p-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
