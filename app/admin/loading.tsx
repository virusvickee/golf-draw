export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 w-1/4 bg-slate-800 rounded-lg mb-8" />
      <div className="grid md:grid-cols-4 gap-6">
        <div className="h-32 bg-slate-800 rounded-xl" />
        <div className="h-32 bg-slate-800 rounded-xl" />
        <div className="h-32 bg-slate-800 rounded-xl" />
        <div className="h-32 bg-slate-800 rounded-xl" />
      </div>
      <div className="h-[500px] bg-slate-800 rounded-xl mt-8" />
    </div>
  );
}
