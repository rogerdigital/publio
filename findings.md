# Publio 改造 — 调研发现

## 产品维度

- 定位偏工具化，缺差异化护城河。竞品（融媒宝、蚁小二、新榜）已跑通多平台分发
- AI 能力是差异点，当前是"锦上添花"，应升级为"核心驱动力"
- 定时发布 UI 存在但后端无 cron，功能不可用
- 发布即终点，无数据回收，无法形成"发布-追踪-优化"闭环
- 内容安全层空白，直接发布有合规风险

## 架构维度

- page.tsx 全量 `'use client'`，子组件无法享受 Server Component 优化
- syncPlatformDrafts 随输入实时触发，每次按键重算所有平台适配
- researchCache 无 TTL，长时间使用内存膨胀
- eventsource-parser 已安装但未使用（useAgentStream 手写了解析）
- types/index.ts 过于扁平，应按模块拆分
- 缺少 husky/lint-staged/prettier 工程化配置

## UI 维度

- spacing 系统缺失，全靠魔法数字
- 字号阶梯缺失
- textMuted (#6B6860) on bg (#F5F4F0) 对比度约 3.9:1，未达 WCAG AA 4.5:1
- darkTheme token 存在但切换机制未生效
- radius 仅 xl/lg 两档，缺 sm/md

## 交互维度

- 缺沉浸式写作模式（参考 Typora/Medium）
- SlashCommandMenu 无 role="listbox"，键盘导航不完整
- 大量按钮仅有 title 无 aria-label
- 无 WYSIWYG 编辑模式选项

## 功能维度

- 小红书仅纯文本，缺图文笔记
- 知乎缺专栏选择/话题标签
- AI 对话无多轮记忆
- RSS 源硬编码 9 个，用户无法自定义
- AI 适配未自动校验平台规则（字数/格式）
