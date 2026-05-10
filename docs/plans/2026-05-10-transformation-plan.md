# Publio Personal Information, Writing, Publishing, and Agent Transformation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` for parallelizable implementation phases, or `superpowers:executing-plans` for sequential execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Publio 改造成个人用户的资讯获取、选题沉淀、写作生产、一键多渠道发布和 Agent 协助工作台。

**Architecture:** 以 `Source -> Signal -> Topic -> Brief -> Draft -> PlatformVariant -> PublishTask -> Feedback` 为核心对象链路重组产品能力。保留当前 Next.js App Router、TypeScript、vanilla-extract、Zustand、JSON 文件存储和 SSE Agent 架构，在现有模块上增量扩展，避免一次性替换底层存储或重写页面。

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict mode, vanilla-extract, Zustand, Vitest, local JSON collections, server-side SSE, LLM streaming provider.

---

## 0. 产品原则和边界

### 0.1 核心定位

Publio 的目标用户是个人创作者、研究型写作者、独立内容运营者和需要稳定输出内容的知识工作者。

产品要解决的不是单点写作问题，而是完整链路：

1. 用户每天从大量资讯里筛出值得关注的信号。
2. 用户把信号沉淀为可写选题。
3. 用户围绕选题形成观点、结构和素材。
4. 用户在写作台完成主稿。
5. 系统协助生成多个渠道版本。
6. 用户检查风险后发布或排期。
7. 系统追踪发布结果。
8. Agent 根据反馈反哺下一轮选题、写作和分发。

### 0.2 改造边界

本计划不做以下方向：

- 不做团队审批流。
- 不做多成员权限。
- 不做企业级账号矩阵管理。
- 不做广告投放管理。
- 不做复杂客户关系管理。
- 不做大规模舆情系统。
- 不直接替换本地 JSON 存储为数据库。
- 不重写现有写作台、发布器、Agent provider。

### 0.3 改造原则

- 先统一核心对象，再扩展页面能力。
- 每个阶段都必须能独立运行、测试和回滚。
- 每个提交只完成一个清晰行为，不把数据模型、UI、API、样式和测试混在一个巨型提交里。
- 所有用户可见状态都要给出下一步动作。
- 所有发布相关能力都要优先保证可恢复、可诊断、可追踪。
- Agent 不作为魔法按钮存在，而是嵌入当前任务上下文。

---

## 1. 当前状态摘要

### 1.1 已具备能力

当前项目已经具备以下基础：

- `src/app/ai-news/`：资讯聚合和选题台。
- `src/lib/ai-news/`：RSS 源、聚类、评分、研究分析。
- `src/lib/rss-sources/store.ts`：自定义 RSS 源。
- `src/app/page-client.tsx`：写作台主界面。
- `src/components/editor/`：Markdown 编辑器、模板、媒体库、版本历史、上下文卡片。
- `src/lib/drafts/`：草稿存储、导入导出、客户端访问。
- `src/stores/publishStore.ts`：写作内容、渠道选择、渠道草稿和发布状态。
- `src/lib/platformAdapters/`：内容适配。
- `src/lib/platformRules/`：渠道规则校验。
- `src/lib/moderation/`：敏感词检测。
- `src/lib/publishers/`：各渠道发布器和发布任务 runner。
- `src/lib/sync/`：分发任务和回执状态。
- `src/lib/scheduler/`：定时发布检查。
- `src/lib/metrics/`：发布后指标记录和刷新。
- `src/lib/agent/`：Agent 配置、provider、SSE、prompts。
- `src/lib/copilot/`：品牌画像、风格画像、推荐能力。
- `src/app/calendar/`：内容排期日历。
- `src/app/analytics/`：数据看板。
- `src/app/settings/`：凭证、Agent、RSS、prompt、画像配置。

### 1.2 主要结构缺口

当前能力之间已经连通，但核心对象还没有完全产品化：

- 资讯列表和写作草稿之间缺少稳定的 `Topic` 与 `Brief` 层。
- 主稿和渠道版本之间缺少一等模型，渠道草稿主要挂在前端状态里。
- 发布前检查能力分散在规则校验、敏感词、发布确认和渠道状态里。
- 发布后的数据还没有稳定反哺选题和写作。
- Agent 已覆盖多个入口，但缺少统一任务上下文和可解释的行动建议。

---

## 2. 目标对象模型

### 2.1 Source

`Source` 表示资讯来源。

职责：

- 记录来源类型、名称、地址、启用状态、更新时间。
- 支持 RSS 源、手动链接、导入文章、后续可扩展的列表型来源。
- 为每条 `Signal` 提供可追溯来源。

建议字段：

```ts
type SourceType = 'rss' | 'url' | 'manual' | 'import';

type Source = {
  id: string;
  type: SourceType;
  name: string;
  url?: string;
  enabled: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastFetchedAt?: string;
  lastError?: string;
};
```

### 2.2 Signal

`Signal` 表示一条被系统捕获的资讯信号。

职责：

- 保存标题、摘要、原文链接、来源、发布时间、抓取时间。
- 保存系统评分和用户状态。
- 支持收藏、忽略、稍后处理、转为选题。

建议字段：

```ts
type SignalStatus = 'new' | 'saved' | 'dismissed' | 'converted';

type Signal = {
  id: string;
  sourceId: string;
  title: string;
  summary: string;
  url?: string;
  author?: string;
  publishedAt?: string;
  capturedAt: string;
  status: SignalStatus;
  tags: string[];
  score: {
    freshness: number;
    relevance: number;
    credibility: number;
    writingPotential: number;
    audienceFit: number;
  };
  notes?: string;
};
```

### 2.3 Topic

`Topic` 表示一个可写选题，不等同于单条资讯。

职责：

- 聚合一条或多条 `Signal`。
- 保存选题角度、目标读者、推荐渠道、写作价值。
- 进入选题库后可独立管理状态。

建议字段：

```ts
type TopicStatus = 'idea' | 'researching' | 'briefed' | 'drafting' | 'published' | 'archived';

type Topic = {
  id: string;
  title: string;
  angle: string;
  summary: string;
  signalIds: string[];
  status: TopicStatus;
  tags: string[];
  targetAudience?: string;
  recommendedPlatforms: PlatformId[];
  writingValue: number;
  urgency: number;
  createdAt: string;
  updatedAt: string;
};
```

### 2.4 Brief

`Brief` 表示写作任务说明，是从选题进入写作前的结构化上下文。

职责：

- 明确文章要解决什么问题、面向谁、主观点是什么。
- 保存推荐结构、素材、引用来源、渠道策略。
- 作为 Agent 写作、适配和复盘的上下文输入。

建议字段：

```ts
type Brief = {
  id: string;
  topicId: string;
  workingTitle: string;
  thesis: string;
  audience: string;
  tone: string;
  outline: Array<{
    heading: string;
    purpose: string;
    evidenceSignalIds: string[];
  }>;
  sourceLinks: Array<{
    title: string;
    url: string;
    signalId?: string;
  }>;
  platformPlan: Array<{
    platform: PlatformId;
    intent: string;
    estimatedLength: number;
  }>;
  createdAt: string;
  updatedAt: string;
};
```

### 2.5 Draft

`Draft` 继续表示主稿。

职责：

- 保存标题、正文、状态、版本历史。
- 可关联 `Topic` 和 `Brief`。
- 主稿只保存跨渠道通用内容，不直接承担渠道差异。

建议扩展字段：

```ts
type DraftLinkage = {
  topicId?: string;
  briefId?: string;
  campaignId?: string;
  tags: string[];
  contentGoal?: string;
};
```

### 2.6 PlatformVariant

`PlatformVariant` 表示某个渠道的最终稿件版本。

职责：

