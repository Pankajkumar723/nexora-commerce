import React from 'react';

export function StockBadge({ inStock, stockQuantity }) {
  if (!inStock || stockQuantity <= 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-danger">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-danger animate-pulse"></span>
        Out of Stock
      </span>
    );
  }

  if (stockQuantity <= 5) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-warning">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-warning"></span>
        Only {stockQuantity} left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-teal-500"></span>
      In Stock
    </span>
  );
}

export function DiscountBadge({ discount }) {
  if (!discount || discount <= 0) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-teal text-white shadow-sm">
      {discount}% OFF
    </span>
  );
}
