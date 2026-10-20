import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Calendar,
  Share2,
  Settings,
  LogOut,
  Film,
  Zap,
  HardDrive,
  BarChart3,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const primaryNav = [
    { to: '/dashboard', label: 'Command Center', icon: LayoutDashboard, badge: 'Live' },
    { to: '/upload', label: 'Omnichannel Studio', icon: Upload, badge: 'Composer' },
    { to: '/schedule', label: 'Content Calendar', icon: Calendar, badge: null },
  ];

  const secondaryNav = [
    { to: '/channels', label: 'Integrations Hub', icon: Share2, badge: '4 Channels' },
    { to: '/settings', label: 'System & Security', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-xl z-30 select-none">
      <div>
        {/* Brand Bar */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Film size={20} />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                PostPulse
                <span className="text-[9px] font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  OS
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Enterprise v2.4</div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 space-y-6">
          {/* Section 1: Core Platform */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Core Operations
            </div>
            {primaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/90 text-white shadow-md shadow-indigo-600/25 border border-indigo-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Section 2: Integrations & Infrastructure */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Infrastructure & Governance
            </div>
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/90 text-white shadow-md shadow-indigo-600/25 border border-indigo-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom: Storage Gauge & Account */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        {/* Cloud Storage Usage Meter */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <HardDrive size={13} className="text-indigo-400" /> Enterprise Storage
            </span>
            <span className="font-mono font-bold text-slate-300">1.4 / 50 GB</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '3%' }}></div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{user?.email || 'admin@example.com'}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
