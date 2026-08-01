export type SlotIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SlotMeta {
  index: SlotIndex;
  label: string;
  shortLabel: string;
  gridAreaName: string;
}

export const SLOT_METADATA: SlotMeta[] = [
  { index: 0, label: 'Position 1', shortLabel: 'P1', gridAreaName: 'Row 1, Col 1' },
  { index: 1, label: 'Position 2', shortLabel: 'P2', gridAreaName: 'Row 1, Col 2' },
  { index: 2, label: 'Position 3', shortLabel: 'P3', gridAreaName: 'Row 1, Col 3' },
  { index: 3, label: 'Position 4', shortLabel: 'P4', gridAreaName: 'Row 2, Col 1' },
  { index: 4, label: 'Position 5', shortLabel: 'P5', gridAreaName: 'Row 2, Col 2' },
  { index: 5, label: 'Position 6', shortLabel: 'P6', gridAreaName: 'Row 2, Col 3' },
  { index: 6, label: 'Position 7', shortLabel: 'P7', gridAreaName: 'Row 3, Col 1' },
  { index: 7, label: 'Position 8', shortLabel: 'P8', gridAreaName: 'Row 3, Col 2' },
  { index: 8, label: 'Position 9', shortLabel: 'P9', gridAreaName: 'Row 3, Col 3' },
];

export interface ImageItem {
  id: string;
  name: string;
  src: string;
  width?: number;
  height?: number;
  fileSize?: string;
  isSample?: boolean;
}

export type FitMode = 'cover' | 'contain' | 'fill';
export type AspectRatio = '1:1' | '4:3' | '16:9' | '3:4';
export type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export interface GridConfig {
  gap: number;
  fitMode: FitMode;
  backgroundColor: string;
  aspectRatio: AspectRatio;
  outputResolution: number;
  exportFormat: ExportFormat;
}
