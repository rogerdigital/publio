# Publio 产品设计与交互优化计划

日期：2026-06-05

## 目标

把 Publio 从“功能集合”收敛为“清晰内容生产闭环”：写作 → 预览/适配 → 发布 → 跟踪结果。

优化重点不是继续增加视觉效果，而是降低认知负担、强化主路径、统一交互状态、提升桌面与移动端的专业生产力体验。

## 核心判断

当前 UI 已经像完整产品，但仍偏“功能堆叠”。主要问题不是功能不足，而是：

- 主路径不够突出。
- 同权按钮过多。
- 发布流程偏表单，不像流程。
- 移动端仍在复刻桌面信息密度。
- 草稿库信息密度高，找稿件效率可以更高。
- 设置页偏填表，缺少系统可用性状态反馈。
- Glassmorphism 使用范围需要收敛。
- 深色模式、状态反馈、空状态、错误状态需要系统化。

最终方向：少加入口，多做状态；少堆卡片，多做流程。

## 非目标

本计划不做以下事情：

- 不新增复杂产品模块。
- 不重写技术栈。
- 不引入新的 UI 框架。
- 不扩大 AI Agent 范围。
- 不把设计优化变成大规模重构。
- 不为了视觉统一牺牲写作、发布、查找效率。

## 设计原则

### 1. 主路径优先

所有页面布局、按钮、卡片层级都服务：写作 → 预览/适配 → 发布 → 跟踪结果。

### 2. 每个区域只有一个主动作

每个页面区域最多保留 1 个 primary action。其他动作降级为 secondary、menu、inline link 或折叠项。

### 3. 状态比入口重要

用户更需要知道系统现在能不能用、下一步做什么，而不是看到更多入口。

### 4. 桌面是工作台，移动是单任务模式

桌面承载完整内容生产流程。移动端服务短时、高频、低耐心操作：改标题、补内容、看状态、简单发布。

### 5. Shell 可以有品牌感，生产区域必须清晰

侧边栏、底部导航、背景可保留 glass。编辑器、表单、长文本、发布检查区域优先清晰、高对比、低干扰。

## 完整优化范围

### 信息架构

- 写作台：写和发布。
- 稿件库：管理内容。
- 分发记录：跟踪结果。
- AI 选题：找选题。
- 设置：配置系统。

后续需要让 AI 选题与写作台连接更紧：

- 选题页生成草稿后，直接进入写作台。
- 写作台显示来源：来自哪个选题、信号、研究摘要。
- 草稿库保留来源标签，方便回溯。

### 首页 / 写作台

当前问题：

- 写作区、最近草稿、模板、媒体库、清空、预览切换、发布面板、Agent 入口、自动保存信息同时出现。
- 用户第一眼不容易判断当前最重要动作。
- 顶部多个 action 视觉权重接近。
- “清空”这种破坏性动作和普通功能并列。
- 最近草稿容易和标题、编辑器争抢层级。
- Agent 面板、发布面板可能同时抢注意力。

优化目标：

- 打开首页 3 秒内，用户知道“在这里写，写完去右边发”。
- “写作”成为唯一视觉中心。
- “发布”作为次级但持续可见流程面板。
- 顶部 action 只保留强相关动作。
- 低频和破坏性动作降级。

具体优化：

- 顶部只保留 2 个主按钮：预览、发布。
- 模板、媒体库、清空合并到“更多”菜单。
- “清空”远离主要操作，并加确认。
- 最近草稿压成轻量横条。
- 自动保存状态放到编辑器底部右侧，弱化存在感。
- 编辑器卡片更突出：更大留白、更强标题输入层级。
- 右侧发布面板固定宽度，减少内容跳动。
- Agent 面板改为上下文抽屉，避免常驻抢占发布面板注意力。

### 发布流程

当前问题：

- 发布区更像配置表单，不像核心流程。
- 用户发布前缺少确定感。
- 平台状态、适配状态、发布状态不够流程化。
- 发布失败后的诊断信息不够贴近失败平台。

优化目标：

