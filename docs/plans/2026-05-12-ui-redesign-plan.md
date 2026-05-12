# UI Redesign Plan — Warm Minimal Dashboard Style

> **Goal**: 全面重新设计 Publio 所有页面，参照附件截图的极简暖中性风格，打造干净、通透、留白充裕的内容工作台。
>
> **日期**: 2026-05-12
> **参照**: 邮件/任务/日程类 SaaS Dashboard（白卡片 + 渐变底 + 黑色主操作 + 超大圆角）

---

## 1. 设计语言提炼

### 1.1 核心美学特征

| 特征 | 描述 |
|------|------|
| **极简克制** | 几乎无装饰，靠留白和层次感传递高级感 |
| **暖中性色调** | 背景为柔和渐变（浅灰蓝/浅粉/浅米），卡片纯白 |
| **黑色主操作** | 主 CTA 按钮为纯黑/深灰，而非彩色；彩色仅用于状态标签 |
| **超大圆角** | 卡片 20-24px，按钮/输入框 12-16px，标签 pill 形 999px |
| **极轻阴影** | 阴影几乎不可见，靠白色卡片与渐变底色自然分离 |
| **Icon-only 侧栏** | 侧边栏极窄，仅图标，活跃态为实心深色圆 |
| **大字排版** | 时间/数字使用大号轻量字体；标题粗但不过大 |
| **无边框设计** | 卡片无明显 border，靠背景色差异分层 |

### 1.2 字体系统

| 用途 | 字体 | 备注 |
|------|------|------|
| 正文/UI | **Inter** | 清爽几何感，中英混排兼容 |
| 数字/时间 | **Inter** (Tabular Nums) | 等宽数字对齐 |
| 中文 fallback | Source Han Sans SC / PingFang SC | -- |

> 替换 Plus Jakarta Sans → Inter，去掉 Playfair Display（风格不匹配）。

### 1.3 颜色系统

#### Light Mode（主模式）

| Token | 值 | 用途 |
|-------|------|------|
| `bg` | `#F7F6F3` | 页面底色（暖灰白） |
| `bgElevated` | `#F0EFEC` | 次级底色、hover 态 |
| `surface` | `#FFFFFF` | 卡片/面板 |
| `surfaceStrong` | `#FAFAF8` | 卡片内嵌区域 |
| `surfaceDark` | `#1A1A1A` | 主操作按钮、活跃侧栏项 |
| `surfaceDarkText` | `#FFFFFF` | 深色区域文字 |
| `border` | `rgba(0, 0, 0, 0.06)` | 极淡边框（大部分场景不用） |
| `borderStrong` | `rgba(0, 0, 0, 0.10)` | 输入框等需要明确边界时 |
| `borderFaint` | `rgba(0, 0, 0, 0.03)` | 微弱分割 |
| `text` | `#1A1A1A` | 主文字 |
| `textMuted` | `#8C8C8C` | 辅助文字 |
| `accent` | `#1A1A1A` | 主操作色 = 黑色 |
| `accentSoft` | `#F0EFEC` | accent 的柔和背景 |
| `accentHover` | `#333333` | hover 态 |
| `signal` | `#1A1A1A` | 强调色（与 accent 统一） |
| `canvasDeep` | `#EAE9E5` | 更深底色层 |
| `cardPurple` | 删除 | 不再使用彩色卡片 |
| `cardCream` | 删除 | -- |
| `cardLime` | 删除 | -- |
| `cardPurpleSoft` | 删除 | -- |
| `successBg` | `#F0FAF0` | 成功底色 |
| `successBorder` | `#C6E6C6` | 成功边框 |
| `successText` | `#1D6B1D` | 成功文字 |
| `errorBg` | `#FFF0F0` | 错误底色 |
| `errorBorder` | `#FFD4D4` | 错误边框 |
| `errorText` | `#CC1A1A` | 错误文字 |
| `warningBg` | `#FFF8E6` | 警告底色 |
| `warningBorder` | `#FFDF80` | 警告边框 |
| `warningText` | `#8C5C00` | 警告文字 |

