import { Skeleton } from '@/components/ui/Skeleton';

export default function ScoresLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>

      {/* Progress bar */}
      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-800">
        <div className="flex justify-between mb-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-64 mt-4 mx-auto" />
      </div>

      {/* Score rows */}
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-slate-800/50 rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right space-y-1">
                <Skeleton className="h-6 w-12 ml-auto" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex gap-2">
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
