import React, { useState } from 'react';
import { NativeIpcMessage } from '../types/idm';
import { Globe, Terminal, ArrowRightLeft, Radio, Play, CheckCircle2, Copy } from 'lucide-react';

interface Props {
  ipcLogs: NativeIpcMessage[];
  onTriggerIntercept: (url: string, filename: string, category: any) => void;
}

export const ExtensionSimulator: React.FC<Props> = ({ ipcLogs, onTriggerIntercept }) => {
  const [customUrl, setCustomUrl] = useState('https://downloads.example.com/videos/4k_demo_60fps.mp4');
  const [customFilename, setCustomFilename] = useState('4k_demo_60fps.mp4');

  const presetLinks = [
    { name: '4K Ultra HD Video (.mp4)', url: 'https://cdn.example.org/media/4k_video_stream.mp4', filename: '4k_video_stream.mp4', category: 'Video' },
    { name: 'Linux Kernel ISO (.iso)', url: 'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso', filename: 'ubuntu-24.04-desktop-amd64.iso', category: 'General' },
    { name: 'Compressed Archive (.zip)', url: 'https://github.com/torvalds/linux/archive/refs/tags/v6.10.zip', filename: 'linux-v6.10.zip', category: 'Compressed' },
    { name: 'Lossless FLAC Audio (.flac)', url: 'https://audio.example.com/music/symphony_no9.flac', filename: 'symphony_no9.flac', category: 'Music' },
  ];

  const handleInterceptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;
    onTriggerIntercept(customUrl, customFilename || 'file.bin', 'General');
  };

  return (
    <div className="space-y-6">
      {/* Extension Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-400" />
              <h3 className="font-semibold text-lg text-white">
                Browser Integration (Manifest V3 Extension Interceptor)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Interceptors listen via <code className="text-sky-300">chrome.declarativeNetRequest</code> and dispatch to Rust Native Messaging Host
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Native Host IPC: CONNECTED (stdio pipe)</span>
          </div>
        </div>

        {/* Preset Intercept Buttons */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Simulate Browser Video / Download Interception
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {presetLinks.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 p-3 rounded-lg hover:border-sky-500/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">{item.url}</div>
                </div>
                <button
                  onClick={() => onTriggerIntercept(item.url, item.filename, item.category)}
                  className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded shadow flex items-center gap-1 transition-all"
                >
                  <Play className="w-3 h-3" />
                  Intercept
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom URL Form */}
        <form onSubmit={handleInterceptSubmit} className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://domain.com/path/to/download.ext"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
          />
          <input
            type="text"
            value={customFilename}
            onChange={(e) => setCustomFilename(e.target.value)}
            placeholder="filename.ext"
            className="w-full sm:w-44 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-all"
          >
            Send to IDM Engine
          </button>
        </form>
      </div>

      {/* IPC Native Messaging Frame Stream Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base text-white">
              Native Messaging Host Stdio Framing Log (32-bit LE)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Protocol: WebExtension Stdio JSON</span>
        </div>

        <div className="mt-4 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs max-h-64 overflow-y-auto space-y-2">
          {ipcLogs.map((log) => (
            <div key={log.id} className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">{log.timestamp}</span>
                <span
                  className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                    log.source === 'chrome_extension'
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {log.source === 'chrome_extension' ? 'BROWSER -> NATIVE_HOST' : 'RUST_DAEMON -> BROWSER'}
                </span>
              </div>
              <div className="text-indigo-300 font-bold mb-1">Action: {log.action}</div>
              <pre className="text-[11px] text-slate-300 overflow-x-auto">
                {JSON.stringify(log.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
