import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Menu,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function Navbar({
  searchTerm,
  onSearchChange,
  categories = [],
  activeCategory,
  onSelectCategory,
  cartCount = 0,
  onOpenCart,
  onNavigate,
  user,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-navy text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-teal" />
        <span>Experience AI-powered shopping assistance & free express shipping over ₹1,999</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy to-royal-blue flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <span className="font-bold text-lg tracking-tight">N</span>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-navy block leading-none">
                  NEXORA
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-royal-blue block">
                  Commerce
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search premium headphones, watches, desk gear..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-canvas border border-border rounded-xl text-gray-900 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-royal-blue focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-gray-900"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links & Action Icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => onNavigate('products')}
              className="hidden lg:flex items-center text-sm font-medium text-navy hover:text-royal-blue px-3 py-2 rounded-lg transition"
            >
              All Products
            </button>

            {/* Wishlist button */}
            <button
              onClick={() => alert('Wishlist feature connected to user account')}
              className="p-2 text-muted hover:text-navy hover:bg-canvas rounded-xl transition relative"
              title="Saved items"
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-navy text-white hover:bg-royal-blue px-3.5 py-2 rounded-xl text-sm font-medium shadow-sm transition active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-teal text-white text-xs font-bold px-1.5 py-0.2 rounded-full min-w-[20px] text-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Customer Account Button / Pill */}
            {user ? (
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-navy bg-canvas hover:bg-royal-blue/10 border border-border transition"
                title="View Customer Profile"
              >
                <div className="w-6 h-6 rounded-lg bg-navy text-white text-[11px] font-bold flex items-center justify-center">
                  {user.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <span className="hidden sm:inline">{user.name?.split(' ')[0] || 'Account'}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs font-semibold text-navy hover:text-royal-blue hover:bg-canvas rounded-xl transition"
                title="Customer Sign In / Sign Up"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted hover:text-navy rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search catalog products..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-canvas border border-border rounded-xl text-gray-900 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-royal-blue"
            />
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-t border-border no-scrollbar text-sm">
          <button
            onClick={() => onSelectCategory('')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              !activeCategory
                ? 'bg-navy text-white shadow-sm'
                : 'bg-white text-muted hover:text-navy border border-border hover:border-gray-300'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                activeCategory === cat.slug
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-white text-muted hover:text-navy border border-border hover:border-gray-300'
              }`}
            >
              {cat.name}
              {cat.productCount ? ` (${cat.productCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border px-4 py-4 space-y-3">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-navy border-b border-gray-100"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('products');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-navy border-b border-gray-100"
          >
            All Products
          </button>
          {user ? (
            <button
              onClick={() => {
                onNavigate('profile');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left py-2 font-medium text-royal-blue border-b border-gray-100"
            >
              <User className="w-4 h-4" />
              <span>My Profile ({user.name?.split(' ')[0]})</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onNavigate('login');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left py-2 font-medium text-royal-blue border-b border-gray-100"
            >
              <User className="w-4 h-4" />
              <span>Customer Sign In / Sign Up</span>
            </button>
          )}
          <div className="pt-2">
            <span className="text-xs font-semibold uppercase text-muted tracking-wider block mb-2">
              Categories
            </span>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-xs py-1.5 px-2 rounded-lg bg-canvas text-navy font-medium"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
