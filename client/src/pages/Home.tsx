import React from 'react';
import { HeroSlider } from '../components/HeroSlider';
import { CategoryGrid } from '../components/CategoryGrid';
import { BoatToPlateSection } from '../components/BoatToPlateSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { ProductCard } from '../components/ProductCard';
import { Product, Category, Review } from '../types';
import { Flame, ArrowRight, ShieldCheck, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { useOutlet } from '../context/OutletContext';

interface HomeProps {
  products: Product[];
  categories: Category[];
  reviews: Review[];
  onOpenProductModal: (product: Product) => void;
  onNavigate: (tab: string, categorySlug?: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  products,
  categories,
  reviews,
  onOpenProductModal,
  onNavigate,
}) => {
  const { selectedOutlet } = useOutlet();

  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 8);
  const featuredCatch = products.filter((p) => p.is_featured).slice(0, 4);

  return (
    <div className="space-y-0">
      {/* Hero Banner Carousel */}
      <HeroSlider
        onShopClick={() => onNavigate('shop')}
        onOutletsClick={() => onNavigate('outlets')}
      />

      {/* Store Location & Ordering Indicator Strip */}
      <div className="bg-slate-900 border-y border-slate-800 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>
              Direct Daily Seafood Dispatch from <strong className="text-white">Kirulapone Flagship Store</strong> across Colombo
            </span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-emerald-400 font-semibold hidden md:inline">Cash on Delivery & WhatsApp Orders Available</span>
          </div>

          <button
            onClick={() => onNavigate('outlets')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Store Address & Delivery Areas →</span>
          </button>
        </div>
      </div>

      {/* Category Grid Section */}
      <CategoryGrid
        categories={categories}
        onSelectCategory={(slug) => onNavigate('shop', slug)}
      />

      {/* Best Sellers Section */}
      <section className="py-14 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Customer Favorites</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Best Selling Seafood
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Our most sought-after prime cuts, peeled prawns, and Ceylon lagoon mud crabs.
              </p>
            </div>

            <button
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800 cursor-pointer group"
            >
              <span>View all catch ({products.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenModal={onOpenProductModal}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Boat to Plate Transparency Section */}
      <BoatToPlateSection onShopClick={() => onNavigate('shop')} />

      {/* Featured Weekly Catch Highlights */}
      <section className="py-14 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 mb-1">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span>Curated Selection</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Chef's Recommended Cuts
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Air-flown Norwegian salmon, sashimi tuna loins, and artisanal prawn bites.
              </p>
            </div>

            <button
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800 cursor-pointer"
            >
              <span>Explore All Products →</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredCatch.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenModal={onOpenProductModal}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <TestimonialsSection reviews={reviews} />
    </div>
  );
};
