import React from 'react';
import { Grid2x2, Sparkles, Trash2, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onLoadSamples: () => void;
  onClearAll: () => void;
  imageCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onLoadSamples, onClearAll, imageCount }) => {
  return (
    <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Grid2x2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Image Grid Merger</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  2x2 Grid Engine
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Upload up to 4 images to merge into a 2x2 grid. Unused slots automatically fill with white.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="btn-load-samples"
              type="button"
              onClick={onLoadSamples}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              title="Load 4 sample images to quickly test the merger"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Load Sample Images
            </button>

            {imageCount > 0 && (
              <button
                id="btn-clear-all"
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 transition-colors cursor-pointer"
                title="Remove all uploaded images"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
