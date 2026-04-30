import { Skeleton } from '@/components/ui/Skeleton';

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-800 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            
            {/* Main chart area placeholder */}
            <div className="h-64 w-full flex items-end gap-2 px-2">
              {[...Array(12)].map((_, j) => (
                <Skeleton 
                  key={j} 
                  className="flex-1 rounded-t-lg" 
                  style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }}
                />
              ))}
            </div>

            {/* Chart legend/footer */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              {[1, 2, 3].map((k) => (
                <div key={k} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
