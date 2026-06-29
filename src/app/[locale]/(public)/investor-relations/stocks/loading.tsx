import { BodySectionSkeleton } from "@/components/public/skeletons/body-section-skeleton";
import { PageHeaderSkeleton } from "@/components/public/skeletons/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative">
      <PageHeaderSkeleton />
      <BodySectionSkeleton />
      <div className="px-6 py-8 md:px-12">
        <div className="mx-auto max-w-4xl rounded-xl border p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}
