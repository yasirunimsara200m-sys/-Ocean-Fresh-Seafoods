import React, { useState, useEffect } from 'react';
import { OutletProvider } from './context/OutletContext';
import { CartProvider } from './context/CartContext';
import { api } from './services/api';
import { Product, Category, Review, Order } from './types';

// Components & Customer Pages
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { ProductModal } from './components/ProductModal';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Checkout } from './pages/Checkout';
import { TrackOrder } from './pages/TrackOrder';
import { OutletsPage } from './pages/OutletsPage';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminMessages } from './pages/admin/AdminMessages';

import { Sparkles, Loader2 } from 'lucide-react';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [initialShopCategory, setInitialShopCategory] = useState<string>('all');
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin state
  const [adminUser, setAdminUser] = useState<any>(() => {
    const token = localStorage.getItem('tsg_admin_token');
    return token ? { name: 'Store Administrator', role: 'superadmin' } : null;
  });
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  const loadDataFromDatabase = async () => {
    try {
      const [prodData, catData, revData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getReviews(),
      ]);
      setProducts(prodData.products);
      setCategories(catData.categories);
      setReviews(revData.reviews);
    } catch (err) {
      console.error('Failed to load seafood data from database', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromDatabase();
  }, []);

  const handleNavigate = (tab: string, categorySlug?: string) => {
    if (categorySlug) {
      setInitialShopCategory(categorySlug);
    }
    // If switching back from admin or entering shop/home, refresh data from DB
    if (currentTab === 'admin' && tab !== 'admin') {
      loadDataFromDatabase();
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setTrackingOrderNumber(order.order_number);
    setCurrentTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('tsg_admin_token');
    setAdminUser(null);
    setCurrentTab('home');
  };

  // If in Admin Section
  if (currentTab === 'admin') {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={(admin) => setAdminUser(admin)}
          onBackToStore={() => setCurrentTab('home')}
        />
      );
    }

    return (
      <AdminLayout
        currentAdminTab={adminTab}
        setCurrentAdminTab={setAdminTab}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        onViewStore={() => setCurrentTab('home')}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={(t) => setAdminTab(t)} />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'categories' && <AdminCategories />}
        {adminTab === 'messages' && <AdminMessages />}
      </AdminLayout>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-700 to-indigo-950 flex items-center justify-center text-white shadow-xl animate-pulse">
          <Sparkles className="w-7 h-7 text-cyan-300" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-black tracking-tight">OCEAN <span className="text-cyan-400">FRESH</span></h2>
          <p className="text-xs text-slate-400">Loading fresh ocean catch from Kirulapone Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Sticky Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => handleNavigate(tab)}
        onOpenProductModal={(p) => setSelectedProduct(p)}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <Home
            products={products}
            categories={categories}
            reviews={reviews}
            onOpenProductModal={(p) => setSelectedProduct(p)}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'shop' && (
          <Shop
            products={products}
            categories={categories}
            initialCategory={initialShopCategory}
            onOpenProductModal={(p) => setSelectedProduct(p)}
          />
        )}

        {currentTab === 'boat-to-plate' && (
          <div className="space-y-0">
            <div className="bg-slate-900 py-12 px-4 sm:px-6 text-center text-white">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800">
                Supply Chain Transparency
              </span>
              <h1 className="text-3xl sm:text-4xl font-black mt-3">From Boat to Plate</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
                Trace our direct fisherman partnerships, cold chain transport, and zero middleman commitment.
              </p>
            </div>
            <Home
              products={products}
              categories={categories}
              reviews={reviews}
              onOpenProductModal={(p) => setSelectedProduct(p)}
              onNavigate={handleNavigate}
            />
          </div>
        )}

        {currentTab === 'outlets' && (
          <OutletsPage onSelectAndShop={() => handleNavigate('shop')} />
        )}

        {currentTab === 'about' && (
          <About onShopClick={() => handleNavigate('shop')} />
        )}

        {currentTab === 'contact' && <Contact />}

        {currentTab === 'checkout' && (
          <Checkout
            onSuccess={handleOrderSuccess}
            onExplore={() => handleNavigate('shop')}
          />
        )}

        {currentTab === 'track' && (
          <TrackOrder
            initialOrderNumber={trackingOrderNumber}
            onExplore={() => handleNavigate('shop')}
          />
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
        onExplore={() => handleNavigate('shop')}
      />

      {/* Product Detail & Cut Variants Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Footer */}
      <Footer onNavClick={(tab) => handleNavigate(tab)} />

      {/* Floating Scroll to Top */}
      <ScrollToTop />
    </div>
  );
}

export default function App() {
  return (
    <OutletProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </OutletProvider>
  );
}
