import React, { useState } from 'react';
import { Download, X, Layers, Gauge, Folder, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddDownload: (url: string, filename: string, threads: number, speedLimitKbps: number, category: any) => void;
}

export const AddDownloadModal: React.FC<Props> = ({ isOpen, onClose, onAddDownload }) => {
  const [url, setUrl] = useState('https://downloads.example.org/iso/archlinux-2026.08.01-x86_64.iso');
  const [filename, setFilename] = useState('archlinux-2026.08.01-x86_64.iso');
  const [threads, setThreads] = useState(8);
  const [speedLimitKbps, setSpeedLimitKbps] = useState(0); // 0 = unlimited

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !filename) return;
    onAddDownload(url, filename, threads, speedLimitKbps, 'General');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl text-slate-100 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Download className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-lg text-white">Add New Download Task</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Download URL</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                const derived = e.target.value.split('/').pop()?.split('?')[0];
                if (derived) setFilename(derived);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              placeholder="https://example.com/file.zip"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Save Filename</label>
            <input
              type="text"
              required
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                <span>Parallel Workers</span>
                <span className="text-indigo-400 font-mono">{threads} Workers</span>
              </label>
              <input
                type="range"
                min={1}
                max={32}
                value={threads}
                onChange={(e) => setThreads(Number(e.target.value))}
                className="w-full bg-slate-800 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                <span>Speed Limit</span>
                <span className="text-amber-400 font-mono">
                  {speedLimitKbps === 0 ? 'Unlimited' : `${speedLimitKbps} KB/s`}
                </span>
              </label>
              <select
                value={speedLimitKbps}
                onChange={(e) => setSpeedLimitKbps(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value={0}>Unlimited</option>
                <option value={1024}>1 MB/s</option>
                <option value={2048}>2 MB/s</option>
                <option value={5120}>5 MB/s</option>
                <option value={10240}>10 MB/s</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg transition-all"
            >
              Start Download
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

