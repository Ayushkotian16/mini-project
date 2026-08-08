import React, { useRef, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ImageCropper from './ImageCropper';

/**
 * ImageUploader with crop support
 * Props:
 *   value       — current image URL
 *   onChange    — called with new URL after upload
 *   label       — field label
 *   isPublic    — use public endpoint (no auth)
 *   shape       — 'circle' | 'rect'
 *   placeholder — empty state text
 */
export default function ImageUploader({
  value,
  onChange,
  label = 'Image',
  isPublic = false,
  shape = 'rect',
  placeholder = 'Click or drag to upload',
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [dragOver, setDragOver] = useState(false);
  const [cropSrc, setCropSrc] = useState(null); // triggers crop modal

  const BASE = import.meta.env.VITE_API_URL || '/api';
  const endpoint = isPublic ? `${BASE}/upload/public` : `${BASE}/upload`;
  const isCircle = shape === 'circle';

  // Upload a Blob/File to server
  const uploadBlob = useCallback(async (blob, filename = 'image.jpg') => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', blob, filename);
      const token = localStorage.getItem('adminToken');
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (token && !isPublic) headers.Authorization = `Bearer ${token}`;

      const res = await axios.post(endpoint, formData, { headers });
      setPreview(res.data.url);
      onChange(res.data.url);
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  }, [endpoint, isPublic, onChange, value]);

  // When file selected — open crop modal
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      toast.error('Only image files allowed (JPG, PNG, WebP, GIF, SVG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB.');
      return;
    }

    // Open crop modal with local preview
    const localUrl = URL.createObjectURL(file);
    setCropSrc(localUrl);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  // After crop — upload the cropped blob
  const handleCropDone = (blob) => {
    setCropSrc(null);
    const localUrl = URL.createObjectURL(blob);
    setPreview(localUrl); // show immediately
    uploadBlob(blob, 'cropped.jpg');
  };

  const handleCropCancel = () => {
    setCropSrc(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) { toast.error('Only image files allowed.'); return; }
    const localUrl = URL.createObjectURL(file);
    setCropSrc(localUrl);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview('');
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      {/* Crop Modal */}
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          shape={shape}
          onCrop={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}

      <div className="flex flex-col gap-2">
        {label && <label className="text-label-lg text-on-surface-variant">{label}</label>}

        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={[
            'relative cursor-pointer overflow-hidden transition-all group',
            'border-2 border-dashed',
            dragOver ? 'border-primary bg-primary-fixed/30 scale-[1.01]' : 'border-outline-variant hover:border-primary',
            isCircle ? 'rounded-full w-36 h-36 mx-auto' : 'rounded-2xl w-full h-48',
            uploading ? 'opacity-60 cursor-wait' : '',
          ].join(' ')}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className={`w-full h-full object-cover ${isCircle ? 'rounded-full' : 'rounded-2xl'}`}
              />
              {/* Hover overlay */}
              <div className={`absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 ${isCircle ? 'rounded-full' : 'rounded-2xl'}`}>
                <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                <span className="text-white text-label-md font-semibold">Change & Crop</span>
              </div>
              {/* Remove button */}
              {!uploading && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-error text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
              {/* Upload spinner */}
              {uploading && (
                <div className={`absolute inset-0 bg-black/60 flex items-center justify-center ${isCircle ? 'rounded-full' : 'rounded-2xl'}`}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-white text-label-md">Uploading...</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 text-center">
              {uploading ? (
                <>
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-label-md text-on-surface-variant">Uploading...</span>
                </>
              ) : (
                <>
                  <div className={`flex items-center justify-center rounded-full bg-secondary-container group-hover:bg-primary transition-colors ${isCircle ? 'w-14 h-14' : 'w-16 h-16'}`}>
                    <span className="material-symbols-outlined text-primary group-hover:text-on-primary transition-colors text-3xl">add_photo_alternate</span>
                  </div>
                  <div>
                    <p className="text-label-lg font-semibold text-on-surface group-hover:text-primary transition-colors">{placeholder}</p>
                    <p className="text-label-md text-outline mt-1">JPG, PNG, WebP · Crop to fit</p>
                    {!isCircle && <p className="text-label-md text-outline">or drag & drop</p>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </>
  );
}
