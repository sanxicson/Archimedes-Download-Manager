import React from 'react';
import { Layout, Monitor, Sparkles, Check, X, Shield, Smartphone, SlidersHorizontal, Moon, Sun, Layers } from 'lucide-react';

export type UiStyleOption = 'classic' | 'compact' | 'win11' | 'pro-dark';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: UiStyleOption;
  onSelectStyle: (style: UiStyleOption) => void;
  isCompactWindow: boolean;
  onToggleCompactWindow: (compact: boolean) => void;
}

export const UiStyleSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle,
  isCompactWindow,
  onToggleCompactWindow,
}) => {
  if (!isOpen) return null;

  const styles = [
    {
      id: 'classic' as UiStyleOption,
      title: 'Classic IDM Desktop (Windows 11)',
      badge: 'MOST AUTHENTIC',
      description: 'Original IDM desktop menu bar, 3D icon toolbar, categories sidebar & compact downloads table.',
      previewBg: 'from-blue-900/40 via-slate-900 to-slate-950',
      iconColor: 'text-sky-400',
    },
    {
      id: 'compact' as UiStyleOption,
      title: 'Compact Mini IDM Window',
      badge: 'SMALL WINDOW',
      description: 'Ultra-small, lightweight floating app window focused strictly on speed and active downloads list.',
      previewBg: 'from-emerald-900/40 via-slate-900 to-slate-950',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'win11' as UiStyleOption,
      title: 'Fluent Light Windows 11',
      badge: 'CLEAN LIGHT',
      description: 'Modern Windows 11 light acrylic styling with soft borders and classic IDM blue accents.',
      previewBg: 'from-slate-200 via-slate-100 to-white text-slate-900',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'pro-dark' as UiStyleOption,
      title: 'Pro Dark Cyber IDM',
      badge: 'HIGH DENSITY',
      description: 'Dark multi-panel dashboard including dynamic segment thread visualizers and bandwidth graphs.',
      previewBg: 'from-purple-900/40 via-slate-900 to-slate-950',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-slate-100 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <span>Choose IDM Interface Style</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                4 UI OPTIONS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Select your preferred layout option or switch to a small compact desktop window size.
            </p>
          </div>
        </div>

        {/* Small Window Size Toggle */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Small Compact Window Mode</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                  RECOMMENDED
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Restricts UI width to a small floating IDM app window (like real IDM on Windows)
              </div>
            </div>
          </div>

          <button
            onClick={() => onToggleCompactWindow(!isCompactWindow)}
            className={`w-12 h-6 rounded-full transition-colors p-1 relative flex items-center ${
              isCompactWindow ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isCompactWindow ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Options List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {styles.map((style) => {
            const isSelected = currentStyle === style.id;
            return (
              <div
                key={style.id}
                onClick={() => onSelectStyle(style.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-950 border-indigo-500 shadow-xl ring-2 ring-indigo-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>{style.title}</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {style.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {style.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className={`text-xs font-bold ${style.iconColor}`}>Preview Layout</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
          >
            Apply Layout
          </button>
        </div>
      </div>
    </div>
  );
};