- 保存从主稿派生出来的渠道内容。
- 支持单独编辑、检查、排期、发布。
- 保存与主稿的同步状态。

建议字段：

```ts
type VariantStatus = 'synced' | 'adapted' | 'edited' | 'checked' | 'scheduled' | 'published';

type PlatformVariant = {
  id: string;
  draftId: string;
  platform: PlatformId;
  title: string;
  content: string;
  status: VariantStatus;
  generatedByAgent: boolean;
  manuallyEdited: boolean;
  lastSyncedFromDraftAt?: string;
  checkSummary?: PublishCheckSummary;
  createdAt: string;
  updatedAt: string;
};
```

### 2.7 PublishTask

`PublishTask` 继续由当前 `sync` 和 `publishers` 承担。

职责扩展：

- 关联 `PlatformVariant`。
- 保存发布前检查快照。
- 保存事件时间线。
- 保存失败码、用户可执行修复建议。

### 2.8 Feedback

`Feedback` 表示发布后的数据和复盘结论。

职责：

- 聚合指标。
- 连接到 `Draft`、`PlatformVariant`、`Topic`。
- 支持 Agent 生成复盘建议。

建议字段：

```ts
type Feedback = {
  id: string;
  draftId: string;
  variantId?: string;
  platform: PlatformId;
  metricId?: string;
  summary: string;
  learnings: string[];
  nextActions: string[];
  createdAt: string;
};
```

---

## 3. 阶段总览

### Phase 1: 资讯 Inbox 和选题库

目标：

- 把资讯从“列表”升级为个人可处理的信息 Inbox。
- 建立 `Signal` 和 `Topic` 两个对象。
- 让用户能从资讯进入选题库，再进入写作 Brief。

交付：

- Signal 本地存储。
- Topic 本地存储。
- 资讯状态操作。
- 选题库页面或选题台内选题库区域。
- 从 Signal 创建 Topic。
- 基础测试。

### Phase 2: Brief 和写作上下文

目标：

- 在写作前增加结构化 Brief。
- 让 Agent、写作台、草稿都能读取相同上下文。
- 把资讯、选题、素材、引用带入写作。

交付：

- Brief 类型和存储。
- Brief 创建 API。
- Brief 编辑 UI。
- Draft 关联 Topic/Brief。
- 写作台上下文侧栏升级。
- 相关 Agent prompt 输入扩展。

### Phase 3: 渠道版本管理

目标：

- 将“主稿”和“渠道版本”分离。
- 平台适配结果可保存、可检查、可单独编辑。
- 发布时使用稳定的渠道版本，而不是临时前端状态。

交付：

- PlatformVariant 类型和存储。
- 渠道版本 API。
- 写作台渠道版本面板。
- 适配结果落库。
- 发布 API 改用版本快照。
- 测试覆盖发布 payload。

### Phase 4: 发布前质量门和发布可靠性

目标：

- 发布前统一检查内容、渠道、凭证、限制和风险。
- 失败信息从错误文本升级为结构化修复建议。
- 发布任务事件时间线更清晰。

交付：

- PublishCheck 模型。
- 统一检查服务。
- 发布确认弹窗升级。
- 渠道连接健康检查卡片。
- 失败码与修复动作标准化。
- 同步任务详情页事件线增强。

### Phase 5: Agent 全链路协助

目标：

- Agent 从单点写作按钮升级为贯穿资讯、选题、Brief、写作、适配、发布、复盘的任务助手。
- Agent 输出必须包含可执行下一步。

交付：

- Agent context builder。
- 资讯筛选建议。
- 选题写作包生成。
- Brief 辅助生成。
- 渠道适配说明。
- 发布诊断增强。
- 复盘建议生成。

### Phase 6: 内容复盘和个人运营洞察

目标：

- 数据看板从展示指标升级为回答“什么值得继续写”。
- 反馈结果反哺选题、风格和发布策略。

交付：

- Feedback 存储。
- 指标按 Topic、Tag、PlatformVariant 聚合。
- 内容复盘页面模块。
- Agent 复盘 API。
- 写作台和选题库显示复盘提示。

### Phase 7: 体验收束和长期维护

目标：

- 让整个工作流成为一条清晰主路径。
- 补齐导入导出、空状态、错误状态、迁移策略和文档。

交付：

- 首页工作台待办化。
- 空状态和错误状态统一。
- 本地数据迁移工具。
- README 和使用文档更新。
- 全量验证。

---

## 4. Phase 1: 资讯 Inbox 和选题库

### Task 1.1: 建立 Signal 类型和存储

**Files:**

- Create: `src/lib/signals/types.ts`
- Create: `src/lib/signals/store.ts`
- Create: `src/lib/signals/__tests__/store.test.ts`
- Modify: `src/types/index.ts`

**Commit:** `feat: add signal storage model`

- [ ] 定义 `Signal`, `SignalStatus`, `SignalScore`, `CreateSignalInput`, `UpdateSignalInput`。
- [ ] 使用 `jsonFileCollection` 建立 `signals` collection。
- [ ] 提供 `listSignals`, `getSignal`, `createSignal`, `updateSignal`, `deleteSignal`, `upsertSignalFromFeedItem`。
- [ ] `upsertSignalFromFeedItem` 使用 URL 或标题+来源去重。
- [ ] 测试创建、更新状态、去重、按时间倒序。
- [ ] 运行 `pnpm test src/lib/signals/__tests__/store.test.ts`。

实现要点：

- 不改动现有 `src/lib/ai-news/` 聚类逻辑。
- `Signal` 是原子资讯项，`ai-news` 聚类结果可以后续转换为 `Topic`。
- `status` 默认 `new`。
- `score.writingPotential` 默认从现有 `ai-news` score 推导，缺失时使用 `0`。

### Task 1.2: 新增 Signals API

**Files:**

- Create: `src/app/api/signals/route.ts`
- Create: `src/app/api/signals/[id]/route.ts`
- Create: `src/app/api/signals/__tests__/route.test.ts`

**Commit:** `feat: expose signal inbox api`

- [ ] `GET /api/signals` 返回按 `capturedAt desc` 排序的信号。
- [ ] 支持 query：`status`, `tag`, `sourceId`, `q`。
- [ ] `POST /api/signals` 支持手动保存链接或手动记录资讯。
- [ ] `PATCH /api/signals/[id]` 支持更新状态、标签、备注。
- [ ] `DELETE /api/signals/[id]` 删除信号。
- [ ] 所有错误使用 `apiResponse` / `apiError`。
- [ ] 测试列表、筛选、创建、状态更新、删除。
- [ ] 运行 `pnpm test src/app/api/signals/__tests__/route.test.ts`。

实现要点：

- 查询参数非法时返回 400。
- 删除不存在的 id 返回 404。
- 手动创建时必须有 `title`，`url` 可选。

### Task 1.3: 将 AI 选题台抓取结果沉淀为 Signal

**Files:**

- Modify: `src/app/api/ai-news/route.ts`
- Modify: `src/lib/ai-news/types.ts`
- Modify: `src/lib/ai-news/index.ts`
- Test: `src/lib/ai-news/__tests__/sources.test.ts` 或新增对应 route test

**Commit:** `feat: persist news signals from topic desk`

- [ ] 在资讯抓取完成后，将原始 feed item 或 normalized article upsert 到 `signals`。
- [ ] API 响应中保留现有字段，新增 `signalIds` 或在每条 signal 上附加 `signalId`。
- [ ] 去重逻辑不能影响现有选题聚类结果。
- [ ] 测试重复调用不会产生重复 Signal。
- [ ] 运行 `pnpm test src/lib/ai-news/__tests__`。

实现要点：

- 该提交不得修改 UI。
- 该提交只完成数据沉淀。
- 抓取失败时不写入 Signal。

