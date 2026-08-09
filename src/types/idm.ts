export interface DownloadSegment {
  id: number;
  workerId: number;
  startByte: number;
  endByte: number;
  currentByte: number;
  status: 'idle' | 'downloading' | 'completed' | 'stolen' | 'failed';
  speedBytesPerSec: number;
  color: string;
}

export interface IdmStateFile {
  version: string;
  url: string;
  filename: string;
  totalBytes: number;
  etag: string | null;
  lastModified: string | null;
  supportsRanges: boolean;
  workerCount: number;
  speedLimitBps: number;
  completedRanges: Array<[number, number]>;
  activeSegments: Array<{
    id: number;
    start: number;
    end: number;
    current: number;
  }>;
  checksumSha256?: string;
  lastSavedAt: string;
}

export interface DownloadTask {
  id: string;
  filename: string;
  url: string;
  category: 'Video' | 'Compressed' | 'Documents' | 'Programs' | 'Music' | 'General';
  totalSize: number; // in bytes
  downloadedBytes: number;
  status: 'Downloading' | 'Paused' | 'Completed' | 'Reassembling' | 'Error' | 'Queued';
  currentSpeedBps: number;
  threadsCount: number;
  speedLimitBps: number; // 0 = unlimited
  etaSeconds: number;
  segments: DownloadSegment[];
  stateFile: IdmStateFile;
  createdAt: string;
  completedAt?: string;
  savePath: string;
  blobUrl?: string;
}

export interface BandwidthPoint {
  time: string;
  speedKbps: number;
  limitKbps: number;
}

export interface NativeIpcMessage {
  id: string;
  timestamp: string;
  source: 'chrome_extension' | 'rust_native_host';
  action: 'INTERCEPT_URL' | 'HANDSHAKE' | 'DOWNLOAD_STATUS' | 'PAUSE_DOWNLOAD';
  payload: Record<string, any>;
}
