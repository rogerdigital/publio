# Publio

> Write once, publish everywhere.

多平台内容分发工具，在一个界面里完成 Markdown 写作、成稿预览与多平台一键分发；内置 AI 选题工作台，将最近 24 小时的中文 AI 行业动态压缩为可判断的选题列表与研究底稿。

## 功能特性

- **Markdown 写作台** — 桌面端使用 MDEditor 富编辑器，移动端降级为原生 textarea，底部实时显示字符数、段落数、标题层级与预计阅读时长
- **成稿预览** — 切换到预览 tab 可查看接近公众号排版的最终效果，标题、h2/h3、引用块、行内代码均有独立样式
- **Editorial context 卡片** — 标题写入状态、结构统计四格、可发布建议，始终与编辑器共存
- **草稿库** — 持久化存储所有草稿（来源：手动创建 / AI 选题转稿 / 导入），支持状态跟踪（draft → ready → synced）；稿件库页（`/drafts`）以「来源 → 写作台 → 分发」pipeline 行展示全部稿件，支持多选批量删除；写作台侧边草稿面板可快速切换草稿，同样支持编辑模式删除
- **AI 选题工作台** — 手动触发抓取，从 9 个 RSS 数据源拉取 24 小时内容，经标准化 → 聚类 → 多维评分后输出最多 10 条候选题；每条附带研究底稿（事件经过、重要性、影响方、写作切口建议），底稿内嵌原文多张配图及其他来源报道视角
- **一键转稿** — 从工作台直接将研究底稿导入写作台，底稿携带多图和多方视角，继续润色后发布；写作台支持「清空」一键重置编辑器
- **多平台并发发布** — 基于 `Promise.allSettled` 并发执行，支持微信公众号、小红书、知乎、X (Twitter) 四大平台；平台选择器支持全选切换，实时显示已选数量
- **发布进度浮层** — 发布触发后右下角弹出进度浮层，轮询更新各平台状态，无需跳转页面即可跟踪全程
- **同步任务追踪** — 每次发布生成一条同步任务记录，包含各平台进度回执、失败原因、下一步建议（重新授权 / 修复内容 / 打开平台等）；支持重试与手动标记完成
- **平台连接管理** — 设置页统一管理各平台凭证；OAuth 平台支持一键授权跳转，微信 / X 支持凭证验证；保存后自动触发连接验证，连接状态持久化并展示已连接账号名
- **响应式导航** — 桌面端侧边栏，移动端切换为底部 Tab 栏，覆盖写作台、稿件库、AI 选题、分发记录四个核心入口

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript 5（第一方源码统一使用 TypeScript） |
| 前端 | React 19 |
| 样式 | vanilla-extract（零运行时 CSS-in-TypeScript） |
| 状态管理 | Zustand 5 |
| 编辑器 | @uiw/react-md-editor |
| Markdown 解析 | marked 15 |
| 测试 | Vitest + @testing-library/react |
| Twitter SDK | twitter-api-v2 |
| 包管理 | pnpm |

## 项目结构

