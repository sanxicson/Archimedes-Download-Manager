# Archimedes Download Manager

A modern fork of Internet Download Manager (IDM) built with React, Express, Vite, and Electron. Archimedes Download Manager brings IDM-style accelerated downloading to the web and desktop with a classic, instantly recognizable interface.

> **Version 0.6** — Multi-browser extension integration, dynamic segment multiplexing, multi-part downloading, speed limiting, and real-time status monitoring.

![Status](https://img.shields.io/badge/status-beta-yellow) ![Version](https://img.shields.io/badge/version-0.6-blue)

---

## Features

- **Multi-part parallel downloads** — Splits files into byte ranges and streams them concurrently using HTTP `Range` requests for dramatically faster speeds.
- **Dynamic segment multiplexing** — Adaptive work-stealing rebalances segments in real time: idle workers steal remaining byte ranges from busy ones.
- **Real file probing** — HEAD/GET probing extracts file size, filename, MIME type, ETag, and range support before download starts.
- **CORS-bypassing chunk proxy** — A local Express backend streams each segment, working around browser CORS restrictions on foreign file hosts.
- **Speed limiting** — Global per-download bandwidth throttling with a live speed graph.
- **Real-time monitoring** — Per-segment progress bars, live transfer speed, ETA, and a bandwidth history chart.
- **`.idm_state` resume model** — Tracks active segments and completed ranges so downloads can be paused, simulated-crashed, and resumed from state.
- **Video & media grabbing** — In-page grabber panel snaps stream URLs from `<video>` elements and forwards them to the engine.
- **Classic IDM UI** — Familiar header, download list, toolbar, and task inspector layout; multiple color themes (light, slate, AMOLED, retro, cyber) and compact/full window modes.
- **Electron desktop build** — Package the whole thing as a native Windows `.exe` installer.

---

## Architecture

```
Browser / Extension ──► Firefox / Chrome integration ──► POST /api/downloads
                                                        │
                                                        ▼
                 ┌──────────────────┐         ┌───────────────────┐
                 │   React UI       │◄──────►│  Express Backend  │
                 │  (src/)          │  fetch  │    (server.ts)    │
                 └──────────────────┘         └───────────────────┘
                       │                              │
                       │  realDownloader.ts           │ /api/file-info
                       │  (parallel Range chunks)     │ /api/download-chunk
                       ▼                              ▼
                  Assemble Blob ──► Save to disk ◄─ Proxied upstream HTTP
```

### Project layout

| Path                    | Purpose                                                                 |
|-------------------------|-------------------------------------------------------------------------|
| `src/`                  | React frontend — task list, segment visualizer, speed graph, modals    |
| `src/utils/realDownloader.ts` | Parallel chunk streaming engine, blob assembly, save-to-disk logic |
| `server.ts`             | Express backend — file probing, CORS-bypass chunk proxy, queue API     |
| `electron.js`           | Electron shell for packaging a native desktop app                       |
| `firefox-extension/`    | Firefox WebExtension — download interception, context menu, video overlay |
| `build-exe.bat`         | One-click Windows `.exe` build script (electron-builder NSIS)          |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ and [npm](https://www.npmjs.com)
- (Optional) [Bun](https://bun.sh) — a `bun.lock` is included

### Install & run (development)

```bash
# 1. Install dependencies
npm install

# 2. Start the fullstack dev server (Express + Vite on http://localhost:3000)
npm run dev
```

Open http://localhost:3000 in your browser. The backend serves both the API and the Vite dev middleware, so the frontend can probe files and proxy chunks with no CORS issues.

> **Note:** When running from a web browser, downloads are assembled in-memory and saved via the File System Access API or a browser download trigger. For the full desktop experience, use the Electron build.

### Build for production

```bash
npm run build      # Vite build + bundle server into dist/server.cjs
npm start          # Serve the built SPA + API from dist/
```

### Build the Windows `.exe`

Run `build-exe.bat` (or manually):

```bash
npm install
npm run build
npx electron-builder --win nsis
```

The NSIS installer is generated in `dist/`.

---

## Installing the Firefox extension

The extension in `firefox-extension/` integrates with the running engine at `http://localhost:3000`.

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on** and select `firefox-extension/manifest.json`.
3. Keep the server running on port `3000`.

What it does:

- **Intercepts downloads** — cancels built-in browser downloads and forwards the URL to the IDM engine.
- **Context menu** — right-click any link, video, audio, or image and choose **"Download with IDM"**.
- **Video overlay** — a "Download with IDM" pill appears over `<video>` elements to grab media streams.

---

## How it works

1. **Probe** (`POST /api/file-info`) — the server inspects the target URL via HEAD (with a GET `bytes=0-0` fallback) and returns size, range support, ETag, content type, and filename.
2. **Segment** — the engine splits the file into N byte ranges, one per worker thread.
3. **Stream** (`GET /api/download-chunk?start=…&end=…`) — each worker downloads its range through the local proxy, which relays the request with an IDM user-agent and streams the bytes back. A direct `Range` fetch is attempted as a fallback.
4. **Assemble & save** — completed segments are merged into a single `Blob` and written to disk (save-file picker or the browser's Downloads folder).

---

## API reference

| Method | Endpoint                  | Description                                            |
|--------|---------------------------|--------------------------------------------------------|
| POST   | `/api/file-info`          | Probe a URL for metadata (`{ url }` → file info)      |
| GET    | `/api/download-chunk`     | Proxy a byte range: `?url=…&start=…&end=…`            |
| POST   | `/api/downloads`          | Queue a download from an extension (`{ url, filename, referrer }`) |
| GET    | `/api/downloads/queue`    | Poll and drain the pending extension queue             |

---

## Environment variables

Copy `.env.example` to `.env`:

| Variable         | Description                                       |
|------------------|---------------------------------------------------|
| `GEMINI_API_KEY` | Optional — Gemini AI API key (project scaffolding) |
| `APP_URL`        | Host URL for self-referential links / callbacks   |

---

## Roadmap

- [ ] Chrome extension integration
- [ ] True disk-streaming (no in-memory blob assembly)
- [ ] Download queue persistence and history
- [ ] Remote URL / magnet support
- [ ] Resumable `.idm_state` serialization to disk

---

## Disclaimer

This project is a **fan-made, from-scratch reimplementation** inspired by the Internet Download Manager interface and workflow. It is not affiliated with, endorsed by, or connected to Tonec Inc. or the original IDM product. The codebase was written independently and does not contain proprietary IDM code.

---

## License

No license has been specified for this repository yet. All rights are reserved unless the repository owner adds a license granting additional permissions.
