# Publio

> 多平台内容分发工具，支持 Markdown 编辑、AI 新闻聚合、AI 写作辅助、一键发布到微信公众号 / 小红书 / 知乎 / X (Twitter)。

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
| LLM Streaming | eventsource-parser (server-side SSE parsing) |
| Social API | twitter-api-v2 |
| Lint | ESLint 9 + eslint-config-next |
| Package Manager | pnpm |

## Architecture

```
src/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx            # 根布局（Sidebar + main）
│   ├── page.tsx              # 首页：写作台（编辑器 + Agent 面板 + 发布面板）
│   ├── ai-news/
│   │   ├── page.tsx          # AI 选题工作台（SSR metadata）
│   │   └── error.tsx         # 错误边界
│   ├── drafts/
│   │   ├── page.tsx          # 稿件库页
│   │   └── DraftsPageClient.tsx
│   ├── settings/
│   │   └── page.tsx          # 设置页（平台凭证 + AI Agent 配置）
│   ├── sync-tasks/           # 分发记录
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── api/                  # API Routes
│       ├── ai-news/route.ts
│       ├── publish/route.ts
│       ├── settings/route.ts
│       ├── drafts/             # 草稿 CRUD
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── sync-tasks/         # 分发任务
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── mark-done/route.ts
│       │       └── retry/route.ts
│       ├── agent/              # AI Agent SSE endpoints
│       │   ├── status/route.ts   # GET — 检查 Agent 可用性
│       │   ├── write/route.ts    # POST — 写作辅助（扩写/缩写/改写/润色/续写）
│       │   ├── adapt/route.ts    # POST — 平台内容适配
│       │   ├── research/route.ts # POST — 深度选题分析
│       │   └── diagnose/route.ts # POST — 发布失败诊断
│       └── platforms/          # 平台连接管理
│           └── [platform]/connection/
├── components/
│   ├── layout/               # AppShellHeader, Sidebar, SurfaceCard
│   ├── editor/               # MarkdownEditor, DraftPanel, EditorialContextCard
│   ├── news/                 # AiNewsPageClient, TopicSignalCard, ScoreBar
│   ├── publish/              # PlatformSelector, PublishButton, PlatformPreviewPanel,
│   │                         # PlatformAdaptButton, PublishTimingSuggestion
│   ├── sync/                 # SyncTaskList, SyncTaskDetail (含 DiagnoseButton)
│   ├── agent/                # AgentPanel, AgentStreamOutput
│   └── drafts/               # DraftLibraryClient
├── hooks/
│   ├── useAutoSave.ts
│   ├── useSlashCommands.ts   # 编辑器 slash commands（含 AI 命令）
│   └── useAgentStream.ts     # SSE 消费 hook（fetch + AbortController）
├── lib/
│   ├── agent/                # AI Agent 核心
│   │   ├── types.ts            # AgentAction, ChatMessage, LLMProvider 等
│   │   ├── config.ts           # 从 .env.local 实时读取 Agent 配置
│   │   ├── provider.ts         # OpenAI-compatible streaming provider
│   │   ├── stream.ts           # createSSEResponse — Next.js SSE 封装
│   │   ├── publishOps.ts       # 发布历史聚合 + 时间建议
│   │   └── prompts/
│   │       ├── writing.ts        # 扩写/缩写/改写/润色/续写 prompt
│   │       ├── adaptation.ts     # 各平台风格适配 prompt
│   │       ├── research.ts       # 深度选题分析 prompt
│   │       └── diagnose.ts       # 发布失败诊断 prompt
│   ├── ai-news/              # RSS → 聚类 → 评分 → 研究底稿
│   ├── drafts/               # 草稿 CRUD（JSON 文件）
│   ├── sync/                 # 分发任务状态机
│   ├── publishers/           # 各平台发布器
│   ├── platformAdapters/     # 内容格式适配
│   ├── platformConnections/  # 连接管理
│   ├── storage/              # jsonFileCollection, envFile
│   ├── markdown.ts
│   ├── newsDraft.ts          # 研究底稿 → Markdown 草稿（支持 LLM 分析融入）
│   └── config.ts
├── stores/
│   ├── publishStore.ts       # 编辑器内容、平台选择、发布状态
│   └── agentStore.ts         # Agent 流式输出状态 + researchCache
├── styles/
│   └── tokens.css.ts         # 设计 token
└── types/
    └── index.ts
```