### Task 1.4: 建立 Topic 类型和存储

**Files:**

- Create: `src/lib/topics/types.ts`
- Create: `src/lib/topics/store.ts`
- Create: `src/lib/topics/__tests__/store.test.ts`
- Modify: `src/types/index.ts`

**Commit:** `feat: add topic library storage`

- [ ] 定义 `Topic`, `TopicStatus`, `CreateTopicInput`, `UpdateTopicInput`。
- [ ] 提供 `listTopics`, `getTopic`, `createTopic`, `updateTopic`, `archiveTopic`, `createTopicFromSignals`。
- [ ] `createTopicFromSignals` 从 Signal 标题和摘要生成默认 title、summary、signalIds。
- [ ] `recommendedPlatforms` 默认从当前支持渠道推导，不强制用户选择。
- [ ] 测试单信号、多信号、归档、状态流转。
- [ ] 运行 `pnpm test src/lib/topics/__tests__/store.test.ts`。

状态流转规则：

- `idea -> researching -> briefed -> drafting -> published`
- 任意状态可进入 `archived`
- `published` 不允许回到 `idea`

### Task 1.5: 新增 Topics API

**Files:**

- Create: `src/app/api/topics/route.ts`
- Create: `src/app/api/topics/[id]/route.ts`
- Create: `src/app/api/topics/from-signals/route.ts`
- Create: `src/app/api/topics/__tests__/route.test.ts`

**Commit:** `feat: expose topic library api`

- [ ] `GET /api/topics` 支持 `status`, `tag`, `q`。
- [ ] `POST /api/topics` 手动创建选题。
- [ ] `POST /api/topics/from-signals` 从一个或多个 Signal 创建选题。
- [ ] 成功转换后，将相关 Signal 状态改为 `converted`。
- [ ] `PATCH /api/topics/[id]` 更新标题、角度、状态、标签、推荐渠道。
- [ ] `DELETE /api/topics/[id]` 执行归档，不物理删除。
- [ ] 测试从 Signal 创建 Topic 后 Signal 状态变化。
- [ ] 运行 `pnpm test src/app/api/topics/__tests__/route.test.ts`。

### Task 1.6: 资讯 Inbox UI

**Files:**

- Create: `src/components/news/SignalInbox.tsx`
- Create: `src/components/news/SignalInbox.css.ts`
- Modify: `src/components/news/AiNewsPageClient.tsx`
- Modify: `src/components/news/news.css.ts`

**Commit:** `feat: add signal inbox interactions`

- [ ] 在选题台增加 Inbox 区域。
- [ ] 每条 Signal 显示标题、摘要、来源、时间、评分、状态。
- [ ] 操作包括：保存、忽略、添加标签、加入选题。
- [ ] 已忽略的 Signal 默认隐藏，可通过筛选显示。
- [ ] 操作失败时显示 toast 或局部错误。
- [ ] 空状态文案必须说明下一步动作。
- [ ] 保持移动端可用，不引入横向滚动。
- [ ] 运行 `pnpm lint`。

交互要求：

- “加入选题”允许单条转换。
- 多选转换可后置到 Task 1.7。
- 操作按钮使用现有图标风格和按钮密度。

### Task 1.7: 选题库 UI

**Files:**

- Create: `src/components/news/TopicLibrary.tsx`
- Create: `src/components/news/TopicLibrary.css.ts`
- Modify: `src/components/news/AiNewsPageClient.tsx`
- Optional Create: `src/app/topics/page.tsx`
- Optional Modify: `src/components/layout/Sidebar.tsx`

**Commit:** `feat: add topic library workspace`

- [ ] 展示选题卡片：标题、角度、状态、标签、推荐渠道、关联 Signal 数量。
- [ ] 支持状态筛选。
- [ ] 支持从选题进入 Brief 创建入口。
- [ ] 支持归档。
- [ ] 如果新增独立 `/topics` 页面，则侧边栏增加“选题库”；如果不新增页面，则在 `/ai-news` 内以 tab 呈现。
- [ ] 为选题库增加空状态。
- [ ] 运行 `pnpm lint`。

推荐选择：

- 初期放在 `/ai-news` 内，用 “资讯 Inbox / 选题库” 分段切换。
- 当选题对象稳定后再拆独立页面。

### Task 1.8: Phase 1 验证和提交收束

**Files:**

- Modify: `README_zh.md`
- Modify: `README.md`

**Commit:** `docs: document signal and topic workflow`

- [ ] 更新功能说明，加入资讯 Inbox 和选题库。
- [ ] 运行 `pnpm test src/lib/signals src/lib/topics src/app/api/signals src/app/api/topics`。
- [ ] 运行 `pnpm lint`。
- [ ] 运行 `pnpm build`。
- [ ] 手动验证：进入选题台，抓取资讯，保存 Signal，转换 Topic，归档 Topic。
- [ ] 记录任何未完成事项到后续阶段，不在 Phase 1 偷偷扩展。

---

## 5. Phase 2: Brief 和写作上下文

### Task 2.1: 建立 Brief 类型和存储

**Files:**

- Create: `src/lib/briefs/types.ts`
- Create: `src/lib/briefs/store.ts`
- Create: `src/lib/briefs/__tests__/store.test.ts`
- Modify: `src/types/index.ts`

**Commit:** `feat: add writing brief storage`

- [ ] 定义 `Brief`, `BriefOutlineItem`, `BriefSourceLink`, `BriefPlatformPlan`。
- [ ] 提供 `listBriefs`, `getBrief`, `getBriefByTopicId`, `createBrief`, `updateBrief`, `deleteBrief`。
- [ ] `createBrief` 必须关联 `topicId`。
- [ ] 如果 Topic 不存在，返回明确错误。
- [ ] 测试创建、更新大纲、关联 Topic、删除。
- [ ] 运行 `pnpm test src/lib/briefs/__tests__/store.test.ts`。

### Task 2.2: Brief API

**Files:**

- Create: `src/app/api/briefs/route.ts`
- Create: `src/app/api/briefs/[id]/route.ts`
- Create: `src/app/api/topics/[id]/brief/route.ts`
- Create: `src/app/api/briefs/__tests__/route.test.ts`

**Commit:** `feat: expose writing brief api`

- [ ] `GET /api/briefs` 支持 `topicId`。
- [ ] `POST /api/briefs` 创建 Brief。
- [ ] `GET /api/topics/[id]/brief` 返回该 Topic 的 Brief，不存在时返回 404。
- [ ] `POST /api/topics/[id]/brief` 从 Topic 创建默认 Brief。
- [ ] 创建成功后 Topic 状态改为 `briefed`。
- [ ] 测试 Topic 状态变化。
- [ ] 运行 `pnpm test src/app/api/briefs/__tests__/route.test.ts`。

### Task 2.3: Brief 编辑组件

**Files:**

- Create: `src/components/briefs/BriefEditor.tsx`
- Create: `src/components/briefs/BriefEditor.css.ts`
- Create: `src/components/briefs/BriefSourceList.tsx`
- Create: `src/components/briefs/BriefOutlineEditor.tsx`
- Modify: `src/components/news/TopicLibrary.tsx`

**Commit:** `feat: add brief editor`

- [ ] Brief 编辑器包含：工作标题、核心观点、目标读者、语气、大纲、来源链接、渠道计划。
- [ ] 大纲项支持新增、删除、编辑标题和用途。
- [ ] 来源链接从关联 Signal 自动填充。
- [ ] 渠道计划默认覆盖已支持渠道，可删除不需要的渠道。
- [ ] 保存失败保留用户输入。
- [ ] 无 Agent 配置时 Brief 编辑照常可用。
- [ ] 运行 `pnpm lint`。

