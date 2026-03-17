# Publio

> Publish Markdown content to multiple platforms in one workflow.

基于 Next.js 的多平台内容分发工具，支持将 Markdown 文章一键发布到多个内容平台。

Publio is a multi-platform publishing tool built with Next.js, designed to help creators distribute Markdown content to platforms like WeChat Official Accounts, Xiaohongshu, Zhihu, and X in one streamlined workflow.

Write once, publish everywhere.

## 功能特性

- **Markdown 编辑器** — 内置实时预览的 Markdown 编辑器，所见即所得
- **终稿风格预览** — 编辑器右侧提供更接近微信/知乎最终排版的公众号风格预览
- **AI 热点新闻页** — 聚合最近 12 小时内的中文 AI 行业新闻，生成快讯摘要与长文式新闻流
- **一键转稿** — 从 AI 新闻页直接生成适合编辑器继续润色的公众号风格草稿
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
- **站点图标** — 内置浏览器标签页 favicon 与产品标题图标

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
│   ├── ai-news/page.tsx          # AI 新闻页入口
│   ├── globals.css               # 全局样式
│   ├── settings/page.tsx         # 设置页：各平台凭据管理
│   └── api/
│       ├── ai-news/route.ts      # AI 新闻聚合 API
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
│   ├── news/                     # AI 新闻页组件
│   └── publish/
│       ├── PlatformSelector.tsx  # 平台选择器
│       ├── PublishButton.tsx     # 发布按钮
│       └── PublishStatusPanel.tsx # 发布状态面板
├── lib/
│   ├── config.ts                 # 环境变量配置读取
│   ├── markdown.ts               # Markdown / 风格化 HTML 转换工具
│   ├── aiNews.ts                 # AI 新闻抓取、摘要、配图和转稿数据生成
│   ├── newsDraft.ts              # AI 新闻转稿模板
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

## AI 新闻页

访问 [http://localhost:3000/ai-news](http://localhost:3000/ai-news) 可以使用 AI 新闻聚合页。

- 抓取最近 12 小时内的中文 AI 行业新闻
- 自动生成快讯摘要、文章导语、正文点评和“值得关注”段落
- 为每条新闻尽量抓取原文开放图并插入内容
- 支持一键生成适合继续编辑和发布的长文草稿

这个页面的视觉风格偏向“公众号长文快讯”，包括深色阅读背景、强调色标题、分节编号和更强的文章感排版。

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
