import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export function ProductFilters({
  categories = [],
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onPriceChange,
  onResetFilters,
}) {
  const pricePresets = [
    { label: 'Under ₹5,000', min: '', max: 5000 },
    { label: '₹5,000 – ₹15,000', min: 5000, max: 15000 },
    { label: '₹15,000 – ₹25,000', min: 15000, max: 25000 },
    { label: 'Above ₹25,000', min: 25000, max: '' },
  ];

  const hasActiveFilters = Boolean(selectedCategory || minPrice || maxPrice);

  return (
    <div className="bg-white rounded-card border border-border p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2 font-semibold text-navy text-sm">
          <Filter className="w-4 h-4 text-royal-blue" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-royal-blue hover:text-navy font-medium transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Category</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition ${
              !selectedCategory
                ? 'bg-blue-50 text-royal-blue font-semibold'
                : 'text-gray-700 hover:bg-canvas'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? 'bg-blue-50 text-royal-blue font-semibold'
                  : 'text-gray-700 hover:bg-canvas'
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-[10px] text-muted bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {cat.productCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Price Range (₹)</h4>
        
        {/* Preset quick buttons */}
        <div className="space-y-1.5 mb-3">
          {pricePresets.map((preset, index) => {
            const isSelected =
              minPrice === (preset.min ? String(preset.min) : '') &&
              maxPrice === (preset.max ? String(preset.max) : '');
            return (
              <button
                key={index}
                onClick={() => {
                  onPriceChange(preset.min ? String(preset.min) : '', preset.max ? String(preset.max) : '');
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                  isSelected
                    ? 'border-royal-blue bg-blue-50 text-royal-blue'
                    : 'border-border text-gray-700 hover:bg-canvas'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-medium text-muted block mb-1">Min (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onPriceChange(e.target.value, maxPrice)}
              className="w-full px-2.5 py-1.5 text-xs bg-canvas border border-border rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-royal-blue"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted block mb-1">Max (₹)</label>
            <input
              type="number"
              placeholder="50000"
              value={maxPrice}
              onChange={(e) => onPriceChange(minPrice, e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-canvas border border-border rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-royal-blue"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
