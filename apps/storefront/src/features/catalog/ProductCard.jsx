import React from 'react';
import { Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import { formatPrice, calculateDiscount } from '../../lib/formatters';
import { StockBadge, DiscountBadge } from '../../components/common/Badge';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export function ProductCard({ product, onSelect, onAddToCart, isSaved = false, onToggleWishlist }) {
  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

  const discount = calculateDiscount(product.price, product.compareAtPrice);

  return (
    <div
      onClick={() => onSelect(product.slug)}
      className="group bg-card text-card-foreground rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-royal-blue/40 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Image Surface */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
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

        {/* Wishlist Quick Action - Always visible & prominent */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) {
              onToggleWishlist(product);
            }
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isSaved
              ? 'bg-red-500 text-white shadow-md scale-105 ring-2 ring-red-500/30 hover:bg-red-600'
              : 'bg-background/95 backdrop-blur-md border border-border/80 text-foreground/70 hover:text-red-500 hover:border-red-200 shadow-sm hover:scale-110'
          }`}
          title={isSaved ? 'Remove from saved items' : 'Save to wishlist'}
          aria-label={isSaved ? 'Remove from saved items' : 'Save to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isSaved ? 'fill-white text-white' : 'hover:fill-red-500/20'
            }`}
          />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Stock Indicator */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-royal-blue">
              {product.category?.name || 'General'}
            </span>
            <StockBadge inStock={product.inStock} stockQuantity={product.totalStock} />
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-foreground group-hover:text-royal-blue line-clamp-2 mb-2 transition-colors">
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
        </div>

        {/* Bottom Price & Add CTA */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-foreground">
              {formatPrice(product.price)}
            </div>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </div>
            )}
          </div>

          <Button
            size="icon"
            variant={product.inStock ? 'navy' : 'secondary'}
            disabled={!product.inStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="h-9 w-9 rounded-xl"
            title={product.inStock ? 'Add to Cart' : 'Out of Stock'}
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
