"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, ImagePlus, Loader2, Star, Trash2, Upload } from "lucide-react";

interface UploadItem {
  id: string;
  url: string;
  preview: string;
  uploading: boolean;
  error?: string;
}

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
  maxImages?: number;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ImageUploader({
  value,
  onChange,
  onUploadingChange,
  disabled,
  maxImages,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState<UploadItem[]>(() =>
    value.map((url) => ({
      id: uid(),
      url,
      preview: url,
      uploading: false,
    }))
  );

  const syncUrls = useCallback(
    (next: UploadItem[]) => {
      setItems(next);
      onChange(next.filter((i) => i.url && !i.uploading).map((i) => i.url));
    },
    [onChange]
  );

  async function uploadFile(file: File) {
    const id = uid();
    const preview = URL.createObjectURL(file);

    setItems((prev) => {
      const base = maxImages === 1 ? [] : prev;
      return [...base, { id, url: "", preview, uploading: true }];
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id
            ? { ...item, url: data.url, preview: data.url, uploading: false }
            : item
        );
        onChange(next.filter((i) => i.url && !i.uploading).map((i) => i.url));
        return next;
      });
      URL.revokeObjectURL(preview);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, uploading: false, error: msg } : item
        )
      );
    }
  }

  async function handleFiles(fileList: FileList | File[]) {
    let files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (maxImages === 1) {
      files = files.slice(0, 1);
    } else if (maxImages) {
      const remaining = maxImages - items.filter((i) => i.url).length;
      files = files.slice(0, Math.max(0, remaining));
    }
    for (const file of files) {
      await uploadFile(file);
    }
  }

  function removeItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (item?.preview.startsWith("blob:")) {
      URL.revokeObjectURL(item.preview);
    }
    syncUrls(items.filter((i) => i.id !== id));
  }

  function setPrimary(id: string) {
    const idx = items.findIndex((i) => i.id === id);
    if (idx <= 0) return;
    const next = [...items];
    const [picked] = next.splice(idx, 1);
    next.unshift(picked);
    syncUrls(next);
  }

  const isUploading = items.some((i) => i.uploading);
  const atMax = maxImages ? items.filter((i) => i.url).length >= maxImages : false;

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  return (
    <div className="image-uploader">
      <div
        className={`image-uploader-dropzone ${dragOver ? "drag-over" : ""} ${disabled ? "disabled" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled && e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={!maxImages || maxImages > 1}
          hidden
          disabled={disabled || (atMax && !isUploading)}
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="image-uploader-dropzone-icon">
          {isUploading ? <Loader2 className="spin" size={32} /> : <Upload size={32} />}
        </div>
        <p className="image-uploader-dropzone-title">
          Drag & drop images here, or <span>browse files</span>
        </p>
        <p className="image-uploader-dropzone-hint">
          JPG, PNG, WebP up to 8MB · Uploaded to Hostinger via FTP
        </p>
      </div>

      {items.length > 0 && (
        <div className="image-uploader-grid">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`image-uploader-card ${item.uploading ? "uploading" : ""} ${item.error ? "error" : ""}`}
            >
              <div className="image-uploader-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" />
                {item.uploading && (
                  <div className="image-uploader-card-overlay">
                    <Loader2 className="spin" size={24} />
                    <span>Uploading…</span>
                  </div>
                )}
                {item.error && (
                  <div className="image-uploader-card-overlay error">
                    <span>{item.error}</span>
                  </div>
                )}
              </div>
              <div className="image-uploader-card-actions">
                {index === 0 ? (
                  <span className="image-uploader-primary">
                    <Star size={12} fill="currentColor" /> Primary
                  </span>
                ) : (
                  <button
                    type="button"
                    className="image-uploader-set-primary"
                    onClick={() => setPrimary(item.id)}
                    disabled={disabled || item.uploading || !item.url}
                  >
                    Set primary
                  </button>
                )}
                <button
                  type="button"
                  className="image-uploader-remove"
                  onClick={() => removeItem(item.id)}
                  disabled={disabled || item.uploading}
                  aria-label="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {item.url && (
                <span className="image-uploader-url" title={item.url}>
                  <GripVertical size={12} />
                  {item.url.replace(/^https?:\/\//, "").slice(0, 36)}…
                </span>
              )}
            </div>
          ))}

          {(!maxImages || items.filter((i) => i.url).length < maxImages) && (
            <button
              type="button"
              className="image-uploader-add-more"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              <ImagePlus size={24} />
              <span>Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
