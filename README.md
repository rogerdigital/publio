# Publio

[English](./README.md) | [中文](./README_zh.md)

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./package.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](./tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

> A focused writing and multi-platform publishing tool for individual creators. Write once, adapt per platform.

- **Writing desk** — Markdown editing, live preview, auto-save, version history, templates, and image uploads.
- **Draft library** — Manage drafts, publish state, and platform variants.
- **Multi-platform publishing** — Publish to WeChat, Xiaohongshu, Zhihu, and X (Twitter) with progress tracking.
- **Optional AI assistance** — Rewrite, title suggestions, and platform adaptation; AI entry points are hidden when unconfigured.

---

## Quick Start

```bash
git clone https://github.com/rogerdigital/publio.git
cd publio
pnpm install
pnpm dev
```

Open http://localhost:3000. Configure platform credentials and AI agent in Settings (`/settings`).

---

## Core Workflow

**Writing Desk** -> **Platform Variants** -> **Publish Checks** -> **Publish Progress** -> **Draft Library**

Publio now keeps only the creation and publishing loop: write content, save drafts, edit or generate per-platform variants, publish, and inspect publish status. Topic discovery, RSS ingestion, analytics, calendar, feedback review, and workspace import/export have been removed from the core product.

---

## Features

### Writing Desk

Markdown editor with live preview, immersive full-screen mode, auto-save, version history restore, content templates, media library, and GitHub image bed uploads.

### AI Assistance

When an agent is configured, slash commands can trigger AI rewrite and title suggestions. Platform adaptation can generate variants for WeChat, Xiaohongshu, Zhihu, and X. AI responses stream to the UI; writing and publishing still work when AI is disabled.

### Multi-Platform Publishing

Each platform has its own content variant that can be manually edited, synced from the main draft, or AI-adapted. Publish checks run before submission, and the progress overlay polls task status after publishing starts.

### Draft Library

The draft library shows saved drafts, publish timestamps, publish status, and platform variant entry points. It supports reopening drafts, deleting drafts, and reviewing recent work.

---

## Configuration

See [docs/configuration.md](./docs/configuration.md) for platform credentials, AI agent setup, and GitHub image bed.

---

## Development

Built with Next.js 15 (App Router), TypeScript 5 (strict), vanilla-extract, and Zustand.

```bash
pnpm dev              # development with port cleanup
pnpm build            # production build
pnpm test             # run Vitest tests
pnpm lint             # ESLint
pnpm verify           # check:no-js-source + lint + test + build
```

---

## License

[MIT](./LICENSE)
