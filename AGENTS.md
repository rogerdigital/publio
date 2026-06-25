# Publio

> 面向个人创作者的精简多平台写作与发布工具，支持 Markdown 编辑、草稿管理、AI 写作辅助和发布到微信公众号 / 小红书 / 知乎 / X (Twitter)。

## Project Overview

- **Name**: publio
- **Version**: 0.2.0
- **Tagline**: Write once, adapt per platform.
- **Runtime**: Vite SPA (React 19) + Hono API server
- **Private**: true

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite 8 SPA (React 19) |
| Backend | Hono 4 (`@hono/node-server`) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, lucide-react |
| Router | react-router-dom 6 |
| CSS | vanilla-extract (`@vanilla-extract/css` + `@vanilla-extract/recipes`) |
| Editor | `@uiw/react-md-editor` |
| State | Zustand 5 |
| Markdown | marked 15 + sanitize-html |
| LLM Streaming | `eventsource-parser` |
| Social API | `twitter-api-v2` |
| Lint | ESLint 9 (flat config) |
| Monorepo | pnpm workspaces |

## Architecture

pnpm workspaces monorepo. Frontend SPA (`apps/web`) talks to a Hono API
server (`apps/api`) over `/api/*`; Vite dev proxies `/api` → `localhost:8787`.

```text
apps/
├── web/                       # Vite SPA
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx           # 入口
│       ├── app/
│       │   ├── App.tsx        # 根布局 + 主题
│       │   ├── routes/        # AppRouter (react-router)
│       │   └── styles/        # 全局 vanilla-extract
│       ├── pages/             # Home / Drafts / Settings
│       ├── components/
│       ├── hooks/
│       ├── stores/
│       ├── lib/               # 纯前端 lib
│       └── types/
└── api/                       # Hono API server (port 8787)
    └── src/
        ├── main.ts            # 入口 (@hono/node-server)
        ├── app.ts             # Hono app + 中间件挂载
        ├── routes/            # settings/drafts/agent/publish/...
        ├── middleware/        # localhostGuard + rateLimit
        └── lib/               # 后端 lib (storage/agent/publishers/sync)
packages/
└── shared-types/              # 前后端共享类型
```

## Commands

```bash
pnpm install          # 安装依赖
pnpm dev              # concurrently 启动 web + api
pnpm dev:web          # 仅启动前端 (Vite, port 3000)
pnpm dev:api          # 仅启动后端 (Hono, port 8787)
pnpm build            # 构建前端 (tsc + vite build)
pnpm preview          # 预览构建产物
pnpm lint             # ESLint 检查
pnpm test             # Vitest 测试
```

## Code Conventions

- 路径别名: `@/*` -> 各 app 的 `./src/*`；共享类型用 `@shared-types`
- TypeScript strict mode，`moduleResolution: Bundler`
- 前端页面/组件用 `export default function`；SPA 全是客户端，无需 `'use client'`
- 路由用 react-router-dom：`useNavigate` / `useSearchParams` / `useLocation` / `Link to=`
- 动态导入用 `React.lazy` + `Suspense`（非 `next/dynamic`）
- API 路由用 Hono：按域分组的 `routes/*.ts`，`c.json()` / `c.req.param()`
- 样式使用 vanilla-extract，同目录 `.css.ts`
- `keyframes` 动画用 `keyframes()` 单独定义
- 中文注释和 UI 文案是项目惯例

## State And Data

- `publishStore` 管理编辑器内容、平台选择、渠道版本和发布状态。
- `agentStore` 只管理当前 Agent 流式输出和 AbortController。
- 本地运行数据在 `.publio-data/`，通过 `apps/api/src/lib/storage/jsonFileCollection.ts` 原子写。
- 发布任务状态由 `apps/api/src/lib/sync/**` 和 `/api/sync-tasks/**` 管理。

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
- `dist/` / `node_modules/` 不提交。
- 第一方源码必须 TypeScript，禁止 `.js`/`.mjs`/`.cjs`（配置文件如 `eslint.config.js` 除外）。
- API server 仅监听 127.0.0.1，`localhostGuard` 中间件拒绝非本地请求。
- main 分支有保护规则：必须通过 PR + 状态检查。
