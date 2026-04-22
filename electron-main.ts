import { app, BrowserWindow } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { fileURLToPath } from 'url';

// Derive __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null;

// Set user data path for the database
process.env.USER_DATA_PATH = app.getPath('userData');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#000000',
    title: 'AutoPROMO agent',
    // icon: path.join(__dirname, 'public/icon.png') // Add icon if available
  });

  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);

  const startUrl = isDev 
    ? 'http://localhost:3000/tool.html'
    : `file://${path.join(__dirname, 'tool.html')}`;

  // Function to load the URL with retries
  const loadWithRetry = () => {
    mainWindow?.loadURL(startUrl).catch(() => {
      setTimeout(loadWithRetry, 500);
    });
  };

  loadWithRetry();

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start the Express server if in production
if (!isDev) {
  // In production, the server is started by the main process
  // or we can just load the file directly if it's a pure SPA.
  // Since this is a full-stack app, we might need to start the server.ts
  // However, for a simple installer, often we bundle the server or use a local DB.
  // For now, let's assume we want to run the server.ts logic.
  import('./server.js').catch(err => console.error('Failed to start server:', err));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
