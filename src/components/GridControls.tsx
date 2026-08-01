import React from 'react';
import { GridConfig, FitMode, AspectRatio, ExportFormat } from '../types';
import { Sliders, Maximize2, Palette, Image as ImageIcon, Sparkles } from 'lucide-react';

interface GridControlsProps {
  config: GridConfig;
  onChangeConfig: (newConfig: Partial<GridConfig>) => void;
  onResetDefaults: () => void;
}

const PRESET_COLORS = [
  { label: 'White (Default)', hex: '#FFFFFF', border: true },
  { label: 'Off-White', hex: '#F8FAFC' },
  { label: 'Light Slate', hex: '#E2E8F0' },
  { label: 'Dark Slate', hex: '#0F172A' },
  { label: 'Pure Black', hex: '#000000' },
  { label: 'Warm Cream', hex: '#FEF3C7' },
];

export const GridControls: React.FC<GridControlsProps> = ({ config, onChangeConfig, onResetDefaults }) => {
  return (
    <div id="grid-controls-section" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Layout & Export Settings</span>
        </h2>
        <button
          type="button"
          onClick={onResetDefaults}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          Reset Settings
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Fit Mode */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Image Fitting Mode
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {(['cover', 'contain', 'fill'] as FitMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChangeConfig({ fitMode: mode })}
                className={`py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                  config.fitMode === mode
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {config.fitMode === 'cover' && 'Crops images to fill quadrant area perfectly'}
            {config.fitMode === 'contain' && 'Fits entire image inside quadrant with padding'}
            {config.fitMode === 'fill' && 'Stretches image to fit exact quadrant box'}
          </p>
        </div>

        {/* Grid Gap / Spacing */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              Grid Spacing (Gap)
            </label>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {config.gap}px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={2}
            value={config.gap}
            onChange={(e) => onChangeConfig({ gap: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0px (Seamless)</span>
            <span>20px</span>
            <span>40px (Wide)</span>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Canvas Aspect Ratio
          </label>
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
            {(['1:1', '4:3', '16:9', '3:4'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => onChangeConfig({ aspectRatio: ratio })}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  config.aspectRatio === ratio
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {config.aspectRatio === '1:1' ? 'Square canvas (1080x1080 standard)' : `Custom ratio ${config.aspectRatio}`}
          </p>
        </div>

        {/* Background / Unused Slot Color */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
            Background Color (Unused Slot Fill)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => onChangeConfig({ backgroundColor: preset.hex })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  config.backgroundColor.toUpperCase() === preset.hex.toUpperCase()
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300"
                  style={{ backgroundColor: preset.hex }}
                ></span>
                <span>{preset.label}</span>
              </button>
            ))}

            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2 py-0.5 bg-white">
              <span className="text-[11px] text-slate-500 font-medium">Custom:</span>
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => onChangeConfig({ backgroundColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
              />
              <span className="text-xs font-mono font-medium text-slate-700">{config.backgroundColor}</span>
            </div>
          </div>
        </div>

        {/* Resolution & Format */}
        <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resolution
              </label>
              <select
                aria-label="Resolution"
                value={config.outputResolution}
                onChange={(e) => onChangeConfig({ outputResolution: parseInt(e.target.value, 10) })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg py-1.5 px-2 font-semibold"
              >
                <option value={1000}>1000 px (Standard)</option>
                <option value={1600}>1600 px (HD)</option>
                <option value={2400}>2400 px (2K Ultra)</option>
                <option value={3600}>3600 px (4K Master)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Format
              </label>
              <select
                aria-label="Export Format"
                value={config.exportFormat}
                onChange={(e) => onChangeConfig({ exportFormat: e.target.value as ExportFormat })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg py-1.5 px-2 font-semibold"
              >
                <option value="image/png">PNG (.png)</option>
                <option value="image/jpeg">JPEG (.jpg)</option>
                <option value="image/webp">WEBP (.webp)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
