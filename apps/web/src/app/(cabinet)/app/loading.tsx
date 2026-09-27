import { Skeleton } from "@nina/ui";

export default function CabinetLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-3.5">
            <Skeleton className="size-12 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
