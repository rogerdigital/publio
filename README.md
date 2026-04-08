# Publio

> Publish Markdown content to multiple platforms in one workflow.

基于 Next.js 的多平台内容分发工具，支持将 Markdown 文章一键发布到多个内容平台。

Publio is a multi-platform publishing tool built with Next.js, designed to help creators distribute Markdown content to platforms like WeChat Official Accounts, Xiaohongshu, Zhihu, and X in one streamlined workflow.

Write once, publish everywhere.

## 功能特性

- **Markdown 编辑器** — 内置实时预览的 Markdown 编辑器，所见即所得
- **终稿风格预览** — 编辑器右侧提供更接近微信/知乎最终排版的公众号风格预览
- **AI 话题工作台** — 手动触发抓取最近 3 天的中文 AI 行业动态，经评分聚类后生成选题列表与研究底稿
- **一键转稿** — 从选题工作台直接将研究底稿导入编辑器，继续润色后发布
- **多平台并发发布** — 一键将文章同步到多个平台，基于 `Promise.allSettled` 并发执行
- **四大平台支持**
  - 🟢 **微信公众号** — 通过 AppID/AppSecret 认证，自动创建草稿并发布，支持更接近公众号文章风格的 HTML 排版
  - 🔴 **小红书** — OAuth 认证，自动适配平台字数限制（标题 20 字，内容 1000 字）
  - 🔵 **知乎** — 基于专栏 API，支持风格化 HTML 富文本内容发布
  - ✖️ **X (Twitter)** — OAuth 1.0a 认证，长文自动拆分为 Thread 并编号
- **凭据管理** — 可视化设置页面，安全管理各平台 API 密钥，密钥脱敏显示
- **内容自动转换** — Markdown → 风格化 HTML（微信/知乎）、Markdown → 纯文本（小红书/X）
- **发布状态追踪** — 实时显示各平台发布进度与结果，支持跳转已发布内容
- **稳定开发启动** — `pnpm dev` 会自动清理残留 dev 进程并清空 `.next/cache`

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15.1.12 (App Router) |
| 语言 | TypeScript |
| 前端 | React 19 |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS v4 |
| 编辑器 | @uiw/react-md-editor |
| Markdown 解析 | marked |
| Twitter SDK | twitter-api-v2 |
| 包管理 | pnpm |

## 项目结构

```
src/
├── app/
│   ├── layout.tsx                # 根布局（侧边栏 + 内容区）
│   ├── page.tsx                  # 首页：编辑器 + 平台选择 + 发布
│   ├── ai-news/page.tsx          # AI 话题工作台入口
│   ├── globals.css               # 全局样式
│   ├── settings/page.tsx         # 设置页：各平台凭据管理
│   └── api/
│       ├── ai-news/route.ts      # AI 新闻聚合 API（每次实时抓取，返回 10 条）
│       ├── publish/route.ts      # 批量发布 API
│       ├── platforms/            # 各平台独立发布 API
│       │   ├── wechat/route.ts
│       │   ├── xiaohongshu/route.ts
│       │   ├── zhihu/route.ts
│       │   └── x/route.ts
│       └── settings/route.ts    # 凭据读写 API
├── components/
│   ├── layout/Sidebar.tsx        # 侧边栏导航
│   ├── editor/MarkdownEditor.tsx # Markdown 编辑器组件
│   ├── news/
│   │   ├── AiNewsPageClient.tsx  # 工作台主客户端组件
│   │   ├── TopicDeskHeader.tsx   # 工作台顶部状态栏
│   │   ├── TopicSignalCard.tsx   # 单条选题卡片
│   │   └── ResearchNotesPanel.tsx # 研究底稿面板
│   └── publish/
│       ├── PlatformSelector.tsx  # 平台选择器
│       ├── PublishButton.tsx     # 发布按钮
│       └── PublishStatusPanel.tsx # 发布状态面板
├── lib/
│   ├── config.ts                 # 环境变量配置读取
│   ├── markdown.ts               # Markdown / 风格化 HTML 转换工具
│   ├── aiNews.ts                 # AI 新闻模块入口（re-export）
│   ├── newsDraft.ts              # 选题转稿模板与 localStorage 桥接
│   ├── ai-news/                  # AI 新闻核心模块
│   │   ├── sources.ts            # RSS 数据源配置
│   │   ├── normalize.ts          # 原始信号标准化
│   │   ├── cluster.ts            # 话题聚类算法
│   │   ├── score.ts              # 多维度评分模型
│   │   ├── research.ts           # 研究底稿生成
│   │   ├── articleSnapshot.ts    # 原文快照抓取
│   │   └── index.ts              # 公开 API
│   └── publishers/               # 各平台发布器实现
│       ├── types.ts
│       ├── wechat.ts
│       ├── xiaohongshu.ts
│       ├── zhihu.ts
│       └── x.ts
├── scripts/
│   └── dev-safe.mjs              # 安全开发启动脚本
├── stores/
│   └── publishStore.ts          # Zustand 状态管理
└── types/
    └── index.ts                  # 类型定义
```

