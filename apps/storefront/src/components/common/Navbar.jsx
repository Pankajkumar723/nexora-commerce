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
  Sun,
  Moon,
  Smartphone,
  Laptop,
  Armchair,
  Tv,
  HeartPulse,
  ShoppingBasket,
  Coffee,
  BookOpen,
  Baby,
  Dumbbell,
  Car,
  Footprints,
  Luggage,
  Utensils,
  LogOut,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useProducts } from '../../hooks/useCatalog';
import { formatPrice } from '../../lib/formatters';

const getCategoryIcon = (slug = '', name = '') => {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (s.includes('fashion') || n.includes('fashion') || s.includes('apparel') || n.includes('clothing')) return Shirt;
  if (s.includes('mobile') || n.includes('mobile') || s.includes('phone')) return Smartphone;
  if (s.includes('computer') || n.includes('computer') || s.includes('laptop')) return Laptop;
  if (s.includes('audio') || n.includes('audio') || s.includes('acoustics') || s.includes('headphone')) return Headphones;
  if (s.includes('electronic') || n.includes('electronic')) return Tv;
  if (s.includes('furniture') || n.includes('furniture') || s.includes('decor')) return Armchair;
  if (s.includes('appliance') || n.includes('appliance')) return Zap;
  if (s.includes('beauty') || n.includes('beauty') || s.includes('personal-care')) return Sparkles;
  if (s.includes('health') || n.includes('health') || s.includes('wellness')) return HeartPulse;
  if (s.includes('grocery') || n.includes('grocery') || s.includes('essential')) return ShoppingBasket;
  if (s.includes('food') || n.includes('food') || s.includes('beverage')) return Coffee;
  if (s.includes('book') || n.includes('book') || s.includes('stationery')) return BookOpen;
  if (s.includes('toy') || n.includes('toy') || s.includes('game') || s.includes('gaming')) return Gamepad2;
  if (s.includes('baby') || n.includes('baby') || s.includes('kid')) return Baby;
  if (s.includes('sport') || n.includes('sport') || s.includes('fitness')) return Dumbbell;
  if (s.includes('auto') || n.includes('auto') || s.includes('car')) return Car;
  if (s.includes('jewel') || n.includes('jewel') || s.includes('watch') || s.includes('wearable')) return Watch;
  if (s.includes('footwear') || n.includes('footwear') || s.includes('shoe')) return Footprints;
  if (s.includes('bag') || n.includes('bag') || s.includes('luggage') || s.includes('travel')) return Luggage;
  if (s.includes('pet') || n.includes('pet')) return Dog;
  if (s.includes('kitchen') || n.includes('kitchen')) return Utensils;
  if (s.includes('desk') || n.includes('desk') || s.includes('ergonomic')) return Keyboard;
  if (s.includes('photo') || n.includes('camera')) return Camera;
  if (s.includes('home') || n.includes('home')) return Home;
  return Layers;
};