- 发布区从“表单感”改成“步骤感”。
- 用户能清楚知道：还能不能发布、为什么不能发、下一步是什么。

建议流程：

1. 选择平台。
2. 检查适配。
3. 预览差异。
4. 发布 / 加入队列。
5. 查看结果。

具体优化：

- 右侧发布面板做成 stepper 或 checklist。
- 每个平台显示明确状态：
  - 未配置。
  - 可发布。
  - 需要适配。
  - 发布中。
  - 成功。
  - 失败可重试。
- “AI 适配”成为发布前检查项，而不只是独立按钮。
- 发布失败后，诊断建议直接挂在失败平台卡片下。
- 错误提示说明：哪个平台失败、为什么失败、可以怎么修。
- 发布结果和分发记录打通，发布成功后能直接查看对应结果。

### 移动端

当前问题：

- 移动端可用，但仍偏桌面信息密度。
- 首页操作、预览、发布、Agent 容易堆在页面流里。
- 筛选区和操作区占用较多首屏空间。

移动端典型任务：

- 快速改标题。
- 补一段内容。
- 查看发布状态。
- 简单发布。

优化目标：

- 移动端不要复刻桌面。
- 移动首页默认只服务一个任务：写作。
- 次级流程用 bottom sheet / drawer 承载。

具体优化：

- 移动首页默认只显示编辑器和一个主操作。
- 预览、发布、Agent 用底部 sheet 打开。
- 浮动发布按钮固定在底部导航上方，不能遮挡编辑内容。
- 顶部 action 横向滚动可保留，但只放低频动作。
- 高频动作固定，不混入横向滚动。
- 移动端编辑器强化“专注写作”模式。
- 移动端所有 sheet 都要处理 safe-area、键盘弹出、滚动锁定。

### 稿件库

当前问题：

- 草稿状态、平台状态、更新时间、操作按钮视觉重量接近。
- 移动端筛选和搜索仍偏重。
- Pipeline 行对专业用户有用，但新用户理解成本高。
- 当前默认展示的元数据偏多，不够“找稿件”。

优化目标：

- 稿件库要像“找稿件”，不是“看所有元数据”。
- 桌面提高扫读效率。
- 移动端减少筛选负担。

桌面优化：

- 列表改成更明确的信息列：
  - 标题 / 摘要。
  - 状态。
  - 平台。
  - 最近更新。
  - 操作。
- Pipeline 信息作为展开详情，而不是默认占用主行空间。
- 状态 badge 使用更强语义色，但保持克制，不能全部依赖橙色系。
- 操作按钮视觉降级，主行优先服务识别内容。

移动端优化：

- 默认只显示：
  - 标题。
  - 状态 badge。
  - 更新时间。
  - 一个更多按钮。
- 筛选区改为“搜索 + 筛选按钮”。
- 点击筛选按钮后打开底部筛选面板。
- 筛选 chips 可在 sheet 内分组展示，避免占用主页面高度。

### 设置页

当前问题：

- 平台卡片平级，但用户最关心“哪些能用、哪些不能用”。
- 保存按钮是页面级，用户不确定保存范围。
- API key / token 类字段形成视觉噪音。
- Prompt 编辑器属于高级设置，但当前可见权重偏高。
- AI Agent 设置缺少直接测试反馈。

优化目标：

- 设置页不是“填表”，而是“知道系统现在能不能工作”。
- 用户能马上知道每个平台、AI Agent、图片托管是否可用。

具体优化：

- 每个平台卡片顶部显示状态：
  - 已连接。
  - 缺少凭证。
  - 配置错误。
  - 待验证。
- 保存按钮改为 dirty state：
  - 无变更：弱化或禁用。
  - 有变更：显示“保存 3 项修改”。
- 平台配置默认折叠，只展示状态和关键字段。
- 展开后显示完整字段。
- AI Agent 设置增加“测试连接”按钮。
- 测试结果直接显示在当前卡片内。
- Prompt 编辑器放入高级设置，默认折叠。
- 图片托管设置同样显示可用性状态和测试结果。

### 全局异步反馈

