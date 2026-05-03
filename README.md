# Publio

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./package.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](./tsconfig.json)

> Write once, publish everywhere.

多平台内容分发工具——在一个界面里完成 Markdown 写作、AI 选题、一键分发到微信公众号、小红书、知乎、X (Twitter)。

---

## 功能概览

**写作台**
- Markdown 编辑器（桌面富编辑 / 移动端降级 textarea），实时字符数、段落、标题层级、预计阅读时长
- 成稿预览（接近公众号排版效果）
- 自动保存（停止输入 1s 触发，首次保存自动创建草稿并更新 URL）
- Editorial context 卡片：标题状态、结构统计、可发布建议

**AI 选题工作台**
- 从 9 个 RSS 数据源抓取 24h AI 行业动态 → 话题聚类 → 五维评分 → 最多 10 条候选题
- 每条附带研究底稿（事件经过、重要性、影响方、写作切口、多方视角、配图）
- 一键转稿到写作台

**稿件库**
- 持久化草稿管理（手动创建 / AI 选题转稿），支持状态跟踪（draft → ready → synced）
- Pipeline 视图按「来源 → 写作台 → 分发」展示全部稿件，支持批量删除

**多平台发布**
- 并发发布（Promise.allSettled），支持微信公众号、小红书、知乎、X (Twitter)
- 发布进度浮层（右下角轮询更新各平台状态）
- 同步任务追踪：各平台回执、失败原因、重试 / 手动标记完成
- 各平台内容格式适配（字数校验、样式转换）

**平台连接管理**
- 设置页统一管理 API 凭证，OAuth 平台支持一键授权
- 微信 / X 支持凭证验证，连接状态持久化并展示已连接账号名

**响应式导航**
- 桌面端侧边栏，移动端底部 Tab 栏

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm

### 安装与启动

```bash
git clone https://github.com/rogerdigital/publio.git
cd publio
pnpm install
cp .env.example .env.local   # 填入平台凭据（也可启动后在设置页配置）
pnpm dev                      # 自动清理残留进程和缓存
```

`pnpm dev` 会先清理残留的 Next.js 开发进程并清空 `.next/cache`。跳过清理用 `pnpm run dev:raw`。

访问 http://localhost:3000 即可使用。

### 常用命令

```bash
pnpm dev          # 开发模式（含端口清理）
pnpm build        # 生产构建
pnpm start        # 启动生产服务
pnpm preview      # 构建 + 启动
pnpm test         # 运行测试（Vitest）
pnpm lint         # ESLint 检查
pnpm verify       # 完整验证（lint + test + build）
```

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js 15 App Router              │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  写作台   │  │ 稿件库   │  │ AI 选题  │  │  设置   │ │
│  │  /        │  │ /drafts  │  │ /ai-news │  │/settings│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │              │              │              │      │
│  ┌────▼──────────────▼──────────────▼──────────────▼───┐ │
│  │                   Zustand Store                     │ │
│  │     (content / platforms / draftId / publishState)  │ │
│  └─────────────────────┬──────────────────────────────┘ │
│                        │                                 │
│  ┌─────────────────────▼──────────────────────────────┐ │
│  │                 API Routes                          │ │
│  │  drafts · publish · ai-news · sync-tasks · settings │ │
│  └───┬──────────┬──────────┬──────────┬───────────────┘ │
│      │          │          │          │                  │
│  ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐              │
│  │ WeChat│ │  XHS  │ │ Zhihu │ │   X   │  各平台发布器  │
│  └───────┘ └───────┘ └───────┘ └───────┘              │
└─────────────────────────────────────────────────────────┘

数据存储：JSON 文件（.publio-data/），原子写（.tmp + rename）
```

完整目录结构和文件说明见 [CLAUDE.md](./CLAUDE.md)。

## 开发

### 技术栈

Next.js 15 (App Router) · React 19 · TypeScript 5 (strict) · vanilla-extract · Zustand 5 · marked 15 · Vitest + Testing Library

### 代码规范

- 路径别名 `@/*` → `./src/*`，类型定义集中在 `src/types/index.ts`
- 客户端组件标注 `'use client'`，重组件用 `dynamic()` 按需加载
- 每个组件对应同目录 `.css.ts` 文件，设计 token 集中在 `src/styles/tokens.css.ts`
- 第一方源码统一 TypeScript，不新增 JS 源文件（生成产物和第三方代码除外）

### 平台凭据

各平台 API 密钥通过 `.env.local` 配置，启动后在设置页也可管理：

| 平台 | 变量 | 获取方式 |
|------|------|----------|
| 微信公众号 | `WECHAT_APP_ID`, `WECHAT_APP_SECRET` | [mp.weixin.qq.com](https://mp.weixin.qq.com/) → 开发 → 基本配置 |
| 小红书 | `XHS_APP_ID`, `XHS_APP_SECRET`, `XHS_ACCESS_TOKEN` | [小红书开放平台](https://open.xiaohongshu.com/) |
| 知乎 | `ZHIHU_COOKIE` | 浏览器登录后从 DevTools Network 面板复制 Cookie |
| X (Twitter) | `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` | [developer.x.com](https://developer.x.com/) |

## Roadmap

- [ ] 更多平台支持（掘金、CSDN、B 站专栏）
- [ ] 图片上传与管理（图床集成）
- [ ] 排版模板系统
- [ ] 定时发布
- [ ] 多语言内容适配（AI 辅助翻译）
- [ ] 数据看板（各平台阅读量、互动数据聚合）

## License

[MIT](./LICENSE)
