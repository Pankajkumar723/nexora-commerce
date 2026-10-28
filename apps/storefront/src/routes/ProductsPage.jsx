import React from 'react';
import { ProductCard } from '../features/catalog/ProductCard';
import { ProductSort } from '../features/catalog/ProductSort';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

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
  wishlistItems = [],
  onToggleWishlist,
}) {
  const wishlistSet = new Set((wishlistItems || []).map((p) => p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Catalog & Equipment'
              : 'Catalog & Equipment'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Precision consumer hardware, audio monitors, mechanical keys, and everyday EDC.
          </p>
        </div>
      </div>

      {/* Main Full-Width Products Listing (Sidebar removed as requested) */}
      <main className="w-full space-y-6">
        <ProductSort
          currentSort={currentSort}
          onSortChange={onSortChange}
          totalCount={meta.total || products.length}
        />

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <EmptyState
            title={searchTerm ? `No products matching "${searchTerm}"` : 'No products found'}
            description={
              searchTerm
                ? 'Check for spelling errors or try searching with generic terms like "headphones", "keyboard", or "audio".'
                : 'No equipment found matching the current criteria.'
            }
            actionText="Clear Search & View All"
            onAction={() => {
              if (onSearchChange) onSearchChange('');
              if (onResetFilters) onResetFilters();
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id || product.slug}
                product={product}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
                isSaved={wishlistSet.has(product.id)}
                onToggleWishlist={onToggleWishlist}
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
  );
}
