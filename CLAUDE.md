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
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, lucide-react |
| CSS | vanilla-extract（@vanilla-extract/css + @vanilla-extract/recipes） |
| Editor | @uiw/react-md-editor |
| State | Zustand 5 |
| Markdown | marked 15 |
| Social API | twitter-api-v2 |
| Lint | ESLint 9 + eslint-config-next |
| Package Manager | pnpm (dev script 中使用 pnpm run) |

## Architecture

```
src/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx            # 根布局（Sidebar + main）
│   ├── page.tsx              # 首页：写作台（编辑器 + 右侧发布面板 + 自动保存）
│   ├── ai-news/
│   │   ├── page.tsx          # AI 选题工作台（SSR metadata）
│   │   └── error.tsx         # 错误边界
│   ├── drafts/
│   │   ├── page.tsx          # 稿件库页（SSR metadata）
│   │   └── DraftsPageClient.tsx  # 稿件库客户端
│   ├── settings/
│   │   └── page.tsx          # 设置页（API 凭证管理）
│   └── api/                  # API Routes
│       ├── ai-news/route.ts    # AI 新闻 RSS 聚合接口
│       ├── publish/route.ts    # 统一发布接口（fire-and-forget）
│       ├── settings/route.ts   # .env.local 读写接口
│       ├── drafts/             # 草稿 CRUD
│       │   ├── route.ts          # GET list / POST create
│       │   └── [id]/route.ts     # GET / PATCH / DELETE
│       ├── sync-tasks/         # 分发任务
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── platforms/          # 平台连接管理
│           └── [platform]/connection/
│               ├── check/route.ts
│               ├── disconnect/route.ts
│               ├── oauth/start/route.ts
│               └── oauth/callback/route.ts
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # 侧边导航栏
│   │   ├── AppShellHeader.tsx    # 通用页头（kicker/title/description/action）
│   │   └── SurfaceCard.tsx       # 卡片容器（tone 变体）
│   ├── editor/
│   │   ├── MarkdownEditor.tsx    # Markdown 编辑器（@uiw/react-md-editor）
│   │   ├── DraftPanel.tsx        # 草稿抽屉面板
│   │   ├── RecentDraftBar.tsx    # 移动端最近草稿栏
│   │   └── EditorialContextCard.tsx  # 稿件统计信号卡
│   ├── news/
│   │   ├── AiNewsPageClient.tsx  # AI 选题工作台客户端
│   │   ├── TopicSignalCard.tsx   # 话题信号卡片（含六维评分进度条）
│   │   ├── TopicDeskHeader.tsx   # 选题工作台页头
│   │   └── ScoreBar.tsx          # 单条评分进度条原子组件
│   ├── publish/
│   │   ├── PlatformSelector.tsx      # 平台选择器
│   │   ├── PublishButton.tsx         # 发布按钮（发布后打开进度浮层）
│   │   ├── PublishStatusPanel.tsx    # 发布状态面板
│   │   ├── PlatformPreviewPanel.tsx  # 平台内容预览（可折叠）
│   │   └── PublishProgressOverlay.tsx  # 发布进度浮层（右下角，轮询更新）
│   ├── drafts/
│   │   └── DraftLibraryClient.tsx   # 稿件库流水线视图（含彩色分发状态）
│   └── sync/
│       ├── SyncTaskList.tsx          # 分发记录列表
│       └── SyncTaskDetail.tsx        # 分发详情面板
├── hooks/
│   └── useAutoSave.ts        # 防抖自动保存 hook（停止输入 1s 后触发）
├── lib/
│   ├── ai-news/              # AI 新闻引擎
│   │   ├── index.ts            # 完整 pipeline（抓取→聚类→评分→排序）
│   │   ├── sources.ts          # RSS 源定义
│   │   ├── cluster.ts          # 话题聚类
│   │   ├── score.ts            # 六维评分
│   │   └── research.ts         # 研究底稿生成
│   ├── drafts/
│   │   ├── store.ts            # 草稿 CRUD（JSON 文件，原子写）
│   │   ├── registry.ts         # 单例注册表
│   │   ├── client.ts           # 客户端请求函数（updateDraft / ensureDraft）
│   │   └── types.ts            # 类型定义
│   ├── sync/
│   │   ├── store.ts            # 分发任务 CRUD + 状态机
│   │   ├── registry.ts         # 单例注册表
│   │   └── types.ts
│   ├── publishers/             # 各平台发布器
│   │   ├── executePublish.ts
│   │   ├── wechat.ts
│   │   ├── x.ts
│   │   ├── xiaohongshu.ts
│   │   └── zhihu.ts
│   ├── platformAdapters/       # 内容适配（各平台格式/字数校验）
│   │   ├── adaptContent.ts
│   │   └── types.ts
│   ├── platformConnections/    # 平台连接管理
│   │   ├── profiles.ts
│   │   ├── checkers.ts
│   │   └── index.ts
│   ├── storage/                # 通用存储工具
│   │   ├── jsonFileCollection.ts  # 原子写 JSON 文件
│   │   ├── localDataPath.ts
│   │   └── envFile.ts
│   ├── markdown.ts             # Markdown → 带样式 HTML 转换
│   ├── newsDraft.ts            # 新闻草稿 localStorage 桥接
│   ├── config.ts               # 平台 API 配置
│   └── publishStatus.ts        # 发布状态工具函数
├── stores/
│   └── publishStore.ts      # Zustand 全局状态（title/content/platforms/currentDraftId/浮层）
├── styles/
│   └── tokens.css.ts        # 设计 token（颜色/圆角/字体）
└── types/
    └── index.ts              # 类型定义 + PLATFORMS 常量
scripts/
└── dev-safe.ts               # 开发启动脚本（端口清理 + 缓存清除）
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
- vanilla-extract（`@vanilla-extract/css` + `@vanilla-extract/recipes`）
- 每个组件对应同目录的 `.css.ts` 文件
- 设计 token 集中在 `src/styles/tokens.css.ts`（颜色、圆角、字体）
- 设计风格：暖色调（橙/棕基调 `#D97757` accent），卡片式布局

### State Management
- Zustand store 位于 `src/stores/`
- 单一 `publishStore` 管理编辑器内容、平台选择、发布状态、当前草稿 ID、发布进度浮层
- `useAutoSave` hook 防抖自动保存（`src/hooks/useAutoSave.ts`）
- localStorage 用于新闻草稿临时传递 (`publio-ai-news-draft`)

### Patterns
- **平台配置**: 环境变量读取集中在 `src/lib/config.ts`
- **RSS 聚合**: 多源 RSS 抓取 → 聚类 → 六维评分 → 排序 → 研究底稿生成
- **发布流程**: 编辑器 → 选平台 → 统一发布接口（fire-and-forget）→ 原地浮层展示进度
- **自动保存**: 停止输入 1s 后触发，首次保存自动创建草稿并更新 URL
- **数据存储**: JSON 文件持久化（`.publio-data/`），原子写（`.tmp` + rename）
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
- `scripts/dev-safe.ts` 会在开发启动前清理端口和 `.next/cache`
- 中文注释和 UI 文案是项目惯例，保持一致