需要统一覆盖：

- 保存设置。
- 发布。
- AI 适配。
- 草稿导入。
- 连接测试。

统一状态：

- idle：可操作。
- loading：明确进度。
- success：短暂确认。
- error：原因 + 下一步。

错误提示要求：

- 不只显示“失败”。
- 必须说明哪个对象失败。
- 必须说明为什么失败。
- 必须说明下一步可以怎么修。

### 全局按钮层级

当前问题：多个页面有一排同权按钮。

统一规则：

- 每个区域最多 1 个 primary button。
- 同一区域 secondary button 不超过 2 个。
- 低频动作进入 menu。
- 破坏性动作单独隔离。
- Destructive action 不与 primary / secondary 并列。
- 需要确认的破坏性动作必须有确认层。

### 空状态

所有空状态都应产品化，而不是空白或普通提示。

每个空状态包含：

- 当前状态。
- 为什么需要这个东西。
- 一个明确动作。

示例：

- “还没有草稿”。
- “写第一篇内容后，可在这里继续编辑和分发”。
- “新建草稿”。

需要覆盖：

- 无草稿。
- 无搜索结果。
- 无平台连接。
- 无发布记录。
- 无 AI Agent 配置。
- 无图片托管配置。

### 视觉系统

#### Glassmorphism 收敛

当前方向：glass 适合 shell，但不适合大量内容卡片。

规则：

- Shell 用 glass：侧边栏、底部导航、背景层。
- 内容区用 solid surface。
- 表单、编辑器、长文本用高对比纯色背景。
- 阴影少用，多用边框和层级间距。

目标：品牌感留在外壳，生产力区域保持清晰。

#### 深色模式对比度

需要系统性检查：

- muted text 在深色背景上是否低于可读阈值。
- disabled state 是否和普通弱文本混淆。
- border faint 是否太弱导致卡片边界消失。
- orange accent 在深色模式是否过饱和。

Token 方向：

- text / textMuted / textSubtle。
- border / borderStrong / borderInteractive。
- surface / surfaceElevated / surfaceOverlay。

注意：项目已有 tokens，下一步重点是语义更细，不是盲目加颜色。

#### 字体层级

当前问题：页面说明文偏多，部分文案影响扫读。

规则：

- 页面标题：定位当前任务。
- 页面描述：最多一行半。
- 卡片标题：更短，动作导向。
- Badge 文案：只表达状态，不解释。
- 长解释放 tooltip / help text / 展开区域。

目标：页面可扫读，不依赖完整阅读段落。

## 分阶段实施计划

### Phase 0：基线与设计系统约束确认

目的：避免后续每个页面各自修，先建立统一交互规则。

任务：

- 审查现有 Button、SurfaceCard、Badge、Tabs、FilterChip、EmptyState、Toast / Feedback 相关组件。
- 明确 primary / secondary / tertiary / destructive 按钮样式与使用规则。
- 明确 loading / success / error / disabled 状态样式。
- 明确 status badge 语义色：已连接、缺失、错误、待验证、成功、失败、发布中。
- 明确 glass / solid surface 使用边界。
- 明确移动端 bottom sheet / drawer 可复用模式。
- **强制 token 化**：当前 `vars.spacing.*` 使用率 0%，`vars.fontSize.*` 使用率 ~17%（21 处 vs 100+ hardcoded）。将所有 padding/margin/gap/fontSize 收敛到 token 引用，消除 18px、14px、6px 等非 token 值。
- **按钮 size variants**：当前存在 8 种不同 button padding 组合（`6px 10px` 到 `12px 24px`），定义 sm / md / lg 三档尺寸规范。
- **补全 radius token**：现有最小值 `sm` = 8px，但代码中多处使用 4px/5px/6px。新增 `xs` = 4px，`full` = 999px（pill）。
- **修复侧边栏 a11y 文本重复**：当前 accessibility tree 显示 "写作台写作台"、"稿件库稿件库"，需修正 Sidebar 组件的 aria-label 或隐藏重复文本。

验收标准：

