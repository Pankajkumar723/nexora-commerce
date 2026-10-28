import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../lib/formatters';

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-navy font-bold text-base">
              <ShoppingBag className="w-5 h-5 text-royal-blue" />
              <span>Shopping Cart ({items.length})</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted hover:text-navy rounded-xl hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-canvas text-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-navy text-sm">Your cart is empty</h4>
                <p className="text-xs text-muted max-w-xs mx-auto mt-1 mb-6">
                  Explore our curated audio, desk, and wearable gear and find your essentials.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-royal-blue transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const product = item.product;
                const variant = item.variant;
                const price = Number(variant?.priceOverride || product.price);
                const image =
                  product.images && product.images.length > 0
                    ? product.images[0].url
                    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={`${product.id}-${variant?.id || 'default'}`}
                    className="flex gap-4 p-3 bg-canvas rounded-xl border border-border"
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg border border-border bg-white"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-semibold text-navy line-clamp-1">
                            {product.name}
                          </h5>
                          <button
                            onClick={() => onRemoveItem(item)}
                            className="text-muted hover:text-danger p-0.5"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {variant && (
                          <div className="text-[11px] text-muted mt-0.5">
                            {variant.sku}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-navy">
                          {formatPrice(price * item.quantity)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                            className="p-1 text-muted hover:text-navy hover:bg-canvas"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-navy">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                            className="p-1 text-muted hover:text-navy hover:bg-canvas"
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
            <div className="p-5 border-t border-border bg-gray-50/50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-navy">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span className="font-semibold text-navy">
                    {shipping === 0 ? (
                      <strong className="text-teal font-medium">FREE</strong>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-navy pt-2 border-t border-border">
                  <span>Estimated Total</span>
                  <span className="text-royal-blue">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3 bg-royal-blue hover:bg-blue-600 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Proceed to Razorpay Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-muted">
                Taxes calculated at checkout. Backed by 256-bit SSL encryption.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