## Commands

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式（含端口清理 + 缓存清除）
pnpm run dev:raw      # 跳过清理直接启动
pnpm build            # 生产构建
pnpm start            # 启动生产服务
pnpm preview          # 构建 + 启动
pnpm lint             # ESLint 检查
pnpm test             # Vitest 测试
pnpm verify           # lint + test + build
```

## Code Conventions

### TypeScript
- 路径别名: `@/*` → `./src/*`
- Target: ES2017, strict mode
- 使用 `export default function` 导出页面和组件
- 类型定义集中在 `src/types/index.ts`

### React & Next.js
- App Router（`src/app/`），客户端组件标注 `'use client'`
- 动态导入: `dynamic(() => import(...), { ssr: false })`
- API Routes 使用 Route Handlers (`route.ts`)

### Styling
- vanilla-extract（`@vanilla-extract/css` + `@vanilla-extract/recipes`）
- 每个组件对应同目录 `.css.ts` 文件
- 设计 token 在 `src/styles/tokens.css.ts`（暖色调，橙/棕基调 `#D97757` accent）
- `keyframes` 动画用 `keyframes()` 函数单独定义，不能内联在 style 对象里

### State Management
- Zustand 5，store 在 `src/stores/`
- `publishStore` — 编辑器内容、平台选择、发布状态、AI 适配内容
- `agentStore` — Agent 流式输出、AbortController、researchCache
- localStorage 用于新闻草稿临时传递

### Agent System
- **Graceful degradation** — 无 AGENT_* 配置时所有 AI 入口隐藏
- **Provider 无关** — 任何 OpenAI-compatible API（智谱GLM/DeepSeek/Qwen/OpenAI/Ollama）
- **Streaming first** — 所有 Agent 响应走 SSE（text/event-stream）
- **独立 store** — agentStore 与 publishStore 解耦
- **配置热更新** — `getAgentConfig()` 从 .env.local 实时读取，设置页保存后无需重启

### Patterns
- **平台配置**: `src/lib/config.ts`
- **RSS 聚合**: 多源 RSS → 聚类 → 六维评分 → 排序 → 研究底稿
- **发布流程**: 编辑器 → 选平台 → fire-and-forget → 浮层轮询
- **AI 写作**: Slash command → SSE → Agent Panel → 插入/替换/复制
- **自动保存**: 停止输入 1s 触发，首次保存自动创建草稿
- **数据存储**: JSON 文件（`.publio-data/`），原子写

## Environment Variables

### 平台凭证
- `WECHAT_APP_ID`, `WECHAT_APP_SECRET`
- `XHS_APP_ID`, `XHS_APP_SECRET`, `XHS_ACCESS_TOKEN`
- `ZHIHU_COOKIE`
- `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`

### AI Agent（三项必填，设置页可配）
- `AGENT_BASE_URL` — OpenAI-compatible endpoint（如 `https://open.bigmodel.cn/api/paas/v4`）
- `AGENT_API_KEY` — API key
- `AGENT_MODEL` — 模型名（如 `glm-4-flash`, `deepseek-chat`）
- `AGENT_MAX_TOKENS` — 可选，默认 2048
- `AGENT_TEMPERATURE` — 可选，默认 0.7

## Important Guardrails

- `.env` / `.env.local` 不提交（已 gitignore）
- `.next/` / `node_modules/` 不提交
- 第一方源码必须 TypeScript，禁止 `.js`/`.mjs`/`.cjs`
- `scripts/dev-safe.ts` 在开发启动前清理端口和缓存
- 中文注释和 UI 文案是项目惯例
- main 分支有保护规则：必须通过 PR + 状态检查