export function Navbar({
  currentRoute = 'profile',
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
  onLogout,
  onOpenAi,
  onSelectProduct,
  isDarkMode = false,
  onToggleTheme,
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
              className="flex items-center gap-2.5 text-left focus:outline-none group p-1 -m-1"
            >
              <picture>
                <source
                  type="image/webp"
                  srcSet="/logo-40x40.webp 1x, /logo-80x80.webp 2x"
                />
                <img
                  src="/logo-40x40.png"
                  srcSet="/logo-40x40.png 1x, /logo-80x80.png 2x"
                  alt="Nexora Commerce Logo"
                  width={40}
                  height={40}
                  loading="eager"
                  fetchPriority="high"
                  className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                />
              </picture>
              <div>
                <span className="text-xl font-bold tracking-tight text-foreground block leading-none">
                  NEXORA
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-royal-blue block">
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
                  aria-label="Clear search query"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/60 px-2 py-1 rounded cursor-pointer min-h-[28px]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {renderSearchDropdown()}
          </div>

          {/* Desktop Navigation Links & Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Wishlist button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigate('wishlist')}
              className="relative h-10 w-10 min-w-[40px] min-h-[40px] rounded-xl border border-border/80 bg-background hover:bg-muted/60 hover:border-red-300 dark:hover:border-red-800 text-foreground transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 flex items-center justify-center shrink-0"
              title="Saved items (Wishlist)"
              aria-label={`View Wishlist, ${wishlistCount} saved items`}
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
              className="gap-1.5 h-10 px-3.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-sm hover:shadow active:scale-95 transition-all duration-200 border border-white/10 shrink-0"
              title="Open AI Shopping Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-200" />
              <span className="hidden sm:inline">Ask AI</span>
            </Button>

            {/* Cart Trigger Button - Clean modern unified pill */}
            <Button
              variant="outline"
              onClick={onOpenCart}
              className="relative gap-2 h-10 px-3.5 text-xs font-semibold rounded-xl border border-border/80 bg-background hover:bg-muted/60 text-foreground shadow-2xs hover:shadow-xs active:scale-95 transition-all duration-200 shrink-0 group"
              title="View Shopping Cart"
              aria-label={`View Shopping Cart, ${cartCount} items`}
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
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant={currentRoute === 'profile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onNavigate('profile')}
                  className={`gap-2 h-10 px-3.5 text-xs font-semibold rounded-xl border shadow-2xs hover:shadow-xs active:scale-95 transition-all shrink-0 ${
                    currentRoute === 'profile'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20'
                      : 'border-border/80 bg-background hover:bg-muted/60 text-foreground'
                  }`}
                  title="View Customer Profile & Orders"
                >
                  <Avatar className="w-5 h-5">
                    <AvatarFallback
                      className={
                        currentRoute === 'profile'
                          ? 'bg-primary-foreground text-primary text-[10px] font-bold'
                          : 'bg-primary text-primary-foreground text-[10px] font-bold'
                      }
                    >
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{user.name?.split(' ')[0] || 'Profile'}</span>
                </Button>
                {onLogout && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onLogout}
                    className="h-10 w-10 rounded-xl border border-border/80 bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-muted-foreground shadow-2xs hover:shadow-xs active:scale-95 transition-all shrink-0"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <Button
                variant={currentRoute === 'login' || currentRoute === 'signup' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onNavigate('login')}
                className={`gap-1.5 h-10 px-4 text-xs font-semibold rounded-xl border shadow-2xs hover:shadow-xs active:scale-95 transition-all shrink-0 ${
                  currentRoute === 'login' || currentRoute === 'signup'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20'
                    : 'border-border/80 bg-background hover:bg-muted/60 text-foreground hover:border-primary/50'
                }`}
                title="Sign In or Create Account"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Button>
            )}

            {/* Dark / Light Theme Toggle */}
            {onToggleTheme && (
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleTheme}
                className="h-10 w-10 min-w-[40px] min-h-[40px] rounded-xl border border-border/80 bg-background hover:bg-muted/60 text-foreground shadow-2xs hover:shadow-xs active:scale-95 transition-all shrink-0"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                )}
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground h-10 w-10 min-w-[40px] min-h-[40px]"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
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
            <>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between w-full text-left py-2 font-medium border-b border-border/50 ${
                  currentRoute === 'profile' ? 'text-primary font-bold' : 'text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>My Profile & Orders ({user.name?.split(' ')[0] || 'User'})</span>
                </div>
                {currentRoute === 'profile' && (
                  <Badge variant="default" className="text-[10px]">
                    Active
                  </Badge>
                )}
              </button>
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left py-2 font-medium text-destructive border-b border-border/50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => {
                onNavigate('login');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left py-2 font-semibold text-primary border-b border-border/50"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          )}

          <button
            onClick={() => {
              if (onOpenAi) onOpenAi();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left py-2 font-medium text-teal border-b border-border/50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask Nexora AI Assistant</span>
          </button>

          {onToggleTheme && (
            <button
              onClick={() => {
                onToggleTheme();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left py-2 font-medium text-foreground"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
              <span>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </button>
          )}
        </div>
      )}
    </header>

    {/* Category Pills Bar (Non-sticky: scrolls naturally with page content, only header holds) */}
    <div className="bg-card border-b border-border/70 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-sm scroll-smooth">
          <Button
            variant={currentRoute === 'home' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onNavigate('home')}
            className={`rounded-full text-xs h-8 px-3.5 whitespace-nowrap gap-1.5 font-medium shrink-0 shadow-2xs ${
              currentRoute === 'home'
                ? 'bg-navy text-white hover:bg-royal-blue border-navy'
                : 'hover:border-primary/50 text-foreground'
            }`}
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span>Home</span>
          </Button>

          <Button
            variant={currentRoute === 'products' && !activeCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              onSelectCategory('');
              onNavigate('products');
            }}
            className={`rounded-full text-xs h-8 px-3.5 whitespace-nowrap gap-1.5 font-medium shrink-0 shadow-2xs ${
              currentRoute === 'products' && !activeCategory
                ? 'bg-navy text-white hover:bg-royal-blue border-navy'
                : 'hover:border-primary/50 text-foreground'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            <span>All Products</span>
          </Button>

          {user ? (
            <Button
              variant={currentRoute === 'profile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onNavigate('profile')}
              className={`rounded-full text-xs h-8 px-3.5 whitespace-nowrap gap-1.5 font-semibold shrink-0 shadow-2xs ${
                currentRoute === 'profile'
                  ? 'bg-navy text-white hover:bg-royal-blue border-navy'
                  : 'hover:border-primary/50 text-foreground'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>My Profile & Orders</span>
            </Button>
          ) : (
            <Button
              variant={currentRoute === 'login' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onNavigate('login')}
              className={`rounded-full text-xs h-8 px-3.5 whitespace-nowrap gap-1.5 font-semibold shrink-0 shadow-2xs ${
                currentRoute === 'login'
                  ? 'bg-navy text-white hover:bg-royal-blue border-navy'
                  : 'hover:border-primary/50 text-foreground'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Sign In / Register</span>
            </Button>
          )}

          <div className="h-4 w-px bg-border/80 shrink-0 mx-1" />
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
