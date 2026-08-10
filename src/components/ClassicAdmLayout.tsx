import React, { useState } from 'react';
import { APP_VERSION_SHORT } from '../version';
import { DownloadTask } from '../types/adm';
import { ColorTheme } from '../utils/modalTheme';
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
  selectedTaskId: string | null;
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
  colorTheme?: ColorTheme;
  onChangeColorTheme?: (theme: ColorTheme) => void;
}

export const ClassicAdmLayout: React.FC<Props> = ({
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
  colorTheme: externalColorTheme,
  onChangeColorTheme,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<'tasks' | 'file' | 'downloads' | 'options' | 'extension' | 'themes' | null>(null);
  const [internalColorTheme, setInternalColorTheme] = useState<ColorTheme>('light');

  const colorTheme = externalColorTheme || internalColorTheme;
  const setColorTheme = (theme: ColorTheme) => {
    if (onChangeColorTheme) {
      onChangeColorTheme(theme);
    } else {
      setInternalColorTheme(theme);
    }
  };

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
    const cat = selectedCategory;
    const filename = t.filename.toLowerCase();

    if (cat === 'Unfinished') {
      matchesCategory = t.status === 'Downloading' || t.status === 'Paused';
    } else if (cat === 'Finished') {
      matchesCategory = t.status === 'Completed';
    } else if (cat === 'Compressed') {
      matchesCategory =
        t.category === 'Compressed' ||
        /\.(zip|rar|7z|tar|gz|bz2|iso|cab|arj|xz|z)$/i.test(filename);
    } else if (cat === 'Documents') {
      matchesCategory =
        t.category === 'Documents' ||
        /\.(pdf|doc|docx|txt|xls|xlsx|ppt|pptx|odt|rtf|epub|csv|log)$/i.test(filename);
    } else if (cat === 'Music') {
      matchesCategory =
        t.category === 'Music' ||
        /\.(mp3|wav|flac|aac|ogg|m4a|wma|aiff|alac)$/i.test(filename);
    } else if (cat === 'Programs') {
      matchesCategory =
        t.category === 'Programs' ||
        /\.(exe|msi|dmg|pkg|deb|rpm|apk|appimage|bat|cmd|sh)$/i.test(filename);
    } else if (cat === 'Video') {
      matchesCategory =
        t.category === 'Video' ||
        /\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v|3gp)$/i.test(filename);
    }

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
    if (bps <= 0) return '0.00 KB/s';
    const kbps = bps / 1024;
    if (kbps >= 1024) return `${(kbps / 1024).toFixed(2)} MB/s`;
    return `${kbps.toFixed(2)} KB/s`;
  };

  const formatEta = (seconds: number) => {
    if (seconds <= 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const isTaskSelected = Boolean(selectedTask);
  const canResume = isTaskSelected && (selectedTask?.status === 'Paused' || selectedTask?.status === 'Error');
  const canPause = isTaskSelected && selectedTask?.status === 'Downloading';
  const canDelete = isTaskSelected;

  // Dynamic Theme Styling
  const themeClasses = {
    slate: {
      wrapper: "bg-slate-900 border-slate-700/80 text-slate-100",
      titlebar: "bg-slate-950 border-slate-800 text-slate-300",
      menubar: "bg-slate-900 border-slate-800 text-slate-300",
      toolbar: "bg-slate-900/90 border-slate-800",
      sidebar: "bg-slate-950/70 border-slate-800 text-slate-400",
      sidebarActive: "bg-indigo-600/30 text-white border border-indigo-500/40 font-bold",
      sidebarInactive: "text-slate-300 hover:text-white hover:bg-slate-800/50",
      dropdown: "bg-slate-900 text-slate-100 border-slate-700 shadow-2xl",
      dropdownItem: "hover:bg-indigo-600/30 hover:text-white",
      tableHeader: "bg-slate-950/90 border-slate-800 text-slate-400",
      tableRow: "hover:bg-slate-800/60 border-slate-800/60",
      tableSelected: "bg-indigo-950/80 border-indigo-500/50 text-white",
      statusbar: "bg-slate-950 border-slate-800 text-slate-400",
      input: "bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500",
      badge: "bg-slate-800 text-slate-400 border border-slate-700/50",
      button: "bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 border-slate-700/60 text-slate-200",
      titleBtn: "bg-indigo-600/30 hover:bg-indigo-600/50 border-indigo-500/40 text-indigo-300",
    },
    light: {
      wrapper: "bg-slate-100 border-slate-300 text-slate-800 shadow-2xl ring-1 ring-slate-300",
      titlebar: "bg-slate-200 border-slate-300 text-slate-800 font-semibold",
      menubar: "bg-slate-100 border-slate-300 text-slate-700 font-medium",
      toolbar: "bg-slate-50 border-slate-300",
      sidebar: "bg-white border-slate-300 text-slate-600",
      sidebarActive: "bg-indigo-600 text-white border border-indigo-700 font-bold shadow-sm",
      sidebarInactive: "text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium",
      dropdown: "bg-white text-slate-800 border-slate-300 shadow-2xl",
      dropdownItem: "hover:bg-indigo-50 hover:text-indigo-900 font-medium",
      tableHeader: "bg-slate-200 border-slate-300 text-slate-700 font-bold",
      tableRow: "hover:bg-slate-200/80 border-slate-200 text-slate-800",
      tableSelected: "bg-indigo-100 border-indigo-400 text-indigo-950 font-semibold",
      statusbar: "bg-slate-200 border-slate-300 text-slate-600",
      input: "bg-white border-slate-300 text-slate-800 placeholder-slate-400",
      badge: "bg-slate-300 text-slate-700 border border-slate-400/50",
      button: "bg-white hover:bg-indigo-50 hover:border-indigo-400 border-slate-300 text-slate-800 shadow-sm",
      titleBtn: "bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white shadow-sm",
    },
    amoled: {
      wrapper: "bg-black border-zinc-800 text-zinc-100 shadow-2xl",
      titlebar: "bg-zinc-950 border-zinc-900 text-zinc-300",
      menubar: "bg-black border-zinc-900 text-zinc-300",
      toolbar: "bg-black border-zinc-900",
      sidebar: "bg-zinc-950 border-zinc-900 text-zinc-400",
      sidebarActive: "bg-zinc-800 text-white border border-zinc-600 font-bold",
      sidebarInactive: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900",
      dropdown: "bg-black text-zinc-100 border-zinc-800 shadow-2xl",
      dropdownItem: "hover:bg-zinc-900 hover:text-white",
      tableHeader: "bg-zinc-950 border-zinc-900 text-zinc-400",
      tableRow: "hover:bg-zinc-900/80 border-zinc-900 text-zinc-200",
      tableSelected: "bg-zinc-900 border-zinc-700 text-white font-semibold",
      statusbar: "bg-zinc-950 border-zinc-900 text-zinc-400",
      input: "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-500",
      badge: "bg-zinc-900 text-zinc-400 border border-zinc-800",
      button: "bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 border-zinc-800 text-zinc-200",
      titleBtn: "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200",
    },
    retro: {
      wrapper: "bg-slate-300 border-2 border-slate-400 text-slate-900 shadow-2xl font-sans",
      titlebar: "bg-gradient-to-r from-blue-900 to-indigo-900 border-b border-slate-400 text-white font-bold",
      menubar: "bg-slate-200 border-b border-slate-400 text-slate-900 font-bold",
      toolbar: "bg-slate-200 border-b-2 border-slate-400 p-1.5",
      sidebar: "bg-slate-100 border-r-2 border-slate-400 text-slate-800 font-medium",
      sidebarActive: "bg-blue-800 text-white border border-blue-900 font-bold",
      sidebarInactive: "text-slate-900 hover:bg-slate-200 font-bold",
      dropdown: "bg-slate-200 text-slate-900 border-2 border-slate-400 shadow-2xl font-bold",
      dropdownItem: "hover:bg-blue-800 hover:text-white",
      tableHeader: "bg-slate-300 border-b-2 border-slate-400 text-slate-900 font-bold",
      tableRow: "hover:bg-blue-100 border-slate-300 text-slate-900",
      tableSelected: "bg-blue-800 text-white font-semibold",
      statusbar: "bg-slate-300 border-t-2 border-slate-400 text-slate-800",
      input: "bg-white border-slate-400 text-slate-900 placeholder-slate-500",
      badge: "bg-blue-950 text-blue-200 border border-blue-800",
      button: "bg-slate-200 hover:bg-slate-100 border-2 border-slate-400 text-slate-900 active:translate-y-0.5",
      titleBtn: "bg-blue-800 hover:bg-blue-700 border border-slate-400 text-white",
    },
    cyber: {
      wrapper: "bg-zinc-950 border border-purple-500/50 text-purple-100 shadow-purple-900/30 shadow-2xl",
      titlebar: "bg-purple-950/80 border-purple-800 text-purple-200",
      menubar: "bg-zinc-900 border-purple-900 text-purple-300",
      toolbar: "bg-zinc-950 border-purple-900/60",
      sidebar: "bg-zinc-900/80 border-purple-900/50 text-purple-300",
      sidebarActive: "bg-purple-800 text-white border border-purple-500 font-bold shadow-purple-900/50",
      sidebarInactive: "text-purple-300 hover:text-purple-100 hover:bg-purple-950/60",
      dropdown: "bg-zinc-950 text-purple-100 border-purple-800 shadow-purple-900/40 shadow-2xl",
      dropdownItem: "hover:bg-purple-900/60 hover:text-white",
      tableHeader: "bg-purple-950/60 border-purple-800 text-purple-300",
      tableRow: "hover:bg-purple-900/40 border-purple-900/30 text-purple-100",
      tableSelected: "bg-purple-800/60 border-purple-400 text-white font-bold",
      statusbar: "bg-purple-950 border-purple-900 text-purple-300",
      input: "bg-zinc-950 border-purple-900 text-purple-200 placeholder-purple-500",
      badge: "bg-purple-900 text-purple-300 border border-purple-700",
      button: "bg-purple-950/80 hover:bg-purple-900/80 border-purple-800 text-purple-200",
      titleBtn: "bg-purple-800 hover:bg-purple-700 border-purple-600 text-purple-100",
    }
  }[colorTheme];

  return (
    <div className={`overflow-hidden flex flex-col flex-1 font-sans transition-colors ${themeClasses.wrapper}`}>
      {/* --- ADM CLASSIC TITLE BAR --- */}
      <div className={`px-3 py-2 flex items-center justify-between text-xs select-none border-b ${themeClasses.titlebar}`}>
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded text-white shadow-sm">
            <Download className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold tracking-wide">
            Archimedes Download Manager {APP_VERSION_SHORT}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/50 rounded">
              <Minimize2 className="w-3 h-3" />
            </button>
            <button className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/50 rounded">
              <Maximize2 className="w-3 h-3" />
            </button>
            <button className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* --- ADM CLASSIC MENU BAR WITH WORKING DROPDOWNS --- */}
      <div className={`px-3 py-1 flex items-center gap-1.5 text-xs font-medium select-none relative z-30 border-b ${themeClasses.menubar}`}>
        {/* Tasks Menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'tasks' ? null : 'tasks')}
            className={`px-2.5 py-1 hover:bg-slate-500/20 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              openMenu === 'tasks' ? 'bg-indigo-600/30 text-indigo-400 font-bold' : ''
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tasks</span>
          </button>
          {openMenu === 'tasks' && (
            <div className={`absolute left-0 mt-1 w-48 border rounded-lg p-1 z-50 space-y-0.5 text-xs ${themeClasses.dropdown}`}>
              <button
                onClick={() => {
                  onOpenAddModal();
                  setOpenMenu(null);
                }}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 ${themeClasses.dropdownItem}`}
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add batch download</span>
              </button>
              <button
                onClick={() => {
                  onResumeAll();
                  setOpenMenu(null);
                }}
                disabled={!tasks.some((t) => t.status === 'Paused')}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed ${themeClasses.dropdownItem}`}
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resume All Tasks</span>
              </button>
              <button
                onClick={() => {
                  onStopAll();
                  setOpenMenu(null);
                }}
                disabled={!tasks.some((t) => t.status === 'Downloading')}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed ${themeClasses.dropdownItem}`}
              >
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Stop All Tasks</span>
              </button>
              {isTaskSelected && selectedTaskId && (
                <button
                  onClick={() => {
                    onDeleteTask(selectedTaskId);
                    setOpenMenu(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 ${themeClasses.dropdownItem}`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Selected Task</span>
                </button>
              )}
            </div>
          )}
        </div>



        {/* Downloads Menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'downloads' ? null : 'downloads')}
            className={`px-2.5 py-1 hover:bg-slate-500/20 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              openMenu === 'downloads' ? 'bg-indigo-600/30 text-indigo-400 font-bold' : ''
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Downloads</span>
          </button>
          {openMenu === 'downloads' && (
            <div className={`absolute left-0 mt-1 w-52 border rounded-lg p-1 z-50 space-y-0.5 text-xs ${themeClasses.dropdown}`}>
              <button
                onClick={() => {
                  if (canResume && selectedTaskId) onResumeTask(selectedTaskId);
                  setOpenMenu(null);
                }}
                disabled={!canResume}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed ${themeClasses.dropdownItem}`}
              >
                <Play className={`w-3.5 h-3.5 ${canResume ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className={canResume ? '' : 'text-slate-500'}>Resume Download</span>
              </button>
              <button
                onClick={() => {
                  if (canPause && selectedTaskId) onPauseTask(selectedTaskId);
                  setOpenMenu(null);
                }}
                disabled={!canPause}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed ${themeClasses.dropdownItem}`}
              >
                <Pause className={`w-3.5 h-3.5 ${canPause ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className={canPause ? '' : 'text-slate-500'}>Pause / Stop Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Options Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'options' ? null : 'options')}
            className={`px-2.5 py-1 hover:bg-slate-500/20 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              openMenu === 'options' ? 'bg-indigo-600/30 text-indigo-400 font-bold' : ''
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Options</span>
          </button>
          {openMenu === 'options' && (
            <div className={`absolute left-0 mt-1 w-56 border rounded-lg p-1 z-50 space-y-0.5 text-xs ${themeClasses.dropdown}`}>
              <button
                onClick={() => {
                  onToggleSpeedLimitModal();
                  setOpenMenu(null);
                }}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 ${themeClasses.dropdownItem}`}
              >
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Archimedes Options ({APP_VERSION_SHORT})...</span>
              </button>
            </div>
          )}
        </div>

        {/* Themes Direct Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'themes' ? null : 'themes')}
            className={`px-2.5 py-1 hover:bg-slate-500/20 rounded-md transition-all font-semibold text-purple-400 flex items-center gap-1.5 ${
              openMenu === 'themes' ? 'bg-indigo-600/30 text-indigo-400 font-bold' : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Themes</span>
          </button>
          {openMenu === 'themes' && (
            <div className={`absolute left-0 mt-1 w-52 border rounded-lg p-1 z-50 space-y-0.5 text-xs ${themeClasses.dropdown}`}>
              <button
                onClick={() => { setColorTheme('slate'); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between ${themeClasses.dropdownItem} ${colorTheme === 'slate' ? 'font-bold underline' : ''}`}
              >
                <span>🌙 Classic Slate Dark</span>
              </button>
              <button
                onClick={() => { setColorTheme('light'); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between ${themeClasses.dropdownItem} ${colorTheme === 'light' ? 'font-bold underline' : ''}`}
              >
                <span>☀️ Win 11 Light Silver</span>
              </button>
              <button
                onClick={() => { setColorTheme('amoled'); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between ${themeClasses.dropdownItem} ${colorTheme === 'amoled' ? 'font-bold underline' : ''}`}
              >
                <span>🖤 AMOLED Pitch Black</span>
              </button>
              <button
                onClick={() => { setColorTheme('retro'); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between ${themeClasses.dropdownItem} ${colorTheme === 'retro' ? 'font-bold underline' : ''}`}
              >
                <span>👾 Retro Windows 98</span>
              </button>
              <button
                onClick={() => { setColorTheme('cyber'); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between ${themeClasses.dropdownItem} ${colorTheme === 'cyber' ? 'font-bold underline' : ''}`}
              >
                <span>⚡ Cyberpunk Neon</span>
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
            className="px-2.5 py-1 hover:bg-slate-500/20 rounded-md transition-all font-semibold text-orange-400 flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span>Extension</span>
          </button>
        </div>
      </div>

      {/* --- ADM CLASSIC ICON TOOLBAR --- */}
      <div className={`p-2 flex items-center gap-1.5 overflow-x-auto border-b ${themeClasses.toolbar}`}>
        <button
          onClick={onOpenAddModal}
          className={`flex flex-col items-center justify-center px-3 py-1.5 border rounded-lg transition-all group shrink-0 ${themeClasses.button}`}
          title="Add new download URL"
        >
          <Plus className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold mt-0.5">Add URL</span>
        </button>

        <button
          onClick={() => {
            if (canResume && selectedTaskId) {
              onResumeTask(selectedTaskId);
            }
          }}
          disabled={!canResume}
          className={`flex flex-col items-center justify-center px-3 py-1.5 border rounded-lg transition-all group shrink-0 ${
            canResume
              ? themeClasses.button
              : 'bg-slate-800/10 border-slate-700/20 text-slate-500 opacity-30 grayscale cursor-not-allowed pointer-events-none'
          }`}
          title={
            !isTaskSelected
              ? 'No file selected'
              : canResume
              ? 'Resume selected download'
              : 'Selected file is not paused'
          }
        >
          <Play className={`w-4 h-4 transition-transform ${canResume ? 'text-emerald-500 group-hover:scale-110' : 'text-slate-500'}`} />
          <span className={`text-[10px] font-semibold mt-0.5 ${canResume ? '' : 'text-slate-500'}`}>Resume</span>
        </button>

        <button
          onClick={() => {
            if (canPause && selectedTaskId) {
              onPauseTask(selectedTaskId);
            }
          }}
          disabled={!canPause}
          className={`flex flex-col items-center justify-center px-3 py-1.5 border rounded-lg transition-all group shrink-0 ${
            canPause
              ? themeClasses.button
              : 'bg-slate-800/10 border-slate-700/20 text-slate-500 opacity-30 grayscale cursor-not-allowed pointer-events-none'
          }`}
          title={
            !isTaskSelected
              ? 'No file selected'
              : canPause
              ? 'Pause / Stop selected download'
              : 'Selected file is not downloading'
          }
        >
          <Pause className={`w-4 h-4 transition-transform ${canPause ? 'text-amber-500 group-hover:scale-110' : 'text-slate-500'}`} />
          <span className={`text-[10px] font-semibold mt-0.5 ${canPause ? '' : 'text-slate-500'}`}>Pause/Stop</span>
        </button>

        <button
          onClick={() => canDelete && selectedTaskId && onDeleteTask(selectedTaskId)}
          disabled={!canDelete}
          className={`flex flex-col items-center justify-center px-3 py-1.5 border rounded-lg transition-all group shrink-0 ${
            canDelete
              ? themeClasses.button
              : 'bg-slate-800/10 border-slate-700/20 text-slate-500 opacity-30 grayscale cursor-not-allowed pointer-events-none'
          }`}
          title={canDelete ? 'Delete selected download' : 'Select a download to delete'}
        >
          <Trash2 className={`w-4 h-4 transition-transform ${canDelete ? 'text-rose-500 group-hover:scale-110' : 'text-slate-500'}`} />
          <span className={`text-[10px] font-semibold mt-0.5 ${canDelete ? '' : 'text-slate-500'}`}>Delete</span>
        </button>



        {/* Right Search Input */}
        <div className="ml-auto relative w-44 sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-lg pl-7 pr-2 py-1 text-xs focus:outline-none focus:border-indigo-500 border ${themeClasses.input}`}
          />
        </div>
      </div>

      {/* --- MAIN SPLIT WORKSPACE --- */}
      <div className="grid grid-cols-1 md:grid-cols-5 flex-1 overflow-hidden">
        {/* Left Categories Tree Sidebar */}
        <div className={`md:col-span-1 p-2.5 space-y-1 text-xs border-r ${themeClasses.sidebar}`}>
          <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold opacity-60 tracking-wider">
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
                    ? themeClasses.sidebarActive
                    : themeClasses.sidebarInactive
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-70'}`} />
                  <span className="truncate">{cat.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Main Downloads Grid Table */}
        <div className="md:col-span-4 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`text-[11px] font-semibold select-none border-b ${themeClasses.tableHeader}`}>
                <th className="py-2 px-3">File Name</th>
                <th className="py-2 px-2 text-center">Q</th>
                <th className="py-2 px-3">Size</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Time Left</th>
                <th className="py-2 px-3">Transfer Rate</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20 font-mono">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center opacity-50 text-xs">
                    No download tasks in this category
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isSelected = task.id === selectedTaskId;
                  const percentRaw = task.totalSize > 0 ? (task.downloadedBytes / task.totalSize) * 100 : 0;
                  const percent = Math.min(100, percentRaw);
                  const percentFormatted = Math.min(100, percentRaw).toFixed(2);

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className={`cursor-pointer transition-colors border-b ${
                        isSelected
                          ? themeClasses.tableSelected
                          : themeClasses.tableRow
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
                      <td className="py-2.5 px-2 text-center font-mono text-[10px] opacity-70">
                        {task.threadsCount}T
                      </td>

                      {/* Size */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
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
                            <span className="opacity-70">{percentFormatted}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950/60 rounded-full overflow-hidden border border-slate-700/50">
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
                      <td className="py-2.5 px-3 whitespace-nowrap opacity-70">
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

      {/* --- ADM BOTTOM STATUS BAR --- */}
      <div className={`px-3 py-1.5 flex items-center justify-between text-[11px] select-none border-t ${themeClasses.statusbar}`}>
        <div className="flex items-center gap-4">
          <span>Active Tasks: <strong className="font-mono">{tasks.filter((t) => t.status === 'Downloading').length}</strong></span>
          <span>Speed Limit: <strong className="text-indigo-400 font-mono">{speedLimitKbps === 0 ? 'Off' : `${speedLimitKbps} KB/s`}</strong></span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-emerald-400 font-bold">Total Transfer Rate: {formatSpeed(totalSpeedBps)}</span>
        </div>
      </div>
    </div>
  );
};
