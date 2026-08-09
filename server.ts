import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Probe File Metadata (Size, Range Support, Filename)
  app.post('/api/file-info', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      console.log(`[IDM Engine] Probing URL: ${url}`);
      
      // Attempt HEAD request first
      let response = await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) InternetDownloadManager/2.5' },
      }).catch(() => null);

      // If HEAD is disallowed or fails, fallback to GET range 0-0
      if (!response || !response.ok) {
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) InternetDownloadManager/2.5',
            'Range': 'bytes=0-0',
          },
        }).catch(() => null);
      }

      if (!response) {
        return res.status(500).json({ error: 'Failed to reach target server' });
      }

      const contentLengthHeader = response.headers.get('content-length');
      const contentRangeHeader = response.headers.get('content-range');
      const acceptRangesHeader = response.headers.get('accept-ranges');
      const contentDisposition = response.headers.get('content-disposition');
      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      // Parse Total Bytes
      let totalBytes = 0;
      if (contentRangeHeader) {
        const match = contentRangeHeader.match(/\/(\d+)/);
        if (match) totalBytes = parseInt(match[1], 10);
      } else if (contentLengthHeader) {
        totalBytes = parseInt(contentLengthHeader, 10);
      }

      // Check Range Support
      const supportsRanges =
        acceptRangesHeader === 'bytes' ||
        Boolean(contentRangeHeader) ||
        response.status === 206;

      // Extract Filename
      let filename = 'downloaded_file';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=['"]?(?:UTF-8'')?([^;'"\n]+)/i);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      } else {
        const urlParts = url.split('/').pop()?.split('?')[0];
        if (urlParts && urlParts.includes('.')) {
          filename = urlParts;
        }
      }

      return res.json({
        url,
        filename,
        totalBytes,
        supportsRanges,
        contentType,
        etag: response.headers.get('etag') || '',
      });
    } catch (err: any) {
      console.error('[IDM Engine Error] File probe failed:', err);
      return res.status(500).json({ error: err.message || 'File info lookup failed' });
    }
  });

  // API Route: Download Chunk Proxy (Bypasses CORS for multi-thread parallel downloads)
  app.get('/api/download-chunk', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const start = req.query.start as string;
      const end = req.query.end as string;

      if (!targetUrl) {
        return res.status(400).send('Target URL required');
      }

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) InternetDownloadManager/2.5',
      };

      if (start !== undefined && end !== undefined) {
        headers['Range'] = `bytes=${start}-${end}`;
      }

      const upstream = await fetch(targetUrl, { headers });

      if (!upstream.ok && upstream.status !== 206) {
        return res.status(upstream.status).send(`Upstream error: ${upstream.statusText}`);
      }

      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
      if (upstream.headers.get('content-range')) {
        res.setHeader('Content-Range', upstream.headers.get('content-range')!);
      }

      const arrayBuffer = await upstream.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.send(buffer);
    } catch (err: any) {
      console.error('[IDM Engine Error] Chunk fetch failed:', err);
      return res.status(500).send(err.message || 'Chunk proxy failed');
    }
  });

  const pendingQueue: Array<{ id: string; url: string; filename?: string; referrer?: string }> = [];

  // API Route: Add download queue endpoint
  app.post('/api/downloads', (req, res) => {
    const { url, filename, referrer } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const item = {
      id: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url,
      filename,
      referrer,
    };
    pendingQueue.push(item);
    console.log(`[IDM Engine] Queue download request received for: ${url}`);
    res.json({ success: true, message: 'Queued in IDM Engine', item });
  });

  // API Route: Poll pending download queue for frontend UI
  app.get('/api/downloads/queue', (req, res) => {
    const items = [...pendingQueue];
    pendingQueue.length = 0; // Drain queue once fetched
    res.json({ items });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IDM Fullstack Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
