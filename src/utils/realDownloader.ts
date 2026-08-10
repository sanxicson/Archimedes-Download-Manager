// Real Downloader Utility Engine for ADM
// Handles HTTP Range probes, parallel multi-thread byte streaming, assembly, and saving to disk/Downloads folder

export interface FileMetadata {
  url: string;
  filename: string;
  totalBytes: number;
  supportsRanges: boolean;
  contentType: string;
  etag?: string;
}

// In-memory store for downloaded real file blobs
const completedBlobsStore = new Map<string, Blob>();

/**
 * Probe a URL to get real metadata (size, filename, range support)
 */
export async function probeFileInfo(url: string): Promise<FileMetadata> {
  try {
    const res = await fetch('/api/file-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      throw new Error(`Probe failed with status ${res.status}`);
    }

    const data = await res.json();
    return {
      url: data.url || url,
      filename: data.filename || url.split('/').pop()?.split('?')[0] || 'downloaded_file',
      totalBytes: Number(data.totalBytes) || 0,
      supportsRanges: Boolean(data.supportsRanges),
      contentType: data.contentType || 'application/octet-stream',
      etag: data.etag || '',
    };
  } catch (err) {
    console.warn('[RealDownloader] Server probe failed, falling back to direct header check:', err);
    // Fallback: try direct HEAD request
    try {
      const direct = await fetch(url, { method: 'HEAD' });
      const size = Number(direct.headers.get('content-length')) || 0;
      const name = url.split('/').pop()?.split('?')[0] || 'downloaded_file';
      return {
        url,
        filename: name,
        totalBytes: size,
        supportsRanges: direct.headers.get('accept-ranges') === 'bytes',
        contentType: direct.headers.get('content-type') || 'application/octet-stream',
      };
    } catch {
      return {
        url,
        filename: url.split('/').pop()?.split('?')[0] || 'downloaded_file',
        totalBytes: 5242880, // Default 5 MB fallback
        supportsRanges: true,
        contentType: 'application/octet-stream',
      };
    }
  }
}

/**
 * Store a completed real blob for a task ID
 */
export function storeCompletedBlob(taskId: string, blob: Blob) {
  completedBlobsStore.set(taskId, blob);
}

/**
 * Get a stored blob by task ID
 */
export function getCompletedBlob(taskId: string): Blob | undefined {
  return completedBlobsStore.get(taskId);
}

/**
 * Save a Blob directly to the user's Downloads folder or let them pick a custom directory on disk
 */
export async function saveFileToDisk(
  blob: Blob,
  filename: string,
  forceDirectoryPicker: boolean = false
): Promise<{ success: boolean; method: 'picker' | 'downloads' }> {
  // Option 1: Modern File System Access API (window.showSaveFilePicker)
  // Allows user to pick ANY folder on their computer (e.g. C:\Downloads, D:\Media, etc.)
  if ('showSaveFilePicker' in window && (forceDirectoryPicker || navigator.userAgent.includes('Chrome'))) {
    try {
      const extension = filename.includes('.') ? `.${filename.split('.').pop()}` : '';
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'ADM Downloaded File',
            accept: {
              [blob.type || 'application/octet-stream']: [extension || '.*'],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { success: true, method: 'picker' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[RealDownloader] User cancelled directory picker');
        return { success: false, method: 'picker' };
      }
      console.warn('[RealDownloader] File picker failed or was denied, falling back to standard downloads folder:', err);
    }
  }

  // Option 2: Automatic browser file trigger to Downloads folder
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 30000);

  return { success: true, method: 'downloads' };
}

/**
 * Download a real file in parallel worker chunks over HTTP
 */
