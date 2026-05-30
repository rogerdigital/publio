# Publio Core Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 将 Publio 从“内容运营全流程平台”收敛为“写作 + 渠道适配 + 发布”的轻量多平台发布工具。

**Architecture:** 保留写作台、稿件库、设置页、发布核心链路；对选题、RSS、Brief、复盘、数据看板、日历、Copilot、后台调度器等非核心运营系统执行物理删除，不保留冻结代码、隐藏入口或未使用资源。前端导航先收窄，后端 API、lib、组件、测试、资源和依赖再分批删除，最后用测试和构建验证没有悬空引用。

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict mode, vanilla-extract, Zustand, Vitest, pnpm.

**Execution Status:** Completed on branch `refactor/core-simplification`.

- Core implementation commits: `f22546b` through `f96d393`.
- Follow-up cleanup commit: `537841f`.
- Smoke test coverage: added in `src/app/__tests__/coreRouteSurface.test.ts`.
- Verification: `pnpm verify` passed after adding smoke coverage.

---

## 1. Scope

### 1.1 保留的核心能力

- 写作台：Markdown 编辑、预览、自动保存、新建/打开草稿、版本历史、模板、媒体库。
- 稿件库：草稿列表、搜索、打开、删除、基础状态展示。
- 渠道版本：微信公众号、小红书、知乎、X 的平台版本生成、编辑、保存。
- 发布前检查：平台规则校验、敏感词提示、发布确认。
- 发布：创建发布任务、并发执行发布器、记录发布结果和失败原因。
- 设置：平台凭证、AI Agent 配置、GitHub 图床配置、基础偏好。
- AI：只保留写作改写、平台适配、标题建议三类能力。

### 1.2 必须删除的非核心能力

- AI 新闻台：`/ai-news` 页面、RSS 聚合、信号收件箱、选题库、研究底稿。
- Brief 系统：Brief CRUD、Brief 生成、Brief 编辑组件、写作台中的 Brief 上下文入口。
- Analytics：`/analytics` 页面、指标采集、指标刷新 API、复盘指标表。
- Calendar：`/calendar` 页面、排期日历 UI。
- Copilot：品牌画像、风格学习、选题推荐。
- Feedback：内容复盘 CRUD 和页面级复盘入口。
- Workspace import/export：工作空间导入导出。
- Scheduler：RSS 拉取、每日摘要、到期草稿检查等后台任务。
- Feed：发布内容 RSS feed。
- Scheduled publishing UI：发布时间建议、排期选择器、日历联动。
- Standalone sync-task pages：独立分发记录列表页和详情页；发布状态保留在写作台浮层和核心 API 中。

### 1.3 删除策略

- 源码硬删除：非核心页面、API、组件、lib、hooks、store、types、tests、CSS、fixture、静态资源、文档截图和未使用依赖全部删除。
- 不做冻结代码：不保留 disabled code、隐藏 route、未挂载组件、未导出的 helper 或“以后可能恢复”的目录。
- 不做软隐藏：如果功能不是精简后核心链路的一部分，不能只从导航移除，必须删除实现。
- 用户数据不自动删除：`.publio-data/` 中已有的 signal/topic/brief/feedback/metrics JSON 不在本轮自动删除；新代码不再读取或写入这些实体。
- 旧字段只做读入容忍：`Draft` 读取时可以忽略旧 JSON 中的 `topicId`、`briefId` 等多余字段，但新代码不展示、不写入。
- 发布状态例外：`src/lib/sync/**` 和 `src/app/api/sync-tasks/**` 保留，因为发布任务、发布结果轮询、失败原因展示属于核心发布链路；独立 `/sync-tasks` 页面和 `src/components/sync/**` 删除。

### 1.4 不在本轮处理的事项

- 不更换 JSON 文件存储。
- 不引入认证、多用户、数据库。
- 不重做视觉设计系统。
- 不新增平台。
- 不做发布器协议重构。
- 不自动清空 `.publio-data/` 历史数据。

---

## 2. Target Product Shape

### 2.1 页面结构

最终只保留 3 个主入口：

- `/`：写作台。默认入口，承载编辑、预览、平台选择、渠道版本、发布检查、发布状态。
- `/drafts`：稿件库。只管理草稿，不再承担选题、Brief、复盘入口。
- `/settings`：设置。只管理平台连接、AI 配置、图床配置、基础偏好。

删除独立但非必要入口：

- `/sync-tasks`：删除独立发布记录列表页和详情页。发布状态只通过写作台的发布进度浮层、稿件库状态摘要和 `/api/sync-tasks/**` 提供。

### 2.2 数据实体

保留：

- `Draft`
- `PlatformVariant`
- `SyncTask`
- `PlatformConnection`
- `Settings`
- `Template`
- `Upload`

删除：

- `Signal`
- `Topic`
- `Brief`
- `Feedback`
- `Metric`
- `RssSource`
- `CopilotProfile`
- `StyleProfile`
- `Recommendation`

### 2.3 AI 能力

保留 3 类：

- 写作改写：`rewrite`，用于改善已有文本。
- 平台适配：`adapt`，用于生成平台版本。
- 标题建议：新增 `title` 或 `suggest-title`，用于给当前内容生成 3-5 个标题。

删除：

- `expand`
- `condense`
- `polish`
- `continue`
- `research`
- `diagnose`
- `feedback`
- `signal-review`
- `topic-pack`
- `brief`
- `chat`

