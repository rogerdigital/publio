# Publio

[English](./README.md) | [中文](./README_zh.md)

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](./package.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](./tsconfig.json)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vite.dev/)
[![Hono](https://img.shields.io/badge/Hono-4-E36002.svg)](https://hono.dev/)

> A focused writing and multi-platform publishing tool for individual creators. Write once, adapt per platform.

- **Writing desk** — Markdown editing, live preview, manual save with close/crash fallback, version history, templates, and image uploads.
- **Draft library** — Manage drafts, publish state, and platform variants.
- **Multi-platform publishing** — Publish to WeChat, Xiaohongshu, Zhihu, and X (Twitter) with progress tracking.
- **Optional AI assistance** — Rewrite, title suggestions, and platform adaptation; AI entry points are hidden when unconfigured.

---

## Product Scope

Publio focuses on the creation and publishing loop:

**Writing Desk** -> **Platform Variants** -> **Publish Checks** -> **Publish Progress** -> **Draft Library**

The current app keeps only three user-facing routes:

| Route | Purpose |
|-------|---------|
| `/` | Write, preview, manage platform variants, run checks, and publish |
| `/drafts` | Reopen drafts and inspect publish state |
| `/settings` | Configure platform credentials and AI agent settings |

## Quick Start

```bash
git clone https://github.com/rogerdigital/publio.git
cd publio
pnpm install
pnpm dev
```

Open http://localhost:3000. Configure platform credentials and AI agent in Settings (`/settings`).

---

## Features

### Writing Desk

Markdown editor with live preview, immersive full-screen mode, manual save (with a fallback that runs if the page closes or crashes before saving), version history restore, content templates, and a media library.

### AI Assistance

When an agent is configured, slash commands can trigger AI rewrite and title suggestions. Platform adaptation can generate variants for WeChat, Xiaohongshu, Zhihu, and X. AI responses stream to the UI; writing and publishing still work when AI is disabled.

### Multi-Platform Publishing

Each platform has its own content variant that can be manually edited, synced from the main draft, or AI-adapted. Publish checks run before submission, and the progress overlay polls task status after publishing starts.

### Draft Library

The draft library shows saved drafts, publish timestamps, publish status, and platform variant entry points. It supports reopening drafts, deleting drafts, and reviewing recent work.

### Core APIs

The API surface covers drafts, platform variants, publishing, publish status, settings, templates, uploads, platform connection checks, and AI write/adapt/status endpoints.

---

## Configuration

See [docs/configuration.md](./docs/configuration.md) for platform credentials and AI agent setup.

Runtime data is stored in `.publio-data/`.

---

## Development

Built as a pnpm workspaces monorepo: a Vite 8 SPA frontend (`apps/web`, React 19 + react-router) talks to a standalone Hono 4 API server (`apps/api`, port 8787) over `/api/*`. TypeScript 5 (strict), vanilla-extract, and Zustand throughout. Shared types live in `packages/shared-types`.

```bash
pnpm dev              # start web (3000) + api (8787) concurrently
pnpm dev:web          # frontend only (Vite, port 3000)
pnpm dev:api          # backend only (Hono, port 8787)
pnpm build            # production build (tsc + vite build)
pnpm test             # run Vitest tests
pnpm lint             # ESLint
pnpm check:no-js-source  # enforce TypeScript-only source roots
```

CI runs `check:no-js-source`, `lint`, `format:check`, `tsc --noEmit`, `test`, and `build` on every pull request to `main`.

---

## License

[MIT](./LICENSE)