- 至少有一套可复用按钮层级规则。
- 至少有一套可复用状态 badge 规则。
- spacing / fontSize token 使用率 > 90%。
- 按钮有明确 size variants，不再出现 freestyle padding。
- 侧边栏导航 a11y tree 无重复文本。
- 不引入新 UI 框架。
- 不破坏现有页面布局。

建议提交粒度：

1. `style(tokens): enforce spacing and fontSize token usage`
   - 全量替换 hardcoded spacing/fontSize 为 token 引用。
   - 补充 `radius.xs` (4px) 和 `radius.full` (999px) token。
2. `style(ui): define action hierarchy and size variants`
   - 调整或补齐基础按钮 / badge / 状态样式。
   - 定义按钮 sm/md/lg size variants。
   - 不改业务流程。
3. `style(ui): align surface and feedback primitives`
   - 收敛卡片、反馈、空状态基础样式。
   - 为后续页面改造提供组件基础。
4. `fix(a11y): deduplicate sidebar navigation labels`
   - 修复侧边栏 aria 文本重复问题。

验证：

- `pnpm lint`
- `pnpm build`
- 手动检查浅色 / 深色基础组件状态。
- 使用 accessibility inspector 确认导航无重复文本。

### Phase 1：首页主路径收敛

目的：让首页成为明确写作工作台。

任务：

- 顶部 action 减少同权按钮。
- 只保留“预览”“发布”两个主要入口。
- 模板、媒体库、清空进入“更多”菜单。
- 清空作为 destructive action，远离主要路径，并加确认。
- 最近草稿压缩为轻量横条。
- 自动保存状态放到编辑器底部右侧。
- 编辑器卡片强化视觉中心。
- 标题输入层级增强。
- 右侧发布面板固定宽度，减少跳动。
- Agent 从常驻竞争面板改为上下文抽屉入口。

验收标准：

- 首页首屏主要视觉焦点是编辑器。
- 页面顶部不出现 4 个以上同权按钮。
- 清空操作不与预览 / 发布并列。
- 最近草稿不抢页面标题和编辑器层级。
- 桌面右侧发布区宽度稳定。
- 移动端无横向溢出。

建议提交粒度：

1. `polish(home): simplify compose header actions`
   - 收敛顶部 action。
   - 增加更多菜单。
   - 调整 destructive action 位置。
2. `polish(home): strengthen editor visual hierarchy`
   - 强化编辑器卡片和标题输入。
   - 弱化自动保存状态。
   - 调整最近草稿横条。
3. `polish(agent): move writing assistant into contextual drawer`
   - Agent 改为上下文抽屉。
   - 避免与发布面板长期争抢注意力。

验证：

- 桌面首页：写作区为视觉中心。
- 移动首页：无横向滚动，主操作清晰。
- 深色首页：编辑器、按钮、弱文本可读。
- `pnpm lint`
- `pnpm build`

### Phase 2：发布面板流程化

目的：把发布区从配置表单改为平台发布 checklist。

任务：

- 把右侧发布区重构为 stepper / checklist。
- 步骤顺序固定：选择平台 → 检查适配 → 预览差异 → 发布 / 加入队列 → 查看结果。
- 每个平台显示状态：未配置、可发布、需要适配、发布中、成功、失败可重试。
- AI 适配成为发布前检查项。
- 发布失败诊断内联到失败平台卡片。
- 发布成功后提供查看分发结果入口。
- 错误提示显示平台、原因、下一步。
- **发布按钮文案移动端溢出**：当前 disabled 状态列举所有平台名（如"微信公众号、小红书、知乎、X (Twitter) 内容待补全"），移动端必然溢出。改为聚合文案如"4 个平台内容待补全"。

验收标准：

- 用户能一眼判断哪些平台可发布。
- 用户能一眼判断发布流程卡在哪一步。
- AI 适配不是孤立按钮，而是流程检查项。
- 失败状态能看到可执行修复建议。
- 发布完成后能跳转查看结果。

建议提交粒度：

1. `refactor(publish): model platform readiness states`
   - 整理平台可发布状态映射。
   - 不改 UI 或小范围改 UI。
