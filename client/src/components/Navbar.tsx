import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, MapPin, Phone, ShieldCheck, Compass, Sparkles, Menu, X, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOutlet } from '../context/OutletContext';
import { api } from '../services/api';
import { Product } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenProductModal: (product: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenProductModal }) => {
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const { selectedOutlet } = useOutlet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      api.getProducts({ search: searchQuery.trim() })
        .then((data) => setSearchResults(data.products.slice(0, 5)))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const outletPhone = selectedOutlet?.phone || '+94 78 479 8095';
  const cleanPhone = outletPhone.replace(/[^0-9]/g, '');
  const outletCity = selectedOutlet?.city || 'Kirulapone, Colombo 5';

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      {/* Top Announcement & Hotlines Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-3 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-0">
          {/* Left: Store Location */}
          <div className="flex items-center min-w-0 gap-3">
            <div className="flex items-center space-x-1.5 font-medium text-cyan-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-700/80 shrink-0">
              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Flagship Store: <strong>{outletCity}</strong></span>
              <span className="sm:hidden font-bold text-[11px]">{selectedOutlet?.slug || 'Kirulapone'}</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded-sm ml-0.5">Open</span>
            </div>

            <div className="hidden sm:flex items-center space-x-3 text-slate-300">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-500 text-slate-950" />
                <span>WhatsApp: <strong>{outletPhone}</strong></span>
              </a>
              <span className="text-slate-700">|</span>
              <div className="flex items-center space-x-1 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hotline: <strong className="text-white">{outletPhone}</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Guarantee & Quick Navigation */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="hidden md:flex items-center space-x-1.5 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-semibold">Cash on Delivery • WhatsApp Orders Welcomed</span>
            </div>

            <div className="flex items-center space-x-2 text-[11px]">
              <button
                onClick={() => setCurrentTab('track')}
                className="hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                Track Order
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => setCurrentTab('admin')}
                className="text-cyan-400 hover:text-cyan-200 font-semibold flex items-center space-x-1 cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-3 h-3" />
                <span className="hidden xs:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <nav className="glass-nav border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentTab('home')}
                className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer text-left"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-700 to-indigo-950 flex items-center justify-center text-white shadow-lg shadow-cyan-900/20 group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 font-sans leading-none">
                      CEYLON<span className="text-cyan-600">CATCH</span>
                    </span>
                    <span className="hidden sm:inline text-[10px] uppercase font-bold bg-cyan-100 text-cyan-900 px-1.5 py-0.5 rounded tracking-wide">
                      Premium
                    </span>
                  </div>
                  <p className="hidden sm:block text-[11px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
                    Seafood Store • Kirulapone
                  </p>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 font-medium text-sm text-slate-700">
              {[
                { id: 'home', label: 'Home' },
                { id: 'shop', label: 'Fresh Seafood' },
                { id: 'boat-to-plate', label: 'Boat to Plate' },
                { id: 'outlets', label: 'Store & Delivery' },
                { id: 'about', label: 'Our Story' },
                { id: 'contact', label: 'Contact Us' },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => setCurrentTab(link.id)}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    currentTab === link.id
                      ? 'bg-cyan-50 text-cyan-700 font-bold shadow-xs'
                      : 'hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Live Search Bar */}
            <div ref={searchRef} className="hidden md:block relative flex-1 max-w-xs xl:max-w-sm">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Seer, Prawns, Crab, Tuna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100/90 border border-slate-200/80 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all shadow-inner"
                />
              </div>

              {/* Search Results Dropdown */}
              {searchFocused && searchQuery.trim() && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-150">
                  <div className="p-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Search results for "{searchQuery}"</span>
                    {isSearching && <span className="text-[10px] text-cyan-600 animate-pulse">Searching...</span>}
                  </div>
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onOpenProductModal(p);
                            setSearchFocused(false);
                          }}
                          className="w-full text-left p-3 hover:bg-slate-50 flex items-center space-x-3 cursor-pointer transition-colors"
                        >
                          <img src={p.image_url} alt={p.name} className="w-11 h-11 rounded-lg object-cover border border-slate-100" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-900 truncate">{p.name}</h4>
                            <p className="text-[11px] text-slate-500 truncate">{p.category_name} • {p.unit}</p>
                          </div>
                          <span className="text-xs font-bold text-cyan-700">Rs. {p.base_price.toLocaleString()}</span>
                        </button>
                      ))}
                      <div className="p-2 bg-slate-50 text-center">
                        <button
                          onClick={() => {
                            setCurrentTab('shop');
                            setSearchFocused(false);
                          }}
                          className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 cursor-pointer"
                        >
                          View all catalog products →
                        </button>
                      </div>
                    </div>
                  ) : !isSearching ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No seafood found matching "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Cart Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center space-x-2.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white px-4 py-2.5 rounded-full shadow-md shadow-cyan-900/10 hover:shadow-lg transition-all cursor-pointer group"
                aria-label="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left pl-1">
                  <div className="text-[10px] font-semibold text-cyan-100 uppercase tracking-wider leading-tight">My Cart</div>
                  <div className="text-xs font-bold leading-tight">Rs. {subtotal.toLocaleString()}</div>
                </div>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Open Mobile Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search seafood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { id: 'home', label: 'Home' },
                { id: 'shop', label: 'Fresh Seafood' },
                { id: 'boat-to-plate', label: 'Boat to Plate' },
                { id: 'outlets', label: 'Store & Delivery' },
                { id: 'about', label: 'About Us' },
                { id: 'contact', label: 'Contact Us' },
                { id: 'track', label: 'Track Order' },
                { id: 'admin', label: 'Admin Portal' },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setCurrentTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer ${
                    currentTab === link.id
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
                <MessageCircle className="w-4 h-4" />
                <a href="https://wa.me/94784798095" target="_blank" rel="noreferrer">WhatsApp: +94 78 479 8095</a>
              </span>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
