import { Skeleton } from '@/components/ui/Skeleton';

export default function CharityLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Current charity card */}
      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start gap-10">
          <Skeleton className="h-40 w-40 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-6 w-full">
            <div className="space-y-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Skeleton className="h-11 w-44 rounded-xl" />
              <Skeleton className="h-11 w-44 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Percentage Card */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-800 space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full rounded-xl mt-4" />
        </div>

        {/* Contribution history */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between border-b border-slate-800/50 last:border-0">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-3 w-24 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
