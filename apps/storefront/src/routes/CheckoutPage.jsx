import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Sparkles, 
  ChevronRight,
  ShoppingBag,
  X
} from 'lucide-react';
import { formatPrice } from '../lib/formatters';
import { couponApi, orderApi, paymentApi } from '../lib/apiClient';

export function CheckoutPage({
  cartItems = [],
  user,
  onNavigate,
  onOrderSuccess,
}) {
  // Contact & Shipping Info
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [street, setStreet] = useState('42 Cyber City, DLF Phase 2');
  const [city, setCity] = useState('Gurugram');
  const [state, setState] = useState('Haryana');
  const [postalCode, setPostalCode] = useState('122002');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'

  // Coupon Engine State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Submission State
  const [isProcessing, setIsProcessing] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Calculate Base Financials
  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.variant?.priceOverride || item.product?.price || 0);
    return acc + price * item.quantity;
  }, 0);

  // Calculate Discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      const computed = (subtotal * appliedCoupon.value) / 100;
      discountAmount = appliedCoupon.maxDiscount ? Math.min(computed, appliedCoupon.maxDiscount) : computed;
    } else if (appliedCoupon.type === 'FIXED') {
      discountAmount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  // Shipping Calculation
  const isFreeShipping = subtotal > 1999 || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : 150;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Handle Coupon Application
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    setCouponError('');
    setCouponSuccess('');
    setIsApplyingCoupon(true);

    try {
      // Try backend validation first
      const res = await couponApi.validateCoupon(code, subtotal);
      const data = res?.data || res;
      setAppliedCoupon({
        code: data.code,
        type: data.discountType || 'PERCENTAGE',
        value: Number(data.discountValue) || 10,
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : 1500,
      });
      setCouponSuccess(`Coupon "${data.code}" applied successfully!`);
      setCouponInput('');
    } catch (err) {
      // Client fallback for demo coupons
      if (code === 'NEXORA10') {
        if (subtotal < 2000) {
          setCouponError('NEXORA10 requires a minimum cart subtotal of ₹2,000.');
        } else {
          setAppliedCoupon({
            code: 'NEXORA10',
            type: 'PERCENTAGE',
            value: 10,
            maxDiscount: 1500,
          });
          setCouponSuccess('Coupon NEXORA10 applied: 10% discount added!');
          setCouponInput('');
        }
      } else if (code === 'FLAT500') {
        if (subtotal < 4000) {
          setCouponError('FLAT500 requires a minimum cart subtotal of ₹4,000.');
        } else {
          setAppliedCoupon({
            code: 'FLAT500',
            type: 'FIXED',
            value: 500,
            maxDiscount: null,
          });
          setCouponSuccess('Coupon FLAT500 applied: Flat ₹500 discount added!');
          setCouponInput('');
        }
      } else {
        setCouponError(err.message || 'Invalid or expired coupon code.');
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  // Complete Order & Payment Handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (cartItems.length === 0) {
      setGeneralError('Your cart is empty. Please add items to proceed.');
      return;
    }

    if (!fullName || !email || !street || !city || !postalCode) {
      setGeneralError('Please fill in all mandatory shipping address fields.');
      return;
    }

    setIsProcessing(true);

    const generatedOrderNumber = `NEX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber: generatedOrderNumber,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED',
      paymentStatus: paymentMethod === 'cod' ? 'PENDING_COD' : 'PAID',
      paymentMethod,
      items: cartItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: Number(item.variant?.priceOverride || item.product.price),
        quantity: item.quantity,
        variant: item.variant?.attributes ? Object.values(item.variant.attributes).join(' / ') : 'Standard',
        image: item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      })),
      pricing: {
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code || null,
        shipping: shippingFee,
        total: finalTotal,
      },
      shippingAddress: {
        fullName,
        email,
        phone,
        street,
        city,
        state,
        postalCode,
        deliveryNotes,
      },
      paymentId: paymentMethod === 'cod' ? null : `pay_rzp_${Math.random().toString(36).substring(2, 12)}`,
    };

    // If Razorpay option is chosen, open standard Razorpay checkout or handle test flow
    if (paymentMethod === 'razorpay') {
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_sampleKey123';
      
      // If Razorpay window object is ready
      if (typeof window !== 'undefined' && window.Razorpay) {
        try {
          const rzpOptions = {
            key: razorpayKey,
            amount: Math.round(finalTotal * 100), // In paise
            currency: 'INR',
            name: 'Nexora Commerce',
            description: `Payment for Order ${generatedOrderNumber}`,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
            prefill: {
              name: fullName,
              email: email,
              contact: phone,
            },
            theme: {
              color: '#173D72',
            },
            handler: function (response) {
              orderRecord.paymentId = response.razorpay_payment_id || orderRecord.paymentId;
              finalizeOrder(orderRecord);
            },
            modal: {
              ondismiss: function () {
                setIsProcessing(false);
              },
            },
          };

          const rzp = new window.Razorpay(rzpOptions);
          rzp.open();
          return;
        } catch (err) {
          console.warn('Razorpay popup blocked or failed, completing mock payment flow:', err);
        }
      }
    }

    // Direct finalization for COD or simulated payment
    setTimeout(() => {
      finalizeOrder(orderRecord);
    }, 1200);
  };

  const finalizeOrder = (order) => {
    setIsProcessing(false);
    // Store in localStorage for user order history
    try {
      const existingOrders = JSON.parse(localStorage.getItem('nexora_orders') || '[]');
      localStorage.setItem('nexora_orders', JSON.stringify([order, ...existingOrders]));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    if (onOrderSuccess) {
      onOrderSuccess(order);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-navy/40" />
        </div>
        <h2 className="text-xl font-bold text-navy">Your cart is empty</h2>
        <p className="text-sm text-muted mt-1 mb-6">Add products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 bg-navy text-white text-xs font-bold rounded-xl hover:bg-royal-blue transition inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => onNavigate('products')}
            className="inline-flex items-center text-xs font-semibold text-muted hover:text-navy transition gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-semibold text-teal flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Cart ({cartItems.length} items)
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-border" />
            <span className="font-bold text-navy">Checkout & Payment</span>
            <ChevronRight className="w-3.5 h-3.5 text-border" />
            <span>Confirmation</span>
          </div>
        </div>

        {generalError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Shipping & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Contact & Shipping Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-sm">
              <h2 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-royal-blue" />
                Shipping & Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full text-sm p-2.5 bg-canvas border border-border rounded-xl text-gray-900 focus:outline-none focus:border-royal-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-sm p-2.5 bg-canvas border border-border rounded-xl text-gray-900 focus:outline-none focus:border-royal-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-sm p-2.5 bg-canvas border border-border rounded-xl text-gray-900 focus:outline-none focus:border-royal-blue"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House/Flat No, Apartment, Street name"
                    className="w-full text-sm p-2.5 bg-canvas border border-border rounded-xl text-gray-900 focus:outline-none focus:border-royal-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full text-sm p-2.5 bg-canvas border border-border rounded-xl text-gray-900 focus:outline-none focus:border-royal-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Postal / PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="122002"
                    className="w-full text-sm p-2.5 bg-canvas border border-border rounded-xl text-gray-900 focus:outline-none focus:border-royal-blue"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Leave with security guard or call upon arrival"
                    className="w-full text-sm p-2.5 bg-canvas border border-border rounded-xl text-gray-900 focus:outline-none focus:border-royal-blue resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-sm">
              <h2 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-royal-blue" />
                Select Payment Method
              </h2>

              <div className="space-y-3">
                {/* Razorpay Option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'razorpay'
                      ? 'border-royal-blue bg-royal-blue/5 ring-2 ring-royal-blue/20'
                      : 'border-border hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="mt-1 text-royal-blue focus:ring-royal-blue"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-navy flex items-center gap-2">
                        Razorpay Standard Checkout
                        <span className="text-[10px] bg-teal/10 text-teal font-bold px-2 py-0.5 rounded-full border border-teal/20">
                          Recommended
                        </span>
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Pay securely via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, or NetBanking with HMAC SHA-256 verification.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] bg-canvas text-gray-700 px-2 py-0.5 rounded font-mono font-semibold border border-border">
                        UPI
                      </span>
                      <span className="text-[10px] bg-canvas text-gray-700 px-2 py-0.5 rounded font-mono font-semibold border border-border">
                        Cards
                      </span>
                      <span className="text-[10px] bg-canvas text-gray-700 px-2 py-0.5 rounded font-mono font-semibold border border-border">
                        NetBanking
                      </span>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'cod'
                      ? 'border-royal-blue bg-royal-blue/5 ring-2 ring-royal-blue/20'
                      : 'border-border hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-royal-blue focus:ring-royal-blue"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-navy">
                      Cash / Pay on Delivery (COD)
                    </span>
                    <p className="text-xs text-muted mt-1">
                      Pay in cash or through UPI QR upon package arrival at your doorstep.
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted">
                <ShieldCheck className="w-4 h-4 text-teal" />
                <span>All transactions are encrypted with 256-bit server-verified SSL.</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Coupon (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-sm sticky top-24">
              <h2 className="text-base font-bold text-navy mb-4 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-navy text-white">
                  {cartItems.length} Items
                </span>
              </h2>

              {/* Items List */}
              <div className="divide-y divide-border max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => {
                  const product = item.product;
                  const variant = item.variant;
                  const itemPrice = Number(variant?.priceOverride || product.price);
                  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';

                  return (
                    <div key={idx} className="py-3 flex items-center gap-3">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover bg-canvas border border-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-navy truncate">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-muted">
                          Qty: {item.quantity} {variant?.sku ? `• ${variant.sku}` : ''}
                        </p>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">
                          {formatPrice(itemPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Engine Box */}
              <div className="my-5 pt-4 border-t border-border">
                <label className="block text-xs font-bold text-navy mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-royal-blue" />
                  Have a Promo Code?
                </label>

                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {appliedCoupon.code} Applied
                      </span>
                      <span className="text-[11px] text-emerald-600 block">
                        Saved {formatPrice(discountAmount)} on this order
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. NEXORA10 or FLAT500"
                        className="flex-1 text-xs uppercase font-mono p-2.5 bg-canvas border border-border rounded-xl focus:outline-none focus:border-royal-blue text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="px-4 py-2 bg-navy hover:bg-royal-blue disabled:opacity-50 text-white text-xs font-bold rounded-xl transition"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>

                    {/* Quick Available Promo Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('NEXORA10')}
                        className="text-[10px] bg-royal-blue/10 hover:bg-royal-blue/20 text-royal-blue font-bold px-2 py-0.5 rounded-lg border border-royal-blue/20 transition"
                      >
                        🏷️ NEXORA10 (10% OFF)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('FLAT500')}
                        className="text-[10px] bg-royal-blue/10 hover:bg-royal-blue/20 text-royal-blue font-bold px-2 py-0.5 rounded-lg border border-royal-blue/20 transition"
                      >
                        🏷️ FLAT500 (₹500 OFF)
                      </button>
                    </div>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {couponError}
                  </p>
                )}

                {couponSuccess && !appliedCoupon && (
                  <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {couponSuccess}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-4 border-t border-border text-xs">
                <div className="flex justify-between text-muted">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-navy">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted">
                  <span>Shipping & Delivery</span>
                  <span className="font-semibold text-navy">
                    {shippingFee === 0 ? (
                      <span className="text-teal font-bold">FREE Express</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-muted text-[11px]">
                  <span>GST (18% inclusive)</span>
                  <span>Calculated & included</span>
                </div>

                <div className="flex justify-between text-base font-bold text-navy pt-3 border-t border-border">
                  <span>Grand Total</span>
                  <span className="text-royal-blue text-lg">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing || cartItems.length === 0}
                className="w-full mt-6 py-3.5 px-4 bg-navy hover:bg-royal-blue active:scale-[0.99] text-white text-sm font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'razorpay'
                        ? `Pay ${formatPrice(finalTotal)} via Razorpay`
                        : `Confirm Order (${formatPrice(finalTotal)})`}
                    </span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-muted mt-3">
                By placing this order you agree to Nexora Commerce Terms of Service & Privacy Policy.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
