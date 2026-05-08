# Publio 全面改造计划书

> 覆盖 6 个维度（产品立意、功能完整度、项目架构、代码质量、UI 界面、交互设计），排除扩展新平台。
> 每个 PR 可独立合入 main，不破坏现有功能。

## 目标

将 Publio 从"能用的多平台分发工具"升级为"AI-native 内容运营平台"——全链路 AI 渗透、发布闭环、设计系统化、工程规范完善。

---

## Phase 0: 基础设施与工程化（4 个 PR）

> 先夯实基础，后续所有 PR 都受益。

### PR-01: 添加 Prettier + Husky + lint-staged

**标题**: `chore: add prettier, husky, and lint-staged for code quality enforcement`

**涉及文件**:
- `.prettierrc` (新建)
- `.prettierignore` (新建)
- `package.json` (添加 scripts + devDependencies)
- `.husky/pre-commit` (新建)
- `lint-staged.config.ts` (新建)
- 全量格式化一次 (单独 commit)

**改动描述**:
- 安装 `prettier`、`husky`、`lint-staged`
- `.prettierrc` 配置：单引号、尾逗号、100 字宽、2 空格缩进
- `lint-staged` 配置：`*.{ts,tsx}` 跑 prettier + eslint --fix，`*.css.ts` 跑 prettier
- husky pre-commit hook 触发 lint-staged
- `package.json` 添加 `"format": "prettier --write ."` script

**依赖**: 无

**验证方式**:
- `pnpm format` 能跑通
- `git commit` 自动触发 lint-staged
- `pnpm lint` 无新增报错

---

### PR-02: 清理未使用依赖 + 确认 bundle 安全

**标题**: `chore: remove unused eventsource-parser, verify twitter-api-v2 server-only`

**涉及文件**:
- `package.json` (移除 eventsource-parser)
- `pnpm-lock.yaml` (自动更新)
- `next.config.ts` (如需配置 serverExternalPackages)

**改动描述**:
- 移除 `eventsource-parser`（`useAgentStream` 中手写了解析，未使用此包）
- 确认 `twitter-api-v2` 仅在 `src/lib/publishers/x.ts`（API route）中使用，未泄漏到 client bundle
- 如有泄漏风险，在 `next.config.ts` 的 `serverExternalPackages` 中添加

**依赖**: 无

**验证方式**:
- `pnpm build` 成功
- `pnpm build` 输出中检查 client bundle 不含 twitter-api-v2
- `pnpm dev` 功能正常（X 平台发布流程）

---

### PR-03: types/index.ts 按模块拆分

**标题**: `refactor: split types/index.ts into domain-specific type modules`

**涉及文件**:
- `src/types/index.ts` (瘦身，只保留 re-export)
- `src/types/platform.ts` (新建 — PlatformId, Platform, PLATFORMS)
- `src/types/publish.ts` (新建 — PublishRequest, PublishStatus, PlatformPublishResult 等)
- `src/types/draft.ts` (新建 — Draft 相关类型，从其他文件迁入)
- `src/types/agent.ts` (新建 — Agent 相关类型，如需从 lib/agent/types.ts 整合)
- 所有 import `@/types` 的文件更新路径

**改动描述**:
- 按领域拆分：platform、publish、draft、agent
- `types/index.ts` 保留 re-export 确保向后兼容（`export * from './platform'` 等）
- 逐步迁移 import 到具体模块（可在后续 PR 中渐进完成）

**依赖**: 无

**验证方式**:
- `pnpm build` 无类型错误
- `pnpm lint` 通过
- 所有现有 import 路径仍可用（re-export 兼容）

---

### PR-04: 新增内容安全模块骨架

**标题**: `feat: add content moderation module with sensitive word filter`

**涉及文件**:
- `src/lib/moderation/` (新建目录)
- `src/lib/moderation/types.ts` — ModerationResult, SensitiveMatch
- `src/lib/moderation/sensitiveWords.ts` — 内置敏感词库（政治/色情/暴恐/广告法违禁词）
- `src/lib/moderation/check.ts` — `checkContent(text): ModerationResult`
- `src/lib/moderation/__tests__/check.test.ts` — 单元测试

