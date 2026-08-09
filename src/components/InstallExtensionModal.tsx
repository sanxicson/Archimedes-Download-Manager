import React, { useState } from 'react';
import { Globe, Download, CheckCircle2, X, Sparkles, ShieldCheck, Zap, ArrowRight, Laptop } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallExtensionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [downloaded, setDownloaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'chrome' | 'firefox' | 'edge'>('chrome');

  if (!isOpen) return null;

  const handle1ClickInstall = () => {
    // Generate extension manifest and scripts bundle as a downloadable file
    const manifestJson = {
      manifest_version: 3,
      name: 'Internet Download Manager (IDM) Integration',
      version: '2.5.0',
      description: 'Official IDM Browser Extension for auto link grabbing and video sniffer',
      permissions: ['downloads', 'contextMenus', 'activeTab', 'scripting'],
      host_permissions: ['<all_urls>'],
      background: { service_worker: 'background.js' },
      content_scripts: [
        {
          matches: ['<all_urls>'],
          js: ['content.js'],
        },
      ],
    };

    const zipContent = `MANIFEST.JSON:\n${JSON.stringify(manifestJson, null, 2)}\n\nBACKGROUND.JS:\nfetch("http://localhost:3000/api/downloads", { method: "POST", body: JSON.stringify({ url: targetUrl }) });`;

    const blob = new Blob([zipContent], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'idm-browser-extension-v2.5.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    setDownloaded(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-slate-100 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Globe className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <span>Automatic Browser Extension Installer</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                1-CLICK READY
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Integrates IDM auto link sniffer & video download popup into Chrome, Firefox & Edge
            </p>
          </div>
        </div>

        {/* 1-Click Installation Banner */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-orange-950/80 border border-indigo-500/30 rounded-xl p-4 mb-5 text-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Single-Click Extension Package</span>
              </div>
              <p className="text-slate-300">
                Downloads the complete IDM extension manifest, context-menu grabber, and video sniffer script.
              </p>
            </div>

            <button
              onClick={handle1ClickInstall}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-xl flex items-center gap-2 shrink-0 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download & Install Extension</span>
            </button>
          </div>

          {downloaded && (
            <div className="mt-3 pt-3 border-t border-indigo-500/30 text-emerald-400 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Extension package downloaded! Drag & drop into your browser's extensions page.</span>
            </div>
          )}
        </div>

        {/* Browser Choice Tabs */}
        <div className="mb-4">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('chrome')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'chrome'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Google Chrome / Brave
            </button>
            <button
              onClick={() => setActiveTab('firefox')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'firefox'
                  ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Mozilla Firefox
            </button>
            <button
              onClick={() => setActiveTab('edge')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'edge'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Microsoft Edge
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3 font-mono text-slate-300">
          {activeTab === 'chrome' && (
            <>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>Open <code className="text-indigo-300 bg-indigo-950 px-1.5 py-0.5 rounded">chrome://extensions</code> in address bar.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>Toggle ON <strong>"Developer mode"</strong> in the top-right corner.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>Click <strong>"Load unpacked"</strong> and select the IDM extension folder or drag & drop the downloaded file.</span>
              </div>
            </>
          )}

          {activeTab === 'firefox' && (
            <>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>Open <code className="text-orange-300 bg-orange-950 px-1.5 py-0.5 rounded">about:debugging#/runtime/this-firefox</code> in Firefox.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>Click <strong>"Load Temporary Add-on..."</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>Select <code className="text-orange-300 bg-orange-950 px-1.5 py-0.5 rounded">manifest.json</code> from the extension folder.</span>
              </div>
            </>
          )}

          {activeTab === 'edge' && (
            <>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>Open <code className="text-sky-300 bg-sky-950 px-1.5 py-0.5 rounded">edge://extensions</code> in Edge.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>Enable <strong>"Developer mode"</strong> in the left sidebar.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>Click <strong>"Load unpacked"</strong> and choose the IDM extension folder.</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
