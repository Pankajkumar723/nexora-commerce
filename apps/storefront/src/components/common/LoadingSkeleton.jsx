import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-card border border-border p-4 flex flex-col justify-between shadow-sm overflow-hidden">
      <div>
        <div className="w-full h-56 rounded-lg bg-gray-200 shimmer mb-4" />
        <div className="h-4 bg-gray-200 shimmer rounded w-1/3 mb-2" />
        <div className="h-5 bg-gray-200 shimmer rounded w-4/5 mb-3" />
        <div className="h-4 bg-gray-200 shimmer rounded w-1/4 mb-4" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-6 bg-gray-200 shimmer rounded w-20" />
        <div className="h-9 bg-gray-200 shimmer rounded-lg w-28" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-8">
      <div className="space-y-4">
        <div className="w-full h-96 rounded-2xl bg-gray-200 shimmer" />
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-lg bg-gray-200 shimmer" />
          <div className="w-20 h-20 rounded-lg bg-gray-200 shimmer" />
          <div className="w-20 h-20 rounded-lg bg-gray-200 shimmer" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-5 bg-gray-200 shimmer rounded w-1/4" />
        <div className="h-8 bg-gray-200 shimmer rounded w-3/4" />
        <div className="h-6 bg-gray-200 shimmer rounded w-1/3" />
        <div className="h-24 bg-gray-200 shimmer rounded w-full" />
        <div className="h-12 bg-gray-200 shimmer rounded w-full" />
      </div>
    </div>
  );
}
