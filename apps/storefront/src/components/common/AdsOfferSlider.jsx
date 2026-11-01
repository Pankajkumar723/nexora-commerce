import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
  Zap,
  ShieldCheck,
  Coins,
  CreditCard,
  Copy,
  Check,
  Flame,
  Percent,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

// Main Hero Slides Data
const MAIN_SLIDES = [
  {
    id: 'slide-tech',
    tag: 'MEGA TECH CARNIVAL',
    tagIcon: Flame,
    tagColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    title: 'Up to 45% Off on Studio ANC & 4K OLED',
    description: 'Experience 40mm beryllium dynamic drivers, spatial acoustic audio, QD-OLED cinema displays, and laser projection.',
    couponCode: 'TECH45',
    couponDiscount: 'Flat 45% Off',
    ctaText: 'Shop Electronics',
    categorySlug: 'electronics',
    bgGradient: 'from-[#0b132b] via-[#1c2541] to-[#3a506b]',
    accentColor: '#38bdf8',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=75',
    highlightBadge: 'Ends in 04h : 28m',
  },
  {
    id: 'slide-fashion',
    tag: 'FESTIVE FASHION EDIT',
    tagIcon: Sparkles,
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    title: 'Autumn Pure Merino Wool & Italian Silks',
    description: 'Luxury handcrafted knitwear, Egyptian combed cotton shirts, Grade-6A mulberry silk gowns, and Kaihara selvedge denim.',
    couponCode: 'STYLE2026',
    couponDiscount: 'Buy 2 Get 1 Free',
    ctaText: 'Explore Fashion',
    categorySlug: 'fashion-clothing',
    bgGradient: 'from-[#2d122d] via-[#4a154b] to-[#6b2169]',
    accentColor: '#f472b6',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=75',
    highlightBadge: 'Free Alterations Included',
  },
  {
    id: 'slide-workstation',
    tag: 'PRECISION ERGONOMICS',
    tagIcon: Zap,
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    title: 'Elevate Your Workspace with CNC Engineering',
    description: 'Gasket-mounted tactile mechanical keyboards, 57° vertical mice, 4K IPS Black monitors, and heavy-duty gas spring arms.',
    couponCode: 'WORKPRO',
    couponDiscount: 'Save ₹15,000',
    ctaText: 'Upgrade Setup',
    categorySlug: 'computers-accessories',
    bgGradient: 'from-[#062c30] via-[#05595b] to-[#0e3b43]',
    accentColor: '#34d399',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=75',
    highlightBadge: 'Free Leather Desk Mat',
  },
  {
    id: 'slide-kitchen',
    tag: 'GOURMET LIVING FEST',
    tagIcon: Flame,
    tagColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    title: 'Chef-Grade Cast Iron & Conical Burr Grinders',
    description: 'Professional 67-layer VG-10 Damascus knives, precision sous vide immersion circulators, and digital rapid air fryers.',
    couponCode: 'CHEF50',
    couponDiscount: 'Up to 50% Off',
    ctaText: 'Shop Kitchen',
    categorySlug: 'home-kitchen',
    bgGradient: 'from-[#371b12] via-[#542a1d] to-[#6d3928]',
    accentColor: '#fb923c',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=75',
    highlightBadge: 'Extra 10% on Cards',
  },
  {
    id: 'slide-auto-travel',
    tag: 'EXPEDITION & TRAVEL',
    tagIcon: Zap,
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    title: '4K Dual Dashcams & 1000D Cordura Luggage',
    description: 'Cordless 150PSI digital inflators, Qi2 magnetic car chargers, aerospace aluminum carry-on spinners, and roll-top packs.',
    couponCode: 'VOYAGE25',
    couponDiscount: 'Extra 25% Off',
    ctaText: 'Explore Gear',
    categorySlug: 'automotive',
    bgGradient: 'from-[#1a1c29] via-[#242b47] to-[#343e69]',
    accentColor: '#60a5fa',
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=900&q=75',
    highlightBadge: '2-Year Warranty',
  },
];

// Side Flash Deals Data (Auto-rotating companion deals)
const SIDE_FLASH_DEALS = [
  {
    id: 'flash-1',
    productName: 'Sony Bravia 65" 4K QD-OLED TV',
    category: 'Electronics',
    categorySlug: 'electronics',
    originalPrice: '₹1,99,990',
    dealPrice: '₹1,69,990',
    saveText: 'Save ₹30,000 (15% OFF)',
    tag: '⚡ Lightning Deal of the Hour',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    stockLeft: 4,
  },
  {
    id: 'flash-2',
    productName: 'Apex Horizon Titanium Smartwatch',
    category: 'Jewellery & Watches',
    categorySlug: 'jewellery-watches',
    originalPrice: '₹31,999',
    dealPrice: '₹27,499',
    saveText: 'Save ₹4,500 + Free Strap',
    tag: '🔥 Top Trending Flagship',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    stockLeft: 7,
  },
  {
    id: 'flash-3',
    productName: 'Dyson V12 Detect Slim Cordless Vacuum',
    category: 'Home Appliances',
    categorySlug: 'home-appliances',
    originalPrice: '₹55,900',
    dealPrice: '₹49,900',
    saveText: 'Flat ₹6,000 Off + No-Cost EMI',
    tag: '⭐ Editor Choice',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    stockLeft: 5,
  },
];

