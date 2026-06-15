import { BodySectionSkeleton } from "@/components/public/skeletons/body-section-skeleton";
import { PageHeaderSkeleton } from "@/components/public/skeletons/page-header-skeleton";

export default function Loading() {
  return (
    <div className="relative">
      <PageHeaderSkeleton />
      <BodySectionSkeleton />
    </div>
  );
}
