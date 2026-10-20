import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Sign In</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 rounded transition flex items-center justify-center gap-2`} disabled={loading}>
            <ArrowRight size={18} /> Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Sign up</a>
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          পাসওয়ার্ড ভুলে গেছেন? <a href="/forgot-password" className="text-blue-600 hover:underline">রিসেট করুন</a>
        </p>
      </div>
    </div>
  );
}