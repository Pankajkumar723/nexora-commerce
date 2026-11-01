import React, { useState, useEffect } from 'react';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onSearchSubmit?: (term: string) => void;
  categories?: any[];
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  cartCount?: number;
  onOpenCart?: () => void;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  user?: any;
  onNavigate?: (route: string) => void;
  onOpenAi?: () => void;
  onSelectProduct?: (slug: string) => void;
}

export function Layout({
  children,
  currentRoute = 'home',
  searchTerm = '',
  onSearchChange = () => {},
  onSearchSubmit = () => {},
  categories = [],
  selectedCategory = '',
  onSelectCategory = () => {},
  cartCount = 0,
  onOpenCart = () => {},
  wishlistCount = 0,
  onOpenWishlist = () => {},
  user,
  onNavigate = () => {},
  onOpenAi = () => {},
  onSelectProduct = () => {},
}: LayoutProps) {
  // Theme state for dark / light mode matching shadcn theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('nexora_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
        localStorage.setItem('nexora_theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('nexora_theme', 'light');
      }
    } catch (e) {
      console.warn('Theme update error:', e);
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Main Top Navbar */}
      <Navbar
        currentRoute={currentRoute}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        categories={categories}
        activeCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        wishlistCount={wishlistCount}
        onOpenWishlist={onOpenWishlist}
        onNavigate={onNavigate}
        user={user}
        onOpenAi={onOpenAi}
        onSelectProduct={onSelectProduct}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Page Content Slot */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default Layout;
