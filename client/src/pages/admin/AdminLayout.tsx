import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  MessageSquare,
  LogOut,
  ExternalLink,
  Sparkles,
  MapPin,
  Menu,
  X
} from 'lucide-react';
import { ScrollToTop } from '../../components/ScrollToTop';

interface AdminLayoutProps {
  currentAdminTab: string;
  setCurrentAdminTab: (tab: string) => void;
  adminUser: any;
  onLogout: () => void;
  onViewStore: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentAdminTab,
  setCurrentAdminTab,
  adminUser,
  onLogout,
  onViewStore,
  children,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Cuts', icon: Package },
    { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'messages', label: 'Customer Inquiries', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">Ocean Fresh Admin</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0 ${
        mobileNavOpen ? 'block' : 'hidden md:flex'
      }`}>
        <div className="space-y-6">
          {/* Logo & Info */}
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white font-sans">
                OCEAN <span className="text-cyan-400">FRESH</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Ocean Fresh Seafoods (Pvt) Ltd.</p>
            </div>
          </div>

          {/* Nav items list */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentAdminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentAdminTab(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile & actions */}
        <div className="space-y-3 pt-6 border-t border-slate-800/80">
          <button
            onClick={onViewStore}
            className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-semibold rounded-xl border border-slate-700/60 transition-all cursor-pointer"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center justify-between px-2 pt-2 text-xs">
            <div>
              <div className="font-bold text-slate-200">{adminUser?.name || 'Administrator'}</div>
              <div className="text-[10px] text-slate-500 capitalize">{adminUser?.role || 'Super Admin'}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 bg-slate-900 overflow-y-auto min-h-screen p-4 sm:p-8">
        {children}
      </main>

      <ScrollToTop />
    </div>
  );
};
