import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';
import { ProductCard } from '../features/catalog/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export function HomePage({
  products = [],
  categories = [],
  isLoading,
  onSelectProduct,
  onSelectCategory,
  onAddToCart,
  onExploreAll,
  wishlistItems = [],
  onToggleWishlist,
}) {
  const featuredProducts = products.slice(0, 6);
  const wishlistSet = new Set((wishlistItems || []).map((p) => p.id));

  return (
    <div className="space-y-16 py-6 sm:py-8">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-[#1e4a87] to-royal-blue text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(18,184,166,0.15),transparent_50%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-teal">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Introducing The 2026 Nexora Performance Collection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Engineered for Precision, Sound, & Everyday Mobility.
          </h1>

          <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Discover beryllium-tuned ANC headphones, Grade-5 titanium biometrics, CNC ergonomic keyboards, and waterproof Cordura everyday carry.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              onClick={onExploreAll}
              variant="default"
              size="lg"
              className="bg-white text-navy hover:bg-gray-100 shadow-md gap-2 font-bold text-sm h-12 px-6 rounded-xl"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 text-royal-blue" />
            </Button>
            <Button
              onClick={() => onSelectCategory('audio-acoustics')}
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-md font-semibold text-sm h-12 px-6 rounded-xl"
            >
              Audio Collection
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Category Browse Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Curated Collections</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Explore specialized performance categories</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExploreAll}
            className="text-xs sm:text-sm font-semibold text-royal-blue hover:text-foreground gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-muted border border-border text-left shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                <span className="text-xs font-bold text-white group-hover:text-teal transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] text-gray-300 mt-0.5">
                  {cat.productCount ? `${cat.productCount} Items` : 'Explore'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-teal text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              <span>Trending Gear</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Featured Engineering</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExploreAll}
            className="text-xs sm:text-sm font-semibold text-royal-blue hover:text-foreground gap-1"
          >
            <span>See Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id || product.slug}
                product={product}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
                isSaved={wishlistSet.has(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Promotional Coupon Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-navy to-royal-blue rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-teal">
              Limited Welcome Offer
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enjoy 10% Off Your Initial Order
            </h3>
            <p className="text-xs sm:text-sm text-gray-200">
              Apply coupon <code className="bg-white/20 text-white font-mono px-2 py-0.5 rounded font-bold">NEXORA10</code> during checkout. Free express dispatch guaranteed.
            </p>
          </div>

          <Button
            onClick={onExploreAll}
            className="bg-teal hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow transition shrink-0 h-11 px-6"
          >
            Claim Discount Now
          </Button>
        </div>
      </section>
    </div>
  );
}
