const LoadingSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="animate-pulse space-y-3">
      {/* Header skeleton */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
        ))}
      </div>
      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="h-4 bg-slate-100 dark:bg-slate-800 rounded" style={{ width: `${60 + Math.random() * 40}%` }}></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
