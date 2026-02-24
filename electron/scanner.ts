import fs from 'node:fs/promises';
import path from 'node:path';
import exifParser from 'exif-parser';
import type { PhotoItem } from './types';

const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
  '.bmp',
  '.gif',
]);

const FILE_NAME_PATTERNS = [
  /(?:IMG|PXL|Screenshot|微信图片|Photo)?[_-]?(\d{4})(\d{2})(\d{2})[_-]?(\d{2})?(\d{2})?(\d{2})?/i,
  /(\d{4})[-_](\d{2})[-_](\d{2})[ T_-]?(\d{2})?(\d{2})?(\d{2})?/,
];

const toDisplayDate = (timestamp: number): string =>
  new Date(timestamp).toISOString().slice(0, 10);

const parseDateFromFileName = (filename: string): number | null => {
  for (const pattern of FILE_NAME_PATTERNS) {
    const match = filename.match(pattern);
    if (!match) {
      continue;
    }

    const [, y, m, d, hh = '00', mm = '00', ss = '00'] = match;
    const timestamp = new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(hh),
      Number(mm),
      Number(ss),
    ).getTime();

    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
  }

  return null;
};

const parseTimestamp = async (filePath: string): Promise<number> => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const exif = exifParser.create(fileBuffer).parse();
    if (exif.tags.DateTimeOriginal) {
      return exif.tags.DateTimeOriginal * 1000;
    }
  } catch {
    // EXIF parse failure is expected for unsupported formats
  }

  const fileName = path.basename(filePath, path.extname(filePath));
  const filenameTimestamp = parseDateFromFileName(fileName);
  if (filenameTimestamp) {
    return filenameTimestamp;
  }

  const stats = await fs.stat(filePath);
  const fileTime = stats.birthtimeMs || stats.mtimeMs;
  return fileTime;
};

const walkDirectory = async (dirPath: string): Promise<string[]> => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nested: Promise<string[]>[] = [];
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      nested.push(walkDirectory(fullPath));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (SUPPORTED_IMAGE_EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }

  const children = await Promise.all(nested);
  return files.concat(children.flat());
};

export const scanPhotosFromDirectory = async (
  rootPath: string,
): Promise<PhotoItem[]> => {
  const imageFiles = await walkDirectory(rootPath);
  const photos = await Promise.all(
    imageFiles.map(async (filePath) => {
      const timestamp = await parseTimestamp(filePath);
      return {
        filePath,
        timestamp,
        displayDate: toDisplayDate(timestamp),
      } satisfies PhotoItem;
    }),
  );

  return photos.sort((a, b) => b.timestamp - a.timestamp);
};