2. `polish(publish): present publishing checklist`
   - 实现 stepper / checklist UI。
   - 接入平台状态。
3. `polish(publish): inline adaptation and failure guidance`
   - AI 适配作为检查项。
   - 失败诊断展示到平台卡片内。
4. `polish(publish): link publish results into task history`
   - 发布成功后引导查看结果。

验证：

- 未配置平台：显示“未配置”并给设置入口。
- 已配置平台：显示“可发布”。
- 需要适配内容：显示“需要适配”。
- 发布中：按钮禁用并显示进度。
- 发布成功：显示成功和查看结果。
- 发布失败：显示失败原因和重试 / 修复入口。
- `pnpm lint`
- `pnpm build`

### Phase 3：稿件库重构为“找稿件”体验

目的：降低元数据噪音，提高草稿查找效率。

任务：

- 桌面列表改为明确列结构：标题 / 摘要、状态、平台、最近更新、操作。
- Pipeline 信息改为展开详情。
- 状态 badge 使用语义色。
- 操作按钮降级，避免抢占主行。
- 移动端默认只显示标题、状态 badge、更新时间、更多按钮。
- 移动端筛选区改为“搜索 + 筛选按钮”。
- 筛选按钮打开 bottom sheet。
- 筛选 chips 在 sheet 内分组展示。
- 搜索无结果显示产品化空状态。
- 无草稿显示产品化空状态。

验收标准：

- 桌面列表扫读效率更高。
- Pipeline 不再默认占用主行。
- 移动端首屏不过度被筛选区占据。
- 搜索和筛选组合清晰。
- 所有空结果都有明确行动。

建议提交粒度：

1. `polish(drafts): simplify desktop draft rows`
   - 调整桌面列结构。
   - 操作降级。
2. `polish(drafts): move pipeline details into expansion`
   - Pipeline 信息折叠到详情。
   - 保留专业用户可访问性。
3. `polish(drafts): compact mobile library filters`
   - 搜索 + 筛选按钮。
   - bottom sheet 承载筛选项。
4. `polish(drafts): add actionable empty states`
   - 无草稿、无搜索结果空状态。

验证：

- 桌面列表列宽稳定。
- 移动端无横向溢出。
- 移动端筛选 sheet 可打开、关闭、选择、清除。
- 搜索无结果显示正确空状态。
- `pnpm lint`
- `pnpm build`

### Phase 4：设置页状态化

目的：让设置页表达系统可用性，而不是只呈现输入表单。

任务：

- 平台卡片顶部显示状态：已连接、缺少凭证、配置错误、待验证。
- 保存按钮接入 dirty state。
- 无变更时保存按钮弱化或禁用。
- 有变更时显示“保存 N 项修改”。
- 平台配置默认折叠，只展示状态和关键字段。
- 展开后显示完整字段。
- AI Agent 增加“测试连接”。
- AI Agent 测试结果内联显示。
- Prompt 编辑器进入高级设置，默认折叠。
- 图片托管增加状态与测试结果。
- 无平台连接 / 无 AI 配置 / 无图片托管配置显示产品化空状态或配置提示。

验收标准：

- 用户能立刻知道每个平台是否可用。
- 保存按钮清楚表达是否有未保存修改。
- 高级设置不默认制造视觉噪音。
- 测试连接结果不需要去别处找。
- 错误状态有可执行下一步。

建议提交粒度：

1. `polish(settings): show configuration readiness states`
   - 平台状态 badge。
   - 缺失 / 错误 / 待验证展示。
2. `polish(settings): add dirty save affordance`
   - 保存按钮 dirty state。
   - 文案显示修改数量。
3. `polish(settings): collapse advanced configuration fields`
   - 平台详情折叠。
   - Prompt 编辑器默认折叠。
4. `feat(settings): add inline connection checks`
   - AI Agent 测试连接。
   - 图片托管测试反馈。

验证：

