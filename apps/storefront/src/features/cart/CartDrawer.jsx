import React, { useMemo } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Sparkles, MapPin } from 'lucide-react';
import { formatPrice } from '../../lib/formatters';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { getDeliveryQuotes, getStoredPincode } from '../../lib/deliveryUtils';

export function CartDrawer({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.variant?.priceOverride || item.product.price);
    return acc + price * item.quantity;
  }, 0);

  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 150;
  const total = subtotal + shipping;

  const currentPin = getStoredPincode();
  const deliveryQuote = useMemo(() => getDeliveryQuotes(currentPin), [currentPin]);
  const freeShippingThreshold = 1999;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card text-card-foreground shadow-2xl flex flex-col justify-between border-l border-border">
          {/* Drawer Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-base text-foreground">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span>Shopping Cart</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {items.length}
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

          {/* Delivery Date & Free Shipping Progress Ribbon */}
          {items.length > 0 && (
            <div className="px-5 py-3 bg-muted/40 border-b border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-foreground font-semibold">
                  <Truck className="w-3.5 h-3.5 text-royal-blue shrink-0" />
                  <span>Delivery to <strong className="font-mono text-royal-blue">{currentPin}</strong></span>
                </span>
                <span className="text-[11px] font-bold text-teal">
                  by {deliveryQuote?.standard.formattedDate || '2-3 Days'}
                </span>
              </div>

              {/* Free Shipping Progress */}
              <div className="space-y-1">
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal transition-all duration-300 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                  {amountToFreeShipping > 0 ? (
                    <span>Add <strong>{formatPrice(amountToFreeShipping)}</strong> for <strong>FREE Delivery</strong></span>
                  ) : (
                    <span className="text-teal font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> FREE Express Delivery Unlocked!
                    </span>
                  )}
                  <span>{freeShippingProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">Your cart is empty</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 mb-6">
                  Explore our curated audio, desk, and wearable gear and find your essentials.
                </p>
                <Button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              items.map((item, idx) => {
                const product = item.product;
                const variant = item.variant;
                const price = Number(variant?.priceOverride || product.price);
                const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={`${product.id}-${variant?.id || idx}`}
                    className="flex gap-3.5 p-3.5 rounded-2xl bg-muted/40 border border-border/80 hover:border-primary/40 transition group"
                  >
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-background border border-border flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-foreground truncate max-w-[170px]">
                            {product.name}
                          </h4>
                          {variant && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {variant.attributes ? Object.values(variant.attributes).join(' / ') : variant.sku}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(item)}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <span className="text-xs font-bold text-foreground">
                          {formatPrice(price * item.quantity)}
                        </span>

                        <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-border bg-muted/30 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-foreground">
                    {shipping === 0 ? (
                      <span className="text-teal font-semibold">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between text-sm font-bold text-foreground">
                  <span>Estimated Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                onClick={onCheckout}
                className="w-full h-11 text-xs font-bold gap-2 shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                Taxes calculated at checkout. Secured by Better Auth & 256-bit SSL.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
