import React, { useRef } from 'react';
import { ImageItem, SlotIndex, SLOT_METADATA } from '../types';
import { Upload, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Plus } from 'lucide-react';

interface ImageUploaderProps {
  images: ImageItem[];
  slots: (ImageItem | null)[];
  onUploadMultiple: (files: FileList) => void;
  onRemoveImage: (id: string) => void;
  onAssignToSlot: (image: ImageItem, targetSlot: SlotIndex) => void;
  onAutoFillSlots: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  slots,
  onUploadMultiple,
  onRemoveImage,
  onAssignToSlot,
  onAutoFillSlots,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadMultiple(e.dataTransfer.files);
    }
  };

  // Helper to find which slot an image is currently assigned to
  const getAssignedSlotIndex = (imgId: string): SlotIndex | null => {
    const idx = slots.findIndex((item) => item?.id === imgId);
    return idx !== -1 ? (idx as SlotIndex) : null;
  };

  const filledSlotCount = slots.filter(Boolean).length;

  return (
    <div id="image-uploader-section" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Image Queue & Assignments</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              {images.length} Loaded
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload images (1 to 4 max). Unassigned slots remaining will render as white background.
          </p>
        </div>

        {images.length > 0 && (
          <button
            type="button"
            onClick={onAutoFillSlots}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition-colors cursor-pointer"
            title="Auto assign uploaded images into slots 1-4"
          >
            Auto Fill 1-4
          </button>
        )}
      </div>

      {/* Main Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/40 rounded-xl p-6 text-center transition-all cursor-pointer group"
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onUploadMultiple(e.target.files);
              e.target.value = '';
            }
          }}
        />
        <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors mb-2 shadow-xs">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-900">
          Click or Drag & Drop Images Here
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supports JPG, PNG, WEBP, SVG • Upload up to 4 images
        </p>
      </div>

      {/* List of Loaded Images */}
      {images.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Uploaded List ({images.length}/4 active)
          </h3>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {images.map((img, idx) => {
              const assignedSlot = getAssignedSlotIndex(img.id);

              return (
                <div
                  key={img.id}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                    assignedSlot !== null
                      ? 'bg-indigo-50/40 border-indigo-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={img.src}
                      alt={img.name}
                      className="w-11 h-11 object-cover rounded-lg border border-slate-200 bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate" title={img.name}>
                        {img.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {img.width && img.height && (
                          <span>{img.width}×{img.height}</span>
                        )}
                        {img.fileSize && <span>• {img.fileSize}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Position Slot selector badge */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Position:</span>
                      <select
                        aria-label={`Position for image ${img.name}`}
                        value={assignedSlot !== null ? assignedSlot : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            // Unassign logic if needed, or select slot
                          } else {
                            onAssignToSlot(img, parseInt(val, 10) as SlotIndex);
                          }
                        }}
                        className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg py-1 px-2 font-semibold focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                      >
                        <option value="" disabled>Choose Slot...</option>
                        {SLOT_METADATA.map((meta) => (
                          <option key={meta.index} value={meta.index}>
                            {meta.gridAreaName} ({meta.label.split(':')[1].trim()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveImage(img.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
