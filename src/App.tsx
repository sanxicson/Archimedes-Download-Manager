import React, { useState, useEffect } from 'react';
import { DownloadTask, DownloadSegment, BandwidthPoint, AdmStateFile } from './types/adm';
import { ColorTheme } from './utils/modalTheme';
import { AdmHeader } from './components/AdmHeader';
import { DownloadList } from './components/DownloadList';
import { SegmentVisualizer } from './components/SegmentVisualizer';
import { SpeedGraph } from './components/SpeedGraph';
import { StateInspector } from './components/StateInspector';
import { AddDownloadModal } from './components/AddDownloadModal';
import { VideoGrabberPanel } from './components/VideoGrabberPanel';
import { ExportExeModal } from './components/ExportExeModal';
import { FirefoxExtensionModal } from './components/FirefoxExtensionModal';
import { InstallExtensionModal } from './components/InstallExtensionModal';
import { ClassicAdmLayout } from './components/ClassicAdmLayout';
import { AdmOptionsModal } from './components/AdmOptionsModal';
import { UiStyleSelectorModal, UiStyleOption } from './components/UiStyleSelectorModal';
import { Sparkles, Monitor, Layout } from 'lucide-react';
import {
  probeFileInfo,
  executeRealDownload,
  saveFileToDisk,
  storeCompletedBlob,
  getCompletedBlob,
} from './utils/realDownloader';

