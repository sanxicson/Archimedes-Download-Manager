import React, { useState } from 'react';
import { ColorTheme, getModalThemeClasses } from '../utils/modalTheme';
import { Download, X, Layers, Gauge, Folder, ShieldCheck, Sparkles, FileCode } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddDownload: (url: string, filename: string, threads: number, speedLimitKbps: number, category: any) => void;
  colorTheme?: ColorTheme;
}

export const AddDownloadModal: React.FC<Props> = ({ isOpen, onClose, onAddDownload, colorTheme = 'slate' }) => {
  const [url, setUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [filename, setFilename] = useState('BigBuckBunny_4K_Sample.mp4');
  const [threads, setThreads] = useState(8);
  const [speedLimitKbps, setSpeedLimitKbps] = useState(0); // 0 = unlimited

  if (!isOpen) return null;

  const theme = getModalThemeClasses(colorTheme);

  const realSampleUrls = [
    {
      name: 'Sample Video (.mp4)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      file: 'BigBuckBunny_4K_Sample.mp4',
    },
    {
      name: 'Sample PDF Document (.pdf)',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file: 'Document_Sample_W3C.pdf',
    },
    {
      name: 'High Res Wallpaper (.jpg)',
      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920',
      file: 'HighRes_4K_Background.jpg',
    },
    {
      name: 'Sample Archive (.zip)',
      url: 'https://raw.githubusercontent.com/octocat/Spoon-Knife/main/README.md',
      file: 'GitHub_Repository_Archive.zip',
    },
  ];

  const handleSelectSample = (sample: typeof realSampleUrls[0]) => {
    setUrl(sample.url);
    setFilename(sample.file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !filename) return;
    onAddDownload(url, filename, threads, speedLimitKbps, 'General');
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 animate-fadeIn ${theme.backdrop}`}>
      <div
        className={`rounded-xl w-[33vw] min-w-[320px] max-w-[95vw] min-h-[240px] max-h-[85vh] p-3.5 shadow-2xl relative flex flex-col justify-between ${theme.window}`}
        style={{ resize: 'both', overflow: 'auto' }}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 z-10 p-1 rounded-lg transition-all ${theme.closeBtn}`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`flex items-center gap-2 mb-2.5 pb-2 border-b pr-8 ${theme.header}`}>
          <Download className="w-4 h-4 text-indigo-500 shrink-0" />
          <h3 className={`font-extrabold text-xs sm:text-sm truncate ${theme.headerTitle}`}>Add New Download Task</h3>
        </div>

        {/* Real Test URL Presets */}
        <div className="mb-2.5">
          <label className={`block font-medium mb-1 text-[10px] uppercase tracking-wider flex items-center gap-1 ${theme.textMuted}`}>
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Sample Direct Download URLs:</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {realSampleUrls.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`text-left px-2 py-1 rounded text-[11px] font-medium transition-all truncate ${theme.card} hover:border-indigo-500`}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
          <div>
            <label className={`block font-medium mb-0.5 text-[11px] ${theme.textSecondary}`}>Target Download URL</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                const derived = e.target.value.split('/').pop()?.split('?')[0];
                if (derived) setFilename(derived);
              }}
              className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none ${theme.input}`}
              placeholder="https://example.com/file.zip"
            />
          </div>

          <div>
            <label className={`block font-medium mb-0.5 text-[11px] ${theme.textSecondary}`}>Save Filename</label>
            <input
              type="text"
              required
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none ${theme.input}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`block font-medium mb-0.5 text-[11px] flex items-center justify-between ${theme.textSecondary}`}>
                <span>Parallel Workers</span>
                <span className="text-indigo-400 font-mono text-[10px]">{threads} Workers</span>
              </label>
              <input
                type="range"
                min={1}
                max={32}
                value={threads}
                onChange={(e) => setThreads(Number(e.target.value))}
                className="w-full bg-slate-800 accent-indigo-500 cursor-pointer h-1.5 rounded"
              />
            </div>

            <div>
              <label className={`block font-medium mb-0.5 text-[11px] flex items-center justify-between ${theme.textSecondary}`}>
                <span>Speed Limit</span>
                <span className="text-amber-400 font-mono text-[10px]">
                  {speedLimitKbps === 0 ? 'Unlimited' : `${speedLimitKbps} KB/s`}
                </span>
              </label>
              <select
                value={speedLimitKbps}
                onChange={(e) => setSpeedLimitKbps(Number(e.target.value))}
                className={`w-full rounded-lg px-2 py-1 text-xs focus:outline-none ${theme.input}`}
              >
                <option value={0}>Unlimited</option>
                <option value={1024}>1 MB/s</option>
                <option value={2048}>2 MB/s</option>
                <option value={5120}>5 MB/s</option>
                <option value={10240}>10 MB/s</option>
              </select>
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-2 text-[10px] text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Real Downloader Engine Active: IDM will fetch HTTP streams and write to local disk.
            </span>
          </div>

          <div className={`pt-2 border-t flex justify-end gap-2 relative ${theme.footer}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${theme.btnSecondary}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-md transition-all mr-2 ${theme.btnPrimary}`}
            >
              Start Download
            </button>
            <div className="absolute bottom-0 right-0 pointer-events-none text-slate-500 opacity-60">
              <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14ZM14 6H12V4H14V6ZM10 10H8V8H10V10ZM6 14H4V12H6V14Z" />
              </svg>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
