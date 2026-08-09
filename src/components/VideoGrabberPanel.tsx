import React, { useState, useRef } from 'react';
import { Download, Play, Pause, Film, Tv, Check, Sparkles, Volume2, Maximize, ShieldCheck, ChevronDown, CheckCircle2 } from 'lucide-react';

interface Props {
  onAddVideoDownload: (url: string, filename: string, quality: string, sizeBytes: number) => void;
}

export const VideoGrabberPanel: React.FC<Props> = ({ onAddVideoDownload }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoStreams = [
    { label: '4K 2160p Ultra HD (.mp4)', quality: '4K', sizeBytes: 1932735283, filename: 'BigBuckBunny_4K_2160p.mp4' },
    { label: '1080p60 Full HD (.mp4)', quality: '1080p', sizeBytes: 471859200, filename: 'BigBuckBunny_1080p60.mp4' },
    { label: '720p HD (.mp4)', quality: '720p', sizeBytes: 230686720, filename: 'BigBuckBunny_720p.mp4' },
    { label: '480p SD (.mp4)', quality: '480p', sizeBytes: 115343360, filename: 'BigBuckBunny_480p.mp4' },
    { label: '360p Low Bandwidth (.mp4)', quality: '360p', sizeBytes: 45000000, filename: 'BigBuckBunny_360p.mp4' },
    { label: 'Audio Only (.mp3 320kbps)', quality: 'Audio', sizeBytes: 12582912, filename: 'BigBuckBunny_Audio_320k.mp3' },
  ];

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = (stream: typeof videoStreams[0]) => {
    onAddVideoDownload(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      stream.filename,
      stream.quality,
      stream.sizeBytes
    );
    setDownloadedFormat(stream.label);
    setIsDropdownOpen(false);
    setTimeout(() => setDownloadedFormat(null), 4000);
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
              <span>Automatic Video Sniffer & Floating Download Overlay</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE VIDEO DETECTION ACTIVE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              When playing videos, IDM pops up a floating button over the video player displaying all available qualities and file sizes.
            </p>
          </div>
        </div>

        {downloadedFormat && (
          <div className="flex items-center gap-2 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg animate-fade-in shadow-lg">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Queued {downloadedFormat} in IDM Real Downloader!</span>
          </div>
        )}
      </div>

      {/* Interactive Video Player Canvas */}
      <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group shadow-2xl flex flex-col justify-between p-3 sm:p-4">
        {/* Real HTML5 Sample Video Element */}
        <video
          ref={videoRef}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Video Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none" />

        {/* --- IDM FLOATING "DOWNLOAD THIS VIDEO" AUTOMATIC POPUP --- */}
        <div className="relative z-20 self-end">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-2xl flex items-center gap-2 border border-white/30 transition-all transform active:scale-95 animate-bounce"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download this video</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* IDM Sniffed Resolutions & Sizes Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-2.5 z-30 space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between mb-1">
                  <span>Detected Stream Resolutions</span>
                  <span className="text-emerald-400 font-semibold">IDM Sniffer v2.5</span>
                </div>

                {videoStreams.map((stream) => (
                  <button
                    key={stream.quality}
                    onClick={() => handleDownload(stream)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-indigo-600/30 hover:border-indigo-500/40 border border-transparent flex items-center justify-between transition-all group/item"
                  >
                    <div className="flex items-center gap-2.5">
                      <Film className="w-4 h-4 text-indigo-400 group-hover/item:text-indigo-300 shrink-0" />
                      <span className="font-semibold text-slate-100">{stream.label}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                      {(stream.sizeBytes / (1024 * 1024)).toFixed(0)} MB
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Video Player Bottom Controls Bar */}
        <div className="relative z-10 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 text-slate-400">
              <Volume2 className="w-4 h-4 text-slate-300" />
              <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-indigo-500" />
              </div>
            </div>
            <span className="font-mono text-[11px] text-slate-400">00:15 / 09:56</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>4K Media Stream Captured</span>
            </span>
            <Maximize className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
