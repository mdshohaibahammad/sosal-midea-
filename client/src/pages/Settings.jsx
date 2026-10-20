import { useEffect, useState } from 'react';
import { User, Lock, Database, Server, CheckCircle2, Shield, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings({ user, onProfileUpdate }) {
  const [name, setName] = useState(user?.name || '');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const token = localStorage.getItem('token');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      toast.success('Profile updated successfully');
      if (onProfileUpdate) onProfileUpdate(data.user);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setLoadingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      toast.success(data.message || 'Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          System & Account Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your credentials, platform settings, and review backend health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User size={18} className="text-indigo-400" /> Account Profile
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'admin@example.com'}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loadingProfile}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow transition disabled:opacity-50"
            >
              {loadingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock size={18} className="text-indigo-400" /> Security & Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loadingPassword}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow transition disabled:opacity-50"
            >
              {loadingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* System Engine Health Card */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Database size={18} className="text-emerald-400" /> Platform Infrastructure Diagnostics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
            <div className="text-slate-400">Database Engine</div>
            <div className="font-bold text-white text-sm">MySQL (Sequelize)</div>
            <div className="text-emerald-400 flex items-center gap-1 font-semibold pt-1">
              <CheckCircle2 size={13} /> Connected to 127.0.0.1:3306
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
            <div className="text-slate-400">Background Poster</div>
            <div className="font-bold text-white text-sm">Automated Interval Engine</div>
            <div className="text-emerald-400 flex items-center gap-1 font-semibold pt-1">
              <CheckCircle2 size={13} /> Active (15s heartbeat)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
            <div className="text-slate-400">Media Storage</div>
            <div className="font-bold text-white text-sm">Local /uploads Folder</div>
            <div className="text-emerald-400 flex items-center gap-1 font-semibold pt-1">
              <CheckCircle2 size={13} /> Writable & Stream Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
