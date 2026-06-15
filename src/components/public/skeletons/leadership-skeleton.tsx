import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  groups?: number;
  membersPerGroup?: number;
}

export function LeadershipSkeleton({ groups = 2, membersPerGroup = 4 }: Props) {
  return (
    <div className="px-6 py-12 md:px-12">
      <div className="mx-auto max-w-6xl space-y-12">
        {Array.from({ length: groups }).map((_, g) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={g} className="space-y-6">
            <Skeleton className="h-7 w-48" />
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: membersPerGroup }).map((_, m) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                <div key={m} className="space-y-3">
                  <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
