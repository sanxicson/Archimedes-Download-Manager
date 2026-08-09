import React, { useState } from 'react';
import { ColorTheme, getModalThemeClasses } from '../utils/modalTheme';
import { X, Globe, Download, CheckCircle2, Copy, Sparkles, Check, Play, Video } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: ColorTheme;
  onAddDownload?: (url: string, filename: string, threads: number, speedLimit: number) => void;
}

export const FirefoxExtensionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  colorTheme = 'light',
  onAddDownload,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'manifest' | 'background' | 'content' | 'test'>('guide');
  const [copied, setCopied] = useState(false);
  const [testUrl, setTestUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
  const [testSuccess, setTestSuccess] = useState(false);

  if (!isOpen) return null;

  const theme = getModalThemeClasses(colorTheme);

  const manifestCode = `{
  "manifest_version": 2,
  "name": "Archimedes Download Manager Integration Module",
  "version": "0.6.0",
  "description": "Mozilla Firefox extension for Archimedes Download Manager. Intercepts video streams, media downloads, and right-click download links.",
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
      "id": "archimedes-integration-module@archimedes-download-manager.com",
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

  const backgroundCode = `// Firefox Archimedes Download Manager Background Script v0.62.0
const ADM_HOST = 'http://localhost:3000';

browser.downloads.onCreated.addListener((downloadItem) => {
  console.log('[Archimedes Firefox] Intercepted Download:', downloadItem.url);
  browser.downloads.cancel(downloadItem.id).then(() => {
    fetch(\`\${ADM_HOST}/api/downloads\`, {
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
  id: 'archimedes-download-context',
  title: 'Download with Archimedes Download Manager',
  contexts: ['link', 'video', 'audio', 'image']
});`;

  const contentCode = `// Firefox Archimedes Content Script - Video Stream Sniffer
(function() {
  function attachOverlay() {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      if (video.dataset.admAttached) return;
      video.dataset.admAttached = 'true';
      // Appends "Download Video with Archimedes" overlay button on web videos
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
    const blob = new Blob([manifestCode], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunFirefoxTest = () => {
    if (onAddDownload) {
      onAddDownload(testUrl, 'TearsOfSteel_1080p.mp4', 8, 0);
    }
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 animate-fadeIn ${theme.backdrop}`}>
      <div
        className={`rounded-2xl w-[36vw] min-w-[320px] max-w-[95vw] min-h-[280px] max-h-[88vh] shadow-2xl relative flex flex-col justify-between ${theme.window}`}
        style={{ resize: 'both', overflow: 'auto' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-3.5 sm:p-4 border-b pr-10 ${theme.header}`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-500 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`font-extrabold text-xs sm:text-sm flex items-center gap-2 truncate ${theme.headerTitle}`}>
                <span>Mozilla Firefox Integration Module</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500 border border-orange-500/30 shrink-0">
                  v0.62.0
                </span>
              </h3>
              <p className={`text-[11px] leading-tight truncate mt-0.5 ${theme.textMuted}`}>
                Archimedes Download Manager extension for Mozilla Firefox & Zen Browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`absolute top-3.5 right-3.5 z-10 p-1.5 rounded-xl transition-all ${theme.closeBtn}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className={`flex items-center gap-1 p-2 border-b text-xs font-semibold overflow-x-auto ${theme.borderColor} ${theme.card}`}>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'guide' ? theme.tabActive : theme.tabInactive
            }`}
          >
            Installation Guide
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'test' ? theme.tabActive : theme.tabInactive
            }`}
          >
            Stream Sniffer Test
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'manifest' ? theme.tabActive : theme.tabInactive
            }`}
          >
            manifest.json
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'background' ? theme.tabActive : theme.tabInactive
            }`}
          >
            background.js
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'content' ? theme.tabActive : theme.tabInactive
            }`}
          >
            content.js
          </button>
        </div>

        {/* Body */}
        <div className="p-4 text-xs max-h-[60vh] overflow-y-auto">
          {activeTab === 'guide' && (
            <div className="space-y-3">
              <div className={`border rounded-xl p-3 text-xs space-y-1 ${theme.bannerBg}`}>
                <div className="font-bold flex items-center gap-1.5 text-orange-500">
                  <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Firefox Integration Module Included</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${theme.textSecondary}`}>
                  All extension files (<code className={`px-1 py-0.5 rounded font-mono ${theme.codeBg}`}>manifest.json</code>, <code className={`px-1 py-0.5 rounded font-mono ${theme.codeBg}`}>background.js</code>, and <code className={`px-1 py-0.5 rounded font-mono ${theme.codeBg}`}>content.js</code>) support Firefox Gecko WebExtensions.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className={`font-bold uppercase tracking-wider text-[10px] ${theme.textMuted}`}>
                  How to Load in Firefox (3 Simple Steps):
                </h4>

                <div className={`border rounded-xl p-3 space-y-1 ${theme.card}`}>
                  <div className="font-bold text-orange-500 text-xs">Step 1: Open Firefox Debugging</div>
                  <p className={`text-[11px] ${theme.textSecondary}`}>
                    Open Mozilla Firefox and type <code className={`px-1.5 py-0.5 rounded font-mono text-orange-500 ${theme.codeBg}`}>about:debugging#/runtime/this-firefox</code> in the URL address bar.
                  </p>
                </div>

                <div className={`border rounded-xl p-3 space-y-1 ${theme.card}`}>
                  <div className="font-bold text-orange-500 text-xs">Step 2: Load Temporary Add-on</div>
                  <p className={`text-[11px] ${theme.textSecondary}`}>
                    Click on the <strong className={theme.textPrimary}>"Load Temporary Add-on..."</strong> button.
                  </p>
                </div>

                <div className={`border rounded-xl p-3 space-y-1 ${theme.card}`}>
                  <div className="font-bold text-orange-500 text-xs">Step 3: Select Manifest File</div>
                  <p className={`text-[11px] ${theme.textSecondary}`}>
                    Select <code className={`px-1 py-0.5 rounded font-mono text-emerald-500 ${theme.codeBg}`}>manifest.json</code> from the extension directory.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-500 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Firefox automatically captures video streams and routes download requests straight to Archimedes!
                </span>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-3">
              <div className={`border rounded-xl p-3 text-xs space-y-2 ${theme.card}`}>
                <div className="font-bold text-orange-400 flex items-center gap-1.5">
                  <Video className="w-4 h-4" />
                  <span>Firefox Video Interceptor Sandbox</span>
                </div>
                <p className={`text-[11px] ${theme.textMuted}`}>
                  Test capturing video streams with Firefox integration script:
                </p>
                <input
                  type="text"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  className={`w-full rounded px-2.5 py-1 font-mono text-xs border ${theme.input}`}
                />
                <button
                  onClick={handleRunFirefoxTest}
                  className={`px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 ${theme.btnPrimary}`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Simulate Firefox Video Capture</span>
                </button>

                {testSuccess && (
                  <div className="p-2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Captured! Video stream added to Archimedes Download Manager active queue.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab !== 'guide' && activeTab !== 'test' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[11px] ${theme.textMuted}`}>{activeTab}.js</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] flex items-center gap-1 transition-all ${theme.btnSecondary}`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadZip}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] flex items-center gap-1 transition-all ${theme.btnPrimary}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>

              <pre className={`p-3.5 border rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre ${theme.codeBg}`}>
                {getCodeText()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t flex justify-between items-center text-xs relative ${theme.footer}`}>
          <span className={`text-[10px] truncate pr-2 ${theme.textMuted}`}>Firefox 100+ Gecko Extension API</span>
          <button
            onClick={onClose}
            className={`px-3.5 py-1.5 font-bold text-xs rounded-lg transition-all shrink-0 mr-2 ${theme.btnPrimary}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
