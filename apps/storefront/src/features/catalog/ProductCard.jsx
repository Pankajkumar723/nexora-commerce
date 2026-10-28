import React from 'react';
import { Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import { formatPrice, calculateDiscount } from '../../lib/formatters';
import { StockBadge, DiscountBadge } from '../../components/common/Badge';

export function ProductCard({ product, onSelect, onAddToCart }) {
  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

  const discount = calculateDiscount(product.price, product.compareAtPrice);

  return (
    <div
      onClick={() => onSelect(product.slug)}
      className="group bg-white rounded-card border border-border overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Image Surface */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
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

        {/* Wishlist Quick Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert(`Saved "${product.name}" to wishlist`);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-muted hover:text-red-500 hover:bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Save to wishlist"
        >
          <Heart className="w-4 h-4" />
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
          <h3 className="text-sm font-semibold text-navy group-hover:text-royal-blue line-clamp-2 mb-2 transition-colors">
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-semibold text-gray-900">{product.rating || 5.0}</span>
            <span>({product.reviewCount || 0})</span>
          </div>
        </div>

        {/* Bottom Price & Add CTA */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-navy">
              {formatPrice(product.price)}
            </div>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <div className="text-xs text-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!product.inStock}
            className={`p-2.5 rounded-xl flex items-center justify-center transition active:scale-95 shadow-sm ${
              product.inStock
                ? 'bg-navy hover:bg-royal-blue text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={product.inStock ? 'Add to Cart' : 'Out of Stock'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