### Task 2.4: Draft 关联 Topic 和 Brief

**Files:**

- Modify: `src/lib/drafts/types.ts`
- Modify: `src/lib/drafts/store.ts`
- Modify: `src/lib/drafts/__tests__/store.test.ts`
- Modify: `src/app/api/drafts/route.ts`
- Modify: `src/app/api/drafts/[id]/route.ts`
- Modify: `src/stores/publishStore.ts`

**Commit:** `feat: link drafts to topics and briefs`

- [ ] 为 Draft 增加可选 `topicId`, `briefId`, `tags`, `contentGoal`。
- [ ] 兼容旧草稿，没有新字段时默认空。
- [ ] 创建草稿时可传入 `topicId` 和 `briefId`。
- [ ] 从 Brief 创建草稿后 Topic 状态改为 `drafting`。
- [ ] `publishStore` 增加当前 `topicId` 和 `briefId`。
- [ ] 测试旧草稿读取兼容性。
- [ ] 运行 `pnpm test src/lib/drafts src/app/api/drafts`。

### Task 2.5: 从 Brief 进入写作台

**Files:**

- Modify: `src/components/news/TopicLibrary.tsx`
- Modify: `src/app/page-client.tsx`
- Modify: `src/components/editor/EditorialContextCard.tsx`
- Create: `src/components/editor/WritingBriefCard.tsx`
- Create: `src/components/editor/WritingBriefCard.css.ts`

**Commit:** `feat: surface brief context in editor`

- [ ] 在 TopicLibrary 中增加“开始写作”入口。
- [ ] 入口创建或读取 Brief，再创建草稿，跳转 `/?draftId=...`。
- [ ] 写作台加载草稿后读取 Brief。
- [ ] 右侧上下文显示核心观点、目标读者、大纲、来源链接。
- [ ] 用户可折叠 Brief 卡片。
- [ ] 运行 `pnpm lint`。

### Task 2.6: Agent 写作上下文扩展

**Files:**

- Create: `src/lib/agent/context.ts`
- Modify: `src/app/api/agent/write/route.ts`
- Modify: `src/lib/agent/prompts/writing.ts`
- Modify: `src/lib/agent/__tests__/inputLimits.test.ts` 或新增 context test

**Commit:** `feat: include brief context in writing agent`

- [ ] 新增 `buildWritingAgentContext({ draftId, topicId, briefId })`。
- [ ] 写作 Agent 输入中加入 Brief 的核心观点、读者、语气、大纲和来源。
- [ ] 控制上下文长度，超过限制时优先保留核心观点和大纲。
- [ ] 没有 Brief 时保持当前行为。
- [ ] 测试有 Brief 和无 Brief 两种情况。
- [ ] 运行 `pnpm test src/lib/agent`。

### Task 2.7: Phase 2 验证

**Commit:** `docs: document brief-driven writing workflow`

- [ ] 更新 README 的写作流程说明。
- [ ] 运行 `pnpm test src/lib/briefs src/lib/drafts src/lib/agent`。
- [ ] 运行 `pnpm lint`。
- [ ] 运行 `pnpm build`。
- [ ] 手动验证：Signal -> Topic -> Brief -> Draft -> Agent 写作。

---

## 6. Phase 3: 渠道版本管理

### Task 3.1: 建立 PlatformVariant 类型和存储

**Files:**

- Create: `src/lib/platformVariants/types.ts`
- Create: `src/lib/platformVariants/store.ts`
- Create: `src/lib/platformVariants/__tests__/store.test.ts`
- Modify: `src/types/index.ts`

**Commit:** `feat: add platform variant storage`

- [ ] 定义 `PlatformVariant`, `VariantStatus`, `CreatePlatformVariantInput`, `UpdatePlatformVariantInput`。
- [ ] 提供 `listVariantsByDraft`, `getVariant`, `getVariantByDraftAndPlatform`, `createVariant`, `updateVariant`, `syncVariantsFromDraft`。
- [ ] `syncVariantsFromDraft` 只更新 `status === 'synced'` 且未手工编辑的版本。
- [ ] 手工编辑后 `manuallyEdited = true`，避免主稿覆盖。
- [ ] 测试同步、手工编辑保护、按渠道读取。
- [ ] 运行 `pnpm test src/lib/platformVariants/__tests__/store.test.ts`。

### Task 3.2: PlatformVariant API

**Files:**

- Create: `src/app/api/drafts/[id]/variants/route.ts`
- Create: `src/app/api/platform-variants/[id]/route.ts`
- Create: `src/app/api/platform-variants/__tests__/route.test.ts`

**Commit:** `feat: expose platform variant api`

- [ ] `GET /api/drafts/[id]/variants` 返回草稿所有渠道版本。
- [ ] `POST /api/drafts/[id]/variants` 创建或同步版本。
- [ ] `PATCH /api/platform-variants/[id]` 更新标题、内容、状态。
- [ ] `DELETE /api/platform-variants/[id]` 删除版本。
- [ ] 测试主稿不存在、版本不存在、手工编辑保护。
- [ ] 运行 `pnpm test src/app/api/platform-variants/__tests__/route.test.ts`。

### Task 3.3: publishStore 迁移到版本模型

**Files:**

- Modify: `src/stores/publishStore.ts`
- Modify: `src/stores/__tests__/publishStore.test.ts`
- Modify: `src/app/page-client.tsx`

**Commit:** `refactor: manage platform drafts as variants`

- [ ] 保留现有 `platformDrafts` 对外行为，内部增加 `variantIds` 或版本快照。
- [ ] 主稿内容变化时只同步未手工编辑版本。
- [ ] 用户手工编辑渠道内容时设置 edited 状态。
- [ ] 老逻辑兼容：没有 variant 时仍可从主稿生成临时预览。
- [ ] 测试平台草稿同步、手工编辑不被覆盖。
- [ ] 运行 `pnpm test src/stores/__tests__/publishStore.test.ts`。

### Task 3.4: 适配结果落库

**Files:**

- Modify: `src/components/publish/PlatformAdaptButton.tsx`
- Modify: `src/app/api/agent/adapt/route.ts`
- Modify: `src/lib/platformAdapters/adaptContent.ts`
- Modify: `src/lib/platformAdapters/__tests__/adaptContent.test.ts`

**Commit:** `feat: save adapted content as platform variants`

- [ ] Agent 适配成功后写入对应 PlatformVariant。
- [ ] 保存适配结果时记录 `generatedByAgent = true`。
- [ ] 如果用户已手工编辑，保存前显示覆盖确认或保存为新版本策略；初期选择覆盖确认。
- [ ] 适配失败不修改已有版本。
- [ ] 测试适配结果结构保持平台规则。
- [ ] 运行 `pnpm test src/lib/platformAdapters`。

### Task 3.5: 渠道版本面板

**Files:**

- Create: `src/components/publish/PlatformVariantPanel.tsx`
- Create: `src/components/publish/PlatformVariantPanel.css.ts`
- Modify: `src/components/publish/PlatformPreviewPanel.tsx`
- Modify: `src/app/page-client.tsx`

**Commit:** `feat: add platform variant editing panel`

- [ ] 右侧发布区按渠道显示版本状态。
- [ ] 每个渠道可查看标题、正文、字数、规则校验结果。
- [ ] 支持单独编辑渠道版本。
- [ ] 支持从主稿重新同步当前渠道。
- [ ] 支持运行单渠道适配。
- [ ] 清楚标识主稿同步、Agent 生成、用户编辑状态。
- [ ] 运行 `pnpm lint`。

### Task 3.6: 发布 API 使用版本快照

**Files:**

- Modify: `src/app/api/publish/route.ts`
- Modify: `src/components/publish/PublishButton.tsx`
- Modify: `src/lib/publishers/executePublish.ts`
- Modify: `src/app/api/publish/__tests__/route.test.ts`

