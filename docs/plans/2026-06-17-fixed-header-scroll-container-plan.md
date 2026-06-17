# 固定头部 + 容器滚动改造计划

日期：2026-06-17

## 背景

三个页面（写作台 / 稿件库 / 设置）的 headerView 和设置页 topTabsBar 去掉了背景色，露出页面渐变底。但它们都是 `position: sticky`，配合整页 window 滚动——sticky 的本质就是“内容从我身下流过”。透明后，滚动时下方内容卡会穿过头部透显重叠。

方案：把头部改成固定不滚，正文放进独立滚动容器，滚动区上边缘 = 头部底边对齐。内容根本不进入头部区域，纯透明也不穿透。需从 window 滚动改为容器滚动，桌面 + 移动端都适配。

## 目标结构

`main` 变为定高 flex 列容器（`height:100dvh; overflow:hidden`），内部：

- 固定区（`flex-shrink:0`，不滚）：header（设置页再叠 topTabsBar / mobileTabs）
- 滚动区（`flex:1; min-height:0; overflow-y:auto`）：页面正文

滚动区顶边天然紧贴固定区底边 = 期望的对齐。移除所有为 window 滚动设计的 sticky / 负 margin / `marginTop:-64px` hack。

## 改动清单

### 1. `apps/web/src/app/styles/layout.css.ts`

- `main`：加 `height:'100dvh'`、`display:'flex'`、`flexDirection:'column'`、`overflow:'hidden'`；移除自身 padding（下放给 header / scrollArea）；保留桌面 `maxWidth:920` + `margin:auto` 居中。
- 新增共享 `scrollArea`：`flex:1; minWidth:0; minHeight:0; overflowY:'auto'; WebkitOverflowScrolling:'touch'`。padding 按断点：移动 `xl`、≥640 `2xl 3xl`、≥1024 `28px 36px`。`paddingBottom` 移动端用 `calc(48px + tabBarHeight + env(safe-area-inset-bottom))`（清掉固定底部 mobileTabBar），≥1024 改 `28px`。即把原 `main` 的 padding 逻辑搬到这里。

### 2. `apps/web/src/components/layout/AppShellHeader.css.ts`

- `header`：删 `position:sticky` / `top` / `zIndex` / 全部负 `margin`；改 `flexShrink:0`。保留 `borderBottom` 和各断点 `padding`（`lg xl` → `lg 3xl` → `18px 36px`）。背景已是 `transparent`。

### 3. `apps/web/src/pages/page.css.ts`（写作台）

- `pageWrap`：改 `flex:1; minHeight:0; display:flex; flexDirection:column`，去掉 `gap`（头↔内容间距由 scrollArea 顶 padding 提供）。

### 4. `apps/web/src/pages/Home.tsx`

- `AppShellHeader` 之后的 `editorLayout` 整块包进 `<div className={layoutStyles.scrollArea}>`。clear-confirm 弹窗（fixed）不动。

### 5. `apps/web/src/pages/drafts.page.css.ts` + `Drafts.tsx`

- `pageWrap` 同 #3。`DraftLibraryClient` 包进 `scrollArea`。

### 6. `apps/web/src/pages/settings.css.ts` + `Settings.tsx`（最复杂）

- `pageWrap` 同 #3。
- 固定区 = header + `topTabsBar`（桌面）+ `platformMobileTabs`（移动），三者按现有断点 CSS 各自显隐，全部留在 scrollArea 之前。
- `topTabsBar`：删 `position:sticky` / `top:83px` / `marginTop:-64px` / `marginLeft/Right:-36px` 出血 hack；改普通 `flex-shrink:0` 块，自然紧贴 header 下方。保留 `borderBottom`，背景已 `transparent`。
- `platformLayout` 包进 `scrollArea`；其 `minHeight:'calc(100dvh - 220px)'`（防 window 滚动跳动的旧 hack）简化为 `minHeight:'100%'` 或移除——容器滚动后切 tab 不再触发 window 钳制跳动。`marginTop` 与 scrollArea 顶 padding 二选一，避免叠加。
- `floatingSave`（fixed）不动。

## 关键复用 / 注意

- 共享 `scrollArea` 放 `layout.css.ts`，三页统一引用，间距规则一处维护。
- 移动端：`shell` 列布局、`Sidebar` 的 `mobileTabBar`（`position:fixed bottom`）不变；靠 scrollArea 的 `paddingBottom` 让正文尾部不被底栏遮挡。
- 不影响：沉浸模式 `immersiveOverlay`（`fixed inset:0 z:9999`，独立全屏）；`transitionCover`（`absolute inset:0`，仍覆盖 `position:relative` 的 main）；`AgentPanel` 随正文滚动。
- `globals.css` body `minHeight:100vh` 保留无害——main 内部滚动后 body 不再溢出，不产生 window 滚动条。

## 验证

1. `pnpm build`（vanilla-extract 编译 + tsc 通过）。
2. `pnpm dev`，桌面宽屏（≥1024，可拉到超宽）逐页验证：
   - 头部 / 设置页 tab 条固定不动，长内容仅正文区滚动；滚动区上边缘紧贴头部底边，无内容穿过头部透显。
   - 三页 920 居中、两侧留白一致。
3. DevTools 切移动视口（<640 & <1024）：头部 + 设置页 pill tabs 固定，正文滚动；正文尾部不被底部 tabBar 遮挡；安全区 padding 生效。
4. 回归：写作台进/出沉浸模式正常；页面间导航过渡遮罩正常；设置页切 tab 不跳动；写作台清空弹窗、设置页 floatingSave 浮层位置正常。