```
src/
├── app/
│   ├── layout.tsx / layout.css.ts       # 根布局（侧边栏 + 主内容区）
│   ├── page.tsx / page.css.ts           # 写作台：编辑器 + 平台选择 + 发布
│   ├── drafts/
│   │   ├── page.tsx                     # 稿件库页（metadata + 入口）
│   │   ├── DraftsPageClient.tsx         # 稿件库客户端（编辑模式状态）
│   │   └── drafts.page.css.ts           # 稿件库页样式
│   ├── ai-news/
│   │   ├── page.tsx                     # 选题工作台页（SSR metadata）
│   │   └── error.tsx / error.css.ts     # 错误边界
│   ├── settings/
│   │   └── page.tsx / settings.css.ts   # 平台凭据设置页
│   ├── sync-tasks/
│   │   ├── page.tsx / page.css.ts       # 同步任务列表页
│   │   └── [id]/page.tsx / page.css.ts  # 同步任务详情页
│   └── api/
│       ├── ai-news/route.ts             # 新闻聚合 API
│       ├── publish/route.ts             # 批量发布 API
│       ├── settings/route.ts            # 凭据读写 API
│       ├── drafts/route.ts              # 草稿 CRUD API
│       ├── drafts/[id]/route.ts         # 单条草稿操作
│       ├── sync-tasks/route.ts          # 同步任务列表 API
│       ├── sync-tasks/[id]/route.ts     # 任务详情
│       ├── sync-tasks/[id]/retry/       # 重试任务
│       ├── sync-tasks/[id]/mark-done/   # 手动标记完成
│       └── platforms/                   # 各平台路由
│           ├── wechat / xiaohongshu / zhihu / x  # 独立发布路由
│           ├── [platform]/connection/check        # 连接验证
│           ├── [platform]/connection/oauth/start  # OAuth 授权发起
│           ├── [platform]/connection/disconnect   # 断开连接
│           └── connection/records                 # 连接记录列表
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx / Sidebar.css.ts
│   │   ├── SurfaceCard.tsx / SurfaceCard.css.ts
│   │   ├── AppShellHeader.tsx / AppShellHeader.css.ts
│   │   └── PageSection.tsx / PageSection.css.ts
│   ├── editor/
│   │   ├── MarkdownEditor.tsx / editor.css.ts   # MDEditor + 预览区
│   │   ├── DraftPanel.tsx / DraftPanel.css.ts   # 右侧草稿面板（含编辑模式）
│   │   ├── EditorialContextCard.tsx             # 编辑上下文卡片
│   │   └── RecentDraftBar.tsx                   # 最近草稿快速入口（移动端）
│   ├── drafts/
│   │   └── DraftLibraryClient.tsx / drafts.css.ts
│   ├── news/
│   │   ├── AiNewsPageClient.tsx / news.css.ts
│   │   ├── TopicDeskHeader.tsx
│   │   ├── TopicSignalCard.tsx
│   │   └── ScoreBar.tsx / ScoreBar.css.ts       # 评分进度条原子组件
│   ├── publish/
│   │   ├── PlatformSelector.tsx / publish.css.ts
│   │   ├── PlatformPreviewPanel.tsx             # 平台内容预览（可折叠）
│   │   ├── PublishButton.tsx
│   │   ├── PublishProgressOverlay.tsx           # 发布进度浮层（右下角轮询）
│   │   └── PublishStatusPanel.tsx
│   ├── sync/
│   │   ├── SyncTaskList.tsx / SyncTaskDetail.tsx
│   │   ├── SyncTaskRetryButton.tsx
│   │   └── SyncTaskMarkDoneButton.tsx
│   └── icons/
│       └── PlatformIcons.tsx
├── hooks/
│   └── useAutoSave.ts                   # 防抖自动保存（停止输入 1s 触发，自动创建草稿并同步 URL）
├── lib/
│   ├── ai-news/                         # AI 新闻核心模块
│   │   ├── sources.ts                   # RSS 数据源配置（9 个）
│   │   ├── normalize.ts                 # 原始信号标准化
│   │   ├── cluster.ts                   # 话题聚类算法
│   │   ├── score.ts                     # 多维度评分模型
│   │   ├── research.ts                  # 研究底稿生成
│   │   ├── requestTimeout.ts            # 请求超时控制
│   │   ├── articleSnapshot.ts           # 原文快照抓取
│   │   └── index.ts
│   ├── drafts/                          # 草稿持久化
│   │   ├── types.ts / store.ts / client.ts / registry.ts
│   ├── sync/                            # 同步任务
│   │   ├── types.ts / store.ts / registry.ts
│   ├── platformConnections/             # 平台连接管理
│   │   ├── types.ts / index.ts / registry.ts
│   │   ├── profiles.ts                  # 连接状态计算
│   │   ├── checkers.ts                  # 各平台连通性检查
│   │   └── oauthNonce.ts / profiles.ts
│   ├── platformAdapters/                # 平台内容适配
│   │   ├── types.ts / adaptContent.ts
│   ├── publishers/                      # 各平台发布器
│   │   ├── wechat.ts / xiaohongshu.ts / zhihu.ts / x.ts
│   │   ├── executePublish.ts
│   │   └── types.ts
│   ├── storage/                         # 本地数据存储
│   │   ├── jsonFileCollection.ts        # JSON 文件集合抽象
│   │   ├── localDataPath.ts             # 数据目录路径
│   │   └── envFile.ts                   # .env.local 读写
│   ├── markdown.ts                      # Markdown → 风格化 HTML
│   ├── contentStats.ts                  # 字符数 / 段落 / 阅读时长统计
│   ├── publishStatus.ts                 # 发布状态工具函数
│   ├── newsDraft.ts                     # 选题转稿模板与 localStorage 桥接
│   ├── cn.ts                            # className 工具
│   └── config.ts                        # 环境变量读取
├── styles/
│   ├── tokens.css.ts                    # createGlobalTheme 设计 token（颜色 / 圆角 / 字体）
│   └── globals.css.ts                   # globalStyle 全局基础样式
├── stores/
│   └── publishStore.ts                  # Zustand 全局状态
└── types/
    └── index.ts
scripts/
└── dev-safe.ts                          # 开发启动脚本（清理端口 + .next/cache）
```