**Commit:** `feat: publish stable platform variant snapshots`

- [ ] 发布请求传入 `variantIds` 或后端根据 `draftId + selectedPlatforms` 读取版本。
- [ ] 发布任务保存每个渠道的标题和正文快照。
- [ ] 如果某渠道没有版本，后端生成 synced 版本再发布。
- [ ] 发布后对应 PlatformVariant 状态变为 `published`。
- [ ] 测试发布 payload 使用渠道版本内容。
- [ ] 运行 `pnpm test src/app/api/publish/__tests__/route.test.ts src/lib/publishers/__tests__`。

### Task 3.7: Phase 3 验证

**Commit:** `docs: document platform variant workflow`

- [ ] README 增加主稿和渠道版本说明。
- [ ] 运行 `pnpm test src/lib/platformVariants src/stores src/app/api/publish src/lib/publishers`。
- [ ] 运行 `pnpm lint`。
- [ ] 运行 `pnpm build`。
- [ ] 手动验证：主稿改动、渠道版本编辑、Agent 适配、发布 payload。

---

## 7. Phase 4: 发布前质量门和发布可靠性

### Task 4.1: PublishCheck 类型和服务

**Files:**

- Create: `src/lib/publishChecks/types.ts`
- Create: `src/lib/publishChecks/runChecks.ts`
- Create: `src/lib/publishChecks/__tests__/runChecks.test.ts`
- Modify: `src/lib/platformRules/validate.ts`
- Modify: `src/lib/moderation/check.ts`

**Commit:** `feat: add unified publish checks`

- [ ] 定义 `PublishCheckResult`, `PublishCheckSeverity`, `PublishCheckSummary`。
- [ ] 检查项包括：标题、正文长度、空内容、敏感词、渠道规则、图片链接、连接状态、版本状态。
- [ ] 每个检查项必须有 `message` 和 `nextAction`。
- [ ] `error` 阻止发布，`warning` 允许强制发布，`info` 只提示。
- [ ] 测试每类 severity。
- [ ] 运行 `pnpm test src/lib/publishChecks`。

### Task 4.2: PublishCheck API

**Files:**

- Create: `src/app/api/publish/check/route.ts`
- Create: `src/app/api/publish/check/__tests__/route.test.ts`

**Commit:** `feat: expose publish check api`

- [ ] `POST /api/publish/check` 接收 `draftId`, `platforms`, `variantIds`。
- [ ] 返回按渠道分组的检查结果。
- [ ] 没有版本时返回可恢复提示，而不是直接 500。
- [ ] Agent 未配置不影响检查。
- [ ] 测试正常、warning、error、缺失版本。
- [ ] 运行 `pnpm test src/app/api/publish/check`。

### Task 4.3: 发布确认弹窗升级

**Files:**

- Modify: `src/components/publish/PublishConfirmDialog.tsx`
- Modify: `src/components/publish/publishConfirm.css.ts`
- Modify: `src/components/publish/PublishButton.tsx`
- Modify: `src/components/publish/__tests__/PublishButton.test.tsx`

**Commit:** `feat: show publish readiness checks before publishing`

- [ ] 点击发布先调用 `/api/publish/check`。
- [ ] 弹窗展示每个渠道的阻断项、警告项和信息项。
- [ ] `error` 存在时发布按钮禁用。
- [ ] `warning` 存在时允许用户确认继续。
- [ ] 强制发布需要在请求里传 `forcePublish: true`。
- [ ] 测试 error 阻断和 warning 强制发布。
- [ ] 运行 `pnpm test src/components/publish/__tests__/PublishButton.test.tsx`。

### Task 4.4: 渠道连接健康检查强化

**Files:**

- Modify: `src/lib/platformConnections/checkers.ts`
- Modify: `src/lib/platformConnections/types.ts`
- Modify: `src/lib/platformConnections/__tests__/index.test.ts`
- Modify: `src/app/settings/platformSettings.tsx`
- Modify: `src/components/settings/settings.css.ts`

**Commit:** `feat: improve platform connection health checks`

- [ ] 健康状态包含 `configured`, `valid`, `expiresAt`, `lastCheckedAt`, `missingFields`, `nextAction`。
- [ ] 设置页显示每个渠道的连接状态。
- [ ] 缺字段时直接告诉用户缺哪个变量或配置项。
- [ ] 支持手动重新检查。
- [ ] 测试配置缺失、配置完整、检查失败。
- [ ] 运行 `pnpm test src/lib/platformConnections`。

### Task 4.5: 发布失败码和修复建议

**Files:**

- Modify: `src/lib/publishers/executePublish.ts`
- Modify: `src/lib/publishers/types.ts`
- Modify: `src/lib/publishers/__tests__/failureCode.test.ts`
- Modify: `src/components/sync/SyncTaskDetail.tsx`

**Commit:** `feat: standardize publish failure recovery`

- [ ] 扩展失败码：`auth_missing`, `auth_expired`, `rate_limited`, `content_rejected`, `network_error`, `platform_unavailable`, `unknown`。
- [ ] 每个失败码映射用户可执行 `nextAction`。
- [ ] SyncTaskDetail 展示失败码、原因、下一步。
- [ ] 重试按钮旁显示适用条件。
- [ ] 测试错误文本到失败码映射。
- [ ] 运行 `pnpm test src/lib/publishers/__tests__/failureCode.test.ts`。

### Task 4.6: 发布任务事件时间线

**Files:**

- Modify: `src/lib/sync/types.ts`
- Modify: `src/lib/sync/store.ts`
- Modify: `src/lib/sync/__tests__/eventLog.test.ts`
- Modify: `src/components/sync/SyncTaskDetail.tsx`
- Modify: `src/components/sync/sync.css.ts`

**Commit:** `feat: enhance publish task event timeline`

- [ ] 事件类型覆盖：created, checked, queued, started, platform_started, platform_succeeded, platform_failed, retry_requested, manually_marked_done。
- [ ] 发布检查结果写入事件。
- [ ] UI 用时间线显示每一步。
- [ ] 每个事件显示时间、渠道、状态、消息。
- [ ] 测试事件追加顺序。
- [ ] 运行 `pnpm test src/lib/sync/__tests__/eventLog.test.ts`。

### Task 4.7: Phase 4 验证

**Commit:** `docs: document publish readiness and recovery workflow`

- [ ] README 增加发布检查和失败恢复说明。
- [ ] 运行 `pnpm test src/lib/publishChecks src/lib/platformConnections src/lib/publishers src/lib/sync src/components/publish src/components/sync`。
- [ ] 运行 `pnpm lint`。
- [ ] 运行 `pnpm build`。
- [ ] 手动验证：缺凭证、敏感词、超长内容、渠道版本缺失、发布失败重试。

---

## 8. Phase 5: Agent 全链路协助

### Task 5.1: Agent Context Builder

**Files:**

- Create: `src/lib/agent/contextBuilder.ts`
- Create: `src/lib/agent/contextBuilder.test.ts`
- Modify: `src/lib/agent/types.ts`

**Commit:** `feat: add unified agent context builder`

- [ ] 定义 `AgentTaskContext`，包含当前阶段、Signal、Topic、Brief、Draft、PlatformVariant、PublishTask、Feedback 摘要。
- [ ] 提供 `buildAgentContext(input)`。
- [ ] 上下文长度超限时按优先级裁剪。
- [ ] 裁剪优先级：用户当前输入 > Brief 核心观点 > Draft 当前内容 > 渠道版本 > 来源摘要 > 历史反馈。
- [ ] 测试不同输入组合和裁剪结果。
- [ ] 运行 `pnpm test src/lib/agent/contextBuilder.test.ts`。

