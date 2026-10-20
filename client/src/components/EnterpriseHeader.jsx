import { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  Plus,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  Command,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function EnterpriseHeader({ user }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const mockNotifications = [
    { id: 1, title: 'Broadcast Dispatched', desc: 'Campaign #204 auto-published to Facebook & TikTok', time: '5m ago', unread: true },
    { id: 2, title: 'Engine Sync Complete', desc: 'MySQL cluster synchronized 12 schema records', time: '30m ago', unread: false },
    { id: 3, title: 'OAuth Token Refreshed', desc: 'YouTube Data API v3 token renewed for 60 days', time: '2h ago', unread: false },
  ];

  return (
    <header className="h-16 px-6 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Left: Workspace Selector & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-semibold text-slate-200 hover:border-slate-600 transition cursor-pointer">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span>Acme Global Media</span>
          <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.2 rounded">
            ENTERPRISE
          </span>
          <ChevronDown size={13} className="text-slate-400" />
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-4">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>API Gateway: <strong className="text-slate-200">99.98% Healthy</strong></span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-[11px] text-slate-400">MySQL Cluster: Active</span>
        </div>
      </div>

      {/* Center: Command Palette / Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div
          className={`w-full flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs transition-all ${
            searchFocused
              ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/10'
              : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-700'
          }`}
        >
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns, tags, channels, or logs..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent text-slate-200 placeholder-slate-400 outline-none text-xs"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-400">
            <Command size={10} />K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Notifications, User */}
      <div className="flex items-center gap-3">
        {/* Quick Upload CTA */}
        <Link
          to="/upload"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition active:scale-95"
        >
          <Plus size={15} />
          <span>New Broadcast</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition relative"
            title="Audit notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 space-y-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Audit Activity
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{n.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
