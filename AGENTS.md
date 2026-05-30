# Publio

> 面向个人创作者的精简多平台写作与发布工具，支持 Markdown 编辑、草稿管理、AI 写作辅助和发布到微信公众号 / 小红书 / 知乎 / X (Twitter)。

## Project Overview

- **Name**: publio
- **Version**: 0.1.0
- **Tagline**: Write once, adapt per platform.
- **Runtime**: Next.js 15 (App Router, React 19)
- **Private**: true

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, lucide-react |
| CSS | vanilla-extract (`@vanilla-extract/css` + `@vanilla-extract/recipes`) |
| Editor | `@uiw/react-md-editor` |
| State | Zustand 5 |
| Markdown | marked 15 + sanitize-html |
| LLM Streaming | `eventsource-parser` |
| Social API | `twitter-api-v2` |
| Lint | ESLint 9 + eslint-config-next |
| Package Manager | pnpm |

## Architecture

```text
src/
├── app/
│   ├── layout.tsx             # 根布局（Sidebar + main）
│   ├── page.tsx               # 写作台
│   ├── drafts/                # 稿件库
│   ├── settings/              # 设置页
│   └── api/
│       ├── agent/             # status / write / adapt
│       ├── custom-prompts/    # 自定义提示词
│       ├── drafts/            # 草稿 CRUD、版本、渠道版本
│       ├── platform-variants/ # 渠道版本更新
│       ├── platforms/         # 平台连接管理
│       ├── publish/           # 发布入口和状态检查
│       ├── settings/          # env 配置读写
│       ├── sync-tasks/        # 发布任务状态 API
│       ├── templates/         # 内容模板
│       └── uploads/           # 本地/GitHub 图片上传
├── components/
│   ├── agent/                 # AgentPanel
│   ├── drafts/                # DraftLibraryClient
│   ├── editor/                # MarkdownEditor, DraftPanel, TemplatePicker, VersionHistory
│   ├── feedback/              # 通用空状态、错误状态、Toast、Skeleton
│   ├── layout/                # Sidebar, AppShellHeader, SurfaceCard
│   ├── publish/               # 平台选择、平台预览、发布按钮、发布进度
│   ├── settings/              # PromptEditor
│   └── ui/                    # 共享 UI primitives
├── hooks/
│   ├── useAgentStream.ts
│   ├── useAutoSave.ts
│   ├── useImmersiveMode.ts
│   ├── useKeyboardShortcuts.ts
│   └── useSlashCommands.ts
├── lib/
│   ├── agent/                 # Agent 配置、provider、SSE、写作/适配 prompt
│   ├── drafts/                # 草稿存储、版本、导入导出 helper（草稿内部）
│   ├── moderation/            # 敏感词检查
│   ├── platformAdapters/      # 平台内容适配
│   ├── platformConnections/   # 平台连接和 OAuth
│   ├── platformRules/         # 平台规则校验
│   ├── platformVariants/      # 渠道版本存储
│   ├── publishChecks/         # 发布前检查
│   ├── publishers/            # 各平台发布器
│   ├── storage/               # JSON 文件存储、envFile、migrations
│   ├── sync/                  # 发布任务状态机
│   ├── templates/             # 内容模板
│   └── upload/                # 文件/GitHub 图床上传
├── stores/
│   ├── agentStore.ts          # Agent 流式输出状态
│   ├── publishStore.ts        # 编辑器内容、平台选择、渠道版本和发布状态
│   └── toastStore.ts
├── styles/
│   └── tokens.css.ts
└── types/
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
pnpm verify           # check:no-js-source + lint + test + build
```

## Code Conventions

### TypeScript

- 路径别名: `@/*` -> `./src/*`
- Target: ES2017, strict mode
- 使用 `export default function` 导出页面和组件
- 类型定义集中在 `src/types/index.ts`、`src/types/platform.ts`、`src/types/publish.ts`

### React & Next.js

- App Router（`src/app/`），客户端组件标注 `'use client'`
- 动态导入: `dynamic(() => import(...), { ssr: false })`
- API Routes 使用 Route Handlers (`route.ts`)

### Styling

- 使用 vanilla-extract。
- 每个组件对应同目录 `.css.ts` 文件。
- 设计 token 在 `src/styles/tokens.css.ts`。
- `keyframes` 动画用 `keyframes()` 函数单独定义，不能内联在 style 对象里。

### State Management

- Zustand store 在 `src/stores/`。
- `publishStore` 管理编辑器内容、平台选择、渠道版本和发布状态。
- `agentStore` 只管理当前 Agent 流式输出和 AbortController。

### Agent System

- 无 `AGENT_*` 配置时隐藏 AI 入口。
- 写作 Agent 只保留 `rewrite` 和 `title`。
- 平台适配通过 `/api/agent/adapt` 输出渠道版本建议。
- 所有 Agent 响应走 SSE。
- `getAgentConfig()` 从 `.env.local` 实时读取，设置页保存后无需重启。

### Core Patterns

- **写作流程**: 编辑器 -> 自动保存草稿 -> 渠道版本 -> 发布前检查 -> 发布任务轮询。
- **平台配置**: `src/lib/config.ts`。
- **自动保存**: 停止输入 1s 触发，首次保存自动创建草稿。
- **数据存储**: JSON 文件（`.publio-data/`），原子写，schema migration 只保留发布任务事件迁移。
- **发布状态**: 独立 `/sync-tasks` 页面已删除，但 `src/lib/sync/**` 和 `/api/sync-tasks/**` 保留为核心发布链路。

## Environment Variables

### 平台凭证

- `WECHAT_APP_ID`, `WECHAT_APP_SECRET`
- `XHS_APP_ID`, `XHS_APP_SECRET`, `XHS_ACCESS_TOKEN`
- `ZHIHU_COOKIE`
- `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`

### AI Agent

- `AGENT_BASE_URL` — OpenAI-compatible endpoint
- `AGENT_API_KEY` — API key
- `AGENT_MODEL` — 模型名
- `AGENT_PROVIDER` — 可选 provider override
- `AGENT_MAX_TOKENS` — 可选，默认 2048
- `AGENT_TEMPERATURE` — 可选，默认 0.7

### GitHub 图床

- `GITHUB_IMAGE_ENABLED`
- `GITHUB_IMAGE_TOKEN`
- `GITHUB_IMAGE_OWNER`
- `GITHUB_IMAGE_REPO`
- `GITHUB_IMAGE_BRANCH`
- `GITHUB_IMAGE_PATH`

## Removed Product Areas

以下功能代码和资源已从核心产品中删除，不要在新代码中引用：

- AI 新闻台、RSS 聚合、Signal、Topic、Brief。
- 数据看板、指标聚合、内容复盘。
- 内容日历和定时调度器。
- Copilot、品牌画像、风格学习、选题推荐。
- 工作空间级导入导出。
- 独立分发记录页面。

## Important Guardrails

- `.env` / `.env.local` 不提交。
- `.next/` / `node_modules/` 不提交。
- 第一方源码必须 TypeScript，禁止 `.js`/`.mjs`/`.cjs`。
- `scripts/dev-safe.ts` 在开发启动前清理端口和缓存。
- 中文注释和 UI 文案是项目惯例。
- main 分支有保护规则：必须通过 PR + 状态检查。
