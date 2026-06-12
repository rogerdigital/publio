# Publio 架构迁移：Next.js → Vite SPA + Hono API

## Context

Next.js + webpack 的 HMR 与 vanilla-extract 配合不稳定，频繁出现 chunk 引用失效导致 dev 环境崩溃。QuantPilot 同样使用 vanilla-extract 但基于 Vite，开发体验丝滑。本次迁移将 Publio 转为 Vite SPA + Hono API server 架构。

## 目标架构

```
publio/
├── apps/
│   ├── web/                    # Vite SPA (前端)
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── main.tsx        # 入口
│   │       ├── app/
│   │       │   ├── App.tsx
│   │       │   ├── routes/     # React Router
│   │       │   ├── providers/
│   │       │   └── styles/     # 全局 vanilla-extract
│   │       ├── components/     # 从 src/components/ 搬入
│   │       ├── hooks/          # 从 src/hooks/ 搬入
│   │       ├── stores/         # Zustand stores
│   │       ├── lib/            # 纯前端 lib（markdown, contentStats, cn）
│   │       └── types/
│   └── api/                    # Hono API server (后端)
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── main.ts         # 入口
│           ├── app.ts          # Hono app 实例 + 中间件
│           ├── routes/         # 路由处理（从 src/app/api/ 迁移）
│           ├── middleware/     # localhost guard + rate limit
│           └── lib/            # 后端 lib（storage, publishers, agent, sync）
├── packages/
│   └── shared-types/           # 前后端共享的 TypeScript 类型
├── package.json                # pnpm workspaces
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## 迁移分 5 个阶段

### Phase 1: 脚手架搭建（Day 1 上午）

1. 根目录改为 pnpm workspaces monorepo
2. 创建 `apps/web/`：
   - `vite.config.ts`：react plugin + vanilla-extract plugin + proxy `/api` → `localhost:8787`
   - `index.html`：同 QuantPilot 模式
   - `tsconfig.json`：moduleResolution bundler, path alias `@/*`
   - `src/main.tsx`：React 19 入口 + 全局样式 import
3. 创建 `apps/api/`：
   - Hono app + `@hono/node-server`
   - 启动脚本：`node --import tsx/esm src/main.ts`
   - 端口 8787，bind 127.0.0.1
4. 创建 `packages/shared-types/`：从现有 `src/types/` 提取
5. 根 `package.json` scripts：
   - `dev:web` → vite dev
   - `dev:api` → tsx api
   - `dev` → concurrently 启动两者
   - `build` → vite build
   - `preview` → vite preview

### Phase 2: 前端迁移（Day 1 下午 - Day 2）

1. 搬移目录：
   - `src/components/` → `apps/web/src/components/`
   - `src/hooks/` → `apps/web/src/hooks/`
   - `src/stores/` → `apps/web/src/stores/`
   - `src/styles/` → `apps/web/src/app/styles/`
   - 前端用到的 `src/lib/` 子集（markdown, contentStats, cn, navigationDataCache）→ `apps/web/src/lib/`
2. 路由：React Router v6
   - `/` → 写作台（原 `app/page.tsx`）
   - `/drafts` → 稿件库
   - `/settings` → 设置
3. 根布局 → `App.tsx`：Sidebar + NavigationProvider + ToastContainer + main content
4. 移除所有 Next.js 特有 API：
   - `useSearchParams()` → React Router `useSearchParams()`
   - `'use client'` 标记 → 删除（SPA 全是客户端）
   - `next/navigation` → `react-router-dom`
5. 页面组件：去掉 `export default function XxxPage`，改为普通组件
6. 确保 vanilla-extract 样式文件零改动迁移（文件不变，只调 import 路径）

### Phase 3: API 迁移（Day 2 - Day 3）

1. 中间件迁移：
   - `src/middleware.ts` → `apps/api/src/middleware/localhostGuard.ts` + `rateLimit.ts`
   - 改为 Hono middleware 格式
2. 响应工具：
   - `src/lib/api/response.ts` → `apps/api/src/lib/response.ts`
   - `apiResponse(data)` → `c.json({ ok: true, ...data })`
   - `apiError(msg, status)` → `c.json({ ok: false, error: msg }, status)`
3. 路由迁移（30 个文件，按组批量）：
   - 模式：`export async function GET(req: NextRequest)` → `app.get('/path', async (c) => ...)`
   - 动态路由：`[id]` → `:id`，`c.req.param('id')`
   - Body 解析：`request.json()` → `c.req.json()`
   - FormData：`request.formData()` → `c.req.formData()`
4. SSE 流式路由（agent/write, agent/adapt）：
   - 返回 raw `Response` 对象（Hono 支持直接 return Response）
   - signal 从 `c.req.raw.signal` 获取
5. 后端 lib 搬移：
   - `src/lib/storage/` → `apps/api/src/lib/storage/`
   - `src/lib/agent/` → `apps/api/src/lib/agent/`
   - `src/lib/publishers/` → `apps/api/src/lib/publishers/`
   - `src/lib/sync/` → `apps/api/src/lib/sync/`
   - 其他后端逻辑类似

### Phase 4: 清理与配置（Day 3）

1. 删除 Next.js 相关：
   - `next.config.ts`
   - `src/app/` 目录
   - `@vanilla-extract/next-plugin` 依赖
   - `eslint-config-next`
2. 更新 linting：保留 ESLint 或迁移到 Biome（可后续做）
3. 更新 `scripts/dev-safe.ts`：不再需要清 .next cache，改为管理两个进程
4. 更新 `.gitignore`：`.next/` → `dist/`
5. 更新 Vitest 配置：在 vite.config.ts 中集成测试
6. 环境变量：`.env.local` 前后端各自读取，API server 用 `dotenv` 或 Node --env-file

### Phase 5: 验证（Day 3-4）

1. `pnpm dev` 启动前后端，访问所有页面
2. 测试：
   - 设置页保存/读取
   - AI 测试连接
   - 草稿 CRUD
   - 发布流程
   - 图片上传
3. `pnpm build`（web + api）通过
4. HMR 验证：改 `.css.ts` 文件确认热更新不崩溃
5. `pnpm test` 通过

## 关键决策

- **React 版本**：保持 React 19（Vite + React 19 完全兼容）
- **路由方案**：React Router v6（成熟稳定，3 个页面足够）
- **状态管理**：保持 Zustand（不换 Context）
- **Markdown 编辑器**：`@uiw/react-md-editor` 在 SPA 中正常工作
- **CSS**：vanilla-extract 样式文件完全不变，只换编译插件（next-plugin → vite-plugin）
- **开发体验**：用 `concurrently` 一条命令启动 web + api

## 风险点

1. `@uiw/react-md-editor` 是否有 SSR 相关代码在 SPA 模式下报错 → 预计无问题，它本身就是纯客户端组件
2. 安全 headers（CSP 等）从 next.config 迁到 Hono middleware 或 vite preview 配置
3. `.publio-data/` 路径解析：从 `process.cwd()` 相对路径不变，API server 工作目录需要明确
