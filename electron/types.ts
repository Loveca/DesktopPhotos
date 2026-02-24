export interface PhotoItem {
  filePath: string;
  displayDate: string;
  timestamp: number;
}

export interface TimelineGroup {
  date: string;
  items: PhotoItem[];
}