export async function executeRealDownload(
  url: string,
  totalBytes: number,
  threadsCount: number,
  onProgress: (downloadedBytes: number, speedBps: number, segmentBytes: number[]) => void,
  isCancelled: () => boolean
): Promise<Blob> {
  // If totalBytes is unknown, fetch whole file as a single stream
  if (!totalBytes || totalBytes <= 0) {
    const chunkUrl = `/api/download-chunk?url=${encodeURIComponent(url)}`;
    const startTime = Date.now();
    const res = await fetch(chunkUrl);
    const blob = await res.blob();
    const elapsed = Math.max(0.1, (Date.now() - startTime) / 1000);
    const speed = blob.size / elapsed;
    onProgress(blob.size, speed, [blob.size]);
    return blob;
  }

  const chunkSize = Math.floor(totalBytes / threadsCount);
  const segmentBuffers: Uint8Array[] = new Array(threadsCount);
  const segmentDownloadedBytes: number[] = new Array(threadsCount).fill(0);

  let lastTime = Date.now();
  let lastTotalDownloaded = 0;

  // Run worker threads concurrently
  const workerPromises = Array.from({ length: threadsCount }).map(async (_, threadIdx) => {
    if (isCancelled()) return;

    const startByte = threadIdx * chunkSize;
    const endByte = threadIdx === threadsCount - 1 ? totalBytes - 1 : (threadIdx + 1) * chunkSize - 1;
    const expectedLength = endByte - startByte + 1;

    const proxyUrl = `/api/download-chunk?url=${encodeURIComponent(url)}&start=${startByte}&end=${endByte}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Thread ${threadIdx} HTTP error ${response.status}`);
      }

      if (!response.body) {
        const arrayBuf = await response.arrayBuffer();
        const chunk = new Uint8Array(arrayBuf);
        segmentBuffers[threadIdx] = chunk;
        segmentDownloadedBytes[threadIdx] = chunk.byteLength;
        return;
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let threadBytesReceived = 0;

      while (true) {
        if (isCancelled()) {
          reader.cancel();
          return;
        }

        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          chunks.push(value);
          threadBytesReceived += value.byteLength;
          segmentDownloadedBytes[threadIdx] = threadBytesReceived;

          // Compute overall progress & speed
          const now = Date.now();
          const currentTotal = segmentDownloadedBytes.reduce((a, b) => a + b, 0);
          const timeDiff = (now - lastTime) / 1000;

          if (timeDiff >= 0.2) {
            const bytesSinceLast = currentTotal - lastTotalDownloaded;
            const currentSpeed = bytesSinceLast / timeDiff;
            lastTime = now;
            lastTotalDownloaded = currentTotal;
            onProgress(currentTotal, currentSpeed, [...segmentDownloadedBytes]);
          }
        }
      }

      // Merge chunks for this segment
      const merged = new Uint8Array(threadBytesReceived);
      let offset = 0;
      for (const c of chunks) {
        merged.set(c, offset);
        offset += c.byteLength;
      }
      segmentBuffers[threadIdx] = merged;
    } catch (err) {
      console.warn(`[RealDownloader] Thread ${threadIdx} failed proxy chunk, attempting direct fetch:`, err);
      // Fallback direct chunk fetch
      try {
        const directRes = await fetch(url, {
          headers: { Range: `bytes=${startByte}-${endByte}` },
        });
        const arrayBuf = await directRes.arrayBuffer();
        const merged = new Uint8Array(arrayBuf);
        segmentBuffers[threadIdx] = merged;
        segmentDownloadedBytes[threadIdx] = merged.byteLength;
      } catch (directErr) {
        console.error(`[RealDownloader] Thread ${threadIdx} direct fetch failed:`, directErr);
      }
    }
  });

  await Promise.all(workerPromises);

  // Combine all segment Uint8Arrays into a single unified Uint8Array / Blob
  const totalDownloaded = segmentDownloadedBytes.reduce((a, b) => a + b, 0);
  const finalMerged = new Uint8Array(totalDownloaded);
  let writeOffset = 0;

  for (let i = 0; i < threadsCount; i++) {
    if (segmentBuffers[i]) {
      finalMerged.set(segmentBuffers[i], writeOffset);
      writeOffset += segmentBuffers[i].byteLength;
    }
  }

  const finalBlob = new Blob([finalMerged], { type: 'application/octet-stream' });
  onProgress(finalBlob.size, 0, segmentDownloadedBytes);

  return finalBlob;
}