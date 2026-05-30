# Publio

[English](./README.md) | [中文](./README_zh.md)

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./package.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](./tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

> 面向个人创作者的精简多平台写作与发布工具。一次写作，按平台分发。

- **写作台** — Markdown 编辑、实时预览、自动保存、版本历史、模板和图片上传。
- **稿件库** — 管理草稿、发布状态和平台版本。
- **多平台发布** — 发布到微信公众号、小红书、知乎、X (Twitter)，并通过进度浮层跟踪结果。
- **可选 AI 辅助** — 支持改写、标题建议和平台适配；未配置时自动隐藏 AI 入口。

---

## 产品范围

Publio 聚焦创作和发布闭环：

**写作台** -> **平台版本** -> **发布检查** -> **发布进度** -> **稿件库**

当前应用只保留三个用户可见入口：

| 路由 | 用途 |
|------|------|
| `/` | 写作、预览、管理平台版本、执行发布检查和发布 |
| `/drafts` | 重新打开草稿，查看发布状态 |
| `/settings` | 配置平台凭证、AI Agent 和 GitHub 图床 |

## 快速开始

```bash
git clone https://github.com/rogerdigital/publio.git
cd publio
pnpm install
pnpm dev
```

打开 http://localhost:3000。首次启动后在设置页（`/settings`）配置平台凭证和 AI Agent。

---

## 功能

### 写作台

Markdown 编辑器支持实时预览、沉浸式全屏模式、自动保存、版本历史回滚、内容模板、媒体库和 GitHub 图床上传。

### AI 辅助

配置 Agent 后可使用斜杠命令触发“AI 改写”和“AI 标题建议”，也可以为微信公众号、小红书、知乎、X 生成平台适配版本。AI 输出走流式响应；未配置时写作与发布功能不受影响。

### 多平台发布

每个平台拥有独立渠道版本，可手动编辑、从正文同步或通过 AI 适配。发布前执行敏感词和平台规则检查，发布后通过浮层轮询任务状态。

### 稿件库

稿件库集中展示草稿、发布时间、发布状态和平台版本入口，支持继续编辑、删除和查看最近稿件。

### 核心 API

API 覆盖草稿、平台版本、发布、发布状态、设置、模板、上传、平台连接检查，以及 AI write/adapt/status。

---

## 配置

参见 [docs/configuration.md](./docs/configuration.md)，包含平台凭证、AI Agent 和 GitHub 图床设置。

运行数据存储在 `.publio-data/`。

---

## 开发

基于 Next.js 15 (App Router)、TypeScript 5 (strict)、vanilla-extract 和 Zustand 构建。

```bash
pnpm dev              # 开发模式（含端口清理）
pnpm build            # 生产构建
pnpm test             # 运行 Vitest 测试
pnpm lint             # ESLint
pnpm verify           # check:no-js-source + lint + test + build
```

测试套件包含当前核心路由和模块边界的 smoke test。

---

## 许可证

[MIT](./LICENSE)
