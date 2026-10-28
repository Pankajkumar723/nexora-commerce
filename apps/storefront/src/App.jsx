import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './routes/HomePage';
import { ProductsPage } from './routes/ProductsPage';
import { ProductDetailPage } from './routes/ProductDetailPage';
import { CartDrawer } from './features/cart/CartDrawer';
import { useProducts, useCategories } from './hooks/useCatalog';
import { useDebounce } from './hooks/useDebounce';

export function App() {
  // Navigation state
  const [currentRoute, setCurrentRoute] = useState('home'); // 'home' | 'products' | 'product-detail'
  const [activeSlug, setActiveSlug] = useState('');

  // Search and Filter State
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentSort, setCurrentSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nexora_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cartItems]);

  // Data fetching
  const { data: categories = [] } = useCategories();
  const { data: productsResponse, isLoading: isProductsLoading } = useProducts({
    page: currentPage,
    limit: 12,
    search: debouncedSearch,
    category: selectedCategory,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sort: currentSort,
  });

  const products = productsResponse?.data || [];
  const meta = productsResponse?.meta || { total: products.length, page: 1, limit: 12, totalPages: 1 };

  // Cart Handlers
  const handleAddToCart = ({ product, variant, quantity = 1 }) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variant?.id === variant?.id,
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      return [...prev, { product, variant, quantity }];
    });
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(item);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.product.id === item.product.id && i.variant?.id === item.variant?.id
          ? { ...i, quantity: newQuantity }
          : i,
      ),
    );
  };

  const handleRemoveItem = (item) => {
    setCartItems((prev) =>
      prev.filter(
        (i) => !(i.product.id === item.product.id && i.variant?.id === item.variant?.id),
      ),
    );
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentSort('newest');
    setCurrentPage(1);
  };

  const handleSelectProduct = (slug) => {
    setActiveSlug(slug);
    setCurrentRoute('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (route) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {/* Top Navigation */}
      <Navbar
        searchTerm={searchInput}
        onSearchChange={(term) => {
          setSearchInput(term);
          if (term && currentRoute !== 'products') {
            setCurrentRoute('products');
          }
        }}
        categories={categories}
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentRoute('products');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Main Page Routing */}
      <div className="flex-1">
        {currentRoute === 'home' && (
          <HomePage
            products={products}
            categories={categories}
            isLoading={isProductsLoading}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentRoute('products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddToCart={(product) => handleAddToCart({ product, variant: product.variants?.[0], quantity: 1 })}
            onExploreAll={() => handleNavigate('products')}
          />
        )}

        {currentRoute === 'products' && (
          <ProductsPage
            products={products}
            meta={meta}
            categories={categories}
            isLoading={isProductsLoading}
            searchTerm={searchInput}
            onSearchChange={setSearchInput}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            currentSort={currentSort}
            onSortChange={setCurrentSort}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onResetFilters={handleResetFilters}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(product) => handleAddToCart({ product, variant: product.variants?.[0], quantity: 1 })}
          />
        )}

        {currentRoute === 'product-detail' && (
          <ProductDetailPage
            slug={activeSlug}
            onBack={() => handleNavigate('products')}
            onAddToCart={handleAddToCart}
            onDirectCheckout={() => setIsCartOpen(true)}
          />
        )}
      </div>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          alert('Razorpay Checkout integration initiates in Phase E! Cart total calculated server-side.');
        }}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
export default App;