// Bank & Reward Perks Data (Auto-cycling bottom card)
const BANK_OFFERS = [
  {
    bank: 'HDFC & ICICI Bank',
    offer: '10% Instant Discount up to ₹3,000 on Credit/Debit Cards',
    code: 'FESTIVE10',
    badge: 'Bank Partner',
    icon: CreditCard,
    color: 'from-blue-600/20 to-indigo-600/10 border-blue-500/30',
  },
  {
    bank: 'Nexora Black VIP Lounge',
    offer: 'Earn 2X Coins (Flat ₹450) + Free Priority Delivery on All Orders',
    code: 'VIPCLUB',
    badge: 'Member Exclusive',
    icon: Coins,
    color: 'from-amber-600/20 to-yellow-600/10 border-amber-500/30',
  },
  {
    bank: 'Zero Interest EMI',
    offer: 'No Cost EMI Starting from ₹1,499/Month on 6 & 12 Month Tenures',
    code: 'NOCOSTEMI',
    badge: 'Instant Approval',
    icon: Percent,
    color: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30',
  },
];

// Ticker Ribbon Items
const TICKER_ITEMS = [
  '⚡ MEGA FESTIVAL SALE: Up to 70% Off Across 20 Verified Categories',
  '💳 10% Instant Discount on HDFC, ICICI & SBI Cards with code FESTIVE10',
  '🚚 Free Pan-India Express Delivery on All Orders Above ₹999',
  '🪙 Earn Double Nexora Coins (Flat ₹450 Usable Next Order)',
  '🛡️ 100% Genuine Certified Products with 30-Day Hassle-Free Returns',
  '🔥 Flash Deals Ending in 04:28:15 — Grab Exclusive Prices While Stocks Last',
];

