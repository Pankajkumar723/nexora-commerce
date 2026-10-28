import React, { useState } from 'react';
import { ProductCard } from '../features/catalog/ProductCard';
import { ProductFilters } from '../features/catalog/ProductFilters';
import { ProductSort } from '../features/catalog/ProductSort';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
          Catalog & Equipment
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Precision consumer hardware, audio monitors, mechanical keys, and everyday EDC.
        </p>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted font-medium">Active filters:</span>
          {activeChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-royal-blue border border-blue-200"
            >
              <span>{chip.label}</span>
              <button
                onClick={chip.onRemove}
                className="hover:text-navy focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <button
            onClick={onResetFilters}
            className="text-xs text-muted hover:text-navy underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Mobile Filters Toggle Button */}
      <div className="lg:hidden flex items-center justify-between">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs font-semibold text-navy shadow-sm"
        >
          <Filter className="w-4 h-4 text-royal-blue" />
          <span>Filter Products</span>
        </button>
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
              <button
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-white text-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-canvas transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-muted font-medium">
                Page <span className="font-bold text-navy">{currentPage}</span> of{' '}
                <span className="font-bold text-navy">{meta.totalPages}</span>
              </div>

              <button
                disabled={currentPage >= meta.totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-white text-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-canvas transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <span className="font-bold text-navy text-sm">Filters</span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-lg text-muted hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
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

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full mt-6 py-2.5 bg-royal-blue text-white rounded-xl text-xs font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