## AI 选题工作台

访问 `/ai-news` 使用选题工作台。

**工作流程：**

1. 点击「抓取选题」触发抓取（首次进入自动执行一次）
2. 从 9 个 RSS 数据源拉取 **24 小时**内的 AI 行业动态
3. 经标准化 → 话题聚类 → 多维评分 → 多样性过滤，输出最多 **10 条**候选题
4. 每条候选题附带研究底稿，展开可查看事件经过、重要性、影响方、写作切口
5. 点击「加入写作台」将底稿导入编辑器继续润色

**评分维度：**

| 维度 | 权重 | 说明 |
|------|------|------|
| 新鲜度 | 28% | 距今发布时间 |
| 影响力 | 26% | 话题类型 + 实体丰富度 + 来源覆盖 |
| 势头 | 18% | 覆盖量 + 多来源 + 发酵速度 |
| 可信度 | 18% | 官方来源 + 媒体数 + 域名多样性 |
| 视觉就绪 | 10% | 配图数量与质量 |

**RSS 数据源（9 个）：**

36氪、36氪快讯、爱范儿、爱范儿快讯、钛媒体、极客公园、InfoQ 中文、量子位、Import AI

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm

### 安装

```bash
git clone https://github.com/rogerdigital/publio.git
cd publio
pnpm install
```

### 配置

```bash
cp .env.example .env.local
```

填入各平台 API 凭据，也可启动后在设置页通过 UI 配置。

### 启动开发服务器

```bash
pnpm dev
```

`pnpm dev` 会先自动清理残留的 Next.js 开发进程并清空 `.next/cache`，减少热更新卡死与端口占用问题。如需原始启动：

```bash
pnpm run dev:raw
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

### 构建与预览

```bash
pnpm build && pnpm start   # 生产构建
pnpm preview               # 构建 + 启动一步完成
```

### 测试

```bash
pnpm test
```

## TypeScript 约束

- `src/` 与 `scripts/` 下的第一方源码统一使用 TypeScript
- 能用 TypeScript 表达的业务逻辑、工具脚本和测试代码，不新增 JavaScript / CommonJS 源文件
- 生成产物、第三方代码、依赖目录不计入该规则

## 平台配置指南

### 微信公众号

前往 [mp.weixin.qq.com](https://mp.weixin.qq.com/) → 开发 → 基本配置，获取：

- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`

### 小红书

前往 [小红书开放平台](https://open.xiaohongshu.com/) 注册开发者账号并创建应用，获取：

- `XHS_APP_ID` / `XHS_APP_SECRET` / `XHS_ACCESS_TOKEN`

### 知乎

使用浏览器登录知乎后，从开发者工具 Network 面板复制 Cookie：

- `ZHIHU_COOKIE`

### X (Twitter)

前往 [developer.x.com](https://developer.x.com/) 创建项目并生成：

- `X_API_KEY` / `X_API_SECRET` / `X_ACCESS_TOKEN` / `X_ACCESS_TOKEN_SECRET`

## License

[MIT](./LICENSE)
