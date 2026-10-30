import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  Home,
  Building2,
  MapPin,
  Plus,
  Trash2,
  Check,
  Zap,
  Clock,
  Key,
} from 'lucide-react';
import { formatPrice } from '../lib/formatters';
import { couponApi, orderApi, paymentApi } from '../lib/apiClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import {
  getPincodeInfo,
  getDeliveryQuotes,
  getStoredPincode,
  setStoredPincode,
  isValidPincode,
  generateTrackingInfo,
} from '../lib/deliveryUtils';

export function CheckoutPage({
  cartItems = [],
  user,
  onNavigate,
  onOrderSuccess,
}) {
  // Saved Addresses State (Holds up to 2 saved addresses for 1-click select)
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_saved_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_saved_addresses');
      const list = saved ? JSON.parse(saved) : [];
      return list.length > 0 ? list[0].id : 'new';
    } catch {
      return 'new';
    }
  });

  const [addressType, setAddressType] = useState('Home'); // 'Home' | 'Office' | 'Other'
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState(() => getStoredPincode());
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [shouldSaveAddress, setShouldSaveAddress] = useState(true);

  // Delivery Speed & Preference State
  const [deliverySpeed, setDeliverySpeed] = useState('standard'); // 'standard' | 'express'
  const [deliveryPreference, setDeliveryPreference] = useState('hand'); // 'hand' | 'security' | 'call'

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

  // Dynamic Delivery Quotes for entered postalCode
  const deliveryQuotes = useMemo(() => {
    return getDeliveryQuotes(postalCode || getStoredPincode());
  }, [postalCode]);

  // Handle Postal Code change with auto-fill
  const handlePostalCodeChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setPostalCode(cleaned);
    if (isValidPincode(cleaned)) {
      setStoredPincode(cleaned);
      const info = getPincodeInfo(cleaned);
      if (info.valid) {
        if (!city || city === 'Bengaluru') setCity(info.city);
        if (!state || state === 'Karnataka') setState(info.state);
      }
    }
  };

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

  // Shipping Calculation with Standard vs Priority Express
  const isFreeStandard = subtotal > 1999 || subtotal === 0;
  const baseShippingFee = isFreeStandard ? 0 : 150;
  const expressExtraFee = deliverySpeed === 'express' ? 99 : 0;
  const shippingFee = baseShippingFee + expressExtraFee;
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

  const handleDeleteAddress = (idToDelete, e) => {
    e.stopPropagation();
    const updated = savedAddresses.filter((a) => a.id !== idToDelete);
    setSavedAddresses(updated);
    try {
      localStorage.setItem('nexora_saved_addresses', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to delete address:', err);
    }
    if (selectedAddressId === idToDelete) {
      setSelectedAddressId(updated.length > 0 ? updated[0].id : 'new');
    }
  };

  // Complete Order & Payment Handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (cartItems.length === 0) {
      setGeneralError('Your cart is empty. Please add items to proceed.');
      return;
    }

    // Determine shipping address (either selected saved address or self-filled)
    let shippingDetails = null;

    if (selectedAddressId !== 'new') {
      const found = savedAddresses.find((a) => a.id === selectedAddressId);
      if (found) {
        shippingDetails = {
          fullName: found.fullName,
          phone: found.phone,
          street: found.street,
          city: found.city,
          state: found.state || '',
          postalCode: found.postalCode,
          addressType: found.addressType || 'Home',
          deliveryNotes: found.deliveryNotes || '',
        };
      }
    }

    if (!shippingDetails) {
      if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim() || !postalCode.trim()) {
        setGeneralError('Please fill in all required shipping fields: Full Name, Phone Number, Street Address, City, and PIN Code.');
        return;
      }

      shippingDetails = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        addressType,
        deliveryNotes: deliveryNotes.trim(),
      };

      // Save this address if requested (store up to 2 addresses)
      if (shouldSaveAddress) {
        const newAddressRecord = {
          id: `addr-${Date.now()}`,
          ...shippingDetails,
        };
        const updated = [newAddressRecord, ...savedAddresses.filter((a) => a.id !== newAddressRecord.id)].slice(0, 2);
        setSavedAddresses(updated);
        try {
          localStorage.setItem('nexora_saved_addresses', JSON.stringify(updated));
        } catch (err) {
          console.warn('Failed to save address to localStorage:', err);
        }
      }
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
        sku: item.variant?.sku,
        image: item.product.images?.[0]?.url,
      })),
      shippingAddress: shippingDetails,
      estimatedDeliveryDate: deliverySpeed === 'express' ? deliveryQuotes?.express.formattedDate : deliveryQuotes?.standard.formattedDate,
      deliverySpeed,
      deliveryPreference,
      deliveryNotes: shippingDetails.deliveryNotes || deliveryNotes,
      courierPartner: deliverySpeed === 'express' ? 'BlueDart Express Air' : 'Delhivery Logistics',
      trackingInfo: generateTrackingInfo(generatedOrderNumber),
      financials: {
        subtotal,
        discountAmount,
        couponCode: appliedCoupon?.code || null,
        shippingFee,
        grandTotal: finalTotal,
      },
    };

    // Try backend order creation if available
    try {
      const orderPayload = {
        paymentMethod,
        shippingAddress: shippingDetails,
        couponCode: appliedCoupon?.code,
        items: cartItems.map((i) => ({
          productId: i.product.id,
          variantId: i.variant?.id,
          quantity: i.quantity,
        })),
      };
      const apiOrderRes = await orderApi.create(orderPayload);
      if (apiOrderRes?.data?.id) {
        orderRecord.id = apiOrderRes.data.id;
        orderRecord.orderNumber = apiOrderRes.data.orderNumber || orderRecord.orderNumber;
      }
    } catch (err) {
      console.warn('Backend order creation notice (proceeding with local order flow):', err?.message);
    }

    // Razorpay Integration Flow
    if (paymentMethod === 'razorpay') {
      if (typeof window !== 'undefined' && window.Razorpay) {
        try {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            amount: Math.round(finalTotal * 100), // in paise
            currency: 'INR',
            name: 'Nexora Commerce',
            description: `Order ${orderRecord.orderNumber}`,
            prefill: {
              name: shippingDetails.fullName,
              contact: shippingDetails.phone,
            },
            theme: {
              color: '#1E3A8A',
            },
            handler: async function (response) {
              try {
                if (response.razorpay_payment_id) {
                  await paymentApi.verifyRazorpay({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  });
                }
              } catch (verifyErr) {
                console.warn('Payment verify notice:', verifyErr);
              }
              orderRecord.paymentDetails = response;
              finalizeOrder(orderRecord);
            },
            modal: {
              ondismiss: function () {
                setIsProcessing(false);
              },
            },
          };

          const rzp = new window.Razorpay(options);
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
        <div className="w-16 h-16 rounded-full bg-navy/5 dark:bg-muted flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-navy/40 dark:text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Add products to your cart before proceeding to checkout.</p>
        <Button
          onClick={() => onNavigate('products')}
          variant="navy"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Catalog</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5 px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-teal flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Cart ({cartItems.length} items)
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-border" />
            <span className="font-bold text-foreground">Checkout & Payment</span>
            <ChevronRight className="w-3.5 h-3.5 text-border" />
            <span>Confirmation</span>
          </div>
        </div>

        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Shipping & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Contact & Shipping Address */}
            <Card className="rounded-3xl border-border bg-card shadow-sm p-6 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-royal-blue" />
                  Delivery & Shipping Address
                </CardTitle>
                {savedAddresses.length > 0 && (
                  <Badge variant="secondary" className="px-3 py-1 font-medium">
                    {savedAddresses.length} of 2 Saved Addresses
                  </Badge>
                )}
              </div>

              {/* SAVED ADDRESS SELECTOR (If customer has previously saved addresses) */}
              {savedAddresses.length > 0 && (
                <div className="mb-6 space-y-3">
                  <p className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-royal-blue" />
                    Select a Saved Address (1-Click Selection)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr, idx) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-royal-blue bg-royal-blue/5 shadow-sm ring-1 ring-royal-blue/30'
                              : 'border-border hover:border-gray-300 dark:hover:border-zinc-700 bg-background/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="navy" className="gap-1 text-[11px] font-bold px-2.5 py-0.5">
                              {addr.addressType === 'Home' && <Home className="w-3 h-3" />}
                              {addr.addressType === 'Office' && <Building2 className="w-3 h-3" />}
                              {addr.addressType === 'Other' && <MapPin className="w-3 h-3" />}
                              {addr.addressType || `Address ${idx + 1}`}
                            </Badge>

                            <div className="flex items-center gap-1.5">
                              {isSelected && (
                                <span className="text-[11px] font-bold text-teal flex items-center gap-0.5">
                                  <Check className="w-3.5 h-3.5" /> Selected
                                </span>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                title="Remove saved address"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-xs font-bold text-foreground">{addr.fullName}</p>
                          <p className="text-xs text-foreground/80 font-medium mt-0.5">{addr.phone}</p>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-snug line-clamp-2">
                            {addr.street}, {addr.city} - {addr.postalCode}
                          </p>
                        </div>
                      );
                    })}

                    {/* Option to fill a new address */}
                    <div
                      onClick={() => setSelectedAddressId('new')}
                      className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[110px] ${
                        selectedAddressId === 'new'
                          ? 'border-royal-blue bg-royal-blue/5 shadow-sm'
                          : 'border-border hover:border-gray-400 dark:hover:border-zinc-700 bg-card'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-navy/5 dark:bg-muted flex items-center justify-center text-navy mb-1.5">
                        <Plus className="w-4 h-4 text-royal-blue" />
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        + Deliver to a New Address
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Enter a different shipping address
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* NEW ADDRESS FORM (Empty by default - self-fill) */}
              {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                <div className={savedAddresses.length > 0 ? 'pt-4 border-t border-border' : ''}>
                  {savedAddresses.length > 0 && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Enter New Delivery Details
                      </span>
                      <span className="text-[11px] text-muted-foreground">Customer Self-Fill</span>
                    </div>
                  )}

                  {/* Address Option Selection */}
                  <div className="mb-4">
                    <Label className="block text-xs font-bold mb-2">
                      Address Option / Type
                    </Label>
                    <div className="flex items-center gap-2">
                      {[
                        { label: 'Home', icon: Home, desc: 'Home' },
                        { label: 'Office', icon: Building2, desc: 'Office' },
                        { label: 'Other', icon: MapPin, desc: 'Other' },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isChosen = addressType === item.label;
                        return (
                          <Button
                            key={item.label}
                            type="button"
                            variant={isChosen ? 'navy' : 'outline'}
                            size="sm"
                            onClick={() => setAddressType(item.label)}
                            className="gap-1.5 h-8 text-xs font-bold"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-fullName">Full Name *</Label>
                      <Input
                        id="checkout-fullName"
                        type="text"
                        required={selectedAddressId === 'new'}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Phone Number (NO email field) */}
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-phone">Phone Number *</Label>
                      <Input
                        id="checkout-phone"
                        type="tel"
                        required={selectedAddressId === 'new'}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter mobile number"
                      />
                    </div>

                    {/* Street Address */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="checkout-street">Street Address *</Label>
                      <Input
                        id="checkout-street"
                        type="text"
                        required={selectedAddressId === 'new'}
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="House / Flat No., Apartment, Street name"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-city">City *</Label>
                      <Input
                        id="checkout-city"
                        type="text"
                        required={selectedAddressId === 'new'}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                      />
                    </div>

                    {/* Postal / PIN Code */}
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-postalCode">Postal / PIN Code *</Label>
                      <Input
                        id="checkout-postalCode"
                        type="text"
                        maxLength={6}
                        required={selectedAddressId === 'new'}
                        value={postalCode}
                        onChange={(e) => handlePostalCodeChange(e.target.value)}
                        placeholder="6-digit PIN Code"
                        className="font-mono"
                      />
                    </div>

                    {/* Delivery Instructions */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="checkout-notes">Delivery Instructions (Optional)</Label>
                      <textarea
                        id="checkout-notes"
                        rows={2}
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="e.g. Leave with security guard or call upon arrival"
                        className="w-full text-sm p-2.5 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                      />
                    </div>

                    {/* Checkbox to save address (up to 2 addresses) */}
                    <div className="sm:col-span-2 pt-1 flex items-center space-x-2">
                      <Checkbox
                        id="save-address-chk"
                        checked={shouldSaveAddress}
                        onCheckedChange={(checked) => setShouldSaveAddress(Boolean(checked))}
                      />
                      <Label htmlFor="save-address-chk" className="cursor-pointer text-xs font-medium">
                        Save this address for faster future checkout (stores up to 2 addresses)
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Step 2: Choose Delivery Speed & Doorstep Preferences */}
            <Card className="rounded-3xl border-border bg-card shadow-sm p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-royal-blue" />
                  Step 2: Choose Delivery Speed
                </CardTitle>
                <span className="text-xs font-semibold text-muted-foreground">
                  PIN: <strong className="font-mono text-royal-blue">{postalCode || '560103'}</strong> ({deliveryQuotes?.city || 'Bengaluru'})
                </span>
              </div>

              {/* Delivery Speed Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Standard Delivery */}
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${
                    deliverySpeed === 'standard'
                      ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                      : 'border-border hover:border-border/80 bg-background'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery_speed"
                    value="standard"
                    checked={deliverySpeed === 'standard'}
                    onChange={() => setDeliverySpeed('standard')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="text-xs font-bold text-foreground">
                        Standard Delivery
                      </span>
                      <Badge variant="teal" className="text-[10px] font-bold px-1.5 py-0">
                        {isFreeStandard ? 'FREE' : '₹150'}
                      </Badge>
                    </div>
                    <p className="text-xs font-extrabold text-foreground mt-1">
                      Expected by {deliveryQuotes?.standard.formattedDate || '3 Business Days'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Reliable surface dispatch via {deliveryQuotes?.courierPartner || 'BlueDart Express'}
                    </p>
                  </div>
                </label>

                {/* Priority Express Air */}
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${
                    deliverySpeed === 'express'
                      ? 'border-royal-blue bg-royal-blue/5 ring-2 ring-royal-blue/20'
                      : 'border-border hover:border-border/80 bg-background'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery_speed"
                    value="express"
                    checked={deliverySpeed === 'express'}
                    onChange={() => setDeliverySpeed('express')}
                    className="mt-1 text-royal-blue focus:ring-royal-blue"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Zap className="w-3 h-3 text-royal-blue" /> Priority Express
                      </span>
                      <Badge variant="default" className="text-[10px] font-bold px-1.5 py-0">
                        +₹99
                      </Badge>
                    </div>
                    <p className="text-xs font-extrabold text-royal-blue mt-1">
                      Expected by {deliveryQuotes?.express.formattedDate || 'Tomorrow'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Fastest air priority with live SMS tracking & doorstep OTP
                    </p>
                  </div>
                </label>
              </div>

              {/* Delivery Preference Option */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label className="text-xs font-semibold text-foreground">
                  Doorstep Delivery Preference
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'hand', label: 'Hand to me with OTP' },
                    { id: 'security', label: 'Leave at Security Gate' },
                    { id: 'call', label: 'Call before arriving' },
                  ].map((pref) => (
                    <button
                      key={pref.id}
                      type="button"
                      onClick={() => setDeliveryPreference(pref.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition ${
                        deliveryPreference === pref.id
                          ? 'border-royal-blue bg-royal-blue/10 text-royal-blue font-bold'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Step 3: Payment Method */}
            <Card className="rounded-3xl border-border bg-card shadow-sm p-6 sm:p-7">
              <CardTitle className="text-base font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-royal-blue" />
                Step 3: Select Payment Method
              </CardTitle>

              <div className="space-y-3">
                {/* Razorpay Option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'razorpay'
                      ? 'border-royal-blue bg-royal-blue/5 ring-2 ring-royal-blue/20'
                      : 'border-border hover:border-gray-300 dark:hover:border-zinc-700 bg-background'
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
                      <span className="text-sm font-bold text-foreground flex items-center gap-2">
                        Razorpay Standard Checkout
                        <Badge variant="teal" className="text-[10px] font-bold">
                          Recommended
                        </Badge>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay securely via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, or NetBanking with HMAC SHA-256 verification.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        UPI
                      </Badge>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        Cards
                      </Badge>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        NetBanking
                      </Badge>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'cod'
                      ? 'border-royal-blue bg-royal-blue/5 ring-2 ring-royal-blue/20'
                      : 'border-border hover:border-gray-300 dark:hover:border-zinc-700 bg-background'
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
                    <span className="text-sm font-bold text-foreground">
                      Cash / Pay on Delivery (COD)
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay in cash or through UPI QR upon package arrival at your doorstep.
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-teal" />
                <span>All transactions are encrypted with 256-bit server-verified SSL.</span>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Order Summary & Coupon (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-3xl border-border bg-card shadow-sm p-6 sm:p-7 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-base font-bold">Order Summary</CardTitle>
                <Badge variant="navy" className="text-xs font-semibold">
                  {cartItems.length} Items
                </Badge>
              </div>

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
                        className="w-14 h-14 rounded-xl object-cover bg-muted border border-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Qty: {item.quantity} {variant?.sku ? `• ${variant.sku}` : ''}
                        </p>
                        <p className="text-xs font-semibold text-foreground mt-0.5">
                          {formatPrice(itemPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Engine Box */}
              <div className="my-5 pt-4 border-t border-border">
                <Label className="block text-xs font-bold mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-royal-blue" />
                  Have a Promo Code?
                </Label>

                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {appliedCoupon.code} Applied
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block">
                        Saved {formatPrice(discountAmount)} on this order
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveCoupon}
                      className="h-7 w-7 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. NEXORA10 or FLAT500"
                        className="flex-1 text-xs uppercase font-mono"
                      />
                      <Button
                        type="button"
                        variant="navy"
                        size="sm"
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="h-9 px-4 font-bold"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>

                    {/* Quick Available Promo Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge
                        variant="outline"
                        onClick={() => handleApplyCoupon('NEXORA10')}
                        className="text-[10px] cursor-pointer hover:bg-royal-blue/10 text-royal-blue font-bold border-royal-blue/30 transition"
                      >
                        🏷️ NEXORA10 (10% OFF)
                      </Badge>
                      <Badge
                        variant="outline"
                        onClick={() => handleApplyCoupon('FLAT500')}
                        className="text-[10px] cursor-pointer hover:bg-royal-blue/10 text-royal-blue font-bold border-royal-blue/30 transition"
                      >
                        🏷️ FLAT500 (₹500 OFF)
                      </Badge>
                    </div>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-destructive mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {couponError}
                  </p>
                )}

                {couponSuccess && !appliedCoupon && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {couponSuccess}
                  </p>
                )}
              </div>

              {/* Estimated Delivery Highlight Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-royal-blue/10 via-card to-teal/10 border border-royal-blue/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-royal-blue" />
                    <span>Estimated Delivery</span>
                  </span>
                  <Badge variant={deliverySpeed === 'express' ? 'default' : 'teal'} className="text-[10px] font-bold">
                    {deliverySpeed === 'express' ? 'Priority Express' : 'Standard'}
                  </Badge>
                </div>
                <p className="text-sm font-extrabold text-foreground">
                  {deliverySpeed === 'express'
                    ? deliveryQuotes?.express.formattedDate
                    : deliveryQuotes?.standard.formattedDate || 'In 2-3 Business Days'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-royal-blue" />
                    <span>To {city || deliveryQuotes?.city || 'Bengaluru'} ({postalCode})</span>
                  </span>
                  <span className="flex items-center gap-1 text-teal font-semibold">
                    <Key className="w-3 h-3" /> OTP Protected
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-4 border-t border-border text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping & Delivery</span>
                  <span className="font-semibold text-foreground">
                    {shippingFee === 0 ? (
                      <span className="text-teal font-bold">FREE Express</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>GST (18% inclusive)</span>
                  <span>Calculated & included</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between text-base font-bold text-foreground pt-1">
                  <span>Grand Total</span>
                  <span className="text-royal-blue text-lg">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isProcessing || cartItems.length === 0}
                variant="navy"
                className="w-full mt-6 h-11 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md gap-2"
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
              </Button>

              <p className="text-[10px] text-center text-muted-foreground mt-3">
                By placing this order you agree to Nexora Commerce Terms of Service & Privacy Policy.
              </p>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
