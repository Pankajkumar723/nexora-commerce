import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  RotateCw,
} from 'lucide-react';
import { Button } from '../../components/ui/button';

export function ImageGallery({ images = [], productName = 'Product' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0, width: 160, height: 160 });
  const [zoomCoords, setZoomCoords] = useState({ percentX: 50, percentY: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const imageContainerRef = useRef(null);

  // Ensure we always have 5 images with graceful fallbacks
  const displayImages = images.length > 0
    ? images
    : [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85', alt: productName },
        { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=85', alt: `${productName} Angle View` },
        { url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85', alt: `${productName} Texture` },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85', alt: `${productName} Packaging` },
        { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=85', alt: `${productName} Lifestyle` },
      ];

  const currentImage = displayImages[selectedIndex] || displayImages[0];

  // Mouse move handler for Amazon-style hover zoom lens
  const handleMouseMove = useCallback((e) => {
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Lens dimensions: ~35% of container width & height
    const lensWidth = Math.round(rect.width * 0.38);
    const lensHeight = Math.round(rect.height * 0.38);

    const maxX = rect.width - lensWidth;
    const maxY = rect.height - lensHeight;

    // Clamp coordinates inside container
    const clampedX = Math.max(0, Math.min(maxX, mouseX - lensWidth / 2));
    const clampedY = Math.max(0, Math.min(maxY, mouseY - lensHeight / 2));

    // Calculate percentage across movable range
    const percentX = maxX > 0 ? (clampedX / maxX) * 100 : 50;
    const percentY = maxY > 0 ? (clampedY / maxY) * 100 : 50;

    setLensPosition({
      x: clampedX,
      y: clampedY,
      width: lensWidth,
      height: lensHeight,
    });

    setZoomCoords({
      percentX,
      percentY,
    });
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: productName,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  // Keyboard navigation inside lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  return (
    <div className="relative select-none">
      {/* Gallery Layout: Left Thumbnails Strip (Amazon style) + Right Main View */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 lg:gap-4 items-start">
        {/* 1. Left Vertical Thumbnails Column */}
        <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[520px] pb-2 sm:pb-0 shrink-0 w-full sm:w-20 no-scrollbar">
          {displayImages.map((img, idx) => {
            const isActive = selectedIndex === idx;
            return (
              <button
                key={img.id || idx}
                type="button"
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-muted/40 transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'border-royal-blue ring-2 ring-royal-blue/30 shadow-md scale-95 opacity-100'
                    : 'border-border/80 hover:border-royal-blue/50 opacity-75 hover:opacity-100'
                }`}
                title={`View Angle ${idx + 1}: ${img.alt || productName}`}
              >
                <img
                  src={img.url}
                  alt={img.alt || `${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                {isActive && (
                  <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-royal-blue" />
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Main Image Container with Hover Zoom Lens */}
        <div className="relative flex-1 w-full">
          <div
            ref={imageContainerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onClick={() => setIsLightboxOpen(true)}
            className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full bg-white dark:bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex items-center justify-center cursor-crosshair group"
          >
            {/* Main Product Image */}
            <img
              src={currentImage.url}
              alt={currentImage.alt || productName}
              className="w-full h-full object-contain p-4 transition-transform duration-200"
              draggable={false}
            />

            {/* Quick Actions overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
              <button
                type="button"
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-card/90 backdrop-blur-md border border-border/80 text-foreground/80 hover:text-royal-blue hover:scale-105 transition flex items-center justify-center shadow-xs"
                title="Share product link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="w-8 h-8 rounded-full bg-card/90 backdrop-blur-md border border-border/80 text-foreground/80 hover:text-royal-blue hover:scale-105 transition flex items-center justify-center shadow-xs"
                title="Expand fullscreen view"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Image counter pill */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full z-20">
              {selectedIndex + 1} / {displayImages.length}
            </div>

            {/* Amazon-Style Dotted Zoom Lens (Follows mouse cursor) */}
            {isHovering && (
              <div
                className="absolute pointer-events-none rounded-lg border-2 border-blue-500/80 bg-blue-500/15 shadow-sm transition-opacity duration-75 z-10"
                style={{
                  left: `${lensPosition.x}px`,
                  top: `${lensPosition.y}px`,
                  width: `${lensPosition.width}px`,
                  height: `${lensPosition.height}px`,
                  backgroundImage: 'radial-gradient(#2563eb 1.5px, transparent 1.5px)',
                  backgroundSize: '7px 7px',
                }}
              />
            )}
          </div>

          {/* Amazon Signature Tagline */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 px-1">
            <span className="flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-royal-blue" />
              <span>Roll over image to zoom in</span>
            </span>
            <span className="hidden sm:inline">Click image to open expanded view</span>
          </div>

          {/* 3. Amazon-Style Flyout Zoom Window (Floats to the right on desktop) */}
          {isHovering && (
            <div
              className="hidden lg:block absolute left-[calc(100%+24px)] top-0 z-50 w-[540px] h-[540px] xl:w-[620px] xl:h-[600px] bg-white dark:bg-card border-2 border-royal-blue/40 shadow-2xl rounded-2xl overflow-hidden pointer-events-none animate-in fade-in duration-150"
              style={{
                backgroundImage: `url(${currentImage.url})`,
                backgroundPosition: `${zoomCoords.percentX}% ${zoomCoords.percentY}%`,
                backgroundSize: '280% 280%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Zoom Level Indicator */}
              <div className="absolute bottom-3 right-3 bg-black/75 text-white text-[10px] font-mono font-bold px-2 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>2.8x Ultra-HD Zoom</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copy notification toast */}
      {copyFeedback && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-navy text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
          Product link copied to clipboard!
        </div>
      )}

      {/* 4. Fullscreen High-Resolution Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Lightbox Top Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between text-white pb-3 border-b border-white/10"
          >
            <div>
              <h3 className="text-sm font-bold truncate max-w-md sm:max-w-xl text-white">
                {productName}
              </h3>
              <p className="text-xs text-gray-400">
                Image {selectedIndex + 1} of {displayImages.length} • {currentImage.alt || 'High Resolution View'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLightboxZoom((prev) => (prev === 1 ? 1.75 : 1))}
                className="h-8 text-xs text-white hover:bg-white/20 gap-1.5 font-semibold"
              >
                {lightboxZoom === 1 ? (
                  <>
                    <ZoomIn className="w-4 h-4" />
                    <span>Zoom In</span>
                  </>
                ) : (
                  <>
                    <ZoomOut className="w-4 h-4" />
                    <span>Reset</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsLightboxOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Lightbox Main Image Stage */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
          >
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition shadow-lg active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Magnifiable image */}
            <div
              className="max-w-full max-h-[75vh] flex items-center justify-center transition-transform duration-200 cursor-zoom-in"
              style={{
                transform: `scale(${lightboxZoom})`,
              }}
              onClick={() => setLightboxZoom((prev) => (prev === 1 ? 1.75 : 1))}
            >
              <img
                src={currentImage.url}
                alt={currentImage.alt || productName}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition shadow-lg active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Bottom Thumbnails Carousel */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="pt-3 border-t border-white/10 flex items-center justify-center gap-3 overflow-x-auto py-2"
          >
            {displayImages.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedIndex === idx
                    ? 'border-royal-blue ring-2 ring-royal-blue scale-105'
                    : 'border-white/20 hover:border-white/60 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
