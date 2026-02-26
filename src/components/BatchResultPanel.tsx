import { useState } from 'react';
import type { BatchFileItem } from '../types';
import JSZip from 'jszip';
import './BatchResultPanel.css';

interface BatchResultPanelProps {
  files: BatchFileItem[];
}

export function BatchResultPanel({ files }: BatchResultPanelProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const processedFiles = files.filter(f => f.status === 'success' || f.status === 'error');
  const successFiles = files.filter(f => f.status === 'success');
  const downloadableFiles = files.filter(f => f.status === 'success' && f.outputBlob);
  const errorFiles = files.filter(f => f.status === 'error');

  if (processedFiles.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDownloadAll = async () => {
    if (downloadableFiles.length === 0) return;

    if (downloadableFiles.length === 1) {
      downloadSingleFile(downloadableFiles[0]);
    } else {
      const zip = new JSZip();

      for (const item of downloadableFiles) {
        if (item.outputBlob) {
          const fileName = item.file.name.replace(/\.docx$/i, '_formatted.docx');
          zip.file(fileName, item.outputBlob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formatted_documents_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const allSuccess = errorFiles.length === 0 && successFiles.length > 0;
  const allError = successFiles.length === 0 && errorFiles.length > 0;

  return (
    <div className="batch-result-panel">
      {/* Summary Header */}
      <div className={`batch-result-summary ${allSuccess ? 'success' : allError ? 'error' : 'mixed'}`}>
        <div className="batch-result-header">
          <div className="batch-result-icon">
            {allSuccess ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : allError ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>
          <div className="batch-result-info">
            <span className="batch-result-title">
              {allSuccess
                ? '全部处理完成'
                : allError
                ? '处理失败'
                : '部分处理完成'}
            </span>
            <span className="batch-result-stats">
              成功 {successFiles.length} 个，失败 {errorFiles.length} 个
            </span>
          </div>
          {downloadableFiles.length > 0 && (
            <button className="batch-download-btn" onClick={handleDownloadAll}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {downloadableFiles.length === 1 ? '下载文件' : '下载全部'}
            </button>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      <div className="batch-result-details">
        {processedFiles.map((item) => {
          const isExpanded = expandedFiles.has(item.id);
          const hasDetails = item.result?.details && item.result.details.length > 0;

          return (
            <div key={item.id} className={`file-result-item ${item.status}`}>
              <div
                className={`file-result-header ${hasDetails ? 'expandable' : ''}`}
                onClick={() => hasDetails && toggleExpand(item.id)}
              >
                <div className="file-result-icon">
                  {item.status === 'success' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                </div>
                <div className="file-result-info">
                  <span className="file-result-name">{item.file.name}</span>
                  <span className="file-result-message">{item.result?.message}</span>
                </div>
                {hasDetails && (
                  <div className={`file-result-expand ${isExpanded ? 'expanded' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                )}
                {item.status === 'success' && item.outputBlob && (
                  <button
                    className="file-result-download"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSingleFile(item);
                    }}
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
              {hasDetails && isExpanded && (
                <div className="file-result-details">
                  {item.result?.details?.map((detail, index) => (
                    <div key={index} className="file-result-detail-item">
                      {detail}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function downloadSingleFile(item: BatchFileItem) {
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