- 无配置：显示缺少凭证和配置入口。
- 填写但未保存：保存按钮显示修改数量。
- 保存成功：success 反馈，dirty state 清空。
- 测试失败：显示原因和下一步。
- 测试成功：显示可用状态。
- `pnpm lint`
- `pnpm build`

### Phase 5：移动端单任务模式

目的：移动端从压缩桌面改为面向快速写作和检查的体验。

任务：

- 移动首页默认只保留编辑器和一个主操作。
- 发布、预览、Agent 用 bottom sheet 展示。
- 浮动发布按钮固定在底部导航上方。
- 处理 safe-area，避免遮挡底部导航。
- 处理键盘弹出时编辑器和 sheet 的滚动行为。
- 专注写作模式在移动端更显性。
- 低频动作保留在更多菜单或横向 action 区。
- 高频动作固定，不能混入横向滚动。

验收标准：

- 移动首页首屏只服务写作。
- 发布 / 预览 / Agent 不同时堆在页面流里。
- 底部按钮不遮挡编辑内容。
- 键盘弹出后仍能正常输入和关闭 sheet。
- iOS safe-area 和 Android 常规 viewport 都可用。

建议提交粒度：

1. `polish(mobile): introduce compose bottom sheets`
   - 预览、发布、Agent sheet 容器。
2. `polish(mobile): simplify compose primary path`
   - 首页默认只保留编辑器和主操作。
3. `polish(mobile): stabilize floating actions around tab bar`
   - 浮动按钮、安全区域、键盘处理。
4. `polish(mobile): emphasize focused writing mode`
   - 移动专注写作入口强化。

验证：

- iPhone 宽度：375 / 390 / 430。
- Android 常见宽度：360 / 412。
- 打开键盘后无重要操作被遮挡。
- Bottom sheet 可用键盘、触摸、返回关闭。
- 无横向滚动。
- `pnpm lint`
- `pnpm build`

### Phase 6：全局反馈、空状态、错误状态统一

目的：让所有关键异步动作都有一致状态闭环。

任务：

- 定义统一 feedback pattern。
- 保存设置接入 idle / loading / success / error。
- 发布接入 idle / loading / success / error。
- AI 适配接入 idle / loading / success / error。
- 草稿导入接入 idle / loading / success / error。
- 连接测试接入 idle / loading / success / error。
- 错误文案必须包含对象、原因、下一步。
- 空状态统一为“状态 + 原因 + 动作”。
- 覆盖无草稿、无搜索结果、无平台连接、无发布记录、无 AI Agent 配置、无图片托管配置。

验收标准：

- 没有关键异步操作只显示静默失败。
- 所有空状态都有可执行下一步。
- 成功反馈短暂且不打断流程。
- 错误反馈能指导修复。

建议提交粒度：

1. `style(feedback): standardize async operation states`
   - 通用状态样式和组件基础。
2. `polish(feedback): improve actionable error messages`
   - 关键错误文案改造。
3. `polish(empty-states): add task-oriented empty states`
   - 各页面空状态补齐。

验证：

- 逐一触发保存、发布、AI 适配、导入、测试连接状态。
- 验证错误文案不是泛化“失败”。
- `pnpm lint`
- `pnpm build`

### Phase 7：视觉系统收口与深色模式审查

目的：提升整体专业感，避免视觉噪音继续积累。

任务：

- 收敛 glass 使用范围。
- Shell 保留 glass。
- 内容区转向 solid surface。
- 编辑器、表单、长文本提高背景对比。
- 减少阴影，更多用边框和间距表达层级。
- 检查 muted text 深色可读性。
- 检查 disabled state 与普通弱文本区分。
- 检查 border faint 是否太弱。
- 检查 orange accent 深色下是否过饱和。
- 细化语义 token：text / textMuted / textSubtle，border / borderStrong / borderInteractive，surface / surfaceElevated / surfaceOverlay。
- 压缩说明文长度。
- 页面描述最多一行半。
- 卡片标题更短、更动作导向。
- Badge 只表达状态。
- 长解释进入 tooltip / help text / 展开区域。
- **统一 header pattern**：当前 `AppShellHeader`（sans-serif, 0.08em tracking）和 `PageSection`（serif, 0.32em tracking, uppercase）两套 header 风格并存，服务类似功能但视觉差异大。选定一套作为标准，或明确各自适用场景并文档化。

