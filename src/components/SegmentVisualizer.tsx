import React from 'react';
import { DownloadTask, DownloadSegment } from '../types/adm';
import { Cpu, Zap, Pause, Play, Split, HardDrive, ShieldCheck } from 'lucide-react';

interface Props {
  task: DownloadTask;
  onStealWork: () => void;
  onPauseWorker: (workerId: number) => void;
  onResumeWorker: (workerId: number) => void;
}

export const SegmentVisualizer: React.FC<Props> = ({
  task,
  onStealWork,
  onPauseWorker,
  onResumeWorker,
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSegmentPercent = (segment: DownloadSegment) => {
    const total = segment.endByte - segment.startByte + 1;
    if (total <= 0) return 100;
    const downloaded = segment.currentByte - segment.startByte;
    return Math.min(100, Math.max(0, (downloaded / total) * 100));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-lg text-white">
              Dynamic Segment Multiplexer & Work Stealer
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active Workers: <span className="text-indigo-300 font-mono font-bold">{task.segments.length} Threads</span> | Target: <span className="font-mono text-slate-300">{task.filename}</span> ({formatBytes(task.totalSize)})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStealWork}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition-all"
            title="Force work-stealer to scan and split the largest active segment in half"
          >
            <Split className="w-3.5 h-3.5" />
            Trigger Work Steal
          </button>
        </div>
      </div>

      {/* Visual Chunky Bar */}
      <div className="mt-5">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Overall Disk Byte Allocations (0 B &rarr; {formatBytes(task.totalSize)})</span>
          <span className="font-mono text-indigo-400 font-semibold">
            {formatBytes(task.downloadedBytes)} / {formatBytes(task.totalSize)} ({((task.downloadedBytes / task.totalSize) * 100).toFixed(2)}%)
          </span>
        </div>

        {/* Combined Segment Map */}
        <div className="h-6 w-full bg-slate-950 rounded-lg p-1 flex gap-1 border border-slate-800 overflow-hidden">
          {task.segments.map((segment) => {
            const widthPct = ((segment.endByte - segment.startByte + 1) / task.totalSize) * 100;
            const progress = calculateSegmentPercent(segment);
            return (
              <div
                key={segment.id}
                style={{ width: `${Math.max(widthPct, 2)}%` }}
                className="h-full bg-slate-800 rounded relative overflow-hidden group cursor-pointer"
                title={`Worker #${segment.workerId} | Range: ${segment.startByte}-${segment.endByte} | Progress: ${progress.toFixed(2)}%`}
              >
                <div
                  style={{ width: `${progress}%`, backgroundColor: segment.color }}
                  className="h-full transition-all duration-300 relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Worker Thread Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {task.segments.map((segment) => {
          const progress = calculateSegmentPercent(segment);
          const segmentSize = segment.endByte - segment.startByte + 1;
          const isFinished = progress >= 100;

          return (
            <div
              key={segment.id}
              className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    Worker #{segment.workerId}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {segment.status === 'downloading' ? (
                    <button
                      onClick={() => onPauseWorker(segment.workerId)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded"
                      title="Simulate slow worker pipe to test work stealing"
                    >
                      <Pause className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onResumeWorker(segment.workerId)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded"
                      title="Resume worker"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isFinished
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : segment.status === 'downloading'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {isFinished ? 'Done' : segment.status}
                  </span>
                </div>
              </div>

              {/* Progress & Speed */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%`, backgroundColor: segment.color }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                  <span>{progress.toFixed(2)}%</span>
                  <span className="text-indigo-300">
                    {segment.status === 'downloading'
                      ? segment.speedBytesPerSec / (1024 * 1024) >= 1
                        ? `${(segment.speedBytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`
                        : `${(segment.speedBytesPerSec / 1024).toFixed(2)} KB/s`
                      : '0.00 KB/s'}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-slate-500 truncate pt-1 border-t border-slate-900">
                  Range: [{segment.startByte.toLocaleString()} &rarr; {segment.endByte.toLocaleString()}]
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Non-blocking Async Disk Seek & Writer (mmap / tokio::fs::OpenOptions)</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Accept-Ranges: bytes Verified</span>
        </div>
      </div>
    </div>
  );
};