export function AdsOfferSlider({ onSelectCategory, onExploreAll }) {
  // Main slider state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Side flash deal auto-cycle index
  const [sideDealIndex, setSideDealIndex] = useState(0);

  // Side bank offer auto-cycle index
  const [bankOfferIndex, setBankOfferIndex] = useState(0);

  // Copy coupon feedback
  const [copiedCode, setCopiedCode] = useState('');

  // Countdown timer state for flash deals
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 28,
    seconds: 45,
  });

  // Ticking countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Main slider auto-advance (5s interval, paused on hover)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % MAIN_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

  // Side flash deals auto-advance (4s interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setSideDealIndex((prev) => (prev + 1) % SIDE_FLASH_DEALS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Bank offer auto-advance (6s interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setBankOfferIndex((prev) => (prev + 1) % BANK_OFFERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const currentSlide = MAIN_SLIDES[currentSlideIndex];
  const currentSideDeal = SIDE_FLASH_DEALS[sideDealIndex];
  const currentBankOffer = BANK_OFFERS[bankOfferIndex];

  return (
    <div className="space-y-4">
      {/* 1. INFINITE TICKER RIBBON */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-navy via-[#1e3a8a] to-navy border border-border/80 shadow-xs py-2 text-white">
        <div className="flex animate-marquee whitespace-nowrap gap-8 text-xs font-semibold tracking-wide">
          {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-2">
              <span>{item}</span>
              <span className="text-teal opacity-70">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* 2. SIDE-BY-SIDE ADS & OFFER SLIDER CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
        {/* LEFT / MAIN HERO SLIDER (Cols 1-8 / 66% Width) */}
        <div
          className="lg:col-span-8 relative rounded-3xl overflow-hidden shadow-lg border border-border/80 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Slide Background Image with Vignette & Gradients */}
          <div className="absolute inset-0 z-0">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              width={1200}
              height={500}
              loading="eager"
              fetchpriority="high"
              decoding="async"
              className="w-full h-full object-cover object-center transform transition-transform duration-1000 scale-105 group-hover:scale-100"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.bgGradient} opacity-90 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_60%)]" />
          </div>

          {/* Top Bar of Main Slide: Tag + Countdown Timer */}
          <div className="relative z-10 p-5 sm:p-7 flex flex-wrap items-center justify-between gap-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider backdrop-blur-md ${currentSlide.tagColor}`}>
              <currentSlide.tagIcon className="w-3.5 h-3.5 animate-pulse" />
              <span>{currentSlide.tag}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentSlide.highlightBadge}</span>
            </div>
          </div>

          {/* Center / Bottom Content */}
          <div className="relative z-10 p-5 sm:p-7 space-y-3 sm:space-y-4 max-w-2xl text-white">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
              {currentSlide.title}
            </h1>

            <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {currentSlide.description}
            </p>

            {/* Action Buttons & Coupon Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => onSelectCategory(currentSlide.categorySlug)}
                className="bg-white text-navy hover:bg-gray-100 shadow-md font-bold text-xs sm:text-sm h-10 px-5 rounded-xl gap-2 active:scale-95 transition-all"
              >
                <span>{currentSlide.ctaText}</span>
                <ArrowRight className="w-4 h-4 text-royal-blue" />
              </Button>

              <button
                type="button"
                onClick={() => handleCopy(currentSlide.couponCode)}
                className="inline-flex items-center gap-2 px-3.5 h-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-xs font-semibold text-white transition active:scale-95"
                title="Click to copy coupon code"
              >
                <Tag className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentSlide.couponCode}</span>
                <span className="text-[10px] text-gray-300 font-normal">({currentSlide.couponDiscount})</span>
                {copiedCode === currentSlide.couponCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Slide Navigation Controls & Progress Indicators */}
          <div className="relative z-10 px-5 sm:px-7 pb-4 pt-2 flex items-center justify-between border-t border-white/10 bg-black/20 backdrop-blur-xs">
            {/* Dots / Number Indicators with 44px Touch Targets */}
            <div className="flex items-center gap-1">
              {MAIN_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className="p-2.5 -m-1 flex items-center justify-center focus:outline-none"
                  aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                >
                  <span
                    className={`h-2 rounded-full transition-all duration-300 block ${
                      idx === currentSlideIndex
                        ? 'w-7 bg-white shadow-xs'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Prev / Next Arrows with 44px Touch Targets */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentSlideIndex((prev) => (prev === 0 ? MAIN_SLIDES.length - 1 : prev - 1))
                }
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition border border-white/20 active:scale-90"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentSlideIndex((prev) => (prev + 1) % MAIN_SLIDES.length)
                }
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition border border-white/20 active:scale-90"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT / SIDE-BY-SIDE FLASH DEALS & BANK CARDS (Cols 9-12 / 34% Width) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* TOP CARD: ⚡ LIGHTNING DEAL OF THE HOUR (Auto-cycling) */}
          <div className="flex-1 rounded-3xl overflow-hidden border border-border/80 bg-card p-5 shadow-md flex flex-col justify-between relative group hover:border-primary/40 transition-colors">
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Card Header: Tag & Ticking Clock */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-bounce" />
                {currentSideDeal.tag}
              </span>

              {/* Ticking Timer Pill */}
              <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-muted/80 px-2.5 py-1 rounded-lg text-foreground border border-border">
                <Clock className="w-3 h-3 text-red-500" />
                <span>
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Product Body */}
            <div className="flex items-center gap-4 my-2">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted border border-border shrink-0 shadow-2xs">
                <img
                  src={currentSideDeal.image}
                  alt={currentSideDeal.productName}
                  width={80}
                  height={80}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-1 min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  {currentSideDeal.category}
                </span>
                <h2 className="text-xs font-bold text-foreground line-clamp-2 leading-tight">
                  {currentSideDeal.productName}
                </h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-foreground">
                    {currentSideDeal.dealPrice}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {currentSideDeal.originalPrice}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[9px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 font-bold border-none px-1.5 py-0">
                  {currentSideDeal.saveText}
                </Badge>
              </div>
            </div>

            {/* Card Footer: Stock bar + Button */}
            <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted-foreground">
                Only <strong className="text-foreground">{currentSideDeal.stockLeft}</strong> left in stock
              </span>
              <Button
                size="sm"
                onClick={() => onSelectCategory(currentSideDeal.categorySlug)}
                className="h-9 px-3.5 text-xs font-bold rounded-xl gap-1 shadow-xs bg-navy text-white hover:bg-royal-blue"
                aria-label={`Claim deal for ${currentSideDeal.productName}`}
              >
                <span>Claim Deal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* BOTTOM CARD: 💳 BANK DISCOUNTS & VIP REWARDS (Auto-cycling) */}
          <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className={`absolute inset-0 bg-gradient-to-br ${currentBankOffer.color} opacity-40 pointer-events-none`} />

            <div className="relative z-10 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <currentBankOffer.icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block leading-tight">
                    {currentBankOffer.bank}
                  </span>
                  <span className="text-[10px] text-primary font-semibold">
                    {currentBankOffer.badge}
                  </span>
                </div>
              </div>

              {/* Dot Indicators with Proper Spacing */}
              <div className="flex items-center gap-2">
                {BANK_OFFERS.map((offer, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBankOfferIndex(idx)}
                    className="w-7 h-7 flex items-center justify-center focus:outline-none rounded-full"
                    aria-label={`View ${offer.bank} discount offer`}
                  >
                    <span
                      className={`h-1.5 rounded-full transition-all block ${
                        idx === bankOfferIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative z-10 my-2">
              <p className="text-xs font-medium text-foreground/90 leading-snug">
                {currentBankOffer.offer}
              </p>
            </div>

            <div className="relative z-10 pt-2 flex items-center justify-between gap-2 border-t border-border/60">
              <span className="text-[11px] text-muted-foreground font-medium">
                Coupon: <strong className="font-mono text-foreground font-bold">{currentBankOffer.code}</strong>
              </span>

              <button
                type="button"
                onClick={() => handleCopy(currentBankOffer.code)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-[11px] font-semibold text-foreground border border-border transition active:scale-95"
              >
                {copiedCode === currentBankOffer.code ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-muted-foreground" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdsOfferSlider;
