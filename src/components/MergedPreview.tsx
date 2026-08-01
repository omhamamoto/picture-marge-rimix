import React, { useEffect, useRef, useState } from 'react';
import { GridConfig, ImageItem, SLOT_METADATA } from '../types';
import { renderGridToCanvas, downloadCanvas, GridSimulation } from '../utils/canvasMerger';
import { Download, Copy, Check, Eye, Layers, Sparkles } from 'lucide-react';

interface MergedPreviewProps {
  slots: (ImageItem | null)[];
  config: GridConfig;
}

export const MergedPreview: React.FC<MergedPreviewProps> = ({ slots, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [sim, setSim] = useState<GridSimulation | null>(null);

  const filledCount = slots.filter(Boolean).length;
  const emptyCount = 4 - filledCount;

  useEffect(() => {
    let isCancelled = false;

    async function draw() {
      if (!canvasRef.current) return;
      setIsRendering(true);
      try {
        const res = await renderGridToCanvas(canvasRef.current, slots, config);
        if (!isCancelled) setSim(res);
      } catch (err) {
        console.error('Canvas render error:', err);
      } finally {
        if (!isCancelled) setIsRendering(false);
      }
    }

    draw();

    return () => {
      isCancelled = true;
    };
  }, [slots, config]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const ext = config.exportFormat.split('/')[1] || 'png';
    const filename = `merged-2x2-grid.${ext}`;
    downloadCanvas(canvasRef.current, filename, config.exportFormat);
  };

  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (err) {
          console.error('Clipboard write failed:', err);
          alert('Copying image to clipboard is not supported in this browser mode. Please use Download instead.');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="merged-preview-section" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Merged 2x2 Canvas Preview</span>
            {isRendering && (
              <span className="text-xs font-normal text-indigo-600 animate-pulse">
                Rendering...
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live preview of the generated 2x2 grid image ({sim ? `${sim.totalWidth} × ${sim.totalHeight}` : 'Calculating...'} px).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Overlay Toggle Button */}
          <button
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              showOverlays
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle position indicators on preview"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showOverlays ? 'Positions Visible' : 'Hide Indicators'}</span>
          </button>

          {/* Download Button */}
          <button
            id="btn-download-image"
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer hover:shadow-md active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download Merged Grid</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="relative bg-slate-900/90 rounded-2xl overflow-hidden p-4 flex flex-col items-center justify-center min-h-[320px] shadow-inner border border-slate-800">
        
        {/* Transparent grid background effect */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        ></div>

        {/* The Canvas */}
        <div className="relative max-w-full max-h-[500px] flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-white/10">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto object-contain block max-h-[480px] rounded"
          />

          {/* Position Indicator Overlay Cards over Canvas */}
          {showOverlays && (
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
              {SLOT_METADATA.map((meta) => {
                const img = slots[meta.index];
                return (
                  <div
                    key={meta.index}
                    className="p-2 flex flex-col justify-start items-start"
                  >
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900/85 text-white backdrop-blur-xs border border-white/20 shadow-md">
                      <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 text-white text-[9px] flex items-center justify-center font-extrabold">
                        {meta.index + 1}
                      </span>
                      {meta.gridAreaName}
                      {!img && <span className="text-amber-300 font-normal text-[10px] ml-1">(White Fill)</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Toolbar Below Preview */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 w-full max-w-lg bg-slate-800/80 backdrop-blur-sm p-3 rounded-xl border border-slate-700/80 text-slate-300 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">Grid Status:</span>
            <span>
              {filledCount} {filledCount === 1 ? 'image' : 'images'} placed • {emptyCount} white space {emptyCount === 1 ? 'fill' : 'fills'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Footnote */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Export Format: <strong className="text-slate-900">{config.exportFormat.split('/')[1].toUpperCase()}</strong> ({sim?.totalWidth || 0} × {sim?.totalHeight || 0}px)
          </span>
        </div>
        <span className="text-slate-400 text-[11px]">Unused slots are filled with {config.backgroundColor.toUpperCase()}</span>
      </div>
    </div>
  );
};
