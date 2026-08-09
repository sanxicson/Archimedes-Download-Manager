import React, { useState } from 'react';
import { ColorTheme, getModalThemeClasses } from '../utils/modalTheme';
import { X, Monitor, Download, Terminal, CheckCircle2, FileCode, Copy, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: ColorTheme;
}

export const ExportExeModal: React.FC<Props> = ({ isOpen, onClose, colorTheme = 'light' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const theme = getModalThemeClasses(colorTheme);

  const commands = [
    { title: '1. Export/Download project files', cmd: 'Click Settings -> Export ZIP in AI Studio top menu' },
    { title: '2. Install Electron Builder', cmd: 'npm install --save-dev electron electron-builder' },
    { title: '3. Package into Windows .exe', cmd: 'npx electron-builder --win nsis' },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 animate-fadeIn ${theme.backdrop}`}>
      <div
        className={`rounded-2xl w-[33vw] min-w-[320px] max-w-[95vw] min-h-[250px] max-h-[85vh] shadow-2xl relative flex flex-col justify-between ${theme.window}`}
        style={{ resize: 'both', overflow: 'auto' }}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-3.5 sm:p-4 border-b pr-10 ${theme.header}`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-500 shrink-0">
              <Monitor className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`font-extrabold text-xs sm:text-sm truncate ${theme.headerTitle}`}>Create Windows Executable (.exe)</h3>
              <p className={`text-[11px] leading-tight truncate mt-0.5 ${theme.textMuted}`}>Package Archimedes Download Manager into a native standalone Windows application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`absolute top-3.5 right-3.5 z-10 p-1.5 rounded-lg transition-all ${theme.closeBtn}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-3.5 text-xs">
          <div className={`border rounded-xl p-3 text-xs space-y-1 ${theme.bannerBg}`}>
            <div className="font-bold flex items-center gap-1.5 text-indigo-500">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Electron & Tauri Native Executable Wrapper Ready!</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${theme.textSecondary}`}>
              Because web applications run inside sandboxed cloud containers, turning this app into a native Windows <code className={`px-1 py-0.5 rounded font-mono font-bold ${theme.codeBg}`}>.exe</code> file requires bundling it with an Electron runner. We have included <code className={`px-1 py-0.5 rounded font-mono ${theme.codeBg}`}>electron.js</code> and <code className={`px-1 py-0.5 rounded font-mono ${theme.codeBg}`}>build-exe.bat</code> directly in this project.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className={`font-bold uppercase tracking-wider text-[10px] ${theme.textMuted}`}>
              Steps to Build .exe on your PC:
            </h4>

            {commands.map((item, idx) => (
              <div key={idx} className={`border rounded-xl p-3 space-y-1.5 ${theme.card}`}>
                <div className={`font-semibold text-xs flex items-center justify-between ${theme.textSecondary}`}>
                  <span>{item.title}</span>
                  <button
                    onClick={() => handleCopy(item.cmd, idx)}
                    className={`p-1 rounded transition-all text-[10px] flex items-center gap-1 font-mono ${theme.btnSecondary}`}
                  >
                    {copiedIndex === idx ? (
                      <span className="text-emerald-500 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Copied
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className={`border rounded-lg p-2 font-mono text-[11px] ${theme.codeBg}`}>
                  {item.cmd}
                </div>
              </div>
            ))}
          </div>

          <div className={`border rounded-xl p-3 text-[11px] flex items-center gap-2 ${theme.card}`}>
            <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className={theme.textMuted}>
              The included <code className="font-mono">build-exe.bat</code> script will automatically build your React files and produce a standalone <code className="text-emerald-300 font-mono">InternetDownloadManager-Setup.exe</code> installer!
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-3 border-t flex justify-end gap-2 relative ${theme.footer}`}>
          <button
            onClick={onClose}
            className={`px-3.5 py-1.5 font-bold text-xs rounded-lg transition-all mr-2 ${theme.btnPrimary}`}
          >
            Got it!
          </button>
          <div className="absolute bottom-0.5 right-0.5 pointer-events-none text-slate-500 opacity-60">
            <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14ZM14 6H12V4H14V6ZM10 10H8V8H10V10ZM6 14H4V12H6V14Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
