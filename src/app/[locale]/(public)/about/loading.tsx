import { BodySectionSkeleton } from "@/components/public/skeletons/body-section-skeleton";
import { CardGridSkeleton } from "@/components/public/skeletons/card-grid-skeleton";
import { PageHeaderSkeleton } from "@/components/public/skeletons/page-header-skeleton";

export default function Loading() {
  return (
    <div className="relative">
      <PageHeaderSkeleton />
      <BodySectionSkeleton />
      <CardGridSkeleton count={4} columns={2} />
    </div>
  );
}