**改动描述**:
- 敏感词匹配用 AC 自动机或简单正则（MVP 用正则，后续可升级）
- 返回结构化结果：`{ passed: boolean, matches: { word, category, position }[] }`
- 提供 `maskContent(text)` 替换敏感词为 `*`
- 不接入 UI，仅库代码 + 测试

**依赖**: 无

**验证方式**:
- 单元测试覆盖：命中敏感词、无敏感词、空文本、特殊字符
- `pnpm test` 通过

---

## Phase 1: 架构优化与性能（4 个 PR）

> 解决性能隐患，为后续功能扩展打基础。

### PR-05: MarkdownEditor 懒加载

**标题**: `perf: lazy load MarkdownEditor to reduce initial bundle size`

**涉及文件**:
- `src/app/page.tsx` (或拆分后的客户端组件)
- 可能新建 `src/components/editor/MarkdownEditorWrapper.tsx`

**改动描述**:
- 用 `dynamic(() => import('@/components/editor/MarkdownEditor'), { ssr: false, loading: () => <EditorSkeleton /> })` 替代直接 import
- 添加 EditorSkeleton 占位组件（简单的灰块动画）
- 评估是否需要 `loading` 状态（编辑器是页面核心，可能需要立即显示）

**依赖**: PR-01（代码格式一致）

**验证方式**:
- `pnpm build` 后检查 `.next/static/chunks` 中编辑器相关 chunk 独立分离
- 页面加载速度感知提升
- 编辑器功能正常（输入、预览、slash commands）

---

### PR-06: page.tsx 拆分 Server/Client Component

**标题**: `refactor: split page.tsx into Server and Client Components`

**涉及文件**:
- `src/app/page.tsx` (改为 Server Component，只做布局 + 数据准备)
- `src/app/page-client.tsx` (新建，'use client'，承载所有交互逻辑)
- `src/app/page.css.ts` (保持不变)

**改动描述**:
- `page.tsx` 移除 `'use client'`，改为 Server Component
- 静态部分（AppShellHeader 壳、页面 metadata）留在 Server Component
- 交互部分提取到 `page-client.tsx`（use client），page.tsx 中 `<Suspense>` 包裹引入
- 评估 `EditorialContextCard` 等纯展示组件是否可保持 Server Component

**依赖**: PR-05（MarkdownEditor 已懒加载，拆分更清晰）

**验证方式**:
- `pnpm build` 成功
- React DevTools 中确认 Server/Client 边界
- 所有功能正常：编辑、发布、AI、草稿管理

---

### PR-07: syncPlatformDrafts 性能优化

**标题**: `perf: debounce platform draft sync with useDeferredValue`

**涉及文件**:
- `src/stores/publishStore.ts`
- `src/app/page-client.tsx`（或 page.tsx）

**改动描述**:
- `syncPlatformDrafts` 当前随 title/content 变化立即触发，每次按键重算所有平台适配
- 方案 A（推荐）：在调用侧用 `useDeferredValue(content)` 延迟触发
- 方案 B：在 store 中添加 debounce 逻辑（300ms）
- 评估 `platformDrafts` 是否需要 memo（如果适配计算重，用 `useMemo` 包裹）

**依赖**: PR-06（拆分后更容易在 Client Component 中加 hook）

**验证方式**:
- 快速连续输入时，平台预览区不卡顿
- 预览内容最终正确更新
- React Profiler 中确认重渲染次数减少

---

### PR-08: researchCache TTL 清理

**标题**: `fix: add TTL cleanup to agentStore researchCache`

**涉及文件**:
- `src/stores/agentStore.ts`

**改动描述**:
- `researchCache` 当前为 `Map<string, ResearchResult>`，无清理机制
- 添加 TTL（30 分钟），每次访问检查过期
- 添加 LRU 上限（如 50 条），超过时淘汰最旧
- 可选：页面 visibilitychange 时清理过期缓存

**依赖**: 无

**验证方式**:
- 写入缓存 → 等待 TTL → 访问返回 undefined
- 超过 LRU 上限时最旧条目被淘汰
- `pnpm test` 通过

---

## Phase 2: UI 设计系统（4 个 PR）

