import { app, BrowserWindow } from 'electron';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const ENGINE_URL = 'http://localhost:3000';

async function startEngine() {
  process.env.APP_PATH = app.getAppPath();
  process.env.NODE_ENV = 'production';
  try {
    require(path.join(__dirname, 'dist', 'server.cjs'));
  } catch (err) {
    console.error('[Electron] Engine failed to start:', err);
  }
}

async function waitForEngine(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(ENGINE_URL);
      if (res.status < 500) return true;
    } catch {
      // engine not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return false;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Archimedes Download Manager',
    icon: path.join(__dirname, 'dist', 'favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadURL(ENGINE_URL).catch(() => {
      mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
}

app.whenReady().then(async () => {
  if (process.env.NODE_ENV !== 'development') {
    await startEngine();
    await waitForEngine();
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
