import { CardGridSkeleton } from "@/components/public/skeletons/card-grid-skeleton";
import { PageHeaderSkeleton } from "@/components/public/skeletons/page-header-skeleton";

export default function Loading() {
  return (
    <div className="relative">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={3} columns={3} />
    </div>
  );
}
