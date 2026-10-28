import React, { useState, useEffect } from 'react';
import { useProductDetail } from '../hooks/useCatalog';
import { ImageGallery } from '../features/catalog/ImageGallery';
import { VariantSelector } from '../features/catalog/VariantSelector';
import { ReviewsList } from '../features/catalog/ReviewsList';
import { ProductDetailSkeleton } from '../components/common/LoadingSkeleton';
import { StockBadge, DiscountBadge } from '../components/common/Badge';
import { formatPrice, calculateDiscount } from '../lib/formatters';
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
} from 'lucide-react';

export function ProductDetailPage({
  slug,
  onBack,
  onAddToCart,
  onDirectCheckout,
}) {
  const { data: product, isLoading, error } = useProductDetail(slug);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

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
        <h2 className="text-xl font-bold text-navy mb-2">Product Not Found</h2>
        <p className="text-sm text-muted mb-6">
          The requested product could not be found or has been discontinued.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-royal-blue transition"
        >
          Return to Catalog
        </button>
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
      <nav className="flex items-center gap-2 text-xs text-muted">
        <button onClick={onBack} className="hover:text-navy transition">
          Catalog
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-royal-blue font-medium">
          {product.category?.name || 'Category'}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main 2-column Detail Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Gallery */}
        <div>
          <ImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Right: Spec, Variant, Pricing, Cart CTAs */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-royal-blue">
                {product.category?.name || 'Exclusive Equipment'}
              </span>
              <StockBadge inStock={inStock} stockQuantity={availableStock} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-extrabold text-navy">
                {formatPrice(effectivePrice)}
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > Number(effectivePrice) && (
                <>
                  <span className="text-base text-muted line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <DiscountBadge discount={discount} />
                </>
              )}
            </div>
            <p className="text-[11px] text-muted mt-1">Inclusive of all taxes & warranty coverage.</p>
          </div>

          {/* Product Description */}
          <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-border">
            {product.description}
          </p>

          {/* Variant Selection */}
          <VariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onSelectVariant={setSelectedVariant}
          />

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-xl bg-white p-1">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-muted hover:text-navy disabled:opacity-30 rounded-lg hover:bg-canvas transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-navy">{quantity}</span>
                <button
                  disabled={quantity >= availableStock}
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="p-2 text-muted hover:text-navy disabled:opacity-30 rounded-lg hover:bg-canvas transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                disabled={!inStock}
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 rounded-xl bg-navy hover:bg-royal-blue active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Cart</span>
              </button>
            </div>

            <button
              disabled={!inStock}
              onClick={() => {
                handleAddToCart();
                onDirectCheckout();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-royal-blue hover:bg-blue-600 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Instant Razorpay Checkout</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border text-center">
            <div className="p-3 bg-canvas rounded-xl border border-border">
              <Truck className="w-5 h-5 mx-auto text-navy mb-1" />
              <span className="text-[10px] font-semibold text-navy block">Free Express Shipping</span>
              <span className="text-[9px] text-muted">Over ₹1,999</span>
            </div>
            <div className="p-3 bg-canvas rounded-xl border border-border">
              <ShieldCheck className="w-5 h-5 mx-auto text-teal mb-1" />
              <span className="text-[10px] font-semibold text-navy block">2-Year Warranty</span>
              <span className="text-[9px] text-muted">Genuine brand cover</span>
            </div>
            <div className="p-3 bg-canvas rounded-xl border border-border">
              <RotateCcw className="w-5 h-5 mx-auto text-royal-blue mb-1" />
              <span className="text-[10px] font-semibold text-navy block">14-Day Returns</span>
              <span className="text-[9px] text-muted">Direct doorstep pickup</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ReviewsList
        reviews={product.reviews || []}
        avgRating={product.rating || 5.0}
        reviewCount={product.reviewCount || 0}
      />
    </div>
  );
}
