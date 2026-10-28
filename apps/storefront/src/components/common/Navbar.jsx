import React, { useState, useEffect, useRef } from 'react';
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
  TrendingUp,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useProducts } from '../../hooks/useCatalog';
import { formatPrice } from '../../lib/formatters';

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
  searchTerm = '',
  onSearchChange,
  onSearchSubmit,
  categories = [],
  activeCategory,
  onSelectCategory,
  cartCount = 0,
  onOpenCart,
  wishlistCount = 0,
  onOpenWishlist,
  onNavigate,
  user,
  onOpenAi,
  onSelectProduct,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState(searchTerm || '');

  // Keep searchQuery synced if searchTerm changes externally (e.g. from Clear Filters button)
  useEffect(() => {
    setSearchQuery(searchTerm || '');
  }, [searchTerm]);

  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);

  // Live product search query ONLY for dropdown suggestions (does NOT trigger page filter)
  const { data: searchResultsData, isLoading: isSearchLoading } = useProducts({
    search: searchQuery?.trim() || '',
    limit: 6,
  });

  const searchResults = searchResultsData?.data || [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      const inDesktop = searchContainerRef.current && searchContainerRef.current.contains(event.target);
      const inMobile = mobileSearchContainerRef.current && mobileSearchContainerRef.current.contains(event.target);
      if (!inDesktop && !inMobile) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchCommit = (termToCommit) => {
    setIsDropdownOpen(false);
    const finalTerm = (termToCommit !== undefined ? termToCommit : searchQuery).trim();
    if (onSearchSubmit) {
      onSearchSubmit(finalTerm);
    } else if (onSearchChange) {
      onSearchChange(finalTerm);
    }
  };

  const handleProductClick = (slug) => {
    setIsDropdownOpen(false);
    if (onSelectProduct) {
      onSelectProduct(slug);
    } else {
      onNavigate('products');
    }
  };

  const handleViewAllResults = () => {
    handleSearchCommit(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsDropdownOpen(false);
    handleSearchCommit('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
        return;
      }
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      if (!isDropdownOpen) return;
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isDropdownOpen && selectedIndex >= 0 && searchResults[selectedIndex]) {
        handleProductClick(searchResults[selectedIndex].slug);
      } else {
        handleSearchCommit(searchQuery);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Reusable Flipkart-style search suggestions dropdown
  const renderSearchDropdown = () => {
    if (!isDropdownOpen) return null;

    const trimmedQuery = searchQuery?.trim();

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-border/60 animate-in fade-in-0 zoom-in-95 duration-150">
        {trimmedQuery ? (
          <>
            {isSearchLoading ? (
              <div className="p-5 text-xs text-muted-foreground flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Searching catalog...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-80 overflow-y-auto divide-y divide-border/40 py-1">
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-muted-foreground bg-muted/40 uppercase tracking-wider flex items-center justify-between">
                  <span>Matching Products</span>
                  <span>{searchResults.length} found</span>
                </div>
                {searchResults.map((item, index) => {
                  const img = item.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
                  const isSelected = selectedIndex === index;
                  return (
                    <div
                      key={item.id || item.slug}
                      onClick={() => handleProductClick(item.slug)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-muted/60'
                      }`}
                    >
                      <img
                        src={img}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg bg-muted border border-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {item.name}
                        </p>
                        {item.category?.name && (
                          <p className="text-[11px] font-medium text-primary flex items-center gap-1 mt-0.5">
                            <span className="text-muted-foreground">in</span>
                            <span className="font-semibold underline decoration-primary/30">{item.category.name}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-foreground">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-xs font-semibold text-foreground">No products found for "{searchQuery}"</p>
                <p className="text-[11px] text-muted-foreground mt-1">Press Enter to search entire catalog</p>
              </div>
            )}

            {/* Bottom Action Footer */}
            <div
              onClick={handleViewAllResults}
              className="p-2.5 px-3.5 bg-muted/40 hover:bg-muted text-xs font-semibold text-primary flex items-center justify-between cursor-pointer transition-colors border-t border-border"
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>See all results for "{searchQuery}"</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </>
        ) : (
          /* Popular / Trending Suggestions when search bar is focused without query */
          <div className="p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span>Trending Searches</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'ANC Headphones',
                'Smartwatch',
                'Mechanical Keyboard',
                'Travel Backpack',
                'GaN Charger',
                'Aroma Diffuser',
                'Titanium Ring',
              ].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearchCommit(term);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-colors font-medium border border-border"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-xs transition-all">
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

          {/* Desktop Search Bar with Instant Flipkart-Style Dropdown */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setIsDropdownOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search premium headphones, watches, desk gear..."
                className="w-full pl-10 pr-14 py-2 text-sm bg-muted/50 border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/60 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {renderSearchDropdown()}
          </div>

          {/* Desktop Navigation Links & Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('products')}
              className="hidden lg:flex h-9 px-3 text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/60 rounded-xl transition-colors"
            >
              All Products
            </Button>

            {/* Wishlist button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigate('wishlist')}
              className="relative h-9 w-9 rounded-xl border border-border/80 bg-background hover:bg-muted/60 hover:border-red-300 dark:hover:border-red-800 text-foreground transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 flex items-center justify-center shrink-0"
              title="Saved items (Wishlist)"
            >
              <Heart className={`w-4 h-4 transition-colors ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Button>

            {/* AI Assistant Quick Trigger - Modern gradient pill */}
            <Button
              onClick={onOpenAi}
              className="gap-1.5 h-9 px-3.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-sm hover:shadow active:scale-95 transition-all duration-200 border border-white/10 shrink-0"
              title="Open AI Shopping Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-200" />
              <span className="hidden sm:inline">Ask AI</span>
            </Button>

            {/* Cart Trigger Button - Clean modern unified pill */}
            <Button
              variant="outline"
              onClick={onOpenCart}
              className="relative gap-2 h-9 px-3.5 text-xs font-semibold rounded-xl border border-border/80 bg-background hover:bg-muted/60 text-foreground shadow-2xs hover:shadow-xs active:scale-95 transition-all duration-200 shrink-0 group"
              title="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-foreground/80 group-hover:text-primary transition-colors" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none shadow-2xs">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Customer Account Button / Pill */}
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('profile')}
                className="gap-2 h-9 px-2.5 text-xs font-semibold rounded-xl border border-border/80 bg-background hover:bg-muted/60 text-foreground shadow-2xs hover:shadow-xs active:scale-95 transition-all shrink-0"
                title="View Customer Profile"
              >
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user.name?.split(' ')[0] || 'Account'}</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('login')}
                className="gap-1.5 h-9 px-3.5 text-xs font-semibold rounded-xl border border-border/80 bg-background hover:bg-muted/60 hover:text-primary text-foreground shadow-2xs hover:shadow-xs active:scale-95 transition-all shrink-0 group"
                title="Customer Sign In / Sign Up"
              >
                <User className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
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

        {/* Mobile Search Input with Instant Dropdown */}
        <div ref={mobileSearchContainerRef} className="md:hidden pb-3 relative">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setIsDropdownOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search catalog products..."
              className="w-full pl-10 pr-14 py-2 text-sm bg-muted/50 border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/60 px-1.5 py-0.5 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {renderSearchDropdown()}
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
          <button
            onClick={() => {
              onNavigate('wishlist');
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-between w-full text-left py-2 font-medium text-foreground border-b border-border/50"
          >
            <div className="flex items-center gap-2">
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              <span>Saved Items (Wishlist)</span>
            </div>
            {wishlistCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {wishlistCount}
              </Badge>
            )}
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
            className="flex items-center gap-2 w-full text-left py-2 font-medium text-teal"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask Nexora AI Assistant</span>
          </button>
        </div>
      )}
    </header>

    {/* Category Pills Bar (Non-sticky: scrolls naturally with page content, only header holds) */}
    <div className="bg-card border-b border-border/70 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
  </>
);
}
