import React, { useState, useEffect } from 'react';
import { useProductDetail } from '../hooks/useCatalog';
import { ImageGallery } from '../features/catalog/ImageGallery';
import { VariantSelector } from '../features/catalog/VariantSelector';
import { ReviewsList } from '../features/catalog/ReviewsList';
import { ProductDetailSkeleton } from '../components/common/LoadingSkeleton';
import { StockBadge, DiscountBadge } from '../components/common/Badge';
import { formatPrice, calculateDiscount } from '../lib/formatters';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { DeliveryEstimator } from '../components/common/DeliveryEstimator';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  ChevronRight,
  Heart,
  Share2,
  Tag,
  CreditCard,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Check,
  Store,
  Clock,
  Award,
  Star,
  Copy,
  Sparkles,
  Layers,
} from 'lucide-react';

export function ProductDetailPage({
  slug,
  onBack,
  onAddToCart,
  onDirectCheckout,
  wishlistItems = [],
  onToggleWishlist,
}) {
  const { data: product, isLoading, error } = useProductDetail(slug);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [activeSpecsTab, setActiveSpecsTab] = useState('general');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState('');

  const isSaved = product ? wishlistItems.some((item) => item.id === product.id) : false;

  // Default to first variant if product has variants
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Product Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The requested product could not be found or has been discontinued.
        </p>
        <Button
          onClick={onBack}
          variant="navy"
        >
          Return to Catalog
        </Button>
      </div>
    );
  }

  const effectivePrice = selectedVariant?.priceOverride || product.price;
  const discount = calculateDiscount(effectivePrice, product.compareAtPrice);
  const inStock = selectedVariant ? selectedVariant.stockQuantity > 0 : product.inStock;
  const availableStock = selectedVariant ? selectedVariant.stockQuantity : product.totalStock;

  const handleAddToCart = () => {
    onAddToCart({
      product,
      variant: selectedVariant,
      quantity,
    });
    setToastMessage(`Added ${quantity} × ${product.name} to cart`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-royal-blue/30 animate-bounce">
          <ShoppingBag className="w-4 h-4 text-teal" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={onBack}
          className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
        >
          Catalog
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-border" />
        <span className="text-royal-blue font-medium">
          {product.category?.name || 'Category'}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-border" />
        <span className="text-foreground font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main 2-column Detail Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 relative">
        {/* Left: Gallery */}
        <div className="relative">
          <ImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Right: Spec, Variant, Pricing, Cart CTAs */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider text-royal-blue">
                {product.category?.name || 'Exclusive Equipment'}
              </Badge>
              <StockBadge inStock={inStock} stockQuantity={availableStock} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-extrabold text-foreground">
                {formatPrice(effectivePrice)}
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > Number(effectivePrice) && (
                <>
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <DiscountBadge discount={discount} />
                </>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Inclusive of all taxes & warranty coverage.</p>
          </div>

          {/* Product Description */}
          <p className="text-sm text-foreground/80 leading-relaxed bg-card p-4 rounded-xl border border-border">
            {product.description}
          </p>

          {/* Variant Selection */}
          <VariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onSelectVariant={setSelectedVariant}
          />

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="h-10 flex items-center border border-border rounded-xl bg-card px-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="w-9 text-center font-bold text-xs text-foreground select-none">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={quantity >= availableStock}
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Button
                disabled={!inStock}
                onClick={handleAddToCart}
                variant="navy"
                className="flex-1 h-10 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Shopping Cart</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (onToggleWishlist && product) {
                    onToggleWishlist(product);
                  }
                }}
                className={`h-10 w-24 shrink-0 rounded-xl border shadow-xs transition-colors flex items-center justify-center gap-1.5 font-semibold text-xs ${
                  isSaved
                    ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
                    : 'text-foreground hover:text-red-500 hover:border-red-200 bg-card'
                }`}
                title={isSaved ? 'Remove from Saved items' : 'Save to Wishlist'}
              >
                <Heart className={`w-3.5 h-3.5 shrink-0 transition-transform active:scale-125 ${isSaved ? 'fill-white text-white' : ''}`} />
                <span className="w-10 text-center">{isSaved ? 'Saved' : 'Save'}</span>
              </Button>
            </div>

            <Button
              disabled={!inStock}
              onClick={() => {
                handleAddToCart();
                onDirectCheckout();
              }}
              variant="default"
              className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Instant Razorpay Checkout</span>
            </Button>
          </div>

          {/* 1. Real-time Pincode & Delivery Date Estimator */}
          <DeliveryEstimator />

          {/* 2. Bank Offers & Available Promotions (Flipkart/Amazon Style) */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-royal-blue" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Available Offers & Bank Discounts
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Bank Offer */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/70">
                <CreditCard className="w-4 h-4 text-royal-blue shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground leading-snug">
                    <strong className="text-royal-blue font-bold">Bank Offer:</strong> 10% Instant Discount up to ₹1,500 on HDFC & ICICI Credit Cards.
                  </p>
                  <span className="text-[10px] text-muted-foreground">Min. transaction ₹3,000 • T&C apply</span>
                </div>
              </div>

              {/* Coupon Offer */}
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground leading-snug">
                      <strong className="text-amber-600 dark:text-amber-400 font-bold">Special Promo:</strong> Extra 10% off using coupon <span className="font-mono font-bold">NEXORA10</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground">Applicable on cart total &gt; ₹2,000</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText('NEXORA10');
                    setCopiedCoupon('NEXORA10');
                    setTimeout(() => setCopiedCoupon(''), 2000);
                  }}
                  className="px-2 py-1 rounded bg-card hover:bg-card/80 text-[10px] font-bold text-foreground border border-border shrink-0 transition active:scale-95 flex items-center gap-1"
                >
                  {copiedCoupon === 'NEXORA10' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* No-cost EMI */}
              <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-royal-blue" />
                  No Cost EMI from <strong className="text-foreground">₹{Math.max(499, Math.round(Number(effectivePrice) / 6))}/mo</strong>
                </span>
                <span className="font-semibold text-royal-blue">View Plans</span>
              </div>
            </div>
          </div>

          {/* 3. Seller & Trust Verification */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-royal-blue/10 text-royal-blue flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <span>Sold by:</span>
                  <span className="text-royal-blue">Nexora Official Retail</span>
                  <Badge variant="teal" className="text-[9px] px-1 py-0 font-bold">
                    4.9 ★
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  98% positive ratings • GST invoice available
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-teal flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Merchant</span>
            </span>
          </div>

          {/* 4. Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border text-center">
            <div className="p-3 bg-card rounded-xl border border-border">
              <Truck className="w-5 h-5 mx-auto text-royal-blue mb-1" />
              <span className="text-[10px] font-semibold text-foreground block">Free Express Shipping</span>
              <span className="text-[9px] text-muted-foreground">Over ₹1,999</span>
            </div>
            <div className="p-3 bg-card rounded-xl border border-border">
              <ShieldCheck className="w-5 h-5 mx-auto text-teal mb-1" />
              <span className="text-[10px] font-semibold text-foreground block">2-Year Warranty</span>
              <span className="text-[9px] text-muted-foreground">Official brand cover</span>
            </div>
            <div className="p-3 bg-card rounded-xl border border-border">
              <RotateCcw className="w-5 h-5 mx-auto text-royal-blue mb-1" />
              <span className="text-[10px] font-semibold text-foreground block">7-Day Replacement</span>
              <span className="text-[9px] text-muted-foreground">Doorstep pickup</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Product Highlights & Key Features (Amazon/Flipkart Style) */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-royal-blue" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Product Highlights & Key Features
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-foreground">Grade-A Precision Craftsmanship</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Engineered with high-tensile materials, ergonomic contouring, and rigorous quality inspection.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-foreground">Nexora Certified Performance</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tested to deliver exceptional durability, thermal dissipation, and benchmark performance in everyday use.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-foreground">Seamless Ecosystem Compatibility</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Designed to integrate effortlessly with iOS, Android, macOS, Windows, and universal accessories.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-foreground">Secure Tamper-Evident Packaging</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Shipped directly from our central robotics fulfillment hub with multi-layer bubble wrap & serial seal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Comprehensive Technical Specifications Table */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-royal-blue" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Technical Specifications
            </h2>
          </div>

          {/* Specs Category Tabs */}
          <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl overflow-x-auto">
            {[
              { id: 'general', label: 'General' },
              { id: 'tech', label: 'Technical Details' },
              { id: 'warranty', label: 'Warranty & Support' },
              { id: 'origin', label: 'Manufacturing & Origin' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSpecsTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeSpecsTab === tab.id
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: General */}
        {activeSpecsTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Brand</span>
              <span className="font-semibold text-foreground">Nexora Performance</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Model Name</span>
              <span className="font-semibold text-foreground font-mono">{product.slug}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Product Category</span>
              <span className="font-semibold text-foreground">{product.category?.name || 'Hardware'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">In The Box</span>
              <span className="font-semibold text-foreground">1 x Main Unit, Braided Cable, Quick Guide, Warranty Card</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Selected Style/Color</span>
              <span className="font-semibold text-foreground">
                {selectedVariant ? Object.values(selectedVariant.attributes || {}).join(' / ') : 'Default Edition'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Net Quantity</span>
              <span className="font-semibold text-foreground">1 Piece</span>
            </div>
          </div>
        )}

        {/* Tab 2: Technical */}
        {activeSpecsTab === 'tech' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Material / Finish</span>
              <span className="font-semibold text-foreground">CNC Aluminum & Organic Hybrid Polymer</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Operating Compatibility</span>
              <span className="font-semibold text-foreground">Universal (iOS, Android, macOS, Windows)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Package Dimensions</span>
              <span className="font-semibold text-foreground">22.4 × 18.2 × 6.8 cm</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Product Weight</span>
              <span className="font-semibold text-foreground">Approx. 420 grams</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Power / Connectivity</span>
              <span className="font-semibold text-foreground">USB Type-C Fast Charge & Bluetooth 5.4</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Safety Certifications</span>
              <span className="font-semibold text-foreground">BIS, CE, RoHS, FCC Certified</span>
            </div>
          </div>
        )}

        {/* Tab 3: Warranty */}
        {activeSpecsTab === 'warranty' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Warranty Period</span>
              <span className="font-semibold text-teal">2 Years Official Brand Warranty</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Warranty Service Type</span>
              <span className="font-semibold text-foreground">Free Doorstep Pickup & Repair</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Covered in Warranty</span>
              <span className="font-semibold text-foreground">Manufacturing defects, internal hardware failure</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Not Covered</span>
              <span className="font-semibold text-foreground">Physical abuse, water submersion, unauthorized repair</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Return / Replacement</span>
              <span className="font-semibold text-foreground">7 Days from date of delivery</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Customer Support</span>
              <span className="font-semibold text-royal-blue">support@nexora.com • 1800-102-NEXORA</span>
            </div>
          </div>
        )}

        {/* Tab 4: Origin */}
        {activeSpecsTab === 'origin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Country of Origin</span>
              <span className="font-semibold text-foreground">India</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Marketed By</span>
              <span className="font-semibold text-foreground">Nexora Commerce Private Limited</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Registered Office</span>
              <span className="font-semibold text-foreground">Electronic City Phase 1, Bengaluru, KA 560100</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Generic Name</span>
              <span className="font-semibold text-foreground">{product.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">GST Invoice</span>
              <span className="font-semibold text-foreground">Available (18% Integrated GST Included)</span>
            </div>
          </div>
        )}
      </section>

      {/* 7. Frequently Asked Questions (Customer Q&A) */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <HelpCircle className="w-5 h-5 text-royal-blue" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Frequently Asked Questions (Delivery, Warranty & Returns)
          </h2>
        </div>

        <div className="space-y-3 pt-2">
          {[
            {
              q: 'When will this product be delivered to my address?',
              a: 'Delivery dates depend on your location. You can enter your 6-digit PIN in the delivery widget above to see exact dates for Standard Delivery (2-3 business days, FREE) or Priority Express Delivery (Tomorrow, ₹99).',
            },
            {
              q: 'Is Cash on Delivery (COD) available for this order?',
              a: 'Yes! Cash on Delivery is supported across all major Indian pincodes. You can pay via Cash, UPI QR code, or Card machine when our courier executive arrives at your doorstep.',
            },
            {
              q: 'How does live order tracking work from warehouse to my doorstep?',
              a: 'Once your order is placed, you receive a real-time order tracking link with an AWB number (BlueDart/Delhivery). You can watch your parcel progress through: Order Confirmed → Packed at Bengaluru Hub → In Transit → Out for Delivery (with delivery agent name & phone) → Doorstep Delivery with secure OTP.',
            },
            {
              q: 'What is the return and replacement policy?',
              a: 'We offer a 7-Day Hassle-Free Replacement Policy. If you receive a damaged, defective, or incorrect product, simply click "Request Return" from your Profile > My Orders page for a free doorstep replacement pickup.',
            },
            {
              q: 'How do I claim the 2-Year official brand warranty?',
              a: 'Every Nexora order includes an official digital GST Tax Invoice accessible anytime from your Profile. In the unlikely event of an issue, contact support@nexora.com with your invoice for free doorstep repair or replacement.',
            },
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-muted/20 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-foreground hover:text-royal-blue transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-royal-blue shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Customer Reviews Section */}
      <ReviewsList
        reviews={product.reviews || []}
        avgRating={product.rating || 5.0}
        reviewCount={product.reviewCount || 0}
      />
    </div>
  );
}
