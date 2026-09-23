import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Filter, SlidersHorizontal, Search, ArrowUpDown, RefreshCw, X, Sparkles } from 'lucide-react';
import { useOutlet } from '../context/OutletContext';

interface ShopProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  onOpenProductModal: (product: Product) => void;
}

export const Shop: React.FC<ShopProps> = ({
  products,
  categories,
  initialCategory = 'all',
  onOpenProductModal,
}) => {
  const { selectedOutlet } = useOutlet();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category_slug !== selectedCategory && p.category_id !== selectedCategory) {
            return false;
          }
        }
        // Price filter
        if (p.base_price > priceRange) {
          return false;
        }
        // Stock filter
        if (inStockOnly && !p.in_stock) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.short_description.toLowerCase().includes(q);
          const matchCat = (p.category_name || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.base_price - b.base_price;
        if (sortBy === 'price-desc') return b.base_price - a.base_price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        // Default popularity
        if (a.is_best_seller && !b.is_best_seller) return -1;
        if (!a.is_best_seller && b.is_best_seller) return 1;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, priceRange, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange(10000);
    setInStockOnly(false);
    setSortBy('popularity');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200/60 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Ceylon Ocean Harvest</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Fresh Seafood Catalog
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Order boat-fresh fish, prawns, and crab delivered in chilled thermal packaging to your home in {selectedOutlet?.city || 'Colombo'}.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by name, fish type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Category Pills Slider */}
          <div className="flex items-center space-x-2 mt-6 overflow-x-auto pb-2 border-t border-slate-100 pt-5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Catch ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === c.slug
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-cyan-600 hover:text-cyan-700 font-semibold cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Price Filter Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Max Price</span>
                  <span className="text-cyan-700">Rs. {priceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={10000}
                  step={250}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Rs. 1,000</span>
                  <span>Rs. 10,000</span>
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer">
                  <span>In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded-sm focus:ring-cyan-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Outlet Info Box */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                <div className="font-bold text-slate-800">Fulfillment Hub</div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px]">
                  <p className="font-semibold text-slate-800">{selectedOutlet?.name}</p>
                  <p className="text-slate-500 mt-0.5">{selectedOutlet?.address}</p>
                  <p className="text-cyan-600 font-medium mt-1">{selectedOutlet?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Column */}
          <div className="flex-1">
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Showing <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> seafood items
              </div>

              <div className="flex items-center space-x-3">
                {/* Mobile Filter Trigger */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>

                {/* Sort dropdown */}
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400 hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value="popularity">Most Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenModal={onOpenProductModal}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No seafood matches your criteria</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try loosening your filters or searching for another variety like Seer fish, prawns, or mud crab.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-5 py-2.5 rounded-full cursor-pointer shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
