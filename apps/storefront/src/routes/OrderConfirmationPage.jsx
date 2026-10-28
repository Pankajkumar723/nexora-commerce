import React from 'react';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  Calendar, 
  ArrowRight, 
  Printer, 
  ShoppingBag,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { formatPrice } from '../lib/formatters';

export function OrderConfirmationPage({ order, onNavigate }) {
  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Package className="w-16 h-16 text-muted mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-navy">No order details found</h2>
        <p className="text-sm text-muted mt-1 mb-6">Looks like no recent order was placed in this session.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-5 py-2.5 bg-navy text-white text-xs font-bold rounded-xl hover:bg-royal-blue transition"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  // Estimated delivery date: 3 business days from order placement
  const orderDate = new Date(order.createdAt || Date.now());
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-canvas py-10 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Celebration Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-sm text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-teal bg-teal/10 px-3 py-1 rounded-full border border-teal/20">
            Payment Verified & Order Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy mt-3 tracking-tight">
            Thank you for your order, {order.shippingAddress?.fullName || 'Customer'}!
          </h1>

          <p className="text-sm text-muted max-w-lg mx-auto mt-2">
            Your order <strong className="text-navy font-mono">{order.orderNumber}</strong> has been received and is now being prepared for express dispatch.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-canvas hover:bg-gray-200 border border-border rounded-xl transition print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span>Print Order Receipt</span>
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-royal-blue bg-royal-blue/10 hover:bg-royal-blue/20 rounded-xl transition print:hidden"
            >
              <span>View in Profile Orders</span>
            </button>
          </div>
        </div>

        {/* Order Fulfillment Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-sm mb-8">
          <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-6 flex items-center gap-2">
            <Truck className="w-4 h-4 text-royal-blue" />
            Order Status Timeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-navy">Order Placed</p>
                <p className="text-[11px] text-muted">Confirmed on {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-navy">Payment Captured</p>
                <p className="text-[11px] text-muted font-mono">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay Verified'}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-full bg-royal-blue text-white flex items-center justify-center text-xs font-bold shadow-md animate-pulse">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-navy">Processing & Packing</p>
                <p className="text-[11px] text-muted">In warehouse fulfillment</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 opacity-60">
              <div className="w-8 h-8 rounded-full bg-canvas border border-border text-muted flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <p className="text-xs font-bold text-navy">Express Delivery</p>
                <p className="text-[11px] text-muted">Expected {formattedDelivery}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Purchased Items (7 Cols) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-sm">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-royal-blue" />
              Purchased Gear ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-border">
              {order.items?.map((item, index) => (
                <div key={index} className="py-3.5 flex items-center gap-3.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover bg-canvas border border-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-navy truncate">{item.name}</h4>
                    <p className="text-[11px] text-muted mt-0.5">
                      Qty: {item.quantity} {item.variant ? `• ${item.variant}` : ''}
                    </p>
                    <p className="text-xs font-bold text-royal-blue mt-1">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Summary (5 Cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-sm">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-royal-blue" />
                Shipping Destination
              </h3>
              <div className="text-xs text-gray-700 space-y-1">
                <p className="font-bold text-gray-900">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
                <p className="text-muted pt-1">Phone: {order.shippingAddress?.phone}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-xs font-bold text-navy mb-1 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-royal-blue" />
                  Payment Details
                </h4>
                <p className="text-xs text-gray-700 capitalize font-medium">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay Secure Payment'}
                </p>
                {order.paymentId && (
                  <p className="text-[11px] text-muted font-mono mt-0.5">
                    Ref: {order.paymentId}
                  </p>
                )}
              </div>
            </div>

            {/* Final Financials Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-sm space-y-2.5 text-xs">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-2">
                Payment Receipt
              </h3>

              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-navy">{formatPrice(order.pricing?.subtotal)}</span>
              </div>

              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({order.pricing?.couponCode})</span>
                  <span>-{formatPrice(order.pricing?.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted">
                <span>Express Shipping</span>
                <span className="font-semibold text-navy">
                  {order.pricing?.shipping === 0 ? <strong className="text-teal">FREE</strong> : formatPrice(order.pricing?.shipping)}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-navy pt-3 border-t border-border">
                <span>Amount Paid</span>
                <span className="text-royal-blue text-lg">{formatPrice(order.pricing?.total)}</span>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => onNavigate('products')}
                  className="w-full py-3 bg-navy hover:bg-royal-blue text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 print:hidden"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
