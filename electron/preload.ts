import { contextBridge, ipcRenderer } from 'electron';
import type { TimelineGroup } from './types';

contextBridge.exposeInMainWorld('albumApi', {
  pickFolder: (): Promise<string | null> => ipcRenderer.invoke('pick-folder'),
  scanFolder: (folderPath: string): Promise<TimelineGroup[]> =>
    ipcRenderer.invoke('scan-folder', folderPath),
});