说明：`polish` 和 `rewrite` 功能重叠，统一为“改写”。`diagnose` 由发布失败详情中的普通错误提示替代。`research`、`signal-review`、`topic-pack`、`brief` 属于被删除的选题运营线，不保留代码。

---

## 3. File Map

### 3.1 主要修改文件

- `src/components/layout/Sidebar.tsx`：导航缩减为写作台、稿件库、设置。
- `src/components/layout/Sidebar.css.ts`：删除或调整与多入口移动端菜单相关的样式。
- `src/app/layout.tsx`：移除 RSS feed link；确认全局 layout 不再初始化非核心能力。
- `src/app/page-client.tsx`：移除 Brief、Topic、Workbench、定时发布建议等非核心 UI 入口；保留写作、预览、平台版本、发布。
- `src/stores/publishStore.ts`：删除 `currentTopicId`、`currentBriefId`；保留 `currentDraftId`、平台选择、渠道版本和发布状态。
- `src/hooks/useSlashCommands.ts`：将 AI 命令收缩到“AI 改写”和“AI 标题建议”。
- `src/lib/agent/types.ts`：收缩 `WritingAction` 和 `AgentAction`。
- `src/app/api/agent/write/route.ts`：只接受保留的写作动作。
- `src/app/api/agent/adapt/route.ts`：保留。
- `src/app/api/agent/status/route.ts`：保留。
- `src/app/api/publish/route.ts`：保留，并确认不依赖已删除实体。
- `src/app/api/publish/check/route.ts`：保留发布前检查。
- `src/app/api/drafts/**`：保留，但移除 Brief/Topic 字段依赖。
- `src/app/api/platform-variants/**`：保留。
- `src/app/api/settings/route.ts`：保留。
- `src/app/api/platforms/**`：保留。
- `src/lib/drafts/**`：保留，并清理 Brief/Topic 字段。
- `src/lib/platformVariants/**`：保留。
- `src/lib/platformAdapters/**`：保留。
- `src/lib/publishChecks/**`：保留。
- `src/lib/publishers/**`：保留。
- `src/lib/sync/**`：保留发布任务存储；这是发布核心链路，不等同于保留独立分发记录页面。
- `src/types/index.ts`、`src/types/publish.ts`、`src/types/platform.ts`：清理非核心类型引用。
- `README.md`、`README_zh.md`、`docs/configuration.md`：更新项目定位和功能列表。

### 3.2 计划删除的页面

- Delete: `src/app/ai-news/**`
- Delete: `src/app/analytics/**`
- Delete: `src/app/calendar/**`
- Delete: `src/app/feed/**`
- Delete: `src/app/sync-tasks/**`

### 3.3 计划删除的 API

- Delete: `src/app/api/ai-news/route.ts`
- Delete: `src/app/api/agent/brief/route.ts`
- Delete: `src/app/api/agent/chat/route.ts`
- Delete: `src/app/api/agent/diagnose/route.ts`
- Delete: `src/app/api/agent/feedback/route.ts`
- Delete: `src/app/api/agent/research/route.ts`
- Delete: `src/app/api/agent/signal-review/route.ts`
- Delete: `src/app/api/agent/topic-pack/route.ts`
- Delete: `src/app/api/briefs/**`
- Delete: `src/app/api/copilot/**`
- Delete: `src/app/api/export/route.ts`
- Delete: `src/app/api/import/route.ts`
- Delete: `src/app/api/feedback/**`
- Delete: `src/app/api/metrics/**`
- Delete: `src/app/api/rss-sources/route.ts`
- Delete: `src/app/api/scheduler/status/route.ts`
- Delete: `src/app/api/signals/**`
- Delete: `src/app/api/topics/**`

### 3.4 计划删除的组件目录或文件

- Delete: `src/components/news/**`
- Delete: `src/components/analytics/**`
- Delete: `src/components/calendar/**`
- Delete: `src/components/briefs/**`
- Delete: `src/components/copilot/**`
- Delete: `src/components/workbench/**`
- Delete: `src/components/sync/**`
- Delete: `src/components/settings/RssSourceManager.tsx`
- Delete: `src/components/editor/EditorialContextCard.tsx`
- Delete: `src/components/editor/WritingBriefCard.tsx`
- Delete: `src/components/publish/PublishTimingSuggestion.tsx`
- Delete: `src/components/publish/SchedulePicker.tsx`

### 3.5 计划删除的 lib 目录

- Delete: `src/lib/ai-news/**`
- Delete: `src/lib/aiNews.ts`
- Delete: `src/lib/briefs/**`
- Delete: `src/lib/copilot/**`
- Delete: `src/lib/export/**`
- Delete: `src/lib/feedback/**`
- Delete: `src/lib/metrics/**`
- Delete: `src/lib/rss-sources/**`
- Delete: `src/lib/scheduler/**`
- Delete: `src/lib/signals/**`
- Delete: `src/lib/topics/**`
- Delete: `src/lib/newsDraft.ts`

### 3.6 计划清理的资源和依赖

- Delete: 仅被删除页面或组件引用的 `.css.ts` 文件。
- Delete: 仅被删除功能引用的测试 fixture、mock 数据、截图和静态资源。
- Delete: 仅被 RSS/选题/复盘/分析/日历/Copilot 使用的 package 依赖。
- Keep: 编辑器、Markdown 渲染、HTML 安全清洗、平台发布器、SSE Agent、Zustand、lucide-react 相关依赖。
- Keep: `.publio-data/` 历史数据文件；代码不再引用它们，但改造过程不执行数据删除。

---

## 4. Commit Plan