const COLOR_PALETTE = [
  '#6366f1', '#10b981', '#f59e0b', '#ec4899',
  '#06b6d4', '#8b5cf6', '#3b82f6', '#14b8a6',
  '#f97316', '#a855f7', '#84cc16', '#e11d48'
];

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportExeOpen, setIsExportExeOpen] = useState(false);
  const [isFirefoxModalOpen, setIsFirefoxModalOpen] = useState(false);
  const [isInstallExtensionOpen, setIsInstallExtensionOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isUiSelectorOpen, setIsUiSelectorOpen] = useState(false);
  const [uiStyle, setUiStyle] = useState<UiStyleOption>('classic');
  const [isCompactWindow, setIsCompactWindow] = useState<boolean>(true);
  const [speedLimitKbps, setSpeedLimitKbps] = useState(0); // 0 = unlimited
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    return (localStorage.getItem('adm_color_theme') as ColorTheme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('adm_color_theme', colorTheme);
  }, [colorTheme]);

  // Downloads State
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Bandwidth history for chart
  const [bandwidthHistory, setBandwidthHistory] = useState<BandwidthPoint[]>([]);

  // Selected task reference
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0] || null;

  // Calculate global transfer speed
  const totalSpeedBps = tasks.reduce((sum, t) => sum + (t.status === 'Downloading' ? t.currentSpeedBps : 0), 0);
  const activeCount = tasks.filter((t) => t.status === 'Downloading').length;

  // High-frequency simulation loop for downloading and work stealing
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.status !== 'Downloading') return task;

          // Apply speed limit throttling if configured
          const targetLimitBps = speedLimitKbps > 0 ? speedLimitKbps * 1024 : 16777216; // 16 MB/s default max
          const bytesPerTick = Math.floor(targetLimitBps / 5); // 200ms tick

          let bytesAddedTotal = 0;
          let updatedSegments = task.segments.map((seg) => {
            if (seg.status !== 'downloading') return seg;

            const remainingInChunk = seg.endByte - seg.currentByte;
            if (remainingInChunk <= 0) {
              return { ...seg, status: 'completed' as const, speedBytesPerSec: 0 };
            }

            const activeWorkersCount = task.segments.filter((s) => s.status === 'downloading').length || 1;
            const workerShare = Math.min(
              remainingInChunk,
              Math.floor(bytesPerTick / activeWorkersCount)
            );

            bytesAddedTotal += workerShare;
            const nextCurrent = seg.currentByte + workerShare;
            const isDone = nextCurrent >= seg.endByte;

            return {
              ...seg,
              currentByte: nextCurrent,
              status: isDone ? ('completed' as const) : ('downloading' as const),
              speedBytesPerSec: workerShare * 5,
            };
          });

          const newDownloadedBytes = Math.min(task.totalSize, task.downloadedBytes + bytesAddedTotal);
          const currentSpeedBps = bytesAddedTotal * 5;
          const remainingBytes = task.totalSize - newDownloadedBytes;
          const etaSeconds = currentSpeedBps > 0 ? Math.ceil(remainingBytes / currentSpeedBps) : 0;
          const isComplete = newDownloadedBytes >= task.totalSize;

          // Sync .adm_state
          const updatedStateFile: AdmStateFile = {
            ...task.stateFile,
            speedLimitBps: speedLimitKbps * 1024,
            lastSavedAt: new Date().toISOString(),
            activeSegments: updatedSegments.map((s) => ({
              id: s.id,
              start: s.startByte,
              end: s.endByte,
              current: s.currentByte,
            })),
          };

          return {
            ...task,
            downloadedBytes: newDownloadedBytes,
            currentSpeedBps,
            etaSeconds,
            status: isComplete ? 'Completed' : 'Downloading',
            segments: updatedSegments,
            stateFile: updatedStateFile,
          };
        })
      );

      // Update speed graph
      if (selectedTask && selectedTask.status === 'Downloading') {
        setBandwidthHistory((prev) => {
          const nowStr = new Date().toLocaleTimeString();
          const nextKbps = Math.round(selectedTask.currentSpeedBps / 1024);
          const next = [...prev, { time: nowStr, speedKbps: nextKbps, limitKbps: speedLimitKbps }];
          return next.slice(-20); // Keep last 20 ticks
        });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [speedLimitKbps, selectedTask]);

  // Action Handlers
  const handleTriggerWorkSteal = () => {
    if (!selectedTask || selectedTask.segments.length === 0) return;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== selectedTaskId) return task;

        // Find worker with largest remaining byte range
        let maxRemaining = 0;
        let candidateIdx = -1;

        task.segments.forEach((seg, idx) => {
          const remaining = seg.endByte - seg.currentByte;
          if (remaining > maxRemaining) {
            maxRemaining = remaining;
            candidateIdx = idx;
          }
        });

        if (candidateIdx !== -1 && maxRemaining > 1024 * 512) {
          const target = task.segments[candidateIdx];
          const mid = target.currentByte + Math.floor(maxRemaining / 2);

          const updatedTarget: DownloadSegment = {
            ...target,
            endByte: mid,
          };

          const newWorkerId = task.segments.length;
          const stolenSegment: DownloadSegment = {
            id: newWorkerId,
            workerId: newWorkerId,
            startByte: mid + 1,
            endByte: target.endByte,
            currentByte: mid + 1,
            status: 'downloading',
            speedBytesPerSec: 1048576,
            color: COLOR_PALETTE[newWorkerId % COLOR_PALETTE.length],
          };

          const newSegments = [...task.segments];
          newSegments[candidateIdx] = updatedTarget;
          newSegments.push(stolenSegment);

          return {
            ...task,
            threadsCount: newSegments.length,
            segments: newSegments,
          };
        }

        return task;
      })
    );
  };

  const handlePauseWorker = (workerId: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== selectedTaskId) return task;
        return {
          ...task,
          segments: task.segments.map((seg) =>
            seg.workerId === workerId ? { ...seg, status: 'idle' } : seg
          ),
        };
      })
    );
  };

  const handleResumeWorker = (workerId: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== selectedTaskId) return task;
        return {
          ...task,
          segments: task.segments.map((seg) =>
            seg.workerId === workerId ? { ...seg, status: 'downloading' } : seg
          ),
        };
      })
    );
  };

  const handleSimulateCrash = () => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== selectedTaskId) return task;
        return {
          ...task,
          status: 'Paused',
          currentSpeedBps: 0,
        };
      })
    );
  };

  const handleResumeFromState = () => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== selectedTaskId) return task;
        return {
          ...task,
          status: 'Downloading',
          segments: task.segments.map((s) => ({ ...s, status: 'downloading' })),
        };
      })
    );
  };

  const startRealTaskExecution = async (
    taskId: string,
    targetUrl: string,
    targetFilename: string,
    threads: number,
    totalBytes: number,
    saveFolder: string = '/downloads/',
    promptForLocation: boolean = false
  ) => {
    let cancelled = false;

    try {
      const blob = await executeRealDownload(
        targetUrl,
        totalBytes,
        threads,
        (downloaded, speedBps, segmentBytes) => {
          setTasks((prev) =>
            prev.map((t) => {
              if (t.id !== taskId) return t;
              const remaining = t.totalSize - downloaded;
              const eta = speedBps > 0 ? Math.ceil(remaining / speedBps) : 0;

              const updatedSegments = t.segments.map((s, idx) => {
                const segDownloaded = segmentBytes[idx] || 0;
                const segCurrent = s.startByte + segDownloaded;
                return {
                  ...s,
                  currentByte: Math.min(s.endByte, segCurrent),
                  status: segCurrent >= s.endByte ? ('completed' as const) : ('downloading' as const),
                  speedBytesPerSec: Math.floor(speedBps / threads),
                };
              });

              return {
                ...t,
                downloadedBytes: downloaded,
                currentSpeedBps: Math.round(speedBps),
                etaSeconds: eta,
                segments: updatedSegments,
              };
            })
          );
        },
        () => cancelled
      );

      // Store real downloaded blob
      storeCompletedBlob(taskId, blob);

      // Update task to completed
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: 'Completed',
            downloadedBytes: t.totalSize || blob.size,
            currentSpeedBps: 0,
            etaSeconds: 0,
            completedAt: new Date().toISOString(),
            segments: t.segments.map((s) => ({ ...s, status: 'completed', currentByte: s.endByte })),
          };
        })
      );

      // Save file to chosen folder location or trigger file picker if custom folder selected
      const forcePicker = promptForLocation || (saveFolder !== '/downloads/' && saveFolder !== '/downloads');
      await saveFileToDisk(blob, targetFilename, forcePicker);
    } catch (err) {
      console.error('[App] Real download failed:', err);
    }
  };

  const handleAddDownload = async (
    url: string,
    filename: string,
    threads: number,
    speedLimit: number,
    category: any = 'General',
    saveFolder: string = '/downloads/',
    promptForLocation: boolean = false
  ) => {
    // Probe real URL
    const meta = await probeFileInfo(url);
    const realSize = meta.totalBytes > 0 ? meta.totalBytes : 10485760; // 10 MB fallback if unknown
    const realFilename = filename || meta.filename;
    const taskId = `task-${Date.now()}`;

    const chunkSize = Math.floor(realSize / threads);
    const segments: DownloadSegment[] = Array.from({ length: threads }).map((_, i) => {
      const start = i * chunkSize;
      const end = i === threads - 1 ? realSize - 1 : (i + 1) * chunkSize - 1;
      return {
        id: i,
        workerId: i,
        startByte: start,
        endByte: end,
        currentByte: start,
        status: 'downloading',
        speedBytesPerSec: 0,
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
      };
    });

    const formattedSavePath = saveFolder.endsWith('/') ? `${saveFolder}${realFilename}` : `${saveFolder}/${realFilename}`;

    const newTask: DownloadTask = {
      id: taskId,
      filename: realFilename,
      url,
      category: (category as any) || 'General',
      totalSize: realSize,
      downloadedBytes: 0,
      status: 'Downloading',
      currentSpeedBps: 0,
      threadsCount: threads,
      speedLimitBps: speedLimit * 1024,
      etaSeconds: 0,
      savePath: formattedSavePath,
      createdAt: new Date().toISOString(),
      segments,
      stateFile: {
        version: '2.5.0',
        url,
        filename: realFilename,
        totalBytes: realSize,
        etag: meta.etag || `"etag-${Date.now()}"`,
        lastModified: new Date().toUTCString(),
        supportsRanges: meta.supportsRanges,
        workerCount: threads,
        speedLimitBps: speedLimit * 1024,
        completedRanges: [],
        activeSegments: [],
        lastSavedAt: new Date().toISOString(),
      },
    };

    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(taskId);

    startRealTaskExecution(taskId, url, realFilename, threads, realSize, saveFolder, promptForLocation);
  };

  // Poll extension queue for automatic download interception from Firefox/Chrome extension
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/downloads/queue');
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            for (const item of data.items) {
              handleAddDownload(item.url, item.filename || 'download_file', 8, 0);
            }
          }
        }
      } catch (err) {
        // server offline or dev mode loading
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleAddVideoDownload = async (
    url: string,
    filename: string,
    quality: string,
    sizeBytes: number
  ) => {
    const meta = await probeFileInfo(url);
    const realSize = meta.totalBytes > 0 ? meta.totalBytes : sizeBytes;
    const realFilename = filename || meta.filename;
    const taskId = `task-video-${Date.now()}`;
    const threads = 8;

    const chunkSize = Math.floor(realSize / threads);
    const segments: DownloadSegment[] = Array.from({ length: threads }).map((_, i) => {
      const start = i * chunkSize;
      const end = i === threads - 1 ? realSize - 1 : (i + 1) * chunkSize - 1;
      return {
        id: i,
        workerId: i,
        startByte: start,
        endByte: end,
        currentByte: start,
        status: 'downloading',
        speedBytesPerSec: 0,
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
      };
    });

    const newTask: DownloadTask = {
      id: taskId,
      filename: realFilename,
      url,
      category: 'General',
      totalSize: realSize,
      downloadedBytes: 0,
      status: 'Downloading',
      currentSpeedBps: 0,
      threadsCount: threads,
      speedLimitBps: 0,
      etaSeconds: 0,
      savePath: `/downloads/videos/${realFilename}`,
      createdAt: new Date().toISOString(),
      segments,
      stateFile: {
        version: '2.5.0',
        url,
        filename: realFilename,
        totalBytes: realSize,
        etag: `"yt-${quality}-${Date.now()}"`,
        lastModified: new Date().toUTCString(),
        supportsRanges: true,
        workerCount: threads,
        speedLimitBps: 0,
        completedRanges: [],
        activeSegments: [],
        lastSavedAt: new Date().toISOString(),
      },
    };

    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(taskId);

    startRealTaskExecution(taskId, url, realFilename, threads, realSize);
  };

  const handleSaveToDisk = async (task: DownloadTask, forcePicker: boolean) => {
    let blob = getCompletedBlob(task.id);
    if (!blob) {
      try {
        const res = await fetch(`/api/download-chunk?url=${encodeURIComponent(task.url)}`);
        blob = await res.blob();
      } catch {
        blob = new Blob([`Downloaded contents for ${task.filename}\nVia ADM Engine.`], {
          type: 'application/octet-stream',
        });
      }
    }
    await saveFileToDisk(blob, task.filename, forcePicker);
  };

  const handleToggleSpeedLimitModal = () => {
    setIsOptionsModalOpen(true);
  };



  return (
    <div className="h-screen flex flex-col font-sans transition-colors duration-200 overflow-hidden">
      <ClassicAdmLayout
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={setSelectedTaskId}
        onPauseTask={(id) =>
          setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: 'Paused', currentSpeedBps: 0 } : t))
          )
        }
        onResumeTask={(id) =>
          setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: 'Downloading' } : t))
          )
        }
        onDeleteTask={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onStopAll={() => setTasks((prev) => prev.map((t) => ({ ...t, status: 'Paused', currentSpeedBps: 0 })))}
        onResumeAll={() => setTasks((prev) => prev.map((t) => ({ ...t, status: 'Downloading' })))}
        totalSpeedBps={totalSpeedBps}
        speedLimitKbps={speedLimitKbps}
        onToggleSpeedLimitModal={handleToggleSpeedLimitModal}
        onInstallExtensionClick={() => setIsInstallExtensionOpen(true)}
        onOpenUiSelector={() => setIsUiSelectorOpen(true)}
        colorTheme={colorTheme}
        onChangeColorTheme={setColorTheme}
      />

      {/* Modals */}
      <AddDownloadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDownload={handleAddDownload}
        colorTheme={colorTheme}
      />

      <ExportExeModal
        isOpen={isExportExeOpen}
        onClose={() => setIsExportExeOpen(false)}
        colorTheme={colorTheme}
      />

      <FirefoxExtensionModal
        isOpen={isFirefoxModalOpen}
        onClose={() => setIsFirefoxModalOpen(false)}
        colorTheme={colorTheme}
        onAddDownload={handleAddDownload}
      />

      <InstallExtensionModal
        isOpen={isInstallExtensionOpen}
        onClose={() => setIsInstallExtensionOpen(false)}
        colorTheme={colorTheme}
        onAddDownload={handleAddDownload}
      />

      <AdmOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        speedLimitKbps={speedLimitKbps}
        onUpdateSpeedLimitKbps={setSpeedLimitKbps}
        colorTheme={colorTheme}
        onOpenExtensionModal={() => setIsInstallExtensionOpen(true)}
      />

      <UiStyleSelectorModal
        isOpen={isUiSelectorOpen}
        onClose={() => setIsUiSelectorOpen(false)}
        currentStyle={uiStyle}
        onSelectStyle={(s) => {
          setUiStyle(s);
          setIsUiSelectorOpen(false);
        }}
        isCompactWindow={isCompactWindow}
        onToggleCompactWindow={setIsCompactWindow}
        colorTheme={colorTheme}
        onChangeColorTheme={setColorTheme}
      />
    </div>
  );
}

