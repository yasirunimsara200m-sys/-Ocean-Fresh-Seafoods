import React from 'react';
import { Anchor, ShieldCheck, ThermometerSnowflake, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

interface BoatToPlateProps {
  onShopClick: () => void;
}

export const BoatToPlateSection: React.FC<BoatToPlateProps> = ({ onShopClick }) => {
  const steps = [
    {
      step: '01',
      title: 'Direct From Fishermen',
      description: 'Day-boat fishermen dock in Negombo, Mirissa, and Trincomalee. We buy directly at dock, cutting out brokers and multi-tier markets.',
      icon: Anchor,
      color: 'from-blue-600 to-cyan-500',
    },
    {
      step: '02',
      title: 'EU-Grade Cold Chain',
      description: 'The catch is transferred immediately to sub-zero iced water containers to arrest microbial decay and lock in oceanic flavor.',
      icon: ThermometerSnowflake,
      color: 'from-cyan-500 to-teal-500',
    },
    {
      step: '03',
      title: 'Hygienic Prep & Precision Cut',
      description: 'In our certified temperature-controlled rooms, fish and shellfish are scaled, gutted, sliced into steaks, and vacuum packaged.',
      icon: ShieldCheck,
      color: 'from-teal-500 to-emerald-500',
    },
    {
      step: '04',
      title: 'Insulated Doorstep Delivery',
      description: 'Dispatched in insulated thermal tote bags with certified food-grade gel ice packs, arriving kitchen-fresh at your home.',
      icon: Truck,
      color: 'from-emerald-500 to-indigo-600',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden">
      {/* Subtle Background pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-3 py-1 rounded-full">
            <span>Our Sourcing Philosophy</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-3">
            BOAT TO PLATE • ZERO MIDDLEMEN
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            By eliminating traditional fish markets, our fishermen receive fair wages while you enjoy restaurant and export-grade seafood at competitive Sri Lankan prices.
          </p>
        </div>

        {/* 4 Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={index}
                className="relative bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/60 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md shadow-cyan-950/30 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-700 group-hover:text-cyan-400 transition-colors">
                      {s.step}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-700/50 flex items-center text-[11px] font-semibold text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Certified Fresh Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA banner inside section */}
        <div className="mt-12 bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-indigo-900/40 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Experience True Oceanic Freshness Today</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">Order before 2:00 PM for same-day delivery in Colombo or next-day scheduled dispatch.</p>
          </div>
          <button
            onClick={onShopClick}
            className="shrink-0 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center space-x-2"
          >
            <span>Order Fresh Seafood</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
