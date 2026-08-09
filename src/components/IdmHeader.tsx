import React from 'react';
import {
  Download,
  Play,
  Pause,
  Gauge,
  Plus,
  Sliders,
  Globe
} from 'lucide-react';

interface Props {
  onAddUrlClick: () => void;
  onStopAll: () => void;
  onResumeAll: () => void;
  onClearCompleted?: () => void;
  activeCount: number;
  totalSpeedBps: number;
  globalSpeedLimitKbps: number;
  onToggleSpeedLimitModal: () => void;
  onInstallExtensionClick: () => void;
}

export const IdmHeader: React.FC<Props> = ({
  onAddUrlClick,
  onStopAll,
  onResumeAll,
  onClearCompleted,
  activeCount,
  totalSpeedBps,
  globalSpeedLimitKbps,
  onToggleSpeedLimitModal,
  onInstallExtensionClick,
}) => {
  const formatSpeed = (bps: number) => {
    if (bps <= 0) return '0.00 KB/s';
    const kbps = bps / 1024;
    if (kbps >= 1024) return `${(kbps / 1024).toFixed(2)} MB/s`;
    return `${kbps.toFixed(2)} KB/s`;
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Top Banner & Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Download className="w-5 h-5 text-indigo-400 animate-bounce" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight">
                Archimedes Download Manager
              </h1>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                v0.62
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-threaded Dynamic Segment Accelerating Engine
            </p>
          </div>
        </div>

        {/* Global Live Transfer Rate Indicator */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Speed</div>
              <div className="font-mono font-bold text-emerald-400 text-sm">{formatSpeed(totalSpeedBps)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Downloads</div>
              <div className="font-mono font-bold text-indigo-400 text-sm">{activeCount} tasks</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={onAddUrlClick}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add URL
          </button>

          <button
            onClick={onResumeAll}
            className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            Resume
          </button>

          <button
            onClick={onStopAll}
            className="px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause/Stop
          </button>

          <button
            onClick={onToggleSpeedLimitModal}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all shrink-0 ${
              globalSpeedLimitKbps > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Speed Limit: {globalSpeedLimitKbps === 0 ? 'Off' : `${globalSpeedLimitKbps} KB/s`}</span>
          </button>

          <button
            onClick={onInstallExtensionClick}
            className="px-3 py-2 bg-gradient-to-r from-orange-500 to-indigo-600 hover:brightness-110 text-white text-xs font-extrabold rounded-lg shadow-md flex items-center gap-1.5 transition-all shrink-0 active:scale-95 border border-orange-400/30"
          >
            <Globe className="w-3.5 h-3.5 text-orange-200" />
            <span>Install Extension (1-Click)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
