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
│   ├── page.tsx               # 写作台
│   ├── drafts/                # 稿件库
│   ├── settings/              # 设置页
│   └── api/
│       ├── agent/             # status / write / adapt
│       ├── drafts/            # 草稿 CRUD、版本、渠道版本
│       ├── platforms/         # 平台连接管理
│       ├── publish/           # 发布入口和状态检查
│       ├── sync-tasks/        # 发布任务状态 API
│       ├── templates/         # 内容模板
│       └── uploads/           # 图片上传
├── components/
│   ├── agent/
│   ├── drafts/
│   ├── editor/
│   ├── feedback/
│   ├── layout/
│   ├── publish/
│   ├── settings/
│   └── ui/
├── hooks/
├── lib/
│   ├── agent/
│   ├── drafts/
│   ├── moderation/
│   ├── platformAdapters/
│   ├── platformConnections/
│   ├── platformRules/
│   ├── platformVariants/
│   ├── publishChecks/
│   ├── publishers/
│   ├── storage/
│   ├── sync/
│   ├── templates/
│   └── upload/
├── stores/
├── styles/
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

- 路径别名: `@/*` -> `./src/*`
- TypeScript strict mode。
- App Router 页面和组件优先使用 `export default function`。
- 客户端组件必须显式标注 `'use client'`。
- API Routes 使用 Route Handlers (`route.ts`)。
- 样式使用 vanilla-extract，同目录 `.css.ts`。
- `keyframes` 动画用 `keyframes()` 单独定义。
- 中文注释和 UI 文案是项目惯例。

## State And Data

- `publishStore` 管理编辑器内容、平台选择、渠道版本和发布状态。
- `agentStore` 只管理当前 Agent 流式输出和 AbortController。
- 本地运行数据在 `.publio-data/`，通过 `src/lib/storage/jsonFileCollection.ts` 原子写。
- 发布任务状态由 `src/lib/sync/**` 和 `/api/sync-tasks/**` 管理。

## Agent System

- 无 `AGENT_*` 配置时隐藏 AI 入口。
- 写作 Agent 只保留 `rewrite` 和 `title`。
- 平台适配走 `/api/agent/adapt`。
- Agent 响应走 SSE。
- `getAgentConfig()` 从 `.env.local` 实时读取。

## Environment Variables

### 平台凭证

- `WECHAT_APP_ID`, `WECHAT_APP_SECRET`
- `XHS_APP_ID`, `XHS_APP_SECRET`, `XHS_ACCESS_TOKEN`
- `ZHIHU_COOKIE`
- `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`

### AI Agent

- `AGENT_BASE_URL`
- `AGENT_API_KEY`
- `AGENT_MODEL`
- `AGENT_PROVIDER`
- `AGENT_MAX_TOKENS`
- `AGENT_TEMPERATURE`

### GitHub 图床

- `GITHUB_IMAGE_ENABLED`
- `GITHUB_IMAGE_TOKEN`
- `GITHUB_IMAGE_OWNER`
- `GITHUB_IMAGE_REPO`
- `GITHUB_IMAGE_BRANCH`
- `GITHUB_IMAGE_PATH`

## Removed Product Areas

以下功能代码和资源已删除，不要在新代码中引用：

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
- main 分支有保护规则：必须通过 PR + 状态检查。
