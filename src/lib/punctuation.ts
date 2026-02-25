/**
 * 标点符号修复模块
 * 移植自 Python 版本的 punctuation.py
 */

// 中文标点（使用 Unicode）
const LEFT_DOUBLE_QUOTE = '\u201c'; // " 左双引号
const RIGHT_DOUBLE_QUOTE = '\u201d'; // " 右双引号
const LEFT_SINGLE_QUOTE = '\u2018'; // ' 左单引号
const RIGHT_SINGLE_QUOTE = '\u2019'; // ' 右单引号

// 基本替换映射
const REPLACEMENTS: Record<string, string> = {
  '(': '（',
  ')': '）',
  ':': '：',
  ';': '；',
  '?': '？',
  '!': '！',
};

// 占位符前缀
const PLACEHOLDER_PREFIX = '\x02PROT';

interface ProtectedItem {
  placeholder: string;
  original: string;
}

/**
 * 提取并保护不应被替换的特殊模式
 */
function protectSpecialPatterns(text: string): [string, ProtectedItem[]] {
  const protectedItems: ProtectedItem[] = [];
  let counter = 0;

  const replaceWithPlaceholder = (match: string): string => {
    const placeholder = `${PLACEHOLDER_PREFIX}${counter}\x03`;
    protectedItems.push({ placeholder, original: match });
    counter++;
    return placeholder;
  };

  let result = text;

  // 保护 URL（http:// https:// ftp://）
  result = result.replace(/(?:https?|ftp):\/\/\S+/g, replaceWithPlaceholder);

  // 保护邮箱地址
  result = result.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, replaceWithPlaceholder);

  // 保护 Windows 文件路径 C:\ D:\
  result = result.replace(/[A-Za-z]:\\/g, replaceWithPlaceholder);

  // 保护标准编号 ISO 9001:2015 等
  result = result.replace(/[A-Za-z]+[\s-]?\d+:\d{2,}/g, replaceWithPlaceholder);

  // 保护时间格式 HH:MM 或 HH:MM:SS
  result = result.replace(/(?<!\d)(\d{1,2}:\d{2}(?::\d{2})?)(?!\d)/g, replaceWithPlaceholder);

  return [result, protectedItems];
}

/**
 * 恢复被保护的内容
 */
function restoreProtected(text: string, protectedItems: ProtectedItem[]): string {
  let result = text;
  for (const { placeholder, original } of protectedItems) {
    result = result.replace(placeholder, original);
  }
  return result;
}

/**
 * 检查是否包含中文
 */
function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

/**
 * 只做不涉及配对的简单标点替换
 */
function fixSimplePunctuation(text: string): string {
  if (!text) return text;

  let [result, protectedItems] = protectSpecialPatterns(text);

  // 省略号（必须在句号之前）
  result = result.replace(/\.{2,}/g, '……');
  result = result.replace(/。{2,}/g, '……');

  // 破折号
  result = result.replace(/--+/g, '——');
  result = result.replace(/—(?!—)/g, '——');

  // 基本替换（只在有中文时）
  if (hasChinese(result)) {
    for (const [en, cn] of Object.entries(REPLACEMENTS)) {
      result = result.split(en).join(cn);
    }
  }

  // 逗号
  result = result.replace(/([\u4e00-\u9fff]),/g, '$1，');
  result = result.replace(/,([\u4e00-\u9fff])/g, '，$1');

  // 句号
  result = result.replace(/([\u4e00-\u9fff])\.(\s|$)/g, '$1。$2');

  // 恢复被保护的内容
  result = restoreProtected(result, protectedItems);
  return result;
}

/**
 * 对完整文本做引号配对替换
 */
function fixQuotesWholeText(text: string): string {
  let result = text;

  // 双引号
  const doubleQuoteChars = ['"', '\u201c', '\u201d', '\u201e', '\u201f', '\u300c', '\u300d'];
  let temp = result;
  for (const q of doubleQuoteChars) {
    temp = temp.split(q).join('\x00');
  }

  if (temp.includes('\x00')) {
    const chars = temp.split('');
    let quoteIdx = 0;
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === '\x00') {
        chars[i] = quoteIdx % 2 === 0 ? LEFT_DOUBLE_QUOTE : RIGHT_DOUBLE_QUOTE;
        quoteIdx++;
      }
    }
    result = chars.join('');
  }

  // 单引号
  const singleQuoteChars = ["'", '\u2018', '\u2019', '\u201a', '\u201b'];
  temp = result;
  for (const q of singleQuoteChars) {
    temp = temp.split(q).join('\x01');
  }

  if (temp.includes('\x01')) {
    const chars = temp.split('');
    let quoteIdx = 0;
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === '\x01') {
        chars[i] = quoteIdx % 2 === 0 ? LEFT_SINGLE_QUOTE : RIGHT_SINGLE_QUOTE;
        quoteIdx++;
      }
    }
    result = chars.join('');
  }

  return result;
}

/**
 * 修复文本中的所有标点
 */
export function fixPunctuation(text: string): string {
  if (!text) return text;

  // 第一步：简单标点替换
  let result = fixSimplePunctuation(text);

  // 第二步：引号配对处理
  result = fixQuotesWholeText(result);

  return result;
}

/**
 * 分析文本中的标点问题
 */
export function analyzePunctuation(text: string): string[] {
  const issues: string[] = [];

  if (!text) return issues;

  // 检测英文标点
  if (/[()[\]{}]/.test(text) && hasChinese(text)) {
    issues.push('发现英文括号，建议替换为中文括号');
  }

  if (/[:;?!]/.test(text) && hasChinese(text)) {
    issues.push('发现英文标点（冒号、分号、问号、感叹号），建议替换为中文标点');
  }

  // 检测引号问题
  if (/["']/.test(text)) {
    issues.push('发现直引号，建议替换为中文弯引号');
  }

  // 检测省略号问题
  if (/\.{3,}/.test(text)) {
    issues.push('发现连续句点，建议替换为省略号（……）');
  }

  // 检测破折号问题
  if (/--/.test(text)) {
    issues.push('发现连续短横线，建议替换为破折号（——）');
  }

  return issues;
}
