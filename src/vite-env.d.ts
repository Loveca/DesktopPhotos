/// <reference types="vite/client" />

interface PhotoItem {
  filePath: string;
  displayDate: string;
  timestamp: number;
}

interface TimelineGroup {
  date: string;
  items: PhotoItem[];
}

interface Window {
  albumApi: {
    pickFolder: () => Promise<string | null>;
    scanFolder: (folderPath: string) => Promise<TimelineGroup[]>;
  };
}
