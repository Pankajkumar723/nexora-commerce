import React from 'react';
import { Check } from 'lucide-react';
import { formatPrice } from '../../lib/formatters';

export function VariantSelector({ variants = [], selectedVariant, onSelectVariant }) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-4 py-4 border-y border-border">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-navy">
          Select Variant / Option
        </label>
        {selectedVariant && (
          <span className="text-xs text-muted font-mono">
            SKU: <strong className="text-navy">{selectedVariant.sku}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {variants.map((v) => {
          const isSelected = selectedVariant?.id === v.id;
          const attrs = v.attributes || {};
          const attrLabel = Object.entries(attrs)
            .map(([k, val]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${val}`)
            .join(' • ');

          const isOutOfStock = v.stockQuantity <= 0;

          return (
            <button
              key={v.id || v.sku}
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(v)}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                isSelected
                  ? 'border-royal-blue bg-blue-50/60 ring-2 ring-royal-blue/20'
                  : isOutOfStock
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-border bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-navy flex items-center gap-1.5">
                  <span>{attrLabel || v.sku}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-royal-blue" />}
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  {isOutOfStock ? (
                    <span className="text-danger">Out of stock</span>
                  ) : (
                    <span>{v.stockQuantity} in stock</span>
                  )}
                </div>
              </div>

              {v.priceOverride && (
                <span className="text-xs font-bold text-navy">
                  {formatPrice(v.priceOverride)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
