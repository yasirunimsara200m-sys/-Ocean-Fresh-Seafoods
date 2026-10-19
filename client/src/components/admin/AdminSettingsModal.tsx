import React, { useState } from 'react';
import { api } from '../../services/api';
import { Shield, Lock, User, Key, Check, AlertCircle, X, Eye, EyeOff } from 'lucide-react';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: any;
  onProfileUpdated: (updatedAdmin: any) => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  onProfileUpdated,
}) => {
  const [username, setUsername] = useState(adminUser?.username || '');
  const [name, setName] = useState(adminUser?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError('Please enter your current password to authorize changes.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.updateAdminProfile({
        current_password: currentPassword,
        new_username: username,
        new_name: name,
        new_password: newPassword || undefined,
      });

      localStorage.setItem('tsg_admin_token', res.token);
      localStorage.setItem('tsg_admin_user', JSON.stringify(res.admin));
      onProfileUpdated(res.admin);
      setSuccess('Account credentials updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Admin Security Settings</h2>
            <p className="text-xs text-slate-400">Change Admin Username & Password</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl flex items-start space-x-2.5 text-xs text-emerald-300">
            <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Store Administrator"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-cyan-300 mb-1.5">
              Current Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password (default: admin123)"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              New Password (Leave blank if keeping current)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {newPassword && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-900/40 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
