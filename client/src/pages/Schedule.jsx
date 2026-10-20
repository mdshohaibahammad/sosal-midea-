import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Film,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlatformBadge } from '../components/PlatformIcons';

export default function Schedule() {
  const [scheduledVideos, setScheduledVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('timeline'); // 'timeline' | 'calendar'

  const token = localStorage.getItem('token');

  const fetchScheduled = async () => {
    try {
      const res = await fetch('/api/videos?status=pending&limit=50', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setScheduledVideos(data.videos || []);
      }
    } catch (err) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduled();
  }, []);

  const handleForceTrigger = async (id) => {
    try {
      const res = await fetch(`/api/videos/${id}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to trigger');
      toast.success('Immediate broadcast triggered!');
      fetchScheduled();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Mock days for calendar grid
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const dayNum = (i % 31) + 1;
    return {
      day: dayNum,
      isCurrentMonth: i >= 3 && i < 34,
      items: i === 12 || i === 18 || i === 24 ? [scheduledVideos[0]].filter(Boolean) : [],
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-amber-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              AUTOMATED PIPELINE
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Publishing Calendar & Dispatch Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Omnichannel content calendar. Background engine executes dispatches automatically when scheduled timestamps arrive.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-800 border border-slate-700 rounded-xl">
            <button
              onClick={() => setViewType('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewType === 'timeline' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Timeline Queue
            </button>
            <button
              onClick={() => setViewType('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewType === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Month Calendar
            </button>
          </div>

          <Link
            to="/upload"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition"
          >
            Schedule Video
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-slate-400">Loading schedule pipeline...</div>
      ) : viewType === 'timeline' ? (
        /* Timeline View */
        scheduledVideos.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <h3 className="text-base font-bold text-white">Pipeline Queue Idle</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No pending scheduled videos. Ingest a video in the studio and select a future dispatch date.
            </p>
            <Link
              to="/upload"
              className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
            >
              Create Scheduled Video
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledVideos.map((video) => {
              const id = video.id || video._id;
              const hasScheduleTime = !!video.scheduledAt;
              const targetDate = hasScheduleTime ? new Date(video.scheduledAt) : new Date(video.createdAt);

              return (
                <div
                  key={id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                      <video src={video.filePath} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-slate-500">#{id}</span>
                        <h3 className="font-bold text-white text-sm">{video.title}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                          <Clock size={12} />
                          {hasScheduleTime ? `Target: ${targetDate.toLocaleString()}` : 'Queued for immediate run'}
                        </span>
                        <span className="text-slate-700">•</span>
                        <div className="flex gap-1">
                          {Array.isArray(video.platforms) && video.platforms.map((p) => (
                            <PlatformBadge key={p} platform={p} size={11} showLabel={false} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleForceTrigger(id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Zap size={13} /> Broadcast Now
                    </button>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Armed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Calendar View */
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarIcon size={18} className="text-indigo-400" /> October 2026
            </h2>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((d) => (
              <div key={d} className="text-center font-bold text-xs uppercase text-slate-500 py-1 font-mono">
                {d}
              </div>
            ))}
            {calendarDays.map((c, idx) => (
              <div
                key={idx}
                className={`min-h-[85px] p-2 rounded-xl border flex flex-col justify-between text-xs transition ${
                  c.isCurrentMonth
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/20 border-slate-900/50 text-slate-600'
                }`}
              >
                <div className="font-mono text-[11px] font-bold text-slate-400">{c.day}</div>
                {c.items.length > 0 && (
                  <div className="p-1.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-[10px] text-indigo-300 font-bold truncate">
                    📹 {c.items[0].title}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
