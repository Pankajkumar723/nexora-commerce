import React, { useState, useMemo } from 'react';
import { ProductCard } from '../features/catalog/ProductCard';
import { ProductSort } from '../features/catalog/ProductSort';
import { ProductFilters } from '../features/catalog/ProductFilters';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ChevronLeft, ChevronRight, ChevronRight as ChevronIcon, X, SlidersHorizontal } from 'lucide-react';
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
  currentSort = 'newest',
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

  // Local granular Flipkart-style filter state
  const [minRating, setMinRating] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [discountThreshold, setDiscountThreshold] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [assuredOnly, setAssuredOnly] = useState(false);
  const [offersOnly, setOffersOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Toggle brand selection
  const handleToggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  // Comprehensive reset for both local & lifted filter state
  const handleFullReset = () => {
    setMinRating(null);
    setSelectedBrands([]);
    setDiscountThreshold(null);
    setInStockOnly(false);
    setAssuredOnly(false);
    setOffersOnly(false);
    if (onResetFilters) onResetFilters();
  };

  // Active category details
  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const categoryTitle = activeCategoryObj?.name || (searchTerm ? `Search: "${searchTerm}"` : 'All Equipment & Hardware');

  // Compute filtered & sorted products
  const displayProducts = useMemo(() => {
    let list = [...products];

    // Rating filter
    if (minRating) {
      list = list.filter((p) => (p.rating || 5.0) >= minRating);
    }

    // Brands filter
    if (selectedBrands.length > 0) {
      list = list.filter((p) => {
        const name = p.name.toLowerCase();
        return selectedBrands.some((b) => name.includes(b.toLowerCase()));
      });
    }

    // Discount percentage filter
    if (discountThreshold) {
      list = list.filter((p) => {
        if (!p.compareAtPrice || Number(p.compareAtPrice) <= Number(p.price)) return false;
        const discount = Math.round(
          ((Number(p.compareAtPrice) - Number(p.price)) / Number(p.compareAtPrice)) * 100,
        );
        return discount >= discountThreshold;
      });
    }

    // Availability
    if (inStockOnly) {
      list = list.filter(
        (p) => p.inStock !== false && (p.totalStock === undefined || p.totalStock > 0),
      );
    }

    // Nexora Assured (high rating + in stock)
    if (assuredOnly) {
      list = list.filter((p) => (p.rating || 5.0) >= 4.7 && p.inStock !== false);
    }

    // Offers
    if (offersOnly) {
      list = list.filter(
        (p) => p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price),
      );
    }

    // Client-side sort options (e.g. Popularity & Rating)
    if (currentSort === 'popularity') {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (currentSort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (currentSort === 'price_asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (currentSort === 'price_desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return list;
  }, [
    products,
    minRating,
    selectedBrands,
    discountThreshold,
    inStockOnly,
    assuredOnly,
    offersOnly,
    currentSort,
  ]);

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (minRating ? 1 : 0) +
    selectedBrands.length +
    (discountThreshold ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (assuredOnly ? 1 : 0) +
    (offersOnly ? 1 : 0);

  const totalResults = displayProducts.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      {/* Flipkart-Style Breadcrumb Bar */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="hover:text-foreground cursor-pointer">Home</span>
        <ChevronIcon className="w-3 h-3 text-border" />
        <span className="hover:text-foreground cursor-pointer">Catalog</span>
        {activeCategoryObj && (
          <>
            <ChevronIcon className="w-3 h-3 text-border" />
            <span className="font-semibold text-foreground">{activeCategoryObj.name}</span>
          </>
        )}
      </nav>

      {/* Main 2-Column Layout: Left Sidebar + Right Products Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN: Flipkart-Style Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 self-start">
          <ProductFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={onPriceChange}
            minRating={minRating}
            onRatingChange={setMinRating}
            selectedBrands={selectedBrands}
            onToggleBrand={handleToggleBrand}
            discountThreshold={discountThreshold}
            onDiscountChange={setDiscountThreshold}
            inStockOnly={inStockOnly}
            onToggleInStock={setInStockOnly}
            assuredOnly={assuredOnly}
            onToggleAssured={setAssuredOnly}
            offersOnly={offersOnly}
            onToggleOffers={setOffersOnly}
            onResetFilters={handleFullReset}
          />
        </aside>

        {/* RIGHT COLUMN: Products Main Stream */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* Flipkart Category Header & Results Count */}
          <div className="bg-card p-4 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                {categoryTitle}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                (Showing 1 – {displayProducts.length} of {meta.total || displayProducts.length} products)
              </p>
            </div>

            {/* Mobile Filters Trigger Button */}
            <div className="lg:hidden flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMobileFilterOpen(true)}
                className="h-9 gap-1.5 text-xs font-semibold border-primary/40 text-primary w-full sm:w-auto"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ml-1">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Flipkart Sort Bar */}
          <ProductSort
            currentSort={currentSort}
            onSortChange={onSortChange}
            totalCount={displayProducts.length}
            onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
            activeFilterCount={activeFilterCount}
          />

          {/* Product Grid Area */}
          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : displayProducts.length === 0 ? (
            <EmptyState
              title={
                searchTerm
                  ? `No products matching "${searchTerm}"`
                  : 'No products match the applied filters'
              }
              description="Try clearing some filter criteria like price range, brand, or rating to view more products."
              actionText="Reset All Filters"
              onAction={handleFullReset}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5">
              {displayProducts.map((product) => (
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
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="gap-1 text-xs font-semibold h-9"
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
                className="gap-1 text-xs font-semibold h-9"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Slide-Over Drawer for Flipkart Filters */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-card h-full flex flex-col shadow-2xl z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                  Filters
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto p-3">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={onSelectCategory}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={onPriceChange}
                minRating={minRating}
                onRatingChange={setMinRating}
                selectedBrands={selectedBrands}
                onToggleBrand={handleToggleBrand}
                discountThreshold={discountThreshold}
                onDiscountChange={setDiscountThreshold}
                inStockOnly={inStockOnly}
                onToggleInStock={setInStockOnly}
                assuredOnly={assuredOnly}
                onToggleAssured={setAssuredOnly}
                offersOnly={offersOnly}
                onToggleOffers={setOffersOnly}
                onResetFilters={handleFullReset}
                className="border-0 shadow-none"
              />
            </div>

            {/* Bottom Apply Bar */}
            <div className="p-4 border-t border-border bg-card flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFullReset}
                className="flex-1 h-10 text-xs font-semibold"
              >
                Clear All
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 h-10 text-xs font-bold"
              >
                Apply ({totalResults})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
