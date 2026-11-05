'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB, MAX_IMAGES } from '@/modules/lost-found/constants';

interface UploadedImage {
  url: string;
  publicId: string;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remaining);
      setUploading(true);
      setProgress(0);
      setUploadError('');

      const newImages: UploadedImage[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        if (!file) continue;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`${file.name}: Only JPEG, PNG, and WebP are allowed`);
          continue;
        }

        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name}: File too large (max ${MAX_IMAGE_SIZE_MB}MB)`);
          continue;
        }

        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', { method: 'POST', body: formData });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Upload failed');
          }

          const result = await response.json();
          newImages.push({ url: result.url, publicId: result.publicId });
          setProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
        } catch {
          setUploadError('Photo upload failed. You can retry or continue without a photo.');
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
        toast.success(`${newImages.length} image(s) uploaded successfully`);
      }

      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [images, onChange],
  );

  const removeImage = useCallback(
    (index: number) => {
      const updated = images.filter((_, i) => i !== index);
      onChange(updated);
    },
    [images, onChange],
  );

  return (
    <div className="space-y-3">
      {/* Upload area */}
      <label
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          uploading
            ? 'border-[var(--ring)] bg-[var(--ring)]/5'
            : 'border-[var(--border)] hover:border-[var(--ring)] hover:bg-[var(--secondary)]/50'
        } p-8`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          multiple
          className="sr-only"
          disabled={uploading || images.length >= MAX_IMAGES}
          onChange={(e) => handleUpload(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--muted-foreground)] border-t-[var(--accent)]" />
            <span className="text-sm font-semibold text-[var(--accent)]">
              Uploading... {progress}%
            </span>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-[var(--secondary)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <svg
              className="h-8 w-8 text-[var(--muted-foreground)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {images.length >= MAX_IMAGES
                ? 'Maximum images reached'
                : 'Click or drag to upload images'}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              JPEG, PNG, or WebP · Max {MAX_IMAGE_SIZE_MB}MB · Up to {MAX_IMAGES} images
            </span>
          </div>
        )}
      </label>
      {uploadError && (
        <p role="alert" className="text-sm text-red-400">
          {uploadError}
        </p>
      )}

      {/* Preview thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, index) => (
            <div
              key={img.publicId}
              className="group relative overflow-hidden rounded-xl border border-[var(--border)]"
            >
              <img
                src={img.url}
                alt={`Upload ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
