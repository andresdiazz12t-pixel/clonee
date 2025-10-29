import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="card animate-pulse">
      <div className="h-48 bg-neutral-200" />
      <div className="card-body">
        <div className="h-6 bg-neutral-200 rounded mb-3" />
        <div className="h-4 bg-neutral-200 rounded mb-2" />
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4" />
        <div className="flex gap-2">
          <div className="h-8 bg-neutral-200 rounded w-20" />
          <div className="h-8 bg-neutral-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
};
