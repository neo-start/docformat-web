// 格式预设类型定义

export interface PageSettings {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface TextStyle {
  font_cn: string;
  font_en: string;
  size: number;
  bold: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
  indent: number;
  line_spacing?: number | null;
}

export interface FormatPreset {
  name: string;
  page: PageSettings;
  title: TextStyle;
  recipient: TextStyle;
  heading1: TextStyle;
  heading2: TextStyle;
  heading3: TextStyle;
  heading4: TextStyle;
  body: TextStyle;
  signature: TextStyle;
  date: TextStyle;
  attachment: TextStyle;
  closing: TextStyle;
  first_line_bold?: boolean;
}

export interface ProcessOptions {
  fixPunctuation: boolean;
  applyFormat: boolean;
  preset: string;
}

export interface ProcessResult {
  success: boolean;
  message: string;
  details?: string[];
}

export type ProcessMode = 'smart' | 'punctuation' | 'analyze';
