import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * ImageCropper — canvas-based crop modal
 * Props:
 *   src      — object URL of the selected image
 *   shape    — 'circle' | 'rect'
 *   onCrop   — called with a Blob of the cropped image
 *   onCancel — called when user cancels
 */
export default function ImageCropper({ src, shape = 'rect', onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const imgRef = useRef(new Image());

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const CROP_SIZE = 300; // crop box size in px

  // Load image
  useEffect(() => {
    const img = imgRef.current;
    img.onload = () => {
      // Center image initially
      const s = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height);
      setScale(s);
      setOffset({ x: 0, y: 0 });
      setImgLoaded(true);
    };
    img.src = src;
  }, [src]);

  // Draw preview
  const draw = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas || !imgLoaded) return;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

    // Clip to circle or rect
    ctx.save();
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    const w = img.width * scale;
    const h = img.height * scale;
    const x = (CROP_SIZE - w) / 2 + offset.x;
    const y = (CROP_SIZE - h) / 2 + offset.y;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();

    // Overlay outside circle
    if (shape === 'circle') {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [imgLoaded, scale, offset, shape]);

  useEffect(() => { draw(); }, [draw]);

  // Mouse drag
  const onMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setDragging(false);

  // Touch drag
  const onTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const onTouchMove = (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  // Export cropped image as Blob
  const handleCrop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    const w = img.width * scale;
    const h = img.height * scale;
    const x = (CROP_SIZE - w) / 2 + offset.x;
    const y = (CROP_SIZE - h) / 2 + offset.y;
    ctx.drawImage(img, x, y, w, h);

    canvas.toBlob((blob) => onCrop(blob), 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h3 className="text-headline-sm font-bold text-on-surface">Adjust Photo</h3>
          <button onClick={onCancel} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Crop area */}
        <div className="p-6 flex flex-col items-center gap-4">
          <p className="text-label-md text-on-surface-variant text-center">
            Drag to reposition · Scroll or use slider to zoom
          </p>

          {/* Preview canvas */}
          <div
            className={`relative overflow-hidden cursor-grab active:cursor-grabbing select-none border-2 border-primary ${shape === 'circle' ? 'rounded-full' : 'rounded-xl'}`}
            style={{ width: CROP_SIZE, height: CROP_SIZE }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
            onWheel={(e) => {
              e.preventDefault();
              setScale((s) => Math.min(5, Math.max(0.3, s - e.deltaY * 0.001)));
            }}
          >
            <canvas ref={previewRef} width={CROP_SIZE} height={CROP_SIZE} className="block" />
          </div>

          {/* Zoom slider */}
          <div className="w-full flex items-center gap-3">
            <span className="material-symbols-outlined text-outline text-sm">zoom_out</span>
            <input
              type="range"
              min="0.3"
              max="5"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="material-symbols-outlined text-outline text-sm">zoom_in</span>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={() => { setScale(Math.max(CROP_SIZE / imgRef.current.width, CROP_SIZE / imgRef.current.height)); setOffset({ x: 0, y: 0 }); }}
            className="text-label-md text-primary hover:underline"
          >
            Reset position
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button type="button" onClick={onCancel} className="flex-1 btn-outline justify-center py-3 rounded-lg">
            Cancel
          </button>
          <button type="button" onClick={handleCrop} className="flex-1 btn-primary justify-center py-3 rounded-lg">
            <span className="material-symbols-outlined text-sm">crop</span>
            Apply Crop
          </button>
        </div>
      </div>

      {/* Hidden export canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
