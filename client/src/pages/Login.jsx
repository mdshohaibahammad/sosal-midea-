import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Film, ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setForm({ email: 'admin@example.com', password: 'password123' });
    toast.success('Admin credentials filled!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl z-10">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="p-8 md:p-10 bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-purple-950/40 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Film size={22} />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">PostPulse</span>
                <span className="text-xs block text-slate-400 font-medium">Auto Poster Studio</span>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white leading-tight mb-4">
              Automate multi-platform video publishing with zero friction.
            </h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Upload video once and broadcast instantly to Facebook, Instagram Reels, TikTok, and YouTube Shorts.
            </p>

            <div className="space-y-3">
              {[
                'MySQL Database + Scheduled Queues',
                'Simultaneous Multi-Platform Posting',
                'Custom Aspect Ratios & Hashtags',
                'Built-in Background Scheduler Engine',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Sparkles size={14} /> Quick Demo: Fill Admin Login
            </button>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">Sign In to Dashboard</h3>
            <p className="text-xs text-slate-400 mt-1">Enter your registered email and password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}