> 建立系统化的设计 token，修复可访问性问题。

### PR-09: 提取 spacing + typography token

**标题**: `design: extract spacing and typography tokens`

**涉及文件**:
- `src/styles/tokens.css.ts` (添加 spacing、fontSize、lineHeight)
- 各组件 `.css.ts` 文件（逐步替换魔法数字）

**改动描述**:
- 添加 spacing token：`{ xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px', '2xl': '24px', '3xl': '32px', '4xl': '40px' }`
- 添加 fontSize token：`{ xs: '12px', sm: '13px', base: '15px', lg: '16px', xl: '18px', '2xl': '20px', '3xl': '24px', '4xl': '28px' }`
- 添加 lineHeight token：`{ tight: '1.25', base: '1.5', relaxed: '1.75' }`
- 添加 radius：`{ sm: '4px', md: '6px' }` 补全缺失档位
- 第一批替换：高频使用的组件（Layout、Editor、Publish 相关）

**依赖**: PR-01

**验证方式**:
- 视觉对比：改动前后 UI 无像素级差异（或仅微小改善）
- `tokens.css.ts` 中新 token 类型安全
- Storybook/页面中各组件间距一致

---

### PR-10: 色彩对比度修复

**标题**: `a11y: fix color contrast to meet WCAG AA 4.5:1`

**涉及文件**:
- `src/styles/tokens.css.ts`
- 使用 `textMuted` 的组件 `.css.ts`

**改动描述**:
- 当前 `textMuted: '#6B6860'` on `bg: '#F5F4F0'` 对比度约 3.9:1，未达 WCAG AA 4.5:1
- 亮色主题：`textMuted` 调整为 `#5C5952` 或更深（目标 4.5:1+）
- 暗色主题：`textMuted: '#9a9a9a'` on `bg: '#1a1a1e'` 已达标，无需改
- 同时检查 `accent (#D97757)` 在白色背景上的对比度（小号文字需 4.5:1，大号需 3:1）

**依赖**: PR-09（统一在 token 层修改）

**验证方式**:
- WebAIM Contrast Checker 验证所有 text/bg 组合达标
- 视觉审查：muted 文字仍保持"减弱"视觉效果，但可读性提升

---

### PR-11: 暗色主题切换机制生效

**标题**: `feat: implement dark theme toggle with system preference detection`

**涉及文件**:
- `src/components/layout/ThemeToggle.tsx` (新建或修改)
- `src/app/layout.tsx` (添加 ThemeProvider 逻辑)
- `src/hooks/useTheme.ts` (新建)
- `src/styles/tokens.css.ts` (darkTheme 已存在，确认可用)

**改动描述**:
- `useTheme` hook：读取 localStorage preference → 系统 preference → 默认 light
- `<html>` 标签动态切换 `data-theme="dark"` 或 class
- ThemeToggle 组件：三态切换（light / dark / system）
- 持久化到 localStorage
- CSS 变量自动切换（vanilla-extract 的 `createTheme` 已支持）

**依赖**: PR-10（色彩 token 已调好）

**验证方式**:
- 手动切换 light/dark/system，所有页面颜色正确
- 系统偏好变化时自动跟随（system 模式）
- 刷新后保持上次选择
- 无 flash of wrong theme（FOWT）

---

### PR-12: 键盘导航与 a11y 修复

**标题**: `a11y: fix keyboard navigation and ARIA attributes`

**涉及文件**:
- `src/components/editor/SlashCommandMenu.tsx` — 添加 `role="listbox"`, `role="option"`, 键盘上下选择
- 各按钮组件 — 添加 `aria-label`（仅有 `title` 的按钮）
- `src/components/publish/PlatformSelector.tsx` — 确认 `srOnly` + 键盘可达
- `src/components/publish/PublishButton.tsx` — 确认 disabled 状态有 `aria-disabled`
- MarkdownEditor 预览区 — 添加 `role="region"` + `aria-label`

**改动描述**:
- SlashCommandMenu：`role="listbox"`, 每个选项 `role="option"`, `aria-selected`, 上下箭头导航, Enter 选择
- 全局审查按钮：仅有 `title` 的添加 `aria-label`
- 确保所有交互元素可通过 Tab 到达
- 跳过链接（skip-to-content）添加