#### Dark Mode

| Token | 值 | 用途 |
|-------|------|------|
| `bg` | `#141414` | 深灰黑底 |
| `bgElevated` | `#1E1E1E` | 次级底 |
| `surface` | `#252525` | 卡片 |
| `surfaceStrong` | `#2E2E2E` | 内嵌区域 |
| `surfaceDark` | `#FFFFFF` | 主操作（白色在暗底） |
| `surfaceDarkText` | `#1A1A1A` | 白按钮黑文字 |
| `border` | `rgba(255, 255, 255, 0.08)` | 极淡边框 |
| `borderStrong` | `rgba(255, 255, 255, 0.14)` | 明确边界 |
| `borderFaint` | `rgba(255, 255, 255, 0.04)` | 微弱分割 |
| `text` | `#F0F0F0` | 主文字 |
| `textMuted` | `#8C8C8C` | 辅助文字 |
| `accent` | `#FFFFFF` | 主操作色 = 白色 |
| `accentSoft` | `#2A2A2A` | accent 柔和背景 |
| `accentHover` | `#E0E0E0` | hover 态 |
| `signal` | `#FFFFFF` | 强调色 |
| `canvasDeep` | `#0F0F0F` | 最深层 |
| `successBg` | `#1A2A1A` | -- |
| `successBorder` | `#2A4A2A` | -- |
| `successText` | `#6ABA6A` | -- |
| `errorBg` | `#2A1A1A` | -- |
| `errorBorder` | `#4A2A2A` | -- |
| `errorText` | `#F87171` | -- |
| `warningBg` | `#2A2218` | -- |
| `warningBorder` | `#4A3A20` | -- |
| `warningText` | `#FBBF24` | -- |

### 1.4 圆角系统

| Token | 值 | 用途 |
|-------|------|------|
| `sm` | `8px` | 小元素（badge、tooltip） |
| `md` | `12px` | 输入框、小按钮 |
| `lg` | `16px` | 中等卡片内区域 |
| `xl` | `22px` | 主卡片 |
| `2xl` | `28px` | 大面板、Hero |

### 1.5 阴影系统

极轻阴影，暗模式下稍重：

| Token | Light | Dark |
|-------|-------|------|
| `sm` | `0 1px 2px rgba(0,0,0,0.04)` | `0 1px 3px rgba(0,0,0,0.20)` |
| `md` | `0 2px 8px rgba(0,0,0,0.06)` | `0 4px 12px rgba(0,0,0,0.25)` |
| `lg` | `0 4px 16px rgba(0,0,0,0.08)` | `0 8px 24px rgba(0,0,0,0.30)` |
| `xl` | `0 8px 32px rgba(0,0,0,0.10)` | `0 16px 48px rgba(0,0,0,0.35)` |

### 1.6 过渡系统

保留不变：
- fast: `120ms cubic-bezier(0.4, 0, 0.2, 1)`
- base: `200ms cubic-bezier(0.4, 0, 0.2, 1)`
- slow: `350ms cubic-bezier(0.4, 0, 0.2, 1)`
- spring: `500ms cubic-bezier(0.34, 1.56, 0.64, 1)`

---

## 2. 全局组件设计规范

### 2.1 Sidebar — 毛玻璃窄栏

**核心变化**：从 icon+label 简化为 **icon-only 窄栏**，带毛玻璃背景

| 属性 | 值 |
|------|------|
| 宽度 | `64px`（桌面端），移动端底部 tab bar |
| 背景 | `rgba(255, 255, 255, 0.6)` + `backdrop-filter: blur(16px)` |
| 边框右侧 | `1px solid rgba(255, 255, 255, 0.3)` |
| 图标大小 | `20px` |
| 图标颜色 | `textMuted`（未选中）/ `surfaceDarkText`（选中） |
| 活跃态 | 图标外包一个 `40×40px` 圆形 `surfaceDark` 背景 |
| 品牌 Logo | 顶部，小尺寸图标形态 |
| 间距 | 图标之间 `12px` gap |

