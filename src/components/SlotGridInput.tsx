import React, { useRef, useState } from 'react';
import { SLOT_METADATA, SlotIndex, ImageItem } from '../types';
import { Upload, X, ArrowLeftRight, Image as ImageIcon, Plus, CheckCircle2 } from 'lucide-react';

interface SlotGridInputProps {
  slots: (ImageItem | null)[];
  onSlotChange: (slotIndex: SlotIndex, item: ImageItem | null) => void;
  onSwapSlots: (slotA: SlotIndex, slotB: SlotIndex) => void;
  onUploadToSlot: (slotIndex: SlotIndex, file: File) => void;
  availableImages: ImageItem[];
  onSelectImageForSlot: (slotIndex: SlotIndex, imageId: string) => void;
}

export const SlotGridInput: React.FC<SlotGridInputProps> = ({
  slots,
  onSlotChange,
  onSwapSlots,
  onUploadToSlot,
  availableImages,
  onSelectImageForSlot,
}) => {
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [dragOverSlot, setDragOverSlot] = useState<SlotIndex | null>(null);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState<SlotIndex | null>(null);

  const handleFileChange = (slotIndex: SlotIndex, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onUploadToSlot(slotIndex, file);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: SlotIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(slotIndex);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlot: SlotIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);

    // Check if dragging another slot within the app
    if (draggedSlotIndex !== null) {
      if (draggedSlotIndex !== targetSlot) {
        onSwapSlots(draggedSlotIndex, targetSlot);
      }
      setDraggedSlotIndex(null);
      return;
    }

    // Check if dropping external files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onUploadToSlot(targetSlot, file);
    }
  };

  return (
    <div id="slot-grid-input-section" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>2x2 Input Layout Matrix</span>
            <span className="text-xs px-2 py-0.5 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Interactive Slots
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visually map each image to its exact quadrant position in the merged 2x2 grid.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <span>4 Positions (1 to 4)</span>
        </div>
      </div>

      {/* 2x2 Visual Layout Grid */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 aspect-square max-w-lg mx-auto bg-slate-100 p-3 sm:p-4 rounded-xl border border-slate-200">
        {SLOT_METADATA.map((meta) => {
          const slotIndex = meta.index;
          const image = slots[slotIndex];
          const isDraggingOver = dragOverSlot === slotIndex;

          return (
            <div
              key={slotIndex}
              id={`slot-card-${slotIndex}`}
              draggable={!!image}
              onDragStart={() => setDraggedSlotIndex(slotIndex)}
              onDragOver={(e) => handleDragOver(e, slotIndex)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, slotIndex)}
              className={`relative group rounded-lg border-2 transition-all flex flex-col justify-between overflow-hidden p-2.5 ${
                isDraggingOver
                  ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-200 scale-[1.01]'
                  : image
                  ? 'border-indigo-200 bg-white shadow-xs hover:border-indigo-400'
                  : 'border-dashed border-slate-300 bg-white/80 hover:bg-white hover:border-indigo-300'
              }`}
            >
              {/* Hidden file input for this slot */}
              <input
                type="file"
                ref={fileInputRefs[slotIndex]}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(slotIndex, e)}
              />

              {/* Slot Header Badge */}
              <div className="flex items-center justify-between z-10 w-full mb-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold bg-slate-900 text-white shadow-xs">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                    {slotIndex + 1}
                  </span>
                  {meta.gridAreaName}
                </span>

                {image ? (
                  <button
                    type="button"
                    onClick={() => onSlotChange(slotIndex, null)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Clear slot (Make White Fill)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    White Fill
                  </span>
                )}
              </div>

              {/* Center Content: Image preview or Empty Placeholder */}
              {image ? (
                <div className="relative flex-1 flex flex-col items-center justify-center min-h-0 my-1 group/img">
                  <div className="relative w-full h-full max-h-36 sm:max-h-44 rounded-md overflow-hidden bg-slate-900/5 border border-slate-200 flex items-center justify-center">
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      <button
                        type="button"
                        onClick={() => fileInputRefs[slotIndex].current?.click()}
                        className="px-2 py-1 text-[11px] font-medium rounded bg-white/90 text-slate-900 hover:bg-white shadow-xs"
                      >
                        Replace
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 w-full text-center truncate">
                    <p className="text-[11px] font-semibold text-slate-800 truncate px-1" title={image.name}>
                      {image.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-2 text-center min-h-[100px] border border-dashed border-slate-200 rounded-md bg-slate-50/50">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Empty Slot #{slotIndex + 1}</p>
                  <p className="text-[11px] text-slate-400 mb-2">Fills with white</p>

                  <button
                    type="button"
                    onClick={() => fileInputRefs[slotIndex].current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Upload Image
                  </button>
                </div>
              )}

              {/* Slot Footer Controls: Position Swapper */}
              <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                <span className="text-slate-400 font-medium text-[10px] hidden sm:inline">
                  {meta.label.split(':')[1]}
                </span>
                
                {/* Position selector dropdown */}
                <div className="flex items-center gap-1 ml-auto">
                  <ArrowLeftRight className="w-3 h-3 text-slate-400" />
                  <select
                    id={`select-slot-position-${slotIndex}`}
                    aria-label={`Select position for slot ${slotIndex + 1}`}
                    value={slotIndex}
                    onChange={(e) => {
                      const newTargetSlot = parseInt(e.target.value, 10) as SlotIndex;
                      if (newTargetSlot !== slotIndex) {
                        onSwapSlots(slotIndex, newTargetSlot);
                      }
                    }}
                    className="bg-slate-50 border border-slate-200 text-slate-700 rounded text-[11px] py-0.5 px-1 font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value={0}>Pos 1: Top-Left</option>
                    <option value={1}>Pos 2: Top-Right</option>
                    <option value={2}>Pos 3: Bottom-Left</option>
                    <option value={3}>Pos 4: Bottom-Right</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="flex items-center gap-1">
          💡 <span className="font-medium text-slate-600">Tip:</span> Drag and drop images onto any slot box to position them.
        </span>
        <span className="hidden sm:inline text-slate-400">Slots 1-4 fill in reading order</span>
      </div>
    </div>
  );
};
