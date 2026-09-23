import React from 'react';
import { ShoppingBag, Eye, Star, Flame, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenModal }) => {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.variants && product.variants.length > 0) {
      onOpenModal(product);
    } else {
      addToCart(product, null, 1);
    }
  };

  const discountPercent = product.original_price && product.original_price > product.base_price
    ? Math.round(((product.original_price - product.base_price) / product.original_price) * 100)
    : 0;

  return (
    <div
      onClick={() => onOpenModal(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-cyan-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.freshness_badge && (
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-400/30 shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              <span>{product.freshness_badge}</span>
            </span>
          )}

          {product.is_best_seller && (
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
              <Flame className="w-2.5 h-2.5 fill-slate-950" />
              <span>Popular</span>
            </span>
          )}
        </div>

        {discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[10px] font-extrabold bg-rose-500 text-white px-2 py-1 rounded-full shadow-xs">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Stock Status Badge if Out of Stock */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="text-xs font-black tracking-wider uppercase bg-white text-slate-900 px-3 py-1.5 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 hidden sm:flex items-center justify-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(product);
            }}
            className="flex-1 bg-white/95 backdrop-blur-md hover:bg-white text-slate-900 font-semibold text-xs py-2 px-3 rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer hover:scale-102"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="uppercase font-semibold tracking-wider text-cyan-700">
              {product.category_name || 'Seafood'}
            </span>
            <span className="text-slate-400">{product.unit}</span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium leading-none">Starting from</div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-base font-black text-slate-900">
                Rs. {product.base_price.toLocaleString()}
              </span>
              {product.original_price && product.original_price > product.base_price && (
                <span className="text-xs text-slate-400 line-through">
                  Rs. {product.original_price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            disabled={!product.in_stock}
            onClick={handleQuickAdd}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              product.in_stock
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/10 hover:shadow-cyan-900/20 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title={product.variants && product.variants.length > 0 ? 'Select Cut & Weight' : 'Add to Cart'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