建议按 7 个提交执行，保证每个提交都能独立解释和验证。

1. `chore: document core simplification plan`
2. `refactor: simplify app navigation`
3. `refactor: remove topic and brief UI from writer`
4. `refactor: remove discovery and analytics routes`
5. `refactor: remove non-core data modules`
6. `refactor: simplify writing agent actions`
7. `test: align core workflow coverage`
8. `docs: update publio core product scope`

如果执行中发现某个提交过大，将第 4 和第 5 拆成：

- `refactor: remove discovery routes`
- `refactor: remove analytics and feedback routes`
- `refactor: remove scheduler and feed routes`
- `refactor: remove orphaned domain modules`

---

## 5. Execution Tasks

### Task 1: Baseline Inventory And Safety Check

**Files:**

- Read: `package.json`
- Read: `src/app/layout.tsx`
- Read: `src/components/layout/Sidebar.tsx`
- Read: `src/app/page-client.tsx`
- Read: `src/stores/publishStore.ts`
- Read: `src/lib/agent/types.ts`
- Read: `src/hooks/useSlashCommands.ts`

- [x] **Step 1: Confirm clean branch**

Run:

```bash
git status --short --branch
```

Expected:

```text
## main...origin/main
```

If untracked plan files exist from this document creation, keep them; do not reset them.

- [x] **Step 2: Capture current route surface**

Run:

```bash
find src/app -maxdepth 3 -type f | sort > /tmp/publio-routes-before.txt
find src/app/api -maxdepth 3 -type f | sort > /tmp/publio-api-before.txt
find src/lib -maxdepth 2 -type f | sort > /tmp/publio-lib-before.txt
find src/components -maxdepth 2 -type f | sort > /tmp/publio-components-before.txt
```

Expected: four files exist under `/tmp`.

- [x] **Step 3: Run baseline verification**

Run:

```bash
pnpm verify
```

Expected: command passes before deletion work starts. If it fails, capture the failing test/build output and fix baseline breakage before continuing.

- [x] **Step 4: Commit this plan**

Run:

```bash
git add docs/plans/2026-05-30-core-simplification-plan.md
git commit -m "chore: document core simplification plan"
```

Expected: one documentation-only commit.

---

### Task 2: Simplify Navigation To Core Pages

**Files:**

- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/Sidebar.css.ts`
- Modify: `src/app/layout.tsx`
- Test: `src/components/layout/__tests__/Sidebar.test.tsx` if component tests already exist; otherwise rely on build and manual browser verification.

- [x] **Step 1: Replace sidebar nav model**

In `src/components/layout/Sidebar.tsx`, reduce `navItems` to:

```ts
const navItems = [
  { href: '/', label: '写作台', icon: PenLine, color: '#3B82F6' },
  { href: '/drafts', label: '稿件库', icon: Library, color: '#8B5CF6' },
  { href: '/settings', label: '设置', icon: Settings2, color: '#6B7280' },
];
```

Remove unused icon imports:

```ts
Newspaper,
Send,
BarChart3,
CalendarDays,
MoreHorizontal,
```

Remove these constants:

```ts
const PRIMARY_MOBILE_COUNT = 5;
const primaryMobileItems = navItems.slice(0, PRIMARY_MOBILE_COUNT);
const moreMobileItems = navItems.slice(PRIMARY_MOBILE_COUNT);
```

Remove `moreOpen`, `setMoreOpen`, `moreRef`, and the outside-click / route-change effects for the mobile more menu.

- [x] **Step 2: Simplify mobile tab rendering**

Replace the mobile nav map with:

```tsx
<nav className={styles.mobileTabBar} aria-label="移动端导航">
  {navItems.map((item) => {
    const isActive =
      pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    const Icon = item.icon;
    const state = isActive ? 'active' : 'inactive';

    return (
      <Link
        key={item.href}
        href={item.href}
        className={styles.mobileTabItem[state]}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon size={20} color={isActive ? undefined : item.color} />
        <span className={styles.mobileTabLabel[state]}>{item.label}</span>
      </Link>
    );
  })}
</nav>
```

- [x] **Step 3: Remove RSS feed link**

In `src/app/layout.tsx`, delete:

```tsx
<link
  rel="alternate"
  type="application/rss+xml"
  title="Publio RSS Feed"
  href="/feed/published.xml"
