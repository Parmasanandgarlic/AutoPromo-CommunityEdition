import { app, BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';

let mainWindow: BrowserWindow | null;

// Runtime state belongs under Electron's per-user data directory, never in the
// application/install directory that electron-builder packages.
process.env.USER_DATA_PATH = app.getPath('userData');
process.env.AUTOPROMO_DESKTOP = '1';

const DESKTOP_URL = 'http://127.0.0.1:3000/tool.html';
const isAllowedNavigation = (raw: string) => {
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' && url.hostname === '127.0.0.1' && url.port === '3000';
  } catch {
    return false;
  }
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    backgroundColor: '#000000',
    title: 'AutoPROMO agent',
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (!isAllowedNavigation(targetUrl)) event.preventDefault();
  });

  // Production deliberately uses the loopback HTTP server too. Loading an
  // unpackaged file://tool.html was both brittle and a different security
  // origin from the API surface the application actually depends on.
  const startUrl = isDev ? 'http://localhost:3000/tool.html' : DESKTOP_URL;
  const loadWithRetry = () => {
    mainWindow?.loadURL(startUrl).catch(() => {
      setTimeout(loadWithRetry, 500);
    });
  };
  loadWithRetry();

  if (isDev) mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

if (!isDev) {
  import('./server.js').catch(err => console.error('Failed to start server:', err));
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
