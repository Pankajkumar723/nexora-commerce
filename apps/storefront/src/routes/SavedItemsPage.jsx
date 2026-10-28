import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Zap,
  ArrowRight,
  ArrowLeft,
  Star,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { formatPrice, calculateDiscount } from '../lib/formatters';
import { StockBadge, DiscountBadge } from '../components/common/Badge';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export function SavedItemsPage({
  items = [],
  onRemoveItem,
  onMoveToCart,
  onMoveAllToCart,
  onClearAll,
  onDirectOrder,
  onSelectProduct,
  onExploreAll,
}) {
  const [justAddedId, setJustAddedId] = useState(null);

  const handleAddToCartWithFeedback = (product) => {
    onMoveToCart(product);
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId(null);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <button
          onClick={onExploreAll}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Catalog</span>
        </button>
        <span>/</span>
        <span className="font-semibold text-foreground">Saved Items (Wishlist)</span>
      </nav>

      {/* Page Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-red-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
                <span>My Saved Items</span>
                <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-bold">
                  {items.length} {items.length === 1 ? 'Product' : 'Products'}
                </Badge>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Review your saved products, move them to your cart, or order directly with instant checkout.
              </p>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-destructive gap-1.5 shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onMoveAllToCart}
              className="text-xs font-semibold gap-1.5 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Move All to Cart</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {items.length === 0 ? (
        /* Empty State */
        <div className="bg-card text-card-foreground border border-border rounded-3xl p-10 sm:p-16 text-center max-w-2xl mx-auto shadow-sm space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto ring-8 ring-red-500/5">
            <Heart className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              Your Saved Items List is Empty
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              You haven't saved any equipment yet. Click the heart icon on any product in our catalog to save your favorites here and order them whenever you're ready.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={onExploreAll}
              size="lg"
              className="px-6 py-6 rounded-xl font-bold text-xs uppercase tracking-wider gap-2 shadow-md"
            >
              <span>Explore Products Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* Saved Products Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((product) => {
              const primaryImage =
                product.images && product.images.length > 0
                  ? product.images[0].url
                  : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
              const discount = calculateDiscount(product.price, product.compareAtPrice);
              const inStock = product.inStock !== false && (product.totalStock === undefined || product.totalStock > 0);
              const isAdded = justAddedId === product.id;

              return (
                <div
                  key={product.id || product.slug}
                  className="group bg-card text-card-foreground rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between relative"
                >
                  {/* Top Image Surface */}
                  <div
                    className="relative aspect-[4/3] bg-muted overflow-hidden cursor-pointer"
                    onClick={() => onSelectProduct(product.slug)}
                  >
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Badges Overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      <DiscountBadge discount={discount} />
                    </div>

                    {/* Unsave / Remove from wishlist button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(product.id);
                      }}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                      title="Unsave item (Remove from wishlist)"
                    >
                      <Heart className="w-4 h-4 fill-white text-white" />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category & Stock Indicator */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                          {product.category?.name || 'Equipment'}
                        </span>
                        <StockBadge inStock={inStock} stockQuantity={product.totalStock} />
                      </div>

                      {/* Product Name */}
                      <h3
                        onClick={() => onSelectProduct(product.slug)}
                        className="text-sm font-semibold text-foreground hover:text-primary line-clamp-2 mb-2 transition-colors cursor-pointer"
                      >
                        {product.name}
                      </h3>

                      {/* Ratings */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span className="font-semibold text-foreground">{product.rating || 5.0}</span>
                        <span>({product.reviewCount || 0})</span>
                      </div>

                      {/* Pricing */}
                      <div className="pt-2 pb-3 border-t border-border flex items-baseline gap-2">
                        <span className="text-base font-bold text-foreground">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Order Now & Move to Cart & Unsave */}
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      {/* Move to Cart Button */}
                      <Button
                        size="sm"
                        disabled={!inStock}
                        onClick={() => handleAddToCartWithFeedback(product)}
                        className={`w-full text-xs font-semibold gap-1.5 shadow-xs transition-colors ${
                          isAdded ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{inStock ? 'Move to Cart' : 'Out of Stock'}</span>
                          </>
                        )}
                      </Button>

                      {/* Order Directly / Instant Checkout Button */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={!inStock}
                          onClick={() => {
                            if (onDirectOrder) {
                              onDirectOrder(product);
                            } else {
                              onMoveToCart(product);
                            }
                          }}
                          className="w-full text-[11px] font-semibold gap-1"
                          title="Instant Order / Checkout"
                        >
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Order Now</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRemoveItem(product.id)}
                          className="w-full text-[11px] font-medium text-muted-foreground hover:text-destructive gap-1 hover:border-destructive/40"
                          title="Remove from saved items"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Unsave</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Trust Highlights */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
        <div className="p-4 bg-card rounded-2xl border border-border flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Free Express Shipping</h4>
            <p className="text-[11px] text-muted-foreground">All orders over ₹1,999</p>
          </div>
        </div>

        <div className="p-4 bg-card rounded-2xl border border-border flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Official Warranty</h4>
            <p className="text-[11px] text-muted-foreground">100% genuine brand warranty</p>
          </div>
        </div>

        <div className="p-4 bg-card rounded-2xl border border-border flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">14-Day Doorstep Returns</h4>
            <p className="text-[11px] text-muted-foreground">Hassle-free instant refund</p>
          </div>
        </div>
      </section>
    </div>
  );
}
