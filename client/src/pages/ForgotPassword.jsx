import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Film } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [tokenHint, setTokenHint] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTokenHint('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset email');

      toast.success(data.message || 'Reset link issued');
      if (data.resetToken) {
        setTokenHint(data.resetToken);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Reset Password</h2>
            <p className="text-xs text-slate-400">Enter your account email</p>
          </div>
        </div>

        {tokenHint && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-2">
            <span className="font-semibold text-indigo-300">Local Development Token:</span>
            <div className="p-2 bg-slate-950 rounded font-mono text-[11px] text-slate-300 break-all select-all">
              {tokenHint}
            </div>
            <Link
              to={`/reset-password/${tokenHint}`}
              className="inline-flex items-center gap-1 text-indigo-400 hover:underline font-semibold"
            >
              Click here to proceed to Reset Screen <ArrowRight size={12} />
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow transition disabled:opacity-50"
          >
            {loading ? 'Sending Request...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Remembered your password?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}