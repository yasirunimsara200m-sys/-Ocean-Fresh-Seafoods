import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Anchor, Award, MessageCircle } from 'lucide-react';

interface HeroSliderProps {
  onShopClick: () => void;
  onOutletsClick: () => void;
}

const slides = [
  {
    id: 1,
    tag: 'Kirulapone Store • Fast Colombo Delivery',
    title: 'OCEAN FRESH SEAFOODS',
    subtitle: 'PREMIUM SEAFOOD AT YOUR DOORSTEP',
    description: 'Directly sourced from sustainable ocean day-boats and lagoon fishermen. Cleaned, portioned, and delivered fresh in chilled thermal packaging.',
    badge: 'Cash on Delivery Across Colombo',
    bgImage: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=1920&q=85',
    ctaPrimary: 'Order Fresh Catch',
    ctaSecondary: 'Visit Kirulapone Store',
  },
  {
    id: 2,
    tag: 'Direct Sourcing • Zero Middlemen',
    title: 'BOAT TO PLATE',
    subtitle: '100% PURE SEAFOOD FRESHNESS',
    description: 'We purchase directly at Sri Lankan coastal docks so local fishermen earn fair compensation while you receive ocean-fresh catch at honest pricing.',
    badge: 'HACCP & Export Grade Standards',
    bgImage: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1920&q=85',
    ctaPrimary: 'Explore Seafood Cuts',
    ctaSecondary: 'Our Direct Sourcing',
  },
  {
    id: 3,
    tag: 'Lagoon Mud Crab & Tiger Prawns',
    title: 'ORDER VIA WEB',
    subtitle: 'OR INSTANT WHATSAPP DIRECT',
    description: 'Convenient Cash on Delivery with optional 1-click WhatsApp order confirmation. From sashimi tuna to cleaned mud crabs and peeled prawns.',
    badge: 'Convenient Cash on Delivery',
    bgImage: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1920&q=85',
    ctaPrimary: 'Order Best Sellers',
    ctaSecondary: 'Contact via WhatsApp',
  },
];

export const HeroSlider: React.FC<HeroSliderProps> = ({ onShopClick, onOutletsClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full h-[420px] sm:h-[540px] lg:h-[620px] overflow-hidden bg-slate-950 text-white">
      {/* Background Slides with Crossfade */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={s.bgImage}
            alt={s.title}
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Oceanic Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-2xl space-y-3 sm:space-y-5">
          {/* Top Tag & Store Indicator */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 bg-cyan-500/20 backdrop-blur-md text-cyan-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full border border-cyan-400/30">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
              <span>{slide.tag}</span>
            </span>
            <span className="inline-flex items-center space-x-1 bg-slate-800/80 backdrop-blur-md text-slate-300 text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Kirulapone, Colombo 5</span>
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none font-sans">
              {slide.title}
            </h1>
            <h2 className="text-base sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-200 leading-tight">
              {slide.subtitle}
            </h2>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal line-clamp-3 sm:line-clamp-none">
            {slide.description}
          </p>

          {/* Buttons */}
          <div className="pt-1 sm:pt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onShopClick}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full shadow-lg shadow-cyan-900/30 flex items-center space-x-2 transition-all cursor-pointer active:scale-95"
            >
              <span>{slide.ctaPrimary}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={onOutletsClick}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full border border-white/20 transition-all cursor-pointer"
            >
              {slide.ctaSecondary}
            </button>
          </div>

          {/* Features bullet badges — hidden on very small screens */}
          <div className="hidden sm:flex pt-4 flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cash on Delivery</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Anchor className="w-4 h-4 text-cyan-400" />
              <span>Direct Day-Boat Catch</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Direct Help</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700 text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700 text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              idx === currentSlide ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-600 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
