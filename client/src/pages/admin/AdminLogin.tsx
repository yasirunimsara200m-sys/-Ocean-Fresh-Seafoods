import React, { useState } from 'react';
import { api } from '../../services/api';
import { Lock, User, Sparkles, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (admin: any) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.adminLogin(username.trim(), password);
      localStorage.setItem('tsg_admin_token', data.token);
      localStorage.setItem('tsg_admin_user', JSON.stringify(data.admin));
      onLoginSuccess(data.admin);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white mx-auto shadow-xl shadow-cyan-900/30">
            <Sparkles className="w-7 h-7 text-cyan-200" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Ocean Fresh Seafoods Admin Portal
          </h2>
          <p className="text-xs text-slate-400">
            Log in to manage seafood inventory, customer orders, and outlet fulfillment.
          </p>
        </div>

        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Password with show/hide toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-900/20 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-1">
            <button
              onClick={onBackToStore}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Back to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
