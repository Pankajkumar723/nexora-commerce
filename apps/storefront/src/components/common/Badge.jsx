import React from 'react';

export function StockBadge({ inStock, stockQuantity }) {
  if (!inStock || stockQuantity <= 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-600 animate-pulse"></span>
        Out of Stock
      </span>
    );
  }

  if (stockQuantity <= 5) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-600"></span>
        Only {stockQuantity} left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-600"></span>
      In Stock
    </span>
  );
}

export function DiscountBadge({ discount }) {
  if (!discount || discount <= 0) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-teal-800 text-white shadow-xs">
      {discount}% OFF
    </span>
  );
}
