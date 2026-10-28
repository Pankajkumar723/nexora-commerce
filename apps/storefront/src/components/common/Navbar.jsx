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
  LayoutGrid,
  Headphones,
  Watch,
  Keyboard,
  Briefcase,
  Shirt,
  Home,
  Camera,
  Zap,
  Gamepad2,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
const getCategoryIcon = (slug = '', name = '') => {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (s.includes('audio') || n.includes('audio') || n.includes('acoustics') || n.includes('headphone')) return Headphones;
  if (s.includes('wearable') || n.includes('wearable') || n.includes('watch')) return Watch;
  if (s.includes('desk') || n.includes('desk') || n.includes('ergonomic') || n.includes('keyboard')) return Keyboard;
  if (s.includes('travel') || s.includes('edc') || n.includes('carry') || n.includes('bag')) return Briefcase;
  if (s.includes('apparel') || n.includes('clothing') || n.includes('apparel') || n.includes('wear')) return Shirt;
  if (s.includes('smart-home') || n.includes('smart home') || n.includes('home')) return Home;
  if (s.includes('photo') || n.includes('camera') || n.includes('creator')) return Camera;
  if (s.includes('power') || n.includes('charging') || n.includes('charger') || n.includes('power')) return Zap;
  if (s.includes('gaming') || n.includes('gaming') || n.includes('game')) return Gamepad2;
  return Layers;
};

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
  onOpenAi,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
                <span className="font-bold text-lg tracking-tight">N</span>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-foreground block leading-none">
                  NEXORA
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-primary block">
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
                className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links & Action Icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('products')}
              className="hidden lg:flex text-sm font-medium text-foreground hover:text-primary"
            >
              All Products
            </Button>

            {/* Wishlist button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => alert('Wishlist feature connected to user account')}
              className="text-muted-foreground hover:text-foreground"
              title="Saved items"
            >
              <Heart className="w-4 h-4" />
            </Button>

            {/* AI Assistant Quick Trigger */}
            <Button
              onClick={onOpenAi}
              className="gap-1.5 h-9 px-3 text-xs font-bold shadow-sm"
              title="Open AI Shopping Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Ask AI</span>
            </Button>

            {/* Cart Trigger Button */}
            <Button
              variant="outline"
              onClick={onOpenCart}
              className="relative gap-2 h-9 px-3 text-xs font-semibold border-input shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <Badge variant="default" className="h-5 px-1.5 text-[10px] font-bold">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Customer Account Button / Pill */}
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('profile')}
                className="gap-2 h-9 px-2.5 text-xs font-semibold border-input"
                title="View Customer Profile"
              >
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user.name?.split(' ')[0] || 'Account'}</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('login')}
                className="gap-1.5 h-9 px-3 text-xs font-semibold text-foreground hover:text-primary"
                title="Customer Sign In / Sign Up"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
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
              className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Category Pills Bar (No scrollbar line, proper category icons) */}
        <div className="border-t border-border/80">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-sm scroll-smooth">
            <Button
              variant={!activeCategory ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectCategory('')}
              className="rounded-full text-xs h-8 px-3.5 whitespace-nowrap gap-1.5 font-medium shrink-0 shadow-2xs"
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span>All Categories</span>
            </Button>
            {categories.map((cat) => {
              const IconComponent = getCategoryIcon(cat.slug, cat.name);
              const isSelected = activeCategory === cat.slug;
              return (
                <Button
                  key={cat.id || cat.slug}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSelectCategory(cat.slug)}
                  className="rounded-full text-xs h-8 px-3.5 whitespace-nowrap gap-1.5 font-medium shrink-0 shadow-2xs"
                >
                  <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                  <span>{cat.name}</span>
                  {cat.productCount ? (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 ${
                        isSelected
                          ? 'bg-primary-foreground/25 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {cat.productCount}
                    </span>
                  ) : null}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 py-4 space-y-3">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-foreground border-b border-border/50"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('products');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-foreground border-b border-border/50"
          >
            All Products
          </button>
          {user ? (
            <button
              onClick={() => {
                onNavigate('profile');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left py-2 font-medium text-primary border-b border-border/50"
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
              className="flex items-center gap-2 w-full text-left py-2 font-medium text-primary border-b border-border/50"
            >
              <User className="w-4 h-4" />
              <span>Customer Sign In / Sign Up</span>
            </button>
          )}

          <button
            onClick={() => {
              if (onOpenAi) onOpenAi();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left py-2.5 font-bold text-primary border-b border-border/50 bg-primary/10 px-2 rounded-xl"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>Ask Nexora AI Assistant</span>
          </button>
          <div className="pt-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block mb-2">
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
                  className="text-left text-xs py-1.5 px-2 rounded-lg bg-muted text-foreground font-medium"
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

export default Navbar;
