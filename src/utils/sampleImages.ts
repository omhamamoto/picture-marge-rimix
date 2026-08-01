import { ImageItem } from '../types';

function createSvgDataUrl(title: string, subtitle: string, bgColor: string, accentColor: string, iconType: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <linearGradient id="grad_${iconType}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor}" />
        <stop offset="100%" stop-color="${accentColor}" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000" flood-opacity="0.15" />
      </filter>
    </defs>
    <rect width="800" height="800" fill="url(#grad_${iconType})" />
    <circle cx="400" cy="350" r="180" fill="white" opacity="0.2" />
    <circle cx="400" cy="350" r="120" fill="white" opacity="0.25" filter="url(#shadow)" />
    
    <text x="400" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" fill="#ffffff" text-anchor="middle" filter="url(#shadow)">${title}</text>
    <text x="400" y="430" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="500" fill="#f8fafc" text-anchor="middle" opacity="0.9">${subtitle}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_IMAGES: ImageItem[] = [
  {
    id: 'sample-1',
    name: 'Sample 1 - Sunset Warmth',
    src: createSvgDataUrl('Sunset', 'Sample Image 1', '#f97316', '#ea580c', 'sun'),
    width: 800,
    height: 800,
    fileSize: '12 KB',
    isSample: true,
  },
  {
    id: 'sample-2',
    name: 'Sample 2 - Ocean Mist',
    src: createSvgDataUrl('Ocean', 'Sample Image 2', '#0284c7', '#0369a1', 'sea'),
    width: 800,
    height: 800,
    fileSize: '12 KB',
    isSample: true,
  },
  {
    id: 'sample-3',
    name: 'Sample 3 - Forest Emerald',
    src: createSvgDataUrl('Forest', 'Sample Image 3', '#10b981', '#047857', 'tree'),
    width: 800,
    height: 800,
    fileSize: '12 KB',
    isSample: true,
  },
  {
    id: 'sample-4',
    name: 'Sample 4 - Cosmic Purple',
    src: createSvgDataUrl('Cosmic', 'Sample Image 4', '#8b5cf6', '#6d28d9', 'star'),
    width: 800,
    height: 800,
    fileSize: '12 KB',
    isSample: true,
  },
];
