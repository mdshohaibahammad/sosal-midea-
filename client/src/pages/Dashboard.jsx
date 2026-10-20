import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Upload, Video, Clock, Search, Filter, Trash2, Edit2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState({ total: 0, posted: 0, pending: 0, failed: 0 });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', platforms: [], scheduledAt: '' });

  const token = localStorage.getItem('token');

  const buildQuery = (p = 1) => {
    const params = new URLSearchParams({ page: p.toString(), limit: '20' });
    if (search) params.set('search', search);
    if (filterStatus) params.set('status', filterStatus);
    if (filterPlatform) params.set('platform', filterPlatform);
    return params.toString();
  };

  const fetchVideos = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch('/api/videos?' + buildQuery(p), {
        headers: { Authorization: 'Bearer ' + token },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('ভিডিও লোড করতে সমস্যা হচ্ছে');
      const data = await res.json();
      setVideos(data.videos || []);
      setStats({
        total: data.total || 0,
        posted: (data.videos || []).filter(v => v.status === 'posted').length,
        pending: (data.videos || []).filter(v => v.status === 'pending').length,
        failed: (data.videos || []).filter(v => v.status === 'failed').length,
      });
      setPage(data.page || 1);
      setPages(data.pages || 1);
    } catch (err) {
      toast.error(err.message || 'ভিডিও লোড করতে সমস্যা হচ্ছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page, search, filterStatus, filterPlatform]);

  const handleDelete = async (id) => {
    if (!window.confirm('এই ভিডিওটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch('/api/videos/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('ডিলিট করতে সমস্যা হচ্ছে');
      toast.success('ভিডিও ডিলিট করা হয়েছে');
      fetchVideos(page);
    } catch (err) {
      toast.error(err.message || 'ডিল করতে সমস্যা হচ্ছে');
    }
  };

  const handleRetry = async (id) => {
    try {
      const res = await fetch('/api/videos/' + id + '/retry', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('রিট্রাই করতে সমস্যা হচ্ছে');
      toast.success('পুনরায় পোস্ট করার জন্য কিউয়ে যোগ করা হয়েছে');
      fetchVideos(page);
    } catch (err) {
      toast.error(err.message || 'রিট্রাই করতে সমস্যা হচ্ছে');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/videos/' + editingId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('আপডেট করতে সমস্যা হচ্ছে');
      toast.success('ভিডিও আপডেট করা হয়েছে');
      setEditingId(null);
      fetchVideos(page);
    } catch (err) {
      toast.error(err.message || 'আপডেট করতে সমস্যা হচ্ছে');
    }
  };

  const statusColor = (status) => {
    if (status === 'posted') return 'bg-emerald-100 text-emerald-700';
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
          <p className="text-gray-600">আপনার সোশ্যাল মিডিয়া ভিডিও পরিচালনা করুন</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2">
            <Upload size={20} /> নতুন আপলোড
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <div className="text-gray-500 text-sm uppercase font-semibold mb-1">মোট ভিডিও</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <div className="text-emerald-500 text-sm uppercase font-semibold mb-1">পোস্ট করা</div>
          <div className="text-3xl font-bold text-emerald-600">{stats.posted}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <div className="text-amber-500 text-sm uppercase font-semibold mb-1">পেন্ডিং</div>
          <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <div className="text-rose-500 text-sm uppercase font-semibold mb-1">ফেইলড</div>
          <div className="text-3xl font-bold text-rose-600">{stats.failed}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="শিরোনাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
        >
          <option value="">সমস্ত স্ট্যাটাস</option>
          <option value="pending">পেন্ডিং</option>
          <option value="posted">পোস্ট করা</option>
          <option value="failed">ফেইলড</option>
        </select>
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
        >
          <option value="">সমস্ত প্ল্যাটফর্ম</option>
          <option value="facebook">ফেসবুক</option>
          <option value="instagram">ইনস্টাগ্রাম</option>
          <option value="tiktok">টিকটক</option>
          <option value="youtube">ইউটিউব</option>
        </select>
        <button
          onClick={() => {
            setSearch('');
            setFilterStatus('');
            setFilterPlatform('');
            fetchVideos(1);
          }}
          className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          রিসেট
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">শিরোনাম</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">প্ল্যাটফর্ম</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">স্ট্যাটাস</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">তারিখ</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">কর্ম</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
 লোড হচ্ছে...
                </td>
              </tr>
            )}
            {!loading && videos.map(v => {
              const isEditing = editingId === v._id;
              return (
                <tr key={v._id} className="hover:bg-gray-50 transition">
                  {isEditing ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editForm.title || v.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {['facebook', 'instagram', 'tiktok', 'youtube'].map(p => (
                          <label key={p} className={`flex items-center gap-1 cursor-pointer ${editForm.platforms.includes(p) ? 'text-blue-600' : 'text-gray-600'} `}>
                            <input
                              type="checkbox"
                              checked={editForm.platforms.includes(p)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditForm({ ...editForm, platforms: [...editForm.platforms, p] });
                                } else {
                                  setEditForm({ ...editForm, platforms: editForm.platforms.filter(x => x !== p) });
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            {p}
                          </label>
                        ))}
                      </td>
                      <td className="px-6 py-4">{v.status}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(v.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button onClick={handleEditSubmit} className="text-green-600 hover:text-green-800 text-sm font-medium">সংরক্ষণ</button>
                        <button onClick={() => setEditingId(null)} className="ml-2 text-gray-500 hover:text-gray-700 text-sm">বাতিল</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">{v.title}</td>
                      <td className="px-6 py-4">{v.platforms?.join(', ') || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(v.status)}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(v.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {v.status === 'failed' && (
                            <button
                              onClick={() => handleRetry(v._id)}
                              className="text-amber-600 hover:text-amber-800 text-sm flex items-center gap-1"
                            >
                              <RefreshCw size={14} /> রিট্রাই
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingId(v._id);
                              setEditForm({ title: v.title, description: v.description || '', platforms: [...v.platforms], scheduledAt: '' });
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            <Edit2 size={14} /> এডিট
                          </button>
                          <button
                            onClick={() => handleDelete(v._id)}
                            className="text-rose-600 hover:text-rose-800 text-sm flex items-center gap-1"
                          >
                            <Trash2 size={14} /> ডিলিট
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {!loading && videos.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">কোনো ভিডিও নেই</td></tr>
            )}
          </tbody>
        </table>

        {pages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-600">
              পৃষ্ঠা {page} / {pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => page > 1 && fetchVideos(page - 1)}
                disabled={page === 1 || loading}
                className="px-3 py-1.5 rounded border text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                পূর্ববর্তী
              </button>
              <button
                onClick={() => page < pages && fetchVideos(page + 1)}
                disabled={page === pages || loading}
                className="px-3 py-1.5 rounded border text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
               পরবর্তী
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
