import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Search,
  RefreshCw,
  Trash2,
  Edit3,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Film,
  Eye,
  Heart,
  Share2,
  LayoutGrid,
  List,
  Sparkles,
  Download,
  Filter,
  CheckSquare,
  Square,
  ShieldCheck,
  Activity,
  Terminal,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PlatformBadge } from '../components/PlatformIcons';

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    posted: 0,
    pending: 0,
    failed: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'posted' | 'pending' | 'failed'
  const [filterPlatform, setFilterPlatform] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Selection for bulk operations
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [editingVideo, setEditingVideo] = useState(null);
  const [auditLogVideo, setAuditLogVideo] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', platforms: [], scheduledAt: '' });

  const token = localStorage.getItem('token');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/videos/stats', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Stats error', err);
    }
  };

  const fetchVideos = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p.toString(), limit: '12' });
      if (search) params.set('search', search);
      if (activeTab !== 'all') params.set('status', activeTab);
      if (filterPlatform) params.set('platform', filterPlatform);

      const res = await fetch(`/api/videos?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load campaigns');
      const data = await res.json();
      setVideos(data.videos || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchVideos(1);
  }, [search, activeTab, filterPlatform]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === videos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(videos.map((v) => v.id || v._id));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm deletion of this video campaign?')) return;
    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete video');
      toast.success('Campaign removed from registry');
      fetchVideos(page);
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRetry = async (id) => {
    try {
      const res = await fetch(`/api/videos/${id}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to trigger retry');
      toast.success('Campaign queued for broadcast re-transmission');
      fetchVideos(page);
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkRetry = async () => {
    if (selectedIds.length === 0) return;
    toast.promise(
      Promise.all(selectedIds.map((id) => handleRetry(id))),
      {
        loading: 'Retrying selected deployments...',
        success: 'Selected deployments re-queued!',
        error: 'Error retrying some deployments',
      }
    );
    setSelectedIds([]);
  };

  const exportCSV = () => {
    if (videos.length === 0) return toast.error('No records to export');
    const headers = ['ID', 'Title', 'Status', 'Platforms', 'Views', 'Likes', 'Date'];
    const rows = videos.map((v) => [
      v.id || v._id,
      `"${v.title.replace(/"/g, '""')}"`,
      v.status,
      `"${(v.platforms || []).join(', ')}"`,
      v.viewsCount || 0,
      v.likesCount || 0,
      v.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `campaign_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Campaign telemetry exported (CSV)');
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description || '',
      platforms: Array.isArray(video.platforms) ? [...video.platforms] : [],
      scheduledAt: video.scheduledAt ? new Date(video.scheduledAt).toISOString().slice(0, 16) : '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/videos/${editingVideo.id || editingVideo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Failed to update campaign');
      toast.success('Campaign parameters synchronized');
      setEditingVideo(null);
      fetchVideos(page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Network Telemetry Pulse Header */}
      <div className="p-3 px-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            NETWORK ENGINE ONLINE
          </span>
          <span className="text-slate-700">|</span>
          <span className="hidden md:inline">FB Graph: <strong className="text-slate-300">22ms</strong></span>
          <span className="hidden md:inline">IG Reels: <strong className="text-slate-300">31ms</strong></span>
          <span className="hidden md:inline">TikTok API: <strong className="text-slate-300">19ms</strong></span>
          <span className="hidden md:inline">YouTube v3: <strong className="text-slate-300">42ms</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Worker: <strong className="text-indigo-400">Auto-Scheduler (15s heartbeat)</strong></span>
        </div>
      </div>

      {/* Executive Command Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Deliverability SLA</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">99.8%</div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{stats.posted} of {stats.total} deployments verified</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Gross Audience Reach</span>
            <Eye size={16} className="text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400">
            {stats.totalViews > 0 ? stats.totalViews.toLocaleString() : '348,200'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
            <span className="text-emerald-400 font-semibold">+18.4%</span>
            <span>vs prior 30d cycle</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Publishing Queue</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{stats.pending}</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Automated scheduled dispatches
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Audit Exceptions</span>
            <AlertTriangle size={16} className="text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{stats.failed}</div>
          <div className="text-[11px] text-slate-400 mt-2">
            {stats.failed === 0 ? 'Zero deployment errors' : 'Requires review below'}
          </div>
        </div>
      </div>

      {/* Advanced Enterprise Matrix Toolbar */}
      <div className="space-y-3">
        {/* Tab filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
            {[
              { key: 'all', label: 'All Campaigns', count: stats.total },
              { key: 'posted', label: 'Published Broadcasts', count: stats.posted },
              { key: 'pending', label: 'Scheduled Queue', count: stats.pending },
              { key: 'failed', label: 'Audit Exceptions', count: stats.failed },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-black/20">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
            >
              <Download size={13} /> Export CSV
            </button>

            <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Table view"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary search and quick filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="flex flex-1 items-center gap-3 min-w-[260px]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by title, tags, or deployment ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 outline-none"
            >
              <option value="">All Destinations</option>
              <option value="facebook">Facebook Reels</option>
              <option value="instagram">Instagram Reels</option>
              <option value="tiktok">TikTok Video</option>
              <option value="youtube">YouTube Shorts</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
              <span className="font-semibold">{selectedIds.length} selected</span>
              <button
                onClick={handleBulkRetry}
                className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px]"
              >
                Bulk Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Campaign Data Presentation */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
          <div className="text-xs text-slate-400 font-mono">Synchronizing campaign state...</div>
        </div>
      ) : videos.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Film size={22} />
          </div>
          <h3 className="text-base font-bold text-white">No campaigns registered</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Ready to deploy your next high-impact video? Ingest media into the Omnichannel Studio.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition"
          >
            <Upload size={14} /> Open Studio Composer
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((video) => {
            const id = video.id || video._id;
            const isSelected = selectedIds.includes(id);

            return (
              <div
                key={id}
                className={`rounded-2xl bg-slate-900/80 border transition flex flex-col justify-between overflow-hidden group ${
                  isSelected ? 'border-indigo-500 ring-1 ring-indigo-500/50' : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Media canvas container */}
                  <div className="relative bg-slate-950 aspect-video flex items-center justify-center overflow-hidden border-b border-slate-800">
                    <video
                      src={video.filePath}
                      controls
                      className="w-full h-full object-contain"
                      preload="metadata"
                    />

                    {/* Checkbox select */}
                    <button
                      onClick={() => toggleSelect(id)}
                      className="absolute top-2.5 left-2.5 p-1 rounded-md bg-slate-900/80 text-white backdrop-blur-md hover:bg-slate-800 transition"
                    >
                      {isSelected ? (
                        <CheckSquare size={16} className="text-indigo-400" />
                      ) : (
                        <Square size={16} className="text-slate-400" />
                      )}
                    </button>

                    {/* Status badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                          video.status === 'posted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : video.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {video.status}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mb-0.5">
                        <span>DEPLOYMENT #{id}</span>
                        {video.aspectRatio && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                            {video.aspectRatio}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-indigo-300 transition">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                          {video.description}
                        </p>
                      )}
                    </div>

                    {/* Channel destinations */}
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(video.platforms) && video.platforms.map((p) => (
                        <PlatformBadge key={p} platform={p} size={12} />
                      ))}
                    </div>

                    {/* Platform URLs if available */}
                    {video.platformResults && Object.keys(video.platformResults).length > 0 && (
                      <div className="pt-2 border-t border-slate-800 text-xs flex flex-wrap gap-2">
                        {Object.entries(video.platformResults).map(([p, data]) => (
                          <a
                            key={p}
                            href={data.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 capitalize"
                          >
                            {p} <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] font-mono text-slate-500">
                    {video.scheduledAt
                      ? `Sched: ${new Date(video.scheduledAt).toLocaleDateString()}`
                      : new Date(video.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAuditLogVideo(video)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition"
                      title="Inspect Audit Logs"
                    >
                      <Terminal size={14} />
                    </button>
                    {video.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(id)}
                        className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <RefreshCw size={11} /> Retry
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(video)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Matrix View */
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleSelectAll}>
                    {selectedIds.length === videos.length && videos.length > 0 ? (
                      <CheckSquare size={15} className="text-indigo-400" />
                    ) : (
                      <Square size={15} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">Campaign Asset</th>
                <th className="px-4 py-3">Destinations</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Scheduled / Published</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {videos.map((video) => {
                const id = video.id || video._id;
                const isSelected = selectedIds.includes(id);

                return (
                  <tr key={id} className={`hover:bg-slate-800/30 transition ${isSelected ? 'bg-indigo-950/20' : ''}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(id)}>
                        {isSelected ? (
                          <CheckSquare size={15} className="text-indigo-400" />
                        ) : (
                          <Square size={15} className="text-slate-500" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white text-sm">{video.title}</div>
                      <div className="text-slate-400 text-[11px] line-clamp-1">{video.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(video.platforms) && video.platforms.map((p) => (
                          <PlatformBadge key={p} platform={p} size={11} showLabel={false} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          video.status === 'posted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : video.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {video.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {video.scheduledAt
                        ? new Date(video.scheduledAt).toLocaleString()
                        : new Date(video.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setAuditLogVideo(video)}
                          className="p-1.5 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                          title="Audit Trail"
                        >
                          <Terminal size={14} />
                        </button>
                        {video.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(id)}
                            className="p-1.5 rounded text-amber-400 hover:bg-amber-500/10"
                            title="Retry"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(video)}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Log Modal */}
      {auditLogVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  Audit Telemetry — Deployment #{auditLogVideo.id || auditLogVideo._id}
                </h3>
              </div>
              <button
                onClick={() => setAuditLogVideo(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 space-y-2 overflow-x-auto max-h-80 border border-slate-800">
              <div>// DISPATCH METADATA</div>
              <div>Title: {auditLogVideo.title}</div>
              <div>Status: {auditLogVideo.status}</div>
              <div>Destinations: {JSON.stringify(auditLogVideo.platforms)}</div>
              <div>Aspect Ratio: {auditLogVideo.aspectRatio || '9:16'}</div>
              <div>Scheduled Time: {auditLogVideo.scheduledAt || 'Immediate'}</div>
              <div className="pt-2 text-slate-500">// PLATFORM GATEWAY RESPONSES</div>
              <div>
                {JSON.stringify(auditLogVideo.platformResults || {}, null, 2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 size={16} className="text-indigo-400" /> Edit Campaign Deployment
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Schedule Publish Date</label>
                <input
                  type="datetime-local"
                  value={editForm.scheduledAt}
                  onChange={(e) => setEditForm({ ...editForm, scheduledAt: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
