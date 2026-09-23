import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Truck, Plus, Minus, ShoppingBag, Sparkles, Award } from 'lucide-react';
import { Product, Variant } from '../types';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      setActiveImage(product.image_url);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const totalPrice = currentPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    onClose();
  };

  const imagesList = [product.image_url, ...(product.gallery || [])].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto z-10 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-slate-100 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 md:bg-slate-100 backdrop-blur-md text-slate-700 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images Gallery */}
        <div className="md:w-1/2 p-4 sm:p-6 bg-slate-50 flex flex-col justify-between">
          <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-xs">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.freshness_badge && (
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-cyan-300 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 border border-cyan-400/30 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{product.freshness_badge}</span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {imagesList.length > 1 && (
            <div className="flex items-center space-x-2.5 mt-4 overflow-x-auto pb-1">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    activeImage === img ? 'border-cyan-600 ring-2 ring-cyan-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-200/70 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Export Grade</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Chilled Ice Packaging</span>
            </div>
          </div>
        </div>


        {/* Right Side: Configuration & Order Form */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-700">
              {product.category_name || 'Premium Catch'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-tight">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline space-x-3 mt-3">
              <span className="text-2xl font-black text-cyan-800">
                Rs. {currentPrice.toLocaleString()}
              </span>
              {product.original_price && product.original_price > currentPrice && (
                <span className="text-sm text-slate-400 line-through">
                  Rs. {product.original_price.toLocaleString()}
                </span>
              )}
              <span className="text-xs font-medium text-slate-500">
                / {selectedVariant ? selectedVariant.weight || selectedVariant.name : product.unit}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">
              {product.description || product.short_description}
            </p>

            {/* Variant / Cut Options */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  Select Cut & Portion Size:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 ring-2 ring-cyan-500/20 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{v.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                        </div>
                        <div className="mt-1 text-xs text-cyan-800 font-extrabold">
                          Rs. {v.price.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quantity & CTA */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-slate-900 min-w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                disabled={!product.in_stock}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2.5 transition-all cursor-pointer shadow-lg ${
                  product.in_stock
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white shadow-cyan-900/20 hover:scale-101 active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {product.in_stock
                    ? `Add to Cart • Rs. ${totalPrice.toLocaleString()}`
                    : 'Currently Out of Stock'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