暗色模式：
| 属性 | 值 |
|------|------|
| 背景 | `rgba(20, 20, 20, 0.7)` + `backdrop-filter: blur(16px)` |
| 边框 | `1px solid rgba(255, 255, 255, 0.06)` |

### 2.2 卡片 (SurfaceCard) — 毛玻璃质感

| 属性 | 值 |
|------|------|
| 背景 | `rgba(255, 255, 255, 0.72)`（半透明白） |
| backdropFilter | `blur(20px) saturate(180%)` |
| 圆角 | `radius.xl`（22px） |
| 边框 | `1px solid rgba(255, 255, 255, 0.5)`（玻璃边缘高光） |
| 阴影 | `shadow.sm`（几乎不可见） |
| Padding | `20px`（桌面 `24px`） |
| Hover | 无阴影变化（保持静态克制） |

暗色模式：
| 属性 | 值 |
|------|------|
| 背景 | `rgba(37, 37, 37, 0.72)` |
| backdropFilter | `blur(20px) saturate(180%)` |
| 边框 | `1px solid rgba(255, 255, 255, 0.06)` |

### 2.3 按钮

| 类型 | 样式 |
|------|------|
| Primary | 黑底白字，圆角 `radius.md`(12px)，padding `10px 20px` |
| Secondary | 白底灰边，圆角 `radius.md` |
| Ghost | 无边框无底，hover 时 `bgElevated` 底色 |
| Danger | 红底白字（仅删除场景） |

### 2.4 输入框

| 属性 | 值 |
|------|------|
| 背景 | `rgba(0, 0, 0, 0.03)`（半透明微灰，融入毛玻璃卡片） |
| 边框 | `none`（无边框设计） |
| 圆角 | `radius.md`（12px） |
| Focus | border: `1px solid rgba(0,0,0,0.12)`，无 box-shadow |
| Padding | `10px 14px` |
| Placeholder | `textMuted` 色 |

暗色模式：
| 属性 | 值 |
|------|------|
| 背景 | `rgba(255, 255, 255, 0.06)` |
| Focus | border: `1px solid rgba(255,255,255,0.15)` |

### 2.5 Badge / Tag

| 类型 | 样式 |
|------|------|
| Default | `bgElevated` 底 + `textMuted` 文字，pill 形 |
| Active | `surfaceDark` 底 + 白字 |
| Urgent/Error | `errorBg` 底 + `errorText` 文字 |
| Success | `successBg` 底 + `successText` 文字 |

### 2.6 AppShellHeader

| 属性 | 值 |
|------|------|
| Kicker | 去掉（或极小 12px textMuted） |
| Title | 24px fontWeight 600，font.sans |
| Subtitle | 14px textMuted |
| 底边框 | 无 |

### 2.7 EmptyState

| 属性 | 值 |
|------|------|
| Icon | 40×40 圆形 `bgElevated` 底 + `textMuted` 图标 |
| Title | 16px fontWeight 500 |
| Text | 14px textMuted |
| CTA | Primary 按钮样式 |

---

## 3. 页面设计规范

### 3.1 首页（写作台）

- 编辑器容器：白卡片 `radius.xl`，无边框，轻阴影
- Tab 切换栏：底部细线指示器（非背景填充）
- 工具栏图标：浅灰，hover 变深
- 右侧面板：白卡片，各 section 间用 `borderFaint` 分割
- 发布按钮：黑底白字 Primary
- 统计数字：大号轻量字体（24px fontWeight 400）

### 3.2 AI 选题台

- 话题卡片：白底大圆角，标题粗体，无彩色条纹
- ScoreBar：细线进度条（`textMuted` 底 + `surfaceDark` 填充）
- 操作按钮：Ghost 风格，hover 底色
- 页面顶部：简洁标题 + 副标题，无 Hero Banner

