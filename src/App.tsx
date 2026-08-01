import React, { useState, useRef } from 'react';
import { SlotIndex, ImageItem, GridConfig } from './types';
import { renderGridToCanvas } from './utils/canvasMerger';
import { Upload, X, Play, Download, RefreshCw, GripVertical } from 'lucide-react';

const DEFAULT_CONFIG: GridConfig = {
  gap: 0,
  fitMode: 'contain',
  backgroundColor: '#FFFFFF',
  aspectRatio: '1:1',
  outputResolution: 1200,
  exportFormat: 'image/png',
};

const POSITIONS: SlotIndex[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function App() {
  const [slots, setSlots] = useState<(ImageItem | null)[]>(
    Array(9).fill(null)
  );

  const [mergedImageUrl, setMergedImageUrl] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState<boolean>(false);

  const [draggedSlotIdx, setDraggedSlotIdx] = useState<number | null>(null);
  const [dragOverSlotIdx, setDragOverSlotIdx] = useState<number | null>(null);

  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const processFile = (file: File): Promise<ImageItem> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          resolve({
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            src,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
          });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSlotUpload = async (slotIdx: SlotIndex, file: File) => {
    if (!file.type.startsWith('image/')) return;
    const item = await processFile(file);
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = item;
      return next;
    });
    setMergedImageUrl(null);
  };

  const handleClearSlot = (slotIdx: SlotIndex, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    setMergedImageUrl(null);
  };

  // Drag & Drop handlers for rearranging 3x3 slots & dropping files
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedSlotIdx(idx);
    e.dataTransfer.setData('text/plain', idx.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlotIdx !== idx) {
      setDragOverSlotIdx(idx);
    }
  };

  const handleDragLeave = (e: React.DragEvent, idx: number) => {
    if (dragOverSlotIdx === idx) {
      setDragOverSlotIdx(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    setDragOverSlotIdx(null);

    // If external files dropped directly on slot
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        await handleSlotUpload(targetIdx as SlotIndex, file);
      }
      setDraggedSlotIdx(null);
      return;
    }

    // Otherwise swap slots
    const sourceIdxStr = e.dataTransfer.getData('text/plain');
    const sourceIdx = sourceIdxStr !== '' ? parseInt(sourceIdxStr, 10) : draggedSlotIdx;

    if (sourceIdx !== null && sourceIdx !== targetIdx && sourceIdx >= 0 && sourceIdx < 9) {
      setSlots((prev) => {
        const next = [...prev];
        const temp = next[sourceIdx];
        next[sourceIdx] = next[targetIdx];
        next[targetIdx] = temp;
        return next;
      });
      setMergedImageUrl(null);
    }
    setDraggedSlotIdx(null);
  };

  const handleExecute = async () => {
    setIsMerging(true);
    try {
      let canvas = hiddenCanvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
      }

      await renderGridToCanvas(canvas, slots, DEFAULT_CONFIG);
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      setMergedImageUrl(dataUrl);
    } catch (err) {
      console.error('Merge error:', err);
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedImageUrl) return;
    const link = document.createElement('a');
    link.download = 'merged-3x3-image.png';
    link.href = mergedImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <canvas ref={hiddenCanvasRef} className="hidden" />

      <div className="w-full max-w-xl mx-auto space-y-6">
        
        {/* File Upload Area (3x3 Grid with Drag & Drop rearranging) */}
        <div id="file-upload-area" className="grid grid-cols-3 gap-2.5 aspect-square bg-white p-3.5 rounded-3xl border border-slate-200 shadow-sm">
          {POSITIONS.map((idx) => {
            const item = slots[idx];
            const isDragging = draggedSlotIdx === idx;
            const isOver = dragOverSlotIdx === idx;

            return (
              <div
                key={idx}
                id={`upload-slot-${idx}`}
                draggable={!!item}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={(e) => handleDragLeave(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => {
                  if (!item) {
                    hiddenInputRefs.current[idx]?.click();
                  }
                }}
                className={`relative group rounded-2xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none p-1.5 ${
                  isOver
                    ? 'border-indigo-500 bg-indigo-50/70 scale-[1.02]'
                    : isDragging
                    ? 'opacity-40 border-dashed border-slate-400 bg-slate-100'
                    : item
                    ? 'border-slate-200 bg-white shadow-2xs hover:border-indigo-400'
                    : 'border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-indigo-300'
                }`}
              >
                <input
                  type="file"
                  ref={(el) => {
                    hiddenInputRefs.current[idx] = el;
                  }}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleSlotUpload(idx as SlotIndex, e.target.files[0]);
                      e.target.value = '';
                    }
                  }}
                />

                {item ? (
                  <div className="relative w-full h-full flex items-center justify-center group/item">
                    <img
                      src={item.src}
                      alt={`Slot ${idx + 1}`}
                      className="w-full h-full object-contain pointer-events-none"
                    />

                    {/* Drag Handle & Controls on hover */}
                    <div className="absolute top-1.5 left-1.5 p-1 rounded-md bg-slate-900/60 text-white opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleClearSlot(idx as SlotIndex, e)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        hiddenInputRefs.current[idx]?.click();
                      }}
                      className="absolute bottom-1.5 px-1.5 py-0.5 rounded bg-slate-900/75 hover:bg-slate-900 text-white text-[10px] font-medium opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer"
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <Upload className="w-6 h-6 mb-0.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Execute Button */}
        <div className="text-center">
          <button
            id="btn-execute"
            type="button"
            onClick={handleExecute}
            disabled={isMerging}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMerging ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
            <span>Execute</span>
          </button>
        </div>

        {/* Download Button & Output Image */}
        {mergedImageUrl && (
          <div id="output-area" className="space-y-4 pt-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-xs overflow-hidden flex items-center justify-center">
              <img
                src={mergedImageUrl}
                alt="Merged Output"
                className="w-full max-h-[480px] object-contain block bg-white rounded-xl"
              />
            </div>

            <button
              id="btn-download"
              type="button"
              onClick={handleDownload}
              className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