/>
```

- [x] **Step 4: Clean unused mobile more styles**

In `src/components/layout/Sidebar.css.ts`, remove style exports only used by the removed more menu:

```ts
moreMenuWrapper
moreDropdown
moreDropdownItem
```

Keep `mobileTabBar`, `mobileTabItem`, and `mobileTabLabel`.

- [x] **Step 5: Verify navigation typecheck**

Run:

```bash
pnpm lint
```

Expected: no unused import or lint errors from `Sidebar.tsx` / `layout.tsx`.

- [x] **Step 6: Browser check**

Run:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

Expected visible nav entries:

- 写作台
- 稿件库
- 设置

Expected absent nav entries:

- 选题台
- 分发记录
- 数据看板
- 排期日历

- [x] **Step 7: Commit**

Run:

```bash
git add src/components/layout/Sidebar.tsx src/components/layout/Sidebar.css.ts src/app/layout.tsx
git commit -m "refactor: simplify app navigation"
```

---

### Task 3: Remove Topic And Brief UI From Writer

**Files:**

- Modify: `src/app/page-client.tsx`
- Modify: `src/stores/publishStore.ts`
- Modify: `src/stores/__tests__/publishStore.test.ts`
- Modify: `src/lib/drafts/types.ts`
- Modify: `src/lib/drafts/store.ts`
- Modify: `src/lib/drafts/client.ts`
- Delete: `src/components/workbench/TodayWorkbench.tsx`
- Delete: `src/components/workbench/TodayWorkbench.css.ts`
- Delete: `src/components/editor/EditorialContextCard.tsx`
- Delete: `src/components/editor/WritingBriefCard.tsx`
- Delete: `src/components/editor/WritingBriefCard.css.ts`

- [x] **Step 1: Remove non-core imports from `page-client.tsx`**

Delete these imports:

```ts
import EditorialContextCard from '@/components/editor/EditorialContextCard';
import WritingBriefCard from '@/components/editor/WritingBriefCard';
import TodayWorkbench from '@/components/workbench/TodayWorkbench';
```

Remove scheduled publishing UI:

```ts
import PublishTimingSuggestion from '@/components/publish/PublishTimingSuggestion';
import SchedulePicker from '@/components/publish/SchedulePicker';
```

Keep:

```ts
import PlatformSelector from '@/components/publish/PlatformSelector';
import PublishButton from '@/components/publish/PublishButton';
import PublishStatusPanel from '@/components/publish/PublishStatusPanel';
import PlatformPreviewPanel from '@/components/publish/PlatformPreviewPanel';
import PlatformVariantPanel from '@/components/publish/PlatformVariantPanel';
import PublishProgressOverlay from '@/components/publish/PublishProgressOverlay';
```

- [x] **Step 2: Remove Topic/Brief state from `page-client.tsx`**

Delete destructured store fields:

```ts
currentBriefId,
setCurrentBriefId,
setCurrentTopicId,
```

In `handleNewDraft`, delete:

```ts
setCurrentBriefId(null);
setCurrentTopicId(null);
```

In draft loading, delete:

```ts
setCurrentBriefId(draft.briefId ?? null);
setCurrentTopicId(draft.topicId ?? null);
```

Remove these setters from dependency arrays.

- [x] **Step 3: Remove Topic/Brief state from `publishStore`**

In `src/stores/publishStore.ts`, delete:

```ts
currentTopicId: string | null;
currentBriefId: string | null;
setCurrentTopicId: (id: string | null) => void;
setCurrentBriefId: (id: string | null) => void;
```

Delete the matching initial state:

```ts
currentTopicId: null,
currentBriefId: null,
setCurrentTopicId: (id) => set({ currentTopicId: id }),
setCurrentBriefId: (id) => set({ currentBriefId: id }),
```

- [x] **Step 4: Remove Topic/Brief UI blocks**

In `src/app/page-client.tsx`, remove JSX blocks that render:

- `TodayWorkbench`
- `EditorialContextCard`
- `WritingBriefCard`

Keep the layout focused on:

- header actions
- editor/preview tab
- draft panel or recent drafts
- platform selector
- platform preview
- platform variant panel
- publish status/progress

- [x] **Step 5: Update draft type**

In `src/lib/drafts/types.ts`, remove optional fields if present:

```ts
topicId?: string;
briefId?: string;
```

If existing stored JSON may contain these keys, ignore them on read instead of failing. Do not write them for new saves.

- [x] **Step 6: Update draft store save payload**

In `src/lib/drafts/store.ts`, ensure create/update paths persist only core fields:

```ts
title
content
status
tags
platforms
createdAt
updatedAt
versions
```

Do not include `topicId` or `briefId` in new writes.

- [x] **Step 7: Update publish store tests**

In `src/stores/__tests__/publishStore.test.ts`, remove assertions for `currentTopicId` and `currentBriefId`.

Add an assertion for the retained reset behavior:

```ts
expect(usePublishStore.getState().overallStatus).toBe('idle');
expect(usePublishStore.getState().lastSyncTaskId).toBeNull();
expect(usePublishStore.getState().isProgressOverlayOpen).toBe(false);
```

- [x] **Step 8: Delete orphaned UI files**

Run:

```bash
rm -rf src/components/workbench
rm -f src/components/editor/EditorialContextCard.tsx
rm -f src/components/editor/WritingBriefCard.tsx
rm -f src/components/editor/WritingBriefCard.css.ts
rm -f src/components/publish/PublishTimingSuggestion.tsx
rm -f src/components/publish/SchedulePicker.tsx
rm -f src/components/publish/schedulePicker.css.ts
```

- [x] **Step 9: Check for remaining imports**

Run:

```bash
rg "TodayWorkbench|EditorialContextCard|WritingBriefCard|PublishTimingSuggestion|SchedulePicker|scheduledAt|setScheduledAt|currentTopicId|currentBriefId|setCurrentTopicId|setCurrentBriefId" src
```

Expected: no matches outside deleted files or migration compatibility comments.

- [x] **Step 10: Verify**

Run:

```bash
pnpm test -- src/stores/__tests__/publishStore.test.ts
pnpm lint
pnpm build
```

Expected: all pass.

- [x] **Step 11: Commit**

Run:

```bash
git add src/app/page-client.tsx src/stores/publishStore.ts src/stores/__tests__/publishStore.test.ts src/lib/drafts src/components
git commit -m "refactor: remove topic and brief UI from writer"
```

---

### Task 4: Remove Discovery, Brief, Analytics, Calendar, Feed, And Standalone Sync Pages

**Files:**

- Delete: `src/app/ai-news/**`
- Delete: `src/app/analytics/**`
- Delete: `src/app/calendar/**`
- Delete: `src/app/feed/**`
- Delete: `src/app/sync-tasks/**`
- Delete: `src/app/api/ai-news/route.ts`
- Delete: `src/app/api/briefs/**`
- Delete: `src/app/api/copilot/**`
- Delete: `src/app/api/feedback/**`
- Delete: `src/app/api/metrics/**`
- Delete: `src/app/api/rss-sources/route.ts`
- Delete: `src/app/api/scheduler/status/route.ts`
- Delete: `src/app/api/signals/**`
- Delete: `src/app/api/topics/**`
- Keep: `src/app/api/sync-tasks/**` for publish status tracking.

- [x] **Step 1: Delete non-core page routes**

Run:

```bash
rm -rf src/app/ai-news
rm -rf src/app/analytics
rm -rf src/app/calendar
rm -rf src/app/feed
rm -rf src/app/sync-tasks
```

- [x] **Step 2: Delete non-core API routes**

Run:

```bash
rm -rf src/app/api/ai-news
rm -rf src/app/api/briefs
rm -rf src/app/api/copilot
rm -rf src/app/api/feedback
rm -rf src/app/api/metrics
rm -rf src/app/api/rss-sources
rm -rf src/app/api/scheduler
rm -rf src/app/api/signals
rm -rf src/app/api/topics
```

- [x] **Step 3: Keep publish task routes**

Do not delete:

```text
src/app/api/sync-tasks/route.ts
src/app/api/sync-tasks/[id]/route.ts
src/app/api/sync-tasks/__tests__/route.test.ts
```

Reason: current publish flow creates `SyncTask` records and the progress overlay/status panel polls them. This keeps the API/data model, not the standalone page UI.

- [x] **Step 4: Remove links to deleted sync pages**

Update these files so they no longer link to `/sync-tasks`:

- `src/components/publish/PublishProgressOverlay.tsx`
- `src/components/editor/DraftPanel.tsx`
- `src/components/drafts/DraftLibraryClient.tsx`

Expected behavior:

- `PublishProgressOverlay` shows task status and failure details inline instead of linking to `/sync-tasks/[id]`.
- `DraftPanel` and `DraftLibraryClient` show the latest publish status as text or a non-clickable badge.
- No UI path navigates to `/sync-tasks`.

- [x] **Step 5: Check route references**

Run:

```bash
rg "/api/(ai-news|briefs|copilot|feedback|metrics|rss-sources|scheduler|signals|topics)|/ai-news|/analytics|/calendar|/feed" src
rg "\"/sync-tasks|'/sync-tasks|`/sync-tasks|href=\\{`/sync-tasks" src
```

Expected for the first command: no live references.

Expected for the second command: no matches.

Allowed separately:

- `/api/sync-tasks` references in publish status polling, draft status summaries, and retained API tests. Check with `rg "/api/sync-tasks" src` if needed.

Disallowed:

- `/sync-tasks` page links.
- imports from `src/components/sync`.
- tests for `src/app/sync-tasks/**`.

- [x] **Step 6: Verify route tree compiles**

Run:

```bash
pnpm lint
pnpm build
```

Expected: no missing module errors from deleted route imports.

- [x] **Step 7: Commit**

Run:

```bash
git add -A src/app
git commit -m "refactor: remove non-core app routes"
```

---

### Task 5: Remove Non-Core Domain Modules And Components

**Files:**

- Delete: `src/components/news/**`
- Delete: `src/components/analytics/**`
- Delete: `src/components/calendar/**`
- Delete: `src/components/briefs/**`
- Delete: `src/components/copilot/**`
- Delete: `src/components/sync/**`
- Delete: `src/components/settings/RssSourceManager.tsx`
- Delete: `src/lib/ai-news/**`
- Delete: `src/lib/aiNews.ts`
- Delete: `src/lib/briefs/**`
- Delete: `src/lib/copilot/**`
- Delete: `src/lib/export/**`
- Delete: `src/lib/feedback/**`
- Delete: `src/lib/metrics/**`
- Delete: `src/lib/rss-sources/**`
- Delete: `src/lib/scheduler/**`
- Delete: `src/lib/signals/**`
- Delete: `src/lib/topics/**`
- Delete: `src/lib/newsDraft.ts`

- [x] **Step 1: Delete non-core component directories**

Run:

```bash
rm -rf src/components/news
rm -rf src/components/analytics
rm -rf src/components/calendar
rm -rf src/components/briefs
rm -rf src/components/copilot
rm -rf src/components/sync
rm -f src/components/settings/RssSourceManager.tsx
```

- [x] **Step 2: Delete non-core domain modules**

Run:

```bash
rm -rf src/lib/ai-news
rm -f src/lib/aiNews.ts
rm -rf src/lib/briefs
rm -rf src/lib/copilot
rm -rf src/lib/export
rm -rf src/lib/feedback
rm -rf src/lib/metrics
rm -rf src/lib/rss-sources
rm -rf src/lib/scheduler
rm -rf src/lib/signals
rm -rf src/lib/topics
rm -f src/lib/newsDraft.ts
```

- [x] **Step 3: Remove import/export references**

Run:

```bash
rg "@/components/(news|analytics|calendar|briefs|copilot|sync)|@/lib/(ai-news|aiNews|briefs|copilot|export|feedback|metrics|rss-sources|scheduler|signals|topics|newsDraft)" src
```

Expected: no matches.

- [x] **Step 4: Remove scheduler initialization**

Search:

```bash
rg "startScheduler|scheduler|check-due-drafts|fetch-rss-feeds|generate-daily-digest" src instrumentation.ts next.config.ts
```

If `src/instrumentation.ts` or `instrumentation.ts` imports scheduler startup, remove that import and its invocation. The final instrumentation should not start background jobs.

- [x] **Step 5: Remove settings UI references to RSS**

Search:

```bash
rg "RssSourceManager|RSS|rss" src/app src/components src/lib
```

Keep documentation strings only if they refer to external publishing feed intentionally. Remove settings UI blocks that render RSS source management.

- [x] **Step 6: Verify no dead tests remain**

Run:

```bash
find src -path '*__tests__*' -type f | sort
```

Delete tests whose only subject is one of the removed modules or deleted standalone sync UI. Keep tests for drafts, platform variants, publish, settings, sync task API/store, markdown, sanitize-html, cache, publish status.

- [x] **Step 7: Delete non-core assets and styles**

Run:

```bash
find src -type f \( -name '*.css.ts' -o -name '*.test.ts' -o -name '*.test.tsx' \) | sort
```

Delete files that only support removed pages/components. Expected removals include CSS and tests under:

```text
src/components/news
src/components/analytics
src/components/calendar
src/components/briefs
src/components/copilot
src/components/sync
src/app/ai-news
src/app/analytics
src/app/calendar
src/app/sync-tasks
```

- [x] **Step 8: Verify**

Run:

```bash
pnpm test
pnpm lint
pnpm build
```

Expected: all pass. Build output should no longer compile `/ai-news`, `/analytics`, `/calendar`, `/sync-tasks`, or removed API routes.

- [x] **Step 9: Commit**

Run:

```bash
git add -A src
git commit -m "refactor: remove non-core domain modules"
```

---

### Task 6: Simplify Agent Actions To Rewrite, Title Suggestions, And Adaptation

**Files:**

- Modify: `src/lib/agent/types.ts`
- Modify: `src/hooks/useSlashCommands.ts`
- Modify: `src/components/editor/SlashCommandMenu.tsx`
- Modify: `src/components/agent/AgentPanel.tsx`
- Modify: `src/app/api/agent/write/route.ts`
- Modify: `src/lib/agent/prompts/writing.ts`
- Delete: `src/app/api/agent/diagnose/route.ts`
- Delete: `src/app/api/agent/research/route.ts`
- Delete: `src/app/api/agent/feedback/route.ts`
- Delete: `src/app/api/agent/signal-review/route.ts`
- Delete: `src/app/api/agent/topic-pack/route.ts`
- Delete: `src/app/api/agent/brief/route.ts`
- Delete: `src/app/api/agent/chat/route.ts`
- Keep: `src/app/api/agent/adapt/route.ts`
- Keep: `src/app/api/agent/status/route.ts`
- Test: add or update tests for `useSlashCommands` if a hook test exists.

- [x] **Step 1: Replace writing action types**

In `src/lib/agent/types.ts`, replace:

```ts
export type WritingAction =
  | 'expand'
  | 'condense'
  | 'rewrite'
  | 'polish'
  | 'continue';
```

with:

```ts
export type WritingAction = 'rewrite' | 'title';
```

Replace:

```ts
export type AgentAction = WritingAction | 'adapt' | 'research' | 'diagnose' | 'chat';
```

with:

```ts
export type AgentAction = WritingAction | 'adapt';
```

- [x] **Step 2: Update slash AI commands**

In `src/hooks/useSlashCommands.ts`, replace `AI_COMMANDS` with:

```ts
export const AI_COMMANDS: SlashCommand[] = [
  { key: 'ai-rewrite', label: 'AI 改写', prefix: '', icon: 'R', type: 'ai', aiAction: 'rewrite' },
  { key: 'ai-title', label: 'AI 标题建议', prefix: '', icon: 'T', type: 'ai', aiAction: 'title' },
];
```

Use text icons instead of emoji to keep UI predictable and avoid extra visual noise.

- [x] **Step 3: Update writing prompt dispatch**

In `src/lib/agent/prompts/writing.ts`, keep explicit branches for:

```ts
case 'rewrite':
  return '...';
case 'title':
  return '...';
```

The `title` prompt should ask for 3-5 concise title candidates and no long analysis. Example expected output format:

```markdown
1. 标题一
2. 标题二
3. 标题三
```

- [x] **Step 4: Update write route validation**

In `src/app/api/agent/write/route.ts`, validate only:

```ts
const allowedActions: WritingAction[] = ['rewrite', 'title'];
```

If a request sends another action, return:

```ts
return apiError('Unsupported writing action', 400);
```

- [x] **Step 5: Delete non-core agent API routes**

Run:

```bash
rm -rf src/app/api/agent/brief
rm -rf src/app/api/agent/chat
rm -rf src/app/api/agent/diagnose
rm -rf src/app/api/agent/feedback
rm -rf src/app/api/agent/research
rm -rf src/app/api/agent/signal-review
rm -rf src/app/api/agent/topic-pack
```

- [x] **Step 6: Remove UI references to removed actions**

Run:

```bash
rg "expand|condense|polish|continue|research|diagnose|feedback|signal-review|topic-pack|brief|chat" src/components src/hooks src/lib/agent src/app/api/agent
```

Expected allowed remaining matches:

- Natural language documentation in comments that should be edited out.
- `feedback` component directory names only if they refer to generic UI feedback components such as toast or skeleton.

- [x] **Step 7: Verify**

Run:

```bash
pnpm test
pnpm lint
pnpm build
```

Expected: all pass.

- [x] **Step 8: Commit**

Run:

```bash
git add -A src/lib/agent src/hooks src/components/agent src/components/editor src/app/api/agent
git commit -m "refactor: simplify writing agent actions"
```

---

### Task 7: Reconcile Types, Package Dependencies, And Tests

**Files:**

- Modify: `src/types/index.ts`
- Modify: `src/types/publish.ts`
- Modify: `src/types/platform.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: tests under `src/**/__tests__/**`

- [x] **Step 1: Search for removed domain names**

Run:

```bash
rg "Signal|Topic|Brief|Feedback|Metric|RssSource|Copilot|Research|Digest|Calendar|Analytics" src package.json
```

Expected: no matches except:

- Generic UI `feedback` components such as `Toast`, `Skeleton`, `ErrorState`, `EmptyState`.
- User-facing text in docs pending Task 8.

- [x] **Step 2: Remove unused dependencies**

Inspect dependency usage:

```bash
pnpm exec depcheck
```

If `depcheck` is not installed, use:

```bash
rg "eventsource-parser|twitter-api-v2|marked|sanitize-html|@uiw/react-md-editor|zustand|lucide-react" src
```

Expected decisions:

- Keep `@uiw/react-md-editor`: editor.
- Keep `marked`: markdown rendering.
- Keep `sanitize-html`: HTML preview sanitization.
- Keep `eventsource-parser`: Agent SSE parsing if still used.
- Keep `twitter-api-v2`: X publisher.
- Keep `zustand`: store.
- Keep `lucide-react`: UI icons.

Remove a package only when no source file imports it.

- [x] **Step 3: Update tests for deleted routes**

Delete tests for removed APIs:

```bash
rm -rf src/app/api/briefs/__tests__
rm -rf src/app/api/feedback/__tests__
rm -rf src/app/api/signals/__tests__
rm -rf src/app/api/topics/__tests__
```

Keep tests:

```text
src/app/api/drafts/__tests__/route.test.ts
src/app/api/platform-variants/__tests__/route.test.ts
src/app/api/publish/__tests__/route.test.ts
src/app/api/settings/__tests__/route.test.ts
src/app/api/sync-tasks/__tests__/route.test.ts
src/lib/__tests__/sanitizeHtmlSecurity.test.ts
src/lib/__tests__/publishStatus.test.ts
src/stores/__tests__/publishStore.test.ts
```

- [x] **Step 4: Add core route smoke tests**

If route-level tests use Vitest and Next route handlers directly, add or update tests to verify retained routes:

```ts
describe('core route availability', () => {
  it('keeps drafts API available', async () => {
    const mod = await import('@/app/api/drafts/route');
    expect(typeof mod.GET).toBe('function');
    expect(typeof mod.POST).toBe('function');
  });

  it('keeps publish API available', async () => {
    const mod = await import('@/app/api/publish/route');
    expect(typeof mod.POST).toBe('function');
  });

  it('keeps settings API available', async () => {
    const mod = await import('@/app/api/settings/route');
    expect(typeof mod.GET).toBe('function');
    expect(typeof mod.POST).toBe('function');
  });
});
```

Place this in:

```text
src/app/api/__tests__/core-routes.test.ts
```

Create `src/app/api/__tests__` if needed.

- [x] **Step 5: Verify full project**

Run:

```bash
pnpm verify
```

Expected:

- `pnpm check:no-js-source` passes.
- `pnpm lint` passes.
- `pnpm test` passes.
- `pnpm build` passes.

- [x] **Step 6: Commit**

Run:

```bash
git add -A src package.json pnpm-lock.yaml
git commit -m "test: align core workflow coverage"
```

---

### Task 8: Update Documentation To Match The Simplified Product

**Files:**

- Modify: `README.md`
- Modify: `README_zh.md`
- Modify: `docs/configuration.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md` if it duplicates old architecture guidance.

- [x] **Step 1: Update README positioning**

In both README files, replace broad “AI 原生内容运营平台 / 全生命周期工作流” positioning with:

```text
Publio is a lightweight multi-platform writing and publishing workspace.
Write once, adapt per channel, and publish with clear status tracking.
```

Chinese version:

```text
Publio 是一个轻量多平台写作发布工作台。
一次写作，按平台适配，带检查和状态追踪地完成发布。
```

- [x] **Step 2: Update workflow section**

Replace:

```text
信号收件箱 → 选题库 → 写作 Brief → 写作台 → 渠道版本 → 发布 → 内容复盘
```

with:

```text
写作台 → 渠道版本 → 发布前检查 → 发布 → 发布记录
```

- [x] **Step 3: Remove deleted feature sections**

Delete README sections for:

- AI 选题台
- RSS 聚合
- 信号收件箱
- 选题库
- Brief 生成
- 内容复盘
- Analytics 数据看板
- Calendar 排期
- Copilot 推荐

Keep sections for:

- 写作台
- 平台适配
- 发布检查
- 多平台发布
- 设置

- [x] **Step 4: Update configuration docs**

In `docs/configuration.md`, remove configuration sections for:

- RSS sources
- scheduler
- analytics metrics
- copilot profile
- workspace import/export

Keep:

- platform credentials
- Agent base URL/API key/model
- GitHub image upload configuration

- [x] **Step 5: Update project instructions**

In `AGENTS.md` and `CLAUDE.md`, update architecture lists to remove deleted directories and routes. The retained architecture summary should mention:

```text
src/app/page.tsx and page-client.tsx: writing workspace
src/app/drafts: draft library
src/app/settings: settings
src/app/api/drafts: draft CRUD
src/app/api/platform-variants: channel variants
src/app/api/publish: publish flow
src/app/api/sync-tasks: publish status records
src/lib/drafts, platformVariants, platformAdapters, publishChecks, publishers, sync
```

- [x] **Step 6: Verify documentation has no stale feature claims**

Run:

```bash
rg "AI 新闻|选题|信号|Brief|复盘|数据看板|排期日历|RSS|Copilot|analytics|calendar|ai-news|topics|signals|feedback" README.md README_zh.md docs AGENTS.md CLAUDE.md
```

Expected: no stale claims. If `feedback` appears as generic UI feedback, rewrite to “提示组件” where possible.

- [x] **Step 7: Commit**

Run:

```bash
git add README.md README_zh.md docs/configuration.md AGENTS.md CLAUDE.md
git commit -m "docs: update publio core product scope"
```

---

## 6. Verification Matrix

### 6.1 Automated verification after every code commit

Run:

```bash
pnpm lint
pnpm test
pnpm build
```

Expected: all pass.

### 6.2 Full verification at the end

Run:

```bash
pnpm verify
```

Expected:

```text
check:no-js-source passes
lint passes
test passes
build passes
```

### 6.3 Manual browser verification

Start dev server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

Verify:

- Sidebar shows only 写作台、稿件库、设置.
- 首页标题 still reads 写作台.
- Markdown editor loads.
- Typing content triggers autosave.
- 新建草稿 works.
- 稿件库 can open the saved draft.
- 平台选择 works for 微信公众号、小红书、知乎、X.
- 渠道版本 panel opens and content can be edited.
- 发布前检查 returns warnings instead of crashing.
- 发布 button creates a sync task or a clear platform credential error.
- 设置页 loads and saves Agent/platform configuration.

### 6.4 Deleted surface verification

After implementation, these URLs should return 404:

```text
http://localhost:3000/ai-news
http://localhost:3000/analytics
http://localhost:3000/calendar
http://localhost:3000/feed/published.xml
http://localhost:3000/sync-tasks
http://localhost:3000/sync-tasks/example
```

These API paths should return 404:

```text
/api/ai-news
/api/briefs
/api/copilot/recommend
/api/feedback
/api/metrics
/api/rss-sources
/api/signals
/api/topics
```

These API paths should still work:

```text
/api/drafts
/api/platform-variants
/api/publish
/api/publish/check
/api/settings
/api/sync-tasks
/api/agent/status
/api/agent/write
/api/agent/adapt
```

---

## 7. Risk Register

### Risk 1: Stored JSON contains removed fields

Existing `.publio-data` records may still include `topicId`, `briefId`, signal/topic/brief data, or feedback files.

Mitigation:

- Do not delete user data files from `.publio-data` during code cleanup.
- Make draft readers tolerant of extra JSON keys.
- Stop writing removed fields going forward.

### Risk 2: Publish flow currently links to sync task pages

The publish overlay may link to `/sync-tasks` for details.

Mitigation:

- Keep `src/app/api/sync-tasks/**`.
- Delete `src/app/sync-tasks/**` and `src/components/sync/**`.
- Move required task status, receipt, event, retry, and failure detail display into retained write-page surfaces before deleting links.
- Run this command and require zero matches:

```bash
rg "\"/sync-tasks|'/sync-tasks|`/sync-tasks|href=\\{`/sync-tasks" src
```

### Risk 3: Settings imports removed RSS/Copilot components

Settings page may fail build after deleting non-core settings components.

Mitigation:

- Delete settings sections first, then delete component files.
- Use `rg "RssSourceManager|BrandProfileForm|StyleProfile|TopicRecommendationPanel"` before build.

### Risk 4: Agent actions are referenced by UI labels and stores

Removing actions from types can break slash command handling, AgentPanel copy, and write route validation.

Mitigation:

- Change types first.
- Let TypeScript reveal all references.
- Update UI labels and route validation in the same commit.

### Risk 5: Tests assert deleted route behavior

Existing route tests for signals/topics/briefs/feedback will fail.

Mitigation:

- Delete tests with deleted routes.
- Add retained core route smoke tests.
- Preserve publish/drafts/settings/sync/platform-variant tests.

---

## 8. Completion Criteria

The refactor is complete only when all items below are true:

- Main navigation contains only 写作台、稿件库、设置.
- The write page has no Signal/Topic/Brief/Workbench/Analytics/Calendar UI.
- The write page has no scheduled publishing UI unless it is implemented entirely inside the core publish flow.
- Removed pages return 404.
- Removed API routes return 404.
- `/sync-tasks` and `/sync-tasks/[id]` return 404; only `/api/sync-tasks/**` remains.
- Retained core APIs pass tests.
- `pnpm verify` passes.
- README and configuration docs describe the simplified product, not the old content-ops platform.
- No source references, CSS files, tests, fixtures, static resources, or dependencies remain for deleted domains except generic UI feedback components.

---

## 9. Recommended Execution Order

Execute in this order:

1. Commit this plan.
2. Simplify navigation.
3. Remove topic/brief UI from writer.
4. Delete non-core routes.
5. Delete non-core modules/components.
6. Simplify Agent actions.
7. Reconcile tests and dependencies.
8. Update docs.
9. Run full verification and browser smoke test.

This order keeps the app usable after each major step and lets TypeScript/build errors point directly to the next set of stale references.
