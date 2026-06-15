import { Skeleton } from "@/components/ui/skeleton";

export function BodySectionSkeleton() {
  return (
    <div className="px-6 py-12 md:px-12">
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}
