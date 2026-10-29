import React from 'react';
import { ArrowDownUp, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function ProductSort({
  currentSort = 'newest',
  onSortChange,
  totalCount = 0,
  onOpenMobileFilters,
  activeFilterCount = 0,
}) {
  const sortTabs = [
    { id: 'popularity', label: 'Popularity' },
    { id: 'price_asc', label: 'Price -- Low to High' },
    { id: 'price_desc', label: 'Price -- High to Low' },
    { id: 'newest', label: 'Newest First' },
    { id: 'rating', label: 'Customer Rating' },
  ];

  return (
    <div className="bg-card rounded-xl border border-border shadow-2xs divide-y divide-border overflow-hidden">
      {/* Top Bar on Mobile: Filters Button + Result count */}
      <div className="flex items-center justify-between p-3 lg:hidden">
        <div className="text-xs text-muted-foreground font-medium">
          Showing <span className="font-bold text-foreground">{totalCount}</span> items
        </div>

        {onOpenMobileFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenMobileFilters}
            className="h-8 gap-1.5 text-xs font-semibold border-primary/40 text-primary"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Flipkart Horizontal Tab Strip */}
      <div className="px-4 py-2.5 flex items-center gap-4 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-foreground whitespace-nowrap">Sort By</span>
        <div className="flex items-center gap-5 sm:gap-6">
          {sortTabs.map((tab) => {
            const isActive = currentSort === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSortChange(tab.id)}
                className={`text-xs whitespace-nowrap py-1 transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground font-medium'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductSort;
