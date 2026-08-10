import React, { useState } from 'react';
import { APP_VERSION_SHORT } from '../version';
import { ColorTheme, getModalThemeClasses } from '../utils/modalTheme';
import {
  X,
  Sliders,
  Globe,
  HardDrive,
  Download,
  FileCode,
  ShieldCheck,
  Key,
  Folder,
  Check,
  CheckCircle2,
  Zap,
  Server,
  Lock,
  Wifi,
  Settings,
  Bell
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  speedLimitKbps: number;
  onUpdateSpeedLimitKbps: (speed: number) => void;
  maxConnections?: number;
  onUpdateMaxConnections?: (conn: number) => void;
  colorTheme?: ColorTheme;
  onOpenExtensionModal?: () => void;
}

export const AdmOptionsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  speedLimitKbps,
  onUpdateSpeedLimitKbps,
  maxConnections = 8,
  onUpdateMaxConnections,
  colorTheme = 'light',
  onOpenExtensionModal,
}) => {
  const theme = getModalThemeClasses(colorTheme);
  const [activeTab, setActiveTab] = useState<
    'general' | 'connection' | 'saveto' | 'downloads' | 'filetypes' | 'proxy' | 'sitelogins'
  >('general');

  // General Settings
  const [launchOnStartup, setLaunchOnStartup] = useState(true);
  const [captureClipboard, setCaptureClipboard] = useState(true);
  const [showCompleteDialog, setShowCompleteDialog] = useState(true);
  const [playSound, setPlaySound] = useState(true);
  const [showDownloadPanel, setShowDownloadPanel] = useState(true);
  const [browsers, setBrowsers] = useState([
    { name: 'Google Chrome', enabled: true, autoIntegrated: false },
    { name: 'Mozilla Firefox', enabled: true, autoIntegrated: false },
    { name: 'Microsoft Edge', enabled: true, autoIntegrated: false },
    { name: 'Arc Browser', enabled: true, autoIntegrated: false },
    { name: 'Zen Browser', enabled: true, autoIntegrated: false },
    { name: 'Brave Browser', enabled: true, autoIntegrated: false },
    { name: 'Opera / Opera GX', enabled: true, autoIntegrated: false },
    { name: 'Apple Safari', enabled: true, autoIntegrated: false },
    { name: 'Vivaldi', enabled: true, autoIntegrated: false },
  ]);

  // Connection Settings
  const [connectionType, setConnectionType] = useState('high');
  const [maxThreads, setMaxThreads] = useState(maxConnections);
  const [enableSpeedLimitOnStart, setEnableSpeedLimitOnStart] = useState(speedLimitKbps > 0);
  const [speedLimitValue, setSpeedLimitValue] = useState(speedLimitKbps || 1024);

  // Save To Settings
  const [defaultDir, setDefaultDir] = useState('/downloads/');
  const [tempDir, setTempDir] = useState('/downloads/.adm_temp/');
  const [autoCategorize, setAutoCategorize] = useState(true);
  const [categoryDirs, setCategoryDirs] = useState({
    General: '/downloads/General/',
    Compressed: '/downloads/Compressed/',
    Documents: '/downloads/Documents/',
    Music: '/downloads/Music/',
    Programs: '/downloads/Programs/',
    Video: '/downloads/Video/',
  });

  // Downloads Settings
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [showProgressDialog, setShowProgressDialog] = useState(true);
  const [enableVirusScan, setEnableVirusScan] = useState(false);
  const [virusScanPath, setVirusScanPath] = useState('C:\\Program Files\\Windows Defender\\MpCmdRun.exe');
  const [autoResume, setAutoResume] = useState(true);
  const [maxRetries, setMaxRetries] = useState(10);

  // File Types Settings
  const [fileTypes, setFileTypes] = useState(
    '3GP 7Z AAC APK ARJ AVI BZ2 CAB DEB DMG DOC DOCX EPUB EXE FLAC FLV GZ ISO MP3 MP4 MSI OGG PDF PKG PPT PPTX RAR RPM TAR WAV WEBM WMV XLS XLSX ZIP'
  );
  const [exceptions, setExceptions] = useState('*.microsoft.com\n*.google.com/update\n*.windowsupdate.com');

  // Proxy Settings
  const [proxyMode, setProxyMode] = useState<'none' | 'system' | 'manual'>('none');
  const [proxyHost, setProxyHost] = useState('');
  const [proxyPort, setProxyPort] = useState('8080');

  // Site Logins
  const [siteLogins, setSiteLogins] = useState([
    { id: '1', url: 'https://*.rapidgator.net/*', username: 'user_premium', password: '••••••••' },
    { id: '2', url: 'ftp://ftp.ubuntu.com/*', username: 'anonymous', password: '••••••••' },
  ]);
  const [showAddSiteForm, setShowAddSiteForm] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteUser, setNewSiteUser] = useState('');
  const [newSitePass, setNewSitePass] = useState('');

  // Notification Banner
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSiteLogin = () => {
    if (!newSiteUrl.trim() || !newSiteUser.trim()) return;
    setSiteLogins((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        url: newSiteUrl.trim(),
        username: newSiteUser.trim(),
        password: newSitePass.trim() || '••••••••',
      },
    ]);
    setNewSiteUrl('');
    setNewSiteUser('');
    setNewSitePass('');
    setShowAddSiteForm(false);
  };

  const handleRemoveSiteLogin = (id: string) => {
    setSiteLogins((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    // Apply speed limit
    if (enableSpeedLimitOnStart) {
      onUpdateSpeedLimitKbps(speedLimitValue);
    } else {
      onUpdateSpeedLimitKbps(0);
    }

    if (onUpdateMaxConnections) {
      onUpdateMaxConnections(maxThreads);
    }

    setSaveNotification('Archimedes Download Manager configuration saved successfully!');
    setTimeout(() => {
      setSaveNotification(null);
      onClose();
    }, 600);
  };

  const toggleBrowser = (index: number) => {
    setBrowsers((prev) =>
      prev.map((b, i) => (i === index ? { ...b, enabled: !b.enabled } : b))
    );
  };

  const autoIntegrateBrowser = (index: number) => {
    setBrowsers((prev) =>
      prev.map((b, i) => (i === index ? { ...b, enabled: true, autoIntegrated: true } : b))
    );
    setSaveNotification(`Automatically registered Archimedes ${APP_VERSION_SHORT} extension into ${browsers[index].name}!`);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 animate-fadeIn ${theme.backdrop}`}>
      <div
        className={`rounded-xl shadow-2xl w-[33vw] min-w-[320px] max-w-[95vw] min-h-[280px] max-h-[85vh] flex flex-col relative ${theme.window}`}
        style={{ resize: 'both', overflow: 'auto' }}
      >
        {/* Title Bar */}
        <div className={`px-3.5 py-2.5 flex items-center justify-between select-none border-b pr-8 rounded-t-xl ${theme.header}`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <h2 className={`text-xs sm:text-sm font-extrabold tracking-tight truncate ${theme.headerTitle}`}>
              Archimedes Download Manager Configuration ({APP_VERSION_SHORT})
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded flex items-center justify-center transition-colors ${theme.closeBtn}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center border-b px-2 pt-2 gap-1 overflow-x-auto text-xs ${theme.card} ${theme.borderColor}`}>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'general'
                ? theme.tabActive
                : theme.tabInactive
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>General</span>
          </button>

          <button
            onClick={() => setActiveTab('connection')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'connection'
                ? theme.tabActive
                : theme.tabInactive
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Connection</span>
          </button>

          <button
            onClick={() => setActiveTab('saveto')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'saveto'
                ? theme.tabActive
                : theme.tabInactive
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Save To</span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'downloads'
                ? theme.tabActive
                : theme.tabInactive
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Downloads</span>
          </button>

          <button
            onClick={() => setActiveTab('filetypes')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'filetypes'
                ? theme.tabActive
                : theme.tabInactive
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>File Types</span>
          </button>

          <button
            onClick={() => setActiveTab('proxy')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'proxy'
                ? theme.tabActive
                : theme.tabInactive
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Proxy / Socks</span>
          </button>

          <button
            onClick={() => setActiveTab('sitelogins')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'sitelogins'
                ? theme.tabActive
                : theme.tabInactive
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Site Logins</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
          {saveNotification && (
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn font-medium">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{saveNotification}</span>
            </div>
          )}

          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border space-y-2.5 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center gap-1.5 ${theme.borderColor} ${theme.textPrimary}`}>
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Startup & Clipboard Settings</span>
                </div>
                <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                  <input
                    type="checkbox"
                    checked={launchOnStartup}
                    onChange={(e) => setLaunchOnStartup(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Launch Archimedes Download Manager on system startup</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                  <input
                    type="checkbox"
                    checked={captureClipboard}
                    onChange={(e) => setCaptureClipboard(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Automatically capture URLs copied to clipboard</span>
                </label>
              </div>

              <div className={`p-3 rounded-lg border space-y-2.5 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center justify-between ${theme.borderColor}`}>
                  <div className={`flex items-center gap-1.5 ${theme.textPrimary}`}>
                    <Globe className="w-3.5 h-3.5 text-orange-500" />
                    <span>Integrated Browser Integration Module</span>
                  </div>
                  {onOpenExtensionModal && (
                    <button
                      onClick={onOpenExtensionModal}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 transition-all flex items-center gap-1 shrink-0"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Extension Hub & Automatic Installer</span>
                    </button>
                  )}
                </div>
                <p className={`text-[11px] ${theme.textMuted}`}>
                  Archimedes Download Manager integrates automatically with the following web browsers to catch download requests automatically:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {browsers.map((b, idx) => (
                    <div
                      key={b.name}
                      className={`flex items-center justify-between p-2 rounded border transition-all ${theme.input}`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer min-w-0">
                        <input
                          type="checkbox"
                          checked={b.enabled}
                          onChange={() => toggleBrowser(idx)}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className={`font-medium text-xs truncate ${theme.textPrimary}`}>{b.name}</span>
                      </label>

                      <div className="flex items-center gap-1 shrink-0">
                        {b.autoIntegrated ? (
                          <button
                            onClick={() => autoIntegrateBrowser(idx)}
                            className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Re-integrate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => autoIntegrateBrowser(idx)}
                            className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all"
                          >
                            Integrate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-3 rounded-lg border space-y-2 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center gap-1.5 ${theme.borderColor} ${theme.textPrimary}`}>
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Completion Notifications</span>
                </div>
                <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                  <input
                    type="checkbox"
                    checked={showCompleteDialog}
                    onChange={(e) => setShowCompleteDialog(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Show "Download Complete" pop-up window upon finish</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                  <input
                    type="checkbox"
                    checked={playSound}
                    onChange={(e) => setPlaySound(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Play notification audio chime when download finishes</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: CONNECTION */}
          {activeTab === 'connection' && (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border space-y-3 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center gap-1.5 ${theme.borderColor} ${theme.textPrimary}`}>
                  <Wifi className="w-3.5 h-3.5 text-sky-500" />
                  <span>Internet Connection Type & Speed</span>
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] font-medium ${theme.textSecondary}`}>Connection Type / Speed:</label>
                  <select
                    value={connectionType}
                    onChange={(e) => setConnectionType(e.target.value)}
                    className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${theme.input}`}
                  >
                    <option value="high">High Speed: Direct Connection (Ethernet / Cable / Fiber / 4G / 5G)</option>
                    <option value="medium">Medium Speed: Wi-Fi / 3G / Mobile Data</option>
                    <option value="low">Low Speed: Dial-Up / ISDN / Satellite</option>
                  </select>
                </div>

                <div className="space-y-1 pt-1">
                  <label className={`text-[11px] font-medium ${theme.textSecondary}`}>
                    Default Max. Connection Number (Threads per task):
                  </label>
                  <select
                    value={maxThreads}
                    onChange={(e) => setMaxThreads(Number(e.target.value))}
                    className={`w-full rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none ${theme.input}`}
                  >
                    <option value={1}>1 Connection (Single Segment)</option>
                    <option value={2}>2 Connections</option>
                    <option value={4}>4 Connections</option>
                    <option value={8}>8 Connections (Recommended)</option>
                    <option value={16}>16 Connections (Maximum Performance)</option>
                    <option value={24}>24 Connections (Ultra Parallel)</option>
                    <option value={32}>32 Connections (Extreme)</option>
                  </select>
                  <p className={`text-[10px] ${theme.textMuted}`}>
                    ADM dynamically segments files into these worker channels to saturate available bandwidth.
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-lg border space-y-3 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center gap-1.5 ${theme.borderColor} ${theme.textPrimary}`}>
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  <span>Speed Limiter Settings</span>
                </div>

                <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                  <input
                    type="checkbox"
                    checked={enableSpeedLimitOnStart}
                    onChange={(e) => setEnableSpeedLimitOnStart(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span className="font-medium">Enable Speed Limiter on startup</span>
                </label>

                {enableSpeedLimitOnStart && (
                  <div className="pl-6 space-y-1.5 animate-fadeIn">
                    <label className={`text-[11px] ${theme.textMuted}`}>Maximum download speed (KB/s):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={10}
                        max={100000}
                        value={speedLimitValue}
                        onChange={(e) => setSpeedLimitValue(Number(e.target.value))}
                        className={`w-36 rounded px-2 py-1 font-mono text-xs focus:outline-none ${theme.input}`}
                      />
                      <span className={theme.textMuted}>KB/s ({Math.round((speedLimitValue / 1024) * 10) / 10} MB/s)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SAVE TO */}
          {activeTab === 'saveto' && (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border space-y-2.5 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center gap-1.5 ${theme.borderColor} ${theme.textPrimary}`}>
                  <Folder className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Default Download Directories</span>
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] ${theme.textSecondary}`}>Default Download Directory:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={defaultDir}
                      onChange={(e) => setDefaultDir(e.target.value)}
                      className={`flex-1 rounded px-2.5 py-1 text-xs font-mono focus:outline-none ${theme.input}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const dirs = ['/downloads/', 'C:\\Users\\User\\Downloads\\', 'D:\\Downloads\\', '/home/user/Downloads/'];
                        const nextIndex = (dirs.indexOf(defaultDir) + 1) % dirs.length;
                        setDefaultDir(dirs[nextIndex]);
                      }}
                      className={`px-3 py-1 rounded font-semibold text-xs ${theme.btnSecondary}`}
                      title="Click to cycle example download folders"
                    >
                      Browse...
                    </button>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className={`text-[11px] ${theme.textSecondary}`}>Temporary Download Directory (.adm_temp):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempDir}
                      onChange={(e) => setTempDir(e.target.value)}
                      className={`flex-1 rounded px-2.5 py-1 text-xs font-mono focus:outline-none ${theme.input}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const dirs = ['/downloads/.adm_temp/', 'C:\\Users\\User\\AppData\\Local\\Temp\\adm\\', 'D:\\Temp\\.adm_temp\\'];
                        const nextIndex = (dirs.indexOf(tempDir) + 1) % dirs.length;
                        setTempDir(dirs[nextIndex]);
                      }}
                      className={`px-3 py-1 rounded font-semibold text-xs ${theme.btnSecondary}`}
                      title="Click to cycle example temp folders"
                    >
                      Browse...
                    </button>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg border space-y-2 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center gap-1.5 ${theme.borderColor} ${theme.textPrimary}`}>
                  <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Category Target Folders</span>
                </div>

                <label className={`flex items-center gap-2 cursor-pointer pb-1 ${theme.textSecondary}`}>
                  <input
                    type="checkbox"
                    checked={autoCategorize}
                    onChange={(e) => setAutoCategorize(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Automatically organize downloads into category folders</span>
                </label>

                <div className="space-y-1.5 pt-1">
                  {Object.entries(categoryDirs).map(([cat, dir]) => (
                    <div key={cat} className="flex items-center gap-2 text-[11px]">
                      <span className={`w-24 font-semibold ${theme.textMuted}`}>{cat}:</span>
                      <input
                        type="text"
                        value={dir}
                        onChange={(e) =>
                          setCategoryDirs({ ...categoryDirs, [cat]: e.target.value })
                        }
                        className={`flex-1 rounded px-2 py-0.5 font-mono text-xs focus:outline-none ${theme.input}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOWNLOADS */}
          {activeTab === 'downloads' && (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border space-y-2.5 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center gap-1.5 ${theme.borderColor} ${theme.textPrimary}`}>
                  <Download className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Download Dialog Windows</span>
                </div>

                <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                  <input
                    type="checkbox"
                    checked={showStartDialog}
                    onChange={(e) => setShowStartDialog(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Show "Start Download" confirmation box before fetching</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                  <input
                    type="checkbox"
                    checked={showProgressDialog}
                    onChange={(e) => setShowProgressDialog(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Show real-time transfer progress modal</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                  <input
                    type="checkbox"
                    checked={autoResume}
                    onChange={(e) => setAutoResume(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Automatically resume interrupted transfers on server reconnect</span>
                </label>
              </div>

              <div className={`p-3 rounded-lg border space-y-2.5 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center gap-1.5 ${theme.borderColor} ${theme.textPrimary}`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Virus Protection Integration</span>
                </div>

                <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                  <input
                    type="checkbox"
                    checked={enableVirusScan}
                    onChange={(e) => setEnableVirusScan(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Scan completed downloads with Antivirus program</span>
                </label>

                {enableVirusScan && (
                  <div className="pl-6 space-y-2 animate-fadeIn pt-1">
                    <label className={`text-[11px] ${theme.textMuted}`}>Executable Path:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={virusScanPath}
                        onChange={(e) => setVirusScanPath(e.target.value)}
                        className={`flex-1 rounded px-2.5 py-1 text-xs font-mono focus:outline-none ${theme.input}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const paths = [
                            'C:\\Program Files\\Windows Defender\\MpCmdRun.exe',
                            'C:\\Program Files\\Avast Software\\Avast\\AvastEmUpdate.exe',
                            'C:\\Program Files\\Malwarebytes\\MBAMService.exe',
                            '/usr/bin/clamscan',
                          ];
                          const nextIndex = (paths.indexOf(virusScanPath) + 1) % paths.length;
                          setVirusScanPath(paths[nextIndex]);
                        }}
                        className={`px-3 py-1 rounded font-semibold text-xs ${theme.btnSecondary}`}
                      >
                        Browse...
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: FILE TYPES */}
          {activeTab === 'filetypes' && (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border space-y-2 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center gap-1.5 ${theme.borderColor} ${theme.textPrimary}`}>
                  <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Automatically Intercept File Extensions</span>
                </div>
                <p className={`text-[11px] ${theme.textMuted}`}>
                  ADM will automatically capture download requests for files with the following extensions:
                </p>

                <textarea
                  rows={4}
                  value={fileTypes}
                  onChange={(e) => setFileTypes(e.target.value)}
                  className={`w-full rounded-lg p-2 font-mono text-xs uppercase focus:outline-none ${theme.input}`}
                />
              </div>

              <div className={`p-3 rounded-lg border space-y-2 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center gap-1.5 ${theme.borderColor} ${theme.textPrimary}`}>
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Don't Start Downloading Automatically From Address List</span>
                </div>
                <p className={`text-[11px] ${theme.textMuted}`}>
                  List web domains or URLs where ADM should never automatically intercept downloads:
                </p>

                <textarea
                  rows={3}
                  value={exceptions}
                  onChange={(e) => setExceptions(e.target.value)}
                  className={`w-full rounded-lg p-2 font-mono text-xs focus:outline-none ${theme.input}`}
                />
              </div>
            </div>
          )}

          {/* TAB 6: PROXY / SOCKS */}
          {activeTab === 'proxy' && (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border space-y-2.5 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center gap-1.5 ${theme.borderColor} ${theme.textPrimary}`}>
                  <Server className="w-3.5 h-3.5 text-sky-500" />
                  <span>Proxy Server Configuration</span>
                </div>

                <div className="space-y-2 pt-1">
                  <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                    <input
                      type="radio"
                      name="proxymode"
                      checked={proxyMode === 'none'}
                      onChange={() => setProxyMode('none')}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <span className="font-medium">No proxy (Direct Internet Connection)</span>
                  </label>

                  <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                    <input
                      type="radio"
                      name="proxymode"
                      checked={proxyMode === 'system'}
                      onChange={() => setProxyMode('system')}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <span className="font-medium">Use System / Internet Explorer Proxy Settings</span>
                  </label>

                  <label className={`flex items-center gap-2 cursor-pointer ${theme.textSecondary}`}>
                    <input
                      type="radio"
                      name="proxymode"
                      checked={proxyMode === 'manual'}
                      onChange={() => setProxyMode('manual')}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <span className="font-medium">Manual HTTP / HTTPS Proxy Configuration</span>
                  </label>
                </div>

                {proxyMode === 'manual' && (
                  <div className="pl-6 pt-2 grid grid-cols-3 gap-2 animate-fadeIn">
                    <div className="col-span-2 space-y-1">
                      <label className={`text-[10px] ${theme.textMuted}`}>Proxy Host / IP:</label>
                      <input
                        type="text"
                        placeholder="127.0.0.1 or proxy.domain.com"
                        value={proxyHost}
                        onChange={(e) => setProxyHost(e.target.value)}
                        className={`w-full rounded px-2 py-1 font-mono text-xs focus:outline-none ${theme.input}`}
                      />
                    </div>
                    <div className="col-span-1 space-y-1">
                      <label className={`text-[10px] ${theme.textMuted}`}>Port:</label>
                      <input
                        type="text"
                        placeholder="8080"
                        value={proxyPort}
                        onChange={(e) => setProxyPort(e.target.value)}
                        className={`w-full rounded px-2 py-1 font-mono text-xs focus:outline-none ${theme.input}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: SITE LOGINS */}
          {activeTab === 'sitelogins' && (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border space-y-2.5 ${theme.card}`}>
                <div className={`font-bold text-xs border-b pb-1 flex items-center justify-between ${theme.borderColor} ${theme.textPrimary}`}>
                  <div className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span>Saved Password Credentials for Protected Servers</span>
                  </div>
                  <button
                    onClick={() => setShowAddSiteForm(!showAddSiteForm)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold ${theme.btnPrimary}`}
                  >
                    {showAddSiteForm ? 'Cancel' : '+ Add New Site'}
                  </button>
                </div>

                {showAddSiteForm && (
                  <div className={`p-2.5 rounded-lg border space-y-2 text-xs animate-fadeIn ${theme.borderColor} ${theme.codeBg}`}>
                    <div className="font-semibold text-[11px] text-indigo-400">Add Site Credential</div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="https://example.com/*"
                        value={newSiteUrl}
                        onChange={(e) => setNewSiteUrl(e.target.value)}
                        className={`rounded px-2 py-1 text-xs font-mono focus:outline-none ${theme.input}`}
                      />
                      <input
                        type="text"
                        placeholder="Username"
                        value={newSiteUser}
                        onChange={(e) => setNewSiteUser(e.target.value)}
                        className={`rounded px-2 py-1 text-xs font-mono focus:outline-none ${theme.input}`}
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={newSitePass}
                        onChange={(e) => setNewSitePass(e.target.value)}
                        className={`rounded px-2 py-1 text-xs font-mono focus:outline-none ${theme.input}`}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={handleAddSiteLogin}
                        className={`px-3 py-1 rounded text-xs font-bold ${theme.btnPrimary}`}
                      >
                        Save Credential
                      </button>
                    </div>
                  </div>
                )}

                <div className={`border rounded-lg overflow-hidden ${theme.card}`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`font-semibold border-b ${theme.borderColor} ${theme.codeBg}`}>
                      <tr>
                        <th className={`p-2 ${theme.textMuted}`}>Server / URL Pattern</th>
                        <th className={`p-2 ${theme.textMuted}`}>Username</th>
                        <th className={`p-2 ${theme.textMuted}`}>Password</th>
                        <th className={`p-2 text-right ${theme.textMuted}`}>Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme.borderColor} ${theme.textSecondary}`}>
                      {siteLogins.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-3 text-center text-slate-500 italic">
                            No site logins saved yet.
                          </td>
                        </tr>
                      ) : (
                        siteLogins.map((site) => (
                          <tr key={site.id}>
                            <td className="p-2 font-mono text-[11px] text-indigo-500 font-bold">{site.url}</td>
                            <td className="p-2 font-mono text-[11px]">{site.username}</td>
                            <td className="p-2 font-mono text-[11px]">{site.password}</td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => handleRemoveSiteLogin(site.id)}
                                className="text-rose-500 hover:text-rose-400 font-bold text-[10px] px-1.5 py-0.5 rounded border border-rose-500/20 hover:bg-rose-500/10"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`px-3 py-2 border-t flex items-center justify-between shrink-0 relative rounded-b-xl ${theme.footer}`}>
          <div className={`text-[10px] flex items-center gap-1.5 truncate ${theme.textMuted}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">Archimedes {APP_VERSION_SHORT} Engine Active</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pr-2">
            <button
              onClick={handleSave}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${theme.btnPrimary}`}
            >
              OK
            </button>
            <button
              onClick={onClose}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${theme.btnSecondary}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${theme.btnSecondary}`}
            >
              Apply
            </button>
          </div>

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