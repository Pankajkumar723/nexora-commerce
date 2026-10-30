import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Star,
  ShieldCheck,
  RotateCcw,
  Search,
  Check,
  Sparkles,
  Zap,
  Tag,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';

const POPULAR_BRANDS = [
  'Nexora',
  'Apex',
  'Vanguard',
  'Equinox',
  'Kinesis',
  'Aura',
  'Lumina',
  'SoundPulse',
  'HyperDrive',
  'Chrono',
  'Artisan',
  'Sony',
  'Dell',
  'Dyson',
  'Philips',
  'LG',
  'Heritage',
];

const PRICE_MIN_OPTIONS = [
  { value: '', label: 'Min' },
  { value: '1000', label: '₹1,000' },
  { value: '2500', label: '₹2,500' },
  { value: '5000', label: '₹5,000' },
  { value: '10000', label: '₹10,000' },
  { value: '20000', label: '₹20,000' },
];

const PRICE_MAX_OPTIONS = [
  { value: '5000', label: '₹5,000' },
  { value: '10000', label: '₹10,000' },
  { value: '15000', label: '₹15,000' },
  { value: '25000', label: '₹25,000' },
  { value: '35000', label: '₹35,000' },
  { value: '50000', label: '₹50,000+' },
  { value: '', label: 'Max (Any)' },
];

const PRICE_PRESETS = [
  { label: 'Under ₹5,000', min: '', max: '5000' },
  { label: '₹5,000 – ₹15,000', min: '5000', max: '15000' },
  { label: '₹15,000 – ₹30,000', min: '15000', max: '30000' },
  { label: 'Above ₹30,000', min: '30000', max: '' },
];

const DISCOUNT_OPTIONS = [
  { value: 50, label: '50% or more' },
  { value: 40, label: '40% or more' },
  { value: 30, label: '30% or more' },
  { value: 20, label: '20% or more' },
  { value: 10, label: '10% or more' },
];