**依赖**: 无

**验证方式**:
- 仅用键盘完成完整发布流程
- Chrome Lighthouse Accessibility 评分提升
- axe DevTools 无 critical/serious 级别问题

---

## Phase 3: 功能核心 P0（4 个 PR）

> 补齐"分发工具"核心闭环：定时 → 安全 → 发布 → 追踪。

### PR-13: 敏感词过滤接入发布流程

**标题**: `feat: integrate content moderation into publish flow`

**涉及文件**:
- `src/app/api/publish/route.ts` — 发布前调用 checkContent
- `src/components/publish/PublishButton.tsx` — 展示敏感词警告弹窗
- `src/components/publish/ModerationWarning.tsx` (新建)
- `src/stores/publishStore.ts` — 添加 moderationResult 状态

**改动描述**:
- 发布 API route 中，发布前调用 `checkContent(title + content)`
- 命中敏感词时返回结构化警告（不阻断，让用户选择继续或修改）
- PublishButton 点击后先检查 → 如有敏感词弹出 ModerationWarning 弹窗
- 弹窗展示命中词、类别、位置，提供"继续发布"和"返回修改"两个选项
- 可选：`maskContent()` 一键替换敏感词

**依赖**: PR-04（moderation 模块）

**验证方式**:
- 发布含敏感词内容 → 弹出警告
- 选择"继续发布"→ 正常发布
- 选择"返回修改"→ 回到编辑器，高亮敏感词位置
- 无敏感词内容 → 正常发布无弹窗

---

### PR-14: 定时发布后端实现

**标题**: `feat: implement scheduled publish with cron-based execution`

**涉及文件**:
- `src/lib/scheduler/` (新建目录)
- `src/lib/scheduler/types.ts` — ScheduledJob
- `src/lib/scheduler/store.ts` — JSON 文件持久化定时任务
- `src/lib/scheduler/executor.ts` — 定时检查 + 执行发布
- `src/app/api/scheduler/route.ts` — GET（列表）/ POST（创建）/ DELETE（取消）
- `src/components/publish/SchedulePicker.tsx` — 对接后端 API
- `src/stores/publishStore.ts` — scheduledAt 字段

**改动描述**:
- 定时任务存储：`{ id, draftId, platforms, scheduledAt, status, createdAt }`
- 执行器：Next.js 的 `unstable_after` 或 setInterval 轮询（MVP 用 setInterval，每分钟检查）
- 到达时间时调用 `executePublish` 流程
- SchedulePicker UI 对接后端：选择时间 → POST 创建任务 → 显示"已预约"状态
- 支持取消定时发布

**依赖**: PR-13（发布流程已集成安全检查）

**验证方式**:
- 设置 2 分钟后发布 → 等待 → 自动执行发布
- 取消定时任务 → 不再执行
- 分发记录页显示"定时发布"标签
- 服务重启后定时任务恢复（持久化到文件）

---

### PR-15: 发布后数据回收

**标题**: `feat: add post-publish metrics collection and analytics dashboard`

**涉及文件**:
- `src/lib/metrics/` (新建目录)
- `src/lib/metrics/types.ts` — PlatformMetrics（阅读量、点赞、评论、转发）
- `src/lib/metrics/collectors/wechat.ts` — 微信数据接口
- `src/lib/metrics/collectors/x.ts` — X 数据接口
- `src/lib/metrics/collectors/zhihu.ts` — 知乎数据接口
- `src/lib/metrics/collectors/xiaohongshu.ts` — 小红书数据接口
- `src/app/api/metrics/[taskId]/route.ts` — 获取某任务的全平台数据
- `src/app/api/metrics/route.ts` — 聚合数据 + 趋势
- `src/components/analytics/` (新建目录)
- `src/components/analytics/MetricsCard.tsx` — 单篇数据卡片
- `src/components/analytics/AnalyticsDashboard.tsx` — 数据看板
- `src/app/analytics/page.tsx` — 数据看板页面
- `src/components/layout/Sidebar.tsx` — 添加导航入口
- `src/lib/sync/types.ts` — SyncTask 添加 metrics 字段

