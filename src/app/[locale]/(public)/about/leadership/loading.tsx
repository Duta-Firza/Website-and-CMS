import { LeadershipSkeleton } from "@/components/public/skeletons/leadership-skeleton";
import { PageHeaderSkeleton } from "@/components/public/skeletons/page-header-skeleton";

export default function Loading() {
  return (
    <div className="relative">
      <PageHeaderSkeleton />
      <LeadershipSkeleton groups={2} membersPerGroup={4} />
    </div>
  );
}
