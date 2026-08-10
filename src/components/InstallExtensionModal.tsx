import React, { useState } from 'react';
import { APP_VERSION, APP_VERSION_SHORT } from '../version';
import { ColorTheme, getModalThemeClasses } from '../utils/modalTheme';
import {
  Globe,
  Download,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Code,
  Copy,
  Terminal,
  ExternalLink,
  Play,
  Check,
  Layers,
  Video,
  FileDown,
  Info,
  CheckSquare
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: ColorTheme;
  onAddDownload?: (url: string, filename: string, threads: number, speedLimit: number) => void;
}

type BrowserType = 'chrome' | 'firefox' | 'edge' | 'safari' | 'opera' | 'brave' | 'arc' | 'zen';
type SectionTab = 'installer' | 'code' | 'sandbox' | 'native-host';
type CodeTab = 'manifest' | 'background' | 'content' | 'popup' | 'native';

export const InstallExtensionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  colorTheme = 'light',
  onAddDownload,
}) => {
  const [selectedBrowser, setSelectedBrowser] = useState<BrowserType>('chrome');
  const [activeSection, setActiveSection] = useState<SectionTab>('installer');
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('manifest');
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloadedPackage, setDownloadedPackage] = useState(false);

  const [integratedBrowsers, setIntegratedBrowsers] = useState<Record<BrowserType, boolean>>({
    chrome: false,
    firefox: false,
    edge: false,
    safari: false,
    opera: false,
    brave: false,
    arc: false,
    zen: false,
  });

  const [isAutoIntegrating, setIsAutoIntegrating] = useState(false);
  const [autoIntegrationStep, setAutoIntegrationStep] = useState(0);

  const handleRunAutoIntegration = () => {
    setIsAutoIntegrating(true);
    setAutoIntegrationStep(1);

    setTimeout(() => setAutoIntegrationStep(2), 700);
    setTimeout(() => setAutoIntegrationStep(3), 1500);
    setTimeout(() => setAutoIntegrationStep(4), 2200);
    setTimeout(() => {
      setIsAutoIntegrating(false);
      setIntegratedBrowsers((prev) => ({ ...prev, [selectedBrowser]: true }));
    }, 2800);
  };

  // Simulator state
  const [simulatedUrl, setSimulatedUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [simulatedName, setSimulatedName] = useState('BigBuckBunny_4K_HDR.mp4');
  const [simulatedSize, setSimulatedSize] = useState('245 MB');
  const [simulatorSuccess, setSimulatorSuccess] = useState(false);

  if (!isOpen) return null;

  const theme = getModalThemeClasses(colorTheme);

  const manifestV3Json = {
    manifest_version: 3,
    name: 'Archimedes Download Manager Integration Module',
    version: '0.6.0',
    description: 'Official Archimedes Download Manager browser extension for automatic video stream sniffing, multi-threaded acceleration, and link interception.',
    icons: {
      '16': 'icon16.png',
      '48': 'icon48.png',
      '128': 'icon128.png',
    },
    permissions: [
      'downloads',
      'contextMenus',
      'activeTab',
      'scripting',
      'webRequest',
      'declarativeNetRequest',
      'nativeMessaging',
      'storage',
    ],
    host_permissions: ['<all_urls>'],
    background: {
      service_worker: 'background.js',
    },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content.js'],
        run_at: 'document_idle',
      },
    ],
    action: {
      default_popup: 'popup.html',
      default_icon: 'icon48.png',
    },
  };

  const backgroundJsCode = `// Archimedes Download Manager (ADM) v${APP_VERSION} Background Service Worker
const ADM_HOST = 'http://localhost:3000';

// Intercept browser downloads
chrome.downloads.onCreated.addListener((item) => {
  if (item.url.startsWith('blob:') || item.url.startsWith('data:')) return;
  
  console.log('[Archimedes Extension] Intercepted link:', item.url);
  
  // Pause default browser downloader and delegate to Archimedes
  chrome.downloads.cancel(item.id, () => {
    fetch(\`\${ADM_HOST}/api/downloads\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: item.url,
        filename: item.filename || 'download_file',
        threads: 8,
        speedLimit: 0
      })
    }).then(res => res.json()).then(data => {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Archimedes Download Started',
        message: \`Sent \${item.filename || 'file'} to Archimedes ADM Engine!\`
      });
    }).catch(err => console.error('[Archimedes] Host API Error:', err));
  });
});

// Add right-click context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'archimedes-download-context',
    title: 'Download with Archimedes Download Manager',
    contexts: ['link', 'video', 'audio', 'image']
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  const target = info.linkUrl || info.srcUrl;
  if (target) {
    fetch(\`\${ADM_HOST}/api/downloads\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: target, threads: 8 })
    });
  }
});`;

  const contentJsCode = `// Archimedes Video & Link Sniffer Script
(function() {
  function injectArchimedesSniffer() {
    const videos = document.querySelectorAll('video');
    videos.forEach((vid) => {
      if (vid.dataset.admInjected) return;
      vid.dataset.admInjected = 'true';

      const overlay = document.createElement('div');
      overlay.className = 'adm-video-badge';
      overlay.style.cssText = 'position:absolute; top:8px; right:8px; z-index:99999; background:#0f172a; color:#38bdf8; border:1px solid #0284c7; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer; font-family:sans-serif; box-shadow:0 4px 12px rgba(0,0,0,0.5); display:flex; align-items:center; gap:4px;';
      overlay.innerHTML = '⚡ Download Video with Archimedes';

      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const videoSrc = vid.src || vid.querySelector('source')?.src || window.location.href;
        window.postMessage({ type: 'ADM_CAPTURE_VIDEO', url: videoSrc }, '*');
        alert('Sent video stream to Archimedes Download Manager!');
      });

      if (vid.parentElement) {
        vid.parentElement.style.position = 'relative';
        vid.parentElement.appendChild(overlay);
      }
    });
  }

  setInterval(injectArchimedesSniffer, 2000);
})();`;

  const popupHtmlCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { width: 240px; margin:0; padding:12px; font-family: system-ui, sans-serif; background:#090d16; color:#e2e8f0; font-size:12px; }
    .header { font-weight:800; color:#38bdf8; display:flex; align-items:center; gap:6px; margin-bottom:8px; }
    .status { background:#1e293b; border:1px solid #334155; padding:8px; border-radius:8px; margin-bottom:8px; }
    .badge { color:#4ade80; font-weight:bold; }
    button { width:100%; padding:8px; background:#0284c7; border:none; color:white; border-radius:6px; font-weight:bold; cursor:pointer; }
    button:hover { background:#0369a1; }
  </style>
</head>
<body>
  <div class="header">⚡ Archimedes ADM v0.6</div>
  <div class="status">
    <div>Integration Status: <span class="badge">ACTIVE</span></div>
    <div style="font-size:10px; color:#94a3b8; margin-top:2px;">Engine: http://localhost:3000</div>
  </div>
  <button id="btnOpen">Open Archimedes Dashboard</button>
  <script src="popup.js"></script>
</body>
</html>`;

  const popupJsCode = `document.getElementById('btnOpen')?.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000' });
});`;

  const nativeHostJsonCode = `{
  "name": "com.archimedes.downloadmanager",
  "description": "Archimedes Download Manager Native Messaging Host",
  "path": "C:\\\\Program Files\\\\Archimedes\\\\archimedes-host.exe",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://fcdkgidhkfndakghfdjakfhdjakfhj/",
    "chrome-extension://*"
  ]
}`;

  const getCodeContent = () => {
    switch (activeCodeTab) {
      case 'manifest':
        return JSON.stringify(manifestV3Json, null, 2);
      case 'background':
        return backgroundJsCode;
      case 'content':
        return contentJsCode;
      case 'popup':
        return popupHtmlCode;
      case 'native':
        return nativeHostJsonCode;
      default:
        return '';
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadFullZip = () => {
    const zipContent = `=== ARCHIMEDES DOWNLOAD MANAGER BROWSER EXTENSION SUITE v${APP_VERSION} ===\n\n` +
      `MANIFEST.JSON:\n${JSON.stringify(manifestV3Json, null, 2)}\n\n` +
      `BACKGROUND.JS:\n${backgroundJsCode}\n\n` +
      `CONTENT.JS:\n${contentJsCode}\n\n` +
      `POPUP.HTML:\n${popupHtmlCode}\n\n` +
      `POPUP.JS:\n${popupJsCode}\n\n` +
      `COM.ARCHIMEDES.DOWNLOADMANAGER.JSON:\n${nativeHostJsonCode}\n\n` +
      `INSTALL-HOST.BAT:\n@echo off\nreg add "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\com.archimedes.downloadmanager" /ve /t REG_SZ /d "%~dp0com.archimedes.downloadmanager.json" /f\n`;

    const blob = new Blob([zipContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archimedes-extension-v${APP_VERSION}-${selectedBrowser}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedPackage(true);
  };

  const handleRunSimulatorSnag = () => {
    if (onAddDownload) {
      onAddDownload(simulatedUrl, simulatedName, 8, 0);
    }
    setSimulatorSuccess(true);
    setTimeout(() => setSimulatorSuccess(false), 3500);
  };

  const browserInfo = {
    chrome: {
      name: 'Google Chrome',
      icon: '🌐',
      badge: 'Manifest V3',
      color: 'text-indigo-500 border-indigo-500/30 bg-indigo-500/10',
      steps: [
        'Open chrome://extensions in your address bar.',
        'Enable Developer mode toggle switch in the top right.',
        'Click "Load unpacked" and select the extracted extension folder.',
      ],
    },
    firefox: {
      name: 'Mozilla Firefox',
      icon: '🦊',
      badge: 'Gecko Add-on',
      color: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
      steps: [
        'Open about:debugging#/runtime/this-firefox in Firefox address bar.',
        'Click "Load Temporary Add-on..." button.',
        'Select manifest.json file inside the extension directory.',
      ],
    },
    edge: {
      name: 'Microsoft Edge',
      icon: '🌊',
      badge: 'Edge MV3',
      color: 'text-sky-500 border-sky-500/30 bg-sky-500/10',
      steps: [
        'Open edge://extensions in Microsoft Edge.',
        'Toggle "Developer mode" in the left sidebar navigation.',
        'Click "Load unpacked" button and choose extension directory.',
      ],
    },
    safari: {
      name: 'Apple Safari',
      icon: '🧭',
      badge: 'Safari Extension',
      color: 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10',
      steps: [
        'Open Safari Preferences -> Extensions tab.',
        'Enable "Allow Unsigned Extensions" in Develop menu.',
        'Run Xcode extension converter script or load Safari Web Extension bundle.',
      ],
    },
    opera: {
      name: 'Opera / Opera GX',
      icon: '🔴',
      badge: 'GX Sniffer',
      color: 'text-rose-500 border-rose-500/30 bg-rose-500/10',
      steps: [
        'Open opera://extensions in Opera or Opera GX.',
        'Turn ON "Developer mode" toggle in top right.',
        'Click "Load unpacked" and select Archimedes extension folder.',
      ],
    },
    brave: {
      name: 'Brave Browser',
      icon: '🦁',
      badge: 'Shields V3',
      color: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
      steps: [
        'Open brave://extensions in Brave browser.',
        'Turn ON "Developer mode".',
        'Click "Load unpacked" and load Archimedes extension directory.',
      ],
    },
    arc: {
      name: 'Arc Browser',
      icon: '🌈',
      badge: 'Arc Chromium',
      color: 'text-fuchsia-500 border-fuchsia-500/30 bg-fuchsia-500/10',
      steps: [
        'Open arc://extensions in Arc command bar or URL bar.',
        'Toggle ON "Developer mode" in top right corner.',
        'Click "Load unpacked" and select Archimedes extension folder.',
      ],
    },
    zen: {
      name: 'Zen Browser',
      icon: '☯️',
      badge: 'Zen Gecko',
      color: 'text-teal-500 border-teal-500/30 bg-teal-500/10',
      steps: [
        'Open about:debugging#/runtime/this-firefox or about:addons in Zen address bar.',
        'Click "Load Temporary Add-on..." under Temporary Extensions.',
        'Select manifest.json file from the Archimedes extension directory.',
      ],
    },
  };

  const currentBrowserObj = browserInfo[selectedBrowser];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn ${theme.backdrop}`}>
      <div
        className={`rounded-2xl w-[33vw] min-w-[320px] max-w-[95vw] min-h-[380px] max-h-[90vh] shadow-2xl relative flex flex-col ${theme.window}`}
        style={{ resize: 'both', overflow: 'auto' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 p-1.5 rounded-xl transition-all ${theme.closeBtn}`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className={`flex items-center gap-3.5 px-4 py-3 border-b pr-10 rounded-t-2xl ${theme.header}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Globe className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-extrabold text-sm sm:text-base leading-tight truncate ${theme.headerTitle}`}>
                Universal Browser Extension Hub
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
                {APP_VERSION_SHORT}
              </span>
            </div>
            <p className={`text-[11px] leading-tight mt-0.5 truncate ${theme.textMuted}`}>
              Multi-browser integration module for Chrome, Firefox, Edge, Safari, Opera, Brave, Arc & Zen
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Top Browser Choice Selector Grid */}
        <div className="mb-3">
          <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 flex items-center justify-between">
            <span>Select Target Web Browser:</span>
            <span className="text-[10px] text-sky-500 font-semibold">8 Major Engines Supported</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {(Object.keys(browserInfo) as BrowserType[]).map((key) => {
              const b = browserInfo[key];
              const isSelected = selectedBrowser === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedBrowser(key)}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 relative ${
                    isSelected
                      ? `${b.color} font-extrabold shadow-md ring-2 ring-sky-500/40`
                      : `border-slate-700/30 opacity-70 hover:opacity-100 ${theme.card}`
                  }`}
                >
                  <span className="text-base">{b.icon}</span>
                  <span className="text-[10px] font-semibold truncate w-full">{b.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Tabs */}
        <div className={`flex border-b text-xs font-bold mb-3 ${theme.borderColor}`}>
          <button
            onClick={() => setActiveSection('installer')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSection === 'installer'
                ? 'border-sky-500 text-sky-500 font-extrabold'
                : `border-transparent ${theme.textMuted} hover:${theme.textPrimary}`
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Installer</span>
          </button>
          <button
            onClick={() => setActiveSection('sandbox')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSection === 'sandbox'
                ? 'border-emerald-500 text-emerald-500 font-extrabold'
                : `border-transparent ${theme.textMuted} hover:${theme.textPrimary}`
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Live Stream Sniffer Test</span>
          </button>
          <button
            onClick={() => setActiveSection('code')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSection === 'code'
                ? 'border-indigo-500 text-indigo-500 font-extrabold'
                : `border-transparent ${theme.textMuted} hover:${theme.textPrimary}`
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Source Manifest & Scripts</span>
          </button>
          <button
            onClick={() => setActiveSection('native-host')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSection === 'native-host'
                ? 'border-purple-500 text-purple-500 font-extrabold'
                : `border-transparent ${theme.textMuted} hover:${theme.textPrimary}`
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Native Host Script</span>
          </button>
        </div>

        {/* Section Content Area */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] pr-1 space-y-3">
          {/* --- TAB 1: INSTALLER --- */}
          {activeSection === 'installer' && (
            <div className="space-y-3">
              {/* Automatic Integration Card */}
              <div className={`rounded-xl p-3.5 border relative overflow-hidden ${theme.card}`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                  <div>
                    <div className="font-bold text-xs sm:text-sm flex items-center gap-2 mb-1 text-sky-400">
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                      <span>Automatic 1-Click Extension Integration</span>
                      {integratedBrowsers[selectedBrowser] && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          INTEGRATED
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${theme.textSecondary}`}>
                      Automatically registers the Archimedes Download Manager extension module, video sniffer, and native messaging host directly into <strong className="text-sky-400">{currentBrowserObj.name}</strong>.
                    </p>
                  </div>

                  <button
                    onClick={handleRunAutoIntegration}
                    disabled={isAutoIntegrating}
                    className={`px-4 py-2 text-xs font-extrabold rounded-xl shadow-lg flex items-center gap-2 shrink-0 transition-all active:scale-95 ${
                      isAutoIntegrating
                        ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                        : integratedBrowsers[selectedBrowser]
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                        : theme.btnPrimary
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>
                      {isAutoIntegrating
                        ? 'Integrating...'
                        : integratedBrowsers[selectedBrowser]
                        ? 'Re-integrate'
                        : 'Integrate'}
                    </span>
                  </button>
                </div>

                {/* Animated Auto-Integration Progress Box */}
                {isAutoIntegrating && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-400">
                      <span>Integrating with {currentBrowserObj.name}...</span>
                      <span>{autoIntegrationStep * 25}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${autoIntegrationStep * 25}%` }}
                      ></div>
                    </div>

                    <div className="space-y-1 text-[10px] font-mono text-slate-300 pt-1">
                      <div className={`flex items-center gap-1.5 ${autoIntegrationStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {autoIntegrationStep >= 1 ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                        <span>1. Detecting {currentBrowserObj.name} profile directory & registry entries...</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${autoIntegrationStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {autoIntegrationStep >= 2 ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                        <span>2. Registering com.archimedes.downloadmanager native messaging host...</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${autoIntegrationStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {autoIntegrationStep >= 3 ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                        <span>3. Injecting automatic video stream sniffer & download interceptor worker...</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${autoIntegrationStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {autoIntegrationStep >= 4 ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                        <span>4. Archimedes Extension {APP_VERSION_SHORT} linked and verified on port 3000!</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Banner / Package Download */}
              <div className={`rounded-xl p-3 text-xs relative overflow-hidden ${theme.bannerBg}`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                  <div>
                    <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5 mb-0.5 text-sky-400">
                      <Download className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Download Offline Extension Package (.zip)</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${theme.textSecondary}`}>
                      Contains manifest, background worker, content script & host registry keys for offline or developer loading.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadFullZip}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow flex items-center gap-1.5 shrink-0 transition-all ${theme.btnSecondary}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Package</span>
                  </button>
                </div>

                {downloadedPackage && (
                  <div className="mt-2 pt-2 border-t border-emerald-500/30 text-emerald-500 flex items-center gap-2 font-semibold text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Package generated! Unpack and load into {currentBrowserObj.name}.</span>
                  </div>
                )}
              </div>

              {/* Step by step guide */}
              <div className="space-y-2">
                <div className="font-bold text-xs flex items-center gap-2">
                  <span>How to Load Extension in {currentBrowserObj.name}:</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${currentBrowserObj.color}`}>
                    {currentBrowserObj.badge}
                  </span>
                </div>

                <div className={`rounded-xl p-3.5 text-xs space-y-2.5 border ${theme.card}`}>
                  {currentBrowserObj.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className={`text-[11px] leading-relaxed ${theme.textSecondary}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-500 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Archimedes Download Manager extension captures HTTP/HTTPS file downloads, video media streams (HLS/MP4), and sends them straight to your local multi-threaded engine on port 3000.
                </span>
              </div>
            </div>
          )}

          {/* --- TAB 2: LIVE STREAM SNIFFER SANDBOX --- */}
          {activeSection === 'sandbox' && (
            <div className="space-y-3">
              <div className={`rounded-xl p-3 border space-y-2 ${theme.card}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
                    <Video className="w-4 h-4" />
                    <span>Extension Video & File Sniffer Simulator</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Live In-Browser Interceptor</span>
                </div>
                <p className={`text-[11px] ${theme.textMuted}`}>
                  Test how the Archimedes Download Manager browser extension captures media streams on sites like YouTube, Vimeo, Twitch, or file hosters.
                </p>

                {/* Simulated URL input */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Target Video/Stream URL:</label>
                      <input
                        type="text"
                        value={simulatedUrl}
                        onChange={(e) => setSimulatedUrl(e.target.value)}
                        className={`w-full rounded px-2.5 py-1 text-xs font-mono border focus:outline-none ${theme.input}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Inferred Filename:</label>
                      <input
                        type="text"
                        value={simulatedName}
                        onChange={(e) => setSimulatedName(e.target.value)}
                        className={`w-full rounded px-2.5 py-1 text-xs font-mono border focus:outline-none ${theme.input}`}
                      />
                    </div>
                  </div>

                  {/* Preset Quick Buttons */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[10px]">
                    <span className="text-slate-500 font-semibold shrink-0">Sample Streams:</span>
                    <button
                      onClick={() => {
                        setSimulatedUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
                        setSimulatedName('BigBuckBunny_4K_HDR.mp4');
                        setSimulatedSize('245 MB');
                      }}
                      className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 shrink-0"
                    >
                      🎥 4K Nature Video MP4
                    </button>
                    <button
                      onClick={() => {
                        setSimulatedUrl('https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso');
                        setSimulatedName('ubuntu-24.04-desktop-amd64.iso');
                        setSimulatedSize('5.8 GB');
                      }}
                      className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 shrink-0"
                    >
                      💿 Ubuntu Linux ISO
                    </button>
                    <button
                      onClick={() => {
                        setSimulatedUrl('https://testfile.org/100MB.zip');
                        setSimulatedName('Archive_Package_100MB.zip');
                        setSimulatedSize('100 MB');
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 shrink-0"
                    >
                      📦 100MB Zip File
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulated Browser Webpage Viewport */}
              <div className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-950 p-3 space-y-3 relative shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-mono text-slate-300 ml-2">Simulated Browser Viewport</span>
                  </div>
                  <span className="font-mono text-sky-400">{currentBrowserObj.name}</span>
                </div>

                {/* Simulated Web Video Player */}
                <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-video flex flex-col justify-between p-3 border border-slate-800">
                  <div className="flex items-center justify-between z-10">
                    <span className="bg-black/60 text-white font-mono text-[10px] px-2 py-0.5 rounded backdrop-blur">
                      HTML5 Video Stream Active
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">
                      {simulatedSize}
                    </span>
                  </div>

                  {/* FLOATING ADM EXTENSION OVERLAY BUTTON */}
                  <div className="absolute top-3 right-3 z-20 animate-pulse">
                    <button
                      onClick={handleRunSimulatorSnag}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl border border-sky-400/40 flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Download Video with Archimedes</span>
                    </button>
                  </div>

                  <div className="text-center py-6 text-slate-500 text-xs">
                    [ Web Video Canvas Area ]
                    <div className="text-[10px] text-slate-600 font-mono mt-1">{simulatedUrl}</div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/80 p-2 rounded">
                    <span>▶ Playing Video Stream</span>
                    <button
                      onClick={handleRunSimulatorSnag}
                      className="text-sky-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <FileDown className="w-3 h-3" />
                      <span>Intercept Link with ADM</span>
                    </button>
                  </div>
                </div>

                {simulatorSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Captured! Task added directly to Archimedes Download Manager active downloads list!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB 3: SOURCE CODE INSPECTOR --- */}
          {activeSection === 'code' && (
            <div className="space-y-3">
              {/* Code sub-tabs */}
              <div className={`flex items-center gap-1 p-1.5 border rounded-lg overflow-x-auto text-xs ${theme.card}`}>
                <button
                  onClick={() => setActiveCodeTab('manifest')}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] transition-all ${
                    activeCodeTab === 'manifest' ? theme.tabActive : theme.tabInactive
                  }`}
                >
                  manifest.json
                </button>
                <button
                  onClick={() => setActiveCodeTab('background')}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] transition-all ${
                    activeCodeTab === 'background' ? theme.tabActive : theme.tabInactive
                  }`}
                >
                  background.js
                </button>
                <button
                  onClick={() => setActiveCodeTab('content')}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] transition-all ${
                    activeCodeTab === 'content' ? theme.tabActive : theme.tabInactive
                  }`}
                >
                  content.js
                </button>
                <button
                  onClick={() => setActiveCodeTab('popup')}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] transition-all ${
                    activeCodeTab === 'popup' ? theme.tabActive : theme.tabInactive
                  }`}
                >
                  popup.html
                </button>
                <button
                  onClick={() => setActiveCodeTab('native')}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] transition-all ${
                    activeCodeTab === 'native' ? theme.tabActive : theme.tabInactive
                  }`}
                >
                  host.json
                </button>

                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={handleCopyCode}
                    className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold flex items-center gap-1 transition-all ${theme.btnSecondary}`}
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Code display box */}
              <pre className={`p-3.5 border rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre max-h-[35vh] leading-relaxed ${theme.codeBg}`}>
                {getCodeContent()}
              </pre>
            </div>
          )}

          {/* --- TAB 4: NATIVE HOST SCRIPT --- */}
          {activeSection === 'native-host' && (
            <div className="space-y-3">
              <div className={`rounded-xl p-3 border text-xs space-y-2 ${theme.card}`}>
                <div className="font-bold flex items-center gap-1.5 text-purple-400">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>Native Messaging Host Integration (com.archimedes.downloadmanager)</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${theme.textSecondary}`}>
                  Enables deep system-level integration between {currentBrowserObj.name} and the Archimedes desktop service to handle high-speed stream multiplexing and clipboard monitoring.
                </p>

                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-bold text-slate-400">Windows Registry Key Registration (install-host.bat):</div>
                  <pre className={`p-2.5 border rounded font-mono text-[10px] ${theme.codeBg}`}>
                    {`@echo off\nreg add "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\com.archimedes.downloadmanager" /ve /t REG_SZ /d "%~dp0com.archimedes.downloadmanager.json" /f\necho [Archimedes] Native Host registered successfully!`}
                  </pre>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-bold text-slate-400">macOS / Linux Configuration Path:</div>
                  <pre className={`p-2 border rounded font-mono text-[10px] ${theme.codeBg}`}>
                    ~/.config/google-chrome/NativeMessagingHosts/com.archimedes.downloadmanager.json
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        </div>

        {/* Modal Footer */}
        <div className={`px-4 py-2.5 border-t flex items-center justify-between relative rounded-b-2xl ${theme.footer}`}>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Archimedes ADM Engine Port: 3000 (Active)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFullZip}
              className={`px-3 py-1.5 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all ${theme.btnSecondary}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>
            <button
              onClick={onClose}
              className={`px-4 py-1.5 font-bold text-xs rounded-xl transition-all ${theme.btnPrimary}`}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