**改动描述**:
- 各平台 collector：调用平台 API 获取已发布内容的互动数据
- 数据存储：复用 JSON 文件，每个 SyncTask 附带 metrics 快照
- 定时刷新：发布后 1h/6h/24h/7d 自动拉取（或手动刷新）
- 数据看板：总览（所有发布内容的汇总数据）+ 单篇详情
- MetricsCard：阅读量、点赞、评论、转发，趋势图（简单 sparkline）

**依赖**: PR-14（定时发布完成后可自动触发数据回收）

**验证方式**:
- 已发布内容显示各平台数据
- 手动刷新按钮可用
- 数据看板页显示汇总趋势
- 各平台 collector 单元测试

---

### PR-16: 平台适配规则校验

**标题**: `feat: add platform content validation before publish`

**涉及文件**:
- `src/lib/platformRules/` (新建目录)
- `src/lib/platformRules/types.ts` — ValidationResult, PlatformRule
- `src/lib/platformRules/rules.ts` — 各平台规则定义（字数、图片数、标题格式）
- `src/lib/platformRules/validate.ts` — `validateForPlatform(content, platformId)`
- `src/components/publish/PlatformPreviewPanel.tsx` — 展示校验结果
- `src/components/publish/ValidationBadge.tsx` (新建) — 通过/警告/错误标识

**改动描述**:
- 规则定义：
  - 微信：标题 ≤64 字，正文 ≤20000 字，需封面图
  - 小红书：正文 ≤1000 字（纯文本），图片 ≤9 张
  - 知乎：标题 ≤50 字，正文无硬限制但建议 ≤10000 字
  - X：单条 ≤280 字，Thread ≤25 条
- 校验结果：`{ passed, warnings: [], errors: [] }`
- PlatformPreviewPanel 中每个平台卡片显示校验状态图标
- 发布前强制校验，有 error 时阻断

**依赖**: 无

**验证方式**:
- 超字数内容 → 平台卡片显示警告
- 有 error 时 PublishButton disabled
- 各平台规则边界值测试

---

## Phase 4: 功能增强 P1（5 个 PR）

> 深化平台适配 + AI 能力增强。

### PR-17: 小红书图文笔记支持

**标题**: `feat: support image-text notes for Xiaohongshu`

**涉及文件**:
- `src/lib/publishers/xiaohongshu.ts` — 添加图片上传 + 图文笔记 API
- `src/lib/platformAdapters/xiaohongshu.ts` — 图文格式适配
- `src/components/publish/PlatformPreviewPanel.tsx` — 小红书图文预览
- `src/stores/publishStore.ts` — platformDrafts 支持图片字段
- `src/components/editor/MediaLibrary.tsx` — 选择图片关联到平台

**改动描述**:
- 小红书 API：先上传图片获取 URL → 创建图文笔记（标题 + 正文 + 图片列表）
- 正文截断逻辑：从 1000 字改为按图文模式处理
- 平台预览：模拟小红书卡片样式（封面图 + 标题 + 正文摘要）
- MediaLibrary 中选择的图片可关联到小红书平台

**依赖**: PR-16（平台规则校验已包含小红书图文规则）

**验证方式**:
- 含图片的内容发布到小红书 → 图文笔记成功创建
- 预览面板正确展示图文布局
- 无图片时降级为纯文本笔记

---

### PR-18: 知乎专栏与话题标签

**标题**: `feat: add Zhihu column selection and topic tags`

**涉及文件**:
- `src/lib/publishers/zhihu.ts` — 添加专栏列表 API + 话题搜索 API
- `src/components/publish/ZhihuOptions.tsx` (新建) — 专栏选择 + 话题标签 UI
- `src/stores/publishStore.ts` — zhihuColumnId, zhihuTopics 字段
- `src/components/publish/PlatformPreviewPanel.tsx` — 知乎预览增加专栏/话题展示

**改动描述**:
- 调用知乎 API 获取用户专栏列表，下拉选择
- 话题搜索：输入关键词 → 调用知乎话题搜索 API → 选择标签（最多 5 个）
- 发布时携带 column_id 和 topics 参数
- 预览面板展示专栏名 + 话题标签

**依赖**: 无

