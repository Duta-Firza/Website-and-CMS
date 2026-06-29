import { BodySectionSkeleton } from "@/components/public/skeletons/body-section-skeleton";
import { PageHeaderSkeleton } from "@/components/public/skeletons/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative">
      <PageHeaderSkeleton />
      <BodySectionSkeleton />
      <div className="px-6 pb-12 md:px-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-[70vh] w-full rounded-xl" />
          <div className="flex justify-center">
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
