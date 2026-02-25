import type { ProcessResult } from '../types';
import './ResultPanel.css';

interface ResultPanelProps {
  result: ProcessResult | null;
  onDownload?: () => void;
  hasDownload?: boolean;
}

export function ResultPanel({ result, onDownload, hasDownload }: ResultPanelProps) {
  if (!result) return null;

  return (
    <div className={`result-panel ${result.success ? 'success' : 'error'}`}>
      <div className="result-header">
        <div className="result-icon">
          {result.success ? (
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
        <span className="result-message">{result.message}</span>
        {hasDownload && result.success && (
          <button className="download-btn" onClick={onDownload}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            下载文件
          </button>
        )}
      </div>
      {result.details && result.details.length > 0 && (
        <div className="result-details">
          {result.details.map((detail, index) => (
            <div key={index} className="result-detail-item">
              {detail}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
