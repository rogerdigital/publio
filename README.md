# Publio

[English](./README.md) | [中文](./README_zh.md)

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./package.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](./tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-332%20passing-brightgreen.svg)](#development)

> AI-native content operations platform. Write once, publish everywhere.

- **Full lifecycle workflow** — from topic discovery to post-publish review, all in one workspace
- **AI-powered writing** — expand, condense, rewrite, polish, continue via slash commands with streaming output
- **Multi-platform publish** — concurrent delivery to WeChat, Xiaohongshu, Zhihu, and X (Twitter)
- **Provider-agnostic AI** — works with any OpenAI-compatible API (GLM, DeepSeek, Qwen, OpenAI, Ollama)

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

## Workflow

**Signal Inbox** → **Topic Library** → **Writing Brief** → **Writing Desk** → **Platform Variants** → **Publish** → **Feedback Loop**

Each stage feeds the next. Signals are promoted to topics, topics get structured briefs, briefs guide drafts, drafts are adapted per-platform, published concurrently, and post-publish metrics feed back into recommendations.

---

## Features

### Writing Desk

Rich Markdown editor with live preview, immersive full-screen mode, auto-save, slash commands for AI writing assistance, version history with restore, and content templates. GitHub image bed for persistent image hosting.

### AI Agent System

Writing assistant (5 slash commands), platform content adaptation, topic research with multi-angle insights, signal inbox triage, structured writing packs, brief generation, publish failure diagnosis, content review, and style learning from historical drafts. All streaming, all optional.

### Multi-Platform Publishing

Concurrent publish with progress tracking. Each platform gets an independent content variant — synced, AI-adapted, or manually edited. Includes content moderation, platform validation rules, scheduled delivery, failure diagnosis with smart retry, and post-publish metrics aggregation.

### Topic Discovery

Aggregates 9+ RSS sources plus custom feeds. Signal inbox with triage actions, topic library with lifecycle management, 6-dimension scoring, research briefs per cluster, and one-click conversion to editor drafts with context embedded.

---

## Configuration

See [docs/configuration.md](./docs/configuration.md) for platform credentials, AI agent setup, and GitHub image bed.

---

## Development

Built with Next.js 15 (App Router), TypeScript 5 (strict), vanilla-extract, and Zustand.

```bash
pnpm dev              # development (with port cleanup)
pnpm build            # production build
pnpm test             # run tests (Vitest, 332 passing)
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm verify           # lint + test + build
```

---

## License

[MIT](./LICENSE)
