export default function SikayetlerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-5 w-80 bg-slate-100 rounded mt-2" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-3 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-9 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="h-10 bg-slate-100" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 border-t border-slate-100 flex items-center px-4 gap-4">
            <div className="h-4 w-16 bg-slate-100 rounded" />
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-100 rounded" />
            <div className="h-4 w-32 bg-slate-100 rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
