export default function EkipLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-5 w-72 bg-slate-100 rounded mt-2" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="h-10 bg-slate-100" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 border-t border-slate-100 flex items-center px-4 gap-4">
            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-40 bg-slate-100 rounded" />
            <div className="h-4 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
