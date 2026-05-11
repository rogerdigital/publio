# Publio

[English](./README.md) | [中文](./README_zh.md)

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./package.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](./tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-332%20passing-brightgreen.svg)](#开发)

> AI 原生内容运营平台。一次创作，全平台分发。

- **全生命周期工作流** — 从选题发现到发布后复盘，一个工作台搞定
- **AI 写作辅助** — 扩写、缩写、改写、润色、续写，斜杠命令触发，流式输出
- **多平台一键发布** — 并发分发至微信公众号、小红书、知乎、X (Twitter)
- **Provider 无关** — 支持任何 OpenAI 兼容 API（智谱 GLM、DeepSeek、Qwen、OpenAI、Ollama）

---

## 快速开始

```bash
git clone https://github.com/rogerdigital/publio.git
cd publio
pnpm install
pnpm dev
```

打开 http://localhost:3000。首次启动后在设置页（`/settings`）配置平台凭证和 AI Agent。

---

## 工作流

**信号收件箱** → **选题库** → **写作 Brief** → **写作台** → **渠道版本** → **发布** → **内容复盘**

每个阶段承接上一步。信号晋升为选题，选题生成结构化 Brief，Brief 指导写作，稿件按平台适配，并发发布，发布后指标反哺推荐。

---

## 功能亮点

### 写作台

Markdown 编辑器，支持实时预览、沉浸式全屏模式、自动保存、AI 斜杠命令、版本历史回滚和内容模板。GitHub 图床提供持久化图片托管。

### AI Agent 系统

写作助手（5 个斜杠命令）、平台内容适配、选题深度研究、信号收件箱分诊、结构化写作包、Brief 生成、发布失败诊断、内容复盘、风格学习。全部流式，全部可选。

### 多平台发布

并发发布 + 进度追踪。每个平台拥有独立渠道版本 — 同步、AI 适配或手动编辑。包含敏感词检测、平台规则校验、定时发布、失败诊断智能重试、发布后指标聚合。

### AI 选题台

聚合 9+ RSS 源 + 自定义源。信号收件箱分类处理，选题库生命周期管理，六维评分，研究底稿生成，一键转为编辑器草稿并嵌入研究上下文。

---

## 配置

参见 [docs/configuration.md](./docs/configuration.md)，包含平台凭证、AI Agent 配置和 GitHub 图床设置。

---

## 开发

基于 Next.js 15 (App Router)、TypeScript 5 (strict)、vanilla-extract 和 Zustand 构建。

```bash
pnpm dev              # 开发模式（含端口清理）
pnpm build            # 生产构建
pnpm test             # 运行测试（Vitest，332 用例通过）
pnpm lint             # ESLint
pnpm format           # Prettier 格式化
pnpm verify           # lint + test + build
```

---

## 许可证

[MIT](./LICENSE)
