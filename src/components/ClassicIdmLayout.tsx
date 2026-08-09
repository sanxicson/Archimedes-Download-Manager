import React, { useState } from 'react';
import { DownloadTask } from '../types/idm';
import {
  Download,
  Play,
  Pause,
  Trash2,
  Plus,
  Settings,
  Clock,
  Globe,
  Folder,
  FileArchive,
  FileText,
  Music,
  Video,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Minimize2,
  Maximize2,
  X,
  Search,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';

interface Props {
  tasks: DownloadTask[];
  selectedTaskId: string;
  onSelectTask: (id: string) => void;
  onPauseTask: (id: string) => void;
  onResumeTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenAddModal: () => void;
  onStopAll: () => void;
  onResumeAll: () => void;
  totalSpeedBps: number;
  speedLimitKbps: number;
  onToggleSpeedLimitModal: () => void;
  onInstallExtensionClick: () => void;
  onOpenUiSelector: () => void;
}

export const ClassicIdmLayout: React.FC<Props> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onPauseTask,
  onResumeTask,
  onDeleteTask,
  onOpenAddModal,
  onStopAll,
  onResumeAll,
  totalSpeedBps,
  speedLimitKbps,
  onToggleSpeedLimitModal,
  onInstallExtensionClick,
  onOpenUiSelector,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<'tasks' | 'file' | 'downloads' | 'options' | 'extension' | null>(null);

  const categories = [
    { name: 'All Downloads', icon: Folder, key: 'All' },
    { name: 'Unfinished', icon: Clock, key: 'Unfinished' },
    { name: 'Finished', icon: CheckCircle2, key: 'Finished' },
    { name: 'Compressed', icon: FileArchive, key: 'Compressed' },
    { name: 'Documents', icon: FileText, key: 'Documents' },
    { name: 'Music', icon: Music, key: 'Music' },
    { name: 'Programs', icon: Monitor, key: 'Programs' },
    { name: 'Video', icon: Video, key: 'Video' },
  ];

  const filteredTasks = tasks.filter((t) => {
    let matchesCategory = true;
    if (selectedCategory === 'Unfinished') matchesCategory = t.status === 'Downloading' || t.status === 'Paused';
    else if (selectedCategory === 'Finished') matchesCategory = t.status === 'Completed';
    else if (selectedCategory === 'Video') matchesCategory = t.filename.endsWith('.mp4') || t.category === 'Video';

    const matchesSearch =
      t.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.url.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bps: number) => {
    if (bps <= 0) return '0 KB/s';
    const kbps = bps / 1024;
    if (kbps > 1024) return `${(kbps / 1024).toFixed(2)} MB/s`;
    return `${kbps.toFixed(0)} KB/s`;
  };

  const formatEta = (seconds: number) => {
    if (seconds <= 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl text-slate-100 flex flex-col font-sans">
      {/* --- IDM CLASSIC TITLE BAR --- */}
      <div className="bg-slate-950 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded text-white shadow-sm">
            <Download className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-white tracking-wide">
            Internet Download Manager 6.42 Pro
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
            v2.5 Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUiSelector}
            className="px-2.5 py-0.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 font-bold rounded text-[11px] flex items-center gap-1 transition-all"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>UI Options</span>
          </button>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded">
              <Minimize2 className="w-3 h-3" />
            </button>
            <button className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded">
              <Maximize2 className="w-3 h-3" />
            </button>
            <button className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* --- IDM CLASSIC MENU BAR WITH WORKING DROPDOWNS --- */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-1 flex items-center gap-2 text-xs font-medium text-slate-300 select-none relative z-30">
        {/* Tasks Menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'tasks' ? null : 'tasks')}
            className={`px-2 py-1 hover:bg-slate-800 hover:text-white rounded transition-all ${
              openMenu === 'tasks' ? 'bg-indigo-600/30 text-white font-bold' : ''
            }`}
          >
            Tasks
          </button>
          {openMenu === 'tasks' && (
            <div className="absolute left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1 z-50 space-y-0.5 text-xs">
              <button
                onClick={() => {
                  onOpenAddModal();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-600/30 hover:text-white rounded flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add New Download...</span>
              </button>
              <button
                onClick={() => {
                  onResumeAll();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-emerald-600/30 hover:text-white rounded flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resume All Tasks</span>
              </button>
              <button
                onClick={() => {
                  onStopAll();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-amber-600/30 hover:text-white rounded flex items-center gap-2"
              >
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Stop All Tasks</span>
              </button>
              {selectedTaskId && (
                <button
                  onClick={() => {
                    onDeleteTask(selectedTaskId);
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-600/30 hover:text-rose-300 rounded flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Selected Task</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* File Menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
            className={`px-2 py-1 hover:bg-slate-800 hover:text-white rounded transition-all ${
              openMenu === 'file' ? 'bg-indigo-600/30 text-white font-bold' : ''
            }`}
          >
            File
          </button>
          {openMenu === 'file' && (
            <div className="absolute left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1 z-50 space-y-0.5 text-xs">
              <button
                onClick={() => {
                  onOpenAddModal();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-600/30 hover:text-white rounded flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add URL Batch...</span>
              </button>
              <button
                onClick={() => {
                  onInstallExtensionClick();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-600/30 hover:text-white rounded flex items-center gap-2"
              >
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span>Browser Integration</span>
              </button>
            </div>
          )}
        </div>

        {/* Downloads Menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'downloads' ? null : 'downloads')}
            className={`px-2 py-1 hover:bg-slate-800 hover:text-white rounded transition-all ${
              openMenu === 'downloads' ? 'bg-indigo-600/30 text-white font-bold' : ''
            }`}
          >
            Downloads
          </button>
          {openMenu === 'downloads' && (
            <div className="absolute left-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1 z-50 space-y-0.5 text-xs">
              <button
                onClick={() => {
                  if (selectedTaskId) onResumeTask(selectedTaskId);
                  setOpenMenu(null);
                }}
                disabled={!selectedTaskId}
                className="w-full text-left px-3 py-1.5 hover:bg-emerald-600/30 hover:text-white rounded flex items-center gap-2 disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Start / Resume Download</span>
              </button>
              <button
                onClick={() => {
                  if (selectedTaskId) onPauseTask(selectedTaskId);
                  setOpenMenu(null);
                }}
                disabled={!selectedTaskId}
                className="w-full text-left px-3 py-1.5 hover:bg-amber-600/30 hover:text-white rounded flex items-center gap-2 disabled:opacity-40"
              >
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause Download</span>
              </button>
              <button
                onClick={() => {
                  onToggleSpeedLimitModal();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-600/30 hover:text-white rounded flex items-center gap-2"
              >
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Speed Limiter Config</span>
              </button>
            </div>
          )}
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'options' ? null : 'options')}
            className={`px-2 py-1 hover:bg-slate-800 hover:text-white rounded transition-all ${
              openMenu === 'options' ? 'bg-indigo-600/30 text-white font-bold' : ''
            }`}
          >
            Options
          </button>
          {openMenu === 'options' && (
            <div className="absolute left-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1 z-50 space-y-0.5 text-xs">
              <button
                onClick={() => {
                  onToggleSpeedLimitModal();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-600/30 hover:text-white rounded flex items-center gap-2"
              >
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Speed Limiter & Connection</span>
              </button>
              <button
                onClick={() => {
                  onOpenUiSelector();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-600/30 hover:text-white rounded flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>UI Themes & Options</span>
              </button>
            </div>
          )}
        </div>

        {/* Extension Menu */}
        <div className="relative">
          <button
            onClick={() => {
              onInstallExtensionClick();
              setOpenMenu(null);
            }}
            className="px-2 py-1 hover:bg-slate-800 hover:text-white rounded transition-all text-orange-400 font-bold flex items-center gap-1"
          >
            <Globe className="w-3 h-3 text-orange-400" />
            <span>Extension</span>
          </button>
        </div>
      </div>

      {/* --- IDM CLASSIC ICON TOOLBAR --- */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-2 flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center px-3 py-1.5 bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700/60 rounded-lg text-slate-200 transition-all group shrink-0"
        >
          <Plus className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold mt-0.5">Add URL</span>
        </button>

        <button
          onClick={onResumeAll}
          className="flex flex-col items-center justify-center px-3 py-1.5 bg-slate-800/80 hover:bg-emerald-600/30 hover:border-emerald-500/50 border border-slate-700/60 rounded-lg text-slate-200 transition-all group shrink-0"
        >
          <Play className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold mt-0.5">Resume</span>
        </button>

        <button
          onClick={onStopAll}
          className="flex flex-col items-center justify-center px-3 py-1.5 bg-slate-800/80 hover:bg-amber-600/30 hover:border-amber-500/50 border border-slate-700/60 rounded-lg text-slate-200 transition-all group shrink-0"
        >
          <Pause className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold mt-0.5">Stop</span>
        </button>

        <button
          onClick={() => selectedTaskId && onDeleteTask(selectedTaskId)}
          disabled={!selectedTaskId}
          className="flex flex-col items-center justify-center px-3 py-1.5 bg-slate-800/80 hover:bg-rose-600/30 hover:border-rose-500/50 border border-slate-700/60 rounded-lg text-slate-200 transition-all group disabled:opacity-40 shrink-0"
        >
          <Trash2 className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold mt-0.5">Delete</span>
        </button>

        <div className="h-8 w-[1px] bg-slate-800 mx-1" />

        <button
          onClick={onToggleSpeedLimitModal}
          className="flex flex-col items-center justify-center px-3 py-1.5 bg-slate-800/80 hover:bg-sky-600/30 hover:border-sky-500/50 border border-slate-700/60 rounded-lg text-slate-200 transition-all group shrink-0"
        >
          <Sliders className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold mt-0.5">Options</span>
        </button>

        <button
          onClick={onInstallExtensionClick}
          className="flex flex-col items-center justify-center px-3 py-1.5 bg-slate-800/80 hover:bg-orange-600/30 hover:border-orange-500/50 border border-slate-700/60 rounded-lg text-slate-200 transition-all group shrink-0"
        >
          <Globe className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold mt-0.5">Extension</span>
        </button>

        {/* Right Search Input */}
        <div className="ml-auto relative w-44 sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* --- MAIN SPLIT WORKSPACE --- */}
      <div className="grid grid-cols-1 md:grid-cols-5 min-h-[360px]">
        {/* Left Categories Tree Sidebar */}
        <div className="md:col-span-1 bg-slate-950/70 border-r border-slate-800 p-2.5 space-y-1 text-xs">
          <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
            Categories
          </div>

          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-indigo-600/30 text-white border border-indigo-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate">{cat.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Main Downloads Grid Table */}
        <div className="md:col-span-4 bg-slate-900 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-semibold text-slate-400 select-none">
                <th className="py-2 px-3">File Name</th>
                <th className="py-2 px-2 text-center">Q</th>
                <th className="py-2 px-3">Size</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Time Left</th>
                <th className="py-2 px-3">Transfer Rate</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No download tasks in this category
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isSelected = task.id === selectedTaskId;
                  const percent = Math.min(100, Math.round((task.downloadedBytes / task.totalSize) * 100));

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500/50 text-white font-medium'
                          : 'hover:bg-slate-950/50 text-slate-300'
                      }`}
                    >
                      {/* File Name */}
                      <td className="py-2.5 px-3 max-w-xs truncate font-sans font-semibold">
                        <div className="flex items-center gap-2">
                          <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{task.filename}</span>
                        </div>
                      </td>

                      {/* Q / Threads */}
                      <td className="py-2.5 px-2 text-center font-mono text-[10px] text-slate-400">
                        {task.threadsCount}T
                      </td>

                      {/* Size */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-300">
                        {formatBytes(task.totalSize)}
                      </td>

                      {/* Status + Progress Mini Bar */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1 w-28">
                          <div className="flex items-center justify-between text-[10px]">
                            <span
                              className={
                                task.status === 'Downloading'
                                  ? 'text-emerald-400 font-bold'
                                  : task.status === 'Completed'
                                  ? 'text-sky-400 font-bold'
                                  : 'text-amber-400'
                              }
                            >
                              {task.status}
                            </span>
                            <span className="text-slate-400">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full transition-all duration-300 ${
                                task.status === 'Completed'
                                  ? 'bg-sky-500'
                                  : task.status === 'Downloading'
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Time Left */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                        {task.status === 'Completed' ? 'Finished' : formatEta(task.etaSeconds)}
                      </td>

                      {/* Transfer Rate */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-bold text-emerald-400">
                        {task.status === 'Downloading' ? formatSpeed(task.currentSpeedBps) : '0 KB/s'}
                      </td>

                      {/* Quick Action Buttons */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {task.status === 'Downloading' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPauseTask(task.id);
                              }}
                              className="p-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 rounded"
                            >
                              <Pause className="w-3 h-3" />
                            </button>
                          ) : task.status === 'Paused' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onResumeTask(task.id);
                              }}
                              className="p-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 rounded"
                            >
                              <Play className="w-3 h-3" />
                            </button>
                          ) : null}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task.id);
                            }}
                            className="p-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- IDM BOTTOM STATUS BAR --- */}
      <div className="bg-slate-950 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-4">
          <span>Active Tasks: <strong className="text-white font-mono">{tasks.filter((t) => t.status === 'Downloading').length}</strong></span>
          <span>Speed Limit: <strong className="text-indigo-400 font-mono">{speedLimitKbps === 0 ? 'Off' : `${speedLimitKbps} KB/s`}</strong></span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-emerald-400 font-bold">Total Transfer Rate: {formatSpeed(totalSpeedBps)}</span>
        </div>
      </div>
    </div>
  );
};
