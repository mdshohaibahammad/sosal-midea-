import { useState, useRef } from 'react';
import { Upload as UploadIcon, Facebook, Instagram, TikTok, Youtube } from 'lucide-react';

export default function Upload() {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [platforms, setPlatforms] = useState({ facebook: false, instagram: false, tiktok: false, youtube: false });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMsg('Please select a video file');
    setLoading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('platforms', Object.entries(platforms).filter(([,v]) => v).map(([k]) => k).join(','));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setMsg('Video uploaded successfully!');
      setFile(null); setTitle(''); setDesc('');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Video</h1>
        <p className="text-gray-600">Upload once, post to multiple platforms</p>
      </div>

      {msg && <div className={`p-4 rounded-lg ${msg.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{msg}</div>}

      <div className="bg-white p-8 rounded-2xl shadow border border-gray-100 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition cursor-pointer" onClick={() => inputRef.current.click()}>
              {file ? (
                <div className="flex items-center justify-center gap-3 text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="font-medium">{file.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadIcon size={32} className="mx-auto text-gray-400" />
                  <p className="text-gray-600">Click to upload video</p>
                  <p className="text-xs text-gray-400">MP4, MOV up to 500MB</p>
                </div>
              )}
              <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" type="text" placeholder="Enter video title" required value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={3} placeholder="Add description..." value={description} onChange={e => setDesc(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Platforms</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'facebook', label: 'Facebook', Icon: Facebook, color: 'bg-blue-50 text-blue-600 border-blue-200' },
                { key: 'instagram', label: 'Instagram', Icon: Instagram, color: 'bg-pink-50 text-pink-600 border-pink-200' },
                { key: 'tiktok', label: 'TikTok', Icon: TikTok, color: 'bg-purple-50 text-purple-600 border-purple-200' },
                { key: 'youtube', label: 'YouTube', Icon: Youtube, color: 'bg-red-50 text-red-600 border-red-200' }
              ].map(p => {
                const IconComp = p.Icon;
                return (
                  <label key={p.key} className={`cursor-pointer p-3 rounded-lg border flex flex-col items-center gap-1 transition ${platforms[p.key] ? 'border-blue-500 bg-blue-50 text-blue-600' : p.color}`} onClick={() => setPlatforms({...platforms, [p.key]: !platforms[p.key]})}>
                    <IconComp size={20} />
                    <span className="text-xs font-medium">{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl font-semibold transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            {loading ? 'Uploading...' : 'Upload & Post'}
          </button>
        </form>
      </div>
    </div>
  );
}