# Publio

[English](./README.md) | [中文](./README_zh.md)

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./package.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](./tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-115%20passing-brightgreen.svg)](#testing)

> AI-native content operations platform. Write once, publish everywhere.

Publio is a multi-platform content distribution tool that consolidates Markdown editing, AI-powered topic discovery, content adaptation, and one-click publishing into a unified workspace. It supports WeChat Official Account, Xiaohongshu, Zhihu, and X (Twitter).

---

## Features

### Writing Desk

- **Rich Markdown editor** with desktop live-preview and mobile fallback
- **WYSIWYG mode** — toggle between source editing and side-by-side live preview
- **Immersive writing mode** — full-screen distraction-free editing with centered 720px layout
- **Auto-save** with 1-second debounce and automatic draft creation
- **Editorial context panel** — title status, structural statistics, publishability signals
- **Slash commands** — `/ai-expand`, `/ai-condense`, `/ai-rewrite`, `/ai-polish`, `/ai-continue`
- **Version history** — auto-snapshot on title/content changes with restore capability
- **Content templates** — 6 built-in templates for rapid drafting

### AI Agent System

All AI features require an OpenAI-compatible API (Zhipu GLM, DeepSeek, Qwen, OpenAI, Ollama, etc.). Gracefully degrades when unconfigured.

| Capability | Description |
|-----------|-------------|
| **Writing Assistant** | Expand, condense, rewrite, polish, continue — via slash commands with streaming output |
| **Platform Adaptation** | Per-platform content rewrite with rule injection (word count, format constraints) |
| **Topic Research** | Deep analysis of news clusters with multi-angle insights |
| **Publish Diagnose** | Failure analysis with actionable retry suggestions |
| **Content Copilot** | Brand profile-driven topic recommendations based on current news trends |
| **Style Learning** | Extracts writing style from historical drafts and injects into prompts |
| **Multi-turn Chat** | Conversational AI panel with session-persistent history |

### AI News Desk

- Aggregates RSS feeds from 9+ built-in sources plus custom user-defined sources
- Topic clustering, 6-dimension scoring (freshness, impact, momentum, credibility, visual-readiness, coverage)
- Research brief per cluster with what happened, why it matters, who is affected, recommended angles
- One-click conversion to editor draft with research context embedded

### Multi-Platform Publishing

- Concurrent publish via `Promise.allSettled` across all selected platforms
- **Content moderation** — sensitive word detection with pre-publish warning dialog
- **Platform validation** — automatic rule checking (title length, content limits, format constraints)
- **Publish progress overlay** — real-time status polling with per-platform receipts
- **Sync task tracking** — failure diagnosis, smart retry, manual mark-done
- **Scheduled publish** — backend cron-based execution with persistent task queue
- **Post-publish metrics** — views, likes, comments, shares aggregated in analytics dashboard

### Content Calendar

- Monthly view with event display for drafts, scheduled, published, and failed items
- Click-through navigation to editor or sync task detail

### Settings & Configuration

- Platform credential management with OAuth flow and connection verification
- AI Agent configuration (base URL, API key, model) with hot-reload
- Custom RSS feed source management
- Custom AI prompt editor (per-platform and global)
- Brand profile configuration for content copilot
- Writing style profile with auto-analysis from historical drafts

### Design System

- **Theme toggle** — light / dark / system preference with localStorage persistence
- **Design tokens** — spacing, typography, color, radius with WCAG AA compliant contrast
- **Responsive layout** — desktop sidebar navigation, adaptive content areas

---

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm

### Installation

```bash
git clone https://github.com/rogerdigital/publio.git
cd publio
pnpm install
cp .env.example .env.local   # configure platform credentials (or set up later in Settings)
pnpm dev                      # starts with port cleanup and cache clearing
```

`pnpm dev` automatically kills残留 Next.js processes and clears `.next/cache`. Use `pnpm run dev:raw` to skip cleanup.

Open http://localhost:3000.

### Commands

```bash
pnpm dev              # development mode (with port cleanup)
pnpm build            # production build
pnpm start            # production server
pnpm preview           # build + start
pnpm test             # run tests (Vitest)
pnpm lint             # ESLint
pnpm format           # Prettier format all files
pnpm verify           # lint + test + build
```

---

## Configuration

### Platform Credentials

Managed via `.env.local` or the Settings page at runtime:

| Platform | Variables | Source |
|----------|-----------|--------|
| WeChat | `WECHAT_APP_ID`, `WECHAT_APP_SECRET` | [mp.weixin.qq.com](https://mp.weixin.qq.com/) > Development > Basic Config |
| Xiaohongshu | `XHS_APP_ID`, `XHS_APP_SECRET`, `XHS_ACCESS_TOKEN` | [Xiaohongshu Open Platform](https://open.xiaohongshu.com/) |
| Zhihu | `ZHIHU_COOKIE` | Browser DevTools > Network > copy Cookie |
| X (Twitter) | `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` | [developer.x.com](https://developer.x.com/) |

### AI Agent (Optional)

All three required to activate AI features:

| Variable | Description |
|----------|-------------|
| `AGENT_BASE_URL` | OpenAI-compatible endpoint (e.g. `https://api.openai.com/v1`) |
| `AGENT_API_KEY` | API key for the chosen provider |
| `AGENT_MODEL` | Model name (e.g. `gpt-4o-mini`, `deepseek-chat`, `glm-4-flash`) |
| `AGENT_MAX_TOKENS` | Optional, default 2048 |
| `AGENT_TEMPERATURE` | Optional, default 0.7 |

---

## Architecture

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                  # Server Component (metadata + shell)
│   ├── page-client.tsx           # Client Component (editor + panels)
│   ├── ai-news/                  # AI topic discovery desk
│   ├── analytics/                # Post-publish metrics dashboard
│   ├── calendar/                 # Content scheduling calendar
│   ├── drafts/                   # Draft library
│   ├── settings/                 # Platform & AI configuration
│   ├── sync-tasks/               # Distribution task tracking
│   └── api/                      # Route Handlers
│       ├── agent/                  # AI endpoints (write, adapt, research, diagnose, chat)
│       ├── copilot/                # Content copilot (profile, recommend, style)
│       ├── drafts/                 # Draft CRUD
│       ├── metrics/                # Metrics collection
│       ├── platforms/              # Platform connection management
│       ├── publish/                # Publish endpoint
│       ├── rss-sources/            # Custom RSS CRUD
│       ├── sync-tasks/             # Sync task management
│       └── custom-prompts/         # Custom prompt CRUD
├── components/
│   ├── layout/                   # AppShellHeader, Sidebar, SurfaceCard, ThemeToggle
│   ├── editor/                   # MarkdownEditor, SlashCommandMenu, ImmersiveMode, WYSIWYG toggle
│   ├── news/                     # AiNewsPageClient, TopicSignalCard, ScoreBar
│   ├── publish/                  # PlatformSelector, PublishButton, ModerationWarning, PreviewPanel
│   ├── sync/                     # SyncTaskList, SyncTaskDetail
│   ├── agent/                    # AgentPanel, AgentStreamOutput
│   ├── copilot/                  # BrandProfileForm, TopicRecommendationPanel, StyleProfile
│   ├── analytics/                # MetricsCard
│   ├── calendar/                 # CalendarPageClient
│   └── drafts/                   # DraftLibraryClient
├── hooks/                        # useAutoSave, useSlashCommands, useAgentStream, useImmersiveMode
├── lib/
│   ├── agent/                    # LLM provider, streaming, prompt templates
│   ├── ai-news/                  # RSS aggregation, clustering, scoring
│   ├── copilot/                  # Brand profile, style learning, topic recommendation
│   ├── custom-prompts/           # Custom prompt storage
│   ├── drafts/                   # Draft CRUD with version history
│   ├── metrics/                  # Post-publish metrics storage
│   ├── moderation/               # Sensitive word detection
│   ├── platformAdapters/         # Content format adaptation per platform
│   ├── platformConnections/      # Connection management & OAuth
│   ├── platformRules/            # Platform content validation rules
│   ├── publishers/               # Platform-specific publish logic
│   ├── rss-sources/              # Custom RSS source storage
│   ├── scheduler/                # Scheduled publish execution
│   ├── storage/                  # JSON file collection, env file utilities
│   └── sync/                     # Distribution task state machine
├── stores/                       # Zustand stores (publishStore, agentStore, toastStore)
├── styles/                       # Design tokens (spacing, typography, color, radius)
└── types/                        # TypeScript type definitions
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript 5 (strict mode) |
| Styling | vanilla-extract (`@vanilla-extract/css` + `@vanilla-extract/recipes`) |
| State | Zustand 5 |
| Editor | @uiw/react-md-editor |
| Markdown | marked 15 |
| LLM Streaming | OpenAI-compatible SSE via fetch + ReadableStream |
| Social API | twitter-api-v2 |
| Linting | ESLint 9 + eslint-config-next |
| Formatting | Prettier |
| Testing | Vitest + Testing Library |
| Git Hooks | Husky + lint-staged |
| Package Manager | pnpm |

---

## Testing

```bash
pnpm test           # run all tests
pnpm test -- --watch  # watch mode
```

115 tests across 37 test files covering stores, API routes, components, and utility functions.

---

## Design Tokens

Centralized in `src/styles/tokens.css.ts`:

- **Spacing**: xs(4px) through 4xl(40px)
- **Typography**: xs(12px) through 4xl(28px), line heights tight/base/relaxed
- **Color**: warm palette with orange/brown accent (#D97757), WCAG AA compliant contrast
- **Radius**: sm(4px), md(6px), lg(8px), xl(12px)
- **Theme**: light, dark, and system-preference modes

---

## License

[MIT](./LICENSE)
