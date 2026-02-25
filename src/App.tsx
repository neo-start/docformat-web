import { useState, useCallback, useEffect } from 'react';
import { FileUpload, ModeSelector, PresetSelector, ResultPanel, CustomSettingsModal } from './components';
import { processDocx, analyzeDocx } from './lib/docx-processor';
import { presets, defaultPreset } from './config/presets';
import type { ProcessMode, ProcessResult, FormatPreset } from './types';
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
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ProcessMode>('smart');
  const [preset, setPreset] = useState(defaultPreset);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
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
    if (!file) return;

    setProcessing(true);
    setResult(null);
    setOutputBlob(null);

    try {
      if (mode === 'analyze') {
        const analyzeResult = await analyzeDocx(file);
        setResult(analyzeResult);
      } else {
        const selectedPreset = preset === 'custom' && customPreset
          ? customPreset
          : presets[preset];

        const { blob, result: processResult } = await processDocx(file, {
          fixPunctuation: mode === 'smart' || mode === 'punctuation',
          applyFormat: mode === 'smart',
          preset: selectedPreset,
        });
        setResult(processResult);
        if (processResult.success) {
          setOutputBlob(blob);
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: `处理出错: ${error instanceof Error ? error.message : '未知错误'}`,
      });
    } finally {
      setProcessing(false);
    }
  }, [file, mode, preset, customPreset]);

  const handleDownload = useCallback(() => {
    if (!outputBlob || !file) return;

    const fileName = file.name.replace(/\.docx$/i, '_formatted.docx');
    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [outputBlob, file]);

  const handleCustomClick = useCallback(() => {
    setShowCustomModal(true);
  }, []);

  const handleCustomSave = useCallback((newPreset: FormatPreset) => {
    setCustomPreset(newPreset);
    setPreset('custom');
    saveCustomSettings(newPreset);
  }, []);

  const isPresetDisabled = mode === 'punctuation' || mode === 'analyze';

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">公文格式处理工具</h1>
        <p className="app-subtitle">一键修复 Word 文档格式，符合 GB/T 9704-2012 标准</p>
      </header>

      <main className="app-main">
        <section className="app-section">
          <FileUpload selectedFile={file} onFileSelect={setFile} />
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
            disabled={!file || processing}
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
                开始处理
              </>
            )}
          </button>
        </section>

        {result && (
          <section className="app-section">
            <ResultPanel
              result={result}
              hasDownload={!!outputBlob}
              onDownload={handleDownload}
            />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>
          纯浏览器本地处理，文件不会上传至服务器
          <span className="separator">|</span>
          仅支持 .docx 格式
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
