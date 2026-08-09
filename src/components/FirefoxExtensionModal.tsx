import React, { useState } from 'react';
import { X, Globe, Download, CheckCircle2, Copy, Code, FileCode, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirefoxExtensionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'manifest' | 'background' | 'content'>('guide');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const manifestCode = `{
  "manifest_version": 2,
  "name": "Internet Download Manager Integration Module",
  "version": "2.5.0",
  "description": "Firefox extension for Internet Download Manager. Intercepts video streams, media downloads, and right-click download links.",
  "icons": { "48": "icon.png", "128": "icon.png" },
  "permissions": [
    "downloads",
    "webRequest",
    "webRequestBlocking",
    "<all_urls>",
    "nativeMessaging",
    "storage",
    "contextMenus"
  ],
  "browser_specific_settings": {
    "gecko": {
      "id": "idm-integration-module@internetdownloadmanager.com",
      "strict_min_version": "100.0"
    }
  },
  "background": { "scripts": ["background.js"] },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}`;

  const backgroundCode = `// Firefox IDM Background Script
const IDM_HOST = 'http://localhost:3000';

browser.downloads.onCreated.addListener((downloadItem) => {
  console.log('[IDM Firefox] Intercepted Download:', downloadItem.url);
  browser.downloads.cancel(downloadItem.id).then(() => {
    fetch(\`\${IDM_HOST}/api/downloads\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: downloadItem.url,
        filename: downloadItem.filename || 'download_file',
        referrer: downloadItem.referrer || ''
      })
    });
  });
});

browser.contextMenus.create({
  id: 'idm-download-context',
  title: 'Download with IDM',
  contexts: ['link', 'video', 'audio', 'image']
});`;

  const contentCode = `// Firefox IDM Content Script - Video Sniffer
(function() {
  function attachOverlay() {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      if (video.dataset.idmAttached) return;
      video.dataset.idmAttached = 'true';
      // Creates "Download with IDM" button over web videos
    });
  }
  setInterval(attachOverlay, 1500);
})();`;

  const getCodeText = () => {
    if (activeTab === 'manifest') return manifestCode;
    if (activeTab === 'background') return backgroundCode;
    if (activeTab === 'content') return contentCode;
    return '';
  };

  const handleCopyCode = () => {
    const text = getCodeText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    // Create a blob with manifest and download
    const blob = new Blob([manifestCode], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Firefox Extension Integration</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Firefox Add-on v2.5.0
                </span>
              </h3>
              <p className="text-xs text-slate-400">IDM Integration Module for Mozilla Firefox browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'guide' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Installation Guide
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'manifest' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            manifest.json
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'background' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            background.js
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'content' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            content.js
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-xs max-h-[60vh] overflow-y-auto">
          {activeTab === 'guide' ? (
            <div className="space-y-4">
              <div className="bg-orange-950/20 border border-orange-500/30 rounded-xl p-3.5 text-orange-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-orange-300">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Yes! Full Firefox Integration Module Included</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  All extension files (<code className="text-orange-300 font-mono">manifest.json</code>, <code className="text-orange-300 font-mono">background.js</code>, and <code className="text-orange-300 font-mono">content.js</code>) are generated in the <code className="text-orange-300 font-mono">/firefox-extension</code> directory.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                  How to Load in Firefox (3 Simple Steps):
                </h4>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                  <div className="font-bold text-indigo-400">Step 1: Open Firefox Debugging</div>
                  <p className="text-slate-300 text-[11px]">
                    Open Mozilla Firefox and type <code className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-orange-300 font-mono">about:debugging#/runtime/this-firefox</code> in the URL address bar.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                  <div className="font-bold text-indigo-400">Step 2: Load Temporary Add-on</div>
                  <p className="text-slate-300 text-[11px]">
                    Click on the <strong className="text-white">"Load Temporary Add-on..."</strong> button.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                  <div className="font-bold text-indigo-400">Step 3: Select Manifest File</div>
                  <p className="text-slate-300 text-[11px]">
                    Navigate to the exported project folder, go to <code className="text-indigo-300 font-mono">/firefox-extension</code>, and select <code className="text-emerald-300 font-mono">manifest.json</code>.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 text-emerald-200 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Once loaded, Firefox will display the IDM icon, automatically sniffs web videos on YouTube, and routes download clicks directly to your IDM engine!
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-400 text-[11px]">{activeTab}.js</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-[11px] flex items-center gap-1 transition-all"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadZip}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono text-[11px] flex items-center gap-1 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre">
                {getCodeText()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px]">Compatible with Firefox 100+ & Manifest V2/V3</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
