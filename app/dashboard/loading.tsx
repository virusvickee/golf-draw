export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 w-1/3 bg-slate-800 rounded-lg mb-8" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="h-40 bg-slate-800 rounded-xl" />
        <div className="h-40 bg-slate-800 rounded-xl" />
        <div className="h-40 bg-slate-800 rounded-xl" />
      </div>
      <div className="h-[400px] bg-slate-800 rounded-xl mt-8" />
    </div>
  );
}
