# Publio 改造 — 进度跟踪

## 当前状态

Phase 0-5 全部完成。PR-17/PR-18 因需外部 API 访问权限，暂跳过。

## 实施进度

| Phase | 状态 | PR 完成数 |
|-------|------|----------|
| Phase 0: 基础设施 | ✅ complete | 4/4 |
| Phase 1: 架构优化 | ✅ complete | 4/4 |
| Phase 2: UI 设计系统 | ✅ complete | 4/4 |
| Phase 3: 功能 P0 | ✅ complete | 4/4 |
| Phase 4: 功能 P1 | ✅ complete | 4/5 (PR-17/18 跳过) |
| Phase 5: 产品 P2 | ✅ complete | 5/5 |

### Phase 0-3 详情

| PR | 标题 | 状态 |
|----|------|------|
| PR-01 | Prettier + Husky + lint-staged | ✅ |
| PR-02 | 依赖清理验证 | ✅ |
| PR-03 | types/index.ts 按模块拆分 | ✅ |
| PR-04 | 内容安全模块骨架 | ✅ |
| PR-05 | MarkdownEditor 懒加载 | ✅ |
| PR-06 | page.tsx Server/Client 拆分 | ✅ |
| PR-07 | syncPlatformDrafts useDeferredValue 优化 | ✅ |
| PR-08 | researchCache TTL + LRU 清理 | ✅ |
| PR-09 | Spacing + Typography tokens | ✅ |
| PR-10 | 色彩对比度修复 | ✅ |
| PR-11 | 暗色主题切换（light/dark/system） | ✅ |
| PR-12 | 键盘导航与 a11y 修复 | ✅ |
| PR-13 | 敏感词过滤接入发布流程 | ✅ |
| PR-14 | 定时发布后端（已有完整实现） | ✅ |
| PR-15 | 发布后数据回收 + 数据看板 | ✅ |
| PR-16 | 平台适配规则校验 | ✅ |

### Phase 4 详情

| PR | 标题 | 状态 |
|----|------|------|
| PR-17 | 小红书图文笔记支持 | ⏭️ 跳过（需外部 API） |
| PR-18 | 知乎专栏与话题标签 | ⏭️ 跳过（需外部 API） |
| PR-19 | AI 多轮对话记忆 | ✅ |
| PR-20 | 自定义 RSS 源 | ✅ |
| PR-21 | AI 适配自动校验 + 自定义 prompt | ✅ |

### Phase 5 详情

| PR | 标题 | 状态 |
|----|------|------|
| PR-22 | 内容运营助手（品牌画像 + 选题推荐） | ✅ |
| PR-23 | 用户风格学习 | ✅ |
| PR-24 | 内容排期日历 | ✅ |
| PR-25 | 沉浸式写作模式 | ✅ |
| PR-26 | WYSIWYG 编辑模式 | ✅ |

## 错误记录

| 错误 | 尝试 | 解决 |
|------|------|------|
| PR-02 原计划删除 eventsource-parser | 1 | 发现 provider.ts 实际在用，保留 |
| PR-11 FOWT 预防 | 1 | vanilla-extract darkTheme class 是哈希，无法内联 |
| PR-15 metrics store API | 1 | jsonFileCollection 无此导出，改用 readJsonFileCollection |
| PR-22 BrandProfileForm CSS | 1 | settings.css.ts 无 fieldWrap，改用 copilot.css.ts 本地样式 |
| PR-22 AiNewsCluster 无 summary 字段 | 1 | 改用 primarySignal.title |
| PR-23 SWC 解析 `as` 类型断言 | 1 | 改用 `:` 类型注解 |
| PR-26 localStorage 测试环境不可用 | 1 | 包裹 try-catch |

## 新增文件清单

### Phase 4
- `src/stores/agentStore.ts` — sessionStorage 持久化 chatMessages
- `src/lib/rss-sources/store.ts` — 自定义 RSS 源 CRUD
- `src/app/api/rss-sources/route.ts` — RSS 源 API
- `src/components/settings/RssSourceManager.tsx` — RSS 源管理 UI
- `src/lib/custom-prompts/store.ts` — 自定义 prompt CRUD
- `src/app/api/custom-prompts/route.ts` — prompt API
- `src/components/settings/PromptEditor.tsx` — prompt 编辑 UI
- `src/lib/platformRules/` — 平台规则校验模块
- `src/lib/metrics/` — 数据回收模块
- `src/app/analytics/` — 数据看板页面

### Phase 5
- `src/hooks/useImmersiveMode.ts` — 沉浸模式 hook
- `src/components/editor/EditorModeToggle.tsx` — 编辑模式切换
- `src/lib/copilot/types.ts` — 品牌画像/推荐类型
- `src/lib/copilot/profile.ts` — 品牌画像 CRUD
- `src/lib/copilot/recommend.ts` — 选题推荐 prompt 构建
- `src/lib/copilot/styleProfile.ts` — 风格画像 CRUD + 分析 prompt
- `src/app/api/copilot/profile/route.ts` — 品牌画像 API
- `src/app/api/copilot/recommend/route.ts` — 选题推荐 SSE API
- `src/app/api/copilot/style/route.ts` — 风格画像 API
- `src/components/copilot/BrandProfileForm.tsx` — 品牌画像表单
- `src/components/copilot/TopicRecommendationPanel.tsx` — 选题推荐面板
- `src/components/copilot/StyleProfile.tsx` — 风格画像管理
- `src/components/copilot/copilot.css.ts` — copilot 组件样式
- `src/app/calendar/page.tsx` — 排期日历页面
- `src/app/calendar/page.css.ts` — 日历样式
- `src/components/calendar/CalendarPageClient.tsx` — 日历客户端组件
