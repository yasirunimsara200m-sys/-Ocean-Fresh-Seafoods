import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { Search, PackageCheck, Clock, Truck, CheckCircle2, AlertCircle, Phone, MapPin, Calendar, Sparkles } from 'lucide-react';

interface TrackOrderProps {
  initialOrderNumber?: string;
  onExplore: () => void;
}

export const TrackOrder: React.FC<TrackOrderProps> = ({ initialOrderNumber = '', onExplore }) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = async (numToSearch?: string) => {
    const term = (numToSearch || orderNumber).trim();
    if (!term) return;

    setLoading(true);
    setError('');
    try {
      const data = await api.trackOrder(term);
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'No order found with this tracking number');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'processing':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  const steps = [
    { number: 1, label: 'Order Received', desc: 'Logged & queued for prep' },
    { number: 2, label: 'Fresh Preparation', desc: 'Portioned & cold-chain packed' },
    { number: 3, label: 'Out for Delivery', desc: 'Dispatched in insulated ice-box' },
    { number: 4, label: 'Delivered', desc: 'Safely arrived at your door' },
  ];

  const currentStep = order ? getStatusStep(order.order_status) : 1;

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">Live Order Dispatch</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Track Your Seafood Delivery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your order reference (e.g. <span className="font-mono font-bold text-slate-700">CC-92841</span>) to see real-time preparation and dispatch status.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200/80 mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Enter Ocean Fresh Order Number (e.g. OFS-92841 / CC-92841)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold uppercase text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-8 py-3 rounded-2xl transition-all cursor-pointer shadow-md shadow-cyan-900/10"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {/* If user placed a recent order, show option to view it */}
          {(localStorage.getItem('oceanfresh_last_order') || localStorage.getItem('ceyloncatch_last_order')) && (
            <div className="flex items-center space-x-2 mt-3 text-[11px] text-slate-500">
              <span>Your recent order:</span>
              <button
                onClick={() => {
                  const last = localStorage.getItem('oceanfresh_last_order') || localStorage.getItem('ceyloncatch_last_order') || '';
                  setOrderNumber(last);
                  handleSearch(last);
                }}
                className="text-cyan-600 hover:underline font-mono font-bold cursor-pointer bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200"
              >
                {localStorage.getItem('oceanfresh_last_order') || localStorage.getItem('ceyloncatch_last_order')}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center space-x-2 mb-8">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details Display */}
        {order && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
            {/* Top status tag */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Tracking Reference</span>
                <h2 className="text-xl font-extrabold text-cyan-800 tracking-wider font-mono">
                  {order.order_number}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  order.order_status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : order.order_status === 'out_for_delivery'
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200 animate-pulse'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {order.order_status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                {steps.map((s) => {
                  const isPassed = currentStep >= s.number;
                  const isCurrent = currentStep === s.number;
                  return (
                    <div key={s.number} className="flex flex-col items-center text-center space-y-2 relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-cyan-600 text-white ring-4 ring-cyan-100 shadow-md'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isPassed ? <CheckCircle2 className="w-5 h-5" /> : s.number}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isCurrent ? 'text-cyan-700' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                          {s.label}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 max-w-[120px] mx-auto">
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="font-semibold text-slate-700">Delivery Destination</span>
                </div>
                <div className="font-bold text-slate-900">{order.customer_name}</div>
                <div className="text-slate-600">{order.delivery_address}</div>
                <div className="text-slate-500">{order.delivery_city} • {order.customer_phone}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <Truck className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="font-semibold text-slate-700">Dispatch & Hub</span>
                </div>
                <div className="font-bold text-slate-900">Direct Cold-Chain Dispatch</div>
                <div className="text-slate-600">Insulated Ice-Box Delivery</div>
                <div className="text-cyan-700 font-medium">Hub: {order.outlet_name || 'Kirulapone Central Hub'}</div>
              </div>
            </div>

            {/* Items summary */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Packages Included ({order.items.length})
              </h4>
              <div className="space-y-2 divide-y divide-slate-100">
                {order.items.map((it, i) => (
                  <div key={i} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img src={it.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <div className="font-semibold text-slate-900">{it.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {it.variant_name || it.weight} • Qty: {it.quantity}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-slate-800">
                      Rs. {(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Grand Total (incl. delivery)</span>
                <span className="text-cyan-700">Rs. {order.total_amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Dispatch Hotline Banner */}
            <div className="bg-cyan-50/80 p-4 rounded-2xl border border-cyan-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-cyan-950">
                <Phone className="w-4 h-4 text-cyan-700 shrink-0" />
                <span>Need urgent assistance with this delivery? Reach our Kirulapone dispatch hotline.</span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href="tel:+94784798095"
                  className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold px-4 py-2 rounded-xl shrink-0 cursor-pointer transition-colors"
                >
                  +94 78 479 8095
                </a>
                <a
                  href="https://wa.me/94784798095"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl shrink-0 cursor-pointer transition-colors"
                  title="Chat on WhatsApp"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