**验证方式**:
- 选择专栏后发布 → 内容出现在对应专栏
- 添加话题标签 → 发布后标签生效
- 无专栏/话题时使用默认行为

---

### PR-19: AI 多轮对话记忆

**标题**: `feat: add multi-turn conversation memory to AgentPanel`

**涉及文件**:
- `src/stores/agentStore.ts` — 对话历史持久化（sessionStorage）
- `src/components/agent/AgentPanel.tsx` — 展示对话历史、清空按钮
- `src/lib/agent/provider.ts` — 请求时携带历史消息
- `src/lib/agent/prompts/` — 各 prompt 模板适配多轮上下文

**改动描述**:
- agentStore 中 `chatHistory: ChatMessage[]` 持久化到 sessionStorage
- AgentPanel 顶部显示历史对话（可折叠）
- 每次请求携带最近 N 轮对话（默认 5 轮）作为上下文
- "清空对话"按钮重置历史
- 各写作 prompt 模板适配：首轮用系统 prompt，后续轮次追加用户反馈

**依赖**: 无

**验证方式**:
- 连续追问 AI → 后续回答引用前文内容
- 刷新页面 → 对话历史保留（sessionStorage）
- 清空对话 → 重新开始

---

### PR-20: 自定义 RSS 源

**标题**: `feat: allow users to add custom RSS feed sources`

**涉及文件**:
- `src/lib/ai-news/sources.ts` — 从硬编码改为配置化
- `src/app/api/ai-news/sources/route.ts` (新建) — CRUD 自定义源
- `src/app/settings/page.tsx` — 添加"新闻源管理"区域
- `src/components/settings/RssSourceManager.tsx` (新建) — 源列表 + 添加/删除
- `src/lib/ai-news/fetchFeeds.ts` — 合并内置源 + 自定义源
- 数据存储：`.publio-data/rss-sources.json`

**改动描述**:
- 内置源保留，用户可添加自定义 RSS URL + 名称 + 分类
- 添加源时自动验证 RSS 格式有效性
- 设置页展示源列表，支持启用/禁用/删除
- 聚合时合并内置 + 启用的自定义源

**依赖**: 无

**验证方式**:
- 添加自定义 RSS URL → 验证通过 → 出现在选题台
- 禁用源 → 选题台不再拉取该源
- 删除源 → 数据清理

---

### PR-21: AI 适配自动校验 + 写作 prompt 自定义

**标题**: `feat: AI adaptation with platform rule auto-check and custom prompts`

**涉及文件**:
- `src/lib/agent/prompts/adaptation.ts` — 注入平台规则约束
- `src/lib/agent/prompts/writing.ts` — 支持用户自定义 prompt 前缀
- `src/app/api/agent/write/route.ts` — 接收自定义 prompt 参数
- `src/app/settings/page.tsx` — 添加"自定义 Prompt"编辑区
- `src/components/settings/PromptEditor.tsx` (新建)
- `src/lib/storage/envFile.ts` — 存储自定义 prompt

**改动描述**:
- 适配 prompt 注入平台规则：如"小红书版本必须 ≤1000 字，包含 emoji"
- 用户可在设置页自定义各写作动作的 prompt 前缀/后缀
- 自定义 prompt 与默认 prompt 拼接，用户定义优先
- 存储到 `.publio-data/custom-prompts.json`

**依赖**: PR-16（平台规则库）、PR-19（多轮对话上下文）

**验证方式**:
- AI 适配小红书内容 → 自动控制在 1000 字内
- 自定义 prompt 后 → AI 写作风格变化
- 重置 prompt → 恢复默认行为

---

## Phase 5: 产品升级 P2（5 个 PR）

> AI-native 工作流、交互体验升级。

### PR-22: 内容运营助手（品牌画像 + 选题推荐）

**标题**: `feat: add AI content copilot with brand profile and topic recommendations`

