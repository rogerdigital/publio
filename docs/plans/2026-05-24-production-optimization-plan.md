# Publio 生产级优化计划

> 2026-05-24 — 基于代码审计的系统性优化方案

## 目录

- [一、可强化 / 补充的部分](#一可强化--补充的部分)
  - [1.1 错误边界与容错](#11-错误边界与容错)
  - [1.2 加载状态](#12-加载状态)
  - [1.3 测试覆盖](#13-测试覆盖)
  - [1.4 无障碍访问](#14-无障碍访问)
  - [1.5 性能优化](#15-性能优化)
  - [1.6 安全加固](#16-安全加固)
  - [1.7 类型安全](#17-类型安全)
  - [1.8 多 LLM Provider 支持](#18-多-llm-provider-支持)
  - [1.9 后台调度器](#19-后台调度器)
  - [1.10 多用户与认证](#110-多用户与认证)
- [二、可精简 / 删除的部分](#二可精简--删除的部分)
- [三、UI 页面布局优化](#三ui-页面布局优化)
  - [3.1 侧边栏 / 底部导航](#31-侧边栏--底部导航)
  - [3.2 写作台](#32-写作台)
  - [3.3 AI 新闻页](#33-ai-新闻页)
  - [3.4 稿件库](#34-稿件库)
  - [3.5 设置页](#35-设置页)
  - [3.6 分发记录页](#36-分发记录页)
  - [3.7 Agent 面板](#37-agent-面板)
  - [3.8 设计系统](#38-设计系统)
- [四、优先级与执行顺序](#四优先级与执行顺序)

---

## 一、可强化 / 补充的部分

### 1.1 错误边界与容错

**现状：** 仅 `ai-news/error.tsx` 一个错误边界。无根级 `error.tsx`、`global-error.tsx`、`not-found.tsx`。布局崩溃（Sidebar、Toast）会导致全站白屏。

**优化项：**

| # | 任务 | 说明 |
|---|------|------|
| 1.1.1 | 添加 `src/app/global-error.tsx` | 捕获 layout 级崩溃，提供"刷新页面"恢复路径 |
| 1.1.2 | 添加 `src/app/error.tsx` | 根级错误边界，覆盖所有未单独处理的页面 |
| 1.1.3 | 添加 `src/app/not-found.tsx` | 品牌化 404 页面，引导用户回首页或稿件库 |
| 1.1.4 | 为每个主要页面添加 `error.tsx` | 至少覆盖：`/drafts`、`/settings`、`/sync-tasks`、`/sync-tasks/[id]` |
| 1.1.5 | 修复 2 个缺少 try/catch 的 API 路由 | `api/export/route.ts`、`api/sync-tasks/route.ts` |
| 1.1.6 | 修复 publish fire-and-forget 吞错误问题 | `api/publish/route.ts` 的 detached promise 需要错误上报机制（写入 sync task event log） |
| 1.1.7 | 修复 `upload/route.ts` 混淆 400/500 | 区分客户端错误（400）和服务端错误（500） |

### 1.2 加载状态

**现状：** 全应用零个 `loading.tsx`。路由切换无骨架屏，`Suspense fallback={null}` 渲染空白。

**优化项：**

| # | 任务 | 说明 |
|---|------|------|
| 1.2.1 | 为每个路由添加 `loading.tsx` | 使用已有的 `Skeleton` 组件（`src/components/feedback/Skeleton.tsx`），按页面结构做骨架屏 |
| 1.2.2 | 替换首页 `Suspense fallback={null}` | 改为编辑器骨架屏（标题占位 + 内容区占位） |
| 1.2.3 | 为动态导入的组件添加 loading 状态 | `MarkdownEditor` 的 placeholder 从纯色块改为骨架屏 |

### 1.3 测试覆盖

**现状：** 50+ 单元/集成测试存在，但 Playwright 已安装却无 E2E 测试。无覆盖率配置。

**优化项：**

| # | 任务 | 说明 |
|---|------|------|
| 1.3.1 | 配置 Vitest coverage | 添加 `@vitest/coverage-v8`，设置阈值（建议 lib/ 80%） |
| 1.3.2 | 编写核心流程 E2E 测试 | 用 Playwright 覆盖：写作→保存→发布、AI 新闻→选题→草稿、设置页配置 |
| 1.3.3 | 补充发布流程集成测试 | mock 各平台 API，测试 executePublish 的成功/失败/部分失败路径 |
| 1.3.4 | 补充 Agent 聊天集成测试 | 测试 SSE 流式消费、中断、重试 |

### 1.4 无障碍访问

**现状：** 部分 aria 属性存在，但缺少 skip-nav、focus trap、icon button 无障碍名称。

**优化项：**

| # | 任务 | 说明 |
|---|------|------|
| 1.4.1 | 添加 skip-to-content 链接 | 在 `layout.tsx` 的 `<main>` 前添加，键盘用户可跳过侧边栏 |
| 1.4.2 | 为所有 icon-only 按钮添加 `aria-label` | 至少涉及 `page-client.tsx` 的 Eye/Files/SquarePen/Eraser/History 等 |
| 1.4.3 | 为 modal/overlay 添加 focus trap | `PublishProgressOverlay`、`ShortcutCheatSheet` 需要焦点捕获和恢复 |
| 1.4.4 | 添加 `aria-expanded` 到可折叠区域 | `DraftPanel`、`VersionHistory`、设置页手风琴 |
| 1.4.5 | 替换自定义 checkbox 为原生 `<input type="checkbox">` | 稿件库编辑模式的 CSS-only checkbox 缺乏键盘/屏幕阅读器支持 |

### 1.5 性能优化

**现状：** 仅 1 个动态导入；无 `next/image`；同步文件系统读取阻塞事件循环；内存缓存无上限。

**优化项：**

| # | 任务 | 说明 |
|---|------|------|
| 1.5.1 | 动态导入重型组件 | `AgentPanel`、`PlatformPreviewPanel`、`DraftLibraryClient`、`CalendarPageClient` 等按需加载 |
| 1.5.2 | 引入 `next/image` | 配置 `remotePatterns`，用于上传图片、RSS 文章快照图、平台预览 |
| 1.5.3 | 将同步 fs 调用改为异步 | `readdirSync`→`readdir`、`statSync`→`stat`、`readFileSync`→`readFile`，涉及 uploads 和 settings 路由 |
| 1.5.4 | 给内存缓存加 LRU 上限 | `src/lib/cache.ts` 的 `Map` 改为有 maxSize 的 LRU cache（建议 500 条目） |
| 1.5.5 | 移除 `X-Powered-By` header | `next.config.ts` 添加 `poweredByHeader: false` |
| 1.5.6 | 配置 bundle analyzer | 添加 `@next/bundle-analyzer`，定期检查包大小 |

### 1.6 安全加固

**现状：** 基础安全措施到位（localhost 限制、安全头、输入验证），但无速率限制、CSP 允许 unsafe-inline/eval。

**优化项：**

| # | 任务 | 说明 |
|---|------|------|
| 1.6.1 | 添加 API 速率限制 | 用简单的内存令牌桶，限制单 IP 每分钟请求数（agent 端点 10 次/min，其他 60 次/min） |
| 1.6.2 | 收紧 CSP | 移除 `unsafe-eval`（检查是否真需要）；`unsafe-inline` 可通过 nonce 替代 |
| 1.6.3 | 添加 CSRF 保护 | 为 POST/PUT/PATCH/DELETE 端点添加 CSRF token 校验（可用 Next.js built-in 或 double-submit cookie） |
| 1.6.4 | 审计 `dangerouslySetInnerHTML` | 确认 `WeChatArticlePreview` 的输入经过 `sanitize-html` 处理 |
| 1.6.5 | 设置页写入 `.env.local` 增加二次确认 | 防止误操作写入敏感配置 |

### 1.7 类型安全

**现状：** 7 处 `as any` 强转（全部在 PATCH handler 和 markdown.ts），绕过类型检查。

**优化项：**

| # | 任务 | 说明 |
|---|------|------|
| 1.7.1 | 为 PATCH handler 定义 `Partial<T>` 更新类型 | 替换 `input as any` 为 `Partial<Draft>` / `Partial<Signal>` 等 |
| 1.7.2 | 为 `marked` token 树定义类型 | 替换 `any[]` 为 `marked.Token[]`，利用 marked 的内置类型 |
| 1.7.3 | 引入 zod 做运行时验证 | 替换手写的 `typeof` 检查，API 输入验证更可靠 |

### 1.8 多 LLM Provider 支持

**现状：** 仅 `createOpenAIProvider` 一个实现。`LLMProvider` 接口已抽象，但未接入其他厂商。

**优化项：**

| # | 任务 | 说明 |
|---|------|------|
| 1.8.1 | 添加 Anthropic provider | 实现 `createAnthropicProvider`，支持 Claude 系列模型 |
| 1.8.2 | 添加 Ollama 本地 provider | 实现 `createOllamaProvider`，支持本地模型推理 |
| 1.8.3 | 设置页 Provider 选择器 | 允许用户选择 provider 类型，动态切换底层实现 |
| 1.8.4 | Provider 健康检查 | 在 Agent 状态端点（`/api/agent/status`）中检测当前 provider 可用性 |

### 1.9 后台调度器

**现状：** 无定时任务。RSS 拉取是请求驱动，用户不访问选题页则数据不更新。

**优化项：**

| # | 任务 | 说明 |
|---|------|------|
| 1.9.1 | 实现轻量级任务调度器 | 基于 `setInterval` 的进程内调度器，支持注册定时任务 |
| 1.9.2 | 定时 RSS 拉取 | 每 30 分钟自动拉取 RSS 并更新信号库 |
| 1.9.3 | 定时发布状态轮询 | 已提交但未确认的发布任务，自动轮询平台状态 |
| 1.9.4 | 调度器状态暴露 | 在设置页或状态端点展示调度器运行状态和下次执行时间 |

### 1.10 多用户与认证

**现状：** 无认证层。所有 API 路由仅靠 localhost 限制保护。JSON 文件存储不可水平扩展。

**优化项：**

| # | 任务 | 说明 |
|---|------|------|
| 1.10.1 | 添加基础认证 | 支持密码登录或邀请码模式，保护 API 路由 |
| 1.10.2 | Session 管理 | 用 cookie-based session 替代纯 localhost 信任 |
| 1.10.3 | 可选：SQLite 数据库层 | 为多用户场景准备，用 better-sqlite3 替代 JSON 文件存储 |
| 1.10.4 | API 路由鉴权中间件 | 统一的 auth middleware，替代分散的 localhost 检查 |

> 注：1.10 是长期方向，当前单用户本地工具可暂不推进。优先级最低。

---

## 二、可精简 / 删除的部分

| # | 项目 | 位置 | 原因 |
|---|------|------|------|
| 2.1 | 未使用的 `searchBox` / `searchPlaceholder` 样式 | `Sidebar.css.ts` L100-106 | `display: none` 的死代码，已计划但未实现的搜索功能 |
| 2.2 | 未使用的 SurfaceCard 颜色变体 | `SurfaceCard.css.ts` | `purple`/`cream`/`lime` 变体与 `default` 样式相同，是占位符 |
| 2.3 | 未使用的 design token 占位色 | `tokens.css.ts` | `cardPurple`/`cardCream`/`cardLime`/`cardPurpleSoft` 在 light/dark 模式下都是 `#FFFFFF`/`#252525` |
| 2.4 | 未使用的 Playwright 依赖 | `package.json` | 已安装但无 E2E 测试。如果短期内不写 E2E 测试，可移除减小 devDependencies |
| 2.5 | 重复的 filter chip 模式 | 稿件库 / 分发记录页 | 两处各自实现了一套 filter chip，可抽取为共享的 `FilterChipGroup` 组件 |
| 2.6 | Settings 页 `renderCheckResult` 复杂条件逻辑 | `settings/page.tsx` L253-292 | 过于复杂的嵌套三元表达式，应拆为独立组件 |
| 2.7 | 硬编码的 `57px` tab bar 高度 | `layout.css.ts` L22 | 改为 CSS custom property `--tab-bar-height`，在 Sidebar 中设置 |
| 2.8 | 硬编码的标题截断长度 `24` | `DraftLibraryClient.tsx` L441 | 改为 CSS `text-overflow: ellipsis` 或按字符宽度自适应 |

---

## 三、UI 页面布局优化

### 3.1 侧边栏 / 底部导航

**问题：**
- 移动端底部 tab bar 7 个项目太拥挤，10px 标签几乎不可读
- 折叠态有 tooltip，展开态和移动端无 tooltip
- 搜索功能已预留样式但未实现

**优化方案：**

| # | 任务 | 说明 |
|---|------|------|
| 3.1.1 | 移动端 tab bar 精简为 5 项 | 保留：选题台、写作台、稿件库、分发记录、更多（折叠设置/分析/日历到二级菜单） |
| 3.1.2 | 移动端 tab 标签字号从 10px 提升到 11px | 提高可读性 |
| 3.1.3 | 实现全局搜索 | 启用 Sidebar 中已预留的搜索入口，搜索稿件标题 + 内容 + 标签 |
| 3.1.4 | 侧边栏展开态添加 tooltip 延迟消失 | 避免快速划过时 tooltip 闪烁 |

### 3.2 写作台

**问题：**
- 移动端隐藏了整个右侧面板（发布控件），**无法在手机上发布**
- AgentPanel 内联出现会推挤编辑器布局
- "清除"按钮用双击确认 + 3 秒超时，交互不直觉
- 移动端看不到自动保存状态

**优化方案：**

| # | 任务 | 说明 |
|---|------|------|
| 3.2.1 | 移动端添加"发布"浮动按钮 | 在编辑器底部固定一个 FAB，点击展开平台选择 + 发布流程 |
| 3.2.2 | AgentPanel 改为抽屉/overlay 模式 | 移动端从底部滑出，桌面端作为侧边 overlay 而非推挤编辑器 |
| 3.2.3 | "清除"按钮改为确认弹窗 | 用标准的 modal confirm 替代双击模式 |
| 3.2.4 | 移动端保存状态移到编辑器 header | 在标题栏旁显示"已保存" / "保存中..." |
| 3.2.5 | 编辑器骨架屏优化 | 动态导入 MarkdownEditor 时显示内容区骨架而非纯色块 |

### 3.3 AI 新闻页

**问题：**
- 移动端隐藏了评分条和指标，信息密度降低
- 深度研究的 SSE 流错误被静默跳过
- `topicDraftMap` 存 localStorage 可能与实际草稿不同步

**优化方案：**

| # | 任务 | 说明 |
|---|------|------|
| 3.3.1 | 移动端简化评分展示 | 用单个综合分数字替代六维条形图，点击展开详情 |
| 3.3.2 | SSE 流错误添加用户提示 | 解析失败时显示 toast 而非静默跳过 |
| 3.3.3 | topicDraftMap 与草稿库同步 | 进入页面时校验 localStorage 中的草稿 ID 是否仍存在 |
| 3.3.4 | 添加"全部标为已读"操作 | 资讯 Inbox 批量操作，减少逐条处理的摩擦 |

### 3.4 稿件库

**问题：**
- 无分页/虚拟滚动，全部草稿一次加载
- 搜索仅客户端过滤，大库时性能差
- Pipeline 视图信息密度高，新用户可能困惑
- 标题截断硬编码 24 字符

**优化方案：**

| # | 任务 | 说明 |
|---|------|------|
| 3.4.1 | 添加分页或无限滚动 | 每次加载 20 条，滚动到底部加载更多 |
| 3.4.2 | 搜索改为服务端过滤 | 新增 `/api/drafts/search?q=` 端点 |
| 3.4.3 | 添加列表/卡片视图切换 | Pipeline 视图保持为默认，增加简洁列表视图选项 |
| 3.4.4 | 标题截断改为 CSS ellipsis | 移除硬编码字符数，用 `text-overflow: ellipsis` + `max-width` |

### 3.5 设置页

**问题：**
- 页面过长，无段内导航
- AI Agent 和 GitHub 图片托管段始终展开，打破手风琴一致性
- 保存按钮在顶部，改完底部配置需滚回顶部
- 无表单验证

**优化方案：**

| # | 任务 | 说明 |
|---|------|------|
| 3.5.1 | 添加段内锚点导航 | 顶部 sticky 的 section tabs（平台连接 / AI Agent / 图片托管 / RSS / 品牌 / 样式） |
| 3.5.2 | 统一手风琴模式 | AI Agent 和 GitHub 段也改为可折叠 |
| 3.5.3 | 浮动保存按钮 | 底部固定一个"保存设置"按钮，修改后自动出现 |
| 3.5.4 | 添加表单验证 | 必填字段标记、URL 格式校验、API key 非空校验 |
| 3.5.5 | 平台连接状态仪表盘 | 在设置页顶部展示所有平台连接状态的概览卡片 |

### 3.6 分发记录页

**问题：**
- 列表页无搜索
- 详情页 404 用通用页面而非上下文提示
- Filter chip 模式与稿件库重复但不一致

**优化方案：**

| # | 任务 | 说明 |
|---|------|------|
| 3.6.1 | 添加搜索 | 按稿件标题搜索分发记录 |
| 3.6.2 | 详情页 404 改为上下文提示 | "该分发记录不存在或已删除" + 返回链接 |
| 3.6.3 | 抽取共享 FilterChipGroup | 统一稿件库和分发记录的 filter chip 实现 |

### 3.7 Agent 面板

**问题：**
- 内联模式推挤编辑器
- textarea 固定 1 行，不自动扩展
- AI 输出为纯文本，无 Markdown 渲染
- 无自动滚动到最新内容
- 聊天历史不持久化

**优化方案：**

| # | 任务 | 说明 |
|---|------|------|
| 3.7.1 | 改为 overlay/drawer 模式 | 参考 3.2.2 |
| 3.7.2 | textarea 自适应高度 | 根据内容行数自动扩展，最大 6 行 |
| 3.7.3 | AI 输出渲染 Markdown | 复用 `marked` 做轻量渲染（标题、粗体、列表、代码块） |
| 3.7.4 | 自动滚动到底部 | 新 token 到达时，若用户未手动上滚则自动 scrollToEnd |
| 3.7.5 | 可选：聊天历史持久化 | 存 sessionStorage（已有基础），刷新后恢复最近一次对话 |

### 3.8 设计系统

**问题：**
- 单色 accent（黑/白），缺乏品牌辨识度
- 占位颜色 token 未生效
- 间距 scale 缺少 36px 步长

**优化方案：**

| # | 任务 | 说明 |
|---|------|------|
| 3.8.1 | 引入品牌色 | 从现有 `#D97757`（accent orange，已在 CLAUDE.md 中提到）扩展为完整的交互色阶（hover/active/focus ring） |
| 3.8.2 | 清理未使用的颜色 token | 删除或实现 `cardPurple`/`cardCream`/`cardLime`/`cardPurpleSoft` |
| 3.8.3 | 补全间距 scale | 添加 36px 步长，替换组件中的硬编码 `28px` 值 |
| 3.8.4 | 减少 glass-morphism 使用 | 对低端设备，用纯色 + 微弱阴影替代 `backdrop-filter: blur(20px)`，通过 `@media (prefers-reduced-motion)` 或性能检测降级 |

---

## 四、优先级与执行顺序

### Phase 1 — 安全与稳定性（1-2 周）

这是"不做就有风险"的部分。

```
1.1.1  global-error.tsx
1.1.2  根级 error.tsx
1.1.3  not-found.tsx
1.1.5  修复缺失 try/catch 的 API 路由
1.1.6  修复 publish fire-and-forget
1.1.7  修复 upload 状态码
1.6.1  API 速率限制
1.7.1  消除 as any
1.7.2  marked 类型化
```

### Phase 2 — 用户体验基础（2-3 周）

让现有功能真正可用、好看。

```
1.2.1  各路由 loading.tsx
1.2.2  Suspense fallback
3.2.1  移动端发布按钮
3.2.2  AgentPanel overlay 模式
3.2.3  清除按钮确认弹窗
3.1.1  移动端 tab bar 精简
3.4.4  标题截断 CSS 化
3.8.1  品牌色引入
```

### Phase 3 — 功能增强（3-4 周）

扩展能力边界。

```
1.8.1  Anthropic provider
1.8.3  Provider 选择器
1.9.1  轻量任务调度器
1.9.2  定时 RSS 拉取
3.5.1  设置页锚点导航
3.5.3  浮动保存按钮
3.4.1  稿件库分页
3.4.3  列表/卡片视图切换
3.7.3  Agent 输出 Markdown 渲染
```

### Phase 4 — 质量与可维护性（持续）

随开发迭代持续推进。

```
1.3.1  覆盖率配置
1.3.2  E2E 测试
1.3.3  发布流程测试
1.4.1  skip-to-content
1.4.2  icon button aria-label
1.4.3  focus trap
1.5.1  动态导入重型组件
1.5.3  异步 fs
1.6.2  收紧 CSP
1.6.3  CSRF 保护
1.10.x 多用户认证（长期）
```

---

> **原则：** 每个 Phase 结束后跑 `pnpm verify`（lint + test + build）确认无回归。改动只触碰必要范围，不顺手重构。
