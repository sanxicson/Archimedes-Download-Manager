import React, { useState } from 'react';
import { Download, Play, Pause, Film, Tv, Check, Sparkles, Volume2, Maximize, ShieldCheck, ChevronDown } from 'lucide-react';

interface Props {
  onAddVideoDownload: (url: string, filename: string, quality: string, sizeBytes: number) => void;
}

export const VideoGrabberPanel: React.FC<Props> = ({ onAddVideoDownload }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  const videoStreams = [
    { label: '1080p60 Full HD (.mp4)', quality: '1080p', sizeBytes: 471859200, filename: 'YouTube_Video_1080p60.mp4' },
    { label: '4K 2160p Ultra HD (.mp4)', quality: '4K', sizeBytes: 1932735283, filename: 'YouTube_Video_4K_2160p.mp4' },
    { label: '720p HD (.mp4)', quality: '720p', sizeBytes: 230686720, filename: 'YouTube_Video_720p.mp4' },
    { label: '480p SD (.mp4)', quality: '480p', sizeBytes: 115343360, filename: 'YouTube_Video_480p.mp4' },
    { label: 'Audio Only (.mp3 320kbps)', quality: 'Audio', sizeBytes: 12582912, filename: 'YouTube_Audio_Track.mp3' },
  ];

  const handleDownload = (stream: typeof videoStreams[0]) => {
    onAddVideoDownload(
      `https://googlevideo.com/videoplayback?id=yt_${stream.quality}&mime=video/mp4`,
      stream.filename,
      stream.quality,
      stream.sizeBytes
    );
    setDownloadedFormat(stream.label);
    setIsDropdownOpen(false);
    setTimeout(() => setDownloadedFormat(null), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>YouTube / Video Media Stream Grabber</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                IDM Video Panel Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Plays web video streams and overlays IDM's floating "Download this video" popup
            </p>
          </div>
        </div>

        {downloadedFormat && (
          <div className="flex items-center gap-2 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Sent {downloadedFormat} to IDM Queue!</span>
          </div>
        )}
      </div>

      {/* Simulated Video Player Box */}
      <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group shadow-2xl flex flex-col justify-between p-4">
        {/* Background Video Simulation Canvas */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 flex items-center justify-center">
          <div className="text-center space-y-2 p-6">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Film className="w-8 h-8 animate-pulse" />
            </div>
            <h4 className="font-extrabold text-base text-slate-200">
              Sample YouTube 4K Stream Simulation
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When video streams play in web pages, IDM's browser extension automatically detects media formats and presents the floating download panel overlay shown in top-right.
            </p>
          </div>
        </div>

        {/* --- FLOATING IDM "DOWNLOAD THIS VIDEO" POPUP WIDGET --- */}
        <div className="relative z-20 self-end">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 hover:brightness-110 text-white font-bold text-xs rounded-lg shadow-2xl flex items-center gap-2 border border-white/20 transition-all transform active:scale-95 animate-pulse"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download this video</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* IDM Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-30 space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>Detected Media Streams</span>
                  <span className="text-indigo-400">IDM Sniffer</span>
                </div>

                {videoStreams.map((stream) => (
                  <button
                    key={stream.quality}
                    onClick={() => handleDownload(stream)}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-indigo-600/30 hover:border-indigo-500/40 border border-transparent flex items-center justify-between transition-all group/item"
                  >
                    <div className="flex items-center gap-2">
                      <Film className="w-3.5 h-3.5 text-indigo-400 group-hover/item:text-indigo-300" />
                      <span className="font-semibold text-slate-200">{stream.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {(stream.sizeBytes / (1024 * 1024)).toFixed(0)} MB
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Video Player Controls Bar */}
        <div className="relative z-10 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 text-slate-400">
              <Volume2 className="w-4 h-4" />
              <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-indigo-500" />
              </div>
            </div>
            <span className="font-mono text-[11px] text-slate-400">01:42 / 04:15</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
              YouTube 4K Stream Detected
            </span>
            <Maximize className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