### 3.3 稿件库

- 列表项：白卡片，标题 + meta 行 + 操作按钮
- 状态 badge：pill 形，按状态用不同底色
- 筛选器：pill 按钮组，选中态黑底白字
- 搜索框：无边框 `surfaceStrong` 底色

### 3.4 分发记录

- 任务卡片：白底大圆角
- 状态指示：小圆点 + 文字（不用彩色大块）
- 时间线：简洁竖线 + 圆点

### 3.5 设置页

- 分组卡片：白底大圆角
- 输入框：无边框灰底
- 保存按钮：黑底白字
- 展开/收起：无多余装饰

### 3.6 数据看板

- 统计数字：特大号（32-40px）轻量字体
- 图表区：白卡片包裹
- 表格：极简，无明显网格线

### 3.7 排期日历

- 日历格子：白底，今日高亮为黑色圆点/黑底白字
- 事件标记：小圆点而非整行色块
- 月份导航：极简箭头

---

## 4. 页面背景（渐变底 + 毛玻璃基础）

**核心设计**：页面底色为微妙多色渐变，卡片为半透明毛玻璃面板叠加其上，形成通透分层感。

Light mode 背景：
```css
background: #F7F6F3;
background-image:
  radial-gradient(ellipse at 20% 50%, rgba(200, 220, 240, 0.4) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, rgba(240, 220, 200, 0.3) 0%, transparent 50%),
  radial-gradient(ellipse at 60% 80%, rgba(220, 230, 240, 0.3) 0%, transparent 50%);
```

暗色模式背景：
```css
background: #141414;
background-image:
  radial-gradient(ellipse at 20% 50%, rgba(60, 60, 80, 0.2) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, rgba(80, 60, 60, 0.15) 0%, transparent 50%);
```

**为什么需要渐变**：毛玻璃（`backdrop-filter: blur`）效果需要底层有可"透过"的内容才可见。纯色底 + 半透明卡片 = 看不出毛玻璃。渐变底色提供微妙的色彩变化让毛玻璃质感显现。

### Token 支持

新增全局 CSS 变量（不放进 vanilla-extract vars，直接在 globals.css.ts 用 globalStyle 设置 body background）：

