import React, { useState, useEffect } from 'react';
import { DownloadTask, DownloadSegment, BandwidthPoint, IdmStateFile } from './types/idm';
import { IdmHeader } from './components/IdmHeader';
import { DownloadList } from './components/DownloadList';
import { SegmentVisualizer } from './components/SegmentVisualizer';
import { SpeedGraph } from './components/SpeedGraph';
import { StateInspector } from './components/StateInspector';
import { AddDownloadModal } from './components/AddDownloadModal';
import { VideoGrabberPanel } from './components/VideoGrabberPanel';
import { ExportExeModal } from './components/ExportExeModal';
import { FirefoxExtensionModal } from './components/FirefoxExtensionModal';

const COLOR_PALETTE = [
  '#6366f1', '#10b981', '#f59e0b', '#ec4899',
  '#06b6d4', '#8b5cf6', '#3b82f6', '#14b8a6',
  '#f97316', '#a855f7', '#84cc16', '#e11d48'
];

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportExeOpen, setIsExportExeOpen] = useState(false);
  const [isFirefoxModalOpen, setIsFirefoxModalOpen] = useState(false);
  const [speedLimitKbps, setSpeedLimitKbps] = useState(0); // 0 = unlimited

  // Initial Downloads
  const [tasks, setTasks] = useState<DownloadTask[]>([
    {
      id: 'task-1',
      filename: 'ubuntu-24.04-desktop-amd64.iso',
      url: 'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso',
      category: 'General',
      totalSize: 6291456000, // ~6 GB
      downloadedBytes: 2516582400, // ~2.4 GB
      status: 'Downloading',
      currentSpeedBps: 8388608, // 8 MB/s
      threadsCount: 8,
      speedLimitBps: 0,
      etaSeconds: 450,
      savePath: '/downloads/ubuntu-24.04-desktop-amd64.iso',
      createdAt: new Date().toISOString(),
      segments: Array.from({ length: 8 }).map((_, i) => {
        const totalSize = 6291456000;
        const chunkSize = Math.floor(totalSize / 8);
        const start = i * chunkSize;
        const end = i === 7 ? totalSize - 1 : (i + 1) * chunkSize - 1;
        const current = start + Math.floor((end - start) * 0.4);
        return {
          id: i,
          workerId: i,
          startByte: start,
          endByte: end,
          currentByte: current,
          status: 'downloading',
          speedBytesPerSec: 1048576, // 1 MB/s each
          color: COLOR_PALETTE[i % COLOR_PALETTE.length],
        };
      }),
      stateFile: {
        version: '2.5.0',
        url: 'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso',
        filename: 'ubuntu-24.04-desktop-amd64.iso',
        totalBytes: 6291456000,
        etag: '"6628b12f-177000000"',
        lastModified: 'Wed, 24 Apr 2024 12:00:00 GMT',
        supportsRanges: true,
        workerCount: 8,
        speedLimitBps: 0,
        completedRanges: [],
        activeSegments: [],
        lastSavedAt: new Date().toISOString(),
      },
    },
    {
      id: 'task-2',
      filename: '4k_demo_60fps.mp4',
      url: 'https://cdn.example.org/media/4k_video_stream.mp4',
      category: 'General',
      totalSize: 1048576000, // ~1 GB
      downloadedBytes: 1048576000,
      status: 'Completed',
      currentSpeedBps: 0,
      threadsCount: 8,
      speedLimitBps: 0,
      etaSeconds: 0,
      savePath: '/downloads/videos/4k_demo_60fps.mp4',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      segments: [],
      stateFile: {
        version: '2.5.0',
        url: 'https://cdn.example.org/media/4k_video_stream.mp4',
        filename: '4k_demo_60fps.mp4',
        totalBytes: 1048576000,
        etag: '"59f12a-4k-demo"',
        lastModified: 'Mon, 12 Feb 2026 18:30:00 GMT',
        supportsRanges: true,
        workerCount: 8,
        speedLimitBps: 0,
        completedRanges: [[0, 1048575999]],
        activeSegments: [],
        lastSavedAt: new Date().toISOString(),
      },
    },
    {
      id: 'task-3',
      filename: 'vscode-installer-x64.exe',
      url: 'https://update.code.visualstudio.com/latest/win32-x64/user',
      category: 'General',
      totalSize: 136314880, // ~130 MB
      downloadedBytes: 41943040, // ~40 MB
      status: 'Paused',
      currentSpeedBps: 0,
      threadsCount: 4,
      speedLimitBps: 0,
      etaSeconds: 0,
      savePath: '/downloads/vscode-installer-x64.exe',
      createdAt: new Date().toISOString(),
      segments: Array.from({ length: 4 }).map((_, i) => {
        const totalSize = 136314880;
        const chunkSize = Math.floor(totalSize / 4);
        const start = i * chunkSize;
        const end = i === 3 ? totalSize - 1 : (i + 1) * chunkSize - 1;
        return {
          id: i,
          workerId: i,
          startByte: start,
          endByte: end,
          currentByte: start + Math.floor((end - start) * 0.3),
          status: 'idle',
          speedBytesPerSec: 0,
          color: COLOR_PALETTE[i % COLOR_PALETTE.length],
        };
      }),
      stateFile: {
        version: '2.5.0',
        url: 'https://update.code.visualstudio.com/latest/win32-x64/user',
        filename: 'vscode-installer-x64.exe',
        totalBytes: 136314880,
        etag: '"vscode-latest-etag"',
        lastModified: 'Thu, 01 Aug 2026 10:00:00 GMT',
        supportsRanges: true,
        workerCount: 4,
        speedLimitBps: 0,
        completedRanges: [],
        activeSegments: [],
        lastSavedAt: new Date().toISOString(),
      },
    },
  ]);

  const [selectedTaskId, setSelectedTaskId] = useState<string>('task-1');

  // Bandwidth history for chart
  const [bandwidthHistory, setBandwidthHistory] = useState<BandwidthPoint[]>([
    { time: '10:25:00', speedKbps: 6144, limitKbps: 0 },
    { time: '10:25:05', speedKbps: 7168, limitKbps: 0 },
    { time: '10:25:10', speedKbps: 8192, limitKbps: 0 },
  ]);

  // Selected task reference
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

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

          // Sync .idm_state
          const updatedStateFile: IdmStateFile = {
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

  const handleAddDownload = (
    url: string,
    filename: string,
    threads: number,
    speedLimit: number
  ) => {
    const newTaskSize = 2147483648; // 2 GB
    const chunkSize = Math.floor(newTaskSize / threads);

    const segments: DownloadSegment[] = Array.from({ length: threads }).map((_, i) => {
      const start = i * chunkSize;
      const end = i === threads - 1 ? newTaskSize - 1 : (i + 1) * chunkSize - 1;
      return {
        id: i,
        workerId: i,
        startByte: start,
        endByte: end,
        currentByte: start,
        status: 'downloading',
        speedBytesPerSec: 1048576,
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
      };
    });

    const newTask: DownloadTask = {
      id: `task-${Date.now()}`,
      filename,
      url,
      category: 'General',
      totalSize: newTaskSize,
      downloadedBytes: 0,
      status: 'Downloading',
      currentSpeedBps: 8388608,
      threadsCount: threads,
      speedLimitBps: speedLimit * 1024,
      etaSeconds: 300,
      savePath: `/downloads/${filename}`,
      createdAt: new Date().toISOString(),
      segments,
      stateFile: {
        version: '2.5.0',
        url,
        filename,
        totalBytes: newTaskSize,
        etag: `"etag-${Date.now()}"`,
        lastModified: new Date().toUTCString(),
        supportsRanges: true,
        workerCount: threads,
        speedLimitBps: speedLimit * 1024,
        completedRanges: [],
        activeSegments: [],
        lastSavedAt: new Date().toISOString(),
      },
    };

    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
  };

  const handleAddVideoDownload = (
    url: string,
    filename: string,
    quality: string,
    sizeBytes: number
  ) => {
    const threads = 8;
    const chunkSize = Math.floor(sizeBytes / threads);

    const segments: DownloadSegment[] = Array.from({ length: threads }).map((_, i) => {
      const start = i * chunkSize;
      const end = i === threads - 1 ? sizeBytes - 1 : (i + 1) * chunkSize - 1;
      return {
        id: i,
        workerId: i,
        startByte: start,
        endByte: end,
        currentByte: start,
        status: 'downloading',
        speedBytesPerSec: 1048576,
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
      };
    });

    const newTask: DownloadTask = {
      id: `task-video-${Date.now()}`,
      filename,
      url,
      category: 'General',
      totalSize: sizeBytes,
      downloadedBytes: 0,
      status: 'Downloading',
      currentSpeedBps: 8388608,
      threadsCount: threads,
      speedLimitBps: 0,
      etaSeconds: Math.ceil(sizeBytes / 8388608),
      savePath: `/downloads/videos/${filename}`,
      createdAt: new Date().toISOString(),
      segments,
      stateFile: {
        version: '2.5.0',
        url,
        filename,
        totalBytes: sizeBytes,
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
    setSelectedTaskId(newTask.id);
  };

  const handleToggleSpeedLimitModal = () => {
    setSpeedLimitKbps((prev) => (prev === 0 ? 2048 : 0));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Toolbar */}
      <IdmHeader
        onAddUrlClick={() => setIsAddModalOpen(true)}
        onStopAll={() => setTasks((prev) => prev.map((t) => ({ ...t, status: 'Paused', currentSpeedBps: 0 })))}
        onResumeAll={() => setTasks((prev) => prev.map((t) => ({ ...t, status: 'Downloading' })))}
        onClearCompleted={() => setTasks((prev) => prev.filter((t) => t.status !== 'Completed'))}
        activeCount={activeCount}
        totalSpeedBps={totalSpeedBps}
        globalSpeedLimitKbps={speedLimitKbps}
        onToggleSpeedLimitModal={handleToggleSpeedLimitModal}
        onExportExeClick={() => setIsExportExeOpen(true)}
        onFirefoxAddonClick={() => setIsFirefoxModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Full-width Download Task Manager */}
        <DownloadList
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
        />

        {/* YouTube & Video Stream Grabber Panel */}
        <VideoGrabberPanel onAddVideoDownload={handleAddVideoDownload} />

        {/* Selected Task Details & Visualizers */}
        {selectedTask && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Segment Visualizer */}
              <SegmentVisualizer
                task={selectedTask}
                onStealWork={handleTriggerWorkSteal}
                onPauseWorker={handlePauseWorker}
                onResumeWorker={handleResumeWorker}
              />

              {/* State Inspector */}
              <StateInspector
                task={selectedTask}
                onSimulateCrash={handleSimulateCrash}
                onResumeFromState={handleResumeFromState}
              />
            </div>

            {/* Speed Limiter & Bandwidth Chart */}
            <div className="lg:col-span-1">
              <SpeedGraph
                bandwidthHistory={bandwidthHistory}
                currentSpeedKbps={Math.round(selectedTask.currentSpeedBps / 1024)}
                speedLimitKbps={speedLimitKbps}
                onSetSpeedLimit={setSpeedLimitKbps}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-3.5 px-6 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">Internet Download Manager</span>
          <span>•</span>
          <span className="text-slate-400">Multi-part Chunk Acceleration Engine</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span>Accept-Ranges: HTTP 206</span>
          <span>•</span>
          <span>Workers: Dynamic</span>
          <span>•</span>
          <span>Throttling: Token Bucket</span>
        </div>
      </footer>

      {/* Add Download Modal */}
      <AddDownloadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDownload={handleAddDownload}
      />

      {/* Export EXE Modal */}
      <ExportExeModal
        isOpen={isExportExeOpen}
        onClose={() => setIsExportExeOpen(false)}
      />

      {/* Firefox Extension Modal */}
      <FirefoxExtensionModal
        isOpen={isFirefoxModalOpen}
        onClose={() => setIsFirefoxModalOpen(false)}
      />
    </div>
  );
}

