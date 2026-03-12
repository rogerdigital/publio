# Multi-Platform Publisher

> 一次编辑，多平台发布

Multi-Platform Publisher 是一个基于 Next.js 构建的多平台内容分发工具，支持将 Markdown 文章一键同步发布到微信公众号、小红书、知乎和 X (Twitter) 等平台。

## 功能特性

- **Markdown 编辑器** — 内置实时预览的 Markdown 编辑器，所见即所得
- **多平台并发发布** — 一键将文章同步到多个平台，基于 `Promise.allSettled` 并发执行
- **四大平台支持**
  - 🟢 **微信公众号** — 通过 AppID/AppSecret 认证，自动创建草稿并发布
  - 🔴 **小红书** — OAuth 认证，自动适配平台字数限制（标题 20 字，内容 1000 字）
  - 🔵 **知乎** — 基于专栏 API，支持 HTML 富文本内容发布
  - ✖️ **X (Twitter)** — OAuth 1.0a 认证，长文自动拆分为 Thread 并编号
- **凭据管理** — 可视化设置页面，安全管理各平台 API 密钥，密钥脱敏显示
- **内容自动转换** — Markdown → HTML（微信/知乎）、Markdown → 纯文本（小红书/X）
- **发布状态追踪** — 实时显示各平台发布进度与结果，支持跳转已发布内容

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 前端 | React 19 |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS v4 |
| 编辑器 | @uiw/react-md-editor |
| Markdown 解析 | marked |
| Twitter SDK | twitter-api-v2 |
| 包管理 | pnpm |

## 项目结构

```
src/
├── app/
│   ├── layout.tsx                # 根布局（侧边栏 + 内容区）
│   ├── page.tsx                  # 首页：编辑器 + 平台选择 + 发布
│   ├── globals.css               # 全局样式
│   ├── settings/page.tsx         # 设置页：各平台凭据管理
│   └── api/
│       ├── publish/route.ts      # 批量发布 API
│       ├── platforms/            # 各平台独立发布 API
│       │   ├── wechat/route.ts
│       │   ├── xiaohongshu/route.ts
│       │   ├── zhihu/route.ts
│       │   └── x/route.ts
│       └── settings/route.ts    # 凭据读写 API
├── components/
│   ├── layout/Sidebar.tsx        # 侧边栏导航
│   ├── editor/MarkdownEditor.tsx # Markdown 编辑器组件
│   └── publish/
│       ├── PlatformSelector.tsx  # 平台选择器
│       ├── PublishButton.tsx     # 发布按钮
│       └── PublishStatusPanel.tsx # 发布状态面板
├── lib/
│   ├── config.ts                 # 环境变量配置读取
│   ├── markdown.ts               # Markdown 转换工具
│   └── publishers/               # 各平台发布器实现
│       ├── types.ts
│       ├── wechat.ts
│       ├── xiaohongshu.ts
│       ├── zhihu.ts
│       └── x.ts
├── stores/
│   └── publishStore.ts          # Zustand 状态管理
└── types/
    └── index.ts                  # 类型定义
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm

### 安装

```bash
# 克隆项目
git clone https://github.com/rogerdigital/multi-platform-publisher.git
cd multi-platform-publisher

# 安装依赖
pnpm install
```

### 配置

复制环境变量模板并填入各平台的 API 凭据：

```bash
cp .env.example .env.local
```

也可以启动项目后，在设置页面中通过 UI 配置各平台凭据。

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 平台配置指南

### 微信公众号

需要在 [微信公众平台](https://mp.weixin.qq.com/) 获取：
- AppID
- AppSecret

### 小红书

需要在 [小红书开放平台](https://open.xiaohongshu.com/) 获取：
- App Key
- App Secret

### 知乎

需要通过浏览器获取：
- 登录后的 Cookie

### X (Twitter)

需要在 [Twitter Developer Portal](https://developer.twitter.com/) 获取：
- API Key
- API Secret
- Access Token
- Access Token Secret

## License

[MIT](./LICENSE)
