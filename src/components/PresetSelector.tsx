import type { ReactNode } from 'react';
import { presets } from '../config/presets';
import './PresetSelector.css';

interface PresetSelectorProps {
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  onCustomClick: () => void;
  disabled?: boolean;
}

const presetInfo: Record<string, { description: string; icon: ReactNode }> = {
  official: {
    description: 'GB/T 9704-2012 标准',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  academic: {
    description: '论文排版规范',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  legal: {
    description: '法律文书格式',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16" />
        <path d="M12 3v18" />
        <path d="M8 21h8" />
        <path d="M4 7l1.5 6h5L12 7" />
        <path d="M12 7l1.5 6h5L20 7" />
      </svg>
    ),
  },
  custom: {
    description: '自定义参数',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
};

export function PresetSelector({ selectedPreset, onPresetChange, onCustomClick, disabled }: PresetSelectorProps) {
  const handleClick = (key: string) => {
    if (disabled) return;
    onPresetChange(key);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onCustomClick();
  };

  return (
    <div className={`preset-selector ${disabled ? 'disabled' : ''}`}>
      <h3 className="preset-selector-title">选择格式预设</h3>
      <div className="preset-cards">
        {Object.entries(presets).map(([key, preset]) => (
          <button
            key={key}
            className={`preset-card ${selectedPreset === key ? 'active' : ''}`}
            onClick={() => handleClick(key)}
            disabled={disabled}
          >
            <div className="preset-icon">{presetInfo[key]?.icon}</div>
            <div className="preset-info">
              <span className="preset-name">{preset.name}</span>
              <span className="preset-description">{presetInfo[key]?.description}</span>
            </div>
          </button>
        ))}
        {/* 自定义格式 */}
        <button
          className={`preset-card ${selectedPreset === 'custom' ? 'active' : ''}`}
          onClick={() => handleClick('custom')}
          disabled={disabled}
        >
          <div className="preset-icon">{presetInfo.custom.icon}</div>
          <div className="preset-info">
            <span className="preset-name">自定义格式</span>
            <span className="preset-description">{presetInfo.custom.description}</span>
          </div>
          <button
            className="preset-settings-btn"
            onClick={handleSettingsClick}
            title="编辑设置"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </button>
      </div>
    </div>
  );
}
