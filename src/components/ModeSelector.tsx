import type { ReactNode } from 'react';
import type { ProcessMode } from '../types';
import './ModeSelector.css';

interface ModeSelectorProps {
  mode: ProcessMode;
  onModeChange: (mode: ProcessMode) => void;
}

const modes: { key: ProcessMode; label: string; description: string; icon: ReactNode }[] = [
  {
    key: 'smart',
    label: '智能处理',
    description: '标点修复 + 格式排版',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    key: 'punctuation',
    label: '标点修复',
    description: '仅修复标点符号',
    icon: (
      <svg viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M906.688 398.592c0 85.76-15.552 136.448-66.176 218.624-52.224 83.776-154.56 165.952-228.992 204.16l-23.808-45.952c64.128-45.504 105.472-81.152 150.976-168.512 12.928-24.832 20.16-46.528 24.32-66.176a155.264 155.264 0 0 1-31.552 3.072A170.304 170.304 0 0 1 561.28 373.248a170.304 170.304 0 0 1 170.112-170.56c78.08 0 144.192 52.672 163.84 125.056 7.232 20.672 11.392 43.968 11.392 70.848z m-444.032 0c0 85.76-15.552 136.448-66.176 218.624-52.224 83.776-154.56 165.952-228.992 204.16l-23.808-45.952c64.128-45.504 105.472-81.152 150.976-168.512 12.928-24.832 20.16-46.528 24.32-66.176a155.328 155.328 0 0 1-31.552 3.072 170.304 170.304 0 0 1-170.112-170.56 170.304 170.304 0 0 1 170.112-170.56c78.08 0 144.192 52.672 163.84 125.056 7.232 20.672 11.392 43.968 11.392 70.848z" />
      </svg>
    ),
  },
  {
    key: 'analyze',
    label: '格式诊断',
    description: '仅分析不修改',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
];

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <h3 className="mode-selector-title">选择处理模式</h3>
      <div className="mode-cards">
        {modes.map((m) => (
          <button
            key={m.key}
            className={`mode-card ${mode === m.key ? 'active' : ''}`}
            onClick={() => onModeChange(m.key)}
          >
            <div className="mode-icon">{m.icon}</div>
            <div className="mode-info">
              <span className="mode-label">{m.label}</span>
              <span className="mode-description">{m.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