```typescript
// globals.css.ts
globalStyle('body', {
  background: `
    radial-gradient(ellipse at 20% 50%, rgba(200, 220, 240, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(240, 220, 200, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(220, 230, 240, 0.3) 0%, transparent 50%),
    #F7F6F3
  `,
  backgroundAttachment: 'fixed',
});
```

### SurfaceCard CSS 实现

```typescript
// SurfaceCard.css.ts
base: {
  background: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  borderRadius: vars.radius.xl,
  border: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: vars.shadow.sm,
}
```

### 半透明层级规则

| 层级 | 透明度 | 场景 |
|------|--------|------|
| 主卡片 | `rgba(255,255,255, 0.72)` | SurfaceCard default |
| 内嵌区域 | `rgba(255,255,255, 0.5)` | 卡片内输入框/嵌套面板 |
| Sidebar | `rgba(255,255,255, 0.6)` + blur(16px) | 侧边栏 |
| 浮层/Modal | `rgba(255,255,255, 0.85)` + blur(24px) | 弹窗 |

暗色模式相应调整：
| 层级 | 透明度 |
|------|--------|
| 主卡片 | `rgba(37, 37, 37, 0.72)` |
| 内嵌区域 | `rgba(37, 37, 37, 0.5)` |
| Sidebar | `rgba(20, 20, 20, 0.7)` + blur(16px) |
| 浮层 | `rgba(37, 37, 37, 0.85)` + blur(24px) |

---

## 5. 动效策略

保持克制：

| 场景 | 动效 |
|------|------|
| 页面切换 | fadeIn 200ms（opacity 0→1），无 translateY |
| 卡片 hover | 无 translateY 提升，仅轻微 shadow 加深或无变化 |
| 按钮 hover | background-color 过渡 120ms |
| 侧栏切换 | 图标缩放 spring |
| Toggle 开关 | 滑动过渡 200ms |
| 列表加载 | skeleton pulse（灰底闪烁） |

---

## 6. 暗色模式策略

| 要素 | Light | Dark |
|------|-------|------|
| 页面底色 | 暖灰白渐变 | 纯深灰 `#141414` |
| 卡片 | 纯白 | `#252525` |
| 主操作 | 黑底白字 | 白底黑字（反转） |
| 文字 | 近黑 | 近白 |
| 阴影 | 极轻 | 稍重 |
| 边框 | 几乎无 | 微弱白边 `rgba(255,255,255,0.08)` |

---

## 7. 提交计划（粒度规划）

共分 **6 个 PR**，按依赖顺序执行：

### PR 1: Design Token 重写 + 字体切换 + 全局样式

**范围**：`src/styles/tokens.css.ts` + `src/styles/globals.css.ts` + `src/app/layout.tsx`

改动清单：
- 重写 light mode 色彩 → 暖中性系统（上面 §1.3）
- 重写 dark mode 色彩
- 圆角增大（sm:8, md:12, lg:16, xl:22, 2xl:28）
- 阴影减轻
- 删除 `cardPurple`、`cardCream`、`cardLime`、`cardPurpleSoft` token
- 字体 Plus Jakarta Sans → **Inter**，删除 Playfair Display
- `font.display` 改为 `"Inter", sans-serif`（不再需要单独 display font）
- `font.serif` 保留但不在 UI 中使用
- `globals.css.ts`：去掉 fadeSlideIn translateY 动画，改为纯 opacity fade
- `globals.css.ts`：scrollbar thumb 改为 `rgba(0,0,0,0.12)`
- `layout.tsx`：替换字体 import（Inter），删除 Playfair Display

**验收**：`pnpm build` 通过，页面色彩切换为暖中性。

---

### PR 2: Sidebar 改为 Icon-Only 窄栏 + Layout 适配

**范围**：`Sidebar.tsx` + `Sidebar.css.ts` + `layout.css.ts` + `ThemeToggle.css.ts`

改动清单：
- Sidebar 宽度 `64px`，只显示图标
- 品牌 Logo 改为小图标（P 字母或 svg icon），居中顶部
- 删除搜索框（移到 header 或取消）
- 导航项：40×40 圆形区域，居中图标
- 活跃态：`surfaceDark` 背景圆形 + 白色图标
- 非活跃 hover：`bgElevated` 背景圆形
- 删除 label 文字（仅 tooltip 显示文字）
- 底部 ThemeToggle：居中，无文字
- 移动端 tab bar：更新为 icon-only 风格
- `layout.css.ts`：main 区域 padding 适配窄侧栏
- 删除版本号显示

**验收**：侧边栏为 icon-only，各页面布局正常。

---

### PR 3: 基础组件重设计（SurfaceCard / AppShellHeader / EmptyState / Skeleton / Toast）

**范围**：`components/layout/` + `components/feedback/`

改动清单：
- **SurfaceCard**：
  - 去掉 border（或改为 `borderFaint`）
  - 圆角 `radius.xl`（22px）
  - 去掉 hover shadow 提升（保持静态）
  - 删除 purple/cream/lime/dark tone variants
  - 保留 default、soft、accent 三种
  - accent tone 改为 surfaceDark 底色 + surfaceDarkText
- **AppShellHeader**：
  - title font 改回 sans（不用 display）
  - 去掉 kicker textTransform
  - 字号调小（title: 24px, fontWeight 600）
- **EmptyState**：
  - icon 容器改为 40×40 圆形 bgElevated
  - 文字精简
- **Skeleton**：
  - shimmer 色改为 `bgElevated` ↔ `surfaceStrong`（暖色调）
- **Toast**：
  - 圆角 `radius.lg`，shadow.md

**验收**：各页面基础组件视觉统一。

---

### PR 4: 首页 + Agent 面板 + 发布面板

**范围**：`app/page.css.ts` + `components/editor/` + `components/publish/` + `components/agent/`

改动清单：
- **page.css.ts**：
  - 编辑器卡片：白底，radius.xl，无 border，shadow.sm
  - Tab 栏：底线指示器（underline style），非背景填充
  - 工具栏按钮：ghost 风格，hover bgElevated
  - 面板区：白底卡片
- **AgentPanel**：
  - 去掉紫色渐变顶条
  - 改为白底卡片 + 简洁 header（标题 + 关闭按钮）
  - 关闭按钮：ghost 圆形
- **publish.css.ts**：
  - 发布按钮：黑底白字 Primary
  - 面板 section 之间用 borderFaint 分割（非阴影卡片）
  - 平台选择器：简洁 checkbox/pill 风格

**验收**：写作台完整流程视觉一致。

---

### PR 5: AI 选题 + 稿件库 + 分发记录 + 设置页

**范围**：`components/news/` + `components/drafts/` + `components/sync/` + `components/settings/` + `components/copilot/`

改动清单：
- **news.css.ts**：
  - 话题卡片：白底 radius.xl，无 hover 提升
  - headline：fontWeight 600，sans（非 display）
  - 去掉彩色条纹
- **ScoreBar.css.ts**：
  - track：`bgElevated` 底色，高度 4px
  - fill：`surfaceDark`（黑色填充），无渐变
  - 数值：fontWeight 500，`text` 色
- **SignalInbox.css.ts**：
  - signalCard：白底 radius.xl，无 hover translateY
- **drafts.css.ts**：
  - draftCard：白底 radius.xl，无 hover 提升
  - draftTitle：fontWeight 600，sans
  - statusBadge：按 §2.5 规范
  - 筛选器：pill 按钮，选中态 surfaceDark + 白字
- **sync.css.ts**：
  - historyCard：白底 radius.xl，无 hover
  - detailTitle：fontWeight 600，sans
  - receiptCard：bgElevated 底（嵌套层级区分）
- **settings.css.ts**：
  - sectionGroup padding 保留 20px
  - sourceInput：无边框灰底（surfaceStrong），focus 加轻 border
  - sourceAddBtn：黑底白字
  - promptTab：选中态黑底白字（非紫色）
- **copilot.css.ts**：
  - fieldInput：无边框灰底
  - recommendCard：白底 radius.xl，无 hover

**验收**：所有内容页面风格统一。

---

### PR 6: 数据看板 + 排期日历 + 最终 Polish

**范围**：`components/analytics/` + `app/calendar/` + 全局收尾

改动清单：
- **analytics.css.ts**：
  - statValue：32px fontWeight 300（轻量大数字）
  - statItem：白底卡片，无 border
  - insightBlock：白底（去掉渐变）
- **calendar/page.css.ts**：
  - calendarGrid：白底 radius.xl，无 border
  - dayNumberToday：小黑色圆形背景 + 白字（like 截图）
  - eventChip：改为小圆点指示器
  - navBtn：ghost 风格
- **全局 Polish**：
  - 确认所有 `font.display` 引用改为 `font.sans`
  - 确认所有 hover translateY 移除
  - 确认所有彩色卡片引用移除
  - `pnpm verify` 最终验证

**验收**：`pnpm verify` 通过 + 全页面手动验收。

---

## 8. 风险与注意事项

| 风险 | 缓解策略 |
|------|----------|
| 删除 cardPurple/cardCream/cardLime token 导致编译错误 | PR1 先改为 fallback 值（如 surface），PR3 再清理引用 |
| Icon-only sidebar 丢失可发现性 | 添加 tooltip，移动端保留文字标签 |
| 无边框设计在暗色模式下层次不清 | 暗色模式保留微弱边框 `rgba(255,255,255,0.08)` |
| 黑色 accent 在暗色模式需反转 | Dark mode accent 改为白色，surfaceDark 改为白色 |
| Inter 字体体积 | 使用 next/font/google 子集加载，display: swap |

---

## 9. 设计对照表（核心差异 vs 当前）

| 区域 | 当前（紫色主题） | 目标（暖极简） |
|------|-----------------|---------------|
| 页面底色 | 柔紫 `#EEEDF5` | 暖灰白 `#F7F6F3` |
| 强调色 | 宝石紫 `#6C5CE7` | 黑色 `#1A1A1A` |
| 卡片圆角 | 14px | 22px |
| 卡片阴影 | sm + hover md | sm only，无 hover 变化 |
| 卡片边框 | `rgba(30,27,58,0.08)` | 无（或极淡 `rgba(0,0,0,0.06)`） |
| 侧边栏 | 16rem，icon+label | 64px，icon-only |
| 活跃态 | 紫色深底白字 | 黑色圆形背景白字 |
| 标题字体 | Playfair Display | Inter（统一） |
| 按钮 | 紫色主色 | 黑底白字 |
| 输入框 | 白底有边框 | 灰底无边框 |
| Hover 效果 | translateY + shadow | 无提升，仅底色变化 |
| 数字展示 | 大号粗体 | 大号轻体 |

---

## 10. Token 迁移映射（关键变更）

以下 token key 保留但值变更：

| Key | 旧值 | 新值 |
|-----|------|------|
| `bg` | `#EEEDF5` | `#F7F6F3` |
| `bgElevated` | `#F6F5FA` | `#F0EFEC` |
| `surfaceDark` | `#1E1B3A` | `#1A1A1A` |
| `text` | `#1E1B3A` | `#1A1A1A` |
| `textMuted` | `#6B6580` | `#8C8C8C` |
| `accent` | `#6C5CE7` | `#1A1A1A` |
| `accentSoft` | `#EDE9FC` | `#F0EFEC` |
| `accentHover` | `#5A4BD6` | `#333333` |
| `signal` | `#6C5CE7` | `#1A1A1A` |
| `canvasDeep` | `#E4E3ED` | `#EAE9E5` |

以下 token key 需要删除（PR1 先置为 surface 值，PR3/5 清理引用后可真正移除）：

- `cardPurple` → `#FFFFFF`（临时）
- `cardCream` → `#FFFFFF`（临时）
- `cardLime` → `#FFFFFF`（临时）
- `cardPurpleSoft` → `#FFFFFF`（临时）

---

## 11. Sidebar Layout 细节

### 桌面端 (≥1024px)

```
[64px sidebar] [main content area]
```

Sidebar 固定左侧，垂直排列：
1. Logo icon（32×32）— 顶部，margin-bottom 24px
2. 导航图标组 — 40×40 圆形热区，gap 8px
3. 弹性空间
4. ThemeToggle — 底部

### 移动端 (<1024px)

底部 tab bar，icon-only，56px 高。

---

## 12. 关键视觉参考解读

从截图中提取的具体尺寸估算：

| 元素 | 估算值 |
|------|--------|
| 侧栏图标尺寸 | 20px |
| 侧栏活跃圆形 | 40×40px, border-radius 50% |
| 卡片间距 | 16px |
| 卡片内 padding | 20-24px |
| 搜索框高度 | 44px |
| 搜索框 radius | 22px（pill 形） |
| 按钮 padding | 10px 20px |
| 按钮 radius | 22px（pill 形 for primary CTA） |
| 标签 pill | padding 4px 12px, radius 999px |
| 正文字号 | 14px |
| 辅助文字 | 12-13px |
| 标题字号 | 16-18px, fontWeight 600 |
| 大数字 | 28-32px, fontWeight 300 |
