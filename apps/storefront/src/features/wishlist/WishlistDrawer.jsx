import React from 'react';
import { X, Trash2, ShoppingBag, Heart, ArrowRight, Check } from 'lucide-react';
import { formatPrice, calculateDiscount } from '../../lib/formatters';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';

export function WishlistDrawer({
  isOpen,
  onClose,
  items = [],
  onRemoveItem,
  onMoveToCart,
  onMoveAllToCart,
  onClearAll,
  onSelectProduct,
  onViewFullPage,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card text-card-foreground shadow-2xl flex flex-col justify-between border-l border-border animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-base text-foreground">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-red-500" />
              </div>
              <span>Saved Items</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Wishlist Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">Your wishlist is empty</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 mb-6">
                  Explore our curated audio, desk, and wearable gear and click the heart icon on items you love.
                </p>
                <Button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold"
                >
                  Explore Products
                </Button>
              </div>
            ) : (
              items.map((product) => {
                const imageUrl =
                  product.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
                const discount = calculateDiscount(product.price, product.compareAtPrice);
                const inStock = product.inStock !== false && (product.totalStock === undefined || product.totalStock > 0);

                return (
                  <div
                    key={product.id || product.slug}
                    className="flex gap-3.5 p-3.5 rounded-2xl bg-muted/40 border border-border/80 hover:border-primary/40 transition group"
                  >
                    <img
                      src={imageUrl}
                      alt={product.name}
                      onClick={() => {
                        if (onSelectProduct && product.slug) {
                          onSelectProduct(product.slug);
                        }
                      }}
                      className="w-16 h-16 rounded-xl object-cover bg-background border border-border flex-shrink-0 cursor-pointer hover:opacity-90"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            if (onSelectProduct && product.slug) {
                              onSelectProduct(product.slug);
                            }
                          }}
                        >
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-primary block">
                            {product.category?.name || 'Gear'}
                          </span>
                          <h4 className="text-xs font-bold text-foreground truncate max-w-[170px] hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(product.id)}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          title="Remove from saved items"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <div>
                          <div className="text-xs font-bold text-foreground">
                            {formatPrice(product.price)}
                          </div>
                          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                            <div className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(product.compareAtPrice)}
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          disabled={!inStock}
                          onClick={() => onMoveToCart(product)}
                          className="h-7 px-2.5 text-[11px] font-semibold gap-1.5 shadow-2xs"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>{inStock ? 'Move to Cart' : 'Out of Stock'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-border bg-muted/30 space-y-3">
              <Button
                onClick={onMoveAllToCart}
                className="w-full h-10 text-xs font-bold uppercase tracking-wider gap-2 shadow-sm rounded-xl"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move All to Cart</span>
              </Button>

              {onViewFullPage && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onViewFullPage();
                  }}
                  className="w-full text-xs font-semibold gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  <span>Open Full Saved Items Page</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Button>
              )}

              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="text-xs text-muted-foreground hover:text-destructive gap-1 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Saved</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="text-xs font-medium gap-1 px-3"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
