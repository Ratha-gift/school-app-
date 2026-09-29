/** Grey pulsing placeholders shown by loading.tsx while data loads. */
export function PageSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="កំពុងផ្ទុក...">
      <div className="mb-6 h-8 w-48 rounded-lg bg-slate-200" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 rounded-lg bg-slate-200" />
        ))}
      </div>
      <div className="space-y-2 rounded-lg bg-white p-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-10 rounded bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