验收标准：

- 生产力内容区更清晰。
- 深色模式弱文本可读。
- disabled 与 muted 可区分。
- 卡片边界在浅色 / 深色都清楚。
- 页面可扫读，不依赖读完整段说明。

建议提交粒度：

1. `style(theme): refine semantic color tokens`
   - 细化语义 token。
2. `style(layout): reduce glass in content surfaces`
   - 内容卡片 solid surface 化。
3. `style(theme): improve dark mode contrast`
   - 弱文本、边框、disabled、accent 调整。
4. `copy(ui): tighten page and card descriptions`
   - 文案层级压实。

验证：

- 浅色 / 深色首页、稿件库、设置页逐页检查。
- 编辑器、表单、长文本区域可读性检查。
- 移动端底部导航和 sheet 可读性检查。
- `pnpm lint`
- `pnpm build`

### Phase 8：AI 选题到写作闭环增强

目的：让产品从多个功能页变成内容生产闭环。

任务：

- AI 选题生成草稿后直接进入写作台。
- 写作台显示草稿来源：选题、信号、研究摘要。
- 草稿库保留来源标签。
- 草稿详情中可回溯来源。
- 来源信息只作为辅助上下文，不抢写作主路径。

验收标准：

- 从选题到写作路径连续。
- 写作台能看到来源上下文。
- 草稿库能按来源识别内容。
- 不增加首页视觉噪音。

建议提交粒度：

1. `feat(drafts): store editorial source metadata`
   - 草稿来源数据结构。
2. `feat(topic): create drafts from topic context`
   - 从选题生成草稿并跳转写作台。
3. `polish(home): show compact draft source context`
   - 写作台紧凑来源信息。
4. `polish(drafts): surface source tags in library`
   - 草稿库来源标签。

验证：

- 从选题创建草稿。
- 跳转写作台后来源信息正确。
- 草稿库显示来源标签。
- 普通手动草稿不受影响。
- `pnpm lint`
- `pnpm build`

## 推荐 PR / 提交组织

为控制风险，不建议一次性大 PR。建议按 6 个 PR 推进，每个 PR 可独立验证、独立回滚。

### PR 1：设计系统与基础交互规范

包含：

- Phase 0。
- Phase 6 的基础反馈组件部分。

目标：先建立按钮、状态、反馈、surface 的统一基础。

建议 commits：

1. `style(tokens): enforce spacing and fontSize token usage`
2. `style(ui): define action hierarchy and size variants`
3. `style(ui): align surface and feedback primitives`
4. `fix(a11y): deduplicate sidebar navigation labels`
5. `style(feedback): standardize async operation states`

### PR 2：首页与发布主路径

包含：

- Phase 1。
- Phase 2。

目标：把核心工作台改成写作 + 发布流程。

建议 commits：

1. `polish(home): simplify compose header actions`
2. `polish(home): strengthen editor visual hierarchy`
3. `polish(agent): move writing assistant into contextual drawer`
4. `refactor(publish): model platform readiness states`
5. `polish(publish): present publishing checklist`
6. `polish(publish): inline adaptation and failure guidance`
7. `polish(publish): link publish results into task history`

### PR 3：稿件库查找体验

包含：

- Phase 3。

目标：让稿件库从元数据展示改成高效查找。

建议 commits：

1. `polish(drafts): simplify desktop draft rows`
2. `polish(drafts): move pipeline details into expansion`
3. `polish(drafts): compact mobile library filters`
4. `polish(drafts): add actionable empty states`

### PR 4：设置页可用性状态

包含：

- Phase 4。

目标：设置页表达系统可用性。

建议 commits：

1. `polish(settings): show configuration readiness states`
2. `polish(settings): add dirty save affordance`
3. `polish(settings): collapse advanced configuration fields`
4. `feat(settings): add inline connection checks`

