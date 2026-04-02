# Publio

> 多平台内容分发工具，支持 Markdown 编辑、AI 新闻聚合、一键发布到微信公众号 / 小红书 / 知乎 / X (Twitter)。

## Project Overview

- **Name**: publio
- **Version**: 0.1.0
- **Tagline**: Write once, publish everywhere.
- **Runtime**: Next.js 15 (App Router, React 19)
- **Private**: true

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15.1.12 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, Tailwind CSS 4, lucide-react |
| Editor | @uiw/react-md-editor |
| State | Zustand 5 |
| Markdown | marked 15 |
| Social API | twitter-api-v2 |
| Lint | ESLint 9 + eslint-config-next |
| CSS | Tailwind CSS 4 via @tailwindcss/postcss + PostCSS |
| Package Manager | pnpm (dev script 中使用 pnpm run) |

## Architecture

```
src/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx            # 根布局（Sidebar + main）
│   ├── page.tsx              # 首页：Markdown 编辑器 + 平台选择 + 发布
│   ├── ai-news/
│   │   ├── page.tsx          # AI 新闻聚合页（SSR metadata）
│   │   └── error.tsx         # 错误边界
│   ├── settings/
│   │   └── page.tsx          # 设置页
│   └── api/                  # API Routes
│       ├── ai-news/route.ts    # AI 新闻 RSS 聚合接口
│       ├── publish/route.ts    # 统一发布接口
│       ├── settings/route.ts   # 设置读写接口
│       └── platforms/          # 各平台发布接口
│           ├── wechat/route.ts
│           ├── xiaohongshu/route.ts
│           ├── zhihu/route.ts
│           └── x/route.ts
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx       # 侧边导航栏
│   ├── editor/
│   │   └── MarkdownEditor.tsx  # Markdown 编辑器 + 发布态预览
│   ├── news/
│   │   └── AiNewsPageClient.tsx  # AI 新闻客户端组件
│   └── publish/
│       ├── PlatformSelector.tsx  # 平台选择器
│       ├── PublishButton.tsx     # 发布按钮
│       └── PublishStatusPanel.tsx  # 发布状态面板
├── lib/
│   ├── aiNews.ts             # RSS 抓取、评分、排序、编辑内容生成
│   ├── config.ts             # 各平台 API 配置（读取环境变量）
│   ├── markdown.ts           # Markdown → 带样式 HTML 转换
│   ├── newsDraft.ts          # 新闻草稿 localStorage 桥接
│   └── publishers/           # 各平台发布器
│       ├── types.ts
│       ├── wechat.ts
│       ├── x.ts
│       ├── xiaohongshu.ts
│       └── zhihu.ts
├── stores/
│   └── publishStore.ts      # Zustand 全局状态（标题/内容/平台/发布状态）
├── types/
│   └── index.ts              # 类型定义 + PLATFORMS 常量
scripts/
└── dev-safe.mjs              # 开发启动脚本（端口清理 + 缓存清除）
```

## Commands

```bash
# 安装依赖
pnpm install

# 开发模式（自动清理端口和缓存，默认 port 3000）
pnpm dev

# 直接启动 Next.js dev server（跳过端口清理）
pnpm run dev:raw

# 生产构建
pnpm build

# 启动生产服务
pnpm start

# 预览（构建 + 启动）
pnpm preview

# 代码检查
pnpm lint
```

## Code Conventions

### TypeScript
- 路径别名: `@/*` → `./src/*`
- Target: ES2017, strict mode
- JSX: preserve（由 Next.js 处理）
- 使用 `export default function` 导出页面和组件
- 类型定义集中在 `src/types/index.ts`

### React & Next.js
- 使用 App Router（`src/app/` 目录结构）
- 客户端组件显式标注 `'use client'`
- 动态导入重组件: `dynamic(() => import(...), { ssr: false })`
- Metadata 通过 `export const metadata` 声明
- API Routes 使用 Route Handlers (`route.ts`)

### Styling
- Tailwind CSS 4（通过 PostCSS 插件集成）
- 内联 Tailwind 类名，大量使用自定义渐变和阴影
- 设计风格：暖色调（橙/棕基调 `#d77443`, `#3a3029` 等）
- 圆角大弧度 `rounded-[28px]`，卡片式布局

### State Management
- Zustand store 位于 `src/stores/`
- 单一 `publishStore` 管理编辑器内容、平台选择、发布状态
- localStorage 用于新闻草稿临时传递 (`publio-ai-news-draft`)

### Patterns
- **平台配置**: 环境变量读取集中在 `src/lib/config.ts`
- **RSS 聚合**: 多源 RSS 抓取 → XML 解析 → 评分排序 → 编辑内容生成
- **发布流程**: 编辑器 → 选平台 → 统一发布接口 → 各平台 publisher 分发
- **中文注释**: 项目惯例，UI 文案以中文为主

## Environment Variables

各平台 API 密钥通过 `.env.local` 配置：

- `WECHAT_APP_ID`, `WECHAT_APP_SECRET`
- `XHS_APP_ID`, `XHS_APP_SECRET`, `XHS_ACCESS_TOKEN`
- `ZHIHU_COOKIE`
- `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`

## Important Guardrails

- `.env` / `.env.local` 已在 `.gitignore` 中，不要提交密钥
- `.next/` 和 `node_modules/` 不提交
- `dist/` 目录已被 gitignore
- `scripts/dev-safe.mjs` 会在开发启动前清理端口和 `.next/cache`
- 中文注释和 UI 文案是项目惯例，保持一致
