import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelectCategory }) => {
  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">Fresh Harvest</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              Browse Seafood Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
              Explore Ceylon lagoon crabs, export-grade yellowfin tuna, ocean prawns, tender calamari, and imported delicacies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group relative h-36 sm:h-48 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 text-left cursor-pointer border border-slate-100"
            >
              {/* Background Image */}
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />

              {/* Gradient Shading */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent group-hover:from-slate-950/95 transition-all" />

              {/* Text overlay */}
              <div className="absolute inset-0 p-3.5 flex flex-col justify-end text-white">
                <span className="text-[10px] text-cyan-300 font-semibold tracking-wider uppercase">
                  {cat.product_count || 0} Products
                </span>
                <h3 className="text-sm font-bold leading-tight mt-0.5 group-hover:text-cyan-200 transition-colors">
                  {cat.name}
                </h3>
                <div className="flex items-center space-x-1 text-[11px] text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                  <span>Shop now</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