**涉及文件**:
- `src/lib/copilot/` (新建目录)
- `src/lib/copilot/types.ts` — BrandProfile, AudiencePersona, TopicRecommendation
- `src/lib/copilot/profile.ts` — 品牌画像 CRUD
- `src/lib/copilot/recommend.ts` — 基于画像 + 新闻趋势推荐选题
- `src/app/api/copilot/recommend/route.ts` — SSE 推荐接口
- `src/app/settings/page.tsx` — 品牌画像配置区
- `src/components/copilot/BrandProfileForm.tsx` (新建)
- `src/components/copilot/TopicRecommendationPanel.tsx` (新建)
- `src/app/page.tsx` — 写作台集成推荐面板

**改动描述**:
- 品牌画像：品牌名、行业、人设语调、目标受众、内容风格偏好
- 选题推荐：结合画像 + AI 新闻聚合数据，推荐"这个选题适合你的受众"
- 推荐理由：为什么推荐、预估互动、建议角度
- 写作台右侧面板增加"推荐"tab

**依赖**: PR-20（自定义 RSS 源提供更丰富的选题池）

**验证方式**:
- 配置品牌画像 → 选题台推荐与画像匹配
- 推荐理由合理、可操作
- 点击推荐 → 自动填入编辑器

---

### PR-23: 用户风格学习

**标题**: `feat: add writing style learning from user's published content`

**涉及文件**:
- `src/lib/copilot/styleLearn.ts` (新建) — 分析用户历史内容提取风格特征
- `src/lib/agent/prompts/writing.ts` — 注入风格描述
- `src/app/settings/page.tsx` — 风格画像展示 + 手动调整
- `src/components/copilot/StyleProfile.tsx` (新建)

**改动描述**:
- 分析用户已发布/已保存的草稿：句式偏好、常用词汇、段落长度、emoji 使用习惯
- 生成风格描述（如"短句为主、喜欢用比喻、段落 ≤3 句"）
- 写作 prompt 注入风格描述："请按照以下风格写作：{styleDescription}"
- 设置页展示风格画像，用户可手动编辑

**依赖**: PR-22（品牌画像基础设施）

**验证方式**:
- 有历史内容 → 风格画像自动生成
- AI 写作风格与画像描述一致
- 手动修改画像 → AI 输出风格变化

---

### PR-24: 内容排期日历

**标题**: `feat: add content calendar with drag-and-drop scheduling`

**涉及文件**:
- `src/app/calendar/page.tsx` (新建)
- `src/app/calendar/page.css.ts` (新建)
- `src/components/calendar/CalendarView.tsx` (新建) — 月/周视图
- `src/components/calendar/CalendarEvent.tsx` (新建) — 日历事件卡片
- `src/components/calendar/DraftSlot.tsx` (新建) — 拖拽放置区
- `src/components/layout/Sidebar.tsx` — 添加导航入口
- `src/lib/scheduler/store.ts` — 扩展支持排期数据
- `src/app/api/calendar/route.ts` — 排期 CRUD

**改动描述**:
- 月视图 + 周视图切换
- 草稿可拖拽到日历格子 → 创建定时发布任务
- 已发布内容显示在对应日期，点击查看详情
- 空日期可点击 → 新建草稿
- 视觉：颜色区分"待发布"、"已发布"、"发布失败"

**依赖**: PR-14（定时发布后端）、PR-15（数据回收）

**验证方式**:
- 拖拽草稿到日历 → 定时任务创建
- 切换月/周视图正常
- 已发布/待发布/失败状态颜色区分正确

---

### PR-25: 沉浸式写作模式

**标题**: `feat: add immersive/distraction-free writing mode`

**涉及文件**:
- `src/components/editor/ImmersiveMode.tsx` (新建)
- `src/components/editor/MarkdownEditor.tsx` — 添加全屏入口
- `src/hooks/useImmersiveMode.ts` (新建) — ESC 退出、状态管理
- `src/app/page.css.ts` — 沉浸模式样式

**改动描述**:
- 全屏覆盖层，隐藏 Sidebar、右侧面板、顶部导航
- 编辑区居中，最大宽度 720px（Medium 风格）
- 极简工具栏：仅保留必要按钮（加粗/斜体/标题/链接/图片/退出）
- 字体放大（16px → 18px），行高增加
- ESC 或按钮退出
- 可选：打字机模式（当前行始终居中）

**依赖**: PR-06（Server/Client 拆分后更容易隔离沉浸模式逻辑）

