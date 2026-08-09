import React, { useState } from 'react';
import { DownloadTask } from '../types/idm';
import {
  Download,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Folder,
  CheckCircle2,
  AlertCircle,
  Search,
  ListFilter,
  ArrowUpDown,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface Props {
  tasks: DownloadTask[];
  selectedTaskId: string;
  onSelectTask: (id: string) => void;
  onPauseTask: (id: string) => void;
  onResumeTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenAddModal: () => void;
  onClearCompleted?: () => void;
  onSaveToDisk?: (task: DownloadTask, forcePicker: boolean) => void;
}

export const DownloadList: React.FC<Props> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onPauseTask,
  onResumeTask,
  onDeleteTask,
  onOpenAddModal,
  onClearCompleted,
  onSaveToDisk,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Downloading' | 'Paused' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesQuery =
      t.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatEta = (seconds: number) => {
    if (seconds <= 0) return '0s';
    if (seconds > 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    if (seconds > 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const activeCount = tasks.filter((t) => t.status === 'Downloading').length;
  const pausedCount = tasks.filter((t) => t.status === 'Paused').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl text-slate-100">
      {/* List Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'All'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>All Tasks</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {tasks.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Downloading')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'Downloading'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Downloading</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Paused')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'Paused'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>Paused</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {pausedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'Completed'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>Completed</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search downloads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Add URL
          </button>
        </div>
      </div>

      {/* Task List Table View */}
      <div className="mt-4 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            <Download className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="font-semibold text-slate-400">No downloads matching criteria</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Click "Add URL" to start a new download</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isSelected = task.id === selectedTaskId;
            const percentRaw = task.totalSize > 0 ? (task.downloadedBytes / task.totalSize) * 100 : 0;
            const percent = Math.min(100, percentRaw);
            const percentFormatted = Math.min(100, percentRaw).toFixed(2);

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 border-indigo-500 shadow-xl ring-1 ring-indigo-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                {/* Header row: File Info & Quick Control Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-100 truncate flex items-center gap-2">
                        <span>{task.filename}</span>
                        <span className="text-[10px] font-mono font-medium text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                          {task.threadsCount} Threads
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate max-w-xl mt-0.5 flex items-center gap-1.5">
                        <span className="text-slate-500">{task.savePath}</span>
                        <span>•</span>
                        <span className="text-slate-400 truncate">{task.url}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.status === 'Downloading' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPauseTask(task.id);
                        }}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/40 flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </button>
                    ) : task.status === 'Paused' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onResumeTask(task.id);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Resume
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSaveToDisk) onSaveToDisk(task, true);
                          }}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg border border-indigo-400/30 flex items-center gap-1.5 transition-all shadow-sm"
                          title="Select a custom folder on your computer to save this file"
                        >
                          <Folder className="w-3.5 h-3.5 text-indigo-200" />
                          <span>Choose Folder & Save</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSaveToDisk) onSaveToDisk(task, false);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-sm"
                          title="Save directly to Downloads folder"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Save to Downloads</span>
                        </button>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                      title="Remove task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full transition-all duration-300 relative ${
                        task.status === 'Completed'
                          ? 'bg-emerald-500'
                          : task.status === 'Paused'
                          ? 'bg-amber-500/80'
                          : 'bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    >
                      {task.status === 'Downloading' && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Metrics Footer */}
                  <div className="flex flex-wrap justify-between items-center text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-200 font-bold">
                        {formatBytes(task.downloadedBytes)} / {formatBytes(task.totalSize)} ({percentFormatted}%)
                      </span>
                      {isSelected && (
                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-sans font-medium">
                          Active Selection
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {task.status === 'Downloading' && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          {task.currentSpeedBps / (1024 * 1024) >= 1
                            ? `${(task.currentSpeedBps / (1024 * 1024)).toFixed(2)} MB/s`
                            : `${(task.currentSpeedBps / 1024).toFixed(2)} KB/s`}
                        </span>
                      )}
                      <span>ETA: {formatEta(task.etaSeconds)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

