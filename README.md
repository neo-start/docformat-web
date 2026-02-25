<div align="center">

# 📄 公文格式处理工具 Web 版

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**一键修复 Word 文档格式，符合 GB/T 9704-2012 国家标准**

纯浏览器本地处理 · 文件不上传服务器 · 隐私安全

[在线体验](https://neo-start.github.io/docformat-web/) · [功能特性](#功能特性) · [快速开始](#快速开始)

---

> 🔄 本项目基于 [docformat-gui](https://github.com/KaguraNanaga/docformat-gui) 二次改造
> 将原 Python + Tkinter 桌面应用重构为 React + TypeScript Web 应用

</div>

## 📸 截图预览

<table>
  <tr>
    <td><img src="./screenshots/main.png" alt="主界面" /></td>
    <td><img src="./screenshots/settings.png" alt="自定义设置" /></td>
  </tr>
  <tr>
    <td align="center"><b>主界面</b></td>
    <td align="center"><b>自定义设置</b></td>
  </tr>
</table>

## ✨ 功能特性

### 🎯 三种处理模式

<table>
  <tr>
    <th>模式</th>
    <th>说明</th>
    <th>适用场景</th>
  </tr>
  <tr>
    <td>🚀 <b>智能处理</b></td>
    <td>标点修复 + 格式排版</td>
    <td>一步到位，推荐使用</td>
  </tr>
  <tr>
    <td>✏️ <b>标点修复</b></td>
    <td>仅修复标点符号</td>
    <td>保留原有格式</td>
  </tr>
  <tr>
    <td>🔍 <b>格式诊断</b></td>
    <td>仅分析文档问题</td>
    <td>检查不修改</td>
  </tr>
</table>

### 📋 格式预设

| 预设 | 说明 |
|:-----|:-----|
| 📑 公文格式 | GB/T 9704-2012 国家标准 |
| 📚 学术论文 | 论文排版规范 |
| ⚖️ 法律文书 | 法律文书格式 |
| ⚙️ 自定义格式 | 自定义页边距、字体、字号、行距等 |

### 🔧 标点修复

- ✅ 英文标点 → 中文标点（括号、冒号、分号、问号、感叹号）
- ✅ 引号智能配对（直引号 → 弯引号）
- ✅ 省略号、破折号标准化
- ✅ 保护特殊格式（URL、邮箱、时间、文件路径等）

### 📐 格式排版

- ✅ 页边距设置
- ✅ 字体、字号设置
- ✅ 行距设置
- ✅ 首行缩进

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

构建产物在 `dist/` 目录，可直接部署到任何静态网站托管服务。

## 🌐 在线体验

**👉 [立即体验](https://neo-start.github.io/docformat-web/)**

无需安装，打开浏览器即可使用。

## ⚠️ 限制说明

| 限制 | 说明 |
|:-----|:-----|
| 文件格式 | 仅支持 `.docx`（不支持 .doc / .wps） |
| 字体显示 | 设置的字体需要用户电脑已安装 |
| 复杂元素 | 复杂表格、图片等格式处理可能不完善 |

## 🔀 与原项目对比

| 特性 | 原项目 (Python) | Web 版 |
|:-----|:----------------|:-------|
| 运行环境 | 需安装 Python 或 exe | 浏览器直接运行 |
| 支持格式 | .docx / .doc / .wps | 仅 .docx |
| 部署方式 | 本地安装 | 静态网站部署 |
| 跨平台 | 需分别打包 | 天然跨平台 |

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建**: Vite
- **文档处理**: JSZip
- **样式**: CSS（Notion 风格）

## 🙏 致谢

- [docformat-gui](https://github.com/KaguraNanaga/docformat-gui) - 原始项目
- [JSZip](https://stuk.github.io/jszip/) - DOCX 文件处理
- [Notion](https://notion.so) - UI 设计灵感

## 📄 License

[MIT](LICENSE)
