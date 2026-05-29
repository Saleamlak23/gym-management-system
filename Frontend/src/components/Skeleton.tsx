import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-12 w-full' }) => (
  <div className={`${className} bg-slate-200 rounded-lg animate-pulse`} />
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 bg-white rounded-lg border border-slate-200">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-6 flex-1 bg-slate-200" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
);
