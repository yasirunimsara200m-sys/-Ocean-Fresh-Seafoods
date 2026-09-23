import React from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, MessageCircle, Truck } from 'lucide-react';
import { useOutlet } from '../context/OutletContext';

interface OutletsPageProps {
  onSelectAndShop: () => void;
}

export const OutletsPage: React.FC<OutletsPageProps> = ({ onSelectAndShop }) => {
  const { selectedOutlet } = useOutlet();
  const outletName = selectedOutlet?.name || 'Kirulapone Flagship Store & Hub';
  const outletAddress = selectedOutlet?.address || 'No. 142, High Level Road, Kirulapone, Colombo 5';
  const outletPhone = selectedOutlet?.phone || '+94 78 479 8095';
  const outletHours = selectedOutlet?.opening_hours || '7:30 AM - 7:30 PM (Daily Fresh Catch & Delivery)';
  const cleanPhone = outletPhone.replace(/[^0-9]/g, '');

  const deliveryZones = [
    { name: 'Colombo 1 - Colombo 15', timing: 'Same-Day Delivery (Orders before 2 PM)', fee: 'Rs. 350 Flat' },
    { name: 'Kirulapone, Narahenpita, Havelock', timing: 'Express Within 2 Hours', fee: 'Rs. 250 Flat' },
    { name: 'Nugegoda, Kohuwala, Dehiwala', timing: 'Same-Day Morning & Evening Slots', fee: 'Rs. 350 Flat' },
    { name: 'Rajagiriya, Battaramulla, Kotte', timing: 'Daily Chilled Route Dispatch', fee: 'Rs. 350 Flat' },
    { name: 'Mount Lavinia, Ratmalana, Moratuwa', timing: 'Daily Scheduled Afternoon Route', fee: 'Rs. 400 Flat' },
    { name: 'Maharagama, Pannipitiya, Kottawa', timing: 'Daily Scheduled Dispatch', fee: 'Rs. 400 Flat' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            Retail & Central Fulfillment Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            {outletName} & Delivery Areas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            All our seafood is processed, portioned, and dispatched directly from our central Kirulapone facility to ensure unbroken sub-zero cold chain integrity.
          </p>
        </div>

        {/* Store Detail Card & Photo */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Store Image */}
          <div className="lg:col-span-6 relative min-h-[320px] bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"
              alt="Kirulapone Store"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Central Hub</span>
              <h2 className="text-2xl font-black">{outletName}</h2>
              <p className="text-xs text-slate-300">Retail Fishmonger & Daily Dispatch Warehouse</p>
            </div>
          </div>

          {/* Right: Store Information & Actions */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4 text-xs">
              <div className="flex items-center space-x-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full w-fit border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Open for Walk-in Shopping & Home Delivery</span>
              </div>

              <div className="space-y-3 pt-2 text-slate-600">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Store Location:</strong>
                    <span>{outletAddress}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Operating Hours:</strong>
                    <span>{outletHours}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Hotline & Inquiries:</strong>
                    <a href={`tel:${outletPhone}`} className="text-slate-800 font-semibold hover:underline">{outletPhone}</a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-700 block font-bold">WhatsApp Direct Orders:</strong>
                    <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold hover:underline">
                      Click to Chat ({outletPhone})
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onSelectAndShop}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Browse Fresh Catch Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a
                href="https://wa.me/94784798095?text=Hello%20CeylonCatch%2C%20I%20would%20like%20to%20inquire%20about%20today%27s%20fresh%20seafood%20availability."
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center justify-center space-x-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>

        {/* Delivery Zones Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Truck className="w-5 h-5 text-cyan-600" />
            <span>Colombo & Suburb Delivery Coverage Zones</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryZones.map((zone, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900">{zone.name}</h4>
                <p className="text-slate-500">{zone.timing}</p>
                <div className="text-[11px] font-semibold text-cyan-700 pt-1">
                  Chilled Delivery Fee: {zone.fee}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 flex items-center space-x-3 text-xs text-cyan-950">
            <ShieldCheck className="w-5 h-5 text-cyan-700 shrink-0" />
            <span>
              All deliveries are packed with dry cooling gel packs and vacuum pouches to guarantee kitchen freshness upon arrival. Payment collected via Cash on Delivery.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
