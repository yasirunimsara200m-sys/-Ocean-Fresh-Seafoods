import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminStats, Order } from '../../types';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    api.getAdminStats()
      .then((data) => setStats(data.stats))
      .catch((err) => console.error('Failed to load stats', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>Loading Admin Analytics...</span>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Revenue',
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      subtitle: 'Excluding cancelled orders',
      icon: DollarSign,
      color: 'from-emerald-600 to-teal-500',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      subtitle: `${stats.pendingOrders} awaiting dispatch`,
      icon: ShoppingBag,
      color: 'from-cyan-600 to-blue-600',
      textColor: 'text-cyan-400',
    },
    {
      label: 'Active Seafood Products',
      value: stats.totalProducts,
      subtitle: 'Across all categories',
      icon: Package,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-400',
    },
    {
      label: 'Inventory Alerts',
      value: stats.lowStockCount,
      subtitle: 'Out of stock / low stock items',
      icon: AlertTriangle,
      color: 'from-amber-600 to-orange-500',
      textColor: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Control Center</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Store Performance & Orders
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time seafood inventory management and customer dispatch updates.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStats}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigateTab('products')}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-900/20 transition-all cursor-pointer"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{kpi.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-white tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-slate-500 mt-1">{kpi.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Recent Orders & Outlet Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
              <p className="text-[11px] text-slate-400">Incoming dispatch requests from all outlets</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center space-x-1"
            >
              <span>Manage All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800/80">
                  <th className="py-2.5">Order Ref</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Outlet</th>
                  <th className="py-2.5">Delivery Slot</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-slate-900/50">
                      <td className="py-3 font-mono font-bold text-cyan-400">{ord.order_number}</td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-200">{ord.customer_name}</div>
                        <div className="text-[10px] text-slate-500">{ord.customer_phone}</div>
                      </td>
                      <td className="py-3 text-slate-400">{ord.outlet_name || 'Colombo'}</td>
                      <td className="py-3 text-slate-400">{ord.delivery_date}</td>
                      <td className="py-3 font-bold text-white">Rs. {ord.total_amount.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.order_status === 'delivered'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : ord.order_status === 'out_for_delivery'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {ord.order_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">No orders placed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Outlets & Messages quick glance (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Revenue by Outlet */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Revenue by Outlet Hub</span>
            </h3>

            <div className="space-y-3 pt-1">
              {stats.revenueByOutlet.map((out: any, i: number) => (
                <div key={i} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">{out.outlet_name || 'Central Outlet'}</div>
                    <div className="text-[10px] text-slate-500">{out.orders_count} orders fulfilled</div>
                  </div>
                  <span className="text-xs font-extrabold text-cyan-400">
                    Rs. {Number(out.revenue || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">Direct Management</h3>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => onNavigateTab('products')}
                className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <Package className="w-4 h-4 text-cyan-400 mb-1.5" />
                <span>Inventory & Cuts</span>
              </button>

              <button
                onClick={() => onNavigateTab('orders')}
                className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400 mb-1.5" />
                <span>Order Statuses</span>
              </button>

              <button
                onClick={() => onNavigateTab('categories')}
                className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400 mb-1.5" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => onNavigateTab('messages')}
                className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-purple-400 mb-1.5" />
                <span>Inquiries ({stats.unreadMessages})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
