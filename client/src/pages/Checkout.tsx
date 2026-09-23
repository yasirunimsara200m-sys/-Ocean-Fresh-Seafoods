import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOutlet } from '../context/OutletContext';
import { api } from '../services/api';
import { Order } from '../types';
import {
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  Banknote,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  MessageCircle,
  Sparkles,
  ExternalLink,
  Truck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutProps {
  onSuccess: (order: Order) => void;
  onExplore: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onSuccess, onExplore }) => {
  const { cart, subtotal, deliveryFee, total, clearCart } = useCart();
  const { selectedOutlet } = useOutlet();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    delivery_city: 'Kirulapone / Colombo 5',
    delivery_date: 'Standard Fast Dispatch',
    delivery_time_slot: 'Direct Cold-Chain',
    special_notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [error, setError] = useState('');

  // Helper to build WhatsApp Message Link
  const createWhatsAppUrl = (order: Order) => {
    const itemsListText = order.items
      .map((it) => `• ${it.name} (${it.variant_name || 'Standard'}) x ${it.quantity} = Rs. ${(it.price * it.quantity).toLocaleString()}`)
      .join('\n');

    const message = `*NEW SEAFOOD ORDER - ${order.order_number}*
---------------------------------------
*Customer:* ${order.customer_name}
*Phone:* ${order.customer_phone}
*Address:* ${order.delivery_address}, ${order.delivery_city}

*Delivery:* Fast Cold-Chain Dispatch (Kirulapone Hub)
*Payment:* Cash on Delivery (COD)

*Items Ordered:*
${itemsListText}

*Subtotal:* Rs. ${order.subtotal.toLocaleString()}
*Insulated Packing & Delivery:* Rs. ${order.delivery_fee.toLocaleString()}
*Grand Total Due:* Rs. ${order.total_amount.toLocaleString()}
${order.special_notes ? `\n*Instructions:* ${order.special_notes}` : ''}
---------------------------------------
_Dispatched directly from CeylonCatch Kirulapone Hub_`;

    return `https://wa.me/94784798095?text=${encodeURIComponent(message)}`;
  };

  const processOrder = async () => {
    if (!formData.customer_name || !formData.customer_phone || !formData.delivery_address) {
      setError('Please fill in your name, mobile phone number, and delivery address.');
      return;
    }

    setError('');
    setSubmitting(true);

    // Pre-open a tab synchronously on user click to avoid popup blocker on async fetch
    let waWindow: Window | null = null;
    try {
      waWindow = window.open('', '_blank');
      if (waWindow) {
        waWindow.opener = null;
      }
    } catch (e) {
      // Ignored
    }

    try {
      const orderPayload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        delivery_address: formData.delivery_address,
        delivery_city: formData.delivery_city,
        outlet_id: 'outlet-kirulapone',
        delivery_date: formData.delivery_date,
        delivery_time_slot: formData.delivery_time_slot,
        payment_method: 'cod',
        special_notes: formData.special_notes,
        items: cart.map((c) => ({
          product_id: c.product.id,
          name: c.product.name,
          variant_name: c.variant?.name || c.product.unit,
          price: c.price,
          quantity: c.quantity,
          image_url: c.product.image_url,
          weight: c.variant?.weight || c.product.unit,
        })),
      };

      // 1. ALWAYS save to Backend Database so Admin Dashboard receives the order!
      const result = await api.createOrder(orderPayload);
      clearCart();
      localStorage.setItem('ceyloncatch_last_order', result.order.order_number);

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      const waUrl = createWhatsAppUrl(result.order);
      setWhatsappLink(waUrl);
      setCompletedOrder(result.order);

      // 2. SIMULTANEOUSLY open WhatsApp with pre-filled message
      if (waWindow && !waWindow.closed) {
        waWindow.location.href = waUrl;
      } else {
        // Fallback for mobile or if initial popup was blocked
        window.open(waUrl, '_blank');
      }
    } catch (err: any) {
      if (waWindow && !waWindow.closed) {
        waWindow.close();
      }
      setError(err.message || 'Failed to submit order. Please verify your details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              Order Logged in Store System
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Thank You, {completedOrder.customer_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your seafood order has been successfully scheduled at our <strong className="text-slate-800">Kirulapone Store</strong> and is visible in our dispatch dashboard.
            </p>
          </div>

          {/* WhatsApp Direct Confirm Prompt */}
          {whatsappLink && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-xs text-emerald-950 text-center sm:text-left">
                <div className="font-extrabold text-emerald-900 flex items-center justify-center sm:justify-start space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Order Logged in Admin & WhatsApp Opened!</span>
                </div>
                <p className="text-emerald-700">
                  Your order is safely recorded in our Admin System and WhatsApp has been launched. If WhatsApp did not open automatically, tap below:
                </p>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
              >
                <span>Re-open WhatsApp Chat</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Order Details Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <span className="text-slate-400">Order Reference</span>
                <div className="text-base font-extrabold text-cyan-800 tracking-wider">
                  {completedOrder.order_number}
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Dispatch Mode</span>
                <div className="font-bold text-slate-900">
                  Fast Cold-Chain Dispatch
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400">Delivery Address</span>
                <p className="font-semibold text-slate-800 mt-0.5">{completedOrder.delivery_address}, {completedOrder.delivery_city}</p>
                <p className="text-slate-500">{completedOrder.customer_phone}</p>
              </div>
              <div>
                <span className="text-slate-400">Dispatch Hub</span>
                <p className="font-semibold text-slate-800 mt-0.5">Kirulapone Flagship Store</p>
                <p className="text-slate-500">Payment: <strong className="uppercase text-emerald-700">Cash on Delivery</strong></p>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-800 block mb-2">Ordered Seafood:</span>
              <div className="space-y-2">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-700">
                    <div>
                      <span className="font-semibold">{item.name}</span>
                      {item.variant_name && <span className="text-[10px] text-slate-500 ml-1.5">({item.variant_name})</span>}
                      <span className="text-slate-400 ml-2">x {item.quantity}</span>
                    </div>
                    <span className="font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
              <span>Total Payable upon Delivery (COD)</span>
              <span className="text-cyan-700">Rs. {completedOrder.total_amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onSuccess(completedOrder)}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-xs font-bold py-3 px-6 rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all cursor-pointer text-center shadow-md shadow-cyan-900/10"
            >
              Track Order Status Online →
            </button>
            <button
              onClick={onExplore}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No items in your cart to checkout</h2>
          <p className="text-xs text-slate-500">Add fresh fish, crab, or prawns before proceeding to checkout.</p>
          <button
            onClick={onExplore}
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer"
          >
            Explore Fresh Catch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cash on Delivery & WhatsApp Direct Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Checkout • Kirulapone Hub Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pay safely in cash when your fresh seafood arrives. You can also confirm the order via WhatsApp with one click.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Shipping & Slot Information (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Contact Info */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                <User className="w-4 h-4 text-cyan-600" />
                <span>1. Customer Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Silva"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mobile Phone (or WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+94 77 XXX XXXX"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <span>2. Delivery Address</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">House / Apartment & Street Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House number, street address, landmarks..."
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">City / Zone in Colombo *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kirulapone, Nugegoda, Colombo 3"
                      value={formData.delivery_city}
                      onChange={(e) => setFormData({ ...formData, delivery_city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dispatched From</label>
                    <div className="px-3.5 py-2.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200 flex items-center justify-between">
                      <span>Kirulapone Store (Colombo 5)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Central Hub</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Fast Delivery & Packaging Instructions */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                <Truck className="w-4 h-4 text-cyan-600" />
                <span>3. Fast Cold-Chain Delivery & Instructions</span>
              </div>

              {/* Notice explaining standard fresh dispatch */}
              <div className="bg-cyan-50/70 border border-cyan-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-950 font-bold text-xs">
                  <Clock className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Fresh Daily Dispatch from Kirulapone Hub</span>
                </div>
                <p className="text-[11px] text-cyan-900 leading-relaxed">
                  Your catch is packed fresh in sealed, food-grade thermal ice-boxes to maintain the cold chain. Orders placed before <strong>3:00 PM</strong> are dispatched same-day. Orders placed after 3:00 PM are dispatched first thing the following morning for peak freshness.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Special Packaging or Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Please call before arrival, deliver to security desk, pack crab with extra ice..."
                  value={formData.special_notes}
                  onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* 4. Payment Method Card (Cash on Delivery Highlighted) */}
            <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-3xl p-6 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>Payment: Cash on Delivery (COD)</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-extrabold uppercase">
                  Default Option
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Pay safely and comfortably in cash to our delivery rider only after verifying the freshness and sealed packaging of your seafood.
              </p>
            </div>
          </div>

          {/* Right: Summary & Order Buttons (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 sticky top-28 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Order Summary ({cart.length} items)</h3>
                <span className="text-xs font-bold text-cyan-700">Kirulapone Hub</span>
              </div>

              {/* Items scroll */}
              <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center space-x-3">
                    <img
                      src={item.product.image_url}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{item.product.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.variant ? item.variant.name : item.product.unit} • Qty: {item.quantity}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost calculation */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Chilled Insulated Packaging</span>
                  <span className="font-semibold text-slate-800">Rs. {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total Due on Arrival</span>
                  <span className="text-cyan-700">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Single Primary Order Action: Both DB + WhatsApp */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => processOrder()}
                  className="w-full py-4 px-5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-950/20 flex items-center justify-center space-x-2.5 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                  <span>
                    {submitting
                      ? 'Registering in Admin System...'
                      : `Confirm & Order via WhatsApp (COD) • Rs. ${total.toLocaleString()}`}
                  </span>
                </button>

                <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900 flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant Dual Sync:</strong> One click automatically saves your order directly into our <strong>Kirulapone Store Admin Panel</strong> and immediately opens <strong>WhatsApp</strong> with all your seafood order details pre-filled.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
