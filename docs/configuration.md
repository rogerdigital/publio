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

All three required to activate AI features. Supports any OpenAI-compatible API (Zhipu GLM, DeepSeek, Qwen, OpenAI, Ollama, etc.).

| Variable | Description |
|----------|-------------|
| `AGENT_BASE_URL` | OpenAI-compatible endpoint (e.g. `https://api.openai.com/v1`) |
| `AGENT_API_KEY` | API key for the chosen provider |
| `AGENT_MODEL` | Model name (e.g. `gpt-4o-mini`, `deepseek-chat`, `glm-4-flash`) |
| `AGENT_MAX_TOKENS` | Optional, default 2048 |
| `AGENT_TEMPERATURE` | Optional, default 0.7 |

AI features gracefully degrade when unconfigured — all AI entry points are hidden.

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
