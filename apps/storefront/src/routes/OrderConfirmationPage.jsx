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
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

export function OrderConfirmationPage({ order, onNavigate }) {
  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-foreground">No order details found</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Looks like no recent order was placed in this session.</p>
        <Button
          onClick={() => onNavigate('products')}
          className="text-xs font-bold"
        >
          Explore Catalog
        </Button>
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
    <div className="py-6 print:py-0">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Celebration Header Card */}
        <Card className="text-center p-6 sm:p-10 border-border shadow-md">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <Badge variant="teal" className="text-xs font-bold uppercase tracking-widest px-3 py-1">
            Payment Verified & Order Confirmed
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-3 tracking-tight">
            Thank you for your order, {order.shippingAddress?.fullName || 'Customer'}!
          </h1>

          <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-2">
            Your order <strong className="text-foreground font-mono">{order.orderNumber}</strong> has been received and is now being prepared for express dispatch.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-2 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Order Receipt</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('profile')}
              className="gap-2 text-xs"
            >
              <span>View in Profile Orders</span>
            </Button>
          </div>
        </Card>

        {/* Order Fulfillment Timeline */}
        <Card className="p-6 sm:p-8 border-border shadow-sm">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            Order Status Timeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Order Placed</p>
                <p className="text-[11px] text-muted-foreground">Confirmed on {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Payment Captured</p>
                <p className="text-[11px] text-muted-foreground font-mono">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay Verified'}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md animate-pulse">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Processing & Packing</p>
                <p className="text-[11px] text-muted-foreground">In warehouse fulfillment</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 opacity-60">
              <div className="w-8 h-8 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Express Delivery</p>
                <p className="text-[11px] text-muted-foreground">Expected {formattedDelivery}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Purchased Items (7 Cols) */}
          <Card className="md:col-span-7 p-6 sm:p-7 border-border shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Purchased Gear ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-border">
              {order.items?.map((item, index) => (
                <div key={index} className="py-3.5 flex items-center gap-3.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover bg-muted border border-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Qty: {item.quantity} {item.variant ? `• ${item.variant}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Shipping & Payment Summary (5 Cols) */}
          <div className="md:col-span-5 space-y-6">
            <Card className="p-6 sm:p-7 border-border shadow-sm">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Shipping Destination
              </h3>
              <div className="text-xs text-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{order.shippingAddress?.fullName}</p>
                  {order.shippingAddress?.addressType && (
                    <Badge variant="outline" className="text-[10px]">
                      {order.shippingAddress.addressType}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{order.shippingAddress?.street}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress?.city}
                  {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} - {order.shippingAddress?.postalCode}
                </p>
                <p className="text-muted-foreground pt-1">Phone: {order.shippingAddress?.phone}</p>
              </div>

              <Separator className="my-4" />

              <div>
                <h4 className="text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  Payment Details
                </h4>
                <p className="text-xs text-foreground capitalize font-medium">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay Secure Payment'}
                </p>
                {order.paymentId && (
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    Ref: {order.paymentId}
                  </p>
                )}
              </div>
            </Card>

            {/* Final Financials Card */}
            <Card className="p-6 sm:p-7 border-border shadow-sm space-y-2.5 text-xs">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                Payment Receipt
              </h3>

              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(order.pricing?.subtotal)}</span>
              </div>

              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({order.pricing?.couponCode})</span>
                  <span>-{formatPrice(order.pricing?.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Express Shipping</span>
                <span className="font-semibold text-foreground">
                  {order.pricing?.shipping === 0 ? <span className="text-teal font-semibold">FREE</span> : formatPrice(order.pricing?.shipping)}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between text-base font-bold text-foreground pt-1">
                <span>Amount Paid</span>
                <span className="text-primary text-lg">{formatPrice(order.pricing?.total)}</span>
              </div>

              <div className="pt-4 print:hidden">
                <Button
                  onClick={() => onNavigate('products')}
                  className="w-full text-xs font-bold gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
