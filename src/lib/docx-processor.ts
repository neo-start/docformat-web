/**
 * DOCX 文档处理器
 * 使用 JSZip 解析和修改 docx 文件
 */

import JSZip from 'jszip';
import { fixPunctuation, analyzePunctuation } from './punctuation';
import type { FormatPreset, ProcessResult } from '../types';

/**
 * 从 XML 字符串中提取所有文本内容
 */
function extractTextFromXml(xml: string): string[] {
  const texts: string[] = [];
  // 匹配 <w:t> 标签中的内容
  const regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    if (match[1]) {
      texts.push(match[1]);
    }
  }
  return texts;
}

/**
 * 替换 XML 中的文本内容
 */
function replaceTextInXml(xml: string, replaceFn: (text: string) => string): string {
  return xml.replace(/<w:t([^>]*)>([^<]*)<\/w:t>/g, (_match, attrs, text) => {
    const newText = replaceFn(text);
    return `<w:t${attrs}>${escapeXml(newText)}</w:t>`;
  });
}

/**
 * XML 特殊字符转义
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * XML 特殊字符反转义
 */
function unescapeXml(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * 磅转 twips（二十分之一磅）
 */
function pointsToTwips(points: number): number {
  return Math.round(points * 20);
}

/**
 * 厘米转 twips
 */
function cmToTwips(cm: number): number {
  return Math.round(cm * 567);
}

/**
 * 半磅单位
 */
function pointsToHalfPoints(points: number): number {
  return Math.round(points * 2);
}

/**
 * 应用页面设置到 document.xml
 */
function applyPageSettings(xml: string, preset: FormatPreset): string {
  const { page } = preset;

  // 页边距设置（使用 twips）
  const topTwips = cmToTwips(page.top);
  const bottomTwips = cmToTwips(page.bottom);
  const leftTwips = cmToTwips(page.left);
  const rightTwips = cmToTwips(page.right);

  // 查找并替换 sectPr 中的 pgMar
  const pgMarRegex = /<w:pgMar[^/]*\/>/g;
  const newPgMar = `<w:pgMar w:top="${topTwips}" w:right="${rightTwips}" w:bottom="${bottomTwips}" w:left="${leftTwips}" w:header="851" w:footer="992" w:gutter="0"/>`;

  if (pgMarRegex.test(xml)) {
    xml = xml.replace(pgMarRegex, newPgMar);
  }

  return xml;
}

/**
 * 应用段落格式
 */
function applyParagraphFormat(xml: string, preset: FormatPreset): string {
  const { body } = preset;

  // 行距设置（固定值，单位 twips）
  if (body.line_spacing) {
    const lineSpacingTwips = pointsToTwips(body.line_spacing);

    // 为所有段落添加或更新行距
    xml = xml.replace(/<w:pPr>([\s\S]*?)<\/w:pPr>/g, (_match, content) => {
      // 移除现有的行距设置
      let newContent = content.replace(/<w:spacing[^/]*\/>/g, '');
      // 添加新的行距设置
      newContent += `<w:spacing w:line="${lineSpacingTwips}" w:lineRule="exact"/>`;
      return `<w:pPr>${newContent}</w:pPr>`;
    });
  }

  // 首行缩进（单位 twips）
  if (body.indent > 0) {
    const indentTwips = pointsToTwips(body.indent);

    xml = xml.replace(/<w:pPr>([\s\S]*?)<\/w:pPr>/g, (fullMatch, content) => {
      // 检查是否已有缩进设置
      if (/<w:ind/.test(content)) {
        // 更新现有缩进
        return fullMatch.replace(/<w:ind([^/]*)\/>/g, `<w:ind$1 w:firstLine="${indentTwips}"/>`);
      } else {
        // 添加缩进设置
        return `<w:pPr>${content}<w:ind w:firstLine="${indentTwips}"/></w:pPr>`;
      }
    });
  }

  return xml;
}

/**
 * 应用字体设置
 */
function applyFontSettings(xml: string, preset: FormatPreset): string {
  const { body } = preset;
  const fontSize = pointsToHalfPoints(body.size);

  // 更新字体大小
  xml = xml.replace(/<w:sz w:val="[^"]*"\/>/g, `<w:sz w:val="${fontSize}"/>`);
  xml = xml.replace(/<w:szCs w:val="[^"]*"\/>/g, `<w:szCs w:val="${fontSize}"/>`);

  // 更新字体名称
  xml = xml.replace(/<w:rFonts([^/]*)\/>/g, (_match, attrs) => {
    // 保留原有属性，更新字体
    let newAttrs = attrs;
    newAttrs = newAttrs.replace(/w:eastAsia="[^"]*"/, `w:eastAsia="${body.font_cn}"`);
    newAttrs = newAttrs.replace(/w:ascii="[^"]*"/, `w:ascii="${body.font_en}"`);
    newAttrs = newAttrs.replace(/w:hAnsi="[^"]*"/, `w:hAnsi="${body.font_en}"`);

    // 如果没有这些属性，添加它们
    if (!newAttrs.includes('w:eastAsia=')) {
      newAttrs += ` w:eastAsia="${body.font_cn}"`;
    }
    if (!newAttrs.includes('w:ascii=')) {
      newAttrs += ` w:ascii="${body.font_en}"`;
    }
    if (!newAttrs.includes('w:hAnsi=')) {
      newAttrs += ` w:hAnsi="${body.font_en}"`;
    }

    return `<w:rFonts${newAttrs}/>`;
  });

  return xml;
}

/**
 * 处理 DOCX 文件
 */
export async function processDocx(
  file: File,
  options: {
    fixPunctuation: boolean;
    applyFormat: boolean;
    preset?: FormatPreset;
  }
): Promise<{ blob: Blob; result: ProcessResult }> {
  const details: string[] = [];

  try {
    // 读取文件
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 读取 document.xml
    const documentXmlFile = zip.file('word/document.xml');
    if (!documentXmlFile) {
      throw new Error('无效的 DOCX 文件：找不到 document.xml');
    }

    let documentXml = await documentXmlFile.async('string');

    // 标点修复
    if (options.fixPunctuation) {
      let punctuationChanges = 0;

      documentXml = replaceTextInXml(documentXml, (text) => {
        const unescaped = unescapeXml(text);
        const fixed = fixPunctuation(unescaped);
        if (fixed !== unescaped) {
          punctuationChanges++;
        }
        return fixed;
      });

      if (punctuationChanges > 0) {
        details.push(`修复了 ${punctuationChanges} 处标点符号`);
      }
    }

    // 应用格式
    if (options.applyFormat && options.preset) {
      documentXml = applyPageSettings(documentXml, options.preset);
      documentXml = applyParagraphFormat(documentXml, options.preset);
      documentXml = applyFontSettings(documentXml, options.preset);
      details.push(`应用了「${options.preset.name}」格式预设`);
    }

    // 更新 document.xml
    zip.file('word/document.xml', documentXml);

    // 生成新的 DOCX 文件
    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    return {
      blob,
      result: {
        success: true,
        message: '文档处理完成',
        details,
      },
    };
  } catch (error) {
    return {
      blob: new Blob(),
      result: {
        success: false,
        message: `处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details,
      },
    };
  }
}

/**
 * 分析 DOCX 文件
 */
export async function analyzeDocx(file: File): Promise<ProcessResult> {
  const details: string[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const documentXmlFile = zip.file('word/document.xml');
    if (!documentXmlFile) {
      throw new Error('无效的 DOCX 文件：找不到 document.xml');
    }

    const documentXml = await documentXmlFile.async('string');
    const texts = extractTextFromXml(documentXml);
    const fullText = texts.map(t => unescapeXml(t)).join('');

    // 分析标点问题
    const punctuationIssues = analyzePunctuation(fullText);
    if (punctuationIssues.length > 0) {
      details.push('【标点问题】');
      details.push(...punctuationIssues.map(issue => `  - ${issue}`));
    }

    // 统计信息
    const charCount = fullText.length;
    const paragraphCount = (documentXml.match(/<w:p[ >]/g) || []).length;

    details.push('');
    details.push('【文档统计】');
    details.push(`  - 字符数：${charCount}`);
    details.push(`  - 段落数：${paragraphCount}`);

    return {
      success: true,
      message: '文档分析完成',
      details,
    };
  } catch (error) {
    return {
      success: false,
      message: `分析失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details,
    };
  }
}
