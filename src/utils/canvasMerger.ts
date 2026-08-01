import { GridConfig, ImageItem } from '../types';

export interface SlotRect {
  x: number;
  y: number;
  width: number;
  height: number;
  isEmpty: boolean;
  origWidth?: number;
  origHeight?: number;
  aspectRatio?: number;
}

export interface GridSimulation {
  totalWidth: number;
  totalHeight: number;
  colWidths: number[];
  rowHeights: number[];
  slots: SlotRect[];
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Calculates un-trimmed 3x3 grid simulation layout based on 9 slot images.
 * Aligns column widths and row heights without cropping or trimming image content.
 */
export function calculateGridSimulation(
  loadedImages: (HTMLImageElement | null)[]
): GridSimulation {
  const getDims = (img: HTMLImageElement | null) => {
    if (!img) return { w: 600, h: 600, ratio: 1, isEmpty: true };
    const w = img.naturalWidth || img.width || 600;
    const h = img.naturalHeight || img.height || 600;
    return { w, h, ratio: w / h, isEmpty: false };
  };

  const d = Array.from({ length: 9 }, (_, i) => getDims(loadedImages[i] || null));
  const nonEmptyIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !d[i].isEmpty);

  // Default empty state
  if (nonEmptyIndices.length === 0) {
    const slotSize = 400;
    const slotRects: SlotRect[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        slotRects.push({
          x: c * slotSize,
          y: r * slotSize,
          width: slotSize,
          height: slotSize,
          isEmpty: true,
        });
      }
    }
    return {
      totalWidth: slotSize * 3,
      totalHeight: slotSize * 3,
      colWidths: [slotSize, slotSize, slotSize],
      rowHeights: [slotSize, slotSize, slotSize],
      slots: slotRects,
    };
  }

  // Determine active rows (0, 1, 2) and active columns (0, 1, 2)
  const activeRows = [0, 1, 2].filter((r) => [0, 1, 2].some((c) => !d[r * 3 + c].isEmpty));
  const activeCols = [0, 1, 2].filter((c) => [0, 1, 2].some((r) => !d[r * 3 + c].isEmpty));

  // 1. Initial Row Heights for active rows
  const rowHeights: number[] = [0, 0, 0];
  for (let r = 0; r < 3; r++) {
    if (!activeRows.includes(r)) continue;
    let maxH = 0;
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      if (!d[idx].isEmpty && d[idx].h > maxH) {
        maxH = d[idx].h;
      }
    }
    rowHeights[r] = maxH > 0 ? maxH : 600;
  }

  // 2. Derive Column Widths to fit active row heights without trimming
  const colWidths: number[] = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    if (!activeCols.includes(c)) continue;
    let maxW = 0;
    for (let r = 0; r < 3; r++) {
      const idx = r * 3 + c;
      if (!d[idx].isEmpty) {
        const requiredW = rowHeights[r] * d[idx].ratio;
        if (requiredW > maxW) maxW = requiredW;
      }
    }
    if (maxW === 0) {
      // fallback if col has no non-empty images
      maxW = 600;
    }
    colWidths[c] = Math.round(maxW);
  }

  // 3. Re-adjust Row Heights to guarantee all images fit colWidths without trimming
  for (let r = 0; r < 3; r++) {
    if (!activeRows.includes(r)) continue;
    let maxH = rowHeights[r];
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      if (!d[idx].isEmpty) {
        const requiredH = colWidths[c] / d[idx].ratio;
        if (requiredH > maxH) maxH = requiredH;
      }
    }
    rowHeights[r] = Math.round(maxH);
  }

  // Calculate cumulative offsets
  const xOffsets = [0];
  for (let c = 0; c < 3; c++) {
    xOffsets.push(xOffsets[c] + colWidths[c]);
  }

  const yOffsets = [0];
  for (let r = 0; r < 3; r++) {
    yOffsets.push(yOffsets[r] + rowHeights[r]);
  }

  const totalWidth = xOffsets[3];
  const totalHeight = yOffsets[3];

  const slots: SlotRect[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const item = d[idx];
      slots.push({
        x: xOffsets[c],
        y: yOffsets[r],
        width: colWidths[c],
        height: rowHeights[r],
        isEmpty: item.isEmpty,
        origWidth: item.w,
        origHeight: item.h,
        aspectRatio: item.ratio,
      });
    }
  }

  return {
    totalWidth,
    totalHeight,
    colWidths,
    rowHeights,
    slots,
  };
}

export async function renderGridToCanvas(
  canvas: HTMLCanvasElement,
  slots: (ImageItem | null)[],
  config: GridConfig
): Promise<GridSimulation> {
  const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
    slots.map(async (item) => {
      if (!item || !item.src) return null;
      try {
        return await loadImage(item.src);
      } catch (err) {
        console.error('Failed to load image for slot:', err);
        return null;
      }
    })
  );

  const sim = calculateGridSimulation(loadedImages);

  canvas.width = sim.totalWidth;
  canvas.height = sim.totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return sim;

  // Clear background with white fill
  ctx.fillStyle = config.backgroundColor || '#FFFFFF';
  ctx.fillRect(0, 0, sim.totalWidth, sim.totalHeight);

  for (let i = 0; i < 9; i++) {
    const rect = sim.slots[i];
    const img = loadedImages[i];

    if (img && !rect.isEmpty && rect.width > 0 && rect.height > 0) {
      // Draw image to fill calculated slot box with zero trimming
      ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    } else if (rect.isEmpty && rect.width > 0 && rect.height > 0) {
      // Fill empty slot box with white
      ctx.fillStyle = config.backgroundColor || '#FFFFFF';
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  return sim;
}

export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename = 'merged-3x3-grid.png',
  format: GridConfig['exportFormat'] = 'image/png'
): void {
  const mime = format;
  const dataUrl = canvas.toDataURL(mime, 0.95);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
