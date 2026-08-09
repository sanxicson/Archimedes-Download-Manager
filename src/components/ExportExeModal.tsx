import React, { useState } from 'react';
import { X, Monitor, Download, Terminal, CheckCircle2, FileCode, Copy, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportExeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Create Windows Executable (.exe)</h3>
              <p className="text-xs text-slate-400">Package IDM into a native standalone Windows application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3.5 text-indigo-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Electron & Tauri Native Executable Wrapper Ready!</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Because web applications run inside sandboxed cloud containers, turning this app into a native Windows <code className="text-indigo-300 font-mono font-bold">.exe</code> file requires bundling it with an Electron runner. We have included <code className="text-indigo-300 font-mono">electron.js</code> and <code className="text-indigo-300 font-mono">build-exe.bat</code> directly in this project.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] text-slate-400">
              Steps to Build .exe on your PC:
            </h4>

            {commands.map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <div className="font-semibold text-slate-300 flex items-center justify-between">
                  <span>{item.title}</span>
                  <button
                    onClick={() => handleCopy(item.cmd, idx)}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-all text-[10px] flex items-center gap-1 font-mono"
                  >
                    {copiedIndex === idx ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2 font-mono text-[11px] text-indigo-300">
                  {item.cmd}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              The included <code className="text-slate-200 font-mono">build-exe.bat</code> script will automatically build your React files and produce a standalone <code className="text-emerald-300 font-mono">InternetDownloadManager-Setup.exe</code> installer!
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