### Task 5.2: 资讯筛选建议

**Files:**

- Create: `src/app/api/agent/signal-review/route.ts`
- Create: `src/lib/agent/prompts/signalReview.ts`
- Create: `src/components/news/SignalReviewPanel.tsx`
- Modify: `src/components/news/AiNewsPageClient.tsx`

**Commit:** `feat: add agent-assisted signal review`

- [ ] Agent 输入为最近 Signal 列表和用户品牌/风格画像。
- [ ] 输出必须包含：值得关注的信号、忽略理由、可合并选题、建议下一步。
- [ ] 无 Agent 配置时隐藏入口。
- [ ] SignalReviewPanel 支持一键保存 Signal 或创建 Topic。
- [ ] 输出不直接修改数据，用户确认后再执行。
- [ ] 运行 `pnpm lint`。

### Task 5.3: 选题写作包生成

**Files:**

- Create: `src/app/api/agent/topic-pack/route.ts`
- Create: `src/lib/agent/prompts/topicPack.ts`
- Modify: `src/components/news/TopicLibrary.tsx`
- Create: `src/components/news/TopicPackPanel.tsx`

**Commit:** `feat: generate topic writing packs`

- [ ] 对单个 Topic 生成写作包。
- [ ] 写作包包含：背景摘要、核心事实、可写角度、目标读者、反方观点、结构建议、渠道建议、来源链接。
- [ ] 用户可将写作包保存为 Brief。
- [ ] 保存 Brief 前允许用户编辑。
- [ ] 运行 `pnpm lint`。

### Task 5.4: Brief 辅助生成和改写

**Files:**

- Create: `src/app/api/agent/brief/route.ts`
- Create: `src/lib/agent/prompts/brief.ts`
- Modify: `src/components/briefs/BriefEditor.tsx`

**Commit:** `feat: assist writing brief creation`

- [ ] 支持从 Topic 和 Signals 生成 Brief 初稿。
- [ ] 支持改写核心观点。
- [ ] 支持补全大纲。
- [ ] 支持生成渠道计划。
- [ ] 每次 Agent 输出都显示差异，不自动覆盖用户已写内容。
- [ ] 运行 `pnpm lint`。

### Task 5.5: 渠道适配说明

**Files:**

- Modify: `src/app/api/agent/adapt/route.ts`
- Modify: `src/lib/agent/prompts/adaptation.ts`
- Modify: `src/components/publish/PlatformAdaptButton.tsx`
- Modify: `src/components/publish/PlatformVariantPanel.tsx`

**Commit:** `feat: explain platform adaptation decisions`

- [ ] 适配结果包含 `content` 和 `changeSummary`。
- [ ] `changeSummary` 说明标题、结构、长度、语气、标签处理。
- [ ] UI 在渠道版本旁显示适配说明。
- [ ] 用户可以接受、重新生成或手工编辑。
- [ ] 测试旧响应兼容。
- [ ] 运行 `pnpm test src/lib/platformAdapters src/app/api/agent`。

### Task 5.6: 发布诊断增强

**Files:**

- Modify: `src/app/api/agent/diagnose/route.ts`
- Modify: `src/lib/agent/prompts/diagnose.ts`
- Modify: `src/components/sync/SyncTaskDetail.tsx`

**Commit:** `feat: improve agent publish diagnostics`

- [ ] 诊断输入包含 PublishCheck、事件时间线、失败码、渠道版本快照。
- [ ] 输出必须包含：根因、证据、修复步骤、是否建议重试。
- [ ] UI 显示结构化诊断，不只显示长文本。
- [ ] 无 Agent 配置时显示本地失败码建议。
- [ ] 运行 `pnpm lint`。

### Task 5.7: Phase 5 验证

**Commit:** `docs: document agent-assisted workflow`

- [ ] README 增加 Agent 分阶段能力说明。
- [ ] 运行 `pnpm test src/lib/agent src/app/api/agent`。
- [ ] 运行 `pnpm lint`。
- [ ] 运行 `pnpm build`。
- [ ] 手动验证：资讯筛选、选题写作包、Brief 生成、渠道适配说明、发布诊断。

---

## 9. Phase 6: 内容复盘和个人运营洞察

### Task 6.1: Feedback 类型和存储

**Files:**

- Create: `src/lib/feedback/types.ts`
- Create: `src/lib/feedback/store.ts`
- Create: `src/lib/feedback/__tests__/store.test.ts`
- Modify: `src/types/index.ts`

**Commit:** `feat: add content feedback storage`

- [ ] 定义 `Feedback`, `FeedbackLearning`, `FeedbackNextAction`。
- [ ] 提供 `listFeedback`, `getFeedbackByDraft`, `getFeedbackByTopic`, `createFeedback`, `updateFeedback`。
- [ ] Feedback 可关联 Draft、PlatformVariant、Topic、Metric。
- [ ] 测试按 Draft、Topic、渠道查询。
- [ ] 运行 `pnpm test src/lib/feedback`。

### Task 6.2: 指标聚合升级

**Files:**

- Modify: `src/lib/metrics/types.ts`
- Modify: `src/lib/metrics/store.ts`
- Modify: `src/lib/metrics/refresh.ts`
- Modify: `src/lib/metrics/__tests__/fetchers.test.ts`

**Commit:** `feat: aggregate metrics by content workflow`

- [ ] Metric 关联 `draftId`, `variantId`, `topicId`, `platform`。
- [ ] 提供按 Topic、Tag、Platform、时间范围聚合函数。
- [ ] 兼容旧 metric 记录。
- [ ] 指标刷新后更新关联信息。
- [ ] 测试聚合结果。
- [ ] 运行 `pnpm test src/lib/metrics`。

### Task 6.3: 内容复盘 API

**Files:**

- Create: `src/app/api/feedback/route.ts`
- Create: `src/app/api/feedback/[id]/route.ts`
- Create: `src/app/api/agent/feedback/route.ts`
- Create: `src/lib/agent/prompts/feedback.ts`

**Commit:** `feat: expose feedback and review api`

- [ ] `GET /api/feedback` 支持 `draftId`, `topicId`, `platform`。
- [ ] `POST /api/feedback` 创建手动复盘。
- [ ] `POST /api/agent/feedback` 根据指标和内容生成复盘建议。
- [ ] Agent 输出必须包含：表现摘要、有效因素、问题、下一步选题建议、写作建议、发布时间建议。
- [ ] 测试 API 正常和 Agent 未配置场景。
- [ ] 运行 `pnpm test src/app/api/feedback src/app/api/agent`。

### Task 6.4: 数据看板升级

**Files:**

- Modify: `src/app/analytics/page.tsx`
- Modify: `src/components/analytics/MetricsCard.tsx`
- Create: `src/components/analytics/ContentInsightPanel.tsx`
- Create: `src/components/analytics/TopicPerformanceTable.tsx`
- Modify: `src/components/analytics/analytics.css.ts`

**Commit:** `feat: add content performance insights`

- [ ] 数据看板显示按渠道、选题、标签的表现。
- [ ] 展示表现最好的内容和需要复盘的内容。
- [ ] 展示下一步建议区域。
- [ ] 支持刷新指标后重新计算。
- [ ] 空状态引导用户先完成发布或手动录入反馈。
- [ ] 运行 `pnpm lint`。

### Task 6.5: 复盘回流到选题和写作

**Files:**

- Modify: `src/components/news/TopicLibrary.tsx`
- Modify: `src/components/editor/WritingBriefCard.tsx`
- Modify: `src/components/copilot/TopicRecommendationPanel.tsx`
- Modify: `src/lib/copilot/recommend.ts`

**Commit:** `feat: use feedback in topic and writing recommendations`

