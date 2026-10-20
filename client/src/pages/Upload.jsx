import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload as UploadIcon,
  Film,
  Sparkles,
  Calendar,
  Clock,
  Check,
  X,
  Play,
  Hash,
  Layers,
  ArrowRight,
  Info,
  Smartphone,
  Eye,
  Sliders,
  Volume2,
  Heart,
  MessageCircle,
  Share2 as ShareIcon,
  Music,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { FacebookIcon, InstagramIcon, TikTokIcon, YoutubeIcon } from '../components/PlatformIcons';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [tags, setTags] = useState(['viral', 'trending', 'reels', 'shorts']);
  const [newTag, setNewTag] = useState('');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [platforms, setPlatforms] = useState({
    facebook: true,
    instagram: true,
    tiktok: true,
    youtube: true,
  });

  // Simulator preview platform toggle: 'tiktok' | 'instagram' | 'youtube'
  const [simPlatform, setSimPlatform] = useState('tiktok');

  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (selected) => {
    if (!selected) return;
    if (!selected.type.startsWith('video/')) {
      toast.error('Please choose a valid video asset (.mp4, .mov, .mkv)');
      return;
    }
    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);

    if (!title) {
      const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleGenerateAIHook = () => {
    const hooks = [
      'Stop scrolling! This changes everything you know about social automation...',
      '3 hacks to 10x your reach across 4 platforms in 60 seconds 🚀',
      'Behind the scenes of how we distribute 50+ videos automatically every week!',
      'The exact formula top creators use to dominate YouTube Shorts & TikTok.',
    ];
    const picked = hooks[Math.floor(Math.random() * hooks.length)];
    setTitle(picked);
    setDesc('Tested and validated multi-channel deployment. Like and follow for more creator workflows! #creator #growth');
    setTags(['viral', 'growth', 'reels', 'trending', 'contentcreator', 'automation']);
    toast.success('AI Hook & Caption generated!');
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const clean = newTag.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setNewTag('');
  };

  const removeTag = (t) => {
    setTags(tags.filter((x) => x !== t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a video file');
      return;
    }

    const selectedPlatforms = Object.entries(platforms)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one broadcast channel');
      return;
    }

    setLoading(true);
    setUploadProgress(25);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('platforms', selectedPlatforms.join(','));
    formData.append('tags', tags.join(','));
    formData.append('aspectRatio', aspectRatio);
    if (isScheduled && scheduledAt) {
      formData.append('scheduledAt', new Date(scheduledAt).toISOString());
    }

    try {
      const token = localStorage.getItem('token');
      setUploadProgress(70);

      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        credentials: 'include',
      });

      setUploadProgress(100);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      toast.success(
        isScheduled
          ? 'Campaign successfully queued for precision scheduling!'
          : 'Omnichannel broadcast launched! Cross-platform dispatch active.'
      );
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-bold">
              OMNICHANNEL STUDIO PRO
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Asset Ingestion & Multi-Network Composer
          </h1>
          <p className="text-xs text-slate-400">
            One master upload broadcasted across Facebook, Instagram, TikTok, and YouTube with live mobile simulation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateAIHook}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition shadow"
        >
          <Sparkles size={14} className="text-purple-300" />
          <span>AI Caption & Hook Generator</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Asset Config & Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Media Upload Box */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Film size={15} className="text-indigo-400" /> Master Video Asset *
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                {['9:16', '16:9'].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                      aspectRatio === ratio
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {ratio} {ratio === '9:16' ? '(Vertical)' : '(Widescreen)'}
                  </button>
                ))}
              </div>
            </div>

            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center border border-slate-800">
                <video
                  src={previewUrl}
                  controls
                  className={`w-full max-h-[360px] object-contain ${
                    aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl('');
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white backdrop-blur-md transition"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 bg-slate-950/60 group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
                  <UploadIcon size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Select Master Video File</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">MP4, MOV, WebM (H.264 / AAC) up to 500MB</div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
          </div>

          {/* 2. Metadata: Title & Caption */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Broadcast Headline / Title *
                </label>
                <span className="text-[10px] font-mono text-slate-500">{title.length}/100</span>
              </div>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="Hook your audience with a strong title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs placeholder-slate-500 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Global Caption & Description
              </label>
              <textarea
                rows={3}
                placeholder="Write description, call to action, or context..."
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs placeholder-slate-500 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Hashtag taxonomy */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Hash size={13} className="text-indigo-400" /> Taxonomy & Hashtags
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-800/50 border border-slate-700/60 min-h-[38px] items-center">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                  >
                    #{t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-white">
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add hashtag & press Enter..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag(e);
                  }}
                  className="bg-transparent text-xs text-white placeholder-slate-500 outline-none px-2 py-0.5 flex-1 min-w-[120px]"
                />
              </div>
            </div>
          </div>

          {/* 3. Destination Channels */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Distribution Channels
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'facebook', label: 'Facebook Reels', Icon: FacebookIcon, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
                { key: 'instagram', label: 'Instagram Reels', Icon: InstagramIcon, color: 'text-pink-400 border-pink-500/30 bg-pink-500/10' },
                { key: 'tiktok', label: 'TikTok Video', Icon: TikTokIcon, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
                { key: 'youtube', label: 'YouTube Shorts', Icon: YoutubeIcon, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
              ].map((p) => {
                const Icon = p.Icon;
                const isSelected = platforms[p.key];
                return (
                  <div
                    key={p.key}
                    onClick={() => setPlatforms({ ...platforms, [p.key]: !isSelected })}
                    className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition ${
                      isSelected
                        ? `${p.color} ring-1 ring-indigo-500/30`
                        : 'border-slate-800 bg-slate-900 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={18} />
                      <span className="text-xs font-bold text-white">{p.label}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] ${
                        isSelected ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check size={11} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Publishing Strategy */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock size={15} className="text-indigo-400" /> Dispatch Strategy
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduled(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    !isScheduled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Direct Broadcast
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduled(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    isScheduled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Precision Schedule
                </button>
              </div>
            </div>

            {isScheduled && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in">
                <label className="block text-[11px] font-semibold text-slate-400">
                  Target Broadcast Timestamp:
                </label>
                <input
                  type="datetime-local"
                  required={isScheduled}
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1 font-mono">
                  <CheckCircle2 size={12} /> Auto-Scheduler armed (checks queue every 15 seconds)
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Transmitting across network ({uploadProgress}%)...</span>
              ) : (
                <>
                  <span>{isScheduled ? 'Commit to Publishing Pipeline' : 'Initiate Omnichannel Broadcast'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 5 Columns: Real-Time Mobile Device Simulator */}
        <div className="lg:col-span-5 sticky top-20 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smartphone size={14} className="text-indigo-400" /> Device Simulation
            </span>
            <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              {[
                { key: 'tiktok', label: 'TikTok' },
                { key: 'instagram', label: 'Reels' },
                { key: 'youtube', label: 'Shorts' },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSimPlatform(m.key)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition ${
                    simPlatform === m.key
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* iPhone Frame Simulator */}
          <div className="mx-auto w-[280px] sm:w-[310px] h-[580px] rounded-[44px] bg-black border-4 border-slate-800 p-3 shadow-2xl relative flex flex-col justify-between overflow-hidden ring-1 ring-slate-700/60">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-end px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800"></div>
            </div>

            {/* Simulated Video Canvas */}
            <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <video
                  src={previewUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 space-y-2 text-slate-600">
                  <Film size={36} className="mx-auto opacity-40" />
                  <div className="text-xs font-bold text-slate-500">Live Device Simulation</div>
                  <div className="text-[10px] text-slate-600">Upload video to render preview</div>
                </div>
              )}
            </div>

            {/* Overlay UI (Reels / TikTok style) */}
            <div className="relative z-20 flex justify-between items-start pt-7 px-2">
              <span className="text-[10px] font-bold text-white drop-shadow">Following | For You</span>
              <Volume2 size={16} className="text-white drop-shadow" />
            </div>

            {/* Right Engagement Sidebar (Simulation) */}
            <div className="relative z-20 self-end space-y-4 text-center pr-2 mb-14">
              <div className="space-y-0.5">
                <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur border border-white/20 flex items-center justify-center text-white">
                  <Heart size={16} />
                </div>
                <div className="text-[9px] font-bold text-white drop-shadow">14.2K</div>
              </div>
              <div className="space-y-0.5">
                <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur border border-white/20 flex items-center justify-center text-white">
                  <MessageCircle size={16} />
                </div>
                <div className="text-[9px] font-bold text-white drop-shadow">348</div>
              </div>
              <div className="space-y-0.5">
                <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur border border-white/20 flex items-center justify-center text-white">
                  <ShareIcon size={16} />
                </div>
                <div className="text-[9px] font-bold text-white drop-shadow">Share</div>
              </div>
            </div>

            {/* Bottom Caption & Audio Bar */}
            <div className="relative z-20 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent space-y-1.5 -mx-3 -mb-3 rounded-b-[40px]">
              <div className="text-xs font-bold text-white drop-shadow flex items-center gap-1">
                @acmemedia <CheckCircle2 size={12} className="text-cyan-400 fill-cyan-400" />
              </div>
              <p className="text-[11px] text-white/90 line-clamp-2 leading-tight drop-shadow font-medium">
                {title || 'Your caption and title preview will appear here in real-time...'}
              </p>
              <div className="text-[10px] text-indigo-300 font-semibold flex flex-wrap gap-1 drop-shadow">
                {tags.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-white/70 pt-0.5">
                <Music size={10} className="animate-spin" />
                <span className="truncate">Original Audio — Acme Official Media</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}