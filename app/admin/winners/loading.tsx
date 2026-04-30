import { Skeleton } from '@/components/ui/Skeleton';

export default function WinnersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Filter tabs */}
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Winners table */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>

        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="p-4 border-b border-slate-800/50 flex items-center gap-6">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-6 items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-4 w-28 hidden md:block" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="flex flex-col gap-1 hidden md:flex">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex gap-2 justify-end">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
