import React, { useMemo } from 'react';
import { Star, ShoppingBag, Eye, Heart, Zap, Truck } from 'lucide-react';
import { formatPrice, calculateDiscount, optimizeImageUrl } from '../../lib/formatters';
import { StockBadge, DiscountBadge } from '../../components/common/Badge';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getDeliveryQuotes, getStoredPincode } from '../../lib/deliveryUtils';

export function ProductCard({ product, onSelect, onAddToCart, isSaved = false, onToggleWishlist }) {
  const rawImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=75';
  const primaryImage = optimizeImageUrl(rawImage, 400);

  const discount = calculateDiscount(product.price, product.compareAtPrice);

  const deliveryQuote = useMemo(() => {
    return getDeliveryQuotes(getStoredPincode());
  }, []);

  return (
    <div
      onClick={() => onSelect(product.slug)}
      className="group bg-card text-card-foreground rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-royal-blue/40 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Image Surface */}
      <div className="relative aspect-[405/272] bg-muted overflow-hidden">
        <img
          src={primaryImage}
          srcSet={
            primaryImage.includes('mechanical-keyboard')
              ? '/images/products/mechanical-keyboard-405x272.webp 405w, /images/products/mechanical-keyboard-810x544.webp 810w'
              : primaryImage.includes('images.unsplash.com')
                ? `${optimizeImageUrl(rawImage, 320)} 320w, ${optimizeImageUrl(rawImage, 405)} 405w, ${optimizeImageUrl(rawImage, 600)} 600w`
                : undefined
          }
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 405px"
          alt={product.name}
          width={405}
          height={272}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <DiscountBadge discount={discount} />
        </div>

        {/* Wishlist Quick Action - Always visible & prominent with 40px touch target */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) {
              onToggleWishlist(product);
            }
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isSaved
              ? 'bg-red-500 text-white shadow-md scale-105 ring-2 ring-red-500/30 hover:bg-red-600'
              : 'bg-background/95 backdrop-blur-md border border-border/80 text-foreground/70 hover:text-red-500 hover:border-red-200 shadow-sm hover:scale-110'
          }`}
          title={isSaved ? 'Remove from saved items' : 'Save to wishlist'}
          aria-label={isSaved ? `Remove ${product.name} from saved items` : `Save ${product.name} to wishlist`}
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

          {/* Ratings & Nexora Assured Badge (Flipkart Style) */}
          <div className="flex items-center justify-between gap-1.5 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[11px] font-bold">
                <span>{product.rating || 5.0}</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
              <span className="text-[11px] text-muted-foreground">({product.reviewCount || 0})</span>
            </div>

            {/* Nexora Assured Badge */}
            {(product.rating || 5.0) >= 4.7 && (
              <span className="inline-flex items-center gap-0.5 bg-royal-blue text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide shadow-2xs">
                <Zap className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                <span>Assured</span>
              </span>
            )}
          </div>

          {/* Delivery Date Snippet (Amazon / Flipkart Style) */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 mb-1">
            <Truck className="w-3.5 h-3.5 text-royal-blue shrink-0" />
            <span>
              Get it by <strong className="font-semibold text-foreground">{deliveryQuote?.standard.formattedDate || '2-3 Days'}</strong>
            </span>
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
            className="h-10 w-10 min-w-[40px] min-h-[40px] rounded-xl"
            title={product.inStock ? `Add ${product.name} to Cart` : `${product.name} is Out of Stock`}
            aria-label={product.inStock ? `Add ${product.name} to Cart` : `${product.name} is Out of Stock`}
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
