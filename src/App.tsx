import { useState, useCallback, useEffect } from 'react';
import { FileUpload, ModeSelector, PresetSelector, BatchResultPanel, CustomSettingsModal, ThemeToggle } from './components';
import { processDocx, analyzeDocx } from './lib/docx-processor';
import { presets, defaultPreset } from './config/presets';
import type { ProcessMode, FormatPreset, BatchFileItem } from './types';
import './App.css';

const STORAGE_KEY = 'docformat-custom-settings';

function loadCustomSettings(): FormatPreset | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load custom settings:', e);
  }
  return null;
}

function saveCustomSettings(settings: FormatPreset) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save custom settings:', e);
  }
}

function App() {
  const [files, setFiles] = useState<BatchFileItem[]>([]);
  const [mode, setMode] = useState<ProcessMode>('smart');
  const [preset, setPreset] = useState(defaultPreset);
  const [processing, setProcessing] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customPreset, setCustomPreset] = useState<FormatPreset | null>(null);

  // 初始化时从 localStorage 加载自定义设置
  useEffect(() => {
    const saved = loadCustomSettings();
    if (saved) {
      setCustomPreset(saved);
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;

    setProcessing(true);

    // Reset all file statuses to pending
    setFiles(prev => prev.map(f => ({ ...f, status: 'pending' as const, result: undefined, outputBlob: undefined })));

    const selectedPreset = preset === 'custom' && customPreset
      ? customPreset
      : presets[preset];

    // Process files one by one
    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];

      // Update status to processing
      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'processing' as const } : f
      ));

      try {
        if (mode === 'analyze') {
          const analyzeResult = await analyzeDocx(fileItem.file);
          setFiles(prev => prev.map(f =>
            f.id === fileItem.id
              ? { ...f, status: analyzeResult.success ? 'success' as const : 'error' as const, result: analyzeResult }
              : f
          ));
        } else {
          const { blob, result: processResult } = await processDocx(fileItem.file, {
            fixPunctuation: mode === 'smart' || mode === 'punctuation',
            applyFormat: mode === 'smart',
            preset: selectedPreset,
          });

          setFiles(prev => prev.map(f =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: processResult.success ? 'success' as const : 'error' as const,
                  result: processResult,
                  outputBlob: processResult.success ? blob : undefined,
                }
              : f
          ));
        }
      } catch (error) {
        setFiles(prev => prev.map(f =>
          f.id === fileItem.id
            ? {
                ...f,
                status: 'error' as const,
                result: {
                  success: false,
                  message: error instanceof Error ? error.message : '未知错误',
                },
              }
            : f
        ));
      }
    }

    setProcessing(false);
  }, [files, mode, preset, customPreset]);

  const handleCustomClick = useCallback(() => {
    setShowCustomModal(true);
  }, []);

  const handleCustomSave = useCallback((newPreset: FormatPreset) => {
    setCustomPreset(newPreset);
    setPreset('custom');
    saveCustomSettings(newPreset);
  }, []);

  const isPresetDisabled = mode === 'punctuation' || mode === 'analyze';
  const hasProcessedFiles = files.some(f => f.status === 'success' || f.status === 'error');

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1 className="app-title">公文格式处理工具</h1>
          <ThemeToggle />
        </div>
        <p className="app-subtitle">一键修复 Word 文档格式，符合 GB/T 9704-2012 标准</p>
      </header>

      <main className="app-main">
        <section className="app-section">
          <FileUpload
            files={files}
            onFilesChange={setFiles}
            disabled={processing}
          />
        </section>

        <section className="app-section">
          <ModeSelector mode={mode} onModeChange={setMode} />
        </section>

        <section className="app-section">
          <PresetSelector
            selectedPreset={preset}
            onPresetChange={setPreset}
            onCustomClick={handleCustomClick}
            disabled={isPresetDisabled}
          />
        </section>

        <section className="app-section">
          <button
            className="process-btn"
            onClick={handleProcess}
            disabled={files.length === 0 || processing}
          >
            {processing ? (
              <>
                <span className="spinner"></span>
                处理中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                开始处理 {files.length > 0 && `(${files.length} 个文件)`}
              </>
            )}
          </button>
        </section>

        {hasProcessedFiles && (
          <section className="app-section">
            <BatchResultPanel files={files} />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>
          纯浏览器本地处理，文件不会上传至服务器
          <span className="separator">|</span>
          支持批量处理 .docx 格式
        </p>
      </footer>

      <CustomSettingsModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSave={handleCustomSave}
        initialSettings={customPreset || undefined}
      />
    </div>
  );
}

export default App;
