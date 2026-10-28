import React, { useState } from 'react';
import { ProductCard } from '../features/catalog/ProductCard';
import { ProductFilters } from '../features/catalog/ProductFilters';
import { ProductSort } from '../features/catalog/ProductSort';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export function ProductsPage({
  products = [],
  meta = {},
  categories = [],
  isLoading,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onPriceChange,
  currentSort,
  onSortChange,
  currentPage = 1,
  onPageChange,
  onResetFilters,
  onSelectProduct,
  onAddToCart,
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeChips = [];
  if (selectedCategory) {
    const cat = categories.find((c) => c.slug === selectedCategory);
    activeChips.push({
      label: `Category: ${cat ? cat.name : selectedCategory}`,
      onRemove: () => onSelectCategory(''),
    });
  }
  if (minPrice || maxPrice) {
    activeChips.push({
      label: `Price: ₹${minPrice || 0} - ₹${maxPrice || 'Any'}`,
      onRemove: () => onPriceChange('', ''),
    });
  }
  if (searchTerm) {
    activeChips.push({
      label: `Search: "${searchTerm}"`,
      onRemove: () => onSearchChange(''),
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Catalog & Equipment
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Precision consumer hardware, audio monitors, mechanical keys, and everyday EDC.
        </p>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
          {activeChips.map((chip, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="gap-1.5 py-1 px-3 text-xs font-semibold"
            >
              <span>{chip.label}</span>
              <button
                onClick={chip.onRemove}
                className="hover:text-destructive focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}
          <Button
            variant="link"
            size="sm"
            onClick={onResetFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Mobile Filters Toggle Button */}
      <div className="lg:hidden flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileFiltersOpen(true)}
          className="gap-2"
        >
          <Filter className="w-4 h-4 text-royal-blue" />
          <span>Filter Products</span>
        </Button>
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={onPriceChange}
              onResetFilters={onResetFilters}
            />
          </div>
        </aside>

        {/* Products Listing Area */}
        <main className="lg:col-span-3 space-y-6">
          <ProductSort
            currentSort={currentSort}
            onSortChange={onSortChange}
            totalCount={meta.total || products.length}
          />

          {isLoading ? (
            <ProductGridSkeleton count={6} />
          ) : products.length === 0 ? (
            <EmptyState onAction={onResetFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id || product.slug}
                  product={product}
                  onSelect={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="gap-1 text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="text-xs text-muted-foreground font-medium">
                Page <span className="font-bold text-foreground">{currentPage}</span> of{' '}
                <span className="font-bold text-foreground">{meta.totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= meta.totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="gap-1 text-xs font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-card border-l border-border p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Filter className="w-4 h-4 text-royal-blue" />
                  Filter Equipment
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  onSelectCategory(cat);
                  setMobileFiltersOpen(false);
                }}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={onPriceChange}
                onResetFilters={() => {
                  onResetFilters();
                  setMobileFiltersOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