### PR 5：移动端单任务模式

包含：

- Phase 5。

目标：移动端从桌面压缩版变为快速写作体验。

建议 commits：

1. `polish(mobile): introduce compose bottom sheets`
2. `polish(mobile): simplify compose primary path`
3. `polish(mobile): stabilize floating actions around tab bar`
4. `polish(mobile): emphasize focused writing mode`

### PR 6：视觉系统收口与内容闭环

包含：

- Phase 7。
- Phase 8。

目标：统一视觉质量，并增强 AI 选题到写作闭环。

建议 commits：

1. `style(theme): refine semantic color tokens`
2. `style/layout): reduce glass in content surfaces`
3. `style(theme): improve dark mode contrast`
4. `copy(ui): tighten page and card descriptions`
5. `feat(drafts): store editorial source metadata`
6. `feat(topic): create drafts from topic context`
7. `polish(home): show compact draft source context`
8. `polish(drafts): surface source tags in library`

## 每个 PR 的通用验收流程

每个 PR 完成前必须执行：

1. `pnpm lint`
2. `pnpm build`
3. 桌面浏览器检查：
   - 首页。
   - 稿件库。
   - 设置页。
4. 移动视口检查：
   - 375px。
   - 390px。
   - 430px。
5. 深色模式检查。
6. 浅色模式检查。
7. 无横向滚动检查。
8. 底部导航遮挡检查。
9. Next Dev Tools 左下角冲突检查。
10. 关键异步动作状态检查。

## 全局完成定义

整个计划完整实施后，应满足：

- 首页主路径清晰：写作是核心，发布是流程。
- 顶部同权按钮显著减少。
- 清空等破坏性动作不再与主要动作并列。
- 发布面板是 checklist / stepper，而不是普通表单。
- 每个平台有明确发布状态。
- AI 适配成为发布前检查项。
- 发布失败能内联看到原因和下一步。
- 稿件库默认服务查找，不堆叠所有元数据。
- Pipeline 信息保留，但进入展开详情。
- 移动端默认单任务写作。
- 移动端发布、预览、Agent 通过 bottom sheet 呈现。
- 设置页显示系统可用性状态。
- 保存按钮清楚表达 dirty state。
- AI Agent 和图片托管能测试连接。
- Prompt 编辑器默认折叠为高级设置。
- 所有关键异步动作有 idle / loading / success / error。
- 所有关键空状态有状态、原因、动作。
- Glassmorphism 主要留在 shell。
- 内容区使用更清晰的 solid surface。
- 深色模式弱文本、边框、disabled、accent 可读。
- 页面文案更短、更可扫读。
- AI 选题可以连到写作台和草稿库来源回溯。

## 风险与控制

### 风险 1：一次性改动过大

控制：拆成 6 个 PR，每个 PR 可独立验证、独立回滚。

### 风险 2：视觉收敛导致品牌感变弱

控制：Shell 保留 glass 和品牌感，内容区优先生产力可读性。

### 风险 3：移动端 bottom sheet 引入滚动和键盘问题

控制：Phase 5 单独实施，重点验证 safe-area、键盘、滚动锁定。

### 风险 4：发布流程改造影响现有发布能力

控制：先抽象 readiness state，再替换 UI；发布 API 和业务能力不在同一提交里大改。

### 风险 5：设置页测试连接需要真实凭证

控制：测试连接失败也要有可解释状态；无凭证环境下验证缺失凭证路径。

## 建议实施顺序

推荐顺序：

1. PR 1：设计系统与反馈基础。
2. PR 2：首页与发布主路径。
3. PR 3：稿件库查找体验。
4. PR 4：设置页可用性状态。
5. PR 5：移动端单任务模式。
6. PR 6：视觉系统收口与内容闭环。

理由：

- 先建基础规则，避免页面各自造轮子。
- 再处理核心转化路径：首页和发布。
- 接着处理管理效率：稿件库和设置页。
- 然后单独处理移动端，避免桌面改造和移动复杂性混在一起。
- 最后做视觉系统收口和跨页面闭环。
