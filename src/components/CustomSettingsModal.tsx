import { useState, useEffect } from 'react';
import type { FormatPreset } from '../types';
import { Select, NumberInput } from './ui';
import './CustomSettingsModal.css';

interface CustomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preset: FormatPreset) => void;
  initialSettings?: FormatPreset;
}

const FONT_SIZES = [
  { name: '初号', pt: 42 },
  { name: '小初', pt: 36 },
  { name: '一号', pt: 26 },
  { name: '小一', pt: 24 },
  { name: '二号', pt: 22 },
  { name: '小二', pt: 18 },
  { name: '三号', pt: 16 },
  { name: '小三', pt: 15 },
  { name: '四号', pt: 14 },
  { name: '小四', pt: 12 },
  { name: '五号', pt: 10.5 },
  { name: '小五', pt: 9 },
];

const COMMON_FONTS_CN = [
  '仿宋_GB2312', '仿宋', '宋体', '黑体', '楷体_GB2312', '楷体',
  '方正小标宋简体', '方正仿宋_GBK', '华文仿宋', '华文中宋',
];

const INDENT_OPTIONS = [
  { value: '0', label: '0字符' },
  { value: '32', label: '2字符' },
  { value: '64', label: '4字符' },
];

const DEFAULT_CUSTOM: FormatPreset = {
  name: '自定义格式',
  page: { top: 3.7, bottom: 3.5, left: 2.8, right: 2.6 },
  title: { font_cn: '方正小标宋简体', font_en: 'Times New Roman', size: 22, bold: false, align: 'center', indent: 0 },
  recipient: { font_cn: '仿宋_GB2312', font_en: 'Times New Roman', size: 16, bold: false, align: 'left', indent: 0 },
  heading1: { font_cn: '黑体', font_en: 'Times New Roman', size: 16, bold: false, align: 'left', indent: 32 },
  heading2: { font_cn: '楷体_GB2312', font_en: 'Times New Roman', size: 16, bold: false, align: 'left', indent: 32 },
  heading3: { font_cn: '仿宋_GB2312', font_en: 'Times New Roman', size: 16, bold: false, align: 'left', indent: 32 },
  heading4: { font_cn: '仿宋_GB2312', font_en: 'Times New Roman', size: 16, bold: false, align: 'left', indent: 32 },
  body: { font_cn: '仿宋_GB2312', font_en: 'Times New Roman', size: 16, bold: false, align: 'justify', indent: 32, line_spacing: 28 },
  signature: { font_cn: '仿宋_GB2312', font_en: 'Times New Roman', size: 16, bold: false, align: 'right', indent: 0 },
  date: { font_cn: '仿宋_GB2312', font_en: 'Times New Roman', size: 16, bold: false, align: 'right', indent: 0 },
  attachment: { font_cn: '仿宋_GB2312', font_en: 'Times New Roman', size: 16, bold: false, align: 'justify', indent: 32 },
  closing: { font_cn: '仿宋_GB2312', font_en: 'Times New Roman', size: 16, bold: false, align: 'left', indent: 32 },
};

const fontOptions = COMMON_FONTS_CN.map(f => ({ value: f, label: f }));
const sizeOptions = FONT_SIZES.map(s => ({ value: String(s.pt), label: `${s.name}(${s.pt}pt)` }));

export function CustomSettingsModal({ isOpen, onClose, onSave, initialSettings }: CustomSettingsModalProps) {
  const [settings, setSettings] = useState<FormatPreset>(initialSettings || DEFAULT_CUSTOM);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_CUSTOM);
  };

  const updatePage = (key: keyof typeof settings.page, value: number) => {
    setSettings(prev => ({
      ...prev,
      page: { ...prev.page, [key]: value }
    }));
  };

  const updateStyle = (section: keyof FormatPreset, key: string, value: string | number | boolean | null) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...(prev[section] as object), [key]: value }
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>自定义格式设置</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* 页面边距 */}
          <section className="settings-section">
            <h3>页面边距</h3>
            <div className="settings-row margin-row">
              {(['top', 'bottom', 'left', 'right'] as const).map(key => (
                <div key={key} className="input-group">
                  <label>{key === 'top' ? '上' : key === 'bottom' ? '下' : key === 'left' ? '左' : '右'}</label>
                  <NumberInput
                    value={settings.page[key]}
                    onChange={value => updatePage(key, value)}
                    min={0}
                    max={10}
                    step={0.1}
                    suffix="cm"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* 标题格式 */}
          <section className="settings-section">
            <h3>标题</h3>
            <div className="settings-row">
              <div className="input-group">
                <label>字体</label>
                <Select
                  value={settings.title.font_cn}
                  options={fontOptions}
                  onChange={value => updateStyle('title', 'font_cn', value)}
                />
              </div>
              <div className="input-group">
                <label>字号</label>
                <Select
                  value={String(settings.title.size)}
                  options={sizeOptions}
                  onChange={value => updateStyle('title', 'size', parseFloat(value))}
                />
              </div>
            </div>
          </section>

          {/* 各级标题 */}
          <section className="settings-section">
            <h3>各级标题字体</h3>
            <div className="settings-row">
              <div className="input-group">
                <label>一级(一、)</label>
                <Select
                  value={settings.heading1.font_cn}
                  options={fontOptions}
                  onChange={value => updateStyle('heading1', 'font_cn', value)}
                />
              </div>
              <div className="input-group">
                <label>二级((一))</label>
                <Select
                  value={settings.heading2.font_cn}
                  options={fontOptions}
                  onChange={value => updateStyle('heading2', 'font_cn', value)}
                />
              </div>
            </div>
          </section>

          {/* 正文格式 */}
          <section className="settings-section">
            <h3>正文格式</h3>
            <div className="settings-row">
              <div className="input-group">
                <label>字体</label>
                <Select
                  value={settings.body.font_cn}
                  options={fontOptions}
                  onChange={value => updateStyle('body', 'font_cn', value)}
                />
              </div>
              <div className="input-group">
                <label>字号</label>
                <Select
                  value={String(settings.body.size)}
                  options={sizeOptions}
                  onChange={value => updateStyle('body', 'size', parseFloat(value))}
                />
              </div>
              <div className="input-group">
                <label>行距</label>
                <NumberInput
                  value={settings.body.line_spacing || 28}
                  onChange={value => updateStyle('body', 'line_spacing', value)}
                  min={10}
                  max={100}
                  step={1}
                  suffix="磅"
                />
              </div>
            </div>
            <div className="settings-row">
              <div className="input-group" style={{ maxWidth: '160px' }}>
                <label>首行缩进</label>
                <Select
                  value={String(settings.body.indent)}
                  options={INDENT_OPTIONS}
                  onChange={value => updateStyle('body', 'indent', parseInt(value))}
                />
              </div>
            </div>
            <p className="settings-hint">正文字体/字号同时应用于：三/四级标题、落款、附件、结束语</p>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn-reset" onClick={handleReset}>恢复默认</button>
          <div className="modal-footer-right">
            <button className="btn-cancel" onClick={onClose}>取消</button>
            <button className="btn-save" onClick={handleSave}>保存设置</button>
          </div>
        </div>
      </div>
    </div>
  );
}
