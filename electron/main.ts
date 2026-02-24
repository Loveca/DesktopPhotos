import path from 'node:path';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { scanPhotosFromDirectory } from './scanner';
import type { TimelineGroup } from './types';

const isDev = !!process.env.VITE_DEV_SERVER_URL;

const groupByDate = (items: Awaited<ReturnType<typeof scanPhotosFromDirectory>>): TimelineGroup[] => {
  const bucket = new Map<string, typeof items>();

  for (const item of items) {
    const list = bucket.get(item.displayDate);
    if (list) {
      list.push(item);
    } else {
      bucket.set(item.displayDate, [item]);
    }
  }

  return Array.from(bucket.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, list]) => ({ date, items: list }));
};

const createWindow = async (): Promise<void> => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    backgroundColor: '#0f1115',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

ipcMain.handle('pick-folder', async () => {
  const result = await dialog.showOpenDialog({
    title: '选择相册文件夹',
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('scan-folder', async (_event, folderPath: string): Promise<TimelineGroup[]> => {
  const items = await scanPhotosFromDirectory(folderPath);
  return groupByDate(items);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
