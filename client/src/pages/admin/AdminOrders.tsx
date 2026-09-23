import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Order, Product } from '../../types';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  MapPin,
  Phone,
  Calendar,
  RefreshCw,
  Plus,
  Trash2,
  X,
  User,
  MessageCircle,
  Banknote
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Manual Order Modal State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState('');

  const [manualOrderData, setManualOrderData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: 'Walk-in / Direct Kirulapone Store',
    delivery_city: 'Kirulapone, Colombo 5',
    order_source: 'Phone / WhatsApp Direct',
    delivery_date: 'Standard Fast Dispatch',
    delivery_time_slot: 'Direct Cold-Chain',
    order_status: 'processing',
    payment_status: 'pending',
    payment_method: 'cod',
    special_notes: '',
    selectedItems: [] as { product_id: string; variant_id?: string; quantity: number }[],
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [orderRes, prodRes] = await Promise.all([
        api.getAdminOrders({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: search.trim() || undefined,
        }),
        api.getProducts(),
      ]);
      setOrders(orderRes.orders);
      setProducts(prodRes.products);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.updateOrderStatus(orderId, { order_status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Manual Order Item Helpers
  const addManualItem = () => {
    if (products.length === 0) return;
    setManualOrderData((prev) => ({
      ...prev,
      selectedItems: [
        ...prev.selectedItems,
        {
          product_id: products[0].id,
          variant_id: products[0].variants?.[0]?.id || undefined,
          quantity: 1,
        },
      ],
    }));
  };

  const removeManualItem = (index: number) => {
    setManualOrderData((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((_, idx) => idx !== index),
    }));
  };

  const updateManualItem = (index: number, field: string, val: any) => {
    setManualOrderData((prev) => {
      const copy = [...prev.selectedItems];
      if (field === 'product_id') {
        const p = products.find((x) => x.id === val);
        copy[index] = {
          product_id: val,
          variant_id: p?.variants?.[0]?.id || undefined,
          quantity: 1,
        };
      } else {
        copy[index] = { ...copy[index], [field]: val };
      }
      return { ...prev, selectedItems: copy };
    });
  };

  // Compute subtotal for manual order
  const manualSubtotal = manualOrderData.selectedItems.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.product_id);
    if (!prod) return sum;
    let price = prod.base_price;
    if (item.variant_id && prod.variants) {
      const v = prod.variants.find((x) => x.id === item.variant_id);
      if (v) price = v.price;
    }
    return sum + price * (item.quantity || 1);
  }, 0);

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualOrderData.customer_name || !manualOrderData.customer_phone) {
      setManualError('Please provide customer name and contact phone number.');
      return;
    }
    if (manualOrderData.selectedItems.length === 0) {
      setManualError('Please add at least one seafood item to the order.');
      return;
    }

    setManualSaving(true);
    setManualError('');

    try {
      const itemsPayload = manualOrderData.selectedItems.map((it) => {
        const prod = products.find((p) => p.id === it.product_id)!;
        const variant = prod.variants?.find((v) => v.id === it.variant_id);
        return {
          product_id: prod.id,
          name: prod.name,
          variant_name: variant?.name || prod.unit,
          price: variant ? variant.price : prod.base_price,
          quantity: it.quantity,
          image_url: prod.image_url,
          weight: variant?.weight || prod.unit,
        };
      });

      const payload = {
        customer_name: manualOrderData.customer_name,
        customer_phone: manualOrderData.customer_phone,
        customer_email: manualOrderData.customer_email,
        delivery_address: manualOrderData.delivery_address,
        delivery_city: manualOrderData.delivery_city,
        outlet_id: 'outlet-kirulapone',
        delivery_date: manualOrderData.delivery_date,
        delivery_time_slot: manualOrderData.delivery_time_slot,
        payment_method: manualOrderData.payment_method,
        payment_status: manualOrderData.payment_status,
        order_status: manualOrderData.order_status,
        special_notes: `[Channel: ${manualOrderData.order_source}] ${manualOrderData.special_notes}`.trim(),
        items: itemsPayload,
      };

      await api.createOrder(payload);
      setManualModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      setManualError(err.message || 'Failed to create manual order');
    } finally {
      setManualSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Customer Orders & Dispatch
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage incoming web orders, manual phone orders, and walk-in purchases at Kirulapone.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setManualModalOpen(true);
              if (manualOrderData.selectedItems.length === 0 && products.length > 0) {
                addManualItem();
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Manual / Phone Order</span>
          </button>

          <button
            onClick={fetchOrders}
            className="p-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search order ref, phone, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'processing', label: 'Processing' },
            { id: 'out_for_delivery', label: 'Out for Delivery' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="text-[10px] text-slate-500 uppercase tracking-wider bg-slate-900/90 border-b border-slate-800">
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Delivery Info</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status & Action</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {o.order_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{o.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{o.customer_phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300 truncate max-w-xs">{o.delivery_address}</div>
                      <div className="text-[10px] text-cyan-400 font-medium">{o.delivery_city}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{o.delivery_date}</div>
                      <div className="text-[10px] text-slate-400">{o.delivery_time_slot}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">Rs. {o.total_amount.toLocaleString()}</div>
                      <div className="text-[10px] uppercase text-emerald-400 font-semibold">{o.payment_method} ({o.payment_status})</div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.order_status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none ${
                          o.order_status === 'delivered'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : o.order_status === 'out_for_delivery'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : o.order_status === 'processing'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : o.order_status === 'cancelled'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-lg border border-slate-700 cursor-pointer"
                        title="View Full Order"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No orders matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Order Creation Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={() => setManualModalOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 z-10 space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400">Offline / External Channel Entry</span>
                <h3 className="text-xl font-black text-white">Create Manual Order</h3>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {manualError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
                {manualError}
              </div>
            )}

            <form onSubmit={handleCreateManualOrder} className="space-y-4">
              {/* Channel Source & Customer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Order Source *</label>
                  <select
                    value={manualOrderData.order_source}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, order_source: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="WhatsApp Direct Message">WhatsApp Direct</option>
                    <option value="Phone Call Hotline">Direct Phone Call</option>
                    <option value="Walk-in Kirulapone Store">Kirulapone Walk-in</option>
                    <option value="Social Media (FB/IG)">Facebook / Instagram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Customer full name"
                    value={manualOrderData.customer_name}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, customer_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+94 77 XXX XXXX"
                    value={manualOrderData.customer_phone}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, customer_phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Delivery Address</label>
                  <input
                    type="text"
                    placeholder="Address or store pickup"
                    value={manualOrderData.delivery_address}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, delivery_address: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City / Zone</label>
                  <input
                    type="text"
                    value={manualOrderData.delivery_city}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, delivery_city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Schedule and status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Delivery Date</label>
                  <select
                    value={manualOrderData.delivery_date}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, delivery_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Today">Today (Immediate)</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Day After Tomorrow">Day After Tomorrow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Status</label>
                  <select
                    value={manualOrderData.payment_status}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, payment_status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="pending">Pending (Cash on Delivery)</option>
                    <option value="paid">Paid (Cash / Bank deposit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Order Status</label>
                  <select
                    value={manualOrderData.order_status}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, order_status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="processing">Processing</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Items Picker */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Select Items & Cuts From Inventory:</span>
                  <button
                    type="button"
                    onClick={addManualItem}
                    className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg hover:bg-emerald-900 cursor-pointer"
                  >
                    + Add Product Line
                  </button>
                </div>

                <div className="space-y-2.5">
                  {manualOrderData.selectedItems.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.product_id);
                    return (
                      <div key={idx} className="flex flex-wrap items-center gap-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
                        {/* Product select */}
                        <select
                          value={item.product_id}
                          onChange={(e) => updateManualItem(idx, 'product_id', e.target.value)}
                          className="flex-1 min-w-48 bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-1.5"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.unit} - Rs. {p.base_price.toLocaleString()})
                            </option>
                          ))}
                        </select>

                        {/* Variant / cut select if any */}
                        {prod?.variants && prod.variants.length > 0 && (
                          <select
                            value={item.variant_id}
                            onChange={(e) => updateManualItem(idx, 'variant_id', e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-1.5"
                          >
                            {prod.variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name} - Rs. {v.price.toLocaleString()}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Qty */}
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-400">Qty:</span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateManualItem(idx, 'quantity', Number(e.target.value))}
                            className="w-16 bg-slate-800 border border-slate-700 text-white rounded-xl px-2 py-1 text-center font-bold"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeManualItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal preview */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Calculated Total:</span>
                  <span className="text-base font-black text-cyan-400">
                    Rs. {(manualSubtotal + (manualOrderData.delivery_address.includes('Walk-in') ? 0 : 350)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes / Special Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Paid cash at shop counter / WhatsApp requested extra ice..."
                  value={manualOrderData.special_notes}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, special_notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualSaving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  {manualSaving ? 'Logging Order...' : 'Save Order to Dispatch Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Customer Order Details</span>
                <h3 className="text-xl font-mono font-bold text-cyan-400">{selectedOrder.order_number}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">CURRENT DISPATCH STATUS</span>
                <span className="font-bold text-white uppercase tracking-wider">
                  {selectedOrder.order_status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Change:</span>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white font-semibold px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Destination */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-semibold">Customer Details</div>
                <div className="text-white font-bold">{selectedOrder.customer_name}</div>
                <div className="text-slate-400">{selectedOrder.customer_phone}</div>
                <div className="text-slate-400">{selectedOrder.customer_email || 'No email provided'}</div>
              </div>

              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-semibold">Dispatch & Hub</div>
                <div className="text-white font-bold">{selectedOrder.delivery_date || 'Fast Cold-Chain Dispatch'}</div>
                <div className="text-slate-400">{selectedOrder.delivery_time_slot || 'Direct Cold-Chain'}</div>
                <div className="text-cyan-400 font-medium">Hub: Kirulapone Flagship Store</div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-slate-400 font-semibold">Delivery Address</div>
              <div className="text-white">{selectedOrder.delivery_address}</div>
              <div className="text-cyan-400 font-medium">{selectedOrder.delivery_city}</div>
              {selectedOrder.special_notes && (
                <div className="pt-2 text-amber-300 font-medium border-t border-slate-700/60 mt-2">
                  Notes: "{selectedOrder.special_notes}"
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <div className="font-bold text-white text-xs uppercase tracking-wider">
                Packages to Pack ({selectedOrder.items.length})
              </div>
              <div className="space-y-2 divide-y divide-slate-800">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={it.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                      <div>
                        <div className="font-bold text-white">{it.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {it.variant_name || it.weight} • Qty: {it.quantity}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-white">
                      Rs. {(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                <span>Total Amount</span>
                <span className="text-cyan-400">Rs. {selectedOrder.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
