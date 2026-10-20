import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Key, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড মেল খাচ্ছে না');
      return;
    }
    if (password.length < 6) {
      setError('পাসওয়ার্ড অন্তত ৬ ক্যারেক্টারের হতে হবে');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হচ্ছে');
      setSuccess('পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে');
      setTimeout(() => navigate('/login'), 2000);
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
          <h2 className="text-2xl font-bold text-blue-900">নবায়ন পাসওয়ার্ড</h2>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{success}</div>}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">নবায়ন পাসওয়ার্ড</label>
              <input
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
              <input
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              className={`w-full ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-3 rounded transition`}
              disabled={loading}
            >
              {loading ? 'রিসেট হচ্ছে...' : 'পাসওয়ার্ড রিসেট করুন'}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-gray-600">
          লগইন করতে চান? <a href="/login" className="text-blue-600 hover:underline">লগইন করুন</a>
        </p>
      </div>
    </div>
  );
}