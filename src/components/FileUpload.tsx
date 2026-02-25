import { useCallback, useState } from 'react';
import type { BatchFileItem } from '../types';
import './FileUpload.css';

interface FileUploadProps {
  files: BatchFileItem[];
  onFilesChange: (files: BatchFileItem[]) => void;
  disabled?: boolean;
}

let fileIdCounter = 0;

function generateFileId(): string {
  return `file-${Date.now()}-${fileIdCounter++}`;
}

export function FileUpload({ files, onFilesChange, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles || disabled) return;

    const validFiles: BatchFileItem[] = [];
    const existingNames = new Set(files.map(f => f.file.name));

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (file.name.endsWith('.docx') && !existingNames.has(file.name)) {
        validFiles.push({
          id: generateFileId(),
          file,
          status: 'pending',
        });
        existingNames.add(file.name);
      }
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }

    if (newFiles.length > 0 && validFiles.length === 0) {
      alert('请上传 .docx 格式的文件（已存在的文件将被跳过）');
    }
  }, [files, onFilesChange, disabled]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [addFiles]
  );

  const handleRemoveFile = useCallback((id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  }, [files, onFilesChange]);

  const handleClearAll = useCallback(() => {
    onFilesChange([]);
  }, [onFilesChange]);

  const hasFiles = files.length > 0;

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-dropzone ${isDragging ? 'dragging' : ''} ${hasFiles ? 'has-files' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-placeholder">
          <div className="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="upload-text">
            {hasFiles ? '继续添加文件，或拖放到这里' : '拖放文件到这里，或点击选择'}
          </p>
          <p className="upload-hint">支持批量上传多个 .docx 文件</p>
          <input
            type="file"
            accept=".docx"
            multiple
            onChange={handleFileInput}
            className="file-input"
            disabled={disabled}
          />
        </div>
      </div>

      {hasFiles && (
        <div className="file-list">
          <div className="file-list-header">
            <span className="file-count">已选择 {files.length} 个文件</span>
            <button
              className="clear-all-btn"
              onClick={handleClearAll}
              disabled={disabled}
            >
              清空全部
            </button>
          </div>
          <div className="file-list-items">
            {files.map((item) => (
              <div key={item.id} className={`file-list-item ${item.status}`}>
                <div className="file-item-icon">
                  {item.status === 'processing' ? (
                    <div className="file-spinner" />
                  ) : item.status === 'success' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : item.status === 'error' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  )}
                </div>
                <div className="file-item-info">
                  <span className="file-item-name">{item.file.name}</span>
                  <span className="file-item-meta">
                    {formatFileSize(item.file.size)}
                    {item.status === 'processing' && ' · 处理中...'}
                    {item.status === 'success' && ' · 完成'}
                    {item.status === 'error' && ` · ${item.result?.message || '失败'}`}
                  </span>
                </div>
                {item.status === 'pending' && !disabled && (
                  <button
                    className="file-remove-btn"
                    onClick={() => handleRemoveFile(item.id)}
                    title="移除"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
                {item.status === 'success' && item.outputBlob && (
                  <button
                    className="file-download-btn"
                    onClick={() => downloadFile(item)}
                    title="下载"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function downloadFile(item: BatchFileItem) {
  if (!item.outputBlob) return;
  const fileName = item.file.name.replace(/\.docx$/i, '_formatted.docx');
  const url = URL.createObjectURL(item.outputBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
