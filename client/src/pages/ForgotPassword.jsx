import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'রিসেট লিঙ্ক পাঠাতে সমস্যা হচ্ছে');
      setSuccess(data.message || 'যদি 이 ইমেলটি নিবন্ধিত থাকে, রিসেট লিঙ্ক পাঠানো হবে');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate('/login')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-2xl font-bold text-blue-900">পাসওয়ার্ড রিসেট</h2>
        </div>
        <p className="text-gray-600 mb-6">আপনার নিবন্ধিত ইমেল ঠিকানাটি দিন</p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইমেল ঠিকানা</label>
            <input
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 rounded transition`}
            disabled={loading}
          >
            {loading ? 'পাঠাচ্ছে...' : 'রিসেট লিঙ্ক পাঠান'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          মনে পড়েছে পাসওয়ার্ড? <a href="/login" className="text-blue-600 hover:underline">লগইন করুন</a>
        </p>
      </div>
    </div>
  );
}