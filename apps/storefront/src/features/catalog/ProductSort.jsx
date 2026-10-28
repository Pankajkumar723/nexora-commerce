import React from 'react';
import { ArrowDownUp } from 'lucide-react';

export function ProductSort({ currentSort = 'newest', onSortChange, totalCount = 0 }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 sm:p-3.5 rounded-xl border border-border shadow-2xs">
      <div className="text-xs text-muted-foreground font-medium">
        Showing <span className="font-bold text-foreground">{totalCount}</span> {totalCount === 1 ? 'product' : 'products'}
      </div>

      <div className="flex items-center gap-2">
        <ArrowDownUp className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-xs font-semibold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
        >
          <option value="newest">Featured & Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
}
