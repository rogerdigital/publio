import { useEffect, useState } from 'react';
import { ImageIcon, X, Upload } from 'lucide-react';
import * as css from './mediaLibrary.css';

interface UploadEntry {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

interface MediaLibraryProps {
  onSelect: (url: string, filename: string) => void;
  imageBedLabel?: string;
}

export default function MediaLibrary({ onSelect, imageBedLabel }: MediaLibraryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);

    fetch('/api/uploads')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setUploads(data.uploads ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  function handleUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/gif,image/webp';
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      if (files.length === 0) return;

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          if (!res.ok) continue;
          const { url, filename } = await res.json();
          setUploads((prev) => [
            { filename, url, size: file.size, createdAt: new Date().toISOString() },
            ...prev,
          ]);
        } catch {
          // skip failed uploads
        }
      }
    };
    input.click();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <>
      <button type="button" className={css.trigger} onClick={() => setIsOpen(true)} title="媒体库">
        <ImageIcon size={14} />
        媒体库
      </button>

      {isOpen && (
        <div className={css.overlay} onClick={() => setIsOpen(false)}>
          <div className={css.modal} onClick={(e) => e.stopPropagation()}>
            <div className={css.modalHeader}>
              <h3 className={css.modalTitle}>媒体库</h3>
              <div className={css.modalHeaderActions}>
                <button type="button" className={css.uploadBtn} onClick={handleUpload}>
                  <Upload size={14} />
                  上传图片{imageBedLabel ? ` (${imageBedLabel})` : ''}
                </button>
                <button type="button" className={css.closeBtn} onClick={() => setIsOpen(false)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className={css.modalBody}>
              {loading && <p className={css.emptyText}>加载中...</p>}

              {!loading && uploads.length === 0 && (
                <div className={css.emptyState}>
                  <ImageIcon size={32} />
                  <p className={css.emptyText}>暂无上传的图片</p>
                  <button type="button" className={css.uploadBtn} onClick={handleUpload}>
                    上传第一张图片
                  </button>
                </div>
              )}

              {!loading && uploads.length > 0 && (
                <div className={css.grid}>
                  {uploads.map((item) => (
                    <button
                      key={item.filename}
                      type="button"
                      className={css.gridItem}
                      onClick={() => {
                        onSelect(item.url, item.filename);
                        setIsOpen(false);
                      }}
                      title={`${item.filename} (${formatSize(item.size)})`}
                    >
                      <img src={item.url} alt={item.filename} className={css.gridImage} />
                      <span className={css.gridMeta}>{formatSize(item.size)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
