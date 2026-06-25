# 写作台手动保存改造计划

日期：2026-06-18

## 背景

写作台当前完全依赖自动保存（`useAutoSave` hook，停止输入 1s 防抖触发）。用户要求：

1. **删除全部自动保存逻辑**。
2. **加手动保存按钮**。
3. **页面被关掉或崩溃前**，若当前版本未被保存，触发兜底保存。

## 目标结构

新建 `useManualSave` hook 替代 `useAutoSave`，对外暴露手动 `save()`、`saveStatus`、`isDirty`；内部管理 dirty 标志 + 注册 unload 类事件监听做兜底保存。UI 在 header 加保存按钮，复用 Cmd/Ctrl+S 快捷键（MarkdownEditor 已内置）。

## 改动清单

### 1. 新建 `apps/web/src/hooks/useManualSave.ts`

替代 `useAutoSave`。对外接口：

```ts
interface UseManualSaveOptions {
  title: string;
  content: string;
  draftId: string | null;
  onDraftCreated: (id: string) => void;
}
interface UseManualSaveResult {
  saveStatus: SaveStatus; // 'idle' | 'saving' | 'saved' | 'error'
  isDirty: boolean;
  save: () => Promise<void>;
}
```

核心逻辑：

- **dirty 判断**：维护 `lastSavedRef = { title, content }`。title/content 任一与快照不同 → `isDirty = true`；成功保存后更新快照、`isDirty = false`。初始（无草稿）快照为空串 → 非空输入即 dirty；通过 `draftId` 载入草稿后，把快照设为载入值（载入即"已保存"态，不误判）。
- **手动 `save()`**：沿用旧保存流程——有 `draftId` → `PATCH /api/drafts/:id`；无 → `POST /api/drafts` 创建（首次保存创建草稿，标题和内容须都非空，沿用旧保护逻辑）。保存成功后更新快照 + `isDirty=false` + `saveStatus='saved'`；失败 → `saveStatus='error'` + Toast 提示。
- **空内容保护**：标题和内容都为空时，`save()` 直接返回（避免空草稿垃圾）。

### 2. 兜底保存（beforeunload + visibilitychange）

在 hook 内用 `useEffect` 注册两个事件监听，依赖 `isDirty` 与最新内容的 ref：

- `beforeunload`：页面刷新/关闭/跳转时，若 `isDirty` 触发兜底保存。
- `visibilitychange`（切到 `hidden`）：覆盖移动端切后台、标签页隐藏、部分崩溃场景，若 `isDirty` 触发兜底保存。

**关键技术点**：unload 时普通 async fetch 会被浏览器中断。兜底保存用 **`fetch(url, { keepalive: true })`**——`keepalive` 标志让请求在页面卸载后仍由浏览器发出，且支持 PATCH 与自定义 headers（比 `sendBeacon` 更适合，后者仅支持 POST、无法带 JSON body 以 PATCH 语义更新）。

兜底保存内部复用一个 `flushSave()`：

- 读取 title/content/draftId 的最新 ref（同步）。
- 空内容跳过。
- 已无 dirty 跳过（兜底成功后立即置 `isDirty=false`，避免 beforeunload 与 visibilitychange 重复发请求）。
- 选 endpoint + method：有 draftId → PATCH；无 → POST。
- `fetch(url, { method, headers, body, keepalive: true })`。不 await（unload 期间无法等），不更新 React 状态（组件即将卸载/已卸载）。

### 3. 删除 `apps/web/src/hooks/useAutoSave.ts`

整体删除。确认无其他引用（Home.tsx 之外应无）。

### 4. `apps/web/src/pages/Home.tsx`

- import 从 `useAutoSave` 改为 `useManualSave`。
- 解构改为 `{ saveStatus, isDirty, save }`（原 `{ saveStatus, triggerSave }`）。
- 把传给 `<MarkdownEditor onSave={...}>` 的回调改为 `save`（Cmd/Ctrl+S 快捷键通道不变）。
- header 的 `action` 区域加**保存按钮**：复用项目内已有的主按钮视觉（黑底白字，与设置页 `saveButton` / "测试连接"一致）。`disabled={!isDirty}`，点击调 `save()`。按钮内文案：saving 时"保存中…"，否则"保存"。
- 移除原 `saveStatusHint`（"保存中…/已自动保存"）——状态由按钮自身反映。

### 5. `apps/web/src/pages/page.css.ts`

- 新增 `saveButton` 样式（黑底白字主按钮，参考 settings.css.ts 的 `saveButton`：`background: accent`、`color: surfaceDarkText`、`borderRadius: lg`、hover `brightness(1.05)`、disabled `opacity:0.5`）。
- 若 `saveStatusHint` 样式不再被任何地方引用则删除（grep 确认）。

## 不改动

- API 端点（`/api/drafts` POST、`/api/drafts/:id` PATCH）。
- `lib/drafts/client.ts` 的 `ensureDraft` / `updateDraft`。
- MarkdownEditor 的 `onSave` prop 接口（已接好 Cmd+S）。
- 草稿载入流程（通过 `draftId` 从 API 读取并 `setTitle`/`setContent`）。

## 关键复用 / 注意

- **快照同步**：title/content 是受控状态，载入草稿的 effect 里 `setTitle`/`setContent` 后，需同步更新 `lastSavedRef`，否则载入后立即被判为 dirty。实现方式：载入 effect 内 `setTitle/setContent` 成功后，把 ref 置为载入值；或用一个 `loadedDraftIdRef` 标记，在快照比较时跳过本次。推荐前者，直观。
- **事件去重**：visibilitychange 与 beforeunload 可能连续触发（手机端切后台再关闭）。`flushSave` 成功后立即把 dirty ref 置 false，后续事件读到非 dirty 即跳过。
- **移动端 visibilitychange 误触发**：切到其他 app 再回来会触发 hidden→visible，hidden 时已兜底保存（置 dirty=false），回来继续编辑会重新变 dirty，属正常行为，不会丢失数据。
- **keepalive 体积限制**：浏览器对 keepalive 请求 body 有 64KB 限制。草稿是 Markdown 文本，正常远小于此；超大草稿（如粘贴巨量内容）可能被截断——属可接受边界情况，手动保存走正常 fetch 不受限。
- **状态显示**：按钮文案区分 saving/saved，但兜底保存（unload 期间）不更新 React 状态（组件即将消失），用户看不到——这是预期行为，兜底只为防丢失。

## 验证

1. `pnpm lint` + `pnpm test`（如有相关测试）。
2. `pnpm build`（tsc + vite 通过）。
3. `pnpm dev`，写作台手动测试：
   - 输入内容 → 按钮变为可点（dirty）；**停止输入不再自动保存**。
   - 点"保存" / 按 Cmd+S → 状态变"保存中…"→"保存"；刷新后草稿仍在。
   - 首次保存（无 draftId）→ POST 创建草稿，URL 变 `/?draftId=xxx`。
   - 载入已有草稿（`/?draftId=xxx`）→ 进入时不误判 dirty。
   - 改动后不保存，直接刷新/关闭 → beforeunload 触发兜底保存，重开仍在（DevTools Network 可见 keepalive 请求）。
   - 改动后切到其他标签页/最小化 → visibilitychange 触发兜底保存。
   - 空内容（标题和正文都空）→ 按钮禁用/保存跳过。
4. 移动端视口（DevTools）验证 visibilitychange 兜底。