- [ ] 选题库显示相关历史表现。
- [ ] Brief 卡片显示相似内容的复盘提示。
- [ ] 内容推荐时加入近期表现摘要。
- [ ] 低表现内容不直接压制同类选题，而是给出风险提示。
- [ ] 运行 `pnpm test src/lib/copilot`。

### Task 6.6: Phase 6 验证

**Commit:** `docs: document feedback loop workflow`

- [ ] README 增加内容复盘说明。
- [ ] 运行 `pnpm test src/lib/feedback src/lib/metrics src/lib/copilot src/app/api/feedback`。
- [ ] 运行 `pnpm lint`。
- [ ] 运行 `pnpm build`。
- [ ] 手动验证：发布记录 -> 指标刷新 -> 复盘 -> 选题建议。

---

## 10. Phase 7: 体验收束和长期维护

### Task 7.1: 首页工作台待办化

**Files:**

- Modify: `src/app/page-client.tsx`
- Create: `src/components/workbench/TodayWorkbench.tsx`
- Create: `src/components/workbench/TodayWorkbench.css.ts`
- Modify: `src/components/layout/Sidebar.tsx`

**Commit:** `feat: add personal content workbench`

- [ ] 首页顶部增加今日工作台区域。
- [ ] 展示：待处理 Signal、进行中 Topic、待写 Brief、待发布 Variant、失败 PublishTask、待复盘内容。
- [ ] 每项都有明确行动按钮。
- [ ] 用户可折叠工作台，继续使用原写作台。
- [ ] 运行 `pnpm lint`。

### Task 7.2: 空状态和错误状态统一

**Files:**

- Modify: `src/components/feedback/EmptyState.tsx`
- Modify: `src/components/feedback/EmptyState.css.ts`
- Create: `src/components/feedback/ErrorState.tsx`
- Modify: pages and components using ad hoc empty/error states

**Commit:** `refactor: standardize empty and error states`

- [ ] EmptyState 支持 title、description、primaryAction、secondaryAction。
- [ ] ErrorState 支持 retry、details、nextAction。
- [ ] 替换选题台、稿件库、分发记录、数据看板中的零散空状态。
- [ ] 错误不只显示失败，必须说明下一步。
- [ ] 运行 `pnpm lint`。

### Task 7.3: 本地数据迁移和备份

**Files:**

- Create: `src/lib/storage/migrations/types.ts`
- Create: `src/lib/storage/migrations/runMigrations.ts`
- Create: `src/lib/storage/migrations/__tests__/runMigrations.test.ts`
- Modify: `src/instrumentation.ts`
- Modify: `src/lib/storage/localDataPath.ts`

**Commit:** `feat: add local data migrations`

- [ ] 增加本地数据 schema version 文件。
- [ ] 迁移前自动备份 `.publio-data`。
- [ ] 迁移支持 drafts 补字段、metrics 补关联、sync tasks 补事件。
- [ ] 迁移失败时保留备份并给出错误。
- [ ] 测试迁移幂等性。
- [ ] 运行 `pnpm test src/lib/storage`。

### Task 7.4: 导入导出升级

**Files:**

- Modify: `src/lib/drafts/importExport.ts`
- Create: `src/lib/export/workspaceExport.ts`
- Create: `src/lib/export/__tests__/workspaceExport.test.ts`
- Create: `src/app/api/export/route.ts`
- Create: `src/app/api/import/route.ts`

**Commit:** `feat: support workspace import and export`

- [ ] 支持导出 Signal、Topic、Brief、Draft、PlatformVariant、PublishTask、Feedback。
- [ ] 导出文件包含 schema version。
- [ ] 导入时先校验，不直接覆盖。
- [ ] 支持 dry run 返回将新增、更新、跳过的数量。
- [ ] 测试导出结构和导入 dry run。
- [ ] 运行 `pnpm test src/lib/export src/lib/drafts`。

### Task 7.5: 文档和验证脚本收束

**Files:**

- Modify: `README_zh.md`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Optional Modify: `scripts/check-no-js-source.ts`
- Optional Create: `docs/workflows/personal-content-workflow.md`

**Commit:** `docs: finalize personal content workflow documentation`

- [ ] README 用新主流程重写功能说明。
- [ ] 新增或更新使用流程文档。
- [ ] AGENTS.md 增加新模块边界和验证要求。
- [ ] 确认命令仍是 `pnpm verify`。
- [ ] 运行 `pnpm verify`。

---

## 11. 推荐执行顺序和提交粒度

### 11.1 总体提交顺序

建议严格按以下顺序推进：

1. `feat: add signal storage model`
2. `feat: expose signal inbox api`
3. `feat: persist news signals from topic desk`
4. `feat: add topic library storage`
5. `feat: expose topic library api`
6. `feat: add signal inbox interactions`
7. `feat: add topic library workspace`
8. `docs: document signal and topic workflow`
9. `feat: add writing brief storage`
10. `feat: expose writing brief api`
11. `feat: add brief editor`
12. `feat: link drafts to topics and briefs`
13. `feat: surface brief context in editor`
14. `feat: include brief context in writing agent`
15. `docs: document brief-driven writing workflow`
16. `feat: add platform variant storage`
17. `feat: expose platform variant api`
18. `refactor: manage platform drafts as variants`
19. `feat: save adapted content as platform variants`
20. `feat: add platform variant editing panel`
21. `feat: publish stable platform variant snapshots`
22. `docs: document platform variant workflow`
23. `feat: add unified publish checks`
24. `feat: expose publish check api`
25. `feat: show publish readiness checks before publishing`
26. `feat: improve platform connection health checks`
27. `feat: standardize publish failure recovery`
28. `feat: enhance publish task event timeline`
29. `docs: document publish readiness and recovery workflow`
30. `feat: add unified agent context builder`
31. `feat: add agent-assisted signal review`
32. `feat: generate topic writing packs`
33. `feat: assist writing brief creation`
34. `feat: explain platform adaptation decisions`
35. `feat: improve agent publish diagnostics`
36. `docs: document agent-assisted workflow`
37. `feat: add content feedback storage`
38. `feat: aggregate metrics by content workflow`
39. `feat: expose feedback and review api`
40. `feat: add content performance insights`
41. `feat: use feedback in topic and writing recommendations`
42. `docs: document feedback loop workflow`
43. `feat: add personal content workbench`
44. `refactor: standardize empty and error states`
45. `feat: add local data migrations`
46. `feat: support workspace import and export`
47. `docs: finalize personal content workflow documentation`

### 11.2 每阶段分支建议

如果每个阶段单独 PR：

- `feature/signal-topic-workflow`
- `feature/brief-writing-context`
- `feature/platform-variants`
- `feature/publish-readiness`
- `feature/agent-workflow-assistance`
- `feature/content-feedback-loop`
- `feature/workbench-polish`

如果一次性大分支推进：

- 主分支：`feature/personal-content-workbench`
- 每阶段完成后创建 checkpoint tag 或本地备份分支。

### 11.3 不应合并的提交

以下内容不要放在同一个提交里：

- 数据模型和 UI。
- API route 和页面大改。
- 发布器行为和样式调整。
- Agent prompt 和存储迁移。
- README 大改和业务逻辑。
- 多个核心对象的创建。

---

## 12. 验证策略

### 12.1 每个任务最低验证

每个任务至少运行：

```bash
pnpm lint
```

如果任务涉及 lib 或 API：

```bash
pnpm test <related-test-path>
```

如果任务涉及页面或构建配置：

```bash
pnpm build
```

### 12.2 每个阶段完成验证

每个阶段完成后运行：

```bash
pnpm verify
```

如果 `pnpm verify` 失败：

- 先定位失败原因。
- 不通过注释测试或绕过检查来继续。
- 修复后重新运行同一命令。

