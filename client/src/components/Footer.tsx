import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles, Send, MessageCircle } from 'lucide-react';
import { useOutlet } from '../context/OutletContext';

interface FooterProps {
  onNavClick: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  const { selectedOutlet } = useOutlet();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const outletAddress = selectedOutlet?.address || 'No. 142, High Level Road, Kirulapone, Colombo 5';
  const outletPhone = selectedOutlet?.phone || '+94 78 479 8095';
  const outletHours = selectedOutlet?.opening_hours || '7:30 AM - 7:30 PM (Fresh Catch Arrival Daily)';
  const cleanPhone = outletPhone.replace(/[^0-9]/g, '');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-cyan-200" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-sans">
                CEYLON<span className="text-cyan-400">CATCH</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Sri Lanka's premier ocean-to-kitchen seafood delivery service. Operating from our central retail and packaging hub in Kirulapone, Colombo 5. Enjoy pure fresh day-boat fish, cleaned mud crabs, and jumbo prawns with convenient Cash on Delivery.
            </p>

            <div className="pt-2 space-y-2.5 text-xs">
              <div className="flex items-start space-x-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{outletAddress}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Direct Hotline: <strong className="text-white">{outletPhone}</strong></span>
              </div>
              <div className="flex items-center space-x-2.5 text-emerald-400">
                <MessageCircle className="w-4 h-4 fill-emerald-500 text-slate-950 shrink-0" />
                <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noreferrer" className="hover:underline">
                  WhatsApp Orders: <strong>{outletPhone}</strong>
                </a>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-400">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Open Daily: {outletHours}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavClick('home')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('shop')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Fresh Seafood Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('boat-to-plate')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Boat to Plate Story
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('outlets')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Store & Delivery Areas
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('about')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  About CeylonCatch
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('contact')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Contact & Inquiries
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('track')} className="hover:text-cyan-400 transition-colors cursor-pointer text-cyan-400 font-medium">
                  Track Order
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery Coverage */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Delivery Zones</h4>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-200">Dispatched from Kirulapone:</div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-400">
                <li>Colombo 1 - 15 Central</li>
                <li>Nugegoda, Kohuwala, Dehiwala</li>
                <li>Rajagiriya, Battaramulla, Kotte</li>
                <li>Mount Lavinia & Ratmalana</li>
                <li>Maharagama & Pannipitiya</li>
              </ul>
              <div className="text-[10px] text-emerald-400 pt-1 font-semibold">
                Same-day & scheduled morning/afternoon delivery
              </div>
            </div>
          </div>

          {/* Newsletter & Payment info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Fresh Catch Alerts</h4>
            <p className="text-xs text-slate-400">
              Receive updates on seasonal mud crab arrivals and weekly catches.
            </p>

            {subscribed ? (
              <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl">
                Thank you! You'll receive our fresh catch alerts.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Payment security */}
            <div className="pt-2">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Payment & Order Verification</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-300">
                <span className="bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded border border-emerald-800 font-semibold">
                  Cash on Delivery (COD)
                </span>
                <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                  Direct WhatsApp Order
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 CeylonCatch Seafood. All rights reserved. Kirulapone, Colombo.</p>
          <div className="flex items-center space-x-4">
            <span>High Level Road, Kirulapone</span>
            <span>|</span>
            <button onClick={() => onNavClick('admin')} className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer">
              Admin Portal Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