export function ProductFilters({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  minPrice = '',
  maxPrice = '',
  onPriceChange,
  minRating = null,
  onRatingChange,
  selectedBrands = [],
  onToggleBrand,
  discountThreshold = null,
  onDiscountChange,
  inStockOnly = false,
  onToggleInStock,
  assuredOnly = false,
  onToggleAssured,
  offersOnly = false,
  onToggleOffers,
  onResetFilters,
  className = '',
}) {
  // Accordion open/close states (Flipkart default open sections)
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    rating: true,
    assured: true,
    brand: true,
    discount: true,
    availability: true,
    offers: false,
  });

  const [brandSearch, setBrandSearch] = useState('');

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return POPULAR_BRANDS;
    return POPULAR_BRANDS.filter((b) =>
      b.toLowerCase().includes(brandSearch.trim().toLowerCase()),
    );
  }, [brandSearch]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  const hasActiveFilters = Boolean(
    selectedCategory ||
      minPrice ||
      maxPrice ||
      minRating ||
      (selectedBrands && selectedBrands.length > 0) ||
      discountThreshold ||
      inStockOnly ||
      assuredOnly ||
      offersOnly,
  );

  return (
    <div
      className={`bg-card text-card-foreground border border-border rounded-xl shadow-xs overflow-hidden ${className}`}
    >
      {/* 1. Flipkart Top Header: Filters & CLEAR ALL */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div>
          <h3 className="font-bold text-sm tracking-tight text-foreground uppercase">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filter Badges/Pills (Flipkart-style tag chips) */}
      {hasActiveFilters && (
        <div className="p-3 border-b border-border bg-muted/20 flex flex-wrap gap-1.5">
          {activeCategoryObj && (
            <span className="inline-flex items-center gap-1 bg-background border border-border text-[11px] font-medium text-foreground px-2 py-0.5 rounded-md shadow-2xs">
              {activeCategoryObj.name}
              <button
                type="button"
                onClick={() => onSelectCategory('')}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 bg-background border border-border text-[11px] font-medium text-foreground px-2 py-0.5 rounded-md shadow-2xs">
              ₹{minPrice || '0'} – ₹{maxPrice || 'Any'}
              <button
                type="button"
                onClick={() => onPriceChange('', '')}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {minRating && (
            <span className="inline-flex items-center gap-1 bg-background border border-border text-[11px] font-medium text-foreground px-2 py-0.5 rounded-md shadow-2xs">
              {minRating}★ & above
              <button
                type="button"
                onClick={() => onRatingChange(null)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {assuredOnly && (
            <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary px-2 py-0.5 rounded-md shadow-2xs">
              Assured
              <button
                type="button"
                onClick={() => onToggleAssured(false)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedBrands.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1 bg-background border border-border text-[11px] font-medium text-foreground px-2 py-0.5 rounded-md shadow-2xs"
            >
              {b}
              <button
                type="button"
                onClick={() => onToggleBrand(b)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {discountThreshold && (
            <span className="inline-flex items-center gap-1 bg-background border border-border text-[11px] font-medium text-foreground px-2 py-0.5 rounded-md shadow-2xs">
              {discountThreshold}%+ off
              <button
                type="button"
                onClick={() => onDiscountChange(null)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1 bg-background border border-border text-[11px] font-medium text-foreground px-2 py-0.5 rounded-md shadow-2xs">
              In Stock
              <button
                type="button"
                onClick={() => onToggleInStock(false)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {offersOnly && (
            <span className="inline-flex items-center gap-1 bg-background border border-border text-[11px] font-medium text-foreground px-2 py-0.5 rounded-md shadow-2xs">
              Special Offer
              <button
                type="button"
                onClick={() => onToggleOffers(false)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* 2. CATEGORIES Section (Flipkart Hierarchical breadcrumb) */}
      <div className="border-b border-border">
        <button
          type="button"
          onClick={() => toggleSection('categories')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
        >
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Categories
          </span>
          {openSections.categories ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.categories && (
          <div className="px-4 pb-4 space-y-1">
            {selectedCategory ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onSelectCategory('')}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-medium py-1 w-full text-left transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>All Categories</span>
                </button>
                <div className="pl-4 py-1 text-xs font-bold text-foreground flex items-center justify-between bg-primary/5 rounded-md px-2 border-l-2 border-primary">
                  <span>{activeCategoryObj?.name || selectedCategory}</span>
                  {activeCategoryObj?.productCount !== undefined && (
                    <span className="text-[10px] text-muted-foreground">
                      ({activeCategoryObj.productCount})
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => onSelectCategory('')}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-bold text-primary bg-primary/10 transition flex items-center justify-between"
                >
                  <span>All Hardware & Gear</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    onClick={() => onSelectCategory(cat.slug)}
                    className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-foreground hover:bg-muted/50 hover:text-primary transition flex items-center justify-between"
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.productCount !== undefined && (
                      <span className="text-[10px] text-muted-foreground ml-1">
                        ({cat.productCount})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. PRICE Section with Histogram and Min-to-Max Dropdowns */}
      <div className="border-b border-border">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
        >
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Price
          </span>
          {openSections.price ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.price && (
          <div className="px-4 pb-4 space-y-3">
            {/* Histogram bars (Flipkart price distribution visualizer) */}
            <div className="flex items-end justify-between h-9 px-1 gap-1 pt-2">
              <div className="w-full bg-primary/20 rounded-t h-3" />
              <div className="w-full bg-primary/40 rounded-t h-5" />
              <div className="w-full bg-primary/70 rounded-t h-8" />
              <div className="w-full bg-primary rounded-t h-9" />
              <div className="w-full bg-primary/60 rounded-t h-6" />
              <div className="w-full bg-primary/30 rounded-t h-4" />
            </div>

            {/* Slider track line */}
            <div className="h-1 bg-border rounded-full relative">
              <div className="absolute inset-y-0 left-0 right-0 bg-primary/60 rounded-full" />
            </div>

            {/* Min to Max selects (Flipkart exact layout) */}
            <div className="flex items-center gap-2 pt-1">
              <select
                value={minPrice}
                onChange={(e) => onPriceChange(e.target.value, maxPrice)}
                className="w-1/2 text-xs font-medium bg-background text-foreground border border-input rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {PRICE_MIN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <span className="text-xs text-muted-foreground font-medium lowercase">to</span>

              <select
                value={maxPrice}
                onChange={(e) => onPriceChange(minPrice, e.target.value)}
                className="w-1/2 text-xs font-medium bg-background text-foreground border border-input rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {PRICE_MAX_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Price Preset Chips */}
            <div className="pt-2 flex flex-wrap gap-1">
              {PRICE_PRESETS.map((preset, idx) => {
                const isSelected = minPrice === preset.min && maxPrice === preset.max;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onPriceChange(preset.min, preset.max)}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. NEXORA ASSURED (Flipkart F-Assured Badge Section) */}
      <div className="border-b border-border p-4 bg-muted/10">
        <label className="flex items-center justify-between cursor-pointer group select-none">
          <div className="flex items-center gap-2.5">
            <Checkbox
              checked={assuredOnly}
              onCheckedChange={(checked) => onToggleAssured(Boolean(checked))}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">Nexora</span>
              <span className="inline-flex items-center gap-0.5 bg-royal-blue text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded tracking-wide shadow-2xs">
                <Zap className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                <span>Assured</span>
              </span>
            </div>
          </div>
          <span
            className="text-[10px] text-muted-foreground border border-border rounded-full w-4 h-4 flex items-center justify-center font-bold"
            title="Nexora Assured: Guaranteed authentic quality & fast express dispatch."
          >
            ?
          </span>
        </label>
      </div>

      {/* 5. CUSTOMER RATINGS Section (Flipkart style checkboxes with stars) */}
      <div className="border-b border-border">
        <button
          type="button"
          onClick={() => toggleSection('rating')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
        >
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Customer Ratings
          </span>
          {openSections.rating ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.rating && (
          <div className="px-4 pb-4 space-y-2.5">
            {[4, 3, 2].map((stars) => {
              const isChecked = minRating === stars;
              return (
                <label
                  key={stars}
                  className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-foreground select-none hover:text-primary transition-colors"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => onRatingChange(checked ? stars : null)}
                  />
                  <div className="flex items-center gap-1">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>& above</span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. BRAND Section (Flipkart style with Search box and Checkboxes) */}
      <div className="border-b border-border">
        <button
          type="button"
          onClick={() => toggleSection('brand')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
        >
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Brand
          </span>
          {openSections.brand ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.brand && (
          <div className="px-4 pb-4 space-y-3">
            {/* Search Brand input */}
            <div className="relative">
              <Search className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Brand"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-muted/40 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Brand checkboxes */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 no-scrollbar">
              {filteredBrands.map((brand) => {
                const isChecked = selectedBrands.includes(brand);
                return (
                  <label
                    key={brand}
                    className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-foreground select-none hover:text-primary transition-colors"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => onToggleBrand(brand)}
                    />
                    <span>{brand}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 7. DISCOUNT Section (Flipkart style percentage ranges) */}
      <div className="border-b border-border">
        <button
          type="button"
          onClick={() => toggleSection('discount')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
        >
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Discount
          </span>
          {openSections.discount ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.discount && (
          <div className="px-4 pb-4 space-y-2.5">
            {DISCOUNT_OPTIONS.map((item) => {
              const isChecked = discountThreshold === item.value;
              return (
                <label
                  key={item.value}
                  className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-foreground select-none hover:text-primary transition-colors"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      onDiscountChange(checked ? item.value : null)
                    }
                  />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. AVAILABILITY Section (In Stock only) */}
      <div className="border-b border-border">
        <button
          type="button"
          onClick={() => toggleSection('availability')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
        >
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Availability
          </span>
          {openSections.availability ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.availability && (
          <div className="px-4 pb-4 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-foreground select-none hover:text-primary transition-colors">
              <Checkbox
                checked={inStockOnly}
                onCheckedChange={(checked) => onToggleInStock(Boolean(checked))}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        )}
      </div>

      {/* 9. OFFERS Section (Special Price / Deals) */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection('offers')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
        >
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Offers & Deals
          </span>
          {openSections.offers ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.offers && (
          <div className="px-4 pb-4 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-foreground select-none hover:text-primary transition-colors">
              <Checkbox
                checked={offersOnly}
                onCheckedChange={(checked) => onToggleOffers(Boolean(checked))}
              />
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-teal" />
                <span>Special Price / Instant Discount</span>
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductFilters;