### 12.3 手动验证场景

必须覆盖以下主流程：

1. 抓取资讯，保存 Signal。
2. 从 Signal 创建 Topic。
3. 从 Topic 创建 Brief。
4. 从 Brief 创建 Draft。
5. 写作台加载 Brief 上下文。
6. 主稿生成渠道版本。
7. 手工编辑某个渠道版本。
8. 主稿再次修改后，不覆盖手工编辑渠道版本。
9. 发布前检查发现 warning。
10. 发布前检查发现 error 并阻止发布。
11. 发布任务失败后显示失败码和修复建议。
12. 发布成功后记录指标。
13. 指标生成 Feedback。
14. Feedback 影响后续选题建议。

### 12.4 数据兼容验证

必须准备旧数据样本：

- 旧 Draft 没有 `topicId` / `briefId`。
- 旧 SyncTask 没有扩展事件线。
- 旧 Metric 没有 `variantId` / `topicId`。
- 旧 publishStore 本地状态没有版本信息。

验证要求：

- 旧数据可以正常读取。
- 缺失字段不会导致页面崩溃。
- 迁移后新字段有默认值。
- 迁移可重复运行。

---

## 13. 风险和处理策略

### 13.1 范围膨胀

风险：

- 同时改资讯、写作、发布、数据和 Agent，容易变成长期不可合并分支。

处理：

- 严格阶段化。
- 每个阶段独立通过 `pnpm verify`。
- 每个阶段都能在产品中看到完整闭环。

### 13.2 本地 JSON 数据复杂度上升

风险：

- 对象变多后，跨 collection 查询和一致性维护变复杂。

处理：

- 先用明确 id 关联。
- 所有写操作集中在 store 层。
- 不在 React 组件里直接拼复杂数据关系。
- Phase 7 增加迁移和备份。

### 13.3 渠道版本与主稿同步冲突

风险：

- 用户手工编辑的渠道版本被主稿同步覆盖。

处理：

- `manuallyEdited` 是硬保护。
- 同步只覆盖未编辑版本。
- 提供“重新同步当前渠道”的显式操作。

### 13.4 Agent 输出不可控

风险：

- Agent 输出格式不稳定，影响保存 Brief、Variant 或 Feedback。

处理：

- Agent API 返回前做 schema 校验。
- 校验失败时降级为纯文本建议。
- 用户确认前不自动覆盖已有数据。

### 13.5 发布检查误伤

风险：

- 过严检查阻止用户发布。

处理：

- 只让 `error` 阻断。
- `warning` 允许强制发布。
- 每个检查项都要有 `nextAction`。

### 13.6 构建和测试时间增加

风险：

- 新模块和测试增加后，开发反馈变慢。

处理：

- 每个模块测试可单独运行。
- 阶段内先跑相关测试，阶段结束跑 `pnpm verify`。
- 避免端到端测试覆盖过多低价值路径。

---

## 14. 页面信息架构建议

### 14.1 保留现有主导航

初期保留：

- 选题台
- 写作台
- 稿件库
- 分发记录
- 数据看板
- 排期日历
- 设置

### 14.2 选题台内部结构

建议拆为三个区域：

- 资讯 Inbox：处理新信号。
- 选题库：管理可写选题。
- 写作包：围绕单个选题生成写作上下文。

### 14.3 写作台内部结构

建议形成三栏逻辑：

- 左侧或顶部：主稿编辑。
- 右侧上半：Brief 和素材。
- 右侧下半：渠道版本和发布检查。

实际布局不必一次大改，可逐步把现有右栏模块替换为更明确的状态卡片。

### 14.4 数据看板内部结构

建议从指标卡片升级为：

- 发布表现总览。
- 渠道表现。
- 选题表现。
- 标签表现。
- 待复盘内容。
- 下一步建议。

---

## 15. API 命名建议

新增 API：

```text
GET    /api/signals
POST   /api/signals
PATCH  /api/signals/[id]
DELETE /api/signals/[id]

GET    /api/topics
POST   /api/topics
PATCH  /api/topics/[id]
DELETE /api/topics/[id]
POST   /api/topics/from-signals
GET    /api/topics/[id]/brief
POST   /api/topics/[id]/brief

GET    /api/briefs
POST   /api/briefs
PATCH  /api/briefs/[id]
DELETE /api/briefs/[id]

GET    /api/drafts/[id]/variants
POST   /api/drafts/[id]/variants
PATCH  /api/platform-variants/[id]
DELETE /api/platform-variants/[id]

POST   /api/publish/check

GET    /api/feedback
POST   /api/feedback
PATCH  /api/feedback/[id]

POST   /api/agent/signal-review
POST   /api/agent/topic-pack
POST   /api/agent/brief
POST   /api/agent/feedback
```

命名原则：

- `signals` 表示资讯信号。
- `topics` 表示可写选题。
- `briefs` 表示写作任务说明。
- `platform-variants` 表示渠道版本。
- `feedback` 表示复盘和表现反馈。

---

## 16. UI 文案原则

### 16.1 状态文案

所有状态文案必须指向下一步：

- 不写：“加载失败”
- 写：“资讯读取失败。检查 RSS 源地址后重试。”

- 不写：“无内容”
- 写：“还没有保存的资讯。先刷新资讯源，或手动添加一条链接。”

- 不写：“发布失败”
- 写：“发布失败：缺少渠道凭证。前往设置补全后重试。”

### 16.2 Agent 文案

Agent 输出要避免空泛评价，必须可执行：

- 值得写的理由。
- 不值得写的理由。
- 推荐角度。
- 需要补充的资料。
- 适合的渠道。
- 下一步按钮。

### 16.3 发布文案

发布相关文案要明确：

- 当前检查结果。
- 是否阻止发布。
- 用户能怎么修。
- 是否可以继续发布。
- 继续发布的风险是什么。

---

## 17. 数据目录建议

在 `.publio-data/` 下建议逐步形成：

```text
.publio-data/
  signals.json
  topics.json
  briefs.json
  drafts.json
  platform-variants.json
  sync-tasks.json
  metrics.json
  feedback.json
  rss-sources.json
  templates.json
  custom-prompts.json
  migrations.json
  backups/
```

要求：

- 每个 collection 由对应 store 管理。
- 不跨模块直接读写别的 JSON 文件。
- 迁移前备份。
- 写入保持原子性。

---

## 18. 最终完成标准

全部阶段完成后，应能证明以下能力可用：

- 用户可以从资讯源获取内容并保存为 Signal。
- 用户可以从一个或多个 Signal 创建 Topic。
- 用户可以为 Topic 创建 Brief。
- 用户可以从 Brief 进入写作台，并在写作台看到上下文。
- 用户可以写主稿，并生成多个渠道版本。
- 用户可以单独编辑任意渠道版本。
- 发布前系统能给出统一检查结果。
- 发布失败时系统能给出结构化原因和修复建议。
- 发布成功后系统能保存回执和指标。
- 用户可以查看内容复盘。
- Agent 可以在每个阶段提供与当前上下文相关的下一步建议。
- 旧数据仍能正常读取。
- `pnpm verify` 通过。

---

## 19. 第一阶段执行建议

如果要马上开工，建议先执行 Phase 1，不要先碰写作台和发布链路。

原因：

- Phase 1 建立整个产品链路的起点。
- Signal 和 Topic 对旧功能影响小。
- 可以独立测试。
- 不会打断当前写作和发布能力。
- 完成后用户立刻能感知“资讯进入选题”的变化。

Phase 1 完成后再执行 Phase 2。不要跳到 Phase 3，因为没有 Brief 时，渠道版本会缺少清晰上下文，Agent 适配也难以解释为什么这样改。
