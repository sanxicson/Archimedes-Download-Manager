import React from 'react';
import { ColorTheme, getModalThemeClasses } from '../utils/modalTheme';
import { Layout, Monitor, Sparkles, Check, X, Shield, Smartphone, SlidersHorizontal, Moon, Sun, Layers } from 'lucide-react';

export type UiStyleOption = 'classic' | 'compact' | 'win11' | 'pro-dark';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: UiStyleOption;
  onSelectStyle: (style: UiStyleOption) => void;
  isCompactWindow: boolean;
  onToggleCompactWindow: (compact: boolean) => void;
  colorTheme?: ColorTheme;
  onChangeColorTheme?: (theme: ColorTheme) => void;
}

export const UiStyleSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle,
  isCompactWindow,
  onToggleCompactWindow,
  colorTheme = 'light',
  onChangeColorTheme,
}) => {
  if (!isOpen) return null;

  const theme = getModalThemeClasses(colorTheme);

  const styles = [
    {
      id: 'classic' as UiStyleOption,
      title: 'Classic Archimedes Desktop (Windows 11)',
      badge: 'MOST AUTHENTIC',
      description: 'Original Archimedes Download Manager desktop menu bar, 3D icon toolbar, categories sidebar & compact downloads table.',
      previewBg: 'from-blue-900/40 via-slate-900 to-slate-950',
      iconColor: 'text-sky-400',
    },
    {
      id: 'compact' as UiStyleOption,
      title: 'Compact Mini Archimedes Window',
      badge: 'SMALL WINDOW',
      description: 'Ultra-small, lightweight floating app window focused strictly on speed and active downloads list.',
      previewBg: 'from-emerald-900/40 via-slate-900 to-slate-950',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'win11' as UiStyleOption,
      title: 'Fluent Light Windows 11',
      badge: 'CLEAN LIGHT',
      description: 'Modern Windows 11 light acrylic styling with soft borders and classic Archimedes Download Manager blue accents.',
      previewBg: 'from-slate-200 via-slate-100 to-white text-slate-900',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'pro-dark' as UiStyleOption,
      title: 'Pro Dark Cyber Archimedes',
      badge: 'HIGH DENSITY',
      description: 'Dark multi-panel dashboard including dynamic segment thread visualizers and bandwidth graphs.',
      previewBg: 'from-purple-900/40 via-slate-900 to-slate-950',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 animate-fadeIn ${theme.backdrop}`}>
      <div
        className={`rounded-2xl w-[33vw] min-w-[320px] max-w-[95vw] min-h-[280px] max-h-[85vh] p-3.5 shadow-2xl relative flex flex-col justify-between ${theme.window}`}
        style={{ resize: 'both', overflow: 'auto' }}
      >
        <button
          onClick={onClose}
          className={`absolute top-3.5 right-3.5 z-10 p-1.5 rounded-lg transition-all ${theme.closeBtn}`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`flex items-center gap-3 mb-4 pb-3 border-b pr-10 ${theme.header}`}>
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-500 shrink-0">
            <Layout className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`font-extrabold text-xs sm:text-sm flex items-center gap-2 truncate ${theme.headerTitle}`}>
              <span>Choose IDM Interface Style</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 shrink-0">
                4 UI OPTIONS
              </span>
            </h3>
            <p className={`text-[11px] leading-tight truncate mt-0.5 ${theme.textMuted}`}>
              Select your preferred layout option or switch to a small compact desktop window size.
            </p>
          </div>
        </div>

        {/* Small Window Size Toggle */}
        <div className={`border rounded-xl p-3.5 mb-4 flex items-center justify-between ${theme.card}`}>
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className={`text-xs font-bold flex items-center gap-2 ${theme.textPrimary}`}>
                <span>Small Compact Window Mode</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                  RECOMMENDED
                </span>
              </div>
              <div className={`text-[11px] ${theme.textMuted}`}>
                Restricts UI width to a small floating IDM app window (like real IDM on Windows)
              </div>
            </div>
          </div>

          <button
            onClick={() => onToggleCompactWindow(!isCompactWindow)}
            className={`w-12 h-6 rounded-full transition-colors p-1 relative flex items-center ${
              isCompactWindow ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isCompactWindow ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Color Palette Theme Selection */}
        {onChangeColorTheme && (
          <div className={`border rounded-xl p-3 mb-5 ${theme.card}`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className={`text-xs font-bold ${theme.textPrimary}`}>Color Palette Theme:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
              {[
                { id: 'slate' as ColorTheme, name: 'Classic Slate', icon: '🌙' },
                { id: 'light' as ColorTheme, name: 'Win 11 Light', icon: '☀️' },
                { id: 'amoled' as ColorTheme, name: 'AMOLED Black', icon: '🖤' },
                { id: 'retro' as ColorTheme, name: 'Retro Win98', icon: '👾' },
                { id: 'cyber' as ColorTheme, name: 'Cyberpunk', icon: '⚡' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChangeColorTheme(t.id)}
                  className={`px-2 py-1.5 rounded-lg border text-left font-medium transition-all flex items-center gap-1.5 ${
                    colorTheme === t.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md font-bold'
                      : 'hover:border-indigo-400/50 opacity-80 hover:opacity-100'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span className="truncate text-[11px]">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
                    ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-500/50'
                    : 'hover:border-indigo-400/50'
                } ${theme.card}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`font-extrabold text-sm flex items-center gap-2 ${theme.textPrimary}`}>
                      <span>{style.title}</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                      {style.badge}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed mb-3 ${theme.textMuted}`}>
                    {style.description}
                  </p>
                </div>

                <div className={`flex items-center justify-between pt-2 border-t ${theme.borderColor}`}>
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

        <div className={`pt-2 border-t flex justify-end gap-2 relative ${theme.footer}`}>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 font-extrabold text-xs rounded-xl shadow-lg transition-all mr-2 ${theme.btnPrimary}`}
          >
            Apply Layout
          </button>
          <div className="absolute bottom-0 right-0 pointer-events-none text-slate-500 opacity-60">
            <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14ZM14 6H12V4H14V6ZM10 10H8V8H10V10ZM6 14H4V12H6V14Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
