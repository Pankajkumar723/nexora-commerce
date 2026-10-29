import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/layout';
import { HomePage } from './routes/HomePage';
import { ProductsPage } from './routes/ProductsPage';
import { ProductDetailPage } from './routes/ProductDetailPage';
import { AuthPage } from './routes/AuthPage';
import { ProfilePage } from './routes/ProfilePage';
import { CheckoutPage } from './routes/CheckoutPage';
import { OrderConfirmationPage } from './routes/OrderConfirmationPage';
import { SavedItemsPage } from './routes/SavedItemsPage';
import { CartDrawer } from './features/cart/CartDrawer';
import { WishlistDrawer } from './features/wishlist/WishlistDrawer';
import { AiAssistantDrawer, AiAssistantTrigger } from './features/ai-assistant/AiAssistantDrawer';
import { useProducts, useCategories } from './hooks/useCatalog';
import { authClient } from './lib/auth-client';

const getInitialRoute = () => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && ['home', 'products', 'product-detail', 'profile', 'wishlist', 'checkout', 'order-confirmation', 'login', 'signup'].includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem('nexora_active_route');
    if (saved && ['home', 'products', 'product-detail', 'profile', 'wishlist', 'checkout', 'order-confirmation', 'login', 'signup'].includes(saved)) {
      return saved;
    }
  }
  return 'profile';
};