## AI 话题工作台

访问 [http://localhost:3000/ai-news](http://localhost:3000/ai-news) 可以使用 AI 话题工作台。

**工作流程：**

1. 点击「抓取选题」手动触发抓取（首次进入页面自动执行一次）
2. 系统从 9 个 RSS 数据源抓取最近 **3 天**的 AI 行业动态
3. 经过标准化、话题聚类、多维评分后，按多来源多样性过滤输出 **10 条**候选题
4. 每条候选题附带研究底稿（事件背景、重要性、受影响方、写作角度建议）
5. 确认选题后一键导入写作台继续润色

**评分维度（5 项）：**

| 维度 | 权重 | 说明 |
|------|------|------|
| 新鲜度 | 28% | 文章距今发布时间 |
| 影响力 | 26% | 话题类型 + 实体丰富度 + 多来源覆盖 |
| 势头 | 18% | 覆盖量 + 多来源 + 发酵速度 |
| 可信度 | 18% | 官方来源 + 媒体来源数 + 域名多样性 |
| 视觉就绪 | 10% | 配图数量与质量 |

**数据源（9 个）：**

| 来源 | 类型 |
|------|------|
| 36氪文章 | 媒体 |
| 36氪快讯 | 媒体 |
| 爱范儿 | 媒体 |
| 爱范儿快讯 | 社区 |
| 钛媒体 | 媒体 |
| 极客公园 | 媒体 |
| InfoQ 中文 | 社区 |
| 量子位 | 媒体 |
| Import AI | 社区 |

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm

### 安装

```bash
# 克隆项目
git clone https://github.com/rogerdigital/publio.git
cd publio

# 安装依赖
pnpm install
```

### 配置

复制环境变量模板并填入各平台的 API 凭据：

```bash
cp .env.example .env.local
```

也可以启动项目后，在设置页面中通过 UI 配置各平台凭据。

### 启动开发服务器

```bash
pnpm dev
```

`pnpm dev` 会先自动清理 `Publio` 自己残留的 Next.js 开发进程，并清空 `.next/cache`，用来降低开发态热更新卡死、端口被僵尸进程占用、构建产物错乱的问题。如果你需要原始启动方式，可以使用：

```bash
pnpm run dev:raw
```

如果你只是想稳定预览页面，不需要热更新，推荐使用：

```bash
pnpm preview
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 平台配置指南

### 微信公众号

需要在 [微信公众平台](https://mp.weixin.qq.com/) 获取：
- AppID
- AppSecret

### 小红书

需要在 [小红书开放平台](https://open.xiaohongshu.com/) 获取：
- App Key
- App Secret

### 知乎

需要通过浏览器获取：
- 登录后的 Cookie

### X (Twitter)

需要在 [Twitter Developer Portal](https://developer.twitter.com/) 获取：
- API Key
- API Secret
- Access Token
- Access Token Secret

## License

[MIT](./LICENSE)
