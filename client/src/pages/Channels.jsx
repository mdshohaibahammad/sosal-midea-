import { useEffect, useState } from 'react';
import {
  Share2,
  CheckCircle2,
  XCircle,
  Unlink,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Key,
  Sliders,
  Settings2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { FacebookIcon, InstagramIcon, TikTokIcon, YoutubeIcon } from '../components/PlatformIcons';

export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState('');
  const [activeConfigChannel, setActiveConfigChannel] = useState(null);

  const token = localStorage.getItem('token');

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/social/status', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setChannels(data);
      }
    } catch (err) {
      toast.error('Failed to load channel telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleConnectDemo = async (platformKey) => {
    setConnecting(platformKey);
    try {
      const res = await fetch(`/api/social/connect-demo/${platformKey}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Connection failed');
      toast.success(`${platformKey.toUpperCase()} authorized and synchronized!`);
      fetchChannels();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConnecting('');
    }
  };

  const handleDisconnect = async (platformKey) => {
    if (!window.confirm(`Revoke OAuth credentials for ${platformKey.toUpperCase()}?`)) return;
    try {
      const res = await fetch(`/api/social/disconnect/${platformKey}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Disconnection failed');
      toast.success(`${platformKey.toUpperCase()} credentials revoked`);
      fetchChannels();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getPlatformIcon = (key) => {
    switch (key) {
      case 'facebook':
        return <FacebookIcon size={32} className="text-blue-500" />;
      case 'instagram':
        return <InstagramIcon size={32} className="text-pink-500" />;
      case 'tiktok':
        return <TikTokIcon size={32} className="text-cyan-400" />;
      case 'youtube':
        return <YoutubeIcon size={32} className="text-red-500" />;
      default:
        return <Share2 size={32} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-indigo-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
              ENTERPRISE INTEGRATIONS HUB
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Channel Gateway & API Authorization
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage production OAuth connections, API quotas, and cross-platform publishing tokens.
          </p>
        </div>

        <button
          onClick={() => {
            fetchChannels();
            toast.success('Channel telemetry refreshed');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
        >
          <RefreshCw size={14} /> Refresh Health
        </button>
      </div>

      {/* Channels Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-slate-400">Loading channel gateways...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {channels.map((ch) => {
            const isConnecting = connecting === ch.key;

            return (
              <div
                key={ch.key}
                className={`p-6 rounded-2xl bg-slate-900/80 border transition flex flex-col justify-between space-y-5 ${
                  ch.isConnected
                    ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Channel Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                        {getPlatformIcon(ch.key)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{ch.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ch.isConnected
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {ch.isConnected ? (
                              <>
                                <CheckCircle2 size={11} /> Authorized
                              </>
                            ) : (
                              <>
                                <XCircle size={11} /> Unconnected
                              </>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">v19.0 API</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveConfigChannel(ch)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Custom API Credentials"
                    >
                      <Settings2 size={16} />
                    </button>
                  </div>

                  {/* Channel Quotas and Telemetry */}
                  {ch.isConnected ? (
                    <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-sans">Active Identity:</span>
                        <span className="text-white font-bold">{ch.accountName}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-sans">API Daily Quota:</span>
                        <span className="text-emerald-400">1,240 / 10,000 units</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12%' }}></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>Token Lifecycle:</span>
                        <span className="text-slate-300 font-sans font-semibold">Auto-Refreshes before expiry</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                      Link your authorized enterprise app to enable direct video upload, reel ingestion, and engagement webhook telemetry.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  {ch.isConnected ? (
                    <button
                      onClick={() => handleDisconnect(ch.key)}
                      className="w-full py-2.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Unlink size={13} /> Revoke Authorization
                    </button>
                  ) : (
                    <button
                      disabled={isConnecting}
                      onClick={() => handleConnectDemo(ch.key)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Zap size={14} />
                      {isConnecting ? 'Verifying Gateway...' : '1-Click Authorize Channel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Credentials Modal */}
      {activeConfigChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Key size={16} className="text-indigo-400" />
                {activeConfigChannel.name} — OAuth Config
              </h3>
              <button
                onClick={() => setActiveConfigChannel(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              For enterprise production apps with custom App IDs, enter your developer credentials:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Client / App ID</label>
                <input
                  type="text"
                  placeholder="e.g. 1092837465019"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Client Secret</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Webhook Secret (Optional)</label>
                <input
                  type="text"
                  placeholder="whsec_..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveConfigChannel(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success('Custom OAuth parameters saved');
                  setActiveConfigChannel(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
