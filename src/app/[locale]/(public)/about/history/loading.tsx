import { PageHeaderSkeleton } from "@/components/public/skeletons/page-header-skeleton";
import { TimelineSkeleton } from "@/components/public/skeletons/timeline-skeleton";

export default function Loading() {
  return (
    <div className="relative">
      <PageHeaderSkeleton />
      <TimelineSkeleton rows={6} />
    </div>
  );
}
