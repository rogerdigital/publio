# Configuration

All credentials can be managed via `.env.local` or the Settings page (`/settings`) at runtime.

---

## Platform Credentials

| Platform | Variables | Source |
|----------|-----------|--------|
| WeChat | `WECHAT_APP_ID`, `WECHAT_APP_SECRET` | [mp.weixin.qq.com](https://mp.weixin.qq.com/) > Development > Basic Config |
| Xiaohongshu | `XHS_APP_ID`, `XHS_APP_SECRET`, `XHS_ACCESS_TOKEN` | [Xiaohongshu Open Platform](https://open.xiaohongshu.com/) |
| Zhihu | `ZHIHU_COOKIE` | Browser DevTools > Network > copy Cookie |
| X (Twitter) | `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` | [developer.x.com](https://developer.x.com/) |

---

## AI Agent

The agent is optional. All three required variables must be present to activate AI rewrite, title suggestions, and platform adaptation. The app supports OpenAI-compatible APIs and Anthropic-compatible APIs through the existing provider layer.

| Variable | Description |
|----------|-------------|
| `AGENT_BASE_URL` | OpenAI-compatible endpoint, for example `https://api.openai.com/v1` |
| `AGENT_API_KEY` | API key for the chosen provider |
| `AGENT_MODEL` | Model name, for example `deepseek-chat`, `glm-4-flash`, or `gpt-4o-mini` |
| `AGENT_PROVIDER` | Optional provider override. Supported values depend on `src/lib/agent/config.ts` |
| `AGENT_MAX_TOKENS` | Optional, default 2048 |
| `AGENT_TEMPERATURE` | Optional, default 0.7 |

AI features gracefully degrade when unconfigured. Core writing, draft storage, platform variants, and publishing remain available.

---

## GitHub Image Bed

Upload images to a GitHub repo as persistent hosting. Optional.

| Variable | Description |
|----------|-------------|
| `GITHUB_IMAGE_ENABLED` | Set to `true` to enable |
| `GITHUB_IMAGE_TOKEN` | GitHub personal access token with `repo` scope |
| `GITHUB_IMAGE_OWNER` | GitHub username or org |
| `GITHUB_IMAGE_REPO` | Target repository name |
| `GITHUB_IMAGE_BRANCH` | Optional, default `main` |
| `GITHUB_IMAGE_PATH` | Optional, default `images/` |

---

## Local Data

Runtime data is stored under `.publio-data/`. The simplification keeps historical local data files on disk, but the app no longer reads or writes removed entities such as signals, topics, briefs, feedback, metrics, RSS sources, or scheduler state.
