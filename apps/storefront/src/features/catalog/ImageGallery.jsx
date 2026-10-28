import React, { useState } from 'react';

export function ImageGallery({ images = [], productName = 'Product' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages =
    images.length > 0
      ? images
      : [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80', alt: productName }];

  const currentImage = displayImages[selectedIndex] || displayImages[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Frame */}
      <div className="relative aspect-[4/3] w-full bg-white rounded-2xl border border-border overflow-hidden shadow-sm flex items-center justify-center">
        <img
          src={currentImage.url}
          alt={currentImage.alt || productName}
          className="w-full h-full object-cover object-center transition-all duration-300"
        />
      </div>

      {/* Thumbnails list */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {displayImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                selectedIndex === idx
                  ? 'border-royal-blue shadow-md scale-95'
                  : 'border-border hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={img.alt || `${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