export function App() {
  // Navigation state (Defaulting to 'profile' per user requirement, with URL hash persistence)
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [activeSlug, setActiveSlug] = useState('');

  // Search and Filter State (Applied search filters catalog page only when committed)
  const [appliedSearch, setAppliedSearch] = useState('');
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
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Wishlist State (Persisted in localStorage)
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Customer Auth State (Managed via Better Auth client & localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    const defaultUser = {
      id: 'usr-customer-1',
      name: 'Aryan Sharma',
      email: 'customer@nexora.com',
      role: 'CUSTOMER',
    };
    try {
      localStorage.setItem('nexora_user', JSON.stringify(defaultUser));
    } catch (e) {
      console.warn(e);
    }
    return defaultUser;
  });

  // Confirmed Order State (Persisted in localStorage)
  const [confirmedOrder, setConfirmedOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Better Auth session check on application mount
  useEffect(() => {
    async function initSession() {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setCurrentUser(session.data.user);
          localStorage.setItem('nexora_user', JSON.stringify(session.data.user));
        }
      } catch (e) {
        // Fallback to local session
      }
    }
    initSession();
  }, []);

  // Synchronize route with URL hash and localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeHash = window.location.hash.replace('#', '').trim();
      if (!activeHash) {
        window.location.hash = currentRoute;
      }
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && ['home', 'products', 'product-detail', 'profile', 'wishlist', 'checkout', 'order-confirmation', 'login', 'signup'].includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash.replace('#', '').trim();
      if (currentHash !== currentRoute) {
        window.location.hash = currentRoute;
      }
      localStorage.setItem('nexora_active_route', currentRoute);
    }
  }, [currentRoute]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      console.warn('Better Auth sign out warning:', e);
    }
    localStorage.removeItem('nexora_auth_token');
    localStorage.removeItem('nexora_user');
    setCurrentUser(null);
    setCurrentRoute('home');
  };

  useEffect(() => {
    try {
      localStorage.setItem('nexora_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('nexora_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('Failed to persist wishlist:', e);
    }
  }, [wishlistItems]);

  // Data fetching
  const { data: categories = [] } = useCategories();
  const { data: productsResponse, isLoading: isProductsLoading } = useProducts({
    page: currentPage,
    limit: 12,
    search: appliedSearch?.trim() || undefined,
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

  // Wishlist Handlers
  const handleToggleWishlist = (product) => {
    if (!product) return;
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleRemoveFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearWishlist = () => {
    setWishlistItems([]);
  };

  const handleMoveWishlistToCart = (product) => {
    handleAddToCart({
      product,
      variant: product.variants?.[0],
      quantity: 1,
    });
    handleRemoveFromWishlist(product.id);
  };

  const handleMoveAllWishlistToCart = () => {
    wishlistItems.forEach((product) => {
      handleAddToCart({
        product,
        variant: product.variants?.[0],
        quantity: 1,
      });
    });
    handleClearWishlist();
  };

  const handleResetFilters = () => {
    setAppliedSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentSort('newest');
    setCurrentPage(1);
  };

  const handleSearchSubmit = (term) => {
    setAppliedSearch(term || '');
    setCurrentRoute('products');
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (slug) => {
    setActiveSlug(slug);
    setCurrentRoute('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (route) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      window.location.hash = route;
      localStorage.setItem('nexora_active_route', route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Layout
      currentRoute={currentRoute}
      searchTerm={appliedSearch}
      onSearchSubmit={handleSearchSubmit}
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={(cat) => {
        setSelectedCategory(cat);
        setCurrentRoute('products');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      cartCount={totalCartCount}
      onOpenCart={() => setIsCartOpen(true)}
      wishlistCount={wishlistItems.length}
      onOpenWishlist={() => setIsWishlistOpen(true)}
      onNavigate={handleNavigate}
      user={currentUser}
      onOpenAi={() => setIsAiOpen(true)}
      onSelectProduct={handleSelectProduct}
    >
      {/* Route Switcher */}
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
          wishlistItems={wishlistItems}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {currentRoute === 'products' && (
        <ProductsPage
          products={products}
          meta={meta}
          categories={categories}
          isLoading={isProductsLoading}
          searchTerm={appliedSearch}
          onSearchChange={setAppliedSearch}
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
          wishlistItems={wishlistItems}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {currentRoute === 'product-detail' && (
        <ProductDetailPage
          slug={activeSlug}
          onBack={() => handleNavigate('products')}
          onAddToCart={handleAddToCart}
          onDirectCheckout={() => setIsCartOpen(true)}
          wishlistItems={wishlistItems}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {(currentRoute === 'login' || currentRoute === 'signup') && (
        <AuthPage
          initialMode={currentRoute === 'signup' ? 'signup' : 'login'}
          onNavigate={handleNavigate}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      )}

      {currentRoute === 'profile' && (
        <ProfilePage
          user={currentUser}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onAddToCart={(product, variant) =>
            handleAddToCart({ product, variant: variant || product.variants?.[0], quantity: 1 })
          }
        />
      )}

      {currentRoute === 'checkout' && (
        <CheckoutPage
          cartItems={cartItems}
          user={currentUser}
          onNavigate={handleNavigate}
          onOrderSuccess={(order) => {
            setConfirmedOrder(order);
            try {
              localStorage.setItem('nexora_last_order', JSON.stringify(order));
            } catch (e) {
              console.warn('Failed to save last order:', e);
            }
            setCartItems([]);
            setCurrentRoute('order-confirmation');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentRoute === 'order-confirmation' && (
        <OrderConfirmationPage
          order={confirmedOrder}
          onNavigate={handleNavigate}
        />
      )}

      {currentRoute === 'wishlist' && (
        <SavedItemsPage
          items={wishlistItems}
          onRemoveItem={handleRemoveFromWishlist}
          onMoveToCart={(product) => handleAddToCart({ product, variant: product.variants?.[0], quantity: 1 })}
          onMoveAllToCart={handleMoveAllWishlistToCart}
          onClearAll={handleClearWishlist}
          onDirectOrder={(product) => {
            handleAddToCart({ product, variant: product.variants?.[0], quantity: 1 });
            handleNavigate('checkout');
          }}
          onSelectProduct={handleSelectProduct}
          onExploreAll={() => handleNavigate('products')}
        />
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentRoute('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Slide-over Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlistItems}
        onRemoveItem={handleRemoveFromWishlist}
        onMoveToCart={handleMoveWishlistToCart}
        onMoveAllToCart={handleMoveAllWishlistToCart}
        onClearAll={handleClearWishlist}
        onViewFullPage={() => {
          setIsWishlistOpen(false);
          handleNavigate('wishlist');
        }}
        onSelectProduct={(slug) => {
          setIsWishlistOpen(false);
          handleSelectProduct(slug);
        }}
      />

      {/* Floating AI Assistant Trigger & Drawer */}
      <AiAssistantTrigger onClick={() => setIsAiOpen(true)} />
      <AiAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onAddToCart={(product) => handleAddToCart({ product, variant: product.variants?.[0], quantity: 1 })}
        onSelectProduct={handleSelectProduct}
      />
    </Layout>
  );
}

export default App;
