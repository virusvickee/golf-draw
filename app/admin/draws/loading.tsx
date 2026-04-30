import { Skeleton } from '@/components/ui/Skeleton';

export default function DrawsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>

      {/* Draw rows */}
      <div className="grid gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-800">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
              
              {/* Lottery balls skeleton */}
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-16 w-16 rounded-full" />
                ))}
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="text-right space-y-2 hidden lg:block mr-4">
                  <Skeleton className="h-4 w-24 ml-auto" />
                  <Skeleton className="h-6 w-32 ml-auto" />
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                  <Skeleton className="h-11 flex-1 lg:w-32 rounded-xl" />
                  <Skeleton className="h-11 flex-1 lg:w-32 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
