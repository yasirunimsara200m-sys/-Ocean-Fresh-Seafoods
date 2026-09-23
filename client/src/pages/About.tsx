import React from 'react';
import { ShieldCheck, Award, Anchor, Sparkles, ArrowRight, Eye, Target, Heart, Leaf, Users, Star } from 'lucide-react';

interface AboutProps {
  onShopClick: () => void;
}

export const About: React.FC<AboutProps> = ({ onShopClick }) => {
  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Hero Section */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Premium Seafood • Kirulapone, Colombo 5</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Sri Lanka's Freshest <span className="text-cyan-400">Ocean-to-Door</span> Seafood Experience
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              CeylonCatch was built on a simple belief: every Sri Lankan family deserves the same export-grade, boat-fresh seafood that once only reached overseas tables. From our Kirulapone Hub, we deliver the ocean's finest — cleaned, portioned, and cold-packed — straight to your kitchen door.
            </p>
            <div className="pt-2">
              <button
                onClick={onShopClick}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-full transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>Explore Our Fresh Catch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Background Art */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* ─── Vision & Mission ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vision */}
          <div className="relative bg-gradient-to-br from-cyan-900 via-slate-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white overflow-hidden shadow-xl border border-cyan-800/30">
            {/* decorative glow */}
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Eye className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Our Vision</span>
              <h2 className="text-2xl sm:text-3xl font-black leading-snug">
                To be Sri Lanka's most trusted gateway to the freshest ocean catch.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                We envision a Sri Lanka where every household — from a tiny apartment in Colombo 3 to a villa in Mount Lavinia — can access ocean-fresh, export-grade seafood as easily as ordering from a neighbourhood kade. CeylonCatch exists to make that future the everyday reality.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="relative bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white overflow-hidden shadow-xl border border-emerald-800/30">
            {/* decorative glow */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Our Mission</span>
              <h2 className="text-2xl sm:text-3xl font-black leading-snug">
                Boat to your plate — zero shortcuts, zero compromise.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Our mission is to source directly from Sri Lanka's coastal fishermen, process every catch in cold-chain certified conditions, and deliver to your door with full transparency. We eliminate every unnecessary middleman so that both the fisherman earns fairly and you receive only the freshest.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Core Values ─── */}
        <div>
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
              What We Stand For
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-3 group hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Anchor className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Direct from the Dock</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We work directly with generational artisanal fishermen across Sri Lanka's coastal belts — cutting out middlemen and ensuring you receive catch that is as fresh as it can possibly be.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-3 group hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Uncompromised Safety Standards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every batch is cleaned, portioned, and packed in our cold-chain certified processing unit following EU HACCP food-safety standards — the same benchmarks applied to export-grade seafood.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-3 group hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Export Quality, Local Price</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                For decades Sri Lanka's finest seafood only reached overseas tables. CeylonCatch pioneered bringing that exact same five-star export quality straight to local kitchen counters — without the export price tag.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-3 group hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Community & Fisherman Welfare</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fair pricing to fishermen is non-negotiable. We believe a thriving coastal community is the backbone of sustainable seafood, and every order you place directly supports those fishing families.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-3 group hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Sustainable Ocean Stewardship</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We actively avoid over-fished species, promote seasonal catch rotation, and work with fishermen who use responsible, low-impact fishing methods to protect Sri Lanka's ocean ecosystems for future generations.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-3 group hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Complete Transparency</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                From the fishing vessel to your plate, we document and share every step. You'll always know where your catch was landed, how it was processed, and when it was dispatched from our Kirulapone Hub.
              </p>
            </div>

          </div>
        </div>

        {/* ─── Why Choose CeylonCatch ─── */}
        <div className="bg-gradient-to-r from-cyan-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white space-y-8 shadow-xl">
          <div className="max-w-xl space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Why CeylonCatch?</span>
            <h2 className="text-2xl sm:text-3xl font-black leading-snug">
              The difference is in every detail.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              CeylonCatch is not another middleman seafood app. We own the entire cold chain — from dock to your door — and that control is what guarantees the freshness and quality we promise on every single order.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { stat: '100%', label: 'Direct Dock Sourcing', sub: 'Zero middlemen, maximum freshness' },
              { stat: '< 6h', label: 'Catch to Cold Storage', sub: 'Ice-box sealed within hours of landing' },
              { stat: 'COD', label: 'Cash on Delivery', sub: 'Pay only when your fresh order arrives' },
            ].map((item) => (
              <div key={item.stat} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
                <div className="text-3xl font-black text-cyan-400">{item.stat}</div>
                <div className="text-sm font-bold text-white">{item.label}</div>
                <div className="text-[11px] text-slate-400">{item.sub}</div>
              </div>
            ))}
          </div>
          <div>
            <button
              onClick={onShopClick}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs px-8 py-3.5 rounded-full transition-all cursor-pointer inline-flex items-center space-x-2 shadow-lg shadow-cyan-900/30"
            >
              <span>Shop the Fresh Catch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