**验证方式**:
- 点击全屏按钮 → 进入沉浸模式
- ESC → 退出，恢复原布局
- 沉浸模式下编辑、保存、AI 命令均可用
- 移动端体验正常

---

### PR-26: WYSIWYG 编辑模式

**标题**: `feat: add WYSIWYG editing mode as alternative to split-view`

**涉及文件**:
- `src/components/editor/WysiwygEditor.tsx` (新建)
- `src/components/editor/EditorModeToggle.tsx` (新建)
- `src/components/editor/MarkdownEditor.tsx` — 集成模式切换
- `src/stores/publishStore.ts` — editorMode 字段

**改动描述**:
- 双模式切换：分屏（Markdown + 预览）/ WYSIWYG
- WYSIWYG 模式：输入即所见，Markdown 语法自动渲染
- 可基于 `@uiw/react-md-editor` 的 WYSIWYG 模式（已支持）或引入轻量方案
- 模式切换时内容无损转换
- 记住用户偏好（localStorage）

**依赖**: PR-05（编辑器已懒加载，模式切换可按需加载）

**验证方式**:
- 分屏 → WYSIWYG 切换，内容无丢失
- WYSIWYG 模式下输入格式化文本 → 正确渲染
- 刷新后记住上次模式
- Markdown 特殊语法（代码块、表格）在 WYSIWYG 下正确处理

---

## 依赖关系图

```
PR-01 (Prettier/Husky)
├── PR-05 (Editor 懒加载)
│   └── PR-06 (Server/Client 拆分)
│       ├── PR-07 (syncPlatformDrafts 优化)
│       └── PR-25 (沉浸式写作)
├── PR-09 (Spacing/Typography tokens)
│   └── PR-10 (色彩对比度)
│       └── PR-11 (暗色主题)
└── PR-03 (类型拆分)

PR-02 (依赖清理) ← 独立
PR-04 (敏感词模块) ← 独立
  └── PR-13 (接入发布流程)
      └── PR-14 (定时发布)
          ├── PR-15 (数据回收)
          │   └── PR-24 (排期日历)
          └── PR-22 (运营助手)

PR-08 (Cache TTL) ← 独立
PR-12 (A11y) ← 独立
PR-16 (平台规则校验) ← 独立
  ├── PR-17 (小红书图文)
  └── PR-21 (AI 校验 + 自定义 prompt)
      └── PR-23 (风格学习)

PR-18 (知乎专栏) ← 独立
PR-19 (AI 多轮记忆) ← 独立
PR-20 (自定义 RSS) ← 独立
  └── PR-22 (运营助手)

PR-26 (WYSIWYG) ← PR-05
```

## 推荐执行顺序

按层推进，同层内可并行：

| 批次 | PR 编号 | 主题 | 预估工作量 |
|------|---------|------|-----------|
| **第 1 批** | PR-01, PR-02, PR-03, PR-04 | 基础设施 | 2-3 天 |
| **第 2 批** | PR-05, PR-06, PR-08, PR-09, PR-12 | 架构 + UI 基础 | 3-4 天 |
| **第 3 批** | PR-07, PR-10, PR-11, PR-16 | 性能 + 设计 + 规则 | 2-3 天 |
| **第 4 批** | PR-13, PR-14, PR-17, PR-18, PR-19, PR-20 | P0 功能 + P1 平台/AI | 5-7 天 |
| **第 5 批** | PR-15, PR-21, PR-25, PR-26 | 数据 + 交互升级 | 4-5 天 |
| **第 6 批** | PR-22, PR-23, PR-24 | P2 产品升级 | 5-7 天 |

**总计**: 26 个 PR，预估 21-29 个工作日。

---

## 验证总清单

每个 PR 合入前必须通过：
- [ ] `pnpm lint` 无新增错误
- [ ] `pnpm test` 通过
- [ ] `pnpm build` 成功
- [ ] 手动验证核心功能不受影响（编辑、发布、AI）
- [ ] 无新增 console.error / console.warn

Phase 完成后额外验证：
- [ ] `pnpm verify` 全量通过
- [ ] 暗色主题全页面审查
- [ ] 键盘导航完整流程测试
- [ ] 移动端响应式检查
