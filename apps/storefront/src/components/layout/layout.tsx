import React, { useState, useEffect } from 'react';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';

interface LayoutProps {
  children: React.ReactNode;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  categories?: any[];
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  cartCount?: number;
  onOpenCart?: () => void;
  user?: any;
  onNavigate?: (route: string) => void;
  onOpenAi?: () => void;
  onSelectProduct?: (slug: string) => void;
}

export function Layout({
  children,
  searchTerm = '',
  onSearchChange = () => {},
  categories = [],
  selectedCategory = '',
  onSelectCategory = () => {},
  cartCount = 0,
  onOpenCart = () => {},
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
      {/* Top micro announcement bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 text-center font-medium flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Experience AI-powered shopping assistance & free express shipping over ₹1,999</span>
        </div>

        {/* Dark/Light mode theme toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-6 px-2 text-primary-foreground hover:bg-primary-foreground/10 text-[11px] gap-1"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-3 h-3 text-yellow-300" /> : <Moon className="w-3 h-3" />}
          <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
        </Button>
      </div>

      {/* Main Top Navbar */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        categories={categories}
        activeCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        onNavigate={onNavigate}
        user={user}
        onOpenAi={onOpenAi}
        onSelectProduct={onSelectProduct}
